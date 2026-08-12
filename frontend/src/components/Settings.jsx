import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// ============================================================
// 🔧 FIX: Use environment variable for API URL (SAME AS OTHER FILES)
// ============================================================
const API_URL = import.meta.env.VITE_API_URL || 'https://tradeflows.site';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    defaultLeverage: 1,
    slippageTolerance: 0.5,
    orderType: 'limit',
    confirmationRequired: true,
    oneClickTrading: false,
    chartStyle: 'candlestick',
    chartTheme: 'dark',
    timeframe: '1h',
    showVolume: true,
    showIndicators: true,
    emailNotifications: true,
    pushNotifications: true,
    tradeAlerts: true,
    priceAlerts: true,
    depositAlerts: true,
    withdrawalAlerts: true,
    marketingEmails: false,
    twoFAEnabled: false,
    sessionTimeout: 30,
    loginAlerts: true,
    withdrawalAlerts: true,
    compactMode: false,
    showBalances: true,
    showOrderBook: true,
    showTradeHistory: true
  });

  const tabs = [
    { id: 'general', icon: '⚙️', label: 'General' },
    { id: 'trading', icon: '📊', label: 'Trading' },
    { id: 'chart', icon: '📈', label: 'Chart' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'security', icon: '🔐', label: 'Security' },
    { id: 'display', icon: '🖥️', label: 'Display' },
    { id: 'api', icon: '🔑', label: 'API Keys' },
    { id: 'whitelist', icon: '📋', label: 'Whitelist' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  // ============================================================
  // LOAD SETTINGS (FIXED)
  // ============================================================
  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && Object.keys(response.data).length > 0) {
        setSettings({ ...settings, ...response.data });
      }
    } catch (error) {
      const saved = localStorage.getItem('tradeflow-settings');
      if (saved) {
        try {
          setSettings({ ...settings, ...JSON.parse(saved) });
        } catch (e) {}
      }
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // ============================================================
  // SAVE SETTINGS (FIXED)
  // ============================================================
  const saveSettings = async () => {
    setLoading(true);
    setSaveSuccess(false);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.setItem('tradeflow-settings', JSON.stringify(settings));
      setSaveSuccess(true);
      showMessage('success', '✅ Settings saved successfully!');
    } catch (error) {
      localStorage.setItem('tradeflow-settings', JSON.stringify(settings));
      setSaveSuccess(true);
      showMessage('success', '✅ Settings saved locally!');
    }
    setLoading(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const resetSettings = () => {
    if (window.confirm('⚠️ Reset all settings to default?')) {
      const defaults = {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        defaultLeverage: 1,
        slippageTolerance: 0.5,
        orderType: 'limit',
        confirmationRequired: true,
        oneClickTrading: false,
        chartStyle: 'candlestick',
        chartTheme: 'dark',
        timeframe: '1h',
        showVolume: true,
        showIndicators: true,
        emailNotifications: true,
        pushNotifications: true,
        tradeAlerts: true,
        priceAlerts: true,
        depositAlerts: true,
        withdrawalAlerts: true,
        marketingEmails: false,
        twoFAEnabled: false,
        sessionTimeout: 30,
        loginAlerts: true,
        withdrawalAlerts: true,
        compactMode: false,
        showBalances: true,
        showOrderBook: true,
        showTradeHistory: true
      };
      setSettings(defaults);
      localStorage.setItem('tradeflow-settings', JSON.stringify(defaults));
      showMessage('success', '✅ Settings reset to defaults!');
    }
  };

  // ============================================================
  // API KEYS STATE
  // ============================================================
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Default API Key', key: 'sk_live_***abc123', created: '2024-01-15', permissions: ['Read', 'Trade'], status: 'active' }
  ]);
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: ['Read']
  });

  const createApiKey = () => {
    if (!newApiKey.name.trim()) {
      showMessage('error', '⚠️ Please enter a name for the API key');
      return;
    }
    
    const newKey = {
      id: Date.now(),
      name: newApiKey.name,
      key: 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      created: new Date().toISOString().split('T')[0],
      permissions: newApiKey.permissions,
      status: 'active'
    };
    setApiKeys([...apiKeys, newKey]);
    setNewApiKey({ name: '', permissions: ['Read'] });
    setShowApiKeyForm(false);
    showMessage('success', '✅ API Key created successfully!');
  };

  const revokeApiKey = (id) => {
    if (window.confirm('⚠️ Are you sure you want to revoke this API key?')) {
      setApiKeys(apiKeys.filter(key => key.id !== id));
      showMessage('success', '✅ API key revoked');
    }
  };

  // ============================================================
  // WHITELIST STATE
  // ============================================================
  const [whitelist, setWhitelist] = useState([
    { id: 1, address: '0x1234...5678', label: 'My Wallet', asset: 'USDT' },
    { id: 2, address: '0xabcd...efgh', label: 'Cold Storage', asset: 'BTC' }
  ]);
  const [showWhitelistForm, setShowWhitelistForm] = useState(false);
  const [newWhitelistEntry, setNewWhitelistEntry] = useState({
    address: '',
    label: '',
    asset: 'USDT'
  });

  const addWhitelistAddress = () => {
    if (!newWhitelistEntry.address.trim() || !newWhitelistEntry.label.trim()) {
      showMessage('error', '⚠️ Please fill in all fields');
      return;
    }
    
    const newEntry = {
      id: Date.now(),
      ...newWhitelistEntry
    };
    setWhitelist([...whitelist, newEntry]);
    setNewWhitelistEntry({ address: '', label: '', asset: 'USDT' });
    setShowWhitelistForm(false);
    showMessage('success', '✅ Address added to whitelist');
  };

  const removeWhitelistAddress = (id) => {
    if (window.confirm('⚠️ Are you sure you want to remove this address?')) {
      setWhitelist(whitelist.filter(item => item.id !== id));
      showMessage('success', '✅ Address removed from whitelist');
    }
  };

  return (
    <div className="settings-page-binance" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="settings-header-binance" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0 }}>⚙️ Settings</h2>
          <p style={{ color: '#848e9c', margin: '4px 0 0' }}>Customize your trading experience</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={resetSettings} 
            style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}
          >
            🔄 Reset
          </button>
          <button 
            onClick={saveSettings} 
            disabled={loading} 
            style={{ padding: '8px 24px', background: saveSuccess ? '#0ecb81' : '#f0b90b', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Saving...' : saveSuccess ? '✅ Saved' : '💾 Save'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          background: message.type === 'success' ? 'rgba(14, 203, 129, 0.1)' : 'rgba(246, 70, 93, 0.1)',
          border: `1px solid ${message.type === 'success' ? '#0ecb81' : '#f6465d'}`,
          color: message.type === 'success' ? '#0ecb81' : '#f6465d'
        }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="settings-tabs-binance" style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '24px', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === tab.id ? '#f0b90b' : 'transparent',
              color: activeTab === tab.id ? '#0a0b0e' : '#848e9c',
              fontWeight: activeTab === tab.id ? '600' : '400',
              fontSize: '14px'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-content-binance">
        {/* General */}
        {activeTab === 'general' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <h4 style={{ marginTop: 0, color: '#eaecef' }}>🌍 General Settings</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Theme</label>
                <select value={settings.theme} onChange={(e) => updateSetting('theme', e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Language</label>
                <select value={settings.language} onChange={(e) => updateSetting('language', e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }}>
                  <option value="en">English</option>
                  <option value="ko">Korean</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Timezone</label>
                <select value={settings.timezone} onChange={(e) => updateSetting('timezone', e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }}>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">EST</option>
                  <option value="America/Los_Angeles">PST</option>
                  <option value="Europe/London">GMT</option>
                  <option value="Asia/Seoul">KST</option>
                  <option value="Asia/Tokyo">JST</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Date Format</label>
                <select value={settings.dateFormat} onChange={(e) => updateSetting('dateFormat', e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }}>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Trading */}
        {activeTab === 'trading' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <h4 style={{ marginTop: 0, color: '#eaecef' }}>📊 Trading Preferences</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Default Leverage</label>
                <select value={settings.defaultLeverage} onChange={(e) => updateSetting('defaultLeverage', parseInt(e.target.value))} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }}>
                  <option value="1">1x</option><option value="2">2x</option><option value="3">3x</option>
                  <option value="5">5x</option><option value="10">10x</option><option value="20">20x</option>
                  <option value="50">50x</option><option value="100">100x</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Slippage Tolerance (%)</label>
                <input type="number" value={settings.slippageTolerance} onChange={(e) => updateSetting('slippageTolerance', parseFloat(e.target.value))} step="0.1" min="0" max="5" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }} />
              </div>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Default Order Type</label>
                <select value={settings.orderType} onChange={(e) => updateSetting('orderType', e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }}>
                  <option value="limit">Limit</option><option value="market">Market</option><option value="stop">Stop</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0' }}>
                <span style={{ color: '#eaecef' }}>Require Confirmation</span>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input type="checkbox" checked={settings.confirmationRequired} onChange={() => updateSetting('confirmationRequired', !settings.confirmationRequired)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: settings.confirmationRequired ? '#0ecb81' : '#2a2e39', borderRadius: '24px', transition: '0.3s' }}>
                    <span style={{ position: 'absolute', height: '18px', width: '18px', left: settings.confirmationRequired ? '22px' : '3px', bottom: '3px', background: '#fff', borderRadius: '50%', transition: '0.3s' }} />
                  </span>
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.04)', marginTop: '12px' }}>
              <div><div style={{ color: '#eaecef' }}>One-Click Trading</div><div style={{ fontSize: '12px', color: '#848e9c' }}>Execute trades with a single click</div></div>
              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                <input type="checkbox" checked={settings.oneClickTrading} onChange={() => updateSetting('oneClickTrading', !settings.oneClickTrading)} style={{ opacity: 0, width: 0, height: 0 }} />
                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: settings.oneClickTrading ? '#0ecb81' : '#2a2e39', borderRadius: '24px', transition: '0.3s' }}>
                  <span style={{ position: 'absolute', height: '18px', width: '18px', left: settings.oneClickTrading ? '22px' : '3px', bottom: '3px', background: '#fff', borderRadius: '50%', transition: '0.3s' }} />
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Chart */}
        {activeTab === 'chart' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <h4 style={{ marginTop: 0, color: '#eaecef' }}>📈 Chart Settings</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Chart Style</label>
                <select value={settings.chartStyle} onChange={(e) => updateSetting('chartStyle', e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }}>
                  <option value="candlestick">Candlestick</option><option value="line">Line</option><option value="area">Area</option><option value="bars">Bars</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Chart Theme</label>
                <select value={settings.chartTheme} onChange={(e) => updateSetting('chartTheme', e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }}>
                  <option value="dark">Dark</option><option value="light">Light</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Default Timeframe</label>
                <select value={settings.timeframe} onChange={(e) => updateSetting('timeframe', e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }}>
                  <option value="1m">1m</option><option value="5m">5m</option><option value="15m">15m</option>
                  <option value="30m">30m</option><option value="1h">1h</option><option value="4h">4h</option><option value="1d">1d</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div><div style={{ color: '#eaecef' }}>Show Volume</div><div style={{ fontSize: '12px', color: '#848e9c' }}>Display volume on chart</div></div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input type="checkbox" checked={settings.showVolume} onChange={() => updateSetting('showVolume', !settings.showVolume)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: settings.showVolume ? '#0ecb81' : '#2a2e39', borderRadius: '24px', transition: '0.3s' }}>
                    <span style={{ position: 'absolute', height: '18px', width: '18px', left: settings.showVolume ? '22px' : '3px', bottom: '3px', background: '#fff', borderRadius: '50%', transition: '0.3s' }} />
                  </span>
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                <div><div style={{ color: '#eaecef' }}>Show Indicators</div><div style={{ fontSize: '12px', color: '#848e9c' }}>Display technical indicators</div></div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input type="checkbox" checked={settings.showIndicators} onChange={() => updateSetting('showIndicators', !settings.showIndicators)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: settings.showIndicators ? '#0ecb81' : '#2a2e39', borderRadius: '24px', transition: '0.3s' }}>
                    <span style={{ position: 'absolute', height: '18px', width: '18px', left: settings.showIndicators ? '22px' : '3px', bottom: '3px', background: '#fff', borderRadius: '50%', transition: '0.3s' }} />
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <h4 style={{ marginTop: 0, color: '#eaecef' }}>🔔 Notification Settings</h4>
            {[
              { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
              { key: 'pushNotifications', label: 'Push Notifications', desc: 'Receive push notifications' },
              { key: 'tradeAlerts', label: 'Trade Alerts', desc: 'Get notified when trades execute' },
              { key: 'priceAlerts', label: 'Price Alerts', desc: 'Get notified at price targets' },
              { key: 'depositAlerts', label: 'Deposit Alerts', desc: 'Get notified on deposits' },
              { key: 'withdrawalAlerts', label: 'Withdrawal Alerts', desc: 'Get notified on withdrawals' },
              { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive promotional content' }
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div><div style={{ color: '#eaecef' }}>{item.label}</div><div style={{ fontSize: '12px', color: '#848e9c' }}>{item.desc}</div></div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input type="checkbox" checked={settings[item.key]} onChange={() => updateSetting(item.key, !settings[item.key])} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: settings[item.key] ? '#0ecb81' : '#2a2e39', borderRadius: '24px', transition: '0.3s' }}>
                    <span style={{ position: 'absolute', height: '18px', width: '18px', left: settings[item.key] ? '22px' : '3px', bottom: '3px', background: '#fff', borderRadius: '50%', transition: '0.3s' }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <h4 style={{ marginTop: 0, color: '#eaecef' }}>🔐 Security Settings</h4>
            {[
              { key: 'twoFAEnabled', label: 'Two-Factor Authentication', desc: 'Require 2FA for withdrawals and logins' },
              { key: 'loginAlerts', label: 'Login Alerts', desc: 'Get notified on new logins' },
              { key: 'withdrawalAlerts', label: 'Withdrawal Alerts', desc: 'Get notified on withdrawal requests' }
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div><div style={{ color: '#eaecef' }}>{item.label}</div><div style={{ fontSize: '12px', color: '#848e9c' }}>{item.desc}</div></div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input type="checkbox" checked={settings[item.key]} onChange={() => updateSetting(item.key, !settings[item.key])} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: settings[item.key] ? '#0ecb81' : '#2a2e39', borderRadius: '24px', transition: '0.3s' }}>
                    <span style={{ position: 'absolute', height: '18px', width: '18px', left: settings[item.key] ? '22px' : '3px', bottom: '3px', background: '#fff', borderRadius: '50%', transition: '0.3s' }} />
                  </span>
                </label>
              </div>
            ))}
            <div style={{ marginTop: '12px' }}>
              <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Session Timeout (minutes)</label>
              <input type="number" value={settings.sessionTimeout} onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))} min="5" max="120" style={{ width: '100%', maxWidth: '200px', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }} />
            </div>
          </div>
        )}

        {/* Display */}
        {activeTab === 'display' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <h4 style={{ marginTop: 0, color: '#eaecef' }}>🖥️ Display Settings</h4>
            {[
              { key: 'compactMode', label: 'Compact Mode', desc: 'Reduce spacing and font sizes' },
              { key: 'showBalances', label: 'Show Balances', desc: 'Display balances in header' },
              { key: 'showOrderBook', label: 'Show Order Book', desc: 'Display order book on trade page' },
              { key: 'showTradeHistory', label: 'Show Trade History', desc: 'Display trade history on dashboard' }
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div><div style={{ color: '#eaecef' }}>{item.label}</div><div style={{ fontSize: '12px', color: '#848e9c' }}>{item.desc}</div></div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input type="checkbox" checked={settings[item.key]} onChange={() => updateSetting(item.key, !settings[item.key])} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, background: settings[item.key] ? '#0ecb81' : '#2a2e39', borderRadius: '24px', transition: '0.3s' }}>
                    <span style={{ position: 'absolute', height: '18px', width: '18px', left: settings[item.key] ? '22px' : '3px', bottom: '3px', background: '#fff', borderRadius: '50%', transition: '0.3s' }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
        )}

        {/* ===== API KEYS TAB ===== */}
        {activeTab === 'api' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <h4 style={{ marginTop: 0, color: '#eaecef' }}>🔑 API Keys</h4>
            <p style={{ color: '#848e9c', marginBottom: '16px' }}>Create and manage API keys for programmatic access</p>

            <button
              onClick={() => setShowApiKeyForm(!showApiKeyForm)}
              style={{
                padding: '8px 20px',
                background: '#f0b90b',
                border: 'none',
                borderRadius: '6px',
                color: '#0a0b0e',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              {showApiKeyForm ? '✕ Cancel' : '➕ Create API Key'}
            </button>

            {showApiKeyForm && (
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Trading Bot"
                      value={newApiKey.name}
                      onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '4px',
                        color: '#eaecef'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Permissions</label>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {['Read', 'Trade', 'Withdraw', 'Admin'].map(perm => (
                        <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#848e9c' }}>
                          <input
                            type="checkbox"
                            checked={newApiKey.permissions.includes(perm)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewApiKey({...newApiKey, permissions: [...newApiKey.permissions, perm]});
                              } else {
                                setNewApiKey({...newApiKey, permissions: newApiKey.permissions.filter(p => p !== perm)});
                              }
                            }}
                          />
                          {perm}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={createApiKey}
                    style={{
                      padding: '8px 20px',
                      background: '#0ecb81',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#0a0b0e',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    🔑 Generate API Key
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '12px' }}>
              {apiKeys.map(key => (
                <div key={key.id} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#eaecef' }}>{key.name}</div>
                    <div style={{ color: '#848e9c', fontSize: '13px', fontFamily: 'monospace' }}>{key.key}</div>
                    <div style={{ color: '#848e9c', fontSize: '12px' }}>Created: {key.created} • Permissions: {key.permissions.join(', ')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#0ecb81', fontSize: '12px', padding: '2px 8px', background: 'rgba(14,203,129,0.1)', borderRadius: '12px' }}>● Active</span>
                    <button onClick={() => revokeApiKey(key.id)} style={{ padding: '4px 12px', background: '#f6465d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
              {apiKeys.length === 0 && (
                <div style={{ textAlign: 'center', color: '#848e9c', padding: '20px' }}>No API keys created yet</div>
              )}
            </div>
          </div>
        )}

        {/* ===== WHITELIST TAB ===== */}
        {activeTab === 'whitelist' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <h4 style={{ marginTop: 0, color: '#eaecef' }}>📋 Whitelist</h4>
            <p style={{ color: '#848e9c', marginBottom: '16px' }}>Manage whitelisted withdrawal addresses</p>

            <button
              onClick={() => setShowWhitelistForm(!showWhitelistForm)}
              style={{
                padding: '8px 20px',
                background: '#f0b90b',
                border: 'none',
                borderRadius: '6px',
                color: '#0a0b0e',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              {showWhitelistForm ? '✕ Cancel' : '➕ Add Address'}
            </button>

            {showWhitelistForm && (
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'grid', gap: '12px' }}>
                  <div>
                    <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Address</label>
                    <input
                      type="text"
                      placeholder="e.g., 0x1234..."
                      value={newWhitelistEntry.address}
                      onChange={(e) => setNewWhitelistEntry({...newWhitelistEntry, address: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '4px',
                        color: '#eaecef'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Label</label>
                    <input
                      type="text"
                      placeholder="e.g., My Wallet"
                      value={newWhitelistEntry.label}
                      onChange={(e) => setNewWhitelistEntry({...newWhitelistEntry, label: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '4px',
                        color: '#eaecef'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Asset</label>
                    <select
                      value={newWhitelistEntry.asset}
                      onChange={(e) => setNewWhitelistEntry({...newWhitelistEntry, asset: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '4px',
                        color: '#eaecef'
                      }}
                    >
                      <option value="USDT">USDT</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="SOL">SOL</option>
                    </select>
                  </div>
                  <button
                    onClick={addWhitelistAddress}
                    style={{
                      padding: '8px 20px',
                      background: '#0ecb81',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#0a0b0e',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    ➕ Add to Whitelist
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: '12px' }}>
              {whitelist.map(item => (
                <div key={item.id} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#eaecef' }}>{item.label}</div>
                    <div style={{ color: '#848e9c', fontSize: '13px', fontFamily: 'monospace' }}>{item.address}</div>
                    <div style={{ color: '#848e9c', fontSize: '12px' }}>Asset: {item.asset}</div>
                  </div>
                  <button onClick={() => removeWhitelistAddress(item.id)} style={{ padding: '4px 12px', background: '#f6465d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>
                    Remove
                  </button>
                </div>
              ))}
              {whitelist.length === 0 && (
                <div style={{ textAlign: 'center', color: '#848e9c', padding: '20px' }}>No whitelisted addresses yet</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;