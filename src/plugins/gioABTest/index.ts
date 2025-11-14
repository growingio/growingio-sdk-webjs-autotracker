/**
 * 名称：ABTest插件
 * 用途：用于提供自动获取AB实验数据和上报实验命中的插件。
 */
import { initGlobalStorage } from '@/core/storage';
import { GrowingIOType } from '@/types/internal/growingIO';
import {
  isEmpty,
  isNaN,
  isNumber,
  isObject,
  isString,
  keys,
  startsWith,
  toString,
  unset
} from '@/utils/glodash';
import {
  consoleText,
  hashCode,
  limitObject,
  niceCallback,
  niceTry,
  queryStringify
} from '@/utils/tools';
import EMIT_MSG from '@/constants/emitMsg';

const ABTEST_SIGN_REG = /^\d+_gdp_abt_sign$/;
const ABTEST_DATA_REG = /^\d+_gdp_abtd$/;

export default class GioABTest {
  public pluginVersion: string;
  public options: any;
  // 独立存储
  public abtStorage: any;
  // 请求间隔时长
  public requestInterval: number;
  // 请求超时时长
  public requestTimeout: number;
  // 分流服务请求地址
  public url: any;
  // 接口重试计数
  public retryCount: number;
  // 标记当前是否为新访问设备
  public newDevice: boolean;
  constructor(public growingIO: GrowingIOType) {
    this.pluginVersion = '__PLUGIN_VERSION__';
    this.abtStorage = initGlobalStorage({ storageType: 'localstorage' });
    this.growingIO.getABTest = this.getABTest;
    const { emitter } = this.growingIO;
    emitter.on(EMIT_MSG.OPTION_INITIALIZED, () => {
      const {
        abServerUrl = 'https://ab.growingio.com',
        requestInterval,
        requestTimeout
      } = this.options ?? {};
      this.timeoutCheck(requestInterval, requestTimeout);
      if (!isEmpty(abServerUrl)) {
        this.abtStorageCheck();
        this.url = {};
        if (isString(abServerUrl)) {
          this.generateUrl(this.growingIO.trackingId, abServerUrl);
        } else if (isObject(abServerUrl)) {
          keys(abServerUrl).forEach((trackingId: string) => {
            this.generateUrl(trackingId, abServerUrl[trackingId]);
          });
        }
      } else {
        consoleText(
          '如果您需要使用ABTest功能，请配置服务地址 abServerUrl!',
          'warn'
        );
      }
    });
    emitter.on(EMIT_MSG.UID_UPDATE, ({ newUId, oldUId }) => {
      const { abServerUrl = 'https://ab.growingio.com' } = this.options ?? {};
      this.newDevice = true;
      // 没有旧deviceId说明是第一次进入的新设备
      if (!oldUId && newUId) {
        if (isString(abServerUrl)) {
          const trackingId = this.growingIO.trackingId;
          this.setVisitSids(trackingId, this.getStorageSession(trackingId));
        } else if (isObject(abServerUrl)) {
          keys(abServerUrl).forEach((trackingId: string) => {
            this.setVisitSids(trackingId, this.getStorageSession(trackingId));
          });
        }
      }
    });
    this.retryCount = 0;
  }

  // 从存储中获取sessionId
  // 这里不调用userStore中的getSessionId，UID_UPDATE触发时如果有实例没有初始化完成，就先存空置占位。否则提前生成sessionId会导致bug
  getStorageSession = (trackingId: string) => {
    const { storage, dataStore } = this.growingIO;
    return storage.getItem(dataStore.getStorageKey(trackingId, 'sessionId'));
  };

  // 获取标记为首次访问的sessionId
  getVisitSids = (trackingId: string) => {
    const { dataStore } = this.growingIO;
    return localStorage.getItem(dataStore.getStorageKey(trackingId, 'abts'));
  };

  // 设置标记为首次访问的sessionId
  setVisitSids = (trackingId: string, value: string) => {
    const { dataStore } = this.growingIO;
    localStorage.setItem(dataStore.getStorageKey(trackingId, 'abts'), value);
  };

  // 移除标记为首次访问的sessionId
  removeVisitSids = (trackingId: string) => {
    const { dataStore } = this.growingIO;
    localStorage.removeItem(dataStore.getStorageKey(trackingId, 'abts'));
  };

  // 两个时长的初始化处理
  timeoutCheck = (
    requestInterval: number | string,
    requestTimeout: number | string
  ) => {
    this.requestInterval =
      isNumber(Number(requestInterval)) &&
      !isNaN(Number(requestInterval as string))
        ? Number(requestInterval as string)
        : 5;
    if (this.requestInterval > 60 * 24 || this.requestInterval < 0) {
      this.requestInterval = 5;
    }
    this.requestTimeout =
      isNumber(Number(requestTimeout)) &&
      !isNaN(Number(requestTimeout as string))
        ? Number(requestTimeout as string)
        : 1000;
    if (this.requestTimeout > 5000 || this.requestTimeout < 100) {
      this.requestTimeout = 1000;
    }
  };

