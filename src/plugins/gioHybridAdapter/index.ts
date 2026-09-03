/**
 * Hybrid 打通插件。
 *
 * 该插件连接 Web SDK 与 App WebView 注入的
 * `window.GrowingWebViewJavascriptBridge`，负责三个方向的通信：
 *
 * 1. 事件上报：与 Native 配置匹配的实例将支持的事件交给 `dispatchEvent`，由 Native
 *    负责单次采集；尚未建立匹配关系时，主实例可以额外通知 Native，同时保留 Web 上报。
 * 2. 身份同步：`penetrateHybrid` 为 true 时，将 userId、userKey 的设置和清理同步到
 *    Native，使两端身份保持一致。
 * 3. 圈选：向 Bridge 暴露 `getDomTree`，并在页面结构、尺寸或地址变化后调用
 *    `onDomChanged`，让 Native 获取与当前页面一致的圈选数据。
 *
 * 插件在 OPTION_INITIALIZED 时读取 Bridge 配置、选择唯一的打通实例并安装回调。Bridge
 * 的配置和圈选能力可以先于 `dispatchEvent` 存在，因此事件发送会单独等待发送方法就绪。
 */
import EMIT_MSG from '@/constants/emitMsg';
import { EVENT } from '@/types/internal/events';
import { GrowingIOType } from '@/types/internal/growingIO';
import {
  isBoolean,
  isFunction,
  toString,
  unset,
  includes
} from '@/utils/glodash';
import { GioHybridNode } from 'gio-web-nodes-parser';
import {
  GIOHYBRIDNODE,
  GIOHYBRIDNODEINFO
} from 'gio-web-nodes-parser/build/typings';
import Page from '@/core/dataStore/page';
import { addListener } from '@/utils/tools';
import { OriginOptions } from '@/types/internal/dataStore';
import {
  normalizeHybridAttributes,
  prepareNativePayload
} from './payload';

/** Native 上报协议可接收的 Web 事件类型。未列出的事件只保留 Web SDK 原有发送流程。 */
const SUPPORT_EVENT_TYPES = [
  'VIEW_CLICK',
  'VIEW_CHANGE',
  'PAGE',
  'CUSTOM',
  'LOGIN_USER_ATTRIBUTES'
];
/** 仅在允许身份穿透时才能发送的身份事件类型。 */
const PENETRATED_EVENT_TYPES = ['LOGIN_USER_ATTRIBUTES'];
/** 单个 Native 事件等待 `dispatchEvent` 可用的最长时间。 */
const BRIDGE_READY_TIMEOUT = 5_000;
/** Bridge 未就绪时检查 `dispatchEvent` 的间隔。 */
const BRIDGE_READY_POLL_INTERVAL = 100;

/**
 * 页面加载状态或文档结构变化时触发 Native 圈选数据刷新。事件名使用浏览器事件 API
 * 所接受的标准名称，而不是 DOM 属性名称。
 */
const DOM_EVENT = ['DOMContentLoaded', 'readystatechange'];
const WINDOW_EVENT = [
  'scroll',
  'resize',
  'load',
  'beforeunload',
  'popstate',
  'hashchange',
  'pagehide',
  'unload'
];

type PendingHybridEvent = {
  /** Uploader 当前持有的事件副本；完成或失败时必须交还给 Uploader。 */
  eventData: any;
  /** 已完成字段规范化、可直接 JSON 序列化给 Native 的事件副本。 */
  nativeData: any;
  /** 规范化失败等无需继续轮询的终态原因。 */
  failureReason?: string;
  /** 控制单个事件最长等待时间的定时器。 */
  timeout: any;
};

/** Native 发送尝试的状态：成功、Bridge 尚不可用或调用异常。 */
type DispatchResult = 'sent' | 'unavailable' | 'failed';

