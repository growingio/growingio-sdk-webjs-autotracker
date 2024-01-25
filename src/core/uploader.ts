import { EVENT, EXTEND_EVENT } from '@/types/events';
import { GrowingIOType } from '@/types/growingIO';
import { isEmpty, unset, startsWith } from '@/utils/glodash';
import { isSafari, supportBeacon } from '@/utils/tools';
import { UploaderType } from '@/types/uploader';
import EMIT_MSG from '@/constants/emitMsg';

class Uploader implements UploaderType {
  // 因forceLogin配置积压的事件请求队列
  public hoardingQueue: any;
  // 请求队列
  public requestQueue: any[];
  // 请求限制最大数
  public requestLimit: number;
  // 请求超时时间(ms)
  public requestTimeout: number;
  // 请求中的请求数
  public requestingNum: number;
  constructor(public growingIO: GrowingIOType) {
    // 主实例的积压缓存队列
    this.hoardingQueue = {};
    // 各个实例共用的请求队列
    this.requestQueue = [];
    // 请求个数限制
    this.requestLimit = 10;
    // 正在请求中个数计数
    this.requestingNum = 0;
    // 主实例的请求监听
    this.growingIO.emitter.on(EMIT_MSG.OPTION_INITIALIZED, ({ trackingId }) => {
      this.hoardingQueue[trackingId] = [];
    });
    this.growingIO.emitter.on(
      EMIT_MSG.ON_SEND_BEFORE,
      ({ requestData, trackingId }: any) => {
        if (trackingId === this.growingIO.trackingId) {
          this.sendEvent(requestData);
        }
      }
    );
  }

  // 生成上报接口地址
  generateURL = (trackingId: string) => {
    const tracker = this.growingIO.dataStore.getTracker(trackingId);
    const { serverUrl, projectId } = tracker.vdsConfig;
    if (!startsWith(serverUrl, 'http')) {
      return `https://${serverUrl}/v3/projects/${projectId}/collect`;
    } else {
      return `${serverUrl}/v3/projects/${projectId}/collect`;
    }
  };

  // 获取上报方式
  getSendType = (trackingId: string) => {
    const tracker = this.growingIO.dataStore.getTracker(trackingId);
    const { sendType } = tracker.vdsConfig;
    if (sendType === 'beacon') {
      return supportBeacon() ? 'beacon' : 'xhr';
    } else {
      return sendType;
    }
  };

  // 获取积压队列
  getHoardingQueue = (trackingId: string) =>
    this.hoardingQueue[trackingId] ?? [];

  // 提交请求（将请求按队列进行管理）
  commitRequest = (commitData: EXTEND_EVENT) => {
    const data: any = {
      ...commitData,
      requestType: this.getSendType(commitData.trackingId)
    };
    // 如果开启forceLogin 则将请求推入积压队列，反之则进入请求队列
    if (this.growingIO.vdsConfig.forceLogin) {
      this.getHoardingQueue(commitData.trackingId)?.push(data);
    } else {
      this.requestQueue.push(data);
      this.initiateRequest(commitData.trackingId);
    }
  };

  // 尝试初始化请求
  initiateRequest = (trackingId: string) => {
    // 同时请求数的限制，防止挤占站点本身的业务请求
    const hoardingQueue = this.getHoardingQueue(trackingId);
    if (
      [...hoardingQueue, ...this.requestQueue].length > 0 &&
      this.requestingNum < this.requestLimit
    ) {
      const { emitter } = this.growingIO;
      // 可上报数据时，直接把积压队列中的事件合并到请求队列里
      this.requestQueue = [...hoardingQueue, ...this.requestQueue];
      this.hoardingQueue[trackingId] = [];
      if (isEmpty(this.requestQueue)) {
        return;
      }
      const eventData = this.requestQueue.shift();
      // 这里不能直接传对象引用，可能会导致收emitter消息时改动对象影响这里对象的值
      emitter?.emit(EMIT_MSG.ON_SEND_BEFORE, {
        requestData: { ...eventData },
        trackingId: eventData.trackingId
      });
    }
  };

