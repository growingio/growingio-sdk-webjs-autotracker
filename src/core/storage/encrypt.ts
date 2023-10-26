import { isNil, isString, startsWith } from '@/utils/glodash';
import { niceTry } from '@/utils/tools';

// 特殊字符不进行 与或 加密 （因为A,a,Z,z，转换后会变成符号
const special: any = {
  A: 1,
  a: 1,
  Z: 1,
  z: 1,
  '@': 1,
  '{': 1
};

// 加密
export const enc = (v: string) =>
  !isNil(v) ? niceTry(() => `gioenc-${bitEncrypt(v)}`) || v : v;

// 解密
export const dec = (v: string) =>
  isString(v) && startsWith(v, 'gioenc-')
    ? niceTry(() => bitEncrypt(v.replace('gioenc-', ''))) || v
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