export default class GioHybridAdapter {
  public pluginVersion: string;
  /** 是否向 Native 同步 Web 的 userId 与 userKey；默认开启。 */
  private penetrateHybrid = true;
  /** 标记身份穿透策略是否已经从第一个实例配置中确定。 */
  private penetrateHybridInitialized = false;
  /** 当前页面是否存在包含有效配置的 Hybrid Bridge。 */
  private hasHybridBridge: boolean;
  /** Native 容器提供的项目和应用标识，用于匹配 Web 实例。 */
  public hybridConfig: {
    projectId: string;
    dataSourceId: string;
    packageName?: string;
    appPackage?: string;
  };
  /**
   * 插件系统在 Uploader 发送前执行的钩子。存在有效 Bridge 配置时赋值；事件能否实际
   * 发送由 `dispatchEvent` 的运行时状态决定。
   */
  public onSendBefore: any;
  /** 防止同一 Adapter 对 SET_USERID 与 SET_USERKEY 重复注册监听器。 */
  private userChangeListenersAdded = false;
  /** 当前写入 Bridge 的圈选函数，用于销毁时确认回调所有权。 */
  private installedGetDomTree?: (...args: any[]) => any;
  /** 保存安装圈选回调的 Bridge 对象，避免清理到后来替换的回调。 */
  private installedBridge?: IGrowingWebViewJavascriptBridge;
  /** 等待 `dispatchEvent` 出现的事件；这些事件继续占用 Uploader 的发送槽位。 */
  private pendingHybridEvents: PendingHybridEvent[] = [];
  /** 驱动 pendingHybridEvents 重试检查的唯一共享定时器。 */
  private bridgeReadyPollTimer?: any;
  /** 监听页面 DOM 改动并通知 Native 的观察器。 */
  private mutationObserver?: MutationObserver;
  /** document.body 尚不可用时，延后建立 MutationObserver 的一次性监听器。 */
  private bodyReadyListener?: () => void;
  /** 已注册的文档和窗口监听器，用于销毁时按相同函数引用移除。 */
  private domChangeListeners: Array<{
    target: Window | Document;
    type: string;
    handler: () => void;
  }> = [];
  /**
   * 每个 Web 实例初始化后读取其配置并尝试与 Native 配置匹配。匹配成功后才监听 DOM
   * 变化，因为只有打通实例的 Native 容器会消费 `onDomChanged`。
   */
  private onOptionInitialized = ({
    trackingId,
    vdsConfig
  }: {
    trackingId: string;
    vdsConfig: OriginOptions;
  }) => {
    this.onOptionsInit(trackingId, vdsConfig);
    if (
      this.growingIO.useHybridInherit &&
      window.GrowingWebViewJavascriptBridge
    ) {
      this._addDomChangeListener();
    }
  };

  constructor(public growingIO: GrowingIOType) {
    this.pluginVersion = '__PLUGIN_VERSION__';
    const { emitter } = this.growingIO;
    emitter.on(EMIT_MSG.OPTION_INITIALIZED, this.onOptionInitialized);
  }

