import React from 'react';

const Assets = () => {
  return (
    <div className="assets-page">
      <div className="page-header">
        <h2>Assets</h2>
        <div className="total-balance">Total Balance: 0 USDT</div>
      </div>
      <div className="assets-actions">
        <button className="btn-recharge">Recharge</button>
        <button className="btn-withdraw">Withdrawal</button>
        <button className="btn-transfer">Transfer</button>
      </div>
      <div className="assets-list">
        <div className="asset-item">
          <span>USDT</span>
          <span>0</span>
        </div>
        <div className="asset-item">
          <span>BTC</span>
          <span>0</span>
        </div>
        <div className="asset-item">
          <span>ETH</span>
          <span>0</span>
        </div>
      </div>
    </div>
  );
};

export default Assets;