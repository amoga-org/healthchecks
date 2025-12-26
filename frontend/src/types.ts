export interface MonitorStat {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  status?: 'success' | 'warning' | 'error' | 'neutral';
}

export interface LatencyMetric {
  quantile: string;
  value: string;
  change: number;
}

export interface IncidentEvent {
  id: string;
  title: string;
  date: string;
  timeAgo: string;
  status: 'monitoring' | 'resolved' | 'identified';
  body: string;
  updates: {
    status: 'monitoring' | 'resolved' | 'investigating';
    date: string;
    text: string;
  }[];
  affectedComponents: string[];
}

export interface SystemComponent {
  name: string;
  uptime: number;
  status: 'operational' | 'degraded' | 'outage';
  history: ('operational' | 'degraded' | 'outage')[]; // Array representing daily status
}