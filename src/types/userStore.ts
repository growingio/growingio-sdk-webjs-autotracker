export interface UserStoreType {
    // 会话id在存储中的名称
  sIdStorageName: string;
  // 访问用户id在存储中的名称
  uidStorageName: string;
  // 登录用户id在存储中的名称
  userIdStorageName: string;
  // 最后一次登录用户id在存储中的名称
  gioIdStorageName: string;
  // 用户访问会话id
  sessionId: string;
  // 访问用户id（系统设置持久性存储）
  uid: string;
  // 登录用户id（客户设置持久性存储）
  userId: string;
  // idMapping userKey（客户设置持久性存储）
  userKey: string;
  // 最后一次登录用户id（持久性存储）
  gioId: string;
}
