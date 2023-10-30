export type SaasEventTypes =
  | 'page'
  | 'vst'
  | 'cstm'
  | 'clck'
  | 'vstr'
  | 'pvar'
  | 'evar'
  | 'ppl'
  | 'sbmt'
  | 'chng'
  | 'cls';

export interface Element {
  x: string;
  v?: string;
  h?: string;
  idx?: number;
  obj?: number;
}

export interface SaasEvent {
  av: string;
  ch: string;
  cs1?: string;
  cv: string;
  d: string;
  db: string;
  dm: string;
  e?: Element[];
  esid: number;
  l: string;
  lat: number;
  lng: number;
  n: string;
  nt: string;
  os: string;
  osv: string;
  p?: string;
  ph?: string;
  ptm: number;
  q?: string;
  rp?: string;
  s: string;
  sh: number;
  sw: number;
  t: SaasEventTypes;
  tl: string;
  tm: number;
  u: string;
  var?: {
    [key: string]: string;
  };
}

export type CDPEventTypes =
  | 'PAGE'
  | 'VISIT'
  | 'CUSTOM'
  | 'VISITOR_ATTRIBUTES'
  | 'LOGIN_USER_ATTRIBUTES'
  | 'APP_CLOSED'
  | 'VIEW_CLICK'
  | 'VIEW_CHANGE'
  | 'FORM_SUBMIT';

export interface CDPEvent {
  appChannel: string;
  appVersion: string;
  attributes?: any;
  cs1?: string;
  dataSourceId: string;
  deviceBrand: string;
  deviceId: string;
  deviceModel: string;
  deviceType: string;
  domain: string;
  eventName: string;
  eventSequenceId?: number;
  eventType: CDPEventTypes;
  gioId?: string;
  globalSequenceId: number;
  hyperlink?: string;
  index?: number;
  language: string;
  latitude?: number;
  longitude?: number;
  networkState: string;
  pageShowTimestamp?: number;
  path?: string;
  platform: string;
  platformVersion: string;
  properties?: any;
  protocolType?: string;
  query?: string;
  referralPage?: string;
  resourceItem?: any;
  screenHeight: number;
  screenWidth: number;
  sdkVersion: string;
  sessionId: string;
  textValue?: string;
  timestamp: number;
  title: string;
  userId?: string;
  userKey?: string;
  xpath?: string;
}
