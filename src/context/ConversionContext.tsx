
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ConversionOptions, ConversionResult } from '@/types/conversion';

export type ConversionState = {
  originalCode: string;
  convertedCode: string;
  isConverting: boolean;
  progress: number;
  progressMessage: string;
  conversionOptions: {
    useReactRouter: boolean;
    convertApiRoutes: boolean;
    transformDataFetching: boolean;
    replaceComponents: boolean;
    updateDependencies: boolean;
    preserveTypeScript: boolean;
    handleMiddleware: boolean;
  };
};

export type ConversionAction =
  | { type: 'UPDATE_ORIGINAL_CODE'; payload: string }
  | { type: 'UPDATE_CONVERTED_CODE'; payload: string }
  | { type: 'SET_IS_CONVERTING'; payload: boolean }
  | { type: 'SET_CONVERSION_OPTIONS'; payload: ConversionState['conversionOptions'] }
  | { type: 'SET_CONVERSION_PROGRESS'; payload: { progress: number; message: string } }
  | { type: 'SET_CONVERSION_RESULT'; payload: { success: boolean; result: ConversionResult } }
  | { type: 'SET_CONVERSION_ERROR'; payload: string };

type ConversionContextType = {
  state: ConversionState;
  dispatch: React.Dispatch<ConversionAction>;
};

const defaultState: ConversionState = {
  originalCode: '',
  convertedCode: '',
  isConverting: false,
  progress: 0,
  progressMessage: '',
  conversionOptions: {
    useReactRouter: true,
    convertApiRoutes: true,
    transformDataFetching: true,
    replaceComponents: true,
    updateDependencies: true,
    preserveTypeScript: true,
    handleMiddleware: true,
  },
};

const conversionReducer = (state: ConversionState, action: ConversionAction): ConversionState => {
  switch (action.type) {
    case 'UPDATE_ORIGINAL_CODE':
      return { ...state, originalCode: action.payload };
    case 'UPDATE_CONVERTED_CODE':
      return { ...state, convertedCode: action.payload };
    case 'SET_IS_CONVERTING':
      return { ...state, isConverting: action.payload };
    case 'SET_CONVERSION_OPTIONS':
      return { ...state, conversionOptions: action.payload };
    case 'SET_CONVERSION_PROGRESS':
      return {
        ...state,
        progress: action.payload.progress,
        progressMessage: action.payload.message,
      };
    case 'SET_CONVERSION_RESULT':
      return {
        ...state,
        isConverting: false,
        convertedCode: action.payload.result.transformedFiles[0]?.content || '',
      };
    case 'SET_CONVERSION_ERROR':
      return {
        ...state,
        isConverting: false,
        progressMessage: `Error: ${action.payload}`,
      };
    default:
      return state;
  }
};

const ConversionContext = createContext<ConversionContextType | undefined>(undefined);

export const ConversionProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(conversionReducer, defaultState);

  return (
    <ConversionContext.Provider value={{ state, dispatch }}>
      {children}
    </ConversionContext.Provider>
  );
};

export const useConversion = () => {
  const context = useContext(ConversionContext);
  if (context === undefined) {
    throw new Error('useConversion must be used within a ConversionProvider');
  }
  return context;
};

