import { EVENT } from './events';

/**
 * 页面类型接口
 * 
 * 定义了页面相关信息的结构和方法
 */
export default interface PageType {
  /** 页面路径 */
  path: string;
  
  /** 页面查询参数 */
  query: string;
  
  /** 页面标题（可选） */
  title?: string;
  
  /** 站点域 */
  domain: string;
  
  /** 页面加载时间 */
  time: number;
  
  /** 页面监听器 */
  pageListeners: any;
  
  /** 页面属性 */
  pageProps: any;
  
  /** 解析页面信息 */
  parsePage: () => void;
  
  /** 
   * 获取来源页面
   * @param trackingId 跟踪ID
   * @returns 来源页面路径
   */
  getReferralPage: (trackingId: string) => string;
  
  /** 原生history处理 */
  hookHistory: () => void;
  
  /** 
   * 给事件合并页面属性
   * @param trackingId 跟踪ID
   * @param event 事件对象
   * @returns 合并后的属性
   */
  eventSetPageProps: (trackingId: string, event: EVENT) => any;
  
  /** 
   * 构建页面事件
   * @param trackingId 跟踪ID
   * @param props 事件属性（可选）
   */
  buildPageEvent: (trackingId: string, props?: any) => void;
}
