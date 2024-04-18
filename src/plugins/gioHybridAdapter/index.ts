/**
 * 名称：Hybrid打通插件
 * 用途：用于提供与app sdk打通转发事件和圈选辅助的插件。
 * 使用逻辑：
 * 1、Native的projectId和Web的projectId是否一致，用于判断是否打通。打通就单发给Native，没打通就web双发（没打通想单发在Native端控制）。
 * 2、penetrateHybrid值true或者false，用于判断打通时是否把用户信息同步给Native（即用户信息更改的bridge方法是否能调用）。
 * 3、打通时想要双发需要加配置项，作为TODO，等有客户有实际需求时再做。
 */
import EMIT_MSG from '@/constants/emitMsg';
import { EVENT } from '@/types/events';
import { GrowingIOType } from '@/types/growingIO';
import {
  forEach,
  isBoolean,
  toString,
  unset,
  isObject,
  isArray,
  includes
} from '@/utils/glodash';
import { GioHybridNode } from 'gio-web-nodes-parser';
import {
  GIOHYBRIDNODE,
  GIOHYBRIDNODEINFO
} from 'gio-web-nodes-parser/build/typings';
import Page from '@/core/dataStore/page';
import { addListener, niceTry } from '@/utils/tools';
import { OriginOptions } from '@/types/dataStore';

let ut;
const SUPPORT_EVENT_TYPES = [
  'VIEW_CLICK',
  'VIEW_CHANGE',
  'PAGE',
  'CUSTOM',
  'LOGIN_USER_ATTRIBUTES'
];
const PENETRATED_EVENT_TYPES = ['LOGIN_USER_ATTRIBUTES'];

const DOM_EVENT = ['DOMContentLoaded', 'onreadystatechange'];
const WINDOW_EVENT = [
  'scroll',
  'resize',
  'load',
  'beforeunload',
  'popstate',
  'hashchange',
  'pagehide',
  'unload'
];

export default class GioHybridAdapter {
  private penetrateHybrid = true;
  private hasHybridBridge: boolean;
  public hybridConfig: {
    projectId: string;
    dataSourceId: string;
    packageName?: string;
    appPackage?: string;
  };
  public onSendBefore: any;

  constructor(public growingIO: GrowingIOType) {
    const { emitter, utils } = this.growingIO;
    ut = utils;
    emitter.on(
      EMIT_MSG.OPTION_INITIALIZED,
      ({
        trackingId,
        vdsConfig
      }: {
        trackingId: string;
        vdsConfig: OriginOptions;
      }) => {
        this.onOptionsInit(trackingId, vdsConfig);
        if (
          this.growingIO.useHybridInherit &&
          window.GrowingWebViewJavascriptBridge
        ) {
          const self = this;
          window.GrowingWebViewJavascriptBridge.getDomTree = function () {
            if (arguments.length >= 4) {
              return self._getDomTree.apply(this, arguments);
            }
          };
          this._addDomChangeListener();
        }
      }
    );
  }

