import { arrayFrom, isNil, unset } from '@/utils/glodash';
import GioNode from 'gio-web-nodes-parser';
import {
  changeableInput,
  clickableInput,
  depthInside,
  isLeaf,
  isParentOfLeaf
} from 'gio-web-nodes-parser/es/node/utils';
import {
  SUPPORTED_CONTAINER_TAGS,
  UNSUPPORTED_CLICK_TAGS
} from 'gio-web-nodes-parser/es/utils/constant';

import {
  DeviceInfo,
  ICON_TAGS,
  NodeDesc,
  NodeInfo,
  Rect,
  VisibleStatus
} from './types';

// 不支持圈选的标签: 'TEXTAREA', 'HTML', 'BODY', 'HR', 'BR' 等...
const UNSUPPORTED_CIRCLE_TAGS = [
  'HR',
  'BR',
  'SCRIPT',
  'NOSCRIPT',
  'STYLE',
  'HEAD',
  'BASE',
  'LINK',
  'META',
  'TITLE',
  'BODY',
  'HTML',
  'TEMPLATE',
  'CODE',
  ...UNSUPPORTED_CLICK_TAGS
];
// 可以直接拿来圈选的标签: 'SELECT', 'A', 'BUTTON', 'INPUT', 'IMG', 'FORM'
const DIRECT_CIRCLE_TAGS = ['SELECT', 'A', 'BUTTON', 'INPUT', 'IMG', 'FORM'];

const nodeIsInPoint = (node: Node, x: number, y: number): boolean => {
  return document.elementFromPoint(x, y) === node;
};

function onlyContainsChildren(node: Element, validTagNames: string[]): boolean {
  if (node.children.length === 0) {
    return false;
  }

  for (const child of arrayFrom(node.children)) {
    if (validTagNames.indexOf(child.tagName.toLowerCase()) === -1) {
      return false;
    }
  }

  return true;
}

/**
 * 判断是不是有一个真实的属性
 * 1. 属性有值
 * 2. 属性的值不能为false
 * @param node 节点
 */
function hasRealAttributes(node: Element) {
  const attrs = node.attributes;
  if (attrs.length > 0) {
    for (let i = 0; i < attrs.length; i++) {
      const value = attrs[i].value;
      if (!!value && value !== 'false') {
        return true;
      }
    }
  }
  return false;
}

/**
 * 向外暴露的抽象节点
 */
class CircleNode {
  private proxy: GioNode;
  private rect: Rect;
  public name: string;
  public tagName: string;
  public isIgnore: boolean;
  public isContainer?: boolean;
  public isUnSupported: boolean;

  constructor(
    public node: HTMLElement,
    private parentNodeDesc: NodeDesc,
    private devicesInfo: DeviceInfo
  ) {
    this.proxy = new GioNode(node);
    this.tagName = this.node.tagName;
    this.name = this.tagName.toLowerCase();
    this.isIgnore = !!this.node.dataset.growingIgnore;
    this.isUnSupported = UNSUPPORTED_CIRCLE_TAGS.indexOf(this.tagName) !== -1;
    this.rect = this.computeWindowRect();
  }

  /**
   * 返回这个节点的所以信息，该信息用来交给native的elements
   */
  public info(): NodeInfo {
    const desc = this.desc();
    desc.zLevel += this.devicesInfo.webviewZLevel;
    const rect = this.getDeviceRect(this.rect);
    unset(desc, 'isContainer');
    return {
      ...desc,
      ...rect,
      parentXPath: this.parentNodeDesc.isContainer
        ? this.parentNodeDesc.xpath
        : undefined,
      href: this.proxy.href,
      content: this.proxy.content,
      nodeType: this.nodeType()
    };
  }

  private nodeType() {
    if (this.name === 'input') {
      // 在圈选时，通过input类型来判断是不是chng事件
      if (!changeableInput(this.node)) {
        return 'INPUT_BTN';
      }
    }
    return this.node.tagName;
  }

  /**
   * 获取节点的描述
   * 信息的一部分
   */
  public desc(): NodeDesc {
    const pIndex = this.parentNodeDesc.index;
    return {
      index: pIndex || this.proxy.index,
      zLevel: this.zLevel(),
      xpath: this.proxy.fullXpath,
      isContainer: this.isDefinedContainer()
    };
  }

  /**
   * 在css样式上是不是可见的
   */
  public cssVisible(): boolean {
    const style = this.computedStyle();
    return (
      Number(style.opacity) > 0 &&
      style.visibility === 'visible' &&
      style.display !== 'none'
    );
  }

  /**
   * 判断节点在视窗上的状态
   *
   * 1.判断元素在视窗内是不是可见
   *   容器没有大小也不可见
   * 2.判断元素是否被完全遮挡
   *    四个顶点和中心点有一个点存在就认为没有
   * @returns {VisibleStatus} 在视窗上的状态
   */
  public viewportStatus(): VisibleStatus {
    const { top, left, width, height } = this.rect;
    const { winWidth: ww, winHeight: wh } = this.devicesInfo;
    if (width <= 0 || height <= 0) {
      return VisibleStatus.OUTER;
    }

    const elem = this.node;
    if (top < wh && left < ww && width > 0 && height > 0) {
      if (
        nodeIsInPoint(elem, left + width / 2, top + height / 2) ||
        nodeIsInPoint(elem, left + 1, top + 1) ||
        nodeIsInPoint(elem, left + width - 1, top + 1) ||
        nodeIsInPoint(elem, left + 1, top + height - 1) ||
        nodeIsInPoint(elem, left + width - 1, top + height - 1)
      ) {
        return VisibleStatus.INNER_SHOW;
      }
      return VisibleStatus.INNER_COVERED;
    }
    return VisibleStatus.OUTER;
  }

