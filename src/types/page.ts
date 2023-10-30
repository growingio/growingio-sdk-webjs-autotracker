export default interface PageType {
  path: string;
  query: string;
  title?: string;
  domain: string;
  time: number;
  parsePage: () => void;
  getReferralPage: () => string;
  hookHistory: () => void;
  buildPageEvent: (props?: any) => void;
}
