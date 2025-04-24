
import { WebVitalsMetrics } from '@/types/performance';

export const WebVitalsCollector = {
  measureWebVitals: (callback: (metrics: Partial<WebVitalsMetrics>) => void) => {
    if (typeof window === 'undefined') return;

    try {
      // LCP measurement
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        callback({ lcp: lastEntry.startTime });
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // FID measurement
      new PerformanceObserver((entryList) => {
        entryList.getEntries().forEach(entry => {
          if (entry.entryType === 'first-input' && entry instanceof PerformanceEventTiming) {
            const value = entry.processingStart ? entry.processingStart - entry.startTime : entry.duration;
            callback({ fid: value });
          }
        });
      }).observe({ type: 'first-input', buffered: true });

      // CLS measurement
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            callback({ cls: clsValue });
          }
        });
      }).observe({ type: 'layout-shift', buffered: true });

      // Navigation timing metrics
      new PerformanceObserver((entryList) => {
        const navEntry = entryList.getEntries()[0] as PerformanceNavigationTiming;
        callback({ 
          ttfb: navEntry.responseStart - navEntry.requestStart,
          fcp: navEntry.domContentLoadedEventEnd
        });
      }).observe({ type: 'navigation', buffered: true });

    } catch (error) {
      console.error('Web Vitals measurement error:', error);
    }
  }
};
