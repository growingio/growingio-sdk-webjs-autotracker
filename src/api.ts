/**
 * GrowingIO Web SDK API 类型定义
 *
 * 此文件导出了用户在使用GrowingIO Web SDK时最常使用的API类型定义
 *
 * 使用方法:
 * ```typescript
 * import type { InitOptions, GrowingIO } from 'gio-web-autotracker';
 * ```
 */

export type {
  InitOptions,
  PageAttributes,
  UserAttributes,
  EventAttributes,
  TrackEventParams,
  TimerEventParams,
  ABTestCallback,
  CommonCallback,
  BeforeSendListener,
  PageListenerCallback,
  GrowingIOInstance,
  GrowingIO,
  Gdp
} from './types/api';

// 默认导出所有类型，方便直接使用
export * from './types/api';
