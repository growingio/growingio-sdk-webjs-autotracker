/**
 * 存储类型接口
 * 
 * 定义了SDK中存储功能的结构和方法
 */
export interface StorageType {
  /** 存储类型 */
  type: 'Cookie' | 'localStorage' | 'memory';
  
  /** 
   * 存储项获取
   * @param key 键名
   * @returns 存储项值
   */
  getItem: (key: string) => any;
  
  /** 
   * 存储项设值
   * @param key 键名
   * @param value 值
   * @param end 过期时间（可选）
   */
  setItem: (key: string, value: any, end?: any) => void;
  
  /** 
   * 移除存储项
   * @param key 键名
   * @param path 路径（可选）
   * @param domain 域名（可选）
   */
  removeItem: (key: string, path?: string, domain?: string) => void;
  
  /** 
   * 判断存储项是否存在
   * @param key 键名
   * @returns 是否存在
   */
  hasItem: (key: string) => boolean;
  
  /** 
   * 获取存储中所有key值
   * @returns 键名数组
   */
  getKeys: () => string[];
}
