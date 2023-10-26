import {
  initPreCheck,
  paramExtraCheck,
  paramsBaseCheck,
  paramsEmptyCheck
} from '@/utils/verifiers';
import {
  arrayFrom,
  drop,
  includes,
  isArray,
  isEmpty,
  isString,
  last,
  toString
} from '@/utils/glodash';
import { consoleText } from '@/utils/tools';
import { HANDLERS, DEPRECATED_HANDLERS } from '@/constants/config';
import GrowingIO from '@/core/growingIO';
import EMIT_MSG from '@/constants/emitMsg';

let gdp;
const vds = window._gio_local_vds || 'vds';
const namespace = window[vds]?.namespace ?? 'gdp';
(function () {
  if (window[vds]?.gioSDKInstalled) {
    gdp = window[namespace];
    consoleText(
      'SDK重复加载，请检查是否重复加载SDK或接入其他平台SDK导致冲突!',
      'warn'
    );
    return;
  }
  window[vds] = {
    ...(window[vds] ?? {}),
    gioSDKInstalled: true
  };

  const gioInstance: any = new GrowingIO();

  gdp = function () {
    const actionName = arguments[0];
    // 判断指令为字符串且配置项中允许调用且实例中存在的方法
    if (
      isString(actionName) &&
      includes(HANDLERS, actionName) &&
      gioInstance[actionName]
    ) {
      const args = drop(arrayFrom(arguments));
      // 初始化方法单独处理
      if (actionName === 'init') {
        const preCheckRes = initPreCheck(gioInstance);
        if (!preCheckRes) return;
        const emptyCheckRes = paramsEmptyCheck(args);
        if (!emptyCheckRes) return;
        const baseCheckRes = paramsBaseCheck(args);
        if (!baseCheckRes) return;
        const extraCheckRes = paramExtraCheck(args);
        if (!extraCheckRes) return;

        const { projectId } = baseCheckRes;
        const { dataSourceId, appId, options } = extraCheckRes;
        gioInstance.init(
          {
            ...options,
            projectId,
            dataSourceId,
            appId
          },
          last(args)
        );
      } else if (actionName === 'registerPlugins') {
        gioInstance.registerPlugins(...args);
      } else if (gioInstance.gioSDKInitialized && gioInstance.vdsConfig) {
        return gioInstance[actionName](...args);
      } else {
        gioInstance.emitter.emit(EMIT_MSG.UN_EXECUTE_CALL, arguments);
        consoleText('SDK未初始化!', 'error');
      }
    } else if (includes(DEPRECATED_HANDLERS, actionName)) {
      consoleText(`方法 ${toString(actionName)} 已被弃用，请移除!`, 'warn');
    } else {
      consoleText(`不存在名为 ${toString(actionName)} 的方法调用!`, 'error');
    }
    window[vds] = {
      ...window[vds],
      _gr_ignore_local_rule: window._gr_ignore_local_rule ?? false,
      gioSDKVersion: gioInstance.sdkVersion,
      gioSDKFull: gioInstance.gioSDKFull,
      canIUse: (functionName: string) =>
        includes(HANDLERS, functionName) && gioInstance[functionName]
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
    Array.from(new Array(q.length)).forEach(() => {
      gdp.apply(null, q.shift());
    });
  }
})();

export default gdp;
