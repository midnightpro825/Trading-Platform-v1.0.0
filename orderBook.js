// orderBook.js - Fixed version (no Decimal.js issues)
class OrderBook {
  constructor() {
    this.bids = []; // [price, quantity, orderId, userId, timestamp]
    this.asks = [];
    this.orderMap = new Map();
    this.nextOrderId = 1;
  }

  // Add a limit order
  addOrder(side, price, quantity, userId) {
    const order = {
      id: this.nextOrderId++,
      side,
      price: parseFloat(price),
      quantity: parseFloat(quantity),
      userId,
      originalQuantity: parseFloat(quantity),
      timestamp: Date.now()
    };

    this.orderMap.set(order.id, order);

    if (side === 'buy') {
      this._insertBid(order);
    } else {
      this._insertAsk(order);
    }

    return order.id;
  }

  // Insert bid (highest price first)
  _insertBid(order) {
    let i = 0;
    while (i < this.bids.length && this.bids[i][0] > order.price) {
      i++;
    }
    while (i < this.bids.length && this.bids[i][0] === order.price && this.bids[i][4] < order.timestamp) {
      i++;
    }
    this.bids.splice(i, 0, [order.price, order.quantity, order.id, order.userId, order.timestamp]);
  }

  // Insert ask (lowest price first)
  _insertAsk(order) {
    let i = 0;
    while (i < this.asks.length && this.asks[i][0] < order.price) {
      i++;
    }
    while (i < this.asks.length && this.asks[i][0] === order.price && this.asks[i][4] < order.timestamp) {
      i++;
    }
    this.asks.splice(i, 0, [order.price, order.quantity, order.id, order.userId, order.timestamp]);
  }

  // Get best bid/ask
  getBestBid() {
    return this.bids.length > 0 ? this.bids[0] : null;
  }

  getBestAsk() {
    return this.asks.length > 0 ? this.asks[0] : null;
  }

  // Get full order book snapshot
  getSnapshot() {
    return {
      bids: this.bids.map(([price, qty]) => [price, qty]),
      asks: this.asks.map(([price, qty]) => [price, qty])
    };
  }

  // Get order details by ID
  getOrder(orderId) {
    return this.orderMap.get(orderId);
  }

  // Match an order against the book - FIXED VERSION
  matchOrder(order) {
    const trades = [];

    // Make sure quantity is a number
    let remainingQuantity = parseFloat(order.quantity) || 0;

    if (order.side === 'buy') {
      // Match against asks
      while (remainingQuantity > 0 && this.asks.length > 0) {
        const bestAsk = this.asks[0];
        const [askPrice, askQty, askId, askUserId, askTime] = bestAsk;

        // Check if prices cross
        if (order.price < askPrice) break;

        const matchQty = Math.min(remainingQuantity, askQty);
        const sellerOrder = this.orderMap.get(askId);

        trades.push({
          price: askPrice,
          quantity: matchQty,
          buyerOrderId: order.id,
          buyerUserId: order.userId,
          sellerOrderId: askId,
          sellerUserId: sellerOrder ? sellerOrder.userId : 'unknown',
          timestamp: Date.now()
        });

        // Update quantities using regular math
        remainingQuantity = remainingQuantity - matchQty;
        bestAsk[1] = bestAsk[1] - matchQty;

        // Remove fully filled order
        if (bestAsk[1] <= 0) {
          this.asks.shift();
          this.orderMap.delete(askId);
        }
      }
    } else {
      // Match against bids (sell order)
      while (remainingQuantity > 0 && this.bids.length > 0) {
        const bestBid = this.bids[0];
        const [bidPrice, bidQty, bidId, bidUserId, bidTime] = bestBid;

        if (order.price > bidPrice) break;

        const matchQty = Math.min(remainingQuantity, bidQty);
        const buyerOrder = this.orderMap.get(bidId);

        trades.push({
          price: bidPrice,
          quantity: matchQty,
          buyerOrderId: bidId,
          buyerUserId: buyerOrder ? buyerOrder.userId : 'unknown',
          sellerOrderId: order.id,
          sellerUserId: order.userId,
          timestamp: Date.now()
        });

        remainingQuantity = remainingQuantity - matchQty;
        bestBid[1] = bestBid[1] - matchQty;

        if (bestBid[1] <= 0) {
          this.bids.shift();
          this.orderMap.delete(bidId);
        }
      }
    }

    // Update order quantity
    order.quantity = remainingQuantity;

    // If order wasn't fully filled, add remaining to book
    if (remainingQuantity > 0) {
      this.addOrder(order.side, order.price, remainingQuantity, order.userId);
    }

    return trades;
  }
}

module.exports = OrderBook;