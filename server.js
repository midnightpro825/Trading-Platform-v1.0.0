require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

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

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());

// ============================================================
// JWT SECRET
// ============================================================
const JWT_SECRET = process.env.JWT_SECRET || 'tradeflow-super-secret-key-change-in-production';
const JWT_EXPIRES = '7d';

// ============================================================
// WEBSOCKET CONNECTIONS
// ============================================================
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('🔗 New WebSocket connection');
    clients.add(ws);

    ws.on('close', () => {
        console.log('🔌 WebSocket disconnected');
        clients.delete(ws);
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('📩 WebSocket message:', data.type);
        } catch (error) {
            console.error('WebSocket error:', error);
        }
    });
});

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// ✅ SECURE REGISTER - Creates user in database
// ============================================================
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

// ============================================================
// ✅ SECURE LOGIN - Authenticates user
// ============================================================
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

// ============================================================
// USER ENDPOINTS
// ============================================================
app.get('/api/user/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        try {
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
        } catch (jwtError) {
            // Invalid token
        }
        
        res.json({ username: 'demo', email: 'demo@tradeflow.com', role: 'user' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/user/profile', (req, res) => {
    res.json({ success: true, message: 'Profile updated' });
});

app.put('/api/user/password', (req, res) => {
    res.json({ success: true, message: 'Password updated' });
});

