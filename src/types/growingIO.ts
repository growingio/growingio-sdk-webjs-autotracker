import { DataStoreType, OriginOptions } from './dataStore';
import { PluginsType } from './plugins';
import { StorageType } from './storage';
import { UploaderType } from './uploader';
import { UserStoreType } from './userStore';

export interface GrowingIOType {
  // 环境
  gioEnvironment: 'saas' | 'cdp';
  // sdk版本号
  sdkVersion: string;
  // sdk初始化标识
  gioSDKInitialized: boolean;
  // sdk是否全量集成
  gioSDKFull: boolean;
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
  emitter: {
    emit: (msg: string, args?: any) => void;
    on: (msg: string, method: (args?: any) => any) => void;
    off: (msg: string, method: (args?: any) => any) => void;
  };
  // 注册插件
  registerPlugins?: (path?: string) => void;
  // 初始化
  init: (args: any) => void;
  // 初始化回调
  initCallback?: (args: any) => void;
  // 修改scheme方法（兼容性保留，后续迭代可能会移除，建议使用setOption）
  setTrackerScheme?: (scheme: 'http' | 'https') => void;
  // 修改host方法（兼容性保留，后续迭代可能会移除，建议使用setOption）
  setTrackerHost?: (host: string) => void;
  // 数据上报开关（兼容性保留，后续迭代可能会移除，建议使用setOption）
  setDataCollect?: (v: boolean) => void;
  // 无埋点数据开关（兼容性保留，后续迭代可能会移除，建议使用setOption）
  setAutotrack?: (v: boolean) => void;
  // 修改调试开关（兼容性保留，后续迭代可能会移除，建议使用setOption）
  enableDebug?: (v: boolean) => void;
  // 修改hashtag开关（兼容性保留，后续迭代可能会移除，建议使用setOption）
  enableHT?: (v: boolean) => void;
  // 运行中修改配置
  setOption: (optionKey: string, value: any) => void;
  // 运行中获取配置
  getOption: (optionKey?: string) => any;
  // 创建自定义埋点事件
  track?: (
    name: string,
    properties: { [key: string]: string },
    items?: { key: string; id: string; attributes?: { [key: string]: string } }
  ) => void;
  // 设置登录用户Id
  setUserId?: (userId: string, userKey?: string) => void;
  // 清除登录用户Id
  clearUserId?: () => void;
  // 设置openId作为uid
  identify?: (openId: string, unionId?: string) => void;
  // 访问用户变量事件
  setVisitor?: (properties: { [key: string]: string }) => void;
  // 用户变量事件
  setUser?: (properties: { [key: string]: string }) => void;
  // 页面级变量事件
  setPage?: (properties: { [key: string]: string }) => void;
  // 变量转化事件
  setEvar?: (properties: { [key: string]: string }) => void;
  // 发送用户变量
  setUserAttributes?: (userAttributes: any, props?: any) => void;
  // 外部调用手动发送visit
  sendVisit?: (props?: any) => void;
  // 外部调用手动发送page
  sendPage?: (props?: any) => void;
  // 设置埋点通用属性
  setGeneralProps?: (properties: any) => void;
  // 清除已设置的埋点通用属性
  clearGeneralProps?: (properties: string[] | undefined) => void;
  // 初始化事件计时器
  trackTimerStart?: (eventName: string, fn: (timerId: string) => void) => void;
  // 暂停事件计时器
  trackTimerPause?: (timerId: string) => void;
  // 恢复事件计时器
  trackTimerResume?: (timerId: string) => void;
  // 停止事件计时器并上报事件
  trackTimerEnd?: (timerId: string, attributes: any) => void;
  // 移除事件计时器
  removeTimer?: (timerId: string) => void;
  // 清除所有事件计时器
  clearTrackTimer?: () => void;
  // 错误提示
  callError: (fn: string, type?: boolean, msg?: string) => void;
  // 不建议提示
  notRecommended: () => void;
  // 工具类
  utils?: any;
  // 用于放在事件中区别于为其他功能而生成事件的跟踪器Id，默认为g0
  trackingId: string;
}
