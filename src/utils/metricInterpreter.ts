
import { MetricInterpretation, WebVitalsInterpretation } from '@/types/performance';

export function getMetricScore(value: number, goodThreshold: number, poorThreshold: number): 'good' | 'needs-improvement' | 'poor' {
  if (value <= goodThreshold) return 'good';
  if (value <= poorThreshold) return 'needs-improvement';
  return 'poor';
}

export function interpretWebVitals(metrics: {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
}): WebVitalsInterpretation {
  return {
    lcp: interpretMetric('lcp', metrics.lcp || 0, 2500, 4000),
    fid: interpretMetric('fid', metrics.fid || 0, 100, 300),
    cls: interpretMetric('cls', metrics.cls || 0, 0.1, 0.25),
    ttfb: interpretMetric('ttfb', metrics.ttfb || 0, 800, 1800),
    fcp: interpretMetric('fcp', metrics.fcp || 0, 1800, 3000)
  };
}

function interpretMetric(
  metric: string,
  value: number,
  goodThreshold: number,
  poorThreshold: number
): MetricInterpretation {
  const score = getMetricScore(value, goodThreshold, poorThreshold);
  
  return {
    score,
    value,
    threshold: { good: goodThreshold, poor: poorThreshold },
    description: getMetricDescription(metric, score)
  };
}

function getMetricDescription(metric: string, score: 'good' | 'needs-improvement' | 'poor'): string {
  const descriptions: Record<string, Record<string, string>> = {
    lcp: {
      good: 'Fast loading: Main content appears quickly.',
      'needs-improvement': 'Moderate loading: Main content display could be improved.',
      poor: 'Slow loading: Users wait too long for content.'
    },
    fid: {
      good: 'Good interactivity: App responds quickly to user actions.',
      'needs-improvement': 'Moderate interactivity: App response time could be improved.',
      poor: 'Poor interactivity: Users experience significant delays.'
    },
    cls: {
      good: 'Visually stable: Minimal unexpected layout shifts.',
      'needs-improvement': 'Moderate stability: Some layout shifts noticed.',
      poor: 'Unstable: Disruptive layout shifts during loading.'
    },
    ttfb: {
      good: 'Fast server response: Server responds quickly to requests.',
      'needs-improvement': 'Moderate server response: Server response time could be improved.',
      poor: 'Slow server response: Server takes too long to respond.'
    },
    fcp: {
      good: 'Fast initial render: Content appears quickly.',
      'needs-improvement': 'Moderate initial render: Initial content display could be improved.',
      poor: 'Slow initial render: Initial content takes too long to appear.'
    }
  };
  
  return descriptions[metric]?.[score] || 'No description available';
}