  /**
   * 根据当前 Web 实例配置与 Native 配置建立打通关系。
   *
   * 多实例或配置了 packageName 的实例必须同时匹配 projectId 和 packageName；没有
   * packageName 时只匹配 projectId。首次匹配成功的实例写入 `useHybridInherit`，其事件
   * 由 Native 单发，Uploader 不再向 Web Collector 发送相同事件。
   */
  onOptionsInit = (trackingId: string, vdsConfig: OriginOptions) => {
    const { emitter, plugins } = this.growingIO;
    if (!this.penetrateHybridInitialized) {
      this.penetrateHybridInitialized = true;
      if (isBoolean(vdsConfig.penetrateHybrid)) {
        this.penetrateHybrid = vdsConfig.penetrateHybrid;
      }
    }
    const bridgeInitialized = this._initHybridBridge();
    if (bridgeInitialized) {
      // 发送前钩子负责把可发送的事件规范化并转交给 Native。
      this.onSendBefore = this.sendBeforeListener;
      // 同一 Bridge 只关联一个 Web 实例，避免同一事件被多个实例发送到 Native。
      if (!this.growingIO.useHybridInherit) {
        const configPackageName =
          this.hybridConfig.packageName ?? this.hybridConfig.appPackage;
        // 多实例必须同时匹配项目和应用包名，才能确定事件所属实例。
        if (plugins.gioMultipleInstances) {
          if (
            this.hybridConfig.projectId === vdsConfig.projectId &&
            configPackageName === vdsConfig.packageName
          ) {
            this.growingIO.useHybridInherit = trackingId;
            this.growingIO.dataStore.updateVdsConfig(trackingId, {
              hybridLink: true
            });
          }
        } else if (vdsConfig.packageName) {
          // 单实例配置了应用包名时，也要求项目和包名同时匹配。
          if (
            this.hybridConfig.projectId === vdsConfig.projectId &&
            configPackageName === vdsConfig.packageName
          ) {
            this.growingIO.useHybridInherit = trackingId;
            this.growingIO.dataStore.updateVdsConfig(trackingId, {
              hybridLink: true
            });
          }
        } else if (this.hybridConfig.projectId === vdsConfig.projectId) {
          // 未配置应用包名时，项目 ID 是唯一可用的匹配条件。
          this.growingIO.useHybridInherit = trackingId;
          this.growingIO.dataStore.updateVdsConfig(trackingId, {
            hybridLink: true
          });
        }
      }
    }
    // 仅打通实例的身份状态需要同步到 Native；同一函数引用用于后续解除监听。
    if (this.growingIO.useHybridInherit && !this.userChangeListenersAdded) {
      emitter?.on(EMIT_MSG.SET_USERID, this.onSetUserId);
      emitter?.on(EMIT_MSG.SET_USERKEY, this.onSetUserKey);
      this.userChangeListenersAdded = true;
    }
  };

  /**
   * 处理 userId 变更。清空 userId 时根据是否存在 userKey 选择对应的 Native 清理 API；
   * 设置 userId 时携带现有 userKey，以便 Native 保存完整身份。
   */
  private onSetUserId = ({
    newUserId,
    oldUserId,
    userKey,
    trackingId
  }: any) => {
    if (
      trackingId !== this.growingIO.useHybridInherit ||
      !this.penetrateHybrid
    ) {
      return;
    }
    if (!newUserId && oldUserId) {
      if (userKey) {
        this._clearNativeUserIdAndUserKey();
      } else {
        this._clearNativeUserId();
      }
    } else if (userKey) {
      this._setNativeUserIdAndUserKey(toString(newUserId), toString(userKey));
    } else {
      this._setNativeUserId(toString(newUserId));
    }
  };

  /**
   * 处理 userKey 变更。Native 将 userId 和 userKey 作为一组身份保存，因此清空 key 时
   * 同时清空两者，设置 key 时携带当前 userId。
   */
  private onSetUserKey = ({
    newUserKey,
    oldUserKey,
    userId,
    trackingId
  }: any) => {
    if (
      trackingId !== this.growingIO.useHybridInherit ||
      !this.penetrateHybrid
    ) {
      return;
    }
    if (!newUserKey && oldUserKey) {
      this._clearNativeUserIdAndUserKey();
    } else {
      this._setNativeUserIdAndUserKey(toString(userId), toString(newUserKey));
    }
  };

