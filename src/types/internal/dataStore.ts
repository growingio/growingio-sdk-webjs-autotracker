import PageType from './page';

/**
 * 用户配置选项接口
 *
 * 定义了用户在初始化SDK时可以传入的配置选项
 */
export interface UserOptions {
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

  /** 这是否开启增强型UA */
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

  /** 所属平台 */
  platform?: string;

  /** 请求上报的超时时长，默认为5000ms */
  requestTimeout?: number;

  /** 与小程序做打通操作时是否重写参数，默认为true */
  rewriteQuery?: boolean;

  /** 指定默认上报方式 */
  sendType?: 'beacon' | 'xhr' | 'image';

  /** 数据上报域名 */
  serverUrl?: string;

  /** 会话有效时长，默认为30分钟 */
  sessionExpires?: number;

  /** 存储类型 */
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
 * 原始配置选项接口
 *
 * 扩展了UserOptions，添加了必须的项目ID和跟踪ID
 */
export interface OriginOptions extends UserOptions {
  /** 应用ID */
  appId?: string;

  /** 数据源ID */
  dataSourceId?: string;

  /** 指定打通app的包名 */
  packageName?: string;

  /** 项目ID */
  projectId: string;

  /** 跟踪ID */
  trackingId: string;
}

/**
 * 存储键类型枚举
 *
 * 定义了SDK中使用的各种存储键的类型
 */
export type StorageKeyType =
  | 'gsid' // 全局会话ID
  | 'originalSource' // 原始来源
  | 'sentSign' // 发送标识
  | 'sessionId' // 会话ID
  | 'userId' // 用户ID
  | 'userKey' // 用户密钥
  | 'gioId' // GrowingIO ID
  | 'gqs' // 全局查询字符串
  | 'abts'; // A/B测试

/**
 * 数据存储类型接口
 *
 * 定义了SDK中数据存储的相关方法和属性
 */
export interface DataStoreType {
  /** 已初始化的跟踪ID数组 */
  initializedTrackingIds: string[];

  /**
   * 获取全局会话ID
   * @param trackingId 跟踪ID
   * @returns 全局会话ID或undefined
   */
  getGsid: (trackingId: string) => string | undefined;

  /**
   * 设置全局会话ID
   * @param trackingId 跟踪ID
   * @param value 会话ID值
   */
  setGsid: (trackingId: string, value: number) => void;

  /** 当前页面信息 */
  currentPage: PageType;

  /**
   * 获取跟踪器VDS配置
   * @param trackingId 跟踪ID
   * @returns VDS配置
   */
  getTrackerVds: (trackingId: string) => any;

  /**
   * 获取键前缀
   * @param trackingId 跟踪ID
   * @returns 键前缀字符串
   */
  getKeyPrefix: (trackingId: string) => string;

  /**
   * 获取存储键
   * @param trackingId 跟踪ID
   * @param name 存储键类型
   * @returns 完整的存储键名
   */
  getStorageKey: (trackingId: string, name: StorageKeyType) => string;

  /**
   * 事件上下文构建器实例
   */
  eventContextBuilderInst: any;

  /**
   * 事件上下文构建器
   * @param trackingId 跟踪ID（可选）
   * @param executeAttributes 是否执行属性处理（可选）
   * @returns 事件上下文对象
   */
  eventContextBuilder: (
    trackingId?: string,
    executeAttributes?: boolean
  ) => any;

  /**
   * 设置原始来源
   * @param trackingId 跟踪ID
   */
  setOriginalSource: (trackingId: string) => void;

  /**
   * 获取原始来源
   * @param trackingId 跟踪ID
   * @returns 原始来源信息
   */
  getOriginalSource: (trackingId: string) => any;

  /**
   * 初始化跟踪器选项
   * @param userOptions 用户配置选项
   * @returns 初始化后的配置选项
   */
  initTrackerOptions: (userOptions: OriginOptions) => OriginOptions;

  /**
   * 初始化选项
   * @param userOptions 用户配置选项
   * @returns 初始化后的配置选项
   */
  initOptions: (userOptions: OriginOptions) => OriginOptions;

  /**
   * 设置配置项
   * @param trackingId 跟踪ID
   * @param k 配置项键名
   * @param v 配置项值
   */
  setOption: (trackingId: string, k: string, v: any) => void;

  /**
   * 获取配置项
   * @param trackingId 跟踪ID
   * @param k 配置项键名（可选）
   * @returns 配置选项对象
   */
  getOption: (trackingId: string, k?: string) => OriginOptions;

  /**
   * 更新VDS配置
   * @param trackingId 跟踪ID
   * @param vds VDS配置对象
   */
  updateVdsConfig: (trackingId: string, vds: any) => void;

  /**
   * 发送验证的访问事件
   * @param trackingId 跟踪ID
   * @param forceSend 是否强制发送
   */
  sendVerifiedVisit: (trackingId: string, forceSend?: boolean) => void;

  /**
   * 发送验证的页面事件
   * @param trackingId 跟踪ID
   * @param forceParse 是否强制解析
   */
  sendVerifiedPage: (trackingId: string, forceParse?: boolean) => void;

  /**
   * 构建访问事件
   * @param props 事件属性（可选）
   */
  buildVisitEvent: (props?: any) => void;

  /**
   * 事件转换器（可选）
   * @param event 事件对象
   */
  eventConverter?: (event: any) => void;

  /** 最后一个页面事件（可选） */
  lastPageEvent?: any;

  /** 通用属性 */
  generalProps: any;

  /** 跟踪计时器 */
  trackTimers: any;

  /** 发送前监听器（可选） */
  beforeSendListener?: any;
}
