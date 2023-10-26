import {
  endsWith,
  forEach,
  isArray,
  isEmpty,
  isFunction,
  isNil,
  isObject,
  keys,
  toString,
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
export const niceTry = (fn: Function) => {
  try {
    return fn();
  } catch (e) {
    return undefined;
  }
};

// 封装过的调用callback的方法
export const niceCallback = (cb: Function, cbv?: any) => {
  if (isFunction(cb)) {
    try {
      cb(cbv);
    } catch (error) {
      consoleText(`回调执行失败！${error}`, 'error');
    }
  }
};

// 将字符串转为hash
export const hashCode = (string) => {
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
  return hash;
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

// 判断是否为IE浏览器
export const isIE = () =>
  // 通用判断
  !!window.ActiveXObject ||
  'ActiveXObject' in window ||
  // IE11以下的判断
  (navigator.userAgent.indexOf('compatible') > -1 &&
    navigator.userAgent.indexOf('MSIE') > -1) ||
  // IE11的判断
  (navigator.userAgent.indexOf('Trident') > -1 &&
    navigator.userAgent.indexOf('rv:11.0') > -1);

// 判断是否为爬虫环境
export const isBot = () => {
  return /bot|crawler|spider|scrapy|jiankongbao|slurp|transcoder|networkbench/i.test(
    navigator.userAgent.toLowerCase()
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
    forEach(o, (v, k) => {
      const key = toString(k).slice(0, 100);
      if (isObject(v)) {
        ob[key] = limitObject(v);
      } else if (isArray(v)) {
        ob[key] = v.slice(0, 100);
        ob[key] = ob[key].join('||').slice(0, 1000);
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
        properties[k] = properties[k]();
      } else if (isObject(properties[k])) {
        unset(properties, k);
      } else if (!isArray(properties[k])) {
        properties[k] = toString(properties[k]);
      }
    });
  }
  return properties;
};

// 获取gio方法
export const getGioFunction = () => {
  const vds = window._gio_local_vds || 'vds';
  const namespace = window[vds]?.namespace ?? 'gdp';
  if (isFunction(window[namespace])) {
    return window[namespace];
  } else {
    return window.gdp ?? window.gio ?? function () {};
  }
};
