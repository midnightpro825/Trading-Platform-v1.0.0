import React, { useState } from 'react';

const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [dateRange, setDateRange] = useState('7d');

  const reports = [
    { id: 1, name: 'Daily Trading Volume', date: '2024-07-17', type: 'daily', value: '$2.4M', change: '+12%' },
    { id: 2, name: 'User Growth Report', date: '2024-07-17', type: 'daily', value: '42 new users', change: '+8%' },
    { id: 3, name: 'Revenue Summary', date: '2024-07-16', type: 'daily', value: '$12,450', change: '+5%' },
    { id: 4, name: 'Weekly Trading Volume', date: '2024-07-10 to 2024-07-17', type: 'weekly', value: '$16.8M', change: '+18%' },
    { id: 5, name: 'Monthly Revenue', date: 'July 2024', type: 'monthly', value: '$345,000', change: '+22%' },
  ];

  return (
    <div className="admin-page">
      <h2>📊 Reports</h2>
      <p>Generate and view platform reports</p>

      <div className="report-controls">
        <div className="report-filter-group">
          <label>Report Type</label>
          <select className="filter-select" value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="custom">Custom</option>
          </select>
        </div>
        <div className="report-filter-group">
          <label>Date Range</label>
          <select className="filter-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="24h">Last 24 Hours</option><option value="7d">Last 7 Days</option><option value="30d">Last 30 Days</option><option value="90d">Last 90 Days</option>
          </select>
        </div>
        <button className="generate-report-btn">📄 Generate Report</button>
        <button className="export-report-btn">📥 Export CSV</button>
      </div>

      <div className="report-stats">
        <div className="report-stat-card"><span className="stat-label">Total Volume</span><span className="stat-value">$18.2M</span><span className="stat-change positive">+15%</span></div>
        <div className="report-stat-card"><span className="stat-label">Total Revenue</span><span className="stat-value">$357,450</span><span className="stat-change positive">+22%</span></div>
        <div className="report-stat-card"><span className="stat-label">New Users</span><span className="stat-value">342</span><span className="stat-change positive">+8%</span></div>
        <div className="report-stat-card"><span className="stat-label">Active Traders</span><span className="stat-value">1,234</span><span className="stat-change positive">+5%</span></div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead><tr><th>Report Name</th><th>Date</th><th>Type</th><th>Value</th><th>Change</th><th>Action</th></tr></thead>
          <tbody>{reports.map(r => (<tr key={r.id}><td>{r.name}</td><td>{r.date}</td><td><span className="status-badge" style={{background:'rgba(240,185,11,0.15)',color:'#f0b90b'}}>{r.type}</span></td><td><strong>{r.value}</strong></td><td style={{color: r.change.includes('+') ? '#0ecb81' : '#f6465d'}}>{r.change}</td><td><button className="action-btn view">📥</button></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;