const { Pool } = require('pg');
const config = require('./index');
const logger = require('../utils/logger');

const pool = new Pool({
    connectionString: config.POSTGRES_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    logger.info('PostgreSQL connected successfully');
});

pool.on('error', (err) => {
    logger.error('PostgreSQL connection error:', err);
});

async function checkPostgresHealth() {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        return true;
    } catch (error) {
        logger.error('PostgreSQL health check failed:', error);
        return false;
    }
}

module.exports = {
    pool,
    checkPostgresHealth,
};