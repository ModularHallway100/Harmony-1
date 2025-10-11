const pino = require('pino');
const pinoHttp = require('pino-http');
const { createWriteStream } = require('fs');
const { join } = require('path');
const { mkdir } = require('fs').promises;
const config = require('../config');

// Create logs directory if it doesn't exist
const logsDir = join(__dirname, '../../logs');
mkdir(logsDir, { recursive: true }).catch(() => {});

const logger = pino({
    level: config.LOG_LEVEL,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level: label => ({ level: label })
    },
    redact: {
        paths: ['req.headers.authorization', 'req.body.password', 'req.body.newPassword'],
        censor: '**REDACTED**'
    }
}, pino.multistream([
    { stream: process.stdout },
    { stream: createWriteStream(join(logsDir, 'combined.log'), { flags: 'a' }) },
    { stream: createWriteStream(join(logsDir, 'error.log'), { flags: 'a' }), level: 'error' }
]));

const requestLogger = pinoHttp({ logger });

module.exports = {
    logger,
    requestLogger,
};