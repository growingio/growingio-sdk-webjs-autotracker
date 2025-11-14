/**
 * GrowingIO Web SDK 常用API类型定义
 *
 * 此文件包含用户在使用GrowingIO Web SDK时最常使用的API类型定义
 */

/**
 * SDK初始化配置选项
 */
export interface InitOptions {
  /** 项目ID */
  projectId: string;
  /** 数据源ID */
  dataSourceId: string;
  /** 应用ID */
  appId?: string;
  /** 是否开启无埋点，默认为true */
  autotrack?: boolean;
  /** 是否开启数据加密压缩，默认为true */
  compress?: boolean;
  /** cookie存储的域 */
  cookieDomain?: string;
  /** 是否开启数据采集，默认为true */
  dataCollect?: boolean;
  /** 是否开启调试模式，默认为false */
  debug?: boolean;
  /** 与小程序打通时忽略的字段 */
  embeddedIgnore?: string[];
  /** 与小程序打通时的配置项 */
  embeddedAdapter?: {
    /** 小程序服务器URL */
    circleServerUrl?: string;
  };
  /** 是否开启增强型UA，默认为true */
  extraUA?: boolean;
  /** 是否开启强制登录，默认为false */
  forceLogin?: boolean;
  /** 是否开启多身份认证 */
  idMapping?: boolean;
  /** 弹窗接口域名 */
  gtouchHost?: string;
  /** 是否开启哈希路由地址解析，默认为false */
  hashtag?: boolean;
  /** 数据上报忽略字段 */
  ignoreFields?: string[];
  /** 曝光比例 */
  impressionScale?: number;
  /** 是否使用原始来源信息作为访问事件的参数上报，默认为true */
  originalSource?: boolean;
  /** 指定打通app的包名 */
  packageName?: string;
  /** 是否穿透hybrid，默认为true */
  penetrateHybrid?: boolean;
  /** 性能采集配置 */
  performance?: {
    /** 是否开启性能监控，默认为true */
    monitor?: boolean;
    /** 是否开启异常监控，默认为true */
    exception?: boolean;
    /** 网络性能监控配置 */
    network?:
      | boolean
      | {
          /** 排除的请求 */
          exclude?: RegExp | string | any[];
        };
  };
  /** 所属平台，默认为'web' */
  platform?:
    | 'web'
    | 'wxwv'
    | 'Android'
    | 'iOS'
    | 'minp'
    | 'alip'
    | 'baidup'
    | 'qq'
    | 'bytedance'
    | 'kuaishoup'
    | 'jdp';
  /** 请求上报的超时时长，默认为5000ms */
  requestTimeout?: number;
  /** 与小程序做打通操作时是否重写参数，默认为true */
  rewriteQuery?: boolean;
  /** 指定默认上报方式，默认为'beacon' */
  sendType?: 'beacon' | 'xhr' | 'image';
  /** 数据上报域名 */
  serverUrl?: string;
  /** 会话有效时长，默认为30分钟 */
  sessionExpires?: number;
  /** 存储类型，默认为'cookie' */
  storageType?: 'cookie' | 'localstorage';
  /** 是否开启移动端触摸感知，默认为false */
  touch?: boolean;
  /** 是否采集爬虫数据，默认为true */
  trackBot?: boolean;
  /** 是否自动采集页面访问事件，默认为true */
  trackPage?: boolean;
  /** 应用版本号，默认为'1.0.0' */
  version?: string;
}

/**
 * 页面属性
 */
export interface PageAttributes {
  [key: string]: string | number | boolean;
}

/**
 * 用户属性
 */
export interface UserAttributes {
  [key: string]: string | number | boolean;
}

/**
 * 事件属性
 */
export interface EventAttributes {
  [key: string]: string | string[] | number | boolean;
}

/**
 * 埋点事件参数
 */
export interface TrackEventParams {
  /** 事件名称 */
  eventName: string;
  /** 事件属性 */
  properties?: EventAttributes;
}

/**
 * 计时器事件参数
 */
export interface TimerEventParams {
  /** 计时器ID */
  timerId: string;
  /** 事件属性 */
  properties?: EventAttributes;
}

/**
 * A/B测试回调函数
 */
export type ABTestCallback = (data: any) => void;

/**
 * 通用回调函数
 */
export type CommonCallback = (result?: any) => void;

/**
 * 发送前拦截回调函数
 */
export type BeforeSendListener = () => any;

/**
 * 页面监听回调函数
 */
