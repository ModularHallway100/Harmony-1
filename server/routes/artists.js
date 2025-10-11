const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const artistService = require('../services/artist-service');
const { validate } = require('../middleware/validation');
const { body, query } = require('express-validator');

// Rate limiting middleware
const rateLimiter = require('../utils/rate-limiter');

// GET /api/artists/:id - Get a specific artist
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        const artist = await artistService.getArtistById(id, userId);
        res.json(artist);
    } catch (error) {
        next(error);
    }
});

// POST /api/artists - Create a new artist
router.post('/', authenticate, rateLimiter('artist-create', 10), [
    body('name').notEmpty().withMessage('Artist name is required'),
    body('genre').notEmpty().withMessage('Genre is required'),
    body('is_ai_artist').optional().isBoolean().withMessage('is_ai_artist must be a boolean'),
    body('details').optional().isObject().withMessage('details must be an object'),
    body('details.personalityTraits').optional().isArray().withMessage('personalityTraits must be an array'),
    body('details.visualStyle').optional().notEmpty().withMessage('visualStyle must not be empty'),
    body('details.speakingStyle').optional().notEmpty().withMessage('speakingStyle must not be empty'),
    body('autoGenerateImage').optional().isBoolean().withMessage('autoGenerateImage must be a boolean'),
], validate, async (req, res, next) => {
    try {
        const { userId } = req;
        const newArtist = await artistService.createArtist(userId, req.body);
        res.status(201).json(newArtist);
    } catch (error) {
        next(error);
    }
});

// PUT /api/artists/:id - Update an artist
router.put('/:id', authenticate, rateLimiter('artist-update', 10), [
    body('name').optional().notEmpty().withMessage('Artist name must not be empty'),
    body('bio').optional().notEmpty().withMessage('Bio must not be empty'),
    body('genre').optional().notEmpty().withMessage('Genre must not be empty'),
    body('regenerateImage').optional().isBoolean().withMessage('regenerateImage must be a boolean'),
    body('visualStyle').optional().notEmpty().withMessage('visualStyle must not be empty'),
], validate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        const updatedArtist = await artistService.updateArtist(id, userId, req.body);
        res.json(updatedArtist);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/artists/:id - Delete an artist
router.delete('/:id', authenticate, rateLimiter('artist-delete', 5), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        await artistService.deleteArtist(id, userId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// POST /api/artists/:id/generate-image-variations - Generate image variations for an AI artist
router.post('/:id/generate-image-variations', authenticate, rateLimiter('artist-image-variations', 3), [
    body('variationCount').optional().isInt({ min: 1, max: 10 }).withMessage('Variation count must be between 1 and 10'),
    body('providers').optional().isArray().withMessage('Providers must be an array'),
], validate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        const { variationCount, providers, ...options } = req.body;
        const result = await artistService.generateArtistImageVariations(id, userId, {
            variationCount,
            providers,
            ...options
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// GET /api/artists/:id/images - Get all images for an AI artist
router.get('/:id/images', authenticate, rateLimiter('artist-images', 10), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req;
        const images = await artistService.getArtistImages(id, userId);
        res.json(images);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/artists/:id/images/:imageId - Delete a specific artist image
router.delete('/:id/images/:imageId', authenticate, rateLimiter('artist-image-delete', 5), async (req, res, next) => {
    try {
        const { id, imageId } = req.params;
        const { userId } = req;
        const result = await artistService.deleteArtistImage(id, userId, imageId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = (db) => {
    artistService.initialize(db);
    return router;
};