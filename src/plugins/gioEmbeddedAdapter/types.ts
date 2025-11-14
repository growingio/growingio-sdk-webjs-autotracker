/**
 * 小程序内嵌页适配相关类型定义
 * 
 * 包含小程序内嵌页适配插件使用的类型定义
 */

/**
 * 全局查询字符串类型
 * 
 * 用于存储全局查询参数的键值对，值可以是字符串或布尔值
 */
export type GQS = Record<string, string | boolean>;

/**
 * 自定义查询字符串类型
 * 
 * 用于存储自定义查询参数的键值对，值只能是字符串
 */
export type CustomerQS = Record<string, string>;

/**
 * 存储类型接口
 * 
 * 定义了存储操作的基本方法
 */
export type EmbeddedStorageType = {
  /** 
   * 存储项设值
   * @param key 键名
   * @param value 值
   */
  setItem: (key: string, value: any) => void;
  
  /** 
   * 存储项获取
   * @param key 键名
   * @returns 存储项值
   */
  getItem: (key: string) => any;
  
  /** 
   * 移除存储项
   * @param key 键名
   */
  removeItem: (key: string) => void;
};