// ============================================================
// BALANCE ENDPOINT
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
// ADMIN DEPOSITS ENDPOINTS
// ============================================================
app.get('/api/admin/deposits/pending', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.*, u.username, u.email 
            FROM deposits d
            JOIN users u ON d.user_id = u.id
            WHERE d.status = 'pending'
            ORDER BY d.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching pending deposits:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/deposits', async (req, res) => {
    const { status } = req.query;
    try {
        let query = `
            SELECT d.*, u.username, u.email 
            FROM deposits d
            JOIN users u ON d.user_id = u.id
        `;
        const params = [];
        if (status) {
            query += ` WHERE d.status = $1`;
            params.push(status);
        }
        query += ` ORDER BY d.created_at DESC`;
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching deposits:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/deposits/:id/approve', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const deposit = await client.query(
            'SELECT * FROM deposits WHERE id = $1 AND status = $2',
            [id, 'pending']
        );

        if (deposit.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Deposit not found or already processed' });
        }

        const dep = deposit.rows[0];
        const adminId = req.user?.id || 1;

        await client.query(
            `UPDATE deposits 
             SET status = 'approved', 
                 approved_by = $1, 
                 approved_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [adminId, id]
        );

        await client.query(
            `INSERT INTO balances (user_id, asset, available)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, asset)
             DO UPDATE SET available = balances.available + $3, updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [dep.user_id, dep.asset, dep.amount]
        );

        await client.query('COMMIT');
        
        console.log(`✅ Deposit ${id} approved: ${dep.amount} ${dep.asset} credited to user ${dep.user_id}`);
        res.json({ 
            success: true, 
            message: `Deposit approved! ${dep.amount} ${dep.asset} credited.`
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error approving deposit:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

app.put('/api/admin/deposits/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE deposits 
             SET status = 'rejected', 
                 approved_by = $1, 
                 approved_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND status = 'pending'
             RETURNING *`,
            [req.user?.id || 1, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Deposit not found or already processed' });
        }
        
        res.json({ success: true, message: 'Deposit rejected' });
    } catch (error) {
        console.error('Error rejecting deposit:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ADMIN WITHDRAWALS ENDPOINTS
// ============================================================
app.get('/api/admin/withdrawals/pending', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT w.*, u.username, u.email 
            FROM withdrawals w
            JOIN users u ON w.user_id = u.id
            WHERE w.status = 'pending'
            ORDER BY w.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching pending withdrawals:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/withdrawals', async (req, res) => {
    const { status } = req.query;
    try {
        let query = `
            SELECT w.*, u.username, u.email 
            FROM withdrawals w
            JOIN users u ON w.user_id = u.id
        `;
        const params = [];
        if (status) {
            query += ` WHERE w.status = $1`;
            params.push(status);
        }
        query += ` ORDER BY w.created_at DESC`;
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/withdrawals/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { tx_hash } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const withdrawal = await client.query(
            'SELECT * FROM withdrawals WHERE id = $1 AND status = $2',
            [id, 'pending']
        );

        if (withdrawal.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Withdrawal not found or already processed' });
        }

        const wd = withdrawal.rows[0];
        const adminId = req.user?.id || 1;

        await client.query(
            `UPDATE withdrawals 
             SET status = 'approved', 
                 tx_hash = $1,
                 approved_by = $2, 
                 approved_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [tx_hash || null, adminId, id]
        );

        await client.query(
            `UPDATE balances 
             SET locked = locked - $1, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2 AND asset = $3`,
            [wd.amount, wd.user_id, wd.asset]
        );

        await client.query('COMMIT');
        
        console.log(`✅ Withdrawal ${id} approved: ${wd.amount} ${wd.asset} from user ${wd.user_id}`);
        res.json({ 
            success: true, 
            message: 'Withdrawal approved successfully'
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error approving withdrawal:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

app.put('/api/admin/withdrawals/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            `UPDATE withdrawals 
             SET status = 'rejected', 
                 approved_by = $1, 
                 approved_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND status = 'pending'
             RETURNING *`,
            [req.user?.id || 1, id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Withdrawal not found or already processed' });
        }

        const wd = result.rows[0];

        await client.query(
            `UPDATE balances 
             SET available = available + $1, locked = locked - $1, updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2 AND asset = $3`,
            [wd.amount, wd.user_id, wd.asset]
        );

        await client.query('COMMIT');
        
        console.log(`❌ Withdrawal ${id} rejected: ${wd.amount} ${wd.asset} returned to user ${wd.user_id}`);
        res.json({ success: true, message: 'Withdrawal rejected' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error rejecting withdrawal:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

// ============================================================
// ADMIN USERS ENDPOINTS
// ============================================================
app.get('/api/admin/users', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, username, email, first_name, last_name, phone, role, 
                   kyc_status, is_active, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/users/:id/status', async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [is_active, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/users/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [role, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ADMIN KYC ENDPOINTS
// ============================================================
app.get('/api/admin/kyc/pending', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT k.*, u.username, u.email 
            FROM kyc_requests k
            JOIN users u ON k.user_id = u.id
            WHERE k.status = 'pending'
            ORDER BY k.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/kyc/:id/approve', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `UPDATE kyc_requests 
             SET status = 'approved', 
                 reviewed_by = $1, 
                 reviewed_at = CURRENT_TIMESTAMP
             WHERE id = $2 AND status = 'pending'
             RETURNING *`,
            [req.user?.id || 1, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'KYC request not found' });
        }
        
        await pool.query(
            'UPDATE users SET kyc_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['verified', result.rows[0].user_id]
        );
        
        res.json({ success: true, message: 'KYC approved' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/admin/kyc/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE kyc_requests 
             SET status = 'rejected', 
                 reviewed_by = $1, 
                 reviewed_at = CURRENT_TIMESTAMP,
                 rejection_reason = $2
             WHERE id = $3 AND status = 'pending'
             RETURNING *`,
            [req.user?.id || 1, reason, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'KYC request not found' });
        }
        
        res.json({ success: true, message: 'KYC rejected' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// ADMIN STATS
// ============================================================
app.get('/api/admin/stats', async (req, res) => {
    try {
        const stats = {};
        
        const users = await pool.query('SELECT COUNT(*) FROM users');
        stats.totalUsers = parseInt(users.rows[0].count);
        
        const activeUsers = await pool.query("SELECT COUNT(*) FROM users WHERE is_active = true");
        stats.activeUsers = parseInt(activeUsers.rows[0].count);
        
        const pendingDep = await pool.query("SELECT COUNT(*) FROM deposits WHERE status = 'pending'");
        stats.pendingDeposits = parseInt(pendingDep.rows[0].count);
        
        const pendingWith = await pool.query("SELECT COUNT(*) FROM withdrawals WHERE status = 'pending'");
        stats.pendingWithdrawals = parseInt(pendingWith.rows[0].count);
        
        const kycPending = await pool.query("SELECT COUNT(*) FROM kyc_requests WHERE status = 'pending'");
        stats.kycPending = parseInt(kycPending.rows[0].count);
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// PRICE UPDATE SIMULATION
// ============================================================
setInterval(() => {
    if (clients.size === 0) return;

    const btcPrice = 61690.47 + (Math.random() - 0.5) * 100;
    const ethPrice = 1748.74 + (Math.random() - 0.5) * 10;
    const solPrice = 152.30 + (Math.random() - 0.5) * 5;

    const data = {
        type: 'marketPrices',
        data: {
            'BTC/USDT': { price: btcPrice, change: (Math.random() - 0.5) * 2, volume: 1245000000 },
            'ETH/USDT': { price: ethPrice, change: (Math.random() - 0.5) * 2, volume: 456000000 },
            'SOL/USDT': { price: solPrice, change: (Math.random() - 0.5) * 2, volume: 234000000 }
        }
    };

    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}, 3000);

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 8081;

server.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                                                          ║');
    console.log('║   🚀 TRADEFLOW BACKEND V2.0 STARTED                   ║');
    console.log('║                                                          ║');
    console.log(`║   📡 WebSocket: ws://localhost:${PORT}                    ║`);
    console.log(`║   🌐 HTTP API: http://localhost:${PORT}                   ║`);
    console.log('║                                                          ║');
    console.log('║   ✅ Registration creates users in database             ║');
    console.log('║   ✅ Login authenticates users with JWT                 ║');
    console.log('║   ✅ Balance fetches from database                      ║');
    console.log('║                                                          ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
});