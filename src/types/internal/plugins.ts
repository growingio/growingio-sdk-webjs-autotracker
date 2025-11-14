/**
 * 插件项接口
 * 
 * 定义了单个插件的结构
 */
export interface PluginItem {
  /** 插件名 */
  name: string;
  
  /** 插件类方法 */
  method: (growingIO: any) => void;
  
  /** 插件额外配置项（可选） */
  options?: any;
}

/**
 * 插件管理类型接口
 * 
 * 定义了插件管理器的结构和方法
 */
export interface PluginsType {
  /** 加密压缩插件（可选） */
  gioCompress?: any;
  
  /** 小程序内嵌页打通插件（可选） */
  gioEmbeddedAdapter?: any;
  
  /** 无埋点插件（可选） */
  gioEventAutoTracking?: any;
  
  /** 移动端内嵌页打通插件（可选） */
  gioHybridAdapter?: any;
  
  /** 曝光插件（可选） */
  gioImpressionTracking?: any;
  
  /** 性能插件（可选） */
  gioPerformance?: any;
  
  /** AB测试插件（可选） */
  gioABTest?: any;
  
  /** 多实例插件（可选） */
  gioMultipleInstances?: any;
  
  /** 内置插件加载初始化 */
  innerPluginInit: () => void;
  
  /** 
   * 单个插件加载初始化
   * @param pluginName 插件名称
   * @param pluginItem 插件项（可选）
   * @param options 配置选项（可选）
   * @returns 安装结果
   */
  install: (pluginName: string, pluginItem?: any, options?: any) => boolean;
  
  /** 
   * 所有插件加载初始化
   * @param plugins 插件项数组
   */
  installAll: (plugins: PluginItem[]) => void;
  
  /** 
   * 外置插件加载初始化（可选）
   * @param folder 文件夹路径（可选）
   */
  outerPluginInit?: (folder?: string) => void;
  
  /** 插件项数组 */
  pluginItems: PluginItem[];
  
  /** 
   * 卸载插件
   * @param pluginName 插件名称
   * @returns 卸载结果
   */
  uninstall: (pluginName: string) => boolean;
  
  /** 卸载所有插件 */
  uninstallAll: () => void;
}
