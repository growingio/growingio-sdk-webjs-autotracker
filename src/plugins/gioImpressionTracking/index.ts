import EMIT_MSG from '@/constants/emitMsg';
import { GrowingIOType } from '@/types/growingIO';
import {
  arrayFrom,
  compact,
  has,
  head,
  includes,
  isArray,
  isEmpty,
  isObject,
  isString,
  lowerFirst
} from '@/utils/glodash';
import { addListener, consoleText, limitObject, niceTry } from '@/utils/tools';
import {
  EVENT_NAME_REG,
  IMP_ATTRIBUTES_REG,
  IMP_DATASET_REG
} from '@/constants/regex';

/**
 * 名称：半自动浏览埋点插件
 * 用途：用于提供半自动浏览埋点功能，标记自动监听。
 */
export default class GioImpressionTracking {
  public pluginVersion: string;
  private mutationObserver: any;
  private intersectionObserver: any;
  private documentReady = false;
  private sentImps: any;
  constructor(public growingIO: GrowingIOType) {
    this.pluginVersion = '__PLUGIN_VERSION__';
    this.sentImps = {};
    if (window.IntersectionObserver && window.MutationObserver) {
      if (includes(['interactive', 'complete'], document.readyState)) {
        this.main('listener');
      } else {
        addListener(
          document,
          'readystatechange',
          () => {
            if (includes(['interactive', 'complete'], document.readyState)) {
              this.main('listener');
            }
          },
          {
            once: true
          }
        );
      }
      this.growingIO.emitter?.on(
        EMIT_MSG.OPTION_INITIALIZED,
        ({ trackingId }) => {
          if (trackingId === this.growingIO.trackingId) {
            this.main('emitter');
          }
        }
      );
      addListener(window, 'unload', () => {
        this.intersectionObserver?.disconnect();
        this.mutationObserver?.disconnect();
      });
    } else {
      consoleText(
        '当前浏览器不支持半自动埋点，gioImpressionTracking已自动关闭！',
        'warn'
      );
    }
  }

  // 监听的初始化（先确保页面和sdk都初始化好了，两个的初始化监听都只执行一次）
  main = (msgType: 'listener' | 'emitter' | 'manual') => {
    if (includes(['listener', 'manual'], msgType)) {
      // 标记网页已初始化完成
      this.documentReady = true;
      // 如果sdk已经初始化好了，直接初始化监听，没有就等sdk的初始化消息触发
      if (this.growingIO.gioSDKInitialized) {
        this.initIntersectionObserver();
        this.initMutationObserver();
      }
    } else if (msgType === 'emitter' && this.documentReady) {
      // 页面先初始化好了，sdk才初始化好（或者sdk延迟初始化的场景）
      this.initIntersectionObserver();
      this.initMutationObserver();
    }
  };

  // 初始化曝光（视窗相交）监听
  initIntersectionObserver = () => {
    // 数值要大于0，只能无限趋近于0，等于0的时候会导致没出现就会发曝光
    const threshold = this.growingIO.vdsConfig?.impressionScale || 0.0000000000001;
    // eslint-disable-next-line
    this.intersectionObserver = new IntersectionObserver((entries, observer) => {
      if (!isEmpty(entries)) {
        entries.map((entry: any) => {
          const { dataset, id } = entry.target;
          // 相交率大于0说明出现在可视范围内
          if (entry.intersectionRatio >= threshold) {
            const dataProperties = this.getImpressionProperties(dataset);
            // 曝光类型判断，单次曝光的需要有id和gio-imp-type字段
            if (id) {
              if (dataset.gioImpType === 'once' && has(this.sentImps, id)) {
                return;
              } else {
                this.sentImps[id] = dataProperties;
              }
            }
            // 有埋点事件名就可以上报埋点
            if (dataProperties.eventName) {
              let sendTargets = [];
              if (dataset.gioImpSendto) {
                // 先尝试处理成数组
                sendTargets = compact(
                  isArray(dataset.gioImpSendto)
                    ? dataset.gioImpSendto
                    : niceTry(() => JSON.parse(dataset.gioImpSendto)) || []
                );
                // 在尝试处理字符串
                if (isEmpty(sendTargets)) {
                  niceTry(() =>
                    dataset.gioImpSendto.split(',').forEach((s: string) => {
                      s =
                        isString(s) &&
                        s.trim().replace('[', '').replace(']', '');
                      if (s) {
                        sendTargets.push(s);
                      }
                    })
                  );
                }
              }
              this.buildImpEvent(dataProperties, sendTargets);
            }
          }
        });
      }
    }, {
      threshold: [threshold]
    });
  };

