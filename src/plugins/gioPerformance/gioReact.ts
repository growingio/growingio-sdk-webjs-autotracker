import { drop, isArray } from '@/utils/glodash';
import { getGioFunction } from '@/utils/tools';

const GioReactErrorReport = (error: any, errorInfo: any) => {
  const title = error.stack.split('\n')[0];
  const componentStack = errorInfo.componentStack.split('\n');
  const nodesRoute = [];
  componentStack.forEach((v) => {
    const matcher = `${v} `.match(/at (.*?) /);
    if (isArray(matcher) && matcher[1]) {
      nodesRoute.push(matcher[1]);
    }
  });
  const content = `at ${drop(nodesRoute.reverse()).join('/')}`;
  const gdp = getGioFunction();
  gdp('track', 'apm_system_error', {
    error_type: title,
    error_content: content
  });
};

export default GioReactErrorReport;