  // 主实例获取projectId和dataSourceId
  getMainConfigs = () => {
    const {
      plugins,
      vdsConfig,
      useHybridInherit,
      useEmbeddedInherit,
      dataStore
    } = this.growingIO;
    let projectId, dataSourceId;
    // 处理dataSourceId
    if (useHybridInherit) {
      // 与移动端打通时优先使用移动端的dataSourceId
      const hybridConfig =
        plugins?.gioHybridAdapter?.hybridConfig ??
        window?.GrowingWebViewJavascriptBridge?.configuration;
      dataSourceId =
        hybridConfig?.dataSourceId ??
        hybridConfig?.datasourceId ??
        vdsConfig.dataSourceId;
      projectId = hybridConfig?.projectId ?? vdsConfig.projectId;
    } else if (useEmbeddedInherit) {
      // 与小程序打通时优先使用小程序的dataSourceId
      dataSourceId =
        dataStore.eventContextBuilderInst.minpExtraParams?.dataSourceId ??
        vdsConfig.dataSourceId;
      projectId =
        dataStore.eventContextBuilderInst.minpExtraParams?.projectId ??
        vdsConfig.projectId;
    } else {
      dataSourceId = vdsConfig.dataSourceId;
      projectId = vdsConfig.projectId;
    }
    return { projectId, dataSourceId };
  };

  // 检查存储中的实验数据是否已过期
  abtStorageCheck = () => {
    const storageKeys = this.abtStorage.getKeys();
    // 请求标记
    const abtsKeys = storageKeys.filter((k) => ABTEST_SIGN_REG.test(k));
    abtsKeys.forEach((k) => {
      // 移除过期的数据，防止存储超限
      const sign = this.abtStorage.getItem(k);
      if (!sign || sign < Date.now()) {
        this.abtStorage.removeItem(k);
      }
    });
    // abtest数据
    const abtdKeys = storageKeys.filter((k) => ABTEST_DATA_REG.test(k));
    abtdKeys.forEach((k) => {
      // 移除过期的数据，防止存储超限
      if (isEmpty(this.abtStorage.getItem(k))) {
        this.abtStorage.removeItem(k);
      }
    });
  };

  // 生成存储的hash key
  getHashKey = (trackingId: string, layerId: string | number) => {
    const { getUid } = this.growingIO.userStore;
    const { projectId } = this.growingIO.dataStore.getTrackerVds(trackingId);
    return hashCode(`${trackingId}#${projectId}#${getUid()}#${layerId}`, true);
  };

  // 生成数据接口地址
  generateUrl = (trackingId: string, abServerUrl: string) => {
    // 如果是延迟初始化的实例，当前又是首次进入设备，要补充把session存起来
    if (this.newDevice && !this.getVisitSids(trackingId)) {
      // 这里要用userStore中的getSessionId，调用这个方法的时候实例肯定已经初始化了
      // 如果是新初始化可以通过getSessionId准确获取sessionExpires来生成准确的session值;
      // 如果是旧实例则直接用存储中的sessionId
      this.setVisitSids(
        trackingId,
        this.growingIO.userStore.getSessionId(trackingId)
      );
    }
    if (!startsWith(abServerUrl, 'http')) {
      this.url[
        trackingId
      ] = `https://${abServerUrl}/diversion/specified-layer-variables`;
    } else {
      this.url[
        trackingId
      ] = `${abServerUrl}/diversion/specified-layer-variables`;
    }
  };

  // 获取实验调用
  getABTest = (trackingId: string, layerId: string | number, callback: any) => {
    if (isEmpty(this.url[trackingId])) {
      this.generateUrl(trackingId, 'https://ab.growingio.com');
    }
    if (!layerId) {
      consoleText('获取ABTest数据失败! 实验层Id不合法!', 'error');
      niceCallback(callback, {});
      return;
    }
    // 接口调用的超时时间
    const abtSign =
      this.abtStorage.getItem(
        `${this.getHashKey(trackingId, layerId)}_gdp_abt_sign`
      ) || 0;
    // 没有超时尝试取数据
    const expData =
      this.abtStorage.getItem(
        `${this.getHashKey(trackingId, layerId)}_gdp_abtd`
      ) || {};
    // 没有有效数据或者接口请求标记超时则从调用分流服务获取数据
    if (!abtSign || abtSign < Date.now()) {
      this.initiateRequest(trackingId, layerId, expData, callback);
    } else {
      niceCallback(callback, expData);
    }
  };

