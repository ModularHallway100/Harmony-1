const express = require('express');
const router = express.Router();
const socialService = require('../services/social-service');
const { clerkAuth } = require('../middleware/clerkAuth');
const { canModerate } = require('../middleware/socialAuth');

// GET /api/social/feed - Get user's social feed
router.get('/feed', clerkAuth, async (req, res, next) => {
    try {
        const feed = await socialService.getFeed(req.auth.userId);
        res.json(feed);
    } catch (error) {
        next(error);
    }
});

// GET /api/social/comments/:contentId - Get comments for a piece of content
router.get('/comments/:contentId', async (req, res, next) => {
    try {
        const comments = await socialService.getComments(req.params.contentId);
        res.json(comments);
    } catch (error) {
        next(error);
    }
});

// POST /api/social/comments - Post a new comment
router.post('/comments', clerkAuth, async (req, res, next) => {
    try {
        const newComment = await socialService.addComment(req.auth.userId, req.body);
        res.status(201).json(newComment);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/social/comments/:commentId - Delete a comment
router.delete('/comments/:commentId', clerkAuth, canModerate, async (req, res, next) => {
    try {
        await socialService.deleteComment(req.params.commentId, req.auth.userId, req.user.canModerate);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// POST /api/social/like - Like a piece of content
router.post('/like', clerkAuth, async (req, res, next) => {
    try {
        const { contentId, contentType } = req.body;
        const like = await socialService.like(req.auth.userId, contentId, contentType);
        res.status(201).json(like);
    } catch (error) {
        next(error);
    }
});

// POST /api/social/unlike - Unlike a piece of content
router.post('/unlike', clerkAuth, async (req, res, next) => {
    try {
        const { contentId } = req.body;
        await socialService.unlike(req.auth.userId, contentId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});


// POST /api/social/follow - Follow an artist
router.post('/follow', clerkAuth, async (req, res, next) => {
    try {
        const { artistId } = req.body;
        await socialService.follow(req.auth.userId, artistId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// POST /api/social/unfollow - Unfollow an artist
router.post('/unfollow', clerkAuth, async (req, res, next) => {
    try {
        const { artistId } = req.body;
        await socialService.unfollow(req.auth.userId, artistId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});


module.exports = (db) => {
    socialService.initialize(db);
    return router;
};