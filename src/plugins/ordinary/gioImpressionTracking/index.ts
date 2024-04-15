import EMIT_MSG from '@/constants/emitMsg';
import { GrowingIOType } from '@/types/growingIO';
import { isIE } from '@/utils/business/core';
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
    if (window.IntersectionObserver && window.MutationObserver) {
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
    } else {
      consoleText(
        '当前浏览器不支持半自动埋点，gioImpressionTracking已自动关闭！',
        'warn'
      );
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
          const { dataset, id } = entry.target;
          // 相交率大于0说明出现在可视范围内
          if (entry.intersectionRatio > 0) {
            const { eventId, properties, items } =
              this.getImpressionProperties(dataset);
            // 曝光类型判断，单次曝光的需要有id和gio-imp-type字段
            if (id) {
              if (dataset.gioImpType === 'once' && has(this.sentImps, id)) {
                return;
              } else {
                this.sentImps[id] = { eventId, properties, items };
              }
            }
            // 有埋点事件id就可以上报埋点
            if (eventId) {
              this.growingIO.track(eventId, properties, items);
            }
          }
        });
      }
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
    this.mutationObserver.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeOldValue: true,
      attributeFilter: [
        'data-gio-imp-track',
        // 新方式
        'data-gio-imp-attrs',
        'data-gio-imp-items',
        // 老方式
        /^data-gio-track-[a-z]+$/i
      ]
    });
  };

  // 曝光参数获取
  getImpressionProperties = (dataSet: any) => {
    let data: any = {
      eventId: undefined,
      properties: {}
    };
    if (!dataSet?.gioImpTrack) {
      return data;
    } else {
      data.eventId = dataSet.gioImpTrack;
    }
    if (has(dataSet, 'gioImpAttrs')) {
      // imp写法二
      data.properties = niceTry(() =>
        isObject(dataSet.gioImpAttrs)
          ? dataSet.gioImpAttrs
          : JSON.parse(dataSet.gioImpAttrs)
      );
      // 兼容cdp的items
      data.items = niceTry(() =>
        isObject(dataSet.gioImpItems)
          ? dataSet.gioImpItems
          : JSON.parse(dataSet.gioImpItems)
      );
    } else {
      // imp写法一
      const propReg = /^gioTrack(.+)/;
      for (const key in dataSet) {
        let normKey;
        const matchArr = key.match(propReg);
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
    data.items = limitObject(data.items);
    // 校验eventId
    const eventIdReg = /^\w+$/;
    if (
      !eventIdReg.test(data.eventId) ||
      Number.isInteger(Number(head(data.eventId.split(''))))
    ) {
      data.eventId = null;
      data = {};
    }
    return data;
  };
}
