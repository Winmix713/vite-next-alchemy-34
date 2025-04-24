
import { RoutingAnalysis, NextJsRoute } from '@/types/analyzer';
import { analyzeNextJsRoutes } from '../routeConverter';

export async function analyzeRouting(files: File[]): Promise<RoutingAnalysis> {
  const nextJsRoutes = analyzeNextJsRoutes(files);
  
  // Convert to our internal NextJsRoute type
  const routes: NextJsRoute[] = nextJsRoutes.map(route => ({
    path: route.path,
    component: route.component,
    isPage: true, // Default to true for Next.js routes
    isDynamic: route.isDynamic,
    hasParams: route.hasParams,
    params: route.params,
    layout: !!route.layout,
    hasErrorBoundary: false,
    pageComponent: route.component
  }));

  return {
    routes,
    dynamicRoutes: routes.filter(r => r.isDynamic).length,
    complexRoutes: routes.filter(r => r.path.includes('[') && (r.path.includes('...') || r.path.split('/').filter(p => p.includes('[')).length > 1)).length
  };
}
