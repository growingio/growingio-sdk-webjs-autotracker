import { EVENT } from '@/types/events';
import { GrowingIOType } from '@/types/growingIO';
import { includes, isEmpty, unset, startsWith } from '@/utils/glodash';
import { isSafari, supportBeacon } from '@/utils/tools';
import { UploaderType } from '@/types/uploader';
import EMIT_MSG from '@/constants/emitMsg';

class Uploader implements UploaderType {
  // 因forceLogin配置积压的事件请求队列
  public hoardingQueue: any[];
  // 请求队列
  public requestQueue: any[];
  // 请求限制最大数
  public requestLimit: number;
  // 请求超时时间(ms)
  public requestTimeout: number;
  // 请求重试限制最大数
  public retryLimit: number;
  // 请求重试的原请求id
  public retryIds: any;
  // 请求中的请求数
  public requestingNum: number;
  // 请求地址
  public requestURL: string;
  // 是否加密压缩
  public compressType: '0' | '1';

  constructor(public growingIO: GrowingIOType) {
    this.hoardingQueue = [];
    this.requestQueue = [];
    this.requestLimit = 10;
    this.requestTimeout = 5000;
    this.retryLimit = 1; // 重试一次，算上一开始的发送，每种发送方式会发两次，还失败自动降级
    this.retryIds = {};
    this.requestingNum = 0;
    this.requestURL = this.generateHost();
  }

  // 生成上报接口地址
  generateHost = () => {
    const { serverUrl, projectId } = this.growingIO.vdsConfig;
    if (!startsWith(serverUrl, 'http')) {
      return `https://${serverUrl}/v3/projects/${projectId}/collect`;
    } else {
      return `${serverUrl}/v3/projects/${projectId}/collect`;
    }
  };

  // 获取上报方式
  getSendType = () => {
    const { sendType } = this.growingIO.vdsConfig;
    if (sendType === 'beacon') {
      return supportBeacon() ? 'beacon' : 'xhr';
    } else {
      return sendType;
    }
  };

  // 提交请求（将请求按队列进行管理）
  commitRequest = (commitData: EVENT, sendURL?: string) => {
    const { forceLogin } = this.growingIO.vdsConfig;
    const data: any = { ...commitData, requestType: this.getSendType() };
    // 如果开启forceLogin 则将请求推入积压队列，反之则进入请求队列
    if (forceLogin) {
      this.hoardingQueue.push(data);
    } else {
      this.requestQueue.push(data);
      this.initiateRequest(sendURL);
    }
  };

  // 尝试初始化请求
  initiateRequest = (sendURL?: string) => {
    // 同时请求数的限制，防止挤占站点本身的业务请求
    if (
      [...this.hoardingQueue, ...this.requestQueue].length > 0 &&
      this.requestingNum < this.requestLimit
    ) {
      const { vdsConfig, emitter, plugins, useHybridInherit } = this.growingIO;
      // 可上报数据时，直接把积压队列中的事件合并到请求队列里；并过滤掉重试超过2次的请求(直接丢弃)
      this.requestQueue = [...this.hoardingQueue, ...this.requestQueue].filter(
        (o) => (this.retryIds[o.requestId] || 0) <= this.retryLimit
      );
      this.hoardingQueue = [];
      if (isEmpty(this.requestQueue)) {
        return;
      }
      const eventData = this.requestQueue.shift();
      const { requestType } = eventData;
      // 这里不能直接传对象引用，可能会导致收emitter消息时改动对象影响这里对象的值
      emitter?.emit(EMIT_MSG.ON_SEND_BEFORE, { requestData: { ...eventData } });
      // 预处理的数据（删除了requestType、trackingId和requestId，可以直接打log和发送）
      const preprocessedData = { ...eventData };
      unset(preprocessedData, [
        'requestType',
        'trackingId',
        'requestId',
        'customEventType'
      ]);
      // 开启debug模式时，打印事件日志
      if (vdsConfig.debug) {
        console.log(
          '[GrowingIO Debug]:',
          // replace是为了兼容Safari，移除Safari日志中的斜杠
          JSON.stringify(preprocessedData, null, 2).replace(
            /\"/g,
            isSafari() ? '' : '"'
          )
        );
      }
      this.requestingNum += 1;
      // 与native打通时把事件广播出去就好了，让插件收事件进行转发
      if (useHybridInherit) {
        this.requestSuccessFn(eventData);
        return false;
      }
      // 经过加密逻辑的预处理数据
      let requestData = { ...preprocessedData };
      if (vdsConfig.compress && plugins?.gioCompress) {
        this.compressType = '1';
        if (requestType === 'image') {
          requestData = plugins?.gioCompress?.compressToUTF16(
            JSON.stringify([requestData])
          );
        } else {
          requestData = plugins?.gioCompress?.compressToUint8Array(
            JSON.stringify([requestData])
          );
        }
      } else {
        this.compressType = '0';
        requestData = JSON.stringify([requestData]);
      }
      const requestURL = this.generateURL(sendURL ?? this.requestURL);
      switch (requestType) {
        case 'beacon':
          this.sendByBeacon(eventData, requestData, requestURL);
          break;
        case 'xhr':
          this.sendByXHR(eventData, requestData, requestURL);
          break;
        case 'image':
          this.sendByImage(eventData, requestData, requestURL);
          break;
        default:
          this.sendByBeacon(eventData, requestData, requestURL);
          break;
      }
    }
  };

