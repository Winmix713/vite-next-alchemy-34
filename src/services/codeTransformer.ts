
import { TransformationRule, TransformResult } from '@/types/transformerTypes';
import { routingTransformationRules } from './transformers/rules/routingRules';
import { componentTransformationRules } from './transformers/rules/componentRules';
import { dataFetchingTransformationRules } from './transformers/rules/dataFetchingRules';

const allTransformationRules: TransformationRule[] = [
  ...routingTransformationRules,
  ...componentTransformationRules,
  ...dataFetchingTransformationRules
];

export function transformCode(sourceCode: string): TransformResult {
  const appliedTransformations: string[] = [];
  const changes: string[] = [];
  const warnings: string[] = [];
  let transformedCode = sourceCode;

  for (const rule of allTransformationRules) {
    if (rule.pattern.test(transformedCode)) {
      const originalCode = transformedCode;
      transformedCode = transformedCode.replace(rule.pattern, rule.replacement as any);
      appliedTransformations.push(rule.description);
      changes.push(`Applied ${rule.description}`);
    }
  }

  return {
    transformedCode,
    appliedTransformations,
    changes,
    warnings
  };
}

export function getTransformationsByCategory(category: string): TransformationRule[] {
  return allTransformationRules.filter(rule => rule.category === category);
}

export function getTransformationsByComplexity(complexity: 'simple' | 'medium' | 'complex'): TransformationRule[] {
  return allTransformationRules.filter(rule => rule.complexity === complexity);
}
