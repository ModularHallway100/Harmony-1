const musicService = require('./music-service');
const Music = require('../models/Music');
const Artist = require('../models/Artist');
const User = require('../models/User');
const mongoose = require('mongoose');

// Mock the models
jest.mock('../models/Music');
jest.mock('../models/Artist');
jest.mock('../models/User');

// Mock mongoose
jest.mock('mongoose');

describe('Music Service', () => {
  let mockUser, mockArtist, mockMusic;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create mock user
    mockUser = {
      _id: new mongoose.Types.ObjectId(),
      email: 'test@example.com',
      username: 'testuser',
      fullName: 'Test User',
      userType: 'listener',
      subscription: { plan: 'premium', status: 'active' }
    };

    // Create mock artist
    mockArtist = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Artist',
      bio: 'Test artist bio',
      genre: ['Pop', 'Rock'],
      socialLinks: { twitter: '@testartist' },
      userId: mockUser._id
    };

    // Create mock music
    mockMusic = {
      _id: new mongoose.Types.ObjectId(),
      title: 'Test Song',
      artist: mockArtist._id,
      genre: ['Pop'],
      duration: 180,
      audioUrl: 'https://example.com/audio.mp3',
      coverUrl: 'https://example.com/cover.jpg',
      lyrics: 'Test lyrics',
      isExplicit: false,
      playCount: 100,
      likeCount: 10,
      tags: ['test', 'song']
    };
  });

  describe('createMusic', () => {
    it('should create music successfully', async () => {
      const musicData = {
        title: 'New Song',
        artistId: mockArtist._id,
        genre: ['Rock'],
        duration: 200,
        audioUrl: 'https://example.com/new.mp3',
        coverUrl: 'https://example.com/new.jpg',
        lyrics: 'New lyrics',
        isExplicit: false,
        tags: ['new', 'song']
      };

      const savedMusic = { ...mockMusic, ...musicData };

      Music.create.mockResolvedValue(savedMusic);

      const result = await musicService.createMusic(musicData, mockUser._id);

      expect(result).toEqual(savedMusic);
      expect(Music.create).toHaveBeenCalledWith({
        ...musicData,
        artist: mockArtist._id,
        uploadedBy: mockUser._id
      });
    });

    it('should throw error if artist not found', async () => {
      const musicData = {
        title: 'New Song',
        artistId: new mongoose.Types.ObjectId(),
        genre: ['Rock'],
        duration: 200,
        audioUrl: 'https://example.com/new.mp3',
        coverUrl: 'https://example.com/new.jpg',
        lyrics: 'New lyrics',
        isExplicit: false,
        tags: ['new', 'song']
      };

      Artist.findById.mockResolvedValue(null);

      await expect(musicService.createMusic(musicData, mockUser._id))
        .rejects
        .toThrow('Artist not found');
    });

    it('should throw error if user is not an artist', async () => {
      const nonArtistUser = { ...mockUser, userType: 'listener' };
      
      const musicData = {
        title: 'New Song',
        artistId: mockArtist._id,
        genre: ['Rock'],
        duration: 200,
        audioUrl: 'https://example.com/new.mp3',
        coverUrl: 'https://example.com/new.jpg',
        lyrics: 'New lyrics',
        isExplicit: false,
        tags: ['new', 'song']
      };

      await expect(musicService.createMusic(musicData, nonArtistUser._id))
        .rejects
        .toThrow('Only artists can upload music');
    });

    it('should throw error if validation fails', async () => {
      const invalidMusicData = {
        title: '', // Empty title
        artistId: mockArtist._id,
        genre: ['Rock'],
        duration: -1, // Invalid duration
        audioUrl: 'invalid-url', // Invalid URL
        coverUrl: 'https://example.com/new.jpg',
        lyrics: 'New lyrics',
        isExplicit: false,
        tags: ['new', 'song']
      };

      await expect(musicService.createMusic(invalidMusicData, mockUser._id))
        .rejects
        .toThrow();
    });

    it('should handle database errors', async () => {
      const musicData = {
        title: 'New Song',
        artistId: mockArtist._id,
        genre: ['Rock'],
        duration: 200,
        audioUrl: 'https://example.com/new.mp3',
        coverUrl: 'https://example.com/new.jpg',
        lyrics: 'New lyrics',
        isExplicit: false,
        tags: ['new', 'song']
      };

      Music.create.mockRejectedValue(new Error('Database error'));

      await expect(musicService.createMusic(musicData, mockUser._id))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('getMusicById', () => {
    it('should get music by ID successfully', async () => {
      Music.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockMusic)
      });

      const result = await musicService.getMusicById(mockMusic._id);

      expect(result).toEqual(mockMusic);
      expect(Music.findById).toHaveBeenCalledWith(mockMusic._id);
    });

    it('should return null if music not found', async () => {
      Music.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await musicService.getMusicById(new mongoose.Types.ObjectId());

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      Music.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(musicService.getMusicById(mockMusic._id))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('getAllMusic', () => {
    it('should get all music with pagination', async () => {
      const mockMusics = [mockMusic, { ...mockMusic, _id: new mongoose.Types.ObjectId(), title: 'Another Song' }];
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockMusics)
      };

      Music.find.mockReturnValue(mockQuery);
      Music.countDocuments.mockResolvedValue(2);

      const result = await musicService.getAllMusic(1, 10, {});

      expect(result).toEqual({
        musics: mockMusics,
        total: 2,
        page: 1,
        totalPages: 1
      });
      expect(Music.find).toHaveBeenCalledWith({});
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should filter music by genre', async () => {
      const mockMusics = [mockMusic];
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockMusics)
      };

      Music.find.mockReturnValue(mockQuery);
      Music.countDocuments.mockResolvedValue(1);

      await musicService.getAllMusic(1, 10, { genre: 'Pop' });

      expect(Music.find).toHaveBeenCalledWith({ genre: 'Pop' });
    });

    it('should search music by title', async () => {
      const mockMusics = [mockMusic];
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockMusics)
      };

      Music.find.mockReturnValue(mockQuery);
      Music.countDocuments.mockResolvedValue(1);

      await musicService.getAllMusic(1, 10, { search: 'Test' });

      expect(Music.find).toHaveBeenCalledWith({ 
        $or: [
          { title: { $regex: 'Test', $options: 'i' } },
          { artist: { $regex: 'Test', $options: 'i' } }
        ] 
      });
    });

    it('should handle database errors', async () => {
      Music.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(musicService.getAllMusic(1, 10, {}))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('updateMusic', () => {
    it('should update music successfully', async () => {
      const updateData = {
        title: 'Updated Title',
        genre: ['Updated Genre'],
        lyrics: 'Updated lyrics'
      };

      const updatedMusic = { ...mockMusic, ...updateData };

      Music.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(updatedMusic)
      });

      const result = await musicService.updateMusic(mockMusic._id, updateData, mockUser._id);

      expect(result).toEqual(updatedMusic);
      expect(Music.findByIdAndUpdate).toHaveBeenCalledWith(
        mockMusic._id,
        updateData,
        { new: true, runValidators: true }
      );
    });

    it('should throw error if music not found', async () => {
      const updateData = { title: 'Updated Title' };

      Music.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null)
      });

      await expect(musicService.updateMusic(new mongoose.Types.ObjectId(), updateData, mockUser._id))
        .rejects
        .toThrow('Music not found');
    });

    it('should throw error if user is not the owner', async () => {
      const otherUser = { ...mockUser, _id: new mongoose.Types.ObjectId() };

      Music.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockMusic)
      });

      await expect(musicService.updateMusic(mockMusic._id, {}, otherUser._id))
        .rejects
        .toThrow('You can only update your own music');
    });

    it('should throw error if validation fails', async () => {
      const invalidUpdateData = {
        title: '', // Empty title
        duration: -1 // Invalid duration
      };

      Music.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockMusic)
      });

      await expect(musicService.updateMusic(mockMusic._id, invalidUpdateData, mockUser._id))
        .rejects
        .toThrow();
    });

    it('should handle database errors', async () => {
      const updateData = { title: 'Updated Title' };

      Music.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(musicService.updateMusic(mockMusic._id, updateData, mockUser._id))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('deleteMusic', () => {
    it('should delete music successfully', async () => {
      Music.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockMusic)
      });

      const result = await musicService.deleteMusic(mockMusic._id, mockUser._id);

      expect(result).toEqual(mockMusic);
      expect(Music.findByIdAndDelete).toHaveBeenCalledWith(mockMusic._id);
    });

    it('should throw error if music not found', async () => {
      Music.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      await expect(musicService.deleteMusic(new mongoose.Types.ObjectId(), mockUser._id))
        .rejects
        .toThrow('Music not found');
    });

    it('should throw error if user is not the owner', async () => {
      const otherUser = { ...mockUser, _id: new mongoose.Types.ObjectId() };

      Music.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockMusic)
      });

      await expect(musicService.deleteMusic(mockMusic._id, otherUser._id))
        .rejects
        .toThrow('You can only delete your own music');
    });

    it('should handle database errors', async () => {
      Music.findByIdAndDelete.mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(musicService.deleteMusic(mockMusic._id, mockUser._id))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('incrementPlayCount', () => {
    it('should increment play count successfully', async () => {
      const updatedMusic = { ...mockMusic, playCount: 101 };

      Music.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(updatedMusic)
      });

      const result = await musicService.incrementPlayCount(mockMusic._id);

      expect(result).toEqual(updatedMusic);
      expect(Music.findByIdAndUpdate).toHaveBeenCalledWith(
        mockMusic._id,
        { $inc: { playCount: 1 } },
        { new: true, runValidators: true }
      );
    });

    it('should handle database errors', async () => {
      Music.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(musicService.incrementPlayCount(mockMusic._id))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('toggleLike', () => {
    it('should like music successfully', async () => {
      const updatedMusic = { ...mockMusic, likeCount: 11, likedBy: [mockUser._id] };

      Music.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(updatedMusic)
      });

      const result = await musicService.toggleLike(mockMusic._id, mockUser._id);

      expect(result).toEqual(updatedMusic);
      expect(Music.findByIdAndUpdate).toHaveBeenCalledWith(
        mockMusic._id,
        { 
          $addToSet: { likedBy: mockUser._id },
          $inc: { likeCount: 1 }
        },
        { new: true, runValidators: true }
      );
    });

    it('should unlike music successfully', async () => {
      const likedMusic = { ...mockMusic, likeCount: 10, likedBy: [mockUser._id] };
      const unlikedMusic = { ...likedMusic, likeCount: 9, likedBy: [] };

      Music.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockResolvedValue(unlikedMusic)
      });

      const result = await musicService.toggleLike(mockMusic._id, mockUser._id);

      expect(result).toEqual(unlikedMusic);
      expect(Music.findByIdAndUpdate).toHaveBeenCalledWith(
        mockMusic._id,
        { 
          $pull: { likedBy: mockUser._id },
          $inc: { likeCount: -1 }
        },
        { new: true, runValidators: true }
      );
    });

    it('should handle database errors', async () => {
      Music.findByIdAndUpdate.mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(musicService.toggleLike(mockMusic._id, mockUser._id))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('getRecommendedMusic', () => {
    it('should get recommended music based on user preferences', async () => {
      const mockMusics = [mockMusic, { ...mockMusic, _id: new mongoose.Types.ObjectId(), title: 'Recommended Song' }];
      
      // Mock user with preferences
      const userWithPreferences = { ...mockUser, preferences: { genre: ['Pop'] } };
      
      Music.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockMusics)
      });

      const result = await musicService.getRecommendedMusic(userWithPreferences._id, 10);

      expect(result).toEqual(mockMusics);
      expect(Music.find).toHaveBeenCalledWith({
        genre: { $in: ['Pop'] },
        _id: { $ne: expect.any(mongoose.Types.ObjectId) }
      });
    });

    it('should get recommended music based on listening history', async () => {
      const mockMusics = [mockMusic];
      const userWithHistory = { ...mockUser, listeningHistory: [mockMusic._id] };
      
      Music.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockMusics)
      });

      await musicService.getRecommendedMusic(userWithHistory._id, 10);

      expect(Music.find).toHaveBeenCalledWith({
        _id: { $nin: [mockMusic._id] }
      });
    });

    it('should handle database errors', async () => {
      Music.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(musicService.getRecommendedMusic(mockUser._id, 10))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('getMusicByArtist', () => {
    it('should get music by artist ID', async () => {
      const mockMusics = [mockMusic, { ...mockMusic, _id: new mongoose.Types.ObjectId(), title: 'Artist Song 2' }];
      
      Music.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockMusics)
      });

      const result = await musicService.getMusicByArtist(mockArtist._id, 1, 10);

      expect(result).toEqual(mockMusics);
      expect(Music.find).toHaveBeenCalledWith({ artist: mockArtist._id });
    });

    it('should handle database errors', async () => {
      Music.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(musicService.getMusicByArtist(mockArtist._id, 1, 10))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('searchMusic', () => {
    it('should search music by query', async () => {
      const mockMusics = [mockMusic];
      const searchQuery = 'Test Song';
      
      Music.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockMusics)
      });
      Music.countDocuments.mockResolvedValue(1);

      const result = await musicService.searchMusic(searchQuery, 1, 10);

      expect(result).toEqual({
        musics: mockMusics,
        total: 1,
        page: 1,
        totalPages: 1
      });
      expect(Music.find).toHaveBeenCalledWith({
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { artist: { $regex: searchQuery, $options: 'i' } },
          { genre: { $regex: searchQuery, $options: 'i' } }
        ]
      });
    });

    it('should handle database errors', async () => {
      Music.find.mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(musicService.searchMusic('Test', 1, 10))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('getPopularMusic', () => {
    it('should get popular music based on play count', async () => {
      const mockMusics = [mockMusic, { ...mockMusic, _id: new mongoose.Types.ObjectId(), title: 'Popular Song', playCount: 200 }];
      
      Music.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockMusics)
      });

      const result = await musicService.getPopularMusic(10);

      expect(result).toEqual(mockMusics);
      expect(Music.find).toHaveBeenCalledWith({}).mock.calls[0][0];
      expect(Music.find().sort).toHaveBeenCalledWith({ playCount: -1 });
    });

    it('should handle database errors', async () => {
      Music.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(musicService.getPopularMusic(10))
        .rejects
        .toThrow('Database error');
    });
  });

  describe('getTrendingMusic', () => {
    it('should get trending music based on recent plays', async () => {
      const mockMusics = [mockMusic];
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      Music.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockMusics)
      });

      const result = await musicService.getTrendingMusic(10);

      expect(result).toEqual(mockMusics);
      expect(Music.find).toHaveBeenCalledWith({
        playCount: { $gt: 0 },
        createdAt: { $gte: sevenDaysAgo }
      });
      expect(Music.find().sort).toHaveBeenCalledWith({ playCount: -1 });
    });

    it('should handle database errors', async () => {
      Music.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await expect(musicService.getTrendingMusic(10))
        .rejects
        .toThrow('Database error');
    });
  });
});