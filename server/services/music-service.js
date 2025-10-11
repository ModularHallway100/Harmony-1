// Music Service for Harmony Music Platform
const redis = require('redis');

let db;
let redisClient;

async function initialize(database) {
    db = database;
    redisClient = redis.createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
}

const TRENDING_TRACKS_CACHE_KEY = 'trending-tracks';
const LATEST_TRACKS_CACHE_KEY = 'latest-tracks';

async function getTrendingTracks() {
    const cachedTracks = await redisClient.get(TRENDING_TRACKS_CACHE_KEY);
    if (cachedTracks) return JSON.parse(cachedTracks);

    const { rows } = await db.postgres.query(
        'SELECT * FROM tracks ORDER BY play_count DESC LIMIT 10'
    );

    await redisClient.set(TRENDING_TRACKS_CACHE_KEY, JSON.stringify(rows), { EX: 60 * 5 }); // Cache for 5 minutes
    return rows;
}

async function getLatestTracks() {
    const cachedTracks = await redisClient.get(LATEST_TRACKS_CACHE_KEY);
    if (cachedTracks) return JSON.parse(cachedTracks);

    const { rows } = await db.postgres.query(
        'SELECT * FROM tracks ORDER BY created_at DESC LIMIT 10'
    );

    await redisClient.set(LATEST_TRACKS_CACHE_KEY, JSON.stringify(rows), { EX: 60 * 15 }); // Cache for 15 minutes
    return rows;
}

async function getTrackById(id) {
    const { rows } = await db.postgres.query('SELECT * FROM tracks WHERE id = $1', [id]);
    if (rows.length === 0) {
        throw new Error('Track not found');
    }
    // In a real application, you would handle play count increments more robustly
    await db.postgres.query('UPDATE tracks SET play_count = play_count + 1 WHERE id = $1', [id]);
    return rows[0];
}

async function search(query, type, limit) {
    // This is a simplified search. A real implementation would use a full-text search engine like Elasticsearch.
    const { rows } = await db.postgres.query(
        "SELECT id, title, 'track' as type FROM tracks WHERE title ILIKE $1 UNION ALL " +
        "SELECT id, name as title, 'artist' as type FROM artists WHERE name ILIKE $1",
        [`%${query}%`]
    );
    return rows;
}

async function getArtistById(id) {
    const { rows } = await db.postgres.query('SELECT * FROM artists WHERE id = $1', [id]);
    if (rows.length === 0) {
        throw new Error('Artist not found');
    }
    const { rows: tracks } = await db.postgres.query('SELECT * FROM tracks WHERE artist_id = $1', [id]);
    return { ...rows[0], tracks };
}

async function getPlaylistById(id) {
    const { rows } = await db.postgres.query('SELECT * FROM playlists WHERE id = $1', [id]);
    if (rows.length === 0) {
        throw new Error('Playlist not found');
    }
    const { rows: tracks } = await db.postgres.query('SELECT * FROM tracks WHERE id = ANY($1::uuid[])', [rows[0].track_ids]);
    return { ...rows[0], tracks };
}

async function createPlaylist(userId, { title, description, trackIds = [] }) {
    if (!title) {
        throw new Error('Playlist title is required');
    }
    const { rows } = await db.postgres.query(
        'INSERT INTO playlists (user_id, title, description, track_ids) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, title, description, trackIds]
    );
    return rows[0];
}

async function updatePlaylist(id, userId, { title, description, trackIds }) {
    const { rows } = await db.postgres.query('SELECT * FROM playlists WHERE id = $1 AND user_id = $2', [id, userId]);
    if (rows.length === 0) {
        throw new Error('Playlist not found or access denied');
    }

    const updateData = {
        title: title || rows[0].title,
        description: description || rows[0].description,
        track_ids: trackIds || rows[0].track_ids,
    };

    const { rows: updatedRows } = await db.postgres.query(
        'UPDATE playlists SET title = $1, description = $2, track_ids = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
        [updateData.title, updateData.description, updateData.track_ids, id]
    );
    return updatedRows[0];
}

async function deletePlaylist(id, userId) {
    const { rowCount } = await db.postgres.query('DELETE FROM playlists WHERE id = $1 AND user_id = $2', [id, userId]);
    if (rowCount === 0) {
        throw new Error('Playlist not found or access denied');
    }
}

async function addTrackToPlaylist(id, userId, trackId) {
    if (!trackId) {
        throw new Error('Track ID is required');
    }
    const { rows } = await db.postgres.query('SELECT * FROM playlists WHERE id = $1 AND user_id = $2', [id, userId]);
    if (rows.length === 0) {
        throw new Error('Playlist not found or access denied');
    }
    if (rows[0].track_ids.includes(trackId)) {
        throw new Error('Track already in playlist');
    }

    const { rows: updatedRows } = await db.postgres.query(
        'UPDATE playlists SET track_ids = array_append(track_ids, $1), updated_at = NOW() WHERE id = $2 RETURNING *',
        [trackId, id]
    );
    return updatedRows[0];
}

async function removeTrackFromPlaylist(id, userId, trackId) {
    const { rows } = await db.postgres.query('SELECT * FROM playlists WHERE id = $1 AND user_id = $2', [id, userId]);
    if (rows.length === 0) {
        throw new Error('Playlist not found or access denied');
    }

    const { rows: updatedRows } = await db.postgres.query(
        'UPDATE playlists SET track_ids = array_remove(track_ids, $1), updated_at = NOW() WHERE id = $2 RETURNING *',
        [trackId, id]
    );
    return updatedRows[0];
}

async function getListeningHistory(userId, limit = 50) {
    const { rows } = await db.postgres.query(
        'SELECT * FROM listening_history WHERE user_id = $1 ORDER BY played_at DESC LIMIT $2',
        [userId, limit]
    );
    return rows;
}

async function addTrackToHistory(userId, trackId) {
    if (!trackId) {
        throw new Error('Track ID is required');
    }
    const { rows } = await db.postgres.query('SELECT * FROM tracks WHERE id = $1', [trackId]);
    if (rows.length === 0) {
        throw new Error('Track not found');
    }

    const { rows: historyRows } = await db.postgres.query(
        'INSERT INTO listening_history (user_id, track_id) VALUES ($1, $2) RETURNING *',
        [userId, trackId]
    );
    return historyRows[0];
}


module.exports = {
    initialize,
    getTrendingTracks,
    getLatestTracks,
    getTrackById,
    search,
    getArtistById,
    getPlaylistById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    getListeningHistory,
    addTrackToHistory,
};