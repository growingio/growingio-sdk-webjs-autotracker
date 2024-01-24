import EMIT_MSG from '@/constants/emitMsg';
import { GrowingIOType } from '@/types/growingIO';
import { isIE } from '@/utils/tools';
import {
  arrayFrom,
  has,
  head,
  includes,
  isEmpty,
  isObject,
  lowerFirst
} from '@/utils/glodash';
import { addListener, consoleText, limitObject, niceTry } from '@/utils/tools';
import {
  EventNameReg,
  IMPAttributesReg,
  IMPDatasetReg
} from '@/constants/regex';

/**
 * 名称：半自动浏览埋点插件
 * 用途：用于提供半自动浏览埋点功能，标记自动监听。
 */
export default class GioImpressionTracking {
  private mutationObserver: any;
  private intersectionObserver: any;
  private documentReady = false;
  private sentImps: any;
  constructor(public growingIO: GrowingIOType) {
    this.sentImps = {};
    if (isIE()) {
      consoleText(
        'IE浏览器不支持半自动埋点，gioImpressionTracking已自动关闭！',
        'warn'
      );
    } else {
      this.initIntersectionObserver();
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
      this.growingIO.emitter?.on(EMIT_MSG.SDK_INITIALIZED, () =>
        this.main('emitter')
      );
      addListener(window, 'unload', () => {
        this.intersectionObserver?.disconnect();
        this.mutationObserver?.disconnect();
      });
    }
  }

  // 监听的初始化（先确保页面和sdk都初始化好了，两个的初始化监听都只执行一次）
  main = (msgType: 'listener' | 'emitter') => {
    if (msgType === 'listener') {
      // 标记网页已初始化完成
      this.documentReady = true;
      // 如果sdk已经初始化好了，直接初始化监听，没有就等sdk的初始化消息触发
      if (this.growingIO.gioSDKInitialized) {
        this.initMutationObserver();
      }
    } else if (msgType === 'emitter' && this.documentReady) {
      // 页面先初始化好了，sdk才初始化好（或者sdk延迟初始化的场景）
      this.initMutationObserver();
    }
  };

  // 初始化曝光（视窗相交）监听
  initIntersectionObserver = () => {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      if (!isEmpty(entries)) {
        entries.map((entry: any) => {
          const { dataset } = entry.target;
          // 相交率大于0说明出现在可视范围内
          if (entry.intersectionRatio > 0) {
            const { eventName, properties } =
              this.getImpressionProperties(dataset);
            // 曝光类型判断，单次曝光的需要有id和gio-imp-type字段
            const sentId = dataset.id;
            if (sentId) {
              if (dataset.gioImpType === 'once' && has(this.sentImps, sentId)) {
                return;
              } else {
                this.sentImps[sentId] = { eventName, properties };
              }
            }
            // 有埋点事件名就可以上报埋点
            if (eventName) {
              // 要直接构建custom事件，不要去调用埋点插件的方法，万一插件没有加载就发不出去了
              this.buildImpEvent({ eventName, properties });
            }
          }
        });
      }
    });
  };

  // 初始化Dom更改监听
  initMutationObserver = () => {
    if (this.mutationObserver) {
      return false;
    }
    // 静态（已定义）的监听
    const impNodes = document.querySelectorAll('[data-gio-imp-track]');
    arrayFrom(impNodes).map((trackNode: any) => {
      this.intersectionObserver?.observe(trackNode);
    });
    // 动态设置的监听
    this.mutationObserver = new MutationObserver((mutationList: any[]) => {
      return mutationList.map((mutRecord: any) => {
        if (mutRecord.type === 'attributes') {
          const { dataset } = mutRecord.target;
          if (dataset.gioImpTrack) {
            return this.intersectionObserver?.observe(mutRecord.target);
          }
        }
      });
    });
    this.mutationObserver.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeOldValue: true,
      attributeFilter: [
        'data-gio-imp-track',
        // 新方式
        'data-gio-imp-attrs',
        // 老方式
        IMPAttributesReg
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
        const matchArr = key.match(IMPDatasetReg);
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
      !EventNameReg.test(data.eventName) ||
      Number.isInteger(Number(head(data.eventName.split(''))))
    ) {
      data.eventName = null;
      data = {};
    }
    return data;
  };

  // 创建半自动曝光事件
  buildImpEvent = (dataProperties: any) => {
    const { eventName, properties } = dataProperties;
    const {
      dataStore: { eventContextBuilder, eventConverter }
    } = this.growingIO;
    const event = {
      eventType: 'CUSTOM',
      eventName,
      attributes: properties,
      ...eventContextBuilder(),
      customEventType: 0
    };
    eventConverter(event);
  };
}