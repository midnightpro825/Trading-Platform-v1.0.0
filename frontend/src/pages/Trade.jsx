import React, { useState } from 'react';

const Trade = ({ selectedPair, setSelectedPair }) => {
  const [orderType, setOrderType] = useState('limit');
  const [side, setSide] = useState('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState(0);

  const pairs = ['BTC/USDT', 'ETH/USDT', 'BCH/USDT', 'LTC/USDT'];

  const orderBook = {
    asks: [
      [61874.00, 0.00009],
      [61873.84, 0.00009],
      [61873.20, 0.00400],
      [61872.81, 0.15933],
      [61872.01, 0.00009],
      [61872.00, 0.07518],
    ],
    bids: [
      [61870.00, 0.83507],
      [61869.99, 0.00072],
      [61869.93, 0.00538],
      [61869.64, 0.00009],
      [61869.14, 0.00009],
      [61868.01, 0.00018],
    ]
  };

  const currentPrice = 61874.00;
  const change = -1.46;
  const quickAmounts = [25, 50, 75, 100];

  return (
    <div className="trade-page">
      <div className="trade-header">
        <div className="pair-selector">
          <select value={selectedPair} onChange={(e) => setSelectedPair(e.target.value)}>
            {pairs.map(pair => (
              <option key={pair} value={pair}>{pair}</option>
            ))}
          </select>
          <span className={`price-change ${change < 0 ? 'negative' : 'positive'}`}>
            {change}%
          </span>
        </div>
        <div className="price-display">
          <span className="price">${currentPrice.toFixed(2)}</span>
          <span className="change">-1.46%</span>
        </div>
        <div className="trade-actions">
          <button className="btn-recharge">Recharge</button>
          <button className="btn-earn">Earn</button>
          <button className="btn-order">Order</button>
        </div>
      </div>

      <div className="trade-layout">
        <div className="order-book-section">
          <div className="order-book-header">
            <span>Price</span>
            <span>Amount</span>
          </div>
          <div className="order-asks">
            {orderBook.asks.slice(0, 8).map(([price, amount], i) => (
              <div key={i} className="order-row ask">
                <span className="price">{price.toFixed(2)}</span>
                <span className="amount">{amount.toFixed(5)}</span>
              </div>
            ))}
          </div>
          <div className="current-price-line">
            <span>${currentPrice.toFixed(2)}</span>
          </div>
          <div className="order-bids">
            {orderBook.bids.slice(0, 8).map(([price, amount], i) => (
              <div key={i} className="order-row bid">
                <span className="price">{price.toFixed(2)}</span>
                <span className="amount">{amount.toFixed(5)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="order-form-section">
          <div className="order-tabs">
            <button className={`tab ${orderType === 'limit' ? 'active' : ''}`} onClick={() => setOrderType('limit')}>
              Limit
            </button>
            <button className={`tab ${orderType === 'market' ? 'active' : ''}`} onClick={() => setOrderType('market')}>
              Market
            </button>
          </div>

          <div className="side-toggle">
            <button className={`side-btn ${side === 'buy' ? 'active-buy' : ''}`} onClick={() => setSide('buy')}>
              Buy / Long
            </button>
            <button className={`side-btn ${side === 'sell' ? 'active-sell' : ''}`} onClick={() => setSide('sell')}>
              Sell / Short
            </button>
          </div>

          <div className="form-group">
            <label>Price</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Market price" />
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
            <div className="quick-amounts">
              {quickAmounts.map(pct => (
                <button key={pct} onClick={() => setPercentage(pct)}>{pct}%</button>
              ))}
            </div>
          </div>

          <div className="order-total">
            <span>≈ ${amount ? (parseFloat(amount) * currentPrice).toFixed(2) : '0'}</span>
            <span className="balance-label">Available: 0 USDT</span>
          </div>

          <button className={`btn-place-order ${side}`}>
            {side === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}
          </button>
        </div>

        <div className="trade-history-section">
          <div className="history-tabs">
            <button className="tab active">Open Order</button>
            <button className="tab">History Order</button>
          </div>
          <div className="history-list">
            <div className="history-empty">No open orders</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;