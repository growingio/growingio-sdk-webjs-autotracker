import { isNil, isString, startsWith } from '@/utils/glodash';
import { niceTry } from '@/utils/tools';

const ENCRYPTION_PREFIX = 'gioenc-';
const V2_ENCRYPTION_PREFIX = 'gioenc-v2-';
// 4.4.0 写出的 v2 密文被旧版本 SDK 解密后残留的前缀
const CORRUPTED_PREFIX = 'w3,';

const special: any = {
  A: 1,
  a: 1,
  Z: 1,
  z: 1,
  '@': 1,
  '{': 1,
  '[': 1,
  '`': 1
};

// 加密
export const enc = (v: string) =>
  !isNil(v) ? niceTry(() => `${ENCRYPTION_PREFIX}${bitEncrypt(v)}`) || v : v;

// 解密
export const dec = (v: string, key?: string) => {
  if (!isString(v)) {
    return v;
  }
  const plain = startsWith(v, V2_ENCRYPTION_PREFIX)
    ? decryptV2(v)
    : startsWith(v, ENCRYPTION_PREFIX)
      ? decrypt(v, ENCRYPTION_PREFIX, bitEncrypt)
      : v;
  const value = stripCorruptedPrefix(plain);
  // Web 设备 UUID 的 a 可能已被误读为反引号并再次回写，各存储格式统一恢复。
  if (key === 'gdp_user_id_gioenc') {
    const uuid = value.replace(/`/g, 'a');
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        uuid
      )
    ) {
      return uuid;
    }
  }
  return value;
};

const decrypt = (v: string, prefix: string, decoder: (data: any) => string) => {
  const plain = niceTry(() => decoder(v.slice(prefix.length)));
  return isString(plain) ? plain : v;
};

// 明文 CORRUPTED_PREFIX 的 v1 密文恰好是 'v2-'，旧版本回写的 v1 密文与真 v2 密文在
// 格式上无法区分。但两者按 v2 解出的结果只在 a、Z 两个字符上有差异（A、@、z、{ 被旧
// 版本换了两次，两种来源都已正确），固定还原这两个字符即可同时满足两种来源。
const decryptV2 = (v: string) => {
  const cipher = v.slice(V2_ENCRYPTION_PREFIX.length);
  const plain = niceTry(() => v2BitEncrypt(cipher));
  if (!isString(plain)) {
    return v;
  }
  // 旧版本编码永远不会产出反引号和 [（两者都不在它的特殊字符表里，会被 XOR 掉），
  // 所以密文里出现它们就一定是真 v2 密文，正文无需还原。
  return /[`[]/.test(cipher) ? plain : restoreRewrittenChars(plain);
};

// 反引号、[ 不会出现在旧版本能存下的身份中，谁解出来带它们谁就是被旧版本换过的。
const restoreRewrittenChars = (v: string) =>
  v.replace(/`/g, 'a').replace(/\[/g, 'Z');

const stripCorruptedPrefix = (v: string) =>
  startsWith(v, CORRUPTED_PREFIX) && v.length > CORRUPTED_PREFIX.length
    ? v.slice(CORRUPTED_PREFIX.length)
    : v;

const bitEncrypt = (data: any) => {
  data = data || '';
  let arr = data.split('');
  let result = arr.map((item: any) => {
    if (!special[item]) {
      return xor(item);
    } else {
      return item;
    }
  });
  return result.join('');
};

const v2BitEncrypt = (data: any) =>
  (data || '')
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
