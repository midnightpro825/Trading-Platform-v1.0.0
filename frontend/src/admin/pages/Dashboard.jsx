import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ ADD THIS LINE
const API_URL = import.meta.env.VITE_API_URL || 'https://tradeflows.site';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 1542,
    activeUsers: 1247,
    newUsersToday: 38,
    totalVolume: 2450000000,
    activeOrders: 45,
    pendingWithdrawals: 12,
    systemUptime: 99.97,
    revenue: 124500,
    tradingFees: 84500,
    withdrawalFees: 32000,
    depositFees: 8000,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'user', action: 'New user registered', user: 'john@email.com', time: '2 mins ago' },
    { id: 2, type: 'kyc', action: 'KYC submitted', user: 'sarah@email.com', time: '15 mins ago' },
    { id: 3, type: 'trade', action: 'BTC/USDT trade executed', user: 'alice@email.com', time: '1 hour ago' },
    { id: 4, type: 'withdrawal', action: 'Withdrawal requested', user: 'bob@email.com', time: '2 hours ago' },
    { id: 5, type: 'deposit', action: 'USDT deposit confirmed', user: 'charlie@email.com', time: '3 hours ago' },
  ]);

  useEffect(() => {
    fetchStats();
    fetchActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setStats({ ...stats, ...response.data });
      }
    } catch (error) {
      console.log('Using mock stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      const response = await axios.get(`${API_URL}/api/admin/logs?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.length > 0) {
        setRecentActivity(response.data);
      }
    } catch (error) {
      console.log('Using mock activity');
    }
  };

  const handleQuickAction = (action) => {
    console.log('🔘 Quick action:', action);
    switch(action) {
      case 'add-user': window.location.href = '/admin/users'; break;
      case 'kyc': window.location.href = '/admin/kyc'; break;
      case 'withdrawals': window.location.href = '/admin/withdrawals'; break;
      case 'broadcast': alert('📢 Broadcast feature coming soon!'); break;
      default: alert(`✅ ${action} clicked!`);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>⏳ Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard" style={{ padding: '0' }}>
      <h2 style={{ marginTop: 0 }}>📊 Admin Dashboard</h2>
      <p style={{ color: '#848e9c', marginBottom: '24px' }}>Overview of platform activity and metrics</p>

      {/* Quick Stats */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="stat-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>TOTAL USERS</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#627eea' }}>{stats.totalUsers}</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>+{stats.newUsersToday} today</div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>TOTAL VOLUME</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#f0b90b' }}>${(stats.totalVolume / 1000000).toFixed(1)}M</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>+18.5%</div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>PENDING WITHDRAWALS</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#f6465d' }}>{stats.pendingWithdrawals}</div>
          <div style={{ fontSize: '12px', color: '#f6465d' }}>Need review</div>
        </div>
        <div className="stat-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>SYSTEM UPTIME</div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#0ecb81' }}>{stats.systemUptime}%</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>All systems go</div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="revenue-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="revenue-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>TOTAL REVENUE</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#0ecb81' }}>${stats.revenue.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>+8.2%</div>
        </div>
        <div className="revenue-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>TRADING FEES</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#f0b90b' }}>${stats.tradingFees.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>+12%</div>
        </div>
        <div className="revenue-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>WITHDRAWAL FEES</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#627eea' }}>${stats.withdrawalFees.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>+5%</div>
        </div>
        <div className="revenue-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>DEPOSIT FEES</div>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#9945ff' }}>${stats.depositFees.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>+3%</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions" style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <button onClick={() => handleQuickAction('add-user')} style={{ padding: '10px 20px', background: '#f0b90b', border: 'none', borderRadius: '8px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}>➕ Add User</button>
        <button onClick={() => handleQuickAction('kyc')} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#848e9c', cursor: 'pointer' }}>🪪 Process KYC</button>
        <button onClick={() => handleQuickAction('withdrawals')} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#848e9c', cursor: 'pointer' }}>📤 Approve Withdrawals</button>
        <button onClick={() => handleQuickAction('broadcast')} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', color: '#848e9c', cursor: 'pointer' }}>📢 Broadcast</button>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity" style={{
        background: 'rgba(255,255,255,0.02)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.04)'
      }}>
        <h4 style={{ marginTop: 0 }}>📋 Recent Activity</h4>
        {recentActivity.map(item => (
          <div key={item.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)'
          }}>
            <div>
              <div style={{ color: '#eaecef' }}>{item.action}</div>
              <div style={{ fontSize: '12px', color: '#848e9c' }}>{item.user}</div>
            </div>
            <div style={{ fontSize: '12px', color: '#848e9c' }}>{item.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;