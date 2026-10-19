/**
 * 名称：内嵌页适配插件
 * 用途：用于打通小程序内嵌页。
 */
import { GrowingIOType } from '@/types/internal/growingIO';
import {
  getEmbeddedIgnoreFields,
  normalizeEmbeddedIgnoreFields
} from '@/core/dataStore/eventContext';
import {
  has,
  includes,
  isEmpty,
  isObject,
  isString,
  keys,
  startsWith,
  unset
} from '@/utils/glodash';
import { OriginOptions, StorageKeyType } from '@/types/internal/dataStore';
import {
  consoleText,
  niceCallback,
  niceTry,
  queryParse,
  queryStringify
} from '@/utils/tools';
import EMIT_MSG from '@/constants/emitMsg';
import LocalStorage from '@/core/storage/local';
import {
  GQS,
  CustomerQS,
  EmbeddedStorageType,
  EmbeddedABIdentity
} from './types';

const EMBEDDED_ENUMS = {
  gioprojectid: 'projectId',
  giodatacollect: 'dataCollect',
  gioappid: 'domain',
  giodatasourceid: 'dataSourceId',
  gios: 'sessionId',
  giou: 'deviceId',
  giocs1: 'userId',
  giouserkey: 'userKey',
  gioappchannel: 'appChannel',
  giodevicebrand: 'deviceBrand',
  giodevicemodel: 'deviceModel',
  giodevicetype: 'deviceType',
  giolanguage: 'language',
  gionetworkstate: 'networkState',
  giooperatingsystem: 'operatingSystem',
  gioplatform: 'platform',
  gioplatformversion: 'platformVersion',
  gioscreenheight: 'screenHeight',
  gioscreenwidth: 'screenWidth',
  giocircleroomid: 'circleRoomId'
};
const VDS_EXTRA = [
  'gioprojectid',
  'giodatacollect',
  'giodatasourceid',
  'gioplatform',
  'giocircleroomid'
];
const COM_EXTRA = [
  'giodatasourceid',
  'gioplatform',
  'gioappchannel',
  'giodevicebrand',
  'giodevicemodel',
  'giodevicetype',
  'giolanguage',
  'gionetworkstate',
  'giooperatingsystem',
  'gioplatformversion',
  'gioscreenheight',
  'gioscreenwidth',
  'giocs1',
  'gios',
  'giou',
  'giouserkey'
];
const GQS_KEY = [
  'gioappid',
  'gioprojectid',
  'giodatacollect',
  'giocircleroomid',
  // AB 专用的首访标记。它不进入通用事件上下文，只供 gioABTest 继承小程序语义。
  'gionewdevice',
  ...COM_EXTRA
];
// 在存储中的gioinfo相关参数
const LOCAL_KEY = 'gdp_query_string';
// 首访状态绑定完整宿主身份。过期记录保留归属，避免把“首个 session 已结束”误当作旧版未传标记。
const NEW_DEVICE_KEY = 'gdp_embedded_new_device';
const IDENTITY_FIELDS = [
  'projectId',
  'appId',
  'deviceId',
  'sessionId'
] as const;
type EmbeddedIdentity = Record<(typeof IDENTITY_FIELDS)[number], string>;
type EmbeddedNewDeviceRecord = EmbeddedIdentity & {
  newDevice: boolean;
  expiresAt: number;
};
// 与小程序打通时，存储的圈选状态
const CIRCLE_ERROR_KEY = 'gdp_circle_error';
// 浏览器对 fetch keepalive 请求体的限制（字节）
const KEEPALIVE_BODY_LIMIT = 64 * 1024;

/** 计算字符串按 UTF-8 编码后的字节数，孤立代理项按替换字符（3 字节）计。 */
const getUtf8ByteLength = (value: string) => {
  let length = 0;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x80) {
      length += 1;
    } else if (code < 0x800) {
      length += 2;
    } else if (
      code >= 0xd800 &&
      code <= 0xdbff &&
      index + 1 < value.length &&
      value.charCodeAt(index + 1) >= 0xdc00 &&
      value.charCodeAt(index + 1) <= 0xdfff
    ) {
      length += 4;
      index += 1;
    } else {
      length += 3;
    }
  }
  return length;
};

export default class GioEmbeddedAdapter {
  public pluginVersion = '__PLUGIN_VERSION__';
  public options: Record<string, any> = {};
  /** URL Search 参数对象 */
  public searchQs: GQS = {};
  /** URL Hash 参数对象 */
  public hashQs: GQS = {};
  /** 提取出的 GIO 参数对象 */
  public gqs: GQS = {};
  /** 提取出的客户业务参数对象 */
  public customerQs: CustomerQS = {};
  /** 小程序在 getGioInfo 中声明的首访状态；undefined 代表旧版本未传该参数。 */
  public get embeddedNewDevice(): boolean | undefined {
    if (this.embeddedNewDeviceValue !== true)
      return this.embeddedNewDeviceValue;
    // 同源新页面已经切换宿主 session 时，旧页内存中的 true 不能用于当前共享身份的 AB 请求。
    if (!this.ownsEmbeddedSession()) return false;
    // 后台页面可能冻结保活定时器；AB 读取时仍应检查真实时间，并沿用同 session 其他页的续期。
    const stored = niceTry(() => this.storage.getItem(NEW_DEVICE_KEY));
    if (
      this.embeddedIdentity &&
      this.matchesEmbeddedIdentity(stored, this.embeddedIdentity) &&
      typeof stored.expiresAt === 'number'
    ) {
      this.embeddedNewDeviceExpiresAt = stored.expiresAt;
      return stored.newDevice === true && stored.expiresAt > Date.now();
    }
    return this.embeddedNewDeviceExpiresAt > Date.now();
  }
  private embeddedNewDeviceValue: boolean | undefined;
  private embeddedNewDeviceExpiresAt = 0;
  /** 当前页面继承的宿主身份；新页面切换 session 后，旧页不能再续期新页面的记录。 */
  private embeddedIdentity?: EmbeddedIdentity;
  private embeddedABIdentity?: Partial<Omit<EmbeddedABIdentity, 'newDevice'>>;
  /** GIO 参数来源：search, hash, local (storage), none */
  public qsFrom: 'search' | 'hash' | 'local' | 'none' = 'search';
  /** 本地存储实例 */
  private storage: EmbeddedStorageType;
  /** 圈选是否开启 */
  private circleOpen = false;
  /** 圈选服务器地址映射 */
  private circleServerUrl: Record<string, string> = {};
  /** 圈选房间ID */
  private circleRoomId: string | undefined;
  /** Session 刷新定时器 */
  private sessionRefreshTimer: number | undefined;
  /** 被本插件接管的实例 API；销毁时仅恢复仍由本插件持有的包装器。 */
  private originalSetUserId?: any;
  private installedSetUserId?: any;
  private originalClearUserId?: any;
  private installedClearUserId?: any;
  private originalSetOption?: any;
  private installedSetOption?: any;
  private restoreWebIdentityStorage?: () => void;
  private circleListenerAdded = false;
  private circleGeneration = 0;
  private activeCircleRequests: Array<() => void> = [];
  private destroyed = false;

