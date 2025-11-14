import { GrowingIOType } from '@/types/internal/growingIO';
import { fixed, forEach, isEmpty, isEqual, last } from '@/utils/glodash';
import { onFCP, onLCP, onTTFB } from 'web-vitals';

const PERF_ENUMS = {
  FCP: 'first_contentful_paint_duration', // (白屏时间)首次内容绘制（FCP）
  LCP: 'largest_contentful_paint_duration', // 最大内容绘制 (LCP)
  TTFB: 'first_byte_duration' // 第一字节时间（TTFB）
};

export default class Monitor {
  private buildMonitorEvent: (attributes: any) => void;
  // 从web-vitals获取的性能数据
  private vitalsData: any;
  // 处理后的性能数据
  private performance: any = {};
  constructor(public growingIO: GrowingIOType, public options: any = {}) {
    this.buildMonitorEvent = (attributes) => {
      this.growingIO.plugins.gioPerformance?.buildPerfEvent(
        'apm_web_launch',
        attributes
      );
    };
    this.vitalsData = {
      FCP: [],
      FID: [],
      INP: [],
      LCP: [],
      TTFB: []
    };
    onFCP(this.setPerformanceData);
    onLCP(this.setPerformanceData, { reportAllChanges: true });
    onTTFB(this.setPerformanceData);
    window.addEventListener('load', this.generatePerfData);
  }

  setPerformanceData = (p: any) => {
    this.vitalsData[p.name].push(p);
  };

  getLaunchTime = () => {
    const timing = window.performance?.timing;
    if (!timing) return 0;
    const { loadEventEnd, navigationStart } = timing;
    return loadEventEnd - navigationStart;
  };

  getInteractiveTime = () => {
    const timing = window.performance?.timing;
    if (!timing) return 0;
    const { domContentLoadedEventEnd, navigationStart } = timing;
    return domContentLoadedEventEnd - navigationStart;
  };

  generatePerfData = () => {
    window.setTimeout(() => {
      const performance = {
        page_launch_duration: this.getLaunchTime(),
        interactive_duration: this.getInteractiveTime()
      };
      forEach(this.vitalsData, (v, k) => {
        if (!isEmpty(v)) {
          const lastValue = last(v);
          if (lastValue?.value !== undefined) {
            performance[PERF_ENUMS[k]] = fixed(lastValue.value, 0);
          }
        }
      });
      if (!isEqual(performance, this.performance)) {
        this.buildMonitorEvent(performance);
        this.performance = performance;
      }
    }, 1000);
  };

  // 销毁移除监听
  destroy = () => {
    window.removeEventListener('load', this.generatePerfData);
  };
}
