import {
  forEach,
  includes,
  isArray,
  isEmpty,
  isFunction,
  isNil,
  isObject,
  keys,
  last,
  toString,
  unset
} from '@/utils/glodash';
import { ALLOW_SET_OPTIONS, DEFAULT_SETTINGS } from '@/constants/config';
import {
  callError,
  checkPluginItem,
  consoleText,
  getDynamicAttributes,
  guid,
  limitObject,
  niceCallback
} from '@/utils/tools';
import { DataStoreType } from '@/types/dataStore';
import { GrowingIOType } from '@/types/growingIO';
import { eventNameValidate } from '@/utils/verifiers';
import { initGlobalStorage } from './storage';
import { PluginsType } from '@/types/plugins';
import { StorageType } from '@/types/storage';
import { UploaderType } from '@/types/uploader';
import { UserStoreType } from '@/types/userStore';
import { verifyId } from '@/utils/verifiers';
import * as glodash from '@/utils/glodash';
import * as tools from '@/utils/tools';
import DataStore from './dataStore';
import EMIT_MSG from '@/constants/emitMsg';
import mitt from 'mitt';
import Plugins from '__GIO_PLUGIN_ENTRY__';
import Uploader from './uploader';
import UserStore from './userStore';

// SDK全局参数 版本号、运行环境 均由打包工具替换写入
const sdkVersion: any = '__SDK_VERSION__';

class GrowingIO implements GrowingIOType {
  public sdkVersion: string;
  public vdsName: string;
  public utils: any;
  public emitter: any;
  public gioSDKFull: boolean;
  public gioSDKInitialized: boolean;
  // 小程序是否打通标识
  public useEmbeddedInherit: string;
  // hybrid是否打通标识
  public useHybridInherit: string;
  public userStore: UserStoreType;
  public dataStore: DataStoreType;
  public plugins: PluginsType;
  public vdsConfig: any;
  public uploader: UploaderType;
  public storage: StorageType;
  // 当前主SDK的trackingId，用于区分事件归属。
  // 有的插件可能会需要生成事件，调用了复用了build事件的方法，为了不影响SDK自身逻辑，通过trackingId来区分
  public trackingId: string;
  public subInstance: any;
  constructor() {
    // sdk版本号
    this.sdkVersion = sdkVersion;
    this.vdsName = window._gio_local_vds || 'vds';
    this.utils = { ...glodash, ...tools };
    this.emitter = mitt();
    // 初始化小程序打通逻辑
    this.useEmbeddedInherit = '';
    // hybrid打通逻辑
    this.useHybridInherit = '';
    // 初始化完成标记
    this.gioSDKInitialized = false;
    // 插件管理实例
    this.plugins = new Plugins(this);
    // 加载内置插件
    this.plugins.innerPluginInit();
    // 初始化数据中心
    this.dataStore = new DataStore(this);
    // 初始化用户实例
    this.userStore = new UserStore(this);
    // 初始化上报实例
    this.uploader = new Uploader(this);
  }

  // SDK初始化方法
  init = (options: any) => {
    this.emitter.emit(EMIT_MSG.ON_SDK_INITIALIZE_BEFORE);
    try {
      consoleText('Gio Web SDK 初始化中...', 'info');
      if (
        options.trackingId &&
        includes(this.dataStore.initializedTrackingIds, options.trackingId)
      ) {
        throw new Error(`已存在实例 ${options.trackingId}，请勿重复初始化!`);
      }
      if (this.trackingId && !this.plugins.gioMultipleInstances) {
        throw new Error('您正在尝试初始化另一个实例，请集成多实例插件后重试!');
      }
      const { currentPage, sendVerifiedVisit, sendVerifiedPage } =
        this.dataStore;
      // 初始化实例配置
      const vdsConfig = this.dataStore.initTrackerOptions(options);
      const isMain =
        !this.trackingId || vdsConfig.trackingId === this.trackingId;
      if (isMain) {
        // 初始化存储
        this.storage = initGlobalStorage(this.vdsConfig);
        // 启动页面history的hook和监听
        currentPage.hookHistory();
        // 标记SDK已初始化完成
        this.gioSDKInitialized = true;
        this.vdsConfig.gioSDKInitialized = true;
      }
      // 广播基础配置初始化完成
      this.emitter?.emit(EMIT_MSG.OPTION_INITIALIZED, {
        growingIO: this,
        trackingId: vdsConfig.trackingId,
        vdsConfig
      });
      // 解析当前页面
      currentPage.parsePage();
      // 保存初始来源信息(以主实例为准)
      if (this.vdsConfig.originalSource) {
        this.dataStore.setOriginalSource(vdsConfig.trackingId);
      }
      consoleText(
        `Gio Web SDK 初始化完成！${
          this.useEmbeddedInherit === vdsConfig.trackingId
            ? '小程序模式'
            : this.useHybridInherit === vdsConfig.trackingId
            ? 'Hybrid模式'
            : 'Web模式'
        }`,
        'success'
      );
      if (this.vdsConfig.forceLogin) {
        consoleText(
          'forceLogin已开启，请调用 identify 方法设置 openId 以继续上报!',
          'info'
        );
      }
      // 不是与小程序打通的实例要发visit
      if (this.useEmbeddedInherit !== vdsConfig.trackingId) {
        sendVerifiedVisit(vdsConfig.trackingId);
      }
      sendVerifiedPage(vdsConfig.trackingId);
      // 广播SDK初始化完成
      this.emitter?.emit(EMIT_MSG.SDK_INITIALIZED, {
        growingIO: this,
        trackingId: vdsConfig.trackingId
      });
      return true;
    } catch (error) {
      consoleText(error, 'error');
      return false;
    }
  };

