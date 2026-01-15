const pg = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
});

async function test() {
    console.log('Connecting to:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@'));
    try {
        const start = Date.now();
        const client = await pool.connect();
        const end = Date.now();
        console.log('Connected successfully in', end - start, 'ms');
        const res = await client.query('SELECT NOW()');
        console.log('Result:', res.rows[0]);
        client.release();
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        await pool.end();
    }
}

test();
