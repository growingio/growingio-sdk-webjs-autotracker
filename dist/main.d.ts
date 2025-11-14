/* Generated types aggregation file */

// Types from core directory
// From core/dataStore/eventContextBuilder.d.ts
export declare class EventContextBuilder {
    growingIO: GrowingIOType;
    minpExtraParams: any;
    constructor(growingIO: GrowingIOType);
    main: (trackingId?: string, executeAttributes?: boolean) => any;
}


// From core/dataStore/index.d.ts
export declare class DataStore implements DataStoreType {
    growingIO: GrowingIOType;
    readonly ALLOW_SETTING_KEYS: string[];
    currentPage: PageType;
    eventContextBuilderInst: any;
    eventContextBuilder: () => any;
    lastPageEvent: any;
    generalProps: any;
    trackTimers: any;
    initializedTrackingIds: string[];
    beforeSendListener: any;
    constructor(growingIO: GrowingIOType);
    getTrackerVds: (trackingId: string) => {
        appId?: string;
        dataSourceId?: string;
        packageName?: string;
        projectId: string;
        trackingId: string;
        autotrack?: boolean;
        compress?: boolean;
        cookieDomain?: string;
        dataCollect?: boolean;
        debug?: boolean;
        embeddedIgnore?: string[];
        extraUA?: boolean;
        forceLogin?: boolean;
        idMapping?: boolean;
        gtouchHost?: string;
        hashtag?: boolean;
        ignoreFields?: string[];
        impressionScale?: number;
        originalSource?: boolean;
        penetrateHybrid?: boolean;
        performance?: {
            monitor?: boolean;
            exception?: boolean;
            network?: boolean | {
                exclude?: RegExp | string | any[];
            };
        };
        platform?: string;
        requestTimeout?: number;
        rewriteQuery?: boolean;
        sendType?: "beacon" | "xhr" | "image";
        serverUrl?: string;
        sessionExpires?: number;
        storageType?: "cookie" | "localstorage";
        touch?: boolean;
        trackBot?: boolean;
        trackPage?: boolean;
        version?: string;
    };
    getKeyPrefix: (trackingId: string) => string;
    getStorageKey: (trackingId: string, name: StorageKeyType) => string;
    getGsid: (trackingId: string) => any;
    setGsid: (trackingId: string, value: number) => void;
    setSequenceIds: (trackingId: string, value: any) => void;
    initTrackerOptions: (options: any) => any;
    initOptions: (userOptions: any) => any;
    setOriginalSource: (trackingId: string) => void;
    getOriginalSource: (trackingId: string) => any;
    setOption: (trackingId: string, k: string, v: any) => void;
    getOption: (trackingId: string, k?: string) => any;
    updateVdsConfig: (trackingId: string, vds: any) => void;
    sendVerifiedVisit: (trackingId: string, forceSend?: boolean) => void;
    sendVerifiedPage: (trackingId: string, forceParse?: boolean) => void;
    buildVisitEvent: (trackingId: string, props?: any) => void;
    eventConverter: (event: any) => void;
}


// From core/dataStore/page.d.ts
export declare class Page implements PageType {
    growingIO: GrowingIOType;
    domain: string;
    path: string;
    query: string;
    time: number;
    title: string;
    lastHref: string;
    lastNoHashHref: string;
    lastLocation: any;
    pageListeners: any;
    pageProps: any;
    constructor(growingIO: GrowingIOType);
    parsePage: () => void;
    private _getNoHashHref;
    getReferralPage: (trackingId: string) => any;
    handlePage: () => void;
    hookHistory: () => void;
    eventSetPageProps: (trackingId: string, event: EVENT) => any;
    buildPageEvent: (trackingId: string, props?: any) => void;
}


