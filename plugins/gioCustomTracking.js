!function(t){"function"==typeof define&&define.amd?define(t):t()}((function(){"use strict";var t=function(){return t=Object.assign||function(t){for(var n,e=1,r=arguments.length;r>e;e++)for(var i in n=arguments[e])({}).hasOwnProperty.call(n,i)&&(t[i]=n[i]);return t},t.apply(this,arguments)},n=function(t){return o(["undefined","null"],s(t))},e=function(t){return"string"===s(t)},r=function(t){return"object"===s(t)&&!n(t)},i=function(t){return Array.isArray(t)&&"array"===s(t)},o=function(t,n){return("array"===s(t)||"string"===s(t))&&t.indexOf(n)>=0},u=function(t){return n(t)?"":"".concat(t)},c=function(t){return r(t)?Object.keys(t):[]},a=function(t,n){if(!r(t))return!1;try{return"string"===s(n)?delete t[n]:"array"===s(n)?n.map((function(n){return delete t[n]})):(function(t){return"regexp"===s(t)}(n)&&c(t).forEach((function(e){n.test(e)&&a(t,e)})),!0)}catch(t){return!1}},f=function(t){return i(t)?0===t.length:r(t)?0===c(t).length:!t},s=function(t){return{}.toString.call(t).slice(8,-1).toLowerCase()},d=function(t){var e={};return r(t)&&function(t,o){c(t).forEach((function(o){return function(t,o){var c=u(o).slice(0,100);r(t)?e[c]=d(t):i(t)?(e[c]=t.slice(0,100),"cdp"===window.gioEnvironment&&(e[c]=e[c].join("||"))):e[c]=n(t)?"":u(t).slice(0,1e3)}(t[o],o)}))}(t),e};window.gioCustomTracking={name:"gioCustomTracking",method:function(o){var g=this;this.growingIO=o,this.getValidResourceItem=function(t){if(t&&r(t)&&t.id&&t.key){var n={id:e(t.id)?t.id:u(t.id),key:e(t.key)?t.key:u(t.key)};return t.attributes&&(n.attributes=t.attributes),n}},this.getDynamicAttributes=function(t){return n(t)||c(t).forEach((function(n){var e;e=t[n],"function"===s(e)?t[n]=t[n]():r(t[n])?a(t,n):i(t[n])||(t[n]=u(t[n]))})),t},this.buildCustomEvent=function(n,i,o,u){var c,a;a=function(){var e=g.growingIO.dataStore,c=e.eventContextBuilder,a=e.eventConverter,s=e.currentPage,l=t({eventType:"CUSTOM",eventName:n,pageShowTimestamp:null==s?void 0:s.time,attributes:d(g.getDynamicAttributes(r(i)&&!f(i)?i:void 0)),resourceItem:d(g.getValidResourceItem(o))},c());f(u)||(l=t(t({},l),u)),a(l)},e(c=n)&&!f(c)&&c.match(/^[a-zA-Z_][0-9a-zA-Z_]{0,100}$/)?a():console.log("%c [GrowingIO]：事件名格式不正确，只能包含数字、字母和下划线，且不能以数字开头，字符总长度不能超过100!","color: #EF4444")},this.buildUserAttributesEvent=function(n,e){var r=g.growingIO.dataStore,i=r.eventContextBuilder,o=r.eventConverter,u=t({eventType:"LOGIN_USER_ATTRIBUTES",attributes:d(n)},i());f(e)||(u=t(t({},u),e)),o(u)}}}}));
