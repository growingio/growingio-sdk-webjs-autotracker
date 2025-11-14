import {
  compact,
  endsWith,
  forEach,
  formatDate,
  has,
  includes,
  isArray,
  isDate,
  isEmpty,
  isFunction,
  isNil,
  isNumber,
  isObject,
  keys,
  startsWith,
  toString,
  typeOf,
  unset
} from '@/utils/glodash';

// 生成uuid
export const guid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 控制台打印提示信息，包含错误、警告和信息3种形式
export const consoleText = (
  msg: string,
  type?: 'info' | 'success' | 'error' | 'warn'
) => {
  const styles = {
    info: 'color: #3B82F6;',
    error: 'color: #EF4444;',
    warn: 'color: #F59E0B;',
    success: 'color: #10B981;'
  };
  console.log(`%c [GrowingIO]：${msg}`, styles[type] || '');
};

// 优化过的try...catch包裹体
export const niceTry = <T>(
  fn: (...args: any[]) => T,
  ...args: any[]
): T | undefined => {
  try {
    return fn(...args);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return undefined;
  }
};

// 封装过的调用callback的方法
export const niceCallback = (cb: (...args: any[]) => void, ...args: any[]) => {
  if (isFunction(cb)) {
    try {
      cb(...args);
    } catch (error) {
      consoleText(`回调执行失败！${error}`, 'error');
    }
  }
};

// 将字符串转为hash
export const hashCode = (string: string, abs = false) => {
  let hash = 0;
  if (isEmpty(string) || typeof string === 'boolean') {
    return hash;
  }
  let i = 0;
  while (i < string.length) {
    const char = string.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; //Convert to 32bit integer
    i++;
  }
  return abs ? Math.abs(hash) : hash;
};

// 检查插件项是否合法
export const checkPluginItem = (pluginItem: any, index?: number) => {
  if (
    isEmpty(pluginItem) ||
    isNil(pluginItem) ||
    !pluginItem.name ||
    !isFunction(pluginItem.method)
  ) {
    consoleText(
      `插件不合法，跳过加载! ${isNumber(index) ? 'index' + index : ''}`,
      'warn'
    );
    return false;
  }
  return true;
};

// 检查sendBeacon是否支持
export const supportBeacon = (): boolean => {
  const hasBeacon = !!window?.navigator?.sendBeacon;
  const ua = window.navigator.userAgent;
  if (ua.match(/(iPad|iPhone|iPod)/g)) {
    const iOSVersion = getIOSVersion(ua);
    // iOS 13以下不支持或有bug，因此判断支持从13开始
    return hasBeacon && iOSVersion > 13;
  }
  return hasBeacon;
};

// 获取iOS的版本
export const getIOSVersion = (useragent: string): number => {
  const ua = useragent.toLowerCase();
  const matches = ua.match(/cpu.*os (.*?) like mac os/i);
  if (!matches || matches.length < 2) {
    return 0;
  }
  return +matches[1].split('_').slice(0, 2).join('.');
};

// 判断是否为Safari浏览器
export const isSafari = () => {
  const ua = window.navigator.userAgent;
  const safariReg = /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i;
  const chromeReg = /chrome\/(\d+\.\d+)/i;
  return safariReg.test(ua) && !chromeReg.test(ua);
};

// 判断是否为爬虫环境
export const isBot = () => {
  return /bot|crawler|spider|scrapy|jiankongbao|slurp|transcoder|networkbench/i.test(
    navigator.userAgent.toLowerCase()
  );
};

// 检测当前环境是否支持Promise
export const isPromiseSupported = (): boolean => {
  return (
    typeof Promise !== 'undefined' &&
    Promise.toString().indexOf('[native code]') !== -1
  );
};

// 失败提示
export const callError = (fn: string, type = true, msg = '参数不合法') =>
  consoleText(`${type ? '调用' : '设置'} ${fn} 失败，${msg}!`, 'warn');

// 事件监听
export const addListener = (
  element: any, // 被监听的元素
  eventType: string, // 事件类型
  eventHandler: any, // 事件处理方法
  options = {} as any
) => {
  const defaultOption = { capture: true };
  if ((document as any).addEventListener) {
    element.addEventListener(eventType, eventHandler, {
      ...defaultOption,
      ...options
    });
  } else if (element.attachEvent) {
    element.attachEvent('on' + eventType, eventHandler);
  } else {
    element['on' + eventType] = eventHandler;
  }
};

// 获取实际的存储key（需要加密的会在key后面加'_gioenc'）
export const getActualKey = (k: string) =>
  endsWith(k, '_gioenc') ? k.slice(0, -7) : k;

// 尝试格式化存储里拿出来的值
export const parseStorageValue = (v: string) => {
  // 尝试格式化成数字，不是就尝试JSON.parse
  if (isNaN(Number(v))) {
    return niceTry(() => JSON.parse(v)) || v;
  } else {
    // 不是就不尝试格式化，避免被格式化成Infinity
    return v;
  }
};

