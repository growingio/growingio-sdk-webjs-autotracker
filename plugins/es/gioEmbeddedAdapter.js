function o(o,e,i){if(i||2===arguments.length)for(var n,t=0,r=e.length;r>t;t++)!n&&t in e||(n||(n=[].slice.call(e,0,t)),n[t]=e[t]);return o.concat(n||[].slice.call(e))}var e=function(o){return n(["undefined","null"],g(o))},i=function(o){return"object"===g(o)&&!e(o)},n=function(o,e){return("array"===g(o)||"string"===g(o))&&o.indexOf(e)>=0},t={}.hasOwnProperty,r=function(o,i){return!e(o)&&t.call(o,i)},a=function(o){return i(o)?Object.keys(o):[]},g=function(o){return{}.toString.call(o).slice(8,-1).toLowerCase()},c={},s={}.hasOwnProperty;function l(o){try{return decodeURIComponent(o.replace(/\+/g," "))}catch(o){return null}}function d(o){try{return encodeURIComponent(o)}catch(o){return null}}c.stringify=function(o,e){e=e||"";var i,n,t=[];for(n in"string"!=typeof e&&(e="?"),o)if(s.call(o,n)){if((i=o[n])||null!=i&&!isNaN(i)||(i=""),n=d(n),i=d(i),null===n||null===i)continue;t.push(n+"="+i)}return t.length?e+t.join("&"):""},c.parse=function(o){for(var e,i=/([^=?#&]+)=?([^&]*)/g,n={};e=i.exec(o);){var t=l(e[1]),r=l(e[2]);null===t||null===r||t in n||(n[t]=r)}return n};var u={gioprojectid:"projectId",giodatacollect:"dataCollect",gioappid:"domain",giodatasourceid:"dataSourceId",gios:"sessionId",giou:"uid",giocs1:"userId",gioid:"gioId",giouserkey:"userKey",gioappchannel:"appChannel",giodevicebrand:"deviceBrand",giodevicemodel:"deviceModel",giodevicetype:"deviceType",giolanguage:"language",gionetworkstate:"networkState",giooperatingsystem:"operatingSystem",gioplatform:"platform",gioplatformversion:"platformVersion",gioscreenheight:"screenHeight",gioscreenwidth:"screenWidth"},f=["giodatasourceid","gioplatform","gioappchannel","giodevicebrand","giodevicemodel","giodevicetype","giolanguage","gionetworkstate","giooperatingsystem","gioplatformversion","gioscreenheight","gioscreenwidth"],p=["giocs1","gios","giou","gioid","giouserkey"],h="gio_search_cookie_gioenc",w={name:"gioEmbeddedAdapter",method:function(e){var t=this;this.growingIO=e,this.main=function(o){var e,s,l=o.projectId,d=o.appId,w=t.getGQS(),v=!1;return"none"!==t.qsFrom&&w.gioprojectid===l&&w.gioappid===d&&((function(o){return Array.isArray(o)&&"array"===g(o)}(s=w)?0!==s.length:i(s)?0!==a(s).length:s)?t.growingIO.storage.setItem(h,c.stringify(w)):t.growingIO.storage.removeItem(h),r(w,"giodatacollect")&&(t.growingIO.vdsConfig.dataCollect=n(["true",!0],w.giodatacollect)),null===(e=t.growingIO.emitter)||void 0===e||e.on("SDK_INITIALIZED",(function(){var o=t.growingIO,e=o.userStore,i=o.vdsConfig.sessionExpires,n=o.dataStore.eventContextBuilderInst;p.forEach((function(o){var i;e[u[o]]=null!==(i=w[o])&&void 0!==i?i:""})),window.setInterval((function(){e.sessionId=w.gios}),.8*i*60*1e3),f.forEach((function(o){r(w,o)&&(n.minpExtraParams[u[o]]=w[o])}))})),t.growingIO.setUserId=function(){},t.growingIO.clearUserId=function(){},r(w,"giodatacollect")&&(t.growingIO.setDataCollect=function(){},t.growingIO.setOption=function(){}),v=!0),t.gioURLRewrite(),v},this.getGQS=function(){var e=t.growingIO.vdsConfig.hashtag,i=t.growingIO.storage.getItem(h),g=window.location.search,s=window.location.hash,l=e?s.substring(s.indexOf("?")+1):"",d=c.parse(g),u=c.parse(l),w=c.parse((i||"").replace("gioenc-","")),v={};if(r(d,"gioprojectid"))v=d,t.qsFrom="search";else if(r(u,"gioprojectid"))v=u,t.qsFrom="hash";else{if(!r(w,"gioprojectid"))return t.qsFrom="none",{};v=w,t.qsFrom="cookie"}var m={},I={},y=o(o(["gioappid","gioprojectid","giodatacollect"],p,!0),f,!0);return a(v).forEach((function(o){var e=o.toLowerCase();n(y,e)?n(["","undefined","null",void 0,null],v[o])||(m[e]=v[o],n(["true","TRUE",!0],v[o])&&(m[e]=!0),n(["false","FALSE",!1],v[o])&&(m[e]=!1)):I[o]=v[o]})),t.gqs=m,t.ngqs=I,m},this.gioURLRewrite=function(){var o=t.growingIO.vdsConfig.hashtag,e=window.location.search,i=window.location.hash,n=!1;if("search"===t.qsFrom&&(e=c.stringify(t.ngqs,!0),n=!0),o&&"hash"===t.qsFrom&&(i="".concat(i.split("?")[0]).concat(c.stringify(t.ngqs,!0)),n=!0),n){var r="".concat(window.location.pathname).concat(e||"").concat(i||"");window.history.replaceState(null,document.title,r)}},this.gqs={},this.ngqs={},this.qsFrom="search"}};export{w as default};