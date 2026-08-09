// server.js - Simplified working version
const WebSocket = require('ws');
const Exchange = require('./exchange');

// Create exchange
const exchange = new Exchange();

// Create test users
console.log('👤 Creating users...');
exchange.createUser('alice', { BTC: 10, ETH: 50, SOL: 200, USDT: 100000 });
exchange.createUser('bob', { BTC: 0, ETH: 0, SOL: 0, USDT: 50000 });
exchange.createUser('charlie', { BTC: 5, ETH: 20, SOL: 100, USDT: 25000 });

console.log('✅ Users created!');

// WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
console.log('🔌 WebSocket server running on ws://localhost:8080');

// Store all connected clients
const clients = new Set();

// Broadcast function
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Mock market prices
const marketPrices = {
  'BTC/USDT': '45000',
  'ETH/USDT': '3000',
  'SOL/USDT': '150',
  'ADA/USDT': '0.45'
};

// Simulate price updates
setInterval(() => {
  Object.keys(marketPrices).forEach(key => {
    const current = parseFloat(marketPrices[key]);
    const change = (Math.random() - 0.5) * 200;
    const newPrice = Math.max(0, current + change);
    marketPrices[key] = newPrice.toFixed(2);
  });
  
  broadcast({
    type: 'marketPrices',
    data: marketPrices
  });
}, 5000);

// Connection handler
wss.on('connection', (ws) => {
  console.log('🟢 Client connected');
  clients.add(ws);

  // Get order books
  const orderbooks = {};
  const users = { alice: {}, bob: {}, charlie: {} };
  
  // Get balances for all users
  ['alice', 'bob', 'charlie'].forEach(user => {
    const balances = exchange.getBalance(user);
    users[user] = {
      'BTC/USDT': balances,
      'ETH/USDT': balances,
      'SOL/USDT': balances,
      'ADA/USDT': balances
    };
  });

  // Send initial state
  ws.send(JSON.stringify({
    type: 'init',
    data: {
      orderbooks: {
        'BTC/USDT': exchange.getOrderBook(),
        'ETH/USDT': exchange.getOrderBook(),
        'SOL/USDT': exchange.getOrderBook(),
        'ADA/USDT': exchange.getOrderBook()
      },
      users: users,
      marketPrices: marketPrices
    }
  }));

  // Handle messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📩 Received:', data);

      switch (data.type) {
        case 'placeOrder':
          try {
            const result = exchange.placeOrder(
              data.userId,
              data.side,
              data.price,
              data.quantity
            );
            
            ws.send(JSON.stringify({
              type: 'orderResult',
              success: true,
              data: result
            }));
            
            // Broadcast updated balances
            ['alice', 'bob', 'charlie'].forEach(user => {
              const balances = exchange.getBalance(user);
              broadcast({
                type: 'balance',
                userId: user,
                data: {
                  'BTC/USDT': balances,
                  'ETH/USDT': balances,
                  'SOL/USDT': balances,
                  'ADA/USDT': balances
                }
              });
            });
            
            // Broadcast trade
            broadcast({
              type: 'trade',
              pair: 'BTC/USDT',
              data: {
                price: result.trades[0]?.price || '45000',
                quantity: data.quantity,
                buyerUserId: data.side === 'buy' ? data.userId : 'system',
                sellerUserId: data.side === 'sell' ? data.userId : 'system',
                timestamp: Date.now()
              }
            });
            
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'orderResult',
              success: false,
              error: error.message
            }));
          }
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('🔴 Client disconnected');
    clients.delete(ws);
  });
});

console.log('✅ Server ready! Waiting for connections...');
console.log('📊 Trading pairs: BTC, ETH, SOL, ADA');