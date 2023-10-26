import { DataStoreType, OriginOptions } from './dataStore';
import { PluginsType } from './plugins';
import { StorageType } from './storage';
import { UploaderType } from './uploader';
import { UserStoreType } from './userStore';

export interface GrowingIOType {
  // sdk版本号
  sdkVersion: string;
  // vds命名
  vds: string;
  // sdk是否全量集成
  gioSDKFull: boolean;
  // sdk初始化标识
  gioSDKInitialized: boolean;
  // 小程序是否打通标识
  useEmbeddedInherit?: boolean;
  // hybrid是否打通标识
  useHybridInherit?: boolean;
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
  // 工具类
  utils?: any;
  // 消息管理
  emitter: {
    emit: (msg: string, args?: any) => void;
    on: (msg: string, method: (args?: any) => any) => void;
    off: (msg: string, method: (args?: any) => any) => void;
  };
  // 初始化
  init: (options: any, callback?: (args?: any) => any) => void;
  // 外部调用手动发送visit
  sendVisit: (props?: any, callback?: (arg: any) => any) => void;
  // 外部调用手动发送page
  sendPage: (props?: any, callback?: (arg: any) => any) => void;
  // 注册插件
  registerPlugins: (path?: string, callback?: (arg: any) => any) => void;
  // 获取所有已注册插件
  getPlugins: (callback: (args?: any) => any[]) => void;
  // 运行中修改配置
  setOption: (
    optionKey: string,
    value: any,
    callback?: (args?: any) => any
  ) => void;
  // 运行中获取配置
  getOption: (optionKey: string, callback?: (args?: any) => any) => any;
  // 设置埋点通用属性
  setGeneralProps: (properties: any, callback?: (args?: any) => any) => void;
  // 清除已设置的埋点通用属性
  clearGeneralProps: (
    properties: string[] | undefined,
    callback?: (args?: any) => any
  ) => void;
  // 获取访问用户Id（设备Id）
  getDeviceId: (callback?: (args?: any) => any) => void;
  // 设置登录用户Id
  setUserId: (
    userId: string,
    userKey?: string,
    callback?: (args?: any) => any
  ) => void;
  // 清除登录用户Id
  clearUserId: (callback?: (arg: any) => any) => void;
  // 发送用户变量
  setUserAttributes: (
    userAttributes: any,
    props?: any,
    callback?: (args?: any) => any
  ) => void;
  // 创建自定义埋点事件
  track: (
    name: string,
    properties: { [key: string]: string },
    callback?: (args?: any) => any
  ) => void;
  // 初始化事件计时器
  trackTimerStart?: (eventName: string, callback?: (args?: any) => any) => void;
  // 暂停事件计时器
  trackTimerPause?: (timerId: string, callback?: (arg: any) => any) => void;
  // 恢复事件计时器
  trackTimerResume?: (timerId: string, callback?: (arg: any) => any) => void;
  // 停止事件计时器并上报事件
  trackTimerEnd?: (
    timerId: string,
    attributes: any,
    callback?: (args?: any) => any
  ) => void;
  // 移除事件计时器
  removeTimer?: (timerId: string, callback?: (arg: any) => any) => void;
  // 清除所有事件计时器
  clearTrackTimer?: (callback?: (args?: any) => any) => void;
  // 获取ABTest数据
  getABTest?: (layerId: string, callback?: (arg: any) => any) => void;
}
