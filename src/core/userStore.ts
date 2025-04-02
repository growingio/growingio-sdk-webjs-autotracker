import EMIT_MSG from '@/constants/emitMsg';
import { SESSION_KEY_REG } from '@/constants/regex';
import { GrowingIOType } from '@/types/growingIO';
import { UserStoreType } from '@/types/userStore';
import { find } from '@/utils/glodash';
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
const uidStorageName = 'gdp_user_id_gioenc';
class UserStore implements UserStoreType {
  // 访问用户id在存储中的名称
  public uidStorageName: string;
  // 因为存储里超时的时候返回的值是空的，所以需要记住上一个值，用于发消息传准确的oldId
  public prevIds: any;
  // 最近的一个uid
  private prevUId: string;
  constructor(public growingIO: GrowingIOType) {
    this.prevIds = {};
    this.growingIO.emitter.on(
      EMIT_MSG.OPTION_INITIALIZED,
      ({ trackingId, growingIO }) => {
        this.transferStorage(trackingId, growingIO);
      }
    );
  }

  // 获取设备Id
  getUid = () => {
    const { storage } = this.growingIO;
    const storageUId = storage.getItem(uidStorageName);
    if (!storageUId) {
      const uid = guid();
      this.setUid(uid);
      return uid;
    } else {
      return storageUId;
    }
  };

  // 设置设备Id
  setUid = (uId: string) => {
    const { storage } = this.growingIO;
    const prevId = storage.getItem(uidStorageName) || this.prevUId;
    storage.setItem(uidStorageName, uId);
    // 广播通知访问用户Id变更
    if (prevId !== uId) {
      this.growingIO.emitter?.emit(EMIT_MSG.UID_UPDATE, {
        newUId: uId,
        oldUId: prevId
      });
    }
    this.prevUId = uId;
  };

  // 获取sessionId存储key
  _getSidKey = (trackingId: string) =>
    this.growingIO.dataStore.getStorageKey(trackingId, 'sessionId');

  // 获取上一个sessionId值
  getPrevSessionId = (trackingId: string) => {
    return this.prevIds[trackingId]?.sessionId;
  };

  // 获取sessionId
  getSessionId = (trackingId: string) => {
    const { storage } = this.growingIO;
    const storageSession = storage.getItem(this._getSidKey(trackingId));
    // 返回空说明是新访问或者超时了
    if (!storageSession) {
      const sessionId = guid();
      this.setSessionId(trackingId, sessionId);
      return sessionId;
    } else {
      return storageSession;
    }
  };

  // 设置sessionId
  setSessionId = (trackingId: string, sId: string) => {
    if (!sId) {
      sId = guid();
    }
    const { storage, dataStore, emitter } = this.growingIO;
    const prevId =
      storage.getItem(this._getSidKey(trackingId)) ||
      this.getPrevSessionId(trackingId);
    // sessionId默认30分钟有效期(要在初始化配置项里改才生效)
    const { sessionExpires = 30 } = dataStore.getTrackerVds(trackingId) ?? {};
    storage.setItem(
      this._getSidKey(trackingId),
      sId,
      +Date.now() + sessionExpires * 60 * 1000
    );
    if (prevId !== sId) {
      // sessionId变更时，移除cookie中所有旧的以sessionId作为key的项
      const keys = storage
        .getKeys()
        .filter((k: string) => SESSION_KEY_REG.test(k));
      keys.forEach((k: string) => {
        storage.removeItem(k);
      });
      // 初始化visitSent状态
      storage.setItem(dataStore.getStorageKey(trackingId, 'sentSign'), '');
      // 广播通知sessionId变更
      // sdk中不要对这个事件进行监听来实现补发逻辑，和小程序打通初始化的时候也会收到这个消息，但是不需要补发visit和page
      emitter?.emit(EMIT_MSG.SESSIONID_UPDATE, {
        newSessionId: sId,
        oldSessionId: prevId,
        trackingId
      });
    }
    // 存储sessionId作为下一个比较值
    if (!this.prevIds[trackingId]) {
      this.prevIds[trackingId] = {};
    }
    this.prevIds[trackingId].sessionId = sId;
  };

  // 获取userId存储key
  _getUserIdKey = (trackingId: string) =>
    this.growingIO.dataStore.getStorageKey(trackingId, 'userId');

  // 获取上一个userId值
  getPrevUserId = (trackingId: string) => {
    return this.prevIds[trackingId]?.userId;
  };

  // 获取userId
  getUserId = (trackingId: string) => {
    const { storage } = this.growingIO;
    const storageUserId = storage.getItem(this._getUserIdKey(trackingId));
    if (!storageUserId) {
      return '';
    } else {
      return storageUserId;
    }
  };

  // 设置userId
  setUserId = (trackingId: string, userId: string) => {
    const { storage } = this.growingIO;
    const prevId =
      storage.getItem(this._getUserIdKey(trackingId)) ||
      this.getPrevUserId(trackingId);
    storage.setItem(this._getUserIdKey(trackingId), userId);
    // 广播通知setUserId事件
    this.growingIO.emitter?.emit(EMIT_MSG.SET_USERID, {
      newUserId: userId,
      oldUserId: prevId,
      userKey: this.getUserKey(trackingId),
      trackingId
    });
    // 广播通知登录用户Id变更
    if (prevId !== userId) {
      this.growingIO.emitter?.emit(EMIT_MSG.USERID_UPDATE, {
        newUserId: userId,
        oldUserId: prevId,
        userKey: this.getUserKey(trackingId),
        trackingId
      });
    }
    if (userId) {
      this.setGioId(trackingId, userId);
    }
    // 存储userId作为下一个比较值
    if (!this.prevIds[trackingId]) {
      this.prevIds[trackingId] = {};
    }
    this.prevIds[trackingId].userId = userId;
  };

