import { IPReg, URLReg } from '@/constants/regex';
import BaseGrowingIO from '@/core/growingIO';
import UserStore from '@/core/userStore';
import { guid } from '@/utils/business/core';
import { verifyId } from '@/utils/business/verifiers';
import {
  compact,
  isArray,
  isEmpty,
  isFunction,
  isNil,
  isObject,
  includes,
  toString
} from '@/utils/glodash';
import { consoleText, eventNameValidate } from '@/utils/tools';

import DataStore from './dataStore';
import Uploader from './uploader';

class GrowingIO extends BaseGrowingIO {
  constructor() {
    super();
    this.dataStore = new DataStore(this);
  }

  // 手动注册插件
  registerPlugins = (plugins: any) => {
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
  };

  initCallback = () => {
    // 初始化上报实例
    this.uploader = new Uploader(this);
    // 初始化用户实例
    this.userStore = new UserStore(this);
  };

  // 获取所有已注册插件
  getPlugins = () => this.plugins.pluginItems;

  // 修改scheme方法（兼容性保留，后续迭代可能会移除，建议使用setOption，删除时记得删除constans->config中配置）
  setTrackerScheme = (scheme: 'http' | 'https') => {
    if (includes(['http', 'https'], scheme)) {
      this.dataStore.setOption('scheme', scheme);
      this.notRecommended();
    } else {
      this.callError('scheme', !1);
    }
  };

  // 修改host方法（兼容性保留，后续迭代可能会移除，建议使用setOption，删除时记得删除constans->config中配置）
  setTrackerHost = (host: string) => {
    if (IPReg.test(host) || URLReg.test(host)) {
      this.dataStore.setOption('host', host);
      this.notRecommended();
    } else {
      this.callError('host', !1);
    }
  };

  // 数据上报开关（兼容性保留，后续迭代可能会移除，建议使用setOption，删除时记得删除constans->config中配置）
  setDataCollect = (v: boolean) => {
    this.setOption('dataCollect', !!v);
    this.notRecommended();
  };

  // 无埋点数据开关（兼容性保留，后续迭代可能会移除，建议使用setOption，删除时记得删除constans->config中配置）
  setAutotrack = (v: boolean) => {
    this.setOption('autotrack', !!v);
    this.notRecommended();
  };

  // debug开关（兼容性保留，后续迭代可能会移除，建议使用setOption，删除时记得删除constans->config中配置）
  enableDebug = (v: boolean) => {
    this.setOption('debug', !!v);
    this.notRecommended();
  };

  // hashtag开关（兼容性保留，后续迭代可能会移除，建议使用setOption，删除时记得删除constans->config中配置）
  enableHT = (v: boolean) => {
    this.setOption('hashtag', !!v);
    this.notRecommended();
  };

  // 获取访问用户Id（兼容性保留，后续迭代可能会移除，建议使用getDeviceId，删除时记得删除constans->config中配置）
  getVisitorId = () => this.userStore.uid;

  // 获取访问用户Id
  getDeviceId = () => this.userStore.uid;

  // 发送用户变量
  setUserAttributes = (userAttributes: any, props?: any) => {
    if (!isEmpty(userAttributes) && isObject(userAttributes)) {
      this.plugins?.gioCustomTracking?.buildUserAttributesEvent(
        userAttributes,
        props
      );
    } else {
      this.callError('setUserAttributes');
    }
  };

