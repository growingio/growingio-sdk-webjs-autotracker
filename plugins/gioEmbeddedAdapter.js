function o(o,e,i){if(i||2===arguments.length)for(var n,t=0,r=e.length;r>t;t++)!n&&t in e||(n||(n=[].slice.call(e,0,t)),n[t]=e[t]);return o.concat(n||[].slice.call(e))}var e=function(o){return n(["undefined","null"],g(o))},i=function(o){return"object"===g(o)&&!e(o)},n=function(o,e){return("array"===g(o)||"string"===g(o))&&o.indexOf(e)>=0},t={}.hasOwnProperty,r=function(o,i){return!e(o)&&t.call(o,i)},a=function(o){return i(o)?Object.keys(o):[]},g=function(o){return{}.toString.call(o).slice(8,-1).toLowerCase()},c={},s={}.hasOwnProperty;function l(o){try{return decodeURIComponent(o.replace(/\+/g," "))}catch(o){return null}}function d(o){try{return encodeURIComponent(o)}catch(o){return null}}c.stringify=function(o,e){e=e||"";var i,n,t=[];for(n in"string"!=typeof e&&(e="?"),o)if(s.call(o,n)){if((i=o[n])||null!=i&&!isNaN(i)||(i=""),n=d(n),i=d(i),null===n||null===i)continue;t.push(n+"="+i)}return t.length?e+t.join("&"):""},c.parse=function(o){for(var e,i=/([^=?#&]+)=?([^&]*)/g,n={};e=i.exec(o);){var t=l(e[1]),r=l(e[2]);null===t||null===r||t in n||(n[t]=r)}return n};var u={gioprojectid:"projectId",giodatacollect:"dataCollect",gioappid:"domain",giodatasourceid:"dataSourceId",gios:"sessionId",giou:"uid",giocs1:"userId",gioid:"gioId",giouserkey:"userKey",gioappchannel:"appChannel",giodevicebrand:"deviceBrand",giodevicemodel:"deviceModel",giodevicetype:"deviceType",giolanguage:"language",gionetworkstate:"networkState",giooperatingsystem:"operatingSystem",gioplatform:"platform",gioplatformversion:"platformVersion",gioscreenheight:"screenHeight",gioscreenwidth:"screenWidth"},f=["giodatasourceid","gioplatform","gioappchannel","giodevicebrand","giodevicemodel","giodevicetype","giolanguage","gionetworkstate","giooperatingsystem","gioplatformversion","gioscreenheight","gioscreenwidth"],h=["giocs1","gios","giou","gioid","giouserkey"],p="gio_search_cookie_gioenc",I={name:"gioEmbeddedAdapter",method:function(e){var t=this;this.growingIO=e,this.main=function(){var o,e,s=t.growingIO.vdsConfig,l=s.projectId,d=s.appId,I=t.getGQS(),w=!1;return"none"!==t.qsFrom&&I.gioprojectid===l&&I.gioappid===d&&((function(o){return Array.isArray(o)&&"array"===g(o)}(e=I)?0!==e.length:i(e)?0!==a(e).length:e)?t.growingIO.storage.setItem(p,c.stringify(I)):t.growingIO.storage.removeItem(p),r(I,"giodatacollect")&&(t.growingIO.vdsConfig.dataCollect=n(["true",!0],I.giodatacollect)),null===(o=t.growingIO.emitter)||void 0===o||o.on("SDK_INITIALIZED",(function(){var o=t.growingIO,e=o.userStore,i=o.vdsConfig.sessionExpires,n=o.dataStore.eventContextBuilderInst;h.forEach((function(o){var i;e[u[o]]=null!==(i=I[o])&&void 0!==i?i:""})),window.setInterval((function(){e.sessionId=I.gios}),.8*i*60*1e3),f.forEach((function(o){r(I,o)&&(n.minpExtraParams[u[o]]=I[o])}))})),t.growingIO.setUserId=function(){},t.growingIO.clearUserId=function(){},r(I,"giodatacollect")&&(t.growingIO.setDataCollect=function(){},t.growingIO.setOption=function(){}),w=!0),t.gioURLRewrite(),w},this.getGQS=function(){var e=t.growingIO.vdsConfig.hashtag,i=t.growingIO.storage.getItem(p),g=window.location.search,s=window.location.hash,l=e?s.substring(s.indexOf("?")+1):"",d=c.parse(g),u=c.parse(l),I=c.parse((i||"").replace("gioenc-","")),w={};if(r(d,"gioprojectid"))w=d,t.qsFrom="search";else if(r(u,"gioprojectid"))w=u,t.qsFrom="hash";else{if(!r(I,"gioprojectid"))return t.qsFrom="none",{};w=I,t.qsFrom="cookie"}var m={},v={},y=o(o(["gioappid","gioprojectid","giodatacollect"],h,!0),f,!0);return a(w).forEach((function(o){var e=o.toLowerCase();n(y,e)?n(["","undefined","null",void 0,null],w[o])||(m[e]=w[o],n(["true","TRUE",!0],w[o])&&(m[e]=!0),n(["false","FALSE",!1],w[o])&&(m[e]=!1)):v[o]=w[o]})),t.gqs=m,t.ngqs=v,m},this.gioURLRewrite=function(){var o=t.growingIO.vdsConfig.hashtag,e=window.location.search,i=window.location.hash,n=!1;if("search"===t.qsFrom&&(e=c.stringify(t.ngqs,!0),n=!0),o&&"hash"===t.qsFrom&&(i="".concat(i.split("?")[0]).concat(c.stringify(t.ngqs,!0)),n=!0),n){var r="".concat(window.location.pathname).concat(e||"").concat(i||"");window.history.replaceState(null,document.title,r)}},this.gqs={},this.ngqs={},this.qsFrom="search",this.growingIO.emitter.on("OPTION_INITIALIZED",(function(){t.growingIO.useEmbeddedInherit=t.main()}))}};export{I as default};
