const { getDb } = require('../config/mongodb');

const BANNED_KEYWORDS = ['spam', 'scam', 'hate', 'violence', 'explicit', 'nsfw'];

class ModerationService {
  constructor() {
    this.db = getDb();
    this.reportsCollection = this.db.collection('reports');
  }

  async analyzeContent(text) {
    const lowerCaseText = text.toLowerCase();
    const hasBannedKeyword = BANNED_KEYWORDS.some(keyword => lowerCaseText.includes(keyword));

    if (hasBannedKeyword) {
      return {
        isAppropriate: false,
        reason: 'Contains banned keywords',
      };
    }

    return {
      isAppropriate: true,
    };
  }

  async reportContent(contentId, contentType, userId, reason) {
    try {
      const report = {
        contentId,
        contentType,
        reportedBy: userId,
        reason,
        timestamp: new Date(),
        status: 'pending',
      };
      await this.reportsCollection.insertOne(report);
      return report;
    } catch (error) {
      console.error('Error reporting content:', error);
      throw error;
    }
  }

  async getPendingReports() {
    return this.reportsCollection.find({ status: 'pending' }).toArray();
  }

  async reviewReport(reportId, status, reviewedBy) {
    return this.reportsCollection.updateOne(
      { _id: reportId },
      { $set: { status, reviewedBy, reviewedAt: new Date() } }
    );
  }
}

module.exports = new ModerationService();