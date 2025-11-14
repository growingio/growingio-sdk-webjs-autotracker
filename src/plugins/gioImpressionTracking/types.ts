/**
 * 半自动浏览埋点插件类型定义
 * 
 * 包含半自动浏览埋点插件使用的类型定义
 */

/**
 * 曝光跟踪配置选项
 * 
 * 定义了曝光跟踪插件的配置选项
 */
export interface ImpressionTrackingOptions {
  /** 曝光比例阈值 */
  impressionScale?: number;
  
  /** 是否启用自动曝光跟踪 */
  autoTrack?: boolean;
  
  /** 忽略的元素选择器 */
  ignoreSelectors?: string[];
  
  /** 自定义曝光属性前缀 */
  customAttributePrefix?: string;
  
  /** 是否启用交叉观察器 */
  enableIntersectionObserver?: boolean;
  
  /** 交叉观察器选项 */
  intersectionObserverOptions?: IntersectionObserverInit;
  
  /** 其他自定义选项 */
  [key: string]: any;
}

/**
 * 曝光元素信息
 * 
 * 定义了曝光元素的信息结构
 */
export interface ImpressionElementInfo {
  /** 元素ID */
  id?: string;
  
  /** 元素标签名 */
  tagName?: string;
  
  /** 元素类名 */
  className?: string;
  
  /** XPath路径 */
  xpath?: string;
  
  /** 完整XPath路径 */
  fullXpath?: string;
  
  /** 曝光类型 */
  impressionType?: 'once' | 'continuous';
  
  /** 自定义属性 */
  customProperties?: Record<string, any>;
  
  /** 其他属性 */
  [key: string]: any;
}

/**
 * 曝光事件数据
 * 
 * 定义了曝光事件的数据结构
 */
export interface ImpressionEventData {
  /** 元素信息 */
  elementInfo: ImpressionElementInfo;
  
  /** 曝光时间 */
  timestamp: number;
  
  /** 曝光时长 */
  duration?: number;
  
  /** 可见比例 */
  visibleRatio?: number;
  
  /** 页面信息 */
  pageInfo?: {
    /** 页面路径 */
    path: string;
    
    /** 页面标题 */
    title: string;
    
    /** 查询参数 */
    query: string;
  };
  
  /** 其他数据 */
  [key: string]: any;
}

/**
 * 观察器配置
 * 
 * 定义了MutationObserver和IntersectionObserver的配置
 */
export interface ObserverConfig {
  /** MutationObserver配置 */
  mutationObserver?: {
    /** 观察的属性 */
    attributes?: boolean;
    
    /** 观察子节点 */
    childList?: boolean;
    
    /** 深度观察 */
    subtree?: boolean;
  };
  
  /** IntersectionObserver配置 */
  intersectionObserver?: IntersectionObserverInit;
}

/**
 * 曝光跟踪回调函数
 * 
 * 定义了曝光跟踪的回调函数签名
 */
export type ImpressionTrackCallback = (data: ImpressionEventData) => void;