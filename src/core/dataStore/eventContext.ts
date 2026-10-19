import { EventIdentitySnapshot } from '@/types/internal/events';
import { EMBEDDED_REQUIRED_FIELDS, IGNORE_PARAMS } from '@/constants/config';
import { includes, isArray, unset } from '@/utils/glodash';

/** 所有配置来源共用同一规则，关键打通字段始终继承宿主值。 */
export const normalizeEmbeddedIgnoreFields = (fields: any): string[] =>
  isArray(fields)
    ? fields.filter(
        (field: any) =>
          typeof field === 'string' &&
          !includes(EMBEDDED_REQUIRED_FIELDS, field)
      )
    : [];

/** 新配置（包括空数组）优先于旧配置，只约束宿主参数继承。 */
export const getEmbeddedIgnoreFields = (tracker: any): string[] => {
  const configured = tracker?.embeddedAdapter?.ignoreFields;
  const ignored = isArray(configured)
    ? configured
    : isArray(tracker?.embeddedIgnore)
      ? tracker.embeddedIgnore
      : [];
  return normalizeEmbeddedIgnoreFields(ignored);
};

/** 上下文合并完成后统一应用身份与字段约束。trackingId 始终作为内部路由标记保留。 */
export const finalizeEventContext = (
  event: any,
  tracker: any,
  identity?: EventIdentitySnapshot
) => {
  if (identity) {
    event.deviceId = identity.deviceId;
    event.userId = identity.userId;
    event.userKey = identity.userKey;
  }
  const ignoreFields = isArray(tracker?.ignoreFields)
    ? tracker.ignoreFields
    : [];
  ignoreFields.forEach((field: string) => {
    if (includes(IGNORE_PARAMS, field)) unset(event, field);
  });
  return event;
};
