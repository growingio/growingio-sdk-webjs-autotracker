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

let gdp;
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

  const gioInstance: any = new GrowingIO();
  const canIUse = (handlerName: string) =>
    includes(HANDLERS, handlerName) && !!gioInstance[handlerName];
  gdp = function (...args) {
    const handlerName = args[0];
    let trackingId = 'g0';
    let handler = handlerName;
    if (handlerName.indexOf('.') > -1) {
      trackingId = handlerName.split('.')[0] ?? 'g0'; // 没有指定trackingId，默认为g0
      handler = handlerName.split('.')[1];
    }
    if (
      isString(handler) &&
      includes(HANDLERS, handler) &&
      gioInstance[handler]
    ) {
      const argus = drop(arrayFrom(args));
      // 初始化方法单独处理
      if (handler === 'init') {
        const initialCheckRes: any = initialCheck(gioInstance, argus);
        if (initialCheckRes) {
          const { projectId, dataSourceId, appId, userOptions } =
            initialCheckRes;
          // 返回初始化结果
          return gioInstance.init({
            ...userOptions,
            projectId,
            dataSourceId,
            appId: appId || userOptions.appId,
            trackingId
          });
        } else {
          return false;
        }
      } else if (handler === 'registerPlugins') {
        gioInstance.registerPlugins(...argus);
      } else if (includes(['setGeneralProps', 'clearGeneralProps'], handler)) {
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
    } else if (handler === 'canIUse') {
      return canIUse(args[1]);
    } else {
      consoleText(`不存在名为 ${toString(handler)} 的方法调用!`, 'error');
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
