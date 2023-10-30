import { EVENT_TYPE } from '@/constants/config';
import { GrowingIOType } from '@/types/growingIO';
import { isEmpty, last, startsWith } from '@/utils/glodash';
import { addListener } from '@/utils/tools';
import GioNode from 'gio-web-nodes-parser';
import { NodeInfo } from 'gio-web-nodes-parser/es/typings';

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

export default class GioEventAutoTracking {
  constructor(public growingIO: GrowingIOType) {}

  // 初始化监听
  main = () => {
    addListener(document, 'submit', this._handleAction);
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
    if (!vdsConfig.autotrack) {
      return false;
    }
    const target = e.target as Node;
    if (!target) return false;
    // 获取xpath等节点信息
    const node = new GioNode(target, e.type, true);
    let nodesInfo = node.trackNodes();
    // 只有click事件会报多层
    if (e.type !== 'click') {
      nodesInfo = !isEmpty(last(nodesInfo)) ? [last(nodesInfo)] : [];
    }
    if (isEmpty(nodesInfo)) {
      return false;
    }
    // 向其他插件广播事件
    emitter?.emit('onComposeBefore', {
      event: eventName,
      params: e ?? {}
    });
    // 创建事件
    nodesInfo.forEach((info: NodeInfo) => {
      const { fullXpath, index, content, href } = info;
      // 忽略vConsole和giokit的节点
      if (
        startsWith(info.fullXpath || '', '/div#__vconsole') ||
        startsWith(info.fullXpath || '', '/div#__giokit')
      ) {
        return;
      }
      // 事件逻辑
      if (vdsConfig.debug) {
        console.log('Action：', e.type, Date.now());
      }
      if (fullXpath) {
        const {
          dataStore: { eventContextBuilder, eventConverter, currentPage }
        } = this.growingIO;
        const event = {
          eventType: EVENT_TYPE[e.type],
          element: [
            {
              xpath: fullXpath,
              index,
              textValue: content,
              hyperlink: href
            }
          ],
          ...eventContextBuilder(),
          // ptm取值要在通用维度后面，防止刷新session以后ptm变了没取到最新值
          pageShowTimestamp: currentPage.time
        };
        eventConverter(event);
      }
    });
  };
}
