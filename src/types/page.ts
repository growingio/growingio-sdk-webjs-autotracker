export default interface PageType {
  // 页面路径
  path: string;
  // 页面查询参数
  query: string;
  // 页面标题
  title?: string;
  // 站点域
  domain: string;
  // 页面加载时间
  time: number;
  // 解析页面信息
  parsePage: () => void;
  // 获取来源页面
  getReferralPage: () => string;
  // 原生history处理
  hookHistory: () => void;
  // 构建页面事件
  buildPageEvent: (props?: any) => void;
}