  /**
   * 构造函数
   * @param growingIO GrowingIO 实例
   */
  constructor(public growingIO: GrowingIOType) {
    this.storage = new LocalStorage();
    this.growingIO.emitter.on(
      EMIT_MSG.OPTION_INITIALIZED,
      this.initEmbeddedBridge
    );
    this.growingIO.emitter.on(EMIT_MSG.ON_SEND_AFTER, this.handleSendAfter);
    // 页面卸载时清理 session 刷新定时器
    window.addEventListener('beforeunload', this.cleanupSessionTimer);
  }

  /**
   * 清理 session 刷新定时器
   */
  cleanupSessionTimer = () => {
    if (this.sessionRefreshTimer) {
      window.clearInterval(this.sessionRefreshTimer);
      this.sessionRefreshTimer = undefined;
    }
  };

  destroy = () => {
    this.destroyed = true;
    this.cancelCircleRequests();
    this.circleOpen = false;
    this.circleServerUrl = {};
    this.embeddedNewDeviceValue = undefined;
    this.embeddedNewDeviceExpiresAt = 0;
    this.embeddedIdentity = undefined;
    this.embeddedABIdentity = undefined;
    this.cleanupSessionTimer();
    this.restoreInstanceMethods();
    this.restoreWebIdentityStorage?.();
    this.detachCircleCommitListener();
    window.removeEventListener('beforeunload', this.cleanupSessionTimer);
    this.growingIO.emitter?.off(
      EMIT_MSG.OPTION_INITIALIZED,
      this.initEmbeddedBridge
    );
    this.growingIO.emitter?.off(EMIT_MSG.ON_SEND_AFTER, this.handleSendAfter);
  };

  /** undefined 继续 Web 身份；null 表示原页宿主已失去归属，AB 必须结束调用。 */
  getEmbeddedABIdentity = (
    trackingId: string
  ): EmbeddedABIdentity | null | undefined => {
    if (trackingId !== this.growingIO.useEmbeddedInherit) {
      return undefined;
    }
    if (
      this.destroyed ||
      !this.embeddedABIdentity ||
      !this.ownsEmbeddedSession()
    ) {
      return null;
    }
    const { userStore, dataStore } = this.growingIO;
    const trackerVds = dataStore.getTrackerVds(trackingId);
    // strict 不改写 Web 存储：未传入的字段与普通事件一样，从当前 Web 身份兜底。
    return {
      deviceId: this.embeddedABIdentity.deviceId ?? userStore.getUid?.() ?? '',
      userId:
        this.embeddedABIdentity.userId ??
        userStore.getUserId?.(trackingId) ??
        '',
      userKey:
        this.embeddedABIdentity.userKey ??
        (trackerVds?.idMapping
          ? (userStore.getUserKey?.(trackingId) ?? '')
          : ''),
      // 缺少有效宿主设备时，由 AB 在实际发送时回退 Web 判定。
      newDevice: this.embeddedIdentity?.deviceId
        ? this.embeddedNewDevice
        : undefined
    };
  };

  /**
   * 检测是否在小程序环境中
   * @returns 是否在小程序环境
   */
  private isMiniprogramEnvironment = (): boolean => {
    const ua = navigator.userAgent.toLocaleLowerCase();
    return [
      'miniprogram',
      'webview',
      'baiduboxapp',
      'toutiaomicroapp',
      'kwapp',
      'jdapp',
      'xhsminiapp'
    ].some((v) => ua.indexOf(v) !== -1);
  };

  /**
   * 准备 embeddedAdapter 配置
   * @param trackingId 当前实例的 Tracking ID
   * @param vdsConfig 当前实例的配置
   * @returns 合并后的 embeddedAdapter 配置
   */
  private prepareEmbeddedConfig = (
    trackingId: string,
    vdsConfig: OriginOptions
  ) => {
    const mergedEmbedded = this.mergeEmbeddedAdapterOptions(vdsConfig);
    this.growingIO.dataStore.updateVdsConfig(trackingId, {
      embeddedAdapter: mergedEmbedded
    });
    return mergedEmbedded;
  };

  /**
   * 解析嵌入式页面参数
   * @param vdsConfig 当前实例的配置
   * @param trackingId 当前实例的 Tracking ID
   * @returns 解析后的 GIO 参数对象
   */
  private parseEmbeddedParams = (
    vdsConfig: OriginOptions,
    trackingId: string
  ) => {
    // 子实例时要取主实例的hashtag值
    const hashtag =
      trackingId === this.growingIO.trackingId
        ? vdsConfig.hashtag
        : this.growingIO.vdsConfig.hashtag;
    const gqs = this.getGQS(hashtag);
    // 如果从lurl或hash中解析出gio参数，则在存储中存打通数据，防止刷新或多实例时丢失
    if (includes(['search', 'hash'], this.qsFrom) && !isEmpty(gqs)) {
      // gionewdevice 由 NEW_DEVICE_KEY 按 session 有效期单独保存。
      const localQs = { ...gqs };
      unset(localQs, 'gionewdevice');
      this.storage.setItem(LOCAL_KEY, localQs);
      // 解析 URL 的实例不一定是最终打通的实例（多实例时可能由后初始化的子实例
      // 从本地参数打通），因此解析时就保存首访状态；URL 未携带时清除残留值。
      if (typeof gqs.gionewdevice === 'boolean') {
        this.persistEmbeddedNewDevice(
          gqs.gionewdevice,
          this.getSessionExpires(vdsConfig),
          this.getEmbeddedIdentity(gqs)
        );
      } else {
        niceTry(() => this.storage.removeItem(NEW_DEVICE_KEY));
      }
    }
    return gqs;
  };

