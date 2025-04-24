import { NextJsRoute } from './route';

export interface AnalyzerComponent {
  name: string;
  status: 'ok' | 'warning' | 'error';
  message?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  components: AnalyzerComponent[];
}

export interface CodebaseAnalysis {
  totalFiles: number;
  jsFiles: number;
  tsFiles: number;
  reactComponents: number;
  hooks: number;
  cssFiles: number;
  apiRoutes: number;
  nextjsFeatureUsage: Record<string, number>;
}

export interface DependencyAnalysis {
  dependencies: {
    name: string;
    version: string;
    type: 'production' | 'development';
    isNextjsSpecific: boolean;
    recommendedReplacement?: string;
  }[];
  compatibility: {
    compatible: boolean;
    issues: string[];
  };
}

export interface RoutingAnalysis {
  routes: NextJsRoute[];
  dynamicRoutes: number;
  complexRoutes: number;
}

export interface ComponentAnalysis {
  totalComponents: number;
  nextjsSpecificComponents: number;
  pureReactComponents: number;
  componentsWithDataFetching: number;
  componentsWithRouting: number;
}

export interface ConversionReadiness {
  score: number; // 0-100
  category: 'simple' | 'moderate' | 'complex';
  automationPercentage: number;
  manualInterventionAreas: string[];
  recommendations: string[];
}

export interface SystemAnalysisResult {
  codebase: CodebaseAnalysis;
  dependencies: DependencyAnalysis;
  routing: RoutingAnalysis;
  components: ComponentAnalysis;
  readiness: ConversionReadiness;
  validation: ValidationResult;
}

export { NextJsRoute };
