var t,e,n,r,i,o=function(){return o=Object.assign||function(t){for(var e,n=1,r=arguments.length;r>n;n++)for(var i in e=arguments[n])({}).hasOwnProperty.call(e,i)&&(t[i]=e[i]);return t},o.apply(this,arguments)},a="function"==typeof Array.from?Array.from:(e||(e=1,n=function(t){return"function"==typeof t},r=function(t){var e=function(t){var e=Number(t);return isNaN(e)?0:0!==e&&isFinite(e)?(e>0?1:-1)*Math.floor(Math.abs(e)):e}(t);return Math.min(Math.max(e,0),9007199254740991)},i=function(t){var e=t.next();return!e.done&&e},t=function(t){var e,o,a,u=this,c=arguments.length>1?arguments[1]:void 0;if(void 0!==c){if(!n(c))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(e=arguments[2])}var s=function(t,e){if(null!=t&&null!=e){var r=t[e];if(null==r)return;if(!n(r))throw new TypeError(r+" is not a function");return r}}(t,function(t){if(null!=t){if(["string","number","boolean","symbol"].indexOf(typeof t)>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in t)return Symbol.iterator;if("@@iterator"in t)return"@@iterator"}}(t));if(void 0!==s){o=n(u)?Object(new u):[];var l,f,v=s.call(t);if(null==v)throw new TypeError("Array.from requires an array-like or iterable object");for(a=0;;){if(!(l=i(v)))return o.length=a,o;f=l.value,o[a]=c?c.call(e,f,a):f,a++}}else{var d=Object(t);if(null==t)throw new TypeError("Array.from requires an array-like object - not null or undefined");var m,p=r(d.length);for(o=n(u)?Object(new u(p)):Array(p),a=0;p>a;)m=d[a],o[a]=c?c.call(e,m,a):m,a++;o.length=p}return o}),t),u=function(t){return m(["undefined","null"],S(t))},c=function(t){return"string"===S(t)},s=function(t){return"object"===S(t)&&!u(t)},l=function(t){return Array.isArray(t)&&"array"===S(t)},f=function(t){return"date"===S(t)},v=function(t){try{return p(t)[0]}catch(t){return}},d=function(t,e){if(void 0===e&&(e=!1),l(t)){for(var n=0,r=[],i=0,o=t;i<o.length;i++){var a=o[i];a&&!w(a)&&(r[n++]=a),e&&0===a&&(r[n++]=a)}return r}return t},m=function(t,e){return("array"===S(t)||"string"===S(t))&&t.indexOf(e)>=0},p=a,g=function(t){return u(t)?"":"".concat(t)},b=function(t){if(c(t)){var e=function(t,e){return"string"==typeof t?t.split(""):t}(t);return"".concat(v(e).toLowerCase()).concat((n=e,void 0===r&&(r=1),l(n)&&function(t){return"number"===S(t)}(r)?n.slice(r>0?r:1,n.length):n).join(""))}var n,r;return t},h={}.hasOwnProperty,y=function(t,e){return!u(t)&&h.call(t,e)},I=function(t){return s(t)?Object.keys(t):[]},O=function(t,e){if(!s(t))return!1;try{return"string"===S(e)?delete t[e]:"array"===S(e)?e.map((function(e){return delete t[e]})):(function(t){return"regexp"===S(t)}(e)&&I(t).forEach((function(n){e.test(n)&&O(t,n)})),!0)}catch(t){return!1}},w=function(t){return l(t)?0===t.length:s(t)?0===I(t).length:!t},S=function(t){return{}.toString.call(t).slice(8,-1).toLowerCase()},N=function(t){try{return t()}catch(t){return}},T=function(t,e,n,r){void 0===r&&(r={}),document.addEventListener?t.addEventListener(e,n,o(o({},{capture:!0}),r)):t.attachEvent?t.attachEvent("on"+e,n):t["on"+e]=n},k=function(t){var e={};return s(t)&&(O(t,"&&sendTo"),function(t,n){I(t).forEach((function(n){return function(t,n){var r=g(n).slice(0,100);s(t)?e[r]=k(t):l(t)?(e[r]=d(t.slice(0,100),!0),e[r]=e[r].join("||").slice(0,1e3)):f(t)?e[r]=function(t){if(f(t)){var e=function(t){return 10>t?"0"+t:t};return t.getFullYear()+"-"+e(t.getMonth()+1)+"-"+e(t.getDate())+" "+e(t.getHours())+":"+e(t.getMinutes())+":"+e(t.getSeconds())+"."+e(t.getMilliseconds())}return t}(t):e[r]=u(t)?"":g(t).slice(0,1e3)}(t[n],n)}))}(t)),e},A=/^data-gio-track-[a-z]+$/i,E=/^gioTrack(.+)/,M=/^[a-zA-Z][a-zA-Z0-9_]{0,99}$/,j={name:"gioImpressionTracking",method:function(t){var e,n=this;this.growingIO=t,this.documentReady=!1,this.main=function(t){m(["listener","manual"],t)?(n.documentReady=!0,n.growingIO.gioSDKInitialized&&n.initMutationObserver()):"emitter"===t&&n.documentReady&&n.initMutationObserver()},this.initIntersectionObserver=function(){n.intersectionObserver=new IntersectionObserver((function(t){w(t)||t.map((function(t){var e=t.target,r=e.dataset,i=e.id;if(t.intersectionRatio>0){var o=n.getImpressionProperties(r);if(i){if("once"===r.gioImpType&&y(n.sentImps,i))return;n.sentImps[i]=o}if(o.eventName){var a=[];r.gioImpSendto&&(a=d(l(r.gioImpSendto)?r.gioImpSendto:N((function(){return JSON.parse(r.gioImpSendto)}))||[]),w(a)&&N((function(){return r.gioImpSendto.split(",").forEach((function(t){(t=c(t)&&t.trim().replace("[","").replace("]",""))&&a.push(t)}))}))),n.buildImpEvent(o,a)}}}))}))},this.initMutationObserver=function(){var t;n.mutationObserver&&(null===(t=n.mutationObserver)||void 0===t||t.disconnect());var e=document.querySelectorAll("[data-gio-imp-track]");p(e).map((function(t){var e;null===(e=n.intersectionObserver)||void 0===e||e.observe(t)})),n.mutationObserver=new MutationObserver((function(t){t.map((function(t){var e,r;"attributes"===t.type&&(null===(e=t.target.dataset)||void 0===e?void 0:e.gioImpTrack)&&(null===(r=n.intersectionObserver)||void 0===r||r.observe(t.target))}))})),n.mutationObserver.observe(document.body,{attributes:!0,childList:!0,subtree:!0,attributeOldValue:!0,attributeFilter:["data-gio-imp-track","data-gio-imp-attrs",A,"data-gio-imp-sendto"]})},this.getImpressionProperties=function(t){var e={eventName:void 0,properties:{}};if(!(null==t?void 0:t.gioImpTrack))return e;if(e.eventName=t.gioImpTrack,y(t,"gioImpAttrs"))e.properties=N((function(){return s(t.gioImpAttrs)?t.gioImpAttrs:JSON.parse(t.gioImpAttrs)}));else for(var n in t){var r=void 0,i=n.match(E);i&&"track"!==(r=b(i[1]))&&(e.properties[r]=t[n])}return e.properties=k(e.properties),M.test(e.eventName)&&!Number.isInteger(Number(v(e.eventName.split(""))))||(e.eventName=null,e={}),e},this.buildImpEvent=function(t,e){var r,i=t.eventName,a=t.properties,u=n.growingIO,c=u.trackingId,l=u.dataStore,f=l.eventContextBuilder,v=l.eventConverter,d=u.plugins,m=o({eventType:"CUSTOM",eventName:i},f(c));m.attributes=k(o(o({},null!==(r=m.attributes)&&void 0!==r?r:{}),s(a)&&!w(a)?a:{})),d.gioMultipleInstances&&!w(e)&&(m["&&sendTo"]=e),v(m)},this.pluginVersion="4.2.1",this.sentImps={},window.IntersectionObserver&&window.MutationObserver?(this.initIntersectionObserver(),m(["interactive","complete"],document.readyState)?this.main("listener"):T(document,"readystatechange",(function(){m(["interactive","complete"],document.readyState)&&n.main("listener")}),{once:!0}),null===(e=this.growingIO.emitter)||void 0===e||e.on("OPTION_INITIALIZED",(function(t){t.trackingId===n.growingIO.trackingId&&n.main("emitter")})),T(window,"unload",(function(){var t,e;null===(t=n.intersectionObserver)||void 0===t||t.disconnect(),null===(e=n.mutationObserver)||void 0===e||e.disconnect()}))):("warn",console.log("%c [GrowingIO]：当前浏览器不支持半自动埋点，gioImpressionTracking已自动关闭！","color: #F59E0B;"))}};export{j as default};
