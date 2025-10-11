const { getDb } = require('../config/mongodb');

class RealtimeService {
  constructor(io) {
    this.io = io;
    this.db = getDb();
    this.activeUsers = new Map(); // userId -> socketId
    this.nowPlaying = new Map(); // userId -> track
  }

  // Initialize real-time service
  init() {
    // Handle user connection
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Register user
      socket.on('registerUser', (userId) => {
        this.activeUsers.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
        
        // Join user-specific room
        socket.join(`user-${userId}`);
        
        // Send current now playing status if available
        if (this.nowPlaying.has(userId)) {
          socket.emit('nowPlaying', this.nowPlaying.get(userId));
        }
      });

      // Handle user disconnection
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Find and remove user from active users
        for (const [userId, socketId] of this.activeUsers.entries()) {
          if (socketId === socket.id) {
            this.activeUsers.delete(userId);
            console.log(`User ${userId} unregistered`);
            break;
          }
        }
      });

      // Handle track play
      socket.on('playTrack', (data) => {
        const { userId, track, progress } = data;
        this.nowPlaying.set(userId, { track, progress, isPlaying: true });
        
        // Emit to user's room
        this.io.to(`user-${userId}`).emit('nowPlaying', { track, progress, isPlaying: true });
        
        // Emit to global room for friends/followers
        this.io.to('global').emit('userPlaying', { userId, track, progress, isPlaying: true });
      });

      // Handle track pause
      socket.on('pauseTrack', (data) => {
        const { userId, progress } = data;
        const currentTrack = this.nowPlaying.get(userId);
        
        if (currentTrack) {
          this.nowPlaying.set(userId, { ...currentTrack, progress, isPlaying: false });
          
          // Emit to user's room
          this.io.to(`user-${userId}`).emit('nowPlaying', { 
            track: currentTrack.track, 
            progress, 
            isPlaying: false 
          });
          
          // Emit to global room
          this.io.to('global').emit('userPlaying', { 
            userId, 
            track: currentTrack.track, 
            progress, 
            isPlaying: false 
          });
        }
      });

      // Handle track seek
      socket.on('seekTrack', (data) => {
        const { userId, progress } = data;
        const currentTrack = this.nowPlaying.get(userId);
        
        if (currentTrack) {
          this.nowPlaying.set(userId, { ...currentTrack, progress });
          
          // Emit to user's room
          this.io.to(`user-${userId}`).emit('nowPlaying', { 
            track: currentTrack.track, 
            progress, 
            isPlaying: currentTrack.isPlaying 
          });
          
          // Emit to global room
          this.io.to('global').emit('userPlaying', { 
            userId, 
            track: currentTrack.track, 
            progress, 
            isPlaying: currentTrack.isPlaying 
          });
        }
      });

      // Handle track end
      socket.on('trackEnd', (data) => {
        const { userId } = data;
        this.nowPlaying.delete(userId);
        
        // Emit to user's room
        this.io.to(`user-${userId}`).emit('trackEnded');
        
        // Emit to global room
        this.io.to('global').emit('userTrackEnded', { userId });
      });

      // Handle queue update
      socket.on('queueUpdate', (data) => {
        const { userId, queue } = data;
        
        // Emit to user's room
        this.io.to(`user-${userId}`).emit('queueUpdated', { queue });
      });

      // Handle like/unlike track
      socket.on('toggleLike', (data) => {
        const { userId, trackId, isLiked } = data;
        
        // Emit to global room
        this.io.to('global').emit('userLikedTrack', { userId, trackId, isLiked });
      });

      // Handle follow/unfollow artist
      socket.on('toggleFollow', (data) => {
        const { userId, artistId, isFollowing } = data;
        
        // Emit to global room
        this.io.to('global').emit('userFollowedArtist', { userId, artistId, isFollowing });
      });

      // Join global room (for public updates)
      socket.on('joinGlobal', () => {
        socket.join('global');
        console.log(`Socket ${socket.id} joined global room`);
      });

      // Leave global room
      socket.on('leaveGlobal', () => {
        socket.leave('global');
        console.log(`Socket ${socket.id} left global room`);
      });

      // Social notifications
      socket.on('newComment', (data) => {
        const { contentId, comment } = data;
        this.io.to(`content-${contentId}`).emit('newComment', comment);
      });

      socket.on('likeContent', (data) => {
        const { contentId, userId } = data;
        this.io.to(`content-${contentId}`).emit('userLiked', { contentId, userId });
      });

      socket.on('followUser', (data) => {
        const { followedId, followerId } = data;
        this.io.to(`user-${followedId}`).emit('newFollower', { followerId });
      });

      // Join content-specific room
      socket.on('joinContentRoom', (contentId) => {
        socket.join(`content-${contentId}`);
        console.log(`Socket ${socket.id} joined content room ${contentId}`);
      });

      // Leave content-specific room
      socket.on('leaveContentRoom', (contentId) => {
        socket.leave(`content-${contentId}`);
        console.log(`Socket ${socket.id} left content room ${contentId}`);
      });
    });
  }

  // Broadcast new track release to all users
  broadcastNewTrack(track) {
    this.io.to('global').emit('newTrack', track);
  }

  // Broadcast new playlist to all users
  broadcastNewPlaylist(playlist) {
    this.io.to('global').emit('newPlaylist', playlist);
  }

  // Broadcast trending updates
  broadcastTrendingUpdate(trendingTracks) {
    this.io.to('global').emit('trendingUpdated', trendingTracks);
  }

  // Send notification to specific user
  sendNotification(userId, notification) {
    this.io.to(`user-${userId}`).emit('notification', notification);
  }

  // Get currently playing status for a user
  getNowPlaying(userId) {
    return this.nowPlaying.get(userId);
  }

  // Get all active users
  getActiveUsers() {
    return Array.from(this.activeUsers.keys());
  }

  // Check if user is currently playing music
  isUserPlaying(userId) {
    const nowPlaying = this.nowPlaying.get(userId);
    return nowPlaying ? nowPlaying.isPlaying : false;
  }

  // Get currently playing tracks for all users
  getAllNowPlaying() {
    const result = {};
    
    for (const [userId, data] of this.nowPlaying.entries()) {
      result[userId] = data;
    }
    
    return result;
  }
}

module.exports = RealtimeService;