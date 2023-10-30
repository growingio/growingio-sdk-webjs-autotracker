import { GrowingIOType } from '@/types/growingIO';
import { forEach, includes, isEmpty, unset } from '@/utils/glodash';
import { niceTry } from '@/utils/tools';

class EventContextBuilder {
  public minpExtraParams: any;
  constructor(public growingIO: GrowingIOType) {
    this.minpExtraParams = {};
  }

  // 通用字段组装
  main = () => {
    const {
      sdkVersion,
      useEmbeddedInherit,
      vdsConfig,
      userStore,
      dataStore,
      trackingId
    } = this.growingIO;
    const { path, query } = dataStore.currentPage;
    // 事件主要内容组装
    let context: any = {
      appVersion: vdsConfig.version,
      dataSourceId: vdsConfig.dataSourceId,
      deviceId: userStore.uid,
      domain: useEmbeddedInherit ? vdsConfig.appId : window.location.host,
      gioId: userStore.gioId,
      language: navigator.language,
      path,
      platform: vdsConfig.platform,
      query,
      referralPage: dataStore.lastPageEvent?.referralPage || '',
      screenHeight: window.screen.height,
      screenWidth: window.screen.width,
      sdkVersion,
      sessionId: userStore.sessionId,
      timestamp: +Date.now(),
      title: niceTry(() => document.title.slice(0, 255)) ?? '',
      userId: userStore.userId
    };
    // 开启IDMapping的时候才把userKey带上
    if (vdsConfig.enableIdMapping) {
      context.userKey = userStore.userKey;
    }

    // 过滤忽略字段（打通时忽略字段可能会失效，字段会继续被小程序覆盖）
    if (!isEmpty(vdsConfig.ignoreFields)) {
      (vdsConfig.ignoreFields as string[]).forEach((o) => {
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
    if (useEmbeddedInherit && !isEmpty(this.minpExtraParams)) {
      const originContext = { ...context };
      forEach({ ...context, ...this.minpExtraParams }, (_, k) => {
        if (includes(vdsConfig.embeddedIgnore, k)) {
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
    // 此时可能存在数据为空的字段，在数据组装完成后由转换方法移除空值字段
    return context;
  };
}

export default EventContextBuilder;
