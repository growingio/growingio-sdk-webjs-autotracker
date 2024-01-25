export interface UploaderType {
  // 因forceLogin配置积压的事件请求队列（按trackingId作为key，值为数组）
  hoardingQueue: {
    [trackingId: string]: any[];
  };
  // 请求队列
  requestQueue: any[];
  // 请求限制最大数
  requestLimit: number;
  // 请求超时时间(ms)
  requestTimeout: number;
  // 请求中的请求数
  requestingNum: number;
  // 获取积压队列
  getHoardingQueue: (trackingId: string) => any[];
  // 提交请求至队列
  commitRequest: (reqData: any) => void;
  // 初始化请求
  initiateRequest: (trackingId: string) => void;
  // 发送请求
  sendEvent: (eventData: any) => void;
  // 请求错误回调
  requestFailFn: (data: any, reqType: 'beacon' | 'xhr' | 'image') => void;
  // 生成请求地址
  generateURL: (specifiedURL?: string, specifiedAI?: string) => string;
}
