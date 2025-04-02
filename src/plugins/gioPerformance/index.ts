/**
 * 名称：性能采集插件
 * 用途：用于采集web基本性能信息和错误信息。
 */
import { GrowingIOType } from '@/types/growingIO';
import { limitObject } from '@/utils/tools';
import EMIT_MSG from '@/constants/emitMsg';
import Exception from './exception';
import Monitor from './monitor';
import Network from './network';

let ut;
export default class GioPerformance {
  public pluginVersion: string;
  public monitor: any;
  public exception: any;
  public network: any;
  private inited = false;
  // 缓存队列，SDK初始化完成之后再根据性能的配置项发送数据
  private cacheQueue: any[] = [];
  constructor(public growingIO: GrowingIOType) {
    this.pluginVersion = '__PLUGIN_VERSION__';
    ut = this.growingIO.utils;
    // 采集SDK初始化完成之前后才加载好APM
    if (this.growingIO.gioSDKInitialized) {
      this.init();
    } else {
      // 采集SDK初始化完成之前就加载好APM
      this.growingIO.emitter.on(EMIT_MSG.SDK_INITIALIZED, () => {
        this.init();
      });
    }
    // 采集开关从关闭到打开时要把队列中存的启动和错误都发出去
    this.growingIO.emitter?.on(
      EMIT_MSG.OPTION_CHANGE,
      ({ optionName, optionValue }) => {
        if (optionName === 'dataCollect' && optionValue === true) {
          this.sendCacheQuene();
        }
      }
    );
  }

  // 根据初始化配置项确认性能监控模块是否开启
  init = () => {
    if (this.inited) return;
    const { performance, dataCollect } = this.growingIO.vdsConfig;
    if (performance.monitor) {
      this.monitor = new Monitor(this.growingIO);
    }
    if (performance.exception) {
      this.exception = new Exception(this.growingIO);
    }
    // network模块直接初始化，根据exception和network的配置内部控制事件的发送
    this.network = new Network(this.growingIO, performance);
    // SDK初始化完成发送缓存队列
    if (dataCollect) {
      this.sendCacheQuene();
    }
    this.inited = true;
  };

  // 发送缓存队列
  sendCacheQuene = () => {
    if (!ut.isEmpty(this.cacheQueue)) {
      this.cacheQueue.forEach((o: any) => {
        this.buildPerfEvent(o.eventName, o.attributes, o.eventTime);
      });
      this.cacheQueue = [];
    }
  };

  // 构建各种性能事件
  buildPerfEvent = (
    eventName: string,
    attributes: any,
    eventTime?: string | number
  ) => {
    const {
      dataStore: { eventContextBuilder, eventConverter },
      vdsConfig,
      gioSDKInitialized
    } = this.growingIO;
    // SDK没初始化完成或初始化关闭采集开关的事件先存起来，等SDK初始化完成或开启采集开关再发
    if (!gioSDKInitialized || !vdsConfig.dataCollect) {
      this.cacheQueue.push({
        eventName,
        attributes,
        eventTime: eventTime || +Date.now()
      });
      return;
    }
    // 处理过长的小数
    ut.forEach(attributes, (v, k) => {
      if (ut.isNaN(v) || ut.isNil(v)) {
        attributes[k] = 0;
      }
      attributes[k] = ut.fixed(v, 0);
    });
    const event = {
      eventType: 'CUSTOM',
      eventName,
      ...eventContextBuilder()
    };
    event.attributes = limitObject({
      ...(event.attributes ?? {}),
      ...attributes
    });
    if (eventTime) {
      event.timestamp = eventTime;
    }
    eventConverter(event);
  };
}
