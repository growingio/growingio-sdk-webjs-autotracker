import { babel } from '@rollup/plugin-babel';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import packageJson from './package.json' assert { type: 'json' };
import path from 'path';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

/**
 * 解析命令行环境变量
 * 从 --environment 参数中提取 formatPriority（构建格式优先级）
 * 默认值为 'umd'
 *
 * @returns {string} formatPriority - 构建格式优先级 ('umd' 或 'es')
 */
const parseEnvironmentVariables = () => {
  let formatPriority = 'umd'; // 默认构建格式为UMD

  // 检查是否存在 --environment 参数（分开传递的情况）
  const envArgIndex = process.argv.indexOf('--environment');
  if (envArgIndex !== -1 && envArgIndex + 1 < process.argv.length) {
    // 从参数中提取格式优先级（格式：--environment es 或 --environment umd）
    formatPriority = process.argv[envArgIndex + 1].split(',')[0];
  } else {
    // 检查是否存在 --environment=xxx 格式的参数（合并传递的情况）
    const envArg = process.argv.find((arg) => arg.startsWith('--environment='));
    if (envArg) {
      // 从合并参数中提取格式优先级（格式：--environment=es,xxx）
      formatPriority = envArg.split('=')[1].split(',')[0];
    }
  }

  return formatPriority;
};

// 获取环境变量配置
const formatPriority = parseEnvironmentVariables();
console.log('Format priority:', formatPriority);

/**
 * 创建Rollup配置对象
 *
 * @param {boolean} isFull - 是否为完整版构建（包含所有功能）
 * @param {string} format - 构建格式 ('umd' 或 'es')
 * @returns {Object} Rollup配置对象
 */
const createConfig = (isFull, format) => ({
  // 入口文件
  input: 'src/index.ts',

  // 输出配置
  output: {
    // 输出文件路径和名称
    // 如果是优先格式，则不添加格式后缀；否则添加格式后缀
    file: `dist/gdp${isFull ? '-full' : ''}${format === formatPriority ? '' : '.' + format}.js`,
    // 模块格式
    format,
    // 全局变量名（UMD格式使用）
    name: 'gdp',
    // 根据是否为watch模式决定是否生成source map文件，dev模式（watch模式）生成sourcemap，build模式不生成
    sourcemap: process.argv.includes('-w') || process.argv.includes('--watch')
  },

  // 插件配置
  plugins: [
    // 替换源代码中的占位符
    replace({
      // 替换SDK版本号占位符
      __SDK_VERSION__: packageJson.version || '0.0.1',
      // 替换插件入口文件占位符
      __GIO_PLUGIN_ENTRY__: `./plugins/plugins${isFull ? '.full' : ''}.ts`,
      // 移除测试相关的meta属性
      'import.meta.vitest': undefined,
      // 防止赋值警告
      preventAssignment: true
    }),

    // 路径别名配置
    alias({
      entries: {
        // 将 '@' 别名映射到 src 目录
        '@': path.resolve(__dirname, 'src')
      }
    }),

    // 解析node_modules中的模块
    resolve(),

    // 转换CommonJS模块为ES模块
    commonjs({
      // 处理的文件扩展名
      extensions: ['.js', '.ts'],
      // CommonJS模块默认导出处理方式
      requireReturnsDefault: 'auto'
    }),

    // TypeScript编译插件
    // 只在ES格式构建时生成类型定义文件，UMD格式不生成
    typescript({
      compilerOptions: {
        // 编译目标为ES5
        target: 'es5',
        // 是否生成声明文件（.d.ts）
        declaration: format === 'es' || formatPriority === 'es',
        // 声明文件输出目录
        declarationDir:
          format === 'es' || formatPriority === 'es' ? './dist' : undefined,
        // 是否生成声明映射文件（.d.ts.map）dev模式（watch模式）生成declarationMap，build模式不生成
        declarationMap:
          (format === 'es' || formatPriority === 'es') &&
          (process.argv.includes('-w') || process.argv.includes('--watch')),
        // 是否只生成声明文件而不生成JavaScript文件
        emitDeclarationOnly: false
      },
      // TypeScript配置文件路径
      tsconfig: './tsconfig.json'
    }),

    // Babel转换插件
    babel({
      // Babel helper函数的处理方式
      babelHelpers: 'bundled',
      // 排除node_modules目录
      exclude: 'node_modules/**',
      // 处理的文件扩展名
      extensions: ['.ts', '.js', '.json']
    }),

    // JavaScript代码压缩插件
    terser({
      // ECMAScript版本
      ecma: 'es5',
      // 格式化选项
      format: {
        // 移除注释
        comments: false
      },
      // 压缩选项
      compress: {
        // 压缩遍数
        passes: 2,
        // 启用不安全压缩选项
        unsafe: true,
        // 不安全的比较压缩
        unsafe_comps: true,
        // 不安全的原型链压缩
        unsafe_proto: true,
        // 不安全的undefined压缩
        unsafe_undefined: true
      }
    }),

    // 显示文件大小信息插件
    filesize({
      // 不显示压缩后大小
      showMinifiedSize: false,
      // 不显示gzip压缩后大小
      showGzippedSize: false
    })
  ]
});

// 导出Rollup配置
// 根据formatPriority生成两种配置：普通版和完整版
export default [formatPriority, `${formatPriority}-full`].map((type) => {
  // 分解类型字符串，例如 'es' 或 'es-full'
  const [format, suffix] = type.split('-');
  // 创建对应配置
  return createConfig(suffix === 'full', format);
});
