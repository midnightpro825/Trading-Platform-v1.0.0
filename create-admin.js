const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'tradeflow',
    user: 'postgres',
    password: 'postgres'
});

async function createAdmin() {
    try {
        const email = 'admin@tradeflow.com';
        const password = 'Admin123!';
        const hash = await bcrypt.hash(password, 10);
        
        await pool.query('DELETE FROM users WHERE email = ', [email]);
        await pool.query(
            'INSERT INTO users (email, password_hash, full_name, role, status, created_at, updated_at, email_verified, balance) VALUES (, , , , , NOW(), NOW(), true, 0)',
            [email, hash, 'System Administrator', 'admin', 'active']
        );
        
        const result = await pool.query('SELECT id, email, role FROM users WHERE email = ', [email]);
        console.log('✅ Admin created successfully!');
        console.log('Email:', result.rows[0].email);
        console.log('Role:', result.rows[0].role);
        
        await pool.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

createAdmin();
