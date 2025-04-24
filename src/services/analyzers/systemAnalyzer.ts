
import { AnalyzerComponent, SystemAnalysisResult, ValidationResult } from '@/types/analyzer';
import { ConversionOptions } from '@/types/conversion';
import { PerformanceMonitor } from '../performanceMonitor';
import { DiagnosticsReporter } from '../diagnosticsReporter';
import { analyzeDependencies } from './dependencyAnalyzer';
import { analyzeCodebase, analyzeComponents } from './codebaseAnalyzer';
import { analyzeRouting } from './routingAnalyzer';
import { analyzeMiddleware } from './middlewareAnalyzer';
import { analyzeTypeScript } from './typeScriptAnalyzer';
import { analyzeApiRoutes } from './apiRoutesAnalyzer';
import { calculateConversionReadiness } from './readinessAnalyzer';

export class SystemAnalyzer {
  private files: File[];
  private packageJson: any;
  private options: ConversionOptions;
  private performanceMonitor: PerformanceMonitor;
  private diagnosticsReporter: DiagnosticsReporter;
  
  constructor(files: File[], packageJson: any, options: ConversionOptions) {
    this.files = files;
    this.packageJson = packageJson;
    this.options = options;
    this.performanceMonitor = new PerformanceMonitor({ debugMode: true });
    this.diagnosticsReporter = new DiagnosticsReporter('Project Analysis', options);
  }
  
  async runSystemAnalysis() {
    this.performanceMonitor.startMeasurement();
    
    try {
      // 1. Analyze codebase
      const codebaseAnalysis = await analyzeCodebase(this.files);
      
      // 2. Analyze dependencies
      const dependencyAnalysis = analyzeDependencies(this.packageJson);
      
      // 3. Analyze routing
      const routingAnalysis = await analyzeRouting(this.files);
      
      // 4. Analyze middleware
      const middlewareAnalysis = await analyzeMiddleware(this.files);
      
      // 5. Analyze TypeScript
      const typescriptAnalysis = await analyzeTypeScript(this.files);
      
      // 6. Analyze API routes
      const apiAnalysis = await analyzeApiRoutes(this.files);
      
      // 7. Calculate readiness
      const readiness = calculateConversionReadiness({
        codebase: codebaseAnalysis,
        components: await analyzeComponents(this.files),
        dependencies: dependencyAnalysis,
        routing: routingAnalysis
      });
      
      // 8. Validate system components
      const validation = await this.validateSystem();
      
      this.performanceMonitor.endMeasurement();
      
      return {
        diagnostics: this.diagnosticsReporter.generateReport(),
        performance: this.performanceMonitor.getMetrics(),
        analysis: {
          codebase: codebaseAnalysis,
          dependencies: dependencyAnalysis,
          routing: routingAnalysis,
          middleware: middlewareAnalysis,
          typescript: typescriptAnalysis,
          api: apiAnalysis,
          readiness
        },
        validation
      };
      
    } catch (error) {
      this.performanceMonitor.endMeasurement();
      this.diagnosticsReporter.addError('system', `System analysis error: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  private async validateSystem(): Promise<ValidationResult> {
    const components: AnalyzerComponent[] = [
      { name: 'codebaseAnalyzer', status: 'ok' },
      { name: 'dependencyAnalyzer', status: 'ok' },
      { name: 'routingAnalyzer', status: 'ok' },
      { name: 'middlewareAnalyzer', status: 'ok' },
      { name: 'typeScriptAnalyzer', status: 'ok' },
      { name: 'apiRoutesAnalyzer', status: 'ok' }
    ];
    
    const issues: string[] = [];
    
    try {
      // Validate each component
      for (const component of components) {
        try {
          await this.validateComponent(component);
        } catch (error) {
          component.status = 'error';
          component.message = error instanceof Error ? error.message : String(error);
          issues.push(`${component.name} validation error: ${component.message}`);
        }
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
  
  private async validateComponent(component: AnalyzerComponent) {
    // Implement component-specific validation logic
    switch (component.name) {
      case 'codebaseAnalyzer':
        await analyzeCodebase(this.files);
        break;
      case 'dependencyAnalyzer':
        analyzeDependencies(this.packageJson);
        break;
      case 'routingAnalyzer':
        await analyzeRouting(this.files);
        break;
      // Add more component validations as needed
    }
  }
}
