// testEngine.js - Test our matching engine
const OrderBook = require('./orderBook');

// Create exchange
const book = new OrderBook();

// Add sell orders (asks)
console.log('📊 Adding sell orders...');
book.addOrder('sell', 50000, 0.5);
book.addOrder('sell', 50100, 1.2);
book.addOrder('sell', 49950, 0.8);

// Add buy orders (bids)
console.log('📊 Adding buy orders...');
book.addOrder('buy', 49800, 0.3);
book.addOrder('buy', 49900, 0.6);

console.log('📖 Initial Order Book:');
console.log('Bids (buy):', book.getSnapshot().bids);
console.log('Asks (sell):', book.getSnapshot().asks);
console.log('Best Bid:', book.getBestBid());
console.log('Best Ask:', book.getBestAsk());

// Place a marketable buy order
console.log('\n🔥 Placing marketable buy order for 0.7 BTC at 50000...');
const buyOrder = { side: 'buy', price: 50000, quantity: 0.7 };
const trades = book.matchOrder(buyOrder);

console.log('✅ Trades Executed:');
trades.forEach((t, i) => {
  console.log(`  ${i+1}. ${t.quantity} BTC @ $${t.price} (Buyer: ${t.buyerOrderId}, Seller: ${t.sellerOrderId})`);
});

console.log('\n📖 Updated Order Book:');
console.log('Bids:', book.getSnapshot().bids);
console.log('Asks:', book.getSnapshot().asks);