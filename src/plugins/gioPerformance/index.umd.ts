import GioPerformance from './index';
import GioReact from './gioReact';
import GioVue from './gioVue';

window['gioPerformance'] = {
  name: 'gioPerformance',
  method: GioPerformance,
  GioVue,
  gioReactErrorReport: GioReact
};
