## 目录说明

本目录下有多个`plugins`名称的文件，核心代码是`basePlugins`，其他都是为了兼容引入插件方式。

### plugins.es6.ts

这个文件使用了es6才能支持的插件`babel-plugin-bulk-import`，`plugins`目录下的插件会自动全部读成context对象，不需要一个一个引用插件了。

当`plugins`目录下只有埋点插件的时候，打包的时候就是一个只带埋点功能的基础SDK；

当`plugins`目录下放了所有插件的时候，打包的时候会自动全部引入，就变成一个包含全量插件的SDK。

### plugins.es5.ts

因为打包es5的时候不支持es6的那种import语法，所以只能逐个引入插件。

当只引用了埋点插件的时候，打包的时候就是一个只带埋点功能的基础SDK。

### plugins.es5.full.ts

因为打包es5的时候不支持es6的那种import语法，所以只能逐个引入插件。

当引用了所有埋点插件的时候，打包的时候就是一个包含全量插件的SDK。

## 打包命令说明

执行build命令的时候，会按 `基础es6 SDK -> 全量es6 SDK -> 基础es5 SDK -> 全量es5 SDK` 的顺序进行打包。

每执行打包一种类型的包时，都会用上述的文件替换`plugin.ts`，默认情况下`plugin.ts`就是es6版本的文件。
