/**
 * 多实例插件类型定义
 * 
 * 包含多实例插件使用的类型定义
 */

/**
 * 子实例配置
 * 
 * 定义了单个子实例的配置信息
 */
export interface SubInstanceConfig {
  /** 项目ID */
  projectId: string;
  
  /** 数据源ID */
  dataSourceId: string;
  
  /** 应用ID */
  appId?: string;
  
  /** 服务器URL */
  serverUrl?: string;
  
  /** 自定义配置选项 */
  [key: string]: any;
}

/**
 * 多实例插件配置选项
 * 
 * 定义了多实例插件的配置选项
 */
export interface MultipleInstancesOptions {
  /** 是否启用多实例功能 */
  enabled?: boolean;
  
  /** 子实例配置 */
  subInstances?: Record<string, SubInstanceConfig>;
  
  /** 默认跟踪ID */
  defaultTrackingId?: string;
  
  /** 是否自动初始化子实例 */
  autoInitialize?: boolean;
  
  /** 其他自定义选项 */
  [key: string]: any;
}

/**
 * 子实例信息
 * 
 * 定义了子实例的信息结构
 */
export interface SubInstanceInfo {
  /** 跟踪ID */
  trackingId: string;
  
  /** 配置信息 */
  config: SubInstanceConfig;
  
  /** 实例状态 */
  initialized: boolean;
  
  /** 实例对象 */
  instance?: any;
  
  /** 创建时间 */
  createdAt: number;
}

/**
 * 多实例事件数据
 * 
 * 定义了多实例环境下事件的数据结构
 */
export interface MultipleInstanceEventData {
  /** 原始事件数据 */
  originalEvent: any;
  
  /** 目标跟踪ID */
  targetTrackingId: string;
  
  /** 事件类型 */
  eventType: string;
  
  /** 事件名称 */
  eventName: string;
  
  /** 事件属性 */
  properties?: Record<string, any>;
  
  /** 时间戳 */
  timestamp: number;
  
  /** 其他数据 */
  [key: string]: any;
}

/**
 * 实例类型枚举
 * 
 * 定义了实例类型的枚举值
 */
export enum InstanceType {
  /** 主实例 */
  MAIN = 1,
  
  /** 子实例 */
  SUB = 0
}

/**
 * 多实例管理器
 * 
 * 定义了多实例管理器的接口
 */
export interface MultipleInstancesManager {
  /** 子实例集合 */
  subInstances: Record<string, SubInstanceInfo>;
  
  /** 获取实例类型 */
  getTrackerType: (trackingId: string, growingIO: any) => InstanceType;
  
  /** 初始化子实例 */
  initializeSubInstance: (trackingId: string, config: SubInstanceConfig) => boolean;
  
  /** 获取子实例 */
  getSubInstance: (trackingId: string) => SubInstanceInfo | undefined;
  
  /** 移除子实例 */
  removeSubInstance: (trackingId: string) => boolean;
  
  /** 广播事件到所有实例 */
  broadcastEvent: (eventData: MultipleInstanceEventData) => void;
}