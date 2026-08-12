// server.js - Complete Backend with WebSocket + Binance API + Authentication
require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

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
// 🔧 PORT CONFIGURATION
// ============================================================
const PORT = process.env.PORT || 8080;

// ============================================================
// DATABASE CONNECTION
// ============================================================
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'tradeflow',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

pool.connect((err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to PostgreSQL database');
    }
});

// ============================================================
// CREATE TABLES IF NOT EXISTS
// ============================================================
const createTables = async () => {
    const client = await pool.connect();
    try {
        // Users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                phone VARCHAR(50),
                role VARCHAR(50) DEFAULT 'user',
                kyc_status VARCHAR(50) DEFAULT 'pending',
                kyc_level INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        `);

        // Balances table
        await client.query(`
            CREATE TABLE IF NOT EXISTS balances (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                asset VARCHAR(50) NOT NULL,
                available DECIMAL(20,8) DEFAULT 0,
                locked DECIMAL(20,8) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, asset)
            )
        `);

        // Deposits table
        await client.query(`
            CREATE TABLE IF NOT EXISTS deposits (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                asset VARCHAR(50) NOT NULL,
                amount DECIMAL(20,8) NOT NULL,
                address TEXT,
                tx_hash TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                confirmed BOOLEAN DEFAULT false,
                confirmations INTEGER DEFAULT 0,
                approved_by INTEGER,
                approved_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Withdrawals table
        await client.query(`
            CREATE TABLE IF NOT EXISTS withdrawals (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                asset VARCHAR(50) NOT NULL,
                amount DECIMAL(20,8) NOT NULL,
                address TEXT NOT NULL,
                tx_hash TEXT,
                fee DECIMAL(20,8) DEFAULT 0,
                status VARCHAR(50) DEFAULT 'pending',
                approved_by INTEGER,
                approved_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // KYC Requests table
        await client.query(`
            CREATE TABLE IF NOT EXISTS kyc_requests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                level INTEGER DEFAULT 1,
                status VARCHAR(50) DEFAULT 'pending',
                documents JSONB,
                reviewed_by INTEGER,
                reviewed_at TIMESTAMP,
                rejection_reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Admin logs table
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_logs (
                id SERIAL PRIMARY KEY,
                admin_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                action VARCHAR(100) NOT NULL,
                target_type VARCHAR(50),
                target_id INTEGER,
                details JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ All tables verified/created successfully');
    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
    } finally {
        client.release();
    }
};

// Call table creation
createTables();

// ============================================================
// JWT SECRET
// ============================================================
const JWT_SECRET = process.env.JWT_SECRET || 'tradeflow-super-secret-key-change-in-production';
const JWT_EXPIRES = '7d';

// ============================================================
// AUTHENTICATION ROUTES
// ============================================================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, username } = req.body;
        
        console.log('📝 Registration attempt:', { name, email, username });
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }
        
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const result = await pool.query(
            `INSERT INTO users (username, email, password, first_name, role, is_active, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
             RETURNING id, username, email, first_name, role, is_active, created_at`,
            [username || name || email.split('@')[0], email, hashedPassword, name || username || '', 'user', true]
        );
        
        const user = result.rows[0];
        
        const defaultAssets = ['USDT', 'BTC', 'ETH', 'SOL'];
        for (const asset of defaultAssets) {
            await pool.query(
                `INSERT INTO balances (user_id, asset, available, locked)
                 VALUES ($1, $2, 0, 0)`,
                [user.id, asset]
            );
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );
        
        const userResponse = {
            id: user.id,
            name: user.username || user.first_name || 'User',
            email: user.email,
            role: user.role,
            is_active: user.is_active,
            created_at: user.created_at
        };
        
        console.log('✅ User registered successfully:', userResponse.name);
        
        res.json({
            success: true,
            user: userResponse,
            token: token
        });
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed: ' + error.message
        });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔐 Login attempt:', { email });
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        
        const result = await pool.query(
            `SELECT id, username, email, password, first_name, role, is_active
             FROM users WHERE email = $1`,
            [email]
        );
        
        if (result.rows.length === 0) {
            console.log('❌ Login failed: User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        const user = result.rows[0];
        
        if (!user.is_active) {
            console.log('❌ Login failed: Account deactivated:', email);
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('❌ Login failed: Invalid password for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );
        
        await pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );
        
        const userResponse = {
            id: user.id,
            name: user.username || user.first_name || 'User',
            email: user.email,
            role: user.role,
            is_active: user.is_active
        };
        
        console.log('✅ User logged in:', userResponse.name);
        
        res.json({
            success: true,
            user: userResponse,
            token: token
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed: ' + error.message
        });
    }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await pool.query(
            'SELECT id, username, email, first_name, role, kyc_status, is_active FROM users WHERE id = $1',
            [decoded.id]
        );
        if (result.rows.length > 0) {
            const user = result.rows[0];
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.first_name || user.username,
                role: user.role,
                kyc_status: user.kyc_status || 'pending',
                is_active: user.is_active
            });
            return;
        }
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// ============================================================
// BALANCE ENDPOINTS
// ============================================================
app.get('/api/balance', async (req, res) => {
    try {
        const userId = req.query.userId || 1;
        
        const result = await pool.query(
            'SELECT asset, available, locked FROM balances WHERE user_id = $1',
            [userId]
        );
        
        const pending = await pool.query(
            'SELECT asset, amount, created_at FROM deposits WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC',
            [userId, 'pending']
        );
        
        res.json({ 
            balances: result.rows,
            pending_deposits: pending.rows
        });
    } catch (error) {
        console.error('❌ Error fetching balance:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/balance/deposit', async (req, res) => {
    const { userId, asset, amount, address, txHash } = req.body;
    
    try {
        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const result = await pool.query(
            `INSERT INTO deposits (user_id, asset, amount, address, tx_hash, status)
             VALUES ($1, $2, $3, $4, $5, 'pending')
             RETURNING *`,
            [userId, asset, amount, address, txHash]
        );
        
        console.log(`📥 Deposit request: ${amount} ${asset} from user ${userId} (PENDING)`);
        res.json({ 
            success: true, 
            message: 'Deposit request submitted. Waiting for admin approval.',
            deposit: result.rows[0]
        });
    } catch (error) {
        console.error('❌ Deposit request error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/balance/withdraw', async (req, res) => {
    const { userId, asset, amount, address } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userCheck = await client.query('SELECT id FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'User not found' });
        }

        const balance = await client.query(
            'SELECT available FROM balances WHERE user_id = $1 AND asset = $2',
            [userId, asset]
        );

        if (balance.rows.length === 0 || balance.rows[0].available < amount) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        await client.query(
            `UPDATE balances 
             SET available = available - $1, locked = locked + $1, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2 AND asset = $3`,
            [amount, userId, asset]
        );

        const result = await client.query(
            `INSERT INTO withdrawals (user_id, asset, amount, address, status)
             VALUES ($1, $2, $3, $4, 'pending')
             RETURNING *`,
            [userId, asset, amount, address]
        );

        await client.query('COMMIT');
        
        console.log(`📤 Withdrawal request: ${amount} ${asset} from user ${userId} (PENDING)`);
        res.json({ 
            success: true, 
            message: 'Withdrawal request submitted. Waiting for admin approval.',
            withdrawal: result.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Withdrawal request error:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// ============================================================
// ADMIN ROUTES
// ============================================================
app.get('/api/admin/users', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, username, email, first_name, role, kyc_status, is_active, created_at
            FROM users
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/stats', async (req, res) => {
    try {
        const stats = {};
        const users = await pool.query('SELECT COUNT(*) FROM users');
        stats.totalUsers = parseInt(users.rows[0].count);
        const pendingDep = await pool.query("SELECT COUNT(*) FROM deposits WHERE status = 'pending'");
        stats.pendingDeposits = parseInt(pendingDep.rows[0].count);
        const pendingWith = await pool.query("SELECT COUNT(*) FROM withdrawals WHERE status = 'pending'");
        stats.pendingWithdrawals = parseInt(pendingWith.rows[0].count);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

// Create HTTP server and attach WebSocket
const server = http.createServer(app);
wss = new WebSocket.Server({ server });

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

function broadcast(data) {
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
// START SERVER - SINGLE LISTEN
// ============================================================
server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 TRADEFLOW BACKEND V3.0 STARTED                   ║
║                                                          ║
║   🌐 HTTP API: http://localhost:${PORT}                 ║
║   📡 WebSocket: ws://localhost:${PORT}                  ║
║                                                          ║
║   🔐 Auth: Register, Login, JWT                        ║
║   💰 Balance: Database balances                       ║
║   📥 Deposits: Request, Approve, Reject               ║
║   📤 Withdrawals: Request, Approve, Reject            ║
║   👥 Users: List, Update, Delete                      ║
║   📊 Trading: Order Book, Binance Prices              ║
║   🔒 CORS: Restricted to allowed domains               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
});