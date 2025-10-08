export interface Track {
  id: string;
  title: string;
  artistId: string;
  duration: number; // in seconds
  coverArt: string;
  audioUrl?: string; // Optional URL for the audio file
}
export interface Artist {
  id: string;
  name: string;
  bio: string;
  genre: string;
  profileImage: string;
}
export interface Playlist {
  id: string;
  title: string;
  description: string;
  trackIds: string[];
  coverArt: string;
}
export interface Comment {
  id: string;
  contentId: string; // Can be trackId or playlistId
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}
export const artists: Artist[] = [
  {
    id: 'artist-1',
    name: 'Glitchard',
    bio: 'An AI construct from the year 2077, Glitchard synthesizes forgotten 8-bit melodies with futuristic basslines. Its music is a nostalgic trip to a future that never was.',
    genre: 'Synthwave',
    profileImage: 'https://picsum.photos/seed/glitchard/400/400',
  },
  {
    id: 'artist-2',
    name: 'Data Diva',
    bio: 'Born from the data streams of a global network, Data Diva\'s voice is a mosaic of a million digital ghosts. Her tracks are hauntingly beautiful, blending ethereal vocals with crunchy, distorted beats.',
    genre: 'Cyberpunk Pop',
    profileImage: 'https://picsum.photos/seed/datadiva/400/400',
  },
  {
    id: 'artist-3',
    name: 'Neon Nomad',
    bio: 'A rogue AI that wanders the digital wastes, Neon Nomad collects sonic fragments from abandoned servers. The result is a unique blend of lo-fi chillwave and aggressive industrial sounds.',
    genre: 'Chillwave',
    profileImage: 'https://picsum.photos/seed/neonnomad/400/400',
  },
];
export const tracks: Track[] = [
  // Glitchard's tracks
  { id: 'track-1', title: 'Cybernetic Sunrise', artistId: 'artist-1', duration: 210, coverArt: 'https://picsum.photos/seed/cybersun/400/400' },
  { id: 'track-2', title: 'Pixelated Dreams', artistId: 'artist-1', duration: 185, coverArt: 'https://picsum.photos/seed/pixeldream/400/400' },
  { id: 'track-3', title: 'Neon Gridlock', artistId: 'artist-1', duration: 240, coverArt: 'https://picsum.photos/seed/neongrid/400/400' },
  // Data Diva's tracks
  { id: 'track-4', title: 'Digital Ghost', artistId: 'artist-2', duration: 195, coverArt: 'https://picsum.photos/seed/digitalghost/400/400' },
  { id: 'track-5', title: 'Hologram Heart', artistId: 'artist-2', duration: 220, coverArt: 'https://picsum.photos/seed/hologramheart/400/400' },
  // Neon Nomad's tracks
  { id: 'track-6', title: 'Dusty Circuits', artistId: 'artist-3', duration: 200, coverArt: 'https://picsum.photos/seed/dustycircuits/400/400' },
  { id: 'track-7', title: 'Wasteland Wanderer', artistId: 'artist-3', duration: 250, coverArt: 'https://picsum.photos/seed/wasteland/400/400' },
  { id: 'track-8', title: 'Forgotten Protocol', artistId: 'artist-3', duration: 180, coverArt: 'https://picsum.photos/seed/protocol/400/400' },
];
export const playlists: Playlist[] = [
  {
    id: 'playlist-1',
    title: 'Midnight Drive',
    description: 'The perfect soundtrack for a high-speed chase through neon-lit cityscapes.',
    trackIds: ['track-1', 'track-3', 'track-5'],
    coverArt: 'https://picsum.photos/seed/midnightdrive/400/400',
  },
  {
    id: 'playlist-2',
    title: 'Dial-Up Dreams',
    description: 'Chill, nostalgic beats for coding, studying, or just relaxing.',
    trackIds: ['track-2', 'track-6', 'track-8'],
    coverArt: 'https://picsum.photos/seed/dialup/400/400',
  },
  {
    id: 'playlist-3',
    title: 'Cyberpunk Essentials',
    description: 'The definitive collection of tracks from the digital underground.',
    trackIds: ['track-1', 'track-2', 'track-3', 'track-4', 'track-5', 'track-6', 'track-7', 'track-8'],
    coverArt: 'https://picsum.photos/seed/cyberpunk/400/400',
  },
];
export const comments: Comment[] = [
  {
    id: 'comment-1',
    contentId: 'playlist-1',
    userId: 'user-1',
    userName: 'SynthRider',
    userAvatar: 'https://i.pravatar.cc/150?u=synthrider',
    text: 'This playlist is pure fire! Perfect for my late-night coding sessions.',
    timestamp: '2024-08-15T22:30:00Z',
  },
  {
    id: 'comment-2',
    contentId: 'playlist-1',
    userId: 'user-2',
    userName: 'ChromeCat',
    userAvatar: 'https://i.pravatar.cc/150?u=chromecat',
    text: 'Absolutely captures the cyberpunk vibe. Glitchard is a genius.',
    timestamp: '2024-08-15T23:05:10Z',
  },
  {
    id: 'comment-3',
    contentId: 'playlist-2',
    userId: 'user-3',
    userName: 'PixelPioneer',
    userAvatar: 'https://i.pravatar.cc/150?u=pixelpioneer',
    text: 'So chill. Takes me back to the early days of the net.',
    timestamp: '2024-08-14T10:00:00Z',
  },
];
export const getArtistById = (id: string) => artists.find(a => a.id === id);
export const getPlaylistById = (id: string) => playlists.find(p => p.id === id);
export const getTrackById = (id: string) => tracks.find(t => t.id === id);
export const getTracksByArtistId = (artistId: string) => tracks.filter(t => t.artistId === artistId);
export const getTracksByPlaylistId = (playlistId: string) => {
  const playlist = getPlaylistById(playlistId);
  return playlist ? playlist.trackIds.map(id => getTrackById(id)).filter((t): t is Track => !!t) : [];
};
export const getCommentsByContentId = (contentId: string) => comments.filter(c => c.contentId === contentId);