  // 初始化Dom更改监听
  initMutationObserver = () => {
    if (this.mutationObserver) {
      this.mutationObserver?.disconnect();
    }
    // 静态（已定义）的监听
    const impNodes = document.querySelectorAll('[data-gio-imp-track]');
    arrayFrom(impNodes).map((trackNode: any) => {
      this.intersectionObserver?.observe(trackNode);
    });
    // 动态设置的监听
    this.mutationObserver = new MutationObserver((mutationList: any[]) => {
      mutationList.map((mutRecord: any) => {
        // 给节点动态加属性
        if (mutRecord.type === 'attributes') {
          if (mutRecord.target.dataset?.gioImpTrack) {
            this.intersectionObserver?.observe(mutRecord.target);
          }
        }
      });
    });
    // eslint-disable-next-line
    this.mutationObserver.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeOldValue: true,
      attributeFilter: [
        // 埋点名
        'data-gio-imp-track',
        // 新方式
        'data-gio-imp-attrs',
        // 老方式
        IMP_ATTRIBUTES_REG,
        // 指定发送实例
        'data-gio-imp-sendto'
      ]
    });
  };

  // 曝光参数获取
  getImpressionProperties = (dataSet: any) => {
    let data: any = {
      eventName: undefined,
      properties: {}
    };
    if (!dataSet?.gioImpTrack) {
      return data;
    } else {
      data.eventName = dataSet.gioImpTrack;
    }
    if (has(dataSet, 'gioImpAttrs')) {
      // imp写法二
      data.properties = niceTry(() =>
        isObject(dataSet.gioImpAttrs)
          ? dataSet.gioImpAttrs
          : JSON.parse(dataSet.gioImpAttrs)
      );
    } else {
      // imp写法一
      for (const key in dataSet) {
        let normKey;
        const matchArr = key.match(IMP_DATASET_REG);
        if (matchArr) {
          normKey = lowerFirst(matchArr[1]);
          if (normKey !== 'track') {
            data.properties[normKey] = dataSet[key];
          }
        }
      }
    }
    // 对参数对象进行限制
    data.properties = limitObject(data.properties);
    // 校验eventName
    if (
      !EVENT_NAME_REG.test(data.eventName) ||
      // eslint-disable-next-line
      Number.isInteger(Number(head(data.eventName.split(''))))
    ) {
      data.eventName = null;
      data = {};
    }
    return data;
  };

  // 创建半自动曝光事件
  buildImpEvent = (dataProperties: any, sendTargets: string[]) => {
    const { eventName, properties } = dataProperties;
    const {
      trackingId,
      dataStore: { eventContextBuilder, eventConverter },
      plugins
    } = this.growingIO;
    const event = {
      eventType: 'CUSTOM',
      eventName,
      ...eventContextBuilder(trackingId)
    };
    event.attributes = limitObject({
      ...(event.attributes ?? {}),
      ...(isObject(properties) && !isEmpty(properties) ? properties : {})
    });
    if (plugins.gioMultipleInstances && !isEmpty(sendTargets)) {
      event['&&sendTo'] = sendTargets;
    }
    eventConverter(event);
  };
}
