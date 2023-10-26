// IP地址正则
export const IPReg =
  /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/i;
// 特殊顶级域名正则
export const SpecialTopDomainReg =
  /^(\.ac\.|\.br\.|\.co\.|\.com\.|\.edu\.|\.gov\.|\.org\.|\.net\.)/;
// 曝光事件属性正则
export const IMPAttributesReg = /^data-gio-track-[a-z]+$/i;
// 曝光事件dataset属性正则
export const IMPDatasetReg = /^gioTrack(.+)/;
// 埋点事件名正则
export const EventNameReg = /^[a-zA-Z][a-zA-Z0-9_]{0,99}$/;
