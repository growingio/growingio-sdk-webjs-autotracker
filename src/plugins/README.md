## 目录说明

本目录下有多个文件夹，其中`ordinary`是主要的一些内置插件，其他为特殊场景适配。

## 插件名称命名规则

`gio`开头表明是gio的插件；

名称带`Adapter`表明是某个场景下的适配；

短横线加环境`-cdp`、`-saas`表明是cdp或者是saas专有的插件；不会被单独打包插件；

下划线加类型`_iife`、`_cjs`表明是指定打包的format类型，不加的默认打`es`格式，`ordinary`目录下的插件会打`iife`和`es`两种；

除`ordinary`目录下的插件打包会打在`dist/cdp/plugins`根目录下，其他带文件夹的插件会保留文件夹路径；

其中打包逻辑要注意的是，`ordinary`默认打到`dist/cdp/plugins`下的是`iife`格式的，`dist/cdp/esplugins`下的才是`es`格式的，发到cdn的是`iife`格式的，发到`npm`（git项目）的是`es`格式的，也就是说，jekins发布完成后，往git项目里复制的是es格式的plugins。

## 开发插件

DEMO:

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
