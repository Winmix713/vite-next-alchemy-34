
export async function analyzeApiRoutes(files: File[]) {
  let apiFiles = 0;
  let apiEndpoints = 0;
  let dynamicApiEndpoints = 0;
  
  for (const file of files) {
    const fileName = file.name;
    
    if ((fileName.includes('/api/') || fileName.includes('\\api\\')) && 
        (fileName.endsWith('.js') || fileName.endsWith('.ts'))) {
      apiFiles++;
      apiEndpoints++;
      
      if (fileName.includes('[') && fileName.includes(']')) {
        dynamicApiEndpoints++;
      }
    }
  }
  
  return {
    apiFiles,
    apiEndpoints,
    dynamicApiEndpoints
  };
}
