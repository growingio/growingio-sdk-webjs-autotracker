!function(e){"function"==typeof define&&define.amd?define(e):e()}((function(){"use strict";var e,t,n,r,i,o,a,u=function(){return u=Object.assign||function(e){for(var t,n=1,r=arguments.length;r>n;n++)for(var i in t=arguments[n])({}).hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e},u.apply(this,arguments)},s="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},f="function"==typeof Array.from?Array.from:(t||(t=1,n=function(e){return"function"==typeof e},r=function(e){var t=function(e){var t=Number(e);return isNaN(t)?0:0!==t&&isFinite(t)?(t>0?1:-1)*Math.floor(Math.abs(t)):t}(e);return Math.min(Math.max(t,0),9007199254740991)},i=function(e){var t=e.next();return!t.done&&t},e=function(e){var t,o,a,u=this,s=arguments.length>1?arguments[1]:void 0;if(void 0!==s){if(!n(s))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(t=arguments[2])}var f=function(e,t){if(null!=e&&null!=t){var r=e[t];if(null==r)return;if(!n(r))throw new TypeError(r+" is not a function");return r}}(e,function(e){if(null!=e){if(["string","number","boolean","symbol"].indexOf(typeof e)>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in e)return Symbol.iterator;if("@@iterator"in e)return"@@iterator"}}(e));if(void 0!==f){o=n(u)?Object(new u):[];var l,d,c=f.call(e);if(null==c)throw new TypeError("Array.from requires an array-like or iterable object");for(a=0;;){if(!(l=i(c)))return o.length=a,o;d=l.value,o[a]=s?s.call(t,d,a):d,a++}}else{var h=Object(e);if(null==e)throw new TypeError("Array.from requires an array-like object - not null or undefined");var p,g=r(h.length);for(o=n(u)?Object(new u(g)):Array(g),a=0;g>a;)p=h[a],o[a]=s?s.call(t,p,a):p,a++;o.length=g}return o}),e),l=function(e){return c(["undefined","null"],g(e))},d=function(e){return"object"===g(e)&&!l(e)},c=function(e,t){return("array"===g(e)||"string"===g(e))&&e.indexOf(t)>=0},h=f,p=function(e,t){if(!d(e))return!1;try{return"string"===g(t)?delete e[t]:"array"===g(t)?t.map((function(t){return delete e[t]})):(function(e){return"regexp"===g(e)}(t)&&function(e){return d(e)?Object.keys(e):[]}(e).forEach((function(n){t.test(n)&&p(e,n)})),!0)}catch(e){return!1}},g=function(e){return{}.toString.call(e).slice(8,-1).toLowerCase()},v=function(e,t,n,r){void 0===r&&(r={}),document.addEventListener?e.addEventListener(t,n,u(u({},{capture:!0}),r)):e.attachEvent?e.attachEvent("on"+t,n):e["on"+t]=n},m={},N={};o=N,a=s&&s.__spreadArray||function(e,t,n){if(n||2===arguments.length)for(var r,i=0,o=t.length;o>i;i++)!r&&i in t||(r||(r=[].slice.call(t,0,i)),r[i]=t[i]);return e.concat(r||[].slice.call(t))},Object.defineProperty(o,"__esModule",{value:!0}),o.GROWING_TITLE_OLD=o.GROWING_TITLE=o.GROWING_GTITLE=o.GROWING_CDP_INDEX=o.GROWING_INDEX_OLD=o.GROWING_INDEX=o.GROWING_CONTAINER=o.GROWING_TRACK=o.GROWING_IGNORE=o.VALID_CLASS_SELECTOR=o.VALID_ID_SELECTOR=o.EXCLUDE_CLASS_RE=o.UNSUPPORTED_TAGS=o.TEXT_NODE=o.UNSUPPORTED_CLICK_TAGS=o.SUPPORTED_ICON_TAGS=o.SUPPORTED_CHANGE_TYPES=o.SUPPORTED_CLICK_INPUT_TYPES=o.SUPPORTED_CONTAINER_TAGS=o.LIST_TAGS=void 0,o.LIST_TAGS=["TR","LI","DL"],o.SUPPORTED_CONTAINER_TAGS=a(["A","BUTTON"],o.LIST_TAGS,!0),o.SUPPORTED_CLICK_INPUT_TYPES=["button","submit","reset"],o.SUPPORTED_CHANGE_TYPES=["radio","checkbox","search"],o.SUPPORTED_ICON_TAGS=["I","EM","svg","IMG"],o.UNSUPPORTED_CLICK_TAGS=["TEXTAREA","HTML","BODY"],o.TEXT_NODE=["I","SPAN","EM","B","STRONG"],o.UNSUPPORTED_TAGS=["tspan","text","g","rect","path","defs","clippath","desc","title","math","use"],o.EXCLUDE_CLASS_RE=/(^| |[^ ]+\-)(clear|clearfix|active|hover|enabled|current|selected|unselected|hidden|display|focus|disabled|undisabled|open|checked|unchecked|undefined|null|ng-|growing-)[^\. ]*/g,o.VALID_ID_SELECTOR=/^[a-zA-Z-\_][a-zA-Z\-\_0-9]+$/,o.VALID_CLASS_SELECTOR=/^([a-zA-Z\-\_0-9]+)$/,o.GROWING_IGNORE="data-growing-ignore",o.GROWING_TRACK="data-growing-track",o.GROWING_CONTAINER="data-growing-container",o.GROWING_INDEX="data-growing-index",o.GROWING_INDEX_OLD="data-growing-idx",o.GROWING_CDP_INDEX="data-index",o.GROWING_GTITLE="data-growing-title",o.GROWING_TITLE="data-title",o.GROWING_TITLE_OLD="growing-title";var T,y,b={},E={};Object.defineProperty(E,"__esModule",{value:!0}),E.lastFindIndex=E.findIndex=E.arrayEquals=E.rmBlank=E.normalizePath=E.splitNoEmpty=E.filterText=void 0,E.filterText=function(e,t){if(void 0===t&&(t=!0),e&&(null==(e=e.replace(/[\n \t]+/g," ").trim())?void 0:e.length))return e.slice(0,t?50:void 0)},E.splitNoEmpty=function(e,t){return e?e.split(t).filter((function(e){return!!e})):[]},E.normalizePath=function(e){var t=e.length;return t>1&&"/"===e.charAt(t-1)?e.slice(0,t-1):e},E.rmBlank=function(e){return e?e.replace(/[\n \t]+/g,""):""},E.arrayEquals=function(e,t){if(!e||!t)return!1;if(e.length!==t.length)return!1;for(var n=0,r=e.length;r>n;n++)if(e[n]!==t[n])return!1;return!0},E.findIndex=function(e,t){if(null==e||"function"!=typeof t)return-1;for(var n=0;n<e.length;n++){var r=e[n];if(t.call(void 0,r))return n}return-1},E.lastFindIndex=function(e,t){if(null==e||"function"!=typeof t)return-1;for(var n=e.length-1;n>=0;n--){var r=e[n];if(t.call(void 0,r))return n}return-1};var I="function"==typeof Array.from?Array.from:(y||(y=1,T=function(){var e=function(e){return"function"==typeof e},t=function(e){var t=e.next();return!t.done&&t};return function(n){var r,i,o,a=this,u=arguments.length>1?arguments[1]:void 0;if(void 0!==u){if(!e(u))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(r=arguments[2])}var s=function(t,n){if(null!=t&&null!=n){var r=t[n];if(null==r)return;if(!e(r))throw new TypeError(r+" is not a function");return r}}(n,function(e){if(null!=e){if(["string","number","boolean","symbol"].indexOf(typeof e)>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in e)return Symbol.iterator;if("@@iterator"in e)return"@@iterator"}}(n));if(void 0!==s){i=e(a)?Object(new a):[];var f,l,d=s.call(n);if(null==d)throw new TypeError("Array.from requires an array-like or iterable object");for(o=0;;){if(!(f=t(d)))return i.length=o,i;l=f.value,i[o]=u?u.call(r,l,o):l,o++}}else{var c=Object(n);if(null==n)throw new TypeError("Array.from requires an array-like object - not null or undefined");var h,p=function(e){var t=function(e){var t=Number(e);return isNaN(t)?0:0!==t&&isFinite(t)?(t>0?1:-1)*Math.floor(Math.abs(t)):t}(e);return Math.min(Math.max(t,0),9007199254740991)}(c.length);for(i=e(a)?Object(new a(p)):Array(p),o=0;p>o;)h=c[o],i[o]=u?u.call(r,h,o):h,o++;i.length=p}return i}}()),T);!function(e){var t=s&&s.__spreadArray||function(e,t,n){if(n||2===arguments.length)for(var r,i=0,o=t.length;o>i;i++)!r&&i in t||(r||(r=[].slice.call(t,0,i)),r[i]=t[i]);return e.concat(r||[].slice.call(t))},n=s&&s.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(e,"__esModule",{value:!0}),e.removeDiffTagOnHeadAndTail=e.computeXpath=e.getMarkIndex=e.getEffectiveNode=e.isIgnore=e.depthInside=e.changeableInput=e.clickableInput=e.onlyContainsTextChildren=e.onlyContainsIconChildren=e.supportIconTag=e.isContainerTag=e.isListTag=e.isParentOfLeaf=e.isLeaf=e.getChildren=e.getDeepChildren=e.findParent=e.isRootNode=e.hasValidAttribute=void 0;var r=E,i=N,o=n(I);e.hasValidAttribute=function(e,t){return e instanceof Element&&e.hasAttribute(t)&&"false"!==e.getAttribute(t)},e.isRootNode=function(e){return!e||-1!==["BODY","HTML","#document"].indexOf(e.nodeName)},e.findParent=function(t,n){for(var r=t.parentNode;r&&!(0,e.isRootNode)(r);){if(n(r))return r;r=r.parentNode}},e.getDeepChildren=function(n){return(0,o.default)((null==n?void 0:n.childNodes)||[]).reduce((function(n,r){return r instanceof Element?t(t(t([],n,!0),[r],!1),(0,e.getDeepChildren)(r),!0):n}),[])},e.getChildren=function(e){return(0,o.default)((null==e?void 0:e.childNodes)||[]).filter((function(e){return e instanceof Element}))},e.isLeaf=function(t){return!t.hasChildNodes()||"svg"===t.nodeName||0===(0,e.getChildren)(t).length},e.isParentOfLeaf=function(t){return!(!t.hasChildNodes()||"svg"===t.nodeName)&&0===(0,o.default)(t.childNodes).filter((function(t){return!(0,e.isLeaf)(t)})).length},e.isListTag=function(e){return-1!==i.LIST_TAGS.indexOf(e.nodeName)},e.isContainerTag=function(t){return(0,e.hasValidAttribute)(t,i.GROWING_CONTAINER)||-1!==i.SUPPORTED_CONTAINER_TAGS.indexOf(t.nodeName)},e.supportIconTag=function(e){var t=e.nodeName;return-1!==i.SUPPORTED_ICON_TAGS.indexOf(t)},e.onlyContainsIconChildren=function(t){if(t.textContent)return!1;var n=(0,e.getChildren)(t);if(0===n.length)return!1;for(var r=0,i=n;r<i.length;r++){var o=i[r];if(!(0,e.supportIconTag)(o)&&"SPAN"!==o.nodeName)return!1}return!0},e.onlyContainsTextChildren=function(t){return 0!==(0,e.getChildren)(t).length&&!(0,e.getDeepChildren)(t).map((function(e){return e.tagName})).some((function(e){return-1===i.TEXT_NODE.indexOf(e)}))},e.clickableInput=function(e){return e instanceof HTMLInputElement&&"INPUT"===e.tagName&&-1!==i.SUPPORTED_CLICK_INPUT_TYPES.indexOf(e.type)},e.changeableInput=function(e){return e instanceof HTMLInputElement&&"INPUT"===e.tagName&&-1!==i.SUPPORTED_CHANGE_TYPES.indexOf(e.type)},e.depthInside=function(t,n,r){if(void 0===n&&(n=4),void 0===r&&(r=1),r>n)return!1;for(var i="svg"===t.tagName?[]:(0,e.getChildren)(t),o=0;o<i.length;o++){var a=i[o];if(!(0,e.depthInside)(a,n,r+1))return!1}return n>=r},e.isIgnore=function(t){if(!(t instanceof Element)||(0,e.hasValidAttribute)(t,i.GROWING_IGNORE))return!0;for(var n=t.parentNode;n&&!(0,e.isRootNode)(n);){if((0,e.hasValidAttribute)(n,i.GROWING_IGNORE))return!0;n=n.parentNode}return!1},e.getEffectiveNode=function(t){for(var n,r;t&&(r=void 0,!((n=t)instanceof Element&&-1===i.UNSUPPORTED_TAGS.indexOf(null===(r=n.tagName)||void 0===r?void 0:r.toLowerCase())))&&t.parentNode;)t=t.parentNode;var o,a=t.parentNode;return!(0,e.isRootNode)(a)&&((0,e.onlyContainsIconChildren)(a)||"BUTTON"===(o=a).tagName&&(0,e.onlyContainsTextChildren)(o))?a:t},e.getMarkIndex=function(e){if(e instanceof Element){var t=e.getAttribute(i.GROWING_INDEX)||e.getAttribute(i.GROWING_INDEX_OLD)||e.getAttribute(i.GROWING_CDP_INDEX);if(t){if(/^\d{1,10}$/.test(t)&&+t>=0&&2147483647>+t)return+t;window.console.error("[GioNode]：标记的index不符合规范（index必须是大于等于0且小于2147483647的整数字）。",t)}}},e.computeXpath=function(e){for(var t=e.parentPaths(!0),n=Math.min(t.length,+(t.length>=10)+4),r=["","",""],i=0;i<t.length;i++){var o=t[i].path,a=t[i].name;r[0]=o+r[0],r[2]="/".concat(a)+r[2],n>i&&(r[1]=o+r[1])}return r},e.removeDiffTagOnHeadAndTail=function(e,t){var n=function(e){return e.nodeName===t.nodeName},i=(0,r.findIndex)(e,n),o=(0,r.lastFindIndex)(e,n);return-1===i||-1===o?[]:e.slice(i,o+1)}}(b);var _={},O={};Object.defineProperty(O,"__esModule",{value:!0});var C=N,w=E,L=b;function x(e){var t;if(e instanceof Element){var n=e.getAttribute("name");if(n)return[n];if(e.hasAttribute("class")){var r=null===(t=e.getAttribute("class"))||void 0===t?void 0:t.replace(C.EXCLUDE_CLASS_RE,"").trim();if(null==r?void 0:r.length)return r.split(/\s+/).filter((function(e){return C.VALID_CLASS_SELECTOR.test(e)&&!e.match(/[a-z][A-Z][a-z][A-Z]/)&&!e.match(/[0-9][0-9][0-9][0-9]/)})).sort()}}return[]}var D=function(){function e(e){var t;this.node=e,this.tagName=this.node.nodeName,this.name=this.tagName.toLowerCase(),this.id=(t=this.node).id&&C.VALID_ID_SELECTOR.test(t.id)?t.id:null,this.classList=x(this.node),this.guessListAndIndex()}return e.prototype.guessListAndIndex=function(){var e,t=this;this._tagList=(0,L.isListTag)(this.node);var n=(0,L.removeDiffTagOnHeadAndTail)((0,L.getChildren)(this.node.parentNode),this.node);if(this._tagList&&-1!==(o=n.filter((function(e){return e.tagName===t.tagName})).indexOf(this.node))&&(this._index=o+1),n.length>=3&&(null===(e=this.classList)||void 0===e?void 0:e.length)){for(var r=0,i=0,o=1;o<=n.length;o++){var a=n[o-1];if(a.tagName!==this.tagName){i=0;break}(0,w.arrayEquals)(this.classList,x(a))&&(i+=1),this.node===a&&(r=o)}3>i||(this._pseudoList=!0,this._index=this._index||r)}},Object.defineProperty(e.prototype,"path",{get:function(){var e;return this._path||(this._path="/".concat(this.name),this.id&&(this._path+="#".concat(this.id)),(null===(e=this.classList)||void 0===e?void 0:e.length)&&(this._path+=".".concat(this.classList.join(".")))),this._path},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"pseudoList",{get:function(){return!!this._pseudoList},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"list",{get:function(){return!!this._tagList||!!this._pseudoList},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"index",{get:function(){var e;return null!==(e=(0,L.getMarkIndex)(this.node))&&void 0!==e?e:this._index},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"container",{get:function(){return(0,L.isContainerTag)(this.node)||this.list},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"parent",{get:function(){return this.node.parentNode?new e(this.node.parentNode):null},enumerable:!1,configurable:!0}),e.prototype.parentPaths=function(e){void 0===e&&(e=!1);for(var t=e?[this]:[],n=this.parent;n&&!(0,L.isRootNode)(n.node);)t.push(n),n=n.parent;return t},e}();O.default=D;var P={};Object.defineProperty(P,"__esModule",{value:!0}),P.getElementHref=P.getImgHref=P.getAnchorHref=void 0;var A=E;function R(e){if(e.hasAttribute("href")){var t=e.getAttribute("href");if(t&&0!==t.indexOf("javascript"))return(0,A.normalizePath)(t.slice(0,320))}}function S(e){if(e.src&&-1===e.src.indexOf("data:image"))return e.src}P.getAnchorHref=R,P.getImgHref=S,P.getElementHref=function(e){var t=e;if(t)switch(e.nodeName.toLowerCase()){case"a":return R(t);case"img":return S(t)}};var G={},U=s&&s.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(G,"__esModule",{value:!0}),G.getElementContent=G.getFormContent=void 0;var W=b,M=P,j=N,H=U(O),k=E,B=U(I),X=function(e){return e.htmlFor||e.getAttribute("for")},V=function(e){var t=e.getAttribute(j.GROWING_GTITLE)||e.getAttribute(j.GROWING_TITLE)||e.getAttribute(j.GROWING_TITLE_OLD)||e.getAttribute("title");return null==t?void 0:t.trim()};function z(e){var t=e.node;return e.list?K(t):(0,k.filterText)(t.textContent)||void 0}function K(e){for(var t=void 0,n=!1,r=0,i=(0,B.default)(e.childNodes);r<i.length;r++){var o=i[r];if(o.nodeType===Node.TEXT_NODE){var a=(0,k.filterText)(o.textContent);if(a)return a}if(o.nodeType===Node.ELEMENT_NODE&&-1===["INPUT","SELECT"].indexOf(o.nodeName)){if(new H.default(o).pseudoList)return;n=(0,W.onlyContainsIconChildren)(o)||(0,W.supportIconTag)(o);var u=F(o);if(n)t=u,n=!1;else if(u||(u=K(o)),u)return u}}return t}function q(e){for(var t=e.getElementsByTagName("input"),n=0,r=(0,B.default)(t);n<r.length;n++){var i=r[n];if(("search"===i.type||"text"===i.type&&("q"===i.id||-1!==i.id.indexOf("search")||"q"===i.name||-1!==i.name.indexOf("search")))&&!(0,W.isIgnore)(i)){var o=F(i);if(o)return o}}}function F(e){return function(e){var t=e;if(t){var n=V(t);if(n)return n;var r,i,o,a=new H.default(e);switch(e.nodeName.toLowerCase()){case"a":return function(e){if(((0,W.isLeaf)(e)||(0,W.onlyContainsIconChildren)(e))&&e.textContent){var t=(0,k.filterText)(e.textContent);if(t)return t}var n=(0,M.getAnchorHref)(e);if(n){var r=n.indexOf("?");return r>-1?n.slice(0,r):n}}(t);case"svg":return function(e){for(var t=0,n=(0,B.default)(e.childNodes);t<n.length;t++){var r=n[t];if(r.nodeType===Node.ELEMENT_NODE&&"use"===r.tagName.toLowerCase()&&r.hasAttribute("xlink:href"))return r.getAttribute("xlink:href")}}(t);case"button":return(null===(o=(i=t).name)||void 0===o?void 0:o.length)?i.name:(0,k.filterText)(i.textContent)||K(i);case"img":return function(e){if(e.alt)return e.alt;var t=(0,M.getImgHref)(e);if(t){var n=t.split("?")[0].split("/");if(n.length>0)return n[n.length-1]}}(t);case"label":return z(a);case"input":return function(e){if((0,W.clickableInput)(e))return e.value;if("password"!==e.type&&(0,W.hasValidAttribute)(e,j.GROWING_TRACK))return e.value;if((0,W.changeableInput)(e)){var t=(0,W.findParent)(e,(function(e){return"LABEL"===e.nodeName}));if(!t&&e.id)for(var n=document.body.getElementsByTagName("label"),r=0;r<n.length;r++){var i=n[r];if(X(i)===e.id){t=i;break}}if(t){var o=z(new H.default(t));if(o&&o.length>0)return o+" ("+e.checked+")"}return e.value}}(t);case"select":return r=t,(0,B.default)(r.options).filter((function(e){return e.selected})).map((function(e){return e.label})).join(", ")||r.value;case"form":return q(t)}return(0,W.isLeaf)(t)?function(e){var t=(0,k.filterText)(e.textContent);if(t)return t}(t):(0,W.isParentOfLeaf)(t)&&!(0,W.onlyContainsIconChildren)(t)?function(e){for(var t="",n=0,r=(0,B.default)(e.childNodes);n<r.length;n++){var i=r[n];t+=(i.nodeType===Node.TEXT_NODE&&i.textContent?i.textContent.trim():"")+" "}return(0,k.filterText)(t,!1)}(t):a.container||(0,W.onlyContainsIconChildren)(e)?K(t):void 0}}(e)||void 0}G.getFormContent=q,G.getElementContent=F;var Y,Z=s&&s.__extends||(Y=function(e,t){return Y=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)({}).hasOwnProperty.call(t,n)&&(e[n]=t[n])},Y(e,t)},function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+t+" is not a constructor or null");function n(){this.constructor=e}Y(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),J=s&&s.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(_,"__esModule",{value:!0});var $=J(O),Q=P,ee=G,te=b,ne=function(e){function t(t){var n=e.call(this,t)||this;n.node=t;var r=(0,te.computeXpath)(n),i=r[0],o=r[1],a=r[2];return n.fullXpath=i,n.xpath=o,n.skeleton=a,n}return Z(t,e),Object.defineProperty(t.prototype,"href",{get:function(){return(0,Q.getElementHref)(this.node)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"content",{get:function(){return(0,ee.getElementContent)(this.node)},enumerable:!1,configurable:!0}),t}($.default);_.default=ne;var re=s&&s.__assign||function(){return re=Object.assign||function(e){for(var t,n=1,r=arguments.length;r>n;n++)for(var i in t=arguments[n])({}).hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e},re.apply(this,arguments)},ie=s&&s.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(m,"__esModule",{value:!0});var oe,ae=N,ue=b,se=ie(_),fe=function(){function e(e,t,n){void 0===t&&(t=null),void 0===n&&(n=!0),this.origin=e,this.action=t,this.direct=n,this.target="self"===t?e:(0,ue.getEffectiveNode)(e),this.ignore=(0,ue.isIgnore)(this.target),this.vnode=new se.default(this.target),this.tagName=this.vnode.tagName}return Object.defineProperty(e.prototype,"content",{get:function(){return this.vnode.content},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"href",{get:function(){return this.vnode.href},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"index",{get:function(){return this.vnode.index},enumerable:!1,configurable:!0}),e.prototype.inferParentIndex=function(){var t=this;return this.parentIndex||(0,ue.findParent)(this.target,(function(n){var r=new e(n,t.action,!1);r.traceable()&&r.index&&(t.parentIndex=r.index)})),this.parentIndex},Object.defineProperty(e.prototype,"xpath",{get:function(){return this.vnode.xpath},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"fullXpath",{get:function(){return this.vnode.fullXpath},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"skeleton",{get:function(){return this.vnode.skeleton},enumerable:!1,configurable:!0}),e.prototype.info=function(e){return void 0===e&&(e=!0),e&&this.inferParentIndex(),{skeleton:this.skeleton,fullXpath:this.fullXpath,xpath:this.xpath,content:this.content,href:this.href,index:this.parentIndex||this.index}},e.prototype.traceable=function(){if(this.ignore)return!1;if(this.direct){if("click"===this.action||"hover"===this.action){if(-1!==ae.UNSUPPORTED_CLICK_TAGS.indexOf(this.target.tagName))return!1;if("INPUT"===this.target.tagName&&!(0,ue.clickableInput)(this.target))return!1;if(!(0,ue.isContainerTag)(this.target)&&!(0,ue.depthInside)(this.target,5))return!1}return!0}return this.vnode.container},e.prototype.trackNodes=function(){if(!this.traceable())return[];var e=[this];if("submit"!==this.action)for(var t=this.parentElement;t;){if(t.ignore)return[];t.traceable()&&e.unshift(t),t=t.parentElement}var n=void 0;return console.log(e,"trackNodes n1"),e.map((function(e){var t=e.info(!1),r=t.index;return!n&&r&&(n=r),re(re({},t),{index:n||r})}))},Object.defineProperty(e.prototype,"parentElement",{get:function(){var t=this.target.parentNode;if(t&&t.nodeName&&!(0,ue.isRootNode)(t))return new e(t,this.action,!1)},enumerable:!1,configurable:!0}),e}(),le=m.default=fe,de=["i","span","em","b","strong","svg"];!function(e){e[e.OUTER=0]="OUTER",e[e.INNER_COVERED=1]="INNER_COVERED",e[e.INNER_SHOW=2]="INNER_SHOW"}(oe||(oe={}));var ce=function(e,t,n){if(n||2===arguments.length)for(var r,i=0,o=t.length;o>i;i++)!r&&i in t||(r||(r=[].slice.call(t,0,i)),r[i]=t[i]);return e.concat(r||[].slice.call(t))}(["HR","BR","SCRIPT","NOSCRIPT","STYLE","HEAD","BASE","LINK","META","TITLE","BODY","HTML","TEMPLATE","CODE"],N.UNSUPPORTED_CLICK_TAGS,!0),he=["SELECT","A","BUTTON","INPUT","IMG","FORM"],pe=function(e,t,n){return document.elementFromPoint(t,n)===e},ge=function(){function e(e,t,n){this.node=e,this.parentNodeDesc=t,this.devicesInfo=n,this.proxy=new le(e),this.tagName=this.node.tagName,this.name=this.tagName.toLowerCase(),this.isIgnore=!!this.node.dataset.growingIgnore,this.isUnSupported=-1!==ce.indexOf(this.tagName),this.rect=this.computeWindowRect()}return e.prototype.info=function(){var e=this.desc();e.zLevel+=this.devicesInfo.webviewZLevel;var t=this.getDeviceRect(this.rect);return p(e,"isContainer"),u(u(u({},e),t),{parentXPath:this.parentNodeDesc.isContainer?this.parentNodeDesc.xpath:void 0,href:this.proxy.href,content:this.proxy.content,nodeType:this.nodeType()})},e.prototype.nodeType=function(){return"input"!==this.name||b.changeableInput(this.node)?this.node.tagName:"INPUT_BTN"},e.prototype.desc=function(){return{index:this.parentNodeDesc.index||this.proxy.index,zLevel:this.zLevel(),xpath:this.proxy.xpath,isContainer:this.isDefinedContainer()}},e.prototype.cssVisible=function(){var e=this.computedStyle();return Number(e.opacity)>0&&"visible"===e.visibility&&"none"!==e.display},e.prototype.viewportStatus=function(){var e=this.rect,t=e.top,n=e.left,r=e.width,i=e.height,o=this.devicesInfo,a=o.winWidth,u=o.winHeight;if(0>=r||0>=i)return oe.OUTER;var s=this.node;return u>t&&a>n&&r>0&&i>0?pe(s,n+r/2,t+i/2)||pe(s,n+1,t+1)||pe(s,n+r-1,t+1)||pe(s,n+1,t+i-1)||pe(s,n+r-1,t+i-1)?oe.INNER_SHOW:oe.INNER_COVERED:oe.OUTER},e.prototype.isCircleable=function(){return this.proxy.target===this.proxy.origin&&(!!this.isDefinedContainer()||!("input"===this.name&&this.node instanceof HTMLInputElement&&"password"===this.node.type)&&(-1!==he.indexOf(this.name)||(b.isLeaf(this.node)?!this.isBigBlank():this.hasBackgroundImage()&&b.depthInside(this.node,4))))},e.prototype.isSimpleContainer=function(){return"select"===this.name||this.isDefaultContainer()&&(function(e,t){if(0===e.children.length)return!1;for(var n=0,r=h(e.children);n<r.length;n++){var i=r[n];if(-1===t.indexOf(i.tagName.toLowerCase()))return!1}return!0}(this.node,de)||!this.node.childElementCount)},e.prototype.isDefinedContainer=function(){var e;return l(this.isContainer)?this.isDefaultContainer()||this.isMarkContainer()||b.isParentOfLeaf(this.node)&&(!!(null===(e=this.node.innerText)||void 0===e?void 0:e.trim().length)||function(e){var t=e.attributes;if(t.length>0)for(var n=0;n<t.length;n++){var r=t[n].value;if(r&&"false"!==r)return!0}return!1}(this.node))||"select"===this.name:!!this.isContainer},e.prototype.isDefaultContainer=function(){return-1!==N.SUPPORTED_CONTAINER_TAGS.indexOf(this.tagName)||b.clickableInput(this.node)},e.prototype.isMarkContainer=function(){return this.node.hasAttribute("data-growing-container")||this.node.hasAttribute("growing-container")},e.prototype.isBigBlank=function(){var e,t,n=null!==(t=null===(e=this.node.innerText)||void 0===e?void 0:e.trim().length)&&void 0!==t?t:0,r=this.rect,i=r.width,o=r.height,a=this.devicesInfo,u=a.winWidth,s=a.winHeight;return!n&&(i>u>>1||o>s>>1)},e.prototype.hasBackgroundImage=function(){var e=this.computedStyle().backgroundImage;return!!e&&"none"!==e&&e.length>0},e.prototype.zLevel=function(){var e=this.computedStyle(),t=e.zIndex;if("auto"!==t)return Number(t||"0")+this.parentNodeDesc.zLevel;switch(e.position){case"relative":return this.parentNodeDesc.zLevel+2;case"sticky":return this.parentNodeDesc.zLevel+3;case"absolute":return this.parentNodeDesc.zLevel+4;case"fixed":return this.parentNodeDesc.zLevel+5;default:return this.parentNodeDesc.zLevel+1}},e.prototype.computeWindowRect=function(){if(this.rect)return this.rect;var e=this.node.getBoundingClientRect(),t=e.top,n=e.bottom,r=e.left,i=e.right-r,o=n-t;return 0>t?o=t+o:t+o>this.devicesInfo.winHeight&&(o=this.devicesInfo.winHeight-t),0>r?i=r+i:r+i>this.devicesInfo.winWidth&&(i=this.devicesInfo.winWidth-r),this.rect={top:t,left:r,width:i,height:o},this.rect},e.prototype.computedStyle=function(){return window.getComputedStyle(this.node)},e.prototype.getDeviceRect=function(e){var t=this.devicesInfo,n=t.scale,r=t.webviewTop,i=t.webviewLeft;return{top:e.top*n+r,left:e.left*n+i,width:e.width*n,height:e.height*n}},e}(),ve=["DOMContentLoaded","onreadystatechange"],me=["scroll","resize","load","beforeunload","popstate","hashchange","pagehide","unload"],Ne=function(){function e(e){this.growingIO=e,this.addDomChangeListener()}return e.prototype.getDomTree=function(e,t,n,r,i,o){var a=function(e,t,n,r,i){var o=document.documentElement.clientWidth;return{winWidth:o,winHeight:document.documentElement.clientHeight,scale:n/o,webviewTop:t,webviewLeft:e,webviewWidth:n,webviewHeight:r,webviewZLevel:i}}(e,t,n,r,i),u=this.getElementsByParent(o||document.body,{isContainer:!1,zLevel:0},a),s=this.growingIO.dataStore.currentPage;return{page:{domain:s.domain,path:s.path,query:s.query,title:s.title},elements:u}},e.prototype.getElementsByParent=function(e,t,n){var r=this,i=[];return[].slice.call(e.childNodes,0).filter((function(e){return 1===e.nodeType})).forEach((function(e){var o=new ge(e,t,n);if(o.cssVisible()&&!o.isIgnore){switch(o.viewportStatus()){case oe.INNER_SHOW:o.isCircleable()&&i.push(o.info());break;case oe.INNER_COVERED:o.isDefaultContainer()&&i.push(o.info())}o.isSimpleContainer()||[].push.apply(i,r.getElementsByParent(e,o.desc(),n))}})),i},e.prototype.addDomChangeListener=function(){var e,t=function(t){return void 0===t&&(t=""),function(){var n;"beforeunload"===t&&e&&e.disconnect(),null===(n=window.GrowingWebViewJavascriptBridge)||void 0===n||n.onDomChanged()}};(e=new MutationObserver(t("mutation"))).observe(document.body,{attributes:!0,characterData:!0,childList:!0,subtree:!0}),ve.forEach((function(e){v(document,e,t(e))})),me.forEach((function(e){v(window,e,t(e))}))},e}(),Te=function(){function e(t){var n,r=this;this.growingIO=t,null===(n=this.growingIO.emitter)||void 0===n||n.on("SDK_INITIALIZED",(function(){if(window.GrowingWebViewJavascriptBridge){var t=r;window.GrowingWebViewJavascriptBridge.getDomTree=function(){if(arguments.length>=4)return e.bindGetDomTree(t.growingIO),e.domHelper.getDomTree.apply(e.domHelper,arguments)}}}))}return e.bindGetDomTree=function(e){this.domHelper||(this.domHelper=new Ne(e),window.GrowingWebViewJavascriptBridge.getDomTree=this.domHelper.getDomTree.bind(this.domHelper))},e}();window.gioHybridCircle={name:"gioHybridCircle",method:Te}}));