  // 需要校验实例的方法执行
  handlerDistribute = (trackingId: string, handler: string, args: any) => {
    const trackerVds = this.dataStore.getTrackerVds(trackingId);
    if (trackerVds) {
      this[handler](trackingId, ...args);
    } else {
      if (isFunction(last(args))) {
        niceCallback(last(args), false);
      }
      consoleText(`不存在实例：${trackingId}，请检查!`, 'warn');
    }
  };

  // 手动注册插件
  registerPlugins = (plugs: any, callback?: (arg?: any) => any) => {
    if (isArray(plugs)) {
      let validPlugins = [];
      plugs.forEach((plug: any, index: number) => {
        if (checkPluginItem(plug, index)) {
          validPlugins.push(plug);
        }
      });
      this.plugins.installAll(validPlugins);
    } else {
      consoleText('插件注册失败，参数不合法，请检查!', 'error');
    }
    // 执行回调
    niceCallback(callback, this.plugins.pluginItems);
  };

  // 获取所有已注册插件
  getPlugins = (callback?: (arg?: any) => any) => {
    // 执行回调
    niceCallback(callback, this.plugins.pluginItems);
  };

  // 获取访问用户Id（设备Id）
  getDeviceId = (callback?: (arg?: any) => any) => {
    niceCallback(callback, this.userStore.getUid());
  };

  // 运行中修改配置
  setOption = (
    trackingId: string,
    k: string,
    v: any,
    callback?: (arg?: any) => any
  ) => {
    let r;
    if (includes(keys(ALLOW_SET_OPTIONS), k)) {
      if (typeof v === DEFAULT_SETTINGS[k]?.type) {
        this.dataStore.setOption(trackingId, k, v);
        consoleText(`已修改${ALLOW_SET_OPTIONS[k]}: ${v}`, 'info');
        r = true;
      } else {
        consoleText(`参数格式不正确：${v}，请检查后重试!`, 'error');
        r = false;
      }
    } else {
      consoleText(`不存在可修改的配置项：${k}，请检查后重试!`, 'error');
      r = false;
    }
    // 执行回调
    niceCallback(callback, r);
  };

  // 运行中获取配置
  getOption = (
    trackingId: string,
    k: string | any,
    callback?: (arg?: any) => any
  ) => {
    if (isFunction(k) && isNil(callback)) {
      callback = k;
      k = undefined;
    }
    niceCallback(callback, this.dataStore.getOption(trackingId, k));
  };

  // 发送visit事件（允许外部调用的手动发送visit）
  sendVisit = (
    trackingId: string,
    props?: any,
    callback?: (args?: any) => any
  ) => {
    this.dataStore.buildVisitEvent({ ...props, trackingId });
    // 执行回调
    niceCallback(callback);
  };

  // 添加页面变更事件监听（方便关闭trackPage时客户感知何时应该发页面事件）
  setPageListener = (trackingId: string, callback?: (arg?: any) => void) => {
    const { currentPage } = this.dataStore;
    if (isFunction(callback)) {
      currentPage.pageListeners[trackingId] = callback;
      // 设置监听的时候会触发一次回调，使得当前页面的page能够有机会补发
      const { path, query, title } = this.dataStore.currentPage;
      niceCallback(callback, { path, query, title });
    }
  };

