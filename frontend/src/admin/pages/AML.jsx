import React, { useState } from 'react';

const AML = () => {
  const [cases] = useState([
    { id: 1, user: 'John Doe', risk: 'High', status: 'reviewing', flagged: '2024-07-17', amount: 15000, type: 'Suspicious Activity' },
    { id: 2, user: 'Jane Smith', risk: 'Medium', status: 'pending', flagged: '2024-07-16', amount: 5000, type: 'Large Transaction' },
    { id: 3, user: 'Robert Park', risk: 'High', status: 'resolved', flagged: '2024-07-15', amount: 25000, type: 'Suspicious Activity' },
    { id: 4, user: 'Emma Wilson', risk: 'Low', status: 'cleared', flagged: '2024-07-14', amount: 1000, type: 'Unusual Pattern' },
  ]);

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'High': return '#f6465d';
      case 'Medium': return '#f0b90b';
      case 'Low': return '#0ecb81';
      default: return '#848e9c';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'reviewing': return '#f0b90b';
      case 'pending': return '#1e80ff';
      case 'resolved': return '#0ecb81';
      case 'cleared': return '#848e9c';
      default: return '#848e9c';
    }
  };

  return (
    <div className="admin-page">
      <h2>🛡️ AML & Compliance</h2>
      <p>Anti-Money Laundering monitoring and compliance</p>

      <div className="admin-stats-grid" style={{ marginBottom: '20px' }}>
        <div className="admin-stat-card"><div className="stat-icon">🔴</div><div className="stat-info"><span className="stat-label">High Risk</span><span className="stat-value" style={{color:'#f6465d'}}>{cases.filter(c => c.risk === 'High').length}</span></div></div>
        <div className="admin-stat-card"><div className="stat-icon">🟡</div><div className="stat-info"><span className="stat-label">Medium Risk</span><span className="stat-value" style={{color:'#f0b90b'}}>{cases.filter(c => c.risk === 'Medium').length}</span></div></div>
        <div className="admin-stat-card"><div className="stat-icon">🟢</div><div className="stat-info"><span className="stat-label">Low Risk</span><span className="stat-value" style={{color:'#0ecb81'}}>{cases.filter(c => c.risk === 'Low').length}</span></div></div>
        <div className="admin-stat-card"><div className="stat-icon">📋</div><div className="stat-info"><span className="stat-label">Total Cases</span><span className="stat-value">{cases.length}</span></div></div>
      </div>

      <div className="admin-actions-bar">
        <button className="add-market-btn">🔄 Run Compliance Scan</button>
        <button className="refresh-btn">📊 Generate Report</button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead><tr><th>User</th><th>Risk</th><th>Status</th><th>Type</th><th>Amount</th><th>Flagged</th><th>Actions</th></tr></thead>
          <tbody>{cases.map(c => (<tr key={c.id}><td><div className="user-cell"><div className="user-avatar-sm">{c.user.charAt(0)}</div><div><div className="user-name">{c.user}</div></div></div></td><td><span className="risk-badge" style={{background:getRiskColor(c.risk)+'20',color:getRiskColor(c.risk)}}>{c.risk}</span></td><td><span className="status-badge" style={{background:getStatusColor(c.status)+'20',color:getStatusColor(c.status)}}>{c.status}</span></td><td>{c.type}</td><td>${c.amount.toLocaleString()}</td><td style={{fontSize:'12px',color:'#848e9c'}}>{c.flagged}</td><td><div className="action-buttons"><button className="action-btn view">👁️</button><button className="action-btn activate">✅</button></div></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
};

export default AML;