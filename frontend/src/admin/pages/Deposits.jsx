import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ ADD THIS LINE
const API_URL = import.meta.env.VITE_API_URL || 'https://tradeflows.site';

const Deposits = () => {
  // ===== STATE =====
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAsset, setFilterAsset] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectId, setRejectId] = useState(null);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0, totalAmount: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // ===== FETCH DEPOSITS =====
  useEffect(() => {
    fetchDeposits();
    fetchStats();
  }, []);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      const response = await axios.get(`${API_URL}/api/admin/deposits/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeposits(response.data || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
      // Fallback mock data
      setDeposits([
        {
          id: 1,
          username: 'Alice Johnson',
          email: 'alice@email.com',
          asset: 'USDT',
          amount: 5000,
          network: 'TRC-20',
          address: 'TT7aLqkJ4Cfg8eF19PsJY3tXXSGqKYtcPn',
          txid: '0x8f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c',
          status: 'pending',
          confirmations: 3,
          requiredConfirmations: 12,
          timestamp: '2024-07-20 14:30:22',
          risk: 'Low',
          notes: 'First deposit'
        },
        {
          id: 2,
          username: 'Bob Smith',
          email: 'bob@email.com',
          asset: 'BTC',
          amount: 0.5,
          network: 'BTC (Native SegWit)',
          address: 'bc1q8augnskzpdgy4uyekda9zcmk5x4ymrd6lfzuna',
          txid: 'bc1q8augnskzpdgy4uyekda9zcmk5x4ymrd6lfzuna',
          status: 'pending',
          confirmations: 1,
          requiredConfirmations: 6,
          timestamp: '2024-07-19 12:15:45',
          risk: 'Low',
          notes: 'BTC deposit'
        },
        {
          id: 3,
          username: 'Charlie Lee',
          email: 'charlie@email.com',
          asset: 'ETH',
          amount: 2.5,
          network: 'ERC-20',
          address: '0x3208bc056390ea8defbaf6f14b591b12836e3544',
          txid: '0x9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
          status: 'approved',
          confirmations: 15,
          requiredConfirmations: 12,
          timestamp: '2024-07-18 10:00:10',
          risk: 'Low',
          notes: 'ETH deposit - Approved'
        },
        {
          id: 4,
          username: 'Diana Park',
          email: 'diana@email.com',
          asset: 'SOL',
          amount: 120,
          network: 'Solana (SPL)',
          address: '5M6FpRxVJjPXgUHyCKsFpPpKvJxHgE5YCHbUhxrVVwLJ',
          txid: '5M6FpRxVJjPXgUHyCKsFpPpKvJxHgE5YCHbUhxrVVwLJ',
          status: 'pending',
          confirmations: 8,
          requiredConfirmations: 20,
          timestamp: '2024-07-17 22:20:15',
          risk: 'Medium',
          notes: 'Large deposit'
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
          pending: response.data.pendingDeposits || 0,
          approved: response.data.approvedDeposits || 0,
          rejected: response.data.rejectedDeposits || 0,
          total: response.data.totalDeposits || 0,
          totalAmount: response.data.totalDepositAmount || 0
        });
      }
    } catch (error) {
      console.log('Stats not available');
    }
  };

  // ===== DEPOSIT ACTIONS =====
  const handleAction = async (action, deposit) => {
    console.log(`🔘 ${action} clicked for deposit:`, deposit);

    switch(action) {
      case 'view':
        setSelectedDeposit(deposit);
        setShowDetailModal(true);
        break;

      case 'confirm':
        setConfirmId(deposit.id);
        setShowConfirmModal(true);
        break;

      case 'reject':
        setRejectId(deposit.id);
        setRejectReason('');
        setShowRejectModal(true);
        break;

      default:
        alert(`✅ ${action} clicked!`);
    }
  };

  // ===== CONFIRM DEPOSIT =====
  const confirmDeposit = async () => {
    const deposit = deposits.find(d => d.id === confirmId);
    if (!deposit) return;

    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      await axios.put(`${API_URL}/api/admin/deposits/${deposit.id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`✅ Deposit confirmed!\n💰 ${deposit.amount} ${deposit.asset} credited to ${deposit.username}`);
      setShowConfirmModal(false);
      setConfirmId(null);
      fetchDeposits();
      fetchStats();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // ===== REJECT DEPOSIT =====
  const rejectDeposit = async () => {
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      await axios.put(`${API_URL}/api/admin/deposits/${rejectId}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`❌ Deposit rejected`);
      setShowRejectModal(false);
      setRejectId(null);
      setRejectReason('');
      fetchDeposits();
      fetchStats();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // ===== FILTER DEPOSITS =====
  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = (deposit.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (deposit.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (deposit.txid || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAsset = filterAsset === 'all' || deposit.asset === filterAsset;
    const matchesStatus = filterStatus === 'all' || deposit.status === filterStatus;
    return matchesSearch && matchesAsset && matchesStatus;
  });

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
  const paginatedDeposits = filteredDeposits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f0b90b';
      case 'approved': return '#0ecb81';
      case 'rejected': return '#f6465d';
      default: return '#848e9c';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '🔄';
    }
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'Low': return '#0ecb81';
      case 'Medium': return '#f0b90b';
      case 'High': return '#f6465d';
      default: return '#848e9c';
    }
  };

  const getConfirmationProgress = (deposit) => {
    const progress = (deposit.confirmations / deposit.requiredConfirmations) * 100;
    return Math.min(progress, 100);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>⏳ Loading deposits...</div>;
  }

  return (
    <div className="admin-page" style={{ padding: '0' }}>
      <h2 style={{ marginTop: 0 }}>📥 Deposits Management</h2>
      <p style={{ color: '#848e9c', marginBottom: '24px' }}>Monitor and confirm all deposit transactions</p>

      {/* Stats Summary */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Pending</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f0b90b' }}>{stats.pending}</div>
          <div style={{ fontSize: '12px', color: '#f0b90b' }}>Awaiting confirmation</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Approved</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0ecb81' }}>{stats.approved}</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>Completed deposits</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Rejected</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f6465d' }}>{stats.rejected}</div>
          <div style={{ fontSize: '12px', color: '#f6465d' }}>Returned to user</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Total</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#627eea' }}>{stats.total}</div>
          <div style={{ fontSize: '12px', color: '#627eea' }}>All time</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Total Volume</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0ecb81' }}>${(stats.totalAmount || 0).toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>All deposits</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="🔍 Search by user or TxID..."
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
          value={filterAsset}
          onChange={(e) => setFilterAsset(e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#eaecef',
            fontSize: '14px'
          }}
        >
          <option value="all">All Assets</option>
          <option value="USDT">USDT</option>
          <option value="BTC">BTC</option>
          <option value="ETH">ETH</option>
          <option value="SOL">SOL</option>
        </select>
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
          <option value="pending">⏳ Pending</option>
          <option value="approved">✅ Approved</option>
          <option value="rejected">❌ Rejected</option>
        </select>
        <button
          onClick={() => {
            const pending = deposits.filter(d => d.status === 'pending');
            if (pending.length === 0) {
              alert('No pending deposits');
              return;
            }
            if (confirm(`Approve all ${pending.length} pending deposits?`)) {
              pending.forEach(d => handleAction('confirm', d));
            }
          }}
          style={{
            padding: '8px 16px',
            background: '#0ecb81',
            border: 'none',
            borderRadius: '6px',
            color: '#0a0b0e',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ✅ Approve All Pending
        </button>
        <button
          onClick={fetchDeposits}
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

      {/* Deposits Table */}
      <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>User</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Asset</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Confirmations</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Time</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDeposits.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                  <p>No deposits found</p>
                </td>
              </tr>
            ) : (
              paginatedDeposits.map(deposit => (
                <tr key={deposit.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', color: '#848e9c' }}>
                    #{deposit.id}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <div style={{ color: '#eaecef' }}>{deposit.username}</div>
                      <div style={{ fontSize: '11px', color: '#848e9c' }}>{deposit.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#f0b90b' }}>{deposit.asset}</td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0ecb81' }}>
                    +{deposit.amount}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '60px',
                        height: '4px',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${getConfirmationProgress(deposit)}%`,
                          height: '100%',
                          background: getConfirmationProgress(deposit) >= 100 ? '#0ecb81' : '#f0b90b',
                          borderRadius: '2px'
                        }} />
                      </div>
                      <span style={{ fontSize: '12px', color: '#848e9c' }}>
                        {deposit.confirmations}/{deposit.requiredConfirmations}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: getStatusColor(deposit.status) + '20',
                      color: getStatusColor(deposit.status),
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {getStatusIcon(deposit.status)} {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#848e9c' }}>
                    {deposit.timestamp}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleAction('view', deposit)}
                        style={{ padding: '4px 8px', background: '#2a2e39', border: 'none', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}
                        title="View"
                      >
                        👁️
                      </button>
                      {deposit.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction('confirm', deposit)}
                            style={{ padding: '4px 8px', background: '#0ecb81', border: 'none', borderRadius: '4px', color: '#0a0b0e', cursor: 'pointer' }}
                            title="Confirm"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => handleAction('reject', deposit)}
                            style={{ padding: '4px 8px', background: '#f6465d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
                            title="Reject"
                          >
                            ❌
                          </button>
                        </>
                      )}
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
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredDeposits.length)} of {filteredDeposits.length}
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

      {/* ===== DETAIL MODAL ===== */}
      {showDetailModal && selectedDeposit && (
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
            maxWidth: '650px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>📋 Deposit Details</h3>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#f0b90b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: '700',
                color: '#0a0b0e'
              }}>
                {selectedDeposit.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#eaecef' }}>{selectedDeposit.username}</div>
                <div style={{ color: '#848e9c' }}>{selectedDeposit.email}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span style={{
                    background: getStatusColor(selectedDeposit.status) + '20',
                    color: getStatusColor(selectedDeposit.status),
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {getStatusIcon(selectedDeposit.status)} {selectedDeposit.status.charAt(0).toUpperCase() + selectedDeposit.status.slice(1)}
                  </span>
                  <span style={{
                    background: getRiskColor(selectedDeposit.risk) + '20',
                    color: getRiskColor(selectedDeposit.risk),
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    Risk: {selectedDeposit.risk}
                  </span>
                </div>
              </div>
            </div>

            {/* Deposit Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Asset</span><div style={{ color: '#eaecef' }}>{selectedDeposit.asset}</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Amount</span><div style={{ color: '#0ecb81', fontWeight: '600' }}>+{selectedDeposit.amount}</div></div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Network</span>
                <div style={{ color: '#eaecef' }}>{selectedDeposit.network}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Address</span>
                <div style={{
                  color: '#eaecef',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  wordBreak: 'break-all',
                  padding: '4px 8px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '4px'
                }}>
                  {selectedDeposit.address}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>TxID / Hash</span>
                <div style={{
                  color: '#eaecef',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  wordBreak: 'break-all',
                  padding: '4px 8px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '4px'
                }}>
                  {selectedDeposit.txid}
                </div>
              </div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Confirmations</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '100px',
                    height: '4px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${getConfirmationProgress(selectedDeposit)}%`,
                      height: '100%',
                      background: getConfirmationProgress(selectedDeposit) >= 100 ? '#0ecb81' : '#f0b90b',
                      borderRadius: '2px'
                    }} />
                  </div>
                  <span style={{ color: '#eaecef' }}>
                    {selectedDeposit.confirmations}/{selectedDeposit.requiredConfirmations}
                  </span>
                </div>
              </div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Timestamp</span><div style={{ color: '#eaecef' }}>{selectedDeposit.timestamp}</div></div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Notes</span>
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '4px',
                  color: '#848e9c',
                  fontSize: '13px'
                }}>
                  {selectedDeposit.notes || 'No notes'}
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedDeposit.status === 'pending' && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { handleAction('reject', selectedDeposit); setShowDetailModal(false); }}
                  style={{ padding: '10px 24px', background: '#f6465d', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => { handleAction('confirm', selectedDeposit); setShowDetailModal(false); }}
                  style={{ padding: '10px 24px', background: '#0ecb81', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}
                >
                  ✅ Confirm
                </button>
              </div>
            )}
            <button
              onClick={() => setShowDetailModal(false)}
              style={{ marginTop: '12px', padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ===== CONFIRM MODAL ===== */}
      {showConfirmModal && (
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
              <h3 style={{ margin: 0 }}>✅ Confirm Deposit</h3>
              <button onClick={() => setShowConfirmModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '16px', color: '#848e9c' }}>
              <p>Are you sure you want to confirm this deposit?</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>The funds will be credited to the user's account immediately.</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmDeposit} style={{ padding: '8px 20px', background: '#0ecb81', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== REJECT MODAL ===== */}
      {showRejectModal && (
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
              <h3 style={{ margin: 0 }}>❌ Reject Deposit</h3>
              <button onClick={() => setShowRejectModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows="4"
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

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowRejectModal(false)} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}>Cancel</button>
              <button onClick={rejectDeposit} style={{ padding: '8px 20px', background: '#f6465d', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deposits;