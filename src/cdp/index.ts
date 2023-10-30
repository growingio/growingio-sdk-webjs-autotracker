import { CDPHandlers, deprecatedHandlers } from '@/constants/config';
import {
  cdpParamExtraCheck,
  cdpParamsEmptyCheck,
  initPreCheck,
  paramsBaseCheck
} from '@/utils/business/verifiers';
import {
  drop,
  isArray,
  isEmpty,
  isString,
  toString,
  includes,
  arrayFrom
} from '@/utils/glodash';
import { consoleText } from '@/utils/tools';

import GrowingIO from './growingIO';

let gdp;
(function () {
  // 是否已安装老Saas SDK开启了兼容模式
  let vds = window.gioCompatibilityVds ? 'gdp_vds' : 'vds';
  if (window[vds]?.gioSDKInstalled) {
    gdp = window.gdp;
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
      includes(CDPHandlers, actionName) &&
      gioInstance[actionName]
    ) {
      const args = drop(arrayFrom(arguments));
      // 初始化方法单独处理
      if (actionName === 'init') {
        const preCheckRes = initPreCheck(gioInstance);
        if (!preCheckRes) return;
        const emptyCheckRes = cdpParamsEmptyCheck(args);
        if (!emptyCheckRes) return;
        const baseCheckRes = paramsBaseCheck(args);
        if (!baseCheckRes) return;
        const extraCheckRes = cdpParamExtraCheck(args);
        if (!extraCheckRes) return;

        const { projectId } = baseCheckRes;
        const { dataSourceId, appId, cdpOptions } = extraCheckRes;
        gioInstance.init({
          ...cdpOptions,
          projectId,
          dataSourceId,
          appId
        });
      } else if (actionName === 'registerPlugins') {
        gioInstance.registerPlugins(args[0]);
      } else if (gioInstance.gioSDKInitialized && gioInstance.vdsConfig) {
        return gioInstance[actionName](...args);
      } else {
        gioInstance.emitter.emit('UNINITIALIZED_CALL', arguments);
        consoleText('SDK未初始化!', 'error');
      }
    } else if (includes(deprecatedHandlers, actionName)) {
      consoleText(`方法 ${toString(actionName)} 已被弃用，请移除!`, 'warn');
    } else {
      consoleText(`不存在名为 ${toString(actionName)} 的方法调用!`, 'error');
    }
    window[vds] = {
      ...window[vds],
      _gr_ignore_local_rule: window._gr_ignore_local_rule ?? false,
      gioEnvironment: 'cdp',
      gioSDKVersion: gioInstance.sdkVersion,
      gioSDKFull: gioInstance.gioSDKFull,
      canIUse: (functionName: string) =>
        includes(CDPHandlers, functionName) && gioInstance[functionName]
    };
  };

  const q = window?.gdp?.q;
  const e = window?.gdp?.e;
  const ef = window?.gdp?.ef;
  window.gdp = gdp;
  window.gdp.e = e;
  window.gdp.ef = ef;

  if (isArray(q) && !isEmpty(q)) {
    q.forEach((p) => {
      gdp.apply(null, p);
    });
  }
})();

export default gdp;