  // 发起请求
  initiateRequest = (
    trackingId: string,
    layerId: string | number,
    originData: any,
    callback: any
  ) => {
    const {
      userStore: { getUid, getSessionId },
      dataStore
    } = this.growingIO;
    const { projectId, dataSourceId } =
      trackingId === this.growingIO.trackingId
        ? this.getMainConfigs()
        : dataStore.getTrackerVds(trackingId);
    const xhr = new XMLHttpRequest();
    if (xhr) {
      xhr.open('POST', this.url[trackingId], true);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.timeout = this.requestTimeout;
      xhr.onload = (res: any) => {
        const data = niceTry(() => JSON.parse(res.target.responseText)) ?? {};
        if (data.code === 0) {
          this.experimentVerify(
            trackingId,
            { ...data, layerId },
            originData,
            callback
          );
        } else {
          consoleText(`获取ABTest数据失败! ${data.errorMsg}!`, 'error');
          // 接口业务失败返回false信息
          niceCallback(callback, {});
        }
        // 接口调用返回后刷新接口调用标记
        this.abtStorage.setItem(
          `${this.getHashKey(trackingId, layerId)}_gdp_abt_sign`,
          Date.now() + 1000 * 60 * this.requestInterval
        );
      };
      xhr.ontimeout = () => {
        consoleText('获取ABTest数据失败! 请求超时!', 'error');
        // 接口超时返回false信息
        niceCallback(callback, {});
      };
      xhr.onerror = () => {
        // 接口失败重试
        if (xhr.status !== 200) {
          if (this.retryCount < 2) {
            this.initiateRequest(trackingId, layerId, originData, callback);
            this.retryCount += 1;
          } else {
            consoleText(`获取ABTest数据失败! ${xhr.statusText}!`, 'error');
            // 重试结束后返回false信息
            niceCallback(callback, {});
          }
        }
      };
      const data: any = {
        accountId: projectId,
        datasourceId: dataSourceId,
        distinctId: getUid(),
        layerId
      };
      // 判定是否为新设备访问
      if (this.getVisitSids(trackingId) === getSessionId(trackingId)) {
        data.newDevice = true;
      } else {
        data.newDevice = false;
        this.removeVisitSids(trackingId);
      }
      xhr.send(queryStringify(data));
      return;
    } else {
      consoleText('获取ABTest数据失败! 当前环境不支持XMLHttpRequest!', 'error');
    }
  };

  // 实验校验（决定是否上报命中事件）
  experimentVerify = (
    trackingId: string,
    responseData: any,
    originData: any,
    callback: any
  ) => {
    const {
      layerId,
      strategyId,
      experimentId,
      layerName,
      experimentName,
      strategyName,
      variables
    } = responseData;
    const expDataKey = `${this.getHashKey(trackingId, layerId)}_gdp_abtd`;
    // 从接口取回来的用于hash比较的数据对象
    const comparisonData = {
      layerId: toString(layerId),
      strategyId: toString(strategyId),
      experimentId: toString(experimentId),
      variables
    };
    // 从本地存储中取回来的用于hash比较的数据对象
    const controlData = { ...originData };
    unset(controlData, ['layerName', 'strategyName', 'experimentName']);
    const comparisonValue = hashCode(JSON.stringify(comparisonData));
    const controlValue = hashCode(JSON.stringify(controlData));
    // 需要传给下一步和存储的数据对象
    const expData = {
      ...comparisonData,
      layerName,
      strategyName,
      experimentName
    };
    // 存储实验数据(无需经过hash对比判断直接复写存储，防止只改了名称)
    this.abtStorage.setItem(
      expDataKey,
      expData,
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() + 1
      ).getTime()
    );
    // 本地实验和请求回来的实验直接做整体hash数据对比
    if (comparisonValue !== controlValue) {
      // 数据不一致重新发命中埋点
      if (strategyId && experimentId) {
        this.buildExperimentHitEvent(trackingId, expData);
      }
    }
    // 回调调用
    niceCallback(callback, expData);
  };

  // 构建实验命中事件
  buildExperimentHitEvent = (trackingId: string, expData: any) => {
    const {
      dataStore: { eventContextBuilder, eventConverter }
    } = this.growingIO;
    let event = {
      eventType: 'CUSTOM',
      eventName: '$exp_hit',
      ...eventContextBuilder(trackingId)
    };
    const {
      layerId,
      experimentId,
      strategyId,
      layerName,
      experimentName,
      strategyName
    } = expData;
    event.attributes = limitObject({
      ...(event.attributes ?? {}),
      $exp_layer_id: layerId,
      $exp_id: experimentId,
      $exp_strategy_id: strategyId,
      $exp_layer_name: layerName,
      $exp_name: experimentName,
      $exp_strategy_name: strategyName
    });
    eventConverter(event);
  };
}
