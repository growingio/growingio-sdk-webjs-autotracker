var t=function(){return t=Object.assign||function(t){for(var n,e=1,r=arguments.length;r>e;e++)for(var i in n=arguments[e])({}).hasOwnProperty.call(n,i)&&(t[i]=n[i]);return t},t.apply(this,arguments)},n=function(t){return o(["undefined","null"],f(t))},e=function(t){return"string"===f(t)},r=function(t){return"object"===f(t)&&!n(t)},i=function(t){return Array.isArray(t)&&"array"===f(t)},o=function(t,n){return("array"===f(t)||"string"===f(t))&&t.indexOf(n)>=0},u=function(t){return n(t)?"":"".concat(t)},a=function(t){return r(t)?Object.keys(t):[]},c=function(t,n){if(!r(t))return!1;try{return"string"===f(n)?delete t[n]:"array"===f(n)?n.map((function(n){return delete t[n]})):(function(t){return"regexp"===f(t)}(n)&&a(t).forEach((function(e){n.test(e)&&c(t,e)})),!0)}catch(t){return!1}},s=function(t){return i(t)?0===t.length:r(t)?0===a(t).length:!t},f=function(t){return{}.toString.call(t).slice(8,-1).toLowerCase()},l=function(t){var e={};return r(t)&&function(t,o){a(t).forEach((function(o){return function(t,o){var a,c=u(o).slice(0,100);r(t)?e[c]=l(t):i(t)?(e[c]=t.slice(0,100),"cdp"===(null===(a=window.vds)||void 0===a?void 0:a.gioEnvironment)&&(e[c]=e[c].join("||"))):e[c]=n(t)?"":u(t).slice(0,1e3)}(t[o],o)}))}(t),e},v={name:"gioCustomTracking",method:function(o){var v=this;this.growingIO=o,this.getValidResourceItem=function(t){if(t&&r(t)&&t.id&&t.key){var n={id:e(t.id)?t.id:u(t.id),key:e(t.key)?t.key:u(t.key)};return t.attributes&&(n.attributes=t.attributes),n}},this.getDynamicAttributes=function(t){return n(t)||a(t).forEach((function(n){var e;e=t[n],"function"===f(e)?t[n]=t[n]():r(t[n])?c(t,n):i(t[n])||(t[n]=u(t[n]))})),t},this.buildCustomEvent=function(n,i,o,u){var a,c;c=function(){var e=v.growingIO.dataStore,a=e.eventContextBuilder,c=e.eventConverter,f=e.currentPage,d=t({eventType:"CUSTOM",eventName:n,pageShowTimestamp:null==f?void 0:f.time,attributes:l(v.getDynamicAttributes(r(i)&&!s(i)?i:void 0)),resourceItem:l(v.getValidResourceItem(o))},a());s(u)||(d=t(t({},d),u)),c(d)},e(a=n)&&!s(a)&&a.match(/^[a-zA-Z_][0-9a-zA-Z_]{0,100}$/)?c():console.log("%c [GrowingIO]：事件名格式不正确，只能包含数字、字母和下划线，且不能以数字开头，字符总长度不能超过100!","color: #EF4444;")},this.buildUserAttributesEvent=function(n,e){var r=v.growingIO.dataStore,i=r.eventContextBuilder,o=r.eventConverter,u=t({eventType:"LOGIN_USER_ATTRIBUTES",attributes:l(n)},i());s(e)||(u=t(t({},u),e)),o(u)}}};export{v as default};
