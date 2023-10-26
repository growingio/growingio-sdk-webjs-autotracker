/**
 * 代码中一些通用的或者业务上的校验器
 */
import { EventNameReg } from '@/constants/regex';
import { GrowingIOType } from '@/types/growingIO';
import {
  compact,
  head,
  includes,
  isEmpty,
  isNumber,
  isObject,
  isString,
  last,
  toString
} from '@/utils/glodash';
import { consoleText } from '@/utils/tools';

/**
 * 一些id的合法性校验
 * @param id // 只允许数字和字符串，不允许为空字符串、0、负数
 */

export const verifyId = (o: string | number) =>
  (isString(o) && (o as string).length > 0) ||
  (isNumber(o) && (o as number) > 0);

/**
 * 初始化时的一些合法性校验
 */

export const initPreCheck = (growingIO: GrowingIOType) => {
  // 重复初始化校验
  if (
    growingIO.vdsConfig ||
    growingIO.gioSDKInitialized ||
    window[growingIO.vds]?.gioSDKInitialized
  ) {
    consoleText(
      'SDK重复初始化，请检查是否重复加载SDK或接入其他平台SDK导致冲突!',
      'warn'
    );
    return false;
  }
  // 本地环境初始化校验
  if (
    includes(['', 'localhost', '127.0.0.1'], location.hostname) &&
    !window._gr_ignore_local_rule
  ) {
    consoleText('当前SDK不允许在本地环境初始化!', 'warn');
    return false;
  }
  return true;
};

// 参数为空校验
export const paramsEmptyCheck = (args: any) => {
  if (isEmpty(compact(args))) {
    consoleText(
      'SDK初始化失败，请使用 gdp("init", "您的GrowingIO项目 accountId", "您项目的 dataSourceId", options); 进行初始化!',
      'error'
    );
    return false;
  }
  return true;
};

// 基础共用参数校验（projectId、userOptions）
export const paramsBaseCheck = (args: any) => {
  const projectId: string = head(args);
  let userOptions: object = last(args);
  // 参数校验（projectId）
  if (!verifyId(toString(projectId).trim())) {
    consoleText('SDK初始化失败，accountId 参数不合法!', 'error');
    return false;
  }
  // 参数校验（userOptions）
  if (!isObject(userOptions) || !userOptions) {
    userOptions = {};
  }
  return { projectId, userOptions };
};

// 额外的参数校验（校验dataSourceId、AppId）
export const paramExtraCheck = (args: any) => {
  // 参数校验（dataSourceId）
  const dataSourceId: string = args[1];
  const appId: string = args[2];
  const options: any = last(args);
  if (!dataSourceId || !isString(dataSourceId)) {
    consoleText('SDK初始化失败，dataSourceId 参数不合法!', 'error');
    return false;
  }
  return { dataSourceId, appId: isString(appId) ? appId : '', options };
};

// 埋点事件名校验
export const eventNameValidate = (eventName: string, callback: () => void) => {
  if (
    isString(eventName) &&
    !isEmpty(eventName) &&
    eventName.match(EventNameReg)
  ) {
    return callback();
  } else {
    consoleText(
      '事件名格式不正确，只能包含数字、字母和下划线，且不能以数字开头，字符总长度不能超过100!',
      'error'
    );
    return false;
  }
};
