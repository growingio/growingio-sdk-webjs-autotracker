/**
 * @fileoverview TypeScript 类型定义路径修复脚本
 *
 * 该脚本负责修复构建产物中 TypeScript 类型定义文件的路径引用，
 * 将原本指向源代码目录的路径引用替换为指向主类型文件的相对路径。
 *
 * 脚本执行流程：
 * 1. 遍历 dist 目录中的所有 .d.ts 文件
 * 2. 查找并替换不正确的路径引用
 * 3. 将所有路径引用统一指向主类型文件
 * 4. 写回修复后的文件
 */

const fs = require('fs');
const path = require('path');

// =============================================================================
// 工具函数
// =============================================================================

/**
 * 获取目录下的所有 .d.ts 文件
 *
 * @param {string} dir - 要搜索的目录路径
 * @returns {string[]} 找到的所有 .d.ts 文件路径数组
 */
function getAllDtsFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);
  items.forEach((item) => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // 递归搜索子目录
      files.push(...getAllDtsFiles(itemPath));
    } else if (item.endsWith('.d.ts') && item !== 'main.d.ts') {
      // 排除主类型文件本身（因为它不包含原始引用）
      files.push(itemPath);
    }
  });

  return files;
}

// =============================================================================
// 主函数
// =============================================================================

/**
 * 修复构建产物中的 TypeScript 类型定义文件路径
 *
 * 将 @/types 和 ./types 路径替换为相对路径或主类型文件
 */
function fixDtsPaths() {
  const distDir = path.join(__dirname, '../dist');

  // 获取 dist 目录下的所有 .d.ts 文件
  const dtsFiles = getAllDtsFiles(distDir);

  console.log(`Found ${dtsFiles.length} .d.ts files to process`);

  // 处理每个 .d.ts 文件
  dtsFiles.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');

    // 将内容进行路径修复
    let newContent = content;

    // 将 '@/types' 引用替换为 './main'
    newContent = newContent.replace(/['"]@\/types['"]/g, `'./main'`);

    // 将 './types' 或 '../types' 等相对路径引用也替换为 './main'
    newContent = newContent.replace(/['"](\.{1,2}\/)+types['"]/g, `'./main'`);

    // 将 './types/internal/...' 等路径也替换为 './main'
    newContent = newContent.replace(
      /['"](\.{1,2}\/)+types\/internal\/[^'"]*['"]/g,
      `'./main'`
    );

    // 特别处理 api.d.ts 中的 './types/api' 引用
    if (file.endsWith('api.d.ts')) {
      newContent = newContent.replace(/['"]\.\/types\/api['"]/g, `'./main'`);
      newContent = newContent
        .replace(
          /\n?export\s+\{\s*default\s*\}\s*from\s*['"]\.\/main['"];\n?/g,
          '\n'
        )
        .replace(/\n?declare\s+const\s+gdp:[^\n]*\n?/g, '\n')
        .replace(/\n?export\s+default\s+gdp;?\n?/g, '\n')
        .replace(
          /\n*$/,
          `\ndeclare const gdp: import('./main').Gdp;\nexport default gdp;\n`
        );
    }

    // 修复其他可能的 @ 路径引用 - 统一替换为主类型文件
    newContent = newContent.replace(/['"]@\/([^'"]+)['"]/g, `'./main'`);

    // 为 index.d.ts 补充默认导出的类型声明
    if (file.endsWith('index.d.ts')) {
      newContent = newContent.replace(
        /declare\s+let\s+gdp:\s*any;/,
        "declare const gdp: import('./main').GrowingIO;"
      );
    }

    // 如果文件内容发生了变化，则写回文件
    if (newContent !== content) {
      fs.writeFileSync(file, newContent);
      console.log(`Fixed paths in: ${file}`);
    }
  });
}

// =============================================================================
// 程序入口
// =============================================================================

// 执行修复
fixDtsPaths();
