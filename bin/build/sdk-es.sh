# 移除已有产物文件
rm dist/*

# 打包基础SDK
NODE_ENV=production rollup -c rollup.config.js --es

# 打包全量插件版SDK
NODE_ENV=production rollup -c rollup.config.js --es-full
