import { StorageType } from '@/types/internal/storage';
import { getActualKey, parseStorageValue } from '@/utils/tools';
import { has, isObject, isString, keys, unset } from '@/utils/glodash';
import { niceTry } from '@/utils/tools';

import { dec, enc } from './encrypt';

const mStorage: any = {};
class MemoryStorage implements StorageType {
  public type: 'memory';
  constructor() {
    this.type = 'memory';
  }

  getItem = (key: string) => {
    const stv = niceTry(() => JSON.parse(mStorage[getActualKey(key)] || ''));
    return isObject(stv) && stv.expiredAt > +Date.now()
      ? parseStorageValue(dec(stv.value))
      : undefined;
  };

  setItem = (key: string, value: any, end?: number) => {
    const expiredAt =
      end ??
      +new Date(
        new Date().getFullYear() + 3,
        new Date().getMonth(),
        new Date().getDay()
      ).getTime();
    mStorage[getActualKey(key)] = JSON.stringify({
      value: isString(value) && value.length ? enc(value) : value,
      expiredAt
    });
  };

  removeItem = (key: string) => unset(mStorage, getActualKey(key));

  hasItem = (key: string): boolean => has(mStorage, getActualKey(key));

  getKeys = (): string[] => keys(mStorage);
}
export default MemoryStorage;
