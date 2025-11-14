/**
 * @fileoverview TypeScript 类型定义聚合脚本
 * 
 * 该脚本负责将构建过程中生成的各个模块的 .d.ts 类型定义文件
 * 聚合到一个单独的文件中，以便于分发和使用。
 * 
 * 脚本执行流程：
 * 1. 遍历指定目录中的所有 .d.ts 文件
 * 2. 提取并合并类型定义内容
 * 3. 处理类型定义内容（移除 import 语句等）
 * 4. 生成聚合的类型定义文件
 * 5. 清理已处理的目录中的类型文件
 */

const fs = require('fs');
const path = require('path');

// =============================================================================
// 配置常量
// =============================================================================

/**
 * 定义要保留的插件目录（不合并这些目录中的类型）
 * 这些目录中的类型定义会保持独立，不会被合并到聚合文件中
 */
const PLUGIN_DIRS = ['adapters', 'plugins', 'extraPlugins'];

/**
 * 定义要合并的目录
 * 这些目录中的类型定义会被合并到聚合文件中
 */
const MERGE_DIRS = ['core', 'types', 'constants', 'utils'];

// =============================================================================
// 工具函数
// =============================================================================

/**
 * 递归读取目录中的类型定义文件内容
 * 
 * @param {string} dirPath - 要读取的目录路径
 * @param {string} relativePath - 相对于源目录的路径（用于注释）
 * @returns {string} 收集的类型定义内容
 */
function readTypesFromDir(dirPath, relativePath) {
  let content = '';
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 递归处理子目录
      content += readTypesFromDir(filePath, `${relativePath}/${file}`);
    } else if (file.endsWith('.d.ts')) {
      // 读取 .d.ts 文件内容
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        if (fileContent.trim() !== '') {
          // 添加文件来源注释和内容
          content += `// From ${relativePath}/${file}\n${fileContent}\n`;
        }
      } catch (e) {
        console.warn(`Warning: Could not read ${filePath}`, e.message);
      }
    }
  });

  return content;
}

/**
 * 处理类型定义内容，清理不需要的语句并标准化格式
 * 
 * @param {string} content - 原始类型定义内容
 * @returns {string} 处理后的类型定义内容
 */
function processTypeContent(content) {
  // 移除所有 import 语句（因为我们要把所有内容都放到一个文件里）
  content = content.replace(/import\s+.*\s+from\s+['"][^'"]+['"];\n/g, '');

  // 保留并透传导出语句，避免破坏类型的模块导出
  // 移除类型导入语句 (type { ... } from '...')，这些在聚合文件中不需要
  content = content.replace(
    /^type\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];\n/gm,
    ''
  );

  // 修复不完整的接口定义（如 types/internal/page.d.ts 的问题）
  content = content.replace(
    /(\/\/ From types\/internal\/page\.d\.ts\n)(\s*\n\s*[a-zA-Z_$][a-zA-Z0-9_$]*:\s*[^\n]+\n)+\s*}/g,
    (match, comment, properties) => {
      return `${comment}export interface PageType {\n${properties}}`;
    }
  );

  // 修复其他可能的格式问题
  content = content.replace(/^\s*\}\s*$/gm, '}');

  // 确保所有接口定义格式正确（如果出现匿名接口，提供占位名）
  content = content.replace(
    /^\s*interface\s+\{\s*$/gm,
    'export interface FixedInterface {'
  );

  // 移除所有默认导出，避免聚合文件出现多个默认导出
  content = content.replace(/^export\s+default\s+[^\n]+;$/gm, '');

  // 将默认导出的接口改为具名导出
  content = content.replace(
    /export\s+default\s+interface\s+([A-Za-z_$][A-Za-z0-9_$]*)/g,
    'export interface $1'
  );

  // 为未导出的顶级声明补充导出关键字
  content = content.replace(
    /^(?!export\s)(interface\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\{)/gm,
    'export $1'
  );
  content = content.replace(
    /^(?!export\s)(type\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=)/gm,
    'export $1'
  );
  content = content.replace(
    /^(?!export\s)(class\s+[A-Za-z_$][A-Za-z0-9_$]*)/gm,
    'export $1'
  );
  content = content.replace(
    /^(?!export\s)(enum\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\{)/gm,
    'export $1'
  );
  // 为带有 declare 的顶级声明补充导出关键字
  content = content.replace(
    /^(?!export\s)(declare\s+interface\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\{)/gm,
    'export $1'
  );
  content = content.replace(
    /^(?!export\s)(declare\s+type\s+[A-Za-z_$][A-Za-z0-9_$]*\s*=)/gm,
    'export $1'
  );
  content = content.replace(
    /^(?!export\s)(declare\s+class\s+[A-Za-z_$][A-Za-z0-9_$]*)/gm,
    'export $1'
  );
  content = content.replace(
    /^(?!export\s)(declare\s+enum\s+[A-Za-z_$][A-Za-z0-9_$]*\s*\{)/gm,
    'export $1'
  );
  content = content.replace(
    /^(?!export\s)(declare\s+const\s+[A-Za-z_$][A-Za-z0-9_$]*)/gm,
    'export $1'
  );
  content = content.replace(
    /^(?!export\s)(declare\s+function\s+[A-Za-z_$][A-Za-z0-9_$]*)/gm,
    'export $1'
  );

  return content;
}

/**
 * 递归删除目录中的类型定义文件和空目录
 * 
 * @param {string} dirPath - 要清理的目录路径
 */
function deleteTypesFromDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // 递归处理子目录
      deleteTypesFromDir(filePath);
    } else if (file.endsWith('.d.ts') || file.endsWith('.d.ts.map')) {
      // 删除类型定义文件
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn(`Warning: Could not delete ${filePath}`, e.message);
      }
    }
  });

  // 尝试删除空目录（但不要删除插件目录）
  const dirName = path.basename(dirPath);
  if (!PLUGIN_DIRS.includes(dirName)) {
    try {
      // 检查目录是否为空
      const remainingFiles = fs.readdirSync(dirPath);
      if (remainingFiles.length === 0) {
        // 删除空目录
        fs.rmdirSync(dirPath);
      } else {
        // 如果目录不为空但不在插件目录列表中，递归删除整个目录树
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
    } catch (e) {
      console.warn(`Warning: Could not remove directory ${dirPath}`, e.message);
    }
  }
}