  // 打通匹配和打通后的处理逻辑
  onOptionsInit = (trackingId: string, vdsConfig: OriginOptions) => {
    const { emitter, plugins } = this.growingIO;
    if (isBoolean(vdsConfig.penetrateHybrid)) {
      this.penetrateHybrid = vdsConfig.penetrateHybrid;
    }
    const bridgeInitialized = this._initHybridBridge();
    if (bridgeInitialized) {
      // 桥初始化完成即挂载事件监听（无论是否打通，都会给native端发事件数据）
      this.onSendBefore = this.sendBeforeListener;
      // 不存在已打通的packageName则尝试匹配打通，打通web自身就不发数
      if (!this.growingIO.useHybridInherit) {
        const configPackageName =
          this.hybridConfig.packageName ?? this.hybridConfig.appPackage;
        // 使用多实例插件时必须传packageName，使用projectId+packageName来判断打通，否则一律视为无法打通
        if (plugins.gioMultipleInstances) {
          if (
            this.hybridConfig.projectId === vdsConfig.projectId &&
            configPackageName === vdsConfig.packageName
          ) {
            this.growingIO.useHybridInherit = trackingId;
          }
        } else if (vdsConfig.packageName) {
          // ? 以后应尽量避免让客户直接利用projectId(ai)来和移动端打通，尽量引导加packageName作为判断依据
          // 存在packageName，则判断projectId和packageName同时相等为打通
          if (
            this.hybridConfig.projectId === vdsConfig.projectId &&
            configPackageName === vdsConfig.packageName
          ) {
            this.growingIO.useHybridInherit = trackingId;
          }
        } else if (this.hybridConfig.projectId === vdsConfig.projectId) {
          // 不存在packageName，则projectId一致即视为打通（向下兼容兜底方案）
          this.growingIO.useHybridInherit = trackingId;
        }
      }
    }
    // 打通后添加userId、userKey的变更监听，即打通才允许设值userId和userKey
    if (this.growingIO.useHybridInherit) {
      emitter?.on(
        EMIT_MSG.SET_USERID,
        ({ newUserId, oldUserId, userKey, trackingId }: any) => {
          if (trackingId === this.growingIO.useHybridInherit) {
            if (this.penetrateHybrid) {
              // 有旧值且新传入的值为空视为清除
              if (!newUserId && oldUserId) {
                if (userKey) {
                  this._clearNativeUserIdAndUserKey();
                } else {
                  this._clearNativeUserId();
                }
              } else {
                // 其他情况视为setUserId
                if (userKey) {
                  this._setNativeUserIdAndUserKey(
                    toString(newUserId),
                    toString(userKey)
                  );
                } else {
                  this._setNativeUserId(toString(newUserId));
                }
              }
            }
          }
        }
      );
      emitter?.on(
        EMIT_MSG.SET_USERKEY,
        ({ newUserKey, oldUserKey, userId, trackingId }: any) => {
          if (trackingId === this.growingIO.useHybridInherit) {
            if (this.penetrateHybrid) {
              // 有旧值且新传入的值为空视为清除
              if (!newUserKey && oldUserKey) {
                this._clearNativeUserIdAndUserKey();
              } else {
                // 其他情况视为setUserKey，有userId就带上设值，没有userId就算调用了下面的方法native端也不会处理
                this._setNativeUserIdAndUserKey(
                  toString(userId),
                  toString(newUserKey)
                );
              }
            }
          }
        }
      );
    }
  };

  // 初始化桥
  private _initHybridBridge = () => {
    let bridgeInitialized = false;
    // 是否存在桥
    this.hasHybridBridge = !!window.GrowingWebViewJavascriptBridge;
    if (this.hasHybridBridge) {
      // 是否存在配置，不存在尝试格式化获取
      if (!window?.GrowingWebViewJavascriptBridge?.configuration) {
        window.GrowingWebViewJavascriptBridge.configuration = JSON.parse(
          window.GrowingWebViewJavascriptBridge.getConfiguration()
        );
      }
      // 把全局配置赋值给this
      if (window?.GrowingWebViewJavascriptBridge?.configuration) {
        this.hybridConfig =
          window?.GrowingWebViewJavascriptBridge?.configuration;
      }
      bridgeInitialized = true;
    } else {
      ut.consoleText(
        'gioHybridAdapter：当前不存在 GrowingWebViewJavascriptBridge，Web模式。',
        'info'
      );
    }
    return bridgeInitialized;
  };

