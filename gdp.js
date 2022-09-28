!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):(t="undefined"!=typeof globalThis?globalThis:t||self).gdp=e()}(this,(function(){"use strict";Array.prototype.includes=function(){return this.indexOf(arguments[0])>=0},Array.prototype.find=function(){const t=arguments[0];let e;return this.forEach((i=>{t(i)&&void 0===e&&(e=i)})),e},Array.prototype.findIndex=function(){const t=arguments[0];let e=-1;return this.forEach(((i,s)=>{t(i)&&-1===e&&(e=s)})),e},Array.from=function(){let t=arguments[0];if(null==t)throw Error("Array.from requires an array-like object not null or undefined");let e=arguments.length>1?arguments[1]:void 0;if(e&&"function"!=typeof e)throw Error("Array.from: when provided,the second argument must be a function");let i,s=arguments.length>2?arguments[2]:void 0,r=t.length,n=0,o=Array(r);for(;r>n;)i=t[n],o[n]=e?s?e.call(s,i,n):e(i,n):i,n++;return o},Number.isNaN=function(){return""+Number(arguments[0])=="NaN"},String.prototype.includes=function(){return this.indexOf(arguments[0])>=0},String.prototype.startsWith=function(){const t=arguments[0],e=this.slice(0,t.length);return e===t},String.prototype.endsWith=function(){const t=arguments[0],e=this.slice(-t.length);return e===t};const t=["web","wxwv","minp","alip","baidup","qq","bytedance"],e={autotrack:{type:"boolean",default:!0},compress:{type:"boolean",default:!0},dataCollect:{type:"boolean",default:!0},debug:{type:"boolean",default:!1},hashtag:{type:"boolean",default:!1},touch:{type:"boolean",default:!1},version:{type:"string",default:"1.0.0"},platform:{type:"string",default:"web"}},i={enableIdMapping:{type:"boolean",default:!1},gtouchHost:{type:"string",default:""},host:{type:"string",default:""},ignoreFields:{type:"array",default:[]},penetrateHybrid:{type:"boolean",default:!0},scheme:{type:"string",default:location.protocol.indexOf("http")>-1?location.protocol.replace(":",""):"https"},sessionExpires:{type:"number",default:30}},s={},r=["clearUserId","getGioInfo","getLocation","getOption","init","setDataCollect","setOption","setUserId","track","setGeneralProps","clearGeneralProps","enableDebug","enableHT","setAutotrack","setTrackerHost","setTrackerScheme","setUserAttributes","getVisitorId","getDeviceId","registerPlugins","sendPage","sendVisit","trackTimerStart","trackTimerPause","trackTimerResume","trackTimerEnd","removeTimer","clearTrackTimer"],n=["autotrack","dataCollect","dataSourceId","debug","host","hashtag","scheme"],o={autotrack:"无埋点采集",dataCollect:"数据采集",debug:"调试模式"},a=["send","setConfig","collectImp","setPlatformProfile"],d=["screenHeight","screenWidth"],l=t=>null==t||void 0===t,c=t=>"string"==typeof t,h=t=>"number"==typeof t,g=t=>"[object Object]"==={}.toString.call(t)&&!l(t),u=t=>"function"==typeof t,p=t=>Array.isArray(t)&&"[object Array]"==={}.toString.call(t),m=t=>"[object Date]"==={}.toString.call(t),I=t=>{try{return Array.from(t)[0]}catch(t){return}},f=t=>{try{const e=Array.from(t);return e[e.length-1]}catch(t){return}},v=(t,e=1)=>p(t)&&h(e)?t.slice(e>0?e:1,t.length):t,w=t=>{if(p(t)){let e=0;const i=[];for(const s of t)s&&!_(s)&&(i[e++]=s);return i}return t},O=t=>l(t)?"":""+t,S=(t,e)=>"string"==typeof t?t.split(e):t,y=t=>{if(c(t)){const e=S(t,"");return`${I(e).toLowerCase()}${v(e).join("")}`}return t},b=(t,e)=>!!c(t)&&t.slice(0,e.length)===e,E=(t,e)=>{if(c(t)){const{length:i}=t;let s=i;s>i&&(s=i);const r=s;return s-=e.length,s>=0&&t.slice(s,r)===e}return!1},N={}.hasOwnProperty,T=(t,e)=>!l(t)&&N.call(t,e),C=t=>"object"===q(t)?Object.keys(t):[],k=(t,e)=>{C(t).forEach((i=>e(t[i],i)))},j=(t,e)=>{const i=C(t);return!(!g(t)||!g(e)||i.length!==C(e).length||i.map(((i,s)=>g(t[i])?j(t[i],e[i]):t[i]===e[i])).includes(!1))},x=(t,e)=>{if(!g(t))return!1;try{if("string"===q(e))return delete t[e];if("array"===q(e))return e.map((e=>delete t[e]));"object"===q(e)&&e.constructor===RegExp&&C(t).forEach((i=>{e.test(i)&&x(t,i)}))}catch(t){return!1}},_=t=>p(t)?0===t.length:g(t)?0===C(t).length:!t,q=t=>{const e=typeof t;return"object"===e?null===t?"null":p(t)?"array":e:e};var A=Object.freeze({__proto__:null,isNil:l,isString:c,isNumber:h,isBoolean:t=>"boolean"==typeof t,isObject:g,isFunction:u,isArray:p,isDate:m,fixed:(t,e)=>h(t)?Number(t.toFixed(h(e)?e:2)):c(t)&&"NaN"!==O(Number(t))?Number(Number(t).toFixed(h(e)?e:2)):t,head:I,last:f,drop:v,dropWhile:(t,e)=>p(t)?t.filter((t=>!e(t))):t,compact:w,find:(t,e)=>{if(p(t)){const i=t.findIndex(e);return 0>i?void 0:t[i]}},toString:O,split:S,lowerFirst:y,upperFirst:t=>{if(c(t)){const e=S(t,"");return`${I(e).toUpperCase()}${v(e).join("")}`}return t},startsWith:b,endsWith:E,hasOwnProperty:N,has:T,keys:C,forEach:k,isEqual:j,get:(t,e,i)=>{let s=t;return g(t)?(e.split(".").forEach((t=>{s=s?s[t]:i})),s):i},unset:x,isEmpty:_,typeOf:q,formatDate:t=>{if(m(t)){const e=t=>10>t?"0"+t:t;return t.getFullYear()+"-"+e(t.getMonth()+1)+"-"+e(t.getDate())+" "+e(t.getHours())+":"+e(t.getMinutes())+":"+e(t.getSeconds())+"."+e(t.getMilliseconds())}return t}});const P=(t,e)=>{console.log("%c[GrowingIO]："+t,{info:"color: #3B82F6;",error:"color: #EF4444",warn:"color: #F59E0B",success:"color: #10B981"}[e]||"")},D=t=>{try{return t()}catch(t){return}},U=t=>{const e={};return g(t)&&k(t,((t,i)=>{const s=O(i).slice(0,50);g(t)?e[s]=U(t):p(t)?(e[s]=t.slice(0,100),"cdp"===window.gioEnvironment&&(e[s]=e[s].join("||"))):e[s]=l(t)?"":O(t).slice(0,1e3)})),e},R=(t,e,i,s={})=>{document.addEventListener?t.addEventListener(e,i,Object.assign(Object.assign({},{capture:!0}),s)):t.attachEvent?t.attachEvent("on"+e,i):t["on"+e]=i};var K=Object.freeze({__proto__:null,consoleText:P,niceTry:D,limitObject:U,addListener:R,flattenObject:(t={})=>{const e=Object.assign({},t);return C(e).forEach((t=>{g(e[t])?(C(e[t]).forEach((i=>{e[`${t}_${i}`]=O(e[t][i])})),x(e,t)):p(e[t])?(e[t].forEach(((i,s)=>{g(i)?C(i).forEach((r=>{e[`${t}_${s}_${r}`]=O(i[r])})):e[`${t}_${s}`]=O(i)})),x(e,t)):l(e[t])||""===e[t]?x(e,t):e[t]=O(e[t])})),e}});const L=t=>c(t)&&t.length>0||h(t)&&t>0,B=t=>t.vdsConfig||t.gioSDKInitialized||window.vds||window.gioSDKInitialized?(P("SDK重复初始化，请检查是否重复加载SDK或接入其他平台SDK导致冲突!","warn"),!1):!(["","localhost","127.0.0.1"].includes(location.hostname)&&!window._gr_ignore_local_rule&&(P("当前SDK不允许在本地环境初始化!","warn"),1)),F=t=>!_(w(t))||(P('SDK初始化失败，请使用 gdp("init", "您的GrowingIO项目 accountId", "您项目的 dataSourceId", options); 进行初始化!',"error"),!1),$=t=>{const e=I(t);let i=f(t);return L(O(e).trim())?(g(i)&&i||(i={}),{projectId:e,userOptions:i}):(P("SDK初始化失败，accountId 参数不合法!","error"),!1)},H=t=>{const e=t[1],i=t[2],s=f(t);return e&&c(e)?g(s)&&s.host?{dataSourceId:e,appId:c(i)?i:"",cdpOptions:s}:(P("SDK初始化失败，未在配置中指定 host!","error"),!1):(P("SDK初始化失败，dataSourceId 参数不合法!","error"),!1)},V=/^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/i,G=/^(https?:\/\/)|(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i;var W="SESSIONID_UPDATE",z={},M={}.hasOwnProperty;function X(t){try{return decodeURIComponent(t.replace(/\+/g," "))}catch(t){return null}}function J(t){try{return encodeURIComponent(t)}catch(t){return null}}z.stringify=function(t,e){e=e||"";var i,s,r=[];for(s in"string"!=typeof e&&(e="?"),t)if(M.call(t,s)){if((i=t[s])||null!=i&&!isNaN(i)||(i=""),s=J(s),i=J(i),null===s||null===i)continue;r.push(s+"="+i)}return r.length?e+r.join("&"):""},z.parse=function(t){for(var e,i=/([^=?#&]+)=?([^&]*)/g,s={};e=i.exec(t);){var r=X(e[1]),n=X(e[2]);null===r||null===n||r in s||(s[r]=n)}return s};class Q{constructor(t){this.growingIO=t,this.getValidResourceItem=t=>{if(t&&g(t)&&t.id&&t.key){const e={id:c(t.id)?t.id:O(t.id),key:c(t.key)?t.key:O(t.key)};return t.attributes&&(e.attributes=t.attributes),e}},this.getDynamicAttributes=t=>(l(t)||C(t).forEach((e=>{u(t[e])?t[e]=t[e]():g(t[e])?x(t,e):p(t[e])||(t[e]=O(t[e]))})),t),this.buildCustomEvent=(t,e,i,s)=>{if(c(t)&&t.match(/^[a-zA-Z_][0-9a-zA-Z_]{0,50}$/)){const{dataStore:{eventContextBuilder:r,eventConverter:n,currentPage:o}}=this.growingIO;let a=Object.assign({eventType:"CUSTOM",eventName:t,pageShowTimestamp:null==o?void 0:o.time,attributes:U(this.getDynamicAttributes(g(e)&&!_(e)?e:void 0)),resourceItem:U(this.getValidResourceItem(i))},r());_(s)||(a=Object.assign(Object.assign({},a),s)),n(a)}else P("埋点事件格式不正确，事件名只能包含数字、字母和下划线，且不能以数字开头!","warn")},this.buildUserAttributesEvent=(t,e)=>{const{dataStore:{eventContextBuilder:i,eventConverter:s}}=this.growingIO;let r=Object.assign({eventType:"LOGIN_USER_ATTRIBUTES",attributes:U(t)},i());_(e)||(r=Object.assign(Object.assign({},r),e)),s(r)}}}window.gioCustomTracking={name:"gioCustomTracking",method:Q};const Z={};var Y,tt,et;tt={name:"gioCustomTracking",method:Q},et=Z,(Y=["plugins","gioCustomTracking"]).map((function(t,e){et[t]=e==Y.length-1?tt:et[t]||{},et=et[t]}));class it extends class{constructor(t){var e,i,s,r;this.growingIO=t,this.innerPluginInit=()=>{var t;C(null===(t=this.pluginsContext)||void 0===t?void 0:t.plugins).forEach((t=>{var e;const{name:i,method:s}=null===(e=this.pluginsContext)||void 0===e?void 0:e.plugins[t];this.pluginItems.find((t=>t.name===i))||this.pluginItems.push({name:y(i||t),method:s||(t=>{})})})),_(this.pluginItems)||this.installAll()},this.install=(t,e,i)=>{var s,r;const n=e||this.pluginItems.find((e=>e.name===t));if((null===(s=this.growingIO)||void 0===s?void 0:s.plugins)[t])return P(`重复加载插件 ${t} 或插件重名，已跳过加载!`,"warn"),!1;if(!n)return P(`插件加载失败!不存在名为 ${t} 的插件!`,"error"),!1;try{return(null===(r=this.growingIO)||void 0===r?void 0:r.plugins)[t]=new n.method(this.growingIO,i),"cdp"===this.growingIO.gioEnvironment&&e&&P("加载插件："+t,"info"),!0}catch(t){return P("插件加载异常："+t,"error"),!1}},this.installAll=t=>{(t||this.pluginItems).forEach((e=>this.install(e.name,t?e:void 0,t?null==e?void 0:e.options:void 0)))},this.uninstall=t=>{var e;x(this.pluginItems,t);const i=x(null===(e=this.growingIO)||void 0===e?void 0:e.plugins,t);return i||P(`卸载插件 ${t} 失败!`,"error"),i},this.uninstallAll=()=>{this.pluginItems.forEach((t=>this.uninstall(t.name)))},this.lifeError=(t,e)=>P(`插件执行错误 ${t.name} ${e}`,"error"),this.onComposeBefore=t=>{this.pluginItems.forEach((e=>{var i;const s=null===(i=this.growingIO.plugins[e.name])||void 0===i?void 0:i.onComposeBefore;if(s&&u(s))try{s(t)}catch(t){this.lifeError(e,t)}}))},this.onComposeAfter=t=>{this.pluginItems.forEach((e=>{var i;const s=null===(i=this.growingIO.plugins[e.name])||void 0===i?void 0:i.onComposeAfter;if(s&&u(s))try{s(t)}catch(t){this.lifeError(e,t)}}))},this.onSendBefore=t=>{this.pluginItems.forEach((e=>{var i;const s=null===(i=this.growingIO.plugins[e.name])||void 0===i?void 0:i.onSendBefore;if(s&&u(s))try{s(t)}catch(t){this.lifeError(e,t)}}))},this.onSendAfter=t=>{this.pluginItems.forEach((e=>{var i;const s=null===(i=this.growingIO.plugins[e.name])||void 0===i?void 0:i.onSendAfter;if(s&&u(s))try{s(t)}catch(t){this.lifeError(e,t)}}))},this.pluginsContext={plugins:[]},this.pluginItems=[],null===(e=this.growingIO.emitter)||void 0===e||e.on("onComposeBefore",this.onComposeBefore),null===(i=this.growingIO.emitter)||void 0===i||i.on("onComposeAfter",this.onComposeAfter),null===(s=this.growingIO.emitter)||void 0===s||s.on("onSendBefore",this.onSendBefore),null===(r=this.growingIO.emitter)||void 0===r||r.on("onSendAfter",this.onSendAfter)}}{constructor(t){super(t),this.growingIO=t,this.pluginsContext=Z}}const st=()=>"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(t){const e=16*Math.random()|0;return("x"===t?e:3&e|8).toString(16)})),rt=()=>{var t;const e=!!(null===(t=null===window||void 0===window?void 0:window.navigator)||void 0===t?void 0:t.sendBeacon),i=window.navigator.userAgent;if(i.match(/(iPad|iPhone|iPod)/g)){const t=nt(i);return e&&t>13}return e},nt=t=>{const e=t.toLowerCase().match(/cpu.*os (.*?) like mac os/i);return!e||2>e.length?0:+e[1].split("_").slice(0,2).join(".")},ot=()=>{let t=window.location.hostname;return D((()=>{const e=t.split("."),i=f(e);if("localhost"!==t&&(!h(Number(i))||0>Number(i)||Number(i)>255))return["."+e.slice(-2).join("."),"."+e.slice(-3).join(".")]}))||[t]},at=t=>t.endsWith("_gioenc")?t.slice(0,-7):t,dt=t=>Number.isNaN(Number(t))&&D((()=>JSON.parse(t)))||t;function lt(t){for(var e=1;arguments.length>e;e++){var i=arguments[e];for(var s in i)t[s]=i[s]}return t}var ct=function t(e,i){function s(t,s,r){if("undefined"!=typeof document){"number"==typeof(r=lt({},i,r)).expires&&(r.expires=new Date(Date.now()+864e5*r.expires)),r.expires&&(r.expires=r.expires.toUTCString()),t=encodeURIComponent(t).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape);var n="";for(var o in r)r[o]&&(n+="; "+o,!0!==r[o]&&(n+="="+r[o].split(";")[0]));return document.cookie=t+"="+e.write(s,t)+n}}return Object.create({set:s,get:function(t){if("undefined"!=typeof document&&(!arguments.length||t)){for(var i=document.cookie?document.cookie.split("; "):[],s={},r=0;r<i.length;r++){var n=i[r].split("="),o=n.slice(1).join("=");try{var a=decodeURIComponent(n[0]);if(s[a]=e.read(o,a),t===a)break}catch(t){}}return t?s[t]:s}},remove:function(t,e){s(t,"",lt({},e,{expires:-1}))},withAttributes:function(e){return t(this.converter,lt({},this.attributes,e))},withConverter:function(e){return t(lt({},this.converter,e),this.attributes)}},{attributes:{value:Object.freeze(i)},converter:{value:Object.freeze(e)}})}({read:function(t){return'"'===t[0]&&(t=t.slice(1,-1)),t.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent)},write:function(t){return encodeURIComponent(t).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,decodeURIComponent)}},{path:"/"});const ht={A:1,a:1,Z:1,z:1,"@":1},gt=t=>l(t)?t:D((()=>"gioenc-"+pt(t)))||t,ut=t=>c(t)&&t.startsWith("gioenc-")&&D((()=>pt(t.replace("gioenc-",""))))||t,pt=t=>(t=t||"").split("").map((t=>ht[t]?t:mt(t))).join(""),mt=t=>{if(/[0-9]/.test(t))return 1^+t;{let e=t.charCodeAt(0);return String.fromCharCode(1^e)}};const It={};let ft;ft=window.self===window.top&&!["","localhost","127.0.0.1"].includes(window.location.hostname)&&["http:","https:"].includes(window.location.protocol)||!(t=>{try{const t=window.localStorage,e="__storage_test__";return t.setItem(e,e),t.removeItem(e),!0}catch(t){return!1}})()?(()=>{let t=!1;if(navigator.cookieEnabled)return!0;const e=document.cookie;return document.cookie="gioCookie=yes;",document.cookie.indexOf("gioCookie=yes")>-1&&(t=!0),document.cookie=e,t})()?class{constructor(){this.getItem=t=>dt(ut(ct.get(at(t)))),this.setItem=(t,e,i)=>ot().forEach((s=>{let r;r=c(e)?e.length?t.endsWith("_gioenc")?gt(e):e:"":JSON.stringify(e),ct.set(at(t),r,{expires:i?new Date(i):3650,domain:s})})),this.removeItem=t=>ot().forEach((e=>ct.remove(at(t),{domain:e}))),this.hasItem=t=>C(ct.get()).includes(at(t)),this.getKeys=()=>C(ct.get())}}:class{constructor(){this.getItem=t=>{const e=D((()=>JSON.parse(It[at(t)]||"")));return g(e)&&e.expiredAt>+Date.now()?dt(ut(e.value)):void 0},this.setItem=(t,e,i)=>{const s=null!=i?i:+new Date(9999,12);It[at(t)]=JSON.stringify({value:c(e)&&e.length?gt(e):e,expiredAt:s})},this.removeItem=t=>x(It,at(t)),this.hasItem=t=>T(It,at(t)),this.getKeys=()=>C(It)}}:class{constructor(){this.getItem=t=>{const e=D((()=>JSON.parse(localStorage.getItem(at(t))||"")))||{};return g(e)&&e.expiredAt>+Date.now()?dt(ut(e.value)):void 0},this.setItem=(t,e,i)=>{const s=null!=i?i:+new Date(9999,12);localStorage.setItem(at(t),JSON.stringify({value:c(e)&&e.length&&t.endsWith("_gioenc")?gt(e):e,expiredAt:s}))},this.removeItem=t=>localStorage.removeItem(at(t)),this.hasItem=t=>!!localStorage.getItem(at(t)),this.getKeys=()=>Array.from(Array(localStorage.length)).map(((t,e)=>localStorage.key(e)))}};var vt,wt=ft;class Ot{constructor(t){var e;this.growingIO=t;const{projectId:i}=this.growingIO.vdsConfig,{getItem:s,setItem:r}=this.growingIO.storage;this.getItem=s,this.setItem=r,this.sIdStorageName=i+"_gdp_session_id",this.uidStorageName="gdp_user_id_gioenc",this.userIdStorageName=i+"_gdp_cs1_gioenc",this.userKeyStorageName=i+"_gdp_user_key_gioenc",this.gioIdStorageName=i+"_gdp_gio_id_gioenc",null===(e=this.growingIO.emitter)||void 0===e||e.on(W,(()=>{this.growingIO.gioSDKInitialized&&(this.growingIO.dataStore.sendVisit(!0),this.growingIO.dataStore.sendPage(!0))}))}get sessionId(){return this.getItem(this.sIdStorageName)||(this.sessionId=st(),this.sessionId)}set sessionId(t){var e;t||(t=st());const i=this.getItem(this.sIdStorageName)||this.prevSessionId,{sessionExpires:s=30}=this.growingIO.vdsConfig;this.setItem(this.sIdStorageName,t,+Date.now()+60*s*1e3),i!==t&&(null===(e=this.growingIO.emitter)||void 0===e||e.emit(W,{newSessionId:t,oldSessionId:i})),this.prevSessionId=t}get uid(){return this.getItem(this.uidStorageName)||(this.uid=st(),this.uid)}set uid(t){var e;const i=this.getItem(this.uidStorageName)||this.prevUId;this.setItem(this.uidStorageName,t),i!==t&&(null===(e=this.growingIO.emitter)||void 0===e||e.emit("UID_UPDATE",{newUId:t,oldUId:i})),this.prevUId=t}get userId(){return this.getItem(this.userIdStorageName)||""}set userId(t){var e;const i=this.getItem(this.userIdStorageName)||this.prevUserId;this.setItem(this.userIdStorageName,t),i!==t&&(null===(e=this.growingIO.emitter)||void 0===e||e.emit("USERID_UPDATE",{newUserId:t,oldUserId:i,userKey:this.userKey})),t&&(this.gioId=t),this.prevUserId=t}get userKey(){return this.getItem(this.userKeyStorageName)||""}set userKey(t){var e;const i=this.getItem(this.userKeyStorageName)||this.prevUserKey;this.setItem(this.userKeyStorageName,t),i!==t&&(null===(e=this.growingIO.emitter)||void 0===e||e.emit("USERKEY_UPDATE",{newUserKey:t,oldUserKey:i,userId:this.userId})),this.prevUserKey=t}get gioId(){return this.getItem(this.gioIdStorageName)||""}set gioId(t){var e;const i=this.getItem(this.gioIdStorageName)||this.prevGioId;this.setItem(this.gioIdStorageName,t),i!==t&&(null===(e=this.growingIO.emitter)||void 0===e||e.emit("GIOID_UPDATE",{newGioId:t,oldGioId:i})),this.prevGioId=t}}class St{constructor(t){this.growingIO=t,this.main=()=>{var t;const{sdkVersion:e,useEmbeddedInherit:i,vdsConfig:s,userStore:r,dataStore:n,trackingId:o}=this.growingIO,{path:a,query:d}=n.currentPage;let l={appVersion:s.version,dataSourceId:s.dataSourceId,deviceId:r.uid,domain:i?s.appId:window.location.host,gioId:r.gioId,language:navigator.language,path:a,platform:s.platform,query:d,referralPage:(null===(t=n.lastPageEvent)||void 0===t?void 0:t.referralPage)||"",screenHeight:window.screen.height,screenWidth:window.screen.width,sdkVersion:e,sessionId:r.sessionId,timestamp:+Date.now(),title:document.title.slice(0,255),userId:r.userId};return s.enableIdMapping&&(l.userKey=r.userKey),_(this.minpExtraParams)||(l=Object.assign(Object.assign({},l),this.minpExtraParams)),_(s.ignoreFields)||s.ignoreFields.forEach((t=>{x(l,t)})),l.trackingId=o,l},this.minpExtraParams={}}}class yt{constructor(t){this.growingIO=t,this.parsePage=()=>{const{hashtag:t}=this.growingIO.vdsConfig,e=location.pathname,i=location.search,s=location.hash,r=s.indexOf("?");this.domain=window.location.host,this.path=e,t&&(this.path+=r>-1?s.slice(0,r):s),this.query=i,t&&r>-1&&(this.query=this.query+"&"+s.slice(r+1)),this.query&&["?","&"].includes(this.query.charAt(0))&&(this.query=this.query.slice(1)),this.time=+Date.now()},this.pageListener=()=>{this.lastHref!==window.location.href&&(this.parsePage(),this.buildPageEvent(),this.lastHref=window.location.href,this.lastLocation=window.location)},this.hookHistory=()=>{const t=window.history.pushState,e=window.history.replaceState;t&&(D((()=>window.history.pushState=(e,i,s)=>{t.call(window.history,e,i,s),setTimeout(this.pageListener)})),R(window,"popstate",(()=>{location.pathname===this.lastLocation.pathname&&location.search===this.lastLocation.search||this.pageListener}))),e&&D((()=>window.history.replaceState=(t,i,s)=>{e.call(window.history,t,i,s),setTimeout(this.pageListener)})),this.growingIO.vdsConfig.hashtag&&R(window,"hashchange",this.pageListener)},this.buildPageEvent=t=>{const{dataStore:{lastPageEvent:e,eventContextBuilder:i,eventConverter:s}}=this.growingIO;let r=Object.assign(Object.assign({eventType:"PAGE"},i()),{protocolType:location.protocol.substring(0,location.protocol.length-1),referralPage:(null==e?void 0:e.path)===this.path&&(null==e?void 0:e.query)===this.query?null==e?void 0:e.referralPage:(null==e?void 0:e.path)?this.lastHref:document.referrer});_(t)||(r=Object.assign(Object.assign({},r),t)),r.timestamp=this.time,s(r)},this.lastHref=window.location.href,this.lastLocation=window.location}}class bt extends class{constructor(r){var a,h;this.growingIO=r,this.ALLOW_SETTING=Object.assign(Object.assign({},e),"saas"===this.growingIO.gioEnvironment?s:i),this.allowOptKeys=Object.keys(this.ALLOW_SETTING),this.trackTimers={},this.initStorageId=()=>{const t=this.growingIO.storage.getItem(this.seqStorageIdName)||{};let e=Object.assign({},t);x(e,"globalKey"),e=g(e)&&!l(e)?e:{},this._esid={},C(e).forEach((t=>{this._esid[t]=Number.isNaN(Number(e[t]))||e[t]>=1e9||1>e[t]?1:e[t]})),j(e,this._esid)||this.setSequenceIds("esid",this._esid);const i=Number(t.globalKey);this._gsid=Number.isNaN(i)||i>=1e9||1>i?1:i,i!==this._gsid&&this.setSequenceIds("gsid",this._gsid)},this.setSequenceIds=(t,e)=>{let i=this.growingIO.storage.getItem(this.seqStorageIdName)||{};"gsid"===t?i.globalKey=e:i=Object.assign(Object.assign({},i),e),this.growingIO.storage.setItem(this.seqStorageIdName,i)},this.initOptions=e=>{const{projectId:i,dataSourceId:s,appId:r}=e;this.initialDataSourceId=s;const n={};this.allowOptKeys.forEach((i=>{const s=this.ALLOW_SETTING[i].type;let r=p(s)?!s.includes(q(e[i])):q(e[i])!==this.ALLOW_SETTING[i].type;"platform"!==i||t.includes(e[i])||(r=!0),r?n[i]=this.ALLOW_SETTING[i].default:"ignoreFields"===i?n.ignoreFields=e.ignoreFields.filter((t=>d.includes(t))):(n[i]=e[i],["dataCollect","autotrack"].includes(i)&&(n[i]||P("已关闭"+o[i],"info")))})),n.sessionExpires=Math.round(n.sessionExpires),(Number.isNaN(n.sessionExpires)||1>n.sessionExpires||n.sessionExpires>360)&&(n.sessionExpires=30),this.growingIO.vdsConfig=Object.assign(Object.assign({},n),{projectId:i,dataSourceId:s,appId:r,sdkVer:this.growingIO.sdkVersion}),window.vds=this.growingIO.vdsConfig,this.seqStorageIdName=i+"_gdp_sequence_ids"},this.setOption=(t,e)=>{var i;const{vdsConfig:s,callError:r,uploader:o,emitter:a}=this.growingIO,d=c(t)&&n.includes(t),l=d&&typeof e===((null===(i=this.ALLOW_SETTING[t])||void 0===i?void 0:i.type)||"string"),h=Object.assign({},s);return d&&l?(s[t]=e,"dataCollect"===t&&h.dataCollect!==e&&(e?(this.sendVisit(!0),this.sendPage()):this.growingIO.clearTrackTimer()),["host","scheme"].includes(t)&&(null==o||o.generateHost()),null==a||a.emit("OPTION_CHANGE",{optionName:t,optionValue:e}),!0):(r("setOption > "+t),!1)},this.getOption=t=>{const{vdsConfig:e,callError:i}=this.growingIO;return t&&T(e,O(t))?e[O(t)]:l(t)?Object.assign({},e):void i("getOption > "+t)},this.sendVisit=t=>{const{userStore:{sessionId:e},vdsConfig:{projectId:i,dataCollect:s},storage:r}=this.growingIO;if(s){const s=`${i}_gdp_session_id_${e}`,n=r.getItem(s);!t&&[!0,"true"].includes(n)||(this.buildVisitEvent(),r.setItem(s,!0))}},this.buildVisitEvent=t=>{const{dataStore:{eventContextBuilder:e,eventConverter:i}}=this.growingIO;let s=Object.assign(Object.assign({eventType:"VISIT"},e()),{referral:this.lastVisitEvent.referral,referralPage:this.lastPageEvent.referralPage});_(t)||(s.session=(null==t?void 0:t.session)||s.session,s.trackingId=null==t?void 0:t.trackingId,s=Object.assign(Object.assign({},s),t)),i(s)},this.sendPage=t=>{t&&this.currentPage.parsePage(),this.currentPage.buildPageEvent()},this.buildErrorEvent=t=>{const{dataStore:{eventContextBuilder:e,eventConverter:i}}=this.growingIO;i(Object.assign({eventType:"CUSTOM",pageShowTimestamp:this.currentPage.time,eventName:"onError",attributes:t},e()))},this.currentPage=new yt(this.growingIO),this.eventContextBuilderInst=new St(this.growingIO),this.eventContextBuilder=this.eventContextBuilderInst.main,this.generalProps={},this.lastVisitEvent={referralPage:document.referrer},null===(a=this.growingIO.emitter)||void 0===a||a.on("onComposeAfter",(({composedEvent:t})=>{"VISIT"!==t.eventType&&"vst"!==t.t||t.trackingId!==this.growingIO.trackingId||(this.lastVisitEvent=t)})),this.lastPageEvent={},null===(h=this.growingIO.emitter)||void 0===h||h.on("onComposeAfter",(({composedEvent:t})=>{"PAGE"!==t.eventType&&"page"!==t.t||t.trackingId!==this.growingIO.trackingId||(this.lastPageEvent=t)}))}get esid(){const t=this.growingIO.storage.getItem(this.seqStorageIdName)||{};let e=Object.assign({},t);return x(e,"globalKey"),e=g(e)&&!l(e)?e:{},this._esid={},C(e).forEach((t=>{this._esid[t]=Number.isNaN(Number(e[t]))||e[t]>=1e9||1>e[t]?1:e[t]})),this._esid}set esid(t){const e={};C(t).forEach((i=>{e[i]=Number.isNaN(t[i])||t[i]>=1e9||1>t[i]?1:t[i]})),j(this._esid,e)||(this._esid=e,this.setSequenceIds("esid",this._esid))}get gsid(){const t=this.growingIO.storage.getItem(this.seqStorageIdName)||{},e=Number(t.globalKey);return this._gsid=Number.isNaN(e)||e>=1e9||1>e?1:e,this._gsid}set gsid(t){const e=Number(t);this._gsid=Number.isNaN(e)||t>=1e9||1>t?1:t,this.setSequenceIds("gsid",this._gsid)}}{constructor(t){super(t),this.growingIO=t,this.eventConverter=t=>{var e;const{vdsConfig:i,dataStore:s,uploader:r}=this.growingIO;if(i.dataCollect){t.trackingId===this.growingIO.trackingId&&(t.globalSequenceId=s.gsid,t.eventSequenceId=s.esid[t.eventType]||1);const i={};k(t,((t,e)=>{var s;if("element"===e){const e=null!==(s=I(t))&&void 0!==s?s:{};k(e,((t,e)=>{_(t)&&0!==t||(i[e]=t)}))}else(_(t)||l(t))&&0!==t||(i[e]=t)})),t.trackingId===this.growingIO.trackingId&&(this.growingIO.dataStore.gsid+=1,this.growingIO.dataStore.esid=Object.assign(Object.assign({},this.growingIO.dataStore.esid),{[i.eventType]:(this.growingIO.dataStore.esid[i.eventType]||1)+1})),null===(e=this.growingIO.emitter)||void 0===e||e.emit("onComposeAfter",{composedEvent:Object.assign({},i)}),t.trackingId===this.growingIO.trackingId&&r.commitRequest(i)}}}}class Et extends class{constructor(t){this.growingIO=t,this.commitRequest=t=>{const e=Object.assign({},t);this.requestQueue.push(Object.assign(Object.assign({},e),{requestType:rt()?"Beacon":"XHR"})),this.initiateRequest()},this.initiateRequest=()=>{var t,e;if([...this.requestQueue].length>0&&this.requestingNum<this.requestLimit){const{vdsConfig:i,emitter:s,plugins:r,useHybridInherit:n}=this.growingIO;if(this.requestQueue=[...this.requestQueue].filter((t=>(this.retryIds[t.globalSequenceId||t.esid]||0)<=this.retryLimit)),_(this.requestQueue))return;const o=this.requestQueue.shift(),{requestType:a}=o;if(null==s||s.emit("onSendBefore",{requestData:o}),x(o,["requestType","trackingId"]),i.debug&&console.log("[GrowingIO Debug]:",JSON.stringify(o,null,2).replace(/\"/g,(()=>{const t=window.navigator.userAgent;return/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(t)&&!/chrome\/(\d+\.\d+)/i.test(t)})()?"":'"')),this.requestingNum+=1,n)return this.requestSuccessFn(o),!1;let d=Object.assign({},o);switch(i.compress&&(null===(t=null==r?void 0:r.gioCompress)||void 0===t?void 0:t.compressToUint8Array)?(this.compressType="1",d=null===(e=null==r?void 0:r.gioCompress)||void 0===e?void 0:e.compressToUint8Array(JSON.stringify([d]))):(this.compressType="0",d=JSON.stringify([d])),a){case"Beacon":default:this.sendByBeacon(o,d);break;case"XHR":this.sendByXHR(o,d);break;case"Image":this.sendByImage(o,d)}}},this.generateURL=()=>`${this.requestURL}?stm=${+Date.now()}&compress=${this.compressType}`,this.sendByBeacon=(t,e)=>{navigator.sendBeacon(this.generateURL(),e)?this.requestSuccessFn(t):this.requestFailFn(t,"Beacon")},this.sendByXHR=(t,e)=>{var i;const s=["unload","beforeunload","pagehide"].includes(null===(i=null===window||void 0===window?void 0:window.event)||void 0===i?void 0:i.type),r=new XMLHttpRequest;if(r)return r.open("POST",this.generateURL(),s),r.onreadystatechange=()=>{4===r.readyState&&204===r.status?this.requestSuccessFn(t):this.requestFailFn(t,"XHR")},r.setRequestHeader("Content-Type","text/plain;charset=UTF-8"),void r.send(e);if(null===window||void 0===window?void 0:window.XDomainRequest){const i=new window.XDomainRequest;i.open("POST",this.generateURL().replace("https://","http://"),s),i.onload=()=>{204===i.status?this.requestSuccessFn(t):this.requestFailFn(t,"XHR")},i.onerror=i.ontimeout=()=>{this.requestFailFn(t,"XHR")},i.send(e)}},this.sendByImage=(t,e)=>{const i=`${this.generateURL()}&data=${e}`;let s=document.createElement("img");s.width=1,s.height=1,s.onload=()=>{this.requestSuccessFn(t),this.clearImage(s)},s.onerror=s.onabort=()=>{this.requestFailFn(t,"Image"),this.clearImage(s)},s.src=i},this.clearImage=t=>{t.src="",t.onload=()=>{},t.onerror=t.onerabort=()=>{},t=null},this.requestSuccessFn=t=>{var e;this.requestingNum-=1;const i=t.globalSequenceId||t.esid||-1;this.retryIds[i]&&(this.retryIds[i]=0),this.growingIO.userStore.sessionId=this.growingIO.userStore.sessionId,null===(e=this.growingIO.emitter)||void 0===e||e.emit("onSendAfter",{requestData:t}),this.initiateRequest()},this.requestFailFn=(t,e)=>{this.requestingNum-=1;const i=t.globalSequenceId||t.esid||-1;this.retryIds[i]||(this.retryIds[i]=0),this.retryIds[i]+=1;const s=this.requestQueue.some((e=>e.globalSequenceId===t.globalSequenceId&&e.esid===t.esid));let r=e;this.retryIds[i]<this.retryLimit+1||(r="Beacon"===e?"XHR":"XHR"===e?"Image":void 0,this.retryIds[i]=0),!s&&r&&this.requestQueue.push(Object.assign(Object.assign({},t),{requestType:r}))},this.requestQueue=[],this.requestLimit=10,this.requestTimeout=5e3,this.retryLimit=1,this.retryIds={},this.requestingNum=0,this.requestURL=""}}{constructor(t){super(t),this.growingIO=t,this.generateHost=()=>{let{scheme:t,host:e="",projectId:i}=this.growingIO.vdsConfig;t?E(O(t),"://")||(t+="://"):t=(location.protocol.indexOf("http")>-1?location.protocol.replace(":",""):"https")+"//",b(e,"http")&&(e=e.substring(e.indexOf("://")+(E(O(t),"://")?3:0))),this.requestURL=`${t}${e}/v3/projects/${i}/collect`},this.requestURL="",this.generateHost()}}const Nt=new class extends class{constructor(){var t;this.trackingId="g0",this.init=t=>{var e,i,s,r,n;P("Gio Web SDK 初始化中...","info");const{initOptions:o,currentPage:a,sendVisit:d,sendPage:l}=this.dataStore;o(t),this.useEmbeddedInherit=null===(i=null===(e=this.plugins)||void 0===e?void 0:e.gioEmbeddedAdapter)||void 0===i?void 0:i.main(t),this.useHybridInherit=null===(r=null===(s=this.plugins)||void 0===s?void 0:s.gioHybridAdapter)||void 0===r?void 0:r.main(t),null==this||this.initCallback(),a.hookHistory(),a.parsePage(),null===(n=this.emitter)||void 0===n||n.emit("SDK_INITIALIZED",this),P("Gio Web SDK 初始化完成！","success"),this.useEmbeddedInherit||d(),l(),this.gioSDKInitialized=!0},this.setOption=(t,e)=>{if(n.includes(t)){const i=this.dataStore.setOption(t,e);return i&&o[t]&&P(`已${e?"开启":"关闭"}${o[t]}`,"info"),i}return P(`不存在可修改的配置项：${t}，请检查后重试!`,"warn"),!1},this.getOption=t=>this.dataStore.getOption(t),this.setGeneralProps=t=>{g(t)&&!_(t)?(this.dataStore.generalProps=Object.assign(Object.assign({},this.dataStore.generalProps),t),C(this.dataStore.generalProps).forEach((t=>{[void 0,null].includes(this.dataStore.generalProps[t])&&(this.dataStore.generalProps[t]="")}))):this.callError("setGeneralProps")},this.clearGeneralProps=t=>{p(t)&&!_(t)?t.forEach((t=>{x(this.dataStore.generalProps,t)})):this.dataStore.generalProps={}},this.reissuePage=()=>{this.dataStore.sendPage()},this.notRecommended=()=>P("不推荐的方法使用，建议使用 gio('setOption', [optionName], [value])!","info"),this.callError=(t,e=!0,i="参数不合法")=>P(`${e?"调用":"设置"} ${t} 失败，${i}!`,"warn"),this.gioEnvironment="cdp",this.sdkVersion="3.8.0-rc.6",this.utils=Object.assign(Object.assign(Object.assign({},A),K),{qs:z}),this.emitter={all:t=t||new Map,on:function(e,i){var s=t.get(e);s?s.push(i):t.set(e,[i])},off:function(e,i){var s=t.get(e);s&&(i?s.splice(s.indexOf(i)>>>0,1):t.set(e,[]))},emit:function(e,i){var s=t.get(e);s&&s.slice().map((function(t){t(i)})),(s=t.get("*"))&&s.slice().map((function(t){t(e,i)}))}},this.gioSDKInitialized=!1,this.storage=new wt,this.plugins=new it(this),this.plugins.innerPluginInit()}}{constructor(){super(),this.registerPlugins=t=>{t.forEach(((e,i)=>{var s;_(e)||l(e)?P("插件不合法，跳过加载!","warn"):e.js&&(t[i]=Object.assign(Object.assign({},null===(s=e.js)||void 0===s?void 0:s.default),{options:e.options}))})),t=w(t),this.plugins.pluginItems=[...this.plugins.pluginItems,...t],this.plugins.installAll(t)},this.initCallback=()=>{var t,e;this.userStore=new Ot(this),this.uploader=new Et(this),null===(e=null===(t=this.plugins)||void 0===t?void 0:t.gioEventAutoTracking)||void 0===e||e.main(),this.vdsConfig.enableIdMapping||(this.userStore.userKey="")},this.setTrackerScheme=t=>{["http","https"].includes(t)?(this.dataStore.setOption("scheme",t),this.notRecommended()):this.callError("scheme",!1)},this.setTrackerHost=t=>{V.test(t)||G.test(t)?(this.dataStore.setOption("host",t),this.notRecommended()):this.callError("host",!1)},this.setDataCollect=t=>{this.setOption("dataCollect",!!t),this.notRecommended()},this.setAutotrack=t=>{this.setOption("autotrack",!!t),this.notRecommended()},this.enableDebug=t=>{this.setOption("debug",!!t),this.notRecommended()},this.enableHT=t=>{this.setOption("hashtag",!!t),this.notRecommended()},this.getVisitorId=()=>this.userStore.uid,this.getDeviceId=()=>this.userStore.uid,this.setUserAttributes=(t,e)=>{var i,s;!_(t)&&g(t)?null===(s=null===(i=this.plugins)||void 0===i?void 0:i.gioCustomTracking)||void 0===s||s.buildUserAttributesEvent(t,e):this.callError("setUserAttributes")},this.setUserId=(t,e)=>{if(L(O(t).trim())){const i=this.userStore.gioId;this.vdsConfig.enableIdMapping&&(this.userStore.userKey=!l(e)&&O(e).length>0?O(e).slice(0,1e3):""),t=O(t).slice(0,1e3),this.userStore.userId=t,i&&i!==t&&(this.userStore.sessionId=""),i||i===t||this.dataStore.sendVisit(!0)}else this.clearUserId(),this.callError("setUserId")},this.clearUserId=()=>{this.userStore.userId="",this.userStore.userKey=""},this.track=(t,e,i,s)=>{var r,n;((null===(n=null===(r=this.plugins)||void 0===r?void 0:r.gioCustomTracking)||void 0===n?void 0:n.buildCustomEvent)||function(){})(t,Object.assign(Object.assign({},this.dataStore.generalProps),g(e)&&!_(e)?e:{}),i,s)},this.sendPage=t=>this.dataStore.currentPage.buildPageEvent(t),this.sendVisit=t=>this.dataStore.buildVisitEvent(t),this.trackTimerStart=(t,e)=>{if(this.vdsConfig.dataCollect)if(c(t)&&!_(t)&&t.match(/^[a-zA-Z_][0-9a-zA-Z_]{0,50}$/)){const i=st();u(e)?(this.dataStore.trackTimers[i]={eventName:t,leng:0,start:+Date.now()},e(i)):P("回调方法不合法，返回timerId失败!")}else P("事件名格式不正确，只能包含数字、字母和下划线，且不能以数字开头!","error")},this.trackTimerPause=t=>{if(t&&this.dataStore.trackTimers[t]){const e=this.dataStore.trackTimers[t];e.start&&(e.leng=e.leng+(+Date.now()-e.start)),e.start=0}},this.trackTimerResume=t=>{if(t&&this.dataStore.trackTimers[t]){const e=this.dataStore.trackTimers[t];0===e.start&&(e.start=+Date.now())}},this.trackTimerEnd=(t,e)=>{if(this.vdsConfig.dataCollect){const i=864e5;if(t&&this.dataStore.trackTimers[t]){const s=this.dataStore.trackTimers[t];if(0!==s.start){const t=+Date.now()-s.start;s.leng=t>0?s.leng+t:0}this.track(s.eventName,Object.assign(Object.assign({},e),{eventDuration:s.leng>i?0:s.leng/1e3})),this.removeTimer(t)}else P("未查找到对应的计时器，请检查!","error")}},this.removeTimer=t=>{t&&this.dataStore.trackTimers[t]&&delete this.dataStore.trackTimers[t]},this.clearTrackTimer=()=>{this.dataStore.trackTimers={}},this.dataStore=new bt(this)}},Tt=function(){const t=arguments[0];if(c(t)&&r.includes(t)&&Nt[t]){const e=v(Array.from(arguments));if("init"===t){if(!B(Nt))return;if(!F(e))return;const t=$(e);if(!t)return;const i=H(e);if(!i)return;const{projectId:s}=t,{dataSourceId:r,appId:n,cdpOptions:o}=i;Nt.init(Object.assign(Object.assign({},o),{projectId:s,dataSourceId:r,appId:n}))}else if("registerPlugins"===t)Nt.registerPlugins(e[0]);else{if(Nt.gioSDKInitialized&&Nt.vdsConfig)return Nt[t](...e);P("SDK未初始化!","error")}}else a.includes(t)?P(`方法 ${O(t)} 已被弃用，请移除!`,"warn"):P(`不存在名为 ${O(t)} 的方法调用!`,"error");window.gioEnvironment="cdp",window.gioSDKVersion=Nt.sdkVersion},Ct=null===(vt=null===window||void 0===window?void 0:window.gdp)||void 0===vt?void 0:vt.q;return window.gdp=Tt,p(Ct)&&!_(Ct)&&Ct.forEach((t=>{Tt.apply(null,t)})),Tt}));
