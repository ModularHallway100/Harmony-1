import React from 'react';
import { useLibraryStore } from '@/store/library-store';
import { getArtistById, getTrackById, playlists as mockPlaylists } from '@/lib/mock-data';
import ContentCard from '@/components/shared/ContentCard';
import TrackList from '@/components/shared/TrackList';
import EmptyState from '@/components/shared/EmptyState';
import { Music, User, ListMusic, Bot, PlusCircle, Heart } from 'lucide-react';
export const LibraryPage: React.FC = () => {
  const { likedTrackIds, followedArtistIds, customPlaylists, userCreatedArtists } = useLibraryStore();
  const likedTracks = Array.from(likedTrackIds).map(id => getTrackById(id)).filter((t): t is NonNullable<typeof t> => !!t);
  const followedArtists = Array.from(followedArtistIds).map(id => getArtistById(id)).filter((a): a is NonNullable<typeof a> => !!a);
  return (
    <div className="space-y-12">
      <h1 className="text-5xl font-mono font-bold text-glow-magenta">Your Library</h1>
      <section>
        <h2 className="text-3xl font-mono font-bold mb-6 text-glow-cyan flex items-center gap-3">
          <ListMusic />
          Playlists
        </h2>
        {customPlaylists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {customPlaylists.map((playlist) => (
              <ContentCard key={playlist.id} item={playlist} type="playlist" />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ListMusic className="w-12 h-12" />}
            title="No Custom Playlists"
            description="Click 'Create Playlist' in the sidebar to make your first one."
          />
        )}
      </section>
      <section>
        <h2 className="text-3xl font-mono font-bold mb-6 text-glow-lime flex items-center gap-3">
          <Bot />
          Your AI Artists
        </h2>
        {userCreatedArtists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {userCreatedArtists.map((artist) => (
              <ContentCard key={artist.id} item={artist} type="user-artist" />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<PlusCircle className="w-12 h-12" />}
            title="No AI Artists Created"
            description='Go to "Create Artist" to generate your first AI persona.'
          />
        )}
      </section>
      <section>
        <h2 className="text-3xl font-mono font-bold mb-6 text-glow-lime flex items-center gap-3">
          <User />
          Followed Artists
        </h2>
        {followedArtists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {followedArtists.map((artist) => (
              <ContentCard key={artist.id} item={artist} type="artist" />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<User className="w-12 h-12" />}
            title="You're Not Following Any Artists"
            description="Find an artist you like and click the 'Follow' button on their page."
          />
        )}
      </section>
      <section>
        <h2 className="text-3xl font-mono font-bold mb-6 text-glow-magenta flex items-center gap-3">
          <Music />
          Liked Songs
        </h2>
        {likedTracks.length > 0 ? (
          <TrackList tracks={likedTracks} />
        ) : (
          <EmptyState
            icon={<Heart className="w-12 h-12" />}
            title="No Liked Songs"
            description="Click the heart icon on any track to save it to your library."
          />
        )}
      </section>
    </div>
  );
};