  sendBeforeListener = ({
    requestData,
    trackingId
  }: {
    requestData: EVENT;
    trackingId: string;
  }) => {
    // 存在桥就要进行转发
    if (this.hasHybridBridge) {
      const dispatchProcess = () => {
        // 数据类型处理
        const nativeData = this.processAttributes({ ...requestData });
        // 符合转发条件的事件类型
        if (includes(SUPPORT_EVENT_TYPES, nativeData.eventType)) {
          if (includes(PENETRATED_EVENT_TYPES, nativeData.eventType)) {
            if (this.penetrateHybrid) {
              // 打通事件（目前仅支持用户属性），并且设置穿透用户信息时直接将事件传给native
              this._dispatchEvent(nativeData);
            }
          } else {
            // 不穿透用户信息时，移除事件中的userId和userKey
            if (!this.penetrateHybrid) {
              unset(nativeData, ['userId', 'userKey', 'cs1']);
            }
            this._dispatchEvent(nativeData);
          }
        }
      };
      if (this.growingIO.useHybridInherit) {
        // 打通的时候，打通的实例给移动端转发
        if (trackingId === this.growingIO.useHybridInherit) {
          dispatchProcess();
        }
      } else {
        // 没有打通时只有主实例且未集成多实例插件时会给移动端转发
        if (
          trackingId === this.growingIO.trackingId &&
          !this.growingIO.plugins.gioMultipleInstances
        ) {
          dispatchProcess();
        }
      }
    }
  };

  // 将Attributes中的值全部转成字符串（数字类型会导致ios崩溃）
  processAttributes = (data: any) => {
    forEach(data, (dv, dk) => {
      if (isObject(dv) || isArray(dv)) {
        forEach(data[dk], (v, k) => {
          if (!isObject(v) && !isArray(v)) {
            data[dk][k] = toString(v);
          } else {
            data[dk][k] = JSON.stringify(v);
          }
        });
      } else {
        data[dk] = toString(dv);
      }
    });
    return data;
  };

  private _setNativeUserId = (userId: string) => {
    niceTry(() =>
      window.GrowingWebViewJavascriptBridge.setNativeUserId(userId)
    );
  };

  private _clearNativeUserId = () => {
    niceTry(() => window.GrowingWebViewJavascriptBridge.clearNativeUserId());
  };

  private _setNativeUserIdAndUserKey = (userId: string, userKey: string) => {
    niceTry(() =>
      window.GrowingWebViewJavascriptBridge.setNativeUserIdAndUserKey(
        userId,
        userKey
      )
    );
  };

  private _clearNativeUserIdAndUserKey = () => {
    niceTry(() =>
      window.GrowingWebViewJavascriptBridge.clearNativeUserIdAndUserKey()
    );
  };

  private _dispatchEvent = (data: any) => {
    niceTry(() =>
      window.GrowingWebViewJavascriptBridge?.dispatchEvent(JSON.stringify(data))
    );
  };

  // 圈选获取dom树方法
  private _getDomTree = (
    webviewLeft: number,
    webviewTop: number,
    webviewWidth: number,
    webviewHeight: number,
    webviewZLevel: number,
    root?: HTMLElement
  ) => {
    const gioHybridNode: GIOHYBRIDNODE = new GioHybridNode({
      webviewLeft,
      webviewTop,
      webviewWidth,
      webviewHeight,
      webviewZLevel
    });
    // @ts-ignore
    const elements = gioHybridNode
      .trackNodes(
        // eslint-disable-next-line
        root ?? document.body,
        {
          isContainer: false,
          zLevel: 0
        },
        false
      )
      .map((o: GIOHYBRIDNODEINFO) => {
        // 移动端不需要这两个字段。iOS会报错
        unset(o, ['originNode', 'peerNodes']);
        return o;
      });
    const { domain, path, query, title } = this.growingIO.dataStore
      .currentPage as Page;
    const domTree = {
      page: { domain, path, query, title },
      elements: elements
    };
    return domTree;
  };

  // 添加dom变更监听
  private _addDomChangeListener() {
    let mutationObserver: MutationObserver;
    const listener = (type = '') => {
      return () => {
        if (type === 'beforeunload' && mutationObserver) {
          mutationObserver.disconnect();
        }
        window.GrowingWebViewJavascriptBridge?.onDomChanged();
      };
    };
    mutationObserver = new MutationObserver(listener('mutation'));
    // eslint-disable-next-line
    mutationObserver.observe(document.body, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true
    });

    DOM_EVENT.forEach((type) => {
      addListener(document, type, listener(type));
    });
    WINDOW_EVENT.forEach((type) => {
      addListener(window, type, listener(type));
    });
  }
}
