### 准备操作

# 移除已有产物文件
# rm -r dist/cdp/*

### es6版基础SDK
# 打包基础SDK es6
NODE_ENV=production rollup -c rollup.config.js --cdp-es6-simple-umd

### es5版基础SDK
# 打包基础SDK es5
NODE_ENV=production rollup -c rollup.config.js --cdp-es5-simple-umd

# 复制基础版入口文件并备份
cp src/core/plugins.ts src/core/plugins.ts.bak

### es6版全插件SDK
# 复制全量版入口文件
cp src/core/plugins.full.ts src/core/plugins.ts
# 打包全量插件版SDK es6
NODE_ENV=production rollup -c rollup.config.js --cdp-es6-full-umd


### es5版全插件SDK
# 复制全量版入口文件
cp src/core/plugins.full.ts src/core/plugins.ts
# 打包全量插件版SDK es6
NODE_ENV=production rollup -c rollup.config.js --cdp-es5-full-umd


### 结束操作
# 恢复基础版入口文件
cp src/core/plugins.ts.bak src/core/plugins.ts
rm src/core/plugins.ts.bak
