/**
 * Hybrid打通插件类型定义
 * 
 * 包含Hybrid打通插件使用的类型定义
 */

/**
 * Hybrid插件配置选项
 * 
 * 定义了Hybrid打通插件的配置选项
 */
export interface HybridAdapterOptions {
  /** 是否穿透Hybrid */
  penetrateHybrid?: boolean;
  
  /** Hybrid服务器URL */
  hybridServerUrl?: string;
  
  /** 支持的事件类型 */
  supportEventTypes?: string[];
  
  /** 是否启用圈选功能 */
  enableCircle?: boolean;
  
  /** 圈选服务器URL */
  circleServerUrl?: string;
  
  /** 其他自定义选项 */
  [key: string]: any;
}

/**
 * Hybrid节点信息
 * 
 * 定义了Hybrid节点的信息结构
 */
export interface HybridNodeInfo {
  /** 节点ID */
  id?: string;
  
  /** 节点标签名 */
  tagName?: string;
  
  /** 节点类名 */
  className?: string;
  
  /** XPath路径 */
  xpath?: string;
  
  /** 完整XPath路径 */
  fullXpath?: string;
  
  /** 其他属性 */
  [key: string]: any;
}

/**
 * Hybrid事件数据
 * 
 * 定义了发送给Native的事件数据结构
 */
export interface HybridEventData {
  /** 事件类型 */
  eventType: string;
  
  /** 事件名称 */
  eventName: string;
  
  /** 事件属性 */
  properties?: Record<string, any>;
  
  /** 时间戳 */
  timestamp: number;
  
  /** 页面信息 */
  pageInfo?: {
    /** 页面路径 */
    path: string;
    
    /** 页面标题 */
    title: string;
    
    /** 查询参数 */
    query: string;
  };
  
  /** 设备信息 */
  deviceInfo?: {
    /** 设备ID */
    deviceId: string;
    
    /** 用户ID */
    userId?: string;
    
    /** 会话ID */
    sessionId: string;
  };
  
  /** 其他数据 */
  [key: string]: any;
}

/**
 * Bridge回调函数
 * 
 * 定义了与Native通信的回调函数签名
 */
export type BridgeCallback = (result: any) => void;

/**
 * Bridge错误回调函数
 * 
 * 定义了Bridge调用出错时的回调函数签名
 */
export type BridgeErrorCallback = (error: any) => void;