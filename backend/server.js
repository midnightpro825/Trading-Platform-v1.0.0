const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const axios = require('axios');
const path = require('path');
const app = express();

// ============================================================
// 🔧 CORS - Allow your domains + local development
// ============================================================
const allowedOrigins = [
  'https://tradeflows.site',
  'https://www.tradeflows.site',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ============================================================
// ✅ SERVE FRONTEND FILES FROM backend/public
// ============================================================
app.use(express.static('backend/public'));

// ============================================================
// 🔧 PORT CONFIGURATION
// ============================================================
const PORT = process.env.PORT || 8080;
const WS_PORT = process.env.WS_PORT || PORT;

// ============================================================
// SIMPLE ORDER MATCHING ENGINE (In-Memory)
// ============================================================
const orderBook = {
  bids: [],
  asks: [],
  orderMap: new Map(),
  nextOrderId: 1,
  trades: []
};

function addOrder(side, price, quantity, userId) {
  const order = {
    id: orderBook.nextOrderId++,
    side,
    price: parseFloat(price),
    quantity: parseFloat(quantity),
    userId,
    timestamp: Date.now()
  };

  orderBook.orderMap.set(order.id, order);

  if (side === 'buy') {
    orderBook.bids.push([order.price, order.quantity, order.userId, order.id]);
    orderBook.bids.sort((a, b) => b[0] - a[0] || a[3] - b[3]);
  } else {
    orderBook.asks.push([order.price, order.quantity, order.userId, order.id]);
    orderBook.asks.sort((a, b) => a[0] - b[0] || a[3] - b[3]);
  }

  matchOrders();
  return order;
}

function matchOrders() {
  let trades = [];

  while (orderBook.bids.length > 0 && orderBook.asks.length > 0) {
    const bestBid = orderBook.bids[0];
    const bestAsk = orderBook.asks[0];

    if (bestBid[0] < bestAsk[0]) break;

    const matchPrice = bestAsk[0];
    const matchQty = Math.min(bestBid[1], bestAsk[1]);

    trades.push({
      price: matchPrice,
      quantity: matchQty,
      buyerId: bestBid[2],
      sellerId: bestAsk[2],
      buyerOrderId: bestBid[3],
      sellerOrderId: bestAsk[3],
      timestamp: Date.now()
    });

    bestBid[1] -= matchQty;
    bestAsk[1] -= matchQty;

    if (bestBid[1] === 0) orderBook.bids.shift();
    if (bestAsk[1] === 0) orderBook.asks.shift();
  }

  orderBook.trades.push(...trades);
  return trades;
}

function getOrderBook() {
  return {
    bids: orderBook.bids.map(([price, qty]) => [price, qty]),
    asks: orderBook.asks.map(([price, qty]) => [price, qty])
  };
}

// ============================================================
// WEBSOCKET SERVER
// ============================================================
let wss = null;
const clients = new Set();

try {
  if (WS_PORT === PORT) {
    const server = app.listen(PORT);
    wss = new WebSocket.Server({ server });
    console.log(`✅ WebSocket running on same port ${WS_PORT}`);
  } else {
    wss = new WebSocket.Server({ port: WS_PORT });
    console.log(`✅ WebSocket running on port ${WS_PORT}`);
  }
} catch (error) {
  console.log('⚠️ WebSocket failed to start:', error.message);
  wss = null;
}

if (wss) {
  wss.on('connection', (ws) => {
    console.log('🟢 Client connected');
    clients.add(ws);

    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to TradeFlow WebSocket',
      orderbook: getOrderBook()
    }));

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('📩 Received:', data.type);

        if (data.type === 'placeOrder') {
          const order = addOrder(data.side, data.price, data.quantity, data.userId);
          
          broadcast({
            type: 'orderbook',
            data: getOrderBook()
          });

          if (orderBook.trades.length > 0) {
            const lastTrade = orderBook.trades[orderBook.trades.length - 1];
            broadcast({
              type: 'trade',
              data: lastTrade
            });
          }

          ws.send(JSON.stringify({
            type: 'orderResult',
            success: true,
            orderId: order.id
          }));
        }
      } catch (error) {
        console.error('Error:', error.message);
        ws.send(JSON.stringify({
          type: 'error',
          message: error.message
        }));
      }
    });

    ws.on('close', () => {
      console.log('🔴 Client disconnected');
      clients.delete(ws);
    });
  });
}

function broadcast(data) {
  if (!wss) return;
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// ============================================================
// BINANCE API - REAL PRICE DATA
// ============================================================
async function fetchBinancePrice(symbol = 'BTCUSDT') {
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
    return {
      price: parseFloat(response.data.lastPrice),
      change: parseFloat(response.data.priceChangePercent),
      volume: parseFloat(response.data.volume),
      high: parseFloat(response.data.highPrice),
      low: parseFloat(response.data.lowPrice)
    };
  } catch (error) {
    console.error('❌ Binance API error:', error.message);
    return null;
  }
}

async function updatePrices() {
  const symbols = ['BTCUSDT', 'ETHUSDT', 'DOGEUSDT', 'SOLUSDT', 'ADAUSDT'];
  const prices = {};

  for (const symbol of symbols) {
    const data = await fetchBinancePrice(symbol);
    if (data) {
      const pair = symbol.replace('USDT', '/USDT');
      prices[pair] = data;
    }
  }

  broadcast({
    type: 'marketPrices',
    data: prices
  });
}

setInterval(updatePrices, 10000);
updatePrices();

// ============================================================
// HTTP API ROUTES
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    websocket: wss !== null,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/orderbook', (req, res) => {
  res.json(getOrderBook());
});

app.get('/api/prices', async (req, res) => {
  const symbols = ['BTCUSDT', 'ETHUSDT', 'DOGEUSDT', 'SOLUSDT', 'ADAUSDT'];
  const prices = {};

  for (const symbol of symbols) {
    const data = await fetchBinancePrice(symbol);
    if (data) {
      const pair = symbol.replace('USDT', '/USDT');
      prices[pair] = data;
    }
  }

  res.json(prices);
});

app.get('/api/trades', (req, res) => {
  res.json(orderBook.trades.slice(-50));
});

// ============================================================
// ✅ SPA FALLBACK - FIXED: Uses app.get('*') to serve index.html
// This handles /login, /register, /admin, and all React routes
// ============================================================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'backend', 'public', 'index.html'));
});

// ============================================================
// START SERVER
// ============================================================
console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 TRADEFLOW BACKEND STARTED                         ║
║                                                          ║
║   🌐 HTTP API: http://localhost:${PORT}                 ║
║   📡 WebSocket: ${wss ? `ws://localhost:${WS_PORT}` : '❌ DISABLED (fallback mode)'}
║                                                          ║
║   📊 Trading Pairs: BTC, ETH, DOGE, SOL, ADA           ║
║   🔄 Price Updates: Every 10 seconds                   ║
║   🔒 CORS: Restricted to allowed domains               ║
║   📁 Frontend: Serving from backend/public             ║
║   ✅ SPA Routes: /login, /register, /admin, etc.      ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);