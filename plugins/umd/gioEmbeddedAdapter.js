!function(e){"function"==typeof define&&define.amd?define(e):e()}((function(){"use strict";function e(e,o,i){if(i||2===arguments.length)for(var n,t=0,r=o.length;r>t;t++)!n&&t in o||(n||(n=[].slice.call(o,0,t)),n[t]=o[t]);return e.concat(n||[].slice.call(o))}var o=function(e){return n(["undefined","null"],g(e))},i=function(e){return"object"===g(e)&&!o(e)},n=function(e,o){return("array"===g(e)||"string"===g(e))&&e.indexOf(o)>=0},t={}.hasOwnProperty,r=function(e,i){return!o(e)&&t.call(e,i)},a=function(e){return i(e)?Object.keys(e):[]},g=function(e){return{}.toString.call(e).slice(8,-1).toLowerCase()},c={},s={}.hasOwnProperty;function d(e){try{return decodeURIComponent(e.replace(/\+/g," "))}catch(e){return null}}function l(e){try{return encodeURIComponent(e)}catch(e){return null}}c.stringify=function(e,o){o=o||"";var i,n,t=[];for(n in"string"!=typeof o&&(o="?"),e)if(s.call(e,n)){if((i=e[n])||null!=i&&!isNaN(i)||(i=""),n=l(n),i=l(i),null===n||null===i)continue;t.push(n+"="+i)}return t.length?o+t.join("&"):""},c.parse=function(e){for(var o,i=/([^=?#&]+)=?([^&]*)/g,n={};o=i.exec(e);){var t=d(o[1]),r=d(o[2]);null===t||null===r||t in n||(n[t]=r)}return n};var u={gioprojectid:"projectId",giodatacollect:"dataCollect",gioappid:"domain",giodatasourceid:"dataSourceId",gios:"sessionId",giou:"uid",giocs1:"userId",gioid:"gioId",giouserkey:"userKey",gioappchannel:"appChannel",giodevicebrand:"deviceBrand",giodevicemodel:"deviceModel",giodevicetype:"deviceType",giolanguage:"language",gionetworkstate:"networkState",giooperatingsystem:"operatingSystem",gioplatform:"platform",gioplatformversion:"platformVersion",gioscreenheight:"screenHeight",gioscreenwidth:"screenWidth"},f=["giodatasourceid","gioplatform","gioappchannel","giodevicebrand","giodevicemodel","giodevicetype","giolanguage","gionetworkstate","giooperatingsystem","gioplatformversion","gioscreenheight","gioscreenwidth"],h=["giocs1","gios","giou","gioid","giouserkey"],p="gio_search_cookie_gioenc";window.gioEmbeddedAdapter={name:"gioEmbeddedAdapter",method:function(o){var t=this;this.growingIO=o,this.main=function(){var e,o,s=t.growingIO.vdsConfig,d=s.projectId,l=s.appId,w=t.getGQS(),I=!1;return"none"!==t.qsFrom&&w.gioprojectid===d&&w.gioappid===l&&((function(e){return Array.isArray(e)&&"array"===g(e)}(o=w)?0!==o.length:i(o)?0!==a(o).length:o)?t.growingIO.storage.setItem(p,c.stringify(w)):t.growingIO.storage.removeItem(p),r(w,"giodatacollect")&&(t.growingIO.vdsConfig.dataCollect=n(["true",!0],w.giodatacollect)),null===(e=t.growingIO.emitter)||void 0===e||e.on("SDK_INITIALIZED",(function(){var e=t.growingIO,o=e.userStore,i=e.vdsConfig.sessionExpires,n=e.dataStore.eventContextBuilderInst;h.forEach((function(e){var i;o[u[e]]=null!==(i=w[e])&&void 0!==i?i:""})),window.setInterval((function(){o.sessionId=w.gios}),.8*i*60*1e3),f.forEach((function(e){r(w,e)&&(n.minpExtraParams[u[e]]=w[e])}))})),t.growingIO.setUserId=function(){},t.growingIO.clearUserId=function(){},r(w,"giodatacollect")&&(t.growingIO.setDataCollect=function(){},t.growingIO.setOption=function(){}),I=!0),t.gioURLRewrite(),I},this.getGQS=function(){var o=t.growingIO.vdsConfig.hashtag,i=t.growingIO.storage.getItem(p),g=window.location.search,s=window.location.hash,d=o?s.substring(s.indexOf("?")+1):"",l=c.parse(g),u=c.parse(d),w=c.parse((i||"").replace("gioenc-","")),I={};if(r(l,"gioprojectid"))I=l,t.qsFrom="search";else if(r(u,"gioprojectid"))I=u,t.qsFrom="hash";else{if(!r(w,"gioprojectid"))return t.qsFrom="none",{};I=w,t.qsFrom="cookie"}var m={},v={},y=e(e(["gioappid","gioprojectid","giodatacollect"],h,!0),f,!0);return a(I).forEach((function(e){var o=e.toLowerCase();n(y,o)?n(["","undefined","null",void 0,null],I[e])||(m[o]=I[e],n(["true","TRUE",!0],I[e])&&(m[o]=!0),n(["false","FALSE",!1],I[e])&&(m[o]=!1)):v[e]=I[e]})),t.gqs=m,t.ngqs=v,m},this.gioURLRewrite=function(){var e=t.growingIO.vdsConfig.hashtag,o=window.location.search,i=window.location.hash,n=!1;if("search"===t.qsFrom&&(o=c.stringify(t.ngqs,!0),n=!0),e&&"hash"===t.qsFrom&&(i="".concat(i.split("?")[0]).concat(c.stringify(t.ngqs,!0)),n=!0),n){var r="".concat(window.location.pathname).concat(o||"").concat(i||"");window.history.replaceState(null,document.title,r)}},this.gqs={},this.ngqs={},this.qsFrom="search",this.growingIO.emitter.on("OPTION_INITIALIZED",(function(){t.growingIO.useEmbeddedInherit=t.main()}))}}}));
