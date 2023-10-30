// @ts-nocheck
import { babel } from '@rollup/plugin-babel';
import * as packageJson from './package.json';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import path from 'path';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const NAME = {
  cdp: 'gdp',
  saas: 'gio'
};

const processPlatform = process.argv[process.argv.length - 1]
  .split('-')
  .filter((o) => o);

// 获取命令指定的打包环境
const gioEnvironment = 'cdp';
// 获取打包es版本(es5/es6)
const ESVersion = ['es5', 'es6'].includes(processPlatform[1])
  ? processPlatform[1]
  : 'es6';
// 获取是否打包全量插件
const packageFull = processPlatform[2] === 'full';
// 获取优先的格式名（优先的格式名为默认cdp.js，非优先的为cdp.格式.js）
const formatPriority = processPlatform[3];
// 控制台打印当前打包的环境
console.log(
  `[GioEnvironment]：${gioEnvironment} [ESVersion]：${ESVersion} [Full]：${packageFull} [FormatPriority]：${formatPriority}`
);

const configGenerat = (format) => ({
  input: `src/${gioEnvironment}/index.ts`,
  output: {
    file: `dist/${gioEnvironment}/${NAME[gioEnvironment]}${packageFull ? '-full' : ''
      }${ESVersion === 'es5' ? '-es5' : ''}.${format === formatPriority ? '' : format + '.'
      }js`,
    format,
    name: NAME[gioEnvironment]
  },
  plugins: [
    replace({
      __SDK_VERSION__: packageJson[`${gioEnvironment}Version`] || '0.0.1',
      __GIO_ENVIRONMENT__: gioEnvironment,
      'import.meta.vitest': undefined
    }),
    alias({
      entries: {
        '@': path.resolve(__dirname, 'src')
      }
    }),
    resolve(),
    commonjs({ extensions: ['.js', '.ts'] }),
    typescript({ compilerOptions: { target: ESVersion } }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.ts', '.js', '.json']
    }),
    terser({
      ecma: ESVersion,
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

const config = ['es', 'umd'].map((o) => configGenerat(o));

export default config;
