import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Playlist, Artist, Comment } from '@/lib/mock-data';

// Enhanced artist interface with AI-specific fields
export interface AIArtist extends Artist {
  isAI: boolean;
  personalityTraits: string[];
  visualStyle: string;
  speakingStyle: 'formal' | 'casual' | 'energetic' | 'mysterious' | 'friendly';
  backstory: string;
  influences?: string;
  uniqueElements?: string;
  generationParameters?: {
    model: string;
    prompt: string;
    createdAt: Date;
  };
  performanceMetrics?: {
    engagement: number;
    popularity: number;
    streams: number;
  };
}

interface NewArtistData {
  name: string;
  bio: string;
  genre: string;
}

interface NewAIArtistData {
  name: string;
  bio: string;
  genre: string;
  personalityTraits: string[];
  visualStyle: string;
  speakingStyle: 'formal' | 'casual' | 'energetic' | 'mysterious' | 'friendly';
  backstory: string;
  influences?: string;
  uniqueElements?: string;
  profileImage?: string;
}

interface ArtistImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  generatedAt: Date;
  isPrimary?: boolean;
  tags?: string[];
}

interface LibraryState {
  likedTrackIds: Set<string>;
  followedArtistIds: Set<string>;
  customPlaylists: Playlist[];
  userCreatedArtists: Artist[];
  aiArtists: AIArtist[];
  artistImages: Record<string, ArtistImage[]>; // artistId -> images
  commentsByContentId: Record<string, Comment[]>;
  toggleLikeTrack: (trackId: string) => void;
  toggleFollowArtist: (artistId: string) => void;
  createPlaylist: (title: string, description: string) => void;
  addArtist: (artistData: NewArtistData) => void;
  addAIArtist: (artistData: NewAIArtistData) => void;
  updateUserArtist: (id: string, updates: Partial<Artist | AIArtist>) => void;
  removeAIArtist: (id: string) => void;
  updateAIArtist: (id: string, updates: Partial<AIArtist>) => void;
  updatePerformanceMetrics: (id: string, metrics: Partial<AIArtist['performanceMetrics']>) => void;
  addArtistImage: (artistId: string, image: ArtistImage) => void;
  updateArtistImage: (artistId: string, imageId: string, updates: Partial<ArtistImage>) => void;
  removeArtistImage: (artistId: string, imageId: string) => void;
  setPrimaryArtistImage: (artistId: string, imageId: string) => void;
  getArtistImages: (artistId: string) => ArtistImage[];
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  addComment: (comment: Comment) => void;
  deleteComment: (contentId: string, commentId: string) => void;
  getAIArtistById: (id: string) => AIArtist | undefined;
  getAllAIArtists: () => AIArtist[];
}
export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      likedTrackIds: new Set(),
      followedArtistIds: new Set(),
      customPlaylists: [],
      userCreatedArtists: [],
      aiArtists: [],
      artistImages: {},
      commentsByContentId: {},
      toggleLikeTrack: (trackId: string) => {
        set((state) => {
          const newLikedTrackIds = new Set(state.likedTrackIds);
          if (newLikedTrackIds.has(trackId)) {
            newLikedTrackIds.delete(trackId);
          } else {
            newLikedTrackIds.add(trackId);
          }
          return { likedTrackIds: newLikedTrackIds };
        });
      },
      toggleFollowArtist: (artistId: string) => {
        set((state) => {
          const newFollowedArtistIds = new Set(state.followedArtistIds);
          if (newFollowedArtistIds.has(artistId)) {
            newFollowedArtistIds.delete(artistId);
          } else {
            newFollowedArtistIds.add(artistId);
          }
          return { followedArtistIds: newFollowedArtistIds };
        });
      },
      createPlaylist: (title: string, description: string) => {
        const newPlaylist: Playlist = {
          id: `custom-playlist-${crypto.randomUUID()}`,
          title,
          description,
          trackIds: [],
          coverArt: `https://picsum.photos/seed/${title}/400/400`,
        };
        set((state) => ({
          customPlaylists: [...state.customPlaylists, newPlaylist],
        }));
      },
      addArtist: (artistData: NewArtistData) => {
        const newArtist: Artist = {
          id: `user-artist-${crypto.randomUUID()}`,
          ...artistData,
          profileImage: `https://picsum.photos/seed/${artistData.name}/400/400`,
        };
        set((state) => ({
          userCreatedArtists: [...state.userCreatedArtists, newArtist],
        }));
      },
      updateUserArtist: (id, updates) => {
        set((state) => {
          // Update in userCreatedArtists
          const updatedUserArtists = state.userCreatedArtists.map((artist) =>
            artist.id === id ? { ...artist, ...updates } : artist
          );
          
          // Update in aiArtists if it's an AI artist
          const updatedAiArtists = state.aiArtists.map((artist) =>
            artist.id === id ? { ...artist, ...updates } : artist
          );
          
          return {
            userCreatedArtists: updatedUserArtists,
            aiArtists: updatedAiArtists,
          };
        });
      },
      addAIArtist: (artistData: NewAIArtistData) => {
        const newAIArtist: AIArtist = {
          id: `ai-artist-${crypto.randomUUID()}`,
          ...artistData,
          profileImage: artistData.profileImage || `https://picsum.photos/seed/${artistData.name}/400/400`,
          isAI: true,
          performanceMetrics: {
            engagement: 0,
            popularity: 0,
            streams: 0,
          }
        };
        set((state) => ({
          aiArtists: [...state.aiArtists, newAIArtist],
        }));
      },
      removeAIArtist: (id) =>
        set((state) => ({
          aiArtists: state.aiArtists.filter((artist) => artist.id !== id),
        })),
      updateAIArtist: (id, updates) =>
        set((state) => ({
          aiArtists: state.aiArtists.map((artist) =>
            artist.id === id ? { ...artist, ...updates } : artist
          ),
        })),
      updatePerformanceMetrics: (id, metrics) =>
        set((state) => ({
          aiArtists: state.aiArtists.map((artist) =>
            artist.id === id
              ? {
                  ...artist,
                  performanceMetrics: {
                    ...artist.performanceMetrics,
                    ...metrics
                  }
                }
              : artist
          ),
        })),
        addArtistImage: (artistId, image) => {
          set((state) => ({
            artistImages: {
              ...state.artistImages,
              [artistId]: [...(state.artistImages[artistId] || []), image],
            },
          }));
        },
        updateArtistImage: (artistId, imageId, updates) => {
          set((state) => ({
            artistImages: {
              ...state.artistImages,
              [artistId]: (state.artistImages[artistId] || []).map((image) =>
                image.id === imageId ? { ...image, ...updates } : image
              ),
            },
          }));
        },
        removeArtistImage: (artistId, imageId) => {
          set((state) => ({
            artistImages: {
              ...state.artistImages,
              [artistId]: (state.artistImages[artistId] || []).filter((image) => image.id !== imageId),
            },
          }));
        },
        setPrimaryArtistImage: (artistId, imageId) => {
          set((state) => ({
            artistImages: {
              ...state.artistImages,
              [artistId]: (state.artistImages[artistId] || []).map((image) => ({
                ...image,
                isPrimary: image.id === imageId,
              })),
            },
          }));
        },
        getArtistImages: (artistId) => {
          const state = useLibraryStore.getState();
          return state.artistImages[artistId] || [];
        },
        getAIArtistById: (id) => {
          const state = useLibraryStore.getState();
          return state.aiArtists.find((artist) => artist.id === id);
        },
        getAllAIArtists: () => {
          const state = useLibraryStore.getState();
          return state.aiArtists;
        },
      addComment: (comment: Comment) => {
        set((state) => {
          const existingComments = state.commentsByContentId[comment.contentId] || [];
          return {
            commentsByContentId: {
              ...state.commentsByContentId,
              [comment.contentId]: [...existingComments, comment],
            },
          };
        });
      },
      deleteComment: (contentId: string, commentId: string) => {
        set((state) => {
          const existingComments = state.commentsByContentId[contentId] || [];
          const updatedComments = existingComments.filter((comment) => comment.id !== commentId);
          return {
            commentsByContentId: {
              ...state.commentsByContentId,
              [contentId]: updatedComments,
            },
          };
        });
      },
      addTrackToPlaylist: (playlistId: string, trackId: string) => {
        set((state) => ({
          customPlaylists: state.customPlaylists.map((playlist) => {
            if (playlist.id === playlistId && !playlist.trackIds.includes(trackId)) {
              return { ...playlist, trackIds: [...playlist.trackIds, trackId] };
            }
            return playlist;
          }),
        }));
      },
      removeTrackFromPlaylist: (playlistId: string, trackId: string) => {
        set((state) => ({
          customPlaylists: state.customPlaylists.map((playlist) => {
            if (playlist.id === playlistId) {
              return { ...playlist, trackIds: playlist.trackIds.filter((id) => id !== trackId) };
            }
            return playlist;
          }),
        }));
      },
    }),
    {
      name: 'retrowave-library-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              likedTrackIds: new Set(state.likedTrackIds),
              followedArtistIds: new Set(state.followedArtistIds),
            },
          };
        },
        setItem: (name, newValue) => {
          const str = JSON.stringify({
            state: {
              ...newValue.state,
              likedTrackIds: Array.from(newValue.state.likedTrackIds),
              followedArtistIds: Array.from(newValue.state.followedArtistIds),
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);