  /**
   * 尝试建立打通连接
   * @param trackingId 当前实例的 Tracking ID
   * @param vdsConfig 当前实例的配置
   * @param gqs 解析后的 GIO 参数对象
   * @param mergedEmbedded 合并后的 embeddedAdapter 配置
   */
  private tryEstablishBridge = (
    trackingId: string,
    vdsConfig: OriginOptions,
    gqs: GQS,
    mergedEmbedded: any
  ) => {
    const isMiniprogram = this.isMiniprogramEnvironment();
    // 严格模式下：必须在小程序环境中才执行
    // 非严格模式：始终执行（兼容旧行为，允许在非小程序环境中通过URL参数打通）
    if (!mergedEmbedded.strict || isMiniprogram) {
      this.onOptionsInit(trackingId, vdsConfig, gqs);
    }
  };

  /**
   * 清理 URL 中的 GIO 参数
   * @description 无论是否打通都会执行，但需要先调用 parseEmbeddedParams 确保 customerQs 已被正确设置
   * @param embeddedAdapter 可选的 embeddedAdapter 配置，如果提供则优先使用
   */
  private cleanupUrlParams = (embeddedAdapter?: any) => {
    const mainVds = this.growingIO.dataStore.getTrackerVds(
      this.growingIO.trackingId
    );
    // 优先使用传入的配置（通常是刚合并好的），其次从 mainVds 获取
    const rq =
      embeddedAdapter?.rewriteQuery ?? mainVds?.embeddedAdapter?.rewriteQuery;

    if (rq !== false) {
      this.gioURLRewrite();
    }
    // 打通的可能是后初始化的实例，所以在重写完成后要重新解析一次页面信息
    this.growingIO.dataStore.currentPage.parsePage();
  };

  /**
   * 初始化小程序打通桥接
   * @description 配置初始化完成后的主入口，负责整个打通流程的协调
   * @param param0 配置对象，包含 trackingId 和 vdsConfig
   */
  initEmbeddedBridge = ({ trackingId, vdsConfig }: any) => {
    // 1. 准备配置
    const mergedEmbedded = this.prepareEmbeddedConfig(trackingId, vdsConfig);

    // 2. 解析URL参数（必须在URL重写前执行，确保 customerQs 被正确设置）
    const gqs = this.parseEmbeddedParams(vdsConfig, trackingId);

    // 3. 尝试打通连接
    this.tryEstablishBridge(trackingId, vdsConfig, gqs, mergedEmbedded);

    // 4. 清理URL参数（无论是否打通都会执行）
    this.cleanupUrlParams(mergedEmbedded);
  };

  /**
   * 合并embeddedAdapter相关配置
   * @description 合并优先级：
   * - strict: `vdsConfig.embeddedAdapter` > `plugin.options` > 默认
   * - rewriteQuery: `vdsConfig.embeddedAdapter` > `plugin.options` > `vdsConfig.rewriteQuery`(兼容顶层) > 默认
   * - ignoreFields: `vdsConfig.embeddedAdapter` > `plugin.options` > `vdsConfig.embeddedIgnore`(兼容旧配置) > 默认
   * - circleServerUrl: `vdsConfig.embeddedAdapter` > `plugin.options` > 默认
   * @param vdsConfig 初始化后的vds配置对象
   */
  mergeEmbeddedAdapterOptions = (vdsConfig: OriginOptions) => {
    const defaults = {
      circleServerUrl: '',
      rewriteQuery: true,
      ignoreFields: [] as string[],
      strict: false
    };

    // 归一化各来源配置（确保是对象，非对象时回退到空对象）
    const vdsEmbedded = isObject(vdsConfig?.embeddedAdapter)
      ? (vdsConfig.embeddedAdapter as Record<string, any>)
      : {};
    const pluginEmbedded = isObject(this.options)
      ? (this.options as Record<string, any>)
      : {};

    // 按优先级获取配置值的辅助函数
    const getValue = <T>(
      vdsVal: T,
      pluginVal: T,
      defaultVal: T,
      checkFn: (v: T) => boolean
    ): T =>
      checkFn(vdsVal) ? vdsVal : checkFn(pluginVal) ? pluginVal : defaultVal;

    // 计算各字段（优先级：vdsEmbedded > pluginEmbedded > 默认）
    const strict = getValue(
      vdsEmbedded.strict,
      pluginEmbedded.strict,
      defaults.strict,
      (v) => typeof v === 'boolean'
    );

    // rewriteQuery 特殊处理：优先级为 vdsEmbedded > pluginEmbedded > 顶层vdsConfig > 默认
    // 注意：顶层vdsConfig.rewriteQuery 有默认值 true，所以 pluginEmbedded 优先级要高于顶层
    const rewriteQuery =
      typeof vdsEmbedded.rewriteQuery === 'boolean'
        ? vdsEmbedded.rewriteQuery
        : typeof pluginEmbedded.rewriteQuery === 'boolean'
          ? pluginEmbedded.rewriteQuery
          : typeof vdsConfig?.rewriteQuery === 'boolean'
            ? vdsConfig.rewriteQuery
            : defaults.rewriteQuery;

    const rawIgnoreFields = getValue(
      vdsEmbedded.ignoreFields,
      pluginEmbedded.ignoreFields,
      Array.isArray(vdsConfig?.embeddedIgnore)
        ? vdsConfig.embeddedIgnore
        : defaults.ignoreFields,
      Array.isArray
    );
    const ignoreFields = normalizeEmbeddedIgnoreFields(rawIgnoreFields);

    const rawCircleUrl = getValue(
      vdsEmbedded.circleServerUrl,
      pluginEmbedded.circleServerUrl,
      defaults.circleServerUrl,
      (v) => isString(v) || isObject(v)
    );
    const circleServerUrl = isObject(rawCircleUrl)
      ? JSON.parse(JSON.stringify(rawCircleUrl))
      : rawCircleUrl;

    // 合并结果并深拷贝返回
    return JSON.parse(
      JSON.stringify({
        circleServerUrl,
        rewriteQuery,
        ignoreFields,
        strict
      })
    );
  };

