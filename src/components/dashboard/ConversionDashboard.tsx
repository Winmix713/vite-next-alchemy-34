
import { useState } from "react";
import { toast } from "sonner";
import ProjectStats from "./ProjectStats";
import ConversionOptions from "./ConversionOptions";
import CodePreviewTabs from "./CodePreviewTabs";
import ConversionProgress from "./ConversionProgress";
import { ConversionOptions as ConversionOptionsType } from "@/types/conversion";
import { ConversionExecutor } from "@/services/conversionExecutor";
import { useConversion } from "@/context/ConversionContext";

interface ConversionDashboardProps {
  projectData: any;
  onStartConversion: () => void;
  isConverting: boolean;
}

const ConversionDashboard = ({ 
  projectData, 
  onStartConversion: parentOnStartConversion,
  isConverting: parentIsConverting 
}: ConversionDashboardProps) => {
  const { state, dispatch } = useConversion();
  const [options, setOptions] = useState<ConversionOptionsType>({
    useReactRouter: true,
    convertApiRoutes: true,
    transformDataFetching: true,
    replaceComponents: true,
    updateDependencies: true,
    preserveTypeScript: true,
    handleMiddleware: true
  });
  
  // Use parent state if provided, otherwise use local state
  const conversionInProgress = parentIsConverting || state.isConverting;

  const toggleOption = (option: keyof ConversionOptionsType) => {
    setOptions(prev => {
      const newOptions = { ...prev, [option]: !prev[option] };
      dispatch({ 
        type: "SET_CONVERSION_OPTIONS", 
        payload: {
          ...state.conversionOptions,
          [option]: !state.conversionOptions[option]
        }
      });
      return newOptions;
    });
  };

  const handleStartConversion = async () => {
    try {
      dispatch({ type: "SET_IS_CONVERTING", payload: true });
      dispatch({ 
        type: "SET_CONVERSION_PROGRESS", 
        payload: { progress: 0, message: "Starting conversion..." }
      });
      
      // Notify parent component
      parentOnStartConversion();
      
      toast.info("Starting Next.js to Vite conversion process...");
      
      if (projectData && projectData.files && projectData.packageJson) {
        const executor = new ConversionExecutor(
          projectData.files,
          options
        );
        
        executor.setProgressCallback((progress, message) => {
          dispatch({ 
            type: "SET_CONVERSION_PROGRESS", 
            payload: { progress, message } 
          });
        });
        
        const result = await executor.execute();
        
        if (result.success) {
          toast.success("Conversion completed successfully!");
          dispatch({ 
            type: "SET_CONVERSION_RESULT", 
            payload: { success: true, result } 
          });
        } else {
          toast.error(`Conversion completed with ${result.errors.length} errors.`);
          dispatch({ 
            type: "SET_CONVERSION_RESULT", 
            payload: { success: false, result } 
          });
        }
      } else {
        toast.error("Project data is missing. Please upload a valid Next.js project.");
      }
    } catch (error) {
      toast.error(`Error during conversion: ${error instanceof Error ? error.message : String(error)}`);
      dispatch({ 
        type: "SET_CONVERSION_ERROR", 
        payload: error instanceof Error ? error.message : String(error)
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <ProjectStats projectData={projectData} />
        <ConversionOptions 
          options={options}
          onOptionToggle={toggleOption}
          onStartConversion={handleStartConversion}
          isConverting={conversionInProgress}
        />
      </div>

      <CodePreviewTabs />

      {conversionInProgress && (
        <ConversionProgress 
          currentProgress={state.progress} 
          currentMessage={state.progressMessage}
        />
      )}
    </div>
  );
};

export default ConversionDashboard;

