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
import { addListener, consoleText } from '@/utils/tools';
import { OriginOptions } from '@/types/internal/dataStore';
import { normalizeHybridAttributes, prepareNativePayload } from './payload';

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
/** AB 分流读取 Native 身份的 JS 兜底时限，略长于 iOS Bridge 内部时限。 */
const NATIVE_IDENTITY_TIMEOUT = 1_000;

export interface NativeIdentity {
  deviceId: string;
  userId: string;
  userKey: string;
  isNewDevice: boolean;
  /** App 当前采集开关；未传时兼容旧版 Bridge，交由 Web 配置决定。 */
  dataCollectionEnabled?: boolean;
}

/** App 关闭采集时可以只返回开关，无需创建或暴露设备身份。 */
export interface NativeDataCollectionDisabled {
  dataCollectionEnabled: false;
}

export type NativeIdentityResult =
  | NativeIdentity
  | NativeDataCollectionDisabled;

type NativeIdentityFailureReason =
  | 'bridge missing'
  | 'getNativeIdentity missing'
  | 'getNativeIdentity timeout'
  | 'getNativeIdentity exception'
  | 'getNativeIdentity invalid response';

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
  binding: HybridBridgeBinding;
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

interface HybridConfiguration {
  projectId: string;
  dataSourceId?: string;
  packageName?: string;
  appPackage?: string;
}

/** 原生主体必须与同一代实例绑定及配置快照一起消费。 */
export interface HybridBindingSnapshot {
  readonly trackingId: string;
  readonly generation: number;
  readonly config: Readonly<HybridConfiguration>;
}

interface HybridBridgeBinding {
  readonly bridge: IGrowingWebViewJavascriptBridge;
  readonly config: Readonly<HybridConfiguration>;
  readonly generation: number;
  readonly trackingId?: string;
}

