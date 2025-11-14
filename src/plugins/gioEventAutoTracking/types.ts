/**
 * 无埋点插件类型定义
 * 
 * 包含无埋点插件使用的类型定义
 */

/**
 * 事件类型映射
 * 
 * 定义了不同事件类型的映射关系
 */
export interface EventTypeMap {
  /** 点击事件 */
  click: string;
  
  /** 视图变更事件 */
  view_change: string;
  
  /** 其他事件类型 */
  [key: string]: string;
}

/**
 * 触摸处理器配置
 * 
 * 定义了触摸事件处理器的配置选项
 */
export interface TouchHandlerConfig {
  /** 是否支持触摸 */
  hasTouch: boolean;
  
  /** 安全防护时间戳 */
  safeguard?: number;
  
  /** 触摸超时句柄 */
  touchTimeout?: any;
  
  /** 触摸事件 */
  touchEvent?: any;
}

/**
 * 节点信息
 * 
 * 定义了页面节点的信息结构
 */
export interface NodeInfo {
  /** 完整XPath */
  fullXpath: string;
  
  /** 节点标签名 */
  tagName?: string;
  
  /** 节点ID */
  id?: string;
  
  /** 节点类名 */
  className?: string;
  
  /** 其他属性 */
  [key: string]: any;
}

/**
 * 无埋点插件选项
 * 
 * 定义了无埋点插件的配置选项
 */
export interface EventAutoTrackingOptions {
  /** 是否启用点击事件跟踪 */
  clickTracking?: boolean;
  
  /** 是否启用视图变更跟踪 */
  viewChangeTracking?: boolean;
  
  /** 忽略的元素选择器 */
  ignoreSelectors?: string[];
  
  /** 自定义事件属性 */
  customProperties?: Record<string, any>;
  
  /** 其他选项 */
  [key: string]: any;
}