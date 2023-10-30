import { StorageType } from '@/types/storage';
import { getActualKey, parseStorageValue } from '@/utils/business/core';
import { arrayFrom, endsWith, isObject, isString } from '@/utils/glodash';
import { niceTry } from '@/utils/tools';

import { dec, enc } from './encrypt';

class LocalStorage implements StorageType {
  public type: 'localStorage';
  constructor() {
    this.type = 'localStorage';
  }

  getItem = (key: string) => {
    const stv =
      niceTry(() =>
        JSON.parse(localStorage.getItem(getActualKey(key)) || '')
      ) || {};
    return isObject(stv) && stv.expiredAt > +Date.now()
      ? parseStorageValue(dec(stv.value))
      : undefined;
  };

  setItem = (key: string, value: any, end?: number) => {
    const expiredAt = end ?? +new Date(9999, 12);
    localStorage.setItem(
      getActualKey(key),
      JSON.stringify({
        value:
          isString(value) && value.length && endsWith(key, '_gioenc')
            ? enc(value)
            : value,
        expiredAt
      })
    );
  };

  removeItem = (key: string) => localStorage.removeItem(getActualKey(key));

  hasItem = (key: string): boolean => !!localStorage.getItem(getActualKey(key));

  getKeys = (): string[] => {
    const lsa = arrayFrom(new Array(localStorage.length));
    return lsa.map((_: any, i: number) => (localStorage as any).key(i));
  };
}
export default LocalStorage;
