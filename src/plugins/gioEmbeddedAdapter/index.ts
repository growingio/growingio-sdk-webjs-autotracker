/**
 * 名称：内嵌页适配插件
 * 用途：用于打通小程序内嵌页。
 */
import { GrowingIOType } from '@/types/growingIO';
import { has, includes, isEmpty, keys } from '@/utils/glodash';
import EMIT_MSG from '@/constants/emitMsg';
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

const gioSearchKey = 'gio_search_cookie_gioenc';
export default class GioEmbeddedAdapter {
  // search中的参数对象
  public searchQs: any;
  // hash中的参数对象
  public hashQs: any;
  // gio参数
  public gqs: any;
  // 非gio参数
  public ngqs: any;
  // gio参数来源
  public qsFrom: 'search' | 'hash' | 'cookie' | 'none';
  constructor(public growingIO: GrowingIOType) {
    this.gqs = {};
    this.ngqs = {};
    this.qsFrom = 'search';
    this.growingIO.emitter.on(EMIT_MSG.OPTION_INITIALIZED, () => {
      this.growingIO.useEmbeddedInherit = this.main();
    });
  }

  main = () => {
    const { projectId, appId } = this.growingIO.vdsConfig;
    const gqs = this.getGQS();
    let useEmbeddedInherit = false;
    // 项目id和小程序appId一致时才允许打通数据
    if (
      this.qsFrom !== 'none' &&
      gqs.gioprojectid === projectId &&
      gqs.gioappid === appId
    ) {
      // 在存储中存打通数据，防止刷新后丢失
      if (!isEmpty(gqs)) {
        this.growingIO.storage.setItem(gioSearchKey, qs.stringify(gqs));
      } else {
        this.growingIO.storage.removeItem(gioSearchKey);
      }

      // 同步主要配置
      if (has(gqs, 'giodatacollect')) {
        this.growingIO.vdsConfig.dataCollect = includes(
          ['true', true],
          gqs.giodatacollect
        );
      }
      // 打通后等初始化完成同步信息
      this.growingIO.emitter?.on(EMIT_MSG.SDK_INITIALIZED, () => {
        const {
          userStore,
          vdsConfig: { sessionExpires },
          dataStore: { eventContextBuilderInst }
        } = this.growingIO;
        // 同步用户信息
        USER_GQS.forEach((k: string) => {
          userStore[EMBEDDED_ENUMS[k]] = gqs[k] ?? '';
        });
        // 以sessionExpires*0.8的时长刷新一次sessionId的有效时间，保证打通时不会因为超时s变session
        window.setInterval(() => {
          userStore.sessionId = gqs.gios;
        }, sessionExpires * 0.8 * 60 * 1000);

        // 打通后保存小程序的通用维度参数供事件构建
        COM_EXTRA.forEach((k: string) => {
          if (has(gqs, k)) {
            eventContextBuilderInst.minpExtraParams[EMBEDDED_ENUMS[k]] = gqs[k];
          }
        });
      });

      // 打通后h5中不允许再修改用户id
      this.growingIO.setUserId = () => {};
      this.growingIO.clearUserId = () => {};
      // 打通后h5中不允许再修改dataCollect和配置项（没有giodatacollect字段视为非3.8小程序SDK的来源，要允许客户自己在web里修改开关）
      if (has(gqs, 'giodatacollect')) {
        this.growingIO.setOption = () => {};
      }

      // 标记打通
      useEmbeddedInherit = true;
    }

    // 地址栏重写
    this.gioURLRewrite();
    return useEmbeddedInherit;
  };

  // 获取打通参数
  getGQS = () => {
    const { hashtag } = this.growingIO.vdsConfig;
    const cookieData = this.growingIO.storage.getItem(gioSearchKey);
    const search = window.location.search;
    const hash = window.location.hash;
    const hashSearch = hashtag ? hash.substring(hash.indexOf('?') + 1) : '';
    // qs.parse会自动把参数中的特殊字符给decode
    const searchQs = qs.parse(search);
    const hashQs = qs.parse(hashSearch);
    const cookieQs = qs.parse((cookieData || '').replace('gioenc-', ''));

    // gio打通数据优先级url参数>hash参数>cookie参数
    // 解析出来的参数对象
    let ogqs = {};
    if (has(searchQs, 'gioprojectid')) {
      ogqs = searchQs;
      this.qsFrom = 'search';
    } else if (has(hashQs, 'gioprojectid')) {
      ogqs = hashQs;
      this.qsFrom = 'hash';
    } else if (has(cookieQs, 'gioprojectid')) {
      ogqs = cookieQs;
      this.qsFrom = 'cookie';
    } else {
      this.qsFrom = 'none';
      return {};
    }
    const gqs: any = {}; // gio参数
    const ngqs: any = {}; // 客户业务参数
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
        }
      } else {
        // 获取客户业务参数
        ngqs[k] = ogqs[k];
      }
    });
    this.gqs = gqs;
    this.ngqs = ngqs;
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
      nSearch = qs.stringify(this.ngqs, true);
      paramProcessed = true;
    }
    // 如果是从hash参数中获取的gio参数，移除gio参数后重写hash拼地址
    if (hashtag && this.qsFrom === 'hash') {
      nHash = `${nHash.split('?')[0]}${qs.stringify(this.ngqs, true)}`;
      paramProcessed = true;
    }
    // 如果是从cookie参数中获取的gio参数
    if (paramProcessed) {
      const URL = `${window.location.pathname}${nSearch || ''}${nHash || ''}`;
      window.history.replaceState(null, document.title, URL);
    }
  };
}
