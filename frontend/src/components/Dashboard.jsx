import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getBalance } from '../utils/api';

const Dashboard = ({ setActivePage }) => {
  const { user, balance, orders, tradeHistory, setBalance, refreshBalance } = useContext(AuthContext);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [realBalance, setRealBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch real balance from API
  const fetchRealBalance = async () => {
    try {
      setLoading(true);
      
      // Get user ID from context or localStorage
      const userId = user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id;
      
      if (!userId) {
        console.log('ℹ️ No user ID found, using balance from context');
        const contextBalance = balance || 0;
        setRealBalance(contextBalance);
        setLoading(false);
        return contextBalance;
      }
      
      console.log('📊 Fetching balance for user:', userId);
      const data = await getBalance(userId);
      console.log('📊 Dashboard API Response:', data);
      
      // Calculate total balance from all assets
      let total = 0;
      if (data && data.balances && data.balances.length > 0) {
        total = data.balances.reduce((sum, b) => sum + parseFloat(b.available || 0), 0);
      }
      
      console.log('💰 Dashboard: Total balance calculated:', total);
      setRealBalance(total);
      
      // Update context balance
      if (setBalance) {
        setBalance(total);
      }
      
      return total;
    } catch (error) {
      console.error('❌ Error fetching balance:', error);
      // If API fails, use context balance
      const fallbackBalance = balance || 0;
      setRealBalance(fallbackBalance);
      return fallbackBalance;
    } finally {
      setLoading(false);
    }
  };

  // Load balance on mount and listen for updates
  useEffect(() => {
    // Only fetch if user is logged in
    if (user?.id) {
      fetchRealBalance();
    } else {
      setRealBalance(0);
      setLoading(false);
    }

    // Listen for balance update events
    const handleBalanceUpdate = () => {
      console.log('🔄 Balance update detected, refreshing...');
      if (user?.id) {
        fetchRealBalance();
      }
    };

    window.addEventListener('storage', handleBalanceUpdate);
    window.addEventListener('balanceUpdated', handleBalanceUpdate);

    // Refresh every 30 seconds (reduced from 10s to reduce API calls)
    const interval = setInterval(() => {
      if (user?.id) {
        fetchRealBalance();
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleBalanceUpdate);
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
    };
  }, [user?.id]); // Re-run when user changes

  // Mock chart data
  const generateChartData = () => {
    const data = [];
    let price = 64000;
    for (let i = 0; i < 30; i++) {
      price += (Math.random() - 0.5) * 200;
      data.push(price);
    }
    return data;
  };

  const chartData = generateChartData();

  // ✅ Use REAL balance for stats
  const stats = {
    totalBalance: realBalance, // REAL balance from API
    dailyPnl: 3450,
    weeklyPnl: 8200,
    monthlyPnl: 15200,
    openPositions: orders?.length || 0,
    winRate: 68,
    totalTrades: tradeHistory?.length || 142,
    totalVolume: 2450000,
  };

  // Holdings based on REAL balance
  const holdings = [
    { name: 'BTC', amount: 1.2, value: stats.totalBalance * 0.45, percentage: 45, color: '#f7931a' },
    { name: 'ETH', amount: 8.5, value: stats.totalBalance * 0.25, percentage: 25, color: '#627eea' },
    { name: 'SOL', amount: 120, value: stats.totalBalance * 0.15, percentage: 15, color: '#9945ff' },
    { name: 'USDT', amount: stats.totalBalance * 0.10, value: stats.totalBalance * 0.10, percentage: 10, color: '#0ecb81' },
    { name: 'Other', amount: 0, value: stats.totalBalance * 0.05, percentage: 5, color: '#848e9c' },
  ];

  const recentTrades = tradeHistory?.slice(0, 5) || [
    { id: 1, pair: 'BTC/USDT', side: 'buy', price: 61690, amount: 0.5, pnl: 450, time: '2 mins ago' },
    { id: 2, pair: 'ETH/USDT', side: 'sell', price: 1748, amount: 2.0, pnl: -120, time: '15 mins ago' },
    { id: 3, pair: 'SOL/USDT', side: 'buy', price: 152, amount: 50, pnl: 230, time: '1 hour ago' },
  ];

  const quickActions = [
    { icon: '📥', label: 'Deposit', action: () => setActivePage('assets') },
    { icon: '📤', label: 'Withdraw', action: () => setActivePage('assets') },
    { icon: '📈', label: 'Trade', action: () => setActivePage('trade') },
    { icon: '📊', label: 'Markets', action: () => setActivePage('markets') },
  ];

  const marketOverview = [
    { pair: 'BTC/USDT', price: 61690.47, change: 2.4, volume: '2.4B' },
    { pair: 'ETH/USDT', price: 1748.74, change: -0.97, volume: '1.2B' },
    { pair: 'SOL/USDT', price: 152.30, change: 2.15, volume: '856M' },
    { pair: 'ADA/USDT', price: 0.45, change: -0.33, volume: '234M' },
  ];

  const vipProgress = 65;
  const vipTier = 'Silver';
  const nextTier = 'Gold';

  // Manual refresh
  const handleManualRefresh = async () => {
    setLoading(true);
    await fetchRealBalance();
    alert(`🔄 Balance refreshed!\n💰 Current Balance: $${realBalance.toFixed(2)}`);
  };

  if (loading && user?.id) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">⏳</div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-binance">
      <div className="dashboard-header-binance">
        <div className="welcome-section">
          <h1>👋 Welcome back, {user?.name || 'Guest'}!</h1>
          <p className="welcome-sub">Here's your portfolio overview for today</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={handleManualRefresh}
            style={{ 
              background: '#2a2e39', 
              color: '#848e9c', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none', 
              cursor: 'pointer',
              marginRight: '8px'
            }}
          >
            🔄 Refresh
          </button>
          <button className="header-action-btn" onClick={() => setActivePage('assets')}>
            💰 Balance: ${stats.totalBalance.toFixed(2)}
          </button>
          <div className="vip-badge">
            <span className="vip-icon">👑</span>
            <span className="vip-tier">{vipTier}</span>
          </div>
        </div>
      </div>

      <div className="stats-grid-binance">
        <div className="stat-card-binance">
          <div className="stat-icon green">📊</div>
          <div className="stat-content">
            <span className="stat-label">Total Balance</span>
            <span className="stat-value">${stats.totalBalance.toFixed(2)}</span>
            <span className="stat-change positive">+2.4% this week</span>
          </div>
        </div>
        <div className="stat-card-binance">
          <div className="stat-icon green">📈</div>
          <div className="stat-content">
            <span className="stat-label">24h P&L</span>
            <span className="stat-value positive">+${stats.dailyPnl.toFixed(2)}</span>
            <span className="stat-change positive">+2.4%</span>
          </div>
        </div>
        <div className="stat-card-binance">
          <div className="stat-icon green">📊</div>
          <div className="stat-content">
            <span className="stat-label">7d P&L</span>
            <span className="stat-value positive">+${stats.weeklyPnl.toFixed(2)}</span>
            <span className="stat-change positive">+5.6%</span>
          </div>
        </div>
        <div className="stat-card-binance">
          <div className="stat-icon green">📈</div>
          <div className="stat-content">
            <span className="stat-label">30d P&L</span>
            <span className="stat-value positive">+${stats.monthlyPnl.toFixed(2)}</span>
            <span className="stat-change positive">+10.2%</span>
          </div>
        </div>
        <div className="stat-card-binance">
          <div className="stat-icon blue">📋</div>
          <div className="stat-content">
            <span className="stat-label">Open Positions</span>
            <span className="stat-value">{stats.openPositions}</span>
            <span className="stat-change">+1 today</span>
          </div>
        </div>
        <div className="stat-card-binance">
          <div className="stat-icon blue">🎯</div>
          <div className="stat-content">
            <span className="stat-label">Win Rate</span>
            <span className="stat-value">{stats.winRate}%</span>
            <span className="stat-change positive">+3%</span>
          </div>
        </div>
        <div className="stat-card-binance">
          <div className="stat-icon blue">🔄</div>
          <div className="stat-content">
            <span className="stat-label">Total Trades</span>
            <span className="stat-value">{stats.totalTrades}</span>
            <span className="stat-change">{stats.totalTrades} total</span>
          </div>
        </div>
        <div className="stat-card-binance">
          <div className="stat-icon blue">💰</div>
          <div className="stat-content">
            <span className="stat-label">Volume (30d)</span>
            <span className="stat-value">${(stats.totalVolume / 1000000).toFixed(1)}M</span>
            <span className="stat-change positive">+12%</span>
          </div>
        </div>
      </div>

      <div className="quick-actions-binance">
        {quickActions.map((action, idx) => (
          <button key={idx} className="quick-action-btn" onClick={action.action}>
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>

      <div className="dashboard-grid-binance">
        <div className="dashboard-card-binance">
          <div className="card-header-binance">
            <h3>📊 Asset Distribution</h3>
            <span className="card-badge">Portfolio</span>
          </div>
          <div className="asset-distribution-binance">
            {holdings.map((asset) => (
              <div key={asset.name} className="asset-item-binance">
                <div className="asset-info-binance">
                  <span className="asset-name" style={{ color: asset.color }}>● {asset.name}</span>
                  <span className="asset-value-binance">${asset.value.toFixed(2)}</span>
                </div>
                <div className="asset-bar-binance">
                  <div className="asset-bar-fill" style={{ width: `${asset.percentage}%`, background: asset.color }}></div>
                </div>
                <span className="asset-percentage">{asset.percentage}%</span>
              </div>
            ))}
            <div className="asset-total-binance">
              <span>Total Value</span>
              <span>${holdings.reduce((sum, h) => sum + h.value, 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card-binance chart-card">
          <div className="card-header-binance">
            <h3>📈 Portfolio Performance</h3>
            <div className="timeframe-selector">
              {['24h', '7d', '30d', '90d'].map(tf => (
                <button
                  key={tf}
                  className={`tf-btn-dash ${selectedTimeframe === tf ? 'active' : ''}`}
                  onClick={() => setSelectedTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-container-dash">
            <div className="chart-line-dash">
              {chartData.map((value, i) => {
                const height = 30 + (value - Math.min(...chartData)) / (Math.max(...chartData) - Math.min(...chartData)) * 70;
                const isGreen = value > chartData[i-1] || i === 0;
                return (
                  <div
                    key={i}
                    className={`chart-bar-dash ${isGreen ? 'green' : 'red'}`}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
            <div className="chart-stats-dash">
              <span className="chart-current-price">${chartData[chartData.length - 1]?.toFixed(2) || '64,000.00'}</span>
              <span className="chart-change positive">+2.4%</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card-binance">
          <div className="card-header-binance">
            <h3>📋 Open Positions</h3>
            <span className="card-badge">{orders?.length || 0}</span>
          </div>
          <div className="positions-list-binance">
            {orders?.length > 0 ? (
              orders.slice(0, 3).map((order) => (
                <div key={order.id} className="position-item-binance">
                  <div className="position-header-binance">
                    <span className={`position-side ${order.side}`}>{order.side.toUpperCase()}</span>
                    <span className="position-pair">{order.pair}</span>
                    <span className={`position-pnl ${order.side === 'buy' ? 'positive' : 'negative'}`}>
                      {order.side === 'buy' ? '+' : ''}{order.total?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="position-details-binance">
                    <span>Size: {order.amount}</span>
                    <span>Entry: ${order.price?.toFixed(2)}</span>
                    <span>Leverage: {order.leverage || 1}x</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-positions-binance">No open positions</div>
            )}
            <button className="view-all-btn-binance" onClick={() => setActivePage('trade')}>
              View All Positions →
            </button>
          </div>
        </div>

        <div className="dashboard-card-binance">
          <div className="card-header-binance">
            <h3>📈 Recent Trades</h3>
            <span className="card-badge">Latest</span>
          </div>
          <div className="trades-list-binance">
            {recentTrades.length > 0 ? (
              recentTrades.map((trade) => (
                <div key={trade.id} className="trade-item-binance">
                  <span className={`trade-side ${trade.side}`}>{trade.side.toUpperCase()}</span>
                  <span className="trade-pair">{trade.pair}</span>
                  <span className="trade-amount">{trade.amount}</span>
                  <span className={`trade-pnl ${trade.pnl >= 0 ? 'positive' : 'negative'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl?.toFixed(2) || '0.00'}
                  </span>
                  <span className="trade-time">{trade.time}</span>
                </div>
              ))
            ) : (
              <div className="no-trades-binance">No recent trades</div>
            )}
            <button className="view-all-btn-binance" onClick={() => setActivePage('trade')}>
              View All Trades →
            </button>
          </div>
        </div>

        <div className="dashboard-card-binance">
          <div className="card-header-binance">
            <h3>🔥 Market Overview</h3>
            <span className="card-badge">Live</span>
          </div>
          <div className="markets-preview-binance">
            {marketOverview.map((market) => (
              <div key={market.pair} className="market-preview-item" onClick={() => setActivePage('trade')}>
                <div className="market-preview-info">
                  <span className="market-preview-pair">{market.pair}</span>
                  <span className="market-preview-price">${market.price.toFixed(2)}</span>
                </div>
                <div className="market-preview-right">
                  <span className={`market-preview-change ${market.change >= 0 ? 'positive' : 'negative'}`}>
                    {market.change >= 0 ? '+' : ''}{market.change}%
                  </span>
                  <span className="market-preview-volume">Vol: {market.volume}</span>
                </div>
              </div>
            ))}
            <button className="view-all-btn-binance" onClick={() => setActivePage('markets')}>
              View All Markets →
            </button>
          </div>
        </div>

        <div className="dashboard-card-binance vip-card">
          <div className="card-header-binance">
            <h3>👑 VIP Status</h3>
            <span className="card-badge">{vipTier}</span>
          </div>
          <div className="vip-content-binance">
            <div className="vip-tier-display">
              <span className="vip-tier-label">Current Tier</span>
              <span className="vip-tier-name">{vipTier}</span>
            </div>
            <div className="vip-progress-binance">
              <span className="vip-progress-label">Next Tier: {nextTier}</span>
              <div className="vip-progress-bar">
                <div className="vip-progress-fill" style={{ width: `${vipProgress}%` }}></div>
              </div>
              <span className="vip-progress-text">{vipProgress}% complete</span>
            </div>
            <div className="vip-benefits-binance">
              <div className="benefit-item-binance">
                <span>💳</span>
                <span>0.05% Trading Fee</span>
              </div>
              <div className="benefit-item-binance">
                <span>📈</span>
                <span>$200K Withdraw Limit</span>
              </div>
              <div className="benefit-item-binance">
                <span>🎯</span>
                <span>Priority Support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card-binance quick-stats-card">
          <div className="card-header-binance">
            <h3>⚡ Quick Stats</h3>
          </div>
          <div className="quick-stats-grid-binance">
            <div className="quick-stat-item">
              <span className="qs-label">Total Trades</span>
              <span className="qs-value">{stats.totalTrades}</span>
            </div>
            <div className="quick-stat-item">
              <span className="qs-label">Win Rate</span>
              <span className="qs-value">{stats.winRate}%</span>
            </div>
            <div className="quick-stat-item">
              <span className="qs-label">Volume</span>
              <span className="qs-value">${(stats.totalVolume / 1000000).toFixed(1)}M</span>
            </div>
            <div className="quick-stat-item">
              <span className="qs-label">Referrals</span>
              <span className="qs-value">42</span>
            </div>
            <div className="quick-stat-item">
              <span className="qs-label">Margin Ratio</span>
              <span className="qs-value">85%</span>
            </div>
            <div className="quick-stat-item">
              <span className="qs-label">VIP Tier</span>
              <span className="qs-value vip">🥈 {vipTier}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;