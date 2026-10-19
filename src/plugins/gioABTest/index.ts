/**
 * 名称：ABTest插件
 * 用途：用于提供自动获取AB实验数据和上报实验命中的插件。
 */
import { initGlobalStorage } from '@/core/storage';
import WebFirstDeviceSessions from '@/core/firstDeviceSession';
import { acquireABRequestLock } from './coordination';
import { GrowingIOType } from '@/types/internal/growingIO';
import {
  has,
  includes,
  isEmpty,
  isNaN,
  isNumber,
  isObject,
  isString,
  keys,
  startsWith,
  toString,
  unset
} from '@/utils/glodash';
import {
  consoleText,
  getActualKey,
  limitObject,
  niceCallback,
  niceTry
} from '@/utils/tools';
import EMIT_MSG from '@/constants/emitMsg';
import {
  ABRequestContext,
  appendStm,
  buildABRequestBody,
  getABCacheKeys,
  getABIdentityHash
} from './request';
import type {
  HybridBindingSnapshot,
  NativeIdentity,
  NativeIdentityResult
} from '../gioHybridAdapter';
import type { EmbeddedABIdentity } from '../gioEmbeddedAdapter/types';

// V1 缓存没有身份维度，不能在账号切换后作为匿名缓存复用。
const LEGACY_ABTEST_SIGN_REG = /^\d+_gdp_abt_sign$/;
const LEGACY_ABTEST_DATA_REG = /^\d+_gdp_abtd$/;
// V2 缓存完整隔离身份、实例及服务地址。
const ABTEST_SIGN_REG = /^gdp_abt_v2_[a-f0-9]{40}_sign$/;
const ABTEST_DATA_REG = /^gdp_abt_v2_[a-f0-9]{40}_data$/;
const ABTEST_PENDING_HIT_REG = /^gdp_abt_v2_[a-f0-9]{40}_hit_pending$/;
const ABTEST_HIT_REG = /^gdp_abt_v2_[a-f0-9]{40}_hit$/;
// 未配置 abServerUrl（undefined）或实例未单独配置地址时使用的默认分流服务。
const DEFAULT_AB_SERVER_URL = 'https://ab.growingio.com';

/** 比较 JSON 实验值时忽略对象键顺序，但保留数组顺序及完整字段值。 */
const serializeExperiment = (value: any): string =>
  JSON.stringify(value, (_key, item) => {
    if (!isObject(item) || Array.isArray(item)) return item;
    // null prototype 同时保留合法的 __proto__ 变量名，不能把它当成原型赋值。
    const ordered = Object.create(null);
    Object.keys(item)
      .sort()
      .forEach((key) => {
        ordered[key] = item[key];
      });
    return ordered;
  });

interface ABPendingRequest {
  callbacks: any[];
  context: ABRequestContext;
  cancelCoordination?: () => void;
}

interface ABCall {
  trackingId: string;
  done: boolean;
  snapshotting: boolean;
  complete: (result: any) => void;
}

