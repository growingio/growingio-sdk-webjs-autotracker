/**
 * AB 分流请求的协议编解码和缓存命名空间。
 *
 * 此模块只处理 AB 请求，不复用通用 queryStringify 或存储加密逻辑，
 * 以保证服务端可按 URL 中的 stm 独立还原 userId 与 userKey。
 */
export interface ABIdentitySnapshot {
  /** 触发分流的 SDK 实例，用于隔离多实例身份和缓存。 */
  trackingId: string;
  /** 本次分流实际使用的项目 ID。 */
  projectId: string;
  /** 请求开始时读取到的登录用户 ID；空字符串表示匿名身份。 */
  userId: string;
  /** 仅在该实例开启 idMapping 时保留的用户键。 */
  userKey: string;
  /** userId 与 userKey 的 SHA-1 摘要，缓存中不保存身份明文。 */
  identityHash: string;
}

export interface ABRequestContext {
  /** 以下字段共同描述一次逻辑分流请求，重试时不会重新读取可变身份。 */
  trackingId: string;
  /** 请求的实验层 ID，也是缓存分区的一部分。 */
  layerId: string | number;
  /** 请求表单中的 accountId。 */
  projectId: string;
  /** 请求表单中的 datasourceId。 */
  dataSourceId: string;
  /** 既有 distinctId 语义中的设备 ID，多实例共享但不能单独作为缓存边界。 */
  deviceId: string;
  /**
   * 既有分流协议的 newDevice 标记，在本逻辑请求生命周期内保持不变。
   * 普通 Web 路径创建时为 undefined，首次真正发送请求时再计算。
   */
  newDevice?: boolean;
  /** Hybrid Native 模式仅在 Native 明确为新设备时才写入 newDevice。 */
  sendNewDevice?: boolean;
  /** 该 trackingId 对应的分流 API 基地址，不含本次请求的 stm。 */
  url: string;
  /** 已冻结的登录身份及其摘要。 */
  identity: ABIdentitySnapshot;
  /** 小程序继承身份；响应和重试通过 adapter 的本页宿主归属复核。 */
  embedded?: boolean;
  /** 宿主绑定的版本；Native 与该绑定的 Web 回退都不能跨 Bridge 换代继续处理。 */
  hybridGeneration?: number;
  /** V2 请求间隔标记的本地存储键。 */
  signKey: string;
  /** V2 实验结果的本地存储键。 */
  dataKey: string;
  /** 命中事件构建失败后待补报的标记，与实验结果按同一天过期。 */
  pendingHitKey: string;
  /** 独立于结果缓存的当日命中记录，结果写入失败时仍可防止重复命中。 */
  hitKey?: string;
  /** 跨页协调器在网络请求及响应落盘前复核租约归属。 */
  runWithLock?: (work: () => void) => void;
  /** 请求前从同一 dataKey 读取的结果，用于判断是否需要重新上报命中。 */
  originData: any;
  /** 保持 getABTest 原有异步回调语义的回调函数。 */
  callback: any;
  /** 当前逻辑请求已进行的网络重试次数，不与其他实例或调用共享。 */
  retryCount: number;
  /** 上一次实际发送的 stm，确保同步重试也不会复用同一个编码 key。 */
  lastStm?: number;
  /** 生命周期状态随上下文释放，避免依赖 IE10 不支持的 WeakMap。 */
  native?: boolean;
  settled?: boolean;
}

// 服务端约定使用标准 Base64，因此必须保留 +、/ 和 = 填充字符。
const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// encodeURIComponent 会保留 ! ' ( ) *；它们不属于 RFC 3986 unreserved，
// 需要额外百分号编码，确保 Base64 与其他表单值均可无损解析。
const strictEncodeURIComponent = (value: string) =>
  encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );

export const getStmLowByte = (stm: string | number): number => {
  // 逐位取模避免未来传入超出 JavaScript 安全整数范围的时间戳时丢失低 8 位。
  const value = String(stm);
  if (!/^\d+$/.test(value)) {
    throw new Error('stm must be a non-negative integer');
  }
  let key = 0;
  for (let index = 0; index < value.length; index += 1) {
    key = (key * 10 + value.charCodeAt(index) - 48) & 0xff;
  }
  return key;
};

export const utf8ToBytes = (value: string): number[] => {
  const bytes: number[] = [];
  for (let index = 0; index < value.length; index += 1) {
    let codePoint = value.charCodeAt(index);
    // UTF-16 代理对先合并为 Unicode code point；孤立代理项按 UTF-8 的替换字符编码。
    if (codePoint >= 0xd800 && codePoint <= 0xdbff) {
      const nextCodePoint = value.charCodeAt(index + 1);
      // 显式检查边界，避免生产压缩器改写 NaN 比较后误将尾部高代理合并。
      if (
        index + 1 < value.length &&
        nextCodePoint >= 0xdc00 &&
        nextCodePoint <= 0xdfff
      ) {
        codePoint =
          0x10000 + ((codePoint - 0xd800) << 10) + nextCodePoint - 0xdc00;
        index += 1;
      } else {
        codePoint = 0xfffd;
      }
    } else if (codePoint >= 0xdc00 && codePoint <= 0xdfff) {
      codePoint = 0xfffd;
    }

    // 根据 code point 范围写入 1 至 4 个 UTF-8 字节，不能直接对 UTF-16 code unit XOR。
    if (codePoint <= 0x7f) {
      bytes.push(codePoint);
    } else if (codePoint <= 0x7ff) {
      bytes.push(0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f));
    } else if (codePoint <= 0xffff) {
      bytes.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f)
      );
    }
  }
  return bytes;
};

