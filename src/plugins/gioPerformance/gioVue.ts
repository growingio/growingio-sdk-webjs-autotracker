import { find, head, isArray, isFunction, split } from '@/utils/glodash';
import { getGioFunction } from '@/utils/tools';

const GioVue = {
  install(vue: any): void {
    if (vue && vue.config) {
      const gioErrorHandler = function (err: Error, vm: any, info: string) {
        handleVueError.apply(this, [err, vm, info, vue]);
      };
      // 如果客户自己写了errorHandler，不覆盖，做hook处理
      if (isFunction(vue.config.errorHandler)) {
        const originHandler = vue.config.errorHandler;
        vue.config.errorHandler = function (...args) {
          const r = originHandler.apply(this, args);
          gioErrorHandler(args[0], args[1], args[2]);
          return r;
        };
      } else {
        // 如果客户自己没有处理errorHandler，直接赋值
        vue.config.errorHandler = gioErrorHandler;
      }
    }
  }
};

// vueError触发器
const handleVueError = (err: Error, vm: any, info: string, vue: any): void => {
  let data: any = {
    message: `${err.message}(${info})`,
    name: err.name,
    stack: err.stack || []
  };
  if (vue?.version) {
    const mainVersion = Number(head(split(vue?.version, '.')));
    switch (mainVersion) {
      case 2:
        data = { ...data, ...vue2VmComponent(vm) };
        break;
      case 3:
        data = { ...data, ...vue3VmComponent(vm) };
        break;
      default:
        return;
        break;
    }
  }
  data = {
    ...data,
    ...errorParse(data.stack)
  };
  const gdp = getGioFunction();
  gdp('track', 'apm_system_error', {
    error_type: `${data.name}: ${data.message}`,
    error_content: `at ${data.functionName} (${data.componentName})`
  });
};

// vue2组件名称获取
const vue2VmComponent = (vm: any) => {
  let componentName = '';
  if (vm.$root === vm) {
    componentName = 'root';
  } else {
    const name = vm._isVue
      ? (vm.$options && vm.$options.name) ||
        (vm.$options && vm.$options._componentTag)
      : vm.name;
    componentName =
      (name ? 'component <' + name + '>' : 'anonymous component') +
      (vm._isVue && vm.$options && vm.$options.__file
        ? ' at ' + (vm.$options && vm.$options.__file)
        : '');
  }
  return { componentName };
};

// vue3组件名称获取
const vue3VmComponent = (vm: any) => {
  let componentName = '';
  if (vm.$root === vm) {
    componentName = 'root';
  } else {
    const name = vm.$options && vm.$options.name;
    componentName = name ? 'component <' + name + '>' : 'anonymous component';
  }
  return { componentName };
};

// 解析错误堆栈
const errorParse = (errorString: string) => {
  // 按分行截取为堆栈数组
  const stacks = errorString.split('\n');
  let functionName;
  find(stacks, (v) => {
    const matcher = v.match(/at (.*?) \((.*):(\d{1,}):(\d{1,})\)/);
    if (isArray(matcher) && !functionName) {
      functionName = matcher[1];
      return matcher.length > 0;
    }
  });
  return { title: stacks[0], functionName };
};

export default GioVue;
