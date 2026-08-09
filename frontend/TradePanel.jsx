// frontend/src/components/Trading/TradePanel.jsx
import React, { useState } from 'react';
import Toggle from '../UI/Toggle';
import Button from '../UI/Button';

const TradePanel = ({ pair, marketPrice, userId, side, setSide, onPlaceOrder }) => {
  const [amount, setAmount] = useState('0.5');
  const [price, setPrice] = useState('');

  const baseAsset = pair.split('/')[0];
  const currentPrice = parseFloat(marketPrice) || 0;

  const handleSubmit = () => {
    const orderData = {
      type: 'placeOrder',
      userId: userId,
      side: side,
      price: parseFloat(price) || currentPrice,
      quantity: parseFloat(amount),
      asset: pair
    };
    onPlaceOrder(orderData);
  };

  return (
    <div className="trade-panel">
      <div className="panel-header">
        <h3>Trade {baseAsset}</h3>
        <div className="price-display">
          <span className="price-label">Market Price</span>
          <span className="price-value">${currentPrice.toFixed(2)}</span>
        </div>
      </div>

      <Toggle value={side} onChange={setSide} options={['Buy', 'Sell']} />

      <div className="order-form">
        <div className="form-group">
          <label>Amount ({baseAsset})</label>
          <div className="input-with-actions">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.1"
              className="form-input"
            />
            <div className="quick-amounts">
              <button onClick={() => setAmount('0.1')}>0.1</button>
              <button onClick={() => setAmount('0.25')}>0.25</button>
              <button onClick={() => setAmount('0.5')}>0.5</button>
              <button onClick={() => setAmount('1')}>1</button>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Price (USDT)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={`Current: $${currentPrice.toFixed(2)}`}
            className="form-input"
          />
        </div>

        <div className="order-summary">
          <div className="summary-row">
            <span>Total</span>
            <span>${(parseFloat(amount) * (parseFloat(price) || currentPrice)).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Balance</span>
            <span>$12,450.00</span>
          </div>
        </div>

        <Button 
          variant={side === 'buy' ? 'success' : 'danger'} 
          fullWidth 
          size="lg"
          onClick={handleSubmit}
        >
          {side === 'buy' ? 'Buy' : 'Sell'} {baseAsset}
        </Button>
      </div>
    </div>
  );
};

export default TradePanel;