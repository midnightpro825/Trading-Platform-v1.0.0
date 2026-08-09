// liveData.js - Connects to Binance WebSocket for real prices
const WebSocket = require('ws');

class LiveDataConnector {
  constructor() {
    this.connections = new Map();
    this.priceCallbacks = [];
    this.isConnected = false;
    this.latestPrices = {};
    this.symbols = [];
  }

  // Connect to Binance WebSocket
  connectToBinance(symbols = ['btcusdt', 'ethusdt', 'dogeusdt', 'shibusdt']) {
    this.symbols = symbols;
    console.log(`🔌 Connecting to Binance for: ${symbols.join(', ')}`);
    
    // Create streams for each symbol
    const streams = symbols.map(s => `${s}@trade`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

    ws.on('open', () => {
      console.log('✅ Connected to Binance WebSocket');
      this.isConnected = true;
      this.connections.set('binance', ws);
    });

    ws.on('message', (data) => {
      try {
        const trade = JSON.parse(data);
        if (trade.e === 'trade') {
          const price = parseFloat(trade.p);
          const volume = parseFloat(trade.q);
          const symbol = trade.s.toLowerCase();
          
          // Convert symbol format (e.g., 'btcusdt' -> 'BTC/USDT')
          const pair = symbol.replace('usdt', '/USDT').toUpperCase();
          
          // Store latest price
          this.latestPrices[pair] = price;
          
          // Broadcast to all callbacks
          this.priceCallbacks.forEach(cb => {
            cb({
              pair: pair,
              price: price,
              volume: volume,
              timestamp: trade.T,
              symbol: trade.s
            });
          });
        }
      } catch (error) {
        // Ignore parse errors
      }
    });

    ws.on('close', () => {
      console.log('🔴 Binance WebSocket closed, reconnecting in 5s...');
      this.isConnected = false;
      setTimeout(() => this.connectToBinance(this.symbols), 5000);
    });

    ws.on('error', (error) => {
      console.error('❌ Binance WebSocket error:', error.message);
    });
  }

  // Subscribe to price updates
  onPrice(callback) {
    this.priceCallbacks.push(callback);
    console.log(`📊 ${this.priceCallbacks.length} price listeners active`);
    return () => {
      this.priceCallbacks = this.priceCallbacks.filter(cb => cb !== callback);
    };
  }

  // Get real price for a specific pair
  getPrice(pair) {
    return this.latestPrices[pair] || null;
  }

  // Get all prices
  getAllPrices() {
    return this.latestPrices;
  }

  // Disconnect
  disconnect() {
    this.connections.forEach((ws) => {
      ws.close();
    });
    this.connections.clear();
    this.isConnected = false;
    console.log('🔌 Disconnected from all data sources');
  }
}

module.exports = LiveDataConnector;