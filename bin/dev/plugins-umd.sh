# 清空原产物
rm -r dist/plugins/*

# 打包插件
NODE_ENV=production rollup -c rollup.plugins.config.js -w --umd-plugins
