import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, Sun, Moon, Monitor, History, Palette, Loader2, XCircle } from 'lucide-react';
import { fetchStatus, type StatusData } from '@/lib/api';

const StatusPage = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'dracula'>('light');
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await fetchStatus();
      setStatus(data);
    } catch (err) {
      console.error('Failed to load status:', err);
    } finally {
      setLoading(false);
    }
  };

  const themes = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-white',
    dracula: 'bg-[#282a36] text-[#f8f8f2]'
  };

  const borderClass = theme === 'light' ? 'border-gray-100' : theme === 'dark' ? 'border-gray-800' : 'border-gray-700';
  const mutedText = theme === 'light' ? 'text-gray-500' : 'text-gray-400';

  const isAllOperational = status?.overall === 'operational';
  const currentTime = new Date().toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themes[theme]}`}>
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${themes[theme]}`}>
        {/* Navigation */}
        <nav className={`border-b ${borderClass}`}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm ${theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'}`}>
                        HM
                    </div>
                </div>

                <div className={`hidden md:flex items-center gap-6 text-sm font-medium ${mutedText}`}>
                    <a href="#" className={`px-3 py-1.5 rounded-md ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-white/10 text-white'}`}>Status</a>
                    <a href="#" className="hover:opacity-80 transition-colors">Events</a>
                    <a href="#" className="hover:opacity-80 transition-colors">Monitors</a>
                </div>

                <div className="flex items-center gap-3">
                    {/* Theme Toggle Button */}
                    <div className="relative group">
                        <button className={`p-2 rounded-md border ${borderClass} hover:opacity-80`}>
                            <Palette className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden hidden group-hover:block z-50">
                            <div className="p-1">
                                <button onClick={() => setTheme('light')} className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded">
                                    <Sun className="w-3 h-3" /> Light
                                </button>
                                <button onClick={() => setTheme('dark')} className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded">
                                    <Moon className="w-3 h-3" /> Dark
                                </button>
                                <button onClick={() => setTheme('dracula')} className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded">
                                    <Monitor className="w-3 h-3" /> Dracula
                                </button>
                            </div>
                        </div>
                    </div>

                    <button className={`text-sm font-medium border ${borderClass} px-3 py-1.5 rounded-md hover:opacity-80 transition-colors`}>
                        Get updates
                    </button>
                </div>
            </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

            {/* Header */}
            <div className="mb-10">
                <h1 className="text-2xl font-bold mb-1">Health Monitor</h1>
                <p className={mutedText}>System status and uptime monitoring</p>
            </div>

            {/* Operational Banner */}
            <div className={`rounded-lg p-4 flex items-center justify-between mb-12 shadow-sm ${
                isAllOperational
                ? (theme === 'light' ? 'bg-green-50 border border-green-200' : 'bg-green-900/20 border border-green-900/50')
                : (theme === 'light' ? 'bg-yellow-50 border border-yellow-200' : 'bg-yellow-900/20 border border-yellow-900/50')
            }`}>
                <div className="flex items-center gap-3">
                    <div className={`${isAllOperational ? 'bg-green-500' : 'bg-yellow-500'} rounded-full p-1`}>
                        {isAllOperational ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-white" />
                        )}
                    </div>
                    <span className="font-semibold text-lg">
                        {isAllOperational ? 'All Systems Operational' : 'Some Systems Degraded'}
                    </span>
                </div>
                <div className={`text-xs font-mono hidden sm:block ${isAllOperational ? 'text-green-600' : 'text-yellow-600'}`}>
                    {currentTime}
                </div>
            </div>

            {/* Components Grid */}
            <div className="space-y-8 mb-16">
                {status?.systems && status.systems.length > 0 ? (
                    status.systems.map((sys) => (
                        <ComponentStatus key={sys.name} system={sys} theme={theme} />
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        No monitors configured yet
                    </div>
                )}
            </div>

            {/* Incident History */}
            {status?.incidents && status.incidents.length > 0 && (
                <div className="relative">
                    {status.incidents.map((incident) => (
                        <IncidentItem
                            key={incident.id}
                            date={new Date(incident.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            timeAgo={getTimeAgo(incident.date)}
                            title={incident.title}
                            theme={theme}
                            updates={incident.updates}
                        />
                    ))}
                </div>
            )}

            <div className="mt-12 flex justify-center">
                <button
                    onClick={loadStatus}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg shadow-sm text-sm font-medium hover:opacity-80 ${
                    theme === 'light'
                    ? 'bg-white border-gray-200 text-gray-700'
                    : 'bg-white/5 border-white/10 text-white'
                }`}>
                    <History className="w-4 h-4" />
                    Refresh status
                </button>
            </div>

            {/* Footer */}
            <footer className={`mt-20 border-t pt-8 flex flex-col md:flex-row items-center justify-between text-sm ${borderClass} ${mutedText}`}>
                <div className="flex items-center gap-1">
                    powered by <span className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>Health Monitor</span>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                     <span>{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                </div>
            </footer>
        </main>
    </div>
  );
};

function getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

interface SystemComponentProps {
    system: {
        name: string;
        uptime: number;
        status: 'operational' | 'degraded' | 'outage';
        history: ('operational' | 'degraded' | 'outage')[];
    };
    theme: string;
}

const ComponentStatus: React.FC<SystemComponentProps> = ({ system, theme }) => {
    const StatusIcon = system.status === 'operational' ? CheckCircle2 :
                       system.status === 'degraded' ? AlertCircle : XCircle;
    const statusColor = system.status === 'operational' ? 'text-green-500' :
                        system.status === 'degraded' ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{system.name}</span>
                    <Info className={`w-3.5 h-3.5 cursor-help ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>{system.uptime}%</span>
                    <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                </div>
            </div>

            <div className="flex gap-[3px] h-8 mb-1">
                {system.history.map((dayStatus, i) => {
                     const bgColor = dayStatus === 'operational' ? 'bg-green-500' :
                                     dayStatus === 'degraded' ? 'bg-yellow-500' : 'bg-red-500';
                     return (
                        <div
                            key={i}
                            className={`flex-1 rounded-[1px] ${bgColor} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                            title={dayStatus}
                        />
                     )
                })}
            </div>
            <div className={`flex justify-between text-xs font-medium ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>{system.history.length} days ago</span>
                <span>today</span>
            </div>
        </div>
    )
}

const IncidentItem = ({ date, timeAgo, title, updates, theme }: any) => {
    const renderText = (text: string) => {
        const lines = text.split('\n');
        return (
             <ul className="list-disc pl-4 space-y-1 mt-1">
                {lines.map((line: string, i: number) => (
                    <li key={i} className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        {line.replace(/^[•\-\*]\s*/, '')}
                    </li>
                ))}
             </ul>
        );
    };

    return (
        <div className="flex flex-col md:flex-row gap-2 md:gap-12 py-8 first:pt-0">
             {/* Left Column: Date */}
             <div className="md:w-32 flex-shrink-0 md:text-right mb-4 md:mb-0">
                 <div className={`font-semibold text-lg ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>{date}</div>
                 <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                     theme === 'light' ? 'bg-gray-100 text-gray-500' : 'bg-gray-800 text-gray-400'
                 }`}>
                     {timeAgo}
                 </span>
             </div>

             {/* Right Column: Content */}
             <div className="flex-1">
                 <h3 className={`text-xl font-semibold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                     {title}
                 </h3>

                 <div className="relative">
                     <div className={`absolute top-2 bottom-4 left-[7px] w-[2px] ${theme === 'light' ? 'bg-blue-500' : 'bg-blue-600'} opacity-20`}></div>

                     <div className="space-y-8">
                         {updates.map((update: any, idx: number) => {
                             const isResolved = update.type === 'Resolved';
                             const dotColor = isResolved ? 'bg-green-500' : 'bg-blue-500';

                             return (
                                 <div key={idx} className="relative pl-8">
                                     <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 ${theme === 'light' ? 'border-white' : 'border-gray-900'} ${dotColor} z-10 box-content`}></div>

                                     <div className="flex flex-wrap items-baseline gap-x-2 mb-1">
                                         <span className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
                                             {update.type}
                                         </span>
                                         <span className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
                                             {update.date}
                                         </span>
                                     </div>

                                     <div className={`text-sm leading-relaxed`}>
                                         {renderText(update.text)}
                                     </div>
                                 </div>
                             );
                         })}
                     </div>
                 </div>
             </div>
        </div>
    )
}

export default StatusPage;
