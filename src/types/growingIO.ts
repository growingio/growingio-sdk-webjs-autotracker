import { DataStoreType, OriginOptions } from './dataStore';
import { PluginsType } from './plugins';
import { StorageType } from './storage';
import { UploaderType } from './uploader';
import { UserStoreType } from './userStore';

export interface GrowingIOType {
  // sdk版本号
  sdkVersion: string;
  // vds命名
  vdsName: string;
  // sdk是否全量集成
  gioSDKFull: boolean;
  // sdk初始化标识
  gioSDKInitialized: boolean;
  // 小程序是否打通标识
  useEmbeddedInherit?: string;
  // hybrid是否打通标识
  useHybridInherit?: string;
  // 所有配置项
  vdsConfig: OriginOptions;
  // 存储实例
  storage: StorageType;
  // 用户管理实例
  userStore: UserStoreType;
  // 数据管理实例
  dataStore: DataStoreType;
  // 插件管理实例
  plugins: PluginsType;
  // 上传组件实例
  uploader: UploaderType;
  // 用于放在事件中区别于为其他功能而生成事件的跟踪器Id，默认为g0
  trackingId: string;
  // 存储子实例的配置和信息
  subInstance: {
    [key: string]: OriginOptions;
  };
  // 工具类
  utils?: any;
  // 消息管理
  emitter: {
    emit: (msg: string, args?: any) => void;
    on: (msg: string, method: (args?: any) => any) => void;
    off: (msg: string, method: (args?: any) => any) => void;
  };
  // 初始化
  init: (options: any) => boolean;
  // 注册插件
  registerPlugins: (plugins: any[], callback?: (arg: any) => any) => void;
  // 获取所有已注册插件
  getPlugins: (callback: (args?: any) => any[]) => void;
  // 外部调用手动发送visit
  sendVisit: (
    trackingId: string,
    props?: any,
    callback?: (arg: any) => any
  ) => void;
  // 添加页面变更事件监听
  setPageListener: (trackingId: string, callback?: (arg?: any) => void) => void;
  // 设置页面属性
  setPageAttributes: (trackingId: string, properties: any) => void;
  // 清空已设置的页面属性
  clearPageAttributes: (
    trackingId: string,
    properties: string[] | undefined,
    callback?: (args?: any) => any
  ) => void;
  // 外部调用手动发送page
  sendPage: (
    trackingId: string,
    props?: any,
    callback?: (arg: any) => any
  ) => void;
  // 获取访问用户Id（设备Id）
  getDeviceId: (callback?: (args?: any) => any) => void;
  // 运行中修改配置
  setOption: (
    optionKey: string,
    value: any,
    callback?: (args?: any) => any
  ) => void;
  // 运行中获取配置
  getOption: (
    trackingId: string,
    optionKey: string,
    callback?: (args?: any) => any
  ) => any;
  // 设置设备ID，一般为openId
  identify: (
    trackingId: string,
    assignmentId: string | number,
    callback?: (arg?: any) => any
  ) => void;
  // 发送用户变量
  setUserAttributes: (
    trackingId: string,
    userAttributes: any,
    callback?: (args?: any) => any
  ) => void;
  // 设置登录用户Id
  setUserId: (
    trackingId: string,
    userId: string,
    userKey?: string,
    callback?: (args?: any) => any
  ) => void;
  // 清除登录用户Id
  clearUserId: (trackingId: string, callback?: (arg: any) => any) => void;
  // 设置全局通用属性
  setGeneralProps: (
    trackingId: string,
    properties: any,
    callback?: (args?: any) => any
  ) => void;
  // 清除已设置的全局通用属性
  clearGeneralProps: (
    trackingId: string,
    properties: string[] | undefined,
    callback?: (args?: any) => any
  ) => void;
  // 创建自定义埋点事件
  track: (
    trackingId: string,
    name: string,
    properties: { [key: string]: string | string[] },
    callback?: (args?: any) => any
  ) => void;
  // 初始化事件计时器
  trackTimerStart?: (
    trackingId: string,
    eventName: string,
    callback?: (args?: any) => any
  ) => void;
  // 暂停事件计时器
  trackTimerPause?: (
    trackingId: string,
    timerId: string,
    callback?: (arg: any) => any
  ) => void;
  // 恢复事件计时器
  trackTimerResume?: (
    trackingId: string,
    timerId: string,
    callback?: (arg: any) => any
  ) => void;
  // 停止事件计时器并上报事件
  trackTimerEnd?: (
    trackingId: string,
    timerId: string,
    attributes: any,
    callback?: (args?: any) => any
  ) => void;
  // 移除事件计时器
  removeTimer?: (
    trackingId: string,
    timerId: string,
    callback?: (arg: any) => any
  ) => void;
  // 清除所有事件计时器
  clearTrackTimer?: (
    trackingId: string,
    callback?: (args?: any) => any
  ) => void;
  // 手动更新曝光监听
  updateImpression: (callback?: () => any) => void;
  // 获取ABTest数据
  getABTest?: (
    trackingId: string,
    layerId: string,
    callback?: (arg: any) => any
  ) => void;
  // 设置发送前拦截回调
  setBeforeSendListener?: (
    trackingId: string,
    fn: () => any,
    callback: any
  ) => void;
}
