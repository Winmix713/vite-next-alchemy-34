
export async function analyzeMiddleware(files: File[]) {
  const middlewares = [];
  let complexMiddlewares = 0;
  
  for (const file of files) {
    if (file.name.includes('middleware')) {
      const content = await readFileContent(file);
      const isComplex = content.includes('edge') || content.includes('matcher');
      if (isComplex) complexMiddlewares++;
      middlewares.push({
        name: file.name,
        isComplex
      });
    }
  }
  
  return {
    middlewares,
    complexMiddlewares
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
