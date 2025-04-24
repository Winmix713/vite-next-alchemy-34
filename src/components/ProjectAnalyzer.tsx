
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { performSystemAnalysis } from "@/services/analyzers/systemValidator";
import { SystemAnalysisResult } from "@/types/analyzer";
import { toast } from "sonner";

interface ProjectAnalyzerProps {
  files: File[];
  onAnalysisComplete: (results: any) => void;
}

const ProjectAnalyzer = ({ files, onAnalysisComplete }: ProjectAnalyzerProps) => {
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");
  const [stats, setStats] = useState({
    totalFiles: 0,
    nextComponents: 0,
    apiRoutes: 0,
    dataFetching: 0,
    complexityScore: 0
  });
  const [analysisResult, setAnalysisResult] = useState<SystemAnalysisResult | null>(null);

  useEffect(() => {
    if (!files.length) return;
    
    const totalFiles = files.length;
    let processedFiles = 0;

    // Analyze files
    const analyzeFiles = async () => {
      try {
        // Simulate some initial processing
        for (let i = 0; i < Math.min(5, files.length); i++) {
          setCurrentFile(files[i].name);
          await new Promise(resolve => setTimeout(resolve, 100));
          processedFiles++;
          setProgress(Math.floor((processedFiles / (totalFiles + 10)) * 100));
        }
        
        // Extract package.json if available
        const packageJsonFile = files.find(file => file.name.endsWith('package.json'));
        let packageJson = null;
        
        if (packageJsonFile) {
          try {
            const content = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = e => resolve(e.target?.result as string);
              reader.onerror = reject;
              reader.readAsText(packageJsonFile);
            });
            packageJson = JSON.parse(content);
          } catch (error) {
            console.error("Error parsing package.json:", error);
          }
        }
        
        // Perform deeper system analysis
        setCurrentFile("Performing system analysis...");
        const result = await performSystemAnalysis(files, packageJson);
        setAnalysisResult(result);
        
        // Convert result to compatible format for other components
        const compatibleResults = {
          totalFiles: result.codebase.totalFiles,
          nextComponents: result.components.totalComponents,
          apiRoutes: result.codebase.apiRoutes,
          dataFetching: (
            (result.codebase.nextjsFeatureUsage['getServerSideProps'] || 0) + 
            (result.codebase.nextjsFeatureUsage['getStaticProps'] || 0)
          ),
          complexityScore: result.readiness.score
        };
        
        setStats(compatibleResults);
        setProgress(100);
        
        // Pass results back to parent
        onAnalysisComplete({
          ...compatibleResults,
          systemAnalysisResult: result
        });
        
        // Show toast message with complexity info
        const complexityCategory = result.readiness.category;
        const toastMessage = `Project analysis complete: ${complexityCategory} conversion complexity detected.`;
        const toastType = complexityCategory === 'simple' ? 'success' : 
                         complexityCategory === 'moderate' ? 'info' : 'warning';
        
        if (toastType === 'success') {
          toast.success(toastMessage);
        } else if (toastType === 'info') {
          toast.info(toastMessage);
        } else {
          toast.warning(toastMessage);
        }
        
      } catch (error) {
        console.error("Analysis error:", error);
        toast.error(`Analysis error: ${error instanceof Error ? error.message : String(error)}`);
        setProgress(100); // Ensure progress completes even on error
      }
    };

    analyzeFiles();
  }, [files, onAnalysisComplete]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Analyzing Project</CardTitle>
        <CardDescription>Scanning files and determining conversion complexity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{currentFile}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="text-sm text-gray-500">Total Files</div>
              <div className="text-2xl font-semibold">{stats.totalFiles}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="text-sm text-gray-500">Next.js Components</div>
              <div className="text-2xl font-semibold">{stats.nextComponents}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="text-sm text-gray-500">API Routes</div>
              <div className="text-2xl font-semibold">{stats.apiRoutes}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="text-sm text-gray-500">Data Fetching</div>
              <div className="text-2xl font-semibold">{stats.dataFetching}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm">Complexity Score</span>
            <div>
              <Badge variant={
                stats.complexityScore > 70 ? "outline" : 
                stats.complexityScore > 40 ? "secondary" : 
                "destructive"
              }>
                {stats.complexityScore > 70 ? "Easy" : 
                 stats.complexityScore > 40 ? "Moderate" : 
                 "Complex"}
              </Badge>
            </div>
          </div>
          <Progress 
            value={stats.complexityScore} 
            className={`h-2 ${
              stats.complexityScore > 70 ? "bg-green-400" : 
              stats.complexityScore > 40 ? "bg-yellow-400" : 
              "bg-red-400"
            }`}
          />
          
          {analysisResult && analysisResult.readiness.manualInterventionAreas.length > 0 && (
            <div className="mt-4 text-xs text-amber-700">
              <p className="font-medium">Areas requiring attention:</p>
              <ul className="mt-1 space-y-1 ml-4">
                {analysisResult.readiness.manualInterventionAreas.map((area, i) => (
                  <li key={i} className="list-disc">{area}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectAnalyzer;
