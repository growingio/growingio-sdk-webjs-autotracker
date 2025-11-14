import { babel } from '@rollup/plugin-babel';
import * as packageJson from './package.json' assert { type: 'json' };
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import fs from 'fs';
import path from 'path';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

/**
 * 解析命令行环境变量
 * 从 --environment 参数中提取 formatPriority（构建格式优先级）和 folderParam（文件夹参数）
 *
 * @returns {Object} 包含 formatPriority 和 folderParam 的对象
 *   - formatPriority: 构建格式优先级 ('umd' 或 'es')
 *   - folderParam: 文件夹参数 ('all', 'plugins', 'adapters', 'extraPlugins' 或自定义数组)
 */
const parseEnvironmentVariables = () => {
  let formatPriority = 'umd'; // 默认构建格式为UMD
  let folderParam = 'all'; // 默认构建所有插件文件夹

  // 检查是否存在 --environment 参数（分开传递的情况）
  const envArgIndex = process.argv.indexOf('--environment');
  if (envArgIndex !== -1 && envArgIndex + 1 < process.argv.length) {
    // 从参数中提取格式优先级和文件夹参数
    const envParams = process.argv[envArgIndex + 1].split(',');
    formatPriority = envParams[0];
    folderParam = envParams[1] || 'all';
  } else {
    // 检查是否存在 --environment=xxx 格式的参数（合并传递的情况）
    const envArg = process.argv.find((arg) => arg.startsWith('--environment='));
    if (envArg) {
      // 从合并参数中提取格式优先级和文件夹参数
      const envParams = envArg.split('=')[1].split(',');
      formatPriority = envParams[0];
      folderParam = envParams[1] || 'all';
    }
  }

  return { formatPriority, folderParam };
};

/**
 * 获取指定文件夹下的插件列表
 *
 * @param {string} folderPath - 文件夹路径
 * @returns {Array<string>} 插件名称列表
 */
const getPluginList = (folderPath) => {
  try {
    return fs.readdirSync(folderPath);
  } catch (error) {
    console.warn(`Warning: Could not read directory ${folderPath}`);
    return [];
  }
};

/**
 * 过滤有效的插件名称
 * 移除无效的文件和目录名称
 *
 * @param {Array<string>} pluginList - 原始插件列表
 * @returns {Array<string>} 过滤后的有效插件列表
 */
const filterValidPlugins = (pluginList) => {
  // 无效的文件/目录名称列表
  const invalidNames = [
    'README.md',
    '.idea',
    '.vscode',
    '.hbuilderx',
    '.DS_Store'
  ];
  return pluginList.filter(
    (pluginName) =>
      pluginName &&
      !invalidNames.includes(pluginName) &&
      pluginName !== '.DS_Store'
  );
};

/**
 * 创建单个插件的配置对象
 *
 * @param {string} folder - 插件所在文件夹名称
 * @param {string} pluginName - 插件名称
 * @param {string} formatPriority - 构建格式优先级
 * @returns {Object} 插件配置对象
 */
const createPluginConfig = (folder, pluginName, formatPriority) => {
  const fileName = `${pluginName}.js`;
  return {
    // 插件所在文件夹
    folder,
    // 输入文件路径（根据格式优先级选择对应的TS文件）
    input: `${pluginName}/index.${formatPriority}.ts`,
    // 输出文件路径
    output: `${folder}/${fileName}`,
    // 输出文件名
    name: fileName,
    // 输出格式
    format: formatPriority
  };
};

/**
 * 处理文件夹数组，为每个文件夹中的插件生成配置
 *
 * @param {Array<string>} folderArray - 文件夹名称数组
 * @param {string} formatPriority - 构建格式优先级
 * @returns {Array<Object>} 插件配置数组
 */
