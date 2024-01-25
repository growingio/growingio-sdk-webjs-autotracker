export default {
  OPTION_INITIALIZED: 'OPTION_INITIALIZED', // SDK初始化完成发送事件之前
  SDK_INITIALIZED: 'SDK_INITIALIZED', // SDK初始化完成并发送首次visit和page后
  OPTION_CHANGE: 'OPTION_CHANGE', // 设置变更事件
  UID_UPDATE: 'UID_UPDATE', // uId（设备Id）变更事件
  USERID_UPDATE: 'USERID_UPDATE', // userId变更事件
  USERKEY_UPDATE: 'USERKEY_UPDATE', // userKey变更事件
  GIOID_UPDATE: 'GIOID_UPDATE', // gioId变更事件
  SESSIONID_UPDATE: 'SESSIONID_UPDATE', // sessionId变更事件
  SET_USERID: 'SET_USERID', // setUserId事件
  SET_USERKEY: 'SET_USERKEY', // setUserKey事件
  UN_EXECUTE_CALL: 'UN_EXECUTE_CALL', // SDK加载完成但没有初始化时的调用事件
  ON_INSTALL: 'ON_INSTALL', // 插件生命周期：插件被正确加载
  ON_ERROR: 'ON_ERROR', // 插件生命周期：插件执行错误
  ON_COMPOSE_BEFORE: 'ON_COMPOSE_BEFORE', // 插件生命周期：构建事件前
  ON_COMPOSE_AFTER: 'ON_COMPOSE_AFTER', // 插件生命周期：构建事件后
  ON_SEND_BEFORE: 'ON_SEND_BEFORE', // 插件生命周期：发送事件前
  ON_SEND_AFTER: 'ON_SEND_AFTER' // 插件生命周期：发送事件后
};
