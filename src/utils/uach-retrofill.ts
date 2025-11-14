/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { includes } from './glodash';

/**
 * User-Agent Client Hints (UA-CH) 工具库
 *
 * 功能说明：
 * - 检测浏览器是否支持 UA-CH API
 * - 获取增强的UA字符串（包含更多设备信息）
 * - 不支持时返回空字符串，避免使用传统的 navigator.userAgent
 *
 * 使用场景：
 * - 需要获取详细的设备和浏览器信息
 * - 替代传统的 navigator.userAgent 字符串
 * - 提供更准确的设备识别能力
 */

/**
 * UA-CH 数据值接口
 * 包含从浏览器获取的详细设备和系统信息
 */
interface UADataValues {
  architecture?: string; // CPU 架构：x86, arm 等
  bitness?: string; // 系统位数：32, 64
  model?: string; // 设备型号（移动设备）
  platform?: string; // 操作系统：Windows, macOS, Android 等
  platformVersion?: string; // 系统版本号
  wow64?: boolean; // Windows WOW64 环境标识
  fullVersionList?: Array<{ brand: string; version: string }>; // 浏览器完整版本信息
  version?: string; // 浏览器主版本号
}

/**
 * 浏览器品牌版本信息
 */
interface NavigatorUABrandVersion {
  brand: string; // 浏览器品牌：Chrome, Edge 等
  version: string; // 版本号
}

/**
 * Navigator UA-CH 数据接口
 * 浏览器原生提供的 userAgentData API
 */
interface NavigatorUAData {
  brands: NavigatorUABrandVersion[]; // 浏览器品牌列表
  mobile: boolean; // 是否为移动设备
  platform: string; // 操作系统平台
  getHighEntropyValues(hints: string[]): Promise<UADataValues>; // 获取详细信息的异步方法
}

/**
 * Client Hints 提示类型
 * 定义可以请求的设备信息类型
 */
type ClientHint =
  | 'architecture' // CPU 架构
  | 'bitness' // 系统位数
  | 'model' // 设备型号
  | 'platform' // 操作系统
  | 'platformVersion' // 系统版本
  | 'fullVersionList' // 完整版本列表
  | 'wow64'; // WOW64 环境

// 扩展 Navigator 接口，添加 UA-CH API 支持
declare global {
  interface Navigator {
    userAgentData?: NavigatorUAData; // UA-CH API（可选，仅支持的浏览器有此属性）
  }
}

/**
 * 核心函数：使用 UA-CH API 构建UA字符串
 *
 * @param hints - 需要获取的设备信息类型数组
 * @returns 构建的UA字符串，失败时返回 undefined
 *
 * 工作流程：
 * 1. 检查浏览器是否支持 UA-CH
 * 2. 验证是否为 Chromium 内核浏览器
 * 3. 获取设备详细信息
 * 4. 根据不同平台构建标准格式的 UA 字符串
 */
