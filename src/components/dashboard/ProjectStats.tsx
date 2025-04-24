
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SystemAnalysisResult } from "@/types/analyzer";
import { AlertTriangle, CheckCircle, FileText, Layout, Server } from "lucide-react";

interface ProjectStatsProps {
  projectData: {
    totalFiles: number;
    nextJsComponents: number;
    apiRoutes: number;
    dataFetchingMethods: number;
    complexityScore: number;
  };
  analysisResult?: SystemAnalysisResult;
}

const ProjectStats = ({ projectData, analysisResult }: ProjectStatsProps) => {
  const getComplexityLabel = (score: number) => {
    if (score < 30) return { label: "Easy", color: "bg-green-100 text-green-800" };
    if (score < 60) return { label: "Moderate", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Complex", color: "bg-red-100 text-red-800" };
  };

  const complexityInfo = analysisResult?.readiness
    ? getComplexityLabel(analysisResult.readiness.score)
    : getComplexityLabel(projectData.complexityScore);
  
  const totalFiles = analysisResult?.codebase.totalFiles || projectData.totalFiles;
  const components = analysisResult?.components.totalComponents || projectData.nextJsComponents;
  const apiRoutes = analysisResult?.codebase.apiRoutes || projectData.apiRoutes;
  const dataFetchingMethods = analysisResult?.codebase.nextjsFeatureUsage?.['getServerSideProps'] +
    (analysisResult?.codebase.nextjsFeatureUsage?.['getStaticProps'] || 0) || 
    projectData.dataFetchingMethods;
  
  const complexityScore = analysisResult?.readiness.score || projectData.complexityScore;
  
  const validationStatus = analysisResult?.validation.valid 
    ? { icon: <CheckCircle className="h-5 w-5 text-green-600" />, text: "System Valid" }
    : { icon: <AlertTriangle className="h-5 w-5 text-amber-600" />, text: "Issues Found" };

  return (
    <Card className="w-full md:w-3/4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Project Analysis Results</CardTitle>
            <CardDescription>Your Next.js project analysis summary</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {validationStatus.icon}
            <Badge className={complexityInfo.color}>
              {complexityInfo.label} Conversion
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-gray-500">Total Files</div>
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-semibold">{totalFiles}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-gray-500">Components</div>
              <Layout className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-semibold">{components}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm text-gray-500">API Routes</div>
              <Server className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-semibold">{apiRoutes}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="text-sm text-gray-500">Data Fetching Methods</div>
            <div className="text-2xl font-semibold">{dataFetchingMethods}</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Conversion Readiness</h3>
            <span className="text-sm font-medium">{complexityScore}/100</span>
          </div>
          <Progress value={complexityScore} className={`h-2 ${
            complexityScore > 70 ? "bg-green-400" : 
            complexityScore > 40 ? "bg-yellow-400" : 
            "bg-red-400"
          }`} />
          
          {analysisResult?.readiness && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Recommendations:</h4>
              <ul className="text-xs text-gray-600 space-y-1 ml-4">
                {analysisResult.readiness.recommendations.slice(0, 3).map((rec, i) => (
                  <li key={i} className="list-disc">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectStats;
