import { GrowingIOType } from '@/types/growingIO';
import gioCompress from '@/plugins/gioCompress/index.es';
import gioCustomTracking from '@/plugins/gioCustomTracking/index.es';
import gioEmbeddedAdapter from '@/plugins/gioEmbeddedAdapter/index.es';
import gioEventAutoTracking from '@/plugins/gioEventAutoTracking/index.es';
import gioHybridAdapter from '@/plugins/gioHybridAdapter/index.es';
import gioHybridCircle from '@/plugins/gioHybridCircle/index.es';
import gioImpressionTracking from '@/plugins/gioImpressionTracking/index.es';
import gioWebCircle from '@/plugins/gioWebCircle/index.es';

import BasePlugins from './basePlugins';

class Plugins extends BasePlugins {
  constructor(public growingIO: GrowingIOType) {
    super(growingIO);
    this.growingIO.gioSDKFull = true;
    this.pluginsContext = {
      plugins: {
        gioCompress,
        gioCustomTracking,
        gioEmbeddedAdapter,
        gioEventAutoTracking,
        gioHybridAdapter,
        gioHybridCircle,
        gioImpressionTracking,
        gioWebCircle
      }
    };
  }
}

export default Plugins;
