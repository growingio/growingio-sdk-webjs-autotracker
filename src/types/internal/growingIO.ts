import { DataStoreType, OriginOptions } from './dataStore';
import { PluginsType } from './plugins';
import { StorageType } from './storage';
import { UploaderType } from './uploader';
import { UserStoreType } from './userStore';
import UserAgentManager from '@/core/userAgentManager';

/**
 * GrowingIO核心类型接口
 *
 * 定义了GrowingIO SDK核心实例的结构和方法
 */
export interface GrowingIOType {
  /** SDK版本号 */
  sdkVersion: string;

  /** VDS命名 */
  vdsName: string;

  /** SDK是否全量集成 */
  gioSDKFull: boolean;

  /** SDK初始化标识 */
  gioSDKInitialized: boolean;

  /** 小程序是否打通标识（可选） */
  useEmbeddedInherit?: string;

  /** Hybrid是否打通标识（可选） */
  useHybridInherit?: string;

  /** 所有配置项 */
  vdsConfig: OriginOptions;

  /** 存储实例 */
  storage: StorageType;

  /** 用户管理实例 */
  userStore: UserStoreType;

  /** 数据管理实例 */
  dataStore: DataStoreType;

  /** 插件管理实例 */
  plugins: PluginsType;

  /** 上传组件实例 */
  uploader: UploaderType;

  /** 增强型UA实例（仅在启用extraUA时存在）*/
  userAgentManager?: UserAgentManager;

  /**
   * 用于放在事件中区别于为其他功能而生成事件的跟踪器Id，默认为g0
   */
  trackingId: string;

  /** 存储子实例的配置和信息 */
  subInstance: {
    [key: string]: OriginOptions;
  };

  /** 工具类（可选） */
  utils?: any;

  /** 消息管理器 */
  emitter: {
    /**
     * 发送消息
     * @param msg 消息名称
     * @param args 消息参数（可选）
     */
    emit: (msg: string, args?: any) => void;

    /**
     * 监听消息
     * @param msg 消息名称
     * @param method 处理方法
     */
    on: (msg: string, method: (args?: any) => any) => void;

    /**
     * 取消监听消息
     * @param msg 消息名称
     * @param method 处理方法
     */
    off: (msg: string, method: (args?: any) => any) => void;
  };

  /**
   * 初始化SDK
   * @param options 初始化选项
   * @returns 初始化结果
   */
  init: (options: any) => boolean;

  /**
   * 注册插件
   * @param plugins 插件数组
   * @param callback 回调函数（可选）
   */
  registerPlugins: (plugins: any[], callback?: (arg: any) => any) => void;

  /**
   * 获取所有已注册插件
   * @param callback 回调函数
   */
  getPlugins: (callback: (args?: any) => any[]) => void;

  /**
   * 外部调用手动发送visit事件
   * @param trackingId 跟踪ID
   * @param props 事件属性（可选）
   * @param callback 回调函数（可选）
   */
  sendVisit: (
    trackingId: string,
    props?: any,
    callback?: (arg: any) => any
  ) => void;

  /**
   * 添加页面变更事件监听
   * @param trackingId 跟踪ID
   * @param callback 回调函数（可选）
   */
  setPageListener: (trackingId: string, callback?: (arg?: any) => void) => void;

  /**
   * 设置页面属性
   * @param trackingId 跟踪ID
   * @param properties 属性对象
   */
  setPageAttributes: (trackingId: string, properties: any) => void;

  /**
   * 清空已设置的页面属性
   * @param trackingId 跟踪ID
   * @param properties 要清除的属性名数组
   * @param callback 回调函数（可选）
   */
  clearPageAttributes: (
    trackingId: string,
    properties: string[] | undefined,
    callback?: (args?: any) => any
  ) => void;

  /**
   * 外部调用手动发送page事件
   * @param trackingId 跟踪ID
   * @param props 事件属性（可选）
   * @param callback 回调函数（可选）
   */
  sendPage: (
    trackingId: string,
    props?: any,
    callback?: (arg: any) => any
  ) => void;

  /**
   * 获取访问用户Id（设备Id）
   * @param callback 回调函数（可选）
   */
  getDeviceId: (callback?: (args?: any) => any) => void;

  // 获取增强型UA
  getUserAgent?: (callback?: (userAgent: string) => any) => string;

  /**
   * 运行中修改配置
   * @param optionKey 配置项键名
   * @param value 配置项值
   * @param callback 回调函数（可选）
   */
  setOption: (
    optionKey: string,
    value: any,
    callback?: (args?: any) => any
  ) => void;

  /**
   * 运行中获取配置
   * @param trackingId 跟踪ID
   * @param optionKey 配置项键名
   * @param callback 回调函数（可选）
   * @returns 配置项值
   */
  getOption: (
    trackingId: string,
    optionKey: string,
    callback?: (args?: any) => any
  ) => any;

