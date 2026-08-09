// exchange.js - Full exchange with Demo and Live accounts (FIXED)
const OrderBook = require('./orderBook');
const EventEmitter = require('events');

class Exchange extends EventEmitter {
  constructor() {
    super();
    this.orderBook = new OrderBook();
    this.users = new Map();
    this.trades = [];
    this.orderIdCounter = 1;
  }

  // Create user with account type
  createUser(userId, accountType = 'demo', initialBalances = {}) {
    if (this.users.has(userId)) {
      throw new Error(`User ${userId} already exists`);
    }

    // Set initial balances based on account type
    let balances = {};
    
    if (accountType === 'demo') {
      // Demo account: $100,000 virtual money
      balances = {
        BTC: parseFloat(initialBalances.BTC) || 2,
        ETH: parseFloat(initialBalances.ETH) || 20,
        SOL: parseFloat(initialBalances.SOL) || 100,
        ADA: parseFloat(initialBalances.ADA) || 5000,
        DOGE: parseFloat(initialBalances.DOGE) || 10000,
        SHIB: parseFloat(initialBalances.SHIB) || 1000000,
        XAU: parseFloat(initialBalances.XAU) || 0,
        XAG: parseFloat(initialBalances.XAG) || 0,
        EUR: parseFloat(initialBalances.EUR) || 0,
        GBP: parseFloat(initialBalances.GBP) || 0,
        JPY: parseFloat(initialBalances.JPY) || 0,
        USDT: parseFloat(initialBalances.USDT) || 100000
      };
    } else {
      // Live account: Real money (starting with $10,000)
      balances = {
        BTC: parseFloat(initialBalances.BTC) || 0,
        ETH: parseFloat(initialBalances.ETH) || 0,
        SOL: parseFloat(initialBalances.SOL) || 0,
        ADA: parseFloat(initialBalances.ADA) || 0,
        DOGE: parseFloat(initialBalances.DOGE) || 0,
        SHIB: parseFloat(initialBalances.SHIB) || 0,
        XAU: parseFloat(initialBalances.XAU) || 0,
        XAG: parseFloat(initialBalances.XAG) || 0,
        EUR: parseFloat(initialBalances.EUR) || 0,
        GBP: parseFloat(initialBalances.GBP) || 0,
        JPY: parseFloat(initialBalances.JPY) || 0,
        USDT: parseFloat(initialBalances.USDT) || 10000
      };
    }

    this.users.set(userId, {
      accountType: accountType,
      balances: balances,
      openOrders: [],
      orderHistory: [],
      totalDeposits: accountType === 'live' ? 10000 : 0,
      totalWithdrawals: 0,
      createdAt: Date.now()
    });

    console.log(`✅ User ${userId} created with ${accountType} account`);
    return this.users.get(userId);
  }

  // Get user balance
  getBalance(userId) {
    const user = this.users.get(userId);
    if (!user) throw new Error(`User ${userId} not found`);
    return { ...user.balances };
  }

  // Get account info
  getAccountInfo(userId) {
    const user = this.users.get(userId);
    if (!user) throw new Error(`User ${userId} not found`);
    return {
      accountType: user.accountType,
      totalDeposits: user.totalDeposits,
      totalWithdrawals: user.totalWithdrawals,
      createdAt: user.createdAt,
      openOrders: user.openOrders.length,
      totalTrades: user.orderHistory.length
    };
  }

  // Place order - FIXED VERSION
  placeOrder(userId, side, price, quantity, asset = 'BTC/USDT') {
    const user = this.users.get(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    // Parse values to numbers
    const parsedPrice = parseFloat(price);
    const parsedQuantity = parseFloat(quantity);
    
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      throw new Error(`Invalid price: ${price}`);
    }
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      throw new Error(`Invalid quantity: ${quantity}`);
    }

    const cost = parsedPrice * parsedQuantity;
    const assetKey = asset.split('/')[0]; // Get the base asset (e.g., 'BTC' from 'BTC/USDT')
    
    // Check balance based on asset
    if (side === 'buy') {
      const usdtBalance = user.balances.USDT || 0;
      if (usdtBalance < cost) {
        throw new Error(`Insufficient USDT. Need ${cost.toFixed(2)}, have ${usdtBalance.toFixed(2)}`);
      }
    } else {
      const assetBalance = user.balances[assetKey] || 0;
      if (assetBalance < parsedQuantity) {
        throw new Error(`Insufficient ${assetKey}. Need ${parsedQuantity}, have ${assetBalance}`);
      }
    }

