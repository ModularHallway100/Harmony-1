const analyticsService = require('./analytics-service');
const moderationService = require('./moderation-service');

let db;

function initialize(database) {
    db = database;
}

async function getFeed(userId) {
    // This is a simplified feed. A real implementation would have a more complex algorithm.
    const { rows } = await db.postgres.query(
        `SELECT c.*, u.username FROM comments c
         JOIN users u ON c.user_id = u.id
         ORDER BY c.created_at DESC LIMIT 20`
    );
    return rows;
}

async function getComments(contentId) {
    const { rows } = await db.postgres.query('SELECT * FROM comments WHERE track_id = $1 OR playlist_id = $1 OR artist_id = $1', [contentId]);
    return rows;
}

async function addComment(userId, { contentId, text, trackId, playlistId, artistId }) {
    const moderationResult = await moderationService.analyzeContent(text);
    if (!moderationResult.isAppropriate) {
        throw new Error(`Inappropriate content detected: ${moderationResult.reason}`);
    }

    if (!text) {
        throw new Error('Comment content is required');
    }
    if (!trackId && !playlistId && !artistId) {
        throw new Error('A comment must be associated with a track, playlist, or artist.');
    }

    const { rows } = await db.postgres.query(
        'INSERT INTO comments (user_id, content, track_id, playlist_id, artist_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, text, trackId, playlistId, artistId]
    );

    analyticsService.trackEvent('comment', { userId, contentId });
    return rows[0];
}

async function deleteComment(commentId, requestingUserId, canModerate) {
    const { rows } = await db.postgres.query('SELECT user_id FROM comments WHERE id = $1', [commentId]);
    if (rows.length === 0) {
        throw new Error('Comment not found');
    }

    const commentOwnerId = rows[0].user_id;
    if (commentOwnerId !== requestingUserId && !canModerate) {
        throw new Error('You do not have permission to delete this comment');
    }

    await db.postgres.query('DELETE FROM comments WHERE id = $1', [commentId]);
}


async function like(userId, contentId, contentType) {
    // This is a simplified like function. A real app would prevent duplicate likes.
    const { rows } = await db.postgres.query(
        'INSERT INTO likes (user_id, content_id, content_type) VALUES ($1, $2, $3) RETURNING *',
        [userId, contentId, contentType]
    );
    analyticsService.trackEvent('like', { userId, contentId, contentType });
    return rows[0];
}

async function unlike(userId, contentId) {
    await db.postgres.query('DELETE FROM likes WHERE user_id = $1 AND content_id = $2', [userId, contentId]);
}

async function follow(userId, artistId) {
    if (!artistId) {
        throw new Error('Artist ID is required');
    }

    const { rows } = await db.postgres.query(
        'INSERT INTO followers (user_id, artist_id) VALUES ($1, $2) ON CONFLICT (user_id, artist_id) DO NOTHING RETURNING *',
        [userId, artistId]
    );

    if (rows.length > 0) {
        analyticsService.trackEvent('follow', { followerId: userId, followingId: artistId });
    }

    return rows[0];
}

async function unfollow(userId, artistId) {
    await db.postgres.query('DELETE FROM followers WHERE user_id = $1 AND artist_id = $2', [userId, artistId]);
}


module.exports = {
    initialize,
    getFeed,
    getComments,
    addComment,
    deleteComment,
    like,
    unlike,
    follow,
    unfollow,
};