  // 设置页面属性
  setPageAttributes = (
    trackingId: string,
    properties: any,
    callback?: (arg?: any) => void
  ) => {
    let r;
    if (isObject(properties) && !isEmpty(properties)) {
      const { trackPage } = this.dataStore.getTrackerVds(trackingId);
      if (!trackPage) {
        const { currentPage } = this.dataStore;
        if (isEmpty(currentPage.pageProps[trackingId])) {
          currentPage.pageProps[trackingId] = {};
        }
        if (isEmpty(currentPage.pageProps[trackingId][currentPage.path])) {
          currentPage.pageProps[trackingId][currentPage.path] = {};
        }
        // 结果合并，动态属性优先级高于静态属性
        if (!isEmpty(properties)) {
          forEach(properties, (v, k) => {
            if (
              !isFunction(
                currentPage.pageProps[trackingId][currentPage.path][k]
              ) ||
              isFunction(v)
            ) {
              currentPage.pageProps[trackingId][currentPage.path][k] = v;
            }
          });
        }
        r = true;
      } else {
        r = false;
        consoleText(
          '仅在关闭trackPage时允许调用setPageAttributes，请确认后修改初始化配置项!',
          'error'
        );
      }
    } else {
      r = false;
      callError('setPageAttributes');
    }
    niceCallback(callback, r);
  };

  // 清空已设置的页面属性
  clearPageAttributes = (
    trackingId: string,
    properties: string[] | undefined,
    callback?: (args?: any) => any
  ) => {
    let r = true;
    try {
      if (!isEmpty(this.dataStore.currentPage.pageProps[trackingId])) {
        const { currentPage } = this.dataStore;
        if (isArray(properties) && !isEmpty(properties)) {
          properties.forEach((propName: string) => {
            unset(
              currentPage.pageProps[trackingId][currentPage.path],
              propName
            );
          });
        } else {
          currentPage.pageProps[trackingId][currentPage.path] = {};
        }
      }
    } catch (error) {
      callError('clearPageAttributes');
      r = false;
    }
    niceCallback(callback, r);
  };

  // 发送page事件（允许外部调用的手动发送page）
  sendPage = (
    trackingId: string,
    props?: any,
    callback?: (args?: any) => any
  ) => {
    const { trackPage } = this.dataStore.getTrackerVds(trackingId);
    if (!trackPage) {
      this.dataStore.currentPage.buildPageEvent(trackingId, props);
      niceCallback(callback);
    } else {
      consoleText(
        '仅在关闭trackPage时允许调用sendPage，请确认后修改初始化配置项!',
        'error'
      );
    }
  };

  // 设置设备ID，一般为openId
  identify = (
    trackingId: string,
    assignmentId: string | number,
    callback?: (arg?: any) => any
  ) => {
    if (trackingId !== this.trackingId) {
      callError('identify', !1, '子实例不允许调用identify');
      return;
    }
    if (this.vdsConfig.forceLogin) {
      if (!verifyId(assignmentId)) {
        callError('identify');
        return;
      }
      // 截取长度
      const asId = toString(assignmentId).slice(0, 1000);
      // 在之后的请求中使用assignmentId作为uid(deviceId)使用
      this.userStore.setUid(asId);
      const trackingIds = this.dataStore.initializedTrackingIds;
      trackingIds.forEach((tid: string) => {
        // 为已积压的请求使用assignmentId全部赋值deviceId
        const hq = this.uploader.getHoardingQueue(tid);
        hq.forEach((_, i) => (hq[i].deviceId = asId));
        if (tid === this.trackingId && this.vdsConfig.forceLogin) {
          this.dataStore.setOption(tid, 'forceLogin', false);
        }
        // 发送积压队列中的请求
        this.uploader.initiateRequest(tid);
      });
    } else {
      callError('identify', !1, 'forceLogin未开启');
    }
    niceCallback(callback);
  };

  // 发送用户变量
  setUserAttributes = (
    trackingId: string,
    userAttributes: any,
    callback?: (arg?: any) => any
  ) => {
    let r;
    if (isObject(userAttributes) && !isEmpty(userAttributes)) {
      const { eventContextBuilder, eventConverter } = this.dataStore;
      let event = {
        eventType: 'LOGIN_USER_ATTRIBUTES',
        ...eventContextBuilder(trackingId)
      };
      event.attributes = limitObject({
        ...(event.attributes ?? {}),
        ...getDynamicAttributes(userAttributes)
      });
      eventConverter(event);
      r = true;
    } else {
      callError('setUserAttributes');
      r = false;
    }
    niceCallback(callback, r);
  };

