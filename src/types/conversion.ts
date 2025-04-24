
import { NextJsRoute } from './route';

export interface ConversionOptions {
  useReactRouter: boolean;
  convertApiRoutes: boolean;
  transformDataFetching: boolean;
  replaceComponents: boolean;
  updateDependencies: boolean;
  preserveTypeScript: boolean;
  handleMiddleware: boolean;
}

export interface ConversionProgress {
  progress: number; // 0-100
  message: string;
}

export interface ConversionError {
  file: string;
  message: string;
  line?: number;
  column?: number;
}

export interface ConversionResult {
  success: boolean;
  transformedFiles: {
    path: string;
    content: string;
    original?: string;
  }[];
  newFiles: {
    path: string;
    content: string;
  }[];
  deletedFiles: string[];
  errors: ConversionError[];
  warnings: string[];
  conversionTime: number;
}

export interface RouteConversionResult {
  originalPath: string;
  convertedPath: string;
  component: string;
  imports: string[];
  code: string;
}
