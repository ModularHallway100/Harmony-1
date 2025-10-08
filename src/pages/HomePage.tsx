import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { artists, playlists, tracks, getTracksByArtistId } from '@/lib/mock-data';
import ContentCard from '@/components/shared/ContentCard';
import TrackList from '@/components/shared/TrackList';
import { usePlayerStore } from '@/store/player-store';
import { useLibraryStore } from '@/store/library-store';
import { TrendingUp, Clock, Sparkles, Radio, Shuffle, Music } from 'lucide-react';

// Mock data for trending and latest tracks
const trendingTracks = [
  { id: 'track-1', title: 'Cybernetic Sunrise', artistId: 'artist-1', duration: 210, coverArt: 'https://picsum.photos/seed/cybersun/400/400', playCount: 15420 },
  { id: 'track-4', title: 'Digital Ghost', artistId: 'artist-2', duration: 195, coverArt: 'https://picsum.photos/seed/digitalghost/400/400', playCount: 12350 },
  { id: 'track-7', title: 'Wasteland Wanderer', artistId: 'artist-3', duration: 250, coverArt: 'https://picsum.photos/seed/wasteland/400/400', playCount: 11230 },
  { id: 'track-3', title: 'Neon Gridlock', artistId: 'artist-1', duration: 240, coverArt: 'https://picsum.photos/seed/neongrid/400/400', playCount: 9870 },
  { id: 'track-5', title: 'Hologram Heart', artistId: 'artist-2', duration: 220, coverArt: 'https://picsum.photos/seed/hologramheart/400/400', playCount: 8765 },
];

const latestTracks = [
  { id: 'track-8', title: 'Forgotten Protocol', artistId: 'artist-3', duration: 180, coverArt: 'https://picsum.photos/seed/protocol/400/400', releaseDate: new Date() },
  { id: 'track-6', title: 'Dusty Circuits', artistId: 'artist-3', duration: 200, coverArt: 'https://picsum.photos/seed/dustycircuits/400/400', releaseDate: new Date(Date.now() - 86400000) },
  { id: 'track-2', title: 'Pixelated Dreams', artistId: 'artist-1', duration: 185, coverArt: 'https://picsum.photos/seed/pixeldream/400/400', releaseDate: new Date(Date.now() - 172800000) },
];

const recommendedPlaylists = [
  {
    id: 'playlist-1',
    title: 'Midnight Drive',
    description: 'The perfect soundtrack for a high-speed chase through neon-lit cityscapes.',
    trackIds: ['track-1', 'track-3', 'track-5'],
    coverArt: 'https://picsum.photos/seed/midnightdrive/400/400',
    isRecommended: true,
  },
  {
    id: 'playlist-2',
    title: 'Dial-Up Dreams',
    description: 'Chill, nostalgic beats for coding, studying, or just relaxing.',
    trackIds: ['track-2', 'track-6', 'track-8'],
    coverArt: 'https://picsum.photos/seed/dialup/400/400',
    isRecommended: true,
  },
  {
    id: 'playlist-3',
    title: 'Cyberpunk Essentials',
    description: 'The definitive collection of tracks from the digital underground.',
    trackIds: ['track-1', 'track-2', 'track-3', 'track-4', 'track-5', 'track-6', 'track-7', 'track-8'],
    coverArt: 'https://picsum.photos/seed/cyberpunk/400/400',
    isRecommended: true,
  },
];

