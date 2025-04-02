var e,r,t=function(){return t=Object.assign||function(e){for(var r,t=1,n=arguments.length;n>t;t++)for(var o in r=arguments[t])({}).hasOwnProperty.call(r,o)&&(e[o]=r[o]);return e},t.apply(this,arguments)};function n(e,r,t){if(t||2===arguments.length)for(var n,o=0,i=r.length;i>o;o++)!n&&o in r||(n||(n=[].slice.call(r,0,o)),n[o]=r[o]);return e.concat(n||[].slice.call(r))}var o,i,a,c="function"==typeof Array.from?Array.from:(r||(r=1,o=function(e){return"function"==typeof e},i=function(e){var r=function(e){var r=Number(e);return isNaN(r)?0:0!==r&&isFinite(r)?(r>0?1:-1)*Math.floor(Math.abs(r)):r}(e);return Math.min(Math.max(r,0),9007199254740991)},a=function(e){var r=e.next();return!r.done&&r},e=function(e){var r,t,n,c=this,u=arguments.length>1?arguments[1]:void 0;if(void 0!==u){if(!o(u))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(r=arguments[2])}var s=function(e,r){if(null!=e&&null!=r){var t=e[r];if(null==t)return;if(!o(t))throw new TypeError(t+" is not a function");return t}}(e,function(e){if(null!=e){if(["string","number","boolean","symbol"].indexOf(typeof e)>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in e)return Symbol.iterator;if("@@iterator"in e)return"@@iterator"}}(e));if(void 0!==s){t=o(c)?Object(new c):[];var g,l,f=s.call(e);if(null==f)throw new TypeError("Array.from requires an array-like or iterable object");for(n=0;;){if(!(g=a(f)))return t.length=n,t;l=g.value,t[n]=u?u.call(r,l,n):l,n++}}else{var d=Object(e);if(null==e)throw new TypeError("Array.from requires an array-like object - not null or undefined");var h,p=i(d.length);for(t=o(c)?Object(new c(p)):Array(p),n=0;p>n;)h=d[n],t[n]=u?u.call(r,h,n):h,n++;t.length=p}return t}),e),u=function(e){return l(["undefined","null"],w(e))},s=function(e){return"string"===w(e)},g=function(e){return"object"===w(e)&&!u(e)},l=function(e,r){return("array"===w(e)||"string"===w(e))&&("array"===w(r)?r.some((function(r){return e.indexOf(r)>=0})):e.indexOf(r)>=0)},f=c,d=function(e,r){return!!s(e)&&e.slice(0,r.length)===r},h=function(e,r){if(s(e)){var t=e.length,n=t;n>t&&(n=t);var o=n;return(n-=r.length)>=0&&e.slice(n,o)===r}return!1},p={}.hasOwnProperty,m=function(e,r){return!u(e)&&p.call(e,r)},v=function(e){return g(e)?Object.keys(e):[]},w=function(e){return{}.toString.call(e).slice(8,-1).toLowerCase()},I=function(e){try{return e()}catch(e){return}},y=function(e){return h(e,"_gioenc")?e.slice(0,-7):e},O=function(e){if(d(e,"?")||l(e,["=","&"])){var r={};return d(e,"?")&&(e=e.substring(1)),e.split("&").forEach((function(e){var t,n=e.split("="),o=n[0],i=null!==(t=n[1])&&void 0!==t?t:"";u(o)||""===o||(r[o]=i)})),r}return decodeURIComponent(e)},S=function(e,r){if(void 0===r&&(r=!1),"object"===w(e)){var t="";return o=function(e,n){""===t?t=(r?"?":"")+"".concat(n,"=").concat(e):t+="&".concat(n,"=").concat(e)},v(n=e).forEach((function(e){return o(n[e],e)})),t}var n,o;if("string"===w(e))return encodeURIComponent(e)},b={A:1,a:1,Z:1,z:1,"@":1,"{":1},j=function(e){return(e=e||"").split("").map((function(e){return b[e]?e:q(e)})).join("")},q=function(e){if(/[0-9]/.test(e))return 1^+e;var r=e.charCodeAt(0);return String.fromCharCode(1^r)},C=function(){this.getItem=function(e){var r,t=I((function(){return JSON.parse(localStorage.getItem(y(e))||"")}))||{};return g(t)&&t.expiredAt>+Date.now()?function(e){return isNaN(Number(e))&&I((function(){return JSON.parse(e)}))||e}((r=t.value,s(r)&&d(r,"gioenc-")&&I((function(){return j(r.replace("gioenc-",""))}))||r)):void 0},this.setItem=function(e,r,t){var n,o=null!=t?t:+new Date((new Date).getFullYear()+3,(new Date).getMonth(),(new Date).getDay()).getTime();localStorage.setItem(y(e),JSON.stringify({value:s(r)&&r.length&&h(e,"_gioenc")?(n=r,u(n)?n:I((function(){return"gioenc-".concat(j(n))}))||n):r,expiredAt:o}))},this.removeItem=function(e){return localStorage.removeItem(y(e))},this.hasItem=function(e){return!!localStorage.getItem(y(e))},this.getKeys=function(){return f(Array(localStorage.length)).map((function(e,r){return localStorage.key(r)}))},this.type="localStorage"},E={},k={}.hasOwnProperty;function A(e){try{return decodeURIComponent(e.replace(/\+/g," "))}catch(e){return null}}function U(e){try{return encodeURIComponent(e)}catch(e){return null}}E.stringify=function(e,r){r=r||"";var t,n,o=[];for(n in"string"!=typeof r&&(r="?"),e)if(k.call(e,n)){if((t=e[n])||null!=t&&!isNaN(t)||(t=""),n=U(n),t=U(t),null===n||null===t)continue;o.push(n+"="+t)}return o.length?r+o.join("&"):""},E.parse=function(e){for(var r,t=/([^=?#&]+)=?([^&]*)/g,n={};r=t.exec(e);){var o=A(r[1]),i=A(r[2]);null===o||null===i||o in n||(n[o]=i)}return n};var x={gioprojectid:"projectId",giodatacollect:"dataCollect",gioappid:"domain",giodatasourceid:"dataSourceId",gios:"sessionId",giou:"uid",giocs1:"userId",giouserkey:"userKey",gioappchannel:"appChannel",giodevicebrand:"deviceBrand",giodevicemodel:"deviceModel",giodevicetype:"deviceType",giolanguage:"language",gionetworkstate:"networkState",giooperatingsystem:"operatingSystem",gioplatform:"platform",gioplatformversion:"platformVersion",gioscreenheight:"screenHeight",gioscreenwidth:"screenWidth"},N=["gioprojectid","giodatacollect","giodatasourceid","gioplatform"],F=["giodatasourceid","gioplatform","gioappchannel","giodevicebrand","giodevicemodel","giodevicetype","giolanguage","gionetworkstate","giooperatingsystem","gioplatformversion","gioscreenheight","gioscreenwidth"],T=["giocs1","gios","giou","giouserkey"],R="gdp_query_string",V={name:"gioEmbeddedAdapter",method:function(e){var r=this;this.growingIO=e,this.onOptionsInit=function(e,t){var n,o,i,a=t.projectId,c=t.appId,u=e===r.growingIO.trackingId?t.hashtag:r.growingIO.vdsConfig.hashtag,s=r.getGQS(u);if(l(["search","hash"],r.qsFrom)&&!(function(e){return Array.isArray(e)&&"array"===w(e)}(i=s)?0===i.length:g(i)?0===v(i).length:!i)&&r.storage.setItem(R,s),!r.growingIO.useEmbeddedInherit&&"none"!==r.qsFrom&&s.gioprojectid===a&&s.gioappid===c){r.growingIO.useEmbeddedInherit=e,r.growingIO.dataStore.updateVdsConfig(e,{minipLink:!0});var f=r.growingIO.dataStore.getTrackerVds(e);N.forEach((function(e){if(m(s,e))if("giodatacollect"===e)f.dataCollect=l(["true",!0],s.giodatacollect);else{var r=x[e];l(["domain","platform"],r)&&(f.originValues||(f.originValues={}),f.originValues[r]=f[r]),f[r]=s[e]}})),r.growingIO.dataStore.updateVdsConfig(e,f);var d=r.growingIO,h=d.userStore,p=d.dataStore.eventContextBuilderInst;h.setUid(s.giou),h.setSessionId(e,s.gios),h.setUserId(e,null!==(n=s.giocs1)&&void 0!==n?n:""),h.setUserKey(e,null!==(o=s.giouserkey)&&void 0!==o?o:"");var I=window.setInterval((function(){h.setSessionId(e,s.gios)}),.8*t.sessionExpires*60*1e3);window.onbeforeunload=function(){window.clearInterval(I),I=void 0},F.forEach((function(e){m(s,e)&&(p.minpExtraParams[x[e]]=s[e])}));var y=r.growingIO.setUserId;r.growingIO.setUserId=function(){for(var r=[],t=0;arguments.length>t;t++)r[t]=arguments[t];if(r[0]!==e)return y.apply(this,r)};var O=r.growingIO.clearUserId;if(r.growingIO.clearUserId=function(){for(var r=[],t=0;arguments.length>t;t++)r[t]=arguments[t];if(r[0]!==e)return O.apply(this,r)},m(s,"giodatacollect")){var S=r.growingIO.setOption;r.growingIO.setOption=function(){for(var r=[],t=0;arguments.length>t;t++)r[t]=arguments[t];if(r[0]!==e)return S.apply(this,r)}}}!1!==r.growingIO.dataStore.getTrackerVds(r.growingIO.trackingId).rewriteQuery&&r.gioURLRewrite(),r.growingIO.dataStore.currentPage.parsePage()},this.getGQS=function(e){var o=window.location.search,i=window.location.hash,a=e?i.substring(i.indexOf("?")+1):"",c=r.storage.getItem(R),u=E.parse(o),s=O(o),g=E.parse(a),f=O(a),d={},h={};if(m(u,"gioprojectid"))d=u,h=s,r.qsFrom="search";else if(m(g,"gioprojectid"))d=g,h=f,r.qsFrom="hash";else{if(!m(c,"gioprojectid"))return r.qsFrom="none",{};d=c,h=c,r.qsFrom="local"}var p={},w={},I=n(n(["gioappid","gioprojectid","giodatacollect"],T,!0),F,!0);return v(d).forEach((function(e){var r=e.toLowerCase();l(I,r)?l(["","undefined","null",void 0,null],d[e])?p[r]="":(p[r]=d[e],l(["true","TRUE",!0],d[e])&&(p[r]=!0),l(["false","FALSE",!1],d[e])&&(p[r]=!1)):w[e]=h[e]})),r.gqs=p,r.customerqs=w,t(t({},r.gqs),r.customerqs)},this.gioURLRewrite=function(){var e=r.growingIO.vdsConfig.hashtag,t=window.location.search,n=window.location.hash,o=!1;if("search"===r.qsFrom&&(t=S(r.customerqs,!0),o=!0),e&&"hash"===r.qsFrom&&(n="".concat(n.split("?")[0]).concat(S(r.customerqs,!0)),o=!0),o){var i="".concat(window.location.pathname).concat(t||"").concat(n||"");window.history.replaceState(null,document.title,i)}},this.pluginVersion="4.2.6",this.gqs={},this.customerqs={},this.qsFrom="search",this.storage=new C,this.growingIO.emitter.on("OPTION_INITIALIZED",(function(e){var t=e.trackingId,n=e.vdsConfig;r.onOptionsInit(t,n)}))}};export{V as default};