export type PageListenerCallback = (pageInfo: {
  path: string;
  query: string;
  title: string;
}) => void;

/**
 * GrowingIO SDK 实例类型
 * 包含用户常用的API方法签名
 */
export interface GrowingIOInstance {
  /**
   * 初始化SDK
   * @param projectId 项目ID
   * @param dataSourceId 数据源ID
   * @param options 初始化配置（可选，appId可以在options中指定）
   */
  init(projectId: string, dataSourceId: string, options?: InitOptions): boolean;

  /**
   * 注册插件
   * @param plugins 插件数组
   * @param callback 回调函数
   */
  registerPlugins(plugins: any[], callback?: CommonCallback): void;

  /**
   * 获取所有已注册插件
   * @param callback 回调函数
   */
  getPlugins(callback?: (plugins: any[]) => void): void;

  /**
   * 获取设备ID
   * @param callback 回调函数
   */
  getDeviceId(callback?: CommonCallback): void;

  /**
   * 获取增强型UserAgent
   * @param callback 回调函数
   */
  getUserAgent(callback?: (userAgent: string) => any): string;

  /**
   * 设置全局通用属性
   * @param trackingId 跟踪ID
   * @param properties 属性对象
   * @param callback 回调函数
   */
  setGeneralProps(
    trackingId: string,
    properties: EventAttributes,
    callback?: CommonCallback
  ): void;

  /**
   * 清除全局通用属性
   * @param trackingId 跟踪ID
   * @param properties 要清除的属性名数组，如果为空则清除所有
   * @param callback 回调函数
   */
  clearGeneralProps(
    trackingId: string,
    properties: string[] | undefined,
    callback?: CommonCallback
  ): void;

  /**
   * 设置页面属性
   * @param trackingId 跟踪ID
   * @param properties 属性对象
   * @param callback 回调函数
   */
  setPageAttributes(
    trackingId: string,
    properties: PageAttributes,
    callback?: CommonCallback
  ): void;

  /**
   * 清除页面属性
   * @param trackingId 跟踪ID
   * @param properties 要清除的属性名数组，如果为空则清除所有
   * @param callback 回调函数
   */
  clearPageAttributes(
    trackingId: string,
    properties: string[] | undefined,
    callback?: CommonCallback
  ): void;

  /**
   * 设置用户属性
   * @param trackingId 跟踪ID
   * @param userAttributes 用户属性对象
   * @param callback 回调函数
   */
  setUserAttributes(
    trackingId: string,
    userAttributes: UserAttributes,
    callback?: CommonCallback
  ): void;

  /**
   * 设置用户ID
   * @param trackingId 跟踪ID
   * @param userId 用户ID
   * @param userKey 用户密钥（可选）
   * @param callback 回调函数
   */
  setUserId(
    trackingId: string,
    userId: string,
    userKey?: string,
    callback?: CommonCallback
  ): void;

  /**
   * 清除用户ID
   * @param trackingId 跟踪ID
   * @param callback 回调函数
   */
  clearUserId(trackingId: string, callback?: CommonCallback): void;

  /**
   * 发送自定义埋点事件
   * @param trackingId 跟踪ID
   * @param eventName 事件名称
   * @param properties 事件属性
   * @param callback 回调函数
   */
  track(
    trackingId: string,
    eventName: string,
    properties: EventAttributes,
    callback?: CommonCallback
  ): void;

  /**
   * 启动事件计时器
   * @param trackingId 跟踪ID
   * @param eventName 事件名称
   * @param callback 回调函数，返回计时器ID
   */
  trackTimerStart(
    trackingId: string,
    eventName: string,
    callback?: (timerId: string) => void
  ): void;

  /**
   * 暂停事件计时器
   * @param trackingId 跟踪ID
   * @param timerId 计时器ID
   * @param callback 回调函数
   */
  trackTimerPause(
    trackingId: string,
    timerId: string,
    callback?: CommonCallback
  ): void;

  /**
   * 恢复事件计时器
   * @param trackingId 跟踪ID
   * @param timerId 计时器ID
   * @param callback 回调函数
   */
  trackTimerResume(
    trackingId: string,
    timerId: string,
    callback?: CommonCallback
  ): void;

  /**
   * 停止事件计时器并发送事件
   * @param trackingId 跟踪ID
   * @param timerId 计时器ID
   * @param properties 事件属性
   * @param callback 回调函数
   */
  trackTimerEnd(
    trackingId: string,
    timerId: string,
    properties: EventAttributes,
    callback?: CommonCallback
  ): void;

