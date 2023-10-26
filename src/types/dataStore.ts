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
  platform?: string;
  sendType?: 'beacon' | 'xhr' | 'image';
  serverUrl?: string;
  sessionExpires?: number;
  storageType?: 'cookie' | 'localstorage';
  touch?: boolean;
  trackBot?: boolean;
  version?: string;
}

export interface OriginOptions extends UserOptions {
  projectId: string;
  dataSourceId?: string;
  appId: string;
}

export interface DataStoreType {
  seqStorageIdName: string;
  visitStorageName: string;
  originalSourceName: string;
  gsid: number;
  currentPage: PageType;
  eventContextBuilderInst: any;
  eventContextBuilder: () => any;
  setOriginalSource: () => void;
  getOriginalSource: () => any;
  initOptions: (userOptions: OriginOptions) => void;
  setOption: (k: string, v: any) => boolean;
  getOption: (k?: string) => OriginOptions;
  sendVisit: (forceSend?: boolean) => void;
  buildVisitEvent: (props?: any) => void;
  sendPage: (forceParse?: boolean) => void;
  eventConverter?: (event: any) => void;
  lastPageEvent?: any;
  initialDataSourceId: string;
  generalProps: any;
  trackTimers: any;
}
