/**
 * 代码中一些通用的或者业务上的校验器
 */
import { EVENT_NAME_REG } from '@/constants/regex';
import { GrowingIOType } from '@/types/growingIO';
import { isEmpty, isNumber, isString, toString } from '@/utils/glodash';
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

export const initialCheck = (growingIO: GrowingIOType, args: any) => {
  // ?重复初始化由init方法内部判断
  // 参数为空校验
  const userOptions = (args.length === 4 ? args[3] : args[2]) || {};
  if (!args[0] || !args[1]) {
    consoleText(
      'SDK初始化失败，请使用 gdp("init", "您的GrowingIO项目 accountId", "您项目的 dataSourceId", "您的小程序 AppId（可选）", options: { host: "您的数据上报地址host" }); 进行初始化!',
      'error'
    );
    return false;
  }
  return {
    projectId: toString(args[0]),
    dataSourceId: toString(args[1]),
    appId: toString(args.length === 4 ? args[2] : ''),
    userOptions
  };
};

// 埋点事件名校验
export const eventNameValidate = (eventName: string, callback: () => void) => {
  if (
    isString(eventName) &&
    !isEmpty(eventName) &&
    eventName.match(EVENT_NAME_REG)
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
