// 允许填写的支持平台
export const PLATFORM = [
  'web',
  'wxwv',
  'Android',
  'iOS',
  'minp',
  'alip',
  'baidup',
  'qq',
  'bytedance',
  'kuaishoup',
  'jdp'
];

// SDK系统的默认配置项
export const DEFAULT_SETTING = {
  // 是否开启无埋点
  autotrack: { type: 'boolean', default: true },
  // 是否开启数据加密压缩
  compress: { type: 'boolean', default: true },
  // cookie存储的域
  cookieDomain: { type: 'string', default: '' },
  // 是否开启数据采集
  dataCollect: { type: 'boolean', default: true },
  // 是否开启调试模式
  debug: { type: 'boolean', default: false },
  // 与小程序打通时忽略的字段
  embeddedIgnore: { type: 'array', default: [] },
  // 是否开启强制登录
  forceLogin: { type: 'boolean', default: false },
  // 是否开启多身份认证
  idMapping: { type: 'boolean', default: false },
  // 弹窗接口域名
  gtouchHost: { type: 'string', default: '' },
  // 是否开启哈希路由地址解析
  hashtag: { type: 'boolean', default: false },
  // 数据上报忽略字段
  ignoreFields: { type: 'array', default: [] },
  // 是否使用原始来源信息作为访问事件的参数上报
  originalSource: { type: 'boolean', default: true },
  // 是否穿透hybrid
  penetrateHybrid: { type: 'boolean', default: true },
  // 是否开启性能采集
  performance: { type: 'object', default: { monitor: true, exception: true } },
  // 所属平台
  platform: { type: 'string', default: 'web' },
  // 指定默认上报方式
  sendType: { type: 'string', default: 'beacon' },
  // 数据上报域名
  serverUrl: { type: 'string', default: 'https://napi.growingio.com' },
  // 会话有效时长
  sessionExpires: { type: 'number', default: 30 },
  // 存储类型
  storageType: { type: 'string', default: 'cookie' },
  // 是否开启移动端触摸感知
  touch: { type: 'boolean', default: false },
  // 是否采集爬虫数据
  trackBot: { type: 'boolean', default: true },
  // 应用版本号
  version: { type: 'string', default: '1.0.0' }
};

// 通过gdp(xxxx)允许调用的通用方法
export const HANDLERS = [
  'clearGeneralProps', // 清除埋点通用属性
  'clearTrackTimer', // 清除所有事件计时器
  'clearUserId', // 清除用户ID
  'getDeviceId', // 获取访问用户ID(设备ID)
  'getOption', // 获取当前SDK配置项状态
  'getPlugins', // 获取所有已注册插件
  'identify', // 强制登录设置设备id
  'init', // 初始化SDK
  'registerPlugins', // 手动注册插件
  'removeTimer', // 移除事件计时器
  'sendPage', // 手动发page事件
  'sendVisit', // 手动发visit事件
  'setGeneralProps', // 设置埋点通用属性
  'setOption', // 设置配置项
  'setUserAttributes', // 设置用户属性
  'setUserId', // 设置用户ID
  'track', // 上报埋点
  'trackTimerEnd', // 停止事件计时器并上报事件
  'trackTimerPause', // 暂停事件计时器
  'trackTimerResume', // 恢复事件计时器
  'trackTimerStart', // 初始化事件计时器
  'getABTest' // 获取ABTest数据
];

// 允许通过setOption修改的配置项
export const ALLOW_OPTIONS = {
  autotrack: '无埋点采集',
  dataCollect: '数据采集',
  dataSourceId: '数据源ID',
  debug: '调试模式',
  forceLogin: '强制登录',
  hashtag: '哈希解析',
  serverUrl: '数据上报服务地址'
};

// 已废弃方法
export const DEPRECATED_HANDLERS = [
  'collectImp',
  'enableDebug',
  'enableHT',
  'getVisitorId',
  'send',
  'setAutotrack',
  'setConfig',
  'setDataCollect',
  'setPlatformProfile',
  'setTrackerHost',
  'setTrackerScheme'
];

// 允许忽略的上报字段
export const IGNORE_PARAMS: string[] = ['screenHeight', 'screenWidth'];
