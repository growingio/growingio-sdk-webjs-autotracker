/**
 * 名称：内嵌页适配插件
 * 用途：用于打通小程序内嵌页。
 */
import { GrowingIOType } from '@/types/internal/growingIO';
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
  giou: 'uid',
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
  'gioscreenwidth'
];
const USER_GQS = ['giocs1', 'gios', 'giou', 'giouserkey'];
const GQS_KEY = [
  'gioappid',
  'gioprojectid',
  'giodatacollect',
  'giocircleroomid',
  ...USER_GQS,
  ...COM_EXTRA
];
// 在存储中的gioinfo相关参数
const LOCAL_KEY = 'gdp_query_string';
// 与小程序打通时，存储的圈选状态
const CIRCLE_ERROR_KEY = 'gdp_circle_error';

export default class GioEmbeddedAdapter {
  public pluginVersion = '__PLUGIN_VERSION__';
  public options: Record<string, any> = {};
  public searchQs: GQS = {};
  public hashQs: GQS = {};
  public gqs: GQS = {};
  public customerQs: CustomerQS = {};
  public qsFrom: 'search' | 'hash' | 'local' | 'none' = 'search';
  private storage: EmbeddedStorageType;
  private circleOpen = false;
  private circleServerUrl: Record<string, string> = {};
  private circleRoomId: string | undefined;

  constructor(public growingIO: GrowingIOType) {
    this.storage = new LocalStorage();
    this.growingIO.emitter.on(
      EMIT_MSG.OPTION_INITIALIZED,
      ({ trackingId, vdsConfig }: any) => {
        this.onOptionsInit(trackingId, vdsConfig);
      }
    );
  }

  // 打通匹配和打通后的处理逻辑
  onOptionsInit = (trackingId: string, vdsConfig: OriginOptions) => {
    const { projectId, appId } = vdsConfig;
    // 子实例时要取主实例的hashtag值
    const hashtag =
      trackingId === this.growingIO.trackingId
        ? vdsConfig.hashtag
        : this.growingIO.vdsConfig.hashtag;
    const gqs = this.getGQS(hashtag);
    // 如果从url或hash中解析出gio参数，则在存储中存打通数据，防止刷新或多实例时丢失
    if (includes(['search', 'hash'], this.qsFrom) && !isEmpty(gqs)) {
      this.storage.setItem(LOCAL_KEY, gqs);
    }
    // 没有已打通的实例存在且项目id和小程序appId一致时才允许打通数据
    if (
      !this.growingIO.useEmbeddedInherit &&
      this.qsFrom !== 'none' &&
      gqs.gioprojectid === projectId &&
      gqs.gioappid === appId
    ) {
      // 标记打通的实例
      this.growingIO.useEmbeddedInherit = trackingId;
      this.growingIO.dataStore.updateVdsConfig(trackingId, {
        minipLink: true
      });
      // 如果参数中存在圈选参数，则初始化圈选
      if (gqs.giocircleroomid) {
        this.circleInit(gqs.giocircleroomid as string, vdsConfig);
      } else {
        // 如果没有圈选参数，则从存储中移除圈选状态
        this.storage.removeItem(CIRCLE_ERROR_KEY);
      }
      // 同步主要配置,防止web的值与小程序值冲突导致发数逻辑错误
      const trackerVds = this.growingIO.dataStore.getTrackerVds(trackingId);
      VDS_EXTRA.forEach((k: string) => {
        if (has(gqs, k)) {
          if (k === 'giodatacollect') {
            trackerVds.dataCollect = includes(
              ['true', true],
              gqs.giodatacollect
            );
          } else {
            const embedKey = EMBEDDED_ENUMS[k];
            // 保留打通字段在未打通之前的值，以方便使用embeddedIgnore配置项时取原来的值
            if (includes(['domain', 'platform'], embedKey)) {
              if (!trackerVds.originValues) {
                trackerVds.originValues = {};
              }
              trackerVds.originValues[embedKey] = trackerVds[embedKey];
            }
            trackerVds[embedKey] = gqs[k];
          }
        }
      });
      this.growingIO.dataStore.updateVdsConfig(trackingId, trackerVds);
      // 打通后等初始化完成同步信息
      const {
        userStore,
        dataStore: { eventContextBuilderInst }
      } = this.growingIO;
      // 同步用户信息
      userStore.setUid(gqs.giou as string);
      userStore.setSessionId(trackingId, gqs.gios as string);
      userStore.setUserId(trackingId, (gqs.giocs1 ?? '') as string);
      userStore.setUserKey(trackingId, (gqs.giouserkey ?? '') as string);
      // 以sessionExpires*0.8的时长刷新一次sessionId的有效时间，保证打通时不会因为超时变session
      const fn = () => {
        userStore.setSessionId(trackingId, gqs.gios as string);
      };
      let t = window.setInterval(
        fn,
        vdsConfig.sessionExpires * 0.8 * 60 * 1000
      );
      // 添加移除监听，防止内存溢出
      window.onbeforeunload = () => {
        window.clearInterval(t);
        t = undefined;
      };
      // 打通后保存小程序的通用维度参数供事件构建
      COM_EXTRA.forEach((k: string) => {
        if (has(gqs, k)) {
          eventContextBuilderInst.minpExtraParams[EMBEDDED_ENUMS[k]] = gqs[k];
        }
      });
      // 打通后该实例不允许再修改用户id
      const originSetUserId = this.growingIO.setUserId;
      this.growingIO.setUserId = function (...args) {
        if (args[0] !== trackingId) {
          return originSetUserId.apply(this, args);
        }
      };
      const originClearUserId = this.growingIO.clearUserId;
      this.growingIO.clearUserId = function (...args) {
        if (args[0] !== trackingId) {
          return originClearUserId.apply(this, args);
        }
      };
      // 打通后该实例不允许再修改dataCollect和配置项（没有giodatacollect字段视为非3.8小程序SDK的来源，要允许客户自己在web里修改开关）
      if (has(gqs, 'giodatacollect')) {
        const originSetOption = this.growingIO.setOption;
        this.growingIO.setOption = function (...args) {
          if (args[0] !== trackingId) {
            return originSetOption.apply(this, args);
          }
        };
      }
    }
    const mainVds = this.growingIO.dataStore.getTrackerVds(
      this.growingIO.trackingId
    );
    if (mainVds.rewriteQuery !== false) {
      // 地址栏重写
      this.gioURLRewrite();
    }
    // 打通的可能是后初始化的实例，所以在重写完成后要重新解析一次页面信息，防止把gio参数带进事件
    this.growingIO.dataStore.currentPage.parsePage();
  };

