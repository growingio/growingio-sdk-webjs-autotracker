import { consoleText } from '@/utils/tools';
import { includes, isEmpty, last } from '@/utils/glodash';
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

// 处理原来特殊顶级域名存储域错误问题的兼容逻辑
const domainConverter = (
  globalStorage: any,
  previousDomain: string,
  projectId: string
) => {
  if (previousDomain && testCookie(previousDomain)) {
    let tmpStorage = new CookieStorage(previousDomain);
    const sIdStorageName = `${projectId}_gdp_session_id`;
    const uidStorageName = 'gdp_user_id_gioenc';
    const userIdStorageName = `${projectId}_gdp_cs1_gioenc`;
    const userKeyStorageName = `${projectId}_gdp_user_key_gioenc`;
    const gioIdStorageName = `${projectId}_gdp_gio_id_gioenc`;
    const seqStorageIdName = `${projectId}_gdp_sequence_ids`;
    const visitStorageName = `${projectId}_gdp_session_id_sent`;
    [
      sIdStorageName,
      uidStorageName,
      userIdStorageName,
      userKeyStorageName,
      gioIdStorageName,
      seqStorageIdName,
      visitStorageName
    ].forEach((name: string) => {
      const value = tmpStorage.getItem(name);
      if (tmpStorage.hasItem(name)) {
        globalStorage.setItem(name, value);
        tmpStorage.removeItem(name);
      }
    });
    tmpStorage = undefined;
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
    // 如果客户中途设置了cookieDomain，要处理一次数据。把原来域下的数据存入当前指定域。（因为清不掉原来域的userId）
    // if (cookieDomain && testCookie(cookieDomain)) {
    //   domainConverter(globalStorage, { 隐藏配置项等真有客户需要再加 }, projectId);
    // }
  }
  return globalStorage;
};
