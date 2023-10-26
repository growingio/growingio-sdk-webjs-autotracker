export interface StorageType {
  // 存储类型
  type: 'Cookie' | 'localStorage' | 'memory';
  // 存储项获取
  getItem: (key: string) => any;
  // 存储项设值
  setItem: (key: string, value: any, end?: any) => void;
  // 移除存储项
  removeItem: (key: string, path?: string, domain?: string) => void;
  // 判断存储项是否存在
  hasItem: (key: string) => boolean;
  // 获取存储中所有key值
  getKeys: () => string[];
}
