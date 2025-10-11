const express = require('express');
const router = express.Router();
const musicService = require('../services/music-service');
const { authenticate } = require('../middleware/auth');
const { clerkAuthMiddleware } = require('../middleware/clerkAuth');
const {
    checkUsageLimit,
    incrementUsage,
    requireActiveSubscription,
    requireSubscriptionTier
} = require('../middleware/subscription-middleware');


// Get trending tracks
router.get('/trending', async (req, res, next) => {
    try {
        const tracks = await musicService.getTrendingTracks();
        res.json(tracks);
    } catch (error) {
        next(error);
    }
});

// Get latest tracks
router.get('/latest', async (req, res, next) => {
    try {
        const tracks = await musicService.getLatestTracks();
        res.json(tracks);
    } catch (error) {
        next(error);
    }
});

// Search for music
router.get('/search', async (req, res, next) => {
    try {
        const { q, type = 'all', limit = 10 } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        const results = await musicService.search(q, type, limit);
        res.json(results);
    } catch (error) {
        next(error);
    }
});

// Get track by ID
router.get('/tracks/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const track = await musicService.getTrackById(id);
        res.json(track);
    } catch (error) {
        next(error);
    }
});

// Get artist by ID
router.get('/artists/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const artist = await musicService.getArtistById(id);
        res.json(artist);
    } catch (error) {
        next(error);
    }
});

// Get playlist by ID
router.get('/playlists/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const playlist = await musicService.getPlaylistById(id);
        res.json(playlist);
    } catch (error) {
        next(error);
    }
});

// Create a new playlist
router.post('/playlists', clerkAuthMiddleware, requireActiveSubscription(), async (req, res, next) => {
    try {
        const newPlaylist = await musicService.createPlaylist(req.user.id, req.body);
        res.status(201).json(newPlaylist);
    } catch (error) {
        next(error);
    }
});

// Update a playlist
router.put('/playlists/:id', clerkAuthMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedPlaylist = await musicService.updatePlaylist(id, req.user.id, req.body);
        res.json(updatedPlaylist);
    } catch (error) {
        next(error);
    }
});

// Delete a playlist
router.delete('/playlists/:id', clerkAuthMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        await musicService.deletePlaylist(id, req.user.id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// Add track to playlist
router.post('/playlists/:id/tracks', clerkAuthMiddleware, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { trackId } = req.body;
        const updatedPlaylist = await musicService.addTrackToPlaylist(id, req.user.id, trackId);
        res.json(updatedPlaylist);
    } catch (error) {
        next(error);
    }
});

// Remove track from playlist
router.delete('/playlists/:id/tracks/:trackId', clerkAuthMiddleware, async (req, res, next) => {
    try {
        const { id, trackId } = req.params;
        const updatedPlaylist = await musicService.removeTrackFromPlaylist(id, req.user.id, trackId);
        res.json(updatedPlaylist);
    } catch (error) {
        next(error);
    }
});

// Get user's listening history
router.get('/history', clerkAuthMiddleware, async (req, res, next) => {
    try {
        const { limit } = req.query;
        const history = await musicService.getListeningHistory(req.user.id, limit);
        res.json(history);
    } catch (error) {
        next(error);
    }
});

// Add track to listening history
router.post('/history', clerkAuthMiddleware, async (req, res, next) => {
    try {
        const { trackId } = req.body;
        const historyEntry = await musicService.addTrackToHistory(req.user.id, trackId);
        res.status(201).json(historyEntry);
    } catch (error) {
        next(error);
    }
});


module.exports = (db) => {
    musicService.initialize(db);
    return router;
};