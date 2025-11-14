/**
 * ABTest插件类型定义
 * 
 * 包含ABTest插件使用的类型定义
 */

/**
 * ABTest插件选项配置
 * 
 * 定义了ABTest插件的配置选项
 */
export interface ABTestOptions {
  /** 分流服务请求地址 */
  abServerUrl?: string | Record<string, string>;
  
  /** 请求间隔时长（毫秒） */
  requestInterval?: number;
  
  /** 请求超时时长（毫秒） */
  requestTimeout?: number;
  
  /** 其他自定义选项 */
  [key: string]: any;
}

/**
 * ABTest存储数据结构
 * 
 * 定义了ABTest存储的数据格式
 */
export interface ABTestData {
  /** 实验ID */
  experimentId: string;
  
  /** 实验名称 */
  experimentName: string;
  
  /** 实验变量 */
  variables: Record<string, any>;
  
  /** 过期时间 */
  expireTime?: number;
  
  /** 其他属性 */
  [key: string]: any;
}

/**
 * ABTest回调函数类型
 * 
 * 定义了ABTest数据获取回调函数的签名
 */
export type ABTestCallback = (data: any) => void;