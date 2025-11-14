import { drop, isArray } from '@/utils/glodash';
import { getGioFunction } from '@/utils/tools';

const GioReactErrorReport = (error: any, errorInfo: any) => {
  if (!error || !error.stack) {
    return;
  }
  
  const title = error.stack.split('\n')[0] || 'Unknown React Error';
  const componentStack = errorInfo?.componentStack?.split('\n') || [];
  const nodesRoute = [];
  
  componentStack.forEach((v) => {
    if (v && typeof v === 'string') {
      const matcher = `${v} `.match(/at (.*?) /);
      if (isArray(matcher) && matcher[1]) {
        nodesRoute.push(matcher[1]);
      }
    }
  });
  
  const content = nodesRoute.length > 0 
    ? `at ${drop(nodesRoute.reverse()).join('/')}`
    : 'Unknown component path';
    
  const gdp = getGioFunction();
  if (gdp) {
    gdp('track', 'apm_system_error', {
      error_type: title,
      error_content: content
    });
  }
};

export default GioReactErrorReport;
