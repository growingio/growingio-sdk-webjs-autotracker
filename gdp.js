!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).gdp=t()}(this,(function(){"use strict";const e=e=>null==e||void 0===e,t=e=>"string"==typeof e,i=e=>"number"==typeof e,s=t=>"[object Object]"==={}.toString.call(t)&&!e(t),n=e=>"function"==typeof e,r=e=>Array.isArray(e)&&"[object Array]"==={}.toString.call(e),o=e=>{try{return Array.from(e)[0]}catch(e){return}},a=e=>{try{const t=Array.from(e);return t[t.length-1]}catch(e){return}},d=(e,t=1)=>r(e)&&i(t)?e.slice(t>0?t:1,e.length):e,l=e=>{if(r(e)){let t=0;const i=[];for(const s of e)s&&!y(s)&&(i[t++]=s);return i}return e},c=t=>e(t)?"":""+t,h=(e,t)=>"string"==typeof e?e.split(t):e,g=e=>{if(t(e)){const t=h(e,"");return`${o(t).toLowerCase()}${d(t).join("")}`}return e},u=(e,t)=>e.slice(0,t.length)===t,p=(e,t)=>{const{length:i}=e;let s=i;s>i&&(s=i);const n=s;return s-=t.length,s>=0&&e.slice(s,n)===t},m={}.hasOwnProperty,I=(t,i)=>!e(t)&&m.call(t,i),v=e=>"object"===b(e)?Object.keys(e):[],f=(e,t)=>{v(e).forEach((i=>t(e[i],i)))},w=(e,t)=>{const i=v(e);return!(!s(e)||!s(t)||i.length!==v(t).length||i.map(((i,n)=>s(e[i])?w(e[i],t[i]):e[i]===t[i])).includes(!1))},O=(e,t)=>{if(!s(e))return!1;try{if("string"===b(t))return delete e[t];if("array"===b(t))return t.map((t=>delete e[t]));"object"===b(t)&&t.constructor===RegExp&&v(e).forEach((i=>{t.test(i)&&O(e,i)}))}catch(e){return!1}},y=e=>r(e)?0===e.length:s(e)?0===v(e).length:!e,b=e=>{const t=typeof e;return"object"===t?null===e?"null":r(e)?"array":t:t};var S=Object.freeze({__proto__:null,isNil:e,isString:t,isNumber:i,isBoolean:e=>"boolean"==typeof e,isObject:s,isFunction:n,isArray:r,fixed:(e,s)=>i(e)?Number(e.toFixed(i(s)?s:2)):t(e)&&"NaN"!==c(Number(e))?Number(Number(e).toFixed(i(s)?s:2)):e,head:o,last:a,drop:d,dropWhile:(e,t)=>r(e)?e.filter((e=>!t(e))):e,compact:l,find:(e,t)=>{if(r(e)){const i=e.findIndex(t);return 0>i?void 0:e[i]}},toString:c,split:h,lowerFirst:g,upperFirst:e=>{if(t(e)){const t=h(e,"");return`${o(t).toUpperCase()}${d(t).join("")}`}return e},startsWith:u,endsWith:p,hasOwnProperty:m,has:I,keys:v,forEach:f,isEqual:w,get:(e,t,i)=>{let n=e;return s(e)?(t.split(".").forEach((e=>{n=n?n[e]:i})),n):i},unset:O,isEmpty:y,typeOf:b});const E=(e,t)=>{console.log("%c[GrowingIO]："+e,{info:"color: #3B82F6;",error:"color: #EF4444",warn:"color: #F59E0B",success:"color: #10B981"}[t]||"")},N=e=>{try{return e()}catch(e){return}},C=t=>{const i={};return s(t)&&f(t,((t,n)=>{const o=c(n).slice(0,50);s(t)?i[o]=C(t):r(t)?(i[o]=t.slice(0,100),"cdp"===window.gioEnvironment&&(i[o]=i[o].join("||"))):i[o]=e(t)?"":c(t).slice(0,1e3)})),i},x=(e,t,i,s={})=>{document.addEventListener?e.addEventListener(t,i,Object.assign(Object.assign({},{capture:!0}),s)):e.attachEvent?e.attachEvent("on"+t,i):e["on"+t]=i};var j=Object.freeze({__proto__:null,consoleText:E,niceTry:N,limitObject:C,addListener:x,flattenObject:(t={})=>{const i=Object.assign({},t);return v(i).forEach((t=>{s(i[t])?(v(i[t]).forEach((e=>{i[`${t}_${e}`]=c(i[t][e])})),O(i,t)):r(i[t])?(i[t].forEach(((e,n)=>{s(e)?v(e).forEach((s=>{i[`${t}_${n}_${s}`]=c(e[s])})):i[`${t}_${n}`]=c(e)})),O(i,t)):e(i[t])||""===i[t]?O(i,t):i[t]=c(i[t])})),i}});const q=()=>"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){const t=16*Math.random()|0;return("x"===e?t:3&t|8).toString(16)})),_=()=>{var e;const t=!!(null===(e=null===window||void 0===window?void 0:window.navigator)||void 0===e?void 0:e.sendBeacon),i=window.navigator.userAgent;if(i.match(/(iPad|iPhone|iPod)/g)){const e=A(i);return t&&e>13}return t},A=e=>{const t=e.toLowerCase().match(/cpu.*os (.*?) like mac os/i);return!t||2>t.length?0:+t[1].split("_").slice(0,2).join(".")},P=()=>{let e=window.location.hostname;return N((()=>{const t=e.split("."),s=a(t);if("localhost"!==e&&(!i(Number(s))||0>Number(s)||Number(s)>255))return["."+t.slice(-2).join("."),"."+t.slice(-3).join(".")]}))||[e]},T=e=>e.endsWith("_gioenc")?e.slice(0,-7):e,k=e=>Number.isNaN(Number(e))&&N((()=>JSON.parse(e)))||e;(window.ActiveXObject||"ActiveXObject"in window||navigator.userAgent.indexOf("compatible")>-1&&navigator.userAgent.indexOf("MSIE")>-1||navigator.userAgent.indexOf("Trident")>-1&&navigator.userAgent.indexOf("rv:11.0")>-1)&&(Array.prototype.includes=function(){return this.indexOf(arguments[0])>=0},Array.prototype.find=function(){const e=arguments[0];let t;return this.forEach((i=>{e(i)&&void 0===t&&(t=i)})),t},Array.prototype.findIndex=function(){const e=arguments[0];let t=-1;return this.forEach(((i,s)=>{e(i)&&-1===t&&(t=s)})),t},Array.from=function(){let e=arguments[0];if(null==e)throw Error("Array.from requires an array-like object not null or undefined");let t=arguments.length>1?arguments[1]:void 0;if(t&&"function"!=typeof t)throw Error("Array.from: when provided,the second argument must be a function");let i,s=arguments.length>2?arguments[2]:void 0,n=e.length,r=0,o=Array(n);for(;n>r;)i=e[r],o[r]=t?s?t.call(s,i,r):t(i,r):i,r++;return o},Number.isNaN=function(){return""+Number(arguments[0])=="NaN"},String.prototype.startsWith=function(){const e=arguments[0],t=this.slice(0,e.length);return t===e},String.prototype.endsWith=function(){const e=arguments[0],t=this.slice(-e.length);return t===e});const D=["web","wxwv","minp","alip","baidup","qq","bytedance"],U={autotrack:{type:"boolean",default:!0},compress:{type:"boolean",default:!0},dataCollect:{type:"boolean",default:!0},debug:{type:"boolean",default:!1},hashtag:{type:"boolean",default:!1},touch:{type:"boolean",default:!1},version:{type:"string",default:"1.0.0"},platform:{type:"string",default:"web"}},R={enableIdMapping:{type:"boolean",default:!1},gtouchHost:{type:"string",default:""},host:{type:"string",default:""},ignoreFields:{type:"array",default:[]},penetrateHybrid:{type:"boolean",default:!0},scheme:{type:"string",default:location.protocol.replace(":","")},sessionExpires:{type:"number",default:30}},K={},L=["clearUserId","getGioInfo","getLocation","getOption","init","setDataCollect","setOption","setUserId","track","setGeneralProps","clearGeneralProps","enableDebug","enableHT","setAutotrack","setTrackerHost","setTrackerScheme","setUserAttributes","getVisitorId","getDeviceId","registerPlugins","sendPage","sendVisit"],B=["autotrack","dataCollect","dataSourceId","debug","host","hashtag","scheme"],F={autotrack:"无埋点采集",dataCollect:"数据采集",debug:"调试模式"},$=["send","setConfig","collectImp","setPlatformProfile"],H=["screenHeight","screenWidth"],V=e=>t(e)&&e.length>0||i(e)&&e>0,G=e=>e.vdsConfig||e.gioSDKInitialized||window.vds||window.gioSDKInitialized?(E("SDK重复初始化，请检查是否重复加载SDK或接入其他平台SDK导致冲突!","warn"),!1):!(["","localhost","127.0.0.1"].includes(location.hostname)&&!window._gr_ignore_local_rule&&(E("当前SDK不允许在本地环境初始化!","warn"),1)),W=e=>!y(l(e))||(E('SDK初始化失败，请使用 gdp("init", "您的GrowingIO项目 accountId", "您项目的 dataSourceId", options); 进行初始化!',"error"),!1),z=e=>{const t=o(e);let i=a(e);return V(c(t).trim())?(s(i)&&i||(i={}),{projectId:t,userOptions:i}):(E("SDK初始化失败，accountId 参数不合法!","error"),!1)},X=e=>{const i=e[1],n=e[2],r=a(e);return i&&t(i)?s(r)&&r.host?{dataSourceId:i,appId:t(n)?n:"",cdpOptions:r}:(E("SDK初始化失败，未在配置中指定 host!","error"),!1):(E("SDK初始化失败，dataSourceId 参数不合法!","error"),!1)},M=/^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/i,J=/^(https?:\/\/)|(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i;var Q="SESSIONID_UPDATE",Z={},Y={}.hasOwnProperty;function ee(e){try{return decodeURIComponent(e.replace(/\+/g," "))}catch(e){return null}}function te(e){try{return encodeURIComponent(e)}catch(e){return null}}Z.stringify=function(e,t){t=t||"";var i,s,n=[];for(s in"string"!=typeof t&&(t="?"),e)if(Y.call(e,s)){if((i=e[s])||null!=i&&!isNaN(i)||(i=""),s=te(s),i=te(i),null===s||null===i)continue;n.push(s+"="+i)}return n.length?t+n.join("&"):""},Z.parse=function(e){for(var t,i=/([^=?#&]+)=?([^&]*)/g,s={};t=i.exec(e);){var n=ee(t[1]),r=ee(t[2]);null===n||null===r||n in s||(s[n]=r)}return s};class ie{constructor(i){this.growingIO=i,this.getValidResourceItem=e=>{if(e&&s(e)&&e.id&&e.key){const i={id:t(e.id)?e.id:c(e.id),key:t(e.key)?e.key:c(e.key)};return e.attributes&&(i.attributes=e.attributes),i}},this.getDynamicAttributes=t=>(e(t)||v(t).forEach((e=>{n(t[e])?t[e]=t[e]():r(t[e])||(t[e]=c(t[e]))})),t),this.buildCustomEvent=(e,i,n,r)=>{if(t(e)&&e.match(/^[a-zA-Z_][0-9a-zA-Z_]{0,50}$/)){const{dataStore:{eventContextBuilder:t,eventConverter:o,currentPage:a}}=this.growingIO;let d=Object.assign({eventType:"CUSTOM",eventName:e,pageShowTimestamp:null==a?void 0:a.time,attributes:C(this.getDynamicAttributes(s(i)&&!y(i)?i:void 0)),resourceItem:C(this.getValidResourceItem(n))},t());y(r)||(d=Object.assign(Object.assign({},d),r)),o(d)}else E("埋点事件格式不正确，事件名只能包含数字、字母和下划线，且不能以数字开头!","warn")},this.buildUserAttributesEvent=(e,t)=>{const{dataStore:{eventContextBuilder:i,eventConverter:s}}=this.growingIO;let n=Object.assign({eventType:"LOGIN_USER_ATTRIBUTES",attributes:C(e)},i());y(t)||(n=Object.assign(Object.assign({},n),t)),s(n)}}}window.gioCustomTracking={name:"gioCustomTracking",method:ie};const se={};var ne,re,oe;re={name:"gioCustomTracking",method:ie},oe=se,(ne=["plugins","gioCustomTracking"]).map((function(e,t){oe[e]=t==ne.length-1?re:oe[e]||{},oe=oe[e]}));class ae extends class{constructor(e){var t,i,s,r;this.growingIO=e,this.innerPluginInit=()=>{var e;v(null===(e=this.pluginsContext)||void 0===e?void 0:e.plugins).forEach((e=>{var t;const{name:i,method:s}=null===(t=this.pluginsContext)||void 0===t?void 0:t.plugins[e];this.pluginItems.find((e=>e.name===i))||this.pluginItems.push({name:g(i||e),method:s||(e=>{})})})),y(this.pluginItems)||this.installAll()},this.install=(e,t,i)=>{var s,n;const r=t||this.pluginItems.find((t=>t.name===e));if((null===(s=this.growingIO)||void 0===s?void 0:s.plugins)[e])return E(`重复加载插件 ${e} 或插件重名，已跳过加载!`,"warn"),!1;if(!r)return E(`插件加载失败!不存在名为 ${e} 的插件!`,"error"),!1;try{return(null===(n=this.growingIO)||void 0===n?void 0:n.plugins)[e]=new r.method(this.growingIO,i),"cdp"===this.growingIO.gioEnvironment&&t&&E("加载插件："+e,"info"),!0}catch(e){return E("插件加载异常："+e,"error"),!1}},this.installAll=e=>{(e||this.pluginItems).forEach((t=>this.install(t.name,e?t:void 0,e?null==t?void 0:t.options:void 0)))},this.uninstall=e=>{var t;O(this.pluginItems,e);const i=O(null===(t=this.growingIO)||void 0===t?void 0:t.plugins,e);return i||E(`卸载插件 ${e} 失败!`,"error"),i},this.uninstallAll=()=>{this.pluginItems.forEach((e=>this.uninstall(e.name)))},this.lifeError=(e,t)=>E(`插件执行错误 ${e.name} ${t}`,"error"),this.onComposeBefore=e=>{this.pluginItems.forEach((t=>{var i;const s=null===(i=this.growingIO.plugins[t.name])||void 0===i?void 0:i.onComposeBefore;if(s&&n(s))try{s(e)}catch(e){this.lifeError(t,e)}}))},this.onComposeAfter=e=>{this.pluginItems.forEach((t=>{var i;const s=null===(i=this.growingIO.plugins[t.name])||void 0===i?void 0:i.onComposeAfter;if(s&&n(s))try{s(e)}catch(e){this.lifeError(t,e)}}))},this.onSendBefore=e=>{this.pluginItems.forEach((t=>{var i;const s=null===(i=this.growingIO.plugins[t.name])||void 0===i?void 0:i.onSendBefore;if(s&&n(s))try{s(e)}catch(e){this.lifeError(t,e)}}))},this.onSendAfter=e=>{this.pluginItems.forEach((t=>{var i;const s=null===(i=this.growingIO.plugins[t.name])||void 0===i?void 0:i.onSendAfter;if(s&&n(s))try{s(e)}catch(e){this.lifeError(t,e)}}))},this.pluginsContext={plugins:[]},this.pluginItems=[],null===(t=this.growingIO.emitter)||void 0===t||t.on("onComposeBefore",this.onComposeBefore),null===(i=this.growingIO.emitter)||void 0===i||i.on("onComposeAfter",this.onComposeAfter),null===(s=this.growingIO.emitter)||void 0===s||s.on("onSendBefore",this.onSendBefore),null===(r=this.growingIO.emitter)||void 0===r||r.on("onSendAfter",this.onSendAfter)}}{constructor(e){super(e),this.growingIO=e,this.pluginsContext=se}}function de(e){for(var t=1;arguments.length>t;t++){var i=arguments[t];for(var s in i)e[s]=i[s]}return e}var le=function e(t,i){function s(e,s,n){if("undefined"!=typeof document){"number"==typeof(n=de({},i,n)).expires&&(n.expires=new Date(Date.now()+864e5*n.expires)),n.expires&&(n.expires=n.expires.toUTCString()),e=encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape);var r="";for(var o in n)n[o]&&(r+="; "+o,!0!==n[o]&&(r+="="+n[o].split(";")[0]));return document.cookie=e+"="+t.write(s,e)+r}}return Object.create({set:s,get:function(e){if("undefined"!=typeof document&&(!arguments.length||e)){for(var i=document.cookie?document.cookie.split("; "):[],s={},n=0;n<i.length;n++){var r=i[n].split("="),o=r.slice(1).join("=");try{var a=decodeURIComponent(r[0]);if(s[a]=t.read(o,a),e===a)break}catch(e){}}return e?s[e]:s}},remove:function(e,t){s(e,"",de({},t,{expires:-1}))},withAttributes:function(t){return e(this.converter,de({},this.attributes,t))},withConverter:function(t){return e(de({},this.converter,t),this.attributes)}},{attributes:{value:Object.freeze(i)},converter:{value:Object.freeze(t)}})}({read:function(e){return'"'===e[0]&&(e=e.slice(1,-1)),e.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent)},write:function(e){return encodeURIComponent(e).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,decodeURIComponent)}},{path:"/"});const ce={A:1,a:1,Z:1,z:1,"@":1},he=t=>e(t)?t:N((()=>"gioenc-"+ue(t)))||t,ge=e=>t(e)&&e.startsWith("gioenc-")&&N((()=>ue(e.replace("gioenc-",""))))||e,ue=e=>(e=e||"").split("").map((e=>ce[e]?e:pe(e))).join(""),pe=e=>{if(/[0-9]/.test(e))return 1^+e;{let t=e.charCodeAt(0);return String.fromCharCode(1^t)}};const me={};let Ie;Ie=window.self===window.top&&!["","localhost","127.0.0.1"].includes(window.location.hostname)&&["http:","https:"].includes(window.location.protocol)||!(e=>{try{const e=window.localStorage,t="__storage_test__";return e.setItem(t,t),e.removeItem(t),!0}catch(e){return!1}})()?(()=>{let e=!1;if(navigator.cookieEnabled)return!0;const t=document.cookie;return document.cookie="gioCookie=yes;",document.cookie.indexOf("gioCookie=yes")>-1&&(e=!0),document.cookie=t,e})()?class{constructor(){this.getItem=e=>k(ge(le.get(T(e)))),this.setItem=(e,i,s)=>P().forEach((n=>{let r;r=t(i)?i.length?e.endsWith("_gioenc")?he(i):i:"":JSON.stringify(i),le.set(T(e),r,{expires:s?new Date(s):3650,domain:n})})),this.removeItem=e=>P().forEach((t=>le.remove(T(e),{domain:t}))),this.hasItem=e=>v(le.get()).includes(T(e)),this.getKeys=()=>v(le.get())}}:class{constructor(){this.getItem=e=>{const t=N((()=>JSON.parse(me[T(e)]||"")));return s(t)&&t.expiredAt>+Date.now()?k(ge(t.value)):void 0},this.setItem=(e,i,s)=>{const n=null!=s?s:+new Date(9999,12);me[T(e)]=JSON.stringify({value:t(i)&&i.length?he(i):i,expiredAt:n})},this.removeItem=e=>O(me,T(e)),this.hasItem=e=>I(me,T(e)),this.getKeys=()=>v(me)}}:class{constructor(){this.getItem=e=>{const t=N((()=>JSON.parse(localStorage.getItem(T(e))||"")))||{};return s(t)&&t.expiredAt>+Date.now()?k(ge(t.value)):void 0},this.setItem=(e,i,s)=>{const n=null!=s?s:+new Date(9999,12);localStorage.setItem(T(e),JSON.stringify({value:t(i)&&i.length&&e.endsWith("_gioenc")?he(i):i,expiredAt:n}))},this.removeItem=e=>localStorage.removeItem(T(e)),this.hasItem=e=>!!localStorage.getItem(T(e)),this.getKeys=()=>Array.from(Array(localStorage.length)).map(((e,t)=>localStorage.key(t)))}};var ve,fe,we=Ie;class Oe{constructor(e){var t;this.growingIO=e;const{projectId:i}=this.growingIO.vdsConfig,{getItem:s,setItem:n}=this.growingIO.storage;this.getItem=s,this.setItem=n,this.sIdStorageName=i+"_gdp_session_id",this.uidStorageName="gdp_user_id_gioenc",this.userIdStorageName=i+"_gdp_cs1_gioenc",this.userKeyStorageName=i+"_gdp_user_key_gioenc",this.gioIdStorageName=i+"_gdp_gio_id_gioenc",null===(t=this.growingIO.emitter)||void 0===t||t.on(Q,(()=>{this.growingIO.gioSDKInitialized&&(this.growingIO.dataStore.sendVisit(!0),this.growingIO.dataStore.sendPage(!0))}))}get sessionId(){return this.getItem(this.sIdStorageName)||(this.sessionId=q(),this.sessionId)}set sessionId(e){var t;e||(e=q());const i=this.getItem(this.sIdStorageName)||this.prevSessionId,{sessionExpires:s=30}=this.growingIO.vdsConfig;this.setItem(this.sIdStorageName,e,+Date.now()+60*s*1e3),i!==e&&(null===(t=this.growingIO.emitter)||void 0===t||t.emit(Q,{newSessionId:e,oldSessionId:i})),this.prevSessionId=e}get uid(){return this.getItem(this.uidStorageName)||(this.uid=q(),this.uid)}set uid(e){var t;const i=this.getItem(this.uidStorageName)||this.prevUId;this.setItem(this.uidStorageName,e),i!==e&&(null===(t=this.growingIO.emitter)||void 0===t||t.emit("UID_UPDATE",{newUId:e,oldUId:i})),this.prevUId=e}get userId(){return this.getItem(this.userIdStorageName)||""}set userId(e){var t;const i=this.getItem(this.userIdStorageName)||this.prevUserId;this.setItem(this.userIdStorageName,e),i!==e&&(null===(t=this.growingIO.emitter)||void 0===t||t.emit("USERID_UPDATE",{newUserId:e,oldUserId:i,userKey:this.userKey})),e&&(this.gioId=e),this.prevUserId=e}get userKey(){return this.getItem(this.userKeyStorageName)||""}set userKey(e){var t;const i=this.getItem(this.userKeyStorageName)||this.prevUserKey;this.setItem(this.userKeyStorageName,e),i!==e&&(null===(t=this.growingIO.emitter)||void 0===t||t.emit("USERKEY_UPDATE",{newUserKey:e,oldUserKey:i,userId:this.userId})),this.prevUserKey=e}get gioId(){return this.getItem(this.gioIdStorageName)||""}set gioId(e){var t;const i=this.getItem(this.gioIdStorageName)||this.prevGioId;this.setItem(this.gioIdStorageName,e),i!==e&&(null===(t=this.growingIO.emitter)||void 0===t||t.emit("GIOID_UPDATE",{newGioId:e,oldGioId:i})),this.prevGioId=e}}class ye{constructor(e){this.growingIO=e,this.main=()=>{var e;const{sdkVersion:t,useEmbeddedInherit:i,vdsConfig:s,userStore:n,dataStore:r,trackingId:o}=this.growingIO,{path:a,query:d}=r.currentPage;let l={appVersion:s.version,dataSourceId:s.dataSourceId,deviceId:n.uid,domain:i?s.appId:window.location.host,gioId:n.gioId,language:navigator.language,path:a,platform:s.platform,query:d,referralPage:(null===(e=r.lastPageEvent)||void 0===e?void 0:e.referralPage)||"",screenHeight:window.screen.height,screenWidth:window.screen.width,sdkVersion:t,sessionId:n.sessionId,timestamp:+Date.now(),title:document.title.slice(0,255),userId:n.userId};return s.enableIdMapping&&(l.userKey=n.userKey),y(this.minpExtraParams)||(l=Object.assign(Object.assign({},l),this.minpExtraParams)),y(s.ignoreFields)||s.ignoreFields.forEach((e=>{O(l,e)})),l.trackingId=o,l},this.minpExtraParams={}}}class be{constructor(e){this.growingIO=e,this.parsePage=()=>{const{hashtag:e}=this.growingIO.vdsConfig,t=location.pathname,i=location.search,s=location.hash,n=s.indexOf("?");this.domain=window.location.host,this.path=t,e&&(this.path+=n>-1?s.slice(0,n):s),this.query=i,e&&n>-1&&(this.query=this.query+"&"+s.slice(n+1)),this.query&&["?","&"].includes(this.query.charAt(0))&&(this.query=this.query.slice(1)),this.time=+Date.now()},this.pageListener=()=>{this.lastHref!==window.location.href&&(this.parsePage(),this.buildPageEvent(),this.lastHref=window.location.href,this.lastLocation=window.location)},this.hookHistory=()=>{const e=window.history.pushState,t=window.history.replaceState;e&&(N((()=>window.history.pushState=(t,i,s)=>{e.call(window.history,t,i,s),setTimeout(this.pageListener)})),x(window,"popstate",(()=>{location.pathname===this.lastLocation.pathname&&location.search===this.lastLocation.search||this.pageListener}))),t&&N((()=>window.history.replaceState=(e,i,s)=>{t.call(window.history,e,i,s),setTimeout(this.pageListener)})),this.growingIO.vdsConfig.hashtag&&x(window,"hashchange",this.pageListener)},this.buildPageEvent=e=>{const{dataStore:{lastPageEvent:t,eventContextBuilder:i,eventConverter:s}}=this.growingIO;let n=Object.assign(Object.assign({eventType:"PAGE"},i()),{protocolType:location.protocol.substring(0,location.protocol.length-1),referralPage:(null==t?void 0:t.path)===this.path&&(null==t?void 0:t.query)===this.query?null==t?void 0:t.referralPage:(null==t?void 0:t.path)?this.lastHref:document.referrer});y(e)||(n=Object.assign(Object.assign({},n),e)),n.timestamp=this.time,s(n)},this.lastHref=window.location.href,this.lastLocation=window.location}}class Se extends class{constructor(i){var n,o;this.growingIO=i,this.ALLOW_SETTING=Object.assign(Object.assign({},U),"saas"===this.growingIO.gioEnvironment?K:R),this.allowOptKeys=Object.keys(this.ALLOW_SETTING),this.initStorageId=()=>{const t=this.growingIO.storage.getItem(this.seqStorageIdName)||{};let i=Object.assign({},t);O(i,"globalKey"),i=s(i)&&!e(i)?i:{},this._esid={},v(i).forEach((e=>{this._esid[e]=Number.isNaN(Number(i[e]))||i[e]>=1e9||1>i[e]?1:i[e]})),w(i,this._esid)||this.setSequenceIds("esid",this._esid);const n=Number(t.globalKey);this._gsid=Number.isNaN(n)||n>=1e9||1>n?1:n,n!==this._gsid&&this.setSequenceIds("gsid",this._gsid)},this.setSequenceIds=(e,t)=>{let i=this.growingIO.storage.getItem(this.seqStorageIdName)||{};"gsid"===e?i.globalKey=t:i=Object.assign(Object.assign({},i),t),this.growingIO.storage.setItem(this.seqStorageIdName,i)},this.initOptions=e=>{const{projectId:t,dataSourceId:i,appId:s}=e;this.initialDataSourceId=i;const n={};this.allowOptKeys.forEach((t=>{const i=this.ALLOW_SETTING[t].type;let s=r(i)?!i.includes(b(e[t])):b(e[t])!==this.ALLOW_SETTING[t].type;"platform"!==t||D.includes(e[t])||(s=!0),s?n[t]=this.ALLOW_SETTING[t].default:"ignoreFields"===t?n.ignoreFields=e.ignoreFields.filter((e=>H.includes(e))):(n[t]=e[t],["dataCollect","autotrack"].includes(t)&&(n[t]||E("已关闭"+F[t],"info")))})),n.sessionExpires=Math.round(n.sessionExpires),(Number.isNaN(n.sessionExpires)||1>n.sessionExpires||n.sessionExpires>360)&&(n.sessionExpires=30),this.growingIO.vdsConfig=Object.assign(Object.assign({},n),{projectId:t,dataSourceId:i,appId:s,sdkVer:this.growingIO.sdkVersion}),window.vds=this.growingIO.vdsConfig,this.seqStorageIdName=t+"_gdp_sequence_ids"},this.setOption=(e,i)=>{var s;const{vdsConfig:n,callError:r,uploader:o,emitter:a}=this.growingIO,d=t(e)&&B.includes(e),l=d&&typeof i===((null===(s=this.ALLOW_SETTING[e])||void 0===s?void 0:s.type)||"string"),c=Object.assign({},n);return d&&l?(n[e]=i,"dataCollect"===e&&!1===c.dataCollect&&!0===i&&(this.sendVisit(!0),this.sendPage()),["host","scheme"].includes(e)&&(null==o||o.generateHost()),null==a||a.emit("OPTION_CHANGE",{optionName:e,optionValue:i}),!0):(r("setOption > "+e),!1)},this.getOption=t=>{const{vdsConfig:i,callError:s}=this.growingIO;return t&&I(i,c(t))?i[c(t)]:e(t)?Object.assign({},i):void s("getOption > "+t)},this.sendVisit=e=>{const{userStore:{sessionId:t},vdsConfig:{projectId:i},storage:s}=this.growingIO,n=`${i}_gdp_session_id_${t}`,r=s.getItem(n);!e&&[!0,"true"].includes(r)||(this.buildVisitEvent(),s.setItem(n,!0))},this.buildVisitEvent=e=>{const{dataStore:{eventContextBuilder:t,eventConverter:i}}=this.growingIO;let s=Object.assign(Object.assign({eventType:"VISIT"},t()),{referral:this.lastVisitEvent.referral,referralPage:this.lastPageEvent.referralPage});y(e)||(s.session=(null==e?void 0:e.session)||s.session,s.trackingId=null==e?void 0:e.trackingId,s=Object.assign(Object.assign({},s),e)),i(s)},this.sendPage=e=>{e&&this.currentPage.parsePage(),this.currentPage.buildPageEvent()},this.buildErrorEvent=e=>{const{dataStore:{eventContextBuilder:t,eventConverter:i}}=this.growingIO;i(Object.assign({eventType:"CUSTOM",pageShowTimestamp:this.currentPage.time,eventName:"onError",attributes:e},t()))},this.currentPage=new be(this.growingIO),this.eventContextBuilderInst=new ye(this.growingIO),this.eventContextBuilder=this.eventContextBuilderInst.main,this.generalProps={},this.lastVisitEvent={referralPage:document.referrer},null===(n=this.growingIO.emitter)||void 0===n||n.on("onComposeAfter",(({composedEvent:e})=>{"VISIT"!==e.eventType&&"vst"!==e.t||e.trackingId!==this.growingIO.trackingId||(this.lastVisitEvent=e)})),this.lastPageEvent={},null===(o=this.growingIO.emitter)||void 0===o||o.on("onComposeAfter",(({composedEvent:e})=>{"PAGE"!==e.eventType&&"page"!==e.t||e.trackingId!==this.growingIO.trackingId||(this.lastPageEvent=e)}))}get esid(){const t=this.growingIO.storage.getItem(this.seqStorageIdName)||{};let i=Object.assign({},t);return O(i,"globalKey"),i=s(i)&&!e(i)?i:{},this._esid={},v(i).forEach((e=>{this._esid[e]=Number.isNaN(Number(i[e]))||i[e]>=1e9||1>i[e]?1:i[e]})),this._esid}set esid(e){const t={};v(e).forEach((i=>{t[i]=Number.isNaN(e[i])||e[i]>=1e9||1>e[i]?1:e[i]})),w(e,t)||(this._esid=t,this.setSequenceIds("esid",this._esid))}get gsid(){const e=this.growingIO.storage.getItem(this.seqStorageIdName)||{},t=Number(e.globalKey);return this._gsid=Number.isNaN(t)||t>=1e9||1>t?1:t,this._gsid}set gsid(e){const t=Number(e);this._gsid=Number.isNaN(t)||e>=1e9||1>e?1:e,this.setSequenceIds("gsid",this._gsid)}}{constructor(t){super(t),this.growingIO=t,this.eventConverter=t=>{var i;const{vdsConfig:s,dataStore:n,uploader:r}=this.growingIO;if(s.dataCollect){t.trackingId===this.growingIO.trackingId&&(t.globalSequenceId=n.gsid,t.eventSequenceId=n.esid[t.eventType]||1);const s={};f(t,((t,i)=>{var n;if("element"===i){const e=null!==(n=o(t))&&void 0!==n?n:{};f(e,((e,t)=>{y(e)&&0!==e||(s[t]=e)}))}else(y(t)||e(t))&&0!==t||(s[i]=t)})),t.trackingId===this.growingIO.trackingId&&(this.growingIO.dataStore.gsid+=1,this.growingIO.dataStore.esid=Object.assign(Object.assign({},this.growingIO.dataStore.esid),{[s.eventType]:(this.growingIO.dataStore.esid[s.eventType]||1)+1})),null===(i=this.growingIO.emitter)||void 0===i||i.emit("onComposeAfter",{composedEvent:Object.assign({},s)}),t.trackingId===this.growingIO.trackingId&&r.commitRequest(s)}}}}class Ee extends class{constructor(e){this.growingIO=e,this.commitRequest=e=>{O(e,"trackingId");const t=Object.assign({},e);this.requestQueue.push(Object.assign(Object.assign({},t),{requestType:_()?"Beacon":"XHR"})),this.initiateRequest()},this.initiateRequest=()=>{var e;if([...this.requestQueue].length>0&&this.requestingNum<this.requestLimit){const{vdsConfig:t,emitter:i,plugins:s,useHybridInherit:n}=this.growingIO;if(this.requestQueue=[...this.requestQueue].filter((e=>(this.retryIds[e.globalSequenceId||e.esid]||0)<=this.retryLimit)),y(this.requestQueue))return;const r=this.requestQueue.shift(),{requestType:o}=r;if(O(r,"requestType"),t.debug&&console.log("[GrowingIO Debug]:",JSON.stringify(r,null,2).replace(/\"/g,(()=>{const e=window.navigator.userAgent;return/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(e)&&!/chrome\/(\d+\.\d+)/i.test(e)})()?"":'"')),null==i||i.emit("onSendBefore",{requestData:r}),this.requestingNum+=1,n)return this.requestSuccessFn(r),!1;let a=Object.assign({},r);switch(t.compress?(this.compressType="1",a=null===(e=null==s?void 0:s.gioCompress)||void 0===e?void 0:e.compressToUint8Array(JSON.stringify([a]))):(this.compressType="0",a=JSON.stringify([a])),o){case"Beacon":default:this.sendByBeacon(r,a);break;case"XHR":this.sendByXHR(r,a);break;case"Image":this.sendByImage(r,a)}}},this.generateURL=()=>`${this.requestURL}?stm=${+Date.now()}&compress=${this.compressType}`,this.sendByBeacon=(e,t)=>{navigator.sendBeacon(this.generateURL(),t)?this.requestSuccessFn(e):this.requestFailFn(e,"Beacon")},this.sendByXHR=(e,t)=>{var i;const s=["unload","beforeunload","pagehide"].includes(null===(i=null===window||void 0===window?void 0:window.event)||void 0===i?void 0:i.type),n=new XMLHttpRequest;if(n)return n.open("POST",this.generateURL(),s),n.onreadystatechange=()=>{4===n.readyState&&204===n.status?this.requestSuccessFn(e):this.requestFailFn(e,"XHR")},n.setRequestHeader("Content-Type","text/plain;charset=UTF-8"),void n.send(t);if(null===window||void 0===window?void 0:window.XDomainRequest){const i=new window.XDomainRequest;i.open("POST",this.generateURL().replace("https://","http://"),s),i.onload=()=>{204===i.status?this.requestSuccessFn(e):this.requestFailFn(e,"XHR")},i.onerror=i.ontimeout=()=>{this.requestFailFn(e,"XHR")},i.send(t)}},this.sendByImage=(e,t)=>{const i=`${this.generateURL()}&data=${t}`;let s=document.createElement("img");s.width=1,s.height=1,s.onload=()=>{this.requestSuccessFn(e),this.clearImage(s)},s.onerror=s.onabort=()=>{this.requestFailFn(e,"Image"),this.clearImage(s)},s.src=i},this.clearImage=e=>{e.src="",e.onload=()=>{},e.onerror=e.onerabort=()=>{},e=null},this.requestSuccessFn=e=>{var t;this.requestingNum-=1;const i=e.globalSequenceId||e.esid||-1;this.retryIds[i]&&(this.retryIds[i]=0),this.growingIO.userStore.sessionId=this.growingIO.userStore.sessionId,null===(t=this.growingIO.emitter)||void 0===t||t.emit("onSendAfter",{requestData:e}),this.initiateRequest()},this.requestFailFn=(e,t)=>{this.requestingNum-=1;const i=e.globalSequenceId||e.esid||-1;this.retryIds[i]||(this.retryIds[i]=0),this.retryIds[i]+=1;const s=this.requestQueue.some((t=>t.globalSequenceId===e.globalSequenceId&&t.esid===e.esid));let n=t;this.retryIds[i]<this.retryLimit+1||(n="Beacon"===t?"XHR":"XHR"===t?"Image":void 0,this.retryIds[i]=0),!s&&n&&this.requestQueue.push(Object.assign(Object.assign({},e),{requestType:n}))},this.requestQueue=[],this.requestLimit=10,this.requestTimeout=5e3,this.retryLimit=1,this.retryIds={},this.requestingNum=0,this.requestURL=""}}{constructor(e){super(e),this.growingIO=e,this.generateHost=()=>{let{scheme:e,host:t="",projectId:i}=this.growingIO.vdsConfig;e?p(c(e),"://")||(e+="://"):e=location.protocol+"//",u(t,"http")&&(t=t.substring(t.indexOf("://")+(p(c(e),"://")?4:1))),this.requestURL=`${e}${t}/v3/projects/${i}/collect`},this.requestURL="",this.generateHost()}}const Ne=new class extends class{constructor(){var e;this.trackingId="g0",this.init=e=>{var t,i,s,n,r;E("Gio Web SDK 初始化中...","info");const{initOptions:o,currentPage:a,sendVisit:d,sendPage:l}=this.dataStore;o(e),this.useEmbeddedInherit=null===(i=null===(t=this.plugins)||void 0===t?void 0:t.gioEmbeddedAdapter)||void 0===i?void 0:i.main(e),this.useHybridInherit=null===(n=null===(s=this.plugins)||void 0===s?void 0:s.gioHybridAdapter)||void 0===n?void 0:n.main(e),null==this||this.initCallback(),a.hookHistory(),a.parsePage(),null===(r=this.emitter)||void 0===r||r.emit("SDK_INITIALIZED",this),E("Gio Web SDK 初始化完成！","success"),this.useEmbeddedInherit||d(),l(),this.gioSDKInitialized=!0},this.setOption=(e,t)=>{if(B.includes(e)){const i=this.dataStore.setOption(e,t);return i&&F[e]&&E(`已${t?"开启":"关闭"}${F[e]}`,"info"),i}return E(`不存在可修改的配置项：${e}，请检查后重试!`,"warn"),!1},this.getOption=e=>this.dataStore.getOption(e),this.setGeneralProps=e=>{s(e)&&!y(e)?(this.dataStore.generalProps=Object.assign(Object.assign({},this.dataStore.generalProps),e),v(this.dataStore.generalProps).forEach((e=>{[void 0,null].includes(this.dataStore.generalProps[e])&&(this.dataStore.generalProps[e]="")}))):this.callError("setGeneralProps")},this.clearGeneralProps=e=>{r(e)&&!y(e)?e.forEach((e=>{O(this.dataStore.generalProps,e)})):this.dataStore.generalProps={}},this.reissuePage=()=>{this.dataStore.sendPage()},this.notRecommended=()=>E("不推荐的方法使用，建议使用 gio('setOption', [optionName], [value])!","info"),this.callError=(e,t=!0,i="参数不合法")=>E(`${t?"调用":"设置"} ${e} 失败，${i}!`,"warn"),this.gioEnvironment="cdp",this.sdkVersion="3.8.0-rc.2",this.utils=Object.assign(Object.assign(Object.assign({},S),j),{qs:Z}),this.emitter={all:e=e||new Map,on:function(t,i){var s=e.get(t);s?s.push(i):e.set(t,[i])},off:function(t,i){var s=e.get(t);s&&(i?s.splice(s.indexOf(i)>>>0,1):e.set(t,[]))},emit:function(t,i){var s=e.get(t);s&&s.slice().map((function(e){e(i)})),(s=e.get("*"))&&s.slice().map((function(e){e(t,i)}))}},this.gioSDKInitialized=!1,this.storage=new we,this.plugins=new ae(this),this.plugins.innerPluginInit()}}{constructor(){super(),this.registerPlugins=e=>{e.forEach(((t,i)=>{var s;t.js&&(e[i]=Object.assign(Object.assign({},null===(s=t.js)||void 0===s?void 0:s.default),{options:t.options}))})),this.plugins.pluginItems=[...this.plugins.pluginItems,...e],this.plugins.installAll(e)},this.initCallback=()=>{var e,t;this.userStore=new Oe(this),this.uploader=new Ee(this),null===(t=null===(e=this.plugins)||void 0===e?void 0:e.gioEventAutoTracking)||void 0===t||t.main(),this.vdsConfig.enableIdMapping||(this.userStore.userKey="")},this.setTrackerScheme=e=>{["http","https"].includes(e)?(this.dataStore.setOption("scheme",e),this.notRecommended()):this.callError("scheme",!1)},this.setTrackerHost=e=>{M.test(e)||J.test(e)?(this.dataStore.setOption("host",e),this.notRecommended()):this.callError("host",!1)},this.setDataCollect=e=>{this.setOption("dataCollect",!!e),this.notRecommended()},this.setAutotrack=e=>{this.setOption("autotrack",!!e),this.notRecommended()},this.enableDebug=e=>{this.setOption("debug",!!e),this.notRecommended()},this.enableHT=e=>{this.setOption("hashtag",!!e),this.notRecommended()},this.getVisitorId=()=>this.userStore.uid,this.getDeviceId=()=>this.userStore.uid,this.setUserAttributes=(e,t)=>{var i,n;!y(e)&&s(e)?null===(n=null===(i=this.plugins)||void 0===i?void 0:i.gioCustomTracking)||void 0===n||n.buildUserAttributesEvent(e,t):this.callError("setUser")},this.setUserId=(t,i)=>{if(V(c(t).trim())){const s=this.userStore.gioId;this.vdsConfig.enableIdMapping&&(this.userStore.userKey=!e(i)&&c(i).length>0?c(i).slice(0,1e3):""),t=c(t).slice(0,1e3),this.userStore.userId=t,s&&s!==t&&(this.userStore.sessionId=""),s||s===t||this.dataStore.sendVisit(!0)}else this.clearUserId(),this.callError("setUserId")},this.clearUserId=()=>{this.userStore.userId="",this.userStore.userKey=""},this.track=(e,t,i,n)=>{var r,o;((null===(o=null===(r=this.plugins)||void 0===r?void 0:r.gioCustomTracking)||void 0===o?void 0:o.buildCustomEvent)||function(){})(e,Object.assign(Object.assign({},this.dataStore.generalProps),s(t)&&!y(t)?t:{}),i,n)},this.sendPage=e=>this.dataStore.currentPage.buildPageEvent(e),this.sendVisit=e=>this.dataStore.buildVisitEvent(e),this.dataStore=new Se(this)}},Ce=function(){const e=arguments[0];if(t(e)&&L.includes(e)&&Ne[e]){const t=d(Array.from(arguments));if("init"===e){const e=G(Ne),i=W(t),s=z(t),n=X(t);if(e&&i&&s&&n){const{projectId:e}=s,{dataSourceId:t,appId:i,cdpOptions:r}=n;Ne.init(Object.assign(Object.assign({},r),{projectId:e,dataSourceId:t,appId:i}))}}else if("registerPlugins"===e)Ne.registerPlugins(t[0]);else{if(Ne.gioSDKInitialized&&Ne.vdsConfig)return Ne[e](...t);E("SDK未初始化!","error")}}else $.includes(e)?E(`方法 ${c(e)} 已被弃用，请移除!`,"warn"):E(`不存在名为 ${c(e)} 的方法调用!`,"error");window.gioEnvironment="cdp",window.gioSDKVersion=Ne.sdkVersion};return r(null===(ve=null===window||void 0===window?void 0:window.gdp)||void 0===ve?void 0:ve.q)&&!y(null===(fe=null===window||void 0===window?void 0:window.gdp)||void 0===fe?void 0:fe.q)&&window.gdp.q.forEach((e=>{Ce.apply(null,e)})),window.gdp=Ce,Ce}));
