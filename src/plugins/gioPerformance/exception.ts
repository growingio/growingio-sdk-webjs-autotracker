// 监听标记，防止重复监听或者内存泄露
import { GrowingIOType } from '@/types/growingIO';
import { isSafari } from '@/utils/tools';
import { isArray, isEmpty, isString } from '@/utils/glodash';

export default class Exception {
  private listenerSet = false;
  private buildErrorEvent: (attributes: any, eventTime?: string) => void;
  constructor(public growingIO: GrowingIOType) {
    this.buildErrorEvent = (attributes: any, eventTime?: string) => {
      this.growingIO.plugins.gioPerformance?.buildPerfEvent(
        'apm_system_error',
        attributes,
        eventTime
      );
    };
    // 进入页面时初始化各种错误的监听
    this.setListeners();
    // 移除集成代码中的监听，防止内存泄露
    if (window.gdp.ef) {
      window.removeEventListener('unhandledrejection', window.gdp.ef);
      window.removeEventListener('error', window.gdp.ef);
      window.gdp.ef = undefined;
    }
    // 上报SDK加载之前收集到的报错信息
    if (!isEmpty(window.gdp.e) && isArray(window.gdp.e)) {
      window.gdp.e.forEach(this.handleError);
      window.gdp.e = undefined;
    }
  }

  // 设置错误监听
  setListeners = () => {
    if (!this.listenerSet) {
      window.addEventListener('unhandledrejection', this.handleError, true);
      window.addEventListener('error', this.handleError, true);
    }
    this.listenerSet = true;
  };

  // 触发错误
  // 来自SDK初始化之前的错误事件会带上eventTime实际的报错时间
  handleError = (errorEvent: any) => {
    if (errorEvent.reason) {
      // promise错误
      this.errorParse(
        errorEvent.reason.stack,
        errorEvent.reason.message,
        errorEvent.eventTime
      );
    } else if (errorEvent.error) {
      // 运行错误
      this.errorParse(
        errorEvent.error.stack,
        errorEvent.error.message,
        errorEvent.eventTime
      );
    } else if (errorEvent.target) {
      // 资源加载错误
      this.buildErrorEvent(
        {
          error_type: 'Resource loading error',
          error_content: `at ${
            (errorEvent.target as any).href ||
            (errorEvent.target as any).src ||
            (errorEvent.target as any).currentSrc
          }`
        },
        errorEvent.eventTime
      );
    }
  };

  // 解析普通错误堆栈
  errorParse = (errorString: string, message?: string, eventTime?: string) => {
    // 按分行截取为堆栈数组
    const stacks =
      isString(errorString) && errorString.length
        ? errorString.split('\n')
        : [];
    // 解析后的错误信息对象
    const errorStackObject = {
      error_type: message || stacks[0],
      error_content: isSafari()
        ? (stacks[0] ?? '').trim() || (stacks[1] ?? '').trim()
        : (stacks[1] ?? '').trim()
    };
    this.buildErrorEvent(errorStackObject, eventTime);
  };

  // 销毁移除监听
  destroy = () => {
    window.removeEventListener('unhandledrejection', this.handleError);
    window.removeEventListener('error', this.handleError);
  };
}
