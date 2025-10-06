import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Heart, Volume2 } from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { getArtistById } from '@/lib/mock-data';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
const MusicPlayer: React.FC = () => {
  const { currentTrack, isPlaying, pause, resume, nextTrack, prevTrack } = usePlayerStore();
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const intervalRef = useRef<number | null>(null);
  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  useEffect(() => {
    if (isPlaying && currentTrack) {
      clearTimer();
      intervalRef.current = window.setInterval(() => {
        setCurrentTime(prevTime => {
          if (prevTime >= currentTrack.duration) {
            nextTrack();
            return 0;
          }
          return prevTime + 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isPlaying, currentTrack, nextTrack]);
  useEffect(() => {
    setCurrentTime(0);
  }, [currentTrack]);
  if (!currentTrack) return null;
  const artist = getArtistById(currentTrack.artistId);
  const progress = (currentTime / currentTrack.duration) * 100;
  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };
  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * currentTrack.duration;
    setCurrentTime(newTime);
  };
  const formatTime = (seconds: number) => {
    const flooredSeconds = Math.floor(seconds);
    const minutes = Math.floor(flooredSeconds / 60);
    const remainingSeconds = flooredSeconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-lg border-t border-magenta/30 z-50 flex items-center px-4 sm:px-6 lg:px-8 text-white">
      <div className="flex items-center w-1/4">
        <img src={currentTrack.coverArt} alt={currentTrack.title} className="w-14 h-14 rounded-md" />
        <div className="ml-4">
          <p className="font-semibold truncate">{currentTrack.title}</p>
          <p className="text-sm text-gray-400 truncate">{artist?.name || 'Unknown Artist'}</p>
        </div>
        <Button variant="ghost" size="icon" className="ml-4 text-gray-400 hover:text-white">
          <Heart className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center w-1/2">
        <div className="flex items-center space-x-4">
          <Button onClick={prevTrack} variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <SkipBack className="w-6 h-6" />
          </Button>
          <Button onClick={handlePlayPause} size="icon" className="bg-white text-black rounded-full w-10 h-10 hover:bg-gray-200">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
          </Button>
          <Button onClick={nextTrack} variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>
        <div className="w-full max-w-xl flex items-center space-x-2 mt-2 text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={100}
            step={1}
            className="[&>span:first-child]:h-1 [&>span:first-child>span]:bg-white [&>span:first-child>span]:h-1 [&>span:last-child]:bg-magenta [&>span:last-child]:h-3 [&>span:last-child]:w-3"
          />
          <span>{formatTime(currentTrack.duration)}</span>
        </div>
      </div>
      <div className="flex items-center justify-end w-1/4">
        <Volume2 className="w-5 h-5 text-gray-400" />
        <Slider
          value={[volume]}
          onValueChange={(value) => setVolume(value[0])}
          max={100}
          step={1}
          className="w-24 ml-2 [&>span:first-child]:h-1 [&>span:first-child>span]:bg-white [&>span:first-child>span]:h-1 [&>span:last-child]:bg-magenta [&>span:last-child]:h-3 [&>span:last-child]:w-3"
        />
      </div>
    </div>
  );
};
export default MusicPlayer;