import { GrowingIOType } from '@/types/internal/growingIO';
import { GioXMLHttpRequest } from './types';
import { guid, limitObject } from '@/utils/tools';
import {
  compact,
  has,
  isArray,
  isEmpty,
  isNil,
  isObject,
  isRegExp,
  isString,
  unset,
  toString,
  typeOf
} from '@/utils/glodash';
import { consoleText } from '@/utils/tools';

/**
 * 重写对象上面的某个属性
 * @param source 需要被重写的对象
 * @param name 需要被重写对象的key
 * @param replacement 以原有的函数作为参数，执行并重写原有函数
 * @param isForced 是否强制重写（可能原先没有该属性）
 * @returns void
 */
export function rewriter(
  source: any,
  key: string,
  replacement: (...args: any[]) => any,
  isForced = false
): void {
  if (isNil(source)) return;
  if (has(source, key) || isForced) {
    const original = source[key];
    const wrapped = replacement(original);
    if (typeof wrapped === 'function') {
      source[key] = wrapped;
    }
  }
}

export default class Network {
  private buildNetworkEvent: (attributes: any) => void;
  private excludeRegExp: RegExp | string | any[];
  private originXHR: any;
  private originFetch: any;
  private gdpRequestURL: string;
  constructor(
    public growingIO: GrowingIOType,
    public options: boolean | any
  ) {
    this.buildNetworkEvent = (attributes: any) => {
      // 关闭请求监控则不发送网络事件
      if (options.network === false) {
        return;
      }
      window.setTimeout(() => {
        const { duration, url, method, status } = attributes;
        this.growingIO.plugins.gioPerformance?.buildPerfEvent(
          'apm_network_request',
          {
            response_duration: duration,
            request_address: url,
            request_method: method,
            http_code: status
          }
        );
      }, 0);
    };
    this.initOptions();
    this.hookXHR();
    this.hookFetch();
    if (!window.performance) {
      consoleText(
        '当前浏览器无法支持性能相关API，网络监测数据可能存在偏差!',
        'warn'
      );
    }
    // 重写生成地址的方法，sdk在性能分析时需要拿到主实例的请求地址做判断用
    const self = this;
    const originFunc = this.growingIO.uploader.generateURL;
    this.growingIO.uploader.generateURL = function () {
      const result = originFunc.apply(this, arguments);
      const trackingId = arguments[0];
      if (trackingId === self.growingIO.trackingId) {
        self.gdpRequestURL = result;
      }
      return result;
    };
  }

  initOptions = () => {
    if (isObject(this.options.network) && this.options.network?.exclude) {
      this.excludeRegExp = this.options.network.exclude;
    }
  };

  // 检验url是否符合过滤条件
  verifyUrl = (url: string) => {
    // 检查 url 是否为有效字符串
    if (!url || typeof url !== 'string') {
      return false;
    }
    // Gio的请求直接过滤
    if (this.gdpRequestURL && url.indexOf(this.gdpRequestURL) > -1) {
      return true;
    }
    // 正则或字符串域名数组过滤
    if (isArray(this.excludeRegExp)) {
      const verifyResult = compact(
        (this.excludeRegExp as any[]).map((re: RegExp | string) => {
          if (isRegExp(re)) {
            return (re as RegExp).test(url);
          } else if (isString(re)) {
            return url.indexOf(re as string) > -1;
          }
        })
      );
      return !isEmpty(verifyResult);
    } else if (isString(this.excludeRegExp)) {
      // 单个字符串过滤校验
      return url.indexOf(this.excludeRegExp as string) > -1;
    } else if (isRegExp(this.excludeRegExp)) {
      // 单个正则过滤校验
      return (this.excludeRegExp as RegExp).test(url);
    } else {
      return false;
    }
  };

  // 获取当前性能时间
  getTimestamp = () => {
    if (window.performance) {
      return window.performance.now();
    } else {
      return Date.now();
    }
  };

