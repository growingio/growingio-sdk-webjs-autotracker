import {
  ALLOW_OPTIONS,
  DEFAULT_SETTING,
  IGNORE_PARAMS,
  PLATFORM
} from '@/constants/config';
import {
  forEach,
  has,
  head,
  includes,
  isArray,
  isEmpty,
  isNaN,
  isNil,
  isNumber,
  isString,
  keys,
  toString,
  typeOf,
  unset
} from '@/utils/glodash';
import { guid, isBot, callError, consoleText, niceTry } from '@/utils/tools';
import { DataStoreType } from '@/types/dataStore';
import { GrowingIOType } from '@/types/growingIO';
import EMIT_MSG from '@/constants/emitMsg';
import EventContextBuilder from './eventContextBuilder';
import Page from './page';
import PageType from '@/types/page';

class DataStore implements DataStoreType {
  readonly ALLOW_SETTING = { ...DEFAULT_SETTING };
  readonly allowOptKeys = Object.keys(this.ALLOW_SETTING);
  public seqStorageIdName: string;
  public visitStorageName: string;
  public originalSourceName: string;
  public _esid: any;
  public _gsid: any;
  public currentPage: PageType;
  public eventContextBuilderInst: any;
  public eventContextBuilder: () => any;
  public lastPageEvent: any;
  public initialDataSourceId: string;
  // 可以自定义修改的额外参数
  public generalProps: any;
  // 事件时长计时器
  public trackTimers: any = {};

  constructor(public growingIO: GrowingIOType) {
    this.currentPage = new Page(this.growingIO);
    this.eventContextBuilderInst = new EventContextBuilder(this.growingIO);
    this.eventContextBuilder = this.eventContextBuilderInst?.main;
    // 埋点事件通用属性
    this.generalProps = {};
    // 保存上一个Page事件，便于下一个Page事件和无埋点事件获取数据
    this.lastPageEvent = {};
    // originalSouceKey初始化
    this.originalSourceName = 'gdp_original_source';
    const { emitter } = this.growingIO;
    emitter?.on(EMIT_MSG.ON_COMPOSE_AFTER, ({ composedEvent }) => {
      if (
        (composedEvent.eventType === 'PAGE' || composedEvent.t === 'page') &&
        composedEvent.trackingId === this.growingIO.trackingId
      ) {
        this.lastPageEvent = composedEvent;
      }
    });
    // sessionId变更补发visit和page
    emitter.on(EMIT_MSG.SDK_INITIALIZED_COMPLATE, () => {
      emitter?.on(EMIT_MSG.SESSIONID_UPDATE, () => {
        // session超时要清空积压队列，否则会出现反复重发
        this.growingIO.uploader.hoardingQueue = [];
        // session更新，页面信息要重新解析
        this.currentPage.parsePage();
        // 发送新的visit和page
        this.sendVisit(true);
        this.sendPage(true); // 更新session补发的page要更新时间
      });
    });
  }

  // @ts-ignore
  get gsid() {
    const sequenceIds =
      this.growingIO.storage.getItem(this.seqStorageIdName) || {};
    const gid = Number(sequenceIds.globalKey);
    this._gsid = isNaN(gid) || gid >= 1e9 || gid < 1 ? 1 : gid;
    return this._gsid;
  }

  // @ts-ignore
  set gsid(v: any) {
    const newV = Number(v);
    if (isNaN(newV) || v >= 1e9 || v < 1) {
      this._gsid = 1;
    } else {
      this._gsid = v;
    }
    this.setSequenceIds(this._gsid);
  }

  // 保存gsid
  setSequenceIds = (value: any) => {
    let sequenceIds =
      this.growingIO.storage.getItem(this.seqStorageIdName) || {};
    sequenceIds.globalKey = value;
    this.growingIO.storage.setItem(this.seqStorageIdName, sequenceIds);
  };