  // 设置登录用户Id
  setUserId = (
    trackingId: string,
    userId: string | number,
    userKey?: string,
    callback?: (arg?: any) => any
  ) => {
    let r;
    if (verifyId(toString(userId).trim())) {
      // 切换userId要重设session补发visit
      const prevId = this.userStore.getGioId(trackingId);
      // IdMapping开启，且传了userKey则需要校验并赋值（userKey要在userId之前设置，才能保证native中的值是正确的）
      const processedUserKey =
        !isNil(userKey) && toString(userKey).length > 0
          ? toString(userKey).slice(0, 1000)
          : '';
      this.userStore.setUserKey(trackingId, processedUserKey);
      const { idMapping } = this.dataStore.getTrackerVds(trackingId);
      if (!idMapping && processedUserKey) {
        consoleText('您设置了 userKey ，请初始化开启 idMapping!', 'warn');
      }
      this.userStore.setUserId(trackingId, toString(userId).slice(0, 1000));
      // 切换用户时重置session
      if (prevId && prevId !== this.userStore.getUserId(trackingId)) {
        // 这里赋值空，实际会在userStore的set方法里重新生成一个，并通过监听自动重发visit和page
        this.userStore.setSessionId(trackingId, '');
      }
      r = true;
    } else {
      this.clearUserId(trackingId);
      callError('setUserId');
      r = false;
    }
    niceCallback(callback, r);
  };

  // 清除登录用户Id和userKey
  clearUserId = (trackingId: string, callback?: (arg?: any) => any) => {
    this.userStore.setUserId(trackingId, '');
    this.userStore.setUserKey(trackingId, '');
    niceCallback(callback);
  };

  // 设置全局通用属性（即每个事件都会带上的属性值）
  setGeneralProps = (
    trackingId: string,
    properties: any,
    callback?: (arg?: any) => any
  ) => {
    let r;
    if (isObject(properties) && !isEmpty(properties)) {
      if (isEmpty(this.dataStore.generalProps[trackingId])) {
        this.dataStore.generalProps[trackingId] = {};
      }
      // 结果合并，动态属性优先级高于静态属性
      forEach(properties, (v, k) => {
        if (
          !isFunction(this.dataStore.generalProps[trackingId][k]) ||
          isFunction(v)
        ) {
          this.dataStore.generalProps[trackingId][k] = v;
        }
      });
      r = true;
    } else {
      callError('setGeneralProps');
      r = false;
    }
    niceCallback(callback, r);
  };

  // 清空已设置的全局通用属性
  clearGeneralProps = (
    trackingId: string,
    properties: string[] | undefined,
    callback?: (arg?: any) => any
  ) => {
    if (!isEmpty(this.dataStore.generalProps[trackingId])) {
      // 获取目标tracker的引用
      if (isArray(properties) && !isEmpty(properties)) {
        properties.forEach((propName: string) => {
          unset(this.dataStore.generalProps[trackingId], propName);
        });
      } else {
        this.dataStore.generalProps[trackingId] = {};
      }
    }
    niceCallback(callback);
  };

  // 创建自定义埋点事件
  track = (
    trackingId: string,
    eventName: string,
    properties: { [key: string]: string | string[] },
    callback?: (arg?: any) => any
  ) => {
    eventNameValidate(eventName, () => {
      const { eventContextBuilder, eventConverter } = this.dataStore;
      const event = {
        eventType: 'CUSTOM',
        eventName,
        ...eventContextBuilder(trackingId)
      };
      event.attributes = limitObject({
        ...(event.attributes ?? {}),
        ...getDynamicAttributes({
          ...(isObject(properties) && !isEmpty(properties) ? properties : {})
        })
      });
      // 埋点事件要保留'&&sendTo'字段用于多实例复制发送
      if (
        this.plugins.gioMultipleInstances &&
        properties &&
        properties['&&sendTo']
      ) {
        event['&&sendTo'] = properties['&&sendTo'];
      }
      eventConverter(event);
    });
    niceCallback(callback);
  };

  // 初始化事件计时器
  trackTimerStart = (
    trackingId: string,
    eventName: string,
    callback?: (arg?: any) => any
  ) => {
    let timerId;
    const { dataCollect } = this.dataStore.getTrackerVds(trackingId);
    if (dataCollect) {
      eventNameValidate(eventName, () => {
        timerId = guid();
        if (!this.dataStore.trackTimers[trackingId]) {
          this.dataStore.trackTimers[trackingId] = {};
        }
        this.dataStore.trackTimers[trackingId][timerId] = {
          eventName,
          leng: 0,
          start: +Date.now()
        };
      });
    } else {
      consoleText('指定实例未开启数据采集，请检查!', 'error');
    }
    niceCallback(callback, timerId);
  };

