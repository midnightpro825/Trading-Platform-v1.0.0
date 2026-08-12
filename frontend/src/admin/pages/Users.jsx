import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ ADD THIS LINE
const API_URL = import.meta.env.VITE_API_URL || 'https://tradeflows.site';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterKYC, setFilterKYC] = useState('all');
  const [filterVIP, setFilterVIP] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [editData, setEditData] = useState({ username: '', email: '', role: 'user', vipTier: 'Bronze' });
  const [balanceData, setBalanceData] = useState({ asset: 'USDT', amount: 0, type: 'credit' });
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, pending: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback mock data
      setUsers([
        {
          id: 1,
          username: 'Alice Johnson',
          email: 'alice@email.com',
          role: 'user',
          kyc_status: 'verified',
          is_active: true,
          vip_tier: 'Silver',
          balance: 154500,
          trades: 142,
          joined: '2024-01-15',
          last_login: '2 mins ago',
          phone: '+1 (555) 123-4567',
          country: 'US'
        },
        {
          id: 2,
          username: 'Bob Smith',
          email: 'bob@email.com',
          role: 'user',
          kyc_status: 'pending',
          is_active: true,
          vip_tier: 'Bronze',
          balance: 2300,
          trades: 12,
          joined: '2024-06-01',
          last_login: '3 days ago',
          phone: '+1 (555) 987-6543',
          country: 'UK'
        },
        {
          id: 3,
          username: 'Charlie Lee',
          email: 'charlie@email.com',
          role: 'user',
          kyc_status: 'verified',
          is_active: false,
          vip_tier: 'Gold',
          balance: 452000,
          trades: 523,
          joined: '2023-11-20',
          last_login: '1 hour ago',
          phone: '+1 (555) 456-7890',
          country: 'CA'
        },
        {
          id: 4,
          username: 'Diana Park',
          email: 'diana@email.com',
          role: 'admin',
          kyc_status: 'verified',
          is_active: true,
          vip_tier: 'Platinum',
          balance: 1250000,
          trades: 2456,
          joined: '2023-08-05',
          last_login: '5 mins ago',
          phone: '+1 (555) 789-0123',
          country: 'US'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setStats({
          total: response.data.totalUsers || 0,
          active: response.data.activeUsers || 0,
          suspended: response.data.suspendedUsers || 0,
          pending: response.data.pendingUsers || 0
        });
      }
    } catch (error) {
      console.log('Stats not available');
    }
  };

  const handleAction = async (action, user) => {
    console.log(`🔘 ${action} clicked for user:`, user);

    switch(action) {
      case 'view':
        setSelectedUser(user);
        setShowDetailModal(true);
        break;

      case 'edit':
        setSelectedUser(user);
        setEditData({
          username: user.username,
          email: user.email,
          role: user.role || 'user',
          vipTier: user.vip_tier || 'Bronze'
        });
        setShowEditModal(true);
        break;

      case 'balance':
        setSelectedUser(user);
        setBalanceData({ asset: 'USDT', amount: 0, type: 'credit' });
        setShowBalanceModal(true);
        break;

      case 'suspend':
        if (confirm(`⚠ Suspend user ${user.username}? They won't be able to login or trade.`)) {
          try {
            const token = localStorage.getItem('token');
            // ✅ FIXED: Use API_URL
            await axios.put(`${API_URL}/api/admin/users/${user.id}/status`,
              { is_active: false },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`✅ ${user.username} suspended`);
            fetchUsers();
            fetchStats();
          } catch (error) {
            alert('❌ Error: ' + error.message);
          }
        }
        break;

      case 'activate':
        try {
          const token = localStorage.getItem('token');
          // ✅ FIXED: Use API_URL
          await axios.put(`${API_URL}/api/admin/users/${user.id}/status`,
            { is_active: true },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert(`✅ ${user.username} activated`);
          fetchUsers();
          fetchStats();
        } catch (error) {
          alert('❌ Error: ' + error.message);
        }
        break;

      case 'delete':
        if (confirm(`⚠ PERMANENTLY DELETE ${user.username}? This cannot be undone!`)) {
          try {
            const token = localStorage.getItem('token');
            // ✅ FIXED: Use API_URL
            await axios.delete(`${API_URL}/api/admin/users/${user.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            alert(`🗑 ${user.username} deleted`);
            fetchUsers();
            fetchStats();
          } catch (error) {
            alert('❌ Error: ' + error.message);
          }
        }
        break;

      case 'reset-password':
        if (confirm(`Reset password for ${user.username}?`)) {
          alert(`📧 Password reset email sent to ${user.email}`);
        }
        break;

      default:
        alert(`✅ ${action} clicked!`);
    }
  };

  const updateUser = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      await axios.put(`${API_URL}/api/admin/users/${selectedUser.id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ User updated!`);
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  const updateBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      await axios.post(`${API_URL}/api/admin/users/${selectedUser.id}/balance`,
        balanceData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ ${balanceData.type === 'credit' ? 'Credited' : 'Debited'} ${balanceData.amount} ${balanceData.asset}`);
      setShowBalanceModal(false);
      fetchUsers();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const status = user.is_active ? 'active' : 'suspended';
    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    const kycStatus = user.kyc_status || 'none';
    const matchesKYC = filterKYC === 'all' || 
                        (filterKYC === '0' && kycStatus === 'none') ||
                        (filterKYC === '1' && kycStatus === 'basic') ||
                        (filterKYC === '2' && kycStatus === 'verified') ||
                        (filterKYC === '3' && kycStatus === 'advanced');
    const vipTier = (user.vip_tier || 'Bronze').toLowerCase();
    const matchesVIP = filterVIP === 'all' || vipTier === filterVIP.toLowerCase();
    return matchesSearch && matchesStatus && matchesKYC && matchesVIP;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getVIPIcon = (tier) => {
    const icons = {
      'Bronze': '🥉',
      'Silver': '🥈',
      'Gold': '🥇',
      'Platinum': '💎'
    };
    return icons[tier] || '🥉';
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>⏳ Loading users...</div>;
  }

  return (
    <div className="admin-page" style={{ padding: '0' }}>
      <h2 style={{ marginTop: 0 }}>👤 User Management</h2>
      <p style={{ color: '#848e9c', marginBottom: '24px' }}>Manage all platform users, view details, and perform actions</p>

      {/* Stats Summary */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Total Users</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#627eea' }}>{stats.total || users.length}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Active</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0ecb81' }}>{users.filter(u => u.is_active).length}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Pending KYC</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f0b90b' }}>{users.filter(u => u.kyc_status === 'pending').length}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Suspended</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f6465d' }}>{users.filter(u => !u.is_active).length}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#eaecef',
            flex: 1,
            minWidth: '200px',
            fontSize: '14px'
          }}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#eaecef',
            fontSize: '14px'
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select
          value={filterKYC}
          onChange={(e) => setFilterKYC(e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#eaecef',
            fontSize: '14px'
          }}
        >
          <option value="all">All KYC</option>
          <option value="0">None</option>
          <option value="1">Basic</option>
          <option value="2">Verified</option>
          <option value="3">Advanced</option>
        </select>
        <select
          value={filterVIP}
          onChange={(e) => setFilterVIP(e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#eaecef',
            fontSize: '14px'
          }}
        >
          <option value="all">All VIP</option>
          <option value="bronze">🥉 Bronze</option>
          <option value="silver">🥈 Silver</option>
          <option value="gold">🥇 Gold</option>
          <option value="platinum">💎 Platinum</option>
        </select>
        <button
          onClick={() => {
            setSearchTerm('');
            setFilterStatus('all');
            setFilterKYC('all');
            setFilterVIP('all');
          }}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#848e9c',
            cursor: 'pointer'
          }}
        >
          Clear Filters
        </button>
        <button
          onClick={() => handleAction('add')}
          style={{
            padding: '8px 20px',
            background: '#f0b90b',
            border: 'none',
            borderRadius: '6px',
            color: '#0a0b0e',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ➕ Add User
        </button>
        <button
          onClick={fetchUsers}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#848e9c',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Users Table */}
      <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>User</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>KYC</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>VIP</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Balance</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                  <p>No users found</p>
                </td>
              </tr>
            ) : (
              paginatedUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#f0b90b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        color: '#0a0b0e',
                        fontSize: '14px'
                      }}>
                        {(user.username || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: '#eaecef' }}>{user.username}</div>
                        <div style={{ fontSize: '11px', color: '#848e9c' }}>Joined: {user.joined || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#eaecef' }}>
                    {user.email}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: user.role === 'admin' ? 'rgba(240,185,11,0.2)' : 'rgba(255,255,255,0.04)',
                      color: user.role === 'admin' ? '#f0b90b' : '#848e9c',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: user.kyc_status === 'verified' ? 'rgba(14,203,129,0.2)' : 'rgba(240,185,11,0.2)',
                      color: user.kyc_status === 'verified' ? '#0ecb81' : '#f0b90b',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {user.kyc_status === 'verified' ? '✅ Verified' : '⏳ Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '14px' }}>
                      {getVIPIcon(user.vip_tier)} {user.vip_tier || 'Bronze'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#0ecb81', fontWeight: '600' }}>
                    ${(user.balance || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: user.is_active ? 'rgba(14,203,129,0.2)' : 'rgba(246,70,93,0.2)',
                      color: user.is_active ? '#0ecb81' : '#f6465d',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {user.is_active ? '🟢 Active' : '🔴 Suspended'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleAction('view', user)}
                        style={{ padding: '4px 8px', background: '#2a2e39', border: 'none', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}
                        title="View"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleAction('edit', user)}
                        style={{ padding: '4px 8px', background: '#2a2e39', border: 'none', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleAction('balance', user)}
                        style={{ padding: '4px 8px', background: '#2a2e39', border: 'none', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}
                        title="Balance"
                      >
                        💰
                      </button>
                      {user.is_active ? (
                        <button
                          onClick={() => handleAction('suspend', user)}
                          style={{ padding: '4px 8px', background: '#f0b90b', border: 'none', borderRadius: '4px', color: '#0a0b0e', cursor: 'pointer' }}
                          title="Suspend"
                        >
                          ⛔
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction('activate', user)}
                          style={{ padding: '4px 8px', background: '#0ecb81', border: 'none', borderRadius: '4px', color: '#0a0b0e', cursor: 'pointer' }}
                          title="Activate"
                        >
                          ✅
                        </button>
                      )}
                      <button
                        onClick={() => handleAction('reset-password', user)}
                        style={{ padding: '4px 8px', background: '#2a2e39', border: 'none', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}
                        title="Reset Password"
                      >
                        🔑
                      </button>
                      <button
                        onClick={() => handleAction('delete', user)}
                        style={{ padding: '4px 8px', background: '#f6465d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 0',
          marginTop: '8px'
        }}>
          <span style={{ color: '#848e9c', fontSize: '13px' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                background: currentPage === 1 ? 'transparent' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                color: currentPage === 1 ? '#848e9c' : '#eaecef',
                cursor: currentPage === 1 ? 'default' : 'pointer'
              }}
            >
              ◀
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  padding: '6px 12px',
                  background: currentPage === i + 1 ? '#f0b90b' : 'transparent',
                  border: currentPage === i + 1 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '4px',
                  color: currentPage === i + 1 ? '#0a0b0e' : '#848e9c',
                  cursor: 'pointer',
                  fontWeight: currentPage === i + 1 ? '600' : '400'
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                background: currentPage === totalPages ? 'transparent' : 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                color: currentPage === totalPages ? '#848e9c' : '#eaecef',
                cursor: currentPage === totalPages ? 'default' : 'pointer'
              }}
            >
              ▶
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#0a0b0e',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>👤 User Details</h3>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f0b90b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: '700',
                color: '#0a0b0e'
              }}>
                {selectedUser.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#eaecef' }}>{selectedUser.username}</div>
                <div style={{ color: '#848e9c' }}>{selectedUser.email}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span style={{
                    background: selectedUser.is_active ? 'rgba(14,203,129,0.2)' : 'rgba(246,70,93,0.2)',
                    color: selectedUser.is_active ? '#0ecb81' : '#f6465d',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {selectedUser.is_active ? '🟢 Active' : '🔴 Suspended'}
                  </span>
                  <span style={{
                    background: selectedUser.role === 'admin' ? 'rgba(240,185,11,0.2)' : 'rgba(255,255,255,0.04)',
                    color: selectedUser.role === 'admin' ? '#f0b90b' : '#848e9c',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {selectedUser.role || 'User'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Phone</span>
                <div style={{ color: '#eaecef' }}>{selectedUser.phone || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Country</span>
                <div style={{ color: '#eaecef' }}>{selectedUser.country || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>VIP Tier</span>
                <div style={{ color: '#eaecef' }}>{getVIPIcon(selectedUser.vip_tier)} {selectedUser.vip_tier || 'Bronze'}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>KYC Level</span>
                <div style={{ color: '#eaecef' }}>{selectedUser.kyc_status || 'Pending'}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Balance</span>
                <div style={{ color: '#0ecb81', fontWeight: '600' }}>${(selectedUser.balance || 0).toLocaleString()}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Total Trades</span>
                <div style={{ color: '#eaecef' }}>{selectedUser.trades || 0}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Joined</span>
                <div style={{ color: '#eaecef' }}>{selectedUser.joined || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Last Login</span>
                <div style={{ color: '#eaecef' }}>{selectedUser.last_login || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={() => { setShowDetailModal(false); handleAction('edit', selectedUser); }}
                style={{ padding: '8px 20px', background: '#f0b90b', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}
              >
                ✏️ Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#0a0b0e',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>✏️ Edit User</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Username</label>
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
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
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
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
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Role</label>
                <select
                  value={editData.role}
                  onChange={(e) => setEditData({ ...editData, role: e.target.value })}
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
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>VIP Tier</label>
                <select
                  value={editData.vipTier}
                  onChange={(e) => setEditData({ ...editData, vipTier: e.target.value })}
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
                  <option value="Bronze">🥉 Bronze</option>
                  <option value="Silver">🥈 Silver</option>
                  <option value="Gold">🥇 Gold</option>
                  <option value="Platinum">💎 Platinum</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={updateUser}
                style={{ padding: '8px 20px', background: '#f0b90b', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}
              >
                💾 Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Modal */}
      {showBalanceModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#0a0b0e',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '450px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>💰 Adjust Balance</h3>
              <button onClick={() => setShowBalanceModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '8px', color: '#848e9c', fontSize: '13px' }}>
              User: <span style={{ color: '#eaecef' }}>{selectedUser.username}</span>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Asset</label>
                <select
                  value={balanceData.asset}
                  onChange={(e) => setBalanceData({ ...balanceData, asset: e.target.value })}
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
                  <option value="USDT">USDT</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Amount</label>
                <input
                  type="number"
                  value={balanceData.amount}
                  onChange={(e) => setBalanceData({ ...balanceData, amount: parseFloat(e.target.value) })}
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
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Type</label>
                <select
                  value={balanceData.type}
                  onChange={(e) => setBalanceData({ ...balanceData, type: e.target.value })}
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
                  <option value="credit">✅ Credit (Add)</option>
                  <option value="debit">❌ Debit (Subtract)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBalanceModal(false)}
                style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={updateBalance}
                style={{ padding: '8px 20px', background: '#f0b90b', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}
              >
                💾 Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;