// From core/growingIO.d.ts
export declare class GrowingIO implements GrowingIOType {
    sdkVersion: string;
    vdsName: string;
    utils: any;
    emitter: any;
    gioSDKFull: boolean;
    gioSDKInitialized: boolean;
    useEmbeddedInherit: string;
    useHybridInherit: string;
    userStore: UserStoreType;
    dataStore: DataStoreType;
    plugins: PluginsType;
    vdsConfig: any;
    uploader: UploaderType;
    storage: StorageType;
    trackingId: string;
    subInstance: any;
    constructor();
    init: (options: any) => boolean;
    handlerDistribute: (trackingId: string, handler: string, args: any) => void;
    registerPlugins: (plugs: any, callback?: (arg?: any) => any) => void;
    getPlugins: (callback?: (arg?: any) => any) => void;
    getDeviceId: (callback?: (arg?: any) => any) => void;
    setOption: (trackingId: string, k: string, v: any, callback?: (arg?: any) => any) => void;
    getOption: (trackingId: string, k: string | any, callback?: (arg?: any) => any) => void;
    sendVisit: (trackingId: string, props?: any, callback?: (args?: any) => any) => void;
    setPageListener: (trackingId: string, callback?: (arg?: any) => void) => void;
    setPageAttributes: (trackingId: string, properties: any, callback?: (arg?: any) => void) => void;
    clearPageAttributes: (trackingId: string, properties: string[] | undefined, callback?: (args?: any) => any) => void;
    sendPage: (trackingId: string, props?: any, callback?: (args?: any) => any) => void;
    identify: (trackingId: string, assignmentId: string | number, callback?: (arg?: any) => any) => void;
    setUserAttributes: (trackingId: string, userAttributes: any, callback?: (arg?: any) => any) => void;
    setUserId: (trackingId: string, userId: string | number, userKey?: string, callback?: (arg?: any) => any) => void;
    clearUserId: (trackingId: string, callback?: (arg?: any) => any) => void;
    setGeneralProps: (trackingId: string, properties: any, callback?: (arg?: any) => any) => void;
    clearGeneralProps: (trackingId: string, properties: string[] | undefined, callback?: (arg?: any) => any) => void;
    track: (trackingId: string, eventName: string, properties: {
        [key: string]: string | string[];
    }, callback?: (arg?: any) => any) => void;
    trackTimerStart: (trackingId: string, eventName: string, callback?: (arg?: any) => any) => void;
    trackTimerPause: (trackingId: string, timerId: string, callback?: (arg?: any) => any) => void;
    trackTimerResume: (trackingId: string, timerId: string, callback?: (arg?: any) => any) => void;
    trackTimerEnd: (trackingId: string, timerId: string, properties: any, callback?: (arg?: any) => any) => void;
    removeTimer: (trackingId: string, timerId: string, callback?: (arg?: any) => any) => void;
    clearTrackTimer: (trackingId: string, callback?: (arg?: any) => any) => void;
    updateImpression: (callback?: () => any) => void;
    getABTest: (trackingId: string, layerId: string | number, callback: any) => void;
    setBeforeSendListener: (trackingId: string, fn: () => any, callback: any) => void;
    getUserAgent: (callback?: (userAgent: string) => any) => string;
    private _waitForUserAgentAndSendEvents;
    private _sendEventsAfterUserAgent;
}


// From core/plugins/basePlugins.d.ts
export declare class BasePlugins implements PluginsType {
    growingIO: GrowingIOType;
    pluginItems: PluginItem[];
    pluginsContext: any;
    constructor(growingIO: GrowingIOType);
    innerPluginInit: () => void;
    installAll: (plugins?: PluginItem[], silent?: boolean) => void;
    install: (pluginName: string, pluginItem?: PluginItem, silent?: boolean) => boolean;
    uninstall: (pluginName: string) => boolean;
    uninstallAll: () => void;
    lifeError: (p: PluginItem, e: any) => void;
    callLifeCycle: (lifetime: string, args: any) => void;
}


// From core/plugins/plugins.d.ts
export declare class Plugins extends BasePlugins {
    growingIO: GrowingIOType;
    constructor(growingIO: GrowingIOType);
}


// From core/plugins/plugins.full.d.ts
export declare class Plugins extends BasePlugins {
    growingIO: GrowingIOType;
    constructor(growingIO: GrowingIOType);
}


// From core/storage/cookie.d.ts
export declare class CookieStorage implements StorageType {
    domain: string;
    type: 'Cookie';
    constructor(domain: string);
    getItem: (key: string) => any;
    setItem: (key: string, value: any, end?: Date) => void;
    removeItem: (key: string) => void;
    hasItem: (key: string) => boolean;
    getKeys: () => string[];
}


// From core/storage/encrypt.d.ts
export declare const enc: (v: string) => string;
export declare const dec: (v: string) => any;

// From core/storage/index.d.ts
export declare const testCookie: (testDomain: string) => boolean;
export declare const initGlobalStorage: (vdsConfig: any) => any;

// From core/storage/local.d.ts
export declare class LocalStorage implements StorageType {
    type: 'localStorage';
    constructor();
    getItem: (key: string) => any;
    setItem: (key: string, value: any, end?: number) => void;
    removeItem: (key: string) => void;
    hasItem: (key: string) => boolean;
    getKeys: () => string[];
}


// From core/storage/memory.d.ts
export declare class MemoryStorage implements StorageType {
    type: 'memory';
    constructor();
    getItem: (key: string) => any;
    setItem: (key: string, value: any, end?: number) => void;
    removeItem: (key: string) => boolean | boolean[];
    hasItem: (key: string) => boolean;
    getKeys: () => string[];
}


