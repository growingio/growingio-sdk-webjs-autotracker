export interface UploaderType {
  // 请求队列
  requestQueue: any[];
  // 请求限制最大数
  requestLimit: number;
  // 请求超时时间(ms)
  requestTimeout: number;
  // 请求重试限制最大数
  retryLimit: number;
  // 请求重试的原请求id
  retryIds: any;
  // 请求中的请求数
  requestingNum: number;
  // 请求地址
  requestURL: string;
  // 提交请求至队列
  commitRequest: (reqData: any) => void;
  // 发送请求
  initiateRequest: () => void;
  // 请求错误回调
  requestFailFn: (data: any, reqType: 'beacon' | 'xhr' | 'image') => void;
  // CDP更新/生成新的上报地址方法
  generateHost?: () => void;
  // 生成请求地址
  generateURL?: () => void;
}
