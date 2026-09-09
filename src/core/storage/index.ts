import { consoleText, niceTry } from '@/utils/tools';
import { endsWith, includes, isEmpty, isString, last } from '@/utils/glodash';
import { SPECIAL_TOP_DOMAIN_REG } from '@/constants/regex';
import Cookies from 'js-cookie';
import CookieStorage from './cookie';
import LocalStorage from './local';
import MemoryStorage from './memory';

// 可能存在的特殊顶级域名标记
let possibleSpecialDomain;

const domainParse = (originDomian: string) => {
  const dms = [];
  try {
    const splits = originDomian.split('.');
    const lspt = last(splits);
    if (
      splits.length >= 2 &&
      (isNaN(Number(lspt)) || Number(lspt) < 0 || Number(lspt) > 255)
    ) {
      const domain2length = `.${splits.slice(-2).join('.')}`;
      if (!SPECIAL_TOP_DOMAIN_REG.test(domain2length)) {
        dms.push(domain2length);
      } else {
        possibleSpecialDomain = domain2length;
      }
      const domain3length = `.${splits.slice(-3).join('.')}`;
      if (
        !SPECIAL_TOP_DOMAIN_REG.test(domain3length) &&
        !includes(dms, domain3length)
      ) {
        dms.push(domain3length);
      }
      const domain4length = `.${splits.slice(-4).join('.')}`;
      if (
        !SPECIAL_TOP_DOMAIN_REG.test(domain4length) &&
        !includes(dms, domain4length)
      ) {
        dms.push(domain4length);
      }
    }
  } catch (error) {
    consoleText(error, 'error');
  }
  return dms;
};

// 获取可以设进cookie的域，优先是顶级域名，其次是子域名
const getActiveDomain = (domains: string[]) => {
  let activeDomain = '';
  domains.some((d) => {
    if (testCookie(d)) {
      activeDomain = d;
      return true;
    } else {
      return false;
    }
  });
  return activeDomain;
};

// 检测指定的域是否可以正确设cookie
export const testCookie = (testDomain: string) => {
  try {
    // 先尝试往指定域写cookie
    Cookies.set('gioCookie', 'yes', { domain: testDomain });
    // 读取指定域的cookie，有值说明可以，无值说明无效
    const valid = !!Cookies.get('gioCookie', { domain: testDomain });
    Cookies.remove('gioCookie', { domain: testDomain });
    return valid;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return false;
  }
};

// 判断是否为本地环境
const isLocal = (): boolean =>
  includes(['', 'localhost', '127.0.0.1'], window.location.hostname) ||
  !includes(['http:', 'https:'], window.location.protocol);

// 判断是否为electron环境
const isElectron = (): boolean => navigator.userAgent.indexOf('Electron') > -1;

// 是否允许存入cookie
const getCookieAvailable = () =>
  isElectron() || isLocal()
    ? ''
    : getActiveDomain([
        ...domainParse(window.location.hostname),
        window.location.hostname
      ]);

// 是否允许存储localStorage
const storageAvailable = () => {
  try {
    const storage: any = window.localStorage,
      x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return false;
  }
};

const getSdkStorageKeys = (projectId: string) => [
  `${projectId}_gdp_session_id`,
  'gdp_user_id_gioenc',
  `${projectId}_gdp_cs1_gioenc`,
  `${projectId}_gdp_user_key_gioenc`,
  `${projectId}_gdp_gio_id_gioenc`,
  `${projectId}_gdp_sequence_ids`,
  `${projectId}_gdp_session_id_sent`
];

// 4.4.0 写出的 v2 密文旧版本 SDK 无法正确解密，初始化时重写为兼容格式
const migrateEncryptedValues = (globalStorage: any, projectId: string) => {
  getSdkStorageKeys(projectId)
    .filter((name: string) => endsWith(name, '_gioenc'))
    .forEach((name: string) => {
      const value = globalStorage.getItem(name);
      if (isString(value) && value.length && value !== 'w3,') {
        niceTry(() => globalStorage.setItem(name, value));
      }
    });
};

const isSameCookieDomain = (left: string, right: string) =>
  left.replace(/^\./, '') === right.replace(/^\./, '');

// 迁移旧域中的 SDK cookie，并删除旧域同名 cookie，避免浏览器读取到旧值。
const domainConverter = (
  globalStorage: any,
  previousDomain: string,
  projectId: string
) => {
  if (
    previousDomain &&
    globalStorage instanceof CookieStorage &&
    !isSameCookieDomain(previousDomain, globalStorage.domain) &&
    testCookie(previousDomain)
  ) {
    const previousStorage = new CookieStorage(previousDomain);
    const storageValues = getSdkStorageKeys(projectId).map((name: string) => ({
      name,
      value: previousStorage.getItem(name)
    }));

    // document.cookie 无法按 domain 精确读取同名 cookie。先清除旧域的副本，
    // 再读取目标域，才能可靠判断目标域中是否已有更新的数据。
    storageValues.forEach(({ name }) => previousStorage.removeItem(name));
    storageValues.forEach(({ name, value }) => {
      if (
        typeof globalStorage.getItem(name) === 'undefined' &&
        typeof value !== 'undefined'
      ) {
        globalStorage.setItem(name, value);
      }
    });
  }
};

/**
 * 使用存储时注意，在key结尾加上'_gioenc'即表示该项为加密项，存取值时需要加解密。
 * 方法会自动处理key结尾的后缀；三种存储方式表现一一致。
 */
export const initGlobalStorage = (vdsConfig: any) => {
  let { storageType, cookieDomain, projectId } = vdsConfig;
  if (!includes(['cookie', 'localstorage'], storageType)) {
    storageType = 'cookie';
  }
  let globalStorage;
  let cookieAvailable, cookieActiveDomain;
  if (storageType === 'cookie') {
    cookieActiveDomain = getCookieAvailable();
    cookieAvailable = !!cookieActiveDomain;
  }
  if (storageType === 'cookie' && cookieAvailable) {
    const store = new CookieStorage(cookieActiveDomain);
    // 客户指定设了合法的cookie域，则修改domain
    if (cookieDomain) {
      let parses = domainParse(cookieDomain);
      const activeSetterDomain = getActiveDomain(
        !isEmpty(parses) ? [cookieDomain, ...domainParse(cookieDomain)] : []
      );
      if (activeSetterDomain && testCookie(activeSetterDomain)) {
        store.domain = activeSetterDomain;
        // 默认域和指定域不同会留下同名 cookie；旧值可能会覆盖指定域中的新值。
        // 在初始化时迁移并清理默认域，保证后续 setUserId 读取的是当前域的值。
        domainConverter(store, cookieActiveDomain, projectId);
      } else {
        consoleText('指定Cookie域无效或无权限，使用默认域！', 'warn');
      }
    }
    globalStorage = store;
  } else if (storageAvailable()) {
    globalStorage = new LocalStorage();
  } else {
    globalStorage = new MemoryStorage();
  }

  if (storageType === 'cookie') {
    // 如果存在特殊的两层顶级域名，要处理一次数据。把原来存在两层顶级域名中的数据存入当前站点的一级域中
    if (possibleSpecialDomain && testCookie(possibleSpecialDomain)) {
      domainConverter(globalStorage, possibleSpecialDomain, projectId);
    }
  }
  if (projectId) {
    migrateEncryptedValues(globalStorage, projectId);
  }
  return globalStorage;
};
