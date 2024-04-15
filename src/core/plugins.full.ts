import { GrowingIOType } from '@/types/growingIO';
import gioCompress from '@/plugins/ordinary/gioCompress/index.es';
import gioCustomTracking from '@/plugins/ordinary/gioCustomTracking/index.es';
import gioEmbeddedAdapter from '@/plugins/ordinary/gioEmbeddedAdapter/index.es';
import gioEventAutoTracking from '@/plugins/ordinary/gioEventAutoTracking/index.es';
import gioHybridAdapter from '@/plugins/ordinary/gioHybridAdapter/index.es';
import gioHybridCircle from '@/plugins/ordinary/gioHybridCircle/index.es';
import gioImpressionTracking from '@/plugins/ordinary/gioImpressionTracking/index.es';
import gioWebCircle from '@/plugins/ordinary/gioWebCircle/index.es';

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
