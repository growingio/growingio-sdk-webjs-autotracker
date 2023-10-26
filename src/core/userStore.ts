import EMIT_MSG from '@/constants/emitMsg';
import { GrowingIOType } from '@/types/growingIO';
import { UserStoreType } from '@/types/userStore';
import { guid } from '@/utils/tools';

/**
 * 代码中与3.0测量协议字段对应关系
 * 代码定义    |  3.0测量协议定义  |  字段解释
 * ---------------------------------------------------
 * sessionId  |  sessionId      |  访问会话id
 * uid        |  deviceId       |  访问用户id(持久化)
 * userId     |  userId         |  登录用户id(持久化)
 * gioId      |  gioId          |  上一个非空的登录用户id(持久化)
 */

class UserStore implements UserStoreType {
  // 会话id在存储中的名称
  public sIdStorageName: string;
  // 访问用户id在存储中的名称
  public uidStorageName: string;
  // 登录用户id在存储中的名称
  public userIdStorageName: string;
  // 登录用户key在存储中的名称
  public userKeyStorageName: string;
  // 最后一次登录用户id在存储中的名称
  public gioIdStorageName: string;
  // 因为存储里超时的时候返回的值是空的，所以需要记住上一个值，用于发消息传准确的oldId
  // 最近的一个session
  private prevSessionId: string;
  // 最近的一个uid
  private prevUId: string;
  // 最近的一个userId
  private prevUserId: string;
  // 最近的一个userKey
  private prevUserKey: string;
  // 最近的一个gioId
  private prevGioId: string;
  constructor(public growingIO: GrowingIOType) {
    const {
      vdsConfig: { projectId },
      storage
    } = this.growingIO;
    this.sIdStorageName = `${projectId}_gdp_session_id`;
    this.uidStorageName = 'gdp_user_id_gioenc';
    this.userIdStorageName = `${projectId}_gdp_cs1_gioenc`;
    this.userKeyStorageName = `${projectId}_gdp_user_key_gioenc`;
    this.gioIdStorageName = `${projectId}_gdp_gio_id_gioenc`;
    this.growingIO.emitter.on(EMIT_MSG.OPTION_INITIALIZED, () => {
      if (storage.getItem('gr_user_id')) {
        this.transferStorage();
      }
    });
  }

  // @ts-ignore
  get sessionId() {
    const { storage } = this.growingIO;
    const storageSession = storage.getItem(this.sIdStorageName);
    // 返回空说明是新访问或者超时了
    if (!storageSession) {
      this.sessionId = guid();
      return this.sessionId;
    } else {
      return storageSession;
    }
  }

  // @ts-ignore
  set sessionId(sId: string) {
    if (!sId) {
      sId = guid();
    }
    const { storage } = this.growingIO;
    const prevId = storage.getItem(this.sIdStorageName) || this.prevSessionId;
    // sessionId默认30分钟有效期(要在初始化配置项里改才生效)
    const { sessionExpires = 30 } = this.growingIO.vdsConfig;
    storage.setItem(
      this.sIdStorageName,
      sId,
      +Date.now() + sessionExpires * 60 * 1000
    );
    if (prevId !== sId) {
      // sessionId变更时，移除cookie中所有旧的以sessionId作为key的项
      const keys = storage
        .getKeys()
        .filter((k: string) => /.+_gdp_session_id_.{36}/.test(k));
      keys.forEach((k: string) => {
        storage.removeItem(k);
      });
      // 初始化visitSent状态
      storage.setItem(this.growingIO.dataStore.visitStorageName, '');
      // 广播通知sessionId变更
      // sdk中不要对这个事件进行监听来实现补发逻辑，和小程序打通初始化的时候也会收到这个消息，但是不需要补发visit和page
      this.growingIO.emitter?.emit(EMIT_MSG.SESSIONID_UPDATE, {
        newSessionId: sId,
        oldSessionId: prevId
      });
    }
    this.prevSessionId = sId;
  }

  // @ts-ignore
  get uid() {
    const { storage } = this.growingIO;
    const storageUId = storage.getItem(this.uidStorageName);
    if (!storageUId) {
      this.uid = guid();
      return this.uid;
    } else {
      return storageUId;
    }
  }

