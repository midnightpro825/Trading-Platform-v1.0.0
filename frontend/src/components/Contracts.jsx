import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import CandlestickChart from './CandlestickChart';
import { useBinanceWebSocket } from '../hooks/useBinanceWebSocket';

const Contracts = () => {
  const { balance, setBalance } = useContext(AuthContext);
  
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [side, setSide] = useState('long');
  const [orderType, setOrderType] = useState('limit');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [currentPrice, setCurrentPrice] = useState(61690.47);
  const [change, setChange] = useState(-1.50);
  const [leverage, setLeverage] = useState(1);
  const [fundingRate, setFundingRate] = useState(0.01);
  const [positions, setPositions] = useState([]);
  const [timeframe, setTimeframe] = useState('1h');
  const [activeTab, setActiveTab] = useState('positions');

  const symbol = selectedPair.replace('/', '').toLowerCase();
  const { price: wsPrice, candles, isConnected } = useBinanceWebSocket(symbol, timeframe);

  useEffect(() => {
    if (wsPrice) {
      setCurrentPrice(wsPrice);
      if (candles.length > 1) {
        const prevClose = candles[candles.length - 2]?.close || wsPrice;
        const changePercent = ((wsPrice - prevClose) / prevClose) * 100;
        setChange(changePercent);
      }
    }
  }, [wsPrice, candles]);

  const handlePlaceOrder = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const orderPrice = orderType === 'market' ? currentPrice : parseFloat(price) || currentPrice;
    const total = parseFloat(amount) * orderPrice;

    if (total > balance) {
      alert('Insufficient balance!');
      return;
    }

    const newPosition = {
      id: Date.now(),
      pair: selectedPair,
      side: side,
      price: orderPrice,
      amount: parseFloat(amount),
      leverage: leverage,
      liquidationPrice: orderPrice * (side === 'long' ? 0.85 : 1.15),
      pnl: 0,
      timestamp: new Date().toLocaleString()
    };

    setPositions([newPosition, ...positions]);
    setBalance(prev => prev - total);
    setAmount('');
    setPrice('');
    alert(`✅ ${side.toUpperCase()} position opened!`);
  };

  const quickAmount = (pct) => {
    const maxAmount = balance / currentPrice;
    setAmount((maxAmount * pct / 100).toFixed(4));
  };

  const closePosition = (id) => {
    const pos = positions.find(p => p.id === id);
    if (pos) {
      const pnl = (currentPrice - pos.price) * pos.amount * (pos.side === 'long' ? 1 : -1);
      setBalance(prev => prev + (pos.amount * currentPrice));
      setPositions(positions.filter(p => p.id !== id));
      alert(`✅ Position closed! PnL: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`);
    }
  };

  const isPositive = change >= 0;

  // Position History Data
  const positionHistory = [
    { id: 1, pair: 'BTC/USDT', side: 'long', size: 0.5, entry: 61000, exit: 62500, pnl: 750 },
    { id: 2, pair: 'ETH/USDT', side: 'short', size: 2.0, entry: 1760, exit: 1720, pnl: 80 },
    { id: 3, pair: 'SOL/USDT', side: 'long', size: 50, entry: 150, exit: 145, pnl: -250 },
  ];

  return (
    <div className="contracts-page-binance">
      {/* Header */}
      <div className="contracts-header-binance">
        <div className="contracts-pair-info-binance">
          <div className="pair-icon-binance">📋</div>
          <div className="pair-details-binance">
            <div className="pair-name-binance">{selectedPair} Perpetual</div>
            <div className="pair-name-sub-binance">USDⓈ-M</div>
          </div>
          <div className="pair-price-binance">
            <div className={`price-main-binance ${isPositive ? 'positive' : 'negative'}`}>
              ${currentPrice.toFixed(2)}
            </div>
            <div className={`price-change-binance ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '▲' : '▼'} {change.toFixed(2)}%
            </div>
          </div>
          <div className="funding-rate-binance">
            <span>Funding</span>
            <span className="funding-value-binance">{fundingRate}%</span>
          </div>
        </div>
        <div className="contracts-stats-binance">
          <div className="stat-item-binance">
            <span>24h Vol</span>
            <span>${(Math.random() * 2000 + 500).toFixed(0)}M</span>
          </div>
          <div className="stat-item-binance">
            <span>Open Interest</span>
            <span>${(Math.random() * 500 + 100).toFixed(0)}M</span>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="contracts-layout-binance">
        {/* Positions Panel */}
        <div className="positions-panel-binance">
          <h4>📊 Positions</h4>
          {positions.length > 0 ? (
            positions.map(pos => {
              const pnl = (currentPrice - pos.price) * pos.amount * (pos.side === 'long' ? 1 : -1);
              const isPnlPositive = pnl >= 0;
              return (
                <div key={pos.id} className="position-item-binance">
                  <div className="position-header-binance">
                    <span className={`position-side-binance ${pos.side}`}>{pos.side.toUpperCase()}</span>
                    <span className="position-pair-binance">{pos.pair}</span>
                    <span className={`position-pnl-binance ${isPnlPositive ? 'positive' : 'negative'}`}>
                      {isPnlPositive ? '+' : ''}{pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="position-details-binance">
                    <span>Size: {pos.amount}</span>
                    <span>Entry: ${pos.price.toFixed(2)}</span>
                    <span>Liq: ${pos.liquidationPrice.toFixed(2)}</span>
                    <span className="position-leverage-binance">{pos.leverage}x</span>
                  </div>
                  <button className="close-position-binance" onClick={() => closePosition(pos.id)}>
                    Close
                  </button>
                </div>
              );
            })
          ) : (
            <div className="no-positions-binance">No open positions</div>
          )}
        </div>

        {/* Chart Area */}
        <div className="contracts-chart-area-binance">
          <div className="chart-container-binance">
            <CandlestickChart 
              data={candles}
              price={currentPrice}
              symbol={symbol}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              isConnected={isConnected}
            />
          </div>
        </div>

        {/* Order Form */}
        <div className="contracts-form-binance">
          <div className="contracts-form-header-binance">
            <button className={`form-tab-binance ${side === 'long' ? 'active-long' : ''}`} onClick={() => setSide('long')}>
              Long
            </button>
            <button className={`form-tab-binance ${side === 'short' ? 'active-short' : ''}`} onClick={() => setSide('short')}>
              Short
            </button>
          </div>

          <div className="order-type-binance">
            <button className={`type-btn-binance ${orderType === 'limit' ? 'active' : ''}`} onClick={() => setOrderType('limit')}>Limit</button>
            <button className={`type-btn-binance ${orderType === 'market' ? 'active' : ''}`} onClick={() => setOrderType('market')}>Market</button>
            <button className={`type-btn-binance ${orderType === 'stop' ? 'active' : ''}`} onClick={() => setOrderType('stop')}>Stop</button>
          </div>

          <div className="form-group-binance">
            <label>Price</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" disabled={orderType === 'market'} />
          </div>

          <div className="form-group-binance">
            <label>Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>

          <div className="quick-amount-binance">
            <button onClick={() => quickAmount(25)}>25%</button>
            <button onClick={() => quickAmount(50)}>50%</button>
            <button onClick={() => quickAmount(75)}>75%</button>
            <button onClick={() => quickAmount(100)}>100%</button>
          </div>

          <div className="leverage-binance">
            <span>Leverage:</span>
            <div className="leverage-buttons-binance">
              {[1, 2, 3, 5, 10, 20, 50, 100].map(l => (
                <button key={l} className={`lev-btn-binance ${leverage === l ? 'active' : ''}`} onClick={() => setLeverage(l)}>
                  {l}x
                </button>
              ))}
            </div>
          </div>

          <div className="order-summary-binance">
            <div className="summary-row-binance">
              <span>Available</span>
              <span>${balance.toFixed(2)}</span>
            </div>
            <div className="summary-row-binance">
              <span>Liquidation</span>
              <span>${(parseFloat(price) || currentPrice) * (side === 'long' ? 0.85 : 1.15)}</span>
            </div>
          </div>

          <button className={`place-contract-binance ${side}`} onClick={handlePlaceOrder}>
            {side === 'long' ? '🟢 Long' : '🔴 Short'} {selectedPair.split('/')[0]}
          </button>
        </div>
      </div>

      {/* Bottom - Position History */}
      <div className="position-history-binance">
        <div className="history-tabs-binance">
          <button className={`history-tab-binance ${activeTab === 'positions' ? 'active' : ''}`} onClick={() => setActiveTab('positions')}>
            Positions
          </button>
          <button className={`history-tab-binance ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            History
          </button>
        </div>

        {activeTab === 'positions' && (
          <div className="positions-list-binance">
            {positions.length > 0 ? (
              positions.map(pos => (
                <div key={pos.id} className="position-item-mini-binance">
                  <span className={`pos-side-mini-binance ${pos.side}`}>{pos.side.toUpperCase()}</span>
                  <span className="pos-pair-mini-binance">{pos.pair}</span>
                  <span className="pos-size-mini-binance">{pos.amount}</span>
                  <span className="pos-entry-mini-binance">${pos.price.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className="no-positions-mini-binance">No positions</div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-list-binance">
            {positionHistory.map(pos => (
              <div key={pos.id} className="history-item-mini-binance">
                <span className={`hist-side-mini-binance ${pos.side}`}>{pos.side.toUpperCase()}</span>
                <span className="hist-pair-mini-binance">{pos.pair}</span>
                <span className="hist-size-mini-binance">{pos.size}</span>
                <span className="hist-entry-mini-binance">${pos.entry}</span>
                <span className="hist-exit-mini-binance">${pos.exit}</span>
                <span className={`hist-pnl-mini-binance ${pos.pnl >= 0 ? 'positive' : 'negative'}`}>
                  {pos.pnl >= 0 ? '+' : ''}{pos.pnl}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contracts;