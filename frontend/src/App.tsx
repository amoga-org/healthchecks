import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DashboardOverview from './components/DashboardOverview';
import ResponseLogs from './components/ResponseLogs';
import MonitorEditor from './components/MonitorEditor';
import StatusPage from './components/StatusPage';

const App = () => {
  return (
    <Router>
      <div className="relative font-sans antialiased">
        <Routes>
          {/* Public Status Page */}
          <Route path="/status" element={<StatusPage />} />

          {/* Command Center - Root and Monitor Routes */}
          <Route path="/" element={<Dashboard />}>
            <Route index element={<DashboardOverview />} />
          </Route>
          <Route path="/:slug" element={<Dashboard />}>
            <Route index element={<DashboardOverview />} />
            <Route path="logs" element={<ResponseLogs />} />
            <Route path="editor" element={<MonitorEditor />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;