// From core/uploader.d.ts
export declare class Uploader implements UploaderType {
    growingIO: GrowingIOType;
    hoardingQueue: any;
    requestQueue: any[];
    requestLimit: number;
    requestTimeout: number;
    requestingNum: number;
    constructor(growingIO: GrowingIOType);
    generateURL: (trackingId: string) => string;
    getSendType: (trackingId: string) => any;
    getHoardingQueue: (trackingId: string) => any;
    commitRequest: (commitData: EXTEND_EVENT) => void;
    initiateRequest: (trackingId: string) => void;
    sendEvent: (eventData: any) => boolean;
    sendByBeacon: (eventData: EXTEND_EVENT, requestData: string, requestURL: string) => void;
    sendByXHR: (eventData: EXTEND_EVENT, requestData: string, requestURL: string) => void;
    sendByImage: (eventData: EXTEND_EVENT, requestData: string, requestURL: string) => void;
    clearImage: (img: any) => void;
    requestSuccessFn: (eventData: any) => void;
    requestFailFn: (eventData: any, nextReqType?: "beacon" | "xhr" | "image") => void;
}


// From core/userAgentManager.d.ts
export declare class UserAgentManager {
    private static cachedUserAgent;
    private static initPromise;
    private static hasWarnedOnce;
    private static readonly TIMEOUT;
    static isCompatible(): boolean;
    static initialize(): Promise<void>;
    private static _doInitialize;
    static getUserAgent(): string;
    static isInitializing(): boolean;
}


// From core/userStore.d.ts
export declare class UserStore implements UserStoreType {
    growingIO: GrowingIOType;
    uidStorageName: string;
    prevIds: any;
    private prevUId;
    constructor(growingIO: GrowingIOType);
    getUid: () => any;
    setUid: (uId: string) => void;
    _getSidKey: (trackingId: string) => string;
    getPrevSessionId: (trackingId: string) => any;
    getSessionId: (trackingId: string) => any;
    setSessionId: (trackingId: string, sId: string) => void;
    _getUserIdKey: (trackingId: string) => string;
    getPrevUserId: (trackingId: string) => any;
    getUserId: (trackingId: string) => any;
    setUserId: (trackingId: string, userId: string) => void;
    _getUserKeyKey: (trackingId: string) => string;
    getPrevUserKey: (trackingId: string) => any;
    getUserKey: (trackingId: string) => any;
    setUserKey: (trackingId: string, userKey: string) => void;
    _getGioIdKey: (trackingId: string) => string;
    getPrevGioId: (trackingId: string) => any;
    getGioId: (trackingId: string) => any;
    setGioId: (trackingId: string, gioId: string) => void;
    transferStorage: (trackingId: string, growingIO: GrowingIOType) => void;
}



