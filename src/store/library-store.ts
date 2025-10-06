import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Playlist, Artist, Comment } from '@/lib/mock-data';
interface NewArtistData {
  name: string;
  bio: string;
  genre: string;
}
interface LibraryState {
  likedTrackIds: Set<string>;
  followedArtistIds: Set<string>;
  customPlaylists: Playlist[];
  userCreatedArtists: Artist[];
  commentsByContentId: Record<string, Comment[]>;
  toggleLikeTrack: (trackId: string) => void;
  toggleFollowArtist: (artistId: string) => void;
  createPlaylist: (title: string, description: string) => void;
  addArtist: (artistData: NewArtistData) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  addComment: (comment: Comment) => void;
  deleteComment: (contentId: string, commentId: string) => void;
}
export const useLibraryStore = create<LibraryState>()(
  persist(
    (set) => ({
      likedTrackIds: new Set(),
      followedArtistIds: new Set(),
      customPlaylists: [],
      userCreatedArtists: [],
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