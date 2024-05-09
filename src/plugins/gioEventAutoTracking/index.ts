import { addListener } from '@/utils/tools';
import { GioWebNode } from 'gio-web-nodes-parser';
import { GIOWEBNODE, GIOWEBNODEINFO } from 'gio-web-nodes-parser/build/typings';
import { GrowingIOType } from '@/types/growingIO';
import { isEmpty, last } from '@/utils/glodash';
import EMIT_MSG from '@/constants/emitMsg';
/**
 * 名称：无埋点插件
 * 用途：用于提供无埋点的事件构建方法。
 */
const TAP_DELAY = 200;
const TAP_TIMEOUT = 700;
class TouchHandler {
  private readonly hasTouch: boolean;
  private safeguard?: number;
  private touchTimeout?: any;
  private touchEvent?: any;

  constructor(public handler: Function) {
    const ua = navigator.userAgent;
    const isChrome = /chrome/i.exec(ua);
    const isAndroid = /android/i.exec(ua);
    this.hasTouch = 'ontouchstart' in window && !(isChrome && !isAndroid);
  }

  main() {
    const startEvents = this.hasTouch ? ['touchstart'] : ['mousedown'];
    const stopEvents = this.hasTouch
      ? ['touchend', 'touchcancel']
      : ['mouseup', 'mouseleave'];
    const moveEvents = this.hasTouch ? ['touchmove'] : ['mousemove'];

    for (const event of startEvents) {
      addListener(window, event, this.touchStartHandler.bind(this));
    }
    for (const event of moveEvents) {
      addListener(window, event, this.touchMoveHandler.bind(this));
    }
    for (const event of stopEvents) {
      addListener(window, event, this.touchStopHandler.bind(this));
    }
  }

  private touchStartHandler(event: any) {
    if (event.which > 1) {
      return;
    }
    const touchTime = +Date.now();
    if (this.safeguard === touchTime) {
      return;
    }
    if (this.touchTimeout) {
      clearTimeout(this.touchTimeout);
    }
    this.safeguard = touchTime;
    this.touchEvent = {
      time: touchTime,
      target: event.target,
      x: this._page('x', event),
      y: this._page('y', event),
      isTrusted: true,
      type: 'click'
    };
  }

