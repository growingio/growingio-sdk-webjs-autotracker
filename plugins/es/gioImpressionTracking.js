var e=function(e){return["undefined","null"].includes(u(e))},t=function(t){return"object"===u(t)&&!e(t)},n=function(e){return Array.isArray(e)&&"array"===u(e)},r=function(e){try{return Array.from(e)[0]}catch(e){return}},i=function(t){return e(t)?"":"".concat(t)},o=function(e){if("string"===u(e)){var t=function(e,t){return"string"==typeof e?e.split(""):e}(e);return"".concat(r(t).toLowerCase()).concat((i=t,void 0===o&&(o=1),n(i)&&function(e){return"number"===u(e)}(o)?i.slice(o>0?o:1,i.length):i).join(""))}var i,o;return e},a={}.hasOwnProperty,c=function(t,n){return!e(t)&&a.call(t,n)},s=function(e){return t(e)?Object.keys(e):[]},u=function(e){return{}.toString.call(e).slice(8,-1).toLowerCase()};function d(e){for(var t=1;arguments.length>t;t++){var n=arguments[t];for(var r in n)e[r]=n[r]}return e}!function e(t,n){function r(e,r,i){if("undefined"!=typeof document){"number"==typeof(i=d({},n,i)).expires&&(i.expires=new Date(Date.now()+864e5*i.expires)),i.expires&&(i.expires=i.expires.toUTCString()),e=encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape);var o="";for(var a in i)i[a]&&(o+="; "+a,!0!==i[a]&&(o+="="+i[a].split(";")[0]));return document.cookie=e+"="+t.write(r,e)+o}}return Object.create({set:r,get:function(e){if("undefined"!=typeof document&&(!arguments.length||e)){for(var n=document.cookie?document.cookie.split("; "):[],r={},i=0;i<n.length;i++){var o=n[i].split("="),a=o.slice(1).join("=");try{var c=decodeURIComponent(o[0]);if(r[c]=t.read(a,c),e===c)break}catch(e){}}return e?r[e]:r}},remove:function(e,t){r(e,"",d({},t,{expires:-1}))},withAttributes:function(t){return e(this.converter,d({},this.attributes,t))},withConverter:function(t){return e(d({},this.converter,t),this.attributes)}},{attributes:{value:Object.freeze(n)},converter:{value:Object.freeze(t)}})}({read:function(e){return'"'===e[0]&&(e=e.slice(1,-1)),e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent)},write:function(e){return encodeURIComponent(e).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,decodeURIComponent)}},{path:"/"});var p=function(){return p=Object.assign||function(e){for(var t,n=1,r=arguments.length;r>n;n++)for(var i in t=arguments[n])({}).hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e},p.apply(this,arguments)},v=function(e){try{return e()}catch(e){return}},f=function(r){var o={};return t(r)&&function(r,a){s(r).forEach((function(a){return function(r,a){var c=i(a).slice(0,100);t(r)?o[c]=f(r):n(r)?(o[c]=r.slice(0,100),"cdp"===window.gioEnvironment&&(o[c]=o[c].join("||"))):o[c]=e(r)?"":i(r).slice(0,1e3)}(r[a],a)}))}(r),o},m=function(e,t,n,r){void 0===r&&(r={}),document.addEventListener?e.addEventListener(t,n,p(p({},{capture:!0}),r)):e.attachEvent?e.attachEvent("on"+t,n):e["on"+t]=n},g={name:"gioImpressionTracking",method:function(e){var i,a=this;this.growingIO=e,this.documentReady=!1,this.main=function(e){"listener"===e?(a.documentReady=!0,a.growingIO.gioSDKInitialized&&a.initMutationObserver()):"emitter"===e&&a.documentReady&&a.initMutationObserver()},this.initIntersectionObserver=function(){a.intersectionObserver=new IntersectionObserver((function(e){var r;(n(r=e)?0===r.length:t(r)?0===s(r).length:!r)||e.map((function(e){var t=e.target.dataset;if(e.intersectionRatio>0){var n=a.getImpressionProperties(t),r=n.eventId,i=n.properties,o=n.items,s=t.id;if(s){if("once"===t.gioImpType&&c(a.sentImps,s))return;a.sentImps[s]={eventId:r,properties:i,items:o}}r&&a.growingIO.track(r,i,o)}}))}))},this.initMutationObserver=function(){if(a.mutationObserver)return!1;var e=document.querySelectorAll("[data-gio-imp-track]");Array.from(e).map((function(e){var t;null===(t=a.intersectionObserver)||void 0===t||t.observe(e)})),a.mutationObserver=new MutationObserver((function(e){return e.map((function(e){var t;if("attributes"===e.type&&e.target.dataset.gioImpTrack)return null===(t=a.intersectionObserver)||void 0===t?void 0:t.observe(e.target)}))})),a.mutationObserver.observe(document.body,{attributes:!0,childList:!0,subtree:!0,attributeOldValue:!0,attributeFilter:["data-gio-imp-track","data-gio-imp-attrs","data-gio-imp-items",/^data-gio-track-[a-z]+$/i]})},this.getImpressionProperties=function(e){var n={eventId:void 0,properties:{}};if(!(null==e?void 0:e.gioImpTrack))return n;if(n.eventId=e.gioImpTrack,c(e,"gioImpAttrs"))n.properties=v((function(){return t(e.gioImpAttrs)?e.gioImpAttrs:JSON.parse(e.gioImpAttrs)})),n.items=v((function(){return t(e.gioImpItems)?e.gioImpItems:JSON.parse(e.gioImpItems)}));else{var i=/^gioTrack(.+)/;for(var a in e){var s=void 0,u=a.match(i);u&&"track"!==(s=o(u[1]))&&(n.properties[s]=e[a])}}return n.properties=f(n.properties),n.items=f(n.items),/^\w+$/.test(n.eventId)&&!Number.isInteger(Number(r(n.eventId.split(""))))||(n.eventId=null,n={}),n},this.sentImps={},window.ActiveXObject||"ActiveXObject"in window||navigator.userAgent.indexOf("compatible")>-1&&navigator.userAgent.indexOf("MSIE")>-1||navigator.userAgent.indexOf("Trident")>-1&&navigator.userAgent.indexOf("rv:11.0")>-1?("warn",console.log("%c [GrowingIO]：IE浏览器不支持半自动埋点，gioImpressionTracking已自动关闭！","color: #F59E0B")):(this.initIntersectionObserver(),m(document,"readystatechange",(function(){["interactive","complete"].includes(document.readyState)&&a.main("listener")}),{once:!0}),null===(i=this.growingIO.emitter)||void 0===i||i.on("SDK_INITIALIZED",(function(){return a.main("emitter")})),m(window,"unload",(function(){a.intersectionObserver.disconnect(),a.mutationObserver.disconnect()})))}};export{g as default};
