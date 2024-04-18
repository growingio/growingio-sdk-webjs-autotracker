import { GrowingIOType } from '@/types/growingIO';
import { includes, isEmpty } from '@/utils/glodash';
import { addListener, limitObject, niceTry } from '@/utils/tools';

class Page {
  public domain: string;
  public path: string;
  public query: string;
  public time: number;
  public title: string;
  // 开启hashtag时，包含hash的href；用于对比全量的地址
  public lastHref: string;
  // 关闭hashtag时，排除hash后拼接的地址和参数；用于对比没有hash的地址
  public lastNoHashHref: string;
  // 上一个用于做对比取数用的location对象，不论是否开启hashtag都取浏览器解析的值，不用担心自己排除hash会出bug
  public lastLocation: any;
  // 页面监听
  public pageListeners: any;
  // 页面属性(下一次发page事件[sendPage或自动page]时取用即删除)
  public pageProps: any;
  constructor(public growingIO: GrowingIOType) {
    this.title = niceTry(() => document.title.slice(0, 255)) ?? '';
    this.lastLocation = { ...window.location };
    this.pageListeners = {};
    this.pageProps = {};
  }

  // 解析页面数据(地址、参数、hash)
  parsePage = () => {
    const { hashtag } = this.growingIO.vdsConfig;
    const oPath = location.pathname;
    const oSearch = location.search;
    const oHash = location.hash;
    const hidx = oHash.indexOf('?');
    // 更新页面domain
    this.domain = window.location.host;
    // 更新页面标题
    this.title = document.title.slice(0, 255);
    // 更新页面时间
    this.time = +Date.now();
    // 更新页面path
    this.path = oPath;
    // 更新页面参数
    this.query = oSearch;
    if (hashtag) {
      // 存在hash
      if (hidx > -1) {
        // path中移除hash参数
        this.path += oHash.slice(0, hidx);
        // hash参数拼接进页面参数
        this.query = this.query + '&' + oHash.slice(hidx + 1);
      } else {
        this.path += oHash;
      }
    }
    // 移除开头的拼接符
    if (this.query && includes(['?', '&'], this.query.charAt(0))) {
      this.query = this.query.slice(1);
    }
  };

  // 处理获取忽略hashtag的href
  private _getNoHashHref = () => {
    const { protocol, host, pathname, search } = window.location;
    return `${protocol}://${host}${pathname}${search}`;
  };

  // 获取来源页面地址
  getReferralPage = (trackingId: string) => {
    const {
      dataStore: { lastPageEvent }
    } = this.growingIO;
    const lpv = lastPageEvent[trackingId];
    // path相等就是补发，就要取上一个page事件里的referralPage
    if (lpv?.path === this.path && (lpv?.query ?? '') === (this.query ?? '')) {
      return lpv?.referralPage;
    } else {
      return lpv?.path ? lpv?.nextRefferer : document.referrer;
    }
  };

  // 页面触发事件
  handlePage = () => {
    const {
      vdsConfig: { hashtag },
      dataStore
    } = this.growingIO;
    let nowHref = window.location.href;
    let compareHref = this.lastHref;
    // 关闭hashrtag时使用无hash的地址进行比对
    if (!hashtag) {
      nowHref = this._getNoHashHref();
      compareHref = this.lastNoHashHref;
    }
    if (compareHref !== nowHref) {
      // 解析页面信息
      this.parsePage();
      // 发送page事件
      dataStore.initializedTrackingIds.forEach((trackingId: string) => {
        dataStore.sendVerifiedPage(trackingId);
      });
    }
  };

  // 对pushState和replaceState进行hook，添加监听
  hookHistory = () => {
    const pushState = window.history.pushState;
    const replaceState = window.history.replaceState;
    const self = this;
    if (pushState) {
      niceTry(
        () =>
          (window.history.pushState = function () {
            pushState.apply(window.history, arguments);
            setTimeout(self.handlePage);
          })
      );
    }
    if (replaceState) {
      niceTry(
        () =>
          (window.history.replaceState = function () {
            replaceState.apply(window.history, arguments);
            setTimeout(self.handlePage);
          })
      );
    }
    // back、forward、go事件会触发popstate事件（pushState和replaceState不会触发）
    addListener(window, 'popstate', this.handlePage);
    // hash路由要单独监听
    const { hashtag } = this.growingIO.vdsConfig;
    if (hashtag) {
      addListener(window, 'hashchange', this.handlePage);
    }
  };

  // 构建页面访问事件
  buildPageEvent = (trackingId: string, props?: any) => {
    const {
      dataStore: { eventContextBuilder, eventConverter }
    } = this.growingIO;
    let event = {
      eventType: 'PAGE',
      ...eventContextBuilder(trackingId),
      title: this.title, // page事件要单独设一个title以覆盖eventContextBuilder中的lastPage的title错误值
      protocolType: location.protocol.substring(
        0,
        location.protocol.length - 1
      ),
      referralPage: this.getReferralPage(trackingId),
      timestamp: this.time
    };
    // 传入参数生成的page事件取值为传入参数
    if (!isEmpty(props) && props.title) {
      event.title = props.title;
    }
    // 添加页面属性
    const pageProps = niceTry(() => this.pageProps[trackingId]);
    if (!isEmpty(pageProps)) {
      event.attributes = limitObject(pageProps);
      niceTry(() => (this.pageProps[trackingId] = {}));
    }
    eventConverter(event);
    // 更新给用于比对的lastHref、lastNoHashHref、lastLocation
    this.lastHref = window.location.href;
    this.lastNoHashHref = this._getNoHashHref();
    this.lastLocation = { ...window.location };
  };
}

export default Page;