async function getUserAgentUsingClientHints(
  hints: string[]
): Promise<string | undefined> {
  // === 平台特定的 UA 字符串构建函数 ===

  /**
   * 构建 Chrome OS 平台的 UA 字符串片段
   * 格式：X11; CrOS [架构] [版本]
   */
  const GetCrosSpecificString = (values: UADataValues): string => {
    let osCPUFragment = ''; // CPU 架构片段

    // 根据位数和架构确定 CPU 架构字符串
    if (values.bitness === '64') {
      if (values.architecture === 'x86') {
        osCPUFragment = 'x86_64'; // 64位 x86 架构
      } else if (values.architecture === 'arm') {
        osCPUFragment = 'aarch64'; // 64位 ARM 架构
      }
    } else if (values.architecture === 'arm' && values.bitness === '32') {
      osCPUFragment = 'armv7l'; // 32位 ARM 架构
    }

    // 如果没有特定的 CPU 架构，返回基本的 CrOS 字符串
    if (osCPUFragment === '') {
      return `X11; CrOS ${values.platformVersion}`;
    }
    // 返回包含 CPU 架构的完整 CrOS 字符串
    return `X11; CrOS ${osCPUFragment} ${values.platformVersion}`;
  };

  /**
   * 构建 Windows 平台的 UA 字符串片段
   * 格式：Windows NT [版本][; 架构信息]
   */
  const GetWindowsSpecificString = (values: UADataValues): string => {
    let osCPUFragment = ''; // CPU 架构片段

    // 根据架构和位数确定 Windows 特定的 CPU 字符串
    if (values.architecture === 'x86' && values.bitness === '64') {
      osCPUFragment = '; Win64; x64'; // 64位 x86 架构
    } else if (values.architecture === 'arm') {
      osCPUFragment = '; ARM'; // ARM 架构
    } else if (values.wow64 === true) {
      osCPUFragment = '; WOW64'; // WOW64 环境（64位系统上的32位应用）
    }

    // 返回完整的 Windows NT 字符串
    return `Windows NT ${getWindowsPlatformVersion(
      values.platformVersion || '10.0'
    )}${osCPUFragment}`;
  };

  /**
   * 构建 macOS 平台的 UA 字符串片段
   * 格式：Macintosh; Intel Mac OS X [版本]
   */
  const GetMacSpecificString = (values: UADataValues): string => {
    let newUA = 'Macintosh; Intel Mac OS X '; // macOS 基础字符串
    let macVersion = values.platformVersion || '10_15_7'; // 默认版本

    // 将版本号中的点替换为下划线（macOS UA格式要求）
    if (macVersion.indexOf('.') > -1) {
      macVersion = macVersion.split('.').join('_');
    }
    newUA += macVersion;
    return newUA;
  };

  /**
   * 构建 Android 平台的 UA 字符串片段
   * 格式：Linux; Android [版本][; 设备型号]
   */
  const GetAndroidSpecificString = (values: UADataValues): string => {
    let newUA = 'Linux; Android '; // Android 基础字符串
    newUA += values.platformVersion; // 添加 Android 版本

    // 如果有设备型号信息，添加到字符串中
    if (values.model) {
      newUA += '; ';
      newUA += values.model;
    }
    return newUA;
  };

  /**
   * 初始化设备信息，为缺失的字段设置默认值
   * 确保所有必要的字段都有合理的默认值
   */
  const Initialize = (values: UADataValues): UADataValues => {
    // 设置默认架构为 x86
    if (!values.architecture) {
      values.architecture = 'x86';
    }
    // 设置默认位数为 64
    if (!values.bitness) {
      values.bitness = '64';
    }
    // 设置默认设备型号为空字符串
    if (!values.model) {
      values.model = '';
    }
    // 设置默认平台为 Windows
    if (!values.platform) {
      values.platform = 'Windows';
    }
    // 设置默认平台版本为 10.0
    if (!values.platformVersion) {
      values.platformVersion = '10.0';
    }
    // 设置默认 WOW64 状态为 false
    if (!values.wow64) {
      values.wow64 = false;
    }

    return values;
  };

  // === 浏览器兼容性检查 ===

  // 检查是否支持 UA-CH API
  if (!navigator.userAgentData) {
    return Promise.resolve(undefined);
  }

  // 验证是否为支持的 Chromium 浏览器
  let is_chromium = false;
  let chromium_version: string | undefined;

  // Chrome 浏览器 UA 格式验证正则
  const is_chrome_ua_pattern = new RegExp(
    'AppleWebKit/537.36 \\(KHTML, like Gecko\\) Chrome/\\d+.\\d+.\\d+.\\d+ (Mobile )?Safari/537.36'
  );

  // 查找 Chromium 品牌信息
  navigator.userAgentData.brands.forEach((value) => {
    if (value.brand === 'Chromium') {
      // 验证是真实的 Chrome 浏览器（排除无头浏览器等）
      is_chromium = is_chrome_ua_pattern.test(navigator.userAgent);
      chromium_version = value.version;
    }
  });

  // 只支持 Chromium 100+ 版本（确保 API 完整性）
  if (
    !is_chromium ||
    !chromium_version ||
    parseInt(chromium_version, 10) < 100
  ) {
    return Promise.resolve(undefined);
  }

  // === 构建UA字符串 ===

  return new Promise<string>((resolve) => {
    // 获取详细的设备信息
    navigator.userAgentData?.getHighEntropyValues(hints).then((values) => {
      if (!values) {
        resolve('');
        return;
      }
      // 准备初始数据
      const initialValues: UADataValues = {
        platform: navigator.userAgentData?.platform,
        version: chromium_version
      };

      // 合并并初始化数据
      values = Object.assign(initialValues, values);
      values = Initialize(values);

      // 构建 UA 字符串：Mozilla/5.0 ([平台信息]) [浏览器信息]
      let newUA = 'Mozilla/5.0 (';
      const originalUA = navigator.userAgent;

      // 根据操作系统添加平台特定信息
      if (/OpenHarmony/.test(originalUA)) {
        const harmonyParenMatch = originalUA.match(/\(([^)]*OpenHarmony[^)]*)\)/);
        if (harmonyParenMatch && harmonyParenMatch[1]) {
          newUA += harmonyParenMatch[1];
        } else {
          const versionMatch = originalUA.match(/OpenHarmony\s([\d.]+)/);
          const ohVersion =
            (versionMatch && versionMatch[1]) || values.platformVersion || '';
          newUA += `Phone; OpenHarmony ${ohVersion}`.trim();
        }
      } else if (includes(['Chrome OS', 'Chromium OS'], values.platform || '')) {
        newUA += GetCrosSpecificString(values);
      } else if (values.platform === 'Windows') {
        newUA += GetWindowsSpecificString(values);
      } else if (values.platform === 'macOS') {
        newUA += GetMacSpecificString(values);
      } else if (values.platform === 'Android') {
        newUA += GetAndroidSpecificString(values);
      } else {
        newUA += 'X11; Linux x86_64'; // 其他 Linux 系统
      }

      // 添加浏览器引擎信息
      newUA += ') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/';
      newUA += getVersion(
        values?.fullVersionList,
        initialValues.version || '100'
      );

      // 移动设备标识
      if (navigator.userAgentData?.mobile) {
        newUA += ' Mobile';
      }

      // Safari 兼容标识
      newUA += ' Safari/537.36';

      // 提取原始UA中Safari/537.36后面的额外字符串（如Edge的Edg/版本号）
      // const originalUA = navigator.userAgent;
      const safariIndex = originalUA.indexOf('Safari/537.36');
      if (safariIndex !== -1) {
        const safariEndIndex = safariIndex + 'Safari/537.36'.length;
        const extraSuffix = originalUA.substring(safariEndIndex);
        if (extraSuffix) {
          newUA += extraSuffix;
        }
      }

      resolve(newUA);
    });
  });
}