  // 合成最后的请求地址
  generateURL = (URL: string) =>
    `${URL}?stm=${+Date.now()}&compress=${this.compressType}`;

  // 使用sendBeacon发送
  sendByBeacon = (
    eventData: EVENT,
    requestData: string,
    requestURL?: string
  ) => {
    const sendStatus = navigator.sendBeacon(requestURL, requestData);
    if (sendStatus) {
      this.requestSuccessFn(eventData);
    } else {
      this.requestFailFn(eventData, 'beacon');
    }
  };

  // 使用xhr发送
  sendByXHR = (eventData: EVENT, requestData: string, requestURL?: string) => {
    const async = includes(
      ['unload', 'beforeunload', 'pagehide'],
      window?.event?.type
    );
    const xhr = new XMLHttpRequest();
    // 请求带cookie的现代浏览器
    if (xhr) {
      xhr.open('POST', requestURL, async);
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 204) {
          this.requestSuccessFn(eventData);
        } else {
          this.requestFailFn(eventData, 'xhr');
        }
      };
      xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
      xhr.send(requestData);
      return;
    } else if ((window as any)?.XDomainRequest) {
      // IE 7, 8, 9 and beta versions of 10
      const xdr = new window.XDomainRequest();
      xdr.open('POST', requestURL.replace('https://', 'http://'), async);
      xdr.onload = () => {
        if (xdr.status === 204) {
          this.requestSuccessFn(eventData);
        } else {
          this.requestFailFn(eventData, 'xhr');
        }
      };
      xdr.onerror = xdr.ontimeout = () => {
        this.requestFailFn(eventData, 'xhr');
      };
      xdr.send(requestData);
    }
  };

  // 使用图片发送
  sendByImage = (
    eventData: EVENT,
    requestData: string,
    requestURL?: string
  ) => {
    const src = `${requestURL}&data=${requestData}`;
    let img = document.createElement('img');
    img.width = 1;
    img.height = 1;
    img.onload = () => {
      this.requestSuccessFn(eventData);
      this.clearImage(img);
    };
    img.onerror = img.onabort = () => {
      this.requestSuccessFn(eventData);
      this.clearImage(img);
    };
    img.src = src;
  };

  // 清理图片请求
  clearImage = (img: any) => {
    img.src = '';
    img.onload = () => {};
    img.onerror = img.onerabort = () => {};
    img = null;
  };

  // 请求成功的回调
  requestSuccessFn = (eventData: any) => {
    this.requestingNum -= 1;
    const reqId = eventData.requestId || -1;
    if (this.retryIds[reqId]) {
      this.retryIds[reqId] = 0;
    }
    // 重新赋值更新session有效期
    if (eventData.trackingId === this.growingIO.trackingId) {
      this.growingIO.userStore.sessionId = eventData.sessionId;
    }
    this.growingIO.emitter?.emit(EMIT_MSG.ON_SEND_AFTER, {
      // 这里不能直接传对象引用，可能会导致收emitter消息时改动对象影响这里对象的值
      requestData: { ...eventData }
    });
    this.initiateRequest();
  };

  // 请求失败的回调
  requestFailFn = (eventData: any, reqType?: 'beacon' | 'xhr' | 'image') => {
    this.requestingNum -= 1;
    const reqId = eventData.requestId || -1;
    // 把重试的请求进行计数，超过重试上限的会被丢弃
    if (!this.retryIds[reqId]) {
      this.retryIds[reqId] = 0;
    }
    this.retryIds[reqId] += 1;
    // 发送失败的事件会重新推入请求队列
    const eventExist = this.requestQueue.some(
      (o) => o.requestId === eventData.requestId
    );
    let nextReqType = reqType;
    // 重发一次后还失败，自动降级发送
    if (this.retryIds[reqId] >= this.retryLimit + 1) {
      if (reqType === 'beacon') {
        nextReqType = 'xhr';
      } else if (reqType === 'xhr') {
        nextReqType = 'image';
      } else {
        // 如果是图片发送两次失败了，就丢弃事件不再发送
        nextReqType = undefined;
      }
      // 降级发送时重置重试计数
      this.retryIds[reqId] = 0;
    }
    // 失败的事件在请求列表不存在且有指定下一次发送的类型才会重新推入请求队列
    if (!eventExist && nextReqType) {
      // 延迟半秒后再推入请求队列，给网络一点恢复时间
      let t = window.setTimeout(() => {
        if (!isEmpty(this.requestQueue)) {
          this.requestQueue.push({ ...eventData, requestType: nextReqType });
        } else {
          this.requestQueue.push({ ...eventData, requestType: nextReqType });
          this.initiateRequest();
        }
        window.clearTimeout(t);
        t = null;
      }, 800);
    }
  };
}

export default Uploader;
