import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useBinanceWebSocket } from '../hooks/useBinanceWebSocket';

const Markets = ({ setActivePage }) => {
  const { watchlist, addToWatchlist } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedSymbol, setSelectedSymbol] = useState('btcusdt');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const { price, isConnected } = useBinanceWebSocket(selectedSymbol, '1m');

  // All coins data
  const allCoins = [
    { id: 1, pair: 'BTC/USDT', name: 'Bitcoin', price: 61690.47, change: -1.50, volume: 1245000000, high: 62400, low: 61200, icon: '₿', type: 'crypto', color: '#f7931a', marketCap: '1.2T' },
    { id: 2, pair: 'ETH/USDT', name: 'Ethereum', price: 1748.74, change: -0.97, volume: 456000000, high: 1780, low: 1720, icon: '⟠', type: 'crypto', color: '#627eea', marketCap: '210B' },
    { id: 3, pair: 'SOL/USDT', name: 'Solana', price: 152.30, change: 2.15, volume: 234000000, high: 158, low: 148, icon: '◎', type: 'crypto', color: '#9945ff', marketCap: '68B' },
    { id: 4, pair: 'ADA/USDT', name: 'Cardano', price: 0.45, change: -0.33, volume: 56700000, high: 0.46, low: 0.44, icon: '₳', type: 'crypto', color: '#0033ad', marketCap: '16B' },
    { id: 5, pair: 'DOGE/USDT', name: 'Dogecoin', price: 0.12, change: -3.25, volume: 890000000, high: 0.13, low: 0.11, icon: '🐕', type: 'meme', color: '#c2a633', marketCap: '17.3B' },
    { id: 6, pair: 'SHIB/USDT', name: 'Shiba Inu', price: 0.000025, change: -4.50, volume: 456000000, high: 0.000026, low: 0.000024, icon: '🐕', type: 'meme', color: '#ff6100', marketCap: '14.7B' },
    { id: 7, pair: 'PEPE/USDT', name: 'Pepe', price: 0.000012, change: 5.80, volume: 234000000, high: 0.000013, low: 0.000011, icon: '🐸', type: 'meme', color: '#34a853', marketCap: '5B' },
    { id: 8, pair: 'XAU/USD', name: 'Gold', price: 2350.00, change: 0.35, volume: 1200000000, high: 2360, low: 2340, icon: '🏆', type: 'commodity', color: '#ffd700', marketCap: '13T' },
    { id: 9, pair: 'XAG/USD', name: 'Silver', price: 28.50, change: -0.45, volume: 450000000, high: 29.00, low: 28.00, icon: '🥈', type: 'commodity', color: '#c0c0c0', marketCap: '1.6T' },
    { id: 10, pair: 'EUR/USD', name: 'Euro', price: 1.09, change: 0.12, volume: 2500000000, high: 1.10, low: 1.08, icon: '€', type: 'forex', color: '#003399', marketCap: '-' },
    { id: 11, pair: 'GBP/USD', name: 'British Pound', price: 1.27, change: -0.08, volume: 1800000000, high: 1.28, low: 1.26, icon: '£', type: 'forex', color: '#ff0000', marketCap: '-' },
    { id: 12, pair: 'USD/JPY', name: 'Japanese Yen', price: 150.50, change: 0.22, volume: 2200000000, high: 151.00, low: 150.00, icon: '¥', type: 'forex', color: '#0066ff', marketCap: '-' },
  ];

  // Update price for selected symbol
  useEffect(() => {
    if (price) {
      const coin = allCoins.find(c => c.symbol === selectedSymbol);
      if (coin) {
        coin.price = price;
      }
    }
  }, [price]);

  const getFilteredMarkets = () => {
    let filtered = [...allCoins];

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.pair.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (marketFilter !== 'all') {
      if (marketFilter === 'watchlist') {
        filtered = filtered.filter(item => watchlist?.includes(item.pair) || false);
      } else {
        filtered = filtered.filter(item => item.type === marketFilter);
      }
    }

    filtered.sort((a, b) => {
      let aVal, bVal;
      switch(sortBy) {
        case 'price': aVal = a.price; bVal = b.price; break;
        case 'change': aVal = a.change; bVal = b.change; break;
        case 'volume': aVal = a.volume; bVal = b.volume; break;
        default: aVal = a.price; bVal = b.price;
      }
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  };

  const filteredMarkets = getFilteredMarkets();

  const sortedByChange = [...allCoins].sort((a, b) => b.change - a.change);
  const topGainers = sortedByChange.slice(0, 3);
  const topLosers = sortedByChange.slice(-3).reverse();

  const toggleWatchlist = (pair) => {
    if (addToWatchlist) {
      addToWatchlist(pair);
    }
  };

  // Generate sparkline data
  const generateSparkline = () => {
    return Array.from({ length: 20 }, () => 8 + Math.random() * 24);
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'meme': return '#f6465d';
      case 'crypto': return '#0ecb81';
      case 'commodity': return '#f0b90b';
      case 'forex': return '#1e80ff';
      default: return '#848e9c';
    }
  };

  return (
    <div className="markets-binance">
      {/* Header */}
      <div className="markets-header-binance">
        <div className="markets-title">
          <h2>📊 Markets</h2>
          <span className="markets-subtitle">Explore and trade all available assets</span>
        </div>
        <div className={`connection-status ${isConnected ? 'live' : 'offline'}`}>
          {isConnected ? '🟢 Live Data' : '🔴 Offline'}
        </div>
      </div>

      {/* Market Stats Bar */}
      <div className="market-stats-bar-binance">
        <div className="stat-item-binance">
          <span className="stat-label-binance">Total Market Cap</span>
          <span className="stat-value-binance">$2.45T</span>
          <span className="stat-change-binance positive">+0.8%</span>
        </div>
        <div className="stat-item-binance">
          <span className="stat-label-binance">24h Volume</span>
          <span className="stat-value-binance">$89.2B</span>
          <span className="stat-change-binance positive">+12.3%</span>
        </div>
        <div className="stat-item-binance">
          <span className="stat-label-binance">BTC Dominance</span>
          <span className="stat-value-binance">48.2%</span>
          <span className="stat-change-binance negative">-0.5%</span>
        </div>
        <div className="stat-item-binance">
          <span className="stat-label-binance">Active Coins</span>
          <span className="stat-value-binance">{allCoins.length}</span>
          <span className="stat-change-binance">+2 this week</span>
        </div>
        <div className="stat-item-binance">
          <span className="stat-label-binance">Fear & Greed</span>
          <span className="stat-value-binance" style={{ color: '#f0b90b' }}>62</span>
          <span className="stat-change-binance">Greed</span>
        </div>
      </div>

      {/* Top Gainers & Losers */}
      <div className="market-highlights-binance">
        <div className="highlight-section-binance">
          <h3>🚀 Top Gainers</h3>
          <div className="highlight-list-binance">
            {topGainers.map(coin => (
              <div key={coin.pair} className="highlight-item-binance positive">
                <span className="highlight-pair">{coin.pair}</span>
                <span className="highlight-change">+{coin.change.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="highlight-section-binance">
          <h3>📉 Top Losers</h3>
          <div className="highlight-list-binance">
            {topLosers.map(coin => (
              <div key={coin.pair} className="highlight-item-binance negative">
                <span className="highlight-pair">{coin.pair}</span>
                <span className="highlight-change">{coin.change.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="markets-controls-binance">
        <div className="search-box-binance">
          <input
            type="text"
            placeholder="🔍 Search pairs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="controls-right-binance">
          <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)}>
            <option value="all">All Markets</option>
            <option value="watchlist">⭐ Watchlist</option>
            <option value="crypto">Cryptocurrency</option>
            <option value="meme">Meme Coins</option>
            <option value="commodity">Commodities</option>
            <option value="forex">Forex</option>
          </select>
          <div className="view-toggle-binance">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              📊
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋
            </button>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="sort-controls-binance">
        <button
          className={`sort-btn-binance ${sortBy === 'price' ? 'active' : ''}`}
          onClick={() => { setSortBy('price'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
        >
          Price {sortBy === 'price' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button
          className={`sort-btn-binance ${sortBy === 'change' ? 'active' : ''}`}
          onClick={() => { setSortBy('change'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
        >
          Change {sortBy === 'change' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button
          className={`sort-btn-binance ${sortBy === 'volume' ? 'active' : ''}`}
          onClick={() => { setSortBy('volume'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
        >
          Volume {sortBy === 'volume' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button
          className={`sort-btn-binance ${sortBy === 'marketCap' ? 'active' : ''}`}
          onClick={() => { setSortBy('marketCap'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc'); }}
        >
          Market Cap {sortBy === 'marketCap' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
      </div>

      {/* Markets Grid */}
      {viewMode === 'grid' && (
        <div className="markets-grid-binance">
          {filteredMarkets.length > 0 ? (
            filteredMarkets.map((item) => {
              const isWatchlisted = watchlist?.includes(item.pair) || false;
              const isPositive = item.change >= 0;
              const sparkline = generateSparkline();

              return (
                <div
                  key={item.id}
                  className="market-card-binance"
                  onClick={() => {
                    setSelectedSymbol(item.symbol);
                    setActivePage('trade');
                  }}
                >
                  <div className="market-card-header-binance">
                    <div className="market-left-binance">
                      <div className="token-icon-binance" style={{ color: item.color || '#848e9c' }}>
                        {item.icon || '₿'}
                      </div>
                      <div className="market-info-binance">
                        <span className="market-pair-binance">{item.pair}</span>
                        <span className="market-name-binance">{item.name}</span>
                      </div>
                    </div>
                    <button
                      className="market-star-binance"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(item.pair);
                      }}
                    >
                      {isWatchlisted ? '⭐' : '☆'}
                    </button>
                  </div>

                  <div className="market-price-section-binance">
                    <span className="market-price-binance">${item.price.toFixed(2)}</span>
                    <span className={`market-change-binance ${isPositive ? 'positive' : 'negative'}`}>
                      {isPositive ? '+' : ''}{item.change.toFixed(2)}%
                    </span>
                  </div>

                  <div className="market-details-binance">
                    <span>Vol: ${(item.volume / 1000000).toFixed(1)}M</span>
                    <span>H: ${item.high.toFixed(2)}</span>
                    <span>L: ${item.low.toFixed(2)}</span>
                  </div>

                  <div className="market-bottom-binance">
                    <div className="market-sparkline-binance">
                      {sparkline.map((height, i) => (
                        <div
                          key={i}
                          className={`sparkline-bar-binance ${isPositive ? 'positive' : 'negative'}`}
                          style={{ height: `${height}px` }}
                        />
                      ))}
                    </div>
                    <span className={`market-type-binance ${item.type}`}>
                      {item.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results-binance">
              <p>🔍 No markets found matching your criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Markets List View */}
      {viewMode === 'list' && (
        <div className="markets-list-binance">
          <div className="list-header-binance">
            <span>Asset</span>
            <span>Price</span>
            <span>24h Change</span>
            <span>Volume</span>
            <span>Market Cap</span>
            <span>Action</span>
          </div>
          {filteredMarkets.length > 0 ? (
            filteredMarkets.map((item) => {
              const isWatchlisted = watchlist?.includes(item.pair) || false;
              const isPositive = item.change >= 0;

              return (
                <div key={item.id} className="list-item-binance" onClick={() => setActivePage('trade')}>
                  <div className="list-item-left">
                    <span className="list-icon">{item.icon}</span>
                    <div className="list-info">
                      <span className="list-pair">{item.pair}</span>
                      <span className="list-name">{item.name}</span>
                    </div>
                  </div>
                  <span className="list-price">${item.price.toFixed(2)}</span>
                  <span className={`list-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? '+' : ''}{item.change.toFixed(2)}%
                  </span>
                  <span className="list-volume">${(item.volume / 1000000).toFixed(1)}M</span>
                  <span className="list-mcap">{item.marketCap}</span>
                  <button 
                    className="list-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePage('trade');
                    }}
                  >
                    Trade
                  </button>
                </div>
              );
            })
          ) : (
            <div className="no-results-binance">
              <p>🔍 No markets found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Markets;