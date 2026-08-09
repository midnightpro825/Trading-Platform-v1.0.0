import React from 'react';

const Markets = () => {
  const pairs = [
    { pair: 'BTC/USDT', price: 61895.76, change: -1.42 },
    { pair: 'ETH/USDT', price: 1748.74, change: -0.97 },
    { pair: 'BCH/USDT', price: 236.50, change: -0.37 },
    { pair: 'LTC/USDT', price: 68.42, change: -0.81 },
  ];

  return (
    <div className="markets-page">
      <div className="markets-header">
        <h2>Markets</h2>
        <div className="market-stats">
          <span>Total Balance: 0 USDT</span>
        </div>
      </div>
      <div className="markets-grid">
        {pairs.map((item, index) => (
          <div key={index} className="market-card">
            <div className="market-pair">{item.pair}</div>
            <div className="market-price">${item.price.toFixed(2)}</div>
            <div className={`market-change ${item.change < 0 ? 'negative' : 'positive'}`}>
              {item.change}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Markets;