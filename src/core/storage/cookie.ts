import { StorageType } from '@/types/storage';
import { getActualKey, parseStorageValue } from '@/utils/tools';
import { isString, keys, endsWith, includes } from '@/utils/glodash';
import Cookies from 'js-cookie';

import { dec, enc } from './encrypt';

class CookieStorage implements StorageType {
  public type: 'Cookie';
  constructor(public domain: string) {
    this.type = 'Cookie';
  }

  getItem = (key: string) =>
    parseStorageValue(
      dec(Cookies.get(getActualKey(key), { domain: this.domain, path: '/' }))
    );

  setItem = (key: string, value: any, end?: Date) => {
    let procValue;
    if (isString(value)) {
      if (value.length) {
        procValue = endsWith(key, '_gioenc') ? enc(value) : value;
      } else {
        procValue = '';
      }
    } else {
      procValue = JSON.stringify(value);
    }
    Cookies.set(getActualKey(key), procValue, {
      expires: end
        ? new Date(end)
        : new Date(
            new Date(new Date().toDateString()).getTime() + 86400000 * 400
          ), // 默认400天
      domain: this.domain,
      path: '/'
    });
  };

  removeItem = (key: string) => {
    Cookies.remove(getActualKey(key), { domain: this.domain, path: '/' });
  };

  hasItem = (key: string): boolean =>
    includes(keys(Cookies.get()), getActualKey(key));

  getKeys = (): string[] => keys(Cookies.get());
}

export default CookieStorage;
