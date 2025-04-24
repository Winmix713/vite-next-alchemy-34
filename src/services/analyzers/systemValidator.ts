
import { ValidationResult, SystemAnalysisResult } from '@/types/analyzer';
import { analyzeNextJsRoutes } from '../routeConverter';
import { transformCode } from '../codeTransformer';
import { analyzeMiddlewareFiles } from '../middlewareTransformer';
import { analyzeCodebase, analyzeComponents } from './codebaseAnalyzer';
import { analyzeDependencies } from '../dependencyManager';

export async function validateConversionSystem(): Promise<ValidationResult> {
  const components = [
    { name: 'routeConverter', status: 'ok' as const },
    { name: 'codeTransformer', status: 'ok' as const },
    { name: 'apiRouteTransformer', status: 'ok' as const },
    { name: 'middlewareTransformer', status: 'ok' as const },
    { name: 'dependencyAnalyzer', status: 'ok' as const },
    { name: 'astTransformer', status: 'ok' as const }
  ];
  
  const issues: string[] = [];

  // Check components
  try {
    // RouteConverter check
    const routeConverterValid = typeof analyzeNextJsRoutes === 'function';
    if (!routeConverterValid) {
      components[0].status = 'error' as const;
      components[0].message = 'RouteConverter function is not available';
      issues.push('RouteConverter validation error');
    }
    
    // CodeTransformer check
    const codeTransformerValid = typeof transformCode === 'function';
    if (!codeTransformerValid) {
      components[1].status = 'error' as const;
      components[1].message = 'CodeTransformer function is not available';
      issues.push('CodeTransformer validation error');
    }
    
    // MiddlewareTransformer check
    const middlewareTransformerValid = typeof analyzeMiddlewareFiles === 'function';
    if (!middlewareTransformerValid) {
      components[3].status = 'error' as const;
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
    // Validate system components first
    const validation = await validateConversionSystem();
    
    if (!validation.valid) {
      throw new Error(`System validation failed: ${validation.issues.join(', ')}`);
    }
    
    // 1. Analyze codebase
    const codebase = await analyzeCodebase(files);
    
    // 2. Analyze components
    const components = await analyzeComponents(files);
    
    // 3. Analyze dependencies
    const dependencies = analyzeDependencies(packageJson);
    
    // 4. Analyze routes
    const routes = analyzeNextJsRoutes(files);
    const routing = {
      routes,
      dynamicRoutes: routes.filter(r => r.isDynamic).length,
      complexRoutes: routes.filter(r => r.path.includes('[') && (r.path.includes('...') || r.path.split('/').filter(p => p.includes('[')).length > 1)).length
    };
    
    // 5. Calculate conversion readiness
    const readiness = calculateConversionReadiness(codebase, components, dependencies, routing);
    
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

function calculateConversionReadiness(
  codebase: any, 
  components: any, 
  dependencies: any, 
  routing: any
): {
  score: number;
  category: 'simple' | 'moderate' | 'complex';
  automationPercentage: number;
  manualInterventionAreas: string[];
  recommendations: string[];
} {
  // Base score starts at 100 and gets reduced based on complexity factors
  let score = 100;
  const manualInterventionAreas: string[] = [];
  const recommendations: string[] = [];
  
  // 1. Consider component complexity
  const nextJsComponentPercentage = (components.nextjsSpecificComponents / Math.max(components.totalComponents, 1)) * 100;
  if (nextJsComponentPercentage > 75) {
    score -= 25;
    manualInterventionAreas.push('Next.js-specific components');
    recommendations.push('Consider replacing Next.js components with React alternatives like react-helmet, unpic/react, etc.');
  } else if (nextJsComponentPercentage > 40) {
    score -= 15;
    manualInterventionAreas.push('Next.js-specific components');
    recommendations.push('Several Next.js components need to be replaced with React alternatives');
  }
  
  // 2. Consider routing complexity
  if (routing.complexRoutes > 10) {
    score -= 25;
    manualInterventionAreas.push('Complex dynamic routes');
    recommendations.push('Complex dynamic routes will require careful handling with React Router');
  } else if (routing.dynamicRoutes > 5) {
    score -= 10;
    manualInterventionAreas.push('Dynamic routes');
    recommendations.push('Dynamic routes will need to be transformed to React Router format');
  }
  
  // 3. Consider dependency compatibility
  if (!dependencies.compatibility.compatible) {
    score -= 20;
    manualInterventionAreas.push('Incompatible dependencies');
    recommendations.push('Several dependencies are not compatible with Vite and need alternatives');
  } else if (dependencies.dependencies.filter(d => d.isNextjsSpecific).length > 3) {
    score -= 10;
    manualInterventionAreas.push('Next.js-specific dependencies');
    recommendations.push('Replace Next.js-specific dependencies with React/Vite alternatives');
  }
  
  // 4. Consider data fetching methods
  const hasDataFetchingFeatures = codebase.nextjsFeatureUsage['getServerSideProps'] > 0 || 
    codebase.nextjsFeatureUsage['getStaticProps'] > 0 || 
    codebase.nextjsFeatureUsage['getStaticPaths'] > 0;
    
  if (hasDataFetchingFeatures) {
    score -= 15;
    manualInterventionAreas.push('Next.js data fetching');
    recommendations.push('Replace Next.js data fetching methods with React Query or SWR');
  }
  
  // Calculate automation percentage
  const automationPercentage = Math.max(Math.min(score, 100), 0);
  
  // Determine category
  let category: 'simple' | 'moderate' | 'complex' = 'simple';
  if (score < 40) {
    category = 'complex';
  } else if (score < 70) {
    category = 'moderate';
  }
  
  // Add general recommendations
  if (category === 'complex') {
    recommendations.push('Consider incremental migration instead of one-time conversion');
    recommendations.push('Start by separating business logic from Next.js specific functionality');
  }
  
  return {
    score,
    category,
    automationPercentage,
    manualInterventionAreas,
    recommendations
  };
}