  // 设置登录用户Id
  setUserId = (userId: string | number, userKey?: string) => {
    if (verifyId(toString(userId).trim())) {
      // 切换userId要重设session补发visit
      const prevId = this.userStore.gioId;
      // IdMapping开启，且传了userKey则需要校验并赋值（userKey要在userId之前设置，才能保证native中的值是正确的）
      if (this.vdsConfig.enableIdMapping) {
        this.userStore.userKey =
          !isNil(userKey) && toString(userKey).length > 0
            ? toString(userKey).slice(0, 1000)
            : '';
      }
      this.userStore.userId = toString(userId).slice(0, 1000);
      // 切换用户时重置session
      if (prevId && prevId !== this.userStore.userId) {
        // 这里赋值空，实际会在userStore的set方法里重新生成一个
        this.userStore.sessionId = '';
      }
      // ANLSPI-3592 按要求修改setUserId不再补发事件
      // 用户登录，补发visit
      // if (!prevId && prevId !== userId) {
      //   this.dataStore.sendVisit(true);
      // }
    } else {
      this.clearUserId();
      this.callError('setUserId');
    }
  };

  // 清除登录用户Id和userKey
  clearUserId = () => {
    this.userStore.userId = '';
    this.userStore.userKey = '';
  };

  // 创建自定义埋点事件
  track = (
    name: string,
    properties: { [key: string]: string | string[] },
    items?: { key: string; id: string },
    props?: any
  ) => {
    const customEvent =
      this.plugins?.gioCustomTracking?.buildCustomEvent || function () {};
    customEvent(
      name,
      {
        ...this.dataStore.generalProps,
        ...(isObject(properties) && !isEmpty(properties) ? properties : {})
      },
      items,
      props
    );
  };

  // 发送page事件（允许外部调用的手动发送page）
  sendPage = (props?: any) => this.dataStore.currentPage.buildPageEvent(props);

  // 发送visit事件（允许外部调用的手动发送visit）
  sendVisit = (props?: any) => this.dataStore.buildVisitEvent(props);

  // 初始化事件计时器
  trackTimerStart = (eventName: string, fn: (timerId: string) => void) => {
    if (this.vdsConfig.dataCollect) {
      eventNameValidate(eventName, () => {
        const timerId = guid();
        if (isFunction(fn)) {
          this.dataStore.trackTimers[timerId] = {
            eventName,
            leng: 0,
            start: +Date.now()
          };
          fn(timerId);
        } else {
          consoleText('回调方法不合法，返回timerId失败!');
        }
      });
    }
  };

  // 暂停事件计时器
  trackTimerPause = (timerId: string) => {
    if (timerId && this.dataStore.trackTimers[timerId]) {
      const tracker = this.dataStore.trackTimers[timerId];
      if (tracker.start) {
        tracker.leng = tracker.leng + (+Date.now() - tracker.start);
      }
      tracker.start = 0;
    }
  };

  // 恢复事件计时器
  trackTimerResume = (timerId: string) => {
    if (timerId && this.dataStore.trackTimers[timerId]) {
      const tracker = this.dataStore.trackTimers[timerId];
      if (tracker.start === 0) {
        tracker.start = +Date.now();
      }
    }
  };

  // 停止事件计时器并上报事件
  trackTimerEnd = (timerId: string, attributes: any) => {
    if (this.vdsConfig.dataCollect) {
      const maxEnd = 60 * 60 * 24 * 1000;
      if (timerId && this.dataStore.trackTimers[timerId]) {
        const tracker = this.dataStore.trackTimers[timerId];
        if (tracker.start !== 0) {
          const shortCut = +Date.now() - tracker.start;
          tracker.leng = shortCut > 0 ? tracker.leng + shortCut : 0;
        }
        this.track(tracker.eventName, {
          ...attributes,
          event_duration: tracker.leng > maxEnd ? 0 : tracker.leng / 1000
        });
        this.removeTimer(timerId);
      } else {
        consoleText('未查找到对应的计时器，请检查!', 'error');
      }
    }
  };

  // 移除事件计时器
  removeTimer = (timerId: string) => {
    if (timerId && this.dataStore.trackTimers[timerId]) {
      delete this.dataStore.trackTimers[timerId];
    }
  };

  // 清除所有事件计时器
  clearTrackTimer = () => {
    this.dataStore.trackTimers = {};
  };
}

export default GrowingIO;
