import React, { useState, useEffect } from 'react';
import { useLibraryStore } from '@/store/library-store';
import { usePlayerStore } from '@/store/player-store';
import {
  getArtistById,
  getTrackById,
  playlists as mockPlaylists,
  tracks,
  artists
} from '@/lib/mock-data';
import ContentCard from '@/components/shared/ContentCard';
import TrackList from '@/components/shared/TrackList';
import EmptyState from '@/components/shared/EmptyState';
import {
  Music,
  User,
  ListMusic,
  Bot,
  PlusCircle,
  Heart,
  Clock,
  History,
  Folder,
  MoreHorizontal,
  Play,
  Radio,
  Shuffle,
  Grid,
  List,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Mock recently played data
const recentlyPlayedTracks = [
  { id: 'track-1', playCount: 5, lastPlayed: new Date(Date.now() - 3600000) },
  { id: 'track-4', playCount: 3, lastPlayed: new Date(Date.now() - 86400000) },
  { id: 'track-7', playCount: 2, lastPlayed: new Date(Date.now() - 172800000) },
  { id: 'track-2', playCount: 1, lastPlayed: new Date(Date.now() - 259200000) },
];

// Mock categorization data
const categorizedTracks = {
  'Electronic': ['track-1', 'track-3', 'track-5'],
  'Chill': ['track-2', 'track-6', 'track-8'],
  'Cyberpunk': ['track-4', 'track-7'],
  'Synthwave': ['track-1', 'track-3'],
};

// Mock smart playlists
const smartPlaylists = [
  {
    id: 'smart-1',
    title: 'Recently Played',
    description: 'Your most recently listened tracks',
    icon: <Clock className="w-5 h-5" />,
    trackIds: recentlyPlayedTracks.map(t => t.id),
  },
  {
    id: 'smart-2',
    title: 'Your Top Songs',
    description: 'Your most played tracks this month',
    icon: <TrendingUp className="w-5 h-5" />,
    trackIds: ['track-1', 'track-4', 'track-7'],
  },
  {
    id: 'smart-3',
    title: 'Discover Weekly',
    description: 'New music based on your taste',
    icon: <Shuffle className="w-5 h-5" />,
    trackIds: ['track-2', 'track-5', 'track-8'],
  },
  {
    id: 'smart-4',
    title: 'Made for You',
    description: 'Personalized playlist just for you',
    icon: <Radio className="w-5 h-5" />,
    trackIds: ['track-3', 'track-6', 'track-1'],
  },
];

export const LibraryPage: React.FC = () => {
  const {
    likedTrackIds,
    followedArtistIds,
    customPlaylists,
    userCreatedArtists,
    toggleLikeTrack,
    toggleFollowArtist,
    createPlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist
  } = useLibraryStore();
  
  const { play } = usePlayerStore();
  
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreatePlaylistDialog, setShowCreatePlaylistDialog] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  
  // Get data from stores
  const likedTracks = Array.from(likedTrackIds).map(id => getTrackById(id)).filter((t): t is NonNullable<typeof t> => !!t);
  const followedArtists = Array.from(followedArtistIds).map(id => getArtistById(id)).filter((a): a is NonNullable<typeof a> => !!a);
  const recentlyPlayed = recentlyPlayedTracks.map(t => getTrackById(t.id)).filter((t): t is NonNullable<typeof t> => !!t);
  
  // Filter tracks based on search and category
  const filteredLikedTracks = likedTracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         getArtistById(track.artistId)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' ||
                           categorizedTracks[selectedCategory as keyof typeof categorizedTracks]?.includes(track.id);
    
    return matchesSearch && matchesCategory;
  });
  
  // Get categories
  const categories = Object.keys(categorizedTracks);
  
  // Handle playlist creation
  const handleCreatePlaylist = () => {
    if (newPlaylistTitle.trim()) {
      createPlaylist(newPlaylistTitle, newPlaylistDescription);
      setNewPlaylistTitle('');
      setNewPlaylistDescription('');
      setShowCreatePlaylistDialog(false);
    }
  };
  
  // Handle track play
  const handlePlayTrack = (track: any) => {
    play(track);
  };
  
  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-mono font-bold text-glow-magenta">Your Library</h1>
          <p className="text-gray-500 mt-2">All your music in one place</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowCreatePlaylistDialog(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Playlist</span>
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            type="search"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Badge>
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-neutral-800 p-1 rounded-lg">
        <Button
          variant={activeTab === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('all')}
          className="flex-1"
        >
          All
        </Button>
        <Button
          variant={activeTab === 'playlists' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('playlists')}
          className="flex-1"
        >
          Playlists
        </Button>
        <Button
          variant={activeTab === 'artists' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('artists')}
          className="flex-1"
        >
          Artists
        </Button>
        <Button
          variant={activeTab === 'tracks' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('tracks')}
          className="flex-1"
        >
          Tracks
        </Button>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'all' && (
        <div className="space-y-12">
          {/* Smart Playlists */}
          <section>
            <h2 className="text-3xl font-mono font-bold mb-6 text-glow-cyan flex items-center gap-3">
              <Radio />
              Made For You
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {smartPlaylists.map((playlist) => (
                <ContentCard
                  key={playlist.id}
                  item={playlist}
                  type="playlist"
                  customIcon={playlist.icon}
                />
              ))}
            </div>
          </section>
          
          {/* Recently Played */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-mono font-bold mb-6 text-glow-lime flex items-center gap-3">
                <Clock />
                Recently Played
              </h2>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            
            <div className="space-y-2">
              {recentlyPlayed.map((track, index) => {
                const playData = recentlyPlayedTracks.find(t => t.id === track.id);
                return (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-800/50 cursor-pointer"
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
                      <p className="font-medium">{track.title}</p>
                      <p className="text-sm text-gray-400">
                        {getArtistById(track.artistId)?.name || 'Unknown Artist'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {playData && formatRelativeTime(playData.lastPlayed)}
                    </div>
                    <Button variant="ghost" size="icon">
                      <Play className="w-5 h-5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>
          
          {/* Your Playlists */}
          <section>
            <h2 className="text-3xl font-mono font-bold mb-6 text-glow-magenta flex items-center gap-3">
              <ListMusic />
              Your Playlists
            </h2>
            {customPlaylists.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
                {customPlaylists.map((playlist) => (
                  <ContentCard
                    key={playlist.id}
                    item={playlist}
                    type="playlist"
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<ListMusic className="w-12 h-12" />}
                title="No Custom Playlists"
                description="Click 'Create Playlist' to make your first one."
              />
            )}
          </section>
        </div>
      )}
      
      {activeTab === 'playlists' && (
        <section>
          <h2 className="text-3xl font-mono font-bold mb-6 text-glow-magenta flex items-center gap-3">
            <ListMusic />
            All Playlists
          </h2>
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
            {/* Smart Playlists */}
            {smartPlaylists.map((playlist) => (
              <ContentCard
                key={playlist.id}
                item={playlist}
                type="playlist"
                customIcon={playlist.icon}
                viewMode={viewMode}
              />
            ))}
            
            {/* Custom Playlists */}
            {customPlaylists.map((playlist) => (
              <ContentCard
                key={playlist.id}
                item={playlist}
                type="playlist"
                viewMode={viewMode}
              />
            ))}
          </div>
        </section>
      )}
      
      {activeTab === 'artists' && (
        <section>
          <h2 className="text-3xl font-mono font-bold mb-6 text-glow-lime flex items-center gap-3">
            <User />
            Your Artists
          </h2>
          
          {/* AI Artists */}
          <div className="mb-12">
            <h3 className="text-xl font-mono font-bold mb-4 text-glow-cyan">Your AI Artists</h3>
            {userCreatedArtists.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
                {userCreatedArtists.map((artist) => (
                  <ContentCard
                    key={artist.id}
                    item={artist}
                    type="user-artist"
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Bot className="w-12 h-12" />}
                title="No AI Artists Created"
                description='Go to "Create Artist" to generate your first AI persona.'
              />
            )}
          </div>
          
          {/* Followed Artists */}
          <div>
            <h3 className="text-xl font-mono font-bold mb-4 text-glow-cyan">Followed Artists</h3>
            {followedArtists.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
                {followedArtists.map((artist) => (
                  <ContentCard
                    key={artist.id}
                    item={artist}
                    type="artist"
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<User className="w-12 h-12" />}
                title="You're Not Following Any Artists"
                description="Find an artist you like and click the 'Follow' button on their page."
              />
            )}
          </div>
        </section>
      )}
      
      {activeTab === 'tracks' && (
        <section>
          <h2 className="text-3xl font-mono font-bold mb-6 text-glow-magenta flex items-center gap-3">
            <Music />
            Your Tracks
          </h2>
          
          {filteredLikedTracks.length > 0 ? (
            <TrackList tracks={filteredLikedTracks} />
          ) : (
            <EmptyState
              icon={<Heart className="w-12 h-12" />}
              title="No Liked Songs"
              description="Click the heart icon on any track to save it to your library."
            />
          )}
        </section>
      )}
      
      {/* Create Playlist Dialog */}
      {showCreatePlaylistDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Create New Playlist</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Playlist Name</label>
                <Input
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder="Enter playlist name"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Description (Optional)</label>
                <Input
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Enter playlist description"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreatePlaylistDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePlaylist}
                disabled={!newPlaylistTitle.trim()}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};