  /**
   * hybrid圈选的核心判断，是不是可圈选元素
   */
  public isCircleable(): boolean {
    // 已挂到父级节点进行处理，该节点不可圈选
    if (this.proxy.target !== this.proxy.origin) {
      return false;
    }
    if (this.isDefinedContainer()) return true;
    if (
      this.name === 'input' &&
      this.node instanceof HTMLInputElement &&
      this.node.type === 'password'
    )
      return false;
    if (DIRECT_CIRCLE_TAGS.indexOf(this.name) !== -1) return true;
    if (isLeaf(this.node)) {
      return !this.isBigBlank();
    }
    return this.hasBackgroundImage() && depthInside(this.node, 4);
  }

  /**
   * 判断是不是简单的容器节点
   * 1. select标签直接就是简单容器
   * 2. 是定义的容器标签
   *    1. a,button,tr,li,dl
   *    2. 是input但是type为 submit,button
   *    3. 并且 标签内只有简单的内容|icon元素
   */
  public isSimpleContainer(): boolean {
    if (this.name === 'select') return true;
    return (
      this.isDefaultContainer() &&
      (onlyContainsChildren(this.node, ICON_TAGS) ||
        !this.node.childElementCount)
    );
  }

  /**
   * 是不是定义上的容器节点
   * 1.是默认的容器a|button|类button
   * 2.是被指定的容器，加了容器属性的
   * 3.是叶子节点的父节点，并且有内容或属性的
   */
  public isDefinedContainer(): boolean {
    if (isNil(this.isContainer)) {
      return (
        this.isDefaultContainer() ||
        this.isMarkContainer() ||
        (isParentOfLeaf(this.node) &&
          (!!this.node.innerText?.trim().length ||
            hasRealAttributes(this.node))) ||
        this.name === 'select'
      );
    }
    return !!this.isContainer;
  }

  /**
   * 判断是不是默认的容器
   * 1. 是a,button,li,tr,dl标签
   * 2. input的type是button或submit
   */
  public isDefaultContainer(): boolean {
    return (
      SUPPORTED_CONTAINER_TAGS.indexOf(this.tagName) !== -1 ||
      clickableInput(this.node)
    );
  }

  /**
   * 是被标记的容器
   */
  private isMarkContainer(): boolean {
    return (
      this.node.hasAttribute('data-growing-container') ||
      this.node.hasAttribute('growing-container')
    );
  }

  /**
   * 大块空白元素
   */
  private isBigBlank(): boolean {
    const tl = this.node.innerText?.trim().length ?? 0;
    const { width, height } = this.rect;
    const { winWidth, winHeight } = this.devicesInfo;

    return !tl && (width > winWidth >> 1 || height > winHeight >> 1);
  }

  private hasBackgroundImage(): boolean {
    const bgi = this.computedStyle().backgroundImage;
    return !!bgi && bgi !== 'none' && bgi.length > 0;
  }

  /**
   * 有z-index则取，否则按照以下规则取值。并在此基础上加上父元素的zLevel
   * static：1
   * relative：2
   * sticky：3
   * absolute：4
   * fixed：5
   */
  private zLevel(): number {
    const style = this.computedStyle();
    const selfZIndex = style.zIndex;
    if (selfZIndex === 'auto') {
      switch (style.position) {
        case 'relative':
          return this.parentNodeDesc.zLevel + 2;
        case 'sticky':
          return this.parentNodeDesc.zLevel + 3;
        case 'absolute':
          return this.parentNodeDesc.zLevel + 4;
        case 'fixed':
          return this.parentNodeDesc.zLevel + 5;
        default:
          return this.parentNodeDesc.zLevel + 1;
      }
    } else {
      return Number(selfZIndex || '0') + this.parentNodeDesc.zLevel;
    }
  }

  /**
   * 计算节点在视窗下的矩形大小
   */
  private computeWindowRect(): Rect {
    if (this.rect) return this.rect;
    const rect = this.node.getBoundingClientRect();
    const top = rect.top;
    const bottom = rect.bottom;
    const left = rect.left;
    const right = rect.right;
    let width = right - left;
    let height = bottom - top;

    if (top < 0) {
      height = top + height;
    } else if (top + height > this.devicesInfo.winHeight) {
      height = this.devicesInfo.winHeight - top;
    }

    if (left < 0) {
      width = left + width;
    } else if (left + width > this.devicesInfo.winWidth) {
      width = this.devicesInfo.winWidth - left;
    }

    this.rect = { top, left, width, height };
    return this.rect;
  }

  /**
   * 获取节点计算后的css样式
   */
  private computedStyle(): CSSStyleDeclaration {
    return window.getComputedStyle(this.node);
  }

  /**
   * 根据dom的rect获取在native设备上的真实rect
   */
  private getDeviceRect(domRect: Rect): Rect {
    const { scale, webviewTop, webviewLeft } = this.devicesInfo;
    return {
      top: domRect.top * scale + webviewTop,
      left: domRect.left * scale + webviewLeft,
      width: domRect.width * scale,
      height: domRect.height * scale
    };
  }
}

export default CircleNode;
