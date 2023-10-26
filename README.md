GrowingIO WebJS SDK (GrowingIO WebJS Autotracker)
======

![GrowingIO](https://www.growingio.com/vassets/images/home_v3/gio-logo-primary.svg)

# Web/H5/小程序内嵌页/Hybrid数据采集 SDK

## 介绍

- 无埋点能力，自动采集用户行为事件，可通过开关和插件控制。
- 埋点能力，开发同学可调用 Api 主动采集自定义事件。
- 支持半自动曝光事件。
- 可依据使用场景自由拆分 SDK，减少大小。
- 支持自定义插件开发。

## 官方集成文档（Integration Document）

[集成文档](https://growingio.github.io/growingio-sdk-docs/docs/webjs)

## 开发

1、检查环境，Nodejs 版本>=14，推荐使用 Nodejs v16。（推荐使用 nvm 进行 Nodejs 版本管理）推荐使用VSCode开发。

2、安装依赖包

> npm install 或 pnpm install 或 yarn

3、开发

单独开发SDK
> npm run dev

单独开发插件
> npm run dev:plugins

4、打包

打包SDK和插件

> npm run build // 默认打包umd格式
> npm run bnuild:es // 指定打包esm格式

单独打包SDK

> npm run build:sdk // 默认打包umd格式
> npm run bnuild:sdk-es // 指定打包esm格式

单独打包插件

> npm run build:plugins // 默认打包umd格式
> npm run build:plugins-es // 指定打包esm格式

## 开发插件

- 这里提供一个Demo供参考：

```js
/**
 * 名称：插件Demo
 * 用途：用于提供编写插件的模板。
 */
import { GrowingIOType } from '@/types/growingIO';

class GioDemoPlugin {
  constructor(public growingIO: GrowingIOType) {
    const { emitter } = this.growingIO;
    emitter.on('SDK_INITIALIZED', (args) => { ...});
    // 其他可支持监听的消息名称请参考 src -> constants -> emitMsg.ts
  }

  onInstall(args) {
    // console.log('onInstall', args);
  }

  onError(args) {
    // console.log('onError', args);
  }

  onComposeBefore(args) {
    // console.log('onComposeBefore', args);
  }

  onComposeAfter(args) {
    // console.log('onComposeAfter', args);
  }

  onSendBefore(args) {
    // console.log('onSendBefore', args);
  }

  onSendAfter(args) {
    // console.log('onSendAfter', args);
  }
}

export default { name: 'gioDemoPlugin', method: GioDemoPlugin };

```

## 浏览器兼容性

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Opera |[<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/electron/electron_48x48.png" alt="Electron" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Electron |
| --------- | --------- | --------- | --------- | --------- | --------- |
| IE11 / Edge > 15 major / Edge IE兼容模式| > 54 major | > 51 major | > 10 major | > 38 major | > 10 major |

## 开源说明

是的，我们开源了 WebJS 采集SDK的内容，欢迎大家一起学习和互相帮助。

另外，请注意开源协议。