    // Lock funds
    if (side === 'buy') {
      user.balances.USDT = (user.balances.USDT || 0) - cost;
    } else {
      user.balances[assetKey] = (user.balances[assetKey] || 0) - parsedQuantity;
    }

    const order = {
      id: this.orderIdCounter++,
      userId,
      side,
      price: parsedPrice,
      quantity: parsedQuantity,
      asset,
      originalQuantity: parsedQuantity,
      timestamp: Date.now()
    };

    user.openOrders.push(order.id);
    this.orderBook.orderMap.set(order.id, order);

    // Match the order
    const trades = this.orderBook.matchOrder(order);

    // Process trades
    trades.forEach(trade => {
      const buyer = this.users.get(trade.buyerUserId);
      const seller = this.users.get(trade.sellerUserId);

      if (buyer) {
        buyer.balances[assetKey] = (buyer.balances[assetKey] || 0) + trade.quantity;
      }
      if (seller) {
        seller.balances.USDT = (seller.balances.USDT || 0) + (trade.price * trade.quantity);
      }

      // Record trade
      const tradeRecord = {
        ...trade,
        asset,
        timestamp: Date.now()
      };
      this.trades.push(tradeRecord);
      this.emit('trade', tradeRecord);
    });

    // Update user's open orders
    if (order.quantity <= 0 || trades.length > 0) {
      const index = user.openOrders.indexOf(order.id);
      if (index > -1) {
        user.openOrders.splice(index, 1);
      }
      user.orderHistory.push({
        orderId: order.id,
        asset,
        side,
        price: parsedPrice,
        quantity: parsedQuantity - order.quantity,
        timestamp: Date.now()
      });
    }

    const filledQuantity = trades.reduce((sum, t) => sum + t.quantity, 0);

    return {
      orderId: order.id,
      filled: filledQuantity,
      remaining: order.quantity || 0,
      trades
    };
  }

  // Cancel order
  cancelOrder(userId, orderId) {
    const user = this.users.get(userId);
    if (!user) throw new Error(`User ${userId} not found`);

    let removed = false;
    const order = this.orderBook.orderMap.get(orderId);
    if (!order) throw new Error(`Order ${orderId} not found`);

    const assetKey = order.asset.split('/')[0];
    
    for (let i = 0; i < this.orderBook.bids.length; i++) {
      if (this.orderBook.bids[i][2] === orderId) {
        const [price, quantity, id] = this.orderBook.bids[i];
        user.balances.USDT = (user.balances.USDT || 0) + (price * quantity);
        this.orderBook.bids.splice(i, 1);
        this.orderBook.orderMap.delete(orderId);
        removed = true;
        break;
      }
    }

    if (!removed) {
      for (let i = 0; i < this.orderBook.asks.length; i++) {
        if (this.orderBook.asks[i][2] === orderId) {
          const [price, quantity, id] = this.orderBook.asks[i];
          user.balances[assetKey] = (user.balances[assetKey] || 0) + quantity;
          this.orderBook.asks.splice(i, 1);
          this.orderBook.orderMap.delete(orderId);
          removed = true;
          break;
        }
      }
    }

    if (!removed) {
      throw new Error(`Order ${orderId} already filled`);
    }

    const index = user.openOrders.indexOf(orderId);
    if (index > -1) {
      user.openOrders.splice(index, 1);
    }

    return { success: true, orderId };
  }

  // Get order book
  getOrderBook() {
    return this.orderBook.getSnapshot();
  }

  // Get recent trades
  getRecentTrades(limit = 20, asset = null) {
    let trades = this.trades;
    if (asset) {
      trades = trades.filter(t => t.asset === asset);
    }
    return trades.slice(-limit);
  }

  // Get user's open orders
  getUserOpenOrders(userId) {
    const user = this.users.get(userId);
    if (!user) throw new Error(`User ${userId} not found`);
    return user.openOrders
      .map(id => this.orderBook.orderMap.get(id))
      .filter(Boolean);
  }

  // Get total assets in system
  getTotalAssets() {
    const totals = {
      BTC: 0,
      ETH: 0,
      SOL: 0,
      ADA: 0,
      DOGE: 0,
      SHIB: 0,
      XAU: 0,
      XAG: 0,
      EUR: 0,
      GBP: 0,
      JPY: 0,
      USDT: 0
    };

    for (const [userId, user] of this.users) {
      for (const [asset, amount] of Object.entries(user.balances)) {
        totals[asset] = (totals[asset] || 0) + amount;
      }
    }

    return totals;
  }
}

module.exports = Exchange;