  /**
   * 设置设备ID，一般为openId
   * @param trackingId 跟踪ID
   * @param assignmentId 分配ID
   * @param callback 回调函数（可选）
   */
  identify: (
    trackingId: string,
    assignmentId: string | number,
    callback?: (arg?: any) => any
  ) => void;

  /**
   * 发送用户变量
   * @param trackingId 跟踪ID
   * @param userAttributes 用户属性
   * @param callback 回调函数（可选）
   */
  setUserAttributes: (
    trackingId: string,
    userAttributes: any,
    callback?: (args?: any) => any
  ) => void;

  /**
   * 设置登录用户Id
   * @param trackingId 跟踪ID
   * @param userId 用户ID
   * @param userKey 用户密钥（可选）
   * @param callback 回调函数（可选）
   */
  setUserId: (
    trackingId: string,
    userId: string,
    userKey?: string,
    callback?: (args?: any) => any
  ) => void;

  /**
   * 清除登录用户Id
   * @param trackingId 跟踪ID
   * @param callback 回调函数（可选）
   */
  clearUserId: (trackingId: string, callback?: (arg: any) => any) => void;

  /**
   * 设置全局通用属性
   * @param trackingId 跟踪ID
   * @param properties 属性对象
   * @param callback 回调函数（可选）
   */
  setGeneralProps: (
    trackingId: string,
    properties: any,
    callback?: (args?: any) => any
  ) => void;

  /**
   * 清除已设置的全局通用属性
   * @param trackingId 跟踪ID
   * @param properties 要清除的属性名数组
   * @param callback 回调函数（可选）
   */
  clearGeneralProps: (
    trackingId: string,
    properties: string[] | undefined,
    callback?: (args?: any) => any
  ) => void;

  /**
   * 创建自定义埋点事件
   * @param trackingId 跟踪ID
   * @param name 事件名称
   * @param properties 事件属性
   * @param callback 回调函数（可选）
   */
  track: (
    trackingId: string,
    name: string,
    properties: { [key: string]: string | string[] },
    callback?: (args?: any) => any
  ) => void;

  /**
   * 初始化事件计时器（可选）
   * @param trackingId 跟踪ID
   * @param eventName 事件名称
   * @param callback 回调函数（可选）
   */
  trackTimerStart?: (
    trackingId: string,
    eventName: string,
    callback?: (args?: any) => any
  ) => void;

  /**
   * 暂停事件计时器（可选）
   * @param trackingId 跟踪ID
   * @param timerId 计时器ID
   * @param callback 回调函数（可选）
   */
  trackTimerPause?: (
    trackingId: string,
    timerId: string,
    callback?: (arg: any) => any
  ) => void;

  /**
   * 恢复事件计时器（可选）
   * @param trackingId 跟踪ID
   * @param timerId 计时器ID
   * @param callback 回调函数（可选）
   */
  trackTimerResume?: (
    trackingId: string,
    timerId: string,
    callback?: (arg: any) => any
  ) => void;

  /**
   * 停止事件计时器并上报事件（可选）
   * @param trackingId 跟踪ID
   * @param timerId 计时器ID
   * @param attributes 事件属性
   * @param callback 回调函数（可选）
   */
  trackTimerEnd?: (
    trackingId: string,
    timerId: string,
    attributes: any,
    callback?: (args?: any) => any
  ) => void;

  /**
   * 移除事件计时器（可选）
   * @param trackingId 跟踪ID
   * @param timerId 计时器ID
   * @param callback 回调函数（可选）
   */
  removeTimer?: (
    trackingId: string,
    timerId: string,
    callback?: (arg: any) => any
  ) => void;

  /**
   * 清除所有事件计时器（可选）
   * @param trackingId 跟踪ID
   * @param callback 回调函数（可选）
   */
  clearTrackTimer?: (
    trackingId: string,
    callback?: (args?: any) => any
  ) => void;

  /**
   * 手动更新曝光监听
   * @param callback 回调函数（可选）
   */
  updateImpression: (callback?: () => any) => void;

  /**
   * 获取ABTest数据（可选）
   * @param trackingId 跟踪ID
   * @param layerId 层级ID
   * @param callback 回调函数（可选）
   */
  getABTest?: (
    trackingId: string,
    layerId: string,
    callback?: (arg: any) => any
  ) => void;

  /**
   * 设置发送前拦截回调（可选）
   * @param trackingId 跟踪ID
   * @param fn 拦截函数
   * @param callback 回调函数
   */
  setBeforeSendListener?: (
    trackingId: string,
    fn: () => any,
    callback: any
  ) => void;
}