  /**
   * 验证是否可以打通
   */
  private canEstablishBridge = (
    trackingId: string,
    projectId: string,
    appId: string,
    gqs: GQS
  ): boolean => {
    return (
      !this.growingIO.useEmbeddedInherit &&
      this.qsFrom !== 'none' &&
      gqs.gioprojectid === projectId &&
      gqs.gioappid === appId
    );
  };

  /**
   * 初始化圈选如果需要
   */
  private initCircleIfNeeded = (trackingId: string, gqs: GQS) => {
    const circleRoomId = gqs.giocircleroomid;
    if (circleRoomId) {
      const currentVds = this.growingIO.dataStore.getTrackerVds(trackingId);
      this.circleInit(circleRoomId as string, currentVds);
    } else {
      this.storage.removeItem(CIRCLE_ERROR_KEY);
    }
  };

  /**
   * 同步 VDS 配置
   */
  private syncVdsConfig = (trackerVds: any, gqs: GQS) => {
    VDS_EXTRA.forEach((key: string) => {
      if (!has(gqs, key)) return;

      if (key === 'giodatacollect') {
        trackerVds.dataCollect = includes(['true', true], gqs.giodatacollect);
      } else {
        const embedKey = EMBEDDED_ENUMS[key];
        if (includes(['domain', 'platform'], embedKey)) {
          trackerVds.originValues ??= {};
          trackerVds.originValues[embedKey] = trackerVds[embedKey];
        }
        trackerVds[embedKey] = gqs[key];
      }
    });
  };

  /**
   * 同步用户信息
   */
  private syncUserInfo = (
    trackingId: string,
    gqs: GQS,
    isStrict: boolean,
    ignoreFields: string[]
  ) => {
    if (isStrict) return;

    const { userStore } = this.growingIO;
    if (isString(gqs.giou)) {
      userStore.setUid(gqs.giou as string);
    }
    if (isString(gqs.gios)) {
      userStore.setSessionId(trackingId, gqs.gios as string);
    }
    if (!includes(ignoreFields, 'userId')) {
      userStore.setUserId(
        trackingId,
        (isString(gqs.giocs1) ? gqs.giocs1 : '') as string
      );
    }
    if (!includes(ignoreFields, 'userKey')) {
      userStore.setUserKey(
        trackingId,
        (isString(gqs.giouserkey) ? gqs.giouserkey : '') as string
      );
    }
  };

  /** 子实例继承数据源会改变存储前缀；Web 兜底身份继续使用初始化时的键及有效期。 */
  private preserveWebIdentityStorage = (
    trackingId: string,
    trackerVds: any,
    gqs: GQS,
    isStrict: boolean,
    ignoreFields: string[]
  ) => {
    const { dataStore, subInstance } = this.growingIO;
    if (
      trackingId === this.growingIO.trackingId ||
      !subInstance?.[trackingId] ||
      !isString(gqs.giodatasourceid) ||
      gqs.giodatasourceid === trackerVds.dataSourceId ||
      this.restoreWebIdentityStorage
    )
      return;

    const fields: StorageKeyType[] = [];
    if (isStrict || !isString(gqs.gios)) fields.push('sessionId');
    if (isStrict || includes(ignoreFields, 'userId'))
      fields.push('userId', 'gioId');
    if (isStrict || includes(ignoreFields, 'userKey')) fields.push('userKey');
    if (!fields.length) return;

    const originalGetStorageKey = dataStore.getStorageKey;
    const webKeys: Partial<Record<StorageKeyType, string>> = {};
    fields.forEach((field) => {
      webKeys[field] = originalGetStorageKey.call(dataStore, trackingId, field);
    });
    const getStorageKey = (target: string, field: StorageKeyType) =>
      (target === trackingId ? webKeys[field] : undefined) ??
      originalGetStorageKey.call(dataStore, target, field);
    dataStore.getStorageKey = getStorageKey;
    this.restoreWebIdentityStorage = () => {
      if (dataStore.getStorageKey === getStorageKey)
        dataStore.getStorageKey = originalGetStorageKey;
      this.restoreWebIdentityStorage = undefined;
    };
  };

  /**
   * 设置 Session 刷新定时器
   */
  private setupSessionRefresh = (
    trackingId: string,
    gqs: GQS,
    trackerVds: any,
    isStrict: boolean
  ) => {
    const { userStore, storage, dataStore } = this.growingIO;
    const keepWebSession =
      isStrict ||
      !isString(gqs.gios) ||
      includes(getEmbeddedIgnoreFields(trackerVds), 'sessionId');
    const sessionIdValue = keepWebSession ? undefined : (gqs.gios as string);

    if (this.sessionRefreshTimer) {
      window.clearInterval(this.sessionRefreshTimer);
    }

    const sessionExpires = this.getSessionExpires(trackerVds);

    this.sessionRefreshTimer = window.setInterval(
      () => {
        if (keepWebSession) {
          // 不继承宿主 session 时，只保活当前仍有效的 Web session。
          const currentSession = niceTry(() =>
            storage.getItem(dataStore.getStorageKey(trackingId, 'sessionId'))
          );
          if (isString(currentSession) && currentSession) {
            userStore.setSessionId(trackingId, currentSession);
          }
          if (this.ownsEmbeddedSession()) {
            this.renewEmbeddedNewDevice(sessionExpires);
          }
          return;
        }
        // 存储已由另一个页面切到新身份/session 时，不能让旧页面恢复旧 session 或覆盖首访状态。
        if (!this.ownsEmbeddedSession()) return;
        userStore.setSessionId(trackingId, sessionIdValue);
        this.renewEmbeddedNewDevice(sessionExpires);
      },
      sessionExpires * 0.8 * 60 * 1000
    );
  };

  private getEmbeddedIdentity = (gqs: GQS): EmbeddedIdentity => ({
    projectId: isString(gqs.gioprojectid) ? (gqs.gioprojectid as string) : '',
    appId: isString(gqs.gioappid) ? (gqs.gioappid as string) : '',
    deviceId: isString(gqs.giou) ? (gqs.giou as string) : '',
    sessionId: isString(gqs.gios) ? (gqs.gios as string) : ''
  });

