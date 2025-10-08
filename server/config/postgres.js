// PostgreSQL Configuration for Harmony Music Platform
const { Pool } = require('pg');
const logger = require('../utils/logger');

class PostgreSQLConnection {
    constructor() {
        this.pool = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            // Create connection pool
            this.pool = new Pool({
                user: process.env.DB_USER || 'postgres',
                host: process.env.DB_HOST || 'localhost',
                database: process.env.DB_NAME || 'harmony',
                password: process.env.DB_PASSWORD || 'password',
                port: process.env.DB_PORT || 5432,
                max: 20, // maximum number of connections in the pool
                idleTimeoutMillis: 30000, // close idle clients after 30 seconds
                connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
            });

            // Test the connection
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();

            this.isConnected = true;
            logger.info('PostgreSQL connected successfully');

            // Set up connection error handling
            this.pool.on('error', (err) => {
                logger.error('PostgreSQL connection error:', err);
                this.isConnected = false;
            });

            return this.pool;
        } catch (error) {
            logger.error('Failed to connect to PostgreSQL:', error);
            throw error;
        }
    }

    async query(text, params) {
        if (!this.isConnected || !this.pool) {
            throw new Error('PostgreSQL not connected');
        }

        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            
            // Log slow queries (over 1 second)
            if (duration > 1000) {
                logger.warn('Slow PostgreSQL query:', { text, duration, rows: result.rowCount });
            }
            
            return result;
        } catch (error) {
            logger.error('PostgreSQL query error:', { text, error: error.message });
            throw error;
        }
    }

    async getClient() {
        if (!this.isConnected || !this.pool) {
            throw new Error('PostgreSQL not connected');
        }
        
        return await this.pool.connect();
    }

    async transaction(callback) {
        if (!this.isConnected || !this.pool) {
            throw new Error('PostgreSQL not connected');
        }

        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Transaction failed, rolled back:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            this.isConnected = false;
            logger.info('PostgreSQL connection closed');
        }
    }

    // Health check
    async checkHealth() {
        if (!this.isConnected || !this.pool) {
            return false;
        }

        try {
            const client = await this.pool.connect();
            await client.query('SELECT 1');
            client.release();
            return true;
        } catch (error) {
            logger.error('PostgreSQL health check failed:', error);
            return false;
        }
    }
}

// Create singleton instance
const postgresConnection = new PostgreSQLConnection();

// Helper function to connect (for easier import)
const connectPostgreSQL = async () => {
    return await postgresConnection.connect();
};

// Export connection instance and helper function
module.exports = {
    postgresConnection,
    connectPostgreSQL,
    query: (text, params) => postgresConnection.query(text, params),
    getClient: () => postgresConnection.getClient(),
    transaction: (callback) => postgresConnection.transaction(callback),
    checkHealth: () => postgresConnection.checkHealth(),
    close: () => postgresConnection.close()
};