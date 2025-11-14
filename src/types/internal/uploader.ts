/**
 * 上传器类型接口
 * 
 * 定义了SDK中事件数据上传功能的结构和方法
 */
export interface UploaderType {
  /** 
   * 因forceLogin配置积压的事件请求队列（按trackingId作为key，值为数组）
   */
  hoardingQueue: {
    [trackingId: string]: any[];
  };
  
  /** 请求队列 */
  requestQueue: any[];
  
  /** 请求限制最大数 */
  requestLimit: number;
  
  /** 请求超时时间(ms) */
  requestTimeout: number;
  
  /** 请求中的请求数 */
  requestingNum: number;
  
  /** 
   * 获取积压队列
   * @param trackingId 跟踪ID
   * @returns 积压队列数组
   */
  getHoardingQueue: (trackingId: string) => any[];
  
  /** 
   * 提交请求至队列
   * @param reqData 请求数据
   */
  commitRequest: (reqData: any) => void;
  
  /** 
   * 初始化请求
   * @param trackingId 跟踪ID
   */
  initiateRequest: (trackingId: string) => void;
  
  /** 
   * 发送请求
   * @param eventData 事件数据
   */
  sendEvent: (eventData: any) => void;
  
  /** 
   * 请求错误回调
   * @param data 错误数据
   * @param reqType 请求类型
   */
  requestFailFn: (data: any, reqType: 'beacon' | 'xhr' | 'image') => void;
  
  /** 
   * 生成请求地址
   * @param specifiedURL 指定URL（可选）
   * @param specifiedAI 指定AI（可选）
   * @returns 请求地址
   */
  generateURL: (specifiedURL?: string, specifiedAI?: string) => string;
}
