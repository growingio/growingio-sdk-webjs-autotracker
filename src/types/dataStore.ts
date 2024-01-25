import PageType from './page';

export interface UserOptions {
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
  originalSource?: boolean;
  penetrateHybrid?: boolean;
  performance?: {
    monitor?: boolean;
    exception?: boolean;
    network?: boolean | { exclude?: RegExp | string | any[] };
  };
  platform?: string;
  requestTimeout?: number;
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
  projectId: string;
  dataSourceId?: string;
  appId: string;
  trackingId: string;
}

export type StorageKeyType =
  | 'gsid'
  | 'originalSource'
  | 'sentSign'
  | 'sessionId'
  | 'userId'
  | 'userKey'
  | 'gioId';

export interface DataStoreType {
  initializedTrackingIds: string[];
  getGsid: (trackingId: string) => string | undefined;
  setGsid: (trackingId: string, value: number) => void;
  currentPage: PageType;
  eventContextBuilderInst: any;
  getTracker: (trackingId: string) => any;
  getKeyPrefix: (trackingId: string) => string;
  getStorageKey: (trackingId: string, name: StorageKeyType) => string;
  eventContextBuilder: (trackingId?: string) => any;
  setOriginalSource: (trackingId: string) => void;
  getOriginalSource: (trackingId: string) => any;
  initTrackerOptions: (userOptions: OriginOptions) => OriginOptions;
  initOptions: (userOptions: OriginOptions) => OriginOptions;
  setOption: (trackingId: string, k: string, v: any) => boolean;
  getOption: (trackingId: string, k?: string) => OriginOptions;
  sendVerifiedVisit: (trackingId: string, forceSend?: boolean) => void;
  sendVerifiedPage: (trackingId: string, forceParse?: boolean) => void;
  buildVisitEvent: (props?: any) => void;
  eventConverter?: (event: any) => void;
  lastPageEvent?: any;
  generalProps: any;
  trackTimers: any;
}
