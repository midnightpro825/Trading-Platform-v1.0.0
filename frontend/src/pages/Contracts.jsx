import React from 'react';

const Contracts = () => {
  return (
    <div className="contracts-page">
      <div className="page-header">
        <h2>Contracts</h2>
      </div>
      <div className="contracts-grid">
        <div className="contract-card">
          <div className="contract-pair">BTC/USDT</div>
          <div className="contract-price">$61,874.00</div>
          <div className="contract-change negative">-1.46%</div>
        </div>
        <div className="contract-card">
          <div className="contract-pair">ETH/USDT</div>
          <div className="contract-price">$1,748.74</div>
          <div className="contract-change negative">-0.97%</div>
        </div>
      </div>
    </div>
  );
};

export default Contracts;