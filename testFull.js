// testFull.js - Enhanced test with Decimal precision
const Exchange = require('./exchange');

console.log('🚀 Launching Crypto Exchange (with perfect precision)...\n');

// Create exchange
const exchange = new Exchange();

// Create users
console.log('👤 Creating users...');
const alice = exchange.createUser('alice', { BTC: 10, USDT: 100000 });
const bob = exchange.createUser('bob', { BTC: 0, USDT: 50000 });
const charlie = exchange.createUser('charlie', { BTC: 5, USDT: 25000 });

console.log('Initial Balances:');
const initialAlice = exchange.getBalance('alice');
const initialBob = exchange.getBalance('bob');
const initialCharlie = exchange.getBalance('charlie');
console.log(`  Alice:   BTC: ${initialAlice.BTC.padStart(8)}  |  USDT: ${initialAlice.USDT.padStart(10)}`);
console.log(`  Bob:     BTC: ${initialBob.BTC.padStart(8)}  |  USDT: ${initialBob.USDT.padStart(10)}`);
console.log(`  Charlie: BTC: ${initialCharlie.BTC.padStart(8)}  |  USDT: ${initialCharlie.USDT.padStart(10)}`);

console.log('\n📊 Trading Activity...\n');

// Bob places buy order
console.log('1️⃣ Bob wants to BUY 0.5 BTC at $45,000');
try {
  const result1 = exchange.placeOrder('bob', 'buy', 45000, 0.5);
  console.log(`   ✅ Filled: ${result1.filled.padStart(8)} BTC, Remaining: ${result1.remaining.padStart(8)} BTC`);
  const bobBal = exchange.getBalance('bob');
  console.log(`   🏦 Bob\'s balance: BTC: ${bobBal.BTC.padStart(8)}, USDT: ${bobBal.USDT.padStart(10)}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Alice places sell order
console.log('\n2️⃣ Alice wants to SELL 0.3 BTC at $45,000');
try {
  const result2 = exchange.placeOrder('alice', 'sell', 45000, 0.3);
  console.log(`   ✅ Filled: ${result2.filled.padStart(8)} BTC, Remaining: ${result2.remaining.padStart(8)} BTC`);
  const aliceBal = exchange.getBalance('alice');
  const bobBal = exchange.getBalance('bob');
  console.log(`   🏦 Alice\'s balance: BTC: ${aliceBal.BTC.padStart(8)}, USDT: ${aliceBal.USDT.padStart(10)}`);
  console.log(`   🏦 Bob\'s balance:   BTC: ${bobBal.BTC.padStart(8)}, USDT: ${bobBal.USDT.padStart(10)}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Charlie places sell order
console.log('\n3️⃣ Charlie wants to SELL 0.8 BTC at $44,800');
try {
  const result3 = exchange.placeOrder('charlie', 'sell', 44800, 0.8);
  console.log(`   ✅ Filled: ${result3.filled.padStart(8)} BTC, Remaining: ${result3.remaining.padStart(8)} BTC`);
  const charlieBal = exchange.getBalance('charlie');
  const bobBal = exchange.getBalance('bob');
  console.log(`   🏦 Charlie\'s balance: BTC: ${charlieBal.BTC.padStart(8)}, USDT: ${charlieBal.USDT.padStart(10)}`);
  console.log(`   🏦 Bob\'s balance:     BTC: ${bobBal.BTC.padStart(8)}, USDT: ${bobBal.USDT.padStart(10)}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Bob places another buy
console.log('\n4️⃣ Bob wants to BUY 0.6 BTC at $44,900');
try {
  const result4 = exchange.placeOrder('bob', 'buy', 44900, 0.6);
  console.log(`   ✅ Filled: ${result4.filled.padStart(8)} BTC, Remaining: ${result4.remaining.padStart(8)} BTC`);
  const bobBal = exchange.getBalance('bob');
  const charlieBal = exchange.getBalance('charlie');
  console.log(`   🏦 Bob\'s balance:     BTC: ${bobBal.BTC.padStart(8)}, USDT: ${bobBal.USDT.padStart(10)}`);
  console.log(`   🏦 Charlie\'s balance: BTC: ${charlieBal.BTC.padStart(8)}, USDT: ${charlieBal.USDT.padStart(10)}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Final summary
console.log('\n' + '='.repeat(70));
console.log('📊 FINAL BALANCES');
console.log('='.repeat(70));

const finalAlice = exchange.getBalance('alice');
const finalBob = exchange.getBalance('bob');
const finalCharlie = exchange.getBalance('charlie');

console.log(`  Alice:   BTC: ${finalAlice.BTC.padStart(8)}  |  USDT: ${finalAlice.USDT.padStart(10)}`);
console.log(`  Bob:     BTC: ${finalBob.BTC.padStart(8)}  |  USDT: ${finalBob.USDT.padStart(10)}`);
console.log(`  Charlie: BTC: ${finalCharlie.BTC.padStart(8)}  |  USDT: ${finalCharlie.USDT.padStart(10)}`);

console.log('\n📈 TRADE HISTORY:');
const trades = exchange.getRecentTrades(10);
trades.forEach((t, i) => {
  console.log(`  ${i+1}. ${t.quantity.padStart(6)} BTC @ $${t.price.padStart(6)} (Buyer: ${t.buyerUserId}, Seller: ${t.sellerUserId})`);
});

console.log('\n📖 ORDER BOOK:');
const book = exchange.getOrderBook();
console.log('  Bids:', book.bids.length > 0 ? book.bids.map(b => `${b[0]} @ ${b[1]}`).join(', ') : 'empty');
console.log('  Asks:', book.asks.length > 0 ? book.asks.map(a => `${a[0]} @ ${a[1]}`).join(', ') : 'empty');

// Verify balances mathematically
console.log('\n🔍 BALANCE VERIFICATION:');
const totalAssets = exchange.getTotalAssets();
console.log(`  Total BTC in system:  ${totalAssets.BTC.padStart(8)} BTC`);
console.log(`  Total USDT in system: ${totalAssets.USDT.padStart(10)} USDT`);
console.log(`  Expected total BTC:   15.0000 BTC`);
console.log(`  Expected total USDT:  175000.00 USDT`);

// Check if totals match
const btcMatch = parseFloat(totalAssets.BTC) === 15;
const usdtMatch = parseFloat(totalAssets.USDT) === 175000;
console.log(`  ✅ BTC total ${btcMatch ? 'MATCHES' : 'DOES NOT MATCH'} expected`);
console.log(`  ✅ USDT total ${usdtMatch ? 'MATCHES' : 'DOES NOT MATCH'} expected`);

console.log('\n✅ Exchange test complete!');
console.log('💎 All calculations now use Decimal.js for perfect precision!');