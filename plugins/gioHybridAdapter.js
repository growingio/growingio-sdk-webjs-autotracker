var e=function(r,n){if(!function(e){return"[object Object]"==={}.toString.call(e)&&!function(e){return null==e||void 0===e}(e)}(r))return!1;try{if("string"===i(n))return delete r[n];if("array"===i(n))return n.map((function(e){return delete r[e]}));"object"===i(n)&&n.constructor===RegExp&&function(e){return"object"==typeof e?Object.keys(e):[]}(r).forEach((function(i){n.test(i)&&e(r,i)}))}catch(e){return!1}},i=function(e){var i=typeof e;return"object"===i&&function(e){return Array.isArray(e)&&"[object Array]"==={}.toString.call(e)}(e)?"array":i},r=function(e){try{return e()}catch(e){return}},n=["VIEW_CLICK","VIEW_CHANGE","FORM_SUBMIT","PAGE","CUSTOM","LOGIN_USER_ATTRIBUTES"],t=["LOGIN_USER_ATTRIBUTES"],d=function(i){var d=this;this.growingIO=i,this.penetrateHybrid=!0,this.main=function(e){var i;d.projectId=e.projectId,"boolean"==typeof e.penetrateHybrid&&(d.penetrateHybrid=e.penetrateHybrid),d._initHybridBridge();var r=d.projectId===(null===(i=d.hybridConfig)||void 0===i?void 0:i.projectId);if(r){var n=d.growingIO.emitter;n.on("USERID_UPDATE",(function(e){var i=e.newUserId,r=e.oldUserId,n=e.userKey;d.penetrateHybrid&&(!i&&r?n?d._clearNativeUserIdAndUserKey():d._clearNativeUserId():n?d._setNativeUserIdAndUserKey(i,n):d._setNativeUserId(i))})),n.on("USERKEY_UPDATE",(function(e){var i=e.newUserKey,r=e.oldUserKey,n=e.userId;d.penetrateHybrid&&(!i&&r?d._clearNativeUserIdAndUserKey():d._setNativeUserIdAndUserKey(n,i))}))}return r},this._initHybridBridge=function(){var e,i,r;d.hasHybridBridge=!!window.GrowingWebViewJavascriptBridge,d.hasHybridBridge&&((null===(e=null===window||void 0===window?void 0:window.GrowingWebViewJavascriptBridge)||void 0===e?void 0:e.configuration)||(window.GrowingWebViewJavascriptBridge.configuration=JSON.parse(window.GrowingWebViewJavascriptBridge.getConfiguration())),(null===(i=null===window||void 0===window?void 0:window.GrowingWebViewJavascriptBridge)||void 0===i?void 0:i.configuration)&&(d.hybridConfig=null===(r=null===window||void 0===window?void 0:window.GrowingWebViewJavascriptBridge)||void 0===r?void 0:r.configuration))},this.onSendBefore=function(i){var r,o,a=i.requestData;d.hasHybridBridge&&n.includes(a.eventType)&&(t.includes(a.eventType)?d.penetrateHybrid&&(null===(r=window.GrowingWebViewJavascriptBridge)||void 0===r||r.dispatchEvent(JSON.stringify(a))):(d.penetrateHybrid||(e(a,"userId"),e(a,"userKey"),e(a,"cs1")),null===(o=window.GrowingWebViewJavascriptBridge)||void 0===o||o.dispatchEvent(JSON.stringify(a))))},this._setNativeUserId=function(e){r((function(){return window.GrowingWebViewJavascriptBridge.setNativeUserId(e)}))},this._clearNativeUserId=function(){r((function(){return window.GrowingWebViewJavascriptBridge.clearNativeUserId()}))},this._setNativeUserIdAndUserKey=function(e,i){r((function(){return window.GrowingWebViewJavascriptBridge.setNativeUserIdAndUserKey(e,i)}))},this._clearNativeUserIdAndUserKey=function(){r((function(){return window.GrowingWebViewJavascriptBridge.clearNativeUserIdAndUserKey()}))}};window.gioHybridAdapter={name:"gioHybridAdapter",method:d};var o={name:"gioHybridAdapter",method:d};export{o as default};
