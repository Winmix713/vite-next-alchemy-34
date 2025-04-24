
export interface TransformationRule {
  pattern: RegExp;
  replacement: string | ((match: string, ...args: any[]) => string);
  description: string;
  complexity: 'simple' | 'medium' | 'complex';
  category: 'component' | 'routing' | 'data-fetching' | 'api' | 'config' | 'general';
}

export interface TransformResult {
  transformedCode: string;
  appliedTransformations: string[];
  changes: string[];
  warnings: string[];
}

export interface ComponentTransformResult {
  name: string;
  originalImport: string;
  newImport: string;
  usageTransformations: {
    original: string;
    transformed: string;
  }[];
}

export interface RouteTransformResult {
  originalPath: string;
  newPath: string;
  parameterChanges: {
    original: string;
    transformed: string;
  }[];
}
