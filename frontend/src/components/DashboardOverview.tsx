import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Loader2,
  Clock,
  RefreshCw,
  Activity,
  Zap,
  TrendingUp,
  Gauge
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchMonitors, fetchMonitorStats, type Monitor, type MonitorStats } from '@/lib/api';

const DashboardOverview = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [selectedMonitor, setSelectedMonitor] = useState<Monitor | null>(null);
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMonitors();
  }, []);

  useEffect(() => {
    if (monitors.length > 0 && slug) {
      // Find the monitor by slug
      const monitor = monitors.find(m => m.slug.toLowerCase() === slug.toLowerCase());
      if (monitor) {
        setSelectedMonitor(monitor);
      }
    }
  }, [monitors, slug]);

  useEffect(() => {
    if (selectedMonitor) {
      loadStats(selectedMonitor.id);
    }
  }, [selectedMonitor]);

  const loadMonitors = async () => {
    try {
      setLoading(true);
      const data = await fetchMonitors();
      setMonitors(data);
    } catch (err) {
      setError('Failed to load monitors');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (monitorId: string) => {
    try {
      const data = await fetchMonitorStats(monitorId);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const formatLatency = (ms: number) => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(2)} sec`;
    return `${ms} ms`;
  };

  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <LayoutDashboard className="w-12 h-12 mb-4 text-gray-300" />
        <p>{error}</p>
      </div>
    );
  }

  if (monitors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <LayoutDashboard className="w-12 h-12 mb-4 text-gray-300" />
        <p>No monitors configured yet</p>
      </div>
    );
  }

  if (!selectedMonitor) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
        <LayoutDashboard className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">Select a monitor to view details</p>
        <p className="text-sm">Choose a monitor from the dropdown above</p>
      </div>
    );
  }

  const uptimeData = stats?.uptimeHistory || [];

  return (
    <>
        {/* Content */}
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            {/* Title Section */}
            <div className="mb-10 pb-6 border-b border-gray-200">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">{selectedMonitor?.slug}</h1>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full border border-green-200">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs font-medium text-green-700">Online</span>
                            </div>
                            <div className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                                Public
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs italic text-gray-500">{formatTimeAgo(stats?.lastChecked || null)}</span>
                        </div>
                        <button
                            onClick={() => selectedMonitor && loadStats(selectedMonitor.id)}
                            className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* URL Row */}
                <a href={selectedMonitor?.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-blue-600 hover:underline inline-flex items-center gap-1">
                    {selectedMonitor?.url}
                </a>
            </div>

            {/* Bento Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-1 mb-10">
                {/* Uptime Card - spans 2 columns and 2 rows on desktop */}
                <div className="md:col-span-2 md:row-span-2">
                    <UptimeCard
                        uptime={stats?.uptime || 100}
                        degraded={stats?.degraded || 0}
                        failing={stats?.failing || 0}
                    />
                </div>

                {/* Average Card - spans 2 columns on desktop */}
                <div className="md:col-span-2">
                    <LatencyCard
                        label="Average"
                        value={formatLatency(stats?.latency?.p50 || 0)}
                        change="-"
                        icon={Zap}
                        iconColor="text-yellow-600"
                        iconBg="bg-yellow-50"
                        iconBorder="border-yellow-200"
                    />
                </div>

                {/* P90 and P99 Cards - side by side, 1 column each */}
                <LatencyCard
                    label="P90"
                    value={formatLatency(stats?.latency?.p90 || 0)}
                    change="-"
                    icon={TrendingUp}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-50"
                    iconBorder="border-blue-200"
                />
                <LatencyCard
                    label="P99"
                    value={formatLatency(stats?.latency?.p99 || 0)}
                    change="-"
                    icon={Gauge}
                    iconColor="text-purple-600"
                    iconBg="bg-purple-50"
                    iconBorder="border-purple-200"
                />
            </div>

            {/* Uptime Chart Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Uptime</h2>
                        <p className="text-sm text-gray-500">Uptime across all the selected regions</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-green-500" /> Success</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-red-500" /> Error</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded bg-yellow-400" /> Degraded</div>
                    </div>
                </div>

                <div className="h-40 w-full">
                    {uptimeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={uptimeData} barGap={2} barCategoryGap={1}>
                              <Tooltip
                                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                              />
                              <Bar
                                  dataKey="duration"
                                  radius={[2, 2, 2, 2]}
                                  shape={(props: any) => {
                                      const { x, y, width, height, payload } = props;
                                      const color = payload.status === 2 ? '#22c55e' : payload.status === 1 ? '#facc15' : '#ef4444';
                                      return <rect x={x} y={y} width={width} height={height} fill={color} rx={2} />;
                                  }}
                              />
                          </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        No data available yet
                      </div>
                    )}
                </div>
            </div>

        </div>
    </>
  );
};

// Sub-components
const UptimeCard = ({ uptime, degraded, failing }: { uptime: number, degraded: number, failing: number }) => {
    // Ensure values are numbers to avoid toFixed errors
    const degradedPercent = Number(degraded) || 0;
    const failingPercent = Number(failing) || 0;
    // Calculate success percentage: should be 100 - degraded - failing
    const successPercent = Math.max(0, 100 - degradedPercent - failingPercent);
    // Display uptime (which might be calculated differently by API)
    const displayUptime = Number(uptime) || successPercent;

    return (
        <div className="h-full p-6 border border-gray-200 bg-white flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-medium uppercase tracking-wider text-green-600">UPTIME</div>
                    <div className="p-2 bg-green-50 border border-green-200">
                        <Activity className="w-5 h-5 text-green-600" />
                    </div>
                </div>
                <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-semibold text-gray-900">{displayUptime.toFixed(2)}%</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    {successPercent > 0 && (
                        <div
                            className="bg-green-500 transition-all"
                            style={{ width: `${successPercent}%` }}
                            title={`Success: ${successPercent.toFixed(2)}%`}
                        />
                    )}
                    {degradedPercent > 0 && (
                        <div
                            className="bg-yellow-400 transition-all"
                            style={{ width: `${degradedPercent}%` }}
                            title={`Degraded: ${degradedPercent.toFixed(2)}%`}
                        />
                    )}
                    {failingPercent > 0 && (
                        <div
                            className="bg-red-500 transition-all"
                            style={{ width: `${failingPercent}%` }}
                            title={`Failed: ${failingPercent.toFixed(2)}%`}
                        />
                    )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-gray-600">Success {successPercent.toFixed(1)}%</span>
                    </div>
                    {degradedPercent > 0 && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                            <span className="text-gray-600">Degraded {degradedPercent.toFixed(1)}%</span>
                        </div>
                    )}
                    {failingPercent > 0 && (
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-gray-600">Failed {failingPercent.toFixed(1)}%</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, subValue, status }: { label: string, value: string, subValue: string, status: 'success' | 'warning' | 'error' }) => {
    const statusColors = {
        success: { text: 'text-green-600', bg: 'bg-green-50', subBg: 'bg-green-100', subText: 'text-green-700' },
        warning: { text: 'text-yellow-600', bg: 'bg-yellow-50', subBg: 'bg-yellow-100', subText: 'text-yellow-700' },
        error: { text: 'text-red-600', bg: 'bg-red-50', subBg: 'bg-red-100', subText: 'text-red-700' },
    };

    return (
        <div className={`p-4 border border-gray-200 bg-white`}>
            <div className={`text-xs font-medium mb-1 uppercase tracking-wider ${statusColors[status].text}`}>{label}</div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-gray-900">{value}</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${statusColors[status].subBg} ${statusColors[status].subText}`}>{subValue}</span>
            </div>
        </div>
    );
};

const LatencyCard = ({ label, value, change, icon: Icon, iconColor, iconBg, iconBorder }: {
    label: string,
    value: string,
    change: string,
    icon: any,
    iconColor: string,
    iconBg: string,
    iconBorder: string
}) => {
    const isPositive = change.startsWith('-');
    return (
        <div className="p-4 border border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</div>
                <div className={`p-1.5 ${iconBg} border ${iconBorder}`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-xl font-medium text-gray-900">{value}</span>
                {change !== '-' && (
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {change}
                  </span>
                )}
            </div>
        </div>
    );
};

export default DashboardOverview;