  /**
   * 读取 Bridge 配置并安装圈选回调。
   *
   * Bridge 可以直接提供对象配置，也可以通过 `getConfiguration()` 返回 JSON 文本。配置
   * 存在后即可安装 `getDomTree`；该回调不依赖事件发送方法 `dispatchEvent`。
   */
  private _initHybridBridge = () => {
    // 普通 Web 页面没有 Bridge，不启用 Hybrid 行为。
    this.hasHybridBridge = !!window.GrowingWebViewJavascriptBridge;
    if (this.hasHybridBridge) {
      try {
        const bridge = window.GrowingWebViewJavascriptBridge;
        // Bridge 配置可能是对象，也可能由 getConfiguration() 返回 JSON 文本。
        if (!bridge.configuration) {
          const configuration = bridge.getConfiguration?.();
          bridge.configuration =
            typeof configuration === 'string'
              ? JSON.parse(configuration)
              : configuration;
        }
        // 缺少配置无法关联 Web 实例，不注册上报或圈选能力。
        if (!bridge.configuration) {
          this.hasHybridBridge = false;
          return false;
        }
        // 配置用于后续每个 Web 实例的项目和包名匹配。
        this.hybridConfig = bridge.configuration;
        // Native 调用该函数时接收 SDK 圈选协议对象，而不是容器自身的节点数据。
        const self = this;
        if (this.installedBridge && this.installedBridge !== bridge) {
          this._removeInstalledGetDomTree();
        }
        this.installedBridge = bridge;
        this.installedGetDomTree = function (...args) {
          if (args.length >= 4) {
            try {
              return self._getDomTree.apply(this, args);
            } catch (error) {
              self._logBridgeError('getDomTree', error, {
                argumentCount: args.length,
                webviewLeft: args[0],
                webviewTop: args[1],
                webviewWidth: args[2],
                webviewHeight: args[3],
                webviewZLevel: args[4]
              });
              throw error;
            }
          }
        };
        bridge.getDomTree = this.installedGetDomTree;
        return true;
      } catch (error) {
        this.hasHybridBridge = false;
        this._logBridgeError('initialize', error);
        return false;
      }
    }
    return false;
  };

  /**
   * 在 Uploader 发送前处理事件。
   *
   * 打通后只处理 `useHybridInherit` 指向的实例，使 Native 和 Web Collector 不会重复
   * 接收同一事件。未打通时，仅主实例且非多实例场景可向 Native 发送辅助事件，Uploader
   * 仍按原流程发送 Web 请求。
   */
  sendBeforeListener = (args: {
    requestData: EVENT;
    trackingId: string;
  }) => {
    const { requestData, trackingId } = args;
    if (!this.hasHybridBridge || !this._shouldForwardToNative(trackingId)) {
      return;
    }
    let nativeData: any;
    try {
      nativeData = prepareNativePayload(requestData);
    } catch (error) {
      this._logBridgeError('normalize native event', error, {
        trackingId,
        requestId: (requestData as any).requestId
      });
      this._deferHybridEvent(requestData, undefined, 'normalize native event');
      return;
    }
    if (!includes(SUPPORT_EVENT_TYPES, nativeData.eventType)) {
      return;
    }
    if (includes(PENETRATED_EVENT_TYPES, nativeData.eventType)) {
      if (!this.penetrateHybrid) {
        return;
      }
    } else if (!this.penetrateHybrid) {
      unset(nativeData, ['userId', 'userKey', 'cs1']);
    }
    this._dispatchOrDeferEvent(requestData, nativeData);
  };

  private _shouldForwardToNative = (trackingId: string) =>
    this.growingIO.useHybridInherit
      ? trackingId === this.growingIO.useHybridInherit
      : trackingId === this.growingIO.trackingId &&
        !this.growingIO.plugins.gioMultipleInstances;

  /** 将事件字段转换为 Native 协议使用的字符串表示；保留为插件的公开实例方法。 */
  processAttributes = normalizeHybridAttributes;

  /** 调用 Native 的单 userId 设置接口；Bridge 异常只记录诊断，不影响 Web 身份流程。 */
  private _setNativeUserId = (userId: string) => {
    this._callBridge('setNativeUserId', () =>
      window.GrowingWebViewJavascriptBridge.setNativeUserId(userId)
    );
  };

  /** 调用 Native 的单 userId 清理接口。 */
  private _clearNativeUserId = () => {
    this._callBridge('clearNativeUserId', () =>
      window.GrowingWebViewJavascriptBridge.clearNativeUserId()
    );
  };

