import PageType from './page';

export interface UserOptions {
  appId?: string;
  autotrack?: boolean;
  compress?: boolean;
  cookieDomain?: string;
  dataCollect?: boolean;
  debug?: boolean;
  embeddedIgnore?: string[];
  forceLogin?: boolean;
  idMapping?: boolean;
  gtouchHost?: string;
  hashtag?: boolean;
  ignoreFields?: string[];
  impressionScale?: number;
  originalSource?: boolean;
  packageName?: string;
  penetrateHybrid?: boolean;
  performance?: {
    monitor?: boolean;
    exception?: boolean;
    network?: boolean | { exclude?: RegExp | string | any[] };
  };
  platform?: string;
  requestTimeout?: number;
  rewriteQuery?: boolean;
  sendType?: 'beacon' | 'xhr' | 'image';
  serverUrl?: string;
  sessionExpires?: number;
  storageType?: 'cookie' | 'localstorage';
  touch?: boolean;
  trackBot?: boolean;
  trackPage?: boolean;
  version?: string;
}

export interface OriginOptions extends UserOptions {
  appId?: string;
  dataSourceId?: string;
  packageName?: string;
  projectId: string;
  trackingId: string;
}

export type StorageKeyType =
  | 'gsid'
  | 'originalSource'
  | 'sentSign'
  | 'sessionId'
  | 'userId'
  | 'userKey'
  | 'gioId'
  | 'gqs'
  | 'abts';

export interface DataStoreType {
  initializedTrackingIds: string[];
  getGsid: (trackingId: string) => string | undefined;
  setGsid: (trackingId: string, value: number) => void;
  currentPage: PageType;
  eventContextBuilderInst: any;
  getTrackerVds: (trackingId: string) => any;
  getKeyPrefix: (trackingId: string) => string;
  getStorageKey: (trackingId: string, name: StorageKeyType) => string;
  eventContextBuilder: (
    trackingId?: string,
    executeAttributes?: boolean
  ) => any;
  setOriginalSource: (trackingId: string) => void;
  getOriginalSource: (trackingId: string) => any;
  initTrackerOptions: (userOptions: OriginOptions) => OriginOptions;
  initOptions: (userOptions: OriginOptions) => OriginOptions;
  setOption: (trackingId: string, k: string, v: any) => void;
  getOption: (trackingId: string, k?: string) => OriginOptions;
  updateVdsConfig: (trackingId: string, vds: any) => void;
  sendVerifiedVisit: (trackingId: string, forceSend?: boolean) => void;
  sendVerifiedPage: (trackingId: string, forceParse?: boolean) => void;
  buildVisitEvent: (props?: any) => void;
  eventConverter?: (event: any) => void;
  lastPageEvent?: any;
  generalProps: any;
  trackTimers: any;
  beforeSendListener?: any;
}
