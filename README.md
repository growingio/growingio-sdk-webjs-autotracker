# gio-web-autotracker

# Web/H5/小程序内嵌页/Hybrid数据采集 SDK

## 介绍

暂时只实现了CDP，Saas因为历史原因没有实现。

目前具备以下特性：

- 无埋点能力，自动采集用户行为事件，可通过开关和插件控制。
- 埋点能力，开发同学可调用 Api 主动采集自定义事件。
- 支持半自动曝光事件。
- 可依据使用场景自由拆分 SDK，减少大小。
- 支持自定义插件开发。（实验性功能）

与原版本的区别、集成方式等文档内容请参考现在的 CDP 文档。

## 开发

1、检查环境，Nodejs 版本>=14，推荐使用 Nodejs v16。（推荐使用 nvm 进行 Nodejs 版本管理）推荐使用VSCode开发。

2、安装依赖包

> npm install 或 yarn

3、开发

> npm run dev:cdp

4、运行Demo

推荐使用VSCode插件`Live ServerPP`，可一键启动本地服务进行快速开发和调试。插件安装完成后，点击VSCode右下角“Go Live”即可。

5、打包

1）打包SDK和插件

> npm run build:cdp

2）单独打包SDK

> npm run build:sdk

3）单独打包插件

> npm run build:plugins

## 插件目录说明

### plugins目录

文件夹名字即为插件名称，文件夹中必须包含`index.umd.ts`、`index.es.ts`两个文件作为打包插件时的入口文件。二级后缀作为打包格式。

## 开发插件

- 这里提供一个Demo供参考：

```js
/**
 * 名称：插件Demo
 * 用途：用于提供编写插件的模板。
 */
import { GrowingIOType } from '@/types/growingIO';

class GioDemoPlugin {
  constructor(public growingIO: GrowingIOType) {}

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