  private touchMoveHandler(event: any) {
    const move = {
      adx: Math.abs(
        this._page('x', event) - (this.touchEvent && this.touchEvent.x) || 0
      ),
      ady: Math.abs(
        this._page('y', event) - (this.touchEvent && this.touchEvent.y) || 0
      )
    };
    if (move.adx > 10 || move.ady > 10) {
      this.touchEvent = null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private touchStopHandler(event: any) {
    const duration =
      +Date.now() - (this.touchEvent && this.touchEvent.time) || 0;
    /*
      参加 fastclick 策略，https://github.com/ftlabs/fastclick/blob/master/lib/fastclick.js
      大于 TAP_DELAY，防止 double tap 操作。
      小于 TAP_TIMEOUT，防止长按唤起 mobile 原生调用。
    */
    if (this.touchEvent && duration < TAP_DELAY) {
      this.touchTimeout = setTimeout(() => {
        this.handler(this.touchEvent);
        this.touchEvent = null;
      }, 200);
    } else if (
      this.touchEvent &&
      duration >= TAP_DELAY &&
      duration < TAP_TIMEOUT
    ) {
      this.handler(this.touchEvent);
      this.touchEvent = null;
    }
  }

  private _page(coord: string, event: any) {
    const evt = this.hasTouch ? event.touches[0] : event;
    return evt[`page${coord.toUpperCase()}`];
  }
}

// 无埋点枚举
const EVENT_TYPE: any = {
  click: 'VIEW_CLICK',
  change: 'VIEW_CHANGE'
};
export default class GioEventAutoTracking {
  public pluginVersion: string;
  constructor(public growingIO: GrowingIOType) {
    this.pluginVersion = '__PLUGIN_VERSION__';
    this.growingIO.emitter?.on(
      EMIT_MSG.OPTION_INITIALIZED,
      ({ trackingId }) => {
        if (trackingId === this.growingIO.trackingId) {
          this.main();
        }
      }
    );
  }

  // 初始化监听
  main = () => {
    addListener(document, 'change', this._handleAction);
    const { vdsConfig }: GrowingIOType = this.growingIO;
    if (vdsConfig.touch) {
      const touchHandler = new TouchHandler(this._handleAction);
      touchHandler.main();
    } else {
      addListener(document, 'click', this._handleAction);
    }
  };

  // 事件分发
  private _handleAction = (e: Event, eventName: string) => {
    const { vdsConfig, emitter }: GrowingIOType = this.growingIO;
    const targetNode = e.target as Element;
    // 无埋点过滤和节点合法性过滤
    if (!vdsConfig.autotrack || !targetNode) {
      return false;
    }
    // 指定节点过滤（圈选样式节点，热图样式节点，vconsole节点，giokit节点）
    if (
      !targetNode?.tagName ||
      targetNode?.tagName?.toLowerCase() === 'circle-shape' ||
      targetNode?.tagName?.toLowerCase() === 'circle-page' ||
      targetNode?.tagName?.toLowerCase() === 'heatmap-page' ||
      targetNode?.id?.indexOf('__vconsole') > -1 ||
      targetNode?.id?.indexOf('__giokit') > -1
    ) {
      return false;
    }
    // 获取xpath等节点信息
    const gioWebNode: GIOWEBNODE = new GioWebNode(targetNode, e.type);
    let nodesInfo = gioWebNode.trackNodes();
    if (isEmpty(nodesInfo)) {
      return false;
    }
    // 只有click事件会报多层
    if (e.type !== 'click') {
      nodesInfo = [last(nodesInfo)];
    }
    // 向其他插件广播事件
    emitter?.emit(EMIT_MSG.ON_COMPOSE_BEFORE, {
      event: eventName,
      params: e ?? {}
    });
    // 创建事件
    nodesInfo.forEach((info: GIOWEBNODEINFO) => {
      const { fullXpath } = info;
      // 忽略giokit和vconsole节点
      if (
        fullXpath.indexOf('#__giokit') < 0 &&
        fullXpath.indexOf('#__vconsole') < 0
      ) {
        // 事件逻辑
        if (vdsConfig.debug) {
          console.log('Action：', e.type, Date.now());
        }
        if (fullXpath) {
          const {
            trackingId,
            useEmbeddedInherit,
            useHybridInherit,
            dataStore
          } = this.growingIO;
          // 主实例无埋点
          this.buildInteractiveEvent(trackingId, e, info);
          // 存在与小程序打通的实例且不是主实例时，打通实例补发一份无埋点
          if (useEmbeddedInherit && trackingId !== useEmbeddedInherit) {
            const { autotrack } = dataStore.getTrackerVds(useEmbeddedInherit);
            if (autotrack) {
              this.buildInteractiveEvent(useEmbeddedInherit, e, info);
            }
          }
          // 存在与打通的实例且不是主实例时，打通实例补发一份无埋点
          if (useHybridInherit && trackingId !== useHybridInherit) {
            const { autotrack } = dataStore.getTrackerVds(useHybridInherit);
            if (autotrack) {
              this.buildInteractiveEvent(useHybridInherit, e, info);
            }
          }
        }
      }
    });
  };

  // 构建无埋点事件
  buildInteractiveEvent = (
    trackingId: string,
    e: Event,
    info: GIOWEBNODEINFO
  ) => {
    const {
      dataStore: { eventContextBuilder, eventConverter, currentPage }
    } = this.growingIO;
    const { skeleton, xcontent, index, content, hyperlink } = info;
    const event = {
      eventType: EVENT_TYPE[e.type],
      element: [
        {
          xpath: skeleton,
          xcontent,
          textValue: content,
          index,
          hyperlink
        }
      ],
      ...eventContextBuilder(trackingId)
    };
    // 合并页面属性
    event.attributes = currentPage.eventSetPageProps(trackingId, event);
    eventConverter(event);
  };
}