  // @ts-ignore
  set uid(uId: string) {
    const { storage } = this.growingIO;
    const prevId = storage.getItem(this.uidStorageName) || this.prevUId;
    storage.setItem(this.uidStorageName, uId);
    // 广播通知访问用户Id变更
    if (prevId !== uId) {
      this.growingIO.emitter?.emit(EMIT_MSG.UID_UPDATE, {
        newUId: uId,
        oldUId: prevId
      });
    }
    this.prevUId = uId;
  }

  // @ts-ignore
  get userId() {
    const { storage } = this.growingIO;
    const storageUserId = storage.getItem(this.userIdStorageName);
    if (!storageUserId) {
      return '';
    } else {
      return storageUserId;
    }
  }

  // @ts-ignore
  set userId(userId: string) {
    const { storage } = this.growingIO;
    const prevId = storage.getItem(this.userIdStorageName) || this.prevUserId;
    storage.setItem(this.userIdStorageName, userId);
    // 广播通知setUserId事件
    this.growingIO.emitter?.emit(EMIT_MSG.SET_USERID, {
      newUserId: userId,
      oldUserId: prevId,
      userKey: this.userKey
    });
    // 广播通知登录用户Id变更
    if (prevId !== userId) {
      this.growingIO.emitter?.emit(EMIT_MSG.USERID_UPDATE, {
        newUserId: userId,
        oldUserId: prevId,
        userKey: this.userKey
      });
    }
    if (userId) this.gioId = userId;
    this.prevUserId = userId;
  }

  // @ts-ignore
  get userKey() {
    const { storage } = this.growingIO;
    const storageUserKey = storage.getItem(this.userKeyStorageName);
    if (!storageUserKey) {
      return '';
    } else {
      return storageUserKey;
    }
  }

  // @ts-ignore
  set userKey(userKey: string) {
    const { storage } = this.growingIO;
    const prevKey =
      storage.getItem(this.userKeyStorageName) || this.prevUserKey;
    storage.setItem(this.userKeyStorageName, userKey);
    // 广播通知setUserKey事件
    this.growingIO.emitter?.emit(EMIT_MSG.SET_USERKEY, {
      newUserKey: userKey,
      oldUserKey: prevKey,
      userId: this.userId
    });
    // 广播通知登录用户key变更
    if (prevKey !== userKey) {
      this.growingIO.emitter?.emit(EMIT_MSG.USERKEY_UPDATE, {
        newUserKey: userKey,
        oldUserKey: prevKey,
        userId: this.userId
      });
    }
    this.prevUserKey = userKey;
  }

  // @ts-ignore
  get gioId() {
    const { storage } = this.growingIO;
    const storageGioId = storage.getItem(this.gioIdStorageName);
    if (!storageGioId) {
      return '';
    } else {
      return storageGioId;
    }
  }

  // @ts-ignore
  set gioId(gioId: string) {
    const { storage } = this.growingIO;
    const prevId = storage.getItem(this.gioIdStorageName) || this.prevGioId;
    storage.setItem(this.gioIdStorageName, gioId);
    // 广播通知登录用户Id变更
    if (prevId !== gioId) {
      this.growingIO.emitter?.emit(EMIT_MSG.GIOID_UPDATE, {
        newGioId: gioId,
        oldGioId: prevId
      });
    }
    this.prevGioId = gioId;
  }

  // 兼容老saas2.0的存储，自动转
  transferStorage = () => {
    const {
      vdsConfig: { projectId },
      storage
    } = this.growingIO;
    // 获取老Saas在本地存储的deviceId
    this.uid = storage.getItem('gr_user_id') || this.uid;
    // 获取老Saas在本地存储的userId
    this.userId = storage.getItem(`${projectId}_gr_cs1`) || this.userId;
    // 移除原有老Saas的项
    storage.removeItem('gr_user_id'); // deviceId
    storage.removeItem(`${projectId}_gr_cs1`); // userId
    storage.removeItem(`${projectId}_gr_last_sent_cs1`); // 上一个userId标记
    storage.removeItem(`${projectId}_gr_last_sent_sid_with_cs1`); // 上一个带userId的session标记
    storage.removeItem(`${projectId}_gr_session_id`); // sessionId
    storage.removeItem(`${projectId}_gr_session_id_sent_vst`); // visit发送标记
    const impKey = storage.getKeys().find((k) => k.indexOf('gr_imp_') > -1);
    if (impKey) {
      storage.removeItem(impKey);
    }
  };
}

export default UserStore;
