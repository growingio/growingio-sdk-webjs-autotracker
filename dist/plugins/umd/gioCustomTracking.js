!function(n){"function"==typeof define&&define.amd?define(n):n()}((function(){"use strict";var n=function(){return n=Object.assign||function(n){for(var t,e=1,r=arguments.length;r>e;e++)for(var i in t=arguments[e])({}).hasOwnProperty.call(t,i)&&(n[i]=t[i]);return n},n.apply(this,arguments)},t=function(n){return i(["undefined","null"],f(n))},e=function(n){return"object"===f(n)&&!t(n)},r=function(n){return Array.isArray(n)&&"array"===f(n)},i=function(n,t){return("array"===f(n)||"string"===f(n))&&n.indexOf(t)>=0},o=function(n){return t(n)?"":"".concat(n)},u=function(n){return e(n)?Object.keys(n):[]},c=function(n,t){if(!e(n))return!1;try{return"string"===f(t)?delete n[t]:"array"===f(t)?t.map((function(t){return delete n[t]})):(function(n){return"regexp"===f(n)}(t)&&u(n).forEach((function(e){t.test(e)&&c(n,e)})),!0)}catch(n){return!1}},a=function(n){return r(n)?0===n.length:e(n)?0===u(n).length:!n},f=function(n){return{}.toString.call(n).slice(8,-1).toLowerCase()},s=function(n){var i={};return e(n)&&function(n,c){u(n).forEach((function(u){return function(n,u){var c=o(u).slice(0,100);e(n)?i[c]=s(n):r(n)?(i[c]=n.slice(0,100),i[c]=i[c].join("||").slice(0,1e3)):i[c]=t(n)?"":o(n).slice(0,1e3)}(n[u],u)}))}(n),i};window.gioCustomTracking={name:"gioCustomTracking",method:function(l){var g=this;this.growingIO=l,this.getDynamicAttributes=function(n){return t(n)||u(n).forEach((function(t){var u;u=n[t],i(["function","asyncfunction"],f(u))?n[t]=n[t]():e(n[t])?c(n,t):r(n[t])||(n[t]=o(n[t]))})),n},this.buildCustomEvent=function(t,r,i){var o,u;u=function(){var o=g.growingIO.dataStore,u=o.eventContextBuilder,c=o.eventConverter,f=n({eventType:"CUSTOM",eventName:t,attributes:s(g.getDynamicAttributes(e(r)&&!a(r)?r:void 0))},u());a(i)||(f=n(n({},f),i)),c(f)},"string"===f(o=t)&&!a(o)&&o.match(/^[a-zA-Z_][0-9a-zA-Z_]{0,100}$/)?u():console.log("%c [GrowingIO]：事件名格式不正确，只能包含数字、字母和下划线，且不能以数字开头，字符总长度不能超过100!","color: #EF4444;")},this.buildUserAttributesEvent=function(t,e){var r=g.growingIO.dataStore,i=r.eventContextBuilder,o=r.eventConverter,u=n({eventType:"LOGIN_USER_ATTRIBUTES",attributes:s(t)},i());a(e)||(u=n(n({},u),e)),o(u)}}}}));