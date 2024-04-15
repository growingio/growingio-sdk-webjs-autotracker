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