/**
 * 获取 Chrome 浏览器版本号
 * 优先使用完整版本信息，回退到主版本号
 */
function getVersion(
  fullVersionList?: Array<{ brand: string; version: string }>,
  majorVersion?: string
): string {
  return (
    fullVersionList?.find((item) =>
      includes(
        ['Google Chrome', 'Microsoft Edge', 'Opera', 'Chromium'],
        item.brand
      )
    )?.version || `${majorVersion || '100'}.0.0.0`
  );
}

/**
 * 将 Windows 平台版本转换为 NT 版本号
 * 遵循 UA-CH 规范的版本映射规则
 *
 * @param platformVersion - 平台版本字符串
 * @returns Windows NT 版本号
 */
function getWindowsPlatformVersion(platformVersion: string): string {
  // 历史版本映射表
  const versionMap = new Map<string, string>([
    ['0.3.0', '6.3'], // Windows 8.1
    ['0.2.0', '6.2'], // Windows 8
    ['0.1.0', '6.1'] // Windows 7
  ]);

  if (versionMap.has(platformVersion)) {
    return versionMap.get(platformVersion)!;
  }

  // Windows 11+ 版本检测
  if (
    typeof navigator !== 'undefined' &&
    navigator.userAgentData &&
    navigator.userAgentData.platform === 'Windows'
  ) {
    const majorVersion = parseInt(platformVersion.split('.')[0], 10);
    if (majorVersion >= 13) {
      return '13.0'; // Windows 11+
    }
  }

  return '10.0'; // Windows 10 及默认版本
}

