# GrowingIO Web SDK TypeScript 指南

本文档介绍了如何在TypeScript项目中使用GrowingIO Web SDK的类型定义，以获得更好的类型检查和智能提示体验。本文档已适配严格模式：方法名与参数严格匹配、支持带前缀的方法名、初始化配置项类型收紧。

## 目录

1. [安装](#安装)
2. [导入类型定义](#导入类型定义)
3. [严格模式说明](#严格模式说明)
4. [用户API类型](#用户api类型推荐使用)
5. [内部类型高级使用](#内部类型高级使用)
6. [实际使用示例](#实际使用示例)
7. [初始化配置项详解](#初始化配置项详解)
8. [最佳实践](#最佳实践)
9. [故障排除](#故障排除)

## 安装

```bash
npm install gio-web-autotracker
```

## 导入类型定义

GrowingIO Web SDK提供了多种方式导入类型定义：

### 1. 从主包导入（推荐）

```typescript
// 直接从主包导入类型定义
import type { InitOptions, GrowingIO, EventAttributes } from 'gio-web-autotracker';
```

### 2. 从类型子目录导入

```typescript
// 从类型子目录导入
import type { InitOptions, GrowingIO, EventAttributes } from 'gio-web-autotracker/types';
```

### 3. 按需导入特定类型

```typescript
// 只导入需要的类型
import type { InitOptions } from 'gio-web-autotracker';
import type { EventAttributes } from 'gio-web-autotracker/types';
```

## 用户API类型（推荐使用）

这些是用户在日常开发中最常使用的类型：

### 配置相关
- `InitOptions`: 初始化配置选项
- `PageAttributes`: 页面属性
- `UserAttributes`: 用户属性
- `EventAttributes`: 事件属性

### 参数相关
- `TrackEventParams`: 埋点事件参数
- `TimerEventParams`: 计时器事件参数

### 回调相关
- `ABTestCallback`: A/B测试回调函数
- `CommonCallback`: 通用回调函数
- `BeforeSendListener`: 发送前拦截回调函数
- `PageListenerCallback`: 页面监听回调函数

### SDK实例
- `Gdp`: 默认导出类型

## 内部类型（二开高级使用）

这些是SDK内部使用的类型，通常在高级定制或插件开发中使用：

### 核心类型
- `GrowingIOType`: 核心GrowingIO实例类型

### 插件相关
- `PluginItem`: 插件项类型
- `PluginsType`: 插件管理器类型

### 配置相关
- `OriginOptions`: 原始配置选项
- `UserOptions`: 用户配置选项
- `DataStoreType`: 数据存储类型
- `StorageKeyType`: 存储键类型

### 存储相关
- `StorageType`: 存储类型
- `UploaderType`: 上传器类型
- `UserStoreType`: 用户存储类型
- `PageType`: 页面类型

### 事件相关
- `EVENT_TYPES`: 事件类型枚举
- `EVENT`: 事件基础类型
- `EXTEND_EVENT`: 扩展事件类型

### 插件特定类型

GrowingIO SDK为每个插件提供了专门的类型定义，这些类型定义位于每个插件目录下的`types.ts`文件中：

- `ABTestOptions`, `ABTestData`, `ABTestCallback`: AB测试插件类型
- `CompressOptions`, `CompressContextDictionary`, `CompressContext`: 数据加密插件类型
- `EventTypeMap`, `TouchHandlerConfig`, `NodeInfo`, `EventAutoTrackingOptions`: 无埋点插件类型
- `HybridAdapterOptions`, `HybridNodeInfo`, `HybridEventData`, `BridgeCallback`, `BridgeErrorCallback`: Hybrid打通插件类型
- `ImpressionTrackingOptions`, `ImpressionElementInfo`, `ImpressionEventData`, `ObserverConfig`, `ImpressionTrackCallback`: 半自动浏览埋点插件类型
- `MultipleInstancesOptions`, `SubInstanceConfig`, `SubInstanceInfo`, `MultipleInstanceEventData`, `InstanceType`, `MultipleInstancesManager`: 多实例插件类型
- `PerformanceOptions`, `NetworkPerformanceOptions`, `PerformanceMetrics`, `MemoryInfo`, `NavigationTiming`, `NetworkRequestInfo`, `ExceptionInfo`, `PerformanceEventData`, `GioXMLHttpRequest`: 性能采集插件类型
- `GQS`, `CustomerQS`, `EmbeddedStorageType`: 小程序内嵌页适配插件类型

## 实际使用示例

### 1. 初始化SDK

```typescript
import type { InitOptions } from 'gio-web-autotracker';

// 方式一：使用配置对象
const initConfig: InitOptions = {
  projectId: 'your_project_id',
  dataSourceId: 'your_data_source_id',
  appId: 'your_app_id',
  serverUrl: 'https://napi.growingio.com',
  debug: true,
  trackPage: true
};

gdp('init', 'your_project_id', 'your_data_source_id', initConfig);
```

### 2. 发送自定义事件

```typescript
import type { EventAttributes, CommonCallback } from 'gio-web-autotracker';

const sendCustomEvent = (eventName: string, properties: EventAttributes, callback?: CommonCallback) => {
  gdp('track', eventName, properties, callback);
};

sendCustomEvent('button_click', {
  button_id: 'submit_btn',
  page_name: 'checkout'
}, () => {
  console.log('Event sent successfully');
});
```

### 3. 设置用户属性

```typescript
import type { UserAttributes } from 'gio-web-autotracker';

const setUserProps = (attributes: UserAttributes) => {
  gdp('setUserAttributes', attributes);
};

setUserProps({
  user_level: 'premium',
  subscription_type: 'monthly'
});
```

### 4. 插件开发

```typescript
import type { PluginItem, GrowingIO } from 'gio-web-autotracker';

const myPlugin: PluginItem = {
  name: 'MyCustomPlugin',
  method: (growingIO: GrowingIO) => {
    // 插件实现
    console.log('Plugin initialized with SDK version:', growingIO.sdkVersion);
  }
};

// 注册插件
gdp('registerPlugins', [myPlugin]);
```

## 初始化配置项详解

### 必填配置项（严格校验）
- `projectId`: 项目ID
- `dataSourceId`: 数据源ID

### 可选配置项
- `appId`: 应用ID
- `autotrack`: 是否开启无埋点，默认为true
- `debug`: 是否开启调试模式，默认为false
- `serverUrl`: 数据上报域名
- `trackPage`: 是否自动采集页面访问事件，默认为true
- `version`: 应用版本号（严格格式）形如 `1.0.0`

### 高级配置项（严格校验）
- `compress`: 是否开启数据加密压缩，默认为true
- `dataCollect`: 是否开启数据采集，默认为true
- `forceLogin`: 是否开启强制登录，默认为false
- `idMapping`: 是否开启多身份认证
- `performance`: 性能采集配置，其中 `network.exclude` 为 `RegExp | string | Array<RegExp | string>`
- `platform`: 所属平台，可选值包括'web', 'wxwv', 'Android', 'iOS'等

## 详细类型说明

### 1. 初始化配置 (InitOptions)

```typescript
import type { InitOptions } from 'gio-web-autotracker';

// 完整的初始化配置示例
const initOptions: InitOptions = {
  projectId: 'your_project_id',
  dataSourceId: 'your_data_source_id',
  appId: 'your_app_id',
  serverUrl: 'https://your-server-url.com',
  debug: true,
  trackPage: true,
  autotrack: true,
  // 其他可选配置...
};

// 类型安全的初始化
gdp('init', 'your_project_id', 'your_data_source_id', initOptions);
```

### 2. 事件属性 (EventAttributes)

```typescript
import type { EventAttributes } from 'gio-web-autotracker';

const eventProps: EventAttributes = {
  category: 'user_action',
  label: 'button_click',
  value: 1
};

gdp('track', 'custom_event', eventProps);
```

## 最佳实践

1. **使用类型导入**: 使用 `import type` 语法导入仅用于类型检查的定义
2. **配置检查**: 利用 TypeScript 的类型检查来避免配置错误
3. **函数参数验证**: 使用类型定义确保函数参数的正确性
4. **初始化参数**: 确保必填的projectId和dataSourceId正确传递
5. **始终使用类型**: 在开发插件和高级功能时，充分利用类型定义

## 故障排除

如果遇到类型定义问题，请确保：

1. 使用最新版本的 gio-web-autotracker
2. 直接从主包导入类型定义，无需额外路径
3. 检查是否有冲突的类型定义
4. 在严格模式下，多实例请使用前缀方法名（如 `g0.track`）而不是在参数中传递 `trackingId`
5. 确保初始化时正确传递 `projectId` 和 `dataSourceId` 参数
6. 正确配置 TypeScript 编译器选项

错误示例与指引：
- `gdp('setUserId', 111)`：`userId` 需要 `string`，请改为 `gdp('g0.setUserId', 'uid-xxx')`
- `gdp('g0.track', 111, { aa: 11 })`：事件名需要 `string`，请改为 `gdp('g0.track', 'event_xxx', { aa: 11 })`
