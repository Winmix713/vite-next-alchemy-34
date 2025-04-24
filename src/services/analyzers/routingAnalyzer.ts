
import { RoutingAnalysis } from '@/types/analyzer';
import { analyzeNextJsRoutes } from '../routeConverter';

export async function analyzeRouting(files: File[]): Promise<RoutingAnalysis> {
  const routes = analyzeNextJsRoutes(files).map(route => ({
    path: route.path,
    isPage: true, // Default to true for Next.js routes
    isDynamic: route.isDynamic,
    params: route.params,
    layout: false,
    hasErrorBoundary: false,
    pageComponent: route.component
  }));

  return {
    routes,
    dynamicRoutes: routes.filter(r => r.isDynamic).length,
    complexRoutes: routes.filter(r => r.path.includes('[') && (r.path.includes('...') || r.path.split('/').filter(p => p.includes('[')).length > 1)).length
  };
}
