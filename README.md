GrowingIO WebJS SDK (GrowingIO WebJS Autotracker)
======

![GrowingIO](https://www.growingio.com/vassets/images/home_v3/gio-logo-primary.svg)

# Web/H5/小程序内嵌页/Hybrid数据采集 SDK
## 简介

GrowingIO Web/H5/小程序内嵌页/Hybrid数据采集SDK，专为现代Web应用设计的数据采集解决方案。

### 核心特性

- 🎯 **无埋点能力** - 自动采集用户行为事件，支持开关和插件控制
- 🎨 **埋点能力** - 开发者可调用API主动采集自定义事件
- 👁️ **曝光追踪** - 支持半自动曝光事件采集
- 📦 **模块化设计** - 可依据使用场景自由拆分SDK，优化加载体积
- 🔧 **插件系统** - 支持自定义插件开发（实验性功能）
- 🌐 **多平台支持** - Web/H5/小程序内嵌页/Hybrid一体化解决方案

## 快速开始

### 安装

```bash
npm install gio-web-autotracker
```

### 基础使用

```javascript
// 引入SDK
import gdp from 'gio-web-autotracker';

// 初始化SDK
gdp('init', 'your_project_id', 'your_data_source_id', {
  appId: 'your_app_id',
  debug: true
});

// 发送自定义事件
gdp('track', 'g0', 'button_click', {
  button_id: 'submit_btn',
  page_name: 'checkout'
});
```

## 面向开发者的完整指南

### 📁 项目架构

```
src/
├── constants/                   # 常量定义
├── core/                        # 核心模块
│   ├── dataStore/               # 数据存储管理
│   ├── plugins/                 # 插件系统核心
│   ├── storage/                 # 存储实现
│   ├── growingIO.ts             # 主SDK实例
│   ├── uploader.ts              # 数据上传器
│   ├── userAgentManager.ts      # 增强型UserAgent管理
│   └── userStore.ts             # 用户存储管理
├── plugins/                     # 内置插件
│   ├── gioABTest/               # AB测试插件
│   ├── gioCompress/             # 数据压缩插件
│   ├── gioEmbeddedAdapter/      # 小程序内嵌页适配插件
│   ├── gioEventAutoTracking/    # 无埋点插件
│   ├── gioHybridAdapter/        # Hybrid打通插件
│   ├── gioImpressionTracking/   # 曝光追踪插件
│   ├── gioMultipleInstances/    # 多实例插件
│   └── gioPerformance/          # 性能监控插件
├── types/                       # TypeScript类型定义
│   ├── internal/                # 内部核心类型
│   ├── api.ts                   # 用户API类型
│   └── index.ts                 # 类型导出入口
└── utils/                       # 工具函数
```

### 💻 开发环境设置

#### 系统要求
- Node.js >= 14 (推荐 Node.js v20)
- 推荐使用 VSCode 开发
- 推荐使用 nvm 进行 Node.js 版本管理
- 推荐使用 pnpm 进行依赖包管理

#### 安装依赖

```bash
# 安装项目依赖
pnpm install
```

### 🚀 开发流程

#### 启动开发服务器

```bash
# 启动默认开发模式
npm run dev

# 启动ES模块开发模式
npm run dev:es

# 启动特定插件开发模式
npm run dev:plugins

# 启动插件ES模块开发模式
npm run dev:plugins-es
```

#### 构建项目

```bash
# 构建完整UMD格式SDK和扩展插件
npm run build

# 构建完整ES格式SDK和插件
npm run build:es

# 仅构建UMD格式SDK
npm run build:sdk

# 仅构建ES格式SDK
npm run build:sdk-es

# 构建普通插件（UMD格式）
npm run build:plugins

# 构建普通插件（ES格式）
npm run build:plugins-es

# 清理构建产物
npm run clean

# 清理插件构建产物
npm run clean:plugins
```

### 🔧 插件开发指南

GrowingIO SDK采用插件化架构，支持开发者创建自定义插件来扩展功能。

#### 插件结构

每个插件包含以下核心文件：
```
plugins/yourPlugin/
├── index.es.ts      # ES模块入口
├── index.umd.ts     # UMD模块入口
└── types.ts         # 插件类型定义
```

#### 基础插件模板

```typescript
/** 
 * 自定义插件示例
 */
import { GrowingIOType } from '@/types/internal/growingIO';

class CustomPlugin {
  constructor(public growingIO: GrowingIOType) {}

  /**
   * 插件安装时调用
   */
  onInstall(args: any) {
    console.log('Plugin installed', args);
  }

  /**
   * SDK初始化完成时调用
   */
  onInitialized(args: any) {
    console.log('SDK initialized', args);
  }

  /**
   * 事件组合前调用
   */
  onComposeBefore(args: any) {
    console.log('Before event composition', args);
  }

  /**
   * 事件组合后调用
   */
  onComposeAfter(args: any) {
    console.log('After event composition', args);
  }

  /**
   * 数据发送前调用
   */
  onSendBefore(args: any) {
    console.log('Before data sending', args);
  }

  /**
   * 数据发送后调用
   */
  onSendAfter(args: any) {
    console.log('After data sending', args);
  }
}

export default { 
  name: 'customPlugin', 
  method: CustomPlugin 
};
```

#### 生命周期钩子

插件支持以下生命周期钩子：

| 钩子名称 | 触发时机 | 参数 |
|---------|---------|------|
| `onInstall` | 插件安装时 | 插件配置参数 |
| `onInitialized` | SDK初始化完成时 | 初始化参数 |
| `onComposeBefore` | 事件组合前 | 事件参数 |
| `onComposeAfter` | 事件组合后 | 事件参数 |
| `onSendBefore` | 数据发送前 | 发送数据 |
| `onSendAfter` | 数据发送后 | 发送结果 |

### 📝 TypeScript 支持

SDK采用TypeScript开发，提供完整的类型定义以提升开发体验和代码质量。

#### 类型定义结构

项目中的类型定义按照功能模块组织在 `src/types/` 目录下：

```
src/types/
├── internal/           # 内部核心类型定义
│   ├── dataStore.ts     # 数据存储相关类型
│   ├── events.ts       # 事件相关类型
│   ├── growingIO.ts    # 主SDK实例类型
│   ├── page.ts         # 页面相关类型
│   ├── plugins.ts      # 插件系统类型
│   ├── storage.ts      # 存储相关类型
│   └── uploader.ts     # 数据上传相关类型
├── api.ts             # 用户API类型定义
└── index.ts           # 类型导出入口
```

#### 核心类型说明

- `GrowingIOType`: 主SDK实例的核心类型，定义了SDK的所有公共方法和属性
- `PluginItem`/`PluginsType`: 插件系统相关类型，用于插件开发和管理
- `EVENT`/`EXTEND_EVENT`: 事件数据结构类型，定义了采集事件的格式
- `InitOptions`: SDK初始化配置选项类型
- `DataStoreType`: 数据存储管理类型，包含用户和页面数据的管理方法

#### 类型构建流程

在ES格式构建时，项目会自动执行以下操作：

1. TypeScript编译器生成各模块的 `.d.ts` 类型定义文件
2. `aggregate-types.js` 脚本将核心模块的类型定义聚合到 `dist/main.d.ts` 文件中
3. 主入口文件 `dist/api.d.ts` 正确引用聚合的类型文件
4. 所有内部模块的路径引用已自动修复为相对路径
5. `scripts/fix-type-paths.js` 脚本进一步修复构建产物中的类型定义文件路径引用
6. 插件目录中的类型定义保持独立，不被合并到聚合文件中

#### 开发时类型检查

项目配置了严格的TypeScript检查规则，确保类型安全：

```bash
# 运行类型检查
npm run lint
```

查看 [TypeScript 使用指南](TYPESCRIPT_GUIDE.md) 了解更多类型定义信息。

### 代码规范

- 遵循项目现有的代码风格
- 添加适当的注释
- 确保测试通过
- 更新相关文档

## 🌐 浏览器兼容性

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Opera | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/electron/electron_48x48.png" alt="Electron" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Electron |
| --------- | --------- | --------- | --------- | --------- | --------- |
| IE10 / Edge > 15 major / Edge IE兼容模式 | > 54 major | > 51 major | > 10 major | > 38 major | > 10 major |


## 开源说明

开源的源代码移除了第三方厂商适配以及定制化开发的一些商业化内容，和自动化测试的相关代码。仅保留相对完整的SDK主要内容。

GrowingIO WebJS SDK 完全免费并开源，请注意仔细甄别。欢迎大家一起学习进步和互相帮助。

Tips：请注意开源协议。
