// 允许填写的支持平台
export const PLATFORM = [
  'web',
  'wxwv',
  'minp',
  'alip',
  'baidup',
  'qq',
  'bytedance'
];

// SDK系统的默认配置项
export const DEFAULT_SETTING = {
  // 无埋点开关
  autotrack: { type: 'boolean', default: true },
  // 加密开关
  compress: { type: 'boolean', default: true },
  // 数据采集开关
  dataCollect: { type: 'boolean', default: true },
  // 调试开关
  debug: { type: 'boolean', default: false },
  // hash处理开关
  hashtag: { type: 'boolean', default: false },
  // 移动端点击处理开关（历史遗留，一般用不到）
  touch: { type: 'boolean', default: false },
  // web应用版本
  version: { type: 'string', default: '1.0.0' },
  // 平台
  platform: { type: 'string', default: 'web' },
  // 指定cookie存储的域
  cookieDomain: { type: 'string', default: '' },
  // 指定默认上报方式
  sendType: { type: 'string', default: 'beacon' }
};

// CDP的默认配置项
export const CDP_SETTING = {
  // 开启多身份认证
  enableIdMapping: { type: 'boolean', default: false },
  // 弹窗拉取数据用的host地址
  gtouchHost: { type: 'string', default: '' },
  // 上报地址
  host: { type: 'string', default: 'napi.growingio.com' },
  // 上报事件时忽略的字段
  ignoreFields: { type: 'array', default: [] },
  // 是否穿透Hybrid（具体见gioHybridAdapter）
  penetrateHybrid: { type: 'boolean', default: true },
  // 网络协议
  scheme: {
    type: 'string',
    default:
      location.protocol.indexOf('http') > -1
        ? location.protocol.replace(':', '')
        : 'https'
  },
  // session有效期
  sessionExpires: { type: 'number', default: 30 },
  // 性能监控配置项
  performance: { type: 'object', default: { monitor: true, exception: true } },
  // 小程序内嵌打通时忽略的字段（即忽略的字段不会被打通）
  embeddedIgnore: { type: 'array', default: [] },
  // sdk持久化存储信息的存储类型
  storageType: { type: 'string', default: 'cookie' },
  // 请求上报的超时时长
  requestTimeout: { type: 'number', default: 5000 }
};

// Saas的默认配置项
export const SAAS_SETTING = {};

// 通过gio(xxxx)允许调用的通用方法
export const uniHandlers = [
  'clearUserId',
  'getGioInfo',
  'getLocation',
  'getOption',
  'init',
  'setDataCollect', // 兼容性保留，后续迭代可能会移除
  'setOption',
  'setUserId',
  'track',
  'setGeneralProps',
  'clearGeneralProps'
];

// saas中通过gio(xxxx)允许调用的方法
export const SaasHandlers = [
  ...uniHandlers,
  'setEvar',
  'setPage',
  'setUser',
  'setVisitor'
];

// cdp中通过gio(xxxx)允许调用的方法
export const CDPHandlers = [
  ...uniHandlers,
  'enableDebug', // 兼容性保留，后续迭代可能会移除
  'enableHT', // 兼容性保留，后续迭代可能会移除
  'setAutotrack', // 兼容性保留，后续迭代可能会移除
  'setTrackerHost', // 兼容性保留，后续迭代可能会移除
  'setTrackerScheme', // 兼容性保留，后续迭代可能会移除
  'setUserAttributes', // 兼容性保留，后续迭代可能会移除
  'getVisitorId', // 兼容性保留，后续迭代可能会移除
  'getDeviceId', // 获取访问用户Id
  'registerPlugins', // 手动注册插件
  'getPlugins', // 获取所有已注册插件
  'sendPage', // 手动发page事件
  'sendVisit', // 手动发visit事件
  'trackTimerStart', // 初始化事件计时器
  'trackTimerPause', // 暂停事件计时器
  'trackTimerResume', // 恢复事件计时器
  'trackTimerEnd', // 停止事件计时器并上报事件
  'removeTimer', // 移除事件计时器
  'clearTrackTimer', // 清除所有事件计时器
  'updateImpression' // 手动更新曝光监控
];

// 允许通过setOption修改的配置项
export const allowOptions = [
  'autotrack',
  'dataCollect',
  'dataSourceId',
  'debug',
  'host',
  'hashtag',
  'scheme'
];

// 允许通过setOption修改的配置项枚举
export const OPTIONS_ENUM = {
  autotrack: '无埋点采集',
  dataCollect: '数据采集',
  debug: '调试模式'
};

// 已废弃方法
export const deprecatedHandlers = [
  'send',
  'setConfig',
  'collectImp',
  'setPlatformProfile'
];

// 允许忽略的上报字段
export const IGNORE_PARAMS: string[] = ['screenHeight', 'screenWidth'];

// 无埋点枚举
export const EVENT_TYPE: any = {
  click: 'VIEW_CLICK',
  change: 'VIEW_CHANGE',
  submit: 'FORM_SUBMIT'
};
