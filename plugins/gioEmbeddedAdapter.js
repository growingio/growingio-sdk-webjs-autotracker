!function(e){"function"==typeof define&&define.amd?define(e):e()}((function(){"use strict";function e(e,i,o){if(o||2===arguments.length)for(var n,t=0,r=i.length;r>t;t++)!n&&t in i||(n||(n=[].slice.call(i,0,t)),n[t]=i[t]);return e.concat(n||[].slice.call(i))}var i=function(e){return["undefined","null"].includes(a(e))},o=function(e){return"object"===a(e)&&!i(e)},n={}.hasOwnProperty,t=function(e,o){return!i(e)&&n.call(e,o)},r=function(e){return o(e)?Object.keys(e):[]},a=function(e){return{}.toString.call(e).slice(8,-1).toLowerCase()},c={},g={}.hasOwnProperty;function s(e){try{return decodeURIComponent(e.replace(/\+/g," "))}catch(e){return null}}function d(e){try{return encodeURIComponent(e)}catch(e){return null}}c.stringify=function(e,i){i=i||"";var o,n,t=[];for(n in"string"!=typeof i&&(i="?"),e)if(g.call(e,n)){if((o=e[n])||null!=o&&!isNaN(o)||(o=""),n=d(n),o=d(o),null===n||null===o)continue;t.push(n+"="+o)}return t.length?i+t.join("&"):""},c.parse=function(e){for(var i,o=/([^=?#&]+)=?([^&]*)/g,n={};i=o.exec(e);){var t=s(i[1]),r=s(i[2]);null===t||null===r||t in n||(n[t]=r)}return n};var l={gioprojectid:"projectId",giodatacollect:"dataCollect",gioappid:"domain",giodatasourceid:"dataSourceId",gios:"sessionId",giou:"uid",giocs1:"userId",gioid:"gioId",giouserkey:"userKey",gioappchannel:"appChannel",giodevicebrand:"deviceBrand",giodevicemodel:"deviceModel",giodevicetype:"deviceType",giolanguage:"language",gionetworkstate:"networkState",giooperatingsystem:"operatingSystem",gioplatform:"platform",gioplatformversion:"platformVersion",gioscreenheight:"screenHeight",gioscreenwidth:"screenWidth"},u=["giodatasourceid","gioplatform","gioappchannel","giodevicebrand","giodevicemodel","giodevicetype","giolanguage","gionetworkstate","giooperatingsystem","gioplatformversion","gioscreenheight","gioscreenwidth"],f=["giocs1","gios","giou","gioid","giouserkey"],p="gio_search_cookie_gioenc";window.gioEmbeddedAdapter={name:"gioEmbeddedAdapter",method:function(i){var n=this;this.growingIO=i,this.main=function(e){var i,g,s=e.projectId,d=e.appId,h=n.getGQS(),w=!1;return"none"!==n.qsFrom&&h.gioprojectid===s&&h.gioappid===d&&((function(e){return Array.isArray(e)&&"array"===a(e)}(g=h)?0!==g.length:o(g)?0!==r(g).length:g)?n.growingIO.storage.setItem(p,c.stringify(h)):n.growingIO.storage.removeItem(p),t(h,"giodatacollect")&&(n.growingIO.vdsConfig.dataCollect=["true",!0].includes(h.giodatacollect)),null===(i=n.growingIO.emitter)||void 0===i||i.on("SDK_INITIALIZED",(function(){var e=n.growingIO,i=e.userStore,o=e.vdsConfig.sessionExpires,r=e.dataStore.eventContextBuilderInst;f.forEach((function(e){var o;i[l[e]]=null!==(o=h[e])&&void 0!==o?o:""})),window.setInterval((function(){i.sessionId=h.gios}),.8*o*60*1e3),u.forEach((function(e){t(h,e)&&(r.minpExtraParams[l[e]]=h[e])}))})),n.growingIO.setUserId=function(){},n.growingIO.clearUserId=function(){},n.growingIO.setDataCollect=function(){},n.growingIO.setOption=function(){},w=!0),n.gioURLRewrite(),w},this.getGQS=function(){var i=n.growingIO.vdsConfig.hashtag,o=n.growingIO.storage.getItem(p),a=window.location.search,g=window.location.hash,s=i?g.substring(g.indexOf("?")+1):"",d=c.parse(a),l=c.parse(s),h=c.parse((o||"").replace("gioenc-","")),w={};if(t(d,"gioprojectid"))w=d,n.qsFrom="search";else if(t(l,"gioprojectid"))w=l,n.qsFrom="hash";else{if(!t(h,"gioprojectid"))return n.qsFrom="none",{};w=h,n.qsFrom="cookie"}var m={},v={},I=e(e(["gioappid","gioprojectid","giodatacollect"],f,!0),u,!0);return r(w).forEach((function(e){var i=e.toLowerCase();I.includes(i)?["","undefined","null",void 0,null].includes(w[e])||(m[i]=w[e],["true","TRUE",!0].includes(w[e])&&(m[i]=!0),["false","FALSE",!1].includes(w[e])&&(m[i]=!1)):v[e]=w[e]})),n.gqs=m,n.ngqs=v,m},this.gioURLRewrite=function(){var e=n.growingIO.vdsConfig.hashtag,i=window.location.search,o=window.location.hash,t=!1;if("search"===n.qsFrom&&(i=c.stringify(n.ngqs,!0),t=!0),e&&"hash"===n.qsFrom&&(o="".concat(o.split("?")[0]).concat(c.stringify(n.ngqs,!0)),t=!0),t){var r="".concat(window.location.pathname).concat(i||"").concat(o||"");window.history.replaceState(null,document.title,r)}},this.gqs={},this.ngqs={},this.qsFrom="search"}}}));
