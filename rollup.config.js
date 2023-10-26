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

const processENV = process.argv[process.argv.length - 1]
  .split('-')
  .filter((o) => o);

// 获取优先的格式名（优先的格式名为默认gdp.js，非优先的为gdp.格式.js）
const formatPriority = processENV[0];
// 获取是否打包全量插件
const packageFull = processENV[1] === 'full';
// 控制台打印当前打包的环境
console.log(
  `Packaging Format ${formatPriority === 'es' ? 'esm' : 'umd'
  }; Package ${packageFull ? 'Full' : 'Base'}`
);
const configGenerat = (format) => ({
  input: 'src/index.ts',
  output: {
    file: `dist/gdp${packageFull ? '-full' : ''}.${format === formatPriority ? '' : format + '.'}js`,
    format,
    name: 'gdp'
  },
  plugins: [
    replace({
      __SDK_VERSION__: packageJson.version || '0.0.1'
    }),
    alias({
      entries: {
        '@': path.resolve(__dirname, 'src')
      }
    }),
    resolve(),
    commonjs({ extensions: ['.js', '.ts'] }),
    typescript({ compilerOptions: { target: 'es5' } }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.ts', '.js', '.json']
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

const config = ['es', 'umd'].map((o) => configGenerat(o));

export default config;
