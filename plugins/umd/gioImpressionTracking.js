!function(t){"function"==typeof define&&define.amd?define(t):t()}((function(){"use strict";var t,e,n,r,i,o="function"==typeof Array.from?Array.from:(e||(e=1,n=function(t){return"function"==typeof t},r=function(t){var e=function(t){var e=Number(t);return isNaN(e)?0:0!==e&&isFinite(e)?(e>0?1:-1)*Math.floor(Math.abs(e)):e}(t);return Math.min(Math.max(e,0),9007199254740991)},i=function(t){var e=t.next();return!e.done&&e},t=function(t){var e,o,a,u=this,c=arguments.length>1?arguments[1]:void 0;if(void 0!==c){if(!n(c))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(e=arguments[2])}var s=function(t,e){if(null!=t&&null!=e){var r=t[e];if(null==r)return;if(!n(r))throw new TypeError(r+" is not a function");return r}}(t,function(t){if(null!=t){if(["string","number","boolean","symbol"].indexOf(typeof t)>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in t)return Symbol.iterator;if("@@iterator"in t)return"@@iterator"}}(t));if(void 0!==s){o=n(u)?Object(new u):[];var f,l,v=s.call(t);if(null==v)throw new TypeError("Array.from requires an array-like or iterable object");for(a=0;;){if(!(f=i(v)))return o.length=a,o;l=f.value,o[a]=c?c.call(e,l,a):l,a++}}else{var d=Object(t);if(null==t)throw new TypeError("Array.from requires an array-like object - not null or undefined");var m,p=r(d.length);for(o=n(u)?Object(new u(p)):Array(p),a=0;p>a;)m=d[a],o[a]=c?c.call(e,m,a):m,a++;o.length=p}return o}),t),a=function(t){return f(["undefined","null"],b(t))},u=function(t){return"object"===b(t)&&!a(t)},c=function(t){return Array.isArray(t)&&"array"===b(t)},s=function(t){try{return l(t)[0]}catch(t){return}},f=function(t,e){return("array"===b(t)||"string"===b(t))&&t.indexOf(e)>=0},l=o,v=function(t){return a(t)?"":"".concat(t)},d=function(t){if("string"===b(t)){var e=function(t,e){return"string"==typeof t?t.split(""):t}(t);return"".concat(s(e).toLowerCase()).concat((n=e,void 0===r&&(r=1),c(n)&&function(t){return"number"===b(t)}(r)?n.slice(r>0?r:1,n.length):n).join(""))}var n,r;return t},m={}.hasOwnProperty,p=function(t,e){return!a(t)&&m.call(t,e)},g=function(t){return u(t)?Object.keys(t):[]},b=function(t){return{}.toString.call(t).slice(8,-1).toLowerCase()},I=function(){return I=Object.assign||function(t){for(var e,n=1,r=arguments.length;r>n;n++)for(var i in e=arguments[n])({}).hasOwnProperty.call(e,i)&&(t[i]=e[i]);return t},I.apply(this,arguments)},y=function(t){try{return t()}catch(t){return}},h=function(t){var e={};return u(t)&&function(t,n){g(t).forEach((function(n){return function(t,n){var r,i=v(n).slice(0,100);u(t)?e[i]=h(t):c(t)?(e[i]=t.slice(0,100),"cdp"===(null===(r=window.vds)||void 0===r?void 0:r.gioEnvironment)&&(e[i]=e[i].join("||").slice(0,1e3))):e[i]=a(t)?"":v(t).slice(0,1e3)}(t[n],n)}))}(t),e},O=function(t,e,n,r){void 0===r&&(r={}),document.addEventListener?t.addEventListener(e,n,I(I({},{capture:!0}),r)):t.attachEvent?t.attachEvent("on"+e,n):t["on"+e]=n};window.gioImpressionTracking={name:"gioImpressionTracking",method:function(t){var e,n=this;this.growingIO=t,this.documentReady=!1,this.main=function(t){"listener"===t?(n.documentReady=!0,n.growingIO.gioSDKInitialized&&n.initMutationObserver()):"emitter"===t&&n.documentReady&&n.initMutationObserver()},this.initIntersectionObserver=function(){n.intersectionObserver=new IntersectionObserver((function(t){var e;(c(e=t)?0===e.length:u(e)?0===g(e).length:!e)||t.map((function(t){var e=t.target.dataset;if(t.intersectionRatio>0){var r=n.getImpressionProperties(e),i=r.eventId,o=r.properties,a=r.items,u=e.id;if(u){if("once"===e.gioImpType&&p(n.sentImps,u))return;n.sentImps[u]={eventId:i,properties:o,items:a}}i&&n.growingIO.track(i,o,a)}}))}))},this.initMutationObserver=function(){if(n.mutationObserver)return!1;var t=document.querySelectorAll("[data-gio-imp-track]");l(t).map((function(t){var e;null===(e=n.intersectionObserver)||void 0===e||e.observe(t)})),n.mutationObserver=new MutationObserver((function(t){return t.map((function(t){var e;if("attributes"===t.type&&t.target.dataset.gioImpTrack)return null===(e=n.intersectionObserver)||void 0===e?void 0:e.observe(t.target)}))})),n.mutationObserver.observe(document.body,{attributes:!0,childList:!0,subtree:!0,attributeOldValue:!0,attributeFilter:["data-gio-imp-track","data-gio-imp-attrs","data-gio-imp-items",/^data-gio-track-[a-z]+$/i]})},this.getImpressionProperties=function(t){var e={eventId:void 0,properties:{}};if(!(null==t?void 0:t.gioImpTrack))return e;if(e.eventId=t.gioImpTrack,p(t,"gioImpAttrs"))e.properties=y((function(){return u(t.gioImpAttrs)?t.gioImpAttrs:JSON.parse(t.gioImpAttrs)})),e.items=y((function(){return u(t.gioImpItems)?t.gioImpItems:JSON.parse(t.gioImpItems)}));else{var n=/^gioTrack(.+)/;for(var r in t){var i=void 0,o=r.match(n);o&&"track"!==(i=d(o[1]))&&(e.properties[i]=t[r])}}return e.properties=h(e.properties),e.items=h(e.items),/^\w+$/.test(e.eventId)&&!Number.isInteger(Number(s(e.eventId.split(""))))||(e.eventId=null,e={}),e},this.sentImps={},window.ActiveXObject||"ActiveXObject"in window||navigator.userAgent.indexOf("compatible")>-1&&navigator.userAgent.indexOf("MSIE")>-1||navigator.userAgent.indexOf("Trident")>-1&&navigator.userAgent.indexOf("rv:11.0")>-1?("warn",console.log("%c [GrowingIO]：IE浏览器不支持半自动埋点，gioImpressionTracking已自动关闭！","color: #F59E0B;")):(this.initIntersectionObserver(),O(document,"readystatechange",(function(){f(["interactive","complete"],document.readyState)&&n.main("listener")}),{once:!0}),null===(e=this.growingIO.emitter)||void 0===e||e.on("SDK_INITIALIZED",(function(){return n.main("emitter")})),O(window,"unload",(function(){var t,e;null===(t=n.intersectionObserver)||void 0===t||t.disconnect(),null===(e=n.mutationObserver)||void 0===e||e.disconnect()})))}}}));
