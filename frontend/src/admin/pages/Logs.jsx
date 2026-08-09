import React, { useState } from 'react';

const Logs = () => {
  const [logs] = useState([
    { id: 1, admin: 'Admin', action: 'User Suspended', target: 'john@email.com', ip: '192.168.1.1', timestamp: '2024-07-17 14:30:22', status: 'Success' },
    { id: 2, admin: 'Admin', action: 'KYC Approved', target: 'sarah@email.com', ip: '192.168.1.1', timestamp: '2024-07-17 12:15:45', status: 'Success' },
    { id: 3, admin: 'Admin', action: 'Withdrawal Approved', target: 'bob@email.com', ip: '10.0.0.1', timestamp: '2024-07-17 10:00:10', status: 'Success' },
    { id: 4, admin: 'Admin', action: 'Login Attempt Failed', target: 'hacker@email.com', ip: '203.0.113.1', timestamp: '2024-07-17 08:30:00', status: 'Failed' },
    { id: 5, admin: 'Admin', action: 'Settings Changed', target: 'Platform Settings', ip: '192.168.1.1', timestamp: '2024-07-16 22:20:15', status: 'Success' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.admin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesAction && matchesStatus;
  });

  const actions = ['all', ...new Set(logs.map(l => l.action))];

  return (
    <div className="admin-page">
      <h2>📋 Audit Logs</h2>
      <p>View all admin actions and system events</p>

      <div className="admin-filters">
        <div className="filter-group"><input type="text" placeholder="🔍 Search logs..." className="filter-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
        <div className="filter-group"><select className="filter-select" value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>{actions.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
        <div className="filter-group"><select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}><option value="all">All Status</option><option value="Success">Success</option><option value="Failed">Failed</option></select></div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead><tr><th>Admin</th><th>Action</th><th>Target</th><th>IP Address</th><th>Timestamp</th><th>Status</th></tr></thead>
          <tbody>{filteredLogs.map(log => (<tr key={log.id}><td><div className="user-cell"><div className="user-avatar-sm">{log.admin.charAt(0)}</div><div className="user-name">{log.admin}</div></div></td><td>{log.action}</td><td>{log.target}</td><td style={{fontFamily:'monospace',fontSize:'12px'}}>{log.ip}</td><td style={{fontSize:'12px',color:'#848e9c'}}>{log.timestamp}</td><td><span className="status-badge" style={{background: log.status === 'Success' ? 'rgba(14,203,129,0.15)' : 'rgba(246,70,93,0.15)', color: log.status === 'Success' ? '#0ecb81' : '#f6465d'}}>{log.status}</span></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Logs;