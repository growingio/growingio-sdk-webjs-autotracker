import BaseDataStore from '@/core/dataStore';
import { GrowingIOType } from '@/types/growingIO';
import { forEach, head, isEmpty, isNil } from '@/utils/glodash';

class DataStore extends BaseDataStore {
  constructor(public growingIO: GrowingIOType) {
    super(growingIO);
  }
  // 事件的格式转换(同时移除无值的字段)
  eventConverter = (event: any) => {
    const { vdsConfig, dataStore, uploader } = this.growingIO;
    // 开启数据采集时才会处理事件、累计全局计数并将合成的事件提交到请求队列
    if (vdsConfig.dataCollect) {
      if (event.trackingId === this.growingIO.trackingId) {
        event.globalSequenceId = dataStore.gsid;
        event.eventSequenceId = dataStore.esid[event.eventType] || 1;
      }
      const convertedEvent: any = {};
      forEach(event, (v: any, k: string) => {
        /**
         * cdp环境下字段的转换
         */
        // 无埋点element的转换
        if (k === 'element') {
          const target: object = head(v) ?? {};
          forEach(target, (ev: any, ek: string) => {
            // 判断属性是否存在，同时忽略无值属性（放入convertedEvent中）
            if (!isEmpty(ev) || ev === 0) {
              convertedEvent[ek] = ev;
            }
          });
        } else if ((!isEmpty(v) && !isNil(v)) || v === 0) {
          // 判断属性是否存在，同时忽略无值属性
          convertedEvent[k] = v;
        }
      });
      if (event.trackingId === this.growingIO.trackingId) {
        // 全局事件计数加1
        this.growingIO.dataStore.gsid += 1;
        // 请求事件计数加1
        this.growingIO.dataStore.esid = {
          ...this.growingIO.dataStore.esid,
          [convertedEvent.eventType]:
            (this.growingIO.dataStore.esid[convertedEvent.eventType] || 1) + 1
        };
      }
      this.growingIO.emitter?.emit('onComposeAfter', {
        composedEvent: { ...convertedEvent }
      });
      // 提交请求队列
      if (event.trackingId === this.growingIO.trackingId) {
        uploader.commitRequest(convertedEvent);
      }
    } else if (event.eventType === 'VISIT') {
      this.lastVisitEvent = event;
    }
  };
}

export default DataStore;
