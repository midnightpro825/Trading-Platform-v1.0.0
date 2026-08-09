import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import CandlestickChart from './CandlestickChart';
import { useBinanceWebSocket } from '../hooks/useBinanceWebSocket';

const Trade = () => {
  const { balance, setBalance, orders, setOrders, tradeHistory, setTradeHistory } = useContext(AuthContext);
  
  // Trading state
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [side, setSide] = useState('buy');
  const [orderType, setOrderType] = useState('limit');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [timeframe, setTimeframe] = useState('1h');
  const [currentPrice, setCurrentPrice] = useState(61690.47);
  const [change, setChange] = useState(-1.50);
  const [activeTab, setActiveTab] = useState('open');

  // Connect to WebSocket
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

  // Order book data
  const orderBook = {
    asks: [
      [currentPrice + 2.00, 0.00009],
      [currentPrice + 1.84, 0.00009],
      [currentPrice + 1.20, 0.00400],
      [currentPrice + 0.81, 0.15933],
      [currentPrice + 0.01, 0.00009],
      [currentPrice, 0.07518],
    ],
    bids: [
      [currentPrice - 0.50, 0.83507],
      [currentPrice - 0.99, 0.00072],
      [currentPrice - 1.93, 0.00538],
      [currentPrice - 2.64, 0.00009],
      [currentPrice - 3.14, 0.00009],
      [currentPrice - 4.01, 0.00018],
    ]
  };

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

    const newOrder = {
      id: Date.now(),
      pair: selectedPair,
      side: side,
      type: orderType,
      price: orderPrice,
      amount: parseFloat(amount),
      total: total,
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      leverage: leverage,
      status: 'open',
      timestamp: new Date().toLocaleString()
    };

    setOrders([newOrder, ...orders]);
    setBalance(prev => prev - total);
    setAmount('');
    setPrice('');
    setStopLoss('');
    setTakeProfit('');
    
    const pnl = (Math.random() - 0.5) * 200;
    setTradeHistory([{ ...newOrder, pnl, time: new Date().toLocaleString() }, ...tradeHistory]);
    
    alert(`✅ ${side.toUpperCase()} order placed!`);
  };

  const quickAmount = (pct) => {
    const maxAmount = balance / currentPrice;
    setAmount((maxAmount * pct / 100).toFixed(4));
  };

  const closeOrder = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setOrders(orders.filter(o => o.id !== orderId));
      setBalance(prev => prev + order.total);
    }
  };

  const isPositive = change >= 0;

  return (
    <div className="trade-page-binance">
      {/* Top Header - Binance Style */}
      <div className="trade-header-binance">
        <div className="trade-pair-info-binance">
          <div className="pair-icon-binance">₿</div>
          <div className="pair-details-binance">
            <div className="pair-name-binance">{selectedPair}</div>
            <div className="pair-name-sub-binance">Perpetual</div>
          </div>
          <div className="pair-price-binance">
            <div className={`price-main-binance ${isPositive ? 'positive' : 'negative'}`}>
              ${currentPrice.toFixed(2)}
            </div>
            <div className={`price-change-binance ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '▲' : '▼'} {change.toFixed(2)}%
            </div>
          </div>
          <div className="pair-stats-binance">
            <div className="stat-item-binance">
              <span>24h High</span>
              <span>${(currentPrice * 1.02).toFixed(2)}</span>
            </div>
            <div className="stat-item-binance">
              <span>24h Low</span>
              <span>${(currentPrice * 0.98).toFixed(2)}</span>
            </div>
            <div className="stat-item-binance">
              <span>24h Vol</span>
              <span>${(Math.random() * 2000 + 500).toFixed(0)}M</span>
            </div>
          </div>
        </div>
        <div className="trade-actions-binance">
          <button className="action-btn-binance">📊 Chart</button>
          <button className="action-btn-binance">📈 Depth</button>
          <button className="action-btn-binance">⚡</button>
        </div>
      </div>

      {/* Main Layout - Binance Style */}
      <div className="trade-layout-binance">
        {/* Left Panel - Order Book */}
        <div className="order-book-binance">
          <div className="order-book-header-binance">
            <span>Price (USDT)</span>
            <span>Amount</span>
          </div>
          <div className="order-book-asks-binance">
            {orderBook.asks.slice().reverse().map(([price, size], i) => (
              <div key={i} className="order-row-binance ask" onClick={() => setPrice(price.toString())}>
                <span className="order-price-binance">{price.toFixed(2)}</span>
                <span className="order-size-binance">{size.toFixed(6)}</span>
              </div>
            ))}
          </div>
          <div className="current-price-binance">
            <span className="price-value-binance">${currentPrice.toFixed(2)}</span>
            <span className={`price-change-badge-binance ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)}%
            </span>
          </div>
          <div className="order-book-bids-binance">
            {orderBook.bids.map(([price, size], i) => (
              <div key={i} className="order-row-binance bid" onClick={() => setPrice(price.toString())}>
                <span className="order-price-binance">{price.toFixed(2)}</span>
                <span className="order-size-binance">{size.toFixed(6)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Chart */}
        <div className="chart-area-binance">
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

        {/* Right Panel - Order Form */}
        <div className="order-form-binance">
          <div className="order-form-header-binance">
            <button className={`form-tab-binance ${side === 'buy' ? 'active-buy' : ''}`} onClick={() => setSide('buy')}>
              Buy
            </button>
            <button className={`form-tab-binance ${side === 'sell' ? 'active-sell' : ''}`} onClick={() => setSide('sell')}>
              Sell
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

          <div className="sl-tp-binance">
            <div className="sl-tp-group-binance">
              <label>🛑 Stop Loss</label>
              <input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} placeholder="--" />
            </div>
            <div className="sl-tp-group-binance">
              <label>🎯 Take Profit</label>
              <input type="number" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} placeholder="--" />
            </div>
          </div>

          <div className="leverage-binance">
            <span>Leverage:</span>
            <div className="leverage-buttons-binance">
              {[1, 2, 3, 5, 10, 20].map(l => (
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
              <span>Total</span>
              <span>${amount ? (parseFloat(amount) * (parseFloat(price) || currentPrice)).toFixed(2) : '0.00'}</span>
            </div>
          </div>

          <button className={`place-order-binance ${side}`} onClick={handlePlaceOrder}>
            {side === 'buy' ? 'Buy' : 'Sell'} {selectedPair.split('/')[0]}
          </button>
        </div>
      </div>

      {/* Bottom - Orders */}
      <div className="orders-bottom-binance">
        <div className="orders-tabs-binance">
          <button className={`orders-tab-binance ${activeTab === 'open' ? 'active' : ''}`} onClick={() => setActiveTab('open')}>
            Open Orders ({orders.length})
          </button>
          <button className={`orders-tab-binance ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            History
          </button>
        </div>

        {activeTab === 'open' && (
          <div className="open-orders-binance">
            {orders.length > 0 ? (
              orders.map(order => (
                <div key={order.id} className="order-item-binance">
                  <span className={`order-side-binance ${order.side}`}>{order.side.toUpperCase()}</span>
                  <span className="order-pair-binance">{order.pair}</span>
                  <span className="order-amount-binance">{order.amount}</span>
                  <span className="order-price-binance">${order.price.toFixed(2)}</span>
                  <button className="order-close-binance" onClick={() => closeOrder(order.id)}>✕</button>
                </div>
              ))
            ) : (
              <div className="no-orders-binance">No open orders</div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-binance">
            {tradeHistory && tradeHistory.length > 0 ? (
              tradeHistory.slice(0, 10).map((trade, idx) => (
                <div key={idx} className="history-item-binance">
                  <span className={`history-side-binance ${trade.side}`}>{trade.side.toUpperCase()}</span>
                  <span className="history-pair-binance">{trade.pair}</span>
                  <span className="history-amount-binance">{trade.amount}</span>
                  <span className="history-price-binance">${trade.price.toFixed(2)}</span>
                  <span className={`history-pnl-binance ${trade.pnl >= 0 ? 'positive' : 'negative'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl?.toFixed(2) || '0.00'}
                  </span>
                </div>
              ))
            ) : (
              <div className="no-history-binance">No trade history</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Trade;
// Cancel all orders
const cancelAllOrders = () => {
  if (orders.length === 0) {
    alert('No orders to cancel');
    return;
  }
  if (confirm('Cancel all open orders?')) {
    const totalRefund = orders.reduce((sum, o) => sum + o.total, 0);
    setBalance(prev => prev + totalRefund);
    setOrders([]);
    alert(`✅ Canceled ${orders.length} orders`);
  }
};

// Get order status
const getOrderStatus = (order) => {
  if (order.status === 'filled') return '✅ Filled';
  if (order.status === 'cancelled') return '❌ Cancelled';
  return '⏳ Open';
};