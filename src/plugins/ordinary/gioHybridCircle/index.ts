import EMIT_MSG from '@/constants/emitMsg';
import { GrowingIOType } from '@/types/growingIO';

import DomHelper from './dom-helper';

/**
 * 名称：Hybrid圈选插件
 * 用途：用于hybrid圈选功能。
 */
export default class GioHybridCircle {
  static domHelper: any;
  constructor(public growingIO: GrowingIOType) {
    this.growingIO.emitter?.on(EMIT_MSG.SDK_INITIALIZED, () => {
      if (window.GrowingWebViewJavascriptBridge) {
        const self = this;
        window.GrowingWebViewJavascriptBridge.getDomTree = function () {
          if (arguments.length >= 4) {
            GioHybridCircle.bindGetDomTree(self.growingIO);
            return GioHybridCircle.domHelper.getDomTree.apply(
              GioHybridCircle.domHelper,
              arguments
            );
          }
        };
      }
    });
  }

  private static bindGetDomTree(growingIO: GrowingIOType) {
    if (!this.domHelper) {
      this.domHelper = new DomHelper(growingIO);
      window.GrowingWebViewJavascriptBridge.getDomTree =
        this.domHelper.getDomTree.bind(this.domHelper);
    }
  }
}
