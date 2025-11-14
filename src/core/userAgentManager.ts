import {
  getCompatibleUserAgent,
  isUACHSupported
} from '@/utils/uach-retrofill';
import { consoleText, isPromiseSupported } from '@/utils/tools';

/**
 * 用户代理管理器
 *
 * 负责管理增强用户代理字符串的获取、缓存和状态管理。
 * 基于现代浏览器的 User-Agent Client Hints (UA-CH) API 实现，
 * 为不支持该API的环境提供优雅降级处理。
 *
 * @description 该类采用静态单例模式设计，提供全局统一的UA管理服务
 */
class UserAgentManager {
  /**
   * 缓存的用户代理字符串
   * @description null表示未初始化，空字符串表示不支持或获取失败，其他值为有效的UA字符串
   */
  private static cachedUserAgent: string | null = null;

  /**
   * 初始化Promise实例
   * @description 确保初始化过程只执行一次，重复调用返回同一个Promise
   */
  private static initPromise: Promise<void> | null = null;

  /**
   * 警告显示标志
   * @description 防止重复显示相同的警告信息，提升用户体验
   */
  private static hasWarnedOnce: boolean = false;

  /**
   * UA获取超时时间
   * @description 防止UA获取操作无限期等待，单位为毫秒
   */
  private static readonly TIMEOUT = 1000;

  /**
   * 检查浏览器兼容性
   * 验证当前环境是否支持Promise和UA-CH API
   * @returns 如果环境支持所需特性返回true，否则返回false
   */
  static isCompatible(): boolean {
    if (!isPromiseSupported() || !isUACHSupported()) {
      if (!UserAgentManager.hasWarnedOnce) {
        consoleText('当前浏览器/环境不支持获取增强UA', 'warn');
        UserAgentManager.hasWarnedOnce = true;
      }
      UserAgentManager.cachedUserAgent = '';
      return false;
    }

    return true;
  }

  /**
   * 初始化用户代理管理器
   *
   * @description 启动UA获取流程，包含兼容性检查、超时保护和错误处理
   * @returns 初始化完成的Promise，可安全重复调用
   */
  static async initialize(): Promise<void> {
    if (UserAgentManager.initPromise) {
      return UserAgentManager.initPromise;
    }

    UserAgentManager.initPromise = UserAgentManager._doInitialize();
    return UserAgentManager.initPromise;
  }

  /**
   * 执行实际的初始化逻辑
   *
   * @description 内部方法，处理UA获取的具体流程，包含超时控制和异常处理
   */
  private static async _doInitialize(): Promise<void> {
    try {
      // 创建超时控制机制
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(
          () => reject(new Error('UA获取超时')),
          UserAgentManager.TIMEOUT
        );
      });

      // 竞争执行：正常获取与超时控制
      const userAgent = await Promise.race([
        getCompatibleUserAgent(),
        timeoutPromise
      ]);

      UserAgentManager.cachedUserAgent = userAgent || '';
    } catch (error) {
      // 错误处理：记录错误信息并设置默认值
      if (!UserAgentManager.hasWarnedOnce) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';
        consoleText(`获取增强UA失败: ${errorMessage}`, 'warn');
        UserAgentManager.hasWarnedOnce = true;
      }
      UserAgentManager.cachedUserAgent = '';
    }
  }

  /**
   * 获取用户代理字符串
   *
   * @description 同步方法，返回缓存的UA字符串。建议先调用initialize()完成初始化
   * @returns 用户代理字符串，不支持或获取失败时返回空字符串
   */
  static getUserAgent(): string {
    // 快速兼容性检查
    if (!isUACHSupported()) {
      return '';
    }

    return UserAgentManager.cachedUserAgent || '';
  }

  /**
   * 检查初始化状态
   *
   * @description 判断管理器是否正在执行初始化过程
   * @returns 正在初始化返回true，未开始或已完成返回false
   */
  static isInitializing(): boolean {
    return UserAgentManager.initPromise !== null;
  }
}

export default UserAgentManager;

/**
 * 使用示例：
 *
 * ```typescript
 * // 异步初始化（推荐在应用启动时调用）
 * await UserAgentManager.initialize();
 *
 * // 同步获取UA字符串
 * const userAgent = UserAgentManager.getUserAgent();
 * console.log(userAgent); // 增强的UA字符串或空字符串
 *
 * // 检查初始化状态
 * if (UserAgentManager.isInitializing()) {
 *   console.log('正在初始化中...');
 * }
 *
 * // 在事件构建中使用
 * const eventContext = {
 *   userAgent: UserAgentManager.getUserAgent(),
 *   // ... 其他字段
 * };
 * ```
 *
 * 重要说明：
 * - 建议在应用初始化阶段调用initialize()方法
 * - getUserAgent()方法可在任何时候安全调用
 * - 不支持UA-CH的浏览器会返回空字符串
 * - 所有错误都会被妥善处理，不会影响应用正常运行
 */