// === Client Hints 配置预设 ===

/**
 * 推荐配置：获取完整的设备信息
 * 适用于需要详细设备识别的场景
 */
export const RECOMMENDED_HINTS: readonly ClientHint[] = [
  'architecture', // CPU 架构
  'bitness', // 系统位数
  'model', // 设备型号
  'platformVersion', // 系统版本
  'fullVersionList', // 浏览器版本列表
  'wow64' // Windows 兼容环境
] as const;

/**
 * 移动端配置：专注移动设备信息
 * 适用于移动端应用和响应式设计
 */
export const MOBILE_HINTS: readonly ClientHint[] = [
  'model', // 设备型号（移动端关键）
  'platformVersion', // 系统版本
  'fullVersionList' // 浏览器版本
] as const;

/**
 * 检测浏览器是否支持 UA-CH API
 *
 * @returns true 表示支持，false 表示不支持
 *
 * 检查条件：
 * - navigator 对象存在
 * - navigator.userAgentData 属性存在
 * - getHighEntropyValues 方法可用
 */
export function isUACHSupported(): boolean {
  return !!(
    typeof navigator !== 'undefined' &&
    navigator.userAgentData &&
    typeof navigator.userAgentData.getHighEntropyValues === 'function'
  );
}

/**
 * 主要导出函数：获取兼容的用户代理字符串
 *
 * @param hints - 可选的设备信息类型数组，不传则自动选择最适合的配置
 * @returns 用户代理字符串的 Promise
 *
 * 功能说明：
 * - 自动检测浏览器支持情况
 * - 智能选择最适合的设备信息获取策略
 * - 不支持 UA-CH 时返回空字符串
 * - 支持时返回增强的用户代理字符串
 * - 支持自定义 hints 配置
 *
 * 选择逻辑：
 * - 不支持 UA-CH：返回空字符串
 * - 移动设备：使用移动端优化配置
 * - 桌面设备：使用完整推荐配置
 * - 自定义：使用传入的 hints 配置
 *
 * 使用示例：
 * ```typescript
 * // 自动选择最佳配置
 * const userAgent = await getCompatibleUserAgent();
 *
 * // 使用自定义配置
 * const customUA = await getCompatibleUserAgent(['model', 'platformVersion']);
 *
 * // 使用预设配置
 * const mobileUA = await getCompatibleUserAgent(MOBILE_HINTS);
 * ```
 */
export async function getCompatibleUserAgent(
  hints?: readonly ClientHint[]
): Promise<string> {
  // 检查浏览器支持情况
  if (!isUACHSupported()) {
    return '';
  }

  // 确定使用的 hints 配置
  let selectedHints: readonly ClientHint[];

  if (hints) {
    // 使用传入的自定义配置
    selectedHints = hints;
  } else {
    // 自动选择最适合的配置
    const isMobile = navigator.userAgentData?.mobile || false;
    selectedHints = isMobile ? MOBILE_HINTS : RECOMMENDED_HINTS;
  }

  // 获取用户代理字符串
  try {
    const uachUA = await getUserAgentUsingClientHints([...selectedHints]);
    return uachUA || '';
  } catch (_error) {
    return '';
  }
}
