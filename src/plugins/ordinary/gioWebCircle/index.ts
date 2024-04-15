import EMIT_MSG from '@/constants/emitMsg';
import { GrowingIOType } from '@/types/growingIO';

/**
 * 名称：Web圈选插件
 * 用途：用于圈选插件注入代码实现圈选和热图功能。
 */
export default class GioWebCircle {
  constructor(public growingIO: GrowingIOType) {
    this.growingIO.emitter?.on(EMIT_MSG.SDK_INITIALIZED, () => {
      window.addEventListener('message', (event: any) => {
        // 收到注入脚本的消息，并且消息窗口的vds信息和当前窗口的vds id一致才注入圈选脚本
        const { data, source } = event;
        const selfVds = window.vds as any;
        if (data && source) {
          const msgVds = source.vds;
          const cssURL = data.cssURL;
          const jsURL = data.jsURL;
          if (
            msgVds &&
            data.type === 'SDK_INJECT_CIRCLE_SCRIPT' &&
            selfVds.projectId === msgVds.projectId &&
            selfVds.dataSourceId === msgVds.dataSourceId
          ) {
            this.injectCircle(cssURL, jsURL);
          }
        }
      });
    });
  }

  injectCircle = (cssURL: string, jsURL: string) => {
    const link = document.createElement('link');
    const script = document.createElement('script');
    link.rel = 'stylesheet';
    link.href = cssURL;
    script.src = jsURL;
    document.head.appendChild(link);
    document.head.appendChild(script);
  };
}
