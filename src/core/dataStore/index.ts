import {
  allowOptions,
  CDP_SETTING,
  DEFAULT_SETTING,
  IGNORE_PARAMS,
  OPTIONS_ENUM,
  PLATFORM,
  SAAS_SETTING
} from '@/constants/config';
import EMIT_MSG from '@/constants/emitMsg';
import { DataStoreType } from '@/types/dataStore';
import { GrowingIOType } from '@/types/growingIO';
import PageType from '@/types/page';
import {
  has,
  includes,
  isArray,
  isEmpty,
  isEqual,
  isNaN,
  isNil,
  isObject,
  isString,
  keys,
  toString,
  typeOf,
  unset
} from '@/utils/glodash';
import { consoleText } from '@/utils/tools';

import EventContextBuilder from './eventContextBuilder';
import Page from './page';

const initialVisit = {
  // 初始化时就把最初的站点来源存起来，给后面的visit事件用；同时本地存储中未取到值时作为兜底
  /**
  document.referrer以下3种情况会取空：
   * 1）直接在地址栏中输入地址跳转
   * 2）直接通过浏览器收藏夹打开
   * 3）从https的网站直接进入一个http协议的网站
  window.performance.navigation.type可能有以下4种情况：
   * 1）0: 点击链接、地址栏输入、表单提交、脚本操作等。
   * 2）1: 点击重新加载按钮、location.reload。
   * 3）2: 点击前进或后退按钮。
   * 4）255: 任何其他来源。即非刷新/非前进后退、非点击链接/地址栏输入/表单提交/脚本操作等。
   */
  referralPage: document.referrer
  // || window?.performance?.navigation?.type
};

class DataStore implements DataStoreType {
  readonly ALLOW_SETTING = {
    ...DEFAULT_SETTING,
    ...(this.growingIO.gioEnvironment === 'saas' ? SAAS_SETTING : CDP_SETTING)
  };
  readonly allowOptKeys = Object.keys(this.ALLOW_SETTING);
  public seqStorageIdName: string;
  public visitStorageName: string;
  public _esid: any;
  public _gsid: any;
  public currentPage: PageType;
  public eventContextBuilderInst: any;
  public eventContextBuilder: () => any;
  public lastPageEvent: any;
  public lastVisitEvent: any;
  public initialDataSourceId: string;
  // 可以自定义修改的额外参数
  public generalProps: any;
  // 事件时长计时器
  public trackTimers: any = {};

  constructor(public growingIO: GrowingIOType) {
    this.currentPage = new Page(this.growingIO);
    this.eventContextBuilderInst = new EventContextBuilder(this.growingIO);
    this.eventContextBuilder = this.eventContextBuilderInst.main;
    // 埋点事件通用属性
    this.generalProps = {};
    // 保存最近的一次visit事件，存储一些设备系统信息，避免多次重新获取
    this.lastVisitEvent = initialVisit;
    this.growingIO.emitter?.on('onComposeAfter', ({ composedEvent }) => {
      if (
        (composedEvent.eventType === 'VISIT' || composedEvent.t === 'vst') &&
        composedEvent.trackingId === this.growingIO.trackingId
      ) {
        this.lastVisitEvent = composedEvent;
      }
    });
    // 保存上一个Page事件，便于下一个Page事件和无埋点事件获取数据
    this.lastPageEvent = {};
    this.growingIO.emitter?.on('onComposeAfter', ({ composedEvent }) => {
      if (
        (composedEvent.eventType === 'PAGE' || composedEvent.t === 'page') &&
        composedEvent.trackingId === this.growingIO.trackingId
      ) {
        this.lastPageEvent = composedEvent;
      }
    });
    // sessionId变更补发visit和page
    this.growingIO.emitter?.on(EMIT_MSG.SESSIONID_UPDATE, () => {
      // 初始化完发了首个visit和page以后标记sdk初始化完成以后再执行，避免因为初始化是session为空变更导致补发
      if (this.growingIO.gioSDKInitialized) {
        // session更新，页面信息要重新解析
        this.currentPage.parsePage();
        const { title, path, query, time, getReferralPage } = this.currentPage;
        this.lastVisitEvent = {
          referralPage: document.referrer || getReferralPage(),
          title,
          path,
          query,
          timestamp: time - 1
        };
        // 发送新的visit和page
        this.sendVisit(true);
        this.sendPage(true); // 更新session补发的page要更新时间
      }
    });
  }

  // @ts-ignore
  get esid() {
    const sequenceIds =
      this.growingIO.storage.getItem(this.seqStorageIdName) || {};
    let eid = { ...sequenceIds };
    unset(eid, 'globalKey');
    // esid
    eid = isObject(eid) && !isNil(eid) ? eid : {};
    this._esid = {};
    keys(eid).forEach((k) => {
      this._esid[k] =
        isNaN(Number(eid[k])) || eid[k] >= 1e9 || eid[k] < 1 ? 1 : eid[k];
    });
    return this._esid;
  }

  // @ts-ignore
  set esid(obj: any) {
    const eid: any = {};
    keys(obj).forEach((k) => {
      eid[k] = isNaN(obj[k]) || obj[k] >= 1e9 || obj[k] < 1 ? 1 : obj[k];
    });
    if (!isEqual(this._esid, eid)) {
      this._esid = eid;
      this.setSequenceIds('esid', this._esid);
    }
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
    this.setSequenceIds('gsid', this._gsid);
  }

