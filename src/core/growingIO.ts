import {
  compact,
  includes,
  isArray,
  isEmpty,
  isNil,
  isObject,
  keys,
  toString,
  unset
} from '@/utils/glodash';
import { ALLOW_OPTIONS } from '@/constants/config';
import {
  callError,
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
  public useEmbeddedInherit: boolean;
  // hybrid是否打通标识
  public useHybridInherit: boolean;
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
    this.useEmbeddedInherit = false;
    // hybrid打通逻辑
    this.useHybridInherit = false;
    // 初始化完成标记
    this.gioSDKInitialized = false;
    // 插件管理实例
    this.plugins = new Plugins(this);
    // 加载内置插件
    this.plugins.innerPluginInit();
    // 初始化数据中心
    this.dataStore = new DataStore(this);
  }

  // SDK初始化方法
  init = (options: any) => {
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
        // 初始化上报实例
        this.uploader = new Uploader(this);
        // 初始化用户实例
        this.userStore = new UserStore(this);
        // 启动页面history的hook和监听
        currentPage.hookHistory();
        // 标记SDK已初始化完成
        this.gioSDKInitialized = true;
        this.vdsConfig.gioSDKInitialized = true;
        window[this.vdsName] = this.vdsConfig;
      }
      // 解析当前页面
      currentPage.parsePage();
      if (this.vdsConfig.originalSource) {
        // 保存初始来源信息
        this.dataStore.setOriginalSource(options.trackingId);
      }
      // 广播基础配置初始化完成
      this.emitter?.emit(EMIT_MSG.OPTION_INITIALIZED, {
        growingIO: this,
        trackingId: options.trackingId,
        vdsConfig
      });
      consoleText('Gio Web SDK 初始化完成！', 'success');
      if (this.vdsConfig.forceLogin) {
        consoleText(
          'forceLogin已开启，请调用 identify 方法设置 openId 以继续上报!',
          'info'
        );
      }
      // 先发visit和page
      if (!isMain || !this.useEmbeddedInherit) {
        sendVerifiedVisit(options.trackingId);
      }
      sendVerifiedPage(options.trackingId);
      // 广播SDK初始化完成
      this.emitter?.emit(EMIT_MSG.SDK_INITIALIZED, {
        growingIO: this,
        trackingId: options.trackingId
      });
      return true;
    } catch (error) {
      consoleText(error, 'error');
      return false;
    }
  };

  // 需要校验实例的方法执行
  handlerDistribute = (trackingId: string, handler: string, args: any) => {
    const tracker = this.dataStore.getTracker(trackingId);
    if (tracker) {
      this[handler](trackingId, ...args);
    } else {
      consoleText(`不存在实例：${trackingId}，请检查!`, 'warn');
    }
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

  // 发送page事件（允许外部调用的手动发送page）
  sendPage = (
    trackingId: string,
    props?: any,
    callback?: (args?: any) => any
  ) => {
    this.dataStore.currentPage.buildPageEvent({
      ...props,
      trackingId
    });
    // 执行回调
    niceCallback(callback);
  };

  // 手动注册插件
  registerPlugins = (plugins: any, callback?: (arg?: any) => any) => {
    if (isArray(plugins)) {
      plugins.forEach((plugin: any, index: number) => {
        if (isEmpty(plugin) || isNil(plugin)) {
          consoleText('插件不合法，跳过加载!', 'warn');
        } else if (plugin.js?.default) {
          plugins[index] = { ...plugin.js?.default, options: plugin.options };
        }
      });
      plugins = compact(plugins);
      this.plugins.installAll(plugins);
    } else {
      consoleText('插件注册失败，请检查!', 'error');
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
    if (includes(keys(ALLOW_OPTIONS), k)) {
      r = this.dataStore.setOption(trackingId, k, v);
      if (r && ALLOW_OPTIONS[k]) {
        consoleText(`已修改${ALLOW_OPTIONS[k]}: ${v}`, 'info');
      }
    } else {
      consoleText(`不存在可修改的配置项：${k}，请检查后重试!`, 'warn');
      r = false;
    }
    // 执行回调
    niceCallback(callback, r);
  };

  // 运行中获取配置
  getOption = (
    trackingId: string,
    k: string,
    callback?: (arg?: any) => any
  ) => {
    niceCallback(callback, this.dataStore.getOption(trackingId, k));
  };

  // 设置埋点事件的通用属性（即每个埋点事件都会带上的属性值）
  setGeneralProps = (
    trackingId: string,
    properties: any,
    callback?: (arg?: any) => any
  ) => {
    // 获取目标tracker的引用
    const tracker = this.dataStore.getTracker(trackingId);
    let r;
    if (tracker) {
      if (isObject(properties) && !isEmpty(properties)) {
        tracker.generalProps = {
          ...(tracker.generalProps ?? {}),
          ...properties
        };
        keys(tracker.generalProps).forEach((k: string) => {
          if (includes([undefined, null], tracker.generalProps[k])) {
            tracker.generalProps[k] = '';
          }
        });
        r = true;
      } else {
        callError('setGeneralProps');
        r = false;
      }
    } else {
      callError('setGeneralProps', true, `不存在实例${trackingId}!`);
      r = false;
    }
    niceCallback(callback, r);
  };

  // 清空已设置的埋点事件的通用属性
  clearGeneralProps = (
    trackingId: string,
    properties: string[] | undefined,
    callback?: (arg?: any) => any
  ) => {
    // 获取目标tracker的引用
    const tracker = this.dataStore.getTracker(trackingId);
    if (tracker) {
      if (isArray(properties) && !isEmpty(properties)) {
        properties.forEach((prop: string) => {
          unset(tracker.generalProps, prop);
        });
      } else {
        tracker.generalProps = {};
      }
    } else {
      callError('setGeneralProps', true, `不存在实例${trackingId}!`);
    }
    niceCallback(callback);
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
        // 发送积压队列中的请求
        this.uploader.initiateRequest(tid);
      });
      this.dataStore.setOption(this.trackingId, 'forceLogin', false);
    } else {
      callError('identify', !1, 'forceLogin未开启');
    }
    niceCallback(callback);
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
      const processedKey =
        !isNil(userKey) && toString(userKey).length > 0
          ? toString(userKey).slice(0, 1000)
          : '';
      const tracker = this.dataStore.getTracker(trackingId);
      if (tracker.vdsConfig.idMapping) {
        this.userStore.setUserKey(trackingId, processedKey);
      } else if (processedKey) {
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

  // 发送用户变量
  setUserAttributes = (
    trackingId: string,
    userAttributes: any,
    callback?: (arg?: any) => any
  ) => {
    let r;
    if (!isEmpty(userAttributes) && isObject(userAttributes)) {
      const { eventContextBuilder, eventConverter } = this.dataStore;
      let event = {
        eventType: 'LOGIN_USER_ATTRIBUTES',
        attributes: limitObject(userAttributes),
        ...eventContextBuilder(trackingId)
      };
      eventConverter(event);
      r = true;
    } else {
      callError('setUserAttributes');
      r = false;
    }
    niceCallback(callback, r);
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
      // 获取目标tracker的引用
      const tracker = this.dataStore.getTracker(trackingId);
      const generalProps = tracker.generalProps ?? {};
      const mergedProperties = {
        ...generalProps,
        ...(isObject(properties) && !isEmpty(properties) ? properties : {})
      };
      let event = {
        eventType: 'CUSTOM',
        eventName,
        attributes: limitObject(getDynamicAttributes(mergedProperties)),
        ...eventContextBuilder(trackingId),
        customEventType: 1
      };
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
    const tracker = this.dataStore.getTracker(trackingId);
    if (tracker?.vdsConfig?.dataCollect) {
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
    attributes: any,
    callback?: (arg?: any) => any
  ) => {
    let r;
    const tracker = this.dataStore.getTracker(trackingId);
    const timers = this.dataStore.trackTimers[trackingId];
    if (timerId && timers && timers[timerId]) {
      if (tracker.vdsConfig?.dataCollect) {
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
          attributes: limitObject({
            ...attributes,
            event_duration: timer.leng > maxEnd ? 0 : timer.leng / 1000
          }),
          ...eventContextBuilder(trackingId),
          customEventType: 0
        };
        eventConverter(event);
        r = true;
      } else {
        consoleText('指定实例未开启数据采集，计时器已移除，请检查!', 'error');
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
      impressionMain('emitter');
    } else {
      consoleText(
        'updateImpression 错误! 请集成半自动埋点浏览插件后重试!',
        'error'
      );
    }
    niceCallback(callback);
  };
}

export default GrowingIO;
