import {
  forEach,
  isArray,
  isEmpty,
  isFunction,
  isNil,
  isObject,
  isString,
  keys,
  toString,
  unset
} from '@/utils/glodash';

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
        if (window.vds?.gioEnvironment === 'cdp') {
          ob[key] = ob[key].join('||').slice(0, 1000);
        }
      } else {
        ob[key] = !isNil(v) ? toString(v).slice(0, 1000) : '';
      }
    });
  }
  return ob;
};

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

// 埋点事件名校验
export const eventNameValidate = (eventName: string, callback: () => void) => {
  if (
    isString(eventName) &&
    !isEmpty(eventName) &&
    eventName.match(/^[a-zA-Z_][0-9a-zA-Z_]{0,100}$/)
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

// 获取gio方法
export const getGioFunction = () => {
  const vds = (window as any)._gio_local_vds || 'vds';
  const namespace = (window[vds] as any)?.namespace ?? 'gdp';
  if (isFunction(window[namespace])) {
    return window[namespace];
  } else {
    return window.gdp ?? window.gio ?? function () {};
  }
};
