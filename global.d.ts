interface IGrowingWebViewJavascriptBridge {
  configuration: any;
  getConfiguration: () => any;
  setNativeUserId: (userId: string) => void;
  setNativeUserIdAndUserKey: (userId: string, userKey?: string) => void;
  clearNativeUserId: () => void;
  clearNativeUserIdAndUserKey: () => void;
  [key: string]: any;
}

declare interface Window {
  _gr_ignore_local_rule: boolean;
  ActiveXObject?: any;
  gdp: any;
  gio: any;
  GrowingWebViewJavascriptBridge: IGrowingWebViewJavascriptBridge;
  vds: any;
  XDomainRequest: any;
  gioSDKInstalled?: any;
  _gio_local_vds?: string | undefined;
}

declare let __JEST__: boolean;
declare let __SDK_VERSION__: string;
declare module '__GIO_PLUGIN_ENTRY__' {
  let module: any;
  export default module;
}