  private matchesEmbeddedIdentity = (value: any, identity: EmbeddedIdentity) =>
    isObject(value) &&
    IDENTITY_FIELDS.every((field) => value[field] === identity[field]);

  private ownsEmbeddedSession = () => {
    const identity = this.embeddedIdentity;
    if (!identity) return false;
    const localQs = niceTry(() => this.storage.getItem(LOCAL_KEY));
    if (localQs) {
      return this.matchesEmbeddedIdentity(
        this.getEmbeddedIdentity(localQs),
        identity
      );
    }
    // URL 参数记录被单独清理时，首访记录仍可提供完整的最新 session 归属。
    const stored = niceTry(() => this.storage.getItem(NEW_DEVICE_KEY));
    return !isObject(stored) || this.matchesEmbeddedIdentity(stored, identity);
  };

  /** Uploader 成功完成事件时已经续期 session；首访记录应保持相同有效期。 */
  private handleSendAfter = ({ requestData, trackingId, success }: any) => {
    const identity = this.embeddedIdentity;
    const trackerVds = this.growingIO.dataStore.getTrackerVds(trackingId);
    if (
      success !== true ||
      !identity ||
      trackingId !== this.growingIO.useEmbeddedInherit ||
      (identity.sessionId &&
        !includes(getEmbeddedIgnoreFields(trackerVds), 'sessionId') &&
        requestData?.sessionId !== identity.sessionId) ||
      !this.ownsEmbeddedSession()
    ) {
      return;
    }
    this.renewEmbeddedNewDevice(this.getSessionExpires(trackerVds));
  };

  private renewEmbeddedNewDevice = (sessionExpires: number) => {
    const identity = this.embeddedIdentity;
    const stored = niceTry(() => this.storage.getItem(NEW_DEVICE_KEY));
    if (
      !identity ||
      !this.matchesEmbeddedIdentity(stored, identity) ||
      typeof stored.newDevice !== 'boolean'
    ) {
      return;
    }
    // 被浏览器暂停到 session 过期后恢复的页面，不能把过期的 true 再保活成首访。
    this.embeddedNewDeviceValue =
      stored.newDevice && stored.expiresAt > Date.now();
    this.persistEmbeddedNewDevice(
      this.embeddedNewDevice,
      sessionExpires,
      identity
    );
  };

  /** session 有效期（分钟），防止 NaN 和无效值 */
  private getSessionExpires = (trackerVds: any) => {
    const rawSessionExpires = trackerVds?.sessionExpires;
    return typeof rawSessionExpires === 'number' &&
      !isNaN(rawSessionExpires) &&
      rawSessionExpires > 0
      ? rawSessionExpires
      : 30;
  };

  /**
   * 确定小程序声明的 AB 首访状态。
   * - URL 携带 gionewdevice：以其为准，并按 session 有效期保存，供刷新或 H5 内跳转后恢复；
   * - 从本地恢复：仅在保存的状态仍在 session 有效期内时沿用；已过期说明小程序首个
   *   session 已结束，按旧设备处理；
   * - 从未收到该参数（旧版小程序 SDK）：返回 undefined，由 gioABTest 回退 H5 判定。
   */
  private resolveEmbeddedNewDevice = (
    gqs: GQS,
    sessionExpires: number
  ): boolean | undefined => {
    if (this.qsFrom !== 'local') {
      if (typeof gqs.gionewdevice === 'boolean') {
        this.persistEmbeddedNewDevice(
          gqs.gionewdevice,
          sessionExpires,
          this.embeddedIdentity
        );
        return gqs.gionewdevice;
      }
      niceTry(() => this.storage.removeItem(NEW_DEVICE_KEY));
      return undefined;
    }
    const stored = niceTry(() => this.storage.getItem(NEW_DEVICE_KEY));
    if (isObject(stored)) {
      if (
        !this.embeddedIdentity ||
        !this.matchesEmbeddedIdentity(stored, this.embeddedIdentity) ||
        typeof stored.newDevice !== 'boolean' ||
        typeof stored.expiresAt !== 'number'
      ) {
        return undefined;
      }
      const newDevice = stored.newDevice && stored.expiresAt > Date.now();
      this.persistEmbeddedNewDevice(
        newDevice,
        sessionExpires,
        this.embeddedIdentity
      );
      return newDevice;
    }
    // 兼容上一版裸布尔记录；首次恢复后迁移为带身份和有效期的记录。
    if (typeof stored === 'boolean') {
      this.persistEmbeddedNewDevice(
        stored,
        sessionExpires,
        this.embeddedIdentity
      );
      return stored;
    }
    return niceTry(() => this.storage.hasItem(NEW_DEVICE_KEY))
      ? false
      : undefined;
  };

  private persistEmbeddedNewDevice = (
    value: boolean | undefined,
    sessionExpires: number,
    identity?: EmbeddedIdentity
  ) => {
    if (typeof value !== 'boolean' || !identity) {
      return;
    }
    const expiresAt = Date.now() + sessionExpires * 60 * 1000;
    if (
      this.embeddedIdentity &&
      this.matchesEmbeddedIdentity(identity, this.embeddedIdentity)
    ) {
      this.embeddedNewDeviceExpiresAt = expiresAt;
    }
    niceTry(() =>
      this.storage.setItem(NEW_DEVICE_KEY, {
        ...identity,
        newDevice: value,
        expiresAt
      } satisfies EmbeddedNewDeviceRecord)
    );
  };

  /**
   * 同步通用维度参数
   */
  private syncCommonDimensions = (eventContextBuilderInst: any, gqs: GQS) => {
    eventContextBuilderInst.minpExtraParams = {};
    COM_EXTRA.forEach((key: string) => {
      if (has(gqs, key)) {
        eventContextBuilderInst.minpExtraParams[EMBEDDED_ENUMS[key]] = gqs[key];
      }
    });
  };