  // 保存esid和gsid
  setSequenceIds = (type: 'esid' | 'gsid', value: any) => {
    let sequenceIds =
      this.growingIO.storage.getItem(this.seqStorageIdName) || {};
    if (type === 'gsid') {
      sequenceIds.globalKey = value;
    } else {
      sequenceIds = { ...sequenceIds, ...value };
    }
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
            consoleText(`已关闭${(OPTIONS_ENUM as any)[k]}`, 'info');
          }
        }
      }
    });
    // session值不允许设置为小数，如果是小数则取整
    vdsConfig.sessionExpires = Math.round(vdsConfig.sessionExpires);
    // session值小于0或者大于6小时的都认为不合法，改回30分钟
    if (
      // saas不能设置，所以给默认值30
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
    if (!includes(['beacon', 'xhr', 'image'], vdsConfig.sendType)) {
      vdsConfig.sendType = 'beacon';
    }
    // 请求超时时长设置的合法区间校验，值小于等于0ms认为不合法，改回5秒，浏览器默认有2分钟的上限
    if (
      isNaN(Number(vdsConfig.requestTimeout)) ||
      vdsConfig.requestTimeout <= 0
    ) {
      vdsConfig.requestTimeout = 5000;
    }
    this.growingIO.vdsConfig = {
      ...(window.vds ?? {}),
      ...vdsConfig,
      projectId,
      dataSourceId,
      appId,
      // 补充性能默认值
      performance: {
        monitor: vdsConfig.performance?.monitor ?? true,
        exception: vdsConfig.performance?.exception ?? true,
        network: vdsConfig.performance?.network ?? false
      }
    };
    // 把vds的信息挂到全局，圈选需要用
    window.vds = this.growingIO.vdsConfig;
    // esidKey初始化
    this.seqStorageIdName = `${projectId}_gdp_sequence_ids`;
    // visitSentKey初始化
    this.visitStorageName = `${projectId}_gdp_session_id_sent`;
  };

  // 全局配置修改
  setOption = (k: string, v: any) => {
    const { vdsConfig, callError, uploader, emitter } = this.growingIO;
    // 检查 k
    const validKey = isString(k) && includes(allowOptions, k);
    const validValue =
      validKey &&
      typeof v === ((this.ALLOW_SETTING as any)[k]?.type || 'string');
    const prevConfig = { ...vdsConfig };
    if (validKey && validValue) {
      (vdsConfig as any)[k] = v;
      if (k === 'dataCollect' && prevConfig.dataCollect !== v) {
        // 从关闭到打开dataCollect时补发visit和page
        if (v) {
          this.sendVisit(true);
          this.sendPage();
        } else {
          // 从打开到关闭dataCollect时移除所有事件计时器
          this.growingIO.clearTrackTimer();
        }
      }
      // 修改host或者scheme时要重新生成上报地址
      if (includes(['host', 'scheme'], k)) {
        (uploader as any)?.generateHost();
      }
      // 配置项有变更要全局广播
      emitter?.emit(EMIT_MSG.OPTION_CHANGE, { optionName: k, optionValue: v });
      // 更新vds中的值
      window.vds[k] = v;
      return true;
    } else {
      callError(`setOption > ${k}`);
      return false;
    }
  };

  // 获取全局配置
  getOption = (k?: string) => {
    const { vdsConfig, callError } = this.growingIO;
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
      this.lastVisitEvent.timestamp = this.currentPage.time - 1;
      this.buildVisitEvent();
    }
  };

  // 构建访问事件
  buildVisitEvent = (props?: any) => {
    const {
      dataStore: { eventContextBuilder, eventConverter },
      emitter,
      storage,
      userStore
    } = this.growingIO;
    // 读取一次lastVisitEvent，如果是本地存储中的值，可以减少读取本地存储次数
    const { referralPage, title, path, query, timestamp } = this.lastVisitEvent;
    let event = {
      eventType: 'VISIT',
      ...eventContextBuilder(),
      // visit事件中的来源要取原visit事件中的进入站点的来源（lastPage中的地址做兜底）
      referralPage: referralPage || this.currentPage.getReferralPage(),
      timestamp
    };
    // visit事件中的path和query要取原visit事件中的path和query
    if (path) {
      event.title = title;
      event.path = path;
      event.query = query;
    }
    if (!isEmpty(props)) {
      event.session = props?.session || event.session;
      event.trackingId = props?.trackingId;
      event = { ...event, ...props };
    }
    const visitCallback = ({ requestData }) => {
      if (
        requestData.eventType === 'VISIT' &&
        requestData.trackingId === this.growingIO.trackingId
      ) {
        // 因为请求是异步的，防止更新了session以后，上一个请求中过期的sessionId复写回去导致bug
        if (userStore.sessionId === requestData.sessionId) {
          storage.setItem(this.visitStorageName, requestData.sessionId);
        }
        emitter.off('onSendAfter', visitCallback);
      }
    };
    emitter.on('onSendAfter', visitCallback);
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
      pageShowTimestamp: this.currentPage.time,
      eventName: 'onError',
      attributes: errorMsg as any,
      ...eventContextBuilder()
    };
    eventConverter(event);
  };

  // 事件的格式转换（在各自环境中实现）
  // eventConverter = (event) => {};
}

export default DataStore;
