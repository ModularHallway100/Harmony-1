const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/clerkAuth');
const { pool } = require('../config/postgres');
const { getDb } = require('../config/mongodb');

// Get trending tracks
router.get('/trending', async (req, res) => {
  try {
    const db = getDb();
    const tracks = await db.collection('tracks')
      .find({})
      .sort({ playCount: -1 })
      .limit(10)
      .toArray();
    
    res.json({ success: true, data: tracks });
  } catch (error) {
    console.error('Error fetching trending tracks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch trending tracks' });
  }
});

// Get latest tracks
router.get('/latest', async (req, res) => {
  try {
    const db = getDb();
    const tracks = await db.collection('tracks')
      .find({})
      .sort({ releaseDate: -1 })
      .limit(10)
      .toArray();
    
    res.json({ success: true, data: tracks });
  } catch (error) {
    console.error('Error fetching latest tracks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch latest tracks' });
  }
});

// Get recommended tracks for a user
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const db = getDb();
    
    // Get user's listening history and preferences
    const userHistory = await db.collection('playHistory')
      .find({ userId })
      .sort({ playedAt: -1 })
      .limit(50)
      .toArray();
    
    // Extract genres and artists from user history
    const genres = new Set();
    const artists = new Set();
    
    userHistory.forEach(play => {
      if (play.track.genre) genres.add(play.track.genre);
      if (play.track.artistId) artists.add(play.track.artistId);
    });
    
    // Get recommendations based on user's preferences
    const recommendations = await db.collection('tracks')
      .find({
        $or: [
          { genre: { $in: Array.from(genres) } },
          { artistId: { $in: Array.from(artists) } }
        ]
      })
      .limit(20)
      .toArray();
    
    // Shuffle recommendations for variety
    const shuffled = recommendations.sort(() => 0.5 - Math.random());
    
    res.json({ success: true, data: shuffled.slice(0, 10) });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
  }
});

// Search for music
router.get('/search', async (req, res) => {
  try {
    const { query, type = 'all', limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }
    
    const db = getDb();
    const searchRegex = new RegExp(query, 'i');
    
    const results = {
      tracks: [],
      artists: [],
      playlists: []
    };
    
    // Search tracks
    if (type === 'all' || type === 'tracks') {
      results.tracks = await db.collection('tracks')
        .find({
          $or: [
            { title: searchRegex },
            { artistId: searchRegex }
          ]
        })
        .limit(limit)
        .toArray();
    }
    
    // Search artists
    if (type === 'all' || type === 'artists') {
      results.artists = await db.collection('artists')
        .find({
          $or: [
            { name: searchRegex },
            { bio: searchRegex }
          ]
        })
        .limit(limit)
        .toArray();
    }
    
    // Search playlists
    if (type === 'all' || type === 'playlists') {
      results.playlists = await db.collection('playlists')
        .find({
          $or: [
            { title: searchRegex },
            { description: searchRegex }
          ]
        })
        .limit(limit)
        .toArray();
    }
    
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Error searching music:', error);
    res.status(500).json({ success: false, error: 'Failed to search music' });
  }
});

// Get track by ID
router.get('/tracks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    const track = await db.collection('tracks').findOne({ id });
    
    if (!track) {
      return res.status(404).json({ success: false, error: 'Track not found' });
    }
    
    // Increment play count
    await db.collection('tracks').updateOne(
      { id },
      { $inc: { playCount: 1 } }
    );
    
    res.json({ success: true, data: track });
  } catch (error) {
    console.error('Error fetching track:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch track' });
  }
});

// Get artist by ID
router.get('/artists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    const artist = await db.collection('artists').findOne({ id });
    
    if (!artist) {
      return res.status(404).json({ success: false, error: 'Artist not found' });
    }
    
    // Get artist's tracks
    const tracks = await db.collection('tracks')
      .find({ artistId: id })
      .toArray();
    
    res.json({ success: true, data: { ...artist, tracks } });
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch artist' });
  }
});

// Get playlist by ID
router.get('/playlists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    
    const playlist = await db.collection('playlists').findOne({ id });
    
    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found' });
    }
    
    // Get playlist tracks
    const tracks = await db.collection('tracks')
      .find({ id: { $in: playlist.trackIds } })
      .toArray();
    
    res.json({ success: true, data: { ...playlist, tracks } });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch playlist' });
  }
});

// Create a new playlist
router.post('/playlists', auth, async (req, res) => {
  try {
    const { title, description, trackIds = [] } = req.body;
    const userId = req.user.id;
    
    if (!title) {
      return res.status(400).json({ success: false, error: 'Playlist title is required' });
    }
    
    const db = getDb();
    
    // Verify all track IDs exist
    const tracks = await db.collection('tracks')
      .find({ id: { $in: trackIds } })
      .toArray();
    
    if (tracks.length !== trackIds.length) {
      return res.status(400).json({ success: false, error: 'One or more tracks not found' });
    }
    
    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      title,
      description,
      trackIds,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('playlists').insertOne(newPlaylist);
    
    res.json({ success: true, data: newPlaylist });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({ success: false, error: 'Failed to create playlist' });
  }
});