  // 暂停事件计时器
  trackTimerPause = (
    trackingId: string,
    timerId: string,
    callback?: (arg?: any) => any
  ) => {
    const timers = this.dataStore.trackTimers[trackingId];
    if (timerId && timers && timers[timerId]) {
      const timer = timers[timerId];
      if (timer.start) {
        timer.leng = timer.leng + (+Date.now() - timer.start);
      }
      timer.start = 0;
    } else {
      consoleText('未查询到指定计时器，请检查!', 'error');
    }
    niceCallback(callback);
  };

  // 恢复事件计时器
  trackTimerResume = (
    trackingId: string,
    timerId: string,
    callback?: (arg?: any) => any
  ) => {
    const timers = this.dataStore.trackTimers[trackingId];
    if (timerId && timers && timers[timerId]) {
      const timer = timers[timerId];
      if (timer.start === 0) {
        timer.start = +Date.now();
      }
    } else {
      consoleText('未查询到指定计时器，请检查!', 'error');
    }
    niceCallback(callback);
  };

  // 停止事件计时器并上报事件
  trackTimerEnd = (
    trackingId: string,
    timerId: string,
    properties: any,
    callback?: (arg?: any) => any
  ) => {
    let r;
    const { dataCollect } = this.dataStore.getTrackerVds(trackingId);
    const timers = this.dataStore.trackTimers[trackingId];
    if (timerId && timers && timers[timerId]) {
      if (dataCollect) {
        const maxEnd = 60 * 60 * 24 * 1000;
        const timer = timers[timerId];
        if (timer.start !== 0) {
          const shortCut = +Date.now() - timer.start;
          timer.leng = shortCut > 0 ? timer.leng + shortCut : 0;
        }
        const { eventContextBuilder, eventConverter } = this.dataStore;
        const event = {
          eventType: 'CUSTOM',
          eventName: timer.eventName,
          ...eventContextBuilder(trackingId)
        };
        event.attributes = limitObject({
          ...(event.attributes ?? {}),
          ...getDynamicAttributes({
            ...(isObject(properties) && !isEmpty(properties) ? properties : {})
          }),
          event_duration: timer.leng > maxEnd ? 0 : timer.leng / 1000
        });
        // 埋点事件要保留'&&sendTo'字段用于多实例复制发送
        if (
          this.plugins.gioMultipleInstances &&
          properties &&
          properties['&&sendTo']
        ) {
          event['&&sendTo'] = properties['&&sendTo'];
        }
        eventConverter(event);
        r = true;
      } else {
        consoleText('指定实例未开启数据采集，计时器已移除，请检查!', 'error');
        r = false;
      }
      this.removeTimer(trackingId, timerId);
    } else {
      consoleText('未查询到指定计时器，请检查!', 'error');
      r = false;
    }
    niceCallback(callback, r);
  };

  // 移除事件计时器
  removeTimer = (
    trackingId: string,
    timerId: string,
    callback?: (arg?: any) => any
  ) => {
    const timers = this.dataStore.trackTimers[trackingId];
    if (timerId && timers && timers[timerId]) {
      delete timers[timerId];
    } else {
      consoleText('未查询到指定计时器，请检查!', 'error');
    }
    niceCallback(callback);
  };

  // 清除所有事件计时器
  clearTrackTimer = (trackingId: string, callback?: (arg?: any) => any) => {
    this.dataStore.trackTimers[trackingId] = {};
    niceCallback(callback);
  };

  // 手动更新曝光监听
  updateImpression = (callback?: () => any) => {
    const impressionMain = this.plugins?.gioImpressionTracking?.main;
    if (impressionMain) {
      impressionMain('manual');
    } else {
      consoleText(
        'updateImpression 错误! 请集成半自动埋点浏览插件后重试!',
        'error'
      );
    }
    niceCallback(callback);
  };

  // 获取A/B实验数据
  getABTest = (trackingId: string, layerId: string | number, callback: any) => {
    consoleText('获取ABTest数据错误! 请集成ABTest插件后重试!', 'error');
    niceCallback(callback, {});
  };

  // 设置发送前的拦截回调
  setBeforeSendListener = (
    trackingId: string,
    fn: () => any,
    callback: any
  ) => {
    if (toString(fn).indexOf('sendPage') > -1) {
      consoleText('拦截回调中不能调用sendPage方法，请检查!', 'error');
      return;
    }
    if (isFunction(fn)) {
      this.dataStore.beforeSendListener[trackingId] = fn;
      niceCallback(callback);
    } else {
      niceCallback(callback, false);
    }
  };
}

export default GrowingIO;