  // 重写XHR
  hookXHR = () => {
    const self = this;
    this.originXHR = window.XMLHttpRequest;
    const originXHRProto = XMLHttpRequest.prototype;
    let gioXHR: any = {};
    rewriter(originXHRProto, 'open', (originalOpen: XMLHttpRequest['open']) => {
      return function (this: GioXMLHttpRequest, ...args: any[]): void {
        this.gio_XHR_id = guid();
        // 校验过滤url
        if (!self.verifyUrl(args[1])) {
          gioXHR[this.gio_XHR_id] = {
            type: 'XHR',
            method: args[0],
            url: args[1]
          };
        }
        originalOpen.apply(this, args);
      };
    });
    rewriter(originXHRProto, 'send', (originalSend: XMLHttpRequest['send']) => {
      return function (this: GioXMLHttpRequest, ...args: any[]): void {
        // 在请求内部也进行时长的统计
        this.addEventListener('loadend', (event: any) => {
          if (this.gio_XHR_id && gioXHR[this.gio_XHR_id]) {
            gioXHR[this.gio_XHR_id] = {
              ...gioXHR[this.gio_XHR_id],
              duration:
                (event.timeStamp || self.getTimestamp()) -
                gioXHR[this.gio_XHR_id].start,
              status: this.status
            };
            self.buildNetworkEvent(gioXHR[this.gio_XHR_id]);
            unset(gioXHR, this.gio_XHR_id);
          }
        });
        this.addEventListener('error', () => {
          self.buildErrorEvent({
            error_title: 'XMLHttpRequest Error',
            error_content: this.status || 'Unknown error'
          });
        });
        if (this.gio_XHR_id && gioXHR[this.gio_XHR_id]) {
          gioXHR[this.gio_XHR_id].start = self.getTimestamp();
        }
        originalSend.apply(this, args);
      };
    });
  };

  // 重写fetch
  hookFetch = () => {
    const self = this;
    if (window.fetch) {
      this.originFetch = window.fetch;
      rewriter(window, 'fetch', (originalFetch: typeof window.fetch) => {
        return function (...args): Promise<Response> {
          const input = args[0];
          const config = args[1];
          let url = '';
          if (typeOf(input) === 'string') {
            url = input as string;
          } else {
            url = input?.url || '';
          }
          let method = 'GET';
          if (config && config.method) {
            method = config.method;
          } else if (typeOf(input) !== 'string' && input?.method) {
            method = input.method;
          }
          let gioFetch;
          // 校验过滤url
          if (!self.verifyUrl(url)) {
            gioFetch = {
              type: 'Fetch',
              method,
              url,
              start: self.getTimestamp()
            };
          }
          return originalFetch.apply(this, args).then(
            (response: Response) => {
              if (gioFetch) {
                gioFetch = {
                  ...gioFetch,
                  duration: self.getTimestamp() - gioFetch.start,
                  status: response.status
                };
                self.buildNetworkEvent(gioFetch);
              }
              return response;
            },
            (error: any) => {
              const stacks = error.stack?.split('\n') || [];
              self.buildErrorEvent({
                error_title:
                  stacks[0] || toString(error) || 'Fetch Request Error',
                error_content: gioFetch?.url || url || 'Unknown URL'
              });
              throw error;
            }
          );
        };
      });
    }
  };

  // 构建错误事件
  buildErrorEvent = (errorAttributes: any) => {
    // 关闭错误监控则不发送错误事件
    if (!this.options.exception) {
      return;
    }
    const {
      dataStore: { eventContextBuilder, eventConverter }
    } = this.growingIO;
    const event = {
      eventType: 'CUSTOM',
      eventName: 'Error',
      ...eventContextBuilder()
    };
    event.attributes = limitObject({
      ...(event.attributes ?? {}),
      ...errorAttributes
    });
    eventConverter(event);
  };

  // 销毁恢复原方法
  destroy = () => {
    if (this.originXHR) {
      window.XMLHttpRequest = this.originXHR;
    }
    if (this.originFetch && window.fetch) {
      window.fetch = this.originFetch;
    }
  };
}
