
export interface ConversionOptions {
  useReactRouter: boolean;
  convertApiRoutes: boolean;
  transformDataFetching: boolean;
  replaceComponents: boolean;
  updateDependencies: boolean;
  preserveTypeScript: boolean;
  handleMiddleware: boolean;
}

export interface ConversionState {
  isConverting: boolean;
  conversionOptions: ConversionOptions;
  progress: number;
  message: string;
  projectData?: {
    files: File[];
    packageJson?: any;
  };
  originalCode?: string;
  convertedCode?: string;
  conversionResult?: ConversionResult;
  conversionError?: string;
  systemAnalysis?: any;
}

export interface ConversionContextType {
  state: ConversionState;
  dispatch: (action: any) => void;
}

export interface ConversionResult {
  success: boolean;
  files: {
    original: string;
    converted: string;
    path: string;
  }[];
  stats: {
    totalFiles: number;
    convertedFiles: number;
    conversionRate: number;
    errors: number;
    warnings: number;
  };
  errors: {
    file: string;
    message: string;
  }[];
  warnings: {
    file: string;
    message: string;
  }[];
}
