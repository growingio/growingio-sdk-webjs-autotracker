export type EVENT_TYPES =
  | 'VISIT'
  | 'PAGE'
  | 'CUSTOM'
  | 'LOGIN_USER_ATTRIBUTES'
  | 'VIEW_CLICK'
  | 'VIEW_CHANGE';

export interface EVENT {
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
  eventType: EVENT_TYPES;
  hyperlink?: string;
  index?: number;
  language: string;
  latitude?: number;
  longitude?: number;
  networkState: string;
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
