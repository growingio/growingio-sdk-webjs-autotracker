import BaseUploader from '@/core/uploader';
import { GrowingIOType } from '@/types/growingIO';
import { endsWith, startsWith, toString } from '@/utils/glodash';

class Uploader extends BaseUploader {
  public requestURL: string;
  constructor(public growingIO: GrowingIOType) {
    super(growingIO);
    this.requestURL = '';
    this.generateHost();
  }

  generateHost = () => {
    let { scheme, host = '', projectId } = this.growingIO.vdsConfig;
    // 协议头处理
    if (scheme) {
      if (!endsWith(toString(scheme), '://')) {
        scheme = `${scheme}://`;
      }
    } else {
      scheme = `${
        location.protocol.indexOf('http') > -1
          ? location.protocol.replace(':', '')
          : 'https'
      }//`;
    }
    // host处理
    if (startsWith(host, 'http')) {
      host = host.substring(
        host.indexOf('://') + (endsWith(toString(scheme), '://') ? 3 : 0)
      );
    }
    this.requestURL = `${scheme}${host}/v3/projects/${projectId}/collect`;
  };
}

export default Uploader;
