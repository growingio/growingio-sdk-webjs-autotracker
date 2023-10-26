import {
  includes,
  isArray,
  isEmpty,
  isObject,
  keys,
  unset,
  toString,
  isNil,
  compact
} from '@/utils/glodash';
import { ALLOW_OPTIONS } from '@/constants/config';
import {
  guid,
  callError,
  consoleText,
  niceCallback,
  limitObject,
  getDynamicAttributes
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
import Plugins from './plugins';
import qs from 'querystringify';
import Uploader from './uploader';
import UserStore from './userStore';

// SDK全局参数 版本号、运行环境 均由打包工具替换写入
const sdkVersion: any = '__SDK_VERSION__';

class GrowingIO implements GrowingIOType {
  public sdkVersion: string;
  public vds: string;
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
  // 当前SDK的trackingId，用于区分事件归属。
  // 有的插件可能会需要生成事件，调用了复用了build事件的方法，为了不影响SDK自身逻辑，通过trackingId来区分
  public trackingId = 'g0';
  constructor() {
    // sdk版本号
    this.sdkVersion = sdkVersion;
    this.vds = window._gio_local_vds || 'vds';
    this.utils = Object.assign({}, glodash, tools, qs);
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
  init = (options: any, callback?: (args?: any) => any) => {
    consoleText('Gio Web SDK 初始化中...', 'info');
    const { initOptions, currentPage, sendVisit, sendPage } = this.dataStore;
    // 初始化全局配置
    initOptions(options);
    // 初始化存储
    this.storage = initGlobalStorage(this.vdsConfig);
    // 初始化上报实例
    this.uploader = new Uploader(this);
    // 初始化用户实例
    this.userStore = new UserStore(this);
    // 广播基础配置初始化完成
    this.emitter?.emit(EMIT_MSG.OPTION_INITIALIZED, this);
    // 加载无埋点
    this.plugins?.gioEventAutoTracking?.main();
    // 启动页面history的hook和监听
    currentPage.hookHistory();
    // 解析当前页面
    currentPage.parsePage();
    if (this.vdsConfig.originalSource) {
      // 保存初始来源信息
      this.dataStore.setOriginalSource();
    }
    // 广播SDK初始化完成
    this.emitter?.emit(EMIT_MSG.SDK_INITIALIZED, this);
    // 标记SDK已初始化完成
    this.gioSDKInitialized = true;
    this.vdsConfig.gioSDKInitialized = true;
    window[this.vds] = this.vdsConfig;
    consoleText('Gio Web SDK 初始化完成！', 'success');
    if (this.vdsConfig.forceLogin) {
      consoleText(
        'forceLogin已开启，请调用 identify 方法设置 openId 以继续上报!',
        'info'
      );
    }
    // 先发visit和page
    if (!this.useEmbeddedInherit) {
      sendVisit();
    }
    sendPage();
    // 广播SDK初始化完全完成
    this.emitter?.emit(EMIT_MSG.SDK_INITIALIZED_COMPLATE, this);
    // 执行回调
    niceCallback(callback, this.trackingId);
  };

  // 发送visit事件（允许外部调用的手动发送visit）
  sendVisit = (props?: any, callback?: (args?: any) => any) => {
    this.dataStore.buildVisitEvent(props);
    // 执行回调
    niceCallback(callback);
  };

  // 发送page事件（允许外部调用的手动发送page）
  sendPage = (props?: any, callback?: (args?: any) => any) => {
    this.dataStore.currentPage.buildPageEvent(props);
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

  // 运行中修改配置
  setOption = (k: string, v: any, callback?: (arg?: any) => any) => {
    let r;
    if (includes(keys(ALLOW_OPTIONS), k)) {
      r = this.dataStore.setOption(k, v);
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
  getOption = (k: string, callback?: (arg?: any) => any) => {
    niceCallback(callback, this.dataStore.getOption(k));
  };

  // 设置埋点事件的通用属性（即每个埋点事件都会带上的属性值）
  setGeneralProps = (properties: any, callback?: (arg?: any) => any) => {
    let r;
    if (isObject(properties) && !isEmpty(properties)) {
      this.dataStore.generalProps = {
        ...this.dataStore.generalProps,
        ...properties
      };
      keys(this.dataStore.generalProps).forEach((k: string) => {
        if (includes([undefined, null], this.dataStore.generalProps[k])) {
          this.dataStore.generalProps[k] = '';
        }
      });
      r = true;
    } else {
      callError('setGeneralProps');
      r = false;
    }
    niceCallback(callback, r);
  };

  // 清空已设置的埋点事件的通用属性
  clearGeneralProps = (
    properties: string[] | undefined,
    callback?: (arg?: any) => any
  ) => {
    if (isArray(properties) && !isEmpty(properties)) {
      properties.forEach((prop: string) => {
        unset(this.dataStore.generalProps, prop);
      });
    } else {
      this.dataStore.generalProps = {};
    }
    niceCallback(callback);
  };

  // 获取访问用户Id（设备Id）
  getDeviceId = (callback?: (arg?: any) => any) => {
    niceCallback(callback, this.userStore.uid);
  };

  // 设置设备ID，一般为openId
  identify = (assignmentId: string | number, callback?: (arg?: any) => any) => {
    if (this.vdsConfig.forceLogin) {
      if (!verifyId(assignmentId)) {
        callError('identify');
        return;
      }
      // 截取长度
      const asId = toString(assignmentId).slice(0, 1000);
      // 在之后的请求中使用assignmentId作为uid(deviceId)使用
      this.userStore.uid = asId;
      // 为已积压的请求使用assignmentId全部赋值deviceId
      this.uploader.hoardingQueue.forEach(
        (o, i) => (this.uploader.hoardingQueue[i].deviceId = asId)
      );
      this.dataStore.setOption('forceLogin', false);
      // 发送积压队列中的请求
      this.uploader.initiateRequest();
    } else {
      callError('identify', !1, 'forceLogin未开启');
    }
    niceCallback(callback);
  };

  // 设置登录用户Id
  setUserId = (
    userId: string | number,
    userKey?: string,
    callback?: (arg?: any) => any
  ) => {
    let r;
    if (verifyId(toString(userId).trim())) {
      // 切换userId要重设session补发visit
      const prevId = this.userStore.gioId;
      // IdMapping开启，且传了userKey则需要校验并赋值（userKey要在userId之前设置，才能保证native中的值是正确的）
      if (this.vdsConfig.idMapping) {
        this.userStore.userKey =
          !isNil(userKey) && toString(userKey).length > 0
            ? toString(userKey).slice(0, 1000)
            : '';
      }
      this.userStore.userId = toString(userId).slice(0, 1000);
      // 切换用户时重置session
      if (prevId && prevId !== this.userStore.userId) {
        // 这里赋值空，实际会在userStore的set方法里重新生成一个，并通过监听自动重发visit和page
        this.userStore.sessionId = '';
      }
      r = true;
    } else {
      this.clearUserId();
      callError('setUserId');
      r = false;
    }
    niceCallback(callback, r);
  };

  // 清除登录用户Id和userKey
  clearUserId = (callback?: (arg?: any) => any) => {
    this.userStore.userId = '';
    this.userStore.userKey = '';
    niceCallback(callback);
  };

  // 发送用户变量
  setUserAttributes = (
    userAttributes: any,
    props?: any,
    callback?: (arg?: any) => any
  ) => {
    let r;
    if (!isEmpty(userAttributes) && isObject(userAttributes)) {
      const { eventContextBuilder, eventConverter } = this.dataStore;
      let event = {
        eventType: 'LOGIN_USER_ATTRIBUTES',
        attributes: limitObject(userAttributes),
        ...eventContextBuilder()
      };
      if (!isEmpty(props)) {
        event = { ...event, ...props };
      }
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
    eventName: string,
    properties: { [key: string]: string | string[] },
    props?: any,
    callback?: (arg?: any) => any
  ) => {
    eventNameValidate(eventName, () => {
      const { eventContextBuilder, eventConverter, generalProps } =
        this.dataStore;
      const mergedProperties = {
        ...generalProps,
        ...(isObject(properties) && !isEmpty(properties) ? properties : {})
      };
      let event = {
        eventType: 'CUSTOM',
        eventName,
        attributes: limitObject(getDynamicAttributes(mergedProperties)),
        ...eventContextBuilder(),
        customEventType: 1
      };
      if (!isEmpty(props)) {
        event = { ...event, ...props };
      }
      eventConverter(event);
    });
    niceCallback(callback);
  };

  // 初始化事件计时器
  trackTimerStart = (eventName: string, callback?: (arg?: any) => any) => {
    let timerId;
    if (this.vdsConfig.dataCollect) {
      eventNameValidate(eventName, () => {
        timerId = guid();
        this.dataStore.trackTimers[timerId] = {
          eventName,
          leng: 0,
          start: +Date.now()
        };
      });
    }
    niceCallback(callback, timerId);
  };

  // 暂停事件计时器
  trackTimerPause = (timerId: string, callback?: (arg?: any) => any) => {
    if (timerId && this.dataStore.trackTimers[timerId]) {
      const tracker = this.dataStore.trackTimers[timerId];
      if (tracker.start) {
        tracker.leng = tracker.leng + (+Date.now() - tracker.start);
      }
      tracker.start = 0;
    }
    niceCallback(callback);
  };

  // 恢复事件计时器
  trackTimerResume = (timerId: string, callback?: (arg?: any) => any) => {
    if (timerId && this.dataStore.trackTimers[timerId]) {
      const tracker = this.dataStore.trackTimers[timerId];
      if (tracker.start === 0) {
        tracker.start = +Date.now();
      }
    }
    niceCallback(callback);
  };

  // 停止事件计时器并上报事件
  trackTimerEnd = (
    timerId: string,
    attributes: any,
    callback?: (arg?: any) => any
  ) => {
    let r;
    if (this.vdsConfig.dataCollect) {
      const maxEnd = 60 * 60 * 24 * 1000;
      if (timerId && this.dataStore.trackTimers[timerId]) {
        const tracker = this.dataStore.trackTimers[timerId];
        if (tracker.start !== 0) {
          const shortCut = +Date.now() - tracker.start;
          tracker.leng = shortCut > 0 ? tracker.leng + shortCut : 0;
        }
        // 要直接构建custom事件，不要去调用埋点插件的方法，万一插件没有加载就发不出去了
        const { eventContextBuilder, eventConverter } = this.dataStore;
        const event = {
          eventType: 'CUSTOM',
          eventName: tracker.eventName,
          attributes: {
            ...attributes,
            event_duration: tracker.leng > maxEnd ? 0 : tracker.leng / 1000
          },
          ...eventContextBuilder(),
          customEventType: 0
        };
        eventConverter(event);
        this.removeTimer(timerId);
        r = true;
      } else {
        consoleText('未查找到对应的计时器，请检查!', 'error');
        r = false;
      }
    }
    niceCallback(callback, r);
  };

  // 移除事件计时器
  removeTimer = (timerId: string, callback?: (arg?: any) => any) => {
    if (timerId && this.dataStore.trackTimers[timerId]) {
      delete this.dataStore.trackTimers[timerId];
    }
    niceCallback(callback);
  };

  // 清除所有事件计时器
  clearTrackTimer = (callback?: (arg?: any) => any) => {
    this.dataStore.trackTimers = {};
    niceCallback(callback);
  };
}

export default GrowingIO;
