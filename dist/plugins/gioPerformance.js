var e,n,t,r,i,o=function(){return o=Object.assign||function(e){for(var n,t=1,r=arguments.length;r>t;t++)for(var i in n=arguments[t])({}).hasOwnProperty.call(n,i)&&(e[i]=n[i]);return e},o.apply(this,arguments)},a="function"==typeof Array.from?Array.from:(n||(n=1,t=function(e){return"function"==typeof e},r=function(e){var n=function(e){var n=Number(e);return isNaN(n)?0:0!==n&&isFinite(n)?(n>0?1:-1)*Math.floor(Math.abs(n)):n}(e);return Math.min(Math.max(n,0),9007199254740991)},i=function(e){var n=e.next();return!n.done&&n},e=function(e){var n,o,a,u=this,c=arguments.length>1?arguments[1]:void 0;if(void 0!==c){if(!t(c))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(n=arguments[2])}var s=function(e,n){if(null!=e&&null!=n){var r=e[n];if(null==r)return;if(!t(r))throw new TypeError(r+" is not a function");return r}}(e,function(e){if(null!=e){if(["string","number","boolean","symbol"].indexOf(typeof e)>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in e)return Symbol.iterator;if("@@iterator"in e)return"@@iterator"}}(e));if(void 0!==s){o=t(u)?Object(new u):[];var f,d,l=s.call(e);if(null==l)throw new TypeError("Array.from requires an array-like or iterable object");for(a=0;;){if(!(f=i(l)))return o.length=a,o;d=f.value,o[a]=c?c.call(n,d,a):d,a++}}else{var v=Object(e);if(null==e)throw new TypeError("Array.from requires an array-like object - not null or undefined");var g,m=r(v.length);for(o=t(u)?Object(new u(m)):Array(m),a=0;m>a;)g=v[a],o[a]=c?c.call(n,g,a):g,a++;o.length=m}return o}),e),u=function(e){return h(["undefined","null"],O(e))},c=function(e){return"string"===O(e)},s=function(e){return"number"===O(e)},f=function(e){return"object"===O(e)&&!u(e)},d=function(e){return"regexp"===O(e)},l=function(e){return h(["function","asyncfunction"],O(e))},v=function(e){return Array.isArray(e)&&"array"===O(e)},g=function(e){return"date"===O(e)},m=function(e,n){if(void 0===n&&(n=!1),v(e)){for(var t=0,r=[],i=0,o=e;i<o.length;i++){var a=o[i];a&&!T(a)&&(r[t++]=a),n&&0===a&&(r[t++]=a)}return r}return e},h=function(e,n){return("array"===O(e)||"string"===O(e))&&("array"===O(n)?n.some((function(n){return e.indexOf(n)>=0})):e.indexOf(n)>=0)},p=a,w=function(e){return u(e)?"":"".concat(e)},y={}.hasOwnProperty,E=function(e){return f(e)?Object.keys(e):[]},_=function(e,n){E(e).forEach((function(t){return n(e[t],t)}))},x=function(e,n){var t=E(e);return!(!f(e)||!f(n)||t.length!==E(n).length||h(t.map((function(t){return f(e[t])?x(e[t],n[t]):e[t]===n[t]})),!1))},b=function(e,n){if(!f(e))return!1;try{return"string"===O(n)?delete e[n]:"array"===O(n)?n.map((function(n){return delete e[n]})):(d(n)&&E(e).forEach((function(t){n.test(t)&&b(e,t)})),!0)}catch(e){return!1}},T=function(e){return v(e)?0===e.length:f(e)?0===E(e).length:!e},O=function(e){return{}.toString.call(e).slice(8,-1).toLowerCase()},L=function(e){var n={};return f(e)&&(b(e,"&&sendTo"),_(e,(function(e,t){var r=w(t).slice(0,100);f(e)?n[r]=L(e):v(e)?(n[r]=m(e.slice(0,100),!0),n[r]=n[r].join("||").slice(0,1e3)):g(e)?n[r]=function(e){if(g(e)){var n=function(e){return 10>e?"0"+e:e};return e.getFullYear()+"-"+n(e.getMonth()+1)+"-"+n(e.getDate())+" "+n(e.getHours())+":"+n(e.getMinutes())+":"+n(e.getSeconds())+"."+n(e.getMilliseconds())}return e}(e):n[r]=u(e)?"":w(e).slice(0,1e3)}))),n},R=function(){var e,n,t,r,i=null!==(n=null===(e=function(){var e,n=window._gio_local_vds||"vds";return null!==(e=window[n])&&void 0!==e?e:{}}())||void 0===e?void 0:e.namespace)&&void 0!==n?n:"gdp";return l(window[i])?window[i]:null!==(r=null!==(t=window.gdp)&&void 0!==t?t:window.gio)&&void 0!==r?r:function(){}},I=function(e){var n=this;this.growingIO=e,this.listenerSet=!1,this.setListeners=function(){n.listenerSet||(window.addEventListener("unhandledrejection",n.handleError,!0),window.addEventListener("error",n.handleError,!0)),n.listenerSet=!0},this.handleError=function(e){e.reason?n.errorParse(e.reason.stack,e.reason.message,e.eventTime):e.error?n.errorParse(e.error.stack,e.error.message,e.eventTime):e.target&&n.buildErrorEvent({error_type:"Resource loading error",error_content:"at ".concat(e.target.href||e.target.src||e.target.currentSrc)},e.eventTime)},this.errorParse=function(e,t,r){var i,o,a,u,s=c(e)&&e.length?e.split("\n"):[],f={error_type:t||s[0],error_content:(u=window.navigator.userAgent,/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(u)&&!/chrome\/(\d+\.\d+)/i.test(u)?(null!==(i=s[0])&&void 0!==i?i:"").trim()||(null!==(o=s[1])&&void 0!==o?o:"").trim():(null!==(a=s[1])&&void 0!==a?a:"").trim())};n.buildErrorEvent(f,r)},this.destroy=function(){window.removeEventListener("unhandledrejection",n.handleError),window.removeEventListener("error",n.handleError)},this.buildErrorEvent=function(e,t){var r;null===(r=n.growingIO.plugins.gioPerformance)||void 0===r||r.buildPerfEvent("apm_system_error",e,t)},this.setListeners(),window.gdp.ef&&(window.removeEventListener("unhandledrejection",window.gdp.ef),window.removeEventListener("error",window.gdp.ef),window.gdp.ef=void 0),!T(window.gdp.e)&&v(window.gdp.e)&&(window.gdp.e.forEach(this.handleError),window.gdp.e=void 0)},P=-1,k=function(e){addEventListener("pageshow",(function(n){n.persisted&&(P=n.timeStamp,e(n))}),!0)},C=function(){return window.performance&&performance.getEntriesByType&&performance.getEntriesByType("navigation")[0]},N=function(){var e=C();return e&&e.activationStart||0},S=function(e,n){var t=C(),r="navigate";return 0>P?t&&(r=document.prerendering||N()>0?"prerender":t.type.replace(/_/g,"-")):r="back-forward-cache",{name:e,value:void 0===n?-1:n,rating:"good",delta:0,entries:[],id:"v3-".concat(Date.now(),"-").concat(Math.floor(8999999999999*Math.random())+1e12),navigationType:r}},H=function(e,n,t){try{if(PerformanceObserver.supportedEntryTypes.includes(e)){var r=new PerformanceObserver((function(e){n(e.getEntries())}));return r.observe(Object.assign({type:e,buffered:!0},t||{})),r}}catch(e){}},F=function(e,n){var t=function t(r){"pagehide"!==r.type&&"hidden"!==document.visibilityState||(e(r),n&&(removeEventListener("visibilitychange",t,!0),removeEventListener("pagehide",t,!0)))};addEventListener("visibilitychange",t,!0),addEventListener("pagehide",t,!0)},A=function(e,n,t,r){var i,o;return function(a){n.value>=0&&(a||r)&&((o=n.value-(i||0))||void 0===i)&&(i=n.value,n.delta=o,n.rating=function(e,n){return e>n[1]?"poor":e>n[0]?"needs-improvement":"good"}(n.value,t),e(n))}},M=-1,D=function(){return"hidden"!==document.visibilityState||document.prerendering?1/0:0},X=function(){F((function(e){var n=e.timeStamp;M=n}),!0)},q=function(){return 0>M&&(M=D(),X(),k((function(){setTimeout((function(){M=D(),X()}),0)}))),{get firstHiddenTime(){return M}}},j={},$=function e(n){document.prerendering?addEventListener("prerenderingchange",(function(){return e(n)}),!0):"complete"!==document.readyState?addEventListener("load",(function(){return e(n)}),!0):setTimeout(n,0)},B=function(e,n){n=n||{};var t=[800,1800],r=S("TTFB"),i=A(e,r,t,n.reportAllChanges);$((function(){var o=C();if(o){if(r.value=Math.max(o.responseStart-N(),0),0>r.value||r.value>performance.now())return;r.entries=[o],i(!0),k((function(){r=S("TTFB",0),(i=A(e,r,t,n.reportAllChanges))(!0)}))}}))},U={FCP:"first_contentful_paint_duration",LCP:"largest_contentful_paint_duration",TTFB:"first_byte_duration"},Q=function(e,n){void 0===n&&(n={});var t=this;this.growingIO=e,this.options=n,this.performance={},this.setPerformanceData=function(e){t.vitalsData[e.name].push(e)},this.getLaunchTime=function(){var e=window.performance.timing;return e.loadEventEnd-e.navigationStart},this.getInteractiveTime=function(){var e=window.performance.timing;return e.domContentLoadedEventEnd-e.navigationStart},this.generatePerfData=function(){window.setTimeout((function(){var e={page_launch_duration:t.getLaunchTime(),interactive_duration:t.getInteractiveTime()};_(t.vitalsData,(function(n,t){T(n)||(e[U[t]]=function(e,n){return s(e)?Number(e.toFixed(s(0)?0:2)):c(e)&&"NaN"!==w(Number(e))?Number(Number(e).toFixed(s(0)?0:2)):e}(function(e){try{var n=p(e);return n[n.length-1]}catch(e){return}}(n).value))})),x(e,t.performance)||(t.buildMonitorEvent(e),t.performance=e)}),1e3)},this.destroy=function(){window.removeEventListener("load",t.generatePerfData)},this.buildMonitorEvent=function(e){var n;null===(n=t.growingIO.plugins.gioPerformance)||void 0===n||n.buildPerfEvent("apm_web_launch",e)},this.vitalsData={FCP:[],FID:[],INP:[],LCP:[],TTFB:[]},function(e,n){n=n||{};var t,r=[1800,3e3],i=q(),o=S("FCP"),a=function(e){e.forEach((function(e){"first-contentful-paint"===e.name&&(c&&c.disconnect(),e.startTime<i.firstHiddenTime&&(o.value=Math.max(e.startTime-N(),0),o.entries.push(e),t(!0)))}))},u=window.performance&&window.performance.getEntriesByName&&window.performance.getEntriesByName("first-contentful-paint")[0],c=u?null:H("paint",a);(u||c)&&(t=A(e,o,r,n.reportAllChanges),u&&a([u]),k((function(i){o=S("FCP"),t=A(e,o,r,n.reportAllChanges),requestAnimationFrame((function(){requestAnimationFrame((function(){o.value=performance.now()-i.timeStamp,t(!0)}))}))})))}(this.setPerformanceData),function(e,n){n=n||{};var t,r=[2500,4e3],i=q(),o=S("LCP"),a=function(e){var n=e[e.length-1];if(n){var r=Math.max(n.startTime-N(),0);r<i.firstHiddenTime&&(o.value=r,o.entries=[n],t())}},u=H("largest-contentful-paint",a);if(u){t=A(e,o,r,n.reportAllChanges);var c=function(){j[o.id]||(a(u.takeRecords()),u.disconnect(),j[o.id]=!0,t(!0))};["keydown","click"].forEach((function(e){addEventListener(e,c,{once:!0,capture:!0})})),F(c,!0),k((function(i){o=S("LCP"),t=A(e,o,r,n.reportAllChanges),requestAnimationFrame((function(){requestAnimationFrame((function(){o.value=performance.now()-i.timeStamp,j[o.id]=!0,t(!0)}))}))}))}}(this.setPerformanceData,{reportAllChanges:!0}),B(this.setPerformanceData),window.addEventListener("load",this.generatePerfData)};function V(e,n,t,r){if(void 0===r&&(r=!1),!u(e)&&(function(e,n){return!u(e)&&y.call(e,n)}(e,n)||r)){var i=t(e[n]);"function"==typeof i&&(e[n]=i)}}var G,K=function(e,n){var t=this;this.growingIO=e,this.options=n,this.initOptions=function(){var e;f(t.options.network)&&(null===(e=t.options.network)||void 0===e?void 0:e.exclude)&&(t.excludeRegExp=t.options.network.exclude)},this.verifyUrl=function(e){if(e.indexOf(t.gdpRequestURL)>-1)return!0;if(v(t.excludeRegExp)){var n=m(t.excludeRegExp.map((function(n){return d(n)?n.test(e):c(n)?e.indexOf(n)>-1:void 0})));return!T(n)}return c(t.excludeRegExp)?e.indexOf(t.excludeRegExp)>-1:!!d(t.excludeRegExp)&&t.excludeRegExp.test(e)},this.getTimestamp=function(){return window.performance?window.performance.now():Date.now()},this.hookXHR=function(){var e=t;t.originXHR=window.XMLHttpRequest;var n=XMLHttpRequest.prototype,r={};V(n,"open",(function(n){return function(){for(var t=[],i=0;arguments.length>i;i++)t[i]=arguments[i];this.gio_XHR_id="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){var n=16*Math.random()|0;return("x"===e?n:3&n|8).toString(16)})),e.verifyUrl(t[1])||(r[this.gio_XHR_id]={type:"XHR",method:t[0],url:t[1]}),n.apply(this,t)}})),V(n,"send",(function(n){return function(){for(var t=this,i=[],a=0;arguments.length>a;a++)i[a]=arguments[a];this.addEventListener("loadend",(function(n){r[t.gio_XHR_id]&&(r[t.gio_XHR_id]=o(o({},r[t.gio_XHR_id]),{duration:(n.timeStamp||e.getTimestamp())-r[t.gio_XHR_id].start,status:t.status}),e.buildNetworkEvent(r[t.gio_XHR_id]),b(r,t.gio_XHR_id))})),this.addEventListener("error",(function(){e.buildErrorEvent({error_title:"XMLHttpRequest Error",error_content:t.status})})),r[this.gio_XHR_id]&&(r[this.gio_XHR_id].start=e.getTimestamp()),n.apply(this,i)}}))},this.hookFetch=function(){var e=t;window.fetch&&(t.originFetch=window.fetch,V(window,"fetch",(function(n){return function(){for(var t,r=[],i=0;arguments.length>i;i++)r[i]=arguments[i];var a,u=r[0],c=r[1];return"string"!==O(r[0])&&(u=(null===(t=r[0])||void 0===t?void 0:t.url)||"",c=r[0]),e.verifyUrl(u)||(a={type:"Fetch",method:c.method||"GET",url:u,start:e.getTimestamp()}),n.apply(this,r).then((function(n){return a=o(o({},a),{duration:e.getTimestamp()-a.start,status:n.status}),e.buildNetworkEvent(a),n}),(function(n){var t=n.stack.split("\n");e.buildErrorEvent({error_title:t[0]||w(n)||"Fetch Request Error",error_content:a.url})}))}})))},this.buildErrorEvent=function(e){if(t.options.exception){var n=t.growingIO.dataStore,r=n.eventContextBuilder;(0,n.eventConverter)(o({eventType:"CUSTOM",eventName:"Error",attributes:e},r()))}},this.destroy=function(){window.XMLHttpRequest=t.originXHR,window.fetch&&(window.fetch=t.originFetch)},this.buildNetworkEvent=function(e){!1!==n.network&&window.setTimeout((function(){var n,r=e.duration,i=e.url,o=e.method,a=e.status;null===(n=t.growingIO.plugins.gioPerformance)||void 0===n||n.buildPerfEvent("apm_network_request",{response_duration:r,request_address:i,request_method:o,http_code:a})}),0)},this.initOptions(),this.hookXHR(),this.hookFetch(),window.performance||("warn",console.log("%c [GrowingIO]：当前浏览器无法支持性能相关API，网络监测数据可能存在偏差!","color: #F59E0B;"));var r=this,i=this.growingIO.uploader.generateURL;this.growingIO.uploader.generateURL=function(){var e=i.apply(this,arguments);return arguments[0]===r.growingIO.trackingId&&(r.gdpRequestURL=e),e}},z={install:function(e){if(e&&e.config){var n=function(n,t,r){Y.call(this,n,t,r,e)};if(l(e.config.errorHandler)){var t=e.config.errorHandler;e.config.errorHandler=function(){for(var e=[],r=0;arguments.length>r;r++)e[r]=arguments[r];var i=t.apply(this,e);return n(e[0],e[1],e[2]),i}}else e.config.errorHandler=n}}},Y=function(e,n,t,r){var i={message:"".concat(e.message,"(").concat(t,")"),name:e.name,stack:e.stack||[]};if(null==r?void 0:r.version){var a=Number(function(e){try{return p(e)[0]}catch(e){return}}(function(e,n){return"string"==typeof e?e.split("."):e}(null==r?void 0:r.version)));switch(a){case 2:i=o(o({},i),Z(n));break;case 3:i=o(o({},i),J(n));break;default:return}}i=o(o({},i),W(i.stack)),R()("track","apm_system_error",{error_type:"".concat(i.name,": ").concat(i.message),error_content:"at ".concat(i.functionName," (").concat(i.componentName,")")})},Z=function(e){var n="";if(e.$root===e)n="root";else{var t=e._isVue?e.$options&&e.$options.name||e.$options&&e.$options._componentTag:e.name;n=(t?"component <"+t+">":"anonymous component")+(e._isVue&&e.$options&&e.$options.__file?" at "+(e.$options&&e.$options.__file):"")}return{componentName:n}},J=function(e){var n="";if(e.$root===e)n="root";else{var t=e.$options&&e.$options.name;n=t?"component <"+t+">":"anonymous component"}return{componentName:n}},W=function(e){var n,t=e.split("\n");return function(e,t){e[function(e,n){var t=-1;return v(e)&&e.every((function(e,r){return!n(e)||(t=r,!1)})),t}(e,(function(e){var t=e.match(/at (.*?) \((.*):(\d{1,}):(\d{1,})\)/);if(v(t)&&!n)return n=t[1],t.length>0}))]}(t),{title:t[0],functionName:n}},ee={name:"gioPerformance",method:function(e){var n,t=this;this.growingIO=e,this.inited=!1,this.cacheQueue=[],this.init=function(){if(!t.inited){var e=t.growingIO.vdsConfig,n=e.performance,r=e.dataCollect;n.monitor&&(t.monitor=new Q(t.growingIO)),n.exception&&(t.exception=new I(t.growingIO)),t.network=new K(t.growingIO,n),r&&t.sendCacheQuene(),t.inited=!0}},this.sendCacheQuene=function(){G.isEmpty(t.cacheQueue)||(t.cacheQueue.forEach((function(e){t.buildPerfEvent(e.eventName,e.attributes,e.eventTime)})),t.cacheQueue=[])},this.buildPerfEvent=function(e,n,r){var i,a=t.growingIO,u=a.dataStore,c=u.eventContextBuilder,s=u.eventConverter,f=a.vdsConfig;if(a.gioSDKInitialized&&f.dataCollect){G.forEach(n,(function(e,t){(G.isNaN(e)||G.isNil(e))&&(n[t]=0),n[t]=G.fixed(e,0)}));var d=o({eventType:"CUSTOM",eventName:e},c());d.attributes=L(o(o({},null!==(i=d.attributes)&&void 0!==i?i:{}),n)),r&&(d.timestamp=r),s(d)}else t.cacheQueue.push({eventName:e,attributes:n,eventTime:r||+Date.now()})},this.pluginVersion="4.2.6",G=this.growingIO.utils,this.growingIO.gioSDKInitialized?this.init():this.growingIO.emitter.on("SDK_INITIALIZED",(function(){t.init()})),null===(n=this.growingIO.emitter)||void 0===n||n.on("OPTION_CHANGE",(function(e){var n=e.optionName,r=e.optionValue;"dataCollect"===n&&!0===r&&t.sendCacheQuene()}))},GioVue:z,gioReactErrorReport:function(e,n){var t=e.stack.split("\n")[0],r=n.componentStack.split("\n"),i=[];r.forEach((function(e){var n="".concat(e," ").match(/at (.*?) /);v(n)&&n[1]&&i.push(n[1])}));var o="at ".concat(function(e,n){return void 0===n&&(n=1),v(e)&&s(n)?e.slice(n>0?n:1,e.length):e}(i.reverse()).join("/"));R()("track","apm_system_error",{error_type:t,error_content:o})}};export{ee as default};
