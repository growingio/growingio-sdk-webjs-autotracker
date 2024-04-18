import { GrowingIOType } from '@/types/growingIO';
import { forEach, includes, isEmpty, unset } from '@/utils/glodash';
import { niceTry } from '@/utils/tools';

class EventContextBuilder {
  public minpExtraParams: any;
  constructor(public growingIO: GrowingIOType) {
    this.minpExtraParams = {};
  }

  // 通用字段组装
  main = (trackingId?: string) => {
    // 预置事件或者默认就是发给主实例的事件不需要传trackingId
    if (!trackingId) {
      trackingId = this.growingIO.trackingId;
    }
    const { sdkVersion, useEmbeddedInherit, userStore, dataStore } =
      this.growingIO;
    const { path, query, title } = dataStore.currentPage;
    const trackerVds = dataStore.getTrackerVds(trackingId);
    const lpv = niceTry(() => dataStore.lastPageEvent[trackingId]) ?? {};
    // 事件主要内容组装
    let context: any = {
      appVersion: trackerVds.version,
      dataSourceId: trackerVds.dataSourceId,
      deviceId: userStore.getUid(),
      domain:
        trackingId === useEmbeddedInherit
          ? trackerVds.appId
          : window.location.host,
      language: navigator.language,
      path,
      platform: trackerVds.platform,
      query,
      referralPage: dataStore.currentPage.getReferralPage(trackingId) || '',
      screenHeight: window.screen.height,
      screenWidth: window.screen.width,
      sdkVersion,
      sessionId: userStore.getSessionId(trackingId),
      timestamp: +Date.now(),
      timezoneOffset: new Date().getTimezoneOffset(),
      // 除visit,page事件外，其他事件都用lastpage中的title以保持一致
      title: lpv.title ?? title ?? niceTry(() => document.title.slice(0, 255)),
      userId: userStore.getUserId(trackingId)
    };
    // 开启IDMapping的时候才把userKey带上
    if (trackerVds.idMapping) {
      context.userKey = userStore.getUserKey(trackingId);
    } else {
      context.userKey = '';
    }

    // 过滤忽略字段（打通时忽略字段可能会失效，字段会继续被小程序覆盖）
    if (!isEmpty(trackerVds.ignoreFields)) {
      (trackerVds.ignoreFields as string[]).forEach((o) => {
        unset(context, o);
      });
    }

    /**
     * 以下字段可以忽略打通时的强制赋值(忽略字段时，原先web产生的context中有值的取原context值，没有则该字段在事件中为空会被舍弃)
     * ['domain', 'platform', // 就告诉客户只能传这2个，剩下的虽然有能力也忽略，但是尽量不告诉，可以在小程序不加就完了
     * 注意dataSourceId慎用，单独搞web项目的时候会导致web只有page没有visit，跳出率计算有问题
     * 'dataSourceId', 'appChannel', 'deviceBrand', 'deviceType', 'language', 'networkState', 'deviceModel'
     *'operatingSystem', 'platformVersion', 'screenHeight', 'screenWidth']
     */
    // 小程序打通时，优先使用打通的字段
    if (
      useEmbeddedInherit &&
      trackingId === useEmbeddedInherit &&
      !isEmpty(this.minpExtraParams)
    ) {
      const originContext = { ...context };
      forEach({ ...context, ...this.minpExtraParams }, (_, k) => {
        if (includes(trackerVds.embeddedIgnore, k)) {
          // 存在打通忽略的字段时，不进行覆盖，取原值（但是domain要特殊处理）
          context[k] = originContext[k];
          if (k === 'domain') {
            context[k] = window.location.host;
          }
        } else {
          // 不存在需要忽略的打通字段时，用小程序参数进行覆盖，原值兜底
          context[k] = this.minpExtraParams[k] ?? context[k];
        }
      });
    }
    context.trackingId = trackingId;
    return context;
  };
}

export default EventContextBuilder;