export default class GioHybridAdapter {
  public pluginVersion: string;
  /** 是否向 Native 同步 Web 的 userId 与 userKey；默认开启。 */
  private penetrateHybrid = true;
  /** 标记身份穿透策略是否已经从第一个实例配置中确定。 */
  private penetrateHybridInitialized = false;
  private binding?: HybridBridgeBinding;
  private bindingGeneration = 0;
  private refreshingBinding = false;
  private initializedInstances: Array<{
    trackingId: string;
    options: { projectId: string; packageName?: string };
  }> = [];
  /** 配置只来自当前绑定的不可变快照，不暴露 Bridge 的可变 configuration。 */
  public get hybridConfig() {
    return this._refreshBinding()?.config;
  }
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
  /** 同一页面内每种 AB 身份读取失败最多警告一次，避免频繁 getABTest 刷屏。 */
  private nativeIdentityWarnings: Record<string, boolean> = {};
  /** Native 身份等待与事件发送同属插件生命周期，销毁时立即结束并清理兜底计时器。 */
  private pendingNativeIdentities: Array<() => void> = [];
  private destroyed = false;
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
    if (this.destroyed) return;
    if (!this.penetrateHybridInitialized) {
      this.penetrateHybridInitialized = true;
      if (isBoolean(vdsConfig.penetrateHybrid)) {
        this.penetrateHybrid = vdsConfig.penetrateHybrid;
      }
    }
    const options = {
      projectId: vdsConfig.projectId,
      packageName: vdsConfig.packageName
    };
    const existing = this.initializedInstances.filter(
      (instance) => instance.trackingId === trackingId
    )[0];
    if (existing) existing.options = options;
    else this.initializedInstances.push({ trackingId, options });
    // 保留配置/dispatchEvent 分阶段注入；发送时也会检测 Bridge 是否已就绪或换代。
    this.onSendBefore = this.sendBeforeListener;
    this._refreshBinding();
  };

  getHybridBinding = (trackingId?: string): HybridBindingSnapshot | null => {
    const binding = this._refreshBinding();
    return binding?.trackingId &&
      (!trackingId || trackingId === binding.trackingId)
      ? Object.freeze({
          trackingId: binding.trackingId,
          generation: binding.generation,
          config: binding.config
        })
      : null;
  };

  private _matchTrackingId = (config: HybridConfiguration) => {
    const packageName = config.packageName ?? config.appPackage;
    for (const { trackingId, options } of this.initializedInstances) {
      if (
        config.projectId === options.projectId &&
        (!(
          this.growingIO.plugins.gioMultipleInstances || options.packageName
        ) ||
          packageName === options.packageName)
      )
        return trackingId;
    }
    return undefined;
  };

  private _refreshBinding = (): HybridBridgeBinding | undefined => {
    if (this.destroyed || this.refreshingBinding) return this.binding;
    let bridge: IGrowingWebViewJavascriptBridge;
    let config: HybridConfiguration;
    try {
      bridge = window.GrowingWebViewJavascriptBridge;
      if (bridge) {
        let raw: any = bridge.configuration;
        if (!raw) {
          raw = bridge.getConfiguration?.();
          if (raw)
            bridge.configuration =
              typeof raw === 'string' ? JSON.parse(raw) : raw;
        }
        if (typeof raw === 'string') raw = JSON.parse(raw);
        if (raw && typeof raw.projectId === 'string' && raw.projectId) {
          config = {
            projectId: raw.projectId,
            dataSourceId:
              typeof (raw.dataSourceId ?? raw.datasourceId) === 'string'
                ? (raw.dataSourceId ?? raw.datasourceId)
                : undefined,
            packageName:
              typeof raw.packageName === 'string' ? raw.packageName : undefined,
            appPackage:
              typeof raw.appPackage === 'string' ? raw.appPackage : undefined
          };
        }
      }
    } catch (error) {
      this._logBridgeError('initialize', error);
    }
    const trackingId = config ? this._matchTrackingId(config) : undefined;
    const previous = this.binding;
    if (
      previous?.bridge === bridge &&
      previous?.trackingId === trackingId &&
      JSON.stringify(previous?.config) === JSON.stringify(config)
    )
      return previous;
    this.refreshingBinding = true;
    try {
      const oldNativeIdentities = this.pendingNativeIdentities.slice();
      const oldHybridEvents = this.pendingHybridEvents.slice();
      this.bindingGeneration += 1;
      this.binding = config
        ? {
            bridge,
            config: Object.freeze(config),
            trackingId,
            generation: this.bindingGeneration
          }
        : undefined;
      this.growingIO.useHybridInherit = trackingId || '';
      if (previous?.trackingId && previous.trackingId !== trackingId) {
        this.growingIO.dataStore.updateVdsConfig(previous.trackingId, {
          hybridLink: false
        });
      }
      this._removeDomChangeListener();
      this._removeInstalledGetDomTree();
      if (this.userChangeListenersAdded) {
        this.growingIO.emitter.off(EMIT_MSG.SET_USERID, this.onSetUserId);
        this.growingIO.emitter.off(EMIT_MSG.SET_USERKEY, this.onSetUserKey);
        this.userChangeListenersAdded = false;
      }
      const current = this.binding;
      if (current) this._installGetDomTree(current);
      if (trackingId) {
        this.growingIO.dataStore.updateVdsConfig(trackingId, {
          hybridLink: true
        });
        this.growingIO.emitter.on(EMIT_MSG.SET_USERID, this.onSetUserId);
        this.growingIO.emitter.on(EMIT_MSG.SET_USERKEY, this.onSetUserKey);
        this.userChangeListenersAdded = true;
        this._addDomChangeListener();
      }
      if (this.bridgeReadyPollTimer) {
        window.clearTimeout(this.bridgeReadyPollTimer);
        this.bridgeReadyPollTimer = undefined;
      }
      // 新绑定先完整安装；取消只消费换代前快照，保留业务回调重入创建的新代工作。
      this.growingIO.emitter.emit(EMIT_MSG.HYBRID_BINDING_UPDATE, {
        previousTrackingId: previous?.trackingId,
        trackingId,
        generation: this.bindingGeneration
      });
      oldNativeIdentities.forEach((cancel) => cancel());
      oldHybridEvents.forEach((pending) =>
        this._failPendingHybridEvent(pending, 'Hybrid binding changed', false)
      );
      return current;
    } finally {
      this.refreshingBinding = false;
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
    const binding = this._refreshBinding();
    if (
      !binding?.trackingId ||
      trackingId !== binding.trackingId ||
      !this.penetrateHybrid
    ) {
      return;
    }
    if (!newUserId && oldUserId) {
      if (userKey) {
        this._clearNativeUserIdAndUserKey(binding);
      } else {
        this._clearNativeUserId(binding);
      }
    } else if (userKey) {
      this._setNativeUserIdAndUserKey(
        toString(newUserId),
        toString(userKey),
        binding
      );
    } else {
      this._setNativeUserId(toString(newUserId), binding);
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
    const binding = this._refreshBinding();
    if (
      !binding?.trackingId ||
      trackingId !== binding.trackingId ||
      !this.penetrateHybrid
    ) {
      return;
    }
    if (!newUserKey && oldUserKey) {
      this._clearNativeUserIdAndUserKey(binding);
    } else {
      this._setNativeUserIdAndUserKey(
        toString(userId),
        toString(newUserKey),
        binding
      );
    }
  };

  /**
   * 读取 Bridge 配置并安装圈选回调。
   *
   * Bridge 可以直接提供对象配置，也可以通过 `getConfiguration()` 返回 JSON 文本。配置
   * 存在后即可安装 `getDomTree`；该回调不依赖事件发送方法 `dispatchEvent`。
   */
  private _installGetDomTree = (binding: HybridBridgeBinding) => {
    const self = this;
    this.installedBridge = binding.bridge;
    this.installedGetDomTree = function (...args) {
      if (self._refreshBinding() !== binding) return;
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
    this._callBridge('install getDomTree', () => {
      binding.bridge.getDomTree = this.installedGetDomTree;
    });
  };

  /**
   * 在 Uploader 发送前处理事件。
   *
   * 打通后只处理 `useHybridInherit` 指向的实例，使 Native 和 Web Collector 不会重复
   * 接收同一事件。未打通时，仅主实例且非多实例场景可向 Native 发送辅助事件，Uploader
   * 仍按原流程发送 Web 请求。
   */
  sendBeforeListener = (args: { requestData: EVENT; trackingId: string }) => {
    const { requestData, trackingId } = args;
    const binding = this._refreshBinding();
    if (!binding || !this._shouldForwardToNative(trackingId)) {
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
      this._deferHybridEvent(
        requestData,
        undefined,
        binding,
        'normalize native event'
      );
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
    this._dispatchOrDeferEvent(requestData, nativeData, binding);
  };

  private _shouldForwardToNative = (trackingId: string) =>
    this.growingIO.useHybridInherit
      ? trackingId === this.growingIO.useHybridInherit
      : trackingId === this.growingIO.trackingId &&
        !this.growingIO.plugins.gioMultipleInstances;

  /**
   * 读取本页最新的 Native AB 身份。iOS 的 Promise/对象与 Android 的 JSON 字符串都由
   * 同一个 GrowingWebViewJavascriptBridge 统一在这里归一化。失败只返回 null，ABTest 据此无感回退 Web 身份。
   */
  getNativeIdentity = (
    trackingId?: string,
    generation?: number
  ): Promise<NativeIdentityResult | null> => {
    if (this.destroyed) return Promise.resolve(null);
    const binding = this._refreshBinding();
    if (
      !binding?.trackingId ||
      (trackingId && trackingId !== binding.trackingId) ||
      (generation !== undefined && generation !== binding.generation)
    )
      return Promise.resolve(null);
    let bridge: any;
    let getNativeIdentity: any;
    try {
      bridge = binding.bridge;
      if (!bridge) {
        this._warnNativeIdentityOnce('bridge missing');
        return Promise.resolve(null);
      }
      if (!isFunction(bridge.getNativeIdentity)) {
        this._warnNativeIdentityOnce('getNativeIdentity missing');
        return Promise.resolve(null);
      }
      getNativeIdentity = bridge.getNativeIdentity;
    } catch (error) {
      this._warnNativeIdentityOnce('getNativeIdentity exception', error);
      return Promise.resolve(null);
    }

    let result: any;
    try {
      result = getNativeIdentity.call(bridge);
    } catch (error) {
      this._warnNativeIdentityOnce('getNativeIdentity exception', error);
      return Promise.resolve(null);
    }

    // Native 方法本身也可能同步触发 SDK 销毁。
    if (this.destroyed || this._refreshBinding() !== binding) {
      Promise.resolve(result).catch(() => {});
      return Promise.resolve(null);
    }

    return new Promise<NativeIdentityResult | null>((resolve) => {
      let settled = false;
      const cancel = () => complete(null);
      const complete = (value: NativeIdentityResult | null) => {
        if (!settled) {
          settled = true;
          window.clearTimeout(timeout);
          const index = this.pendingNativeIdentities.indexOf(cancel);
          if (index >= 0) this.pendingNativeIdentities.splice(index, 1);
          resolve(value);
        }
      };
      const timeout = window.setTimeout(() => {
        if (this._refreshBinding() !== binding || settled) return;
        this._warnNativeIdentityOnce('getNativeIdentity timeout');
        complete(null);
      }, NATIVE_IDENTITY_TIMEOUT);
      this.pendingNativeIdentities.push(cancel);
      Promise.resolve(result).then(
        (value) => {
          if (settled) return;
          if (this._refreshBinding() !== binding || settled) {
            complete(null);
            return;
          }
          let identity: NativeIdentityResult | null;
          try {
            // Native 返回的对象也可能在字段读取时抛错，必须结束身份等待。
            identity = this._normalizeNativeIdentity(value);
          } catch (_error) {
            identity = null;
          }
          if (!identity) {
            this._warnNativeIdentityOnce('getNativeIdentity invalid response');
          }
          complete(identity);
        },
        (error) => {
          if (settled) return;
          this._warnNativeIdentityOnce('getNativeIdentity exception', error);
          complete(null);
        }
      );
    });
  };

  private _normalizeNativeIdentity = (
    value: any
  ): NativeIdentityResult | null => {
    let payload = value;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (_error) {
        return null;
      }
    }
    if (!payload || typeof payload !== 'object') {
      return null;
    }
    if (payload.dataCollectionEnabled === false) {
      // 关闭态本身就足以阻断 AB；App 无需在不采集时额外创建身份。
      if (
        typeof payload.deviceId !== 'string' ||
        !payload.deviceId ||
        typeof payload.isNewDevice !== 'boolean'
      ) {
        return { dataCollectionEnabled: false };
      }
    }
    // deviceId 及 isNewDevice 是 Native 主体完整性的必要条件；用户身份可缺失。
    if (
      typeof payload.deviceId !== 'string' ||
      !payload.deviceId ||
      typeof payload.isNewDevice !== 'boolean'
    ) {
      return null;
    }
    return {
      deviceId: payload.deviceId,
      userId: typeof payload.userId === 'string' ? payload.userId : '',
      userKey: typeof payload.userKey === 'string' ? payload.userKey : '',
      isNewDevice: payload.isNewDevice,
      ...(typeof payload.dataCollectionEnabled === 'boolean'
        ? { dataCollectionEnabled: payload.dataCollectionEnabled }
        : {})
    };
  };

  private _warnNativeIdentityOnce = (
    reason: NativeIdentityFailureReason,
    error?: unknown
  ) => {
    if (this.nativeIdentityWarnings[reason]) {
      return;
    }
    this.nativeIdentityWarnings[reason] = true;
    consoleText(
      `Hybrid AB Native 身份读取失败，已回退 Web 身份: ${reason}`,
      'warn'
    );
    this._logBridgeError('getNativeIdentity', error ?? new Error(reason), {
      reason
    });
  };

  /** 将事件字段转换为 Native 协议使用的字符串表示；保留为插件的公开实例方法。 */
  processAttributes = normalizeHybridAttributes;

  /** 调用 Native 的单 userId 设置接口；Bridge 异常只记录诊断，不影响 Web 身份流程。 */
  private _setNativeUserId = (userId: string, binding: HybridBridgeBinding) => {
    this._callBridge('setNativeUserId', () =>
      binding.bridge.setNativeUserId(userId)
    );
  };

  /** 调用 Native 的单 userId 清理接口。 */
  private _clearNativeUserId = (binding: HybridBridgeBinding) => {
    this._callBridge('clearNativeUserId', () =>
      binding.bridge.clearNativeUserId()
    );
  };

  /** 调用 Native 的 userId 与 userKey 联合设置接口。 */
  private _setNativeUserIdAndUserKey = (
    userId: string,
    userKey: string,
    binding: HybridBridgeBinding
  ) => {
    this._callBridge('setNativeUserIdAndUserKey', () =>
      binding.bridge.setNativeUserIdAndUserKey(userId, userKey)
    );
  };

  /** 调用 Native 的联合身份清理接口。 */
  private _clearNativeUserIdAndUserKey = (binding: HybridBridgeBinding) => {
    this._callBridge('clearNativeUserIdAndUserKey', () =>
      binding.bridge.clearNativeUserIdAndUserKey()
    );
  };

  /**
   * 将事件交给 Native，或在发送方法缺失、调用失败时暂存事件。暂存事件仍属于 Native
   * 单发链路，超时后由 Uploader 的失败重试机制处理，而不改为 Web Collector 发送。
   */
  private _dispatchOrDeferEvent = (
    eventData: any,
    nativeData: any,
    binding: HybridBridgeBinding
  ) => {
    if (this._dispatchEvent(nativeData, binding) === 'sent') {
      return;
    }
    this._deferHybridEvent(eventData, nativeData, binding);
  };

  /**
   * 同步调用 Bridge 的 `dispatchEvent`。
   *
   * `unavailable` 表示 Bridge 或方法尚未出现，可继续等待；`failed` 表示方法调用或序列化
   * 发生异常，当前事件应立即进入失败处理。
   */
  private _dispatchEvent = (
    data: any,
    binding: HybridBridgeBinding
  ): DispatchResult => {
    if (this._refreshBinding() !== binding) return 'failed';
    let bridge: IGrowingWebViewJavascriptBridge;
    let dispatchEvent: any;
    try {
      bridge = binding.bridge;
      dispatchEvent = bridge?.dispatchEvent;
    } catch (error) {
      this._logBridgeError('read dispatchEvent', error);
      return 'unavailable';
    }
    if (!isFunction(dispatchEvent)) {
      return 'unavailable';
    }
    return (
      this._callBridge('dispatchEvent', () => {
        dispatchEvent.call(bridge, JSON.stringify(data));
        return 'sent' as const;
      }) ?? 'failed'
    );
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
    binding: HybridBridgeBinding,
    failureReason?: string
  ) => {
    if (this.binding !== binding) return;
    if (eventData.__gioHybridPending) {
      return;
    }
    eventData.__gioHybridPending = true;
    const pending: PendingHybridEvent = {
      binding,
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
        // 前一条 dispatch 的同步回调可能已换桥或销毁插件，取消快照中的后续记录。
        if (!includes(this.pendingHybridEvents, pending)) return;
        if (pending.failureReason) {
          this._failPendingHybridEvent(pending, pending.failureReason);
          return;
        }
        const result = this._dispatchEvent(pending.nativeData, pending.binding);
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
    // dispatchEvent 返回前可能已同步取消本记录，不能再次成功结算发送槽位。
    if (!includes(this.pendingHybridEvents, pending)) return;
    this._removePendingHybridEvent(pending);
    this.growingIO.uploader?.requestSuccessFn?.(pending.eventData);
  };

  /** 移除待发送记录，并将事件交给 Uploader 的既有失败重试链路。 */
  private _failPendingHybridEvent = (
    pending: PendingHybridEvent,
    reason: string,
    retry = true
  ) => {
    if (!includes(this.pendingHybridEvents, pending)) {
      return;
    }
    this._logBridgeError('dispatchEvent', new Error(reason), {
      trackingId: pending.eventData.trackingId,
      requestId: pending.eventData.requestId
    });
    this._removePendingHybridEvent(pending);
    if (retry)
      this.growingIO.uploader?.requestFailFn?.(
        pending.eventData,
        pending.eventData.requestType
      );
    else this.growingIO.uploader?.requestFailFn?.(pending.eventData, undefined);
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
    this.installedBridge = undefined;
    this.installedGetDomTree = undefined;
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
        this._callBridge('onDomChanged', () => {
          const binding = this._refreshBinding();
          const onDomChanged = binding?.bridge.onDomChanged;
          if (typeof onDomChanged === 'function')
            onDomChanged.call(binding.bridge);
        });
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
    if (this.destroyed) return;
    const previous = this.binding;
    this.destroyed = true;
    this.binding = undefined;
    this.bindingGeneration += 1;
    this.growingIO.useHybridInherit = '';
    if (previous?.trackingId)
      this.growingIO.dataStore.updateVdsConfig(previous.trackingId, {
        hybridLink: false
      });
    this.initializedInstances = [];
    this._removeDomChangeListener();
    if (this.userChangeListenersAdded) {
      this.growingIO.emitter?.off(EMIT_MSG.SET_USERID, this.onSetUserId);
      this.growingIO.emitter?.off(EMIT_MSG.SET_USERKEY, this.onSetUserKey);
      this.userChangeListenersAdded = false;
    }
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
    if (previous)
      this.growingIO.emitter.emit(EMIT_MSG.HYBRID_BINDING_UPDATE, {
        previousTrackingId: previous.trackingId,
        generation: this.bindingGeneration
      });
    this.pendingNativeIdentities.slice().forEach((cancel) => cancel());
    this.pendingHybridEvents
      .slice()
      .forEach((pending) =>
        this._failPendingHybridEvent(pending, 'Hybrid adapter destroyed', false)
      );
  };

  private _removeDomChangeListener = () => {
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
  };
}