// Types from types directory
// From types/api.d.ts
export interface InitOptions {
    projectId: string;
    dataSourceId: string;
    appId?: string;
    autotrack?: boolean;
    compress?: boolean;
    cookieDomain?: string;
    dataCollect?: boolean;
    debug?: boolean;
    embeddedIgnore?: string[];
    embeddedAdapter?: {
        circleServerUrl?: string;
    };
    extraUA?: boolean;
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
        network?: boolean | {
            exclude?: RegExp | string | any[];
        };
    };
    platform?: 'web' | 'wxwv' | 'Android' | 'iOS' | 'minp' | 'alip' | 'baidup' | 'qq' | 'bytedance' | 'kuaishoup' | 'jdp';
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
export interface PageAttributes {
    [key: string]: string | number | boolean;
}
export interface UserAttributes {
    [key: string]: string | number | boolean;
}
export interface EventAttributes {
    [key: string]: string | string[] | number | boolean;
}
export interface TrackEventParams {
    eventName: string;
    properties?: EventAttributes;
}
export interface TimerEventParams {
    timerId: string;
    properties?: EventAttributes;
}
export type ABTestCallback = (data: any) => void;
export type CommonCallback = (result?: any) => void;
export type BeforeSendListener = () => any;
export type PageListenerCallback = (pageInfo: {
    path: string;
    query: string;
    title: string;
}) => void;
export interface GrowingIOInstance {
    init(projectId: string, dataSourceId: string, options?: InitOptions): boolean;
    registerPlugins(plugins: any[], callback?: CommonCallback): void;
    getPlugins(callback?: (plugins: any[]) => void): void;
    getDeviceId(callback?: CommonCallback): void;
    getUserAgent(callback?: (userAgent: string) => any): string;
    setGeneralProps(trackingId: string, properties: EventAttributes, callback?: CommonCallback): void;
    clearGeneralProps(trackingId: string, properties: string[] | undefined, callback?: CommonCallback): void;
    setPageAttributes(trackingId: string, properties: PageAttributes, callback?: CommonCallback): void;
    clearPageAttributes(trackingId: string, properties: string[] | undefined, callback?: CommonCallback): void;
    setUserAttributes(trackingId: string, userAttributes: UserAttributes, callback?: CommonCallback): void;
    setUserId(trackingId: string, userId: string, userKey?: string, callback?: CommonCallback): void;
    clearUserId(trackingId: string, callback?: CommonCallback): void;
    track(trackingId: string, eventName: string, properties: EventAttributes, callback?: CommonCallback): void;
    trackTimerStart(trackingId: string, eventName: string, callback?: (timerId: string) => void): void;
    trackTimerPause(trackingId: string, timerId: string, callback?: CommonCallback): void;
    trackTimerResume(trackingId: string, timerId: string, callback?: CommonCallback): void;
    trackTimerEnd(trackingId: string, timerId: string, properties: EventAttributes, callback?: CommonCallback): void;
    removeTimer(trackingId: string, timerId: string, callback?: CommonCallback): void;
    clearTrackTimer(trackingId: string, callback?: CommonCallback): void;
    updateImpression(callback?: () => void): void;
    getABTest(trackingId: string, layerId: string, callback: ABTestCallback): void;
    setBeforeSendListener(trackingId: string, fn: BeforeSendListener, callback: CommonCallback): void;
    setPageListener(trackingId: string, callback?: PageListenerCallback): void;
    sendVisit(trackingId: string, props?: any, callback?: CommonCallback): void;
    sendPage(trackingId: string, props?: any, callback?: CommonCallback): void;
    identify(trackingId: string, assignmentId: string | number, callback?: CommonCallback): void;
    setOption(trackingId: string, optionKey: string, value: any, callback?: CommonCallback): void;
    getOption(trackingId: string, optionKey: string, callback?: CommonCallback): void;
}
export type GrowingIO = {
    (method: string, ...args: any[]): any;
    canIUse(method: string): boolean;
    gioSDKVersion: string;
    gioSDKFull: boolean;
} & GrowingIOInstance;
type Prefixed<M extends string> = `${string}.${M}`;
export type PrefixedMethod = Prefixed<'clearGeneralProps' | 'clearPageAttributes' | 'clearTrackTimer' | 'clearUserId' | 'getABTest' | 'getOption' | 'identify' | 'init' | 'removeTimer' | 'sendPage' | 'sendVisit' | 'setBeforeSendListener' | 'setGeneralProps' | 'setPageAttributes' | 'setPageListener' | 'setOption' | 'setUserAttributes' | 'setUserId' | 'track' | 'trackTimerEnd' | 'trackTimerPause' | 'trackTimerResume' | 'trackTimerStart'>;
export type StrictMethod = 'canIUse' | 'clearGeneralProps' | 'clearPageAttributes' | 'clearTrackTimer' | 'clearUserId' | 'getABTest' | 'getDeviceId' | 'getOption' | 'getPlugins' | 'getUserAgent' | 'identify' | 'init' | 'registerPlugins' | 'removeTimer' | 'sendPage' | 'sendVisit' | 'setBeforeSendListener' | 'setGeneralProps' | 'setPageAttributes' | 'setPageListener' | 'setOption' | 'setUserAttributes' | 'setUserId' | 'track' | 'trackTimerEnd' | 'trackTimerPause' | 'trackTimerResume' | 'trackTimerStart' | 'updateImpression' | PrefixedMethod;
type StrictArgs<M extends StrictMethod> = M extends 'canIUse' ? [methodName: string] : M extends 'clearGeneralProps' | Prefixed<'clearGeneralProps'> ? [properties: string[] | undefined, callback?: CommonCallback] : M extends 'clearPageAttributes' | Prefixed<'clearPageAttributes'> ? [properties: string[] | undefined, callback?: CommonCallback] : M extends 'clearTrackTimer' | Prefixed<'clearTrackTimer'> ? [callback?: CommonCallback] : M extends 'clearUserId' | Prefixed<'clearUserId'> ? [callback?: CommonCallback] : M extends 'getABTest' | Prefixed<'getABTest'> ? [layerId: string, callback: ABTestCallback] : M extends 'getDeviceId' ? [callback?: CommonCallback] : M extends 'getOption' | Prefixed<'getOption'> ? [optionKey: string, callback?: CommonCallback] : M extends 'getPlugins' ? [callback?: (plugins: any[]) => void] : M extends 'getUserAgent' ? [callback?: (userAgent: string) => any] : M extends 'identify' | Prefixed<'identify'> ? [assignmentId: string | number, callback?: CommonCallback] : M extends 'init' | Prefixed<'init'> ? [projectId: string, dataSourceId: string, options?: InitOptions] : M extends 'registerPlugins' ? [plugins: any[], callback?: CommonCallback] : M extends 'removeTimer' | Prefixed<'removeTimer'> ? [timerId: string, callback?: CommonCallback] : M extends 'sendPage' | Prefixed<'sendPage'> ? [props?: any, callback?: CommonCallback] : M extends 'sendVisit' | Prefixed<'sendVisit'> ? [props?: any, callback?: CommonCallback] : M extends 'setBeforeSendListener' | Prefixed<'setBeforeSendListener'> ? [fn: BeforeSendListener, callback: CommonCallback] : M extends 'setGeneralProps' | Prefixed<'setGeneralProps'> ? [properties: EventAttributes, callback?: CommonCallback] : M extends 'setPageAttributes' | Prefixed<'setPageAttributes'> ? [properties: PageAttributes, callback?: CommonCallback] : M extends 'setPageListener' | Prefixed<'setPageListener'> ? [callback?: PageListenerCallback] : M extends 'setOption' | Prefixed<'setOption'> ? [optionKey: string, value: any, callback?: CommonCallback] : M extends 'setUserAttributes' | Prefixed<'setUserAttributes'> ? [userAttributes: UserAttributes, callback?: CommonCallback] : M extends 'setUserId' | Prefixed<'setUserId'> ? [userId: string, userKey?: string, callback?: CommonCallback] : M extends 'track' | Prefixed<'track'> ? ([eventName: string, properties: EventAttributes, callback?: CommonCallback] | [eventName: string, callback?: CommonCallback]) : M extends 'trackTimerEnd' | Prefixed<'trackTimerEnd'> ? [timerId: string, properties: EventAttributes, callback?: CommonCallback] : M extends 'trackTimerPause' | Prefixed<'trackTimerPause'> ? [timerId: string, callback?: CommonCallback] : M extends 'trackTimerResume' | Prefixed<'trackTimerResume'> ? [timerId: string, callback?: CommonCallback] : M extends 'trackTimerStart' | Prefixed<'trackTimerStart'> ? [eventName: string, callback?: (timerId: string) => void] : M extends 'updateImpression' ? [callback?: () => void] : never;
type StrictReturn<M extends StrictMethod> = M extends 'canIUse' ? boolean : M extends 'getUserAgent' ? string : M extends 'init' | Prefixed<'init'> ? boolean : void;
export type Gdp = {
    <M extends StrictMethod>(method: M, ...args: StrictArgs<M>): StrictReturn<M>;
    gioSDKVersion: string;
    gioSDKFull: boolean;
};
export declare const gdp: Gdp;


