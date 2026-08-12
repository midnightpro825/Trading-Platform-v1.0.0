import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ ADD THIS LINE
const API_URL = import.meta.env.VITE_API_URL || 'https://tradeflows.site';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAsset, setFilterAsset] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    deposits: 0,
    withdrawals: 0,
    trades: 0,
    transfers: 0,
    total: 0,
    totalVolume: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      const response = await axios.get(`${API_URL}/api/admin/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Fallback mock data
      setTransactions([
        {
          id: 1,
          username: 'Alice Johnson',
          email: 'alice@email.com',
          type: 'deposit',
          asset: 'USDT',
          amount: 5000,
          fee: 0.5,
          status: 'completed',
          txid: '0x8f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c',
          timestamp: '2024-07-20 14:30:22',
          description: 'USDT deposit via TRC-20',
          confirmations: 12
        },
        {
          id: 2,
          username: 'Bob Smith',
          email: 'bob@email.com',
          type: 'withdrawal',
          asset: 'BTC',
          amount: 0.5,
          fee: 0.0005,
          status: 'pending',
          txid: null,
          timestamp: '2024-07-19 12:15:45',
          description: 'BTC withdrawal to external wallet',
          confirmations: 0
        },
        {
          id: 3,
          username: 'Charlie Lee',
          email: 'charlie@email.com',
          type: 'trade',
          asset: 'BTC/USDT',
          amount: 0.3,
          fee: 0.0003,
          status: 'completed',
          txid: '0x9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
          timestamp: '2024-07-18 10:00:10',
          description: 'BTC/USDT market buy',
          confirmations: 12
        },
        {
          id: 4,
          username: 'Diana Park',
          email: 'diana@email.com',
          type: 'deposit',
          asset: 'SOL',
          amount: 120,
          fee: 0.05,
          status: 'completed',
          txid: '5M6FpRxVJjPXgUHyCKsFpPpKvJxHgE5YCHbUhxrVVwLJ',
          timestamp: '2024-07-17 22:20:15',
          description: 'SOL deposit via SPL',
          confirmations: 20
        },
        {
          id: 5,
          username: 'Ethan Wu',
          email: 'ethan@email.com',
          type: 'transfer',
          asset: 'USDT',
          amount: 1000,
          fee: 0,
          status: 'completed',
          txid: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
          timestamp: '2024-07-16 14:05:33',
          description: 'Internal transfer to trading wallet',
          confirmations: 12
        },
        {
          id: 6,
          username: 'Fiona Zhang',
          email: 'fiona@email.com',
          type: 'withdrawal',
          asset: 'ETH',
          amount: 2.5,
          fee: 0.5,
          status: 'completed',
          txid: '0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d',
          timestamp: '2024-07-15 11:30:20',
          description: 'ETH withdrawal to external wallet',
          confirmations: 12
        },
        {
          id: 7,
          username: 'George Kim',
          email: 'george@email.com',
          type: 'deposit',
          asset: 'USDT',
          amount: 2500,
          fee: 0.5,
          status: 'pending',
          txid: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
          timestamp: '2024-07-14 09:45:00',
          description: 'USDT deposit awaiting confirmation',
          confirmations: 3
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
          deposits: response.data.totalDeposits || 0,
          withdrawals: response.data.totalWithdrawals || 0,
          trades: response.data.totalTrades || 0,
          transfers: response.data.totalTransfers || 0,
          total: response.data.totalTransactions || 0,
          totalVolume: response.data.totalVolume || 0
        });
      }
    } catch (error) {
      console.log('Stats not available');
    }
  };

  const handleAction = (action, transaction) => {
    console.log(`🔘 ${action} clicked for transaction:`, transaction);

    switch(action) {
      case 'view':
        setSelectedTransaction(transaction);
        setShowDetailModal(true);
        break;

      case 'receipt':
        alert(`📄 Generating receipt for transaction #${transaction.id}`);
        break;

      default:
        alert(`✅ ${action} clicked!`);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (transaction.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (transaction.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (transaction.txid || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesAsset = filterAsset === 'all' || transaction.asset === filterAsset;
    return matchesSearch && matchesType && matchesStatus && matchesAsset;
  });

  // Get unique assets for filter
  const assets = [...new Set(transactions.map(t => t.asset))];

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeIcon = (type) => {
    const icons = {
      deposit: '📥',
      withdrawal: '📤',
      trade: '📊',
      transfer: '🔄'
    };
    return icons[type] || '💳';
  };

  const getTypeColor = (type) => {
    const colors = {
      deposit: '#0ecb81',
      withdrawal: '#f6465d',
      trade: '#f0b90b',
      transfer: '#627eea'
    };
    return colors[type] || '#848e9c';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#0ecb81';
      case 'pending': return '#f0b90b';
      case 'failed': return '#f6465d';
      default: return '#848e9c';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '🔄';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>⏳ Loading transactions...</div>;
  }

  return (
    <div className="admin-page" style={{ padding: '0' }}>
      <h2 style={{ marginTop: 0 }}>💰 Transaction Management</h2>
      <p style={{ color: '#848e9c', marginBottom: '24px' }}>View and manage all platform transactions across all types</p>

      {/* Stats Summary */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>📥 Deposits</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0ecb81' }}>{stats.deposits}</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>Incoming</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>📤 Withdrawals</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f6465d' }}>{stats.withdrawals}</div>
          <div style={{ fontSize: '12px', color: '#f6465d' }}>Outgoing</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>📊 Trades</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f0b90b' }}>{stats.trades}</div>
          <div style={{ fontSize: '12px', color: '#f0b90b' }}>Exchange</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>🔄 Transfers</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#627eea' }}>{stats.transfers}</div>
          <div style={{ fontSize: '12px', color: '#627eea' }}>Internal</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Total</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#eaecef' }}>{stats.total}</div>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>All transactions</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Total Volume</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0ecb81' }}>${(stats.totalVolume || 0).toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>All time</div>
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
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#eaecef',
            fontSize: '14px'
          }}
        >
          <option value="all">All Types</option>
          <option value="deposit">📥 Deposit</option>
          <option value="withdrawal">📤 Withdrawal</option>
          <option value="trade">📊 Trade</option>
          <option value="transfer">🔄 Transfer</option>
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
          <option value="completed">✅ Completed</option>
          <option value="pending">⏳ Pending</option>
          <option value="failed">❌ Failed</option>
        </select>
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
          {assets.map(asset => (
            <option key={asset} value={asset}>{asset}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearchTerm('');
            setFilterType('all');
            setFilterStatus('all');
            setFilterAsset('all');
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
          onClick={fetchTransactions}
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

      {/* Transactions Table */}
      <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>User</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Asset</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Fee</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                  <p>No transactions found</p>
                </td>
              </tr>
            ) : (
              paginatedTransactions.map(transaction => (
                <tr key={transaction.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', color: '#848e9c' }}>
                    #{transaction.id}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <div style={{ color: '#eaecef' }}>{transaction.username}</div>
                      <div style={{ fontSize: '11px', color: '#848e9c' }}>{transaction.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      color: getTypeColor(transaction.type),
                      fontWeight: '600'
                    }}>
                      {getTypeIcon(transaction.type)} {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#f0b90b' }}>
                    {transaction.asset}
                  </td>
                  <td style={{
                    padding: '12px 16px',
                    fontWeight: '600',
                    color: transaction.type === 'withdrawal' ? '#f6465d' : '#0ecb81'
                  }}>
                    {transaction.type === 'withdrawal' ? '-' : '+'}{transaction.amount}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#848e9c' }}>
                    {transaction.fee || 0}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: getStatusColor(transaction.status) + '20',
                      color: getStatusColor(transaction.status),
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {getStatusIcon(transaction.status)} {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleAction('view', transaction)}
                        style={{ padding: '4px 8px', background: '#2a2e39', border: 'none', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}
                        title="View"
                      >
                        👁️
                      </button>
                      {transaction.status === 'completed' && (
                        <button
                          onClick={() => handleAction('receipt', transaction)}
                          style={{ padding: '4px 8px', background: '#2a2e39', border: 'none', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}
                          title="Receipt"
                        >
                          📄
                        </button>
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
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
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
      {showDetailModal && selectedTransaction && (
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
              <h3 style={{ margin: 0 }}>📋 Transaction Details</h3>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

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
                {selectedTransaction.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#eaecef' }}>{selectedTransaction.username}</div>
                <div style={{ color: '#848e9c' }}>{selectedTransaction.email}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span style={{
                    background: getStatusColor(selectedTransaction.status) + '20',
                    color: getStatusColor(selectedTransaction.status),
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {getStatusIcon(selectedTransaction.status)} {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                  </span>
                  <span style={{
                    background: getTypeColor(selectedTransaction.type) + '20',
                    color: getTypeColor(selectedTransaction.type),
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {getTypeIcon(selectedTransaction.type)} {selectedTransaction.type.charAt(0).toUpperCase() + selectedTransaction.type.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Asset</span>
                <div style={{ color: '#eaecef' }}>{selectedTransaction.asset}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Amount</span>
                <div style={{
                  color: selectedTransaction.type === 'withdrawal' ? '#f6465d' : '#0ecb81',
                  fontWeight: '600'
                }}>
                  {selectedTransaction.type === 'withdrawal' ? '-' : '+'}{selectedTransaction.amount}
                </div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Fee</span>
                <div style={{ color: '#eaecef' }}>{selectedTransaction.fee || 0}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Status</span>
                <div style={{ color: getStatusColor(selectedTransaction.status) }}>
                  {getStatusIcon(selectedTransaction.status)} {selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
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
                  {selectedTransaction.txid || 'Not available'}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Description</span>
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '4px',
                  color: '#eaecef',
                  fontSize: '13px'
                }}>
                  {selectedTransaction.description || 'No description'}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Confirmations</span>
                <div style={{ color: '#eaecef' }}>{selectedTransaction.confirmations || 0}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Timestamp</span>
                <div style={{ color: '#eaecef' }}>{selectedTransaction.timestamp}</div>
              </div>
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              style={{ marginTop: '20px', padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;