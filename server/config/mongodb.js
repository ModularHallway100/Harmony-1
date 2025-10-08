// MongoDB Configuration for Harmony Music Platform
const mongoose = require('mongoose');
const logger = require('../utils/logger');

class MongoDBConnection {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            // MongoDB connection URI
            const mongoURI = process.env.MONGODB_URI || 
                `mongodb://${process.env.MONGODB_USER || 'admin'}:${process.env.MONGODB_PASSWORD || 'password'}@${process.env.MONGODB_HOST || 'localhost'}:${process.env.MONGODB_PORT || 27017}/${process.env.MONGODB_DB || 'harmony'}?authSource=admin`;

            // Mongoose connection options
            const options = {
                maxPoolSize: 10, // Maintain up to 10 socket connections
                serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
                socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
                family: 4, // Use IPv4, skip trying IPv6
                // Additional options for production
                readPreference: 'secondaryPreferred' if process.env.NODE_ENV === 'production' else 'primary',
                retryWrites: true,
                w: 'majority'
            };

            // Connect to MongoDB
            this.connection = await mongoose.connect(mongoURI, options);

            // Connection event listeners
            mongoose.connection.on('connected', () => {
                this.isConnected = true;
                logger.info('MongoDB connected successfully');
            });

            mongoose.connection.on('error', (err) => {
                logger.error('MongoDB connection error:', err);
                this.isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('MongoDB disconnected');
                this.isConnected = false;
            });

            // Handle application termination
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });

            return this.connection;
        } catch (error) {
            logger.error('Failed to connect to MongoDB:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            if (this.connection) {
                await mongoose.connection.close();
                this.isConnected = false;
                logger.info('MongoDB connection closed');
            }
        } catch (error) {
            logger.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }

    // Health check
    async checkHealth() {
        try {
            if (!this.isConnected || !mongoose.connection) {
                return false;
            }

            // Ping the database
            await mongoose.connection.db.admin().ping();
            return true;
        } catch (error) {
            logger.error('MongoDB health check failed:', error);
            return false;
        }
    }

    // Get the MongoDB database instance
    getDb() {
        if (!this.isConnected || !mongoose.connection) {
            throw new Error('MongoDB not connected');
        }
        return mongoose.connection.db;
    }

    // Get a model by name
    getModel(modelName) {
        if (!this.isConnected || !mongoose.connection) {
            throw new Error('MongoDB not connected');
        }
        return mongoose.model(modelName);
    }

    // Create a new model
    createModel(name, schema) {
        if (!this.isConnected || !mongoose.connection) {
            throw new Error('MongoDB not connected');
        }
        return mongoose.model(name, schema);
    }
}

// Create singleton instance
const mongoConnection = new MongoDBConnection();

// Helper function to connect (for easier import)
const connectMongoDB = async () => {
    return await mongoConnection.connect();
};

// Export connection instance and helper function
module.exports = {
    mongoConnection,
    connectMongoDB,
    getDb: () => mongoConnection.getDb(),
    getModel: (modelName) => mongoConnection.getModel(modelName),
    createModel: (name, schema) => mongoConnection.createModel(name, schema),
    checkHealth: () => mongoConnection.checkHealth(),
    disconnect: () => mongoConnection.disconnect()
};