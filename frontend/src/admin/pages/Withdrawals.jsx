import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Withdrawals = () => {
  // ===== STATE =====
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAsset, setFilterAsset] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [txHash, setTxHash] = useState('');
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0, totalAmount: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // ===== FETCH WITHDRAWALS =====
  useEffect(() => {
    fetchWithdrawals();
    fetchStats();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8081/api/admin/withdrawals/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWithdrawals(response.data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      // Fallback mock data
      setWithdrawals([
        {
          id: 1,
          username: 'Alice Johnson',
          email: 'alice@email.com',
          asset: 'USDT',
          amount: 5000,
          address: 'TT7aLqkJ4Cfg8eF19PsJY3tXXSGqKYtcPn',
          network: 'TRC-20',
          txid: null,
          status: 'pending',
          fee: 0.5,
          timestamp: '2024-07-20 14:30:22',
          risk: 'Low',
          notes: 'First withdrawal request'
        },
        {
          id: 2,
          username: 'Bob Smith',
          email: 'bob@email.com',
          asset: 'BTC',
          amount: 0.5,
          address: 'bc1q8augnskzpdgy4uyekda9zcmk5x4ymrd6lfzuna',
          network: 'BTC (Native SegWit)',
          txid: null,
          status: 'pending',
          fee: 0.0005,
          timestamp: '2024-07-19 12:15:45',
          risk: 'Low',
          notes: 'BTC withdrawal'
        },
        {
          id: 3,
          username: 'Charlie Lee',
          email: 'charlie@email.com',
          asset: 'ETH',
          amount: 2.5,
          address: '0x3208bc056390ea8defbaf6f14b591b12836e3544',
          network: 'ERC-20',
          txid: '0x9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
          status: 'approved',
          fee: 0.5,
          timestamp: '2024-07-18 10:00:10',
          risk: 'Low',
          notes: 'ETH withdrawal - Approved'
        },
        {
          id: 4,
          username: 'Diana Park',
          email: 'diana@email.com',
          asset: 'SOL',
          amount: 120,
          address: '5M6FpRxVJjPXgUHyCKsFpPpKvJxHgE5YCHbUhxrVVwLJ',
          network: 'Solana (SPL)',
          txid: null,
          status: 'pending',
          fee: 0.05,
          timestamp: '2024-07-17 22:20:15',
          risk: 'Medium',
          notes: 'Large withdrawal'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8081/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setStats({
          pending: response.data.pendingWithdrawals || 0,
          approved: response.data.approvedWithdrawals || 0,
          rejected: response.data.rejectedWithdrawals || 0,
          total: response.data.totalWithdrawals || 0,
          totalAmount: response.data.totalWithdrawalAmount || 0
        });
      }
    } catch (error) {
      console.log('Stats not available');
    }
  };

  // ===== WITHDRAWAL ACTIONS =====
  const handleAction = async (action, withdrawal) => {
    console.log(`🔘 ${action} clicked for withdrawal:`, withdrawal);

    switch(action) {
      case 'view':
        setSelectedWithdrawal(withdrawal);
        setShowDetailModal(true);
        break;

      case 'approve':
        setConfirmId(withdrawal.id);
        setTxHash('');
        setShowConfirmModal(true);
        break;

      case 'reject':
        setRejectId(withdrawal.id);
        setRejectReason('');
        setShowRejectModal(true);
        break;

      default:
        alert(`✅ ${action} clicked!`);
    }
  };

  // ===== APPROVE WITHDRAWAL =====
  const approveWithdrawal = async () => {
    const withdrawal = withdrawals.find(w => w.id === confirmId);
    if (!withdrawal) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8081/api/admin/withdrawals/${withdrawal.id}/approve`,
        { tx_hash: txHash || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ Withdrawal approved!\n💰 ${withdrawal.amount} ${withdrawal.asset} sent to ${withdrawal.address}`);
      setShowConfirmModal(false);
      setConfirmId(null);
      setTxHash('');
      fetchWithdrawals();
      fetchStats();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // ===== REJECT WITHDRAWAL =====
  const rejectWithdrawal = async () => {
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8081/api/admin/withdrawals/${rejectId}/reject`,
        { reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`❌ Withdrawal rejected`);
      setShowRejectModal(false);
      setRejectId(null);
      setRejectReason('');
      fetchWithdrawals();
      fetchStats();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // ===== FILTER WITHDRAWALS =====
  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = (withdrawal.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (withdrawal.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (withdrawal.address || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAsset = filterAsset === 'all' || withdrawal.asset === filterAsset;
    const matchesStatus = filterStatus === 'all' || withdrawal.status === filterStatus;
    return matchesSearch && matchesAsset && matchesStatus;
  });

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  const paginatedWithdrawals = filteredWithdrawals.slice(
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>⏳ Loading withdrawals...</div>;
  }

  return (
    <div className="admin-page" style={{ padding: '0' }}>
      <h2 style={{ marginTop: 0 }}>📤 Withdrawals Management</h2>
      <p style={{ color: '#848e9c', marginBottom: '24px' }}>Monitor and process all withdrawal requests</p>

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
          <div style={{ fontSize: '12px', color: '#f0b90b' }}>Awaiting processing</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Approved</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0ecb81' }}>{stats.approved}</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>Completed withdrawals</div>
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
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f6465d' }}>${(stats.totalAmount || 0).toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#f6465d' }}>All withdrawals</div>
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
          placeholder="🔍 Search by user or address..."
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
            const pending = withdrawals.filter(w => w.status === 'pending');
            if (pending.length === 0) {
              alert('No pending withdrawals');
              return;
            }
            if (confirm(`Process all ${pending.length} pending withdrawals?`)) {
              pending.forEach(w => handleAction('approve', w));
            }
          }}
          style={{
            padding: '8px 16px',
            background: '#f0b90b',
            border: 'none',
            borderRadius: '6px',
            color: '#0a0b0e',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ⚡ Process All Pending
        </button>
        <button
          onClick={fetchWithdrawals}
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

      {/* Withdrawals Table */}
      <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>User</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Asset</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Address</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Time</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWithdrawals.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                  <p>No withdrawals found</p>
                </td>
              </tr>
            ) : (
              paginatedWithdrawals.map(withdrawal => (
                <tr key={withdrawal.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', color: '#848e9c' }}>
                    #{withdrawal.id}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <div style={{ color: '#eaecef' }}>{withdrawal.username}</div>
                      <div style={{ fontSize: '11px', color: '#848e9c' }}>{withdrawal.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#f0b90b' }}>{withdrawal.asset}</td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#f6465d' }}>
                    -{withdrawal.amount}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: '#848e9c',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {withdrawal.address?.substring(0, 15)}...
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: getStatusColor(withdrawal.status) + '20',
                      color: getStatusColor(withdrawal.status),
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {getStatusIcon(withdrawal.status)} {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#848e9c' }}>
                    {withdrawal.timestamp}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleAction('view', withdrawal)}
                        style={{ padding: '4px 8px', background: '#2a2e39', border: 'none', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}
                        title="View"
                      >
                        👁️
                      </button>
                      {withdrawal.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAction('approve', withdrawal)}
                            style={{ padding: '4px 8px', background: '#0ecb81', border: 'none', borderRadius: '4px', color: '#0a0b0e', cursor: 'pointer' }}
                            title="Approve"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => handleAction('reject', withdrawal)}
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
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredWithdrawals.length)} of {filteredWithdrawals.length}
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
      {showDetailModal && selectedWithdrawal && (
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
              <h3 style={{ margin: 0 }}>📋 Withdrawal Details</h3>
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
                {selectedWithdrawal.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#eaecef' }}>{selectedWithdrawal.username}</div>
                <div style={{ color: '#848e9c' }}>{selectedWithdrawal.email}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span style={{
                    background: getStatusColor(selectedWithdrawal.status) + '20',
                    color: getStatusColor(selectedWithdrawal.status),
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {getStatusIcon(selectedWithdrawal.status)} {selectedWithdrawal.status.charAt(0).toUpperCase() + selectedWithdrawal.status.slice(1)}
                  </span>
                  <span style={{
                    background: getRiskColor(selectedWithdrawal.risk) + '20',
                    color: getRiskColor(selectedWithdrawal.risk),
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    Risk: {selectedWithdrawal.risk}
                  </span>
                </div>
              </div>
            </div>

            {/* Withdrawal Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Asset</span><div style={{ color: '#eaecef' }}>{selectedWithdrawal.asset}</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Amount</span><div style={{ color: '#f6465d', fontWeight: '600' }}>-{selectedWithdrawal.amount}</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Fee</span><div style={{ color: '#eaecef' }}>{selectedWithdrawal.fee}</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Network</span><div style={{ color: '#eaecef' }}>{selectedWithdrawal.network}</div></div>
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
                  {selectedWithdrawal.address}
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
                  {selectedWithdrawal.txid || 'Not processed yet'}
                </div>
              </div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Timestamp</span><div style={{ color: '#eaecef' }}>{selectedWithdrawal.timestamp}</div></div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Notes</span>
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '4px',
                  color: '#848e9c',
                  fontSize: '13px'
                }}>
                  {selectedWithdrawal.notes || 'No notes'}
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedWithdrawal.status === 'pending' && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { handleAction('reject', selectedWithdrawal); setShowDetailModal(false); }}
                  style={{ padding: '10px 24px', background: '#f6465d', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  ❌ Reject
                </button>
                <button
                  onClick={() => { handleAction('approve', selectedWithdrawal); setShowDetailModal(false); }}
                  style={{ padding: '10px 24px', background: '#0ecb81', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}
                >
                  ✅ Approve
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

      {/* ===== APPROVE MODAL ===== */}
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
              <h3 style={{ margin: 0 }}>✅ Approve Withdrawal</h3>
              <button onClick={() => setShowConfirmModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '16px', color: '#848e9c' }}>
              <p>Are you sure you want to approve this withdrawal?</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>The funds will be sent to the user's address.</p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Transaction Hash (Optional)</label>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Enter TxID or leave empty"
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

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}>Cancel</button>
              <button onClick={approveWithdrawal} style={{ padding: '8px 20px', background: '#0ecb81', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}>Approve</button>
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
              <h3 style={{ margin: 0 }}>❌ Reject Withdrawal</h3>
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
              <button onClick={rejectWithdrawal} style={{ padding: '8px 20px', background: '#f6465d', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Withdrawals;