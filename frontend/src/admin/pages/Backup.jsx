import React, { useState } from 'react';

const Backup = () => {
  const [backups, setBackups] = useState([
    { id: 1, name: 'Full Backup - 2024-07-17', size: '245 MB', date: '2024-07-17 14:30:22', type: 'Full', status: 'completed' },
    { id: 2, name: 'Database Backup - 2024-07-17', size: '89 MB', date: '2024-07-17 06:00:00', type: 'Database', status: 'completed' },
    { id: 3, name: 'Full Backup - 2024-07-16', size: '238 MB', date: '2024-07-16 14:30:22', type: 'Full', status: 'completed' },
    { id: 4, name: 'User Data Backup - 2024-07-15', size: '156 MB', date: '2024-07-15 14:30:22', type: 'Users', status: 'completed' },
  ]);

  const [isBackingUp, setIsBackingUp] = useState(false);

  const createBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setBackups([{ id: Date.now(), name: `Full Backup - ${new Date().toISOString().split('T')[0]}`, size: '245 MB', date: new Date().toLocaleString(), type: 'Full', status: 'completed' }, ...backups]);
      setIsBackingUp(false);
      alert('✅ Backup created successfully!');
    }, 2000);
  };

  const deleteBackup = (id) => {
    if (confirm('Delete this backup?')) {
      setBackups(backups.filter(b => b.id !== id));
    }
  };

  return (
    <div className="admin-page">
      <h2>💾 Backup</h2>
      <p>Manage backups and disaster recovery</p>

      <div className="admin-actions-bar">
        <button className="add-market-btn" onClick={createBackup} disabled={isBackingUp}>{isBackingUp ? '⏳ Creating...' : '📀 Create Backup'}</button>
        <button className="refresh-btn">📥 Download Latest</button>
        <button className="refresh-btn">🔄 Restore from Backup</button>
      </div>

      <div className="backup-stats">
        <div className="backup-stat"><span className="stat-label">Total Backups</span><span className="stat-value">{backups.length}</span></div>
        <div className="backup-stat"><span className="stat-label">Total Size</span><span className="stat-value">{backups.reduce((sum, b) => sum + parseInt(b.size), 0)} MB</span></div>
        <div className="backup-stat"><span className="stat-label">Last Backup</span><span className="stat-value">{backups[0]?.date}</span></div>
        <div className="backup-stat"><span className="stat-label">Storage Used</span><span className="stat-value">728 MB / 10 GB</span></div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead><tr><th>Backup Name</th><th>Size</th><th>Type</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{backups.map(b => (<tr key={b.id}><td>{b.name}</td><td>{b.size}</td><td><span className="status-badge" style={{background: b.type === 'Full' ? 'rgba(240,185,11,0.15)' : 'rgba(30,128,255,0.15)', color: b.type === 'Full' ? '#f0b90b' : '#1e80ff'}}>{b.type}</span></td><td>{b.date}</td><td><span className="status-badge" style={{background:'rgba(14,203,129,0.15)',color:'#0ecb81'}}>{b.status}</span></td><td><div className="action-buttons"><button className="action-btn view">📥</button><button className="action-btn delete" onClick={() => deleteBackup(b.id)}>🗑️</button></div></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Backup;