import React, { useState } from 'react';
import { Save, Play, Globe, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

const MonitorEditor = () => {
    const [regions, setRegions] = useState(['iad', 'fra']);
    
    const toggleRegion = (code: string) => {
        if (regions.includes(code)) {
            setRegions(regions.filter(r => r !== code));
        } else {
            setRegions([...regions, code]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Configure Monitor</h1>
                    <p className="text-sm text-gray-500">Edit settings for "Dunder Mifflin API"</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        <Play className="w-4 h-4" />
                        Run Check
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    
                    {/* General Settings */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            Request Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                <div className="flex">
                                    <select className="px-3 py-2 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md text-sm font-medium text-gray-600 focus:outline-none">
                                        <option>GET</option>
                                        <option>POST</option>
                                        <option>HEAD</option>
                                    </select>
                                    <input 
                                        type="text" 
                                        defaultValue="https://api.dundermifflin.com/v1/stock" 
                                        className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monitor Name</label>
                                <input 
                                    type="text" 
                                    defaultValue="Dunder Mifflin API Stock" 
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm px-3 py-2 border"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Schedule & Regions */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            Frequency & Locations
                        </h3>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Check Frequency</label>
                            <div className="flex gap-3">
                                {['10s', '30s', '1m', '5m', '10m'].map((freq) => (
                                    <button 
                                        key={freq}
                                        className={`px-4 py-2 text-sm font-medium rounded-md border ${
                                            freq === '30s' 
                                            ? 'bg-black text-white border-black' 
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {freq}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Regions</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {[
                                    { code: 'iad', name: 'N. Virginia', flag: '🇺🇸' },
                                    { code: 'fra', name: 'Frankfurt', flag: '🇩🇪' },
                                    { code: 'hkg', name: 'Hong Kong', flag: '🇭🇰' },
                                    { code: 'syd', name: 'Sydney', flag: '🇦🇺' },
                                    { code: 'bom', name: 'Mumbai', flag: '🇮🇳' },
                                    { code: 'gru', name: 'São Paulo', flag: '🇧🇷' },
                                ].map((region) => (
                                    <button 
                                        key={region.code}
                                        onClick={() => toggleRegion(region.code)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-all ${
                                            regions.includes(region.code)
                                            ? 'border-green-500 bg-green-50 text-green-800 ring-1 ring-green-500'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        <span>{region.flag}</span>
                                        <span>{region.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Assertions */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <h3 className="text-base font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-gray-400" />
                            Assertions
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">When</span>
                                <select className="block rounded-md border-gray-300 text-sm focus:border-black focus:ring-black p-1.5 border">
                                    <option>Status Code</option>
                                    <option>Response Time</option>
                                    <option>JSON Body</option>
                                </select>
                                <select className="block rounded-md border-gray-300 text-sm focus:border-black focus:ring-black p-1.5 border">
                                    <option>Equal to</option>
                                    <option>Greater than</option>
                                </select>
                                <input type="text" defaultValue="200" className="w-20 rounded-md border-gray-300 text-sm p-1.5 border" />
                            </div>
                            <button className="text-sm text-blue-600 font-medium hover:underline">+ Add Assertion</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonitorEditor;