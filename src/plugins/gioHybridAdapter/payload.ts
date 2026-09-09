import { forEach, isArray, isObject, toString, unset } from '@/utils/glodash';

const isPlainObject = (value: any) =>
  isObject(value) && Object.prototype.toString.call(value) === '[object Object]';

/**
 * 复制 Native 上报前会被修改的普通对象和数组。
 *
 * 事件中的 Date、DOM 节点等特殊对象保持原引用；普通对象与数组按层复制，使字段字符串化
 * 不会改写 Uploader 继续使用的 Web 事件。祖先栈只检测当前递归路径，因此共享子对象可以
 * 被正常复制，循环引用会在递归前抛出明确错误。
 */
export const cloneNativePayload = (data: any) => {
  const ancestors: any[] = [];
  const clone = (value: any): any => {
    if (!isArray(value) && !isPlainObject(value)) {
      return value;
    }
    if (ancestors.indexOf(value) >= 0) {
      throw new TypeError('Native event payload contains a circular reference');
    }
    ancestors.push(value);
    const result: any = isArray(value) ? [] : {};
    forEach(value, (child, key) => {
      result[key] = clone(child);
    });
    ancestors.pop();
    return result;
  };
  return clone(data);
};

/**
 * 将 Native 事件对象的字段规范化为 Bridge 协议使用的字符串。
 *
 * 顶层标量转换为字符串；对象或数组的一层成员中，标量转换为字符串，嵌套对象和数组
 * JSON 序列化为字符串。调用者必须传入可修改的独立副本。
 */
export const normalizeHybridAttributes = (data: any) => {
  forEach(data, (value, key) => {
    if (isObject(value) || isArray(value)) {
      forEach(data[key], (child, childKey) => {
        data[key][childKey] =
          isObject(child) || isArray(child)
            ? JSON.stringify(child)
            : toString(child);
      });
    } else {
      data[key] = toString(value);
    }
  });
  return data;
};

/** 为 Native 生成独立且可直接 JSON 序列化的事件负载，不修改 Web 上报事件。 */
export const prepareNativePayload = (data: any) => {
  const nativeData = cloneNativePayload(data);
  // 与 Web 上报一致，内部路由和请求字段不发送给 Native。
  unset(nativeData, ['trackingId', 'requestId', 'requestType']);
  return normalizeHybridAttributes(nativeData);
};
