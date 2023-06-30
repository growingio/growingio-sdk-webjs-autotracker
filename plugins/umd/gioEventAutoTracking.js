!function(e){"function"==typeof define&&define.amd?define(e):e()}((function(){"use strict";var e=function(){return e=Object.assign||function(e){for(var t,n=1,r=arguments.length;r>n;n++)for(var i in t=arguments[n])({}).hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e},e.apply(this,arguments)};function t(e,t,n){if(n||2===arguments.length)for(var r,i=0,o=t.length;o>i;i++)!r&&i in t||(r||(r=[].slice.call(t,0,i)),r[i]=t[i]);return e.concat(r||[].slice.call(t))}location.protocol.indexOf("http")>-1&&location.protocol.replace(":","");var n=["clearUserId","getGioInfo","getLocation","getOption","init","setDataCollect","setOption","setUserId","track","setGeneralProps","clearGeneralProps"];t(t([],n,!0),["setEvar","setPage","setUser","setVisitor"],!1),t(t([],n,!0),["enableDebug","enableHT","setAutotrack","setTrackerHost","setTrackerScheme","setUserAttributes","getVisitorId","getDeviceId","registerPlugins","getPlugins","sendPage","sendVisit","trackTimerStart","trackTimerPause","trackTimerResume","trackTimerEnd","removeTimer","clearTrackTimer"],!1);var r,i,o,a,u,l={click:"VIEW_CLICK",change:"VIEW_CHANGE",submit:"FORM_SUBMIT"},f="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},c="function"==typeof Array.from?Array.from:(i||(i=1,o=function(e){return"function"==typeof e},a=function(e){var t=function(e){var t=Number(e);return isNaN(t)?0:0!==t&&isFinite(t)?(t>0?1:-1)*Math.floor(Math.abs(t)):t}(e);return Math.min(Math.max(t,0),9007199254740991)},u=function(e){var t=e.next();return!t.done&&t},r=function(e){var t,n,r,i=this,l=arguments.length>1?arguments[1]:void 0;if(void 0!==l){if(!o(l))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(t=arguments[2])}var f=function(e,t){if(null!=e&&null!=t){var n=e[t];if(null==n)return;if(!o(n))throw new TypeError(n+" is not a function");return n}}(e,function(e){if(null!=e){if(["string","number","boolean","symbol"].indexOf(typeof e)>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in e)return Symbol.iterator;if("@@iterator"in e)return"@@iterator"}}(e));if(void 0!==f){n=o(i)?Object(new i):[];var c,s,d=f.call(e);if(null==d)throw new TypeError("Array.from requires an array-like or iterable object");for(r=0;;){if(!(c=u(d)))return n.length=r,n;s=c.value,n[r]=l?l.call(t,s,r):s,r++}}else{var h=Object(e);if(null==e)throw new TypeError("Array.from requires an array-like object - not null or undefined");var g,p=a(h.length);for(n=o(i)?Object(new i(p)):Array(p),r=0;p>r;)g=h[r],n[r]=l?l.call(t,g,r):g,r++;n.length=p}return n}),r),s=function(e){return"object"===m(e)&&!function(e){return h(["undefined","null"],m(e))}(e)},d=function(e){try{var t=g(e);return t[t.length-1]}catch(e){return}},h=function(e,t){return("array"===m(e)||"string"===m(e))&&e.indexOf(t)>=0},g=c,p=function(e,t){return"string"===m(e)&&e.slice(0,t.length)===t},v=function(e){return function(e){return Array.isArray(e)&&"array"===m(e)}(e)?0===e.length:s(e)?0===function(e){return s(e)?Object.keys(e):[]}(e).length:!e},m=function(e){return{}.toString.call(e).slice(8,-1).toLowerCase()},_=function(t,n,r,i){void 0===i&&(i={}),document.addEventListener?t.addEventListener(n,r,e(e({},{capture:!0}),i)):t.attachEvent?t.attachEvent("on"+n,r):t["on"+n]=r},T={},N={};!function(e){var t=f&&f.__spreadArray||function(e,t,n){if(n||2===arguments.length)for(var r,i=0,o=t.length;o>i;i++)!r&&i in t||(r||(r=[].slice.call(t,0,i)),r[i]=t[i]);return e.concat(r||[].slice.call(t))};Object.defineProperty(e,"__esModule",{value:!0}),e.GROWING_TITLE_OLD=e.GROWING_TITLE=e.GROWING_GTITLE=e.GROWING_CDP_INDEX=e.GROWING_INDEX_OLD=e.GROWING_INDEX=e.GROWING_CONTAINER=e.GROWING_TRACK=e.GROWING_IGNORE=e.VALID_CLASS_SELECTOR=e.VALID_ID_SELECTOR=e.EXCLUDE_CLASS_RE=e.UNSUPPORTED_TAGS=e.TEXT_NODE=e.UNSUPPORTED_CLICK_TAGS=e.SUPPORTED_ICON_TAGS=e.SUPPORTED_CHANGE_TYPES=e.SUPPORTED_CLICK_INPUT_TYPES=e.SUPPORTED_CONTAINER_TAGS=e.LIST_TAGS=void 0,e.LIST_TAGS=["TR","LI","DL"],e.SUPPORTED_CONTAINER_TAGS=t(["A","BUTTON"],e.LIST_TAGS,!0),e.SUPPORTED_CLICK_INPUT_TYPES=["button","submit","reset"],e.SUPPORTED_CHANGE_TYPES=["radio","checkbox","search"],e.SUPPORTED_ICON_TAGS=["I","EM","svg","IMG"],e.UNSUPPORTED_CLICK_TAGS=["TEXTAREA","HTML","BODY"],e.TEXT_NODE=["I","SPAN","EM","B","STRONG"],e.UNSUPPORTED_TAGS=["tspan","text","g","rect","path","defs","clippath","desc","title","math","use"],e.EXCLUDE_CLASS_RE=/(^| |[^ ]+\-)(clear|clearfix|active|hover|enabled|current|selected|unselected|hidden|display|focus|disabled|undisabled|open|checked|unchecked|undefined|null|ng-|growing-)[^\. ]*/g,e.VALID_ID_SELECTOR=/^[a-zA-Z-\_][a-zA-Z\-\_0-9]+$/,e.VALID_CLASS_SELECTOR=/^([a-zA-Z\-\_0-9]+)$/,e.GROWING_IGNORE="data-growing-ignore",e.GROWING_TRACK="data-growing-track",e.GROWING_CONTAINER="data-growing-container",e.GROWING_INDEX="data-growing-index",e.GROWING_INDEX_OLD="data-growing-idx",e.GROWING_CDP_INDEX="data-index",e.GROWING_GTITLE="data-growing-title",e.GROWING_TITLE="data-title",e.GROWING_TITLE_OLD="growing-title"}(N);var E,y,b={},O={};Object.defineProperty(O,"__esModule",{value:!0}),O.lastFindIndex=O.findIndex=O.arrayEquals=O.rmBlank=O.normalizePath=O.splitNoEmpty=O.filterText=void 0,O.filterText=function(e,t){if(void 0===t&&(t=!0),e&&(null==(e=e.replace(/[\n \t]+/g," ").trim())?void 0:e.length))return e.slice(0,t?50:void 0)},O.splitNoEmpty=function(e,t){return e?e.split(t).filter((function(e){return!!e})):[]},O.normalizePath=function(e){var t=e.length;return t>1&&"/"===e.charAt(t-1)?e.slice(0,t-1):e},O.rmBlank=function(e){return e?e.replace(/[\n \t]+/g,""):""},O.arrayEquals=function(e,t){if(!e||!t)return!1;if(e.length!==t.length)return!1;for(var n=0,r=e.length;r>n;n++)if(e[n]!==t[n])return!1;return!0},O.findIndex=function(e,t){if(null==e||"function"!=typeof t)return-1;for(var n=0;n<e.length;n++){var r=e[n];if(t.call(void 0,r))return n}return-1},O.lastFindIndex=function(e,t){if(null==e||"function"!=typeof t)return-1;for(var n=e.length-1;n>=0;n--){var r=e[n];if(t.call(void 0,r))return n}return-1};var I="function"==typeof Array.from?Array.from:(y||(y=1,E=function(){var e=function(e){return"function"==typeof e},t=function(e){var t=e.next();return!t.done&&t};return function(n){var r,i,o,a=this,u=arguments.length>1?arguments[1]:void 0;if(void 0!==u){if(!e(u))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(r=arguments[2])}var l=function(t,n){if(null!=t&&null!=n){var r=t[n];if(null==r)return;if(!e(r))throw new TypeError(r+" is not a function");return r}}(n,function(e){if(null!=e){if(["string","number","boolean","symbol"].indexOf(typeof e)>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in e)return Symbol.iterator;if("@@iterator"in e)return"@@iterator"}}(n));if(void 0!==l){i=e(a)?Object(new a):[];var f,c,s=l.call(n);if(null==s)throw new TypeError("Array.from requires an array-like or iterable object");for(o=0;;){if(!(f=t(s)))return i.length=o,i;c=f.value,i[o]=u?u.call(r,c,o):c,o++}}else{var d=Object(n);if(null==n)throw new TypeError("Array.from requires an array-like object - not null or undefined");var h,g=function(e){var t=function(e){var t=Number(e);return isNaN(t)?0:0!==t&&isFinite(t)?(t>0?1:-1)*Math.floor(Math.abs(t)):t}(e);return Math.min(Math.max(t,0),9007199254740991)}(d.length);for(i=e(a)?Object(new a(g)):Array(g),o=0;g>o;)h=d[o],i[o]=u?u.call(r,h,o):h,o++;i.length=g}return i}}()),E);!function(e){var t=f&&f.__spreadArray||function(e,t,n){if(n||2===arguments.length)for(var r,i=0,o=t.length;o>i;i++)!r&&i in t||(r||(r=[].slice.call(t,0,i)),r[i]=t[i]);return e.concat(r||[].slice.call(t))},n=f&&f.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(e,"__esModule",{value:!0}),e.removeDiffTagOnHeadAndTail=e.computeXpath=e.getMarkIndex=e.getEffectiveNode=e.isIgnore=e.depthInside=e.changeableInput=e.clickableInput=e.onlyContainsTextChildren=e.onlyContainsIconChildren=e.supportIconTag=e.isContainerTag=e.isListTag=e.isParentOfLeaf=e.isLeaf=e.getChildren=e.getDeepChildren=e.findParent=e.isRootNode=e.hasValidAttribute=void 0;var r=O,i=N,o=n(I);e.hasValidAttribute=function(e,t){return e instanceof Element&&e.hasAttribute(t)&&"false"!==e.getAttribute(t)},e.isRootNode=function(e){return!e||-1!==["BODY","HTML","#document"].indexOf(e.nodeName)},e.findParent=function(t,n){for(var r=t.parentNode;r&&!(0,e.isRootNode)(r);){if(n(r))return r;r=r.parentNode}},e.getDeepChildren=function(n){return(0,o.default)((null==n?void 0:n.childNodes)||[]).reduce((function(n,r){return r instanceof Element?t(t(t([],n,!0),[r],!1),(0,e.getDeepChildren)(r),!0):n}),[])},e.getChildren=function(e){return(0,o.default)((null==e?void 0:e.childNodes)||[]).filter((function(e){return e instanceof Element}))},e.isLeaf=function(t){return!t.hasChildNodes()||"svg"===t.nodeName||0===(0,e.getChildren)(t).length},e.isParentOfLeaf=function(t){return!(!t.hasChildNodes()||"svg"===t.nodeName)&&0===(0,o.default)(t.childNodes).filter((function(t){return!(0,e.isLeaf)(t)})).length},e.isListTag=function(e){return-1!==i.LIST_TAGS.indexOf(e.nodeName)},e.isContainerTag=function(t){return(0,e.hasValidAttribute)(t,i.GROWING_CONTAINER)||-1!==i.SUPPORTED_CONTAINER_TAGS.indexOf(t.nodeName)},e.supportIconTag=function(e){var t=e.nodeName;return-1!==i.SUPPORTED_ICON_TAGS.indexOf(t)},e.onlyContainsIconChildren=function(t){if(t.textContent)return!1;var n=(0,e.getChildren)(t);if(0===n.length)return!1;for(var r=0,i=n;r<i.length;r++){var o=i[r];if(!(0,e.supportIconTag)(o)&&"SPAN"!==o.nodeName)return!1}return!0},e.onlyContainsTextChildren=function(t){return 0!==(0,e.getChildren)(t).length&&!(0,e.getDeepChildren)(t).map((function(e){return e.tagName})).some((function(e){return-1===i.TEXT_NODE.indexOf(e)}))},e.clickableInput=function(e){return e instanceof HTMLInputElement&&"INPUT"===e.tagName&&-1!==i.SUPPORTED_CLICK_INPUT_TYPES.indexOf(e.type)},e.changeableInput=function(e){return e instanceof HTMLInputElement&&"INPUT"===e.tagName&&-1!==i.SUPPORTED_CHANGE_TYPES.indexOf(e.type)},e.depthInside=function(t,n,r){if(void 0===n&&(n=4),void 0===r&&(r=1),r>n)return!1;for(var i="svg"===t.tagName?[]:(0,e.getChildren)(t),o=0;o<i.length;o++){var a=i[o];if(!(0,e.depthInside)(a,n,r+1))return!1}return n>=r},e.isIgnore=function(t){if(!(t instanceof Element)||(0,e.hasValidAttribute)(t,i.GROWING_IGNORE))return!0;for(var n=t.parentNode;n&&!(0,e.isRootNode)(n);){if((0,e.hasValidAttribute)(n,i.GROWING_IGNORE))return!0;n=n.parentNode}return!1},e.getEffectiveNode=function(t){for(var n,r;t&&(r=void 0,!((n=t)instanceof Element&&-1===i.UNSUPPORTED_TAGS.indexOf(null===(r=n.tagName)||void 0===r?void 0:r.toLowerCase())))&&t.parentNode;)t=t.parentNode;var o,a=t.parentNode;return!(0,e.isRootNode)(a)&&((0,e.onlyContainsIconChildren)(a)||"BUTTON"===(o=a).tagName&&(0,e.onlyContainsTextChildren)(o))?a:t},e.getMarkIndex=function(e){if(e instanceof Element){var t=e.getAttribute(i.GROWING_INDEX)||e.getAttribute(i.GROWING_INDEX_OLD)||e.getAttribute(i.GROWING_CDP_INDEX);if(t){if(/^\d{1,10}$/.test(t)&&+t>=0&&2147483647>+t)return+t;window.console.error("[GioNode]：标记的index不符合规范（index必须是大于等于0且小于2147483647的整数字）。",t)}}},e.computeXpath=function(e){for(var t=e.parentPaths(!0),n=Math.min(t.length,+(t.length>=10)+4),r=["","",""],i=0;i<t.length;i++){var o=t[i].path,a=t[i].name;r[0]=o+r[0],r[2]="/".concat(a)+r[2],n>i&&(r[1]=o+r[1])}return r},e.removeDiffTagOnHeadAndTail=function(e,t){var n=function(e){return e.nodeName===t.nodeName},i=(0,r.findIndex)(e,n),o=(0,r.lastFindIndex)(e,n);return-1===i||-1===o?[]:e.slice(i,o+1)}}(b);var C={},A={};Object.defineProperty(A,"__esModule",{value:!0});var x=N,P=O,L=b;function G(e){var t;if(e instanceof Element){var n=e.getAttribute("name");if(n)return[n];if(e.hasAttribute("class")){var r=null===(t=e.getAttribute("class"))||void 0===t?void 0:t.replace(x.EXCLUDE_CLASS_RE,"").trim();if(null==r?void 0:r.length)return r.split(/\s+/).filter((function(e){return x.VALID_CLASS_SELECTOR.test(e)&&!e.match(/[a-z][A-Z][a-z][A-Z]/)&&!e.match(/[0-9][0-9][0-9][0-9]/)})).sort()}}return[]}var S=function(){function e(e){var t;this.node=e,this.tagName=this.node.nodeName,this.name=this.tagName.toLowerCase(),this.id=(t=this.node).id&&x.VALID_ID_SELECTOR.test(t.id)?t.id:null,this.classList=G(this.node),this.guessListAndIndex()}return e.prototype.guessListAndIndex=function(){var e,t=this;this._tagList=(0,L.isListTag)(this.node);var n=(0,L.removeDiffTagOnHeadAndTail)((0,L.getChildren)(this.node.parentNode),this.node);if(this._tagList&&-1!==(o=n.filter((function(e){return e.tagName===t.tagName})).indexOf(this.node))&&(this._index=o+1),n.length>=3&&(null===(e=this.classList)||void 0===e?void 0:e.length)){for(var r=0,i=0,o=1;o<=n.length;o++){var a=n[o-1];if(a.tagName!==this.tagName){i=0;break}(0,P.arrayEquals)(this.classList,G(a))&&(i+=1),this.node===a&&(r=o)}3>i||(this._pseudoList=!0,this._index=this._index||r)}},Object.defineProperty(e.prototype,"path",{get:function(){var e;return this._path||(this._path="/".concat(this.name),this.id&&(this._path+="#".concat(this.id)),(null===(e=this.classList)||void 0===e?void 0:e.length)&&(this._path+=".".concat(this.classList.join(".")))),this._path},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"pseudoList",{get:function(){return!!this._pseudoList},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"list",{get:function(){return!!this._tagList||!!this._pseudoList},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"index",{get:function(){var e;return null!==(e=(0,L.getMarkIndex)(this.node))&&void 0!==e?e:this._index},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"container",{get:function(){return(0,L.isContainerTag)(this.node)||this.list},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"parent",{get:function(){return this.node.parentNode?new e(this.node.parentNode):null},enumerable:!1,configurable:!0}),e.prototype.parentPaths=function(e){void 0===e&&(e=!1);for(var t=e?[this]:[],n=this.parent;n&&!(0,L.isRootNode)(n.node);)t.push(n),n=n.parent;return t},e}();A.default=S;var w={};Object.defineProperty(w,"__esModule",{value:!0}),w.getElementHref=w.getImgHref=w.getAnchorHref=void 0;var R=O;function D(e){if(e.hasAttribute("href")){var t=e.getAttribute("href");if(t&&0!==t.indexOf("javascript"))return(0,R.normalizePath)(t.slice(0,320))}}function k(e){if(e.src&&-1===e.src.indexOf("data:image"))return e.src}w.getAnchorHref=D,w.getImgHref=k,w.getElementHref=function(e){var t=e;if(t)switch(e.nodeName.toLowerCase()){case"a":return D(t);case"img":return k(t)}};var j={},U=f&&f.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(j,"__esModule",{value:!0}),j.getElementContent=j.getFormContent=void 0;var M=b,W=w,X=N,H=U(A),V=O,B=U(I),K=function(e){return e.htmlFor||e.getAttribute("for")},q=function(e){var t=e.getAttribute(X.GROWING_GTITLE)||e.getAttribute(X.GROWING_TITLE)||e.getAttribute(X.GROWING_TITLE_OLD)||e.getAttribute("title");return null==t?void 0:t.trim()};function F(e){var t=e.node;return e.list?z(t):(0,V.filterText)(t.textContent)||void 0}function z(e){for(var t=void 0,n=!1,r=0,i=(0,B.default)(e.childNodes);r<i.length;r++){var o=i[r];if(o.nodeType===Node.TEXT_NODE){var a=(0,V.filterText)(o.textContent);if(a)return a}if(o.nodeType===Node.ELEMENT_NODE&&-1===["INPUT","SELECT"].indexOf(o.nodeName)){if(new H.default(o).pseudoList)return;n=(0,M.onlyContainsIconChildren)(o)||(0,M.supportIconTag)(o);var u=Z(o);if(n)t=u,n=!1;else if(u||(u=z(o)),u)return u}}return t}function Y(e){for(var t=e.getElementsByTagName("input"),n=0,r=(0,B.default)(t);n<r.length;n++){var i=r[n];if(("search"===i.type||"text"===i.type&&("q"===i.id||-1!==i.id.indexOf("search")||"q"===i.name||-1!==i.name.indexOf("search")))&&!(0,M.isIgnore)(i)){var o=Z(i);if(o)return o}}}function Z(e){return function(e){var t=e;if(t){var n=q(t);if(n)return n;var r,i,o,a=new H.default(e);switch(e.nodeName.toLowerCase()){case"a":return function(e){if(((0,M.isLeaf)(e)||(0,M.onlyContainsIconChildren)(e))&&e.textContent){var t=(0,V.filterText)(e.textContent);if(t)return t}var n=(0,W.getAnchorHref)(e);if(n){var r=n.indexOf("?");return r>-1?n.slice(0,r):n}}(t);case"svg":return function(e){for(var t=0,n=(0,B.default)(e.childNodes);t<n.length;t++){var r=n[t];if(r.nodeType===Node.ELEMENT_NODE&&"use"===r.tagName.toLowerCase()&&r.hasAttribute("xlink:href"))return r.getAttribute("xlink:href")}}(t);case"button":return(null===(o=(i=t).name)||void 0===o?void 0:o.length)?i.name:(0,V.filterText)(i.textContent)||z(i);case"img":return function(e){if(e.alt)return e.alt;var t=(0,W.getImgHref)(e);if(t){var n=t.split("?")[0].split("/");if(n.length>0)return n[n.length-1]}}(t);case"label":return F(a);case"input":return function(e){if((0,M.clickableInput)(e))return e.value;if("password"!==e.type&&(0,M.hasValidAttribute)(e,X.GROWING_TRACK))return e.value;if((0,M.changeableInput)(e)){var t=(0,M.findParent)(e,(function(e){return"LABEL"===e.nodeName}));if(!t&&e.id)for(var n=document.body.getElementsByTagName("label"),r=0;r<n.length;r++){var i=n[r];if(K(i)===e.id){t=i;break}}if(t){var o=F(new H.default(t));if(o&&o.length>0)return o+" ("+e.checked+")"}return e.value}}(t);case"select":return r=t,(0,B.default)(r.options).filter((function(e){return e.selected})).map((function(e){return e.label})).join(", ")||r.value;case"form":return Y(t)}return(0,M.isLeaf)(t)?function(e){var t=(0,V.filterText)(e.textContent);if(t)return t}(t):(0,M.isParentOfLeaf)(t)&&!(0,M.onlyContainsIconChildren)(t)?function(e){for(var t="",n=0,r=(0,B.default)(e.childNodes);n<r.length;n++){var i=r[n];t+=(i.nodeType===Node.TEXT_NODE&&i.textContent?i.textContent.trim():"")+" "}return(0,V.filterText)(t,!1)}(t):a.container||(0,M.onlyContainsIconChildren)(e)?z(t):void 0}}(e)||void 0}j.getFormContent=Y,j.getElementContent=Z;var $,J=f&&f.__extends||($=function(e,t){return $=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)({}).hasOwnProperty.call(t,n)&&(e[n]=t[n])},$(e,t)},function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+t+" is not a constructor or null");function n(){this.constructor=e}$(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),Q=f&&f.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(C,"__esModule",{value:!0});var ee=Q(A),te=w,ne=j,re=b,ie=function(e){function t(t){var n=e.call(this,t)||this;n.node=t;var r=(0,re.computeXpath)(n),i=r[0],o=r[1],a=r[2];return n.fullXpath=i,n.xpath=o,n.skeleton=a,n}return J(t,e),Object.defineProperty(t.prototype,"href",{get:function(){return(0,te.getElementHref)(this.node)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"content",{get:function(){return(0,ne.getElementContent)(this.node)},enumerable:!1,configurable:!0}),t}(ee.default);C.default=ie;var oe=f&&f.__assign||function(){return oe=Object.assign||function(e){for(var t,n=1,r=arguments.length;r>n;n++)for(var i in t=arguments[n])({}).hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e},oe.apply(this,arguments)},ae=f&&f.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(T,"__esModule",{value:!0});var ue=N,le=b,fe=ae(C),ce=function(){function e(e,t,n){void 0===t&&(t=null),void 0===n&&(n=!0),this.origin=e,this.action=t,this.direct=n,this.target="self"===t?e:(0,le.getEffectiveNode)(e),this.ignore=(0,le.isIgnore)(this.target),this.vnode=new fe.default(this.target),this.tagName=this.vnode.tagName}return Object.defineProperty(e.prototype,"content",{get:function(){return this.vnode.content},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"href",{get:function(){return this.vnode.href},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"index",{get:function(){return this.vnode.index},enumerable:!1,configurable:!0}),e.prototype.inferParentIndex=function(){var t=this;return this.parentIndex||(0,le.findParent)(this.target,(function(n){var r=new e(n,t.action,!1);r.traceable()&&r.index&&(t.parentIndex=r.index)})),this.parentIndex},Object.defineProperty(e.prototype,"xpath",{get:function(){return this.vnode.xpath},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"fullXpath",{get:function(){return this.vnode.fullXpath},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"skeleton",{get:function(){return this.vnode.skeleton},enumerable:!1,configurable:!0}),e.prototype.info=function(e){return void 0===e&&(e=!0),e&&this.inferParentIndex(),{skeleton:this.skeleton,fullXpath:this.fullXpath,xpath:this.xpath,content:this.content,href:this.href,index:this.parentIndex||this.index}},e.prototype.traceable=function(){if(this.ignore)return!1;if(this.direct){if("click"===this.action||"hover"===this.action){if(-1!==ue.UNSUPPORTED_CLICK_TAGS.indexOf(this.target.tagName))return!1;if("INPUT"===this.target.tagName&&!(0,le.clickableInput)(this.target))return!1;if(!(0,le.isContainerTag)(this.target)&&!(0,le.depthInside)(this.target,5))return!1}return!0}return this.vnode.container},e.prototype.trackNodes=function(){if(!this.traceable())return[];var e=[this];if("submit"!==this.action)for(var t=this.parentElement;t;){if(t.ignore)return[];t.traceable()&&e.unshift(t),t=t.parentElement}var n=void 0;return console.log(e,"trackNodes n1"),e.map((function(e){var t=e.info(!1),r=t.index;return!n&&r&&(n=r),oe(oe({},t),{index:n||r})}))},Object.defineProperty(e.prototype,"parentElement",{get:function(){var t=this.target.parentNode;if(t&&t.nodeName&&!(0,le.isRootNode)(t))return new e(t,this.action,!1)},enumerable:!1,configurable:!0}),e}(),se=T.default=ce,de=function(){function e(e){this.handler=e;var t=navigator.userAgent,n=/chrome/i.exec(t),r=/android/i.exec(t);this.hasTouch="ontouchstart"in window&&!(n&&!r)}return e.prototype.main=function(){for(var e=this.hasTouch?["touchstart"]:["mousedown"],t=this.hasTouch?["touchend","touchcancel"]:["mouseup","mouseleave"],n=this.hasTouch?["touchmove"]:["mousemove"],r=0,i=e;i.length>r;r++)_(window,i[r],this.touchStartHandler.bind(this));for(var o=0,a=n;a.length>o;o++)_(window,a[o],this.touchMoveHandler.bind(this));for(var u=0,l=t;l.length>u;u++)_(window,l[u],this.touchStopHandler.bind(this))},e.prototype.touchStartHandler=function(e){if(1>=e.which){var t=+Date.now();this.safeguard!==t&&(this.touchTimeout&&clearTimeout(this.touchTimeout),this.safeguard=t,this.touchEvent={time:t,target:e.target,x:this._page("x",e),y:this._page("y",e),isTrusted:!0,type:"click"})}},e.prototype.touchMoveHandler=function(e){var t=Math.abs(this._page("x",e)-(this.touchEvent&&this.touchEvent.x)||0),n=Math.abs(this._page("y",e)-(this.touchEvent&&this.touchEvent.y)||0);(t>10||n>10)&&(this.touchEvent=null)},e.prototype.touchStopHandler=function(e){var t=this,n=+Date.now()-(this.touchEvent&&this.touchEvent.time)||0;this.touchEvent&&200>n?this.touchTimeout=setTimeout((function(){t.handler(t.touchEvent),t.touchEvent=null}),200):this.touchEvent&&n>=200&&700>n&&(this.handler(this.touchEvent),this.touchEvent=null)},e.prototype._page=function(e,t){return(this.hasTouch?t.touches[0]:t)["page".concat(e.toUpperCase())]},e}();window.gioEventAutoTracking={name:"gioEventAutoTracking",method:function(t){var n=this;this.growingIO=t,this.main=function(){_(document,"submit",n._handleAction),_(document,"change",n._handleAction),n.growingIO.vdsConfig.touch?new de(n._handleAction).main():_(document,"click",n._handleAction)},this._handleAction=function(t,r){var i=n.growingIO,o=i.vdsConfig,a=i.emitter;if(!o.autotrack)return!1;var u=t.target;if(!u)return!1;var f=new se(u,t.type,!0).trackNodes();if("click"!==t.type&&(f=v(d(f))?[]:[d(f)]),v(f))return!1;null==a||a.emit("onComposeBefore",{event:r,params:null!=t?t:{}}),f.forEach((function(r){var i=r.fullXpath,a=r.index,u=r.content,f=r.href;if(!p(r.fullXpath||"","/div#__vconsole")&&!p(r.fullXpath||"","/div#__giokit")&&(o.debug&&console.log("Action：",t.type,Date.now()),i)){var c=n.growingIO.dataStore,s=c.eventContextBuilder,d=c.eventConverter,h=c.currentPage;d(e(e({eventType:l[t.type],element:[{xpath:i,index:a,textValue:u,hyperlink:f}]},s()),{pageShowTimestamp:h.time}))}}))}}}}));
