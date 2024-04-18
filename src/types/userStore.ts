import { GrowingIOType } from './growingIO';

export interface UserStoreType {
  // 访问用户id在存储中的名称
  uidStorageName: string;
  // 存储上一个各种id的存储对象（按trackingId作为key，值为各种id）
  prevIds: {
    [trackingId: string]: string;
  };
  // 获取设备Id
  getUid: () => string;
  // 设置设备Id
  setUid: (uId: string) => void;
  // 获取sessionId
  getSessionId: (trackingId: string) => string;
  // 设置sessionId
  setSessionId: (trackingId: string, sId: string) => void;
  // 获取userId
  getUserId: (trackingId: string) => string;
  // 设置userId
  setUserId: (trackingId: string, userId: string) => void;
  // 获取userKey
  getUserKey: (trackingId: string) => string;
  // 设置userKey
  setUserKey: (trackingId: string, userKey: string) => void;
  // 获取gioId
  getGioId: (trackingId: string) => string;
  // 设置gioId
  setGioId: (trackingId: string, gioId: string) => void;
  // 老saas存储兼容
  transferStorage: (trackingId: string, growingIO: GrowingIOType) => void;
}
