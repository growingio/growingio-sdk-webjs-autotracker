// 特殊顶级域名正则
export const SPECIAL_TOP_DOMAIN_REG =
  /^(\.ac\.|\.br\.|\.co\.|\.com\.|\.edu\.|\.gov\.|\.org\.|\.net\.)/;
// 曝光事件属性正则
export const IMP_ATTRIBUTES_REG = /^data-gio-track-[a-z]+$/i;
// 曝光事件dataset属性正则
export const IMP_DATASET_REG = /^gioTrack(.+)/;
// 埋点事件名正则
export const EVENT_NAME_REG = /^[a-zA-Z][a-zA-Z0-9_]{0,99}$/;
// sessionKey正则
export const SESSION_KEY_REG = /.+_gdp_session_id_.{36}/;
