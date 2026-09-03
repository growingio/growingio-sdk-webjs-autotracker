/**
 * 名称：内嵌页适配插件
 * 用途：用于打通小程序内嵌页。
 */
import { GrowingIOType } from '@/types/internal/growingIO';
import { IGNORE_PARAMS } from '@/constants/config';
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
import { OriginOptions } from '@/types/internal/dataStore';
import {
  consoleText,
  niceCallback,
  niceTry,
  queryParse,
  queryStringify
} from '@/utils/tools';
import EMIT_MSG from '@/constants/emitMsg';
import LocalStorage from '@/core/storage/local';
import { GQS, CustomerQS, EmbeddedStorageType } from './types';

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
  ...COM_EXTRA
];
// 在存储中的gioinfo相关参数
const LOCAL_KEY = 'gdp_query_string';
// 与小程序打通时，存储的圈选状态
const CIRCLE_ERROR_KEY = 'gdp_circle_error';

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
  private collectorListenerAdded = false;

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
    this.cleanupSessionTimer();
    this.restoreInstanceMethods();
    this.detachCollectorSendListener();
    window.removeEventListener('beforeunload', this.cleanupSessionTimer);
    this.growingIO.emitter?.off(
      EMIT_MSG.OPTION_INITIALIZED,
      this.initEmbeddedBridge
    );
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
      this.storage.setItem(LOCAL_KEY, gqs);
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
   * - ignoreFields: `vdsConfig.embeddedAdapter` > `plugin.options` > 默认
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
      defaults.ignoreFields,
      Array.isArray
    );
    const ignoreFields = rawIgnoreFields.filter((o: string) =>
      includes(IGNORE_PARAMS, o)
    );

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
  private syncUserInfo = (trackingId: string, gqs: GQS, isStrict: boolean) => {
    if (isStrict) return;

    const { userStore } = this.growingIO;
    if (isString(gqs.giou)) {
      userStore.setUid(gqs.giou as string);
    }
    if (isString(gqs.gios)) {
      userStore.setSessionId(trackingId, gqs.gios as string);
    }
    userStore.setUserId(
      trackingId,
      (isString(gqs.giocs1) ? gqs.giocs1 : '') as string
    );
    userStore.setUserKey(
      trackingId,
      (isString(gqs.giouserkey) ? gqs.giouserkey : '') as string
    );
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
    const { userStore } = this.growingIO;
    const sessionIdValue =
      !isStrict && isString(gqs.gios)
        ? (gqs.gios as string)
        : userStore.getSessionId(trackingId);

    if (this.sessionRefreshTimer) {
      window.clearInterval(this.sessionRefreshTimer);
    }

    // 防止 NaN 和无效值
    const rawSessionExpires = trackerVds?.sessionExpires;
    const sessionExpires =
      typeof rawSessionExpires === 'number' &&
      !isNaN(rawSessionExpires) &&
      rawSessionExpires > 0
        ? rawSessionExpires
        : 30;

    this.sessionRefreshTimer = window.setInterval(
      () => userStore.setSessionId(trackingId, sessionIdValue),
      sessionExpires * 0.8 * 60 * 1000
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
    const { eventContextBuilderInst } = this.growingIO.dataStore;

    this.initCircleIfNeeded(trackingId, gqs);
    this.syncVdsConfig(trackerVds, gqs);
    this.growingIO.dataStore.updateVdsConfig(trackingId, trackerVds);
    this.syncUserInfo(trackingId, gqs, isStrict);
    this.setupSessionRefresh(trackingId, gqs, trackerVds, isStrict);
    this.syncCommonDimensions(eventContextBuilderInst, gqs);
    this.overrideInstanceMethods(trackingId, has(gqs, 'giodatacollect'));
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
          gqs[lk] = includes(['true', 'TRUE', true], val)
            ? true
            : includes(['false', 'FALSE', false], val)
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
    consoleText('您已进入小程序圈选模式', 'info');
    this.circleRoomId = circleRoomId;
    this.circleOpen = true;

    const { useEmbeddedInherit } = this.growingIO;
    const circleServerUrl = this.getCircleServerUrl(vdsConfig);
    this.initCircleUrls(circleServerUrl, useEmbeddedInherit);

    if (!this.collectorListenerAdded) {
      this.growingIO.emitter.on(EMIT_MSG.ON_SEND_AFTER, this.collectorSendFn);
      this.collectorListenerAdded = true;
    }
  };

  private detachCollectorSendListener = () => {
    if (this.collectorListenerAdded) {
      this.growingIO.emitter.off(EMIT_MSG.ON_SEND_AFTER, this.collectorSendFn);
      this.collectorListenerAdded = false;
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
   * 数据采集发送后的回调，用于转发数据到圈选服务器
   * @param param0 请求数据对象
   */
  collectorSendFn = ({
    requestData,
    trackingId
  }: {
    requestData: any;
    trackingId: string;
  }) => {
    const event = { ...requestData };
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
    const xhr = new XMLHttpRequest();
    xhr.open('POST', this.circleServerUrl[trackingId], true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.onload =
      xhr.ontimeout =
      xhr.onerror =
      xhr.onabort =
        ({ target }: any) => {
          const statusCode = target.status;
          const data = niceTry(() => JSON.parse(target.responseText));
          if (!includes([200, 204], statusCode) || !data?.success) {
            this.circleClose();
            // 标识h5是否已经弹过圈选错误的提示框，避免重复弹框
            const circleErrorkey = this.storage.getItem(CIRCLE_ERROR_KEY);
            if (circleErrorkey !== this.circleRoomId) {
              this.storage.setItem(CIRCLE_ERROR_KEY, this.circleRoomId);
              alert(
                'H5：' +
                  (data?.message ||
                    data ||
                    target.responseText ||
                    '圈选请求失败，请重试!')
              );
            }
          }
        };
    xhr.timeout = this.options?.requestTimeout ?? 5000;
    xhr.send(JSON.stringify([requestData]));
  };

  // 圈选结束
  circleClose = () => {
    this.circleOpen = false;
    this.circleServerUrl = {};
    this.detachCollectorSendListener();
    // 断开圈选时删除存储中的圈选字段，防止刷新页面重新进入圈选状态
    const localQs = this.storage.getItem(LOCAL_KEY) || {};
    unset(localQs, ['giocircleserverurl', 'giocircleroomid']);
    this.storage.setItem(LOCAL_KEY, localQs);
  };
}
