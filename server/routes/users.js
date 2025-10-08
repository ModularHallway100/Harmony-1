// User Routes for Harmony Music Platform
const express = require('express');
const { body, validationResult, query } = require('express-validator');
const {
    clerkAuthMiddleware,
    optionalClerkAuth,
    requireRole
} = require('../middleware/clerkAuth');
const { postgresConnection } = require('../config/postgres');
const { getCachedUserProfile, cacheUserProfile } = require('../../redis/config');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', clerkAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Try to get from cache first
        const cachedProfile = await getCachedUserProfile(userId);
        if (cachedProfile) {
            return res.json({
                success: true,
                data: cachedProfile
            });
        }

        // Get user profile from database
        const userQuery = await postgresConnection.query(
            `SELECT 
                u.id, u.email, u.username, u.full_name, u.avatar_url, u.bio, u.user_type, u.created_at,
                COUNT(DISTINCT a.id) as artist_count,
                COUNT(DISTINCT t.id) as track_count,
                COUNT(DISTINCT p.id) as playlist_count,
                COUNT(DISTINCT ul.track_id) as liked_tracks_count
            FROM users u
            LEFT JOIN artists a ON u.id = a.user_id
            LEFT JOIN tracks t ON u.id = t.artist_id
            LEFT JOIN playlists p ON u.id = p.user_id
            LEFT JOIN user_likes ul ON u.id = (SELECT user_id FROM user_likes WHERE track_id = t.id LIMIT 1)
            WHERE u.id = $1
            GROUP BY u.id`,
            [userId]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userProfile = userQuery.rows[0];

        // Cache the profile
        await cacheUserProfile(userId, userProfile);

        res.json({
            success: true,
            data: userProfile
        });
    } catch (error) {
        logger.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile'
        });
    }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', clerkAuthMiddleware, [
    body('fullName').optional().isLength({ max: 100 }).withMessage('Full name must be less than 100 characters'),
    body('bio').optional().isLength({ max: 1000 }).withMessage('Bio must be less than 1000 characters')
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const userId = req.user.id;
        const { fullName, bio, avatarUrl } = req.body;

        // Update user profile
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        if (fullName !== undefined) {
            updateFields.push(`full_name = $${paramIndex}`);
            updateValues.push(fullName);
            paramIndex++;
        }

        if (bio !== undefined) {
            updateFields.push(`bio = $${paramIndex}`);
            updateValues.push(bio);
            paramIndex++;
        }

        if (avatarUrl !== undefined) {
            updateFields.push(`avatar_url = $${paramIndex}`);
            updateValues.push(avatarUrl);
            paramIndex++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateValues.push(userId);

        const updateUserQuery = await postgresConnection.query(
            `UPDATE users 
             SET ${updateFields.join(', ')}
             WHERE id = $${paramIndex}
             RETURNING id, username, full_name, bio, avatar_url, updated_at`,
            updateValues
        );

        if (updateUserQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updatedUser = updateUserQuery.rows[0];

        // Invalidate cache
        // In a real implementation, you would clear the cached profile

        logger.info('User profile updated', { userId });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        logger.error('Update user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (public profile)
 * @access  Public
 */
router.get('/:id', optionalClerkAuth, [
    query('includeStats').optional().isBoolean().withMessage('includeStats must be a boolean')
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { includeStats = false } = req.query;

        // Get user public profile
        let userQuery;
        if (includeStats === 'true') {
            userQuery = await postgresConnection.query(
                `SELECT 
                    u.id, u.username, u.full_name, u.avatar_url, u.bio, u.user_type, u.created_at,
                    COUNT(DISTINCT a.id) as artist_count,
                    COUNT(DISTINCT t.id) as track_count,
                    COUNT(DISTINCT p.id) as playlist_count,
                    COUNT(DISTINCT uf.artist_id) as following_count,
                    COUNT(DISTINCT fl.user_id) as followers_count
                FROM users u
                LEFT JOIN artists a ON u.id = a.user_id
                LEFT JOIN tracks t ON u.id = t.artist_id
                LEFT JOIN playlists p ON u.id = p.user_id
                LEFT JOIN user_follows uf ON u.id = uf.user_id
                LEFT JOIN user_follows fl ON u.id = fl.artist_id
                WHERE u.id = $1 AND u.is_active = true
                GROUP BY u.id`,
                [id]
            );
        } else {
            userQuery = await postgresConnection.query(
                'SELECT id, username, full_name, avatar_url, bio, user_type, created_at FROM users WHERE id = $1 AND is_active = true',
                [id]
            );
        }

        if (userQuery.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const userProfile = userQuery.rows[0];

        // Check if current user is following this user (if authenticated)
        let isFollowing = false;
        if (req.user && req.user.id !== id) {
            const followQuery = await postgresConnection.query(
                'SELECT id FROM user_follows WHERE user_id = $1 AND artist_id = $2',
                [req.user.id, id]
            );
            isFollowing = followQuery.rows.length > 0;
        }

        res.json({
            success: true,
            data: {
                ...userProfile,
                isFollowing
            }
        });
    } catch (error) {
        logger.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user'
        });
    }
});

/**
 * @route   GET /api/users/:id/artists
 * @desc    Get artists created by a user
 * @access  Public
 */
router.get('/:id/artists', optionalClerkAuth, [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Check if user exists
        const userExists = await postgresConnection.query(
            'SELECT id FROM users WHERE id = $1 AND is_active = true',
            [id]
        );

        if (userExists.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get artists created by user
        const artistsQuery = await postgresConnection.query(
            `SELECT 
                a.id, a.name, a.bio, a.genre, a.profile_image_url, a.cover_image_url,
                a.follower_count, a.is_ai_artist, a.is_verified, a.created_at
            FROM artists a
            WHERE a.user_id = $1
            ORDER BY a.created_at DESC
            LIMIT $2 OFFSET $3`,
            [id, limit, offset]
        );

        // Get total count for pagination
        const countQuery = await postgresConnection.query(
            'SELECT COUNT(*) FROM artists WHERE user_id = $1',
            [id]
        );

        const total = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                artists: artistsQuery.rows,
                pagination: {
                    current: page,
                    total: totalPages,
                    count: total
                }
            }
        });
    } catch (error) {
        logger.error('Get user artists error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user artists'
        });
    }
});

