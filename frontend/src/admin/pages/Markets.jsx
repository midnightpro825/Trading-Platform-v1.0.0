import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Markets = () => {
  // ===== STATE =====
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [formData, setFormData] = useState({
    pair: '',
    baseAsset: '',
    quoteAsset: '',
    minAmount: 0.0001,
    maxAmount: 100,
    minPrice: 0.01,
    maxPrice: 1000000,
    makerFee: 0.001,
    takerFee: 0.001,
    status: 'active'
  });
  const [stats, setStats] = useState({ total: 0, active: 0, paused: 0, maintenance: 0 });

  // ===== FETCH MARKETS =====
  useEffect(() => {
    fetchMarkets();
    fetchStats();
  }, []);

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8081/api/admin/markets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMarkets(response.data || []);
    } catch (error) {
      console.error('Error fetching markets:', error);
      // Fallback mock data
      setMarkets([
        {
          id: 1,
          pair: 'BTC/USDT',
          baseAsset: 'BTC',
          quoteAsset: 'USDT',
          price: 61690.47,
          change24h: 2.4,
          volume24h: 1245000000,
          minAmount: 0.0001,
          maxAmount: 10,
          minPrice: 0.01,
          maxPrice: 1000000,
          makerFee: 0.001,
          takerFee: 0.001,
          status: 'active',
          lastUpdated: '2024-07-20 14:30:22',
          icon: '₿',
          color: '#f7931a'
        },
        {
          id: 2,
          pair: 'ETH/USDT',
          baseAsset: 'ETH',
          quoteAsset: 'USDT',
          price: 1748.74,
          change24h: -0.97,
          volume24h: 456000000,
          minAmount: 0.001,
          maxAmount: 100,
          minPrice: 0.01,
          maxPrice: 10000,
          makerFee: 0.001,
          takerFee: 0.001,
          status: 'active',
          lastUpdated: '2024-07-20 14:30:22',
          icon: '⟠',
          color: '#627eea'
        },
        {
          id: 3,
          pair: 'SOL/USDT',
          baseAsset: 'SOL',
          quoteAsset: 'USDT',
          price: 152.30,
          change24h: 2.15,
          volume24h: 234000000,
          minAmount: 0.01,
          maxAmount: 10000,
          minPrice: 0.01,
          maxPrice: 1000,
          makerFee: 0.001,
          takerFee: 0.001,
          status: 'active',
          lastUpdated: '2024-07-20 14:30:22',
          icon: '◎',
          color: '#9945ff'
        },
        {
          id: 4,
          pair: 'ADA/USDT',
          baseAsset: 'ADA',
          quoteAsset: 'USDT',
          price: 0.45,
          change24h: -0.33,
          volume24h: 56700000,
          minAmount: 1,
          maxAmount: 1000000,
          minPrice: 0.0001,
          maxPrice: 10,
          makerFee: 0.001,
          takerFee: 0.001,
          status: 'paused',
          lastUpdated: '2024-07-19 12:15:45',
          icon: '₳',
          color: '#0033ad'
        },
        {
          id: 5,
          pair: 'DOGE/USDT',
          baseAsset: 'DOGE',
          quoteAsset: 'USDT',
          price: 0.12,
          change24h: -3.25,
          volume24h: 890000000,
          minAmount: 1,
          maxAmount: 1000000,
          minPrice: 0.0001,
          maxPrice: 1,
          makerFee: 0.001,
          takerFee: 0.001,
          status: 'active',
          lastUpdated: '2024-07-18 10:00:10',
          icon: '🐕',
          color: '#c2a633'
        },
        {
          id: 6,
          pair: 'XAU/USD',
          baseAsset: 'XAU',
          quoteAsset: 'USD',
          price: 2350.00,
          change24h: 0.35,
          volume24h: 1200000000,
          minAmount: 0.001,
          maxAmount: 100,
          minPrice: 0.01,
          maxPrice: 10000,
          makerFee: 0.0005,
          takerFee: 0.0005,
          status: 'maintenance',
          lastUpdated: '2024-07-17 22:20:15',
          icon: '🏆',
          color: '#ffd700'
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
          total: response.data.totalMarkets || 0,
          active: response.data.activeMarkets || 0,
          paused: response.data.pausedMarkets || 0,
          maintenance: response.data.maintenanceMarkets || 0
        });
      }
    } catch (error) {
      console.log('Stats not available');
    }
  };

  // ===== MARKET ACTIONS =====
  const handleAction = async (action, market) => {
    console.log(`🔘 ${action} clicked for market:`, market);

    switch(action) {
      case 'view':
        setSelectedMarket(market);
        setShowDetailModal(true);
        break;

      case 'edit':
        setSelectedMarket(market);
        setFormData({
          pair: market.pair,
          baseAsset: market.baseAsset,
          quoteAsset: market.quoteAsset,
          minAmount: market.minAmount,
          maxAmount: market.maxAmount,
          minPrice: market.minPrice,
          maxPrice: market.maxPrice,
          makerFee: market.makerFee,
          takerFee: market.takerFee,
          status: market.status
        });
        setShowEditModal(true);
        break;

      case 'pause':
        setConfirmId(market.id);
        setConfirmAction('pause');
        setShowConfirmModal(true);
        break;

      case 'activate':
        setConfirmId(market.id);
        setConfirmAction('activate');
        setShowConfirmModal(true);
        break;

      case 'maintenance':
        setConfirmId(market.id);
        setConfirmAction('maintenance');
        setShowConfirmModal(true);
        break;

      case 'delete':
        if (confirm(`⚠️ Permanently delete market ${market.pair}?`)) {
          try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8081/api/admin/markets/${market.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            alert(`🗑️ Market ${market.pair} deleted`);
            fetchMarkets();
            fetchStats();
          } catch (error) {
            alert('❌ Error: ' + error.message);
          }
        }
        break;

      default:
        alert(`✅ ${action} clicked!`);
    }
  };

  // ===== CONFIRM STATUS CHANGE =====
  const confirmStatusChange = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8081/api/admin/markets/${confirmId}/status`,
        { status: confirmAction === 'pause' ? 'paused' : confirmAction === 'activate' ? 'active' : 'maintenance' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`✅ Market ${confirmAction}d successfully`);
      setShowConfirmModal(false);
      setConfirmId(null);
      setConfirmAction('');
      fetchMarkets();
      fetchStats();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // ===== SAVE MARKET =====
  const saveMarket = async () => {
    try {
      const token = localStorage.getItem('token');
      if (showAddModal) {
        await axios.post('http://localhost:8081/api/admin/markets', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ Market added successfully!');
      } else {
        await axios.put(`http://localhost:8081/api/admin/markets/${selectedMarket.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ Market updated successfully!');
      }
      setShowEditModal(false);
      setShowAddModal(false);
      fetchMarkets();
      fetchStats();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  };

  // ===== FILTER MARKETS =====
  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.pair?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          market.baseAsset?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          market.quoteAsset?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || market.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ===== PAGINATION =====
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredMarkets.length / itemsPerPage);
  const paginatedMarkets = filteredMarkets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#0ecb81';
      case 'paused': return '#f0b90b';
      case 'maintenance': return '#f6465d';
      default: return '#848e9c';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return '🟢';
      case 'paused': return '⏸️';
      case 'maintenance': return '🔧';
      default: return '⚪';
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>⏳ Loading markets...</div>;
  }

  return (
    <div className="admin-page" style={{ padding: '0' }}>
      <h2 style={{ marginTop: 0 }}>📊 Markets Management</h2>
      <p style={{ color: '#848e9c', marginBottom: '24px' }}>Manage all trading pairs and market settings</p>

      {/* Stats Summary */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Total Markets</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#627eea' }}>{stats.total || markets.length}</div>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>All trading pairs</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Active</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#0ecb81' }}>{stats.active}</div>
          <div style={{ fontSize: '12px', color: '#0ecb81' }}>Trading live</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Paused</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f0b90b' }}>{stats.paused}</div>
          <div style={{ fontSize: '12px', color: '#f0b90b' }}>Temporarily offline</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#848e9c' }}>Maintenance</div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#f6465d' }}>{stats.maintenance}</div>
          <div style={{ fontSize: '12px', color: '#f6465d' }}>Under maintenance</div>
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
          placeholder="🔍 Search by pair or asset..."
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
          <option value="active">🟢 Active</option>
          <option value="paused">⏸️ Paused</option>
          <option value="maintenance">🔧 Maintenance</option>
        </select>
        <button
          onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
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
          onClick={() => { setShowAddModal(true); setFormData({ pair: '', baseAsset: '', quoteAsset: '', minAmount: 0.0001, maxAmount: 100, minPrice: 0.01, maxPrice: 1000000, makerFee: 0.001, takerFee: 0.001, status: 'active' }); }}
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
          ➕ Add Market
        </button>
        <button
          onClick={fetchMarkets}
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

      {/* Markets Table */}
      <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Pair</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Price</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>24h Change</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Volume</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Fees</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: '#848e9c', fontSize: '12px', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMarkets.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                  <p>No markets found</p>
                </td>
              </tr>
            ) : (
              paginatedMarkets.map(market => (
                <tr key={market.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{market.icon || '📊'}</span>
                      <div>
                        <div style={{ color: '#eaecef', fontWeight: '600' }}>{market.pair}</div>
                        <div style={{ fontSize: '11px', color: '#848e9c' }}>{market.baseAsset}/{market.quoteAsset}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#f0b90b' }}>
                    ${market.price?.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      color: (market.change24h || 0) >= 0 ? '#0ecb81' : '#f6465d',
                      fontWeight: '600'
                    }}>
                      {(market.change24h || 0) >= 0 ? '+' : ''}{market.change24h}%
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#848e9c' }}>
                    ${(market.volume24h / 1000000).toFixed(1)}M
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#848e9c' }}>
                    <div>Maker: {(market.makerFee * 100).toFixed(2)}%</div>
                    <div>Taker: {(market.takerFee * 100).toFixed(2)}%</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: getStatusColor(market.status) + '20',
                      color: getStatusColor(market.status),
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {getStatusIcon(market.status)} {market.status.charAt(0).toUpperCase() + market.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleAction('view', market)}
                        style={{ padding: '4px 8px', background: '#2a2e39', border: 'none', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}
                        title="View"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleAction('edit', market)}
                        style={{ padding: '4px 8px', background: '#2a2e39', border: 'none', borderRadius: '4px', color: '#848e9c', cursor: 'pointer' }}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      {market.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleAction('pause', market)}
                            style={{ padding: '4px 8px', background: '#f0b90b', border: 'none', borderRadius: '4px', color: '#0a0b0e', cursor: 'pointer' }}
                            title="Pause"
                          >
                            ⏸️
                          </button>
                          <button
                            onClick={() => handleAction('maintenance', market)}
                            style={{ padding: '4px 8px', background: '#f6465d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
                            title="Maintenance"
                          >
                            🔧
                          </button>
                        </>
                      )}
                      {market.status === 'paused' && (
                        <button
                          onClick={() => handleAction('activate', market)}
                          style={{ padding: '4px 8px', background: '#0ecb81', border: 'none', borderRadius: '4px', color: '#0a0b0e', cursor: 'pointer' }}
                          title="Activate"
                        >
                          ▶️
                        </button>
                      )}
                      {market.status === 'maintenance' && (
                        <button
                          onClick={() => handleAction('activate', market)}
                          style={{ padding: '4px 8px', background: '#0ecb81', border: 'none', borderRadius: '4px', color: '#0a0b0e', cursor: 'pointer' }}
                          title="Activate"
                        >
                          ▶️
                        </button>
                      )}
                      <button
                        onClick={() => handleAction('delete', market)}
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
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredMarkets.length)} of {filteredMarkets.length}
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
      {showDetailModal && selectedMarket && (
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
            maxWidth: '550px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>📊 Market Details</h3>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '48px' }}>{selectedMarket.icon || '📊'}</span>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#eaecef' }}>{selectedMarket.pair}</div>
              <div style={{ color: '#848e9c' }}>{selectedMarket.baseAsset} / {selectedMarket.quoteAsset}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Current Price</span><div style={{ color: '#f0b90b', fontWeight: '600' }}>${selectedMarket.price?.toFixed(2)}</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>24h Change</span>
                <div style={{
                  color: (selectedMarket.change24h || 0) >= 0 ? '#0ecb81' : '#f6465d',
                  fontWeight: '600'
                }}>
                  {(selectedMarket.change24h || 0) >= 0 ? '+' : ''}{selectedMarket.change24h}%
                </div>
              </div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>24h Volume</span><div style={{ color: '#eaecef' }}>${(selectedMarket.volume24h / 1000000).toFixed(1)}M</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Status</span>
                <div style={{ color: getStatusColor(selectedMarket.status) }}>
                  {getStatusIcon(selectedMarket.status)} {selectedMarket.status.charAt(0).toUpperCase() + selectedMarket.status.slice(1)}
                </div>
              </div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Min Amount</span><div style={{ color: '#eaecef' }}>{selectedMarket.minAmount}</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Max Amount</span><div style={{ color: '#eaecef' }}>{selectedMarket.maxAmount}</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Min Price</span><div style={{ color: '#eaecef' }}>${selectedMarket.minPrice}</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Max Price</span><div style={{ color: '#eaecef' }}>${selectedMarket.maxPrice}</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Maker Fee</span><div style={{ color: '#eaecef' }}>{(selectedMarket.makerFee * 100).toFixed(2)}%</div></div>
              <div><span style={{ color: '#848e9c', fontSize: '13px' }}>Taker Fee</span><div style={{ color: '#eaecef' }}>{(selectedMarket.takerFee * 100).toFixed(2)}%</div></div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#848e9c', fontSize: '13px' }}>Last Updated</span>
                <div style={{ color: '#eaecef' }}>{selectedMarket.lastUpdated}</div>
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

      {/* ===== EDIT/ADD MODAL ===== */}
      {(showEditModal || showAddModal) && (
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
            maxWidth: '550px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>{showAddModal ? '➕ Add New Market' : '✏️ Edit Market'}</h3>
              <button onClick={() => { setShowEditModal(false); setShowAddModal(false); }} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Pair</label>
                <input
                  type="text"
                  value={formData.pair}
                  onChange={(e) => setFormData({...formData, pair: e.target.value})}
                  placeholder="e.g., BTC/USDT"
                  disabled={!showAddModal}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '6px',
                    color: showAddModal ? '#eaecef' : '#848e9c',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Base Asset</label>
                <input
                  type="text"
                  value={formData.baseAsset}
                  onChange={(e) => setFormData({...formData, baseAsset: e.target.value.toUpperCase()})}
                  placeholder="e.g., BTC"
                  disabled={!showAddModal}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '6px',
                    color: showAddModal ? '#eaecef' : '#848e9c',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Quote Asset</label>
                <input
                  type="text"
                  value={formData.quoteAsset}
                  onChange={(e) => setFormData({...formData, quoteAsset: e.target.value.toUpperCase()})}
                  placeholder="e.g., USDT"
                  disabled={!showAddModal}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '6px',
                    color: showAddModal ? '#eaecef' : '#848e9c',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Min Amount</label>
                <input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({...formData, minAmount: parseFloat(e.target.value)})}
                  step="0.0001"
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
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Max Amount</label>
                <input
                  type="number"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({...formData, maxAmount: parseFloat(e.target.value)})}
                  step="0.1"
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
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Min Price</label>
                <input
                  type="number"
                  value={formData.minPrice}
                  onChange={(e) => setFormData({...formData, minPrice: parseFloat(e.target.value)})}
                  step="0.0001"
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
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Max Price</label>
                <input
                  type="number"
                  value={formData.maxPrice}
                  onChange={(e) => setFormData({...formData, maxPrice: parseFloat(e.target.value)})}
                  step="0.1"
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
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Maker Fee (%)</label>
                <input
                  type="number"
                  value={(formData.makerFee * 100).toFixed(2)}
                  onChange={(e) => setFormData({...formData, makerFee: parseFloat(e.target.value) / 100})}
                  step="0.01"
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
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Taker Fee (%)</label>
                <input
                  type="number"
                  value={(formData.takerFee * 100).toFixed(2)}
                  onChange={(e) => setFormData({...formData, takerFee: parseFloat(e.target.value) / 100})}
                  step="0.01"
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
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
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
                  <option value="active">🟢 Active</option>
                  <option value="paused">⏸️ Paused</option>
                  <option value="maintenance">🔧 Maintenance</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowEditModal(false); setShowAddModal(false); }} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveMarket} style={{ padding: '8px 20px', background: '#f0b90b', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}>💾 Save</button>
            </div>
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
              <h3 style={{ margin: 0 }}>Confirm Action</h3>
              <button onClick={() => setShowConfirmModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '16px', color: '#848e9c' }}>
              <p>Are you sure you want to <strong style={{ color: '#eaecef' }}>{confirmAction}</strong> this market?</p>
              <p style={{ fontSize: '13px', marginTop: '8px' }}>This action will affect all users trading this pair.</p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmStatusChange} style={{ padding: '8px 20px', background: '#f0b90b', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Markets;