// Update a playlist
router.put('/playlists/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, trackIds } = req.body;
    const userId = req.user.id;
    
    const db = getDb();
    
    // Check if playlist exists and user owns it
    const playlist = await db.collection('playlists').findOne({ id, userId });
    
    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found or access denied' });
    }
    
    // Verify all track IDs exist if provided
    let updatedTrackIds = trackIds;
    if (trackIds) {
      const tracks = await db.collection('tracks')
        .find({ id: { $in: trackIds } })
        .toArray();
      
      if (tracks.length !== trackIds.length) {
        return res.status(400).json({ success: false, error: 'One or more tracks not found' });
      }
    }
    
    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(trackIds && { trackIds: updatedTrackIds }),
      updatedAt: new Date()
    };
    
    await db.collection('playlists').updateOne(
      { id },
      { $set: updateData }
    );
    
    const updatedPlaylist = await db.collection('playlists').findOne({ id });
    
    res.json({ success: true, data: updatedPlaylist });
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ success: false, error: 'Failed to update playlist' });
  }
});

// Delete a playlist
router.delete('/playlists/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const db = getDb();
    
    // Check if playlist exists and user owns it
    const playlist = await db.collection('playlists').findOne({ id, userId });
    
    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found or access denied' });
    }
    
    await db.collection('playlists').deleteOne({ id });
    
    res.json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ success: false, error: 'Failed to delete playlist' });
  }
});

// Add track to playlist
router.post('/playlists/:id/tracks', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { trackId } = req.body;
    const userId = req.user.id;
    
    if (!trackId) {
      return res.status(400).json({ success: false, error: 'Track ID is required' });
    }
    
    const db = getDb();
    
    // Check if playlist exists and user owns it
    const playlist = await db.collection('playlists').findOne({ id, userId });
    
    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found or access denied' });
    }
    
    // Check if track exists
    const track = await db.collection('tracks').findOne({ id: trackId });
    
    if (!track) {
      return res.status(404).json({ success: false, error: 'Track not found' });
    }
    
    // Check if track is already in playlist
    if (playlist.trackIds.includes(trackId)) {
      return res.status(400).json({ success: false, error: 'Track already in playlist' });
    }
    
    await db.collection('playlists').updateOne(
      { id },
      { 
        $push: { trackIds: trackId },
        $set: { updatedAt: new Date() }
      }
    );
    
    const updatedPlaylist = await db.collection('playlists').findOne({ id });
    
    res.json({ success: true, data: updatedPlaylist });
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    res.status(500).json({ success: false, error: 'Failed to add track to playlist' });
  }
});

// Remove track from playlist
router.delete('/playlists/:id/tracks/:trackId', auth, async (req, res) => {
  try {
    const { id, trackId } = req.params;
    const userId = req.user.id;
    
    const db = getDb();
    
    // Check if playlist exists and user owns it
    const playlist = await db.collection('playlists').findOne({ id, userId });
    
    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Playlist not found or access denied' });
    }
    
    await db.collection('playlists').updateOne(
      { id },
      { 
        $pull: { trackIds: trackId },
        $set: { updatedAt: new Date() }
      }
    );
    
    const updatedPlaylist = await db.collection('playlists').findOne({ id });
    
    res.json({ success: true, data: updatedPlaylist });
  } catch (error) {
    console.error('Error removing track from playlist:', error);
    res.status(500).json({ success: false, error: 'Failed to remove track from playlist' });
  }
});

// Get user's listening history
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50 } = req.query;
    
    const db = getDb();
    
    const history = await db.collection('playHistory')
      .find({ userId })
      .sort({ playedAt: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching listening history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch listening history' });
  }
});

// Add track to listening history
router.post('/history', auth, async (req, res) => {
  try {
    const { trackId } = req.body;
    const userId = req.user.id;
    
    if (!trackId) {
      return res.status(400).json({ success: false, error: 'Track ID is required' });
    }
    
    const db = getDb();
    
    // Get track details
    const track = await db.collection('tracks').findOne({ id: trackId });
    
    if (!track) {
      return res.status(404).json({ success: false, error: 'Track not found' });
    }
    
    const historyEntry = {
      userId,
      trackId,
      track,
      playedAt: new Date()
    };
    
    await db.collection('playHistory').insertOne(historyEntry);
    
    // Keep only last 1000 entries per user
    await db.collection('playHistory').deleteMany({
      userId,
      playedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Older than 30 days
    });
    
    res.json({ success: true, data: historyEntry });
  } catch (error) {
    console.error('Error adding to listening history:', error);
    res.status(500).json({ success: false, error: 'Failed to add to listening history' });
  }
});

module.exports = router;