  /** 调用 Native 的 userId 与 userKey 联合设置接口。 */
  private _setNativeUserIdAndUserKey = (userId: string, userKey: string) => {
    this._callBridge('setNativeUserIdAndUserKey', () =>
      window.GrowingWebViewJavascriptBridge.setNativeUserIdAndUserKey(
        userId,
        userKey
      )
    );
  };

  /** 调用 Native 的联合身份清理接口。 */
  private _clearNativeUserIdAndUserKey = () => {
    this._callBridge('clearNativeUserIdAndUserKey', () =>
      window.GrowingWebViewJavascriptBridge.clearNativeUserIdAndUserKey()
    );
  };

  /**
   * 将事件交给 Native，或在发送方法缺失、调用失败时暂存事件。暂存事件仍属于 Native
   * 单发链路，超时后由 Uploader 的失败重试机制处理，而不改为 Web Collector 发送。
   */
  private _dispatchOrDeferEvent = (eventData: any, nativeData: any) => {
    if (this._dispatchEvent(nativeData) === 'sent') {
      return;
    }
    this._deferHybridEvent(eventData, nativeData);
  };

  /**
   * 同步调用 Bridge 的 `dispatchEvent`。
   *
   * `unavailable` 表示 Bridge 或方法尚未出现，可继续等待；`failed` 表示方法调用或序列化
   * 发生异常，当前事件应立即进入失败处理。
   */
  private _dispatchEvent = (data: any): DispatchResult => {
    let bridge: IGrowingWebViewJavascriptBridge;
    let dispatchEvent: any;
    try {
      bridge = window.GrowingWebViewJavascriptBridge;
      dispatchEvent = bridge?.dispatchEvent;
    } catch (error) {
      this._logBridgeError('read dispatchEvent', error);
      return 'unavailable';
    }
    if (!isFunction(dispatchEvent)) {
      return 'unavailable';
    }
    return this._callBridge('dispatchEvent', () => {
      dispatchEvent.call(bridge, JSON.stringify(data));
      return 'sent' as const;
    }) ?? 'failed';
  };

  /**
   * 暂存等待 Native `dispatchEvent` 的事件。
   *
   * Uploader 已从队列取出该事件。`__gioHybridPending` 使 Uploader 保留一个发送槽位，直到
   * Native 成功接收事件，或等待超时并调用 `requestFailFn`。同一事件只允许创建一条待发送
   * 记录，避免每次发送前钩子都重复建立定时器。
   */
  private _deferHybridEvent = (
    eventData: any,
    nativeData: any,
    failureReason?: string
  ) => {
    if (eventData.__gioHybridPending) {
      return;
    }
    eventData.__gioHybridPending = true;
    const pending: PendingHybridEvent = {
      eventData,
      nativeData,
      failureReason,
      timeout: undefined
    };
    pending.timeout = window.setTimeout(() => {
      this._failPendingHybridEvent(pending, 'dispatchEvent readiness timeout');
    }, BRIDGE_READY_TIMEOUT);
    this.pendingHybridEvents.push(pending);
    this._scheduleBridgeReadyPoll();
  };

  /** 使用一个共享定时器检查全部待发送事件的 Bridge 状态。 */
  private _scheduleBridgeReadyPoll = () => {
    if (this.bridgeReadyPollTimer || !this.pendingHybridEvents.length) {
      return;
    }
    this.bridgeReadyPollTimer = window.setTimeout(() => {
      this.bridgeReadyPollTimer = undefined;
      [...this.pendingHybridEvents].forEach((pending) => {
        if (pending.failureReason) {
          this._failPendingHybridEvent(pending, pending.failureReason);
          return;
        }
        const result = this._dispatchEvent(pending.nativeData);
        if (result === 'sent') {
          this._completePendingHybridEvent(pending);
        } else if (result === 'failed') {
          this._failPendingHybridEvent(pending, 'dispatchEvent failed');
        }
      });
      if (this.pendingHybridEvents.length) {
        this._scheduleBridgeReadyPoll();
      }
    }, BRIDGE_READY_POLL_INTERVAL);
  };

