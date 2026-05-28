export interface User {
  id: string;
  name?: string;
  email: string;
  picture?: string;
}

export interface Benchmarks {
  total_lines: number;
  lines_per_sec: number;
  t_total: number;
  num_chunks: number;
  num_workers: number;
  t_split: number;
  t_map: number;
  t_shuffle: number;
  t_reduce: number;
}

export interface Insight {
  title: string;
  detail: string;
  type: 'security' | 'performance' | 'traffic' | 'anomaly';
  severity: 'high' | 'medium' | 'low';
}

export interface AnalysisResult {
  id: number;
  filename: string;
  result: Record<string, number>;
  benchmarks: Benchmarks;
  insights: Insight[];
  uploaded_by: string;
  created_at: string;
}
