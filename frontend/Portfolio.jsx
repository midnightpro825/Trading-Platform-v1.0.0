// frontend/src/pages/Portfolio.jsx
import React from 'react';
import Card from '../components/UI/Card';

const Portfolio = ({ balances, trades, userId }) => {
  return (
    <div className="page">
      <h1 className="page-title">💼 Portfolio</h1>
      <div className="portfolio-grid">
        <Card title="Asset Allocation">
          <div className="asset-list">
            {Object.entries(balances[userId]?.balances || {}).map(([asset, amount]) => (
              <div key={asset} className="asset-item">
                <span className="asset-name">{asset}</span>
                <span className="asset-amount">{amount.toFixed(4)}</span>
                <div className="asset-bar-bg">
                  <div className="asset-bar" style={{ width: `${Math.min((amount / 10) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Performance">
          <div className="performance-stats">
            <div className="perf-item">
              <span>Total P&L</span>
              <span className="positive">+$1,234.50</span>
            </div>
            <div className="perf-item">
              <span>Win Rate</span>
              <span>68%</span>
            </div>
            <div className="perf-item">
              <span>Total Trades</span>
              <span>42</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;