  /**
   * 重写实例方法以禁止修改
   * @description 对于已打通的实例，禁止调用 setUserId/clearUserId/setOption
   */
  private overrideInstanceMethods = (
    trackingId: string,
    hasDataCollect: boolean
  ) => {
    // 重复初始化或换实例前，先恢复上一次由本插件安装的包装器。
    this.restoreInstanceMethods();
    const rejectCall = (methodName: string, args: any[]) => {
      consoleText(
        `${methodName} 不允许在已打通的小程序内嵌页实例中调用!`,
        'warn'
      );
      const callback = args[args.length - 1];
      if (typeof callback === 'function') {
        niceCallback(callback, false);
      }
      return false;
    };
    const originalSetUserId = this.growingIO.setUserId;
    this.originalSetUserId = originalSetUserId;
    this.installedSetUserId = (...args: any[]) =>
      args[0] !== trackingId
        ? originalSetUserId.apply(this, args)
        : rejectCall('setUserId', args);
    this.growingIO.setUserId = this.installedSetUserId;

    const originalClearUserId = this.growingIO.clearUserId;
    this.originalClearUserId = originalClearUserId;
    this.installedClearUserId = (...args: any[]) =>
      args[0] !== trackingId
        ? originalClearUserId.apply(this, args)
        : rejectCall('clearUserId', args);
    this.growingIO.clearUserId = this.installedClearUserId;

    if (hasDataCollect) {
      const originalSetOption = this.growingIO.setOption;
      this.originalSetOption = originalSetOption;
      this.installedSetOption = (...args: any[]) =>
        args[0] !== trackingId
          ? originalSetOption.apply(this, args)
          : rejectCall('setOption', args);
      this.growingIO.setOption = this.installedSetOption;
    }
  };

  private restoreInstanceMethods = () => {
    if (this.growingIO.setUserId === this.installedSetUserId) {
      this.growingIO.setUserId = this.originalSetUserId;
    }
    if (this.growingIO.clearUserId === this.installedClearUserId) {
      this.growingIO.clearUserId = this.originalClearUserId;
    }
    if (this.growingIO.setOption === this.installedSetOption) {
      this.growingIO.setOption = this.originalSetOption;
    }
    this.originalSetUserId = undefined;
    this.installedSetUserId = undefined;
    this.originalClearUserId = undefined;
    this.installedClearUserId = undefined;
    this.originalSetOption = undefined;
    this.installedSetOption = undefined;
  };

  /**
   * 打通匹配和打通后的处理逻辑
   * @param trackingId 当前实例的 Tracking ID
   * @param vdsConfig 当前实例的配置
   * @param gqs 解析后的 GIO 参数对象
   */
  onOptionsInit = (trackingId: string, vdsConfig: OriginOptions, gqs: GQS) => {
    const { projectId, appId } = vdsConfig;

    if (!this.canEstablishBridge(trackingId, projectId, appId, gqs)) {
      return;
    }

    this.growingIO.useEmbeddedInherit = trackingId;
    this.growingIO.dataStore.updateVdsConfig(trackingId, {
      minipLink: true
    });

    // 缓存实例配置，避免重复调用
    const trackerVds = this.growingIO.dataStore.getTrackerVds(trackingId);
    const isStrict = !!trackerVds?.embeddedAdapter?.strict;
    const ignoreFields = getEmbeddedIgnoreFields(trackerVds);
    // 原始参数用于打通匹配和跨页归属；只有可继承的参数能写入 Web 配置与身份。
    const inheritedParams = { ...gqs };
    keys(EMBEDDED_ENUMS).forEach((key: string) => {
      if (includes(ignoreFields, EMBEDDED_ENUMS[key]))
        unset(inheritedParams, key);
    });
    // 空设备参数不能覆盖有效 Web 设备，事件与 AB 共用同一回退。
    if (!isString(inheritedParams.giou) || !inheritedParams.giou)
      unset(inheritedParams, 'giou');
    this.embeddedIdentity = this.getEmbeddedIdentity(gqs);
    this.embeddedNewDeviceValue = this.resolveEmbeddedNewDevice(
      gqs,
      this.getSessionExpires(trackerVds)
    );
    const { eventContextBuilderInst } = this.growingIO.dataStore;

    this.initCircleIfNeeded(trackingId, inheritedParams);
    this.preserveWebIdentityStorage(
      trackingId,
      trackerVds,
      inheritedParams,
      isStrict,
      ignoreFields
    );
    this.syncVdsConfig(trackerVds, inheritedParams);
    this.growingIO.dataStore.updateVdsConfig(trackingId, trackerVds);
    this.syncUserInfo(trackingId, inheritedParams, isStrict, ignoreFields);
    this.embeddedABIdentity = {
      deviceId: isString(inheritedParams.giou)
        ? (inheritedParams.giou as string)
        : isStrict || includes(ignoreFields, 'deviceId')
          ? undefined
          : (this.growingIO.userStore.getUid?.() ?? ''),
      userId: isString(inheritedParams.giocs1)
        ? (inheritedParams.giocs1 as string)
        : isStrict || includes(ignoreFields, 'userId')
          ? undefined
          : (this.growingIO.userStore.getUserId?.(trackingId) ?? ''),
      // 小程序传入的 key 与普通事件保持一致，不受 Web idMapping 开关覆盖。
      userKey: isString(inheritedParams.giouserkey)
        ? (inheritedParams.giouserkey as string)
        : isStrict || includes(ignoreFields, 'userKey')
          ? undefined
          : trackerVds.idMapping
            ? (this.growingIO.userStore.getUserKey?.(trackingId) ?? '')
            : ''
    };
    this.setupSessionRefresh(trackingId, inheritedParams, trackerVds, isStrict);
    this.syncCommonDimensions(eventContextBuilderInst, inheritedParams);
    if (!isStrict) {
      // 缺省登录身份也要显式冻结为空值，不能在其他页登录后从共享存储填回。
      eventContextBuilderInst.minpExtraParams = {
        ...eventContextBuilderInst.minpExtraParams,
        ...this.embeddedABIdentity
      };
    }
    this.overrideInstanceMethods(
      trackingId,
      has(inheritedParams, 'giodatacollect')
    );
  };

  /**
   * 判断一个参数对象是否包含 GIO 打通所需的必要参数
   * @param qs 参数对象
   * @returns 是否同时包含 gioprojectid 和 giodatasourceid
   */
  private hasGIOParams = (qs: any): boolean => {
    if (!qs || typeof qs !== 'object') return false;
    return has(qs, 'gioprojectid') && has(qs, 'giodatasourceid');
  };

