import {
  ALLOW_SET_OPTIONS,
  DEFAULT_SETTINGS,
  IGNORE_PARAMS,
  PLATFORM,
  STORAGE_KEYS
} from '@/constants/config';
import {
  forEach,
  has,
  head,
  includes,
  isArray,
  isEmpty,
  isFunction,
  isNaN,
  isNil,
  isNumber,
  isObject,
  isString,
  typeOf,
  unset
} from '@/utils/glodash';
import {
  guid,
  isBot,
  callError,
  consoleText,
  niceTry,
  limitObject
} from '@/utils/tools';
import { DataStoreType, StorageKeyType } from '@/types/internal/dataStore';
import { GrowingIOType } from '@/types/internal/growingIO';
import EMIT_MSG from '@/constants/emitMsg';
import EventContextBuilder from './eventContextBuilder';
import Page from './page';
import PageType from '@/types/internal/page';

class DataStore implements DataStoreType {
  readonly ALLOW_SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);
  public currentPage: PageType;
  public eventContextBuilderInst: any;
  public eventContextBuilder: () => any;
  public lastPageEvent: any;
  // 埋点事件通用属性
  public generalProps: any;
  // 事件时长计时器
  public trackTimers: any = {};
  // 记录已初始化的trackingId，以帮助判断是否再更新sessionId时是否需要发送事件
  public initializedTrackingIds: string[];
  // 记录发送前拦截回调
  public beforeSendListener: any;
  constructor(public growingIO: GrowingIOType) {
    this.currentPage = new Page(this.growingIO);
    this.eventContextBuilderInst = new EventContextBuilder(this.growingIO);
    this.eventContextBuilder = this.eventContextBuilderInst?.main;
    // 主实例的埋点事件通用属性
    this.generalProps = {};
    // 各个实例的发送前拦截回调
    this.beforeSendListener = {};
    // 保存上一个Page事件，便于下一个Page事件和无埋点事件获取数据
    this.lastPageEvent = {};
    // originalSouceKey初始化
    const { emitter } = this.growingIO;
    emitter?.on(EMIT_MSG.ON_COMMIT_REQUEST, ({ eventData, trackingId }) => {
      if (eventData.eventType === 'PAGE' || eventData.t === 'page') {
        this.lastPageEvent[trackingId] = {
          ...eventData,
          nextRefferer: window.location.href // 不论是否开启hashtag，上报的referralPage一定是全量的地址
        };
      }
    });
    this.initializedTrackingIds = [];
    // sdk初始化完成记录trackingId供session更新判断
    emitter.on(EMIT_MSG.SDK_INITIALIZED, ({ trackingId: initTrackingId }) => {
      this.initializedTrackingIds.push(initTrackingId);
    });
    // sessionId变更补发visit和page
    emitter?.on(EMIT_MSG.SESSIONID_UPDATE, ({ trackingId }) => {
      if (includes(this.initializedTrackingIds, trackingId)) {
        // session更新要清空积压队列，否则会出现反复重发
        this.growingIO.uploader.hoardingQueue[trackingId] = [];
        // session更新，页面信息要重新解析
        this.currentPage.parsePage();
        // 发送新的visit和page
        this.sendVerifiedVisit(trackingId, true);
        this.sendVerifiedPage(trackingId, true); // 更新session补发的page要更新时间
      }
    });
    // 关闭数据采集时要移除所有的计时器
    this.growingIO.emitter.on(
      EMIT_MSG.OPTION_CHANGE,
      ({ optionName, optionValue }) => {
        if (optionName === 'dataCollect' && optionValue === false) {
          this.initializedTrackingIds.forEach((trackingId: string) =>
            this.growingIO.clearTrackTimer(trackingId)
          );
        }
      }
    );
  }

  // 获取采集实例内容 //? 多实例插件会重写该方法
  getTrackerVds = (trackingId: string) =>
    this.growingIO.trackingId === trackingId
      ? { ...this.growingIO.vdsConfig }
      : undefined;

  // 获取对应实例在存储中的前缀 //? 多实例插件会重写该方法
  // eslint-disable-next-line
  getKeyPrefix = (trackingId: string) => this.growingIO.vdsConfig.projectId;

  // 获取存储key
  getStorageKey = (trackingId: string, name: StorageKeyType) =>
    `${this.getKeyPrefix(trackingId)}${STORAGE_KEYS[name]}`;

  // 获取gsid
  getGsid = (trackingId: string) => {
    const sequenceIds =
      this.growingIO.storage.getItem(this.getStorageKey(trackingId, 'gsid')) ||
      {};
    const gid = Number(sequenceIds.globalKey);
    let _gsid;
    if (isNaN(gid) || gid >= 1e9 || gid < 1) {
      // 不存在或超出范围的gsid要存一次
      _gsid = 1;
      this.setGsid(trackingId, _gsid);
    } else {
      _gsid = gid;
    }
    return _gsid;
  };

  // 设值gsid
  setGsid = (trackingId: string, value: number) => {
    const newV = Number(value);
    const _gsid = isNaN(newV) || value >= 1e9 || value < 1 ? 1 : value;
    this.setSequenceIds(trackingId, _gsid);
  };

  // 保存gsid
  setSequenceIds = (trackingId: string, value: any) => {
    const seqStorageName = this.getStorageKey(trackingId, 'gsid');
    let sequenceIds = this.growingIO.storage.getItem(seqStorageName) || {};
    sequenceIds.globalKey = value;
    this.growingIO.storage.setItem(seqStorageName, sequenceIds);
  };

  // 初始化实例的配置项 // ?多实例插件会重写该方法
  initTrackerOptions = (options: any) => {
    const trackerOptions = this.initOptions(options);
    trackerOptions.trackingId = options.trackingId;
    this.growingIO.trackingId = options.trackingId;
    this.growingIO.vdsConfig = trackerOptions;
    // 把vds的信息挂到全局，圈选需要用
    window[this.growingIO.vdsName] = trackerOptions;
    return trackerOptions;
  };

  // 初始化全局配置
  initOptions = (userOptions: any) => {
    const { projectId, dataSourceId, appId } = userOptions;
    const configs: any = {};
    // 只处理允许的配置项，之外用户的配置项无视
    this.ALLOW_SETTING_KEYS.forEach((k) => {
      // 配置项值不存在或类型不合法时置为默认值
      const altp = DEFAULT_SETTINGS[k].type;
      let invalid = isArray(altp)
        ? !includes(altp, typeOf(userOptions[k]))
        : typeOf(userOptions[k]) !== altp;
      if (k === 'platform' && !includes(PLATFORM, userOptions[k])) {
        invalid = true;
      }
      if (invalid) {
        configs[k] = DEFAULT_SETTINGS[k].default;
      } else if (k === 'ignoreFields') {
        configs.ignoreFields = userOptions.ignoreFields.filter((o) =>
          includes(IGNORE_PARAMS, o)
        );
      } else {
        configs[k] = userOptions[k];
        if (includes(['dataCollect', 'autotrack'], k) && !configs[k]) {
          consoleText(`已关闭${ALLOW_SET_OPTIONS[k]}`, 'info');
        }
      }
    });
    // 对使用host配置项进行警告
    if (userOptions.host) {
      consoleText('host字段已废弃，指定上报请求地址请使用 serverUrl!', 'error');
    }
    // session值不允许设置为小数，如果是小数则取整
    configs.sessionExpires = Math.round(configs.sessionExpires);
    // session值小于0或者大于6小时的都认为不合法，改回30分钟
    if (
      isNaN(configs.sessionExpires) ||
      configs.sessionExpires < 1 ||
      configs.sessionExpires > 60 * 6
    ) {
      configs.sessionExpires = 30;
    }
    // 存储类型支持不区分大小写
    configs.storageType = configs.storageType.toLowerCase();
    // idMapping配置项兼容处理
    if (configs.enableIdMapping && !configs.idMapping) {
      configs.idMapping = true;
    }
    unset(configs, 'enableIdMapping');
    // 上报方式支持不区分大小写
    configs.sendType = configs.sendType.toLowerCase();
    if (!includes(['beacon', 'xhr', 'image'], configs.sendType)) {
      configs.sendType = 'beacon';
    }
    // 不采集爬虫数据
    if (!configs.trackBot && isBot()) {
      configs.dataCollect = false;
    }
    // 请求超时时长设置的合法区间校验，值小于等于0ms认为不合法，改回5秒，浏览器默认有2分钟的上限
    if (isNaN(Number(configs.requestTimeout)) || configs.requestTimeout <= 0) {
      configs.requestTimeout = 5000;
    }

    // 曝光比例不在合法范围内改回默认值
    if (configs.impressionScale > 1 || configs.impressionScale < 0) {
      configs.impressionScale = 0;
    }
    return {
      ...(window[this.growingIO.vdsName] ?? {}),
      ...configs,
      projectId,
      dataSourceId,
      appId,
      // 补充性能默认值
      performance: {
        monitor: configs.performance?.monitor ?? true,
        exception: configs.performance?.exception ?? true,
        network: configs.performance?.network ?? false
      }
    };
  };

  // 保存初始来源信息
  setOriginalSource = (trackingId: string) => {
    const { storage, userStore } = this.growingIO;
    const prevSentSession = storage.getItem(
      this.getStorageKey(trackingId, 'sentSign')
    );
    const visitSent = userStore.getSessionId(trackingId) === prevSentSession;
    if (!visitSent && isEmpty(this.getOriginalSource(trackingId))) {
      const { path, query, getReferralPage } = this.currentPage;
      const originalSource = {
        path,
        query,
        referralPage: document.referrer || getReferralPage(trackingId)
      };
      localStorage.setItem(
        this.getStorageKey(trackingId, 'originalSource'),
        JSON.stringify(originalSource)
      );
    }
  };

  // 获取初始来源信息
  getOriginalSource = (trackingId: string) => {
    return niceTry(() =>
      JSON.parse(
        localStorage.getItem(this.getStorageKey(trackingId, 'originalSource'))
      )
    );
  };

  // 全局配置修改
  setOption = (trackingId: string, k: string, v: any) => {
    const { emitter, userStore } = this.growingIO;
    const trackerVds = this.getTrackerVds(trackingId);
    const prevConfig = { ...trackerVds };
    this.updateVdsConfig(trackingId, { ...trackerVds, [k]: v });
    if (k === 'dataCollect' && prevConfig.dataCollect !== v) {
      if (v) {
        // 采集开关打开，重置session，开启新访问（通过session更新自动重新解析页面和重发事件）
        userStore.setSessionId(trackingId, guid());
      } else {
        // 从打开到关闭dataCollect时移除所有事件计时器
        this.growingIO.clearTrackTimer(trackingId);
      }
    }
    // 配置项有变更要全局广播
    emitter?.emit(EMIT_MSG.OPTION_CHANGE, {
      trackingId,
      optionName: k,
      optionValue: v
    });
  };

  // 获取全局配置
  getOption = (trackingId: string, k?: string) => {
    const trackerVds = this.getTrackerVds(trackingId);
    if (k && has(this.growingIO.vdsConfig, k)) {
      if (has(trackerVds, k)) {
        return trackerVds[k];
      } else {
        return this.growingIO.vdsConfig[k];
      }
    } else if (isEmpty(k) || isNil(k)) {
      return trackerVds;
    } else {
      callError(`getOption > ${k}`);
      return undefined;
    }
  };

  // 根据实例更新内存和存储中的vds配置项值
  updateVdsConfig = (trackingId: string, vds: any) => {
    const windowVds = window[this.growingIO.vdsName];
    try {
      if (trackingId === this.growingIO.trackingId) {
        this.growingIO.vdsConfig = { ...this.growingIO.vdsConfig, ...vds };
        window[this.growingIO.vdsName] = {
          ...windowVds,
          ...this.growingIO.vdsConfig
        };
      } else {
        this.growingIO.subInstance[trackingId] = {
          ...this.growingIO.subInstance[trackingId],
          ...vds
        };
        window[this.growingIO.vdsName].subInstance[trackingId] = {
          ...windowVds.subInstance[trackingId],
          ...this.growingIO.subInstance[trackingId]
        };
      }
    } catch (error) {
      consoleText(`Internal Error! ${error}`, 'error');
    }
  };

  // 发送有校验的visit事件
  sendVerifiedVisit = (trackingId: string, forceSend?: boolean) => {
    const {
      userStore: { getSessionId },
      storage
    } = this.growingIO;
    const prevSentSession = storage.getItem(
      this.getStorageKey(trackingId, 'sentSign')
    );
    const visitSent = getSessionId(trackingId) === prevSentSession;
    if (!!forceSend || !visitSent) {
      this.buildVisitEvent(trackingId);
    }
  };

  // 发送有校验的page事件
  sendVerifiedPage = (trackingId: string, forceParse = false) => {
    // 是否需要重新解析页面信息
    if (forceParse) {
      this.currentPage.parsePage();
    }
    const { trackPage } = this.getTrackerVds(trackingId);
    const { pageListeners, path, query, title, buildPageEvent } =
      this.currentPage;
    // 触发业务页面监听
    if (isFunction(pageListeners[trackingId])) {
      pageListeners[trackingId]({
        path,
        query,
        title
      });
    }
    if (trackPage) {
      buildPageEvent(trackingId);
    }
  };

  // 构建访问事件
  buildVisitEvent = (trackingId: string, props?: any) => {
    const {
      dataStore: { eventContextBuilder, eventConverter, currentPage },
      emitter,
      vdsConfig
    } = this.growingIO;
    const originalSource = this.getOriginalSource(trackingId);
    let event: any = {
      eventType: 'VISIT',
      ...eventContextBuilder(trackingId),
      title: currentPage.title, // visit事件要单独设一次title以覆盖eventContextBuilder中的lastPage的可能的title错误值
      /**
        document.referrer以下3种情况会取空：
        * 1）直接在地址栏中输入地址跳转
        * 2）直接通过浏览器收藏夹打开
        * 3）从https的网站直接进入一个http协议的网站
        */
      referralPage:
        document.referrer || this.currentPage.getReferralPage(trackingId),
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
    // visit事件回调
    const visitCallback = ({ requestData, trackingId: tid }) => {
      const { userStore, storage } = this.growingIO;
      if (requestData.eventType === 'VISIT' && trackingId === tid) {
        // 存储标记当前session已经发过visit
        storage.setItem(
          this.getStorageKey(requestData.trackingId, 'sentSign'),
          requestData.sessionId
        );
        // 刷新设备Id（保持cookie有效期）
        userStore.setUid(requestData.deviceId);
        // 刷新userId、userKey和gioId（保持cookie有效期）
        const userId = userStore.getUserId(tid);
        if (userId && userId === requestData.userId) {
          userStore.setUserId(tid, userStore.getUserId(tid));
        }
        const userKey = userStore.getUserKey(tid);
        if (userKey && userKey === requestData.userKey) {
          userStore.setUserKey(tid, userStore.getUserKey(tid));
        }
        const gioId = userStore.getGioId(tid);
        if (gioId && gioId === requestData.gioId) {
          userStore.setGioId(tid, userStore.getGioId(tid));
        }
        // visit消费过初始来源信息后删除
        localStorage.removeItem(this.getStorageKey(tid, 'originalSource'));
      }
    };
    emitter.on(EMIT_MSG.ON_SEND_AFTER, visitCallback);
    eventConverter(event);
  };

  // 事件的格式转换(同时移除无值的字段)
  eventConverter = (event: any) => {
    const { uploader } = this.growingIO;
    const { dataCollect } = this.getTrackerVds(event.trackingId);
    // 开启数据采集时才会处理事件、累计全局计数并将合成的事件提交到请求队列
    if (dataCollect) {
      event.eventSequenceId = this.getGsid(event.trackingId);
      if (event.eventType === 'LOGIN_USER_ATTRIBUTES') {
        //? 在4.0中用户属性事件不再带timezoneOffset和eventSequenceId字段
        unset(event, ['timezoneOffset', 'eventSequenceId']);
      } else {
        //? 在4.0中event.eventSequenceId（esid）的值实际为全局的事件id，即值是globalSequenceId（gsid）
        // 全局事件计数加1
        this.setGsid(event.trackingId, this.getGsid(event.trackingId) + 1);
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
      this.growingIO.emitter?.emit(EMIT_MSG.ON_COMPOSE_AFTER, {
        composedEvent: { ...convertedEvent },
        trackingId: event.trackingId
      });
      // 如果有发送前的拦截回调，要先执行并获取执行结果
      const beforeSendListener = this.beforeSendListener[event.trackingId];
      if (!isEmpty(beforeSendListener) && isFunction(beforeSendListener)) {
        const result =
          niceTry(() => beforeSendListener({ ...convertedEvent })) ?? {};
        // 如果返回值不是一个对象，且没有事件类型，直接使用原来的事件
        if (
          isObject(result) &&
          !isEmpty(result) &&
          result.eventType &&
          result.dataSourceId
        ) {
          // 只允许修改以下4个预置属性值
          ['path', 'query', 'title'].forEach((k) => {
            if (result[k] && isString(result[k])) {
              convertedEvent[k] = result[k];
            }
          });
          if (result.attributes && isObject(result.attributes)) {
            if (isEmpty(result.attributes)) {
              unset(convertedEvent, 'attributes');
            } else {
              convertedEvent.attributes = limitObject(result.attributes);
            }
          }
        }
      }
      // 提交请求队列
      uploader.commitRequest({ ...convertedEvent, requestId: guid() });
    }
  };
}

export default DataStore;
