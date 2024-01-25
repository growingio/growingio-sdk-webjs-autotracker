export interface PluginItem {
  // 插件名
  name: string;
  // 插件类方法
  method: (growingIO) => void;
  // 插件额外配置项
  options?: any;
}

export interface PluginsType {
  // 加密压缩插件
  gioCompress?: any;
  // 小程序内嵌页打通插件
  gioEmbeddedAdapter?: any;
  // 无埋点插件
  gioEventAutoTracking?: any;
  // 移动端内嵌页打通插件
  gioHybridAdapter?: any;
  // 曝光插件
  gioImpressionTracking?: any;
  // 性能插件
  gioPerformance?: any;
  // AB测试
  gioABTest?: any;
  // 多实例插件
  gioMultipleInstances?: any;
  // 内置插件加载初始化
  innerPluginInit: () => void;
  // 单个插件加载初始化
  install: (pluginName: string, pluginItem?: any, options?: any) => boolean;
  // 所有插件加载初始化
  installAll: (plugins: PluginItem[]) => void;
  // 外置插件加载初始化
  outerPluginInit?: (folder?: string) => void;
  // 插件项
  pluginItems: PluginItem[];
  // 卸载插件
  uninstall: (pluginName: string) => boolean;
  // 卸载所有插件
  uninstallAll: () => void;
}
