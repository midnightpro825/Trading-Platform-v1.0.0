// autoTrader.js - Automatically places trades to generate candles
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', function open() {
  console.log('✅ Connected to server! Generating trades...');
  
  const users = ['alice_demo', 'bob_demo', 'charlie_demo'];
  const assets = ['BTC/USDT', 'ETH/USDT', 'DOGE/USDT'];
  let count = 0;
  const totalTrades = 50;
  
  for (let i = 0; i < totalTrades; i++) {
    setTimeout(() => {
      const user = users[Math.floor(Math.random() * users.length)];
      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      const asset = assets[Math.floor(Math.random() * assets.length)];
      
      let basePrice;
      if (asset === 'BTC/USDT') basePrice = 61930;
      else if (asset === 'ETH/USDT') basePrice = 1737;
      else basePrice = 0.075;
      
      const price = basePrice + (Math.random() - 0.5) * (asset === 'BTC/USDT' ? 400 : asset === 'ETH/USDT' ? 20 : 0.005);
      const quantity = 0.05 + Math.random() * 0.3;
      
      const orderData = {
        type: 'placeOrder',
        userId: user,
        side: side,
        price: price,
        quantity: quantity,
        asset: asset
      };
      
      ws.send(JSON.stringify(orderData));
      count++;
      
      if (count % 10 === 0 || count === totalTrades) {
        console.log(`📊 ${count}/${totalTrades} trades sent`);
      }
    }, i * 150);
  }
  
  setTimeout(() => {
    console.log('✅ All trades sent! Check your chart!');
    ws.close();
  }, totalTrades * 150 + 2000);
});

ws.on('error', function error(err) {
  console.error('❌ Connection error:', err.message);
  console.log('💡 Make sure your server is running: node server.js');
});

ws.on('close', function close() {
  console.log('🔴 Connection closed');
});