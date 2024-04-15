import { allowOptions, OPTIONS_ENUM } from '@/constants/config';
import { consoleText } from '@/utils/tools';
import { DataStoreType } from '@/types/dataStore';
import { GrowingIOType } from '@/types/growingIO';
import { initGlobalStorage } from './storage';
import { PluginsType } from '@/types/plugins';
import { StorageType } from '@/types/storage';
import { UploaderType } from '@/types/uploader';
import { UserStoreType } from '@/types/userStore';
import {
  includes,
  isArray,
  isEmpty,
  isObject,
  keys,
  unset
} from '@/utils/glodash';
import * as glodash from '@/utils/glodash';
import * as tools from '@/utils/tools';
import EMIT_MSG from '@/constants/emitMsg';
import mitt from 'mitt';
import Plugins from './plugins';
import qs from 'querystringify';

// SDK全局参数 版本号、运行环境 均由打包工具替换写入
const sdkVersion: any = '__SDK_VERSION__';
const gioEnvironment: any = '__GIO_ENVIRONMENT__';

class GrowingIO implements GrowingIOType {
  public gioEnvironment: 'saas' | 'cdp';
  public sdkVersion: string;
  public vds: string;
  public utils: any;
  public emitter: any;
  public gioSDKFull: boolean;
  public initCallback: () => void;
  public gioSDKInitialized: boolean;
  // 小程序是否打通标识
  public useEmbeddedInherit: boolean;
  // hybrid是否打通标识
  public useHybridInherit: boolean;
  public userStore: UserStoreType;
  public dataStore: DataStoreType;
  public plugins: PluginsType;
  public vdsConfig: any;
  public uploader: UploaderType;
  public storage: StorageType;
  // 当前SDK的trackingId，用于区分事件归属。
  // 有的插件可能会需要生成事件，调用了复用了build事件的方法，为了不影响SDK自身逻辑，通过trackingId来区分
  public trackingId = 'g0';
  constructor() {
    // 环境
    this.gioEnvironment = gioEnvironment;
    // sdk版本号
    this.sdkVersion = sdkVersion;
    this.vds = window.gioCompatibilityVds ? 'gdp_vds' : 'vds';
    this.utils = { ...glodash, ...tools };
    this.emitter = mitt();
    // 初始化小程序打通逻辑
    this.useEmbeddedInherit = false;
    // hybrid打通逻辑
    this.useHybridInherit = false;
    // 初始化完成标记
    this.gioSDKInitialized = false;
    // 插件管理实例
    this.plugins = new Plugins(this);
    // 加载内置插件
    this.plugins.innerPluginInit();
  }

  // SDK初始化方法
  init = (args: any) => {
    consoleText('Gio Web SDK 初始化中...', 'info');
    const { initOptions, currentPage, sendVisit, sendPage } = this.dataStore;
    // 初始化全局配置
    initOptions(args);
    // 初始化存储
    this.storage = initGlobalStorage(this.vdsConfig);
    this.initCallback();
    // 广播基础配置初始化完成
    this.emitter?.emit(EMIT_MSG.OPTION_INITIALIZED, this);
    // 加载无埋点
    this.plugins?.gioEventAutoTracking?.main();
    // 启动页面history的hook和监听
    currentPage.hookHistory();
    // 解析当前页面
    currentPage.parsePage();
    // 广播SDK初始化完成
    this.emitter?.emit(EMIT_MSG.SDK_INITIALIZED, this);
    consoleText('Gio Web SDK 初始化完成！', 'success');
    // 先发visit和page
    if (!this.useEmbeddedInherit) {
      this.dataStore.lastVisitEvent.timestamp = currentPage.time;
      sendVisit();
    }
    sendPage();
    // 标记SDK已初始化完成
    this.gioSDKInitialized = true;
    this.vdsConfig.gioSDKInitialized = true;
    window[this.vds] = this.vdsConfig;
    // 广播SDK初始化完全完成
    this.emitter?.emit(EMIT_MSG.SDK_INITIALIZED_COMPLATE, this);
  };

  // 运行中修改配置
  setOption = (k: string, v: any) => {
    if (includes(allowOptions, k)) {
      const r = this.dataStore.setOption(k, v);
      if (r && (OPTIONS_ENUM as any)[k]) {
        consoleText(
          `已${v ? '开启' : '关闭'}${(OPTIONS_ENUM as any)[k]}`,
          'info'
        );
      }
      return r;
    } else {
      consoleText(`不存在可修改的配置项：${k}，请检查后重试!`, 'warn');
      return false;
    }
  };

  // 运行中获取配置
  getOption = (k?: string) => this.dataStore.getOption(k);

  // 设置埋点事件的通用属性（即每个埋点事件都会带上的属性值）
  setGeneralProps = (properties: any) => {
    if (isObject(properties) && !isEmpty(properties)) {
      this.dataStore.generalProps = {
        ...this.dataStore.generalProps,
        ...properties
      };
      keys(this.dataStore.generalProps).forEach((k: string) => {
        if (includes([undefined, null], this.dataStore.generalProps[k])) {
          this.dataStore.generalProps[k] = '';
        }
      });
    } else {
      this.callError('setGeneralProps');
    }
  };

  // 清空已设置的埋点事件的通用属性
  clearGeneralProps = (properties: string[] | undefined) => {
    if (isArray(properties) && !isEmpty(properties)) {
      properties.forEach((prop: string) => {
        unset(this.dataStore.generalProps, prop);
      });
    } else {
      this.dataStore.generalProps = {};
    }
  };

  // 创建自定义埋点事件 saas/cdp各自实现
  // track = (name: string, properties: { [key: string]: string }) => {};

  // 设置登录用户Id  saas/cdp各自实现
  // setUserId = (userId: string) => {};

  /**
   * @description 补发页面事件
   */
  reissuePage = () => {
    this.dataStore.sendPage();
  };

  // 清除登录用户Id saas/cdp各自实现
  // clearUserId = () => {};

  // 不建议提示
  notRecommended = () =>
    consoleText(
      "不推荐的方法使用，建议使用 gio('setOption', [optionName], [value])!", //eslint-disable-line
      'info'
    );

  // 失败提示
  callError = (fn: string, type = true, msg = '参数不合法') =>
    consoleText(`${type ? '调用' : '设置'} ${fn} 失败，${msg}!`, 'warn');

  // 手动更新曝光监听
  updateImpression = () => {
    const impressionMain = this.plugins?.gioImpressionTracking?.main;
    if (impressionMain) {
      impressionMain('emitter');
    } else {
      consoleText(
        'updateImpression 错误! 请集成半自动埋点浏览插件后重试!',
        'error'
      );
    }
  };
}

export default GrowingIO;
