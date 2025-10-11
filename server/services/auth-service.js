const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateTokens, refreshAccessToken } = require('../middleware/auth');
const { cacheUserSession } = require('../../redis/config');
const logger = require('../utils/logger');

let db;

function initialize(database) {
    db = database;
}

async function register({ email, username, password, fullName, userType = 'listener' }) {
    // Check if user already exists
    const existingUser = await db.postgres.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
    );

    if (existingUser.rows.length > 0) {
        throw new Error('User with this email or username already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Insert new user
    const newUser = await db.postgres.query(
        `INSERT INTO users (email, username, password_hash, full_name, user_type, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, username, full_name, user_type, created_at`,
        [email, username, passwordHash, fullName, userType, false]
    );

    const user = newUser.rows[0];

    // TODO: Send verification email
    logger.info('New user registered', { userId: user.id, email });

    // Generate tokens
    const tokens = generateTokens(user);

    // Cache user session
    await cacheUserSession(user.id, {
        userId: user.id,
        email: user.email,
        username: user.username,
        userType: user.userType
    });

    return { user, tokens };
}

async function login({ email, password }) {
    // Find user by email
    const userQuery = await db.postgres.query(
        'SELECT id, email, username, password_hash, full_name, user_type, is_active FROM users WHERE email = $1',
        [email]
    );

    if (userQuery.rows.length === 0) {
        throw new Error('Invalid email or password');
    }

    const user = userQuery.rows[0];

    // Check if user is active
    if (!user.is_active) {
        throw new Error('Account is deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokens = generateTokens(user);

    // Cache user session
    await cacheUserSession(user.id, {
        userId: user.id,
        email: user.email,
        username: user.username,
        userType: user.userType
    });

    logger.info('User logged in', { userId: user.id, email });

    return { user, tokens };
}

async function refresh(refreshToken) {
    return await refreshAccessToken(refreshToken);
}

async function logout(userId) {
    // In a real implementation, you would add logic to invalidate the token
    // This could be done by maintaining a blacklist of tokens in Redis
    logger.info('User logged out', { userId });
}

async function forgotPassword(email) {
    // Find user by email
    const userQuery = await db.postgres.query(
        'SELECT id, email FROM users WHERE email = $1 AND is_active = true',
        [email]
    );

    if (userQuery.rows.length === 0) {
        // Don't reveal if email exists or not for security
        return;
    }

    const user = userQuery.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

    // TODO: Store reset token in database and send email
    logger.info('Password reset requested', { userId: user.id, email });
}

async function resetPassword(token, password) {
    // TODO: Verify reset token and expiry
    // This would involve checking the token against the database

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // TODO: Update user password in database
    logger.info('Password reset completed');
}

async function verifyEmail(token) {
    // TODO: Verify token and update email_verified status
    logger.info('Email verification completed');
}

module.exports = {
    initialize,
    register,
    login,
    refresh,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
};