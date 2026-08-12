import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// ============================================================
// 🔧 FIX: Use environment variable for API URL (SAME AS Assets.jsx)
// ============================================================
const API_URL = import.meta.env.VITE_API_URL || 'https://tradeflows.site';

const Account = () => {
  const { user, balance, setUser, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // ============================================================
  // KYC STATE - WITH DOCUMENT UPLOAD
  // ============================================================
  const [kycLevel, setKycLevel] = useState(user?.kycLevel || 0);
  const [kycStatus, setKycStatus] = useState(user?.kycStatus || 'pending');
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    passport: null,
    proofOfAddress: null,
    selfie: null,
    utilityBill: null
  });
  const [uploadStatus, setUploadStatus] = useState({});

  // Profile State
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'Alice',
    lastName: user?.lastName || 'Johnson',
    email: user?.email || 'alice@tradeflow.com',
    phone: user?.phone || '+1 (555) 123-4567',
    country: 'United States',
    city: 'New York'
  });
  const [editing, setEditing] = useState(false);

  // VIP State
  const [vipTier, setVipTier] = useState('Silver');
  const [vipProgress, setVipProgress] = useState(65);
  
  // Referral State
  const [referralData, setReferralData] = useState({
    code: 'ALICE2024',
    count: 42,
    earnings: 3240,
    commissionRate: 20,
    referrals: [
      { id: 1, name: 'Bob Smith', joined: '2024-01-15', volume: 25000, commission: 500 },
      { id: 2, name: 'Charlie Lee', joined: '2024-02-01', volume: 15000, commission: 300 },
      { id: 3, name: 'Diana Park', joined: '2024-02-20', volume: 32000, commission: 640 },
    ]
  });

  // Security State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFAEnabled: false
  });

  // Limits State
  const [limits, setLimits] = useState({
    dailyDeposit: { used: 50000, max: 100000 },
    dailyWithdraw: { used: 25000, max: 50000 },
    dailyTrade: { used: 100000, max: 500000 },
    monthlyWithdraw: { used: 500000, max: 1000000 }
  });

  // Activity Log
  const [activityLog, setActivityLog] = useState([
    { id: 1, action: 'Login', ip: '192.168.1.1', location: 'Seoul, KR', device: 'Chrome - Windows', time: '2 mins ago' },
    { id: 2, action: 'Trade', ip: '192.168.1.1', location: 'Seoul, KR', device: 'Chrome - Windows', time: '1 hour ago' },
    { id: 3, action: 'Login', ip: '192.168.1.2', location: 'Busan, KR', device: 'Safari - iPhone', time: '5 hours ago' },
    { id: 4, action: 'Withdraw', ip: '192.168.1.1', location: 'Seoul, KR', device: 'Chrome - Windows', time: '1 day ago' },
  ]);

  // Tabs
  const tabs = [
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'kyc', icon: '🪪', label: 'KYC' },
    { id: 'security', icon: '🔐', label: 'Security' },
    { id: 'limits', icon: '📊', label: 'Limits' },
    { id: 'referral', icon: '🎁', label: 'Referral' },
    { id: 'vip', icon: '👑', label: 'VIP' },
    { id: 'activity', icon: '📋', label: 'Activity' },
    { id: 'data', icon: '💾', label: 'Data' },
  ];

  // ============================================================
  // KYC HELPER FUNCTIONS
  // ============================================================
  const getDocLabel = (type) => {
    const labels = {
      passport: 'Passport/ID',
      proofOfAddress: 'Proof of Address',
      selfie: 'Selfie with ID',
      utilityBill: 'Utility Bill'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'success': return '✅ Uploaded';
      case 'uploading': return '⏳ Uploading...';
      case 'ready': return '📤 Ready to upload';
      case 'error': return '❌ Failed';
      default: return '📎 Select file';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return '#0ecb81';
      case 'uploading': return '#f0b90b';
      case 'ready': return '#627eea';
      case 'error': return '#f6465d';
      default: return '#848e9c';
    }
  };

  // ============================================================
  // KYC - HANDLE FILE SELECTION
  // ============================================================
  const handleFileChange = (docType, file) => {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: '❌ Please upload JPEG, PNG, or PDF files only.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: '❌ File size must be less than 5MB.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    
    setUploadedFiles(prev => ({ ...prev, [docType]: file }));
    setUploadStatus(prev => ({ ...prev, [docType]: 'ready' }));
  };

  // ============================================================
  // KYC - UPLOAD DOCUMENT (✅ FIXED)
  // ============================================================
  const uploadDocument = async (docType) => {
    const file = uploadedFiles[docType];
    if (!file) {
      setMessage({ type: 'error', text: '⚠️ Please select a file first.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    setUploading(true);
    setUploadStatus(prev => ({ ...prev, [docType]: 'uploading' }));

    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', docType);
    formData.append('userId', user?.id || 1);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/kyc/upload`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setUploadStatus(prev => ({ ...prev, [docType]: 'success' }));
        setMessage({ type: 'success', text: `✅ ${getDocLabel(docType)} uploaded successfully!` });
        setUploadedFiles(prev => ({ ...prev, [docType]: null }));
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setUploadStatus(prev => ({ ...prev, [docType]: 'error' }));
        setMessage({ type: 'error', text: `❌ Upload failed: ${response.data.message || 'Unknown error'}` });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setUploadStatus(prev => ({ ...prev, [docType]: 'error' }));
      setMessage({ type: 'error', text: '❌ Error uploading document. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  // ============================================================
  // KYC - UPGRADE LEVEL (✅ FIXED)
  // ============================================================
  const handleKYCUpgrade = async (level) => {
    if (level > kycLevel + 1) {
      setMessage({ type: 'error', text: '⚠️ Please complete each level in order.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    const requiredDocs = {
      1: ['passport'],
      2: ['passport', 'proofOfAddress'],
      3: ['passport', 'proofOfAddress', 'selfie']
    };

    const required = requiredDocs[level] || [];
    const missing = required.filter(doc => uploadStatus[doc] !== 'success');
    
    if (missing.length > 0) {
      setMessage({ 
        type: 'error', 
        text: `⚠️ Please upload these documents first:\n${missing.map(d => '  • ' + getDocLabel(d)).join('\n')}` 
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/kyc/upgrade`, 
        { level },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setKycLevel(level);
        setKycStatus('pending');
        setMessage({ type: 'success', text: `✅ KYC Level ${level} upgrade submitted for verification!` });
        if (setUser) {
          setUser({ ...user, kycLevel: level, kycStatus: 'pending' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: `❌ Upgrade failed: ${response.data.message || 'Unknown error'}` });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error submitting KYC upgrade. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      console.error('KYC upgrade error:', error);
    }
  };

  // ============================================================
  // FETCH KYC STATUS (✅ FIXED)
  // ============================================================
  const fetchKYCStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/user/kyc/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data) {
        setKycLevel(response.data.level || 0);
        setKycStatus(response.data.status || 'pending');
      }
    } catch (error) {
      console.log('Using default KYC status');
    }
  };

  // ============================================================
  // FETCH PROFILE (✅ FIXED)
  // ============================================================
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setProfileData({
          firstName: response.data.firstName || profileData.firstName,
          lastName: response.data.lastName || profileData.lastName,
          email: response.data.email || profileData.email,
          phone: response.data.phone || profileData.phone,
          country: response.data.country || profileData.country,
          city: response.data.city || profileData.city
        });
      }
    } catch (error) {
      console.log('Using mock profile data');
    }
  };

  // ============================================================
  // FETCH REFERRAL DATA (✅ FIXED)
  // ============================================================
  const fetchReferralData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/referral`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setReferralData({
          ...referralData,
          code: response.data.code || referralData.code,
          earnings: response.data.earnings || referralData.earnings,
          count: response.data.count || referralData.count,
          referrals: response.data.referrals || referralData.referrals
        });
      }
    } catch (error) {
      console.log('Using mock referral data');
    }
  };

  // ============================================================
  // FETCH ACTIVITY LOG (✅ FIXED)
  // ============================================================
  const fetchActivityLog = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/activity`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.length > 0) {
        setActivityLog(response.data);
      }
    } catch (error) {
      console.log('Using mock activity data');
    }
  };

  // ============================================================
  // USE EFFECT
  // ============================================================
  useEffect(() => {
    fetchProfile();
    fetchReferralData();
    fetchActivityLog();
    fetchKYCStatus();
  }, []);

  // ============================================================
  // UPDATE PROFILE (✅ FIXED)
  // ============================================================
  const updateProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/user/profile`, 
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (setUser) {
        setUser({ ...user, ...profileData });
      }
      setEditing(false);
      setMessage({ type: 'success', text: '✅ Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Failed to update profile' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
    setLoading(false);
  };

  // ============================================================
  // CHANGE PASSWORD (✅ FIXED)
  // ============================================================
  const changePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      setMessage({ type: 'error', text: '❌ Passwords do not match!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    if (securityData.newPassword.length < 8) {
      setMessage({ type: 'error', text: '❌ Password must be at least 8 characters!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/user/password`,
        { 
          current_password: securityData.currentPassword,
          new_password: securityData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFAEnabled: securityData.twoFAEnabled
      });
      setMessage({ type: 'success', text: '✅ Password changed successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Failed to change password' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
    setLoading(false);
  };

  // ============================================================
  // TOGGLE 2FA (✅ FIXED)
  // ============================================================
  const toggle2FA = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = securityData.twoFAEnabled ? 'disable' : 'enable';
      await axios.post(`${API_URL}/api/user/2fa/${endpoint}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSecurityData({ ...securityData, twoFAEnabled: !securityData.twoFAEnabled });
      setMessage({ type: 'success', text: `✅ 2FA ${securityData.twoFAEnabled ? 'disabled' : 'enabled'}!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Failed to toggle 2FA' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  // ============================================================
  // COPY REFERRAL CODE
  // ============================================================
  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralData.code);
    setMessage({ type: 'success', text: '✅ Referral code copied!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // ============================================================
  // SHARE REFERRAL
  // ============================================================
  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join TradeFlow!',
        text: `Join TradeFlow using my referral code: ${referralData.code}`,
        url: `https://tradeflow.com/ref/${referralData.code}`
      });
    } else {
      copyReferralCode();
    }
  };

  // ============================================================
  // EXPORT DATA
  // ============================================================
  const exportData = () => {
    const data = {
      user: profileData,
      balance: balance,
      referral: referralData,
      activity: activityLog
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradeflow-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: '✅ Data exported successfully!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // ============================================================
  // DELETE ACCOUNT
  // ============================================================
  const deleteAccount = () => {
    if (window.confirm('⚠️ Are you sure you want to delete your account? This action cannot be undone!')) {
      if (window.confirm('⚠️ All your data will be permanently deleted. Continue?')) {
        setMessage({ type: 'error', text: '🗑️ Account deletion requested. Contact support to finalize.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      }
    }
  };

  // ============================================================
  // LOGOUT HANDLER
  // ============================================================
  const handleLogout = () => {
    if (window.confirm('⚠️ Are you sure you want to logout?')) {
      logout();
    }
  };

  // Get dynamic limits based on KYC level
  const getDailyDepositLimit = () => {
    if (kycLevel >= 3) return 200000;
    if (kycLevel >= 2) return 100000;
    return 10000;
  };

  const getDailyWithdrawLimit = () => {
    if (kycLevel >= 3) return 100000;
    if (kycLevel >= 2) return 50000;
    return 5000;
  };

  const getMonthlyTradeLimit = () => {
    if (kycLevel >= 3) return 1000000;
    if (kycLevel >= 2) return 500000;
    return 50000;
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="account-page-binance" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="account-header-binance">
        <h2>👤 Account Management</h2>
        <span className="account-subtitle" style={{ color: '#848e9c' }}>Manage your personal information and security</span>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '16px',
          background: message.type === 'success' ? 'rgba(14, 203, 129, 0.1)' : 'rgba(246, 70, 93, 0.1)',
          border: `1px solid ${message.type === 'success' ? '#0ecb81' : '#f6465d'}`,
          color: message.type === 'success' ? '#0ecb81' : '#f6465d',
          whiteSpace: 'pre-line'
        }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="account-tabs-binance" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '24px', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`account-tab-binance ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === tab.id ? '#f0b90b' : 'transparent',
              color: activeTab === tab.id ? '#0a0b0e' : '#848e9c',
              fontWeight: activeTab === tab.id ? '700' : '400',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="account-content-binance">
        {/* ===== PROFILE TAB ===== */}
        {activeTab === 'profile' && (
          <div className="account-section-binance">
            <div className="account-section-header">
              <h3>👤 Profile Information</h3>
              <p style={{ color: '#848e9c' }}>Manage your personal details</p>
            </div>
            
            <div className="profile-card-binance" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div className="profile-avatar-binance" style={{ textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0b90b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700', color: '#0a0b0e' }}>
                  {profileData.firstName?.charAt(0) || 'A'}
                </div>
                <button className="edit-avatar-btn" style={{ marginTop: '8px', padding: '4px 12px', background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}>📷</button>
              </div>
              <div className="profile-info-binance" style={{ flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {Object.entries(profileData).map(([key, value]) => (
                    <div key={key} className="profile-field-binance">
                      <span className="field-label" style={{ color: '#848e9c', fontSize: '13px', display: 'block' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <input
                        type={key === 'email' ? 'email' : 'text'}
                        value={value}
                        onChange={(e) => setProfileData({...profileData, [key]: e.target.value})}
                        disabled={!editing || key === 'email'}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: editing && key !== 'email' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '6px',
                          color: editing && key !== 'email' ? '#eaecef' : '#848e9c'
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
                  {editing ? (
                    <>
                      <button onClick={updateProfile} disabled={loading} style={{ padding: '8px 20px', background: '#0ecb81', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}>
                        {loading ? 'Saving...' : '💾 Save Changes'}
                      </button>
                      <button onClick={() => setEditing(false)} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: 'none', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditing(true)} style={{ padding: '8px 20px', background: '#f0b90b', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}>
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== KYC TAB - COMPLETE WITH UPLOAD ===== */}
        {activeTab === 'kyc' && (
          <div className="account-section-binance">
            <div className="account-section-header">
              <h3>🪪 KYC Verification</h3>
              <p style={{ color: '#848e9c' }}>Verify your identity to increase limits. Required by Federal Law.</p>
            </div>
            
            {/* KYC Level Progress */}
            <div className="kyc-level-binance" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              {[1, 2, 3].map(level => (
                <div key={level} className={`kyc-level-item ${kycLevel >= level ? 'completed' : 'pending'}`} style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '8px',
                  background: kycLevel >= level ? 'rgba(14, 203, 129, 0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${kycLevel >= level ? '#0ecb81' : 'rgba(255,255,255,0.06)'}`,
                  textAlign: 'center'
                }}>
                  <span className="level-number" style={{ fontSize: '24px', fontWeight: '700', display: 'block' }}>
                    {kycLevel >= level ? '✅' : level}
                  </span>
                  <span className="level-label" style={{ color: kycLevel >= level ? '#0ecb81' : '#848e9c' }}>
                    {level === 1 ? 'Basic' : level === 2 ? 'Verified' : 'Advanced'}
                  </span>
                </div>
              ))}
            </div>

            {/* KYC Status */}
            <div style={{ 
              padding: '12px 16px', 
              background: kycStatus === 'verified' ? 'rgba(14,203,129,0.1)' : 'rgba(240,185,11,0.1)',
              borderRadius: '8px',
              marginBottom: '20px',
              border: `1px solid ${kycStatus === 'verified' ? '#0ecb81' : '#f0b90b'}`
            }}>
              <span style={{ color: kycStatus === 'verified' ? '#0ecb81' : '#f0b90b' }}>
                {kycStatus === 'verified' ? '✅' : '⏳'} Status: {kycStatus.toUpperCase()} (Level {kycLevel})
              </span>
            </div>

            {/* Document Upload Section */}
            <h4 style={{ marginBottom: '12px' }}>📎 Upload KYC Documents</h4>
            <p style={{ color: '#848e9c', fontSize: '13px', marginBottom: '16px' }}>
              Upload clear photos of your documents. Accepted: JPEG, PNG, PDF (max 5MB).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Passport/ID */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <label style={{ color: '#eaecef', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                  📘 Government ID (Passport/Driver's License)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('passport', e.target.files[0])}
                  style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', color: '#eaecef' }}
                  disabled={uploading}
                />
                {uploadedFiles.passport && (
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#0ecb81', fontSize: '12px' }}>📎 {uploadedFiles.passport.name}</span>
                    <button
                      onClick={() => uploadDocument('passport')}
                      disabled={uploading}
                      style={{
                        padding: '4px 12px',
                        background: '#0ecb81',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#0a0b0e',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {uploadStatus.passport === 'uploading' ? '⏳ Uploading...' : '📤 Upload'}
                    </button>
                  </div>
                )}
                <div style={{ marginTop: '4px', color: getStatusColor(uploadStatus.passport), fontSize: '12px' }}>
                  {getStatusBadge(uploadStatus.passport)}
                </div>
              </div>

              {/* Proof of Address */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <label style={{ color: '#eaecef', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                  📬 Proof of Address (Utility Bill)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('proofOfAddress', e.target.files[0])}
                  style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', color: '#eaecef' }}
                  disabled={uploading}
                />
                {uploadedFiles.proofOfAddress && (
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#0ecb81', fontSize: '12px' }}>📎 {uploadedFiles.proofOfAddress.name}</span>
                    <button
                      onClick={() => uploadDocument('proofOfAddress')}
                      disabled={uploading}
                      style={{
                        padding: '4px 12px',
                        background: '#0ecb81',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#0a0b0e',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {uploadStatus.proofOfAddress === 'uploading' ? '⏳ Uploading...' : '📤 Upload'}
                    </button>
                  </div>
                )}
                <div style={{ marginTop: '4px', color: getStatusColor(uploadStatus.proofOfAddress), fontSize: '12px' }}>
                  {getStatusBadge(uploadStatus.proofOfAddress)}
                </div>
              </div>

              {/* Selfie with ID */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <label style={{ color: '#eaecef', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                  🤳 Selfie with ID
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('selfie', e.target.files[0])}
                  style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', color: '#eaecef' }}
                  disabled={uploading}
                />
                {uploadedFiles.selfie && (
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#0ecb81', fontSize: '12px' }}>📎 {uploadedFiles.selfie.name}</span>
                    <button
                      onClick={() => uploadDocument('selfie')}
                      disabled={uploading}
                      style={{
                        padding: '4px 12px',
                        background: '#0ecb81',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#0a0b0e',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {uploadStatus.selfie === 'uploading' ? '⏳ Uploading...' : '📤 Upload'}
                    </button>
                  </div>
                )}
                <div style={{ marginTop: '4px', color: getStatusColor(uploadStatus.selfie), fontSize: '12px' }}>
                  {getStatusBadge(uploadStatus.selfie)}
                </div>
              </div>

              {/* Additional ID */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <label style={{ color: '#eaecef', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                  📄 Additional ID (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('utilityBill', e.target.files[0])}
                  style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', color: '#eaecef' }}
                  disabled={uploading}
                />
                {uploadedFiles.utilityBill && (
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#0ecb81', fontSize: '12px' }}>📎 {uploadedFiles.utilityBill.name}</span>
                    <button
                      onClick={() => uploadDocument('utilityBill')}
                      disabled={uploading}
                      style={{
                        padding: '4px 12px',
                        background: '#0ecb81',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#0a0b0e',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      {uploadStatus.utilityBill === 'uploading' ? '⏳ Uploading...' : '📤 Upload'}
                    </button>
                  </div>
                )}
                <div style={{ marginTop: '4px', color: getStatusColor(uploadStatus.utilityBill), fontSize: '12px' }}>
                  {getStatusBadge(uploadStatus.utilityBill)}
                </div>
              </div>
            </div>

            {/* Upgrade Buttons */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <h4>⬆️ Upgrade KYC Level</h4>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
                <button
                  onClick={() => handleKYCUpgrade(1)}
                  disabled={kycLevel >= 1}
                  style={{
                    padding: '10px 24px',
                    background: kycLevel >= 1 ? '#0ecb81' : '#f0b90b',
                    border: 'none',
                    borderRadius: '6px',
                    color: kycLevel >= 1 ? '#0a0b0e' : '#0a0b0e',
                    cursor: kycLevel >= 1 ? 'default' : 'pointer',
                    fontWeight: '600',
                    opacity: kycLevel >= 1 ? 0.7 : 1
                  }}
                >
                  {kycLevel >= 1 ? '✅ Level 1 Complete' : '⬆️ Upgrade to Level 1'}
                </button>
                <button
                  onClick={() => handleKYCUpgrade(2)}
                  disabled={kycLevel >= 2 || kycLevel < 1}
                  style={{
                    padding: '10px 24px',
                    background: kycLevel >= 2 ? '#0ecb81' : (kycLevel < 1 ? '#2a2e39' : '#f0b90b'),
                    border: 'none',
                    borderRadius: '6px',
                    color: kycLevel >= 2 ? '#0a0b0e' : (kycLevel < 1 ? '#848e9c' : '#0a0b0e'),
                    cursor: (kycLevel >= 2 || kycLevel < 1) ? 'default' : 'pointer',
                    fontWeight: '600',
                    opacity: (kycLevel >= 2 || kycLevel < 1) ? 0.7 : 1
                  }}
                >
                  {kycLevel >= 2 ? '✅ Level 2 Complete' : (kycLevel < 1 ? '🔒 Complete Level 1 first' : '⬆️ Upgrade to Level 2')}
                </button>
                <button
                  onClick={() => handleKYCUpgrade(3)}
                  disabled={kycLevel >= 3 || kycLevel < 2}
                  style={{
                    padding: '10px 24px',
                    background: kycLevel >= 3 ? '#0ecb81' : (kycLevel < 2 ? '#2a2e39' : '#f0b90b'),
                    border: 'none',
                    borderRadius: '6px',
                    color: kycLevel >= 3 ? '#0a0b0e' : (kycLevel < 2 ? '#848e9c' : '#0a0b0e'),
                    cursor: (kycLevel >= 3 || kycLevel < 2) ? 'default' : 'pointer',
                    fontWeight: '600',
                    opacity: (kycLevel >= 3 || kycLevel < 2) ? 0.7 : 1
                  }}
                >
                  {kycLevel >= 3 ? '✅ Level 3 Complete' : (kycLevel < 2 ? '🔒 Complete Level 2 first' : '⬆️ Upgrade to Level 3')}
                </button>
              </div>
              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(240,185,11,0.1)', borderRadius: '6px' }}>
                <p style={{ color: '#f0b90b', fontSize: '13px', margin: 0 }}>
                  ⚠️ <strong>Mandatory:</strong> KYC verification is required by US Federal Law and Global AML regulations.
                  <br />Processing time: 24-48 hours after submission.
                </p>
              </div>
            </div>

            {/* Limits Summary */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <h4>📊 Your Limits</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ color: '#848e9c', fontSize: '12px' }}>Daily Deposit</div>
                  <div style={{ color: '#0ecb81', fontSize: '18px', fontWeight: '600' }}>
                    ${getDailyDepositLimit().toLocaleString()}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ color: '#848e9c', fontSize: '12px' }}>Daily Withdrawal</div>
                  <div style={{ color: '#f0b90b', fontSize: '18px', fontWeight: '600' }}>
                    ${getDailyWithdrawLimit().toLocaleString()}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '6px' }}>
                  <div style={{ color: '#848e9c', fontSize: '12px' }}>Monthly Trade</div>
                  <div style={{ color: '#627eea', fontSize: '18px', fontWeight: '600' }}>
                    ${getMonthlyTradeLimit().toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== SECURITY TAB ===== */}
        {activeTab === 'security' && (
          <div className="account-section-binance">
            <div className="account-section-header">
              <h3>🔐 Security</h3>
              <p style={{ color: '#848e9c' }}>Manage your security settings</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '24px' }}>🔑</div>
                <div style={{ fontWeight: '600' }}>2FA</div>
                <div style={{ color: securityData.twoFAEnabled ? '#0ecb81' : '#f6465d' }}>{securityData.twoFAEnabled ? '✅ Active' : '❌ Disabled'}</div>
                <button onClick={toggle2FA} style={{ marginTop: '8px', padding: '6px 16px', background: securityData.twoFAEnabled ? '#f6465d' : '#0ecb81', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
                  {securityData.twoFAEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '24px' }}>🔒</div>
                <div style={{ fontWeight: '600' }}>Change Password</div>
                <input type="password" placeholder="Current" value={securityData.currentPassword} onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})} style={{ width: '100%', marginBottom: '6px', padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', color: '#eaecef' }} />
                <input type="password" placeholder="New (min 8 chars)" value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} style={{ width: '100%', marginBottom: '6px', padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', color: '#eaecef' }} />
                <input type="password" placeholder="Confirm" value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} style={{ width: '100%', marginBottom: '6px', padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', color: '#eaecef' }} />
                <button onClick={changePassword} disabled={loading} style={{ padding: '6px 16px', background: '#f0b90b', border: 'none', borderRadius: '4px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer', width: '100%' }}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '24px' }}>🛡️</div>
                <div style={{ fontWeight: '600' }}>Anti-Phishing</div>
                <div style={{ color: '#f0b90b' }}>⚠️ Not Set</div>
                <button style={{ marginTop: '8px', padding: '6px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}>Set Code</button>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '24px' }}>📱</div>
                <div style={{ fontWeight: '600' }}>Sessions</div>
                <div style={{ color: '#848e9c' }}>2 active</div>
                <button style={{ marginTop: '8px', padding: '6px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}>Manage</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== LIMITS TAB ===== */}
        {activeTab === 'limits' && (
          <div className="account-section-binance">
            <div className="account-section-header">
              <h3>📊 Transaction Limits</h3>
              <p style={{ color: '#848e9c' }}>View your daily transaction limits</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {Object.entries(limits).map(([key, value]) => {
                const percentage = (value.used / value.max) * 100;
                const labels = {
                  dailyDeposit: 'Daily Deposit',
                  dailyWithdraw: 'Daily Withdraw',
                  dailyTrade: 'Daily Trade',
                  monthlyWithdraw: 'Monthly Withdraw'
                };
                return (
                  <div key={key} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ color: '#848e9c', fontSize: '13px' }}>{labels[key] || key}</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#f0b90b' }}>${value.used.toLocaleString()}</div>
                    <div style={{ color: '#848e9c', fontSize: '12px' }}>of ${value.max.toLocaleString()}</div>
                    <div style={{ marginTop: '8px', width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                      <div style={{ width: `${Math.min(percentage, 100)}%`, height: '100%', background: percentage > 80 ? '#f6465d' : '#0ecb81', borderRadius: '2px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== REFERRAL TAB ===== */}
        {activeTab === 'referral' && (
          <div className="account-section-binance">
            <div className="account-section-header">
              <h3>🎁 Referral Program</h3>
              <p style={{ color: '#848e9c' }}>Invite friends and earn commission</p>
            </div>
            
            <div className="referral-card-binance" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="referral-stats-binance" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#f0b90b' }}>{referralData.count}</div>
                  <div style={{ color: '#848e9c', fontSize: '13px' }}>Total Referrals</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#0ecb81' }}>${referralData.earnings.toFixed(2)}</div>
                  <div style={{ color: '#848e9c', fontSize: '13px' }}>Earnings</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#627eea' }}>{referralData.commissionRate}%</div>
                  <div style={{ color: '#848e9c', fontSize: '13px' }}>Commission Rate</div>
                </div>
              </div>

              <div className="referral-code-binance" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div style={{ color: '#848e9c', fontSize: '12px' }}>Your Referral Code</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#f0b90b', fontFamily: 'monospace' }}>{referralData.code}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={copyReferralCode} style={{ padding: '8px 16px', background: '#f0b90b', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}>
                    📋 Copy
                  </button>
                  <button onClick={shareReferral} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}>
                    📤 Share
                  </button>
                </div>
              </div>

              <div className="referral-rewards" style={{ marginTop: '16px' }}>
                <h4 style={{ marginTop: 0 }}>🎯 Referral Rewards</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px' }}>1️⃣</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#f0b90b' }}>10%</div>
                    <div style={{ fontSize: '12px', color: '#848e9c' }}>First referral</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px' }}>5️⃣</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#f0b90b' }}>15%</div>
                    <div style={{ fontSize: '12px', color: '#848e9c' }}>5+ referrals</div>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px' }}>🔟</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#f0b90b' }}>20%</div>
                    <div style={{ fontSize: '12px', color: '#848e9c' }}>10+ referrals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== VIP TAB ===== */}
        {activeTab === 'vip' && (
          <div className="account-section-binance">
            <div className="account-section-header">
              <h3>👑 VIP Program</h3>
              <p style={{ color: '#848e9c' }}>Unlock exclusive benefits and rewards</p>
            </div>
            
            <div className="vip-card-binance" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="vip-tier-binance" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ color: '#848e9c' }}>Current Tier</span>
                <span style={{ fontSize: '24px', fontWeight: '700', color: '#f0b90b' }}>🥈 {vipTier}</span>
              </div>
              <div className="vip-progress-binance" style={{ marginBottom: '16px' }}>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Next Tier: Gold</span>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', marginTop: '4px' }}>
                  <div style={{ width: `${vipProgress}%`, height: '100%', background: '#f0b90b', borderRadius: '3px' }}></div>
                </div>
                <span style={{ color: '#848e9c', fontSize: '12px' }}>{vipProgress}% complete</span>
              </div>
              <div className="vip-benefits-binance" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>💳 0.05% Trading Fee</div>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>📈 $200,000 Withdraw Limit</div>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>🎯 Priority Support</div>
                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>🏆 Exclusive Events</div>
              </div>
            </div>
          </div>
        )}

        {/* ===== ACTIVITY TAB ===== */}
        {activeTab === 'activity' && (
          <div className="account-section-binance">
            <div className="account-section-header">
              <h3>📋 Activity Log</h3>
              <p style={{ color: '#848e9c' }}>View your account activity and login history</p>
            </div>
            
            <div className="activity-list-binance">
              {activityLog.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ fontSize: '20px' }}>
                    {item.action === 'Login' && '🔓'}
                    {item.action === 'Trade' && '📊'}
                    {item.action === 'Withdraw' && '💰'}
                    {item.action === 'Deposit' && '📥'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600' }}>{item.action}</div>
                    <div style={{ color: '#848e9c', fontSize: '13px' }}>{item.ip} • {item.location} • {item.device}</div>
                  </div>
                  <div style={{ color: '#848e9c', fontSize: '13px' }}>{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== DATA TAB ===== */}
        {activeTab === 'data' && (
          <div className="account-section-binance">
            <div className="account-section-header">
              <h3>💾 Data Management</h3>
              <p style={{ color: '#848e9c' }}>Export or delete your account data</p>
            </div>
            
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>📥 Export Data</div>
                  <div style={{ color: '#848e9c', fontSize: '13px' }}>Download all your transaction and trade data</div>
                </div>
                <button onClick={exportData} style={{ padding: '8px 16px', background: '#0ecb81', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}>
                  Export JSON
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>📄 Tax Reports</div>
                  <div style={{ color: '#848e9c', fontSize: '13px' }}>Generate tax report for your trades</div>
                </div>
                <button style={{ padding: '8px 16px', background: '#f0b90b', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}>
                  Generate
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(246, 70, 93, 0.05)', borderRadius: '8px', border: '1px solid rgba(246, 70, 93, 0.1)' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#f6465d' }}>🗑️ Delete Account</div>
                  <div style={{ color: '#848e9c', fontSize: '13px' }}>Permanently delete your account and data</div>
                </div>
                <button onClick={deleteAccount} style={{ padding: '8px 16px', background: '#f6465d', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== LOGOUT BUTTON ===== */}
      <div className="logout-section-binance" style={{
        marginTop: '32px',
        paddingTop: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleLogout}
          style={{
            padding: '14px 48px',
            background: 'rgba(246, 70, 93, 0.1)',
            border: '1px solid rgba(246, 70, 93, 0.2)',
            borderRadius: '10px',
            color: '#f6465d',
            fontWeight: '600',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'Inter, sans-serif'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(246, 70, 93, 0.2)';
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(246, 70, 93, 0.1)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          <span style={{ fontSize: '20px' }}>🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Account;