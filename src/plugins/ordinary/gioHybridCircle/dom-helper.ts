import { GrowingIOType } from '@/types/growingIO';
import { addListener } from '@/utils/tools';

import CircleNode from './circle-node';
import {
  DeviceInfo,
  DomTree,
  NodeDesc,
  NodeInfo,
  Page,
  VisibleStatus
} from './types';

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

/**
 * 获取当前设备webview信息
 * @param webviewLeft
 * @param webviewTop
 * @param webviewWidth
 * @param webviewHeight
 * @param webviewZLevel
 */
function getDeviceInfo(
  webviewLeft: number,
  webviewTop: number,
  webviewWidth: number,
  webviewHeight: number,
  webviewZLevel: number
): DeviceInfo {
  const winWidth = document.documentElement.clientWidth;
  const winHeight = document.documentElement.clientHeight;
  const scale = webviewWidth / winWidth;

  return {
    winWidth,
    winHeight,
    scale,
    webviewTop,
    webviewLeft,
    webviewWidth,
    webviewHeight,
    webviewZLevel
  };
}

class DomHelper {
  constructor(public growingIO: GrowingIOType) {
    this.addDomChangeListener();
  }

  /**
   * 提供给native调用，来获取网页dom树
   *
   * @param webviewLeft    webview的left值
   * @param webviewTop     native中webview的top值
   * @param webviewWidth   webview的宽
   * @param webviewHeight  webview的高
   * @param webviewZLevel  webview的z轴层级
   * @param root           测试用，指定获取dom tree的根节点
   * @return dom信息，格式如下：具体见圈选数据的webView节点格式
   * {
   *   page: {},
   *   elements: []
   * }
   */
  public getDomTree(
    webviewLeft: number,
    webviewTop: number,
    webviewWidth: number,
    webviewHeight: number,
    webviewZLevel: number,
    root?: HTMLElement
  ): DomTree {
    const deviceInfo = getDeviceInfo(
      webviewLeft,
      webviewTop,
      webviewWidth,
      webviewHeight,
      webviewZLevel
    );
    const desc = { isContainer: false, zLevel: 0 };
    const elements = this.getElementsByParent(
      root || document.body,
      desc,
      deviceInfo
    );
    const { domain, path, query, title } = this.growingIO.dataStore
      .currentPage as Page;
    const domTree = {
      page: { domain, path, query, title },
      elements: elements
    };
    return domTree;
  }

  /**
   * 遍历父节点下所有可圈选的子节点信息
   * @param parent 父节点
   * @param desc   父节点描述
   * @param deviceInfo 设备信息
   */
  private getElementsByParent(
    parent: HTMLElement,
    desc: NodeDesc,
    deviceInfo: DeviceInfo
  ): NodeInfo[] {
    const elements: NodeInfo[] = [];
    Array.prototype.slice
      .call(parent.childNodes, 0)
      .filter((v) => v.nodeType === 1)
      .forEach((node) => {
        const circleNode = new CircleNode(node, desc, deviceInfo);
        if (!circleNode.cssVisible() || circleNode.isIgnore) return;
        switch (circleNode.viewportStatus()) {
          case VisibleStatus.INNER_SHOW:
            if (circleNode.isCircleable()) {
              elements.push(circleNode.info());
            }
            break;
          case VisibleStatus.INNER_COVERED:
            if (circleNode.isDefaultContainer()) {
              elements.push(circleNode.info());
            }
            break;
          default:
            break;
        }
        // 简单容器不需要遍历子元素
        if (circleNode.isSimpleContainer()) return;
        Array.prototype.push.apply(
          elements,
          this.getElementsByParent(node, circleNode.desc(), deviceInfo)
        );
      });
    return elements;
  }

  /**
   * 添加dom变化事件监听
   */
  private addDomChangeListener() {
    // eslint-disable-next-line prefer-const
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

export default DomHelper;
