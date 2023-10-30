import { babel } from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import path from 'path';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

const fs = require('fs');
const argvs = process.argv[process.argv.length - 1].split('-');
// 获取优先的格式名（优先的格式名为默认cdp.js，非优先的为cdp.格式.js）
const formatPriority = argvs[3];

const expls = [];
const plgs = fs.readdirSync('./src/plugins');
plgs.forEach((pluginName) => {
  ['umd', 'es'].forEach((format) => {
    const fileName = `${pluginName}.js`;
    expls.push({
      input: `${pluginName}/index.${format}.ts`,
      output: `cdp/plugins${format === formatPriority ? '' : `/${format}`
        }/${fileName}`,
      name: fileName,
      format
    });
  });
});

const configs = [];
const configGenerat = ({ input, output, name, format }) => ({
  input: `src/plugins/${input}`,
  output: {
    file: `dist/${output}`,
    format,
    name
  },
  plugins: [
    replace({
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
