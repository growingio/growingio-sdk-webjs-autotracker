var e=function(){return e=Object.assign||function(e){for(var t,n=1,r=arguments.length;r>n;n++)for(var i in t=arguments[n])({}).hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e},e.apply(this,arguments)};function t(e,t,n){if(n||2===arguments.length)for(var r,i=0,o=t.length;o>i;i++)!r&&i in t||(r||(r=[].slice.call(t,0,i)),r[i]=t[i]);return e.concat(r||[].slice.call(t))}location.protocol.indexOf("http")>-1&&location.protocol.replace(":","");var n=["clearUserId","getGioInfo","getLocation","getOption","init","setDataCollect","setOption","setUserId","track","setGeneralProps","clearGeneralProps"];t(t([],n,!0),["setEvar","setPage","setUser","setVisitor"],!1),t(t([],n,!0),["enableDebug","enableHT","setAutotrack","setTrackerHost","setTrackerScheme","setUserAttributes","getVisitorId","getDeviceId","registerPlugins","sendPage","sendVisit","trackTimerStart","trackTimerPause","trackTimerResume","trackTimerEnd","removeTimer","clearTrackTimer"],!1);var r,i,o,a,u,l,f,s={click:"VIEW_CLICK",change:"VIEW_CHANGE",submit:"FORM_SUBMIT"},c="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},d="function"==typeof Array.from?Array.from:(i||(i=1,o=function(e){return"function"==typeof e},a=function(e){var t=function(e){var t=Number(e);return isNaN(t)?0:0!==t&&isFinite(t)?(t>0?1:-1)*Math.floor(Math.abs(t)):t}(e);return Math.min(Math.max(t,0),9007199254740991)},u=function(e){if(null!=e){if(["string","number","boolean","symbol"].indexOf(typeof e)>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in e)return Symbol.iterator;if("@@iterator"in e)return"@@iterator"}},l=function(e,t){if(null!=e&&null!=t){var n=e[t];if(null==n)return;if(!o(n))throw new TypeError(n+" is not a function");return n}},f=function(e){var t=e.next();return!t.done&&t},r=function(e){var t,n,r,i=this,s=arguments.length>1?arguments[1]:void 0;if(void 0!==s){if(!o(s))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(t=arguments[2])}var c=l(e,u(e));if(void 0!==c){n=o(i)?Object(new i):[];var d,h,g=c.call(e);if(null==g)throw new TypeError("Array.from requires an array-like or iterable object");for(r=0;;){if(!(d=f(g)))return n.length=r,n;h=d.value,n[r]=s?s.call(t,h,r):h,r++}}else{var p=Object(e);if(null==e)throw new TypeError("Array.from requires an array-like object - not null or undefined");var v,_=a(p.length);for(n=o(i)?Object(new i(_)):Array(_),r=0;_>r;)v=p[r],n[r]=s?s.call(t,v,r):v,r++;n.length=_}return n}),r),h=function(e){return"object"===T(e)&&!function(e){return p(["undefined","null"],T(e))}(e)},g=function(e){try{var t=v(e);return t[t.length-1]}catch(e){return}},p=function(e,t){return("array"===T(e)||"string"===T(e))&&e.indexOf(t)>=0},v=d,_=function(e,t){return"string"===T(e)&&e.slice(0,t.length)===t},m=function(e){return function(e){return Array.isArray(e)&&"array"===T(e)}(e)?0===e.length:h(e)?0===function(e){return h(e)?Object.keys(e):[]}(e).length:!e},T=function(e){return{}.toString.call(e).slice(8,-1).toLowerCase()},N=function(t,n,r,i){void 0===i&&(i={}),document.addEventListener?t.addEventListener(n,r,e(e({},{capture:!0}),i)):t.attachEvent?t.attachEvent("on"+n,r):t["on"+n]=r},E={},I={};!function(e){var t=c&&c.__spreadArray||function(e,t,n){if(n||2===arguments.length)for(var r,i=0,o=t.length;o>i;i++)!r&&i in t||(r||(r=[].slice.call(t,0,i)),r[i]=t[i]);return e.concat(r||[].slice.call(t))};Object.defineProperty(e,"__esModule",{value:!0}),e.GROWING_TITLE_OLD=e.GROWING_TITLE=e.GROWING_GTITLE=e.GROWING_CDP_INDEX=e.GROWING_INDEX_OLD=e.GROWING_INDEX=e.GROWING_CONTAINER=e.GROWING_TRACK=e.GROWING_IGNORE=e.VALID_CLASS_SELECTOR=e.VALID_ID_SELECTOR=e.EXCLUDE_CLASS_RE=e.UNSUPPORTED_TAGS=e.TEXT_NODE=e.UNSUPPORTED_CLICK_TAGS=e.SUPPORTED_ICON_TAGS=e.SUPPORTED_CHANGE_TYPES=e.SUPPORTED_CLICK_INPUT_TYPES=e.SUPPORTED_CONTAINER_TAGS=e.LIST_TAGS=void 0,e.LIST_TAGS=["TR","LI","DL"],e.SUPPORTED_CONTAINER_TAGS=t(["A","BUTTON"],e.LIST_TAGS,!0),e.SUPPORTED_CLICK_INPUT_TYPES=["button","submit","reset"],e.SUPPORTED_CHANGE_TYPES=["radio","checkbox","search"],e.SUPPORTED_ICON_TAGS=["I","EM","svg","IMG"],e.UNSUPPORTED_CLICK_TAGS=["TEXTAREA","HTML","BODY"],e.TEXT_NODE=["I","SPAN","EM","B","STRONG"],e.UNSUPPORTED_TAGS=["tspan","text","g","rect","path","defs","clippath","desc","title","math","use"],e.EXCLUDE_CLASS_RE=/(^| |[^ ]+\-)(clear|clearfix|active|hover|enabled|current|selected|unselected|hidden|display|focus|disabled|undisabled|open|checked|unchecked|undefined|null|ng-|growing-)[^\. ]*/g,e.VALID_ID_SELECTOR=/^[a-zA-Z-\_][a-zA-Z\-\_0-9]+$/,e.VALID_CLASS_SELECTOR=/^([a-zA-Z\-\_0-9]+)$/,e.GROWING_IGNORE="data-growing-ignore",e.GROWING_TRACK="data-growing-track",e.GROWING_CONTAINER="data-growing-container",e.GROWING_INDEX="data-growing-index",e.GROWING_INDEX_OLD="data-growing-idx",e.GROWING_CDP_INDEX="data-index",e.GROWING_GTITLE="data-growing-title",e.GROWING_TITLE="data-title",e.GROWING_TITLE_OLD="growing-title"}(I);var O={},b={};Object.defineProperty(b,"__esModule",{value:!0}),b.lastFindIndex=b.findIndex=b.arrayEquals=b.rmBlank=b.normalizePath=b.splitNoEmpty=b.filterText=void 0,b.filterText=function(e,t){if(void 0===t&&(t=!0),e&&(null==(e=e.replace(/[\n \t]+/g," ").trim())?void 0:e.length))return e.slice(0,t?50:void 0)},b.splitNoEmpty=function(e,t){return e?e.split(t).filter((function(e){return!!e})):[]},b.normalizePath=function(e){var t=e.length;return t>1&&"/"===e.charAt(t-1)?e.slice(0,t-1):e},b.rmBlank=function(e){return e?e.replace(/[\n \t]+/g,""):""},b.arrayEquals=function(e,t){if(!e||!t)return!1;if(e.length!==t.length)return!1;for(var n=0,r=e.length;r>n;n++)if(e[n]!==t[n])return!1;return!0},b.findIndex=function(e,t){if(null==e||"function"!=typeof t)return-1;for(var n=0;n<e.length;n++){var r=e[n];if(t.call(void 0,r))return n}return-1},b.lastFindIndex=function(e,t){if(null==e||"function"!=typeof t)return-1;for(var n=e.length-1;n>=0;n--){var r=e[n];if(t.call(void 0,r))return n}return-1},function(e){var t=c&&c.__spreadArray||function(e,t,n){if(n||2===arguments.length)for(var r,i=0,o=t.length;o>i;i++)!r&&i in t||(r||(r=[].slice.call(t,0,i)),r[i]=t[i]);return e.concat(r||[].slice.call(t))},n=c&&c.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(e,"__esModule",{value:!0}),e.removeDiffTagOnHeadAndTail=e.computeXpath=e.getMarkIndex=e.getEffectiveNode=e.isIgnore=e.depthInside=e.changeableInput=e.clickableInput=e.onlyContainsTextChildren=e.onlyContainsIconChildren=e.supportIconTag=e.isContainerTag=e.isListTag=e.isParentOfLeaf=e.isLeaf=e.getChildren=e.getDeepChildren=e.findParent=e.isRootNode=e.hasValidAttribute=void 0;var r=b,i=I,o=n(d);e.hasValidAttribute=function(e,t){return e instanceof Element&&e.hasAttribute(t)&&"false"!==e.getAttribute(t)},e.isRootNode=function(e){return!e||-1!==["BODY","HTML","#document"].indexOf(e.nodeName)},e.findParent=function(t,n){for(var r=t.parentNode;r&&!(0,e.isRootNode)(r);){if(n(r))return r;r=r.parentNode}},e.getDeepChildren=function(n){return(0,o.default)((null==n?void 0:n.childNodes)||[]).reduce((function(n,r){return r instanceof Element?t(t(t([],n,!0),[r],!1),(0,e.getDeepChildren)(r),!0):n}),[])},e.getChildren=function(e){return(0,o.default)((null==e?void 0:e.childNodes)||[]).filter((function(e){return e instanceof Element}))},e.isLeaf=function(t){return!t.hasChildNodes()||"svg"===t.nodeName||0===(0,e.getChildren)(t).length},e.isParentOfLeaf=function(t){return!(!t.hasChildNodes()||"svg"===t.nodeName)&&0===(0,o.default)(t.childNodes).filter((function(t){return!(0,e.isLeaf)(t)})).length},e.isListTag=function(e){return-1!==i.LIST_TAGS.indexOf(e.nodeName)},e.isContainerTag=function(t){return(0,e.hasValidAttribute)(t,i.GROWING_CONTAINER)||-1!==i.SUPPORTED_CONTAINER_TAGS.indexOf(t.nodeName)},e.supportIconTag=function(e){var t=e.nodeName;return-1!==i.SUPPORTED_ICON_TAGS.indexOf(t)},e.onlyContainsIconChildren=function(t){if(t.textContent)return!1;var n=(0,e.getChildren)(t);if(0===n.length)return!1;for(var r=0,i=n;r<i.length;r++){var o=i[r];if(!(0,e.supportIconTag)(o)&&"SPAN"!==o.nodeName)return!1}return!0},e.onlyContainsTextChildren=function(t){return 0!==(0,e.getChildren)(t).length&&!(0,e.getDeepChildren)(t).map((function(e){return e.tagName})).some((function(e){return-1===i.TEXT_NODE.indexOf(e)}))},e.clickableInput=function(e){return e instanceof HTMLInputElement&&"INPUT"===e.tagName&&-1!==i.SUPPORTED_CLICK_INPUT_TYPES.indexOf(e.type)},e.changeableInput=function(e){return e instanceof HTMLInputElement&&"INPUT"===e.tagName&&-1!==i.SUPPORTED_CHANGE_TYPES.indexOf(e.type)},e.depthInside=function(t,n,r){if(void 0===n&&(n=4),void 0===r&&(r=1),r>n)return!1;for(var i="svg"===t.tagName?[]:(0,e.getChildren)(t),o=0;o<i.length;o++){var a=i[o];if(!(0,e.depthInside)(a,n,r+1))return!1}return n>=r},e.isIgnore=function(t){if(!(t instanceof Element)||(0,e.hasValidAttribute)(t,i.GROWING_IGNORE))return!0;for(var n=t.parentNode;n&&!(0,e.isRootNode)(n);){if((0,e.hasValidAttribute)(n,i.GROWING_IGNORE))return!0;n=n.parentNode}return!1},e.getEffectiveNode=function(t){for(var n,r;t&&(r=void 0,!((n=t)instanceof Element&&-1===i.UNSUPPORTED_TAGS.indexOf(null===(r=n.tagName)||void 0===r?void 0:r.toLowerCase())))&&t.parentNode;)t=t.parentNode;var o,a=t.parentNode;return!(0,e.isRootNode)(a)&&((0,e.onlyContainsIconChildren)(a)||"BUTTON"===(o=a).tagName&&(0,e.onlyContainsTextChildren)(o))?a:t},e.getMarkIndex=function(e){if(e instanceof Element){var t=e.getAttribute(i.GROWING_INDEX)||e.getAttribute(i.GROWING_INDEX_OLD)||e.getAttribute(i.GROWING_CDP_INDEX);if(t){if(/^\d{1,10}$/.test(t)&&+t>0&&2147483647>+t)return+t;window.console.error("[GioNode]：标记的index不符合规范（index必须是大于0且小于2147483647的整数字）。",t)}}},e.computeXpath=function(e){for(var t=e.parentPaths(!0),n=Math.min(t.length,+(t.length>=10)+4),r=["","",""],i=0;i<t.length;i++){var o=t[i].path,a=t[i].name;r[0]=o+r[0],r[2]="/".concat(a)+r[2],n>i&&(r[1]=o+r[1])}return r},e.removeDiffTagOnHeadAndTail=function(e,t){var n=function(e){return e.nodeName===t.nodeName},i=(0,r.findIndex)(e,n),o=(0,r.lastFindIndex)(e,n);return-1===i||-1===o?[]:e.slice(i,o+1)}}(O);var y={},C={};Object.defineProperty(C,"__esModule",{value:!0});var A=I,P=b,x=O;function L(e){var t;if(e instanceof Element){var n=e.getAttribute("name");if(n)return[n];if(e.hasAttribute("class")){var r=null===(t=e.getAttribute("class"))||void 0===t?void 0:t.replace(A.EXCLUDE_CLASS_RE,"").trim();if(null==r?void 0:r.length)return r.split(/\s+/).filter((function(e){return A.VALID_CLASS_SELECTOR.test(e)&&!e.match(/[a-z][A-Z][a-z][A-Z]/)&&!e.match(/[0-9][0-9][0-9][0-9]/)})).sort()}}return[]}var G=function(){function e(e){var t;this.node=e,this.tagName=this.node.nodeName,this.name=this.tagName.toLowerCase(),this.id=(t=this.node).id&&A.VALID_ID_SELECTOR.test(t.id)?t.id:null,this.classList=L(this.node),this.guessListAndIndex()}return e.prototype.guessListAndIndex=function(){var e,t=this;this._tagList=(0,x.isListTag)(this.node);var n=(0,x.removeDiffTagOnHeadAndTail)((0,x.getChildren)(this.node.parentNode),this.node);if(this._tagList&&-1!==(o=n.filter((function(e){return e.tagName===t.tagName})).indexOf(this.node))&&(this._index=o+1),n.length>=3&&(null===(e=this.classList)||void 0===e?void 0:e.length)){for(var r=0,i=0,o=1;o<=n.length;o++){var a=n[o-1];if(a.tagName!==this.tagName){i=0;break}(0,P.arrayEquals)(this.classList,L(a))&&(i+=1),this.node===a&&(r=o)}3>i||(this._pseudoList=!0,this._index=this._index||r)}},Object.defineProperty(e.prototype,"path",{get:function(){var e;return this._path||(this._path="/".concat(this.name),this.id&&(this._path+="#".concat(this.id)),(null===(e=this.classList)||void 0===e?void 0:e.length)&&(this._path+=".".concat(this.classList.join(".")))),this._path},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"pseudoList",{get:function(){return!!this._pseudoList},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"list",{get:function(){return!!this._tagList||!!this._pseudoList},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"index",{get:function(){return(0,x.getMarkIndex)(this.node)||this._index},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"container",{get:function(){return(0,x.isContainerTag)(this.node)||this.list},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"parent",{get:function(){return this.node.parentNode?new e(this.node.parentNode):null},enumerable:!1,configurable:!0}),e.prototype.parentPaths=function(e){void 0===e&&(e=!1);for(var t=e?[this]:[],n=this.parent;n&&!(0,x.isRootNode)(n.node);)t.push(n),n=n.parent;return t},e}();C.default=G;var S={};Object.defineProperty(S,"__esModule",{value:!0}),S.getElementHref=S.getImgHref=S.getAnchorHref=void 0;var R=b;function D(e){if(e.hasAttribute("href")){var t=e.getAttribute("href");if(t&&0!==t.indexOf("javascript"))return(0,R.normalizePath)(t.slice(0,320))}}function w(e){if(e.src&&-1===e.src.indexOf("data:image"))return e.src}S.getAnchorHref=D,S.getImgHref=w,S.getElementHref=function(e){var t=e;if(t)switch(e.nodeName.toLowerCase()){case"a":return D(t);case"img":return w(t)}};var k={},U=c&&c.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(k,"__esModule",{value:!0}),k.getElementContent=k.getFormContent=void 0;var j=O,M=S,W=I,X=U(C),H=b,V=U(d),B=function(e){return e.htmlFor||e.getAttribute("for")};function K(e){var t=e.node;return e.list?z(t):(0,H.filterText)(t.textContent)||void 0}function z(e){for(var t=void 0,n=!1,r=0,i=(0,V.default)(e.childNodes);r<i.length;r++){var o=i[r];if(o.nodeType===Node.TEXT_NODE){var a=(0,H.filterText)(o.textContent);if(a)return a}if(o.nodeType===Node.ELEMENT_NODE&&-1===["INPUT","SELECT"].indexOf(o.nodeName)){if(new X.default(o).pseudoList)return;n=(0,j.onlyContainsIconChildren)(o)||(0,j.supportIconTag)(o);var u=Y(o);if(n)t=u,n=!1;else if(u||(u=z(o)),u)return u}}return t}function F(e){for(var t=e.getElementsByTagName("input"),n=0,r=(0,V.default)(t);n<r.length;n++){var i=r[n];if(("search"===i.type||"text"===i.type&&("q"===i.id||-1!==i.id.indexOf("search")||"q"===i.name||-1!==i.name.indexOf("search")))&&!(0,j.isIgnore)(i)){var o=Y(i);if(o)return o}}}function Y(e){return function(e){var t=e;if(t){var n=function(e){var t=e.getAttribute(W.GROWING_GTITLE)||e.getAttribute(W.GROWING_TITLE)||e.getAttribute(W.GROWING_TITLE_OLD)||e.getAttribute("title");return null==t?void 0:t.trim()}(t);if(n)return n;var r,i,o,a=new X.default(e);switch(e.nodeName.toLowerCase()){case"a":return function(e){if(((0,j.isLeaf)(e)||(0,j.onlyContainsIconChildren)(e))&&e.textContent){var t=(0,H.filterText)(e.textContent);if(t)return t}var n=(0,M.getAnchorHref)(e);if(n){var r=n.indexOf("?");return r>-1?n.slice(0,r):n}}(t);case"svg":return function(e){for(var t=0,n=(0,V.default)(e.childNodes);t<n.length;t++){var r=n[t];if(r.nodeType===Node.ELEMENT_NODE&&"use"===r.tagName.toLowerCase()&&r.hasAttribute("xlink:href"))return r.getAttribute("xlink:href")}}(t);case"button":return(null===(o=(i=t).name)||void 0===o?void 0:o.length)?i.name:(0,H.filterText)(i.textContent)||z(i);case"img":return function(e){if(e.alt)return e.alt;var t=(0,M.getImgHref)(e);if(t){var n=t.split("?")[0].split("/");if(n.length>0)return n[n.length-1]}}(t);case"label":return K(a);case"input":return function(e){if((0,j.clickableInput)(e))return e.value;if("password"!==e.type&&(0,j.hasValidAttribute)(e,W.GROWING_TRACK))return e.value;if((0,j.changeableInput)(e)){var t=(0,j.findParent)(e,(function(e){return"LABEL"===e.nodeName}));if(!t&&e.id)for(var n=document.body.getElementsByTagName("label"),r=0;r<n.length;r++){var i=n[r];if(B(i)===e.id){t=i;break}}if(t){var o=K(new X.default(t));if(o&&o.length>0)return o+" ("+e.checked+")"}return e.value}}(t);case"select":return r=t,(0,V.default)(r.options).filter((function(e){return e.selected})).map((function(e){return e.label})).join(", ")||r.value;case"form":return F(t)}return(0,j.isLeaf)(t)?function(e){var t=(0,H.filterText)(e.textContent);if(t)return t}(t):(0,j.isParentOfLeaf)(t)&&!(0,j.onlyContainsIconChildren)(t)?function(e){for(var t="",n=0,r=(0,V.default)(e.childNodes);n<r.length;n++){var i=r[n];t+=(i.nodeType===Node.TEXT_NODE&&i.textContent?i.textContent.trim():"")+" "}return(0,H.filterText)(t,!1)}(t):a.container||(0,j.onlyContainsIconChildren)(e)?z(t):void 0}}(e)||void 0}k.getFormContent=F,k.getElementContent=Y;var q,Z=c&&c.__extends||(q=function(e,t){return q=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)({}).hasOwnProperty.call(t,n)&&(e[n]=t[n])},q(e,t)},function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+t+" is not a constructor or null");function n(){this.constructor=e}q(e,t),e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)}),$=c&&c.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(y,"__esModule",{value:!0});var J=$(C),Q=S,ee=k,te=O,ne=function(e){function t(t){var n=e.call(this,t)||this;n.node=t;var r=(0,te.computeXpath)(n),i=r[0],o=r[1],a=r[2];return n.fullXpath=i,n.xpath=o,n.skeleton=a,n}return Z(t,e),Object.defineProperty(t.prototype,"href",{get:function(){return(0,Q.getElementHref)(this.node)},enumerable:!1,configurable:!0}),Object.defineProperty(t.prototype,"content",{get:function(){return(0,ee.getElementContent)(this.node)},enumerable:!1,configurable:!0}),t}(J.default);y.default=ne;var re=c&&c.__assign||function(){return re=Object.assign||function(e){for(var t,n=1,r=arguments.length;r>n;n++)for(var i in t=arguments[n])({}).hasOwnProperty.call(t,i)&&(e[i]=t[i]);return e},re.apply(this,arguments)},ie=c&&c.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(E,"__esModule",{value:!0});var oe=I,ae=O,ue=ie(y),le=function(){function e(e,t,n){void 0===t&&(t=null),void 0===n&&(n=!0),this.origin=e,this.action=t,this.direct=n,this.target="self"===t?e:(0,ae.getEffectiveNode)(e),this.ignore=(0,ae.isIgnore)(this.target),this.vnode=new ue.default(this.target),this.tagName=this.vnode.tagName}return Object.defineProperty(e.prototype,"content",{get:function(){return this.vnode.content},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"href",{get:function(){return this.vnode.href},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"index",{get:function(){return this.vnode.index},enumerable:!1,configurable:!0}),e.prototype.inferParentIndex=function(){var t=this;return this.parentIndex||(0,ae.findParent)(this.target,(function(n){var r=new e(n,t.action,!1);r.traceable()&&r.index&&(t.parentIndex=r.index)})),this.parentIndex},Object.defineProperty(e.prototype,"xpath",{get:function(){return this.vnode.xpath},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"fullXpath",{get:function(){return this.vnode.fullXpath},enumerable:!1,configurable:!0}),Object.defineProperty(e.prototype,"skeleton",{get:function(){return this.vnode.skeleton},enumerable:!1,configurable:!0}),e.prototype.info=function(e){return void 0===e&&(e=!0),e&&this.inferParentIndex(),{skeleton:this.skeleton,fullXpath:this.fullXpath,xpath:this.xpath,content:this.content,href:this.href,index:this.parentIndex||this.index}},e.prototype.traceable=function(){if(this.ignore)return!1;if(this.direct){if("click"===this.action||"hover"===this.action){if(-1!==oe.UNSUPPORTED_CLICK_TAGS.indexOf(this.target.tagName))return!1;if("INPUT"===this.target.tagName&&!(0,ae.clickableInput)(this.target))return!1;if(!(0,ae.isContainerTag)(this.target)&&!(0,ae.depthInside)(this.target,5))return!1}return!0}return this.vnode.container},e.prototype.trackNodes=function(){if(!this.traceable())return[];var e=[this];if("submit"!==this.action)for(var t=this.parentElement;t;){if(t.ignore)return[];t.traceable()&&e.unshift(t),t=t.parentElement}var n=void 0;return e.map((function(e){var t=e.info(!1),r=t.index;return!n&&r&&(n=r),re(re({},t),{index:n||r})}))},Object.defineProperty(e.prototype,"parentElement",{get:function(){var t=this.target.parentNode;if(t&&t.nodeName&&!(0,ae.isRootNode)(t))return new e(t,this.action,!1)},enumerable:!1,configurable:!0}),e}(),fe=E.default=le,se=function(){function e(e){this.handler=e;var t=navigator.userAgent,n=/chrome/i.exec(t),r=/android/i.exec(t);this.hasTouch="ontouchstart"in window&&!(n&&!r)}return e.prototype.main=function(){for(var e=this.hasTouch?["touchstart"]:["mousedown"],t=this.hasTouch?["touchend","touchcancel"]:["mouseup","mouseleave"],n=this.hasTouch?["touchmove"]:["mousemove"],r=0,i=e;i.length>r;r++)N(window,i[r],this.touchStartHandler.bind(this));for(var o=0,a=n;a.length>o;o++)N(window,a[o],this.touchMoveHandler.bind(this));for(var u=0,l=t;l.length>u;u++)N(window,l[u],this.touchStopHandler.bind(this))},e.prototype.touchStartHandler=function(e){if(1>=e.which){var t=+Date.now();this.safeguard!==t&&(this.touchTimeout&&clearTimeout(this.touchTimeout),this.safeguard=t,this.touchEvent={time:t,target:e.target,x:this._page("x",e),y:this._page("y",e),isTrusted:!0,type:"click"})}},e.prototype.touchMoveHandler=function(e){var t=Math.abs(this._page("x",e)-(this.touchEvent&&this.touchEvent.x)||0),n=Math.abs(this._page("y",e)-(this.touchEvent&&this.touchEvent.y)||0);(t>10||n>10)&&(this.touchEvent=null)},e.prototype.touchStopHandler=function(e){var t=this,n=+Date.now()-(this.touchEvent&&this.touchEvent.time)||0;this.touchEvent&&200>n?this.touchTimeout=setTimeout((function(){t.handler(t.touchEvent),t.touchEvent=null}),200):this.touchEvent&&n>=200&&700>n&&(this.handler(this.touchEvent),this.touchEvent=null)},e.prototype._page=function(e,t){return(this.hasTouch?t.touches[0]:t)["page".concat(e.toUpperCase())]},e}(),ce={name:"gioEventAutoTracking",method:function(t){var n=this;this.growingIO=t,this.main=function(){N(document,"submit",n._handleAction),N(document,"change",n._handleAction),n.growingIO.vdsConfig.touch?new se(n._handleAction).main():N(document,"click",n._handleAction)},this._handleAction=function(t,r){var i=n.growingIO,o=i.vdsConfig,a=i.emitter;if(!o.autotrack)return!1;var u=t.target;if(!u)return!1;var l=new fe(u,t.type,!0).trackNodes();if("click"!==t.type&&(l=m(g(l))?[]:[g(l)]),m(l))return!1;null==a||a.emit("onComposeBefore",{event:r,params:null!=t?t:{}}),l.forEach((function(r){var i=r.fullXpath,a=r.index,u=r.content,l=r.href;if(!_(r.fullXpath||"","/div#__vconsole")&&!_(r.fullXpath||"","/div#__giokit")&&(o.debug&&console.log("Action：",t.type,Date.now()),i)){var f=n.growingIO.dataStore,c=f.eventContextBuilder,d=f.eventConverter,h=f.currentPage;d(e(e({eventType:s[t.type],element:[{xpath:i,index:a,textValue:u,hyperlink:l}]},c()),{pageShowTimestamp:h.time}))}}))}}};export{ce as default};
