/**
 * 数据加密插件类型定义
 * 
 * 包含数据加密插件使用的类型定义
 */

/**
 * 压缩配置选项
 * 
 * 定义了数据压缩的相关配置选项
 */
export interface CompressOptions {
  /** 是否启用压缩 */
  enabled?: boolean;
  
  /** 压缩算法类型 */
  algorithm?: 'gzip' | 'deflate' | 'lz-string';
  
  /** 压缩级别 */
  level?: number;
  
  /** 其他自定义选项 */
  [key: string]: any;
}

/**
 * 压缩上下文字典
 * 
 * 用于存储压缩过程中使用的字典映射
 */
export interface CompressContextDictionary {
  /** 字典键值对 */
  [key: string]: number;
}

/**
 * 压缩上下文数据
 * 
 * 定义了压缩过程中的上下文数据结构
 */
export interface CompressContext {
  /** 字典 */
  dictionary: CompressContextDictionary;
  
  /** 待创建的字典项 */
  dictionaryToCreate: CompressContextDictionary;
  
  /** 当前上下文字符 */
  context_c: string;
  
  /** 当前上下文字符串 */
  context_wc: string;
  
  /** 当前上下文词 */
  context_w: string;
  
  /** 扩展阈值 */
  enlargeIn: number;
  
  /** 字典大小 */
  dictSize: number;
  
  /** 位数 */
  numBits: number;
  
  /** 数据数组 */
  data: any[];
  
  /** 数据值 */
  data_val: number;
  
  /** 数据位置 */
  data_position: number;
}