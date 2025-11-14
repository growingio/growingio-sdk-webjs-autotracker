// ==================== API 类型 (用户直接使用) ====================
// 从 api.ts 导出用户常用的 API 类型定义
export type {
  // 初始化配置
  InitOptions,
  // 属性类型
  PageAttributes,
  UserAttributes,
  EventAttributes,
  // 参数类型
  TrackEventParams,
  TimerEventParams,
  // 回调函数类型
  ABTestCallback,
  CommonCallback,
  BeforeSendListener,
  PageListenerCallback,
  // SDK 实例类型
  GrowingIOInstance,
  GrowingIO,
  Gdp
} from './api';

// ==================== 内部核心类型 ====================
// 核心 GrowingIO 实例类型
export type { GrowingIOType } from './internal/growingIO';

// ==================== 插件相关类型 ====================
export type { PluginItem, PluginsType } from './internal/plugins';

// ==================== 配置相关类型 ====================
export type {
  DataStoreType,
  OriginOptions,
  UserOptions,
  StorageKeyType
} from './internal/dataStore';

// ==================== 存储相关类型 ====================
export type { StorageType } from './internal/storage';

// ==================== 上传相关类型 ====================
export type { UploaderType } from './internal/uploader';

// ==================== 用户存储相关类型 ====================
export type { UserStoreType } from './internal/userStore';

// ==================== 页面相关类型 ====================
export type { default as PageType } from './internal/page';

// ==================== 事件相关类型 ====================
export type { EVENT_TYPES, EVENT, EXTEND_EVENT } from './internal/events';
