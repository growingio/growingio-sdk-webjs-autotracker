import { GrowingIOType } from '@/types/growingIO';
import gioCustomTracking from '@/plugins/gioCustomTracking/index.es';

import BasePlugins from './basePlugins';

class Plugins extends BasePlugins {
  constructor(public growingIO: GrowingIOType) {
    super(growingIO);
    this.growingIO.gioSDKFull = false;
    this.pluginsContext = {
      plugins: { gioCustomTracking }
    };
  }
}

export default Plugins;
