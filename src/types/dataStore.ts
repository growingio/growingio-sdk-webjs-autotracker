import PageType from './page';

export interface UserOptions {
  autotrack?: boolean;
  cookieDomain?: string;
  compress?: boolean;
  dataCollect?: boolean;
  debug?: boolean;
  embeddedIgnore?: string[];
  enableIdMapping?: boolean;
  followShare?: boolean;
  hashtag?: boolean;
  host?: string;
  ignoreFields?: string[];
  performance?: {
    monitor?: boolean;
    exception?: boolean;
    network?: boolean | { exclude?: RegExp | string | any[] };
  };
  penetrateHybrid?: boolean;
  platform?: string;
  scheme?: 'https' | 'http' | string;
  sessionExpires?: number;
  storageType?: 'cookie' | 'localstorage';
  touch?: boolean;
  version?: string;
  sendType?: 'beacon' | 'xhr' | 'image';
  requestTimeout?: number;
}

export interface OriginOptions extends UserOptions {
  projectId: string;
  dataSourceId?: string;
  appId: string;
}

export interface DataStoreType {
  seqStorageIdName: string;
  visitStorageName: string;
  esid: any;
  gsid: number;
  currentPage: PageType;
  eventContextBuilderInst: any;
  eventContextBuilder: () => any;
  initOptions: (userOptions: OriginOptions) => void;
  setOption: (k: string, v: any) => boolean;
  getOption: (k?: string) => OriginOptions;
  sendVisit: (forceSend?: boolean) => void;
  buildVisitEvent: (props?: any) => void;
  sendPage: (forceParse?: boolean) => void;
  eventConverter?: (event: any) => void;
  lastVisitEvent?: any;
  lastPageEvent?: any;
  initialDataSourceId: string;
  generalProps: any;
  trackTimers: any;
}
