import React, { useState } from 'react';

const Security = () => {
  const [security, setSecurity] = useState({
    twoFAEnabled: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    ipWhitelist: ['192.168.1.1', '10.0.0.1'],
    sslEnabled: true,
    rateLimitEnabled: true,
    rateLimitPerMin: 60,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    passwordRequireNumber: true,
  });

  const [newIp, setNewIp] = useState('');

  const addIp = () => {
    if (newIp && !security.ipWhitelist.includes(newIp)) {
      setSecurity({...security, ipWhitelist: [...security.ipWhitelist, newIp]});
      setNewIp('');
    }
  };

  const removeIp = (ip) => {
    setSecurity({...security, ipWhitelist: security.ipWhitelist.filter(i => i !== ip)});
  };

  return (
    <div className="admin-page">
      <h2>🔐 Security</h2>
      <p>Manage platform security settings</p>

      <div className="security-grid">
        <div className="security-section">
          <h3>🔑 Authentication</h3>
          <div className="setting-item toggle"><label>2FA Required for Admins</label><button className={`toggle-btn ${security.twoFAEnabled ? 'active' : ''}`} onClick={() => setSecurity({...security, twoFAEnabled: !security.twoFAEnabled})}><span className="toggle-track"><span className="toggle-thumb"></span></span></button></div>
          <div className="setting-item"><label>Session Timeout (minutes)</label><input type="number" value={security.sessionTimeout} onChange={(e) => setSecurity({...security, sessionTimeout: parseInt(e.target.value)})} className="setting-input" /></div>
          <div className="setting-item"><label>Max Login Attempts</label><input type="number" value={security.maxLoginAttempts} onChange={(e) => setSecurity({...security, maxLoginAttempts: parseInt(e.target.value)})} className="setting-input" /></div>
        </div>

        <div className="security-section">
          <h3>🌐 IP Whitelist</h3>
          <div className="ip-list">{security.ipWhitelist.map(ip => (<div key={ip} className="ip-item"><span>{ip}</span><button className="ip-remove" onClick={() => removeIp(ip)}>✕</button></div>))}</div>
          <div className="ip-add"><input type="text" placeholder="Add IP address..." value={newIp} onChange={(e) => setNewIp(e.target.value)} className="setting-input" /><button className="ip-add-btn" onClick={addIp}>Add</button></div>
          <div className="setting-item toggle" style={{marginTop:'12px'}}><label>SSL/TLS Enabled</label><button className={`toggle-btn ${security.sslEnabled ? 'active' : ''}`} onClick={() => setSecurity({...security, sslEnabled: !security.sslEnabled})}><span className="toggle-track"><span className="toggle-thumb"></span></span></button></div>
        </div>

        <div className="security-section">
          <h3>🛡️ Rate Limiting</h3>
          <div className="setting-item toggle"><label>Enable Rate Limiting</label><button className={`toggle-btn ${security.rateLimitEnabled ? 'active' : ''}`} onClick={() => setSecurity({...security, rateLimitEnabled: !security.rateLimitEnabled})}><span className="toggle-track"><span className="toggle-thumb"></span></span></button></div>
          <div className="setting-item"><label>Requests Per Minute</label><input type="number" value={security.rateLimitPerMin} onChange={(e) => setSecurity({...security, rateLimitPerMin: parseInt(e.target.value)})} className="setting-input" /></div>
        </div>

        <div className="security-section">
          <h3>🔒 Password Policy</h3>
          <div className="setting-item"><label>Minimum Length</label><input type="number" value={security.passwordMinLength} onChange={(e) => setSecurity({...security, passwordMinLength: parseInt(e.target.value)})} className="setting-input" /></div>
          <div className="setting-item toggle"><label>Require Special Characters</label><button className={`toggle-btn ${security.passwordRequireSpecial ? 'active' : ''}`} onClick={() => setSecurity({...security, passwordRequireSpecial: !security.passwordRequireSpecial})}><span className="toggle-track"><span className="toggle-thumb"></span></span></button></div>
          <div className="setting-item toggle"><label>Require Numbers</label><button className={`toggle-btn ${security.passwordRequireNumber ? 'active' : ''}`} onClick={() => setSecurity({...security, passwordRequireNumber: !security.passwordRequireNumber})}><span className="toggle-track"><span className="toggle-thumb"></span></span></button></div>
        </div>
      </div>

      <button className="save-settings-btn">💾 Save Security Settings</button>
    </div>
  );
};

export default Security;