/**
 * 删除插件目录中的所有类型定义文件
 * 
 * @param {string} distDir - dist 目录路径
 */
function deletePluginTypes(distDir) {
  // 删除插件目录中的所有类型定义文件
  PLUGIN_DIRS.forEach((dir) => {
    const dirPath = path.join(distDir, dir);
    if (fs.existsSync(dirPath)) {
      deleteTypesFromDir(dirPath);
    }
  });

  // 直接删除 adapters 和 extraPlugins 目录
  const adaptersDir = path.join(distDir, 'adapters');
  const extraPluginsDir = path.join(distDir, 'extraPlugins');

  [adaptersDir, extraPluginsDir].forEach((dirPath) => {
    if (fs.existsSync(dirPath)) {
      try {
        fs.rmSync(dirPath, { recursive: true, force: true });
      } catch (e) {
        console.warn(`Warning: Could not remove directory ${dirPath}`, e.message);
      }
    }
  });
}

/**
 * 检查是否在插件构建环境中
 * 
 * @returns {boolean} 是否在插件构建环境中
 */
function isPluginBuild() {
  // 检查环境变量或命令行参数
  const args = process.argv;
  return args.some(
    (arg) =>
      arg.includes('plugins') ||
      arg.includes('adapters') ||
      arg.includes('extraPlugins')
  );
}

/**
 * 检查是否有需要合并的类型文件
 * 
 * @param {string} distDir - dist 目录路径
 * @returns {boolean} 是否有需要合并的类型文件
 */
function hasTypeFilesToMerge(distDir) {
  for (const dir of MERGE_DIRS) {
    const dirPath = path.join(distDir, dir);
    if (fs.existsSync(dirPath)) {
      // 检查目录中是否有 .d.ts 文件
      const hasDtsFiles = fs
        .readdirSync(dirPath)
        .some(
          (file) =>
            file.endsWith('.d.ts') ||
            (fs.statSync(path.join(dirPath, file)).isDirectory() &&
              fs
                .readdirSync(path.join(dirPath, file))
                .some((subfile) => subfile.endsWith('.d.ts')))
        );
      if (hasDtsFiles) {
        return true;
      }
    }
  }
  return false;
}

// =============================================================================
// 主函数
// =============================================================================

/**
 * 主函数：合并类型定义
 * 
 * 执行类型定义聚合的主要流程
 */
function mergeTypes() {
  const distDir = path.join(__dirname, '../dist');

  // 如果不是 ES 格式构建，直接返回
  if (process.argv[2] !== '--es') {
    console.log('Not ES format build, skipping type merging...');
    return;
  }

  // 如果是插件构建且没有类型文件需要合并，则跳过
  if (isPluginBuild() && !hasTypeFilesToMerge(distDir)) {
    console.log(
      'Plugin build detected and no type files to merge, skipping type merging...'
    );
    return;
  }

  console.log('Merging type definitions...');

  // 创建聚合类型定义文件的内容
  let mainTypes = `/* Generated types aggregation file */\n\n`;

  // 遍历需要合并的目录
  let hasContent = false;
  MERGE_DIRS.forEach((dir) => {
    const dirPath = path.join(distDir, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`Processing types from ${dir} directory...`);
      const dirContent = readTypesFromDir(dirPath, dir);
      if (dirContent.trim() !== '') {
        mainTypes += `// Types from ${dir} directory\n${dirContent}\n`;
        hasContent = true;
      }
    }
  });

  // 如果没有内容要合并，则不创建文件
  if (!hasContent) {
    console.log('No type definitions to merge, skipping...');
    return;
  }

  // 处理类型定义内容（移除 import 语句等）
  mainTypes = processTypeContent(mainTypes);

  // 写入聚合类型文件
  const outputPath = path.join(distDir, 'main.d.ts');
  fs.writeFileSync(outputPath, mainTypes);
  console.log(`Main types written to ${outputPath}`);

  // 删除已合并的目录中的类型文件
  MERGE_DIRS.forEach((dir) => {
    const dirPath = path.join(distDir, dir);
    if (fs.existsSync(dirPath)) {
      deleteTypesFromDir(dirPath);
    }
  });

  // 删除插件目录中的类型文件
  deletePluginTypes(distDir);

  console.log('Type merging completed.');
}

// =============================================================================
// 程序入口
// =============================================================================

// 执行合并
mergeTypes();
