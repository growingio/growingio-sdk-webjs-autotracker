/**
 * 名称：CDP自定义埋点插件
 * 用途：用于提供CDP环境自定义埋点的事件构建方法。
 */
import { GioCustomTrackingType, ResourceItemType } from '@/types/plugins';
import { GrowingIOType } from '@/types/growingIO';
import {
  isArray,
  isEmpty,
  isFunction,
  isNil,
  isObject,
  isString,
  keys,
  toString,
  unset
} from '@/utils/glodash';
import { eventNameValidate, limitObject } from '@/utils/tools';

export default class GioCustomTracking implements GioCustomTrackingType {
  constructor(public growingIO: GrowingIOType) {}

  // 获取合法的items字段
  getValidResourceItem = (o: { id: string; key: string; attributes?: any }) => {
    if (o && isObject(o) && o.id && o.key) {
      const validResourceItem: any = {
        id: isString(o.id) ? o.id : toString(o.id),
        key: isString(o.key) ? o.key : toString(o.key)
      };
      if (o.attributes) {
        validResourceItem.attributes = o.attributes;
      }
      return validResourceItem;
    } else {
      return undefined;
    }
  };

  // 获取动态属性的值
  getDynamicAttributes = (properties: any) => {
    if (!isNil(properties)) {
      keys(properties).forEach((k: string) => {
        if (isFunction(properties[k])) {
          properties[k] = properties[k]();
        } else if (isObject(properties[k])) {
          unset(properties, k);
        } else if (!isArray(properties[k])) {
          properties[k] = toString(properties[k]);
        }
      });
    }
    return properties;
  };

  // 构建自定义埋点事件(Saas、CDP共用)
  buildCustomEvent = (
    name: string,
    properties: { [key: string]: string },
    resourceItem?: ResourceItemType,
    props?: any
  ) => {
    eventNameValidate(name, () => {
      const {
        dataStore: { eventContextBuilder, eventConverter, currentPage }
      } = this.growingIO;
      let event = {
        eventType: 'CUSTOM',
        eventName: name,
        pageShowTimestamp: currentPage?.time,
        attributes: limitObject(
          this.getDynamicAttributes(
            isObject(properties) && !isEmpty(properties)
              ? properties
              : undefined
          )
        ),
        resourceItem: limitObject(this.getValidResourceItem(resourceItem)),
        ...eventContextBuilder()
      };
      if (!isEmpty(props)) {
        event = { ...event, ...props };
      }
      eventConverter(event);
    });
  };

  // 构建用户变量事件(CDP)
  buildUserAttributesEvent = (
    attributes: { [key: string]: string },
    props?: any
  ) => {
    const {
      dataStore: { eventContextBuilder, eventConverter }
    } = this.growingIO;
    let event = {
      eventType: 'LOGIN_USER_ATTRIBUTES',
      attributes: limitObject(attributes),
      ...eventContextBuilder()
    };
    if (!isEmpty(props)) {
      event = { ...event, ...props };
    }
    eventConverter(event);
  };
}
