
import { DependencyAnalysis } from '@/types/analyzer';

export function analyzeDependencies(packageJson: any): DependencyAnalysis {
  if (!packageJson || (!packageJson.dependencies && !packageJson.devDependencies)) {
    return {
      dependencies: [],
      compatibility: {
        compatible: true,
        issues: []
      }
    };
  }

  const dependencies: {
    name: string;
    version: string;
    type: 'production' | 'development';
    isNextjsSpecific: boolean;
    recommendedReplacement?: string;
  }[] = [];
  
  const issues: string[] = [];
  
  // Map of Next.js specific packages to their Vite/React alternatives
  const nextjsReplacements: Record<string, string> = {
    'next': 'react + react-dom + react-router-dom',
    'next-auth': '@auth/core',
    '@next/font': 'fontsource',
    'next-themes': 'usehooks-ts',
    'next-i18next': 'i18next + react-i18next',
    'next-seo': 'react-helmet-async',
    'next-sitemap': 'vite-plugin-sitemap'
  };
  
  // Process dependencies
  if (packageJson.dependencies) {
    for (const [name, version] of Object.entries<string>(packageJson.dependencies)) {
      const isNextjsSpecific = name === 'next' || name.startsWith('next-') || name.startsWith('@next/');
      
      dependencies.push({
        name,
        version: version.replace(/[\^~]/g, ''),
        type: 'production',
        isNextjsSpecific,
        recommendedReplacement: isNextjsSpecific ? nextjsReplacements[name] || 'unknown' : undefined
      });
      
      if (isNextjsSpecific) {
        issues.push(`The dependency "${name}" is Next.js specific and needs replacement`);
      }
    }
  }
  
  // Process devDependencies
  if (packageJson.devDependencies) {
    for (const [name, version] of Object.entries<string>(packageJson.devDependencies)) {
      const isNextjsSpecific = name === 'next' || name.startsWith('next-') || name.startsWith('@next/');
      
      dependencies.push({
        name,
        version: version.replace(/[\^~]/g, ''),
        type: 'development',
        isNextjsSpecific,
        recommendedReplacement: isNextjsSpecific ? nextjsReplacements[name] || 'unknown' : undefined
      });
      
      if (isNextjsSpecific) {
        issues.push(`The dev dependency "${name}" is Next.js specific and needs replacement`);
      }
    }
  }
  
  // Check for Next.js peer dependencies
  const hasReact = dependencies.some(d => d.name === 'react');
  const hasReactDom = dependencies.some(d => d.name === 'react-dom');
  const hasNextjs = dependencies.some(d => d.name === 'next');
  
  if (hasNextjs && (!hasReact || !hasReactDom)) {
    issues.push('Missing React or React DOM dependencies which are required');
  }
  
  // Special checks for file-system based routing vs router dependencies
  const hasNextRouter = dependencies.some(d => d.name === 'next/router');
  const hasReactRouter = dependencies.some(d => d.name === 'react-router' || d.name === 'react-router-dom');
  
  if (hasNextRouter && !hasReactRouter) {
    issues.push('Next.js router is used but no React Router dependency is found for replacement');
  }
  
  return {
    dependencies,
    compatibility: {
      compatible: issues.length === 0,
      issues
    }
  };
}

export function checkVersionCompatibility(dependencies: DependencyAnalysis['dependencies']): {
  compatible: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for React 18 compatibility
  const reactDep = dependencies.find(d => d.name === 'react');
  if (reactDep) {
    const version = parseInt(reactDep.version.split('.')[0], 10);
    if (version < 18) {
      issues.push(`React version ${reactDep.version} is less than the recommended version 18 for Vite projects`);
    }
  }
  
  // Check for TypeScript compatibility
  const tsDep = dependencies.find(d => d.name === 'typescript');
  if (tsDep) {
    const version = parseInt(tsDep.version.split('.')[0], 10);
    if (version < 4.5) {
      issues.push(`TypeScript version ${tsDep.version} is less than the recommended version 4.5 for Vite projects`);
    }
  }
  
  // Check for Next.js incompatible packages
  const nextDep = dependencies.find(d => d.name === 'next');
  if (nextDep) {
    issues.push(`Next.js package will need to be removed and replaced with Vite`);
  }
  
  return {
    compatible: issues.length === 0,
    issues
  };
}
