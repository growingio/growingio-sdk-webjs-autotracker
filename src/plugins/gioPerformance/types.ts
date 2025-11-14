/**
 * 性能采集插件类型定义
 *
 * 包含性能采集插件使用的类型定义
 */

/**
 * 网络性能监控选项
 *
 * 定义了网络性能监控的配置选项
 */
export interface NetworkPerformanceOptions {
  /** 是否启用网络监控 */
  enabled?: boolean;

  /** 忽略的请求URL */
  ignoreUrls?: (string | RegExp)[];

  /** 请求超时阈值（毫秒） */
  timeoutThreshold?: number;

  /** 慢请求阈值（毫秒） */
  slowRequestThreshold?: number;

  /** 是否监控Fetch请求 */
  monitorFetch?: boolean;

  /** 是否监控XHR请求 */
  monitorXHR?: boolean;

  /** 是否监控Beacon请求 */
  monitorBeacon?: boolean;

  /** 其他自定义选项 */
  [key: string]: any;
}

/**
 * 内存信息
 *
 * 定义了浏览器内存使用信息的结构
 */
export interface MemoryInfo {
  /** JS堆总大小 */
  jsHeapSizeLimit?: number;

  /** 已使用堆大小 */
  usedJSHeapSize?: number;

  /** 总堆大小 */
  totalJSHeapSize?: number;
}

/**
 * 导航时间信息
 *
 * 定义了页面导航时间信息的结构
 */
export interface NavigationTiming {
  /** DNS查询时间 */
  dnsTime?: number;

  /** TCP连接时间 */
  tcpTime?: number;

  /** 请求时间 */
  requestTime?: number;

  /** 响应时间 */
  responseTime?: number;

  /** DOM解析时间 */
  domTime?: number;

  /** 页面加载时间 */
  loadTime?: number;
}

/**
 * 性能插件配置选项
 *
 * 定义了性能采集插件的配置选项
 */
export interface PerformanceOptions {
  /** 是否启用性能监控 */
  monitor?: boolean;

  /** 是否启用异常监控 */
  exception?: boolean;

  /** 网络性能监控配置 */
  network?: NetworkPerformanceOptions | boolean;

  /** 监控采样率 */
  sampleRate?: number;

  /** 是否启用资源加载监控 */
  resourceTiming?: boolean;

  /** 是否启用长任务监控 */
  longTask?: boolean;

  /** 性能数据上报延迟（毫秒） */
  reportDelay?: number;

  /** 其他自定义选项 */
  [key: string]: any;
}

/**
 * 网络请求信息
 *
 * 定义了网络请求的详细信息结构
 */
export interface NetworkRequestInfo {
  /** 请求ID */
  requestId: string;

  /** 请求URL */
  url: string;

  /** HTTP方法 */
  method: string;

  /** 请求开始时间 */
  startTime: number;

  /** 请求结束时间 */
  endTime?: number;

  /** 请求持续时间 */
  duration?: number;

  /** HTTP状态码 */
  statusCode?: number;

  /** 响应大小 */
  responseSize?: number;

  /** 请求类型 */
  requestType: 'XHR' | 'Fetch' | 'Beacon' | 'Script' | 'CSS' | 'Image';

  /** 是否超时 */
  isTimeout?: boolean;

  /** 是否错误 */
  isError?: boolean;

  /** 错误信息 */
  errorMessage?: string;
}

/**
 * 异常信息
 *
 * 定义了前端异常信息的结构
 */
export interface ExceptionInfo {
  /** 异常ID */
  exceptionId: string;

  /** 异常类型 */
  type: 'JavaScript' | 'Resource' | 'Promise' | 'Console' | 'Custom';

  /** 异常消息 */
  message: string;

  /** 异常堆栈 */
  stack?: string;

  /** 发生时间 */
  timestamp: number;

  /** 文件名 */
  filename?: string;

  /** 行号 */
  lineno?: number;

  /** 列号 */
  colno?: number;

  /** 严重级别 */
  severity?: 'info' | 'warning' | 'error' | 'critical';

  /** 其他自定义属性 */
  [key: string]: any;
}

/**
 * 性能指标数据
 *
 * 定义了网页性能指标的数据结构
 */
export interface PerformanceMetrics {
  /** 页面加载时间 */
  pageLoadTime?: number;

  /** DOM解析时间 */
  domParseTime?: number;

  /** 首屏加载时间 */
  firstScreenTime?: number;

  /** 白屏时间 */
  whiteScreenTime?: number;

  /** 资源加载时间 */
  resourceLoadTime?: number;

  /** 内存使用情况 */
  memoryUsage?: MemoryInfo;

  /** 导航时间 */
  navigationTime?: NavigationTiming;

  /** 其他自定义指标 */
  [key: string]: any;
}

/**
 * 性能事件数据
 *
 * 定义了性能事件的数据结构
 */
export interface PerformanceEventData {
  /** 事件类型 */
  eventType: 'performance' | 'exception' | 'network';

  /** 事件名称 */
  eventName: string;

  /** 性能指标 */
  metrics?: PerformanceMetrics;

  /** 网络请求信息 */
  requestInfo?: NetworkRequestInfo;

  /** 异常信息 */
  exceptionInfo?: ExceptionInfo;

  /** 页面信息 */
  pageInfo?: {
    /** 页面路径 */
    path: string;

    /** 页面标题 */
    title: string;

    /** 查询参数 */
    query: string;
  };

  /** 用户信息 */
  userInfo?: {
    /** 用户ID */
    userId?: string;

    /** 设备ID */
    deviceId: string;

    /** 会话ID */
    sessionId: string;
  };

  /** 时间戳 */
  timestamp: number;

  /** 其他数据 */
  [key: string]: any;
}

/**
 * 扩展的XMLHttpRequest接口
 *
 * 在原生XMLHttpRequest基础上添加了性能监控相关的属性
 */
export interface GioXMLHttpRequest extends XMLHttpRequest {
  /** 用于标识的唯一ID */
  gio_XHR_id?: string;

  /** 其他扩展属性 */
  [key: string]: any;

  /** 性能监控数据 */
  gioXHR?: {
    /** 请求类型 */
    type: 'XHR' | 'Fetch' | 'Beacon';

    /** 请求方法 */
    method: string;

    /** 请求URL */
    url: string;

    /** 开始时间 */
    start?: number;

    /** 持续时间 */
    duration?: number;

    /** 响应大小 */
    size?: number;
  };
}
