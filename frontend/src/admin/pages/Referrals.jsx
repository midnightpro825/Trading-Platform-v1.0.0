import React, { useState } from 'react';

const Referrals = () => {
  const [referrals] = useState([
    { id: 1, referrer: 'Alice Johnson', email: 'alice@email.com', referrals: 42, earnings: 3240, commission: 20, tier: 'Silver' },
    { id: 2, referrer: 'Bob Smith', email: 'bob@email.com', referrals: 28, earnings: 2100, commission: 20, tier: 'Silver' },
    { id: 3, referrer: 'Charlie Lee', email: 'charlie@email.com', referrals: 15, earnings: 980, commission: 15, tier: 'Bronze' },
    { id: 4, referrer: 'Diana Park', email: 'diana@email.com', referrals: 67, earnings: 5200, commission: 25, tier: 'Gold' },
  ]);

  const [settings, setSettings] = useState({
    enabled: true,
    commission: 20,
    minWithdraw: 50,
    maxTier: 'Gold'
  });

  return (
    <div className="admin-page">
      <h2>🎁 Referrals</h2>
      <p>Manage referral program and track performance</p>

      <div className="admin-stats-grid" style={{ marginBottom: '20px' }}>
        <div className="admin-stat-card"><div className="stat-icon">👤</div><div className="stat-info"><span className="stat-label">Total Referrers</span><span className="stat-value">{referrals.length}</span></div></div>
        <div className="admin-stat-card"><div className="stat-icon">👥</div><div className="stat-info"><span className="stat-label">Total Referrals</span><span className="stat-value">{referrals.reduce((sum, r) => sum + r.referrals, 0)}</span></div></div>
        <div className="admin-stat-card"><div className="stat-icon">💰</div><div className="stat-info"><span className="stat-label">Total Earnings</span><span className="stat-value">${referrals.reduce((sum, r) => sum + r.earnings, 0).toLocaleString()}</span></div></div>
        <div className="admin-stat-card"><div className="stat-icon">🏆</div><div className="stat-info"><span className="stat-label">Top Referrer</span><span className="stat-value">{referrals.sort((a,b) => b.referrals - a.referrals)[0]?.referrer}</span></div></div>
      </div>

      <div className="referral-settings">
        <h3>⚙️ Program Settings</h3>
        <div className="setting-item toggle"><label>Enable Referral Program</label><button className={`toggle-btn ${settings.enabled ? 'active' : ''}`} onClick={() => setSettings({...settings, enabled: !settings.enabled})}><span className="toggle-track"><span className="toggle-thumb"></span></span></button></div>
        <div className="setting-item"><label>Default Commission (%)</label><input type="number" value={settings.commission} onChange={(e) => setSettings({...settings, commission: parseInt(e.target.value)})} className="setting-input" /></div>
        <div className="setting-item"><label>Min Withdrawal ($)</label><input type="number" value={settings.minWithdraw} onChange={(e) => setSettings({...settings, minWithdraw: parseInt(e.target.value)})} className="setting-input" /></div>
        <div className="setting-item"><label>Max Tier</label><select className="setting-select" value={settings.maxTier} onChange={(e) => setSettings({...settings, maxTier: e.target.value})}><option value="Bronze">Bronze</option><option value="Silver">Silver</option><option value="Gold">Gold</option><option value="Platinum">Platinum</option></select></div>
        <button className="save-settings-btn" style={{marginTop:'12px'}}>💾 Save Settings</button>
      </div>

      <div className="admin-table-container" style={{ marginTop: '16px' }}>
        <table className="admin-table">
          <thead><tr><th>Referrer</th><th>Referrals</th><th>Earnings</th><th>Commission</th><th>Tier</th><th>Action</th></tr></thead>
          <tbody>{referrals.map(r => (<tr key={r.id}><td><div className="user-cell"><div className="user-avatar-sm">{r.referrer.charAt(0)}</div><div><div className="user-name">{r.referrer}</div><div className="user-email">{r.email}</div></div></div></td><td>{r.referrals}</td><td>${r.earnings.toLocaleString()}</td><td>{r.commission}%</td><td><span className="status-badge" style={{background: r.tier === 'Gold' ? 'rgba(240,185,11,0.15)' : r.tier === 'Silver' ? 'rgba(192,192,192,0.15)' : 'rgba(205,127,50,0.15)', color: r.tier === 'Gold' ? '#f0b90b' : r.tier === 'Silver' ? '#c0c0c0' : '#cd7f32'}}>{r.tier}</span></td><td><button className="action-btn view">👁️</button></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
};

export default Referrals;