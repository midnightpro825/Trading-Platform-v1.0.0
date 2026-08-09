import React, { useState } from 'react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'system', title: 'System Update', message: 'Platform upgrade scheduled for July 20', status: 'sent', time: '2 hours ago' },
    { id: 2, type: 'promo', title: 'Trading Competition', message: 'Win $10,000 in our July trading competition', status: 'draft', time: '5 hours ago' },
    { id: 3, type: 'alert', title: 'Security Alert', message: 'New IP detected for admin login', status: 'sent', time: '1 day ago' },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({ type: 'system', title: '', message: '', target: 'all' });

  const sendNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      alert('Please fill in all fields');
      return;
    }
    setNotifications([{ ...newNotification, id: Date.now(), status: 'sent', time: 'Just now' }, ...notifications]);
    setShowCreateModal(false);
    setNewNotification({ type: 'system', title: '', message: '', target: 'all' });
    alert('✅ Notification sent!');
  };

  const deleteNotification = (id) => {
    if (confirm('Delete this notification?')) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  return (
    <div className="admin-page">
      <h2>🔔 Notifications</h2>
      <p>Send and manage system notifications</p>

      <button className="add-market-btn" onClick={() => setShowCreateModal(true)}>➕ Send Notification</button>

      <div className="admin-table-container" style={{ marginTop: '16px' }}>
        <table className="admin-table">
          <thead><tr><th>Type</th><th>Title</th><th>Message</th><th>Status</th><th>Time</th><th>Actions</th></tr></thead>
          <tbody>{notifications.map(n => (<tr key={n.id}><td><span className="status-badge" style={{background: n.type === 'system' ? 'rgba(30,128,255,0.15)' : n.type === 'promo' ? 'rgba(240,185,11,0.15)' : 'rgba(246,70,93,0.15)', color: n.type === 'system' ? '#1e80ff' : n.type === 'promo' ? '#f0b90b' : '#f6465d'}}>{n.type}</span></td><td><strong>{n.title}</strong></td><td style={{color:'#848e9c',fontSize:'13px'}}>{n.message}</td><td><span className="status-badge" style={{background: n.status === 'sent' ? 'rgba(14,203,129,0.15)' : 'rgba(240,185,11,0.15)', color: n.status === 'sent' ? '#0ecb81' : '#f0b90b'}}>{n.status}</span></td><td style={{fontSize:'12px',color:'#848e9c'}}>{n.time}</td><td><div className="action-buttons"><button className="action-btn view">📋</button><button className="action-btn delete" onClick={() => deleteNotification(n.id)}>🗑️</button></div></td></tr>))}</tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header"><h3>📨 Send Notification</h3><button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button></div>
            <div className="admin-modal-body">
              <div className="form-group"><label>Type</label><select className="setting-input" style={{width:'100%'}} value={newNotification.type} onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}><option value="system">System</option><option value="promo">Promotion</option><option value="alert">Alert</option></select></div>
              <div className="form-group"><label>Title</label><input type="text" className="setting-input" style={{width:'100%'}} placeholder="Notification title..." value={newNotification.title} onChange={(e) => setNewNotification({...newNotification, title: e.target.value})} /></div>
              <div className="form-group"><label>Message</label><textarea className="setting-input" style={{width:'100%',height:'80px',resize:'vertical'}} placeholder="Notification message..." value={newNotification.message} onChange={(e) => setNewNotification({...newNotification, message: e.target.value})} /></div>
              <div className="form-group"><label>Target Audience</label><select className="setting-input" style={{width:'100%'}} value={newNotification.target} onChange={(e) => setNewNotification({...newNotification, target: e.target.value})}><option value="all">All Users</option><option value="active">Active Users</option><option value="vip">VIP Users</option><option value="kyc">KYC Verified</option></select></div>
              <div className="modal-actions"><button className="modal-btn secondary" onClick={() => setShowCreateModal(false)}>Cancel</button><button className="modal-btn primary" onClick={sendNotification}>Send</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;