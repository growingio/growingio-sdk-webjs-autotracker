var e=function(t,n){return e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)({}).hasOwnProperty.call(t,n)&&(e[n]=t[n])},e(t,n)};function t(t,n){if("function"!=typeof n&&null!==n)throw new TypeError("Class extends value "+n+" is not a constructor or null");function r(){this.constructor=t}e(t,n),t.prototype=null===n?Object.create(n):(r.prototype=n.prototype,new r)}var n=function(){return n=Object.assign||function(e){for(var t,n=1,r=arguments.length;r>n;n++)for(var i in t=arguments[n])({}).hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e},n.apply(this,arguments)};function r(e,t,n){if(n||2===arguments.length)for(var r,i=0,o=t.length;o>i;i++)!r&&i in t||(r||(r=[].slice.call(t,0,i)),r[i]=t[i]);return e.concat(r||[].slice.call(t))}var i=["web","wxwv","minp","alip","baidup","qq","bytedance"],o={autotrack:{type:"boolean",default:!0},compress:{type:"boolean",default:!0},dataCollect:{type:"boolean",default:!0},debug:{type:"boolean",default:!1},hashtag:{type:"boolean",default:!1},touch:{type:"boolean",default:!1},version:{type:"string",default:"1.0.0"},platform:{type:"string",default:"web"},cookieDomain:{type:"string",default:""}},a={enableIdMapping:{type:"boolean",default:!1},gtouchHost:{type:"string",default:""},host:{type:"string",default:""},ignoreFields:{type:"array",default:[]},penetrateHybrid:{type:"boolean",default:!0},scheme:{type:"string",default:location.protocol.indexOf("http")>-1?location.protocol.replace(":",""):"https"},sessionExpires:{type:"number",default:30},performance:{type:"object",default:{monitor:!0,exception:!0}},embeddedIgnore:{type:"array",default:[]}},s={},u=["clearUserId","getGioInfo","getLocation","getOption","init","setDataCollect","setOption","setUserId","track","setGeneralProps","clearGeneralProps"];r(r([],u,!0),["setEvar","setPage","setUser","setVisitor"],!1);var c,d,l,g,f,h,p,v=r(r([],u,!0),["enableDebug","enableHT","setAutotrack","setTrackerHost","setTrackerScheme","setUserAttributes","getVisitorId","getDeviceId","registerPlugins","sendPage","sendVisit","trackTimerStart","trackTimerPause","trackTimerResume","trackTimerEnd","removeTimer","clearTrackTimer"],!1),m=["autotrack","dataCollect","dataSourceId","debug","host","hashtag","scheme"],I={autotrack:"无埋点采集",dataCollect:"数据采集",debug:"调试模式"},w=["send","setConfig","collectImp","setPlatformProfile"],y=["screenHeight","screenWidth"],S="function"==typeof Array.from?Array.from:(d||(d=1,l=function(e){return"function"==typeof e},g=function(e){var t=function(e){var t=Number(e);return isNaN(t)?0:0!==t&&isFinite(t)?(t>0?1:-1)*Math.floor(Math.abs(t)):t}(e);return Math.min(Math.max(t,0),9007199254740991)},f=function(e){if(null!=e){if(["string","number","boolean","symbol"].indexOf(typeof e)>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in e)return Symbol.iterator;if("@@iterator"in e)return"@@iterator"}},h=function(e,t){if(null!=e&&null!=t){var n=e[t];if(null==n)return;if(!l(n))throw new TypeError(n+" is not a function");return n}},p=function(e){var t=e.next();return!t.done&&t},c=function(e){var t,n,r,i=this,o=arguments.length>1?arguments[1]:void 0;if(void 0!==o){if(!l(o))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(t=arguments[2])}var a=h(e,f(e));if(void 0!==a){n=l(i)?Object(new i):[];var s,u,c=a.call(e);if(null==c)throw new TypeError("Array.from requires an array-like or iterable object");for(r=0;;){if(!(s=p(c)))return n.length=r,n;u=s.value,n[r]=o?o.call(t,u,r):u,r++}}else{var d=Object(e);if(null==e)throw new TypeError("Array.from requires an array-like object - not null or undefined");var v,m=g(d.length);for(n=l(i)?Object(new i(m)):Array(m),r=0;m>r;)v=d[r],n[r]=o?o.call(t,v,r):v,r++;n.length=m}return n}),c),O=function(e){return R(["undefined","null"],Q(e))},b=function(e){return"string"===Q(e)},E=function(e){return"number"===Q(e)},C=function(e){var t=Number(e);return t!=t},T=function(e){return"object"===Q(e)&&!O(e)},_=function(e){return"regexp"===Q(e)},k=function(e){return"function"===Q(e)},P=function(e){return Array.isArray(e)&&"array"===Q(e)},x=function(e){return"date"===Q(e)},N=function(e){try{return K(e)[0]}catch(e){return}},q=function(e){try{var t=K(e);return t[t.length-1]}catch(e){return}},A=function(e,t){return void 0===t&&(t=1),P(e)&&E(t)?e.slice(t>0?t:1,e.length):e},D=function(e){if(P(e)){for(var t=0,n=[],r=0,i=e;r<i.length;r++){var o=i[r];o&&!J(o)&&(n[t++]=o)}return n}return e},U=function(e,t){var n=void 0;return P(e)&&e.forEach((function(e){t(e)&&void 0===n&&(n=e)})),n},R=function(e,t){return("array"===Q(e)||"string"===Q(e))&&e.indexOf(t)>=0},K=S,j=function(e){return O(e)?"":"".concat(e)},L=function(e,t){return"string"==typeof e?e.split(t):e},H=function(e){if(b(e)){var t=L(e,"");return"".concat(N(t).toLowerCase()).concat(A(t).join(""))}return e},B=function(e,t){return!!b(e)&&e.slice(0,t.length)===t},F=function(e,t){if(b(e)){var n=e.length,r=n;r>n&&(r=n);var i=r;return(r-=t.length)>=0&&e.slice(r,i)===t}return!1},V={}.hasOwnProperty,G=function(e,t){return!O(e)&&V.call(e,t)},M=function(e){return T(e)?Object.keys(e):[]},z=function(e,t){M(e).forEach((function(n){return t(e[n],n)}))},W=function(e,t){var n=M(e);return!(!T(e)||!T(t)||n.length!==M(t).length||R(n.map((function(n,r){return T(e[n])?W(e[n],t[n]):e[n]===t[n]})),!1))},X=function(e,t){if(!T(e))return!1;try{return"string"===Q(t)?delete e[t]:"array"===Q(t)?t.map((function(t){return delete e[t]})):(_(t)&&M(e).forEach((function(n){t.test(n)&&X(e,n)})),!0)}catch(e){return!1}},J=function(e){return P(e)?0===e.length:T(e)?0===M(e).length:!e},Q=function(e){return{}.toString.call(e).slice(8,-1).toLowerCase()},Z=Object.freeze({__proto__:null,isNil:O,isString:b,isNumber:E,isNaN:C,isBoolean:function(e){return"boolean"===Q(e)},isObject:T,isRegExp:_,isFunction:k,isArray:P,isDate:x,fixed:function(e,t){return E(e)?Number(e.toFixed(E(t)?t:2)):b(e)&&"NaN"!==j(Number(e))?Number(Number(e).toFixed(E(t)?t:2)):e},head:N,last:q,drop:A,dropWhile:function(e,t){return P(e)?e.filter((function(e){return!t(e)})):e},compact:D,find:U,includes:R,arrayFrom:K,toString:j,split:L,lowerFirst:H,upperFirst:function(e){if(b(e)){var t=L(e,"");return"".concat(N(t).toUpperCase()).concat(A(t).join(""))}return e},startsWith:B,endsWith:F,hasOwnProperty:V,has:G,keys:M,forEach:z,isEqual:W,get:function(e,t,n){var r=e;return T(e)?(t.split(".").forEach((function(e){r=r?r[e]:n})),r):n},unset:X,isEmpty:J,typeOf:Q,formatDate:function(e){if(x(e)){var t=function(e){return 10>e?"0"+e:e};return e.getFullYear()+"-"+t(e.getMonth()+1)+"-"+t(e.getDate())+" "+t(e.getHours())+":"+t(e.getMinutes())+":"+t(e.getSeconds())+"."+t(e.getMilliseconds())}return e}}),Y=function(e,t){console.log("%c [GrowingIO]：".concat(e),{info:"color: #3B82F6;",error:"color: #EF4444",warn:"color: #F59E0B",success:"color: #10B981"}[t]||"")},$=function(e){try{return e()}catch(e){return}},ee=function(e){var t={};return T(e)&&z(e,(function(e,n){var r=j(n).slice(0,100);T(e)?t[r]=ee(e):P(e)?(t[r]=e.slice(0,100),"cdp"===window.gioEnvironment&&(t[r]=t[r].join("||"))):t[r]=O(e)?"":j(e).slice(0,1e3)})),t},te=function(e,t,r,i){void 0===i&&(i={}),document.addEventListener?e.addEventListener(t,r,n(n({},{capture:!0}),i)):e.attachEvent?e.attachEvent("on"+t,r):e["on"+t]=r},ne=function(e,t){return b(e)&&!J(e)&&e.match(/^[a-zA-Z_][0-9a-zA-Z_]{0,100}$/)?t():(Y("事件名格式不正确，只能包含数字、字母和下划线，且不能以数字开头，字符总长度不能超过100!","error"),!1)},re=Object.freeze({__proto__:null,consoleText:Y,niceTry:$,limitObject:ee,addListener:te,flattenObject:function(e){void 0===e&&(e={});var t=n({},e);return M(t).forEach((function(e){T(t[e])?(M(t[e]).forEach((function(n){t["".concat(e,"_").concat(n)]=j(t[e][n])})),X(t,e)):P(t[e])?(t[e].forEach((function(n,r){T(n)?M(n).forEach((function(i){t["".concat(e,"_").concat(r,"_").concat(i)]=j(n[i])})):t["".concat(e,"_").concat(r)]=j(n)})),X(t,e)):O(t[e])||""===t[e]?X(t,e):t[e]=j(t[e])})),t},eventNameValidate:ne}),ie=function(e){return b(e)&&e.length>0||E(e)&&e>0},oe=function(e){return e.vdsConfig||e.gioSDKInitialized||window.gioSDKInitialized?(Y("SDK重复初始化，请检查是否重复加载SDK或接入其他平台SDK导致冲突!","warn"),!1):!(R(["","localhost","127.0.0.1"],location.hostname)&&!window._gr_ignore_local_rule&&(Y("当前SDK不允许在本地环境初始化!","warn"),1))},ae=function(e){return!J(D(e))||(Y('SDK初始化失败，请使用 gdp("init", "您的GrowingIO项目 accountId", "您项目的 dataSourceId", options); 进行初始化!',"error"),!1)},se=function(e){var t=N(e),n=q(e);return ie(j(t).trim())?(T(n)&&n||(n={}),{projectId:t,userOptions:n}):(Y("SDK初始化失败，accountId 参数不合法!","error"),!1)},ue=function(e){var t=e[1],n=e[2],r=q(e);return t&&b(t)?T(r)&&r.host?{dataSourceId:t,appId:b(n)?n:"",cdpOptions:r}:(Y("SDK初始化失败，未在配置中指定 host!","error"),!1):(Y("SDK初始化失败，dataSourceId 参数不合法!","error"),!1)},ce=/^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/i,de=/^(https?:\/\/)|(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i,le={},ge={}.hasOwnProperty;function fe(e){try{return decodeURIComponent(e.replace(/\+/g," "))}catch(e){return null}}function he(e){try{return encodeURIComponent(e)}catch(e){return null}}le.stringify=function(e,t){t=t||"";var n,r,i=[];for(r in"string"!=typeof t&&(t="?"),e)if(ge.call(e,r)){if((n=e[r])||null!=n&&!isNaN(n)||(n=""),r=he(r),n=he(n),null===r||null===n)continue;i.push(r+"="+n)}return i.length?t+i.join("&"):""},le.parse=function(e){for(var t,n=/([^=?#&]+)=?([^&]*)/g,r={};t=n.exec(e);){var i=fe(t[1]),o=fe(t[2]);null===i||null===o||i in r||(r[i]=o)}return r};var pe={name:"gioCustomTracking",method:function(e){var t=this;this.growingIO=e,this.getValidResourceItem=function(e){if(e&&T(e)&&e.id&&e.key){var t={id:b(e.id)?e.id:j(e.id),key:b(e.key)?e.key:j(e.key)};return e.attributes&&(t.attributes=e.attributes),t}},this.getDynamicAttributes=function(e){return O(e)||M(e).forEach((function(t){k(e[t])?e[t]=e[t]():T(e[t])?X(e,t):P(e[t])||(e[t]=j(e[t]))})),e},this.buildCustomEvent=function(e,r,i,o){ne(e,(function(){var a=t.growingIO.dataStore,s=a.eventContextBuilder,u=a.eventConverter,c=a.currentPage,d=n({eventType:"CUSTOM",eventName:e,pageShowTimestamp:null==c?void 0:c.time,attributes:ee(t.getDynamicAttributes(T(r)&&!J(r)?r:void 0)),resourceItem:ee(t.getValidResourceItem(i))},s());J(o)||(d=n(n({},d),o)),u(d)}))},this.buildUserAttributesEvent=function(e,r){var i=t.growingIO.dataStore,o=i.eventContextBuilder,a=i.eventConverter,s=n({eventType:"LOGIN_USER_ATTRIBUTES",attributes:ee(e)},o());J(r)||(s=n(n({},s),r)),a(s)}}},ve=["gioPerformance"],me=function(e){function n(t){var n=e.call(this,t)||this;return n.growingIO=t,n.pluginsContext={plugins:{gioCustomTracking:pe}},n}return t(n,e),n}((function(e){var t,n,r,i,o=this;this.growingIO=e,this.innerPluginInit=function(){var e;ve.forEach((function(e){var t;return X(null===(t=o.pluginsContext)||void 0===t?void 0:t.plugins,e)})),M(null===(e=o.pluginsContext)||void 0===e?void 0:e.plugins).forEach((function(e){var t,n=null===(t=o.pluginsContext)||void 0===t?void 0:t.plugins[e],r=n.name,i=n.method;U(o.pluginItems,(function(e){return e.name===r}))||o.pluginItems.push({name:H(r||e),method:i||function(e){}})})),J(o.pluginItems)||o.installAll()},this.install=function(e,t,n){var r,i,a=t||U(o.pluginItems,(function(t){return t.name===e}));if((null===(r=o.growingIO)||void 0===r?void 0:r.plugins)[e])return Y("重复加载插件 ".concat(e," 或插件重名，已跳过加载!"),"warn"),!1;if(!a)return Y("插件加载失败!不存在名为 ".concat(e," 的插件!"),"error"),!1;try{return(null===(i=o.growingIO)||void 0===i?void 0:i.plugins)[e]=new a.method(o.growingIO,n),"cdp"===o.growingIO.gioEnvironment&&t&&Y("加载插件：".concat(e),"info"),!0}catch(e){return Y("插件加载异常：".concat(e),"error"),!1}},this.installAll=function(e){(e||o.pluginItems).forEach((function(t){return o.install(t.name,e?t:void 0,e?null==t?void 0:t.options:void 0)}))},this.uninstall=function(e){var t;X(o.pluginItems,e);var n=X(null===(t=o.growingIO)||void 0===t?void 0:t.plugins,e);return n||Y("卸载插件 ".concat(e," 失败!"),"error"),n},this.uninstallAll=function(){o.pluginItems.forEach((function(e){return o.uninstall(e.name)}))},this.lifeError=function(e,t){return Y("插件执行错误 ".concat(e.name," ").concat(t),"error")},this.onComposeBefore=function(e){o.pluginItems.forEach((function(t){var n,r=null===(n=o.growingIO.plugins[t.name])||void 0===n?void 0:n.onComposeBefore;if(r&&k(r))try{r(e)}catch(e){o.lifeError(t,e)}}))},this.onComposeAfter=function(e){o.pluginItems.forEach((function(t){var n,r=null===(n=o.growingIO.plugins[t.name])||void 0===n?void 0:n.onComposeAfter;if(r&&k(r))try{r(e)}catch(e){o.lifeError(t,e)}}))},this.onSendBefore=function(e){o.pluginItems.forEach((function(t){var n,r=null===(n=o.growingIO.plugins[t.name])||void 0===n?void 0:n.onSendBefore;if(r&&k(r))try{r(e)}catch(e){o.lifeError(t,e)}}))},this.onSendAfter=function(e){o.pluginItems.forEach((function(t){var n,r=null===(n=o.growingIO.plugins[t.name])||void 0===n?void 0:n.onSendAfter;if(r&&k(r))try{r(e)}catch(e){o.lifeError(t,e)}}))},this.pluginsContext={plugins:{}},this.pluginItems=[],null===(t=this.growingIO.emitter)||void 0===t||t.on("onComposeBefore",this.onComposeBefore),null===(n=this.growingIO.emitter)||void 0===n||n.on("onComposeAfter",this.onComposeAfter),null===(r=this.growingIO.emitter)||void 0===r||r.on("onSendBefore",this.onSendBefore),null===(i=this.growingIO.emitter)||void 0===i||i.on("onSendAfter",this.onSendAfter)}));function Ie(e){for(var t=1;arguments.length>t;t++){var n=arguments[t];for(var r in n)e[r]=n[r]}return e}var we,ye=function e(t,n){function r(e,r,i){if("undefined"!=typeof document){"number"==typeof(i=Ie({},n,i)).expires&&(i.expires=new Date(Date.now()+864e5*i.expires)),i.expires&&(i.expires=i.expires.toUTCString()),e=encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape);var o="";for(var a in i)i[a]&&(o+="; "+a,!0!==i[a]&&(o+="="+i[a].split(";")[0]));return document.cookie=e+"="+t.write(r,e)+o}}return Object.create({set:r,get:function(e){if("undefined"!=typeof document&&(!arguments.length||e)){for(var n=document.cookie?document.cookie.split("; "):[],r={},i=0;i<n.length;i++){var o=n[i].split("="),a=o.slice(1).join("=");try{var s=decodeURIComponent(o[0]);if(r[s]=t.read(a,s),e===s)break}catch(e){}}return e?r[e]:r}},remove:function(e,t){r(e,"",Ie({},t,{expires:-1}))},withAttributes:function(t){return e(this.converter,Ie({},this.attributes,t))},withConverter:function(t){return e(Ie({},this.converter,t),this.attributes)}},{attributes:{value:Object.freeze(n)},converter:{value:Object.freeze(t)}})}({read:function(e){return'"'===e[0]&&(e=e.slice(1,-1)),e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent)},write:function(e){return encodeURIComponent(e).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,decodeURIComponent)}},{path:"/"}),Se=function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){var t=16*Math.random()|0;return("x"===e?t:3&t|8).toString(16)}))},Oe=function(){var e,t=!!(null===(e=null===window||void 0===window?void 0:window.navigator)||void 0===e?void 0:e.sendBeacon),n=window.navigator.userAgent;if(n.match(/(iPad|iPhone|iPod)/g)){var r=be(n);return t&&r>13}return t},be=function(e){var t=e.toLowerCase().match(/cpu.*os (.*?) like mac os/i);return!t||2>t.length?0:+t[1].split("_").slice(0,2).join(".")},Ee=function(e){ye.set("gioCookie","yes",{domain:e});var t=!!ye.get("gioCookie",{domain:e});return ye.remove("gioCookie",{domain:e}),t},Ce=function(e){return F(e,"_gioenc")?e.slice(0,-7):e},Te=function(e){return C(Number(e))&&$((function(){return JSON.parse(e)}))||e},_e={A:1,a:1,Z:1,z:1,"@":1},ke=function(e){return O(e)?e:$((function(){return"gioenc-".concat(xe(e))}))||e},Pe=function(e){return b(e)&&B(e,"gioenc-")&&$((function(){return xe(e.replace("gioenc-",""))}))||e},xe=function(e){return(e=e||"").split("").map((function(e){return _e[e]?e:Ne(e)})).join("")},Ne=function(e){if(/[0-9]/.test(e))return 1^+e;var t=e.charCodeAt(0);return String.fromCharCode(1^t)},qe={},Ae=function(){var e=window.location.hostname,t=$((function(){var t=e.split("."),n=q(t);if("localhost"!==e&&(C(Number(n))||0>Number(n)||Number(n)>255))return[".".concat(t.slice(-2).join(".")),".".concat(t.slice(-3).join("."))]}))||[e],n="";return t.some((function(e){return!!Ee(e)&&(n=e,!0)})),n}(),De=!R(["","localhost","127.0.0.1"],window.location.hostname)&&R(["http:","https:"],window.location.protocol)&&Ae?new function(e){var t=this;this.domain=e,this.getItem=function(e){return Te(Pe(ye.get(Ce(e))))},this.setItem=function(e,n,r){var i;i=b(n)?n.length?F(e,"_gioenc")?ke(n):n:"":JSON.stringify(n),ye.set(Ce(e),i,{expires:r?new Date(r):3650,domain:t.domain})},this.removeItem=function(e){ye.remove(Ce(e),{domain:t.domain})},this.hasItem=function(e){return R(M(ye.get()),Ce(e))},this.getKeys=function(){return M(ye.get())},this.type="Cookie"}(Ae):function(e){try{var t=window.localStorage,n="__storage_test__";return t.setItem(n,n),t.removeItem(n),!0}catch(e){return!1}}()?new function(){this.getItem=function(e){var t=$((function(){return JSON.parse(localStorage.getItem(Ce(e))||"")}))||{};return T(t)&&t.expiredAt>+Date.now()?Te(Pe(t.value)):void 0},this.setItem=function(e,t,n){var r=null!=n?n:+new Date(9999,12);localStorage.setItem(Ce(e),JSON.stringify({value:b(t)&&t.length&&F(e,"_gioenc")?ke(t):t,expiredAt:r}))},this.removeItem=function(e){return localStorage.removeItem(Ce(e))},this.hasItem=function(e){return!!localStorage.getItem(Ce(e))},this.getKeys=function(){return K(Array(localStorage.length)).map((function(e,t){return localStorage.key(t)}))},this.type="localStorage"}:new function(){this.getItem=function(e){var t=$((function(){return JSON.parse(qe[Ce(e)]||"")}));return T(t)&&t.expiredAt>+Date.now()?Te(Pe(t.value)):void 0},this.setItem=function(e,t,n){var r=null!=n?n:+new Date(9999,12);qe[Ce(e)]=JSON.stringify({value:b(t)&&t.length?ke(t):t,expiredAt:r})},this.removeItem=function(e){return X(qe,Ce(e))},this.hasItem=function(e){return G(qe,Ce(e))},this.getKeys=function(){return M(qe)},this.type="memory"},Ue=function(){function e(e){var t,n=this;this.growingIO=e;var r=this.growingIO.vdsConfig.projectId,i=this.growingIO.storage,o=i.getItem,a=i.setItem;this.getItem=o,this.setItem=a,this.sIdStorageName="".concat(r,"_gdp_session_id"),this.uidStorageName="gdp_user_id_gioenc",this.userIdStorageName="".concat(r,"_gdp_cs1_gioenc"),this.userKeyStorageName="".concat(r,"_gdp_user_key_gioenc"),this.gioIdStorageName="".concat(r,"_gdp_gio_id_gioenc"),null===(t=this.growingIO.emitter)||void 0===t||t.on("SESSIONID_UPDATE",(function(){n.growingIO.gioSDKInitialized&&(n.growingIO.dataStore.sendVisit(!0),n.growingIO.dataStore.sendPage(!0))}))}return Object.defineProperty(e.prototype,"sessionId",{get:function(){return this.getItem(this.sIdStorageName)||(this.sessionId=Se(),this.sessionId)},set:function(e){var t;e||(e=Se());var n=this.getItem(this.sIdStorageName)||this.prevSessionId,r=this.growingIO.vdsConfig.sessionExpires,i=void 0===r?30:r;this.setItem(this.sIdStorageName,e,+Date.now()+60*i*1e3),n!==e&&(null===(t=this.growingIO.emitter)||void 0===t||t.emit("SESSIONID_UPDATE",{newSessionId:e,oldSessionId:n})),this.prevSessionId=e},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"uid",{get:function(){return this.getItem(this.uidStorageName)||(this.uid=Se(),this.uid)},set:function(e){var t,n=this.getItem(this.uidStorageName)||this.prevUId;this.setItem(this.uidStorageName,e),n!==e&&(null===(t=this.growingIO.emitter)||void 0===t||t.emit("UID_UPDATE",{newUId:e,oldUId:n})),this.prevUId=e},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"userId",{get:function(){return this.getItem(this.userIdStorageName)||""},set:function(e){var t,n=this.getItem(this.userIdStorageName)||this.prevUserId;this.setItem(this.userIdStorageName,e),n!==e&&(null===(t=this.growingIO.emitter)||void 0===t||t.emit("USERID_UPDATE",{newUserId:e,oldUserId:n,userKey:this.userKey})),e&&(this.gioId=e),this.prevUserId=e},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"userKey",{get:function(){return this.getItem(this.userKeyStorageName)||""},set:function(e){var t,n=this.getItem(this.userKeyStorageName)||this.prevUserKey;this.setItem(this.userKeyStorageName,e),n!==e&&(null===(t=this.growingIO.emitter)||void 0===t||t.emit("USERKEY_UPDATE",{newUserKey:e,oldUserKey:n,userId:this.userId})),this.prevUserKey=e},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"gioId",{get:function(){return this.getItem(this.gioIdStorageName)||""},set:function(e){var t,n=this.getItem(this.gioIdStorageName)||this.prevGioId;this.setItem(this.gioIdStorageName,e),n!==e&&(null===(t=this.growingIO.emitter)||void 0===t||t.emit("GIOID_UPDATE",{newGioId:e,oldGioId:n})),this.prevGioId=e},enumerable:!1,configurable:!0}),e}(),Re=function(e){var t=this;this.growingIO=e,this.main=function(){var e,r=t.growingIO,i=r.sdkVersion,o=r.useEmbeddedInherit,a=r.vdsConfig,s=r.userStore,u=r.dataStore,c=r.trackingId,d=u.currentPage,l=d.path,g=d.query,f={appVersion:a.version,dataSourceId:a.dataSourceId,deviceId:s.uid,domain:o?a.appId:window.location.host,gioId:s.gioId,language:navigator.language,path:l,platform:a.platform,query:g,referralPage:(null===(e=u.lastPageEvent)||void 0===e?void 0:e.referralPage)||"",screenHeight:window.screen.height,screenWidth:window.screen.width,sdkVersion:i,sessionId:s.sessionId,timestamp:+Date.now(),title:document.title.slice(0,255),userId:s.userId};if(a.enableIdMapping&&(f.userKey=s.userKey),J(a.ignoreFields)||a.ignoreFields.forEach((function(e){X(f,e)})),o&&!J(t.minpExtraParams)){var h=n({},f);z(n(n({},f),t.minpExtraParams),(function(e,n){var r;R(a.embeddedIgnore,n)?(f[n]=h[n],"domain"===n&&(f[n]=window.location.host)):f[n]=null!==(r=t.minpExtraParams[n])&&void 0!==r?r:f[n]}))}return f.trackingId=c,f},this.minpExtraParams={}},Ke=function(e){var t=this;this.growingIO=e,this.parsePage=function(){var e=t.growingIO.vdsConfig.hashtag,n=location.pathname,r=location.search,i=location.hash,o=i.indexOf("?");t.domain=window.location.host,t.title=document.title.slice(0,255),t.time=+Date.now(),t.path=n,t.query=r,e&&(o>-1?(t.path+=i.slice(0,o),t.query=t.query+"&"+i.slice(o+1)):t.path+=i),t.query&&R(["?","&"],t.query.charAt(0))&&(t.query=t.query.slice(1))},this._getNoHashHref=function(){var e=window.location,t=e.protocol,n=e.host,r=e.pathname,i=e.search;return"".concat(t,"://").concat(n).concat(r).concat(i)},this.pageListener=function(){var e=t.growingIO.vdsConfig.hashtag,n=window.location.href,r=t.lastHref;e||(n=t._getNoHashHref(),r=t.lastNoHashHref),r!==n&&(t.parsePage(),t.buildPageEvent())},this.hookHistory=function(){var e=window.history.pushState,n=window.history.replaceState,r=t;e&&$((function(){return window.history.pushState=function(){e.apply(window.history,arguments),setTimeout(r.pageListener)}})),n&&$((function(){return window.history.replaceState=function(){n.apply(window.history,arguments),setTimeout(r.pageListener)}})),te(window,"popstate",t.pageListener),t.growingIO.vdsConfig.hashtag&&te(window,"hashchange",t.pageListener)},this.buildPageEvent=function(e){var r=t.growingIO.dataStore,i=r.lastPageEvent,o=r.eventContextBuilder,a=r.eventConverter,s=n(n({eventType:"PAGE"},o()),{protocolType:location.protocol.substring(0,location.protocol.length-1),referralPage:(null==i?void 0:i.path)===t.path&&(null==i?void 0:i.query)===t.query?null==i?void 0:i.referralPage:(null==i?void 0:i.path)?t.lastHref:document.referrer});J(e)||(s=n(n({},s),e)),s.timestamp=t.time,a(s),t.lastHref=window.location.href,t.lastNoHashHref=t._getNoHashHref(),t.lastLocation=n({},window.location)},this.title=document.title.slice(0,255),this.lastLocation=n({},window.location)},je=function(){function e(e){var t,r,u=this;this.growingIO=e,this.ALLOW_SETTING=n(n({},o),"saas"===this.growingIO.gioEnvironment?s:a),this.allowOptKeys=Object.keys(this.ALLOW_SETTING),this.trackTimers={},this.initStorageId=function(){var e=u.growingIO.storage.getItem(u.seqStorageIdName)||{},t=n({},e);X(t,"globalKey"),t=T(t)&&!O(t)?t:{},u._esid={},M(t).forEach((function(e){u._esid[e]=C(Number(t[e]))||t[e]>=1e9||1>t[e]?1:t[e]})),W(t,u._esid)||u.setSequenceIds("esid",u._esid);var r=Number(e.globalKey);u._gsid=C(r)||r>=1e9||1>r?1:r,r!==u._gsid&&u.setSequenceIds("gsid",u._gsid)},this.setSequenceIds=function(e,t){var r=u.growingIO.storage.getItem(u.seqStorageIdName)||{};"gsid"===e?r.globalKey=t:r=n(n({},r),t),u.growingIO.storage.setItem(u.seqStorageIdName,r)},this.initOptions=function(e){var t,r,o,a,s,c,d=e.projectId,l=e.dataSourceId,g=e.appId;u.initialDataSourceId=l;var f={};u.allowOptKeys.forEach((function(t){var n=u.ALLOW_SETTING[t].type,r=P(n)?!R(n,Q(e[t])):Q(e[t])!==n;"platform"!==t||R(i,e[t])||(r=!0),r?f[t]=u.ALLOW_SETTING[t].default:"ignoreFields"===t?f.ignoreFields=e.ignoreFields.filter((function(e){return R(y,e)})):(f[t]=e[t],R(["dataCollect","autotrack"],t)&&(f[t]||Y("已关闭".concat(I[t]),"info")))})),f.sessionExpires=Math.round(f.sessionExpires),(C(f.sessionExpires)||1>f.sessionExpires||f.sessionExpires>360)&&(f.sessionExpires=30),"Cookie"===u.growingIO.storage.type&&f.cookieDomain&&Ee(f.cookieDomain)&&(u.growingIO.storage.domain=f.cookieDomain),u.growingIO.vdsConfig=n(n({},f),{projectId:d,dataSourceId:l,appId:g,sdkVer:u.growingIO.sdkVersion,performance:{monitor:null===(r=null===(t=f.performance)||void 0===t?void 0:t.monitor)||void 0===r||r,exception:null===(a=null===(o=f.performance)||void 0===o?void 0:o.exception)||void 0===a||a,network:null!==(c=null===(s=f.performance)||void 0===s?void 0:s.network)&&void 0!==c&&c}}),window.vds=u.growingIO.vdsConfig,u.seqStorageIdName="".concat(d,"_gdp_sequence_ids")},this.setOption=function(e,t){var r,i=u.growingIO,o=i.vdsConfig,a=i.callError,s=i.uploader,c=i.emitter,d=b(e)&&R(m,e),l=d&&typeof t===((null===(r=u.ALLOW_SETTING[e])||void 0===r?void 0:r.type)||"string"),g=n({},o);return d&&l?(o[e]=t,"dataCollect"===e&&g.dataCollect!==t&&(t?(u.sendVisit(!0),u.sendPage()):u.growingIO.clearTrackTimer()),R(["host","scheme"],e)&&(null==s||s.generateHost()),null==c||c.emit("OPTION_CHANGE",{optionName:e,optionValue:t}),!0):(a("setOption > ".concat(e)),!1)},this.getOption=function(e){var t=u.growingIO,r=t.vdsConfig,i=t.callError;return e&&G(r,j(e))?r[j(e)]:O(e)?n({},r):void i("getOption > ".concat(e))},this.sendVisit=function(e){var t=u.growingIO,n=t.userStore.sessionId,r=t.vdsConfig,i=r.projectId,o=r.dataCollect,a=t.storage;if(o){var s="".concat(i,"_gdp_session_id_").concat(n),c=a.getItem(s);!e&&R([!0,"true"],c)||(u.buildVisitEvent(),a.setItem(s,!0))}},this.buildVisitEvent=function(e){var t=u.growingIO.dataStore,r=t.eventContextBuilder,i=t.eventConverter,o=n(n({eventType:"VISIT"},r()),{referral:u.lastVisitEvent.referral,referralPage:u.lastPageEvent.referralPage});J(e)||(o.session=(null==e?void 0:e.session)||o.session,o.trackingId=null==e?void 0:e.trackingId,o=n(n({},o),e)),i(o)},this.sendPage=function(e){e&&u.currentPage.parsePage(),u.currentPage.buildPageEvent()},this.buildErrorEvent=function(e){var t=u.growingIO.dataStore,r=t.eventContextBuilder;(0,t.eventConverter)(n({eventType:"CUSTOM",pageShowTimestamp:u.currentPage.time,eventName:"onError",attributes:e},r()))},this.currentPage=new Ke(this.growingIO),this.eventContextBuilderInst=new Re(this.growingIO),this.eventContextBuilder=this.eventContextBuilderInst.main,this.generalProps={},this.lastVisitEvent={referralPage:document.referrer},null===(t=this.growingIO.emitter)||void 0===t||t.on("onComposeAfter",(function(e){var t=e.composedEvent;"VISIT"!==t.eventType&&"vst"!==t.t||t.trackingId!==u.growingIO.trackingId||(u.lastVisitEvent=t)})),this.lastPageEvent={},null===(r=this.growingIO.emitter)||void 0===r||r.on("onComposeAfter",(function(e){var t=e.composedEvent;"PAGE"!==t.eventType&&"page"!==t.t||t.trackingId!==u.growingIO.trackingId||(u.lastPageEvent=t)}))}return Object.defineProperty(e.prototype,"esid",{get:function(){var e=this,t=this.growingIO.storage.getItem(this.seqStorageIdName)||{},r=n({},t);return X(r,"globalKey"),r=T(r)&&!O(r)?r:{},this._esid={},M(r).forEach((function(t){e._esid[t]=C(Number(r[t]))||r[t]>=1e9||1>r[t]?1:r[t]})),this._esid},set:function(e){var t={};M(e).forEach((function(n){t[n]=C(e[n])||e[n]>=1e9||1>e[n]?1:e[n]})),W(this._esid,t)||(this._esid=t,this.setSequenceIds("esid",this._esid))},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"gsid",{get:function(){var e=this.growingIO.storage.getItem(this.seqStorageIdName)||{},t=Number(e.globalKey);return this._gsid=C(t)||t>=1e9||1>t?1:t,this._gsid},set:function(e){C(Number(e))||e>=1e9||1>e?this._gsid=1:this._gsid=e,this.setSequenceIds("gsid",this._gsid)},enumerable:!1,configurable:!0}),e}(),Le=function(e){function r(t){var r=e.call(this,t)||this;return r.growingIO=t,r.eventConverter=function(e){var t,i,o=r.growingIO,a=o.vdsConfig,s=o.dataStore,u=o.uploader;if(a.dataCollect){e.trackingId===r.growingIO.trackingId&&(e.globalSequenceId=s.gsid,e.eventSequenceId=s.esid[e.eventType]||1);var c={};z(e,(function(e,t){var n;if("element"===t){var r=null!==(n=N(e))&&void 0!==n?n:{};z(r,(function(e,t){J(e)&&0!==e||(c[t]=e)}))}else(J(e)||O(e))&&0!==e||(c[t]=e)})),e.trackingId===r.growingIO.trackingId&&(r.growingIO.dataStore.gsid+=1,r.growingIO.dataStore.esid=n(n({},r.growingIO.dataStore.esid),((t={})[c.eventType]=(r.growingIO.dataStore.esid[c.eventType]||1)+1,t))),null===(i=r.growingIO.emitter)||void 0===i||i.emit("onComposeAfter",{composedEvent:n({},c)}),e.trackingId===r.growingIO.trackingId&&u.commitRequest(c)}},r}return t(r,e),r}(je),He=function(e){function n(t){var n=e.call(this,t)||this;return n.growingIO=t,n.generateHost=function(){var e=n.growingIO.vdsConfig,t=e.scheme,r=e.host,i=void 0===r?"":r,o=e.projectId;t?F(j(t),"://")||(t="".concat(t,"://")):t="".concat(location.protocol.indexOf("http")>-1?location.protocol.replace(":",""):"https","//"),B(i,"http")&&(i=i.substring(i.indexOf("://")+(F(j(t),"://")?3:0))),n.requestURL="".concat(t).concat(i,"/v3/projects/").concat(o,"/collect")},n.requestURL="",n.generateHost(),n}return t(n,e),n}((function(e){var t=this;this.growingIO=e,this.commitRequest=function(e){var r=n({},e);t.requestQueue.push(n(n({},r),{requestType:Oe()?"Beacon":"XHR"})),t.initiateRequest()},this.initiateRequest=function(){var e,i,o;if(r([],t.requestQueue,!0).length>0&&t.requestingNum<t.requestLimit){var a=t.growingIO,s=a.vdsConfig,u=a.emitter,c=a.plugins,d=a.useHybridInherit;if(t.requestQueue=r([],t.requestQueue,!0).filter((function(e){return(t.retryIds[e.globalSequenceId||e.esid]||0)<=t.retryLimit})),J(t.requestQueue))return;var l=t.requestQueue.shift(),g=l.requestType;if(null==u||u.emit("onSendBefore",{requestData:l}),X(l,["requestType","trackingId"]),s.debug&&console.log("[GrowingIO Debug]:",JSON.stringify(l,null,2).replace(/\"/g,(o=window.navigator.userAgent,/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(o)&&!/chrome\/(\d+\.\d+)/i.test(o)?"":'"'))),t.requestingNum+=1,d)return t.requestSuccessFn(l),!1;var f=n({},l);switch(s.compress&&(null===(e=null==c?void 0:c.gioCompress)||void 0===e?void 0:e.compressToUint8Array)?(t.compressType="1",f=null===(i=null==c?void 0:c.gioCompress)||void 0===i?void 0:i.compressToUint8Array(JSON.stringify([f]))):(t.compressType="0",f=JSON.stringify([f])),g){case"Beacon":default:t.sendByBeacon(l,f);break;case"XHR":t.sendByXHR(l,f);break;case"Image":t.sendByImage(l,f)}}},this.generateURL=function(){return"".concat(t.requestURL,"?stm=").concat(+Date.now(),"&compress=").concat(t.compressType)},this.sendByBeacon=function(e,n){navigator.sendBeacon(t.generateURL(),n)?t.requestSuccessFn(e):t.requestFailFn(e,"Beacon")},this.sendByXHR=function(e,n){var r,i=R(["unload","beforeunload","pagehide"],null===(r=null===window||void 0===window?void 0:window.event)||void 0===r?void 0:r.type),o=new XMLHttpRequest;if(o)return o.open("POST",t.generateURL(),i),o.onreadystatechange=function(){4===o.readyState&&204===o.status?t.requestSuccessFn(e):t.requestFailFn(e,"XHR")},o.setRequestHeader("Content-Type","text/plain;charset=UTF-8"),void o.send(n);if(null===window||void 0===window?void 0:window.XDomainRequest){var a=new window.XDomainRequest;a.open("POST",t.generateURL().replace("https://","http://"),i),a.onload=function(){204===a.status?t.requestSuccessFn(e):t.requestFailFn(e,"XHR")},a.onerror=a.ontimeout=function(){t.requestFailFn(e,"XHR")},a.send(n)}},this.sendByImage=function(e,n){var r="".concat(t.generateURL(),"&data=").concat(n),i=document.createElement("img");i.width=1,i.height=1,i.onload=function(){t.requestSuccessFn(e),t.clearImage(i)},i.onerror=i.onabort=function(){t.requestFailFn(e,"Image"),t.clearImage(i)},i.src=r},this.clearImage=function(e){e.src="",e.onload=function(){},e.onerror=e.onerabort=function(){},e=null},this.requestSuccessFn=function(e){var n;t.requestingNum-=1;var r=e.globalSequenceId||e.esid||-1;t.retryIds[r]&&(t.retryIds[r]=0),t.growingIO.userStore.sessionId=t.growingIO.userStore.sessionId,null===(n=t.growingIO.emitter)||void 0===n||n.emit("onSendAfter",{requestData:e}),t.initiateRequest()},this.requestFailFn=function(e,r){t.requestingNum-=1;var i=e.globalSequenceId||e.esid||-1;t.retryIds[i]||(t.retryIds[i]=0),t.retryIds[i]+=1;var o=t.requestQueue.some((function(t){return t.globalSequenceId===e.globalSequenceId&&t.esid===e.esid})),a=r;t.retryIds[i]<t.retryLimit+1||(a="Beacon"===r?"XHR":"XHR"===r?"Image":void 0,t.retryIds[i]=0),!o&&a&&t.requestQueue.push(n(n({},e),{requestType:a}))},this.requestQueue=[],this.requestLimit=10,this.requestTimeout=5e3,this.retryLimit=1,this.retryIds={},this.requestingNum=0,this.requestURL=""})),Be=function(e){function i(){var t=e.call(this)||this;return t.registerPlugins=function(e){P(e)?(e.forEach((function(t,r){var i,o;J(t)||O(t)?Y("插件不合法，跳过加载!","warn"):(null===(i=t.js)||void 0===i?void 0:i.default)&&(e[r]=n(n({},null===(o=t.js)||void 0===o?void 0:o.default),{options:t.options}))})),e=D(e),t.plugins.pluginItems=r(r([],t.plugins.pluginItems,!0),e,!0),t.plugins.installAll(e)):Y("插件注册失败，请检查!","error")},t.initCallback=function(){var e,n;t.userStore=new Ue(t),t.uploader=new He(t),null===(n=null===(e=t.plugins)||void 0===e?void 0:e.gioEventAutoTracking)||void 0===n||n.main(),t.vdsConfig.enableIdMapping||(t.userStore.userKey="")},t.setTrackerScheme=function(e){R(["http","https"],e)?(t.dataStore.setOption("scheme",e),t.notRecommended()):t.callError("scheme",!1)},t.setTrackerHost=function(e){ce.test(e)||de.test(e)?(t.dataStore.setOption("host",e),t.notRecommended()):t.callError("host",!1)},t.setDataCollect=function(e){t.setOption("dataCollect",!!e),t.notRecommended()},t.setAutotrack=function(e){t.setOption("autotrack",!!e),t.notRecommended()},t.enableDebug=function(e){t.setOption("debug",!!e),t.notRecommended()},t.enableHT=function(e){t.setOption("hashtag",!!e),t.notRecommended()},t.getVisitorId=function(){return t.userStore.uid},t.getDeviceId=function(){return t.userStore.uid},t.setUserAttributes=function(e,n){var r,i;!J(e)&&T(e)?null===(i=null===(r=t.plugins)||void 0===r?void 0:r.gioCustomTracking)||void 0===i||i.buildUserAttributesEvent(e,n):t.callError("setUserAttributes")},t.setUserId=function(e,n){if(ie(j(e).trim())){var r=t.userStore.gioId;t.vdsConfig.enableIdMapping&&(t.userStore.userKey=!O(n)&&j(n).length>0?j(n).slice(0,1e3):""),e=j(e).slice(0,1e3),t.userStore.userId=e,r&&r!==e&&(t.userStore.sessionId=""),r||r===e||t.dataStore.sendVisit(!0)}else t.clearUserId(),t.callError("setUserId")},t.clearUserId=function(){t.userStore.userId="",t.userStore.userKey=""},t.track=function(e,r,i,o){var a,s;((null===(s=null===(a=t.plugins)||void 0===a?void 0:a.gioCustomTracking)||void 0===s?void 0:s.buildCustomEvent)||function(){})(e,n(n({},t.dataStore.generalProps),T(r)&&!J(r)?r:{}),i,o)},t.sendPage=function(e){return t.dataStore.currentPage.buildPageEvent(e)},t.sendVisit=function(e){return t.dataStore.buildVisitEvent(e)},t.trackTimerStart=function(e,n){t.vdsConfig.dataCollect&&ne(e,(function(){var r=Se();k(n)?(t.dataStore.trackTimers[r]={eventName:e,leng:0,start:+Date.now()},n(r)):Y("回调方法不合法，返回timerId失败!")}))},t.trackTimerPause=function(e){if(e&&t.dataStore.trackTimers[e]){var n=t.dataStore.trackTimers[e];n.start&&(n.leng=n.leng+(+Date.now()-n.start)),n.start=0}},t.trackTimerResume=function(e){if(e&&t.dataStore.trackTimers[e]){var n=t.dataStore.trackTimers[e];0===n.start&&(n.start=+Date.now())}},t.trackTimerEnd=function(e,r){if(t.vdsConfig.dataCollect)if(e&&t.dataStore.trackTimers[e]){var i=t.dataStore.trackTimers[e];if(0!==i.start){var o=+Date.now()-i.start;i.leng=o>0?i.leng+o:0}t.track(i.eventName,n(n({},r),{eventDuration:i.leng>864e5?0:i.leng/1e3})),t.removeTimer(e)}else Y("未查找到对应的计时器，请检查!","error")},t.removeTimer=function(e){e&&t.dataStore.trackTimers[e]&&delete t.dataStore.trackTimers[e]},t.clearTrackTimer=function(){t.dataStore.trackTimers={}},t.dataStore=new Le(t),t}return t(i,e),i}((function(){var e,t=this;this.trackingId="g0",this.init=function(e){var n,r,i,o,a,s;Y("Gio Web SDK 初始化中...","info");var u=t.dataStore,c=u.initOptions,d=u.currentPage,l=u.sendVisit,g=u.sendPage;c(e),t.useEmbeddedInherit=null===(r=null===(n=t.plugins)||void 0===n?void 0:n.gioEmbeddedAdapter)||void 0===r?void 0:r.main(e),t.useHybridInherit=null===(o=null===(i=t.plugins)||void 0===i?void 0:i.gioHybridAdapter)||void 0===o?void 0:o.main(e),null==t||t.initCallback(),d.hookHistory(),d.parsePage(),null===(a=t.emitter)||void 0===a||a.emit("SDK_INITIALIZED",t),Y("Gio Web SDK 初始化完成！","success"),t.useEmbeddedInherit||l(),g(),t.gioSDKInitialized=!0,null===(s=t.emitter)||void 0===s||s.emit("SDK_INITIALIZED_COMPLATE",t)},this.setOption=function(e,n){if(R(m,e)){var r=t.dataStore.setOption(e,n);return r&&I[e]&&Y("已".concat(n?"开启":"关闭").concat(I[e]),"info"),r}return Y("不存在可修改的配置项：".concat(e,"，请检查后重试!"),"warn"),!1},this.getOption=function(e){return t.dataStore.getOption(e)},this.setGeneralProps=function(e){T(e)&&!J(e)?(t.dataStore.generalProps=n(n({},t.dataStore.generalProps),e),M(t.dataStore.generalProps).forEach((function(e){R([void 0,null],t.dataStore.generalProps[e])&&(t.dataStore.generalProps[e]="")}))):t.callError("setGeneralProps")},this.clearGeneralProps=function(e){P(e)&&!J(e)?e.forEach((function(e){X(t.dataStore.generalProps,e)})):t.dataStore.generalProps={}},this.reissuePage=function(){t.dataStore.sendPage()},this.notRecommended=function(){return Y("不推荐的方法使用，建议使用 gio('setOption', [optionName], [value])!","info")},this.callError=function(e,t,n){return void 0===t&&(t=!0),void 0===n&&(n="参数不合法"),Y("".concat(t?"调用":"设置"," ").concat(e," 失败，").concat(n,"!"),"warn")},this.gioEnvironment="cdp",this.sdkVersion="3.8.0-rc.10",this.utils=n(n(n({},Z),re),{qs:le}),this.emitter={all:e=e||new Map,on:function(t,n){var r=e.get(t);r?r.push(n):e.set(t,[n])},off:function(t,n){var r=e.get(t);r&&(n?r.splice(r.indexOf(n)>>>0,1):e.set(t,[]))},emit:function(t,n){var r=e.get(t);r&&r.slice().map((function(e){e(n)})),(r=e.get("*"))&&r.slice().map((function(e){e(t,n)}))}},this.gioSDKInitialized=!1,this.storage=De,this.plugins=new me(this),this.plugins.innerPluginInit()}));!function(){var e,t,r;if(window.gioSDKInstalled)return we=window.gdp,void Y("重复加载GrowingIO SDK","warn");window.gioSDKInstalled=!0;var i=new Be;we=function(){var e=arguments[0];if(b(e)&&R(v,e)&&i[e]){var t=A(K(arguments));if("init"===e){var r=oe(i);if(!r)return;var o=ae(t);if(!o)return;var a=se(t);if(!a)return;var s=ue(t);if(!s)return;var u=a.projectId,c=s.dataSourceId,d=s.appId,l=s.cdpOptions;i.init(n(n({},l),{projectId:u,dataSourceId:c,appId:d}))}else if("registerPlugins"===e)i.registerPlugins(t[0]);else{if(i.gioSDKInitialized&&i.vdsConfig)return i[e].apply(i,t);Y("SDK未初始化!","error")}}else R(w,e)?Y("方法 ".concat(j(e)," 已被弃用，请移除!"),"warn"):Y("不存在名为 ".concat(j(e)," 的方法调用!"),"error");window.gioEnvironment="cdp",window.gioSDKVersion=i.sdkVersion};var o=null===(e=null===window||void 0===window?void 0:window.gdp)||void 0===e?void 0:e.q,a=null===(t=null===window||void 0===window?void 0:window.gdp)||void 0===t?void 0:t.e,s=null===(r=null===window||void 0===window?void 0:window.gdp)||void 0===r?void 0:r.ef;window.gdp=we,window.gdp.e=a,window.gdp.ef=s,P(o)&&!J(o)&&o.forEach((function(e){we.apply(null,e)}))}();var Fe=we;export{Fe as default};
