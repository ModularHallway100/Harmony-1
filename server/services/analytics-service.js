const { getDb } = require('../config/mongodb');

class AnalyticsService {
  constructor() {
    this.db = getDb();
    this.eventsCollection = this.db.collection('social_events');
  }

  async trackEvent(eventType, eventData) {
    try {
      const event = {
        type: eventType,
        data: eventData,
        timestamp: new Date(),
      };
      await this.eventsCollection.insertOne(event);
    } catch (error) {
      console.error('Error tracking analytics event:', error);
    }
  }

  async getEngagementStats(contentId) {
    const likes = await this.eventsCollection.countDocuments({ 'data.contentId': contentId, type: 'like' });
    const comments = await this.eventsCollection.countDocuments({ 'data.contentId': contentId, type: 'comment' });
    return { likes, comments };
  }

  async getUserEngagement(userId) {
    const likesGiven = await this.eventsCollection.countDocuments({ 'data.userId': userId, type: 'like' });
    const commentsMade = await this.eventsCollection.countDocuments({ 'data.userId': userId, type: 'comment' });
    return { likesGiven, commentsMade };
  }
}

module.exports = new AnalyticsService();