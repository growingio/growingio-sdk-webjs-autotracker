/**
 * 仅仅是icon标签
 */
export const ICON_TAGS: string[] = ['i', 'span', 'em', 'b', 'strong', 'svg'];

export interface DeviceInfo {
  scale: number;
  winWidth: number;
  winHeight: number;
  webviewTop: number;
  webviewLeft: number;
  webviewWidth: number;
  webviewHeight: number;
  webviewZLevel: number;
}

/**
 * 节点描述
 * xpath:
 * index:
 * zLevel:
 */
export interface NodeDesc {
  xpath?: string;
  index?: number;
  zLevel: number;
  isContainer: boolean;
}

/**
 * 矩形信息
 */
export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Page {
  domain: string;
  path: string;
  query: string;
  title: string;
}

/**
 * 定义一个节点的信息
 */
export interface NodeInfo extends Rect, NodeDesc {
  parentXPath?: string;
  href: string;
  content: string;
  nodeType: string;
  e?: Node;
}

export interface DomTree {
  page: Page;
  elements: NodeInfo[];
}

/**
 * 元素可见状态
 */
export enum VisibleStatus {
  /**
   * 在视窗外部
   */
  OUTER,
  /**
   * 在视窗内，但相对被其他元素完全遮挡
   */
  INNER_COVERED,
  /**
   * 在视窗内，且相对可见
   */
  INNER_SHOW
}