export const xorWithStm = (bytes: number[], stm: string | number): number[] => {
  // 同一个 stm 的低字节同时用于 userId 和 userKey，XOR 两次即可恢复原字节。
  const key = getStmLowByte(stm);
  return bytes.map((value) => value ^ key);
};

export const bytesToBase64 = (bytes: number[]): string => {
  // 每三个字节映射为四个 Base64 字符；尾部不足三字节时用 = 保留标准填充。
  let encoded = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    encoded += BASE64_ALPHABET.charAt(first >> 2);
    encoded += BASE64_ALPHABET.charAt(((first & 0x03) << 4) | (second >> 4));
    encoded +=
      typeof second === 'undefined'
        ? '='
        : BASE64_ALPHABET.charAt(((second & 0x0f) << 2) | (third >> 6));
    encoded +=
      typeof third === 'undefined' ? '=' : BASE64_ALPHABET.charAt(third & 0x3f);
  }
  return encoded;
};

export const encodeStmXor = (value: string, stm: string | number): string =>
  bytesToBase64(xorWithStm(utf8ToBytes(value), stm));

/**
 * 同步计算 SHA-1，供缓存命名空间隐藏身份原文。
 *
 * 该摘要不是认证或加密机制；同步实现避免依赖 Web Crypto，兼容 SDK 支持的旧浏览器。
 */
export const sha1 = (value: string): string => {
  const bytes = utf8ToBytes(value);
  const bitLength = bytes.length * 8;
  // SHA-1 填充为 1 bit、若干 0 bit 和 64 位消息长度，使消息按 512 bit 分块。
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) {
    bytes.push(0);
  }
  for (let index = 7; index >= 0; index -= 1) {
    bytes.push(index > 3 ? 0 : (bitLength >>> (index * 8)) & 0xff);
  }

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  for (let offset = 0; offset < bytes.length; offset += 64) {
    // 每个 512 bit 分块扩展为 80 个 32 位字，再依次进行 SHA-1 的四轮压缩。
    const words: number[] = new Array(80);
    for (let index = 0; index < 16; index += 1) {
      const start = offset + index * 4;
      words[index] =
        (bytes[start] << 24) |
        (bytes[start + 1] << 16) |
        (bytes[start + 2] << 8) |
        bytes[start + 3];
    }
    for (let index = 16; index < 80; index += 1) {
      const word =
        words[index - 3] ^
        words[index - 8] ^
        words[index - 14] ^
        words[index - 16];
      words[index] = (word << 1) | (word >>> 31);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    for (let index = 0; index < 80; index += 1) {
      let f: number;
      let k: number;
      if (index < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (index < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (index < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const rotatedA = (a << 5) | (a >>> 27);
      const temp = (rotatedA + f + e + k + words[index]) | 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }
    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
  }

  return [h0, h1, h2, h3, h4]
    .map((part) => `00000000${(part >>> 0).toString(16)}`.slice(-8))
    .join('');
};

export const getABCacheKeys = (
  trackingId: string,
  projectId: string,
  deviceId: string,
  layerId: string | number,
  identityHash: string,
  serverUrl = ''
) => {
  // 数组序列化保留字段边界，身份及设备等字段中的换行不能合并不同分区。
  const cacheHash = sha1(
    JSON.stringify([
      trackingId,
      projectId,
      deviceId,
      String(layerId),
      identityHash,
      serverUrl
    ])
  );
  const prefix = `gdp_abt_v2_${cacheHash}`;
  return {
    signKey: `${prefix}_sign`,
    dataKey: `${prefix}_data`,
    hitKey: `${prefix}_hit`,
    pendingHitKey: `${prefix}_hit_pending`
  };
};

/** 保留 userId 和 userKey 的边界，避免两种身份因换行分隔符而使用同一摘要。 */
export const getABIdentityHash = (userId: string, userKey: string): string =>
  sha1(JSON.stringify([userId, userKey]));

export const stringifyABForm = (data: Record<string, any>): string =>
  // undefined/null 不是协议字段；身份为空时由 buildABRequestBody 直接省略。
  Object.keys(data)
    .filter((key) => data[key] !== undefined && data[key] !== null)
    .map(
      (key) =>
        `${strictEncodeURIComponent(key)}=${strictEncodeURIComponent(
          String(data[key])
        )}`
    )
    .join('&');

export const appendStm = (url: string, stm: string): string => {
  // stm 只能位于 query：保留已有 query 与 fragment，避免把 fragment 当作请求参数。
  const hashIndex = url.indexOf('#');
  const base = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : url.slice(hashIndex);
  return `${base}${base.indexOf('?') === -1 ? '?' : '&'}stm=${strictEncodeURIComponent(
    stm
  )}${hash}`;
};

export const buildABRequestBody = (
  context: ABRequestContext,
  stm: string
): string => {
  // 这些字段保持既有 AB 分流协议；stm 和身份字段按新协议分别在 URL 与正文处理。
  const data: Record<string, any> = {
    accountId: context.projectId,
    datasourceId: context.dataSourceId,
    distinctId: context.deviceId,
    layerId: context.layerId,
    newDevice: context.sendNewDevice === false ? undefined : context.newDevice
  };
  if (context.identity.userId) {
    data.userId = encodeStmXor(context.identity.userId, stm);
  }
  if (context.identity.userKey) {
    data.userKey = encodeStmXor(context.identity.userKey, stm);
  }
  return stringifyABForm(data);
};
