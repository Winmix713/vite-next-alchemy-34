
import { ConversionReadiness } from '@/types/analyzer';

interface ReadinessInput {
  codebase: any;
  components: any;
  dependencies: any;
  routing: any;
}

export function calculateConversionReadiness(input: ReadinessInput): ConversionReadiness {
  let score = 100;
  const manualInterventionAreas: string[] = [];
  const recommendations: string[] = [];
  
  // Component complexity analysis
  const nextJsComponentPercentage = (input.components.nextjsSpecificComponents / Math.max(input.components.totalComponents, 1)) * 100;
  if (nextJsComponentPercentage > 75) {
    score -= 25;
    manualInterventionAreas.push('Next.js-specific components');
    recommendations.push('Consider replacing Next.js components with React alternatives');
  }
  
  // Routing complexity analysis
  if (input.routing.complexRoutes > 10) {
    score -= 25;
    manualInterventionAreas.push('Complex dynamic routes');
    recommendations.push('Complex dynamic routes will require careful handling with React Router');
  }
  
  // Dependency compatibility analysis
  if (!input.dependencies.compatibility.compatible) {
    score -= 20;
    manualInterventionAreas.push('Incompatible dependencies');
    recommendations.push('Several dependencies need alternatives');
  }
  
  // Data fetching analysis
  const hasDataFetchingFeatures = input.codebase.nextjsFeatureUsage['getServerSideProps'] > 0 || 
    input.codebase.nextjsFeatureUsage['getStaticProps'] > 0;
    
  if (hasDataFetchingFeatures) {
    score -= 15;
    manualInterventionAreas.push('Next.js data fetching');
    recommendations.push('Replace Next.js data fetching methods with React Query');
  }
  
  const automationPercentage = Math.max(Math.min(score, 100), 0);
  
  let category: 'simple' | 'moderate' | 'complex' = 'simple';
  if (score < 40) {
    category = 'complex';
  } else if (score < 70) {
    category = 'moderate';
  }
  
  if (category === 'complex') {
    recommendations.push('Consider incremental migration instead of one-time conversion');
  }
  
  return {
    score,
    category,
    automationPercentage,
    manualInterventionAreas,
    recommendations
  };
}
