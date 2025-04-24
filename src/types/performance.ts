
export interface PerformanceMetrics {
  buildTime: number;
  bundleSize: {
    before: number;
    after: number;
    difference: number;
  };
  loadTime: {
    before: number;
    after: number;
    improvement: number;
  };
  memoryUsage: number;
  networkRequests?: {
    count: number;
    size: number;
    timeToFirstByte: number;
    cacheable: number;
  };
}

export interface WebVitalsMetrics {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  fcp: number;
  inp?: number;
  tbt?: number;
  speedIndex?: number;
}

export interface WebVitalsInterpretation {
  lcp: MetricInterpretation;
  fid: MetricInterpretation;
  cls: MetricInterpretation;
  ttfb: MetricInterpretation;
  fcp: MetricInterpretation;
}

export interface MetricInterpretation {
  score: 'good' | 'needs-improvement' | 'poor';
  value: number;
  threshold: {
    good: number;
    poor: number;
  };
  description: string;
}

export interface BenchmarkResults {
  renderTime: number;
  hydrationTime?: number;
  routeChangeTime?: number;
  firstRenderTime: number;
  ttfb: number;
  dataFetchTime?: number;
  config: BenchmarkConfig;
}

export interface BenchmarkConfig {
  runs: number;
  warmupRuns: number;
  routeChanges?: string[];
  networkThrottling?: {
    downloadSpeed: number;
    uploadSpeed: number;
    latency: number;
  };
  cpuThrottling?: number;
}

export interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}