  // 初始化全局配置
  initOptions = (userOptions: any) => {
    const { projectId, dataSourceId, appId } = userOptions;
    this.initialDataSourceId = dataSourceId;
    const vdsConfig: any = {};
    // 只处理允许的配置项，之外用户的配置项无视
    this.allowOptKeys.forEach((k) => {
      // 配置项值不存在或类型不合法时置为默认值
      const altp = (this.ALLOW_SETTING as any)[k].type;
      let invalid = isArray(altp)
        ? !includes(altp, typeOf(userOptions[k]))
        : typeOf(userOptions[k]) !== altp;
      if (k === 'platform' && !includes(PLATFORM, userOptions[k])) {
        invalid = true;
      }
      if (invalid) {
        vdsConfig[k] = (this.ALLOW_SETTING as any)[k].default;
      } else if (k === 'ignoreFields') {
        vdsConfig.ignoreFields = userOptions.ignoreFields.filter((o) =>
          includes(IGNORE_PARAMS, o)
        );
      } else {
        vdsConfig[k] = userOptions[k];
        if (includes(['dataCollect', 'autotrack'], k)) {
          if (!vdsConfig[k]) {
            consoleText(`已关闭${ALLOW_OPTIONS[k]}`, 'info');
          }
        }
      }
    });
    // session值不允许设置为小数，如果是小数则取整
    vdsConfig.sessionExpires = Math.round(vdsConfig.sessionExpires);
    // session值小于0或者大于6小时的都认为不合法，改回30分钟
    if (
      isNaN(vdsConfig.sessionExpires) ||
      vdsConfig.sessionExpires < 1 ||
      vdsConfig.sessionExpires > 60 * 6
    ) {
      vdsConfig.sessionExpires = 30;
    }
    // 存储类型支持不区分大小写
    vdsConfig.storageType = vdsConfig.storageType.toLowerCase();
    // 上报方式支持不区分大小写
    vdsConfig.sendType = vdsConfig.sendType.toLowerCase();
    if (!includes(['beacon', 'xhr'], vdsConfig.sendType)) {
      vdsConfig.sendType = 'beacon';
    }
    // 不采集爬虫数据
    if (!vdsConfig.trackBot && isBot()) {
      vdsConfig.dataCollect = false;
    }
    this.growingIO.vdsConfig = {
      ...(window[this.growingIO.vds] ?? {}),
      ...vdsConfig,
      projectId,
      dataSourceId,
      appId
    };
    // 把vds的信息挂到全局，圈选需要用
    window[this.growingIO.vds] = this.growingIO.vdsConfig;
    // esidKey初始化
    this.seqStorageIdName = `${projectId}_gdp_sequence_ids`;
    // visitSentKey初始化
    this.visitStorageName = `${projectId}_gdp_session_id_sent`;
  };

  // 保存初始来源信息
  setOriginalSource = () => {
    const { storage, userStore } = this.growingIO;
    const prevSentSession = storage.getItem(this.visitStorageName);
    const visitSent = userStore.sessionId === prevSentSession;
    if (!visitSent && isNil(this.getOriginalSource())) {
      const { path, query, getReferralPage } = this.currentPage;
      const originalSource = {
        path,
        query,
        referralPage: document.referrer || getReferralPage()
      };
      localStorage.setItem(
        this.originalSourceName,
        JSON.stringify(originalSource)
      );
    }
  };

  // 获取初始来源信息
  getOriginalSource = () => {
    return niceTry(() =>
      JSON.parse(localStorage.getItem(this.originalSourceName))
    );
  };

  // 全局配置修改
  setOption = (k: string, v: any) => {
    const { vdsConfig, uploader, emitter, userStore, vds } = this.growingIO;
    // 检查 k
    const validKey = isString(k) && includes(keys(ALLOW_OPTIONS), k);
    const validValue =
      validKey &&
      typeof v === ((this.ALLOW_SETTING as any)[k]?.type || 'string');
    const prevConfig = { ...vdsConfig };
    if (validKey && validValue) {
      (vdsConfig as any)[k] = v;
      if (k === 'dataCollect' && prevConfig.dataCollect !== v) {
        if (v) {
          // 采集开关打开，重置session，开启新访问（通过session更新自动重新解析页面和重发事件）
          userStore.sessionId = guid();
        } else {
          // 从打开到关闭dataCollect时移除所有事件计时器
          this.growingIO.clearTrackTimer();
        }
      }
      // 修改上报地址时要重新生成上报地址
      if (k === 'serverUrl') {
        (uploader as any)?.generateHost();
      }
      // 配置项有变更要全局广播
      emitter?.emit(EMIT_MSG.OPTION_CHANGE, { optionName: k, optionValue: v });
      // 更新vds中的值
      window[vds][k] = v;
      return true;
    } else {
      callError(`setOption > ${k}`);
      return false;
    }
  };

  // 获取全局配置
  getOption = (k?: string) => {
    const { vdsConfig } = this.growingIO;
    if (k && has(vdsConfig, toString(k))) {
      return (vdsConfig as any)[toString(k)];
    } else if (isNil(k)) {
      return { ...vdsConfig };
    } else {
      callError(`getOption > ${k}`);
      return undefined;
    }
  };

