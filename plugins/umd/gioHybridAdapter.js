!function(e){"function"==typeof define&&define.amd?define(e):e()}((function(){"use strict";var e=function(e){return n(["undefined","null"],s(e))},i=function(i){return"object"===s(i)&&!e(i)},r=function(e){return Array.isArray(e)&&"array"===s(e)},n=function(e,i){return("array"===s(e)||"string"===s(e))&&e.indexOf(i)>=0},t=function(i){return e(i)?"":"".concat(i)},o=function(e){return i(e)?Object.keys(e):[]},d=function(e,i){o(e).forEach((function(r){return i(e[r],r)}))},a=function(e,r){if(!i(e))return!1;try{return"string"===s(r)?delete e[r]:"array"===s(r)?r.map((function(i){return delete e[i]})):(function(e){return"regexp"===s(e)}(r)&&o(e).forEach((function(i){r.test(i)&&a(e,i)})),!0)}catch(e){return!1}},s=function(e){return{}.toString.call(e).slice(8,-1).toLowerCase()},u=function(e){try{return e()}catch(e){return}},c=["VIEW_CLICK","VIEW_CHANGE","FORM_SUBMIT","PAGE","CUSTOM","LOGIN_USER_ATTRIBUTES"],w=["LOGIN_USER_ATTRIBUTES"];window.gioHybridAdapter={name:"gioHybridAdapter",method:function(e){var o=this;this.growingIO=e,this.penetrateHybrid=!0,this.main=function(e){var i,r;o.projectId=e.projectId,r=e.penetrateHybrid,"boolean"===s(r)&&(o.penetrateHybrid=e.penetrateHybrid),o._initHybridBridge();var n=o.projectId===(null===(i=o.hybridConfig)||void 0===i?void 0:i.projectId);if(n){var d=o.growingIO.emitter;null==d||d.on("USERID_UPDATE",(function(e){var i=e.newUserId,r=e.oldUserId,n=e.userKey;o.penetrateHybrid&&(!i&&r?n?o._clearNativeUserIdAndUserKey():o._clearNativeUserId():n?o._setNativeUserIdAndUserKey(t(i),t(n)):o._setNativeUserId(t(i)))})),null==d||d.on("USERKEY_UPDATE",(function(e){var i=e.newUserKey,r=e.oldUserKey,n=e.userId;o.penetrateHybrid&&(!i&&r?o._clearNativeUserIdAndUserKey():o._setNativeUserIdAndUserKey(t(n),t(i)))}))}return n},this._initHybridBridge=function(){var e,i,r;o.hasHybridBridge=!!window.GrowingWebViewJavascriptBridge,o.hasHybridBridge&&((null===(e=null===window||void 0===window?void 0:window.GrowingWebViewJavascriptBridge)||void 0===e?void 0:e.configuration)||(window.GrowingWebViewJavascriptBridge.configuration=JSON.parse(window.GrowingWebViewJavascriptBridge.getConfiguration())),(null===(i=null===window||void 0===window?void 0:window.GrowingWebViewJavascriptBridge)||void 0===i?void 0:i.configuration)&&(o.hybridConfig=null===(r=null===window||void 0===window?void 0:window.GrowingWebViewJavascriptBridge)||void 0===r?void 0:r.configuration))},this.onSendBefore=function(e){var i,r,t=e.requestData;o.hasHybridBridge&&n(c,t.eventType)&&(n(w,t.eventType)?o.penetrateHybrid&&(null===(i=window.GrowingWebViewJavascriptBridge)||void 0===i||i.dispatchEvent(JSON.stringify(o.processAttributes(t)))):(o.penetrateHybrid||(a(t,"userId"),a(t,"userKey"),a(t,"cs1")),null===(r=window.GrowingWebViewJavascriptBridge)||void 0===r||r.dispatchEvent(JSON.stringify(o.processAttributes(t)))))},this.processAttributes=function(e){return d(e,(function(n,o){i(n)||r(n)?d(e[o],(function(n,d){i(n)||r(n)?e[o][d]=JSON.stringify(n):e[o][d]=t(n)})):e[o]=t(n)})),e},this._setNativeUserId=function(e){u((function(){return window.GrowingWebViewJavascriptBridge.setNativeUserId(e)}))},this._clearNativeUserId=function(){u((function(){return window.GrowingWebViewJavascriptBridge.clearNativeUserId()}))},this._setNativeUserIdAndUserKey=function(e,i){u((function(){return window.GrowingWebViewJavascriptBridge.setNativeUserIdAndUserKey(e,i)}))},this._clearNativeUserIdAndUserKey=function(){u((function(){return window.GrowingWebViewJavascriptBridge.clearNativeUserIdAndUserKey()}))}}}}));
