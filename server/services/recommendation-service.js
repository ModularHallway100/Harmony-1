const { getDb } = require('../config/mongodb');

class RecommendationService {
  constructor() {
    this.db = getDb();
  }

  // Get collaborative filtering recommendations based on user listening history
  async getCollaborativeFilteringRecommendations(userId, limit = 10) {
    try {
      // Get users with similar listening patterns
      const userHistory = await this.db.collection('playHistory')
        .find({ userId })
        .toArray();

      if (userHistory.length === 0) {
        return []; // No history to base recommendations on
      }

      // Get tracks listened to by similar users
      const similarUserIds = await this.findSimilarUsers(userId);
      
      if (similarUserIds.length === 0) {
        return []; // No similar users found
      }

      const similarUserTracks = await this.db.collection('playHistory')
        .find({ userId: { $in: similarUserIds } })
        .toArray();

      // Count track occurrences across similar users
      const trackCounts = {};
      similarUserTracks.forEach(play => {
        if (play.trackId !== userId) { // Exclude user's own tracks
          trackCounts[play.trackId] = (trackCounts[play.trackId] || 0) + 1;
        }
      });

      // Sort by count and return top tracks
      const sortedTracks = Object.entries(trackCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit * 2); // Get more to allow for filtering

      // Get track details
      const trackIds = sortedTracks.map(([trackId]) => trackId);
      const tracks = await this.db.collection('tracks')
        .find({ id: { $in: trackIds } })
        .toArray();

      // Map back to counts and sort
      const recommendations = tracks
        .map(track => ({
          ...track,
          score: trackCounts[track.id] || 0
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return recommendations;
    } catch (error) {
      console.error('Error in collaborative filtering recommendations:', error);
      return [];
    }
  }

  // Find users with similar listening patterns
  async findSimilarUsers(userId, limit = 50) {
    try {
      // Get current user's track preferences
      const userHistory = await this.db.collection('playHistory')
        .find({ userId })
        .toArray();

      const userTrackIds = new Set(userHistory.map(play => play.trackId));

      if (userTrackIds.size === 0) {
        return [];
      }

      // Get other users who have listened to some of the same tracks
      const otherUsers = await this.db.collection('playHistory')
        .aggregate([
          { $match: { userId: { $ne: userId }, trackId: { $in: Array.from(userTrackIds) } } },
          { $group: { _id: '$userId', commonTracks: { $sum: 1 } } },
          { $match: { commonTracks: { $gte: 2 } } }, // At least 2 common tracks
          { $sort: { commonTracks: -1 } },
          { $limit: limit }
        ])
        .toArray();

      return otherUsers.map(user => user._id);
    } catch (error) {
      console.error('Error finding similar users:', error);
      return [];
    }
  }

  // Get content-based recommendations based on track attributes
  async getContentBasedRecommendations(userId, limit = 10) {
    try {
      // Get user's listening history
      const userHistory = await this.db.collection('playHistory')
        .find({ userId })
        .toArray();

      if (userHistory.length === 0) {
        return []; // No history to base recommendations on
      }

      // Extract preferred genres, artists, and other attributes
      const preferences = this.extractUserPreferences(userHistory);

      // Find tracks matching preferences
      const query = this.buildContentQuery(preferences);
      
      const recommendations = await this.db.collection('tracks')
        .find(query)
        .limit(limit * 2) // Get more to allow for diversity
        .toArray();

      // Score and sort recommendations
      const scoredRecommendations = recommendations.map(track => ({
        ...track,
        score: this.calculateContentScore(track, preferences)
      }));

      // Remove tracks user has already listened to
      const listenedTrackIds = new Set(userHistory.map(play => play.trackId));
      const filteredRecommendations = scoredRecommendations
        .filter(track => !listenedTrackIds.has(track.id))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return filteredRecommendations;
    } catch (error) {
      console.error('Error in content-based recommendations:', error);
      return [];
    }
  }

  // Extract user preferences from listening history
  extractUserPreferences(history) {
    const preferences = {
      genres: {},
      artists: {},
      moods: {},
      eras: {},
      totalPlays: history.length
    };

    history.forEach(play => {
      const track = play.track;
      
      // Genre preferences
      if (track.genre) {
        preferences.genres[track.genre] = (preferences.genres[track.genre] || 0) + 1;
      }
      
      // Artist preferences
      if (track.artistId) {
        preferences.artists[track.artistId] = (preferences.artists[track.artistId] || 0) + 1;
      }
      
      // Mood preferences (if available)
      if (track.mood) {
        preferences.moods[track.mood] = (preferences.moods[track.mood] || 0) + 1;
      }
      
      // Era preferences (if available)
      if (track.era) {
        preferences.eras[track.era] = (preferences.eras[track.era] || 0) + 1;
      }
    });

    return preferences;
  }

  // Build MongoDB query for content-based recommendations
  buildContentQuery(preferences) {
    const query = {};

    // Add genre preferences
    const topGenres = Object.entries(preferences.genres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    if (topGenres.length > 0) {
      query.genre = { $in: topGenres };
    }

    // Add artist preferences (optional)
    const topArtists = Object.entries(preferences.artists)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([artistId]) => artistId);

    if (topArtists.length > 0) {
      query.artistId = { $in: topArtists };
    }

    return query;
  }

  // Calculate content-based similarity score
  calculateContentScore(track, preferences) {
    let score = 0;

    // Genre score
    if (track.genre && preferences.genres[track.genre]) {
      score += preferences.genres[track.genre] * 0.4;
    }

    // Artist score
    if (track.artistId && preferences.artists[track.artistId]) {
      score += preferences.artists[track.artistId] * 0.3;
    }

    // Mood score (if available)
    if (track.mood && preferences.moods[track.mood]) {
      score += preferences.moods[track.mood] * 0.2;
    }

    // Era score (if available)
    if (track.era && preferences.eras[track.era]) {
      score += preferences.eras[track.era] * 0.1;
    }

    // Popularity boost
    if (track.popularity) {
      score += track.popularity * 0.05;
    }

    return score;
  }

  // Get hybrid recommendations combining collaborative and content-based
  async getHybridRecommendations(userId, limit = 10) {
    try {
      // Get both types of recommendations
      const collaborativeRecs = await this.getCollaborativeFilteringRecommendations(userId, limit * 2);
      const contentRecs = await this.getContentBasedRecommendations(userId, limit * 2);

      // Combine and deduplicate
      const allRecs = [...collaborativeRecs, ...contentRecs];
      const uniqueRecs = Array.from(
        new Map(allRecs.map(track => [track.id, track])).values()
      );

      // Score and sort
      const scoredRecs = uniqueRecs.map(track => ({
        ...track,
        hybridScore: this.calculateHybridScore(track, collaborativeRecs, contentRecs)
      }));

      return scoredRecs
        .sort((a, b) => b.hybridScore - a.hybridScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error in hybrid recommendations:', error);
      return [];
    }
  }

  // Calculate hybrid recommendation score
  calculateHybridScore(track, collaborativeRecs, contentRecs) {
    let score = 0;

    // Collaborative filtering score
    const cfItem = collaborativeRecs.find(rec => rec.id === track.id);
    if (cfItem) {
      score += cfItem.score * 0.6;
    }

    // Content-based score
    const cbItem = contentRecs.find(rec => rec.id === track.id);
    if (cbItem) {
      score += cbItem.score * 0.4;
    }

    return score;
  }

  // Get trending tracks for discovery
  async getTrendingRecommendations(limit = 10) {
    try {
      // Get tracks with high play counts recently
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const trendingTracks = await this.db.collection('tracks')
        .find({
          $or: [
            { playCount: { $gte: 1000 } },
            { recentPlays: { $gte: 100 } }
          ]
        })
        .sort({ playCount: -1, recentPlays: -1 })
        .limit(limit)
        .toArray();

      return trendingTracks;
    } catch (error) {
      console.error('Error getting trending recommendations:', error);
      return [];
    }
  }

  // Get diverse recommendations to prevent filter bubbles
  async getDiverseRecommendations(userId, limit = 10) {
    try {
      // Get user's current preferences
      const userHistory = await this.db.collection('playHistory')
        .find({ userId })
        .toArray();

      const preferences = this.extractUserPreferences(userHistory);
      
      // Get tracks from underrepresented genres/artists
      const query = this.buildDiverseQuery(preferences);
      
      const diverseTracks = await this.db.collection('tracks')
        .find(query)
        .limit(limit * 3) // Get more to allow for diversity filtering
        .toArray();

      // Score for diversity while maintaining some relevance
      const scoredTracks = diverseTracks.map(track => ({
        ...track,
        diversityScore: this.calculateDiversityScore(track, preferences)
      }));

      // Sort by diversity score and return top results
      return scoredTracks
        .sort((a, b) => b.diversityScore - a.diversityScore)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting diverse recommendations:', error);
      return [];
    }
  }

  // Build query for diverse recommendations
  buildDiverseQuery(preferences) {
    const query = {};

    // Find genres the user hasn't listened to much
    const allGenres = ['Electronic', 'Rock', 'Hip-Hop', 'Jazz', 'Classical', 'Pop', 'Country', 'R&B'];
    const underrepresentedGenres = allGenres.filter(
      genre => !preferences.genres[genre] || preferences.genres[genre] < 3
    );

    if (underrepresentedGenres.length > 0) {
      query.genre = { $in: underrepresentedGenres };
    }

    return query;
  }

  // Calculate diversity score
  calculateDiversityScore(track, preferences) {
    let score = 0;

    // Higher score for less common genres
    if (track.genre && (!preferences.genres[track.genre] || preferences.genres[track.genre] < 3)) {
      score += 0.7;
    }

    // Higher score for new artists
    if (track.artistId && (!preferences.artists[track.artistId] || preferences.artists[track.artistId] < 2)) {
      score += 0.3;
    }

    return score;
  }

  // Get personalized "Discover Weekly" playlist
  async getDiscoverWeekly(userId) {
    try {
      // Mix of different recommendation types
      const hybridRecs = await this.getHybridRecommendations(userId, 5);
      const trendingRecs = await this.getTrendingRecommendations(3);
      const diverseRecs = await this.getDiverseRecommendations(userId, 2);

      // Combine and deduplicate
      const allRecs = [...hybridRecs, ...trendingRecs, ...diverseRecs];
      const uniqueRecs = Array.from(
        new Map(allRecs.map(track => [track.id, track])).values()
      );

      return uniqueRecs.slice(0, 10); // Return 10 tracks
    } catch (error) {
      console.error('Error generating Discover Weekly:', error);
      return [];
    }
  }

  // Get "Release Radar" for new music
  async getReleaseRadar(userId) {
    try {
      // Get recent releases (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const recentReleases = await this.db.collection('tracks')
        .find({
          releaseDate: { $gte: thirtyDaysAgo }
        })
        .sort({ releaseDate: -1 })
        .limit(20)
        .toArray();

      // Filter out tracks user has already listened to
      const userHistory = await this.db.collection('playHistory')
        .find({ userId })
        .toArray();

      const listenedTrackIds = new Set(userHistory.map(play => play.trackId));
      
      return recentReleases
        .filter(track => !listenedTrackIds.has(track.id))
        .slice(0, 10);
    } catch (error) {
      console.error('Error generating Release Radar:', error);
      return [];
    }
  }
}

module.exports = new RecommendationService();