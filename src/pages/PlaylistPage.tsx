import React from 'react';
import { useParams } from 'react-router-dom';
import { getPlaylistById, getTracksByPlaylistId, getTrackById, Playlist } from '@/lib/mock-data';
import { useLibraryStore } from '@/store/library-store';
import TrackList from '@/components/shared/TrackList';
import CommentSection from '@/components/shared/CommentSection';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, Star } from 'lucide-react';
export const PlaylistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { customPlaylists } = useLibraryStore();
  const playlistFromMock = id ? getPlaylistById(id) : undefined;
  const playlistFromStore = customPlaylists.find(p => p.id === id);
  const playlist = playlistFromStore || playlistFromMock;
  const tracks = React.useMemo(() => {
    if (!playlist) return [];
    if (playlist.id.startsWith('custom-playlist-')) {
      return playlist.trackIds.map(tid => getTrackById(tid)).filter(Boolean);
    }
    return id ? getTracksByPlaylistId(id) : [];
  }, [id, playlist]);
  if (!playlist) {
    return <div className="text-center text-2xl font-bold">Playlist not found.</div>;
  }
  const isCustomPlaylist = playlist.id.startsWith('custom-playlist-');
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-8">
        <img
          src={playlist.coverArt}
          alt={playlist.title}
          className="w-48 h-48 rounded-md object-cover shadow-lg shadow-magenta/20"
        />
        <div className="flex-1 text-center md:text-left">
          <p className="text-sm font-bold text-magenta-400">PLAYLIST</p>
          <h1 className="text-5xl md:text-7xl font-mono font-bold text-glow-magenta break-words">{playlist.title}</h1>
          <p className="mt-4 text-gray-400 max-w-2xl">{playlist.description}</p>
        </div>
      </header>
      <div className="flex items-center space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button disabled className="bg-neutral-700 text-neutral-400 font-bold cursor-not-allowed flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-black border-lime-500 text-lime-300">
              <p className="flex items-center gap-2"><Star className="w-4 h-4" /> Premium Feature</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div>
        {tracks.length > 0 ? (
          <TrackList tracks={tracks} playlistId={isCustomPlaylist ? playlist.id : undefined} />
        ) : (
          <div className="text-center text-neutral-500 border-2 border-dashed border-neutral-700 rounded-lg p-16">
            <h3 className="text-2xl font-bold">This playlist is empty.</h3>
            <p className="mt-2">Add some tracks to get started!</p>
          </div>
        )}
      </div>
      {!isCustomPlaylist && (
        <div>
          <CommentSection contentId={playlist.id} />
        </div>
      )}
    </div>
  );
};