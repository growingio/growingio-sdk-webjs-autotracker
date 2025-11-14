/**
 * 事件类型枚举
 * 
 * 定义了SDK支持的各种事件类型
 */
export type EVENT_TYPES =
  | 'VISIT'                  // 访问事件
  | 'PAGE'                   // 页面事件
  | 'CUSTOM'                 // 自定义事件
  | 'LOGIN_USER_ATTRIBUTES'  // 登录用户属性事件
  | 'VIEW_CLICK'             // 视图点击事件
  | 'VIEW_CHANGE';           // 视图变更事件

/**
 * 事件接口
 * 
 * 定义了SDK中事件的基本结构和属性
 */
export interface EVENT {
  /** 应用渠道 */
  appChannel: string;
  
  /** 应用版本 */
  appVersion: string;
  
  /** 事件属性（可选） */
  attributes?: any;
  
  /** 自定义属性1（可选） */
  cs1?: string;
  
  /** 数据源ID */
  dataSourceId: string;
  
  /** 设备品牌 */
  deviceBrand: string;
  
  /** 设备ID */
  deviceId: string;
  
  /** 设备型号 */
  deviceModel: string;
  
  /** 设备类型 */
  deviceType: string;
  
  /** 域名 */
  domain: string;
  
  /** 事件名称 */
  eventName: string;
  
  /** 事件序列ID（可选） */
  eventSequenceId?: number;
  
  /** 事件类型 */
  eventType: EVENT_TYPES;
  
  /** 超链接（可选） */
  hyperlink?: string;
  
  /** 索引（可选） */
  index?: number;
  
  /** 语言 */
  language: string;
  
  /** 纬度（可选） */
  latitude?: number;
  
  /** 经度（可选） */
  longitude?: number;
  
  /** 网络状态 */
  networkState: string;
  
  /** 路径（可选） */
  path?: string;
  
  /** 平台 */
  platform: string;
  
  /** 平台版本 */
  platformVersion: string;
  
  /** 属性（可选） */
  properties?: any;
  
  /** 协议类型（可选） */
  protocolType?: string;
  
  /** 查询参数（可选） */
  query?: string;
  
  /** 来源页面（可选） */
  referralPage?: string;
  
  /** 资源项（可选） */
  resourceItem?: any;
  
  /** 屏幕高度 */
  screenHeight: number;
  
  /** 屏幕宽度 */
  screenWidth: number;
  
  /** SDK版本 */
  sdkVersion: string;
  
  /** 会话ID */
  sessionId: string;
  
  /** 文本值（可选） */
  textValue?: string;
  
  /** 时间戳 */
  timestamp: number;
  
  /** 标题 */
  title: string;
  
  /** 用户ID（可选） */
  userId?: string;
  
  /** 用户密钥（可选） */
  userKey?: string;
  
  /** XPath路径（可选） */
  xpath?: string;
}

/**
 * 扩展事件接口
 * 
 * 扩展了EVENT接口，添加了请求相关的属性
 */
export interface EXTEND_EVENT extends EVENT {
  /** 请求ID */
  requestId: string;
  
  /** 发送类型（可选） */
  sendType?: string;
  
  /** 跟踪ID */
  trackingId: string;
}
