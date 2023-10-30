import { endsWith, get, isNaN } from '@/utils/glodash';
import { niceTry } from '../tools';

// 生成uuid
export const guid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 获取语言
export const getLanguage = (): string => {
  let language: string =
    get(window, 'navigator.language') ||
    get(window, 'navigator.browserLanguage') ||
    '';
  if (language) {
    language = language.toLowerCase();
  }
  return language;
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

// 获取实际的存储key（需要加密的会在key后面加'_gioenc'）
export const getActualKey = (k: string) =>
  endsWith(k, '_gioenc') ? k.slice(0, -7) : k;

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

// 判断是否为老旧Chrome
export const isOldChrome = () => {
  const version = Number(navigator.userAgent.match(/chrome\/(\d+)/i)[1]);
  if (version && !isNaN(version)) {
    return version < 45;
  } else {
    return false;
  }
};

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
