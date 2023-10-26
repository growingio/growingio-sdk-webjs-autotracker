import { GrowingIOType } from '@/types/growingIO';
import gioCompress from '@/plugins/gioCompress/index.es';
import gioEmbeddedAdapter from '@/plugins/gioEmbeddedAdapter/index.es';
import gioEventAutoTracking from '@/plugins/gioEventAutoTracking/index.es';
import gioHybridAdapter from '@/plugins/gioHybridAdapter/index.es';
import gioImpressionTracking from '@/plugins/gioImpressionTracking/index.es';

import BasePlugins from './basePlugins';

class Plugins extends BasePlugins {
  constructor(public growingIO: GrowingIOType) {
    super(growingIO);
    this.growingIO.gioSDKFull = true;
    this.pluginsContext = {
      plugins: {
        gioCompress,
        gioEmbeddedAdapter,
        gioEventAutoTracking,
        gioHybridAdapter,
        gioImpressionTracking
      }
    };
  }
}

export default Plugins;
