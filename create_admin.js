const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'tradeflow',
    user: 'postgres',
    password: 'postgres',
});

async function createAdmin() {
    try {
        // Check if admin exists
        const check = await pool.query("SELECT id FROM users WHERE email = 'admin@tradeflow.com'");
        
        if (check.rows.length === 0) {
            // Create admin with proper bcrypt hash
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin123!', salt);
            
            await pool.query(
                `INSERT INTO users (username, email, password, first_name, role, is_active, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
                ['admin', 'admin@tradeflow.com', hashedPassword, 'Admin', 'admin', true]
            );
            console.log('✅ Admin user created successfully!');
            console.log('   Email: admin@tradeflow.com');
            console.log('   Password: Admin123!');
        } else {
            console.log('✅ Admin user already exists!');
        }
        
        await pool.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
        await pool.end();
    }
}

createAdmin();
