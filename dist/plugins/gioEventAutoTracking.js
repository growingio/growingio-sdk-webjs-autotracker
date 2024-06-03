var t,e,n,i,r,o=function(){return o=Object.assign||function(t){for(var e,n=1,i=arguments.length;i>n;n++)for(var r in e=arguments[n])({}).hasOwnProperty.call(e,r)&&(t[r]=e[r]);return t},o.apply(this,arguments)},a="function"==typeof Array.from?Array.from:(e||(e=1,n=function(t){return"function"==typeof t},i=function(t){var e=function(t){var e=Number(t);return isNaN(e)?0:0!==e&&isFinite(e)?(e>0?1:-1)*Math.floor(Math.abs(e)):e}(t);return Math.min(Math.max(e,0),9007199254740991)},r=function(t){var e=t.next();return!e.done&&e},t=function(t){var e,o,a,u=this,c=arguments.length>1?arguments[1]:void 0;if(void 0!==c){if(!n(c))throw new TypeError("Array.from: when provided, the second argument must be a function");arguments.length>2&&(e=arguments[2])}var s=function(t,e){if(null!=t&&null!=e){var i=t[e];if(null==i)return;if(!n(i))throw new TypeError(i+" is not a function");return i}}(t,function(t){if(null!=t){if(["string","number","boolean","symbol"].indexOf(typeof t)>-1)return Symbol.iterator;if("undefined"!=typeof Symbol&&"iterator"in Symbol&&Symbol.iterator in t)return Symbol.iterator;if("@@iterator"in t)return"@@iterator"}}(t));if(void 0!==s){o=n(u)?Object(new u):[];var l,d,h=s.call(t);if(null==h)throw new TypeError("Array.from requires an array-like or iterable object");for(a=0;;){if(!(l=r(h)))return o.length=a,o;d=l.value,o[a]=c?c.call(e,d,a):d,a++}}else{var f=Object(t);if(null==t)throw new TypeError("Array.from requires an array-like object - not null or undefined");var g,v=i(f.length);for(o=n(u)?Object(new u(v)):Array(v),a=0;v>a;)g=f[a],o[a]=c?c.call(e,g,a):g,a++;o.length=v}return o}),t),u=function(t){return"object"===d(t)&&!function(t){return s(["undefined","null"],d(t))}(t)},c=function(t){try{var e=l(t);return e[e.length-1]}catch(t){return}},s=function(t,e){return("array"===d(t)||"string"===d(t))&&t.indexOf(e)>=0},l=a,d=function(t){return{}.toString.call(t).slice(8,-1).toLowerCase()},h=function(t,e,n,i){void 0===i&&(i={}),document.addEventListener?t.addEventListener(e,n,o(o({},{capture:!0}),i)):t.attachEvent?t.attachEvent("on"+e,n):t["on"+e]=n};function f(t,e,n){if(n||2===arguments.length)for(var i,r=0,o=e.length;o>r;r++)!i&&r in e||(i||(i=[].slice.call(e,0,r)),i[r]=e[r]);return t.concat(i||[].slice.call(e))}var g=function(t){try{return t()}catch(t){return}},v=function(t){return"number"===x(t)},p=function(t){return"object"===x(t)&&!function(t){return w(["undefined","null"],x(t))}(t)},m=function(t){return Array.isArray(t)&&"array"===x(t)},N=function(t,e){if(m(t))for(var n=0;n<t.length;n++)if(e(t[n]))return n;return-1},w=function(t,e){return("array"===x(t)||"string"===x(t))&&t.indexOf(e)>=0},y=a,E=function(t){return m(t)?0===t.length:p(t)?0===function(t){return p(t)?Object.keys(t):[]}(t).length:!t},b=function(t){if(m(t)){for(var e=0,n=[],i=0,r=t;i<r.length;i++){var o=r[i];o&&!E(o)&&(n[e++]=o)}return n}return t},x=function(t){return{}.toString.call(t).slice(8,-1).toLowerCase()},L=["body","br","canvas","clippath","defs","desc","g","hr","html","iframe","math","param","path","rect","script","style","text","title","tspan","use"],_=["button","reset","submit"],I=f(f([],_,!0),["file"],!1),k=["checkbox","color","radio","range"],T=f(f([],k,!0),["date","datetime-local","month","number","password","text","time","week"],!1),C=["tr","li","dt","dd"],O=f(["a","button","dl"],C,!0),S=["i","em","svg","img"],P=["i","span","em","b","strong","bdo"],A=/(^| |[^ ]+\-)(clear|clearfix|active|hover|enabled|current|selected|unselected|hidden|display|focus|disabled|undisabled|open|checked|unchecked|undefined|null|ng-|growing-)[^\. ]*/g,D=/^([a-zA-Z\-\_0-9]+)$/,H="data-growing-ignore",j="data-growing-container",M="data-growing-index",V="data-growing-title",X=function(t,e){var n;return null!==(n=g((function(){return t.hasAttribute(e)&&"false"!==t.getAttribute(e)})))&&void 0!==n?n:g((function(){return t.hasOwnPerporty(e)}))},B=function(t,e){var n;return null!==(n=g((function(){return t.getAttribute(e)})))&&void 0!==n?n:g((function(){return t.attributes[e].value}))},W=function(t){var e,n=!w(L,t.tagName.toLowerCase()),i=G(t);return n&&i&&w(P,null===(e=t.tagName)||void 0===e?void 0:e.toLowerCase())?W(i):t},F=function(t,e,n){if(void 0===e&&(e=5),void 0===n&&(n=0),!t.children)return!1;if("svg"===t.tagName.toLocaleLowerCase())return n>e;if(n>e)return!0;for(var i=0;i<t.children.length;i++){var r=t.children[i];if(F(r,e,n+1))return!0}return!1},R=function(t,e){var n=t.tagName.toLowerCase();if(!(t instanceof HTMLElement||t instanceof Element))return!1;if(X(t,H))return!1;if(w(L,n))return!1;if(w(["circleClick","circleHover","click"],e)){if("textarea"===n&&"click"===e)return!1;if("input"===n){if("click"===e&&!w(I,B(t,"type")))return!1;if(w(["circleClick","circleHover"],e)&&!w(f(f([],I,!0),T,!0),B(t,"type")))return!1}if(!q(t)&&F(t,5))return!1}return!0},U=function(t,e){return void 0===e&&(e=!1),y((null==t?void 0:t.childNodes)||[]).filter((function(t){return w(e?[Node.ELEMENT_NODE,Node.TEXT_NODE]:[Node.ELEMENT_NODE],t.nodeType)}))},G=function(t){return Y(t.parentElement)?null:t.parentElement},Y=function(t){return!t||w(["BODY","HTML","#document"],t.tagName)},q=function(t){return X(t,j)||w(O,t.tagName.toLowerCase())||"input"===t.tagName.toLowerCase()&&w(_,t.type)},K=function(t){var e=U(t);return!E(e)&&e.every((function(t){var e=$(t),n=w(t.classList,"icon");return!(!e&&!n||Z(t))}))},Z=function(t){var e=U(t,!0);return!E(e)&&e.every((function(t){var e=t.nodeType===Node.TEXT_NODE,n=z(t);return!(!e||!n)}))},$=function(t){return w(S,t.tagName.toLocaleLowerCase())},z=function(t){var e=U(t,!0).filter((function(t){var e;return t.nodeType===Node.TEXT_NODE||w(P,null===(e=t.tagName)||void 0===e?void 0:e.toLowerCase())})).map((function(t){return J(t.textContent,t.textContent.length)}));return J(b(e).join(" "))},J=function(t,e){return void 0===e&&(e=50),t&&(null==(t=t.replace(/[\n \t]+/g," ").trim())?void 0:t.length)?t.slice(0,v(e)&&e>0?e:void 0):""},Q=/[^/]*.(bmp|jpg|jpeg|png|gif|svg|psd|webp|apng)/gi,tt=function(t,e){switch(e){case"a":return function(t){if(X(t,"href")){var e=B(t,"href");if(e&&0!==e.indexOf("javascript"))return e.slice(0,320)}return""}(t);case"img":return function(t){var e=t.src;if(e&&-1===e.indexOf("data:image")){var n=e.match(Q),i=E(n)?"":n[0];if(i.indexOf("%")>-1){var r=function(t,e){var n=-1;if(m(t))for(var i=0;i<t.length;i++)"%"===t[i]&&(n=i);return n}(i.split(""));i=i.substring(r+3,i.length)}return i}return""}(t);default:return""}},et={a:function(t){return z(t)||rt(t)||tt(t,"a")},button:function(t){return B(t,"name")||z(t)||rt(t)||ot(t)},img:function(t){return J(B(t,"alt"))||tt(t,"img")},input:function(t){if("password"===t.type)return"";var e,n,i=t instanceof HTMLInputElement&&w(I,t.type),r=X(t,"data-growing-track");if(i||r)return J(t.value);if(t instanceof HTMLInputElement&&w(k,t.type)){var o=void 0;return t.id&&(n=function(e){return e.htmlFor===t.id},o=(e=y(document.getElementsByTagName("label")))[N(e,n)]),o||(o=it(t,(function(t){return"label"===t.tagName.toLowerCase()}))),at(t,o?z(o):J(t.value))}return""},label:function(t){return z(t)||rt(t)||ot(t)},select:function(t){return J(y(t.options).filter((function(t){return t.selected})).map((function(t){return t.label})).join(", ")||t.value)},svg:function(t){var e;return U(t).some((function(t){var n;if(t.nodeType===Node.ELEMENT_NODE&&"use"===(null===(n=t.tagName)||void 0===n?void 0:n.toLowerCase())&&t.hasAttribute("xlink:href"))return e=t,!0})),e?e.getAttribute("xlink:href"):""},textarea:function(){return""},form:function(){return""}},nt=function(t,e){if(X(t,V)&&B(t,V))return J(B(t,V));if(X(t,"title")&&B(t,"title"))return J(B(t,"title"));var n=et[e];if(n)return n(t);var i=z(t);return i?J(i):function(t){if("svg"===t.tagName)return!1;var e=U(t);return e.length>0&&e.every((function(t){return function(t){if("svg"===t.tagName)return!0;var e=U(t);if(E(e))return!0;var n=Z(t);return!(!E(e)&&!n)}(t)}))}(t)&&!K(t)?J(rt(t)):K(t)?J(ot(t)):""},it=function(t,e){for(var n=t.parentElement;n&&!Y(n);){if(e(n))return n;n=n.parentElement}},rt=function(t){var e=U(t);return b(e.map((function(t){var e=z(t);if(Z(t)&&e)return e}))).join(" ")},ot=function(t){var e;return U(t).some((function(t){var n,i=nt(t,null===(n=t.tagName)||void 0===n?void 0:n.toLowerCase());return!!i&&(e=i,!0)})),e},at=function(t,e){return w(["checkbox","radio"],t.type)?"".concat(e).concat((n=t.checked,"boolean"===x(n)?"("+t.checked+")":"")):e;var n},ut=function t(e,n,i,r,o){void 0===r&&(r=!0),void 0===o&&(o=[]);var a,u=this;this.originNode=e,this.deviceInfo=n,this.actionType=i,this.trackable=r,this.parentNodes=o,this.isLimitViewport=!0,this._getIndex=function(){if(X(u.originNode,M)){var t=B(u.originNode,M);return/^\d{1,10}$/.test(t)&&t-0>0&&2147483647>t-0?+t:void(0>u.actionType.indexOf("circle")&&(c="".concat(t,"，index标记应为 大于 0 且小于 2147483647 的整数！"),console.log("%c [GrowingIO]：".concat(c),"color: #F59E0B;")))}if(w(["dd","dt"],u.tagName)){var e=G(u.originNode),n=e?U(e):[];if("dl"===e.tagName.toLowerCase()&&n.length>0){if("dd"===u.tagName){var i=N(n,(function(t){return t.isSameNode(u.originNode)}));if(i>-1)return(r=n.slice(0,i).filter((function(t){return"dt"===t.tagName.toLowerCase()}))).length-1+1}if("dt"===u.tagName){var r=n.filter((function(t){return"dt"===t.tagName.toLowerCase()}));return N(r,(function(t){return t.isSameNode(u.originNode)}))+1}}}if(u.isPureList){var o=N(u._pureList,(function(t){return t.isSameNode(u.originNode)}));return o>-1?(u.peerNodes=f([],u._pureList,!0),u.peerNodes.splice(o,1),o+1):void 0}if(u.isPseudoList){var a=N(u._pseudoList,(function(t){return t.isSameNode(u.originNode)}));return a>-1?(u.peerNodes=f([],u._pseudoList,!0),u.peerNodes.splice(a,1),a+1):void 0}var c},this._getSiblingNode=function(t,e){var n,i=G(t);if(!i)return[];for(var r=null!==(n=g((function(){return y(i.children)})))&&void 0!==n?n:[],o=[],a=0;a<r.length;a++){var u=r[a],c=r[a+1];if(!c||!e(u,c))break;E(o)?o.push(u,c):o.push(c)}return o},this._getIsPureList=function(){var t=u._getSiblingNode(u.originNode,(function(t,e){return t.tagName===e.tagName}));return!(1>t.length||!w(C,u.tagName)||(u._pureList=t,0))},this._getIsInPseudoList=function(){if(w(["th","td"],u.tagName))return!1;var t=u._getSiblingNode(u.originNode,(function(t,e){var n=t.tagName===e.tagName&&t.className===e.className,i=U(t),r=U(e),o=i.every((function(t,e){var n,i;return(null==t?void 0:t.tagName)===(null===(n=r[e])||void 0===n?void 0:n.tagName)&&(null==t?void 0:t.className)===(null===(i=r[e])||void 0===i?void 0:i.className)})),a=i.length===r.length&&o;return n&&a}));return t.length>=3&&(u._pseudoList=t,!0)},this._getClassList=function(t){var e;if(X(t,"name")&&B(t,"name"))return[B(t,"name")];var n=(null!==(e=B(t,"class"))&&void 0!==e?e:"").trim().split(" ");return E(n)?[]:n.filter((function(t){return t&&!A.test(t)&&D.test(t)})).sort()},this._getCurrentXpath=function(){return"/".concat(u.tagName).concat(u.id?"#"+u.id:"").concat(E(u.classList)?"":"."+u.classList.join("."))},this._getIsContainer=function(){return X(u.originNode,j)||w(O,u.tagName)||"input"===u.tagName&&w(_,u.originNode.type)},this._getContent=function(){u.content=nt(u.originNode,u.tagName)},this._getIsOutFlow=function(){var t=window.getComputedStyle(u.originNode).position;return w(["fixed","sticky"],t)},this._getRect=function(){var t=u.originNode.getBoundingClientRect(),e=t.top,n=t.bottom,i=t.left,r=t.right-i,o=n-e,a=u.deviceInfo,c=a.winHeight,s=a.winWidth;return e+o>c&&(o=c-e),i+r>s&&(r=s-i),{top:e,left:i,width:r,height:o}},this._getListItemViewStatus=function(){var t=u.parentNodes.find((function(t){var e=t.originNode,n=e.scrollHeight,i=e.scrollWidth,r=e.clientHeight,o=e.clientWidth,a=t.rect,u=a.width,c=a.height;return r!==n&&n>c||o!==i&&i>u}));if(t){var e=t.rect,n=e.top,i=e.left,r=e.width,o=e.height,a=u.rect,c=a.top,s=a.left,l=a.width,d=a.height;return n>c+d||s>i+r||c>n+o||i>s+l?"OUTSIDE":c>=n&&s>=i&&n+o>c+d&&i+r>s+l?"DISPLAYED":"OBSCURED"}return""},this._getViewStatus=function(t){var e=window.getComputedStyle(u.originNode),n=e.opacity,i=e.visibility,r=e.display,o=e.width,a=e.height,c=u.rect,s=c.top,l=c.left,d=c.width,h=c.height,g=u.deviceInfo,v=g.winWidth,p=g.winHeight;if(0===Number(n)||"hidden"===i||"none"===r||"0px"===o||0===u.originNode.clientWidth||"0px"===a||0===u.originNode.clientHeight)return"HIDDEN";var m=f([],t,!0).find((function(t){return t.trackable&&w(["DISPLAYED","OBSCURED"],t.viewStatus)}));if(u.isPureList||u.isPseudoList){var N=u._getListItemViewStatus();if(N)return N}if(m)return m.viewStatus;var y=function(t,e){return document.elementFromPoint(t,e)===u.originNode};return p>s&&v>l&&d>0&&h>0?y(l+d/2,s+h/2)||y(l+1,s+1)||y(l+d-1,s+1)||y(l+1,s+h-1)||y(l+d-1,s+h-1)?"DISPLAYED":u.isLimitViewport&&(0>s+h||0>l+d)?"OUTSIDE":"OBSCURED":"OUTSIDE"},this._getTriggerEvent=function(){return"input"===u.tagName&&w(T,u.originNode.type)||w(["select","textarea"],u.tagName)?"VIEW_CHANGE":"VIEW_CLICK"},this._getXParents=function(e,n){var i=e.parentElement,r=[];if(n.length>0)r.push.apply(r,n);else if(i&&!Y(i)){var o=new t(i,void 0,u.actionType,R(i,u.actionType));r.push(o),o.xParents&&r.push.apply(r,o.xParents)}return r},this.tagName=e.tagName.toLocaleLowerCase(),this.classList=this._getClassList(e),this.id=e.id,this.currentXpath=this._getCurrentXpath(),this.isIgnored=X(this.originNode,H),this.isContainer=this._getIsContainer(),this.isPureList=this._getIsPureList(),this.isPseudoList=this._getIsInPseudoList(),this.index=this._getIndex(),this.hyperlink=tt(e,this.tagName),this.content=nt(this.originNode,this.tagName),this.triggerEvent=this._getTriggerEvent(),this.isOutFlow=this._getIsOutFlow(),n&&(this.isLimitViewport=null===(a=n.isLimitViewport)||void 0===a||a,this.rect=this._getRect(),this.viewStatus=this._getViewStatus(o)),this.xParents=this._getXParents(e,o)},ct=function t(e,n,i,r,o){var a=this;this.origin=e,this.action=n,this.lengthThreshold=i,this.deviceInfo=r,this.parentNode=o,this.trackNodes=function(){var t;if(!a.trackable)return[];var e=[a.xNode];if(w(["click","circleClick","change"],a.actionType))for(var n=a._getParent();n;){if(!(null==n?void 0:n.xNode)||(null===(t=n.xNode)||void 0===t?void 0:t.isIgnored))return[];n.trackable&&e.push(n.xNode),n=n._getParent()}var i,r=[];return e.reverse().forEach((function(t,n){if(X(t.originNode,j)&&(r=[],i=void 0),v(t.index)&&!v(i)&&(i=t.index),v(i)&&(t.index=i),n===e.length-1)r.push(a.getGioNodeInfo(t));else{var o=t.isPureList||t.isPseudoList;(t.isContainer||o)&&r.push(a.getGioNodeInfo(t))}})),r},this.getGioNodeInfo=function(t){var e=a.computeXpath(t),n=e.skeleton,i=e.fullXpath,r=e.xcontent,o=t.hyperlink,u=t.index,c=t.peerNodes,s=t.content,l=t.triggerEvent,d=t.originNode;return{skeleton:n,xpath:n,fullXpath:i,xcontent:r,hyperlink:o,index:u,peerNodes:null!=c?c:[],content:J(s),triggerEvent:l,originNode:d}},this.computeXpath=function(t){var e,n="/"+t.tagName,i=t.currentXpath,r="/"+((t.id?"#"+t.id:"")+(E(t.classList)?"":"."+t.classList.join("."))||"-");return null===(e=t.xParents)||void 0===e||e.forEach((function(t,e){if(i=t.currentXpath+i,e<a.xpathThreshold-1){n="/"+t.tagName+n;var o=(t.id?"#"+t.id:"")+(E(t.classList)?"":"."+t.classList.join("."));r="/"+(o||"-")+r}})),{skeleton:n,fullXpath:i,xcontent:r}},this._getParent=function(){var e=G(a.originElement);if(e&&e.nodeName&&!Y(e))return new t(e,a.actionType)},this.actionType=w(["circleClick","circleHover","click","change"],n)?n:"click",this.originElement=W(e),this.xpathThreshold=v(i)?i:4,this.trackable=R(this.originElement,this.actionType),this.originElement.isSameNode(e)||(o=null);var u=[];o&&o.xNode&&(u.push(o.xNode),o.xNode.xParents&&u.push.apply(u,o.xNode.xParents)),this.xNode=new ut(this.originElement,this.deviceInfo,this.actionType,this.trackable,u)},st=function(){function t(t){this.handler=t;var e=navigator.userAgent,n=/chrome/i.exec(e),i=/android/i.exec(e);this.hasTouch="ontouchstart"in window&&!(n&&!i)}return t.prototype.main=function(){for(var t=this.hasTouch?["touchstart"]:["mousedown"],e=this.hasTouch?["touchend","touchcancel"]:["mouseup","mouseleave"],n=this.hasTouch?["touchmove"]:["mousemove"],i=0,r=t;r.length>i;i++)h(window,r[i],this.touchStartHandler.bind(this));for(var o=0,a=n;a.length>o;o++)h(window,a[o],this.touchMoveHandler.bind(this));for(var u=0,c=e;c.length>u;u++)h(window,c[u],this.touchStopHandler.bind(this))},t.prototype.touchStartHandler=function(t){if(1>=t.which){var e=+Date.now();this.safeguard!==e&&(this.touchTimeout&&clearTimeout(this.touchTimeout),this.safeguard=e,this.touchEvent={time:e,target:t.target,x:this._page("x",t),y:this._page("y",t),isTrusted:!0,type:"click"})}},t.prototype.touchMoveHandler=function(t){var e=Math.abs(this._page("x",t)-(this.touchEvent&&this.touchEvent.x)||0),n=Math.abs(this._page("y",t)-(this.touchEvent&&this.touchEvent.y)||0);(e>10||n>10)&&(this.touchEvent=null)},t.prototype.touchStopHandler=function(t){var e=this,n=+Date.now()-(this.touchEvent&&this.touchEvent.time)||0;this.touchEvent&&200>n?this.touchTimeout=setTimeout((function(){e.handler(e.touchEvent),e.touchEvent=null}),200):this.touchEvent&&n>=200&&700>n&&(this.handler(this.touchEvent),this.touchEvent=null)},t.prototype._page=function(t,e){return(this.hasTouch?e.touches[0]:e)["page".concat(t.toUpperCase())]},t}(),lt={click:"VIEW_CLICK",change:"VIEW_CHANGE"},dt={name:"gioEventAutoTracking",method:function(t){var e,n=this;this.growingIO=t,this.main=function(){h(document,"change",n._handleAction),n.growingIO.vdsConfig.touch?new st(n._handleAction).main():h(document,"click",n._handleAction)},this._handleAction=function(t,e){var i,r,o,a,s,l=n.growingIO,h=l.vdsConfig,f=l.emitter,g=t.target;if(!h.autotrack||!g)return!1;if(!(null==g?void 0:g.tagName)||"circle-shape"===(null===(i=null==g?void 0:g.tagName)||void 0===i?void 0:i.toLowerCase())||"circle-page"===(null===(r=null==g?void 0:g.tagName)||void 0===r?void 0:r.toLowerCase())||"heatmap-page"===(null===(o=null==g?void 0:g.tagName)||void 0===o?void 0:o.toLowerCase())||(null===(a=null==g?void 0:g.id)||void 0===a?void 0:a.indexOf("__vconsole"))>-1||(null===(s=null==g?void 0:g.id)||void 0===s?void 0:s.indexOf("__giokit"))>-1)return!1;var v=new ct(g,t.type).trackNodes();if(function(t){return function(t){return Array.isArray(t)&&"array"===d(t)}(t)?0===t.length:u(t)?0===function(t){return u(t)?Object.keys(t):[]}(t).length:!t}(v))return!1;"click"!==t.type&&(v=[c(v)]),null==f||f.emit("ON_COMPOSE_BEFORE",{event:e,params:null!=t?t:{}}),v.forEach((function(e){var i=e.fullXpath;if(0>i.indexOf("#__giokit")&&0>i.indexOf("#__vconsole")&&(h.debug&&console.log("Action：",t.type,Date.now()),i)){var r=n.growingIO,o=r.trackingId,a=r.useEmbeddedInherit,u=r.useHybridInherit,c=r.dataStore;n.buildInteractiveEvent(o,t,e),a&&o!==a&&c.getTrackerVds(a).autotrack&&n.buildInteractiveEvent(a,t,e),u&&o!==u&&c.getTrackerVds(u).autotrack&&n.buildInteractiveEvent(u,t,e)}}))},this.buildInteractiveEvent=function(t,e,i){var r=n.growingIO.dataStore,a=r.eventContextBuilder,u=r.eventConverter,c=r.currentPage,s=i.skeleton,l=i.xcontent,d=i.index,h=i.content,f=i.hyperlink,g=o({eventType:lt[e.type],element:[{xpath:s,xcontent:l,textValue:h,index:d,hyperlink:f}]},a(t));g.attributes=c.eventSetPageProps(t,g),u(g)},this.pluginVersion="4.2.2",null===(e=this.growingIO.emitter)||void 0===e||e.on("OPTION_INITIALIZED",(function(t){t.trackingId===n.growingIO.trackingId&&n.main()}))}};export{dt as default};