// Object参数限制
export const limitObject = (o: any) => {
  const ob = {};
  if (isObject(o)) {
    // 移除预置的'&&sendTo'字段
    unset(o, '&&sendTo');
    forEach(o, (v, k) => {
      const key = toString(k).slice(0, 100);
      if (isObject(v)) {
        ob[key] = limitObject(v);
      } else if (isArray(v)) {
        ob[key] = compact(v.slice(0, 100), true);
        ob[key] = ob[key].join('||').slice(0, 1000);
      } else if (isDate(v)) {
        ob[key] = formatDate(v);
      } else {
        ob[key] = !isNil(v) ? toString(v).slice(0, 1000) : '';
      }
    });
  }
  return ob;
};

// 扁平化对象(拍平一层，剩下的直接转成字符串，且自动移除空值)
export const flattenObject = (obj: any = {}) => {
  const t = { ...obj };
  keys(t).forEach((k) => {
    if (isObject(t[k])) {
      keys(t[k]).forEach((ik) => {
        t[`${k}_${ik}`] = toString(t[k][ik]);
      });
      unset(t, k);
    } else if (isArray(t[k])) {
      t[k].forEach((v, i) => {
        if (isObject(v)) {
          keys(v).forEach((ik: string) => {
            t[`${k}_${i}_${ik}`] = toString(v[ik]);
          });
        } else {
          t[`${k}_${i}`] = toString(v);
        }
      });
      unset(t, k);
    } else if (isNil(t[k]) || t[k] === '') {
      unset(t, k);
    } else {
      t[k] = toString(t[k]);
    }
  });
  return limitObject(t);
};

// 比较两个正式的版本号，v1>v2返回1，v1<v2返回-1，v1=v2返回0
export const compareVersion = (v1: string, v2: string) => {
  const rpSpace = (s) => s.replace(/\s+/g, '');
  const rpV = (s) => s.replace(/[vV]/g, '');
  const nv1 = rpSpace(rpV(v1));
  const nv2 = rpSpace(rpV(v2));
  const nv1Array = nv1.split('.');
  const nv2Array = nv2.split('.');
  for (let i = 0; i < 3; i++) {
    let na = Number(nv1Array[i]);
    let nb = Number(nv2Array[i]);
    if (na > nb) return 1;
    if (nb > na) return -1;
    if (!isNaN(na) && isNaN(nb)) return 1;
    if (isNaN(na) && !isNaN(nb)) return -1;
  }
  return 0;
};

// 获取动态属性的值
export const getDynamicAttributes = (properties: any) => {
  if (!isNil(properties)) {
    keys(properties).forEach((k: string) => {
      if (isFunction(properties[k])) {
        properties[k] = niceTry(() => properties[k]());
      } else if (isObject(properties[k])) {
        unset(properties, k);
      } else if (!isArray(properties[k])) {
        properties[k] = toString(properties[k]);
      }
    });
  }
  return properties;
};

// 获取vds
export const getVds = () => {
  const vdsName = window._gio_local_vds || 'vds';
  return window[vdsName] ?? {};
};

// 获取gio方法
export const getGioFunction = () => {
  const namespace = getVds()?.namespace ?? 'gdp';
  if (isFunction(window[namespace])) {
    return window[namespace];
  } else {
    return window.gdp ?? window.gio ?? function () {};
  }
};

// 获取主实例的实例id
export const getMainTrackingId = () => {
  const vds = getVds();
  return vds.trackingId ?? 'g0';
};

// 手动解析地址参数
// 以前用querystringify库，但是parse会自动decode参数，会导致最后拼回去的时候可能不是客户想要的值
export const queryParse = (search: string) => {
  if (startsWith(search, '?') || includes(search, ['=', '&'])) {
    const qsValues = {};
    const orderKeys: string[] = [];
    if (startsWith(search, '?')) {
      search = search.substring(1);
    }
    const kvArray = search.split('&');
    kvArray.forEach((s: string) => {
      const kvPairs = s.split('=');
      const key = kvPairs[0];
      const value = kvPairs[1] ?? '';
      if (!isNil(key) && key !== '') {
        qsValues[key] = value;
        orderKeys.push(key);
      }
    });
    return { ...qsValues, __GIO_ORDER__: orderKeys };
  } else {
    return decodeURIComponent(search);
  }
};

// 手动拼接地址参数
// 以前用querystringify库，但是stringify会自动encode参数，会导致最后拼回去的时候可能不是客户想要的值
export const queryStringify = (value: any, prefix = false) => {
  if (typeOf(value) === 'object') {
    let s = '';
    const vKeys: string[] = value.__GIO_ORDER__ || keys(value);
    vKeys.forEach((k) => {
      if (k === '__GIO_ORDER__' || !has(value, k)) return;
      if (s === '') {
        s = (prefix ? '?' : '') + `${k}=${value[k]}`;
      } else {
        s += `&${k}=${value[k]}`;
      }
    });
    return s;
  }
  if (typeOf(value) === 'string') {
    return encodeURIComponent(value);
  }
};
