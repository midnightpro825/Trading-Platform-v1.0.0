import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>
      <div className="dashboard-grid">
        <div className="stat-card">
          <span>Total Balance</span>
          <span>$0.00</span>
        </div>
        <div className="stat-card">
          <span>24h Volume</span>
          <span>$0.00</span>
        </div>
        <div className="stat-card">
          <span>Open Orders</span>
          <span>0</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;