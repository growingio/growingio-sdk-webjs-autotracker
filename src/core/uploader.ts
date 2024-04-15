import { CDPEvent, SaasEvent } from '@/types/events';
import { GrowingIOType } from '@/types/growingIO';
import { UploaderType } from '@/types/uploader';
import { isSafari, supportBeacon } from '@/utils/business/core';
import { isEmpty, unset } from '@/utils/glodash';

class Uploader implements UploaderType {
  // 请求队列
  public requestQueue: any[];
  // 请求限制最大数
  public requestLimit: number;
  // 请求超时时间(ms)
  public requestTimeout: number;
  // 请求重试限制最大数
  public retryLimit: number;
  // 请求重试的原请求id
  // !存的key值都是全局事件计数id，值指向的都是gsid。在cdp叫globalSequenceId，在saas叫esid。
  public retryIds: any;
  // 请求中的请求数
  public requestingNum: number;
  // 请求地址
  public requestURL: string;
  // 压缩加密方式
  public compressType: '0' | '1' | '11';

  constructor(public growingIO: GrowingIOType) {
    this.requestQueue = [];
    this.requestLimit = 10;
    this.requestTimeout = 5000;
    this.retryLimit = 2; // 重试两次，算上一开始的发送，每种发送方式会发三次，还失败自动降级
    this.retryIds = {};
    this.requestingNum = 0;
    this.requestURL = '';
  }

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
  commitRequest = (commitData: SaasEvent | CDPEvent) => {
    const data: SaasEvent | CDPEvent = { ...commitData };
    this.requestQueue.push({
      ...data,
      requestType: this.getSendType()
    });
    this.initiateRequest();
  };

