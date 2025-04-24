
import { CodebaseAnalysis, ComponentAnalysis } from '@/types/analyzer';
import { analyzeCodeStructure } from '../astTransformer';

export async function analyzeCodebase(files: File[]): Promise<CodebaseAnalysis> {
  let reactComponents = 0;
  let hooks = 0;
  let apiRoutes = 0;
  let jsFiles = 0;
  let tsFiles = 0;
  let cssFiles = 0;
  const nextjsFeatureUsage: Record<string, number> = {
    'next/image': 0,
    'next/link': 0,
    'next/head': 0,
    'next/router': 0,
    'getServerSideProps': 0,
    'getStaticProps': 0,
    'getStaticPaths': 0,
    'useRouter': 0
  };

  for (const file of files) {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) jsFiles++;
    else if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) tsFiles++;
    else if (fileName.endsWith('.css') || fileName.endsWith('.scss')) cssFiles++;
    
    if (fileName.includes('/api/') || fileName.includes('\\api\\')) apiRoutes++;
    
    const content = await readFileContent(file);
    
    if (fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) {
      try {
        const analysis = analyzeCodeStructure(content);
        reactComponents += analysis.components.length;
        hooks += analysis.hooks.length;
        
        // Feature detection using string matching
        for (const feature of Object.keys(nextjsFeatureUsage)) {
          if (content.includes(feature)) {
            nextjsFeatureUsage[feature]++;
          }
        }
      } catch (error) {
        console.error(`Error analyzing ${fileName}:`, error);
      }
    }
  }

  return {
    totalFiles: files.length,
    jsFiles,
    tsFiles,
    reactComponents,
    hooks,
    cssFiles,
    apiRoutes,
    nextjsFeatureUsage
  };
}

export async function analyzeComponents(files: File[]): Promise<ComponentAnalysis> {
  let totalComponents = 0;
  let nextjsSpecificComponents = 0;
  let pureReactComponents = 0;
  let componentsWithDataFetching = 0;
  let componentsWithRouting = 0;

  for (const file of files) {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.jsx') || fileName.endsWith('.tsx')) {
      const content = await readFileContent(file);
      
      try {
        const analysis = analyzeCodeStructure(content);
        totalComponents += analysis.components.length;
        
        // Check for Next.js specific imports
        if (content.includes('next/') ||
            content.includes('getServerSideProps') ||
            content.includes('getStaticProps') ||
            content.includes('getStaticPaths')) {
          nextjsSpecificComponents++;
        } else {
          pureReactComponents++;
        }
        
        // Check for data fetching
        if (content.includes('getServerSideProps') ||
            content.includes('getStaticProps') ||
            content.includes('getStaticPaths') ||
            content.includes('useQuery') ||
            content.includes('useSWR') ||
            content.includes('fetch(')) {
          componentsWithDataFetching++;
        }
        
        // Check for routing
        if (content.includes('useRouter') ||
            content.includes('next/router') ||
            content.includes('next/link') ||
            content.includes('next/navigation')) {
          componentsWithRouting++;
        }
      } catch (error) {
        console.error(`Error analyzing components in ${fileName}:`, error);
      }
    }
  }

  return {
    totalComponents,
    nextjsSpecificComponents,
    pureReactComponents,
    componentsWithDataFetching,
    componentsWithRouting
  };
}

async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(new Error("File reading error"));
    reader.readAsText(file);
  });
}
