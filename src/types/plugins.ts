export interface PluginItem {
  name: string;
  method: (growingIO) => void;
  options?: any;
}

export interface PluginsType {
  gioCompress?: any;
  gioCustomTracking?: any;
  gioEmbeddedAdapter?: any;
  gioEventAutoTracking?: any;
  gioHybridAdapter?: any;
  gioHybridCircle?: any;
  gioImpressionTracking?: any;
  gioPerformance?: any;
  gioWebCircle?: any;
  innerPluginInit: () => void;
  install: (pluginName: string, pluginItem?: any, options?: any) => boolean;
  installAll: (plugins: PluginItem[]) => void;
  outerPluginInit?: (folder?: string) => void;
  pluginItems: PluginItem[];
  uninstall: (pluginName: string) => boolean;
  uninstallAll: () => void;
}

export interface GioCustomTrackingType {
  // 构建自定义埋点事件
  buildCustomEvent: (
    name: string,
    properties: { [key: string]: string }
  ) => void;
  // 构建访问用户变量事件(saas)
  buildVisitorVariable?: (properties: { [key: string]: string }) => void;
  // 构建用户变量事件(saas)
  buildPeopleVariable?: (properties: { [key: string]: string }) => void;
  // 构建用户变量事件(cdp)
  buildUserAttributesEvent?: (attributes: { [key: string]: string }) => void;
  // 构建页面级变量事件(saas)
  buildPageLevelVariable?: (properties: { [key: string]: string }) => void;
  // 构建变量转化事件(saas)
  buildConversionVariable?: (properties: { [key: string]: string }) => void;
}

export interface ResourceItemType {
  id: string;
  key: string;
  attributes?: any;
}
