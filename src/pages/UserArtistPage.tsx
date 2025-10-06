import React from 'react';
import { useParams } from 'react-router-dom';
import { useLibraryStore } from '@/store/library-store';
import { getTracksByArtistId } from '@/lib/mock-data'; // Assuming user artists can have mock tracks for now
import TrackList from '@/components/shared/TrackList';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';
export const UserArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userCreatedArtists, followedArtistIds, toggleFollowArtist } = useLibraryStore();
  const artist = userCreatedArtists.find(a => a.id === id);
  // For demo purposes, we'll show some mock tracks. In a real app, this would be different.
  const tracks = id ? getTracksByArtistId('artist-1').slice(0, 3) : []; 
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
          <p className="text-sm font-bold text-cyan-400">USER-CREATED AI ARTIST</p>
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
        <p className="text-neutral-400 mb-4 text-sm">(Showing placeholder tracks. Track assignment for user artists is a future feature.)</p>
        {tracks.length > 0 ? (
          <TrackList tracks={tracks} showArtist={false} />
        ) : (
          <div className="text-center text-neutral-500 border-2 border-dashed border-neutral-700 rounded-lg p-12">
            <p>This artist has no tracks yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};