  // 获取userKey存储key
  _getUserKeyKey = (trackingId: string) =>
    this.growingIO.dataStore.getStorageKey(trackingId, 'userKey');

  // 获取上一个userKey值
  getPrevUserKey = (trackingId: string) => {
    return this.prevIds[trackingId]?.userKey;
  };

  // 获取userKey
  getUserKey = (trackingId: string) => {
    const { storage } = this.growingIO;
    const storageUserKey = storage.getItem(this._getUserKeyKey(trackingId));
    if (!storageUserKey) {
      return '';
    } else {
      return storageUserKey;
    }
  };

  // 设置userKey
  setUserKey = (trackingId: string, userKey: string) => {
    const { storage } = this.growingIO;
    const prevKey =
      storage.getItem(this._getUserKeyKey(trackingId)) ||
      this.getPrevUserKey(trackingId);
    storage.setItem(this._getUserKeyKey(trackingId), userKey);
    // 广播通知setUserKey事件
    this.growingIO.emitter?.emit(EMIT_MSG.SET_USERKEY, {
      newUserKey: userKey,
      oldUserKey: prevKey,
      userId: this.getUserId(trackingId),
      trackingId
    });
    // 广播通知登录用户key变更
    if (prevKey !== userKey) {
      this.growingIO.emitter?.emit(EMIT_MSG.USERKEY_UPDATE, {
        newUserKey: userKey,
        oldUserKey: prevKey,
        userId: this.getUserId(trackingId),
        trackingId
      });
    }
    // 存储userKey作为下一个比较值
    if (!this.prevIds[trackingId]) {
      this.prevIds[trackingId] = {};
    }
    this.prevIds[trackingId].userKey = userKey;
  };

  // 获取gioId存储key
  _getGioIdKey = (trackingId: string) =>
    this.growingIO.dataStore.getStorageKey(trackingId, 'gioId');

  // 获取上一个gioId值
  getPrevGioId = (trackingId: string) => {
    return this.prevIds[trackingId]?.gioId;
  };

  // 获取gioId
  getGioId = (trackingId: string) => {
    const { storage } = this.growingIO;
    const storageGioId = storage.getItem(this._getGioIdKey(trackingId));
    if (!storageGioId) {
      return '';
    } else {
      return storageGioId;
    }
  };

  // 设置gioId
  setGioId = (trackingId: string, gioId: string) => {
    const { storage } = this.growingIO;
    const prevId =
      storage.getItem(this._getGioIdKey(trackingId)) ||
      this.getPrevGioId(trackingId);
    storage.setItem(this._getGioIdKey(trackingId), gioId);
    // 广播通知登录用户Id变更
    if (prevId !== gioId) {
      this.growingIO.emitter?.emit(EMIT_MSG.GIOID_UPDATE, {
        newGioId: gioId,
        oldGioId: prevId,
        trackingId
      });
    }
    // 存储gioId作为下一个比较值
    if (!this.prevIds[trackingId]) {
      this.prevIds[trackingId] = {};
    }
    this.prevIds[trackingId].gioId = gioId;
  };

  // 用户存储转换逻辑
  transferStorage = (trackingId: string, growingIO: GrowingIOType) => {
    const storageUId = growingIO.storage.getItem(uidStorageName);
    // 存储中没有4.x版本的deviceId，但有老saas的deviceId，认为是sdk升级场景，直接迁移数据
    if (
      !storageUId &&
      trackingId === growingIO.trackingId &&
      this.growingIO.storage.getItem('gr_user_id')
    ) {
      const {
        vdsConfig: { projectId },
        storage
      } = growingIO;
      // 获取老Saas在本地存储的deviceId
      const grUid = storage.getItem('gr_user_id');
      // 没有设备Id时直接继续不生成，后续逻辑会触发设新值
      if (grUid) {
        this.setUid(grUid);
      }
      // 获取老Saas在本地存储的userId
      const userId =
        storage.getItem(`${projectId}_gr_cs1`) || this.getUserId(trackingId);
      if (userId) {
        this.setUserId(trackingId, userId);
      }
      // 移除原有老Saas的项
      storage.removeItem('gr_user_id'); // deviceId
      storage.removeItem(`${projectId}_gr_cs1`); // userId
      storage.removeItem(`${projectId}_gr_last_sent_cs1`); // 上一个userId标记
      storage.removeItem(`${projectId}_gr_last_sent_sid_with_cs1`); // 上一个带userId的session标记
      storage.removeItem(`${projectId}_gr_session_id`); // sessionId
      storage.removeItem(`${projectId}_gr_session_id_sent_vst`); // visit发送标记
      const impKey = find(storage.getKeys(), (k) => k.indexOf('gr_imp_') > -1);
      if (impKey) {
        storage.removeItem(impKey);
      }
    }
  };
}

export default UserStore;
