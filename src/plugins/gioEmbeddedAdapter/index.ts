/**
 * 名称：内嵌页适配插件
 * 用途：用于打通小程序内嵌页。
 */
import { GrowingIOType } from '@/types/growingIO';
import { has, includes, isEmpty, keys } from '@/utils/glodash';
import { OriginOptions } from '@/types/dataStore';
import EMIT_MSG from '@/constants/emitMsg';
import LocalStorage from '@/core/storage/local';
import qs from 'querystringify';

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
  gioscreenwidth: 'screenWidth'
};
const VDS_EXTRA = [
  'gioprojectid',
  'giodatacollect',
  'giodatasourceid',
  'gioplatform'
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
const LOCAL_KEY = 'gdp_query_string';

export default class GioEmbeddedAdapter {
  public pluginVersion: string;
  // search中的参数对象
  public searchQs: any;
  // hash中的参数对象
  public hashQs: any;
  // gio参数
  public gqs: any;
  // 客户参数
  public customerqs: any;
  // gio参数来源
  public qsFrom: 'search' | 'hash' | 'local' | 'none';
  // 存储gio参数的存储对象
  private storage: any;
  constructor(public growingIO: GrowingIOType) {
    this.pluginVersion = '__PLUGIN_VERSION__';
    this.gqs = {};
    this.customerqs = {};
    this.qsFrom = 'search';
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
      userStore.setUid(gqs.giou);
      userStore.setSessionId(trackingId, gqs.gios);
      userStore.setUserId(trackingId, gqs.giocs1 ?? '');
      userStore.setUserKey(trackingId, gqs.giouserkey ?? '');
      // 以sessionExpires*0.8的时长刷新一次sessionId的有效时间，保证打通时不会因为超时变session
      const fn = () => {
        userStore.setSessionId(trackingId, gqs.gios);
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
    // 地址栏重写
    this.gioURLRewrite();
    // 打通的可能是后初始化的实例，所以在重写完成后要重新解析一次页面信息，防止把gio参数带进事件
    this.growingIO.dataStore.currentPage.parsePage();
  };

  // 获取打通参数
  getGQS = (hashtag: boolean) => {
    const search = window.location.search;
    const hash = window.location.hash;
    const hashSearch = hashtag ? hash.substring(hash.indexOf('?') + 1) : '';
    const localData = this.storage.getItem(LOCAL_KEY);
    // qs.parse会自动把参数中的特殊字符给decode
    const searchQs = qs.parse(search);
    const hashQs = qs.parse(hashSearch);
    const localQs = localData;
    // gio打通数据优先级url参数>hash参数>cookie参数
    // 解析出来的参数对象
    let ogqs = {};
    if (has(searchQs, 'gioprojectid')) {
      ogqs = searchQs;
      this.qsFrom = 'search';
    } else if (has(hashQs, 'gioprojectid')) {
      ogqs = hashQs;
      this.qsFrom = 'hash';
    } else if (has(localQs, 'gioprojectid')) {
      ogqs = localQs;
      this.qsFrom = 'local';
    } else {
      this.qsFrom = 'none';
      return {};
    }
    const gqs: any = {}; // gio参数
    const customerqs: any = {}; // 客户业务参数
    const GQS_KEY = [
      'gioappid',
      'gioprojectid',
      'giodatacollect',
      ...USER_GQS,
      ...COM_EXTRA
    ];
    keys(ogqs).forEach((k: string) => {
      const lk = k.toLowerCase();
      // 根据定义获取合法的gio参数
      if (includes(GQS_KEY, lk)) {
        // 过滤空值
        if (!includes(['', 'undefined', 'null', undefined, null], ogqs[k])) {
          gqs[lk] = ogqs[k];
          // 转换布尔值
          if (includes(['true', 'TRUE', true], ogqs[k])) {
            gqs[lk] = true;
          }
          if (includes(['false', 'FALSE', false], ogqs[k])) {
            gqs[lk] = false;
          }
        } else {
          gqs[lk] = '';
        }
      } else {
        // 获取客户业务参数
        customerqs[k] = ogqs[k];
      }
    });
    this.gqs = gqs;
    this.customerqs = customerqs;
    return gqs;
  };

  // 重写地址(回拼参数的时候用qs.stringify，把参数中的特殊字符重新encode回去)
  gioURLRewrite = () => {
    const { hashtag } = this.growingIO.vdsConfig;
    let nSearch = window.location.search;
    let nHash = window.location.hash;
    let paramProcessed = false;
    // 如果是从url参数中获取的gio参数，移除gio参数后直接拼地址参数
    if (this.qsFrom === 'search') {
      nSearch = qs.stringify(this.customerqs, true);
      paramProcessed = true;
    }
    // 如果是从hash参数中获取的gio参数，移除gio参数后重写hash拼地址
    if (hashtag && this.qsFrom === 'hash') {
      nHash = `${nHash.split('?')[0]}${qs.stringify(this.customerqs, true)}`;
      paramProcessed = true;
    }
    // 如果是从url和hash中解析出参数则重定向地址
    if (paramProcessed) {
      const URL = `${window.location.pathname}${nSearch || ''}${nHash || ''}`;
      window.history.replaceState(null, document.title, URL);
    }
  };
}