export default class GioABTest {
  public pluginVersion: string;
  private pluginOptions: any;
  public get options() {
    return this.pluginOptions;
  }
  public set options(options: any) {
    // BasePlugins 在首次或重复安装时写入 options；不能只依赖 init 事件。
    const calls = this.activeCalls.slice();
    const requests = keys(this.pendingRequests).map(
      (key) => this.pendingRequests[key]
    );
    this.pluginOptions = options;
    this.applyOptions();
    this.cancelRequests(requests, calls);
  }
  /** AB 结果只使用 localStorage 命名空间，不影响 SDK 的通用身份存储。 */
  public abtStorage: any;
  /** 同一缓存槽成功分流后的结果复用间隔，单位为分钟。 */
  public requestInterval = 5;
  /** 单次 HTTP 请求的 XHR 超时，单位为毫秒。 */
  public requestTimeout = 1000;
  /** 按 trackingId 保存的分流服务地址，主实例和子实例不会互相借用。 */
  public url: any;
  /** 按身份缓存槽合并在途请求，避免并发分流重复上报命中。 */
  private pendingRequests: { [signKey: string]: ABPendingRequest } = {};
  private storageCleanups: Array<() => void> = [];
  private activeCalls: ABCall[] = [];
  private activeXHRs: Array<{
    xhr: XMLHttpRequest;
    context: ABRequestContext;
  }> = [];
  private listeners: Array<{ event: string; handler: any }> = [];
  private destroyed = false;
  private legacyFirstDeviceSessions: WebFirstDeviceSessions;
  constructor(public growingIO: GrowingIOType) {
    this.pluginVersion = '__PLUGIN_VERSION__';
    this.abtStorage = initGlobalStorage({ storageType: 'localstorage' });
    this.growingIO.getABTest = this.getABTest;
    this.url = {};
    this.legacyFirstDeviceSessions = new WebFirstDeviceSessions(growingIO);
    const usesLegacyCore = () =>
      typeof growingIO.userStore?.isFirstDeviceSession !== 'function';
    this.listen(EMIT_MSG.OPTION_INITIALIZED, ({ trackingId }) => {
      if (usesLegacyCore()) this.legacyFirstDeviceSessions.record(trackingId);
      this.applyOptions();
    });
    this.listen(EMIT_MSG.UID_UPDATE, ({ newUId, oldUId }) => {
      if (usesLegacyCore())
        this.legacyFirstDeviceSessions.updateDevice(
          oldUId,
          newUId,
          !oldUId &&
            !growingIO.vdsConfig?.forceLogin &&
            !growingIO.useHybridInherit &&
            !growingIO.useEmbeddedInherit &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
              newUId
            )
        );
      if (oldUId && oldUId !== newUId) this.cancelTracking(undefined, true);
    });
    this.listen(
      EMIT_MSG.SESSIONID_UPDATE,
      ({ trackingId, oldSessionId, newSessionId }) => {
        if (usesLegacyCore())
          this.legacyFirstDeviceSessions.updateSession(
            trackingId,
            oldSessionId,
            newSessionId
          );
      }
    );
    this.listen(EMIT_MSG.USERID_UPDATE, ({ trackingId }) =>
      this.cancelTracking(trackingId)
    );
    this.listen(
      EMIT_MSG.HYBRID_BINDING_UPDATE,
      ({ previousTrackingId, trackingId }) => {
        this.cancelTracking([previousTrackingId, trackingId].filter(Boolean));
      }
    );
    this.listen(EMIT_MSG.USERKEY_UPDATE, ({ trackingId }) => {
      if (
        this.growingIO.dataStore.getTrackerVds(trackingId)?.idMapping ||
        trackingId === this.growingIO.useHybridInherit
      )
        this.cancelTracking(trackingId);
    });
    this.listen(
      EMIT_MSG.OPTION_CHANGE,
      ({ trackingId, optionName, optionValue, previousValue }) => {
        // 开启采集会先同步补发页面回调，其中创建的新请求不能再被开启事件取消。
        if (
          optionName === 'dataCollect' &&
          optionValue === false &&
          previousValue !== optionValue
        ) {
          this.cancelTracking(trackingId);
        }
      }
    );
  }

  private listen = (event: string, handler: any) => {
    this.growingIO.emitter.on(event, handler);
    this.listeners.push({ event, handler });
  };

  private applyOptions = () => {
    const {
      abServerUrl = DEFAULT_AB_SERVER_URL,
      requestInterval,
      requestTimeout
    } = this.options ?? {};
    this.timeoutCheck(requestInterval, requestTimeout);
    this.abtStorageCheck();
    this.url = {};
    if (
      isString(abServerUrl) &&
      !isEmpty(abServerUrl) &&
      this.growingIO.trackingId
    ) {
      this.generateUrl(this.growingIO.trackingId, abServerUrl);
    } else if (isObject(abServerUrl)) {
      keys(abServerUrl).forEach((trackingId: string) => {
        if (!isEmpty(abServerUrl[trackingId]))
          this.generateUrl(trackingId, abServerUrl[trackingId]);
      });
    }
  };

  private cancelRequests = (requests: ABPendingRequest[], calls: ABCall[]) => {
    // 先释放旧槽和 XHR，再回调；回调可同步发起新请求，不能误取消新请求。
    requests.forEach(({ context, cancelCoordination }) => {
      context.settled = true;
      delete this.pendingRequests[context.signKey];
      this.stopXHRs(context);
      cancelCoordination?.();
    });
    calls.forEach((call) => call.complete({}));
  };

  private stopXHRs = (context: ABRequestContext) => {
    this.activeXHRs.slice().forEach(({ context: requestContext, xhr }) => {
      if (requestContext === context) {
        this.activeXHRs = this.activeXHRs.filter(
          (active) => active.xhr !== xhr
        );
        xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = null;
        niceTry(() => xhr.abort());
      }
    });
  };

  private cancelTracking = (
    trackingId?: string | string[],
    preserveSnapshots = false
  ) => {
    const matches = (id: string) =>
      !trackingId ||
      (Array.isArray(trackingId)
        ? includes(trackingId, id)
        : id === trackingId);
    this.cancelRequests(
      keys(this.pendingRequests)
        .map((key) => this.pendingRequests[key])
        .filter(({ context }) => matches(context.trackingId)),
      this.activeCalls
        .slice()
        .filter(
          (call) =>
            matches(call.trackingId) &&
            !(preserveSnapshots && call.snapshotting)
        )
    );
  };

  destroy = () => {
    this.destroyed = true;
    this.listeners.forEach(({ event, handler }) =>
      this.growingIO.emitter.off(event, handler)
    );
    this.listeners = [];
    this.cancelStorageCleanups();
    this.cancelTracking();
  };

  /** AB 缓存故障一律视为未命中，不能阻断分流请求或回调。 */
  getABStorageItem = (key: string) =>
    niceTry(() => this.abtStorage.getItem(key));

  setABStorageItem = (key: string, value: any, end?: number) =>
    niceTry(() => {
      this.abtStorage.setItem(key, value, end);
      return true;
    }) === true;

  removeABStorageItem = (key: string) =>
    niceTry(() => this.abtStorage.removeItem(key));

  /** 将异常、过大或过小的插件时限收敛到协议允许的默认值。 */
  timeoutCheck = (
    requestInterval: number | string,
    requestTimeout: number | string
  ) => {
    this.requestInterval =
      isNumber(Number(requestInterval)) &&
      !isNaN(Number(requestInterval as string))
        ? Number(requestInterval as string)
        : 5;
    if (this.requestInterval > 60 * 24 || this.requestInterval < 0) {
      this.requestInterval = 5;
    }
    this.requestTimeout =
      isNumber(Number(requestTimeout)) &&
      !isNaN(Number(requestTimeout as string))
        ? Number(requestTimeout as string)
        : 1000;
    if (this.requestTimeout > 5000 || this.requestTimeout < 100) {
      this.requestTimeout = 1000;
    }
  };

  /**
   * 主实例在 Hybrid 或小程序内嵌继承模式下使用宿主项目/数据源；
   * 子实例不走该分支，始终从自身 getTrackerVds(trackingId) 读取配置。
   */
  getMainConfigs = (trackingId: string) => {
    const {
      plugins,
      vdsConfig,
      useHybridInherit,
      useEmbeddedInherit,
      dataStore
    } = this.growingIO;
    const tracker = dataStore.getTrackerVds(trackingId);
    const instanceConfig =
      trackingId === this.growingIO.trackingId ? vdsConfig : tracker;
    let projectId, dataSourceId;
    if (trackingId === useHybridInherit) {
      // Hybrid 宿主提供的 projectId/dataSourceId 优先于 Web 初始化参数。
      // Bridge 全局对象只允许由 gioHybridAdapter 访问；ABTest 只消费 adapter 已解析的配置。
      const hybridConfig = plugins?.gioHybridAdapter?.hybridConfig;
      dataSourceId =
        hybridConfig?.dataSourceId ??
        hybridConfig?.datasourceId ??
        instanceConfig.dataSourceId;
      projectId = hybridConfig?.projectId ?? instanceConfig.projectId;
    } else if (trackingId === useEmbeddedInherit) {
      // 内嵌小程序的上下文参数优先于 Web 初始化参数。
      dataSourceId =
        dataStore.eventContextBuilderInst.minpExtraParams?.dataSourceId ??
        instanceConfig.dataSourceId;
      projectId =
        dataStore.eventContextBuilderInst.minpExtraParams?.projectId ??
        instanceConfig.projectId;
    } else {
      dataSourceId = instanceConfig.dataSourceId;
      projectId = instanceConfig.projectId;
    }
    return { projectId, dataSourceId };
  };

  /**
   * 旧版（V1）AB 缓存的过期判定：按旧版的写入格式自己解释，不复用本插件的存储封装。
   * - 包装里的 expiredAt 由旧版写入：sign 是远期默认值，data 是「写入当天次日 0 点」；
   * - sign 的值本身就是复用窗口的截止时间戳，过期即失效；
   * - data 的值里没有时间信息，跨日只由包装的 expiredAt 体现。
   */
  private isLegacyABStorageExpired = (key: string) => {
    const raw = niceTry(() => localStorage.getItem(getActualKey(key)));
    const record = niceTry(() => JSON.parse(raw || ''));
    // 物理项缺失、包装不可解析（例如更早版本写下的裸值）都按旧版读不出来处理。
    if (!isObject(record) || typeof record.expiredAt !== 'number') {
      return true;
    }
    if (record.expiredAt <= Date.now()) {
      return true;
    }
    if (!LEGACY_ABTEST_SIGN_REG.test(key)) {
      return false;
    }
    return !(typeof record.value === 'number' && record.value > Date.now());
  };

  private cancelStorageCleanups = () => {
    const cleanups = this.storageCleanups;
    this.storageCleanups = [];
    cleanups.forEach((cancel) => cancel());
  };

  /** 只判定待回收项；实际删除前必须在对应缓存槽的锁内重新判定。 */
  private invalidABStorageKeys = (key: string): string[] => {
    if (ABTEST_HIT_REG.test(key))
      return this.getABStorageItem(key) ? [] : [key];
    if (ABTEST_SIGN_REG.test(key)) {
      const sign = this.getABStorageItem(key);
      return !sign || sign <= Date.now() ? [key] : [];
    }
    if (ABTEST_DATA_REG.test(key) && isEmpty(this.getABStorageItem(key))) {
      return [
        key,
        key.replace(/_data$/, '_sign'),
        key.replace(/_data$/, '_hit_pending')
      ];
    }
    if (
      ABTEST_PENDING_HIT_REG.test(key) &&
      (!this.getABStorageItem(key) ||
        !this.getABStorageItem(key.replace(/_hit_pending$/, '_data')))
    )
      return [key];
    return [];
  };

  /**
   * 请求间隔到期只删除 sign，保留当日 data 供新响应比较，避免重复上报命中。
   * data 跨日过期或无效时，同时删除对应 sign，确保下一次调用重新请求。
   * 旧版（V1）sign 也依赖对应 data 有效，不能留下会让旧页面返回空结果的孤立标记。
   * V1 页面不参与协调，仅按旧版语义回收失效项；V2 清理与请求共用锁。
   */
  abtStorageCheck = () => {
    this.cancelStorageCleanups();
    const storageKeys = niceTry(() => this.abtStorage.getKeys()) || [];
    const slots: Record<string, string[]> = {};
    storageKeys.forEach((key: string) => {
      if (
        LEGACY_ABTEST_SIGN_REG.test(key) ||
        LEGACY_ABTEST_DATA_REG.test(key)
      ) {
        if (
          this.isLegacyABStorageExpired(key) ||
          (LEGACY_ABTEST_SIGN_REG.test(key) &&
            this.isLegacyABStorageExpired(
              key.replace(/_gdp_abt_sign$/, '_gdp_abtd')
            ))
        ) {
          this.removeABStorageItem(key);
        }
        return;
      }
      if (this.invalidABStorageKeys(key).length) {
        const signKey = key.replace(/_(?:sign|data|hit_pending|hit)$/, '_sign');
        if (!slots[signKey]) slots[signKey] = [];
        slots[signKey].push(key);
      }
    });
    keys(slots).forEach((signKey) => {
      let completed = false;
      let cancel: () => void;
      const complete = () => {
        completed = true;
        cancel?.();
        this.storageCleanups = this.storageCleanups.filter(
          (cleanup) => cleanup !== cancel
        );
      };
      cancel = acquireABRequestLock(
        signKey,
        (lock) =>
          lock.run(() => {
            slots[signKey].forEach((key) =>
              this.invalidABStorageKeys(key).forEach(this.removeABStorageItem)
            );
            complete();
          }),
        complete
      );
      if (completed) cancel();
      else this.storageCleanups.push(cancel);
    });
  };

  /** 规范化实例配置的服务地址，并补全固定的分流 API 路径。 */
  generateUrl = (trackingId: string, abServerUrl: string) => {
    const serverUrl = abServerUrl.replace(/\/+$/, '');
    if (!startsWith(abServerUrl, 'http')) {
      this.url[trackingId] =
        `https://${serverUrl}/diversion/specified-layer-variables`;
    } else {
      this.url[trackingId] = `${serverUrl}/diversion/specified-layer-variables`;
    }
  };

  /**
   * 确定实例的分流地址，返回 false 表示不发起请求。
   * 插件在 init 之后注册时收不到 OPTION_INITIALIZED，这里按插件配置补建地址；
   * abServerUrl 显式配置为空时拒绝请求，不能回退到默认服务，否则会把身份发往 SaaS。
   */
  private resolveServerUrl = (trackingId: string) => {
    if (!isEmpty(this.url[trackingId])) {
      return true;
    }
    const { abServerUrl = DEFAULT_AB_SERVER_URL } = this.options ?? {};
    // 未单独配置地址的实例沿用默认分流服务，与原有行为一致。
    let serverUrl: any = DEFAULT_AB_SERVER_URL;
    if (isString(abServerUrl)) {
      if (trackingId === this.growingIO.trackingId) {
        serverUrl = abServerUrl;
      }
    } else if (isObject(abServerUrl) && has(abServerUrl, trackingId)) {
      serverUrl = abServerUrl[trackingId];
    }
    if (isEmpty(abServerUrl) || isEmpty(serverUrl)) {
      consoleText(
        '获取ABTest数据失败! 未配置分流服务地址 abServerUrl!',
        'error'
      );
      return false;
    }
    this.generateUrl(trackingId, serverUrl);
    return true;
  };

  /** dataCollect 同时约束事件采集与 AB 分流，关闭时不读取缓存、身份或发起请求。 */
  private isDataCollectEnabled = (trackingId: string) =>
    !this.destroyed &&
    !!this.growingIO.dataStore.getTrackerVds(trackingId) &&
    this.growingIO.dataStore.getTrackerVds(trackingId).dataCollect !== false;

  /** undefined 为未打通实例，null 为已失去归属的宿主页，不得回退共享 Web 身份。 */
  private getEmbeddedABIdentity = (
    trackingId: string
  ): EmbeddedABIdentity | null | undefined =>
    trackingId === this.growingIO.useEmbeddedInherit
      ? this.growingIO.plugins?.gioEmbeddedAdapter?.getEmbeddedABIdentity?.(
          trackingId
        )
      : undefined;

  /** 已完成、已卸载或身份已变化的上下文不得重试、写缓存或生成命中事件。 */
  private isContextCurrent = (context: ABRequestContext) => {
    if (context.settled || !this.isDataCollectEnabled(context.trackingId))
      return false;
    if (
      context.hybridGeneration !== undefined &&
      this.growingIO.plugins?.gioHybridAdapter?.getHybridBinding(
        context.trackingId
      )?.generation !== context.hybridGeneration
    )
      return false;
    if (context.native) return true;
    const embeddedIdentity = this.getEmbeddedABIdentity(context.trackingId);
    if (context.embedded) {
      return (
        !!embeddedIdentity &&
        context.deviceId === embeddedIdentity.deviceId &&
        context.identity.userId === embeddedIdentity.userId &&
        context.identity.userKey === embeddedIdentity.userKey
      );
    }
    // 请求冻结的是 Web 身份时，后来建立的宿主身份不能接管旧响应。
    if (embeddedIdentity !== undefined) return false;
    const { userStore, dataStore } = this.growingIO;
    const tracker = dataStore.getTrackerVds(context.trackingId);
    return (
      context.deviceId === userStore.getUid() &&
      context.identity.userId ===
        (userStore.getUserId(context.trackingId) || '') &&
      context.identity.userKey ===
        (tracker.idMapping
          ? userStore.getUserKey(context.trackingId) || ''
          : '')
    );
  };

  /**
   * 先按当前身份快照读取 V2 缓存；缓存有效时只回调，未命中或过期时才请求分流服务。
   * getABTest 的公开调用形式和实验结果格式保持不变。
   */
  getABTest = (trackingId: string, layerId: string | number, callback: any) => {
    if (!this.isDataCollectEnabled(trackingId)) {
      niceCallback(callback, {});
      return;
    }
    if (!layerId) {
      consoleText('获取ABTest数据失败! 实验层Id不合法!', 'error');
      niceCallback(callback, {});
      return;
    }
    // 先刷新归属再登记调用，初次建立绑定不会取消自己；后续换代通过生命周期统一取消。
    const hybridAdapter = this.growingIO.plugins?.gioHybridAdapter;
    const nativeBinding: HybridBindingSnapshot | null | undefined =
      hybridAdapter?.getHybridBinding?.(trackingId);
    const call: ABCall = {
      trackingId,
      done: false,
      snapshotting: false,
      complete: (result) => {
        if (call.done) return;
        call.done = true;
        this.activeCalls = this.activeCalls.filter((active) => active !== call);
        niceCallback(callback, result);
      }
    };
    this.activeCalls.push(call);
    const resolveIdentity = (identity: NativeIdentityResult | null) => {
      if (call.done) return;
      try {
        if (
          (nativeBinding &&
            hybridAdapter.getHybridBinding(trackingId)?.generation !==
              nativeBinding.generation) ||
          !this.isDataCollectEnabled(trackingId) ||
          identity?.dataCollectionEnabled === false ||
          !this.resolveServerUrl(trackingId)
        ) {
          call.complete({});
          return;
        }
        const native = !!identity && 'deviceId' in identity;
        // getUid 可能同步创建新设备并广播 UID_UPDATE；本次正创建该设备快照的调用应保留。
        call.snapshotting = true;
        let context: ABRequestContext;
        try {
          context = native
            ? this.createNativeRequestContext(
                trackingId,
                layerId,
                call.complete,
                identity as NativeIdentity,
                nativeBinding ?? undefined
              )
            : this.createRequestContext(trackingId, layerId, call.complete);
        } finally {
          call.snapshotting = false;
        }
        if (call.done) return;
        context.hybridGeneration = nativeBinding?.generation;
        context.native = native;
        context.settled = false;
        this.resolveRequestContext(context);
      } catch (_error) {
        call.complete({});
      }
    };
    if (trackingId === this.growingIO.useHybridInherit) {
      if (typeof hybridAdapter?.getNativeIdentity === 'function') {
        try {
          Promise.resolve(
            hybridAdapter.getNativeIdentity(
              trackingId,
              nativeBinding?.generation
            )
          ).then(resolveIdentity, () => resolveIdentity(null));
        } catch (_error) {
          resolveIdentity(null);
        }
        return;
      }
    }
    resolveIdentity(null);
  };

  /** 在身份来源和缓存槽均已冻结后再读缓存或发请求。 */
  private resolveRequestContext = (context: ABRequestContext) => {
    const now = Date.now();
    const abtSign = this.getABStorageItem(context.signKey) || 0;
    const storedExpData = this.getABStorageItem(context.dataKey);
    // sign 只复用成功结果；兼容旧版失败后留下有效 sign、却没有 data 的记录。
    // 缺失、损坏及跨日过期结果进入协调流程，在锁内复查后再清理，
    // 避免按旧快照删除另一页面刚完成写入的结果。
    if (!isObject(storedExpData) || isEmpty(storedExpData)) {
      context.originData = {};
      this.requestOrJoin(context);
      return;
    }
    context.originData = storedExpData;
    if (!abtSign || abtSign <= now) {
      this.requestOrJoin(context);
    } else {
      niceCallback(context.callback, storedExpData);
    }
  };

  createRequestContext = (
    trackingId: string,
    layerId: string | number,
    callback: any
  ): ABRequestContext => {
    const { userStore, dataStore } = this.growingIO;
    // 所有可变状态在请求开始时读取一次，异步响应和重试不重新读取当前登录身份。
    const tracker = dataStore.getTrackerVds(trackingId);
    const { projectId, dataSourceId } =
      trackingId === this.growingIO.trackingId
        ? this.getMainConfigs(trackingId)
        : tracker;
    const embeddedIdentity = this.getEmbeddedABIdentity(trackingId);
    if (embeddedIdentity === null) {
      throw new Error('Embedded host identity is no longer owned by this page');
    }
    const userId =
      embeddedIdentity?.userId ?? (userStore.getUserId(trackingId) || '');
    // userKey 的发送资格由当前实例决定，不能继承主实例的 idMapping 配置。
    // 已打通内嵌页必须与普通事件继承的宿主 userKey 一致。
    const userKey = embeddedIdentity
      ? embeddedIdentity.userKey
      : tracker.idMapping
        ? userStore.getUserKey(trackingId) || ''
        : '';
    // 匿名身份也参与摘要，避免旧无身份缓存被误当成当前匿名结果。
    const identityHash = getABIdentityHash(userId, userKey);
    const deviceId = embeddedIdentity?.deviceId ?? userStore.getUid();
    const cacheKeys = getABCacheKeys(
      trackingId,
      projectId,
      deviceId,
      layerId,
      identityHash,
      this.url[trackingId]
    );
    const embeddedNewDevice = embeddedIdentity
      ? embeddedIdentity.newDevice
      : trackingId === this.growingIO.useEmbeddedInherit
        ? this.growingIO.plugins?.gioEmbeddedAdapter?.embeddedNewDevice
        : undefined;
    // 小程序内嵌页已在 getGioInfo 中冻结设备首次创建状态。该值存在时不读取
    // 核心 Web 首访事实，避免把 H5 自己的设备生命周期混入小程序 AB 分流。
    // 普通 Web 的首访判定要读取 session（过期时会新建 session 并补发访问事件），
    // 因此留到缓存未命中、真正发请求时再计算，见 initiateRequest。
    const newDevice =
      typeof embeddedNewDevice === 'boolean' ? embeddedNewDevice : undefined;
    return {
      trackingId,
      layerId,
      projectId,
      dataSourceId,
      deviceId,
      newDevice,
      url: this.url[trackingId],
      identity: { trackingId, projectId, userId, userKey, identityHash },
      embedded: !!embeddedIdentity,
      ...cacheKeys,
      originData: {},
      callback,
      retryCount: 0
    };
  };

  /** 普通 Web 及旧版未传 gionewdevice 的内嵌页：当前仍处于首个 session 才是新设备。 */
  private getWebNewDevice = (trackingId: string) => {
    const { userStore } = this.growingIO;
    // 首次发送可能才创建 S1；核心在业务回调前记录事实，AB 不追踪设备/session 生命周期。
    const sessionId = userStore.getSessionId(trackingId);
    return typeof userStore.isFirstDeviceSession === 'function'
      ? userStore.isFirstDeviceSession(trackingId, sessionId)
      : this.legacyFirstDeviceSessions.isFirst(trackingId, sessionId);
  };

  /** Hybrid 成功时仅使用本次 Bridge 返回的主体，不读取 Web 用户或首访标记。 */
  createNativeRequestContext = (
    trackingId: string,
    layerId: string | number,
    callback: any,
    nativeIdentity: NativeIdentity,
    binding?: HybridBindingSnapshot
  ): ABRequestContext => {
    const tracker = this.growingIO.dataStore.getTrackerVds(trackingId);
    const { projectId, dataSourceId } = binding
      ? {
          projectId: binding.config.projectId,
          dataSourceId: binding.config.dataSourceId ?? tracker.dataSourceId
        }
      : this.getMainConfigs(trackingId);
    const identityHash = getABIdentityHash(
      nativeIdentity.userId,
      nativeIdentity.userKey
    );
    const cacheKeys = getABCacheKeys(
      trackingId,
      projectId,
      nativeIdentity.deviceId,
      layerId,
      identityHash,
      this.url[trackingId]
    );
    return {
      trackingId,
      layerId,
      projectId,
      dataSourceId,
      deviceId: nativeIdentity.deviceId,
      newDevice: nativeIdentity.isNewDevice,
      hybridGeneration: binding?.generation,
      sendNewDevice: nativeIdentity.isNewDevice,
      url: this.url[trackingId],
      identity: {
        trackingId,
        projectId,
        userId: nativeIdentity.userId,
        userKey: nativeIdentity.userKey,
        identityHash
      },
      ...cacheKeys,
      originData: {},
      callback,
      retryCount: 0
    };
  };

  /**
   * 同一 signKey 只发送一条在途请求。首个请求负责缓存与命中事件，
   * 完成后将同一结果分发给所有等待的调用方。
   */
  private requestOrJoin = (context: ABRequestContext) => {
    const pending = this.pendingRequests[context.signKey];
    if (pending) {
      pending.callbacks.push(context.callback);
      return;
    }
    const current: ABPendingRequest = {
      callbacks: [context.callback],
      context
    };
    this.pendingRequests[context.signKey] = current;
    let settled = false;
    context.callback = (result: any) => {
      if (settled) return;
      settled = true;
      context.settled = true;
      this.stopXHRs(context);
      if (this.pendingRequests[context.signKey] === current) {
        delete this.pendingRequests[context.signKey];
      }
      current.cancelCoordination?.();
      current.callbacks
        .slice()
        .forEach((callback) => niceCallback(callback, result));
    };
    const cancel = acquireABRequestLock(
      context.signKey,
      (lock) => {
        context.runWithLock = lock.run;
        const resume = () => {
          if (!this.isContextCurrent(context)) {
            niceCallback(context.callback, {});
            return;
          }
          // 等待其他页面期间结果可能已经写入；必须在锁内重新读取同一身份缓存。
          const data = this.getABStorageItem(context.dataKey);
          const sign = this.getABStorageItem(context.signKey);
          if (isObject(data) && !isEmpty(data)) {
            context.originData = data;
            if (sign > Date.now()) {
              niceCallback(context.callback, data);
              return;
            }
          } else {
            context.originData = {};
            this.removeABStorageItem(context.dataKey);
            this.removeABStorageItem(context.pendingHitKey);
          }
          // 只有持锁页可按本次快照回收无效项，不能在排队之前清理共享结果。
          this.removeABStorageItem(context.signKey);
          this.initiateRequest(context);
        };
        if (context.native && lock.coordinated) {
          // 等待其他页面期间宿主可能换人，不能直接返回等待前身份的缓存。
          try {
            Promise.resolve(
              this.growingIO.plugins?.gioHybridAdapter?.getNativeIdentity(
                context.trackingId,
                context.hybridGeneration
              )
            ).then(
              (identity) => {
                if (!this.matchesNativeIdentity(context, identity))
                  niceCallback(context.callback, {});
                else lock.run(resume);
              },
              () => niceCallback(context.callback, {})
            );
          } catch (_error) {
            niceCallback(context.callback, {});
          }
        } else lock.run(resume);
      },
      () => niceCallback(context.callback, {})
    );
    current.cancelCoordination = cancel;
    if (context.settled) cancel();
  };

  private matchesNativeIdentity = (
    context: ABRequestContext,
    identity?: NativeIdentityResult | null
  ) =>
    !!identity &&
    'deviceId' in identity &&
    identity.dataCollectionEnabled !== false &&
    identity.deviceId === context.deviceId &&
    identity.userId === context.identity.userId &&
    identity.userKey === context.identity.userKey;

  /**
   * 发送或重试同一个请求上下文。每次发送生成新的 stm 和密文，
   * 但 project、身份、缓存槽及回调始终固定为创建上下文时的值。
   */
  initiateRequest = (context: ABRequestContext) => {
    // dataCollect 可在首次请求后、网络重试前被关闭。
    // 每次实际发送前重新校验，防止关闭后继续重试。
    if (!this.isContextCurrent(context)) {
      niceCallback(context.callback, {});
      return;
    }
    // 在途请求已登记到 pendingRequests；任何同步异常都必须结束本次请求，
    // 否则同一缓存槽后续的 getABTest 会一直等待一个永远不会完成的请求。
    try {
      // 普通 Web 路径在首次发送时计算 newDevice，重试沿用同一结果。
      if (typeof context.newDevice !== 'boolean') {
        context.newDevice = this.getWebNewDevice(context.trackingId);
      }
      // getSessionId 可同步续期并补发访问事件，其业务回调可能关闭采集、
      // 换账号或重注册插件；取消后的上下文不能再创建或发送 XHR。
      if (!this.isContextCurrent(context)) {
        niceCallback(context.callback, {});
        return;
      }
      const send = () => {
        // IndexedDB 的所有权复核异步完成，发送异常不能只依赖外层同步 catch。
        try {
          if (this.isContextCurrent(context)) this.sendRequest(context);
          else niceCallback(context.callback, {});
        } catch (_error) {
          consoleText('获取ABTest数据失败! 请求发送异常!', 'error');
          niceCallback(context.callback, {});
        }
      };
      if (context.runWithLock) context.runWithLock(send);
      else send();
    } catch (_error) {
      consoleText('获取ABTest数据失败! 请求发送异常!', 'error');
      niceCallback(context.callback, {});
    }
  };

  private sendRequest = (context: ABRequestContext) => {
    const xhr = new XMLHttpRequest();
    if (xhr) {
      this.activeXHRs.push({ xhr, context });
      let finished = false;
      const finish = () => {
        if (finished) return false;
        finished = true;
        this.activeXHRs = this.activeXHRs.filter(
          (active) => active.xhr !== xhr
        );
        return true;
      };
      const now = Date.now();
      // 同一毫秒内的同步重试也必须拥有不同 stm，保证每个 HTTP 请求是一组独立编码。
      const stm = String(
        context.lastStm && now <= context.lastStm ? context.lastStm + 1 : now
      );
      context.lastStm = Number(stm);
      xhr.open('POST', appendStm(context.url, stm), true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.timeout = this.requestTimeout;
      xhr.onload = (res: any) => {
        if (!finish()) return;
        const consumeResponse = () => {
          // 请求在途时关闭采集，响应不再写缓存或上报实验命中。
          if (!this.isContextCurrent(context)) {
            niceCallback(context.callback, {});
            return;
          }
          const data = niceTry(() => JSON.parse(res.target.responseText)) ?? {};
          const httpFailed = xhr.status >= 400;
          if (!httpFailed && data.code === 0) {
            const consume = (nativeIdentity?: NativeIdentityResult | null) => {
              const commit = () => {
                try {
                  if (
                    !this.isContextCurrent(context) ||
                    (context.native &&
                      !this.matchesNativeIdentity(context, nativeIdentity))
                  ) {
                    niceCallback(context.callback, {});
                    return;
                  }
                  this.experimentVerify(context, {
                    ...data,
                    layerId: context.layerId
                  });
                } catch (_error) {
                  niceCallback(context.callback, {});
                }
              };
              if (context.native && context.runWithLock)
                context.runWithLock(commit);
              else commit();
            };
            if (context.native) {
              // App 身份可能在 HTTP 在途期间变化，返回结果前重新核对，失败时不归属旧实验。
              try {
                Promise.resolve(
                  this.growingIO.plugins?.gioHybridAdapter?.getNativeIdentity(
                    context.trackingId,
                    context.hybridGeneration
                  )
                ).then(consume, () => consume(null));
              } catch (_error) {
                consume(null);
              }
            } else consume();
          } else {
            consoleText(`获取ABTest数据失败! ${data.errorMsg}!`, 'error');
            // 失败后只解除结果复用窗口，下一次显式调用立即重拉，不返回旧实验。
            // 当日结果和待补报标记保留供成功响应比较，避免同一实验重复命中。
            this.removeABStorageItem(context.signKey);
            niceCallback(context.callback, {});
          }
        };
        if (context.runWithLock) context.runWithLock(consumeResponse);
        else consumeResponse();
      };
      // abort 与超时同属无响应的终态，同样必须结束请求并释放在途槽位。
      xhr.onabort = xhr.ontimeout = () => {
        if (!finish()) return;
        if (!this.isContextCurrent(context)) {
          niceCallback(context.callback, {});
          return;
        }
        consoleText('获取ABTest数据失败! 请求超时!', 'error');
        // 接口超时返回false信息
        niceCallback(context.callback, {});
      };
      xhr.onerror = () => {
        if (!finish()) return;
        if (!this.isContextCurrent(context)) {
          niceCallback(context.callback, {});
          return;
        }
        // retryCount 属于请求上下文；并发调用或不同实例不会消耗彼此的重试次数。
        if (xhr.status !== 200 && context.retryCount < 2) {
          context.retryCount += 1;
          this.initiateRequest(context);
        } else {
          consoleText(`获取ABTest数据失败! ${xhr.statusText}!`, 'error');
          // 重试结束（或无法重试）时必须结束请求，释放在途槽位。
          niceCallback(context.callback, {});
        }
      };
      xhr.send(buildABRequestBody(context, stm));
      return;
    } else {
      consoleText('获取ABTest数据失败! 当前环境不支持XMLHttpRequest!', 'error');
      niceCallback(context.callback, {});
    }
  };

  /**
   * 写入当前身份快照对应的实验结果，并仅在核心实验字段变化时补发 $exp_hit。
   * 展示名称变更会覆盖缓存，但不会单独造成一次重复命中。
   */
  experimentVerify = (context: ABRequestContext, responseData: any) => {
    if (!this.isContextCurrent(context)) {
      niceCallback(context.callback, {});
      return;
    }
    const {
      layerId,
      strategyId,
      experimentId,
      layerName,
      experimentName,
      strategyName,
      variables
    } = responseData;
    // 比较集只包含决定实验归属和变量的字段，不包含可独立变更的展示名称。
    const comparisonData = {
      layerId: toString(layerId),
      strategyId: toString(strategyId),
      experimentId: toString(experimentId),
      variables
    };
    // originData 来自同一请求上下文的缓存槽，绝不读取响应到达时的当前身份缓存。
    const controlData = { ...context.originData };
    unset(controlData, ['layerName', 'strategyName', 'experimentName']);
    const comparisonValue = serializeExperiment(comparisonData);
    const controlValue = serializeExperiment(controlData);
    // 缓存和回调仍保留名称字段，维持 getABTest 的既有返回结构。
    const expData = {
      ...comparisonData,
      layerName,
      strategyName,
      experimentName
    };
    // 分流归属或变量变化时上报命中；上次构建失败时，即使本次结果未变也要补报。
    // 先记录待补报标记，再写入新缓存，使后续调用始终读到本次返回的结果。
    const pendingHit = !!this.getABStorageItem(context.pendingHitKey);
    const hitKey = context.hitKey || context.dataKey.replace(/_data$/, '_hit');
    const recordedHit = this.getABStorageItem(hitKey);
    // 独立记录比可能写入失败的结果缓存更新；尚无记录时才兼容已有 V2 结果。
    const settledComparison =
      typeof recordedHit?.comparison === 'string'
        ? recordedHit.comparison
        : controlValue;
    const shouldHit =
      !!strategyId &&
      !!experimentId &&
      (pendingHit || comparisonValue !== settledComparison);
    let hitSettled = true;
    if (shouldHit) {
      hitSettled = !!niceTry(() => {
        this.buildExperimentHitEvent(context.trackingId, expData, context);
        return true;
      });
    }
    // 命中构建会执行业务事件回调；其中可能同步卸载、关采集或切换身份。
    // 旧请求已取消时不能再写缓存，或覆盖重入调用刚写入的新结果。
    if (!this.isContextCurrent(context)) {
      niceCallback(context.callback, {});
      return;
    }
    const expiresAt = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate() + 1
    ).getTime();
    if (shouldHit && !hitSettled) {
      this.setABStorageItem(context.pendingHitKey, true, expiresAt);
    }
    if (hitSettled) {
      // 空分配也推进基线，之后重新进入原实验仍应命中。写入失败则移除旧基线，
      // 让后续通过最新结果比较，不能被旧命中记录触发重复事件。
      if (
        !this.setABStorageItem(
          hitKey,
          { comparison: comparisonValue },
          expiresAt
        )
      )
        this.removeABStorageItem(hitKey);
    }
    // 成功响应始终覆盖缓存，避免本次返回新结果、节流窗口内却返回旧结果。
    const dataStored = this.setABStorageItem(
      context.dataKey,
      expData,
      expiresAt
    );
    if (hitSettled && pendingHit) {
      this.removeABStorageItem(context.pendingHitKey);
    }
    // 先完成请求间隔写入，再分发结果。调用方在回调中同步重试时
    // 会直接命中刚写入的缓存，不会再开一条并发请求。
    const nextRequestAt = Date.now() + 1000 * 60 * this.requestInterval;
    if (dataStored) {
      this.setABStorageItem(context.signKey, nextRequestAt, nextRequestAt);
    } else {
      // 覆写较大的结果可能失败，但较小的 sign 仍能写入；不能给旧结果续期。
      this.removeABStorageItem(context.signKey);
    }
    niceCallback(context.callback, expData);
  };

  /** 将 AB 响应映射为既有 $exp_hit 属性，不改变事件名称或字段契约。 */
  buildExperimentHitEvent = (
    trackingId: string,
    expData: any,
    context?: ABRequestContext
  ) => {
    const {
      dataStore: { eventContextBuilder, eventConverter }
    } = this.growingIO;
    let event = {
      eventType: 'CUSTOM',
      eventName: '$exp_hit',
      ...eventContextBuilder(trackingId)
    };
    const {
      layerId,
      experimentId,
      strategyId,
      layerName,
      experimentName,
      strategyName
    } = expData;
    event.attributes = limitObject({
      ...(event.attributes ?? {}),
      $exp_layer_id: layerId,
      $exp_id: experimentId,
      $exp_strategy_id: strategyId,
      $exp_layer_name: layerName,
      $exp_name: experimentName,
      $exp_strategy_name: strategyName
    });
    eventConverter(
      event,
      context
        ? {
            deviceId: context.deviceId,
            userId: context.identity.userId,
            userKey: context.identity.userKey
          }
        : undefined
    );
  };
}
