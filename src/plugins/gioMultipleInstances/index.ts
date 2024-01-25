/**
 * 名称：多实例插件
 * 用途：用于提供多实例以向指定项目和数据源发数的插件。
 */

import { GrowingIOType } from '@/types/growingIO';
import { hashCode } from '@/utils/tools';
import { toString, unset } from '@/utils/glodash';
import EMIT_MSG from '@/constants/emitMsg';

export default class GioMultipleInstances {
  public subTrackingIds: string[];
  constructor(public growingIO: GrowingIOType) {
    this.subTrackingIds = [];
    this.growingIO.emitter.on(EMIT_MSG.OPTION_INITIALIZED, ({ trackingId }) => {
      // 是主实例
      if (
        !this.growingIO.trackingId ||
        trackingId === this.growingIO.trackingId
      ) {
        // 自动重写部分代码以实现多实例功能
        this.rewriteDataStore();
      }
      // 是子实例
      if (
        this.growingIO.trackingId &&
        this.growingIO.trackingId !== trackingId
      ) {
        // 把所有已初始化过的子实例trackingId保存下来方便预定义事件和无埋点事件广播时调用
        this.subTrackingIds.push(trackingId);
      }
    });
  }

  // 判断当前trackingId实例类型，为主实例还是子实例
  getTrackerType = (trackingId: string, growingIO: GrowingIOType): number => {
    return !growingIO.trackingId || growingIO.trackingId === trackingId ? 1 : 0;
  };

  // 重写dataStore中的部分内容
  rewriteDataStore = () => {
    // 挂载子实例集合对象
    this.growingIO.subInstance = {};

    // 获取采集实例
    this.growingIO.dataStore.getTracker = (trackingId: string) => {
      return this.growingIO.trackingId === trackingId
        ? this.growingIO
        : this.growingIO.subInstance[trackingId];
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
        const subVdsConfig: any = subInstance[trackingId]?.vdsConfig || {};
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
          'performance',
          'storageType'
        ]);
        // 子实例的配置挂在subInstance下，以trackingId作为key值存储
        this.growingIO.subInstance[options.trackingId] = {
          vdsConfig: trackerOptions,
          generalProps: {}
        };
        window[this.growingIO.vdsName].subInstance = {
          ...(window[this.growingIO.vdsName].subInstance ?? {}),
          [options.trackingId]: trackerOptions
        };
      }
      trackerOptions.trackingId = options.trackingId;
      return trackerOptions;
    };
  };

  onSendBefore = ({ requestData: event }: any) => {
    // 不是主实例的事件由多实例插件来提交
    if (event.trackingId !== this.growingIO.trackingId) {
      this.growingIO.uploader.sendEvent(event);
    }
  };
}
