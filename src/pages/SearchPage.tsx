import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { artists, tracks, playlists, getArtistById } from '@/lib/mock-data';
import ContentCard from '@/components/shared/ContentCard';
import TrackList from '@/components/shared/TrackList';
import { Search as SearchIcon } from 'lucide-react';
export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);
  useEffect(() => {
    setInputValue(query);
  }, [query]);
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    } else {
      navigate('/search');
    }
  };
  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return { artists: [], playlists: [], tracks: [] };
    }
    const lowerCaseQuery = query.toLowerCase();
    const filteredArtists = artists.filter(a => a.name.toLowerCase().includes(lowerCaseQuery));
    const filteredPlaylists = playlists.filter(p => p.title.toLowerCase().includes(lowerCaseQuery));
    const filteredTracks = tracks.filter(t =>
      t.title.toLowerCase().includes(lowerCaseQuery) ||
      getArtistById(t.artistId)?.name.toLowerCase().includes(lowerCaseQuery)
    );
    return { artists: filteredArtists, playlists: filteredPlaylists, tracks: filteredTracks };
  }, [query]);
  const hasResults = filteredResults.artists.length > 0 || filteredResults.playlists.length > 0 || filteredResults.tracks.length > 0;
  return (
    <div className="space-y-8">
      <form onSubmit={handleSearchSubmit} className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
        <Input
          type="search"
          placeholder="What do you want to listen to?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full pl-14 p-6 text-lg bg-neutral-900 border-neutral-700 focus:ring-cyan-500 focus:border-cyan-500 rounded-md"
        />
      </form>
      {query && !hasResults && (
        <div className="text-center py-16">
          <h3 className="text-2xl font-bold">No results found for "{query}"</h3>
          <p className="text-neutral-400 mt-2">Please check your spelling or try another search.</p>
        </div>
      )}
      {hasResults && (
        <div className="space-y-12">
          {filteredResults.tracks.length > 0 && (
            <section>
              <h2 className="text-2xl font-mono font-bold mb-4 text-glow-cyan">Tracks</h2>
              <TrackList tracks={filteredResults.tracks} />
            </section>
          )}
          {filteredResults.artists.length > 0 && (
            <section>
              <h2 className="text-2xl font-mono font-bold mb-4 text-glow-lime">Artists</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredResults.artists.map((artist) => (
                  <ContentCard key={artist.id} item={artist} type="artist" />
                ))}
              </div>
            </section>
          )}
          {filteredResults.playlists.length > 0 && (
            <section>
              <h2 className="text-2xl font-mono font-bold mb-4 text-glow-magenta">Playlists</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredResults.playlists.map((playlist) => (
                  <ContentCard key={playlist.id} item={playlist} type="playlist" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};