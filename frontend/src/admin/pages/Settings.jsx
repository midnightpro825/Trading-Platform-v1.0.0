import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ ADD THIS LINE
const API_URL = import.meta.env.VITE_API_URL || 'https://tradeflows.site';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [settings, setSettings] = useState({
    // General
    platformName: 'TradeFlow',
    supportEmail: 'support@tradeflow.com',
    timezone: 'UTC',
    defaultCurrency: 'USD',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    // Security
    twoFARequired: false,
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    ipWhitelist: [],
    // Fees
    tradingFeeMaker: 0.1,
    tradingFeeTaker: 0.1,
    withdrawalFeeBTC: 0.0005,
    withdrawalFeeETH: 0.005,
    withdrawalFeeUSDT: 1,
    depositFeeBTC: 0,
    depositFeeETH: 0,
    depositFeeUSDT: 0,
    // Limits
    minWithdrawalBTC: 0.001,
    maxWithdrawalBTC: 10,
    minWithdrawalETH: 0.01,
    maxWithdrawalETH: 100,
    minWithdrawalUSDT: 10,
    maxWithdrawalUSDT: 50000,
    dailyWithdrawLimit: 100000,
    monthlyWithdrawLimit: 1000000,
    // System
    maintenanceMode: false,
    maintenanceMessage: 'System is currently under maintenance. Please check back later.',
    registrationEnabled: true,
    depositEnabled: true,
    withdrawEnabled: true,
    tradingEnabled: true,
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      const response = await axios.get(`${API_URL}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && Object.keys(response.data).length > 0) {
        setSettings({ ...settings, ...response.data });
      }
    } catch (error) {
      console.log('Using default settings');
      // Try to load from localStorage
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        try {
          setSettings({ ...settings, ...JSON.parse(savedSettings) });
        } catch (e) {}
      }
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setSaved(false);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      await axios.put(`${API_URL}/api/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Save to localStorage as backup
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      
      setSaved(true);
      setMessage({ type: 'success', text: '✅ Settings saved successfully!' });
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      // If API fails, save to localStorage
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      setSaved(true);
      setMessage({ type: 'success', text: '✅ Settings saved locally!' });
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const resetDefaults = () => {
    if (window.confirm('⚠ Reset all settings to default?')) {
      const defaults = {
        platformName: 'TradeFlow',
        supportEmail: 'support@tradeflow.com',
        timezone: 'UTC',
        defaultCurrency: 'USD',
        twoFARequired: false,
        passwordMinLength: 8,
        passwordRequireSpecial: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        tradingFeeMaker: 0.1,
        tradingFeeTaker: 0.1,
        withdrawalFeeBTC: 0.0005,
        withdrawalFeeETH: 0.005,
        withdrawalFeeUSDT: 1,
        minWithdrawalBTC: 0.001,
        maxWithdrawalBTC: 10,
        minWithdrawalETH: 0.01,
        maxWithdrawalETH: 100,
        minWithdrawalUSDT: 10,
        maxWithdrawalUSDT: 50000,
        dailyWithdrawLimit: 100000,
        monthlyWithdrawLimit: 1000000,
        maintenanceMode: false,
        registrationEnabled: true,
        depositEnabled: true,
        withdrawEnabled: true,
        tradingEnabled: true,
      };
      setSettings({ ...settings, ...defaults });
      localStorage.setItem('adminSettings', JSON.stringify(defaults));
      setMessage({ type: 'success', text: '✅ Settings reset to defaults!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const ToggleSwitch = ({ checked, onChange, label, description }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)'
    }}>
      <div>
        <div style={{ color: '#eaecef' }}>{label}</div>
        {description && <div style={{ fontSize: '12px', color: '#848e9c' }}>{description}</div>}
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px', flexShrink: 0 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onChange(!checked)}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          position: 'absolute',
          cursor: 'pointer',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: checked ? '#0ecb81' : '#2a2e39',
          borderRadius: '26px',
          transition: '0.3s'
        }}>
          <span style={{
            position: 'absolute',
            height: '20px',
            width: '20px',
            left: checked ? '26px' : '3px',
            bottom: '3px',
            background: '#ffffff',
            borderRadius: '50%',
            transition: '0.3s'
          }} />
        </span>
      </label>
    </div>
  );

  const tabs = [
    { id: 'general', icon: '⚙', label: 'General' },
    { id: 'security', icon: '🔐', label: 'Security' },
    { id: 'fees', icon: '💳', label: 'Fees' },
    { id: 'limits', icon: '📊', label: 'Limits' },
    { id: 'system', icon: '🔧', label: 'System' },
  ];

  const renderGeneral = () => (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
      <h4 style={{ marginTop: 0 }}>🌍 General Settings</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Platform Name</label>
          <input
            type="text"
            value={settings.platformName}
            onChange={(e) => updateSetting('platformName', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Support Email</label>
          <input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => updateSetting('supportEmail', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => updateSetting('timezone', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px'
            }}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">EST</option>
            <option value="America/Los_Angeles">PST</option>
            <option value="Europe/London">GMT</option>
            <option value="Asia/Seoul">KST</option>
            <option value="Asia/Tokyo">JST</option>
            <option value="Australia/Sydney">AEST</option>
          </select>
        </div>
        <div>
          <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Default Currency</label>
          <select
            value={settings.defaultCurrency}
            onChange={(e) => updateSetting('defaultCurrency', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px'
            }}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
            <option value="KRW">KRW</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
      <h4 style={{ marginTop: 0 }}>🔐 Security Settings</h4>
      
      <ToggleSwitch
        checked={settings.twoFARequired}
        onChange={(value) => updateSetting('twoFARequired', value)}
        label="Require 2FA for All Users"
        description="All users must enable two-factor authentication"
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
        <div>
          <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Minimum Password Length</label>
          <input
            type="number"
            value={settings.passwordMinLength}
            onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
            min="6"
            max="20"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
            min="5"
            max="120"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
      
      <ToggleSwitch
        checked={settings.passwordRequireSpecial}
        onChange={(value) => updateSetting('passwordRequireSpecial', value)}
        label="Require Special Characters in Password"
        description="Passwords must contain at least one special character"
      />
      
      <div style={{ marginTop: '16px' }}>
        <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>IP Whitelist (comma separated)</label>
        <input
          type="text"
          value={settings.ipWhitelist?.join(', ') || ''}
          onChange={(e) => updateSetting('ipWhitelist', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          placeholder="192.168.1.1, 10.0.0.1"
          style={{
            width: '100%',
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#eaecef',
            fontSize: '14px'
          }}
        />
      </div>
    </div>
  );

  const renderFees = () => (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
      <h4 style={{ marginTop: 0 }}>💳 Fee Settings</h4>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Trading Fees</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ color: '#848e9c', fontSize: '12px', display: 'block', marginBottom: '2px' }}>Maker Fee (%)</label>
            <input
              type="number"
              value={settings.tradingFeeMaker}
              onChange={(e) => updateSetting('tradingFeeMaker', parseFloat(e.target.value))}
              step="0.01"
              min="0"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                color: '#eaecef',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ color: '#848e9c', fontSize: '12px', display: 'block', marginBottom: '2px' }}>Taker Fee (%)</label>
            <input
              type="number"
              value={settings.tradingFeeTaker}
              onChange={(e) => updateSetting('tradingFeeTaker', parseFloat(e.target.value))}
              step="0.01"
              min="0"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                color: '#eaecef',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      </div>
      
      <div>
        <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Withdrawal Fees</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ color: '#848e9c', fontSize: '12px', display: 'block', marginBottom: '2px' }}>BTC</label>
            <input
              type="number"
              value={settings.withdrawalFeeBTC}
              onChange={(e) => updateSetting('withdrawalFeeBTC', parseFloat(e.target.value))}
              step="0.0001"
              min="0"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                color: '#eaecef',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ color: '#848e9c', fontSize: '12px', display: 'block', marginBottom: '2px' }}>ETH</label>
            <input
              type="number"
              value={settings.withdrawalFeeETH}
              onChange={(e) => updateSetting('withdrawalFeeETH', parseFloat(e.target.value))}
              step="0.0001"
              min="0"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                color: '#eaecef',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ color: '#848e9c', fontSize: '12px', display: 'block', marginBottom: '2px' }}>USDT</label>
            <input
              type="number"
              value={settings.withdrawalFeeUSDT}
              onChange={(e) => updateSetting('withdrawalFeeUSDT', parseFloat(e.target.value))}
              step="0.1"
              min="0"
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                color: '#eaecef',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderLimits = () => (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
      <h4 style={{ marginTop: 0 }}>📊 Withdrawal Limits</h4>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ color: '#848e9c', fontSize: '12px', display: 'block', marginBottom: '2px' }}>BTC Min</label>
          <input
            type="number"
            value={settings.minWithdrawalBTC}
            onChange={(e) => updateSetting('minWithdrawalBTC', parseFloat(e.target.value))}
            step="0.0001"
            min="0"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ color: '#848e9c', fontSize: '12px', display: 'block', marginBottom: '2px' }}>BTC Max</label>
          <input
            type="number"
            value={settings.maxWithdrawalBTC}
            onChange={(e) => updateSetting('maxWithdrawalBTC', parseFloat(e.target.value))}
            step="0.1"
            min="0"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px'
            }}
          />
        </div>
        <div style={{ gridColumn: 'span 1' }}></div>
        
        <div>
          <label style={{ color: '#848e9c', fontSize: '12px', display: 'block', marginBottom: '2px' }}>ETH Min</label>
          <input
            type="number"
            value={settings.minWithdrawalETH}
            onChange={(e) => updateSetting('minWithdrawalETH', parseFloat(e.target.value))}
            step="0.001"
            min="0"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ color: '#848e9c', fontSize: '12px', display: 'block', marginBottom: '2px' }}>ETH Max</label>
          <input
            type="number"
            value={settings.maxWithdrawalETH}
            onChange={(e) => updateSetting('maxWithdrawalETH', parseFloat(e.target.value))}
            step="1"
            min="0"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px'
            }}
          />
        </div>
        <div style={{ gridColumn: 'span 1' }}></div>
        
        <div>
          <label style={{ color: '#848e9c', fontSize: '12px', display: 'block', marginBottom: '2px' }}>USDT Min</label>
          <input
            type="number"
            value={settings.minWithdrawalUSDT}
            onChange={(e) => updateSetting('minWithdrawalUSDT', parseFloat(e.target.value))}
            step="1"
            min="0"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ color: '#848e9c', fontSize: '12px', display: 'block', marginBottom: '2px' }}>USDT Max</label>
          <input
            type="number"
            value={settings.maxWithdrawalUSDT}
            onChange={(e) => updateSetting('maxWithdrawalUSDT', parseFloat(e.target.value))}
            step="100"
            min="0"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
        <div>
          <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Daily Withdraw Limit (USD)</label>
          <input
            type="number"
            value={settings.dailyWithdrawLimit}
            onChange={(e) => updateSetting('dailyWithdrawLimit', parseFloat(e.target.value))}
            step="1000"
            min="0"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Monthly Withdraw Limit (USD)</label>
          <input
            type="number"
            value={settings.monthlyWithdrawLimit}
            onChange={(e) => updateSetting('monthlyWithdrawLimit', parseFloat(e.target.value))}
            step="1000"
            min="0"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
      <h4 style={{ marginTop: 0 }}>🔧 System Controls</h4>
      
      <ToggleSwitch
        checked={settings.maintenanceMode}
        onChange={(value) => updateSetting('maintenanceMode', value)}
        label="Maintenance Mode"
        description="Enable to put the platform in maintenance mode"
      />
      
      {settings.maintenanceMode && (
        <div style={{ margin: '12px 0' }}>
          <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Maintenance Message</label>
          <textarea
            value={settings.maintenanceMessage}
            onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
            rows="3"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#eaecef',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>
      )}
      
      <ToggleSwitch
        checked={settings.registrationEnabled}
        onChange={(value) => updateSetting('registrationEnabled', value)}
        label="User Registration"
        description="Allow new users to register"
      />
      
      <ToggleSwitch
        checked={settings.depositEnabled}
        onChange={(value) => updateSetting('depositEnabled', value)}
        label="Deposits Enabled"
        description="Allow users to make deposits"
      />
      
      <ToggleSwitch
        checked={settings.withdrawEnabled}
        onChange={(value) => updateSetting('withdrawEnabled', value)}
        label="Withdrawals Enabled"
        description="Allow users to withdraw funds"
      />
      
      <ToggleSwitch
        checked={settings.tradingEnabled}
        onChange={(value) => updateSetting('tradingEnabled', value)}
        label="Trading Enabled"
        description="Allow users to trade"
      />
    </div>
  );

  return (
    <div className="admin-page" style={{ padding: '0' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ marginTop: 0 }}>⚙ System Settings</h2>
          <p style={{ color: '#848e9c', margin: 0 }}>Manage platform configuration and preferences</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={resetDefaults}
            style={{
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              color: '#848e9c',
              cursor: 'pointer'
            }}
          >
            🔄 Reset Defaults
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            style={{
              padding: '8px 24px',
              background: saved ? '#0ecb81' : '#f0b90b',
              border: 'none',
              borderRadius: '6px',
              color: '#0a0b0e',
              fontWeight: '600',
              cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.6 : 1
            }}
          >
            {saving ? 'Saving...' : saved ? '✅ Saved!' : '💾 Save Settings'}
          </button>
        </div>
      </div>

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

      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '24px',
        paddingBottom: '12px',
        flexWrap: 'wrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 20px',
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

      {activeTab === 'general' && renderGeneral()}
      {activeTab === 'security' && renderSecurity()}
      {activeTab === 'fees' && renderFees()}
      {activeTab === 'limits' && renderLimits()}
      {activeTab === 'system' && renderSystem()}
    </div>
  );
};

export default Settings;