
export interface NextJsRoute {
  path: string;
  component: string;
  isDynamic: boolean;
  hasParams: boolean;
  params?: string[];
  isPage: boolean;
  layout?: boolean;
  hasErrorBoundary?: boolean;
  pageComponent?: string;
}

export interface RouteAnalysis {
  routes: NextJsRoute[];
  dynamicRoutes: number;
  complexRoutes: number;
}
