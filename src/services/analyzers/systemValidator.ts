
import { ValidationResult, SystemAnalysisResult, AnalyzerComponent } from '@/types/analyzer';
import { analyzeNextJsRoutes } from '../routeConverter';
import { transformCode } from '../codeTransformer';
import { analyzeMiddlewareFiles } from '../middlewareTransformer';
import { analyzeCodebase, analyzeComponents } from './codebaseAnalyzer';
import { analyzeDependencies } from './dependencyAnalyzer';
import { calculateConversionReadiness } from './readinessAnalyzer';
import { NextJsRoute } from '@/types/route';

export async function validateConversionSystem(): Promise<ValidationResult> {
  const components: AnalyzerComponent[] = [
    { name: 'routeConverter', status: 'ok' },
    { name: 'codeTransformer', status: 'ok' },
    { name: 'apiRouteTransformer', status: 'ok' },
    { name: 'middlewareTransformer', status: 'ok' },
    { name: 'dependencyAnalyzer', status: 'ok' },
    { name: 'astTransformer', status: 'ok' }
  ];
  
  const issues: string[] = [];

  try {
    // RouteConverter check
    const routeConverterValid = typeof analyzeNextJsRoutes === 'function';
    if (!routeConverterValid) {
      components[0].status = 'error';
      components[0].message = 'RouteConverter function is not available';
      issues.push('RouteConverter validation error');
    }
    
    // CodeTransformer check
    const codeTransformerValid = typeof transformCode === 'function';
    if (!codeTransformerValid) {
      components[1].status = 'error';
      components[1].message = 'CodeTransformer function is not available';
      issues.push('CodeTransformer validation error');
    }
    
    // MiddlewareTransformer check
    const middlewareTransformerValid = typeof analyzeMiddlewareFiles === 'function';
    if (!middlewareTransformerValid) {
      components[3].status = 'error';
      components[3].message = 'MiddlewareTransformer function is not available';
      issues.push('MiddlewareTransformer validation error');
    }
    
  } catch (error) {
    issues.push(`System validation error: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  return {
    valid: issues.length === 0,
    issues,
    components
  };
}

export async function performSystemAnalysis(files: File[], packageJson: any): Promise<SystemAnalysisResult> {
  try {
    const validation = await validateConversionSystem();
    
    if (!validation.valid) {
      throw new Error(`System validation failed: ${validation.issues.join(', ')}`);
    }
    
    const codebase = await analyzeCodebase(files);
    const components = await analyzeComponents(files);
    const dependencies = await analyzeDependencies(packageJson);
    
    // Get NextJS routes and convert them to our type
    const nextJsRoutes = analyzeNextJsRoutes(files);
    const routes: NextJsRoute[] = nextJsRoutes.map(route => ({
      path: route.path,
      component: route.component,
      isPage: true,
      isDynamic: route.isDynamic,
      hasParams: route.hasParams,
      params: route.params,
      layout: !!route.layout,
      pageComponent: route.component
    }));
    
    const routing = {
      routes,
      dynamicRoutes: routes.filter(r => r.isDynamic).length,
      complexRoutes: routes.filter(r => r.path.includes('[') && (r.path.includes('...') || r.path.split('/').filter(p => p.includes('[')).length > 1)).length
    };
    
    const readiness = calculateConversionReadiness({
      codebase,
      components,
      dependencies,
      routing
    });
    
    return {
      codebase,
      components,
      dependencies,
      routing,
      readiness,
      validation
    };
  } catch (error) {
    throw new Error(`System analysis failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