  // 主实例发送事件
  sendEvent = (eventData: any) => {
    const { vdsConfig, useHybridInherit, plugins } = this.growingIO;
    // 预处理的数据（删除了requestType、trackingId和requestId，可以直接打log和发送）
    const preprocessedData = { ...eventData };
    const sendURL = this.generateURL(eventData.trackingId);
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
          /"/g,
          isSafari() ? '' : '"'
        )
      );
    }
    this.requestingNum += 1;
    // 与native打通时把事件广播出去就好了，让插件收事件进行转发
    if (
      useHybridInherit &&
      eventData.trackingId === this.growingIO.trackingId
    ) {
      this.requestSuccessFn(eventData);
      return false;
    }
    // 经过加密逻辑的预处理数据
    let requestData: EVENT | string = { ...preprocessedData };
    let compressType;
    if (vdsConfig.compress && plugins?.gioCompress) {
      if (eventData.requestType === 'image') {
        compressType = '11';
        requestData = plugins?.gioCompress?.compressToEncodedURIComponent(
          JSON.stringify([requestData])
        );
      } else {
        compressType = '1';
        requestData = plugins?.gioCompress?.compressToUint8Array(
          JSON.stringify([requestData])
        );
      }
    } else {
      compressType = '0';
      requestData = JSON.stringify([requestData]);
    }
    const requestURL = `${sendURL}?stm=${+Date.now()}&compress=${compressType}`;
    switch (eventData.requestType) {
      case 'beacon':
        this.sendByBeacon(eventData, requestData as string, requestURL);
        break;
      case 'xhr':
        this.sendByXHR(eventData, requestData as string, requestURL);
        break;
      case 'image':
        this.sendByImage(eventData, requestData as string, requestURL);
        break;
      default:
        this.sendByBeacon(eventData, requestData as string, requestURL);
        break;
    }
  };

  // 使用sendBeacon发送
  sendByBeacon = (
    eventData: EXTEND_EVENT,
    requestData: string,
    requestURL: string
  ) => {
    // eslint-disable-next-line
    const sendStatus = navigator.sendBeacon(requestURL, requestData);
    if (sendStatus) {
      this.requestSuccessFn(eventData);
    } else {
      this.requestFailFn(eventData, 'xhr');
    }
  };

  // 使用xhr发送
  sendByXHR = (
    eventData: EXTEND_EVENT,
    requestData: string,
    requestURL: string
  ) => {
    const tracker = this.growingIO.dataStore.getTracker(eventData.trackingId);
    const xhr = new XMLHttpRequest();
    // 请求带cookie的现代浏览器
    if (xhr) {
      xhr.open('POST', requestURL, true);
      xhr.onload = () => {
        if (xhr.status === 204) {
          this.requestSuccessFn(eventData);
        } else {
          this.requestFailFn(eventData, 'image');
        }
      };
      xhr.ontimeout =
        xhr.onerror =
        xhr.onabort =
          () => {
            this.requestFailFn(eventData, 'image');
          };
      xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
      xhr.timeout = tracker.vdsConfig.requestTimeout;
      xhr.send(requestData);
      return;
    } else if ((window as any)?.XDomainRequest) {
      // IE 7, 8, 9 and beta versions of 10
      const xdr = new window.XDomainRequest();
      xdr.open('POST', requestURL.replace('https://', 'http://'), true);
      xdr.onload = () => {
        if (xdr.status === 204) {
          this.requestSuccessFn(eventData);
        } else {
          this.requestFailFn(eventData, 'image');
        }
      };
      xdr.onerror = xdr.ontimeout = () => {
        this.requestFailFn(eventData, 'image');
      };
      xdr.send(requestData);
    }
  };

  // 使用图片发送
  sendByImage = (
    eventData: EXTEND_EVENT,
    requestData: string,
    requestURL: string
  ) => {
    const tracker = this.growingIO.dataStore.getTracker(eventData.trackingId);
    const src = `${requestURL}&data=${requestData}`;
    let img = document.createElement('img');
    img.width = 1;
    img.height = 1;
    // 手动控制图片请求的超时时长
    let t = window.setTimeout(() => {
      this.requestingNum -= 1;
      this.clearImage(img);
      window.clearTimeout(t);
      t = null;
      this.initiateRequest(eventData.trackingId);
    }, tracker.vdsConfig.requestTimeout);
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
    img.onerror = img.onerabort = () => {};
    img = null;
  };

  // 请求成功的回调
  requestSuccessFn = (eventData: any) => {
    this.requestingNum -= 1;
    // 重新赋值更新session有效期
    const tSession = this.growingIO.userStore.getSessionId(
      eventData.trackingId
    );
    if (tSession === eventData.sessionId) {
      this.growingIO.userStore.setSessionId(eventData.trackingId, tSession);
    }
    this.growingIO.emitter?.emit(EMIT_MSG.ON_SEND_AFTER, {
      // 这里不能直接传对象引用，可能会导致收emitter消息时改动对象影响这里对象的值
      requestData: { ...eventData },
      trackingId: eventData.trackingId
    });
    this.initiateRequest(eventData.trackingId);
  };

  // 请求失败的回调
  requestFailFn = (
    eventData: any,
    nextReqType?: 'beacon' | 'xhr' | 'image'
  ) => {
    this.requestingNum -= 1;
    // 发送失败的事件会重新推入请求队列
    const eventExist = this.requestQueue.some(
      (o) => o.requestId === eventData.requestId
    );
    // 失败的事件在请求列表不存在且有指定下一次发送的类型才会重新推入请求队列
    if (!eventExist && nextReqType) {
      // 延迟800毫秒后再推入请求队列，给网络一点恢复时间
      let t = window.setTimeout(() => {
        this.requestQueue.push({ ...eventData, requestType: nextReqType });
        this.initiateRequest(eventData.trackingId);
        window.clearTimeout(t);
        t = null;
      }, 800);
    }
  };
}

export default Uploader;