const discoverMix = [
  { id: 'track-1', title: 'Cybernetic Sunrise', artistId: 'artist-1', duration: 210, coverArt: 'https://picsum.photos/seed/cybersun/400/400' },
  { id: 'track-6', title: 'Dusty Circuits', artistId: 'artist-3', duration: 200, coverArt: 'https://picsum.photos/seed/dustycircuits/400/400' },
  { id: 'track-4', title: 'Digital Ghost', artistId: 'artist-2', duration: 195, coverArt: 'https://picsum.photos/seed/digitalghost/400/400' },
  { id: 'track-8', title: 'Forgotten Protocol', artistId: 'artist-3', duration: 180, coverArt: 'https://picsum.photos/seed/protocol/400/400' },
  { id: 'track-2', title: 'Pixelated Dreams', artistId: 'artist-1', duration: 185, coverArt: 'https://picsum.photos/seed/pixeldream/400/400' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const sectionVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export const HomePage: React.FC = () => {
  const { play } = usePlayerStore();
  const { likedTrackIds } = useLibraryStore();
  const [activeTab, setActiveTab] = useState('trending');
  
  const handlePlayTrack = (track: any) => {
    play(track);
  };
  
  const handlePlayMix = () => {
    play(discoverMix[0], discoverMix);
  };
  
  const formatPlayCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-12">
      {/* Discover Mix Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-magenta-900/30 via-cyan-900/30 to-lime-900/30 border border-magenta/30 p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgbnVtT2N0YXZlcz0iMTAiLz48ZmVDb21wb3NpdGUgcmVzdWx0PSJub3JtYWxpemVkIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjEiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:w-2/3">
            <div className="flex items-center gap-2 mb-4">
              <Shuffle className="w-6 h-6 text-cyan-400" />
              <h2 className="text-4xl font-mono font-bold text-glow-cyan">Discover Mix</h2>
            </div>
            <p className="text-gray-300 mb-6 max-w-2xl">
              A personalized selection of tracks based on your listening history.
              We've handpicked these gems just for you.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handlePlayMix}
                className="bg-white text-black px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <Play className="w-5 h-5" />
                Play Mix
              </button>
              <button className="bg-transparent border border-cyan-400 text-cyan-400 px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-cyan-400/10 transition-colors">
                <Radio className="w-5 h-5" />
                Radio
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full md:w-1/3">
            {discoverMix.slice(0, 5).map((track, index) => (
              <div key={track.id} className="cursor-pointer group" onClick={() => handlePlayTrack(track)}>
                <div className="relative overflow-hidden rounded-lg mb-2">
                  <img
                    src={track.coverArt}
                    alt={track.title}
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-cyan-500 text-black text-xs font-bold px-2 py-1 rounded">
                      1
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium truncate">{track.title}</p>
                <p className="text-xs text-gray-400">
                  {getTracksByArtistId(track.artistId)[0]?.artist?.name || 'Unknown Artist'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Trending & Latest Tabs */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-mono font-bold text-glow-lime">What's Hot</h2>
            <div className="flex bg-neutral-800 rounded-full p-1">
              <button
                onClick={() => setActiveTab('trending')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'trending'
                    ? 'bg-lime-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Trending
              </button>
              <button
                onClick={() => setActiveTab('latest')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'latest'
                    ? 'bg-lime-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Latest
              </button>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>More</span>
          </button>
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {activeTab === 'trending' ? (
            <div className="space-y-4">
              {trendingTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  variants={sectionVariants}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-800/50 cursor-pointer group"
                  onClick={() => handlePlayTrack(track)}
                >
                  <div className="w-12 h-12 flex items-center justify-center text-gray-400">
                    {index + 1}
                  </div>
                  <img
                    src={track.coverArt}
                    alt={track.title}
                    className="w-12 h-12 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium group-hover:text-cyan-400 transition-colors">
                      {track.title}
                    </p>
                    <p className="text-sm text-gray-400">
                      {getTracksByArtistId(track.artistId)[0]?.artist?.name || 'Unknown Artist'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">{formatPlayCount(track.playCount)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-neutral-700">
                      <Play className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {latestTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  variants={sectionVariants}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-800/50 cursor-pointer group"
                  onClick={() => handlePlayTrack(track)}
                >
                  <div className="w-12 h-12 flex items-center justify-center text-gray-400">
                    {index + 1}
                  </div>
                  <img
                    src={track.coverArt}
                    alt={track.title}
                    className="w-12 h-12 rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium group-hover:text-cyan-400 transition-colors">
                      {track.title}
                    </p>
                    <p className="text-sm text-gray-400">
                      {getTracksByArtistId(track.artistId)[0]?.artist?.name || 'Unknown Artist'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{formatDate(track.releaseDate)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}</span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-neutral-700">
                      <Play className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>
      
      {/* Recommended Playlists */}
      <section>
        <h2 className="text-3xl font-mono font-bold mb-6 text-glow-magenta flex items-center gap-3">
          <Music />
          Recommended For You
        </h2>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {recommendedPlaylists.map((playlist) => (
            <ContentCard
              key={playlist.id}
              item={playlist}
              type="playlist"
              className="hover:scale-105 transition-transform duration-300"
            />
          ))}
        </motion.div>
      </section>
      
      {/* Featured AI Artists */}
      <section>
        <h2 className="text-3xl font-mono font-bold mb-6 text-glow-cyan">Featured AI Artists</h2>
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {artists.map((artist) => (
            <ContentCard key={artist.id} item={artist} type="artist" />
          ))}
        </motion.div>
      </section>
    </div>
  );
};