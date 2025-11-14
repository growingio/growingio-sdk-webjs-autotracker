/**
 * 名称：多实例插件
 * 用途：用于提供多实例以向指定项目和数据源发数的插件。
 */

import { EXTEND_EVENT } from '@/types/internal/events';
import { GrowingIOType } from '@/types/internal/growingIO';
import { hashCode, niceTry } from '@/utils/tools';
import { includes, isString, toString, unset } from '@/utils/glodash';

export default class GioMultipleInstances {
  public pluginVersion: string;
  constructor(public growingIO: GrowingIOType) {
    this.pluginVersion = '__PLUGIN_VERSION__';
    // 实例化完成自动重写部分代码以实现多实例功能
    this.rewriteDataStore();
    // 挂载子实例集合对象
    if (!this.growingIO.subInstance) {
      this.growingIO.subInstance = {};
    }
  }

  // 判断当前trackingId实例类型，为主实例还是子实例
  getTrackerType = (trackingId: string, growingIO: GrowingIOType): number => {
    return !growingIO.trackingId || growingIO.trackingId === trackingId ? 1 : 0;
  };

  // 重写dataStore中的部分内容
  rewriteDataStore = () => {
    // 获取采集的配置和通用埋点属性
    this.growingIO.dataStore.getTrackerVds = (trackingId: string) => {
      if (this.growingIO.trackingId === trackingId) {
        const vds = { ...this.growingIO.vdsConfig };
        unset(vds, 'subInstance');
        return vds;
      } else {
        return this.growingIO.subInstance[trackingId];
      }
    };

    // 获取存储key前缀
    this.growingIO.dataStore.getKeyPrefix = (trackingId: string) => {
      const { vdsConfig, subInstance } = this.growingIO;
      if (
        !this.growingIO.trackingId ||
        this.growingIO.trackingId === trackingId
      ) {
        return vdsConfig.projectId;
      } else {
        const subVdsConfig: any = subInstance[trackingId] || {};
        return toString(
          hashCode(
            '' + subVdsConfig.projectId + subVdsConfig.dataSourceId,
            true
          )
        );
      }
    };

    // 初始化实例配置的方法
    this.growingIO.dataStore.initTrackerOptions = (options: any) => {
      const trackerOptions = this.growingIO.dataStore.initOptions(options);
      const trackerType = this.getTrackerType(
        options.trackingId,
        this.growingIO
      );
      if (trackerType) {
        // 当前初始化主实例时给主实例赋值trackingId
        this.growingIO.trackingId = options.trackingId;
        // 主实例的配置直接挂在growingIO上
        this.growingIO.vdsConfig = trackerOptions;
        // 把vds的信息挂到全局，圈选需要用
        window[this.growingIO.vdsName] = trackerOptions;
      } else {
        // 子实例无效的配置项删除
        unset(trackerOptions, [
          'cookieDomain',
          'debug',
          'forceLogin',
          'hashtag',
          'originalSource',
          'performance',
          'rewriteQuery',
          'storageType',
          'subInstance',
          'touch'
        ]);
        // 子实例的配置挂在subInstance下，以trackingId作为key值存储
        this.growingIO.subInstance[options.trackingId] = trackerOptions;
        window[this.growingIO.vdsName].subInstance = {
          ...(window[this.growingIO.vdsName].subInstance ?? {}),
          [options.trackingId]: trackerOptions
        };
      }
      trackerOptions.trackingId = options.trackingId;
      return trackerOptions;
    };

    // 多实例时处理复制发送
    const originFunction = this.growingIO.dataStore.eventConverter;
    const self = this;
    this.growingIO.dataStore.eventConverter = function (...args) {
      const event: EXTEND_EVENT = args[0];
      // 埋点事件使用合并后的发送目标发送
      if (event.eventType === 'CUSTOM') {
        const sendTo = [event.trackingId];
        niceTry(() => {
          event['&&sendTo'].forEach((s) => {
            // 合法且不重复的实例
            if (
              isString(s) &&
              self.growingIO.dataStore.getTrackerVds(s) &&
              !includes(sendTo, s)
            ) {
              sendTo.push(s);
            }
          });
        });
        unset(event, '&&sendTo');
        sendTo.forEach((trackingId: string) => {
          const { eventContextBuilder } = self.growingIO.dataStore;
          const newEvent = {
            ...event,
            ...eventContextBuilder(trackingId, event.trackingId !== trackingId)
          };
          newEvent.attributes = {
            ...newEvent.attributes,
            ...event.attributes
          };
          originFunction.call(this, newEvent);
        });
      } else {
        // 其他事件直接发给指定调用实例
        originFunction.call(this, event);
      }
    };
  };

  onSendBefore = ({ requestData: event }: any) => {
    // 不是主实例的事件由多实例插件来提交
    if (event.trackingId !== this.growingIO.trackingId) {
      // 子实例和移动端打通时不再发送数据
      if (event.trackingId === this.growingIO.useHybridInherit) {
        return false;
      }
      this.growingIO.uploader.sendEvent(event);
    }
  };
}