  /**
   * 移除事件计时器
   * @param trackingId 跟踪ID
   * @param timerId 计时器ID
   * @param callback 回调函数
   */
  removeTimer(
    trackingId: string,
    timerId: string,
    callback?: CommonCallback
  ): void;

  /**
   * 清除所有事件计时器
   * @param trackingId 跟踪ID
   * @param callback 回调函数
   */
  clearTrackTimer(trackingId: string, callback?: CommonCallback): void;

  /**
   * 手动更新曝光监听
   * @param callback 回调函数
   */
  updateImpression(callback?: () => void): void;

  /**
   * 获取A/B测试数据
   * @param trackingId 跟踪ID
   * @param layerId 层级ID
   * @param callback 回调函数
   */
  getABTest(
    trackingId: string,
    layerId: string,
    callback: ABTestCallback
  ): void;

  /**
   * 设置发送前拦截回调
   * @param trackingId 跟跟ID
   * @param fn 拦截函数
   * @param callback 回调函数
   */
  setBeforeSendListener(
    trackingId: string,
    fn: BeforeSendListener,
    callback: CommonCallback
  ): void;

  /**
   * 设置页面变更监听
   * @param trackingId 跟踪ID
   * @param callback 回调函数
   */
  setPageListener(trackingId: string, callback?: PageListenerCallback): void;

  /**
   * 手动发送访问事件
   * @param trackingId 跟踪ID
   * @param props 事件属性
   * @param callback 回调函数
   */
  sendVisit(trackingId: string, props?: any, callback?: CommonCallback): void;

  /**
   * 手动发送页面事件
   * @param trackingId 跟踪ID
   * @param props 事件属性
   * @param callback 回调函数
   */
  sendPage(trackingId: string, props?: any, callback?: CommonCallback): void;

  /**
   * 设置设备ID（强制登录）
   * @param trackingId 跟踪ID
   * @param assignmentId 分配ID
   * @param callback 回调函数
   */
  identify(
    trackingId: string,
    assignmentId: string | number,
    callback?: CommonCallback
  ): void;

  /**
   * 设置配置项
   * @param trackingId 跟踪ID
   * @param optionKey 配置项键名
   * @param value 配置项值
   * @param callback 回调函数
   */
  setOption(
    trackingId: string,
    optionKey: string,
    value: any,
    callback?: CommonCallback
  ): void;

  /**
   * 获取配置项
   * @param trackingId 跟踪ID
   * @param optionKey 配置项键名
   * @param callback 回调函数
   */
  getOption(
    trackingId: string,
    optionKey: string,
    callback?: CommonCallback
  ): void;
}

/**
 * GrowingIO SDK 全局函数类型
 */
export type GrowingIO = {
  /**
   * SDK主函数，用于调用各种API
   * @param method 方法名
   * @param args 方法参数
   */
  (method: string, ...args: any[]): any;

  /**
   * 检查方法是否可用
   * @param method 方法名
   */
  canIUse(method: string): boolean;

  /** SDK版本号 */
  gioSDKVersion: string;

  /** 是否为全量SDK */
  gioSDKFull: boolean;
} & GrowingIOInstance;

/**
 * 默认导出的gdp对象类型
 */

type Prefixed<M extends string> = `${string}.${M}`;
type PrefixedMethod = Prefixed<
  | 'clearGeneralProps'
  | 'clearPageAttributes'
  | 'clearTrackTimer'
  | 'clearUserId'
  | 'getABTest'
  | 'getOption'
  | 'identify'
  | 'init'
  | 'removeTimer'
  | 'sendPage'
  | 'sendVisit'
  | 'setBeforeSendListener'
  | 'setGeneralProps'
  | 'setPageAttributes'
  | 'setPageListener'
  | 'setOption'
  | 'setUserAttributes'
  | 'setUserId'
  | 'track'
  | 'trackTimerEnd'
  | 'trackTimerPause'
  | 'trackTimerResume'
  | 'trackTimerStart'
>;
type StrictMethod =
  | 'canIUse'
  | 'clearGeneralProps'
  | 'clearPageAttributes'
  | 'clearTrackTimer'
  | 'clearUserId'
  | 'getABTest'
  | 'getDeviceId'
  | 'getOption'
  | 'getPlugins'
  | 'getUserAgent'
  | 'identify'
  | 'init'
  | 'registerPlugins'
  | 'removeTimer'
  | 'sendPage'
  | 'sendVisit'
  | 'setBeforeSendListener'
  | 'setGeneralProps'
  | 'setPageAttributes'
  | 'setPageListener'
  | 'setOption'
  | 'setUserAttributes'
  | 'setUserId'
  | 'track'
  | 'trackTimerEnd'
  | 'trackTimerPause'
  | 'trackTimerResume'
  | 'trackTimerStart'
  | 'updateImpression'
  | PrefixedMethod;
