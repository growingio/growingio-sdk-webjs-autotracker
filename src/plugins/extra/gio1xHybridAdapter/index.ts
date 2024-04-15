/**
 * 名称：老版本(1.x/2.x)App Hybrid打通插件
 * 用途：用于提供与老版本app sdk打通转发事件的插件。
 * 使用逻辑：不判断projectId是否一致，无脑转发给native端。只有桥的时候会给native发，没有桥就不做操作。
 */
import EMIT_MSG from '@/constants/emitMsg';
import { CDPEvent } from '@/types/events';
import { GrowingIOType } from '@/types/growingIO';

let ut;
const SUPPORT_EVENT_TYPES = ['PAGE', 'CUSTOM', 'LOGIN_USER_ATTRIBUTES'];
const ATTR_TYPES = ['CUSTOM', 'LOGIN_USER_ATTRIBUTES'];
const CONVERSION_TYPES = {
  PAGE: 'PAGE',
  CUSTOM: 'CUSTOM_EVENT',
  LOGIN_USER_ATTRIBUTES: 'USER_EVENT'
};
export default class Gio1xHybridAdapter {
  private hasHybridBridge: boolean;
  private hybridConfig: any;
  public onSendBefore: any;

  constructor(public growingIO: GrowingIOType) {
    const { emitter, utils } = this.growingIO;
    ut = utils;
    emitter.on(EMIT_MSG.OPTION_INITIALIZED, this.onOptionsInit);
  }

  onOptionsInit = () => {
    const { plugins, emitter } = this.growingIO;
    const bridgeInitialized = this._initHybridBridge();
    // 版本判断（含有appPackage字段的是新版3.x的sdk，不含的是旧版1.x）
    if (!ut.has(this.hybridConfig, 'appPackage') && bridgeInitialized) {
      // 判断为旧版sdk且桥初始化完成，web就不会发数
      this.growingIO.useHybridInherit = bridgeInitialized;
      // 挂载事件监听（版本符合且有桥才会给native发事件数据）
      this.onSendBefore = this.sendBeforeListener;
      // 移除sdk默认适配3.x HybridAdapter的事件监听
      if (plugins?.gioHybridAdapter) {
        this.growingIO.plugins.gioHybridAdapter.onSendBefore = () => {};
      }
      // 打通后添加userId的变更监听
      if (this.growingIO.useHybridInherit) {
        emitter?.on(EMIT_MSG.SET_USERID, ({ newUserId, oldUserId }: any) => {
          if (!newUserId && oldUserId) {
            this._clearNativeUserId();
          } else {
            this._setNativeUserId(ut.toString(newUserId));
          }
        });
      }
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
        'gio1xHybridAdapter：当前不存在 GrowingWebViewJavascriptBridge，Web模式。',
        'info'
      );
    }
    return bridgeInitialized;
  };

  sendBeforeListener = ({ requestData }: { requestData: CDPEvent }) => {
    // 存在桥就要进行转发
    if (this.hasHybridBridge) {
      if (ut.includes(SUPPORT_EVENT_TYPES, requestData.eventType)) {
        // 数据类型和格式处理
        const nativeEvent: any = this.convertNativeEvent(
          this.processAttributes({ ...requestData })
        );
        if (requestData.eventType === 'CUSTOM') {
          nativeEvent.name = requestData.eventName;
        }
        if (ut.includes(ATTR_TYPES, requestData.eventType)) {
          nativeEvent.attributes = requestData.attributes ?? {};
          if (ut.has(requestData, 'resourceItem')) {
            nativeEvent.item = requestData.resourceItem ?? {};
          }
        }
        this._dispatchEvent(nativeEvent);
      }
    }
  };

  // 将Attributes中的值全部转成字符串（数字类型会导致ios崩溃）
  processAttributes = (data: any) => {
    ut.forEach(data, (dv, dk) => {
      if (ut.isObject(dv) || ut.isArray(dv)) {
        ut.forEach(data[dk], (v, k) => {
          if (!ut.isObject(v) && !ut.isArray(v)) {
            data[dk][k] = ut.toString(v);
          } else {
            data[dk][k] = JSON.stringify(v);
          }
        });
      } else {
        data[dk] = ut.toString(dv);
      }
    });
    return data;
  };

  // 转换事件测量协议
  convertNativeEvent = (d: CDPEvent) => ({
    type: CONVERSION_TYPES[d.eventType],
    anonymousId: d.deviceId,
    domain: d.domain ?? '',
    path: d.path ?? '',
    query: d.query ?? '',
    title: d.title ?? '',
    userId: d.userId ?? d.cs1 ?? '',
    userKey: d.userKey ?? '',
    gioId: d.gioId,
    timestamp: d.timestamp,
    datasourceId: d.dataSourceId,
    session: d.sessionId,
    version: d.sdkVersion,
    esid: d.eventSequenceId
  });

  private _setNativeUserId = (userId: string) => {
    ut.niceTry(() =>
      window.GrowingWebViewJavascriptBridge.setNativeUserId(userId)
    );
  };

  private _clearNativeUserId = () => {
    ut.niceTry(() => window.GrowingWebViewJavascriptBridge.clearNativeUserId());
  };

  private _dispatchEvent = (data: any) => {
    ut.niceTry(() =>
      window.GrowingWebViewJavascriptBridge?.dispatchEvent(JSON.stringify(data))
    );
  };
}