  // 获取打通参数
  getGQS = (hashtag: boolean) => {
    const search = window.location.search;
    const hash = window.location.hash;
    const hashSearch = hashtag ? hash.substring(hash.indexOf('?') + 1) : '';
    const localQs = this.storage.getItem(LOCAL_KEY);
    const ctSearchQs = queryParse(search);
    const ctHashQs = queryParse(hashSearch);
    // gio打通数据优先级url参数>hash参数>cookie参数
    // 解析出来的参数对象
    let ctOrigQs = {};
    if (has(ctSearchQs, 'gioprojectid')) {
      ctOrigQs = ctSearchQs;
      this.qsFrom = 'search';
    } else if (has(ctHashQs, 'gioprojectid')) {
      ctOrigQs = ctHashQs;
      this.qsFrom = 'hash';
    } else if (has(localQs, 'gioprojectid')) {
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
        const val = decodeURIComponent(ctOrigQs[k]);
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

  // 重写地址
  gioURLRewrite = () => {
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

  // 初始化小程序圈选监听
  circleInit = (circleRoomId: string, vdsConfig: any) => {
    consoleText('您已进入小程序圈选模式', 'info');
    this.circleRoomId = circleRoomId;
    // 标记圈选状态，防止重复初始化
    this.circleOpen = true;
    // 处理圈选上报地址
    const { useEmbeddedInherit } = this.growingIO;
    this.circleServerUrl = {};
    // 插件配置和vds配置都可以指定circleServerUrl，插件配置优先级最高
    const circleServerUrl =
      vdsConfig?.embeddedAdapter?.circleServerUrl ||
      this.options?.circleServerUrl;
    if (circleServerUrl) {
      // 自定义圈选url时，使用自定义url（应对op场景）可选单独字符串和对象两种形式
      if (isString(circleServerUrl)) {
        this.generateUrl(useEmbeddedInherit, circleServerUrl);
      } else if (isObject(circleServerUrl)) {
        keys(circleServerUrl).forEach((trackingId: string) => {
          this.generateUrl(trackingId, circleServerUrl[trackingId]);
        });
      }
    } else {
      // 不填写自定义url时，使用默认url
      this.generateUrl(useEmbeddedInherit, 'portal.growingio.com');
    }
    // 添加事件发送监听，用于发送圈选事件
    this.growingIO.emitter.on(EMIT_MSG.ON_SEND_AFTER, this.collectorSendFn);
  };

  // 生成数据接口地址
  generateUrl = (trackingId: string, circleServerUrl: string) => {
    if (!startsWith(circleServerUrl, 'http')) {
      this.circleServerUrl[trackingId] =
        `https://${circleServerUrl}/api/public/circle-room/collect?roomId=${this.circleRoomId}`;
    } else {
      this.circleServerUrl[trackingId] =
        `${circleServerUrl}/api/public/circle-room/collect?roomId=${this.circleRoomId}`;
    }
  };

  // 数据采集发送监听回调
  collectorSendFn = ({ requestData, trackingId }) => {
    const event = { ...requestData };
    if (this.circleOpen) {
      // 过滤仅打通实例的非CUSTOM事件可以圈选
      if (
        event.eventType !== 'CUSTOM' &&
        trackingId === this.growingIO.useEmbeddedInherit
      ) {
        unset(event, ['requestType', 'trackingId', 'requestId']);
        this.circleRequest(trackingId, event);
      }
    }
  };

  // 发起圈选请求
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
    this.growingIO.emitter.off(EMIT_MSG.ON_SEND_AFTER, this.collectorSendFn);
    // 断开圈选时删除存储中的圈选字段，防止刷新页面重新进入圈选状态
    const localQs = this.storage.getItem(LOCAL_KEY);
    unset(localQs, ['giocircleserverurl', 'giocircleroomid']);
    this.storage.setItem(LOCAL_KEY, localQs);
  };
}