  // SDK内部手动调用visit事件的方法
  sendVisit = (forceSend?: boolean) => {
    const {
      userStore: { sessionId },
      storage
    } = this.growingIO;
    const prevSentSession = storage.getItem(this.visitStorageName);
    const visitSent = sessionId === prevSentSession;
    if (!!forceSend || !visitSent) {
      this.buildVisitEvent();
    }
  };

  // 构建访问事件
  buildVisitEvent = (props?: any) => {
    const {
      dataStore: { eventContextBuilder, eventConverter, currentPage },
      emitter,
      storage,
      vdsConfig
    } = this.growingIO;
    const originalSource = this.getOriginalSource();
    let event: any = {
      eventType: 'VISIT',
      ...eventContextBuilder(),
      /**
        document.referrer以下3种情况会取空：
        * 1）直接在地址栏中输入地址跳转
        * 2）直接通过浏览器收藏夹打开
        * 3）从https的网站直接进入一个http协议的网站
        */
      referralPage: document.referrer || this.currentPage.getReferralPage(),
      timestamp: currentPage.time - 1
    };
    // 配置使用初始来源时，visit使用初始来源数据
    if (vdsConfig.originalSource && !isNil(originalSource)) {
      event = { ...event, ...originalSource };
    }
    // 外部传入的自定义值参数
    if (!isEmpty(props)) {
      forEach(event, (value: string | number | undefined, key: string) => {
        if (has(props, key)) {
          if (isNumber(props[key])) {
            event[key] = props[key];
          } else if (!isEmpty(props[key])) {
            event[key] = props[key] || event[key];
          }
        }
      });
    }
    const visitCallback = ({ requestData }) => {
      if (
        requestData.eventType === 'VISIT' &&
        requestData.trackingId === this.growingIO.trackingId
      ) {
        // 存储标记当前session已经发过visit
        storage.setItem(this.visitStorageName, requestData.sessionId);
        // visit消费过初始来源信息后删除
        localStorage.removeItem(this.originalSourceName);
        emitter.off(EMIT_MSG.ON_SEND_AFTER, visitCallback);
      }
    };
    emitter.on(EMIT_MSG.ON_SEND_AFTER, visitCallback);
    eventConverter(event);
  };

  // SDK内部手动调用page事件的方法
  sendPage = (forceParse?: boolean) => {
    // 是否需要重新解析页面信息
    if (forceParse) {
      this.currentPage.parsePage();
    }
    this.currentPage.buildPageEvent();
  };

  // 构建错误事件
  buildErrorEvent = (errorMsg: string) => {
    const {
      dataStore: { eventContextBuilder, eventConverter }
    } = this.growingIO;
    const event = {
      eventType: 'CUSTOM',
      eventName: 'onError',
      attributes: errorMsg as any,
      ...eventContextBuilder()
    };
    eventConverter(event);
  };

  // 事件的格式转换(同时移除无值的字段)
  eventConverter = (event: any) => {
    const { vdsConfig, dataStore, uploader } = this.growingIO;
    // 开启数据采集时才会处理事件、累计全局计数并将合成的事件提交到请求队列
    if (vdsConfig.dataCollect) {
      //? 在4.0中用户属性事件不再带eventSequenceId字段
      if (event.eventType === 'LOGIN_USER_ATTRIBUTES') {
        // 4.0中新增除（用户属性事件之外）timezoneOffset字段
        unset(event, 'timezoneOffset');
      } else if (event.trackingId === this.growingIO.trackingId) {
        //? 在4.0中event.eventSequenceId（esid）的值实际为全局的事件id，即值是globalSequenceId（gsid）
        event.eventSequenceId = dataStore.gsid;
      }
      const convertedEvent: any = {};
      forEach(event, (v: any, k: string) => {
        // 无埋点element的转换
        if (k === 'element') {
          const target: object = head(v) ?? {};
          forEach(target, (ev: any, ek: string) => {
            // 判断属性是否存在，同时忽略无值属性（放入convertedEvent中）
            if (!isEmpty(ev) || ev === 0) {
              convertedEvent[ek] = ev;
            }
          });
        } else if ((!isEmpty(v) && !isNil(v)) || v === 0) {
          // 判断属性是否存在，同时忽略无值属性
          convertedEvent[k] = v;
        }
      });
      if (event.trackingId === this.growingIO.trackingId) {
        // 全局事件计数加1
        this.growingIO.dataStore.gsid += 1;
      }
      this.growingIO.emitter?.emit(EMIT_MSG.ON_COMPOSE_AFTER, {
        composedEvent: { ...convertedEvent }
      });
      // 提交请求队列
      if (event.trackingId === this.growingIO.trackingId) {
        uploader.commitRequest({ ...convertedEvent, requestId: guid() });
      }
    }
  };
}

export default DataStore;
