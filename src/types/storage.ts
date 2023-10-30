export interface StorageType {
  type: 'Cookie' | 'localStorage' | 'memory';
  domain?: string;
  getItem: (key: string) => any;
  setItem: (key: string, value: any, end?: any) => void;
  removeItem: (key: string, path?: string, domain?: string) => void;
  hasItem: (key: string) => boolean;
  getKeys: () => string[];
}