const processFolderArray = (folderArray, formatPriority) => {
  const configs = [];

  folderArray.forEach((realFolder) => {
    // 获取文件夹中的插件列表
    const pluginList = getPluginList(`./src/${realFolder}`);
    // 过滤有效插件
    const validPlugins = filterValidPlugins(pluginList);

    // 为每个有效插件创建配置
    validPlugins.forEach((pluginName) => {
      configs.push(createPluginConfig(realFolder, pluginName, formatPriority));
    });
  });

  return configs;
};

/**
 * 处理单个文件夹，为其中的插件生成配置
 *
 * @param {string} folder - 文件夹名称
 * @param {string} formatPriority - 构建格式优先级
 * @returns {Array<Object>} 插件配置数组
 */
const processSingleFolder = (folder, formatPriority) => {
  // 获取文件夹中的插件列表
  const pluginList = getPluginList(`./src/${folder}`);
  // 过滤有效插件
  const validPlugins = filterValidPlugins(pluginList);
  const configs = [];

  // 为每个有效插件创建配置
  validPlugins.forEach((pluginName) => {
    configs.push(createPluginConfig(folder, pluginName, formatPriority));
  });

  return configs;
};

// 获取环境变量配置
const { formatPriority, folderParam } = parseEnvironmentVariables();
// 处理特殊文件夹参数 'extra'，将其映射为适配器和额外插件的数组
const folder =
  folderParam === 'extra' ? ['adapters', 'extraPlugins'] : folderParam;

// 控制台打印当前打包的环境信息
console.log(
  `Packaging Format ${formatPriority === 'es' ? 'esm' : 'umd'}; Folder ${Array.isArray(folder) ? folder.join(', ') : folder}`
);

// 生成插件配置列表
const pluginConfigs = [];
if (Array.isArray(folder)) {
  // 处理文件夹数组（如 ['adapters', 'extraPlugins']）
  pluginConfigs.push(...processFolderArray(folder, formatPriority));
} else if (folder === 'all') {
  // 处理所有插件文件夹
  pluginConfigs.push(
    ...processFolderArray(
      ['plugins', 'adapters', 'extraPlugins'],
      formatPriority
    )
  );
} else {
  // 处理单个文件夹
  pluginConfigs.push(...processSingleFolder(folder, formatPriority));
}

/**
 * 创建Rollup配置对象
 *
 * @param {Object} pluginConfig - 插件配置对象
 * @param {string} pluginConfig.folder - 插件所在文件夹
 * @param {string} pluginConfig.input - 输入文件路径
 * @param {string} pluginConfig.output - 输出文件路径
 * @param {string} pluginConfig.name - 输出文件名
 * @param {string} pluginConfig.format - 输出格式
 * @returns {Object} Rollup配置对象
 */
const createRollupConfig = ({ folder, input, output, name, format }) => ({
  // 输入文件路径
  input: `src/${folder}/${input}`,

  // 输出配置
  output: {
    // 输出文件路径
    file: `dist/${output}`,
    // 输出格式
    format,
    // 全局变量名（UMD格式使用）
    name,
    // 根据是否为watch模式决定是否生成source map文件，dev模式（watch模式）生成sourcemap，build模式不生成
    sourcemap: process.argv.includes('-w') || process.argv.includes('--watch')
  },

  // 插件配置
  plugins: [
    // 替换源代码中的占位符
    replace({
      // 替换插件版本号占位符
      __PLUGIN_VERSION__: packageJson.version || '0.0.1',
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
    commonjs(),

    // TypeScript编译插件（插件不生成类型定义文件）
    typescript({
      compilerOptions: {
        // 编译目标为ES5
        target: 'es5',
        // 不生成声明文件
        declaration: false,
        // 不生成声明映射文件
        declarationMap: false,
        // 不启用复合模式
        composite: false,
        // 不只生成声明文件
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
      extensions: ['.ts']
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

// 生成最终配置数组
// 1. 过滤掉空值配置
// 2. 为每个有效配置创建Rollup配置对象
const configs = pluginConfigs
  .filter((config) => config) // 过滤掉空值
  .map(createRollupConfig);

// 导出Rollup配置数组
export default configs;
