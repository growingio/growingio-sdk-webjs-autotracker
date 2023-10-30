# 清空原产物
rm -r dist/cdp/plugins/*

# 打包插件
NODE_ENV=production rollup -c rollup.plugins.config.js --es5-es

# 复制一份给发npm包的时候用
mkdir -p dist/cdp_npm/plugins
cp -r dist/cdp/plugins/* dist/cdp_npm/plugins/
