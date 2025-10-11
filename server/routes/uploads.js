const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { clerkAuthMiddleware } = require('../middleware/clerkAuth');
const { 
    checkUsageLimit, 
    incrementUsage, 
    requireSubscriptionTier,
    requireCreatorRole
} = require('../middleware/subscription-middleware');
const subscriptionService = require('../services/subscription-service');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/tracks');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept audio files only
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'), false);
        }
    }
});

// All upload routes require authentication
router.use(clerkAuthMiddleware);

/**
 * @route   GET /api/uploads/usage
 * @desc    Get user's upload usage
 * @access  Private
 */
router.get('/usage', async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get track upload usage
        const usage = await subscriptionService.getUserUsage(userId, 'track_uploads');
        
        // Get limit information
        const limitInfo = await subscriptionService.checkUsageLimit(userId, 'track_uploads');
        
        res.json({
            success: true,
            data: {
                metricType: 'track_uploads',
                usage,
                limit: limitInfo.limit,
                remaining: limitInfo.remaining
            }
        });
    } catch (error) {
        logger.error('Get upload usage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get upload usage'
        });
    }
});

/**
 * @route   POST /api/uploads/tracks
 * @desc    Upload a new track
 * @access  Private
 */
router.post('/tracks', 
    upload.single('audio'),
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('artistId').notEmpty().withMessage('Artist ID is required'),
        body('genre').optional().isString().withMessage('Genre must be a string'),
        body('description').optional().isString().withMessage('Description must be a string'),
        body('isPublic').optional().isBoolean().withMessage('Is public must be a boolean')
    ],
    async (req, res) => {
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

            // Check if file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Audio file is required'
                });
            }

            const userId = req.user.id;
            const { title, artistId, genre, description, isPublic = true } = req.body;

            // Check upload limit
            const limitInfo = await subscriptionService.checkUsageLimit(userId, 'track_uploads');
            
            if (limitInfo.used >= limitInfo.limit && limitInfo.limit > 0) {
                // Clean up uploaded file if limit reached
                const fs = require('fs');
                fs.unlinkSync(req.file.path);
                
                return res.status(403).json({
                    success: false,
                    message: `You have reached your track upload limit of ${limitInfo.limit} tracks per month`,
                    data: {
                        used: limitInfo.used,
                        limit: limitInfo.limit,
                        remaining: 0
                    }
                });
            }

            // Create track record
            const trackData = {
                title,
                artistId,
                genre,
                description,
                isPublic: isPublic === 'true',
                audioUrl: `/uploads/tracks/${req.file.filename}`,
                duration: 0, // Will be calculated after upload
                userId // For tracking purposes
            };

            // In a real implementation, you would:
            // 1. Process the audio file (extract metadata, generate waveform, etc.)
            // 2. Store in cloud storage (AWS S3, etc.)
            // 3. Create track record in database
            
            // For now, we'll simulate the track creation
            logger.info('Track uploaded', { 
                userId, 
                title, 
                artistId, 
                filename: req.file.filename 
            });

            // Mark operation as successful for incrementUsage middleware
            res.locals.operationSuccess = true;

            res.status(201).json({
                success: true,
                message: 'Track uploaded successfully',
                data: {
                    ...trackData,
                    id: `track-${Date.now()}`, // Simulated ID
                    uploadUrl: req.file.path
                }
            });
        } catch (error) {
            logger.error('Upload track error:', error);
            
            // Clean up uploaded file if error occurred
            if (req.file) {
                const fs = require('fs');
                try {
                    fs.unlinkSync(req.file.path);
                } catch (cleanupError) {
                    logger.error('Error cleaning up uploaded file:', cleanupError);
                }
            }
            
            res.status(500).json({
                success: false,
                message: 'Failed to upload track'
            });
        }
    }
);

/**
 * @route   POST /api/uploads/tracks/batch
 * @desc    Upload multiple tracks (Creator tier only)
 * @access  Private
 */