  // 尝试初始化请求
  initiateRequest = () => {
    // 同时请求数的限制，防止挤占站点本身的业务请求
    if (
      [...this.requestQueue].length > 0 &&
      this.requestingNum < this.requestLimit
    ) {
      const { vdsConfig, emitter, plugins, useHybridInherit } = this.growingIO;
      // 过滤掉重试超过2次的请求(直接丢弃)
      this.requestQueue = [...this.requestQueue].filter(
        (o) =>
          (this.retryIds[o.globalSequenceId || o.esid] || 0) <= this.retryLimit
      );
      if (isEmpty(this.requestQueue)) {
        return;
      }
      const eventData = this.requestQueue.shift();
      const { requestType } = eventData;
      // 这里不能直接传对象引用，可能会导致收emitter消息时改动对象影响这里对象的值
      emitter?.emit('onSendBefore', { requestData: { ...eventData } });
      // 预处理的数据（删除了requestType和trackingId，可以直接打log和发送）
      const preprocessedData = { ...eventData };
      unset(preprocessedData, ['requestType', 'trackingId']);
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
        if (requestType === 'image') {
          this.compressType = '11';
          requestData = plugins?.gioCompress?.compressToEncodedURIComponent(
            JSON.stringify([requestData])
          );
        } else {
          this.compressType = '1';
          requestData = plugins?.gioCompress?.compressToUint8Array(
            JSON.stringify([requestData])
          );
        }
      } else {
        this.compressType = '0';
        requestData = JSON.stringify([requestData]);
      }
      switch (requestType) {
        case 'beacon':
          this.sendByBeacon(eventData, requestData);
          break;
        case 'xhr':
          this.sendByXHR(eventData, requestData);
          break;
        case 'image':
          this.sendByImage(eventData, requestData);
          break;
        default:
          this.sendByBeacon(eventData, requestData);
          break;
      }
    }
  };

  // 合成最后的请求地址
  generateURL = () =>
    `${this.requestURL}?stm=${+Date.now()}&compress=${this.compressType}`;

  // 使用sendBeacon发送
  sendByBeacon = (eventData: SaasEvent | CDPEvent, requestData: string) => {
    const sendStatus = navigator.sendBeacon(this.generateURL(), requestData);
    if (sendStatus) {
      this.requestSuccessFn(eventData);
    } else {
      this.requestFailFn(eventData, 'beacon');
    }
  };

  // 使用xhr发送
  sendByXHR = (eventData: SaasEvent | CDPEvent, requestData: string) => {
    const xhr = new XMLHttpRequest();
    // 请求带cookie的现代浏览器
    if (xhr) {
      xhr.open('POST', this.generateURL(), true);
      xhr.onload = () => {
        if (xhr.status === 204) {
          this.requestSuccessFn(eventData);
        } else {
          this.requestFailFn(eventData, 'xhr');
        }
      };
      xhr.ontimeout =
        xhr.onerror =
        xhr.onabort =
          () => {
            this.requestFailFn(eventData, 'xhr');
          };
      xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
      xhr.timeout = this.growingIO.vdsConfig.requestTimeout;
      xhr.send(requestData);
      return;
    } else if ((window as any)?.XDomainRequest) {
      // IE 7, 8, 9 and beta versions of 10
      const xdr = new window.XDomainRequest();
      xdr.open('POST', this.generateURL().replace('https://', 'http://'), true);
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
  // 用图片上报时，因为请求的是一个非图片地址，所以一般都会跑到onerror逻辑里去，所以在onerror里就直接返回成功，否则会重复发事件
  sendByImage = (eventData: SaasEvent | CDPEvent, requestData: string) => {
    const src = `${this.generateURL()}&data=${requestData}`;
    let img = document.createElement('img');
    img.width = 1;
    img.height = 1;

    // 手动控制图片请求的超时时长
    let t = window.setTimeout(() => {
      this.requestingNum -= 1;
      this.clearImage(img);
      window.clearTimeout(t);
      t = null;
      this.initiateRequest();
    }, this.growingIO.vdsConfig.requestTimeout);

    img.onload = () => {
      this.requestSuccessFn(eventData);
      this.clearImage(img);
      window.clearTimeout(t);
      t = null;
    };
    img.onerror = img.onabort = () => {
      this.requestSuccessFn(eventData);
      this.clearImage(img);
      window.clearTimeout(t);
      t = null;
    };
    img.src = src;
  };

  // 清理图片请求
  clearImage = (img: any) => {
    img.src = '';
    img.onload = () => {};
    img.onerror = img.onabort = () => {};
    img = null;
  };

  // 请求成功的回调
  requestSuccessFn = (eventData: any) => {
    this.requestingNum -= 1;
    const eid = eventData.globalSequenceId || eventData.esid || -1;
    if (this.retryIds[eid]) {
      this.retryIds[eid] = 0;
    }
    // 重新赋值更新session有效期
    if (
      eventData.trackingId === this.growingIO.trackingId &&
      this.growingIO.userStore.sessionId === eventData.sessionId
    ) {
      // 因为请求是异步的，防止更新了session以后，上一个请求中过期的sessionId复写回去导致bug
      this.growingIO.userStore.sessionId = eventData.sessionId;
    }
    this.growingIO.emitter?.emit('onSendAfter', {
      // 这里不能直接传对象引用，可能会导致收emitter消息时改动对象影响这里对象的值
      requestData: { ...eventData }
    });
    this.initiateRequest();
  };

  // 请求失败的回调
  requestFailFn = (eventData: any, reqType?: 'beacon' | 'xhr' | 'image') => {
    this.requestingNum -= 1;
    const eid = eventData.globalSequenceId || eventData.esid || -1;
    // 把重试的请求进行计数，超过重试上限的会被丢弃
    if (!this.retryIds[eid]) {
      this.retryIds[eid] = 0;
    }
    this.retryIds[eid] += 1;
    // 发送失败的事件会重新推入请求队列
    const eventExist = this.requestQueue.some(
      (o) =>
        o.globalSequenceId === eventData.globalSequenceId &&
        o.esid === eventData.esid
    );
    let nextReqType = reqType;
    // 重发一次后还失败，自动降级发送
    if (this.retryIds[eid] >= this.retryLimit + 1) {
      if (reqType === 'beacon') {
        nextReqType = 'xhr';
      } else if (reqType === 'xhr') {
        nextReqType = 'image';
      } else {
        // 如果是图片发送两次失败了，就丢弃事件不再发送
        nextReqType = undefined;
      }
      // 降级发送时重置重试计数
      this.retryIds[eid] = 0;
    }
    // 失败的事件在请求列表不存在且有指定下一次发送的类型才会重新推入请求队列
    if (!eventExist && nextReqType) {
      // 延迟半秒后再推入请求队列，给网络一点恢复时间
      let t = window.setTimeout(() => {
        this.requestQueue.push({ ...eventData, requestType: nextReqType });
        this.initiateRequest();
        window.clearTimeout(t);
        t = null;
      }, 800);
    }
    this.initiateRequest();
  };
}

export default Uploader;
