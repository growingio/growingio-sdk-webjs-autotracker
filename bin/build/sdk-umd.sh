# 移除已有产物文件
rm dist/*

### 基础SDK
# 打包基础SDK
NODE_ENV=production rollup -c rollup.config.js --umd

# 复制基础版入口文件并备份
cp src/core/plugins.ts src/core/plugins.ts.bak

### 全插件SDK
# 复制全量版入口文件
cp src/core/plugins.full.ts src/core/plugins.ts
# 打包全量插件版SDK
NODE_ENV=production rollup -c rollup.config.js --umd-full

### 结束操作
# 恢复基础版入口文件
cp src/core/plugins.ts.bak src/core/plugins.ts
rm src/core/plugins.ts.bak
