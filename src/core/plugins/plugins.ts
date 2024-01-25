import { GrowingIOType } from '@/types/growingIO';
import BasePlugins from './basePlugins';

class Plugins extends BasePlugins {
  constructor(public growingIO: GrowingIOType) {
    super(growingIO);
    this.growingIO.gioSDKFull = false;
    this.pluginsContext = {
      plugins: {}
    };
  }
}

export default Plugins;
