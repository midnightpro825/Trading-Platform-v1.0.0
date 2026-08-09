// testLiveData.js - Test Binance WebSocket connection
const LiveDataConnector = require('./liveData');

console.log('🚀 Testing Binance Live Data Connection...\n');

// Create connector
const liveData = new LiveDataConnector();

// Subscribe to price updates
liveData.onPrice((data) => {
  console.log(`📊 ${data.pair}: $${data.price} (Volume: ${data.volume})`);
});

// Connect to Binance
liveData.connectToBinance(['btcusdt', 'ethusdt', 'dogeusdt', 'shibusdt']);

// Keep running for 30 seconds then exit
console.log('\n⏳ Waiting for data... (will run for 30 seconds)\n');

setTimeout(() => {
  console.log('\n✅ Test complete! Disconnecting...');
  liveData.disconnect();
  process.exit(0);
}, 30000);