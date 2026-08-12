import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ ADD THIS LINE
const API_URL = import.meta.env.VITE_API_URL || 'https://tradeflows.site';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSide, setFilterSide] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPair, setFilterPair] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelId, setCancelId] = useState(null);
  const [stats, setStats] = useState({ open: 0, filled: 0, cancelled: 0, total: 0, totalVolume: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      const response = await axios.get(`${API_URL}/api/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback mock data
      setOrders([
        {
          id: 1,
          username: 'Alice Johnson',
          email: 'alice@email.com',
          pair: 'BTC/USDT',
          side: 'buy',
          type: 'limit',
          amount: 0.5,
          price: 61690,
          filled: 0.3,
          remaining: 0.2,
          status: 'open',
          leverage: 1,
          timestamp: '2024-07-20 14:30:22',
          stopLoss: 61000,
          takeProfit: 63000,
          pnl: 0,
          notes: 'Waiting for fill'
        },
        {
          id: 2,
          username: 'Bob Smith',
          email: 'bob@email.com',
          pair: 'ETH/USDT',
          side: 'sell',
          type: 'market',
          amount: 2,
          price: 1748,
          filled: 2,
          remaining: 0,
          status: 'filled',
          leverage: 2,
          timestamp: '2024-07-19 12:15:45',
          stopLoss: 1700,
          takeProfit: 1800,
          pnl: -120,
          notes: 'Filled order'
        },
        {
          id: 3,
          username: 'Charlie Lee',
          email: 'charlie@email.com',
          pair: 'SOL/USDT',
          side: 'buy',
          type: 'limit',
          amount: 50,
          price: 152,
          filled: 0,
          remaining: 50,
          status: 'open',
          leverage: 3,
          timestamp: '2024-07-18 10:00:10',
          stopLoss: 148,
          takeProfit: 160,
          pnl: 0,
          notes: 'Open order'
        },
        {
          id: 4,
          username: 'Diana Park',
          email: 'diana@email.com',
          pair: 'ADA/USDT',
          side: 'buy',
          type: 'limit',
          amount: 1000,
          price: 0.45,
          filled: 0,
          remaining: 1000,
          status: 'cancelled',
          leverage: 1,
          timestamp: '2024-07-17 22:20:15',
          stopLoss: 0.42,
          takeProfit: 0.48,
          pnl: 0,
          notes: 'Cancelled by user'
        },
        {
          id: 5,
          username: 'Ethan Wu',
          email: 'ethan@email.com',
          pair: 'BTC/USDT',
          side: 'sell',
          type: 'limit',
          amount: 0.3,
          price: 62000,
          filled: 0.3,
          remaining: 0,
          status: 'filled',
          leverage: 1,
          timestamp: '2024-07-16 14:05:33',
          stopLoss: 61500,
          takeProfit: 62500,
          pnl: 180,
          notes: 'Filled with profit'
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
          open: response.data.activeOrders || 0,
          filled: response.data.filledOrders || 0,
          cancelled: response.data.cancelledOrders || 0,
          total: response.data.totalOrders || 0,
          totalVolume: response.data.orderVolume || 0
        });
      }
    } catch (error) {
      console.log('Stats not available');
    }
  };

  const handleAction = async (action, order) => {
    console.log(`🔘 ${action} clicked for order:`, order);

    switch(action) {
      case 'view':
        setSelectedOrder(order);
        setShowDetailModal(true);
        break;

      case 'cancel':
        setCancelId(order.id);
        setShowCancelModal(true);
        break;

      default:
        alert(`✅ ${action} clicked!`);
    }
  };

  const cancelOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      // ✅ FIXED: Use API_URL
      await axios.delete(`${API_URL}/api/admin/orders/${cancelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`❌ Order ${cancelId} cancelled`);
      setShowCancelModal(false);
      setCancelId(null);
      fetchOrders();
      fetchStats();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = (order.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (order.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.pair?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSide = filterSide === 'all' || order.side === filterSide;
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPair = filterPair === 'all' || order.pair === filterPair;
    return matchesSearch && matchesSide && matchesStatus && matchesPair;
  });

  // Get unique pairs for filter
  const pairs = [...new Set(orders.map(o => o.pair))];

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return '#f0b90b';
      case 'filled': return '#0ecb81';
      case 'cancelled': return '#f6465d';
      default: return '#848e9c';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'open': return '⏳';
      case 'filled': return '✅';
      case 'cancelled': return '❌';
      default: return '🔄';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>⏳ Loading orders...</div>;
  }

  return (
    <div className="admin-page" style={{ padding: '0' }}>
      <h2 style={{ marginTop: 0 }}>📋 Orders Management</h2>
      <p style={{ color: '#848e9c', marginBottom: '24px' }}>Monitor and manage all trading orders across the platform</p>

      {/* Stats Summary */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Open</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f0b90b' }}>{stats.open}</div>
          <div style={{ fontSize: '12px', color: '#f0b90b' }}>Active orders</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Filled</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0ecb81' }}>{stats.filled}</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>Completed orders</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Cancelled</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f6465d' }}>{stats.cancelled}</div>
          <div style={{ fontSize: '12px', color: '#f6465d' }}>Cancelled orders</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Total</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#627eea' }}>{stats.total}</div>
          <div style={{ fontSize: '12px', color: '#627eea' }}>All time</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Total Volume</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0ecb81' }}>${(stats.totalVolume || 0).toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>All orders</div>
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
          placeholder="🔍 Search by user or pair..."
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
          value={filterSide}
          onChange={(e) => setFilterSide(e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#eaecef',
            fontSize: '14px'
          }}
        >
          <option value="all">All Sides</option>
          <option value="buy">🟢 Buy</option>
          <option value="sell">🔴 Sell</option>
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
          <option value="open">⏳ Open</option>
          <option value="filled">✅ Filled</option>
          <option value="cancelled">❌ Cancelled</option>
        </select>
        <select
          value={filterPair}
          onChange={(e) => setFilterPair(e.target.value)}
          style={{
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            color: '#eaecef',
            fontSize: '14px'
          }}
        >
          <option value="all">All Pairs</option>
          {pairs.map(pair => (
            <option key={pair} value={pair}>{pair}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearchTerm('');
            setFilterSide('all');
            setFilterStatus('all');
            setFilterPair('all');
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
          onClick={fetchOrders}
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

      {/* Orders Table */}
      <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>User</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Pair</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Side</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Price</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                  <p>No orders found</p>
                </td>
              </tr>
            ) : (
              paginatedOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', color: '#848e9c' }}>
                    #{order.id}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <div style={{ color: '#eaecef' }}>{order.username}</div>
                      <div style={{ fontSize: '11px', color: '#848e9c' }}>{order.email}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#f0b90b' }}>
                    {order.pair}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      color: order.side === 'buy' ? '#0ecb81' : '#f6465d',
                      fontWeight: '600'
                    }}>
                      {order.side?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>{order.amount}</div>
                    <div style={{ fontSize: '11px', color: '#848e9c' }}>Filled: {order.filled || 0}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div>${order.price}</div>
                    <div style={{ fontSize: '11px', color: '#848e9c' }}>{order.leverage}x</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: getStatusColor(order.status) + '20',
                      color: getStatusColor(order.status),
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleAction('view', order)}
                        style={{ padding: '4px 8px', background: '#2a2e39', border: 'none', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}
                        title="View"
                      >
                        👁️
                      </button>
                      {order.status === 'open' && (
                        <button
                          onClick={() => handleAction('cancel', order)}
                          style={{ padding: '4px 8px', background: '#f6465d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
                          title="Cancel"
                        >
                          ❌
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
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length}
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
      {showDetailModal && selectedOrder && (
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
              <h3 style={{ margin: 0 }}>📋 Order Details</h3>
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
                {selectedOrder.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#eaecef' }}>{selectedOrder.username}</div>
                <div style={{ color: '#848e9c' }}>{selectedOrder.email}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span style={{
                    background: getStatusColor(selectedOrder.status) + '20',
                    color: getStatusColor(selectedOrder.status),
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {getStatusIcon(selectedOrder.status)} {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                  <span style={{
                    background: selectedOrder.side === 'buy' ? 'rgba(14,203,129,0.2)' : 'rgba(246,70,93,0.2)',
                    color: selectedOrder.side === 'buy' ? '#0ecb81' : '#f6465d',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {selectedOrder.side?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Pair</span>
                <div style={{ color: '#eaecef' }}>{selectedOrder.pair}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Type</span>
                <div style={{ color: '#eaecef' }}>{selectedOrder.type}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Amount</span>
                <div style={{ color: '#eaecef' }}>{selectedOrder.amount}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Price</span>
                <div style={{ color: '#eaecef' }}>${selectedOrder.price}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Filled</span>
                <div style={{ color: '#eaecef' }}>{selectedOrder.filled || 0}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Remaining</span>
                <div style={{ color: '#eaecef' }}>{selectedOrder.remaining || 0}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Leverage</span>
                <div style={{ color: '#eaecef' }}>{selectedOrder.leverage}x</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>P&L</span>
                <div style={{
                  color: (selectedOrder.pnl || 0) >= 0 ? '#0ecb81' : '#f6465d',
                  fontWeight: '600'
                }}>
                  {(selectedOrder.pnl || 0) >= 0 ? '+' : ''}{selectedOrder.pnl || 0}
                </div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Stop Loss</span>
                <div style={{ color: '#eaecef' }}>${selectedOrder.stopLoss || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Take Profit</span>
                <div style={{ color: '#eaecef' }}>${selectedOrder.takeProfit || 'N/A'}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Notes</span>
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '4px',
                  color: '#848e9c',
                  fontSize: '13px'
                }}>
                  {selectedOrder.notes || 'No notes'}
                </div>
              </div>
            </div>

            {selectedOrder.status === 'open' && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { handleAction('cancel', selectedOrder); setShowDetailModal(false); }}
                  style={{ padding: '10px 24px', background: '#f6465d', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  ❌ Cancel Order
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

      {/* Cancel Modal */}
      {showCancelModal && (
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
              <h3 style={{ margin: 0 }}>❌ Cancel Order</h3>
              <button onClick={() => setShowCancelModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '16px', color: '#848e9c' }}>
              <p>Are you sure you want to cancel this order?</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>This action cannot be undone.</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCancelModal(false)} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}>Cancel</button>
              <button onClick={cancelOrder} style={{ padding: '8px 20px', background: '#f6465d', border: 'none', borderRadius: '6px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;