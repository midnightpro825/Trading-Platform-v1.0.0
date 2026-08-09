import React, { useState } from 'react';

const Support = () => {
  const [tickets, setTickets] = useState([
    { id: 1, user: 'Alice Johnson', subject: 'Withdrawal Issue', category: 'Withdrawal', priority: 'High', status: 'open', time: '2 hours ago' },
    { id: 2, user: 'Bob Smith', subject: 'Account Verification', category: 'KYC', priority: 'Medium', status: 'in-progress', time: '5 hours ago' },
    { id: 3, user: 'Charlie Lee', subject: 'Trading Error', category: 'Trading', priority: 'High', status: 'open', time: '1 day ago' },
    { id: 4, user: 'Diana Park', subject: 'Deposit Not Credited', category: 'Deposit', priority: 'Critical', status: 'in-progress', time: '2 days ago' },
  ]);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return '#f6465d';
      case 'High': return '#f0b90b';
      case 'Medium': return '#1e80ff';
      case 'Low': return '#848e9c';
      default: return '#848e9c';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return '#f0b90b';
      case 'in-progress': return '#1e80ff';
      case 'resolved': return '#0ecb81';
      case 'closed': return '#848e9c';
      default: return '#848e9c';
    }
  };

  return (
    <div className="admin-page">
      <h2>💬 Support</h2>
      <p>Manage support tickets and user inquiries</p>

      <div className="admin-stats-grid" style={{ marginBottom: '20px' }}>
        <div className="admin-stat-card"><div className="stat-icon">📩</div><div className="stat-info"><span className="stat-label">Open</span><span className="stat-value" style={{color:'#f0b90b'}}>{tickets.filter(t => t.status === 'open').length}</span></div></div>
        <div className="admin-stat-card"><div className="stat-icon">🔄</div><div className="stat-info"><span className="stat-label">In Progress</span><span className="stat-value" style={{color:'#1e80ff'}}>{tickets.filter(t => t.status === 'in-progress').length}</span></div></div>
        <div className="admin-stat-card"><div className="stat-icon">✅</div><div className="stat-info"><span className="stat-label">Resolved</span><span className="stat-value" style={{color:'#0ecb81'}}>{tickets.filter(t => t.status === 'resolved').length}</span></div></div>
        <div className="admin-stat-card"><div className="stat-icon">⏱️</div><div className="stat-info"><span className="stat-label">Avg Response</span><span className="stat-value">2.4h</span></div></div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead><tr><th>User</th><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Time</th><th>Actions</th></tr></thead>
          <tbody>{tickets.map(t => (<tr key={t.id}><td><div className="user-cell"><div className="user-avatar-sm">{t.user.charAt(0)}</div><div><div className="user-name">{t.user}</div></div></div></td><td>{t.subject}</td><td>{t.category}</td><td><span className="status-badge" style={{background:getPriorityColor(t.priority)+'20',color:getPriorityColor(t.priority)}}>{t.priority}</span></td><td><span className="status-badge" style={{background:getStatusColor(t.status)+'20',color:getStatusColor(t.status)}}>{t.status}</span></td><td style={{fontSize:'12px',color:'#848e9c'}}>{t.time}</td><td><div className="action-buttons"><button className="action-btn view">👁️</button><button className="action-btn activate">💬</button></div></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Support;