// From types/index.d.ts
export type { InitOptions, PageAttributes, UserAttributes, EventAttributes, TrackEventParams, TimerEventParams, ABTestCallback, CommonCallback, BeforeSendListener, PageListenerCallback, GrowingIOInstance, GrowingIO, Gdp } from './api';
export type { GrowingIOType } from './internal/growingIO';
export type { PluginItem, PluginsType } from './internal/plugins';
export type { DataStoreType, OriginOptions, UserOptions, StorageKeyType } from './internal/dataStore';
export type { StorageType } from './internal/storage';
export type { UploaderType } from './internal/uploader';
export type { UserStoreType } from './internal/userStore';
export type { default as PageType } from './internal/page';
export type { EVENT_TYPES, EVENT, EXTEND_EVENT } from './internal/events';

// From types/internal/dataStore.d.ts
export interface UserOptions {
    appId?: string;
    autotrack?: boolean;
    compress?: boolean;
    cookieDomain?: string;
    dataCollect?: boolean;
    debug?: boolean;
    embeddedIgnore?: string[];
    extraUA?: boolean;
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
        network?: boolean | {
            exclude?: RegExp | string | any[];
        };
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
export type StorageKeyType = 'gsid' | 'originalSource' | 'sentSign' | 'sessionId' | 'userId' | 'userKey' | 'gioId' | 'gqs' | 'abts';
export interface DataStoreType {
    initializedTrackingIds: string[];
    getGsid: (trackingId: string) => string | undefined;
    setGsid: (trackingId: string, value: number) => void;
    currentPage: PageType;
    getTrackerVds: (trackingId: string) => any;
    getKeyPrefix: (trackingId: string) => string;
    getStorageKey: (trackingId: string, name: StorageKeyType) => string;
    eventContextBuilderInst: any;
    eventContextBuilder: (trackingId?: string, executeAttributes?: boolean) => any;
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
// From types/internal/events.d.ts
export type EVENT_TYPES = 'VISIT' | 'PAGE' | 'CUSTOM' | 'LOGIN_USER_ATTRIBUTES' | 'VIEW_CLICK' | 'VIEW_CHANGE';
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
export interface EXTEND_EVENT extends EVENT {
    requestId: string;
    sendType?: string;
    trackingId: string;
}
// From types/internal/growingIO.d.ts
export interface GrowingIOType {
    sdkVersion: string;
    vdsName: string;
    gioSDKFull: boolean;
    gioSDKInitialized: boolean;
    useEmbeddedInherit?: string;
    useHybridInherit?: string;
    vdsConfig: OriginOptions;
    storage: StorageType;
    userStore: UserStoreType;
    dataStore: DataStoreType;
    plugins: PluginsType;
    uploader: UploaderType;
    userAgentManager?: UserAgentManager;
    trackingId: string;
    subInstance: {
        [key: string]: OriginOptions;
    };
    utils?: any;
    emitter: {
        emit: (msg: string, args?: any) => void;
        on: (msg: string, method: (args?: any) => any) => void;
        off: (msg: string, method: (args?: any) => any) => void;
    };
    init: (options: any) => boolean;
    registerPlugins: (plugins: any[], callback?: (arg: any) => any) => void;
    getPlugins: (callback: (args?: any) => any[]) => void;
    sendVisit: (trackingId: string, props?: any, callback?: (arg: any) => any) => void;
    setPageListener: (trackingId: string, callback?: (arg?: any) => void) => void;
    setPageAttributes: (trackingId: string, properties: any) => void;
    clearPageAttributes: (trackingId: string, properties: string[] | undefined, callback?: (args?: any) => any) => void;
    sendPage: (trackingId: string, props?: any, callback?: (arg: any) => any) => void;
    getDeviceId: (callback?: (args?: any) => any) => void;
    getUserAgent?: (callback?: (userAgent: string) => any) => string;
    setOption: (optionKey: string, value: any, callback?: (args?: any) => any) => void;
    getOption: (trackingId: string, optionKey: string, callback?: (args?: any) => any) => any;
    identify: (trackingId: string, assignmentId: string | number, callback?: (arg?: any) => any) => void;
    setUserAttributes: (trackingId: string, userAttributes: any, callback?: (args?: any) => any) => void;
    setUserId: (trackingId: string, userId: string, userKey?: string, callback?: (args?: any) => any) => void;
    clearUserId: (trackingId: string, callback?: (arg: any) => any) => void;
    setGeneralProps: (trackingId: string, properties: any, callback?: (args?: any) => any) => void;
    clearGeneralProps: (trackingId: string, properties: string[] | undefined, callback?: (args?: any) => any) => void;
    track: (trackingId: string, name: string, properties: {
        [key: string]: string | string[];
    }, callback?: (args?: any) => any) => void;
    trackTimerStart?: (trackingId: string, eventName: string, callback?: (args?: any) => any) => void;
    trackTimerPause?: (trackingId: string, timerId: string, callback?: (arg: any) => any) => void;
    trackTimerResume?: (trackingId: string, timerId: string, callback?: (arg: any) => any) => void;
    trackTimerEnd?: (trackingId: string, timerId: string, attributes: any, callback?: (args?: any) => any) => void;
    removeTimer?: (trackingId: string, timerId: string, callback?: (arg: any) => any) => void;
    clearTrackTimer?: (trackingId: string, callback?: (args?: any) => any) => void;
    updateImpression: (callback?: () => any) => void;
    getABTest?: (trackingId: string, layerId: string, callback?: (arg: any) => any) => void;
    setBeforeSendListener?: (trackingId: string, fn: () => any, callback: any) => void;
}
// From types/internal/page.d.ts
export interface PageType {
    path: string;
    query: string;
    title?: string;
    domain: string;
    time: number;
    pageListeners: any;
    pageProps: any;
    parsePage: () => void;
    getReferralPage: (trackingId: string) => string;
    hookHistory: () => void;
    eventSetPageProps: (trackingId: string, event: EVENT) => any;
    buildPageEvent: (trackingId: string, props?: any) => void;
}
// From types/internal/plugins.d.ts
export interface PluginItem {
    name: string;
    method: (growingIO: any) => void;
    options?: any;
}
export interface PluginsType {
    gioCompress?: any;
    gioEmbeddedAdapter?: any;
    gioEventAutoTracking?: any;
    gioHybridAdapter?: any;
    gioImpressionTracking?: any;
    gioPerformance?: any;
    gioABTest?: any;
    gioMultipleInstances?: any;
    innerPluginInit: () => void;
    install: (pluginName: string, pluginItem?: any, options?: any) => boolean;
    installAll: (plugins: PluginItem[]) => void;
    outerPluginInit?: (folder?: string) => void;
    pluginItems: PluginItem[];
    uninstall: (pluginName: string) => boolean;
    uninstallAll: () => void;
}
// From types/internal/storage.d.ts
export interface StorageType {
    type: 'Cookie' | 'localStorage' | 'memory';
    getItem: (key: string) => any;
    setItem: (key: string, value: any, end?: any) => void;
    removeItem: (key: string, path?: string, domain?: string) => void;
    hasItem: (key: string) => boolean;
    getKeys: () => string[];
}
// From types/internal/uploader.d.ts
export interface UploaderType {
    hoardingQueue: {
        [trackingId: string]: any[];
    };
    requestQueue: any[];
    requestLimit: number;
    requestTimeout: number;
    requestingNum: number;
    getHoardingQueue: (trackingId: string) => any[];
    commitRequest: (reqData: any) => void;
    initiateRequest: (trackingId: string) => void;
    sendEvent: (eventData: any) => void;
    requestFailFn: (data: any, reqType: 'beacon' | 'xhr' | 'image') => void;
    generateURL: (specifiedURL?: string, specifiedAI?: string) => string;
}
// From types/internal/userStore.d.ts
export interface UserStoreType {
    uidStorageName: string;
    prevIds: {
        [trackingId: string]: string;
    };
    getUid: () => string;
    setUid: (uId: string) => void;
    getSessionId: (trackingId: string) => string;
    setSessionId: (trackingId: string, sId: string) => void;
    getUserId: (trackingId: string) => string;
    setUserId: (trackingId: string, userId: string) => void;
    getUserKey: (trackingId: string) => string;
    setUserKey: (trackingId: string, userKey: string) => void;
    getGioId: (trackingId: string) => string;
    setGioId: (trackingId: string, gioId: string) => void;
    transferStorage: (trackingId: string, growingIO: GrowingIOType) => void;
}
// Types from constants directory
// From constants/config.d.ts
export declare const PLATFORM: string[];
export declare const STORAGE_KEYS: any;
export declare const DEFAULT_SETTINGS: {
    autotrack: {
        type: string;
        default: boolean;
    };
    appId: {
        type: string;
        default: string;
    };
    compress: {
        type: string;
        default: boolean;
    };
    cookieDomain: {
        type: string;
        default: string;
    };
    dataCollect: {
        type: string;
        default: boolean;
    };
    debug: {
        type: string;
        default: boolean;
    };
    embeddedIgnore: {
        type: string;
        default: any[];
    };
    embeddedAdapter: {
        type: string;
        default: {
            circleServerUrl: string;
        };
    };
    extraUA: {
        type: string;
        default: boolean;
    };
    forceLogin: {
        type: string;
        default: boolean;
    };
    idMapping: {
        type: string;
        default: boolean;
    };
    enableIdMapping: {
        type: string;
        default: boolean;
    };
    gtouchHost: {
        type: string;
        default: string;
    };
    hashtag: {
        type: string;
        default: boolean;
    };
    ignoreFields: {
        type: string;
        default: any[];
    };
    impressionScale: {
        type: string;
        default: number;
    };
    originalSource: {
        type: string;
        default: boolean;
    };
    packageName: {
        type: string;
        default: string;
    };
    penetrateHybrid: {
        type: string;
        default: boolean;
    };
    performance: {
        type: string;
        default: {
            monitor: boolean;
            exception: boolean;
        };
    };
    platform: {
        type: string;
        default: string;
    };
    requestTimeout: {
        type: string;
        default: number;
    };
    rewriteQuery: {
        type: string;
        default: boolean;
    };
    sendType: {
        type: string;
        default: string;
    };
    serverUrl: {
        type: string;
        default: string;
    };
    sessionExpires: {
        type: string;
        default: number;
    };
    storageType: {
        type: string;
        default: string;
    };
    touch: {
        type: string;
        default: boolean;
    };
    trackBot: {
        type: string;
        default: boolean;
    };
    trackPage: {
        type: string;
        default: boolean;
    };
    version: {
        type: string;
        default: string;
    };
};
export declare const DIRECT_HANDLERS: string[];
export declare const INSTANCE_HANDLERS: string[];
export declare const HANDLERS: string[];
export declare const ALLOW_SET_OPTIONS: {
    autotrack: string;
    dataCollect: string;
    dataSourceId: string;
    debug: string;
    extraUA: string;
    forceLogin: string;
    hashtag: string;
    serverUrl: string;
};
export declare const DEPRECATED_HANDLERS: string[];
export declare const IGNORE_PARAMS: string[];

// From constants/emitMsg.d.ts
export declare const _default: {
    GIOID_UPDATE: string;
    ON_COMMIT_REQUEST: string;
    ON_COMPOSE_AFTER: string;
    ON_COMPOSE_BEFORE: string;
    ON_ERROR: string;
    ON_INSTALL: string;
    ON_SDK_INITIALIZE_BEFORE: string;
    ON_SEND_AFTER: string;
    ON_SEND_BEFORE: string;
    OPTION_CHANGE: string;
    OPTION_INITIALIZED: string;
    SDK_INITIALIZED: string;
    SESSIONID_UPDATE: string;
    SET_USERID: string;
    SET_USERKEY: string;
    UID_UPDATE: string;
    UN_EXECUTE_CALL: string;
    USERID_UPDATE: string;
    USERKEY_UPDATE: string;
};


// From constants/regex.d.ts
export declare const SPECIAL_TOP_DOMAIN_REG: RegExp;
export declare const IMP_ATTRIBUTES_REG: RegExp;
export declare const IMP_DATASET_REG: RegExp;
export declare const EVENT_NAME_REG: RegExp;
export declare const SESSION_KEY_REG: RegExp;


// Types from utils directory
// From utils/glodash.d.ts
export declare const isNil: (o: any) => boolean;
export declare const isString: (o: any) => boolean;
export declare const isNumber: (o: any) => boolean;
export declare const isNaN: (value: any) => boolean;
export declare const isBoolean: (o: any) => boolean;
export declare const isObject: (o: any) => boolean;
export declare const isRegExp: (o: any) => boolean;
export declare const isFunction: (o: any) => boolean;
export declare const isArray: (o: any) => boolean;
export declare const isDate: (o: any) => boolean;
export declare const fixed: (o: any, n?: number) => number;
export declare const head: (o: any) => any;
export declare const last: (o: any) => any;
export declare const drop: (o: any, n?: number) => any;
export declare const dropWhile: (o: any, fn: (currentValue: any) => boolean) => any;
export declare const compact: (o: any, ignoreZero?: boolean) => any;
export declare const find: (o: any, fn: (currentValue: any) => boolean) => any;
export declare const findIndex: (o: any, fn: (currentValue: any) => boolean) => number;
export declare const includes: (o: any, target: any) => any;
export declare const arrayFrom: any;
export declare const toString: (o: any) => string;
export declare const split: (s: any, separator?: string) => string[] | any;
export declare const lowerFirst: (s: any) => string | any;
export declare const upperFirst: (s: any) => string | any;
export declare const startsWith: (s: string, target: string) => boolean;
export declare const endsWith: (s: string, target: string) => boolean;
export declare const has: (o: any, key: string) => boolean;
export declare const keys: (o: any) => string[];
export declare const forEach: (o: any, fn: (value: any, key: string) => void) => void;
export declare const isEqual: (o1: any, o2: any) => boolean;
export declare const get: (o: any, path: string, defaultValue?: any) => any;
export declare const unset: (o: any, targetProp: string | string[] | RegExp) => boolean | boolean[];
export declare const isEmpty: (o: any) => boolean;
export declare const typeOf: (o: any) => string;
export declare const formatDate: (e: any) => any;

// From utils/tools.d.ts
export declare const guid: () => string;
export declare const consoleText: (msg: string, type?: "info" | "success" | "error" | "warn") => void;
export declare const niceTry: <T>(fn: (...args: any[]) => T, ...args: any[]) => T | undefined;
export declare const niceCallback: (cb: (...args: any[]) => void, ...args: any[]) => void;
export declare const hashCode: (string: string, abs?: boolean) => number;
export declare const checkPluginItem: (pluginItem: any, index?: number) => boolean;
export declare const supportBeacon: () => boolean;
export declare const getIOSVersion: (useragent: string) => number;
export declare const isSafari: () => boolean;
export declare const isBot: () => boolean;
export declare const isPromiseSupported: () => boolean;
export declare const callError: (fn: string, type?: boolean, msg?: string) => void;
export declare const addListener: (element: any, eventType: string, eventHandler: any, options?: any) => void;
export declare const getActualKey: (k: string) => string;
export declare const parseStorageValue: (v: string) => any;
export declare const limitObject: (o: any) => {};
export declare const flattenObject: (obj?: any) => {};
export declare const compareVersion: (v1: string, v2: string) => 1 | 0 | -1;
export declare const getDynamicAttributes: (properties: any) => any;
export declare const getVds: () => any;
export declare const getGioFunction: () => any;
export declare const getMainTrackingId: () => any;
export declare const queryParse: (search: string) => string | {
    __GIO_ORDER__: string[];
};
export declare const queryStringify: (value: any, prefix?: boolean) => string;

// From utils/uach-retrofill.d.ts
export interface UADataValues {
    architecture?: string;
    bitness?: string;
    model?: string;
    platform?: string;
    platformVersion?: string;
    wow64?: boolean;
    fullVersionList?: Array<{
        brand: string;
        version: string;
    }>;
    version?: string;
}
export interface NavigatorUABrandVersion {
    brand: string;
    version: string;
}
export interface NavigatorUAData {
    brands: NavigatorUABrandVersion[];
    mobile: boolean;
    platform: string;
    getHighEntropyValues(hints: string[]): Promise<UADataValues>;
}
export type ClientHint = 'architecture' | 'bitness' | 'model' | 'platform' | 'platformVersion' | 'fullVersionList' | 'wow64';
declare global {
    interface Navigator {
        userAgentData?: NavigatorUAData;
}
}
export declare const RECOMMENDED_HINTS: readonly ClientHint[];
export declare const MOBILE_HINTS: readonly ClientHint[];
export declare function isUACHSupported(): boolean;
export declare function getCompatibleUserAgent(hints?: readonly ClientHint[]): Promise<string>;
export {};

// From utils/verifiers.d.ts
export declare const verifyId: (o: string | number) => boolean;
export declare const initialCheck: (growingIO: GrowingIOType, args: any) => false | {
    projectId: string;
    dataSourceId: string;
    appId: any;
    userOptions: any;
};
export declare const eventNameValidate: (eventName: string, callback: () => void) => false | void;