  /**
   * 从 URL 或 Hash 中解析 GIO 参数
   * @param hashtag 是否启用 Hash 模式
   * @returns 解析后的 GIO 参数对象
   */
  getGQS = (hashtag: boolean) => {
    const search = window.location.search;
    const hash = window.location.hash;
    const hashSearch = hashtag ? hash.substring(hash.indexOf('?') + 1) : '';
    const localQs = this.storage.getItem(LOCAL_KEY);
    const ctSearchQs = niceTry(() => queryParse(search)) || {};
    const ctHashQs = niceTry(() => queryParse(hashSearch)) || {};
    // gio打通数据优先级：url参数 > hash参数 > cookie参数
    let ctOrigQs = {};
    if (this.hasGIOParams(ctSearchQs)) {
      ctOrigQs = ctSearchQs;
      this.qsFrom = 'search';
    } else if (this.hasGIOParams(ctHashQs)) {
      ctOrigQs = ctHashQs;
      this.qsFrom = 'hash';
    } else if (this.hasGIOParams(localQs)) {
      ctOrigQs = localQs;
      this.qsFrom = 'local';
    } else {
      this.qsFrom = 'none';
      return {};
    }
    const gqs: GQS = {};
    const customerQs: CustomerQS = {};
    keys(ctOrigQs).forEach((k: string) => {
      const lk = k.toLowerCase();
      // 根据定义获取合法的gio参数
      if (includes(GQS_KEY, lk)) {
        // 安全解码，防止非法编码抛出异常
        let val: string;
        try {
          val = decodeURIComponent(ctOrigQs[k]);
        } catch (_e) {
          val = ctOrigQs[k];
        }
        if (!includes(['', 'undefined', 'null', undefined, null], val)) {
          // 只有开关和首访参数是布尔值；身份等字符串不能按字面量转换。
          const isBooleanParam = includes(
            ['giodatacollect', 'gionewdevice'],
            lk
          );
          gqs[lk] =
            isBooleanParam && includes(['true', 'TRUE', true], val)
              ? true
              : isBooleanParam && includes(['false', 'FALSE', false], val)
                ? false
                : val;
        } else {
          gqs[lk] = '';
        }
      } else {
        // 获取客户业务参数
        customerQs[k] = ctOrigQs[k];
      }
    });
    this.gqs = gqs;
    this.customerQs = customerQs;
    return { ...this.gqs, ...this.customerQs };
  };

  /**
   * 重写 URL，移除 GIO 参数
   * @description 如果配置了 rewriteQuery，则在提取完参数后清理 URL
   */
  gioURLRewrite = () => {
    // hashtag是全局配置，不跟trackingId强绑定
    const { hashtag } = this.growingIO.vdsConfig;
    let nSearch = window.location.search;
    let nHash = window.location.hash;
    let paramProcessed = false;
    // 如果是从url参数中获取的gio参数，移除gio参数后直接拼地址参数
    if (this.qsFrom === 'search') {
      nSearch = queryStringify(this.customerQs, true);
      paramProcessed = true;
    }
    // 如果是从hash参数中获取的gio参数，移除gio参数后重写hash拼地址
    if (hashtag && this.qsFrom === 'hash') {
      nHash = `${nHash.split('?')[0]}${queryStringify(this.customerQs, true)}`;
      paramProcessed = true;
    }
    // 如果是从url和hash中解析出参数则重定向地址
    if (paramProcessed) {
      const URL = `${window.location.pathname}${nSearch || ''}${nHash || ''}`;
      window.history.replaceState(null, document.title, URL);
    }
  };

  // --------------------- 以下内容是对新版小程序圈选的支持 ---------------------

  /**
   * 获取圈选服务器地址配置
   * @param vdsConfig 当前实例配置
   * @returns 圈选服务器地址
   */
  private getCircleServerUrl = (
    vdsConfig: any
  ): string | Record<string, string> => {
    const embeddedAdapter = vdsConfig?.embeddedAdapter || {};
    const pluginUrl = this.options?.circleServerUrl;
    const embeddedUrl = embeddedAdapter.circleServerUrl;

    // 优先级：embeddedAdapter > plugin.options
    if (embeddedUrl !== undefined && embeddedUrl !== '') {
      return embeddedUrl;
    }
    if (pluginUrl !== undefined && pluginUrl !== '') {
      return pluginUrl;
    }
    return '';
  };

  /**
   * 初始化圈选上报地址
   * @param circleServerUrl 圈选服务器地址配置
   * @param useEmbeddedInherit 当前打通的实例 ID
   */
  private initCircleUrls = (
    circleServerUrl: string | Record<string, string>,
    useEmbeddedInherit: string
  ) => {
    this.circleServerUrl = {};

    if (!circleServerUrl) {
      this.generateUrl(useEmbeddedInherit, 'portal.growingio.com');
      return;
    }

    if (isString(circleServerUrl)) {
      this.generateUrl(useEmbeddedInherit, circleServerUrl as string);
    } else if (isObject(circleServerUrl)) {
      keys(circleServerUrl).forEach((trackingId: string) => {
        this.generateUrl(
          trackingId,
          (circleServerUrl as Record<string, string>)[trackingId]
        );
      });
    }
  };

  /**
   * 初始化小程序圈选
   * @param circleRoomId 圈选房间 ID
   * @param vdsConfig 当前实例配置
   */
  circleInit = (circleRoomId: string, vdsConfig: any) => {
    if (this.destroyed) return;
    this.cancelCircleRequests();
    consoleText('您已进入小程序圈选模式', 'info');
    this.circleRoomId = circleRoomId;
    this.circleOpen = true;

    const { useEmbeddedInherit } = this.growingIO;
    const circleServerUrl = this.getCircleServerUrl(vdsConfig);
    this.initCircleUrls(circleServerUrl, useEmbeddedInherit);

    if (!this.circleListenerAdded) {
      this.growingIO.emitter.on(
        EMIT_MSG.ON_COMMIT_REQUEST,
        this.circleCommitFn
      );
      this.circleListenerAdded = true;
    }
  };

  private detachCircleCommitListener = () => {
    if (this.circleListenerAdded) {
      this.growingIO.emitter.off(
        EMIT_MSG.ON_COMMIT_REQUEST,
        this.circleCommitFn
      );
      this.circleListenerAdded = false;
    }
  };

