import React, { useState, useEffect } from 'react';
import { Clock, Globe, Search, Filter, Loader2 } from 'lucide-react';
import { fetchLogs, type Log } from '@/lib/api';

const ResponseLogs = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const data = await fetchLogs({ limit: 100 });
            setLogs(data);
        } catch (err) {
            console.error('Failed to load logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            log.url?.toLowerCase().includes(query) ||
            log.method?.toLowerCase().includes(query) ||
            String(log.status).includes(query)
        );
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <header className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Response Logs</h1>
                    <p className="text-sm text-gray-500">Real-time inspection of monitor runs</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>
                    <button
                        onClick={loadLogs}
                        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50"
                    >
                        <Filter className="w-4 h-4 text-gray-500" />
                        Refresh
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-auto bg-gray-50 p-6">
                {filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <Clock className="w-12 h-12 mb-4 text-gray-300" />
                        <p>No logs available yet</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-gray-500 w-12">Status</th>
                                    <th className="px-4 py-3 font-medium text-gray-500 w-24">Method</th>
                                    <th className="px-4 py-3 font-medium text-gray-500">URL</th>
                                    <th className="px-4 py-3 font-medium text-gray-500 w-32">Region</th>
                                    <th className="px-4 py-3 font-medium text-gray-500 w-32">Duration</th>
                                    <th className="px-4 py-3 font-medium text-gray-500 w-48 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredLogs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <tr
                                            onClick={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
                                            className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedLog === log.id ? 'bg-gray-50' : ''}`}
                                        >
                                            <td className="px-4 py-3">
                                                {log.status >= 200 && log.status < 400 ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">{log.status}</span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">{log.status}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-gray-600">{log.method || 'GET'}</td>
                                            <td className="px-4 py-3 text-gray-900 truncate max-w-xs">{log.url}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Globe className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="uppercase text-xs font-medium text-gray-600">{log.region || 'auto'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{log.duration}ms</td>
                                            <td className="px-4 py-3 text-right text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                        </tr>
                                        {selectedLog === log.id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={6} className="px-4 py-4">
                                                    <div className="bg-gray-900 rounded-md p-4 text-xs font-mono text-gray-300 overflow-x-auto">
                                                        <div className="flex gap-8 mb-4 border-b border-gray-700 pb-2">
                                                            <div>
                                                                <div className="text-gray-500 uppercase tracking-wider mb-1">Monitor ID</div>
                                                                <div>{log.monitor_id}</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-gray-500 uppercase tracking-wider mb-1">Duration</div>
                                                                <div>{log.duration}ms</div>
                                                            </div>
                                                            <div>
                                                                <div className="text-gray-500 uppercase tracking-wider mb-1">Status</div>
                                                                <div>{log.status >= 200 && log.status < 400 ? 'Healthy' : 'Unhealthy'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="mb-2 text-green-400">{'>'} {log.method || 'GET'} {log.url} HTTP/1.1</div>
                                                        <div className="pl-4 text-gray-400 mb-4">
                                                            User-Agent: HealthMonitor/1.0<br/>
                                                            Accept: */*
                                                        </div>
                                                        <div className="mb-2 text-blue-400 text-wrap">{'<'} HTTP/1.1 {log.status} {log.status >= 200 && log.status < 400 ? 'OK' : 'Error'}</div>
                                                        <div className="pl-4 text-gray-400">
                                                            Date: {new Date(log.timestamp).toUTCString()}<br/>
                                                            Content-Type: application/json; charset=utf-8
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResponseLogs;
