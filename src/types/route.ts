
export interface NextJsRoute {
  path: string;
  component: string;
  isDynamic: boolean;
  hasParams: boolean;
  params?: string[];
  isPage: boolean;
  layout?: boolean | string;
  hasErrorBoundary?: boolean;
  pageComponent?: string;
  isIndex?: boolean;
  isOptionalCatchAll?: boolean;
  isCatchAll?: boolean;
}

export interface RouteAnalysis {
  routes: NextJsRoute[];
  dynamicRoutes: number;
  complexRoutes: number;
}
