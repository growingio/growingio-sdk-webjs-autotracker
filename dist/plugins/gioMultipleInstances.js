var n=function(){return n=Object.assign||function(n){for(var r,t=1,e=arguments.length;e>t;t++)for(var i in r=arguments[t])({}).hasOwnProperty.call(r,i)&&(n[i]=r[i]);return n},n.apply(this,arguments)},r=function(n){return e(["undefined","null"],a(n))},t=function(n){return"object"===a(n)&&!r(n)},e=function(n,r){return("array"===a(n)||"string"===a(n))&&n.indexOf(r)>=0},i=function(n){return t(n)?Object.keys(n):[]},o=function(n,r){if(!t(n))return!1;try{return"string"===a(r)?delete n[r]:"array"===a(r)?r.map((function(r){return delete n[r]})):(function(n){return"regexp"===a(n)}(r)&&i(n).forEach((function(t){r.test(t)&&o(n,t)})),!0)}catch(n){return!1}},a=function(n){return{}.toString.call(n).slice(8,-1).toLowerCase()},g={name:"gioMultipleInstances",method:function(g){var c=this;this.growingIO=g,this.getTrackerType=function(n,r){return r.trackingId&&r.trackingId!==n?0:1},this.rewriteDataStore=function(){c.growingIO.dataStore.getTrackerVds=function(r){if(c.growingIO.trackingId===r){var t=n({},c.growingIO.vdsConfig);return o(t,"subInstance"),t}return c.growingIO.subInstance[r]},c.growingIO.dataStore.getKeyPrefix=function(n){var e,o=c.growingIO,g=o.vdsConfig,u=o.subInstance;if(c.growingIO.trackingId&&c.growingIO.trackingId!==n){var s=u[n]||{};return e=function(n,r){void 0===r&&(r=!1);var e=0;if(function(n){return function(n){return Array.isArray(n)&&"array"===a(n)}(n)?0===n.length:t(n)?0===i(n).length:!n}(n)||"boolean"==typeof n)return e;for(var o=0;o<n.length;)e=(e<<5)-e+n.charCodeAt(o),e&=e,o++;return r?Math.abs(e):e}(""+s.projectId+s.dataSourceId,!0),r(e)?"":"".concat(e)}return g.projectId},c.growingIO.dataStore.initTrackerOptions=function(r){var t,e,i=c.growingIO.dataStore.initOptions(r);return c.getTrackerType(r.trackingId,c.growingIO)?(c.growingIO.trackingId=r.trackingId,c.growingIO.vdsConfig=i,window[c.growingIO.vdsName]=i):(o(i,["cookieDomain","debug","forceLogin","hashtag","originalSource","performance","storageType","touch"]),c.growingIO.subInstance[r.trackingId]=i,window[c.growingIO.vdsName].subInstance=n(n({},null!==(e=window[c.growingIO.vdsName].subInstance)&&void 0!==e?e:{}),((t={})[r.trackingId]=i,t))),i.trackingId=r.trackingId,i};var g=c.growingIO.dataStore.eventConverter,u=c;c.growingIO.dataStore.eventConverter=function(){for(var r=this,t=[],i=0;arguments.length>i;i++)t[i]=arguments[i];var c=t[0];if("CUSTOM"===c.eventType){var s=[c.trackingId];!function(n){try{return void c["&&sendTo"].forEach((function(n){"string"===a(n)&&u.growingIO.dataStore.getTrackerVds(n)&&!e(s,n)&&s.push(n)}))}catch(n){return}}(),o(c,"&&sendTo"),s.forEach((function(t){var e=u.growingIO.dataStore.eventContextBuilder,i=n(n({},c),e(t,c.trackingId!==t));i.attributes=n(n({},i.attributes),c.attributes),g.call(r,i)}))}else g.call(this,c)}},this.onSendBefore=function(n){var r=n.requestData;if(r.trackingId!==c.growingIO.trackingId){if(r.trackingId===c.growingIO.useHybridInherit)return!1;c.growingIO.uploader.sendEvent(r)}},this.pluginVersion="4.2.1",this.growingIO.emitter.on("ON_SDK_INITIALIZE_BEFORE",(function(){c.growingIO.trackingId||c.rewriteDataStore(),c.growingIO.subInstance||(c.growingIO.subInstance={})}))}};export{g as default};
