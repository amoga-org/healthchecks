import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutGrid, 
  Activity, 
  FileText, 
  Settings, 
  Globe, 
  Terminal, 
  Plus, 
  ChevronDown,
  HelpCircle,
  MoreVertical,
  Calculator
} from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 border-r border-gray-200 h-screen flex flex-col bg-gray-50/50 sticky top-0 hidden md:flex">
      {/* Header / Logo Area */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center text-white font-bold">
             os
           </div>
           <div className="flex flex-col">
             <span className="text-sm font-semibold leading-tight">openstatus</span>
             <span className="text-[10px] text-gray-500 leading-tight">support-opensource</span>
           </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      {/* Workspace Nav */}
      <div className="p-2 flex-1 overflow-y-auto">
        <div className="mb-6">
          <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Command Center
          </div>
          <nav className="space-y-0.5">
            <NavItem to="/dashboard" icon={LayoutGrid} label="Monitor Overview" end />
            <NavItem to="/dashboard/logs" icon={Activity} label="Response Logs" />
            <NavItem to="/dashboard/editor" icon={Settings} label="Editor / Config" />
            <NavItem to="/status" icon={FileText} label="Status Pages" />
          </nav>
        </div>

        <div className="mb-6">
          <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Utilities
          </div>
          <nav className="space-y-0.5">
             <NavItem to="/tools/speed" icon={Globe} label="Global Speed Check" />
             <NavItem to="/tools/sla" icon={Calculator} label="SLA Calculator" />
             <NavItem to="/cli" icon={Terminal} label="CLI" />
          </nav>
        </div>

        {/* Monitors List */}
        <div className="mb-6">
          <div className="flex items-center justify-between px-2 py-1.5 mb-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Monitors</span>
            <button className="text-gray-400 hover:text-gray-600"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <div className="space-y-0.5">
            <PageItem label="DNS monitor" status="success" />
            <PageItem label="TCP monitor" status="success" />
            <PageItem label="My $5 VPS" status="success" />
            <PageItem label="API Monitoring" status="success" />
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
          <img 
            src="https://picsum.photos/32/32" 
            alt="User" 
            className="w-8 h-8 rounded-full bg-gray-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Dwight Schrute</p>
            <p className="text-xs text-gray-500 truncate">dwight@dundermifflin.com</p>
          </div>
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, to, end }: { icon: any, label: string, to: string, end?: boolean }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `w-full flex items-center gap-2.5 px-2 py-1.5 text-sm font-medium rounded-md transition-colors ${
      isActive 
        ? 'bg-gray-100 text-gray-900' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </NavLink>
);

const PageItem = ({ label, status }: { label: string, status: 'success' | 'warning' | 'error' }) => (
  <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md group">
    <span className="truncate">{label}</span>
    <span className={`w-2 h-2 rounded-full ${
      status === 'success' ? 'bg-green-500' : 
      status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
    }`} />
  </button>
);

export default Sidebar;