  /** 移除待发送记录，并通知 Uploader 释放对应的发送槽位。 */
  private _completePendingHybridEvent = (pending: PendingHybridEvent) => {
    this._removePendingHybridEvent(pending);
    this.growingIO.uploader?.requestSuccessFn?.(pending.eventData);
  };

  /** 移除待发送记录，并将事件交给 Uploader 的既有失败重试链路。 */
  private _failPendingHybridEvent = (
    pending: PendingHybridEvent,
    reason: string
  ) => {
    if (!this.pendingHybridEvents.includes(pending)) {
      return;
    }
    this._logBridgeError('dispatchEvent', new Error(reason), {
      trackingId: pending.eventData.trackingId,
      requestId: pending.eventData.requestId
    });
    this._removePendingHybridEvent(pending);
    this.growingIO.uploader?.requestFailFn?.(
      pending.eventData,
      pending.eventData.requestType
    );
  };

  /** 清理待发送事件的超时定时器、数组记录和 Uploader 占用标记。 */
  private _removePendingHybridEvent = (pending: PendingHybridEvent) => {
    window.clearTimeout(pending.timeout);
    const index = this.pendingHybridEvents.indexOf(pending);
    if (index >= 0) {
      this.pendingHybridEvents.splice(index, 1);
    }
    unset(pending.eventData, '__gioHybridPending');
  };

  /**
   * 清理当前 Bridge 上由本 Adapter 安装的圈选回调。
   *
   * 只有属性仍指向 `installedGetDomTree` 时才操作，防止清理 Bridge 或其他插件后来写入的
   * 函数。可配置属性通过 delete 移除；可写但不可配置的属性改写为 undefined。
   */
  private _removeInstalledGetDomTree = () => {
    const { installedBridge, installedGetDomTree } = this;
    if (
      !installedBridge ||
      !installedGetDomTree ||
      installedBridge.getDomTree !== installedGetDomTree
    ) {
      return;
    }
    try {
      delete installedBridge.getDomTree;
    } catch (error) {
      this._logBridgeError('remove getDomTree', error);
    }
    if (installedBridge.getDomTree === installedGetDomTree) {
      try {
        (installedBridge as any).getDomTree = undefined;
      } catch (error) {
        this._logBridgeError('clear getDomTree', error);
      }
    }
    this.installedBridge = undefined;
    this.installedGetDomTree = undefined;
  };

  /** 执行可能抛出异常的 Bridge 调用，并将同步异常转化为 undefined。 */
  private _callBridge = <T>(operation: string, callback: () => T) => {
    try {
      return callback();
    } catch (error) {
      this._logBridgeError(operation, error);
      return undefined;
    }
  };

  /** 在 SDK debug 模式输出 Bridge 操作名、异常和必要的调用上下文。 */
  private _logBridgeError = (
    operation: string,
    error: unknown,
    context?: Record<string, any>
  ) => {
    if (this.growingIO.vdsConfig?.debug) {
      console.error('[GrowingIO Hybrid] Bridge call failed', {
        operation,
        error,
        context
      });
    }
  };

  /**
   * 将当前 DOM 转换为 Native 圈选协议。
   *
   * 节点解析器产出的 `originNode` 和 `peerNodes` 保存 DOM 对象，不能通过 Bridge 序列化，
   * 因此返回前移除。页面字段取自 DataStore，使路径、查询参数和标题与 SDK 的页面事件
   * 使用同一份状态。
   */
  private _getDomTree = (
    webviewLeft: number,
    webviewTop: number,
    webviewWidth: number,
    webviewHeight: number,
    webviewZLevel: number,
    root?: HTMLElement
  ) => {
    const gioHybridNode: GIOHYBRIDNODE = new GioHybridNode({
      webviewLeft,
      webviewTop,
      webviewWidth,
      webviewHeight,
      webviewZLevel
    });
    // @ts-ignore
    const elements = gioHybridNode
      .trackNodes(root ?? document.body, [], false)
      .map((o: GIOHYBRIDNODEINFO) => {
        // 圈选协议仅需要节点描述，不包含 DOM 对象和同级节点引用。
        unset(o, ['originNode', 'peerNodes']);
        return o;
      });
    const { domain, path, query, title } = this.growingIO.dataStore
      .currentPage as Page;
    const domTree = {
      page: { domain, path, query, title },
      elements: elements
    };
    return domTree;
  };

  /**
   * 监听会影响圈选结果的 DOM 和导航变化，并调用 Native 的 `onDomChanged`。
   *
   * MutationObserver 必须以 document.body 为根节点；页面仍在解析时使用 DOMContentLoaded
   * 延后创建。Adapter 只维护一组观察器和事件监听器，所有监听器都记录在
   * `domChangeListeners` 中以便销毁。
   */
  private _addDomChangeListener() {
    if (this.mutationObserver || this.bodyReadyListener) {
      return;
    }
    if (!document.body) {
      // 页面解析完成后再以 body 为根节点建立观察器。
      this.bodyReadyListener = () => {
        this.bodyReadyListener = undefined;
        this._addDomChangeListener();
      };
      addListener(document, 'DOMContentLoaded', this.bodyReadyListener);
      return;
    }
    const listener = (type = '') => {
      return () => {
        // 文档卸载后不再观察 DOM，避免页面离开后继续产生回调。
        if (type === 'beforeunload') {
          this.mutationObserver?.disconnect();
        }
        this._callBridge('onDomChanged', () =>
          window.GrowingWebViewJavascriptBridge?.onDomChanged?.()
        );
      };
    };
    this.mutationObserver = new MutationObserver(listener('mutation'));
    this.mutationObserver.observe(document.body, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true
    });

    DOM_EVENT.forEach((type) => {
      const handler = listener(type);
      this.domChangeListeners.push({ target: document, type, handler });
      addListener(document, type, handler);
    });
    WINDOW_EVENT.forEach((type) => {
      const handler = listener(type);
      this.domChangeListeners.push({ target: window, type, handler });
      addListener(window, type, handler);
    });
  }

  /**
   * 释放 Adapter 建立的监听器、观察器、Bridge 回调和待发送事件。
   *
   * 待发送事件以失败形式归还 Uploader；DOM、Window 和 mitt 监听器使用注册时保存的
   * 函数引用移除。只有 Bridge 的 `getDomTree` 仍指向本 Adapter 的函数时才清理，避免
   * 删除其他模块后来安装的回调。
   */
  destroy = () => {
    this.mutationObserver?.disconnect();
    this.mutationObserver = undefined;
    this.domChangeListeners.forEach(({ target, type, handler }) =>
      target.removeEventListener(type, handler, true)
    );
    this.domChangeListeners = [];
    if (this.bodyReadyListener) {
      document.removeEventListener(
        'DOMContentLoaded',
        this.bodyReadyListener,
        true
      );
      this.bodyReadyListener = undefined;
    }
    if (this.userChangeListenersAdded) {
      this.growingIO.emitter?.off(EMIT_MSG.SET_USERID, this.onSetUserId);
      this.growingIO.emitter?.off(EMIT_MSG.SET_USERKEY, this.onSetUserKey);
      this.userChangeListenersAdded = false;
    }
    [...this.pendingHybridEvents].forEach((pending) =>
      this._failPendingHybridEvent(pending, 'Hybrid adapter destroyed')
    );
    if (this.bridgeReadyPollTimer) {
      window.clearTimeout(this.bridgeReadyPollTimer);
      this.bridgeReadyPollTimer = undefined;
    }
    this._removeInstalledGetDomTree();
    this.growingIO.emitter?.off(
      EMIT_MSG.OPTION_INITIALIZED,
      this.onOptionInitialized
    );
    this.onSendBefore = undefined;
  };
}
