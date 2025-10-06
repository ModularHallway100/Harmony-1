import React from 'react';
import { Play, Clock, Heart, MoreHorizontal, ListPlus, XCircle } from 'lucide-react';
import { Track, getArtistById } from '@/lib/mock-data';
import { usePlayerStore } from '@/store/player-store';
import { useLibraryStore } from '@/store/library-store';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const PlayingIndicator = () => (
  <div className="flex items-center justify-center space-x-0.5 w-5 h-5">
    <span className="w-1 h-2 bg-lime-500 animate-[bounce_0.8s_ease-in-out_infinite] [animation-delay:-0.4s]"></span>
    <span className="w-1 h-4 bg-lime-500 animate-[bounce_0.8s_ease-in-out_infinite] [animation-delay:-0.2s]"></span>
    <span className="w-1 h-3 bg-lime-500 animate-[bounce_0.8s_ease-in-out_infinite]"></span>
  </div>
);
interface TrackListProps {
  tracks: Track[];
  showArtist?: boolean;
  playlistId?: string; // For removing tracks from a specific playlist
}
const TrackList: React.FC<TrackListProps> = ({ tracks, showArtist = true, playlistId }) => {
  const { play } = usePlayerStore.getState();
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const { likedTrackIds, toggleLikeTrack, customPlaylists, addTrackToPlaylist, removeTrackFromPlaylist } = useLibraryStore();
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  const handlePlay = (track: Track) => {
    play(track, tracks);
  };
  const handleLikeClick = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    toggleLikeTrack(trackId);
  };
  const handleAddTrack = (e: React.MouseEvent, playlistId: string, trackId: string) => {
    e.stopPropagation();
    addTrackToPlaylist(playlistId, trackId);
  };
  const handleRemoveTrack = (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    if (playlistId) {
      removeTrackFromPlaylist(playlistId, trackId);
    }
  };
  return (
    <div className="text-gray-300">
      <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-neutral-700 text-sm font-mono text-gray-400">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-5">Title</div>
        {showArtist && <div className="col-span-3">Artist</div>}
        <div className="col-span-1"></div> {/* Spacer for like button */}
        <div className={cn("col-span-2 flex justify-end", !showArtist && "col-start-10")}>
          <Clock className="w-4 h-4" />
        </div>
      </div>
      <div className="space-y-1 mt-2">
        {tracks.map((track, index) => {
          const artist = getArtistById(track.artistId);
          const isActive = currentTrack?.id === track.id;
          const isLiked = likedTrackIds.has(track.id);
          return (
            <div
              key={track.id}
              className="grid grid-cols-12 gap-4 items-center p-2 rounded-md hover:bg-neutral-800/50 group cursor-pointer"
              onClick={() => handlePlay(track)}
            >
              <div className="col-span-1 text-center text-gray-400 flex items-center justify-center">
                {isActive && isPlaying ? (
                  <PlayingIndicator />
                ) : (
                  <>
                    <span className="group-hover:hidden">{index + 1}</span>
                    <Play className="w-5 h-5 text-white hidden group-hover:block" />
                  </>
                )}
              </div>
              <div className="col-span-5 flex items-center space-x-3">
                <img src={track.coverArt} alt={track.title} className="w-10 h-10 rounded-sm" />
                <div>
                  <p className={cn("font-semibold", isActive ? "text-lime-500" : "text-white")}>{track.title}</p>
                </div>
              </div>
              {showArtist && <div className="col-span-3 text-gray-400">{artist?.name}</div>}
              <div className="col-span-1 flex justify-center items-center">
                <button onClick={(e) => handleLikeClick(e, track.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className={cn("w-5 h-5 text-gray-400 hover:text-white", isLiked && "fill-magenta-500 text-magenta-500 opacity-100")} />
                </button>
              </div>
              <div className={cn("col-span-2 text-right text-gray-400 flex items-center justify-end gap-4", !showArtist && "col-start-10")}>
                <span>{formatDuration(track.duration)}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-neutral-700">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent onClick={(e) => e.stopPropagation()} className="bg-neutral-800 border-neutral-700 text-white">
                    <DropdownMenuLabel>Add to Playlist</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-neutral-700" />
                    {customPlaylists.length > 0 ? (
                      customPlaylists.map(p => (
                        <DropdownMenuItem key={p.id} onClick={(e) => handleAddTrack(e, p.id, track.id)} className="cursor-pointer">
                          <ListPlus className="mr-2 h-4 w-4" />
                          <span>{p.title}</span>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem disabled>No playlists yet</DropdownMenuItem>
                    )}
                    {playlistId?.startsWith('custom-playlist-') && (
                      <>
                        <DropdownMenuSeparator className="bg-neutral-700" />
                        <DropdownMenuItem onClick={(e) => handleRemoveTrack(e, track.id)} className="text-red-400 focus:bg-red-900/50 focus:text-red-300 cursor-pointer">
                          <XCircle className="mr-2 h-4 w-4" />
                          <span>Remove from this playlist</span>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default TrackList;