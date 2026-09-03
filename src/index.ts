import { initialCheck } from '@/utils/verifiers';
import {
  arrayFrom,
  drop,
  includes,
  isArray,
  isEmpty,
  isString,
  toString
} from '@/utils/glodash';
import { consoleText, niceTry } from '@/utils/tools';
import {
  HANDLERS,
  DEPRECATED_HANDLERS,
  INSTANCE_HANDLERS
} from '@/constants/config';
import GrowingIO from '@/core/growingIO';
import EMIT_MSG from '@/constants/emitMsg';

// 导出类型定义
export type {
  // API 类型 (用户直接使用)
  InitOptions,
  PageAttributes,
  UserAttributes,
  EventAttributes,
  TrackEventParams,
  TimerEventParams,
  ABTestCallback,
  CommonCallback,
  BeforeSendListener,
  PageListenerCallback,
  GrowingIOInstance,
  GrowingIO,
  Gdp,
  // 内部类型
  GrowingIOType,
  PluginItem,
  PluginsType,
  OriginOptions,
  DataStoreType,
  UserOptions,
  StorageKeyType,
  StorageType,
  UploaderType,
  UserStoreType,
  PageType,
  EVENT_TYPES,
  EVENT,
  EXTEND_EVENT
} from '@/types';

let gdp;
let gioInstance: any;
const vdsName = window._gio_local_vds || 'vds';
const namespace = window[vdsName]?.namespace ?? 'gdp';
(function () {
  if (window[vdsName]?.gioSDKInstalled) {
    gdp = window[namespace];
    consoleText(
      'SDK重复加载，请检查是否重复加载SDK或接入其他平台SDK导致冲突!',
      'warn'
    );
    return;
  }
  window[vdsName] = {
    ...(window[vdsName] ?? {}),
    gioSDKInstalled: true
  };

  const createGioInstance = () => {
    gioInstance = new GrowingIO();
    return gioInstance;
  };
  const resetVdsConfig = () => {
    window[vdsName] = {
      gioSDKInstalled: true,
      namespace
    };
  };
  createGioInstance();
  const canIUse = (handlerName: string) =>
    includes(HANDLERS, handlerName) && !!gioInstance?.[handlerName];
  gdp = function (...args) {
    const handlerName = args[0];
    const rejectCommand = (message: string) => {
      consoleText(`SDK调用失败，${message}`, 'error');
      return false;
    };
    if (!isString(handlerName) || !handlerName.trim()) {
      return rejectCommand('方法名必须为非空字符串!');
    }
    const handlerParts = handlerName.split('.');
    if (
      handlerName !== handlerName.trim() ||
      handlerParts.length > 2 ||
      (handlerParts.length === 2 && (!handlerParts[0] || !handlerParts[1]))
    ) {
      return rejectCommand(`方法名 ${handlerName} 格式不正确!`);
    }
    let trackingId = 'g0';
    let handler = handlerName;
    if (handlerParts.length === 2) {
      trackingId = handlerParts[0];
      handler = handlerParts[1];
      // 只有实例方法和多实例初始化允许带 trackingId；直接方法不能被伪装为实例方法调用。
      if (handler !== 'init' && !includes(INSTANCE_HANDLERS, handler)) {
        return rejectCommand(`方法 ${handlerName} 不支持实例前缀!`);
      }
    }
    if (handler === 'destroy') {
      if (!gioInstance) {
        return true;
      }
      const result = gioInstance.destroy();
      if (result) {
        resetVdsConfig();
        gioInstance = undefined;
      }
      return result;
    } else if (handler === 'init') {
      const instance = gioInstance ?? createGioInstance();
      const argus = drop(arrayFrom(args));
      const initialCheckRes: any = initialCheck(instance, argus);
      if (initialCheckRes) {
        const { projectId, dataSourceId, appId, userOptions } = initialCheckRes;
        return instance.init({
          ...userOptions,
          projectId,
          dataSourceId,
          appId: appId || userOptions.appId,
          trackingId
        });
      }
      return false;
    } else if (handler === 'registerPlugins') {
      const instance = gioInstance ?? createGioInstance();
      instance.registerPlugins(...drop(arrayFrom(args)));
    } else if (
      isString(handler) &&
      includes(HANDLERS, handler) &&
      gioInstance?.[handler]
    ) {
      const argus = drop(arrayFrom(args));
      if (includes(['setGeneralProps', 'clearGeneralProps'], handler)) {
        gioInstance[handler](trackingId, ...argus);
      } else if (gioInstance.gioSDKInitialized && gioInstance.vdsConfig) {
        if (includes(INSTANCE_HANDLERS, handler)) {
          niceTry(() =>
            gioInstance.handlerDistribute(trackingId, handler, argus)
          );
        } else {
          niceTry(() => gioInstance[handler](...argus));
        }
      } else {
        gioInstance.emitter.emit(EMIT_MSG.UN_EXECUTE_CALL, args);
        consoleText('SDK未初始化!', 'error');
      }
    } else if (includes(DEPRECATED_HANDLERS, handler)) {
      consoleText(`方法 ${toString(handler)} 已被弃用，请移除!`, 'warn');
      return false;
    } else if (handler === 'canIUse') {
      return canIUse(args[1]);
    } else {
      consoleText(`不存在名为 ${toString(handler)} 的方法调用!`, 'error');
      return false;
    }
    window[vdsName] = {
      ...window[vdsName],
      _gr_ignore_local_rule: window._gr_ignore_local_rule ?? false,
      gioSDKVersion: gioInstance.sdkVersion,
      gioSDKFull: gioInstance.gioSDKFull,
      canIUse
    };
  };

  const q = (window[namespace] as any)?.q;
  const e = (window[namespace] as any)?.e;
  const ef = (window[namespace] as any)?.ef;
  window[namespace] = gdp;
  (window[namespace] as any).e = e;
  (window[namespace] as any).ef = ef;
  window.gdp = gdp;
  window.gdp.e = e;
  window.gdp.ef = ef;

  if (isArray(q) && !isEmpty(q)) {
    const ql = q.length;
    for (let i = 0; i < ql; i += 1) {
      gdp.apply(null, q.shift());
    }
  }
})();

export default gdp;
