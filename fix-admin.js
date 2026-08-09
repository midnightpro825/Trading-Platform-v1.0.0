const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'tradeflow',
    user: 'postgres',
    password: 'postgres'
});

async function fixAdmin() {
    try {
        const email = 'admin@tradeflow.com';
        const password = 'Admin123!';
        const hash = await bcrypt.hash(password, 10);
        
        // Check if admin exists
        const check = await pool.query('SELECT id FROM users WHERE email = ', [email]);
        
        if (check.rows.length > 0) {
            // Update existing admin
            await pool.query(
                'UPDATE users SET password_hash = , full_name = , role = , status = , updated_at = NOW() WHERE email = ',
                [hash, 'System Administrator', 'admin', 'active', email]
            );
            console.log('✅ Admin updated successfully!');
        } else {
            // Insert new admin
            await pool.query(
                'INSERT INTO users (email, password_hash, full_name, role, status, created_at, updated_at, email_verified, balance) VALUES (, , , , , NOW(), NOW(), true, 0)',
                [email, hash, 'System Administrator', 'admin', 'active']
            );
            console.log('✅ Admin created successfully!');
        }
        
        // Verify
        const result = await pool.query('SELECT id, email, role, status FROM users WHERE email = ', [email]);
        console.log('📧 Email:', result.rows[0].email);
        console.log('👤 Role:', result.rows[0].role);
        console.log('🔑 Password:', password);
        
        await pool.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

fixAdmin();