  /**
   * 生成圈选数据上报接口地址
   * @param trackingId Tracking ID
   * @param circleServerUrl 圈选服务器地址
   */
  generateUrl = (trackingId: string, circleServerUrl: string) => {
    if (!startsWith(circleServerUrl, 'http')) {
      this.circleServerUrl[trackingId] =
        `https://${circleServerUrl}/api/public/circle-room/collect?roomId=${this.circleRoomId}`;
    } else {
      this.circleServerUrl[trackingId] =
        `${circleServerUrl}/api/public/circle-room/collect?roomId=${this.circleRoomId}`;
    }
  };

  /**
   * 数据提交后的回调，用于转发数据到圈选服务器
   * @param param0 请求数据对象
   */
  circleCommitFn = ({
    eventData,
    trackingId
  }: {
    eventData: any;
    trackingId: string;
  }) => {
    const event = { ...eventData };
    if (this.circleOpen) {
      // 过滤仅打通实例的非CUSTOM事件可以圈选
      // 圈选模式下，仅上报当前打通实例的非自定义事件（CUSTOM通常由用户手动触发，不属于自动圈选范畴）
      if (
        event.eventType !== 'CUSTOM' &&
        trackingId === this.growingIO.useEmbeddedInherit
      ) {
        unset(event, ['requestType', 'trackingId', 'requestId']);
        this.circleRequest(trackingId, event);
      }
    }
  };

  /**
   * 发起圈选数据上报请求
   * @param trackingId Tracking ID
   * @param requestData 请求数据
   */
  circleRequest = (trackingId: string, requestData: any) => {
    const circleUrl = this.circleServerUrl[trackingId];
    if (this.destroyed || !this.circleOpen || !circleUrl) {
      return;
    }

    const requestBody = JSON.stringify([requestData]);
    const generation = this.circleGeneration;
    const isCurrent = () =>
      !this.destroyed &&
      this.circleOpen &&
      this.circleGeneration === generation;
    const rawTimeout = this.options?.requestTimeout;
    const requestTimeout =
      typeof rawTimeout === 'number' &&
      !isNaN(rawTimeout) &&
      rawTimeout > 0 &&
      rawTimeout !== Infinity
        ? rawTimeout
        : 5000;
    if (typeof fetch === 'function') {
      const send = (keepalive: boolean) => {
        if (!isCurrent()) return;
        const controller =
          typeof AbortController === 'function'
            ? new AbortController()
            : undefined;
        let finished = false;
        let timeout: number;
        const finish = () => {
          if (finished) return false;
          finished = true;
          window.clearTimeout(timeout);
          this.activeCircleRequests = this.activeCircleRequests.filter(
            (active) => active !== cancel
          );
          return true;
        };
        const cancel = () => {
          if (finish()) niceTry(() => controller?.abort());
        };
        const fail = () => {
          if (finish() && keepalive && isCurrent()) {
            // keepalive 请求共享 64KB 的在途额度，超额时浏览器直接拒绝而不会发出请求；
            // 此时改用普通请求再发一次。超时和生命周期取消已结算，不进入重试。
            send(false);
          }
        };
        this.activeCircleRequests.push(cancel);
        timeout = window.setTimeout(cancel, requestTimeout);
        try {
          Promise.resolve(
            fetch(circleUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json;charset=UTF-8' },
              body: requestBody,
              keepalive,
              ...(controller ? { signal: controller.signal } : {})
            })
          ).then(
            (response) =>
              Promise.resolve()
                .then(() => response.text())
                .then(
                  (responseText) => {
                    if (finish() && isCurrent()) {
                      niceTry(() => this.handleCircleResponse(responseText));
                    }
                  },
                  () => {
                    // 收到响应后服务端可能已接受事件，响应体读取失败不能重复 POST。
                    finish();
                  }
                ),
            fail
          );
        } catch (_error) {
          fail();
        }
      };
      // keepalive 让页面跳转后仍可完成小体积 PAGE 请求；浏览器按 UTF-8 字节数限制请求体。
      send(getUtf8ByteLength(requestBody) <= KEEPALIVE_BODY_LIMIT);
      return;
    }

    const xhr = new XMLHttpRequest();
    let finished = false;
    const finish = () => {
      if (finished) return false;
      finished = true;
      this.activeCircleRequests = this.activeCircleRequests.filter(
        (active) => active !== cancel
      );
      xhr.onload = xhr.ontimeout = xhr.onerror = xhr.onabort = null;
      return true;
    };
    const cancel = () => {
      if (finish()) niceTry(() => xhr.abort());
    };
    this.activeCircleRequests.push(cancel);
    xhr.onload = ({ target }: any) => {
      if (finish() && isCurrent()) {
        this.handleCircleResponse(target.responseText);
      }
    };
    // XHR 在页面切换时可能被浏览器中止；该类传输失败不应关闭圈选状态。
    xhr.ontimeout =
      xhr.onerror =
      xhr.onabort =
        () => {
          finish();
        };
    try {
      xhr.open('POST', circleUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.timeout = requestTimeout;
      xhr.send(requestBody);
    } catch (_error) {
      cancel();
    }
  };

  private cancelCircleRequests = () => {
    this.circleGeneration += 1;
    this.activeCircleRequests.slice().forEach((cancel) => cancel());
  };

  private handleCircleResponse = (responseText: string) => {
    const data = niceTry(() => JSON.parse(responseText));
    // 仅服务端明确返回业务拒绝时结束圈选。空响应、204 和网络失败都可由后续事件重试。
    if (data?.success !== false) {
      return;
    }

    this.circleClose();
    const circleErrorkey = this.storage.getItem(CIRCLE_ERROR_KEY);
    if (circleErrorkey !== this.circleRoomId) {
      this.storage.setItem(CIRCLE_ERROR_KEY, this.circleRoomId);
      alert('H5：' + (data.message || '圈选请求失败，请重试!'));
    }
  };

  // 圈选结束
  circleClose = () => {
    this.cancelCircleRequests();
    this.circleOpen = false;
    this.circleServerUrl = {};
    this.detachCircleCommitListener();
    // 断开圈选时删除存储中的圈选字段，防止刷新页面重新进入圈选状态
    const localQs = this.storage.getItem(LOCAL_KEY) || {};
    if (localQs.giocircleroomid === this.circleRoomId) {
      unset(localQs, ['giocircleserverurl', 'giocircleroomid']);
      this.storage.setItem(LOCAL_KEY, localQs);
    }
  };
}
