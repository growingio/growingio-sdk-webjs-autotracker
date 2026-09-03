import { isNil, isString, startsWith } from '@/utils/glodash';
import { niceTry } from '@/utils/tools';

const ENCRYPTION_PREFIX = 'gioenc-v2-';
const LEGACY_ENCRYPTION_PREFIX = 'gioenc-';

// v1 为避免部分字符映射冲突而跳过了这些字符。保留它只用于读取历史数据。
const legacySpecial: any = {
  A: 1,
  a: 1,
  Z: 1,
  z: 1,
  '@': 1,
  '{': 1,
  '[': 1,
  '`': 1
};

// 新写入值带版本标记，所有 UTF-16 code unit 都参与 XOR，避免 v1 的字符白名单遗漏。
export const enc = (v: string) =>
  !isNil(v) ? niceTry(() => `${ENCRYPTION_PREFIX}${xorEncrypt(v)}`) || v : v;

// 保留 v1 解码以读取已有记录；新写入统一使用 v2，避免继续产生有歧义的 v1 密文。
export const dec = (v: string) =>
  !isString(v)
    ? v
    : startsWith(v, ENCRYPTION_PREFIX)
      ? niceTry(() => xorEncrypt(v.slice(ENCRYPTION_PREFIX.length))) || v
      : startsWith(v, LEGACY_ENCRYPTION_PREFIX)
        ? niceTry(() => legacyBitEncrypt(v.slice(LEGACY_ENCRYPTION_PREFIX.length))) ||
          v
        : v;

const legacyBitEncrypt = (data: any) => {
  data = data || '';
  let arr = data.split('');
  let result = arr.map((item: any) => {
    if (!legacySpecial[item]) {
      return xor(item);
    } else {
      return item;
    }
  });
  return result.join('');
};

const xorEncrypt = (data: string) =>
  data
    .split('')
    .map((item: string) => xor(item))
    .join('');

const xor = (msg: string) => {
  let isNum = /[0-9]/.test(msg);
  if (isNum) {
    return +msg ^ 1;
  } else {
    let num10 = msg.charCodeAt(0);
    let numXOR = num10 ^ 1;
    return String.fromCharCode(numXOR);
  }
};
