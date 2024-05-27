import * as packageJson from './package.json';
import { babel } from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import path from 'path';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const fs = require('fs');
const processENV = process.argv[process.argv.length - 1]
  .split('-')
  .filter((o) => o);

// 获取优先的格式名（优先的格式名为默认gdp.js，非优先的为gdp.格式.js）
const formatPriority = processENV[0];
// 获取是否打包全量插件
const folder = processENV[1] ?? 'all';
// 控制台打印当前打包的环境
console.log(
  `Packaging Format ${formatPriority === 'es' ? 'esm' : 'umd'
  }; Folder ${folder}`
);

const expls = [];
const plgs = fs
  .readdirSync(`./src/${folder}`)
  .filter((o) => !['README.md', '.idea', '.vscode', '.hbuilderx', '.DS_Store'].includes(o));
plgs.forEach((pluginName) => {
  if (pluginName !== '.DS_Store') {
    ['umd', 'es'].forEach((format) => {
      const fileName = `${pluginName}.js`;
      expls.push({
        folder,
        input: `${pluginName}/index.${format}.ts`,
        output: `${folder}${format === formatPriority ? '' : `/${format}`}/${fileName}`,
        name: fileName,
        format
      });
    });
  }
});

const configs = [];
const configGenerat = ({ folder, input, output, name, format }) => ({
  input: `src/${folder}/${input}`,
  output: {
    file: `dist/${output}`,
    format,
    name
  },
  plugins: [
    replace({
      __PLUGIN_VERSION__: packageJson.version || '0.0.1',
      'import.meta.vitest': undefined
    }),
    alias({
      entries: {
        '@': path.resolve(__dirname, 'src')
      }
    }),
    resolve(),
    commonjs(),
    typescript({ compilerOptions: { target: 'es5' } }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.ts']
    }),
    terser({
      ecma: 'es5',
      format: { comments: false },
      compress: {
        passes: 2,
        unsafe: true,
        unsafe_comps: true,
        unsafe_proto: true,
        unsafe_undefined: true
      }
    }),
    filesize({
      showMinifiedSize: false,
      showGzippedSize: false
    })
  ]
});
expls.forEach((o) => {
  if (o) configs.push(configGenerat(o));
});

export default configs;
