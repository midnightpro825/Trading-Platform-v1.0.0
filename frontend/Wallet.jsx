// frontend/src/pages/Wallet.jsx
import React from 'react';
import Card from '../components/UI/Card';

const Wallet = ({ balances, userId }) => {
  const userBalances = balances[userId]?.balances || {};
  const totalValue = Object.entries(userBalances).reduce((sum, [asset, amount]) => {
    const price = asset === 'USDT' ? 1 : 45000;
    return sum + (amount * price);
  }, 0);

  return (
    <div className="page">
      <h1 className="page-title">💰 Wallet</h1>
      <div className="wallet-summary">
        <Card title="Total Balance">
          <div className="total-balance">${totalValue.toFixed(2)}</div>
        </Card>
      </div>
      <Card title="Assets">
        <div className="asset-list">
          {Object.entries(userBalances).map(([asset, amount]) => (
            <div key={asset} className="asset-row">
              <span className="asset-symbol">{asset}</span>
              <span className="asset-balance">{amount.toFixed(4)}</span>
              <span className="asset-value">${(amount * (asset === 'USDT' ? 1 : 45000)).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Wallet;