router.post('/tracks/batch',
    requireSubscriptionTier('creator'),
    upload.array('audio', 10), // Allow up to 10 files in a single request
    [
        body('artistId').notEmpty().withMessage('Artist ID is required'),
        body('isPublic').optional().isBoolean().withMessage('Is public must be a boolean')
    ],
    async (req, res) => {
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

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one audio file is required'
                });
            }

            const userId = req.user.id;
            const { artistId, isPublic = true } = req.body;
            const uploadedTracks = [];

            // Check if batch upload would exceed limit
            const currentUsage = await subscriptionService.getUserUsage(userId, 'track_uploads');
            const wouldExceed = currentUsage + req.files.length > 200; // Creator limit
            
            if (wouldExceed) {
                // Clean up uploaded files
                const fs = require('fs');
                req.files.forEach(file => {
                    try {
                        fs.unlinkSync(file.path);
                    } catch (cleanupError) {
                        logger.error('Error cleaning up uploaded file:', cleanupError);
                    }
                });
                
                return res.status(403).json({
                    success: false,
                    message: `Batch upload would exceed your monthly track limit of 200 tracks`,
                    data: {
                        currentUsage,
                        requested: req.files.length,
                        limit: 200,
                        remaining: 200 - currentUsage
                    }
                });
            }

            // Process each file
            for (const file of req.files) {
                try {
                    const trackData = {
                        title: path.parse(file.originalname).name, // Use filename as title
                        artistId,
                        isPublic: isPublic === 'true',
                        audioUrl: `/uploads/tracks/${file.filename}`,
                        duration: 0, // Will be calculated after upload
                        userId
                    };

                    // In a real implementation, you would:
                    // 1. Process the audio file
                    // 2. Store in cloud storage
                    // 3. Create track record in database
                    
                    logger.info('Batch track uploaded', { 
                        userId, 
                        title: trackData.title, 
                        artistId, 
                        filename: file.filename 
                    });

                    uploadedTracks.push({
                        ...trackData,
                        id: `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Simulated ID
                        uploadUrl: file.path
                    });
                } catch (fileError) {
                    logger.error('Error processing batch file:', fileError);
                    
                    // Clean up this file
                    const fs = require('fs');
                    try {
                        fs.unlinkSync(file.path);
                    } catch (cleanupError) {
                        logger.error('Error cleaning up batch file:', cleanupError);
                    }
                }
            }

            // Mark operation as successful for incrementUsage middleware
            res.locals.operationSuccess = true;

            res.status(201).json({
                success: true,
                message: `${uploadedTracks.length} tracks uploaded successfully`,
                data: {
                    uploadedTracks,
                    totalUploaded: uploadedTracks.length
                }
            });
        } catch (error) {
            logger.error('Batch upload error:', error);
            
            // Clean up uploaded files if error occurred
            if (req.files) {
                const fs = require('fs');
                req.files.forEach(file => {
                    try {
                        fs.unlinkSync(file.path);
                    } catch (cleanupError) {
                        logger.error('Error cleaning up batch file:', cleanupError);
                    }
                });
            }
            
            res.status(500).json({
                success: false,
                message: 'Failed to upload tracks'
            });
        }
    }
);

/**
 * @route   GET /api/uploads/storage
 * @desc    Get user's storage usage
 * @access  Private
 */
router.get('/storage', async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get storage usage (this would be implemented in a real system)
        // For now, we'll return simulated data
        const usage = {
            used: 45.2, // MB
            total: 1000, // MB (Creator tier limit)
            remaining: 954.8
        };
        
        res.json({
            success: true,
            data: usage
        });
    } catch (error) {
        logger.error('Get storage usage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get storage usage'
        });
    }
});

/**
 * @route   POST /api/uploads/storage/purchase
 * @desc    Purchase additional storage capacity
 * @access  Private
 */
router.post('/storage/purchase', [
    body('capacity').isInt({ min: 100 }).withMessage('Capacity must be at least 100MB'),
    body('paymentMethodId').notEmpty().withMessage('Payment method ID is required')
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
        const { capacity, paymentMethodId } = req.body;

        // In a real implementation, you would:
        // 1. Process payment
        // 2. Update user's storage capacity
        // 3. Record the purchase
        
        logger.info('Storage capacity purchased', { userId, capacity, paymentMethodId });

        res.status(201).json({
            success: true,
            message: `${capacity}MB storage capacity purchased successfully`,
            data: {
                capacity,
                paymentMethodId,
                effectiveDate: new Date().toISOString()
            }
        });
    } catch (error) {
        logger.error('Purchase storage error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to purchase storage capacity'
        });
    }
});

module.exports = router;