type StrictArgs<M extends StrictMethod> =
  M extends 'canIUse' ? [methodName: string] :
  M extends 'clearGeneralProps' | Prefixed<'clearGeneralProps'> ? [properties: string[] | undefined, callback?: CommonCallback] :
  M extends 'clearPageAttributes' | Prefixed<'clearPageAttributes'> ? [properties: string[] | undefined, callback?: CommonCallback] :
  M extends 'clearTrackTimer' | Prefixed<'clearTrackTimer'> ? [callback?: CommonCallback] :
  M extends 'clearUserId' | Prefixed<'clearUserId'> ? [callback?: CommonCallback] :
  M extends 'getABTest' | Prefixed<'getABTest'> ? [layerId: string, callback: ABTestCallback] :
  M extends 'getDeviceId' ? [callback?: CommonCallback] :
  M extends 'getOption' | Prefixed<'getOption'> ? [optionKey: string, callback?: CommonCallback] :
  M extends 'getPlugins' ? [callback?: (plugins: any[]) => void] :
  M extends 'getUserAgent' ? [callback?: (userAgent: string) => any] :
  M extends 'identify' | Prefixed<'identify'> ? [assignmentId: string | number, callback?: CommonCallback] :
  M extends 'init' | Prefixed<'init'> ? [projectId: string, dataSourceId: string, options?: InitOptions] :
  M extends 'registerPlugins' ? [plugins: any[], callback?: CommonCallback] :
  M extends 'removeTimer' | Prefixed<'removeTimer'> ? [timerId: string, callback?: CommonCallback] :
  M extends 'sendPage' | Prefixed<'sendPage'> ? [props?: any, callback?: CommonCallback] :
  M extends 'sendVisit' | Prefixed<'sendVisit'> ? [props?: any, callback?: CommonCallback] :
  M extends 'setBeforeSendListener' | Prefixed<'setBeforeSendListener'> ? [fn: BeforeSendListener, callback: CommonCallback] :
  M extends 'setGeneralProps' | Prefixed<'setGeneralProps'> ? [properties: EventAttributes, callback?: CommonCallback] :
  M extends 'setPageAttributes' | Prefixed<'setPageAttributes'> ? [properties: PageAttributes, callback?: CommonCallback] :
  M extends 'setPageListener' | Prefixed<'setPageListener'> ? [callback?: PageListenerCallback] :
  M extends 'setOption' | Prefixed<'setOption'> ? [optionKey: string, value: any, callback?: CommonCallback] :
  M extends 'setUserAttributes' | Prefixed<'setUserAttributes'> ? [userAttributes: UserAttributes, callback?: CommonCallback] :
  M extends 'setUserId' | Prefixed<'setUserId'> ? [userId: string, userKey?: string, callback?: CommonCallback] :
  M extends 'track' | Prefixed<'track'> ? ([eventName: string, properties: EventAttributes, callback?: CommonCallback] | [eventName: string, callback?: CommonCallback]) :
  M extends 'trackTimerEnd' | Prefixed<'trackTimerEnd'> ? [timerId: string, properties: EventAttributes, callback?: CommonCallback] :
  M extends 'trackTimerPause' | Prefixed<'trackTimerPause'> ? [timerId: string, callback?: CommonCallback] :
  M extends 'trackTimerResume' | Prefixed<'trackTimerResume'> ? [timerId: string, callback?: CommonCallback] :
  M extends 'trackTimerStart' | Prefixed<'trackTimerStart'> ? [eventName: string, callback?: (timerId: string) => void] :
  M extends 'updateImpression' ? [callback?: () => void] :
  never;
type StrictReturn<M extends StrictMethod> =
  M extends 'canIUse' ? boolean :
  M extends 'getUserAgent' ? string :
  M extends 'init' | Prefixed<'init'> ? boolean :
  void;
export type Gdp = {
  <M extends StrictMethod>(method: M, ...args: StrictArgs<M>): StrictReturn<M>;
  gioSDKVersion: string;
  gioSDKFull: boolean;
};

declare const gdp: Gdp;
export default gdp;
