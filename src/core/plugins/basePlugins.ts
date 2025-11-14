import { GrowingIOType } from '@/types/internal/growingIO';
import { PluginItem, PluginsType } from '@/types/internal/plugins';
import {
  findIndex,
  isEmpty,
  isFunction,
  keys,
  lowerFirst,
  unset
} from '@/utils/glodash';
import { consoleText } from '@/utils/tools';
import EMIT_MSG from '@/constants/emitMsg';

// 会被强制剔除出内置的插件（即必须通过手动注册的方式加载的内置插件）
const EXTRA_PLUGINS = ['gioPerformance'];

// @ts-nocheck
class BasePlugins implements PluginsType {
  public pluginItems: PluginItem[];
  public pluginsContext: any;
  constructor(public growingIO: GrowingIOType) {
    this.pluginsContext = { plugins: {} };
    this.pluginItems = [];
    this.growingIO.emitter?.on(EMIT_MSG.ON_INSTALL, (args) =>
      this.callLifeCycle('onInstall', args)
    );
    this.growingIO.emitter?.on(EMIT_MSG.ON_ERROR, (args) =>
      this.callLifeCycle('onError', args)
    );
    this.growingIO.emitter?.on(EMIT_MSG.ON_COMPOSE_BEFORE, (args) =>
      this.callLifeCycle('onComposeBefore', args)
    );
    this.growingIO.emitter?.on(EMIT_MSG.ON_COMPOSE_AFTER, (args) =>
      this.callLifeCycle('onComposeAfter', args)
    );
    this.growingIO.emitter?.on(EMIT_MSG.ON_SEND_BEFORE, (args) =>
      this.callLifeCycle('onSendBefore', args)
    );
    this.growingIO.emitter?.on(EMIT_MSG.ON_SEND_AFTER, (args) =>
      this.callLifeCycle('onSendAfter', args)
    );
  }

  // 初始化内置插件，不允许客户自己热插拔的插件，内置打包完成
  innerPluginInit = () => {
    EXTRA_PLUGINS.forEach((o) => unset(this.pluginsContext?.plugins, o));
    const plugins = keys(this.pluginsContext?.plugins).map(
      (key) => this.pluginsContext?.plugins[key]
    );
    if (!isEmpty(plugins)) {
      this.installAll(plugins, true);
    }
  };

  // 挂载所有插件
  installAll = (plugins?: PluginItem[], silent = false) => {
    (plugins || this.pluginItems).forEach((pluginItem: PluginItem) => {
      this.install(pluginItem.name, plugins ? pluginItem : undefined, silent);
    });
  };

  // 挂载插件
  install = (pluginName: string, pluginItem?: PluginItem, silent = false) => {
    const { emitter } = this.growingIO;
    // 将插件实例挂载到growingIO实例上使得其他模块可以调用
    try {
      if (pluginItem) {
        emitter.emit(EMIT_MSG.ON_INSTALL, pluginItem);
      }
      // 若列表中出现同名插件，只会尝试覆盖options
      const existIndex = findIndex(
        this.pluginItems,
        (o) => o.name === pluginName
      );
      const plugin = {
        // 优先使用指定插件名
        name: lowerFirst(pluginName),
        method: pluginItem.method || function () {},
        options: pluginItem.options || {}
      };
      if (existIndex > -1) {
        this.pluginItems[existIndex] = plugin;
        if (!silent) {
          consoleText(
            `重复加载插件 ${pluginName} 或插件重名，已跳过加载!`,
            'warn'
          );
        }
      } else {
        this.pluginItems.push(plugin);
        if (!silent) {
          consoleText(`加载插件 ${pluginName}`, 'info');
        }
        // 直接尝试实例化插件
        (this.growingIO?.plugins as any)[pluginName] = new (
          pluginItem as any
        ).method(this.growingIO, pluginItem.options);
      }
      // 赋值options
      (this.growingIO?.plugins as any)[pluginName].options = pluginItem.options;
      return true;
    } catch (error) {
      this.lifeError(pluginItem, error);
      if (!silent) {
        consoleText(`插件【${pluginName}】加载异常 ${error}`, 'error');
      }
      return false;
    }
  };

  // 移除插件
  uninstall = (pluginName: string) => {
    unset(this.pluginItems, pluginName);
    unset(this.growingIO?.plugins, pluginName);
    if (pluginName === 'gioEmbeddedAdapter') {
      this.growingIO.useEmbeddedInherit = '';
    }
    if (pluginName === 'gioHybridAdapter') {
      this.growingIO.useHybridInherit = '';
    }
    return true;
  };

  // 移除所有插件
  uninstallAll = () => {
    this.growingIO.useEmbeddedInherit = '';
    this.growingIO.useHybridInherit = '';
    this.pluginItems.forEach((o: PluginItem) => this.uninstall(o.name));
  };

  lifeError = (p: PluginItem, e: any) => {
    this.growingIO.emitter.emit(EMIT_MSG.ON_ERROR, {
      plugin: p,
      error: e
    });
    consoleText(`插件执行错误 ${p.name} ${e}`, 'error');
  };

  // 触发插件的生命周期事件
  callLifeCycle = (lifetime: string, args: any) => {
    this.pluginItems.forEach((o: PluginItem) => {
      const method = (this.growingIO.plugins as any)[o.name]
        ? (this.growingIO.plugins as any)[o.name][lifetime]
        : undefined;
      if (method && isFunction(method)) {
        try {
          method(args);
        } catch (e) {
          this.lifeError(o, e);
        }
      }
    });
  };
}

export default BasePlugins;
