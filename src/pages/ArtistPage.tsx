import React from 'react';
import { useParams } from 'react-router-dom';
import { getArtistById, getTracksByArtistId } from '@/lib/mock-data';
import TrackList from '@/components/shared/TrackList';
import { Button } from '@/components/ui/button';
import { useLibraryStore } from '@/store/library-store';
import { Check, Plus } from 'lucide-react';
export const ArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const artist = id ? getArtistById(id) : undefined;
  const tracks = id ? getTracksByArtistId(id) : [];
  const { followedArtistIds, toggleFollowArtist } = useLibraryStore();
  const isFollowing = artist ? followedArtistIds.has(artist.id) : false;
  if (!artist) {
    return <div className="text-center text-2xl font-bold">Artist not found.</div>;
  }
  const handleFollowClick = () => {
    if (artist) {
      toggleFollowArtist(artist.id);
    }
  };
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-8">
        <img
          src={artist.profileImage}
          alt={artist.name}
          className="w-48 h-48 rounded-full object-cover shadow-lg shadow-cyan/20"
        />
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm font-bold text-cyan-400">AI ARTIST</p>
          <h1 className="text-5xl md:text-7xl font-mono font-bold text-glow-cyan break-words">{artist.name}</h1>
          <p className="mt-4 text-gray-400 max-w-2xl">{artist.bio}</p>
        </div>
      </header>
      <div className="flex items-center space-x-4">
        <Button 
          onClick={handleFollowClick}
          className={`font-bold transition-all duration-200 ${isFollowing ? 'bg-lime-600 hover:bg-lime-700' : 'bg-magenta-600 hover:bg-magenta-700'}`}
        >
          {isFollowing ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>
      <div>
        <h2 className="text-2xl font-mono font-bold mb-4">Tracks</h2>
        <TrackList tracks={tracks} showArtist={false} />
      </div>
    </div>
  );
};