/**
 * @route   GET /api/users/:id/playlists
 * @desc    Get playlists created by a user
 * @access  Public
 */
router.get('/:id/playlists', optionalClerkAuth, [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Check if user exists
        const userExists = await postgresConnection.query(
            'SELECT id FROM users WHERE id = $1 AND is_active = true',
            [id]
        );

        if (userExists.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get playlists created by user
        const playlistsQuery = await postgresConnection.query(
            `SELECT 
                p.id, p.title, p.description, p.cover_art_url, p.is_public, p.track_count, p.created_at
            FROM playlists p
            WHERE p.user_id = $1 AND p.is_public = true
            ORDER BY p.created_at DESC
            LIMIT $2 OFFSET $3`,
            [id, limit, offset]
        );

        // Get total count for pagination
        const countQuery = await postgresConnection.query(
            'SELECT COUNT(*) FROM playlists WHERE user_id = $1 AND is_public = true',
            [id]
        );

        const total = parseInt(countQuery.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: {
                playlists: playlistsQuery.rows,
                pagination: {
                    current: page,
                    total: totalPages,
                    count: total
                }
            }
        });
    } catch (error) {
        logger.error('Get user playlists error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user playlists'
        });
    }
});

/**
 * @route   DELETE /api/users/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', clerkAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // Start transaction
        await postgresConnection.transaction(async (client) => {
            // Delete user likes
            await client.query('DELETE FROM user_likes WHERE user_id = $1', [userId]);
            
            // Delete user follows
            await client.query('DELETE FROM user_follows WHERE user_id = $1', [userId]);
            
            // Delete playlists
            await client.query('DELETE FROM playlists WHERE user_id = $1', [userId]);
            
            // Delete artists (CASCADE will handle related tracks)
            await client.query('DELETE FROM artists WHERE user_id = $1', [userId]);
            
            // Delete user preferences
            await client.query('DELETE FROM user_preferences WHERE user_id = $1', [userId]);
            
            // Delete listening history
            await client.query('DELETE FROM listening_history WHERE user_id = $1', [userId]);
            
            // Delete comments
            await client.query('DELETE FROM comments WHERE user_id = $1', [userId]);
            
            // Delete comment likes
            await client.query('DELETE FROM comment_likes WHERE user_id = $1', [userId]);
            
            // Delete AI generations
            await client.query('DELETE FROM ai_generations WHERE user_id = $1', [userId]);
            
            // Delete user
            await client.query('DELETE FROM users WHERE id = $1', [userId]);
        });

        logger.info('User account deleted', { userId });

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        logger.error('Delete user account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account'
        });
    }
});

module.exports = router;