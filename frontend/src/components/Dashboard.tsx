import React from 'react';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-white">
      <main className="flex-1 flex flex-col min-w-0 bg-white h-screen overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;