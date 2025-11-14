import { GrowingIOType } from './growingIO';

/**
 * 用户存储类型接口
 * 
 * 定义了SDK中用户相关信息存储的结构和方法
 */
export interface UserStoreType {
  /** 访问用户id在存储中的名称 */
  uidStorageName: string;
  
  /** 存储上一个各种id的存储对象（按trackingId作为key，值为各种id） */
  prevIds: {
    [trackingId: string]: string;
  };
  
  /** 
   * 获取设备Id
   * @returns 设备ID
   */
  getUid: () => string;
  
  /** 
   * 设置设备Id
   * @param uId 设备ID
   */
  setUid: (uId: string) => void;
  
  /** 
   * 获取sessionId
   * @param trackingId 跟踪ID
   * @returns 会话ID
   */
  getSessionId: (trackingId: string) => string;
  
  /** 
   * 设置sessionId
   * @param trackingId 跟踪ID
   * @param sId 会话ID
   */
  setSessionId: (trackingId: string, sId: string) => void;
  
  /** 
   * 获取userId
   * @param trackingId 跟踪ID
   * @returns 用户ID
   */
  getUserId: (trackingId: string) => string;
  
  /** 
   * 设置userId
   * @param trackingId 跟踪ID
   * @param userId 用户ID
   */
  setUserId: (trackingId: string, userId: string) => void;
  
  /** 
   * 获取userKey
   * @param trackingId 跟踪ID
   * @returns 用户密钥
   */
  getUserKey: (trackingId: string) => string;
  
  /** 
   * 设置userKey
   * @param trackingId 跟踪ID
   * @param userKey 用户密钥
   */
  setUserKey: (trackingId: string, userKey: string) => void;
  
  /** 
   * 获取gioId
   * @param trackingId 跟踪ID
   * @returns GrowingIO ID
   */
  getGioId: (trackingId: string) => string;
  
  /** 
   * 设置gioId
   * @param trackingId 跟踪ID
   * @param gioId GrowingIO ID
   */
  setGioId: (trackingId: string, gioId: string) => void;
  
  /** 
   * 老saas存储兼容
   * @param trackingId 跟踪ID
   * @param growingIO GrowingIO实例
   */
  transferStorage: (trackingId: string, growingIO: GrowingIOType) => void;
}
