import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Heart, Volume2,
  Shuffle, Repeat, ListMusic, Clock, Radio,
  Minus, Plus, RotateCcw, Settings, AlertCircle, CheckCircle, XCircle
} from 'lucide-react';
import { usePlayerStore } from '@/store/player-store';
import { useLibraryStore as useLibraryDataStore } from '@/store/library-store';
import { getArtistById, getTrackById } from '@/lib/mock-data';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ProgressBar from '@/components/shared/ProgressBar';
import { toast } from 'sonner';

const MusicPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    pause,
    resume,
    nextTrack,
    prevTrack,
    queue,
    repeatMode,
    shuffleMode,
    setRepeatMode,
    setShuffleMode,
    clearQueue,
    removeFromQueue,
    playNext,
    addToQueue,
    setQueue
  } = usePlayerStore();
  
  const { likedTrackIds, toggleLikeTrack } = useLibraryDataStore();
  
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
            if (repeatMode === 'one') {
              return 0; // Restart the track
            }
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
  }, [isPlaying, currentTrack, nextTrack, repeatMode]);

  useEffect(() => {
    setCurrentTime(0);
  }, [currentTrack]);

  if (!currentTrack) return null;

  const artist = getArtistById(currentTrack.artistId);
  const progress = (currentTime / currentTrack.duration) * 100;
  const isLiked = likedTrackIds.has(currentTrack.id);

  const handlePlayPause = () => {
    if (isLoading) return;
    
    try {
      if (isPlaying) {
        pause();
        setSuccessMessage("Playback paused");
        toast.success("Playback paused");
      } else {
        setIsLoading(true);
        setError(null);
        
        // Simulate loading time with potential error
        setTimeout(() => {
          if (Math.random() > 0.1) { // 90% success rate
            resume();
            setIsLoading(false);
            setSuccessMessage("Playing track");
            toast.success(`Now playing: ${currentTrack.title}`);
          } else {
            setIsLoading(false);
            setError("Failed to load track. Please try again.");
            toast.error("Failed to load track. Please try again.");
          }
        }, 500);
      }
    } catch (err) {
      setError("An error occurred while controlling playback");
      toast.error("An error occurred while controlling playback");
      setIsLoading(false);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * currentTrack.duration;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    // In a real implementation, this would control the actual audio volume
  };

  const formatTime = (seconds: number) => {
    const flooredSeconds = Math.floor(seconds);
    const minutes = Math.floor(flooredSeconds / 60);
    const remainingSeconds = flooredSeconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleShuffle = () => {
    setShuffleMode(!shuffleMode);
    if (queue.length > 1) {
      // Shuffle the queue
      const shuffled = [...queue];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setQueue(shuffled);
    }
  };

  const handleRepeat = () => {
    const nextMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
    setRepeatMode(nextMode);
  };

  const handleLikeClick = () => {
    try {
      toggleLikeTrack(currentTrack.id);
      const isLiked = likedTrackIds.has(currentTrack.id);
      setSuccessMessage(isLiked ? "Added to favorites" : "Removed from favorites");
      toast.success(isLiked ? "Added to favorites" : "Removed from favorites");
    } catch (err) {
      setError("Failed to update favorites");
      toast.error("Failed to update favorites");
    }
  };

  const handleClearQueue = () => {
    try {
      clearQueue();
      setSuccessMessage("Queue cleared");
      toast.success("Queue cleared");
    } catch (err) {
      setError("Failed to clear queue");
      toast.error("Failed to clear queue");
    }
  };

  const handlePlayNext = (trackId: string) => {
    try {
      playNext(trackId);
      setSuccessMessage("Track added to next in queue");
      toast.success("Track added to next in queue");
    } catch (err) {
      setError("Failed to add track to next in queue");
      toast.error("Failed to add track to next in queue");
    }
  };

  const handleAddToQueue = (trackId: string) => {
    try {
      addToQueue(trackId);
      setSuccessMessage("Track added to queue");
      toast.success("Track added to queue");
    } catch (err) {
      setError("Failed to add track to queue");
      toast.error("Failed to add track to queue");
    }
  };

  const handleRemoveFromQueue = (trackId: string) => {
    try {
      removeFromQueue(trackId);
      setSuccessMessage("Track removed from queue");
      toast.success("Track removed from queue");
    } catch (err) {
      setError("Failed to remove track from queue");
      toast.error("Failed to remove track from queue");
    }
  };

  // Visualizer data (mock for now)
  const [visualizerData, setVisualizerData] = useState<number[]>([]);
  const [visualizationMode, setVisualizationMode] = useState<'bars' | 'wave' | 'circle'>('bars');
  const [audioEffects, setAudioEffects] = useState<{
    bass: number;
    treble: number;
    reverb: number;
  }>({
    bass: 50,
    treble: 50,
    reverb: 0
  });
  
  useEffect(() => {
    if (isPlaying) {
      // Generate mock visualizer data
      const interval = setInterval(() => {
        const newData = Array(32).fill(0).map(() => Math.random() * 100);
        setVisualizerData(newData);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setVisualizerData([]);
    }
  }, [isPlaying]);
  
  const handleVisualizationModeChange = (mode: 'bars' | 'wave' | 'circle') => {
    setVisualizationMode(mode);
  };
  
  const handleAudioEffectChange = (effect: keyof typeof audioEffects, value: number) => {
    setAudioEffects(prev => ({
      ...prev,
      [effect]: value
    }));
  };

  // Accessibility helpers
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };
  
  useEffect(() => {
    if (currentTrack) {
      announceToScreenReader(`Now playing: ${currentTrack.title} by ${artist?.name || 'Unknown Artist'}`);
    }
  }, [currentTrack, artist]);
  
  useEffect(() => {
    if (successMessage) {
      announceToScreenReader(successMessage);
    }
  }, [successMessage]);
  
  useEffect(() => {
    if (error) {
      announceToScreenReader(error);
    }
  }, [error]);
  
  return (
    <>
      {/* Error and Success Messages */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          <AlertCircle className="w-5 h-5 mr-2" aria-hidden="true" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-white hover:text-gray-200"
            aria-label="Close error message"
          >
            <XCircle className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
      
      {successMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          <CheckCircle className="w-5 h-5 mr-2" aria-hidden="true" />
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-4 text-white hover:text-gray-200"
            aria-label="Close success message"
          >
            <XCircle className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
      
      <audio
        ref={audioRef}
        src={currentTrack.audioUrl || ''}
        onEnded={() => {
          if (repeatMode === 'one') {
            setCurrentTime(0);
            resume();
          } else {
            nextTrack();
          }
        }}
        onError={() => {
          setError("Failed to load audio file");
          toast.error("Failed to load audio file");
          setIsLoading(false);
        }}
        aria-hidden="true"
      />
      
      {/* Desktop Player */}
      <div className="hidden md:flex fixed bottom-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-lg border-t border-magenta/30 z-50 flex items-center px-4 sm:px-6 lg:px-8 text-white">
        <div className="flex items-center w-1/4">
          <img
            src={currentTrack.coverArt}
            alt={`Album cover for ${currentTrack.title}`}
            className="w-14 h-14 rounded-md"
          />
          <div className="ml-4">
            <p className="font-semibold truncate">{currentTrack.title}</p>
            <p className="text-sm text-gray-400 truncate">{artist?.name || 'Unknown Artist'}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-4 text-gray-400 hover:text-white"
            onClick={handleLikeClick}
            aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={isLiked}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-magenta-500 text-magenta-500' : ''}`} />
          </Button>
        </div>
        
        <div className="flex flex-col items-center justify-center w-1/2">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleShuffle}
              variant="ghost"
              size="icon"
              className={`text-gray-400 hover:text-white ${shuffleMode ? 'text-magenta-500' : ''}`}
              aria-label={shuffleMode ? "Turn shuffle off" : "Turn shuffle on"}
              aria-pressed={shuffleMode}
            >
              <Shuffle className="w-6 h-6" />
            </Button>
            
            <Button
              onClick={prevTrack}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              aria-label="Previous track"
            >
              <SkipBack className="w-6 h-6" />
            </Button>
            
            <Button
              onClick={handlePlayPause}
              size="icon"
              className="bg-white text-black rounded-full w-10 h-10 hover:bg-gray-200"
              aria-label={isPlaying ? "Pause" : "Play"}
              aria-pressed={isPlaying}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </Button>
            
            <Button
              onClick={nextTrack}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              aria-label="Next track"
            >
              <SkipForward className="w-6 h-6" />
            </Button>
            
            <Button
              onClick={handleRepeat}
              variant="ghost"
              size="icon"
              className={`text-gray-400 hover:text-white ${repeatMode !== 'off' ? 'text-magenta-500' : ''}`}
              aria-label={
                repeatMode === 'off' ? "Turn repeat off" :
                repeatMode === 'all' ? "Repeat all tracks" :
                "Repeat current track"
              }
              aria-pressed={repeatMode !== 'off'}
            >
              <Repeat className={`w-6 h-6 ${repeatMode === 'one' ? 'rotate-90' : ''}`} />
            </Button>
          </div>
          
          <div className="w-full max-w-xl flex flex-col space-y-1 mt-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
            
            {/* Buffer Progress */}
            {isBuffering && (
              <div
                className="w-full h-1 bg-gray-800 rounded-full overflow-hidden"
                aria-hidden="true"
              >
                <div className="h-full bg-cyan-500/30 animate-pulse" style={{ width: `${bufferProgress}%` }} />
              </div>
            )}
            
            {/* Main Progress */}
            <div
              className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden"
              role="slider"
              aria-label="Track progress"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                  e.preventDefault();
                  const step = e.key === 'ArrowLeft' ? -5 : 5;
                  const newProgress = Math.max(0, Math.min(100, progress + step));
                  const newTime = (newProgress / 100) * currentTrack.duration;
                  setCurrentTime(newTime);
                }
              }}
            >
              <div
                className="absolute top-0 left-0 h-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-end w-1/4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            aria-label="Open queue"
          >
            <ListMusic className="w-5 h-5" />
          </Button>
          
          <Volume2 className="w-5 h-5 text-gray-400" aria-hidden="true" />
          <div className="w-24 ml-2">
            <Slider
              value={[volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={1}
              aria-label="Volume control"
              className="[&>span:first-child]:h-1 [&>span:first-child>span]:bg-white [&>span:first-child>span]:h-1 [&>span:last-child]:bg-magenta [&>span:last-child]:h-3 [&>span:last-child]:w-3"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-gray-400 hover:text-white"
                aria-label="Open settings menu"
                aria-haspopup="menu"
                aria-expanded={isSettingsOpen}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-neutral-800 border-neutral-700 text-white" role="menu">
              <DropdownMenuItem
                onClick={() => setIsQueueOpen(true)}
                aria-label="Open queue"
                role="menuitem"
              >
                <ListMusic className="mr-2 h-4 w-4" />
                <span>Queue</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleClearQueue}
                aria-label="Clear queue"
                role="menuitem"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                <span>Clear Queue</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                aria-label="Start radio"
                role="menuitem"
              >
                <Radio className="mr-2 h-4 w-4" />
                <span>Start Radio</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="View recently played"
                role="menuitem"
              >
                <Clock className="mr-2 h-4 w-4" />
                <span>Recently Played</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Player */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-lg border-t border-magenta/30 z-50 flex items-center justify-between px-4 text-white">
        <div className="flex items-center">
          <img
            src={currentTrack.coverArt}
            alt={`Album cover for ${currentTrack.title}`}
            className="w-10 h-10 rounded"
          />
          <div className="ml-3">
            <p className="font-medium text-sm truncate max-w-[100px]">{currentTrack.title}</p>
            <p className="text-xs text-gray-400 truncate max-w-[100px]">{artist?.name || 'Unknown Artist'}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleShuffle}
            variant="ghost"
            size="icon"
            className={`text-gray-400 hover:text-white ${shuffleMode ? 'text-magenta-500' : ''}`}
            aria-label={shuffleMode ? "Turn shuffle off" : "Turn shuffle on"}
            aria-pressed={shuffleMode}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={prevTrack}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            aria-label="Previous track"
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={handlePlayPause}
            size="icon"
            className="bg-white text-black rounded-full w-8 h-8 hover:bg-gray-200"
            aria-label={isPlaying ? "Pause" : "Play"}
            aria-pressed={isPlaying}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </Button>
          
          <Button
            onClick={nextTrack}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            aria-label="Next track"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={handleRepeat}
            variant="ghost"
            size="icon"
            className={`text-gray-400 hover:text-white ${repeatMode !== 'off' ? 'text-magenta-500' : ''}`}
            aria-label={
              repeatMode === 'off' ? "Turn repeat off" :
              repeatMode === 'all' ? "Repeat all tracks" :
              "Repeat current track"
            }
            aria-pressed={repeatMode !== 'off'}
          >
            <Repeat className={`w-4 h-4 ${repeatMode === 'one' ? 'rotate-90' : ''}`} />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            aria-label="Open queue"
          >
            <ListMusic className="w-4 h-4" />
          </Button>
          
          <Volume2 className="w-4 h-4 text-gray-400" aria-hidden="true" />
        </div>
      </div>

      {/* Queue Modal */}
      {isQueueOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="queue-title"
        >
          <div className="w-full h-3/4 bg-neutral-900 rounded-t-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 id="queue-title" className="text-xl font-bold">Queue</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">{queue.length} tracks</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsQueueOpen(false)}
                  aria-label="Close queue"
                >
                  <Minus className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {queue.length > 0 ? (
                <div className="space-y-2">
                  {queue.map((track, index) => {
                    const trackArtist = getArtistById(track.artistId);
                    const isCurrent = currentTrack?.id === track.id;
                    return (
                      <div
                        key={track.id}
                        className={`flex items-center p-3 rounded-lg ${isCurrent ? 'bg-magenta/20' : 'hover:bg-neutral-800'}`}
                        role="listitem"
                      >
                        <span className="text-gray-400 w-8">{index + 1}</span>
                        <img
                          src={track.coverArt}
                          alt={`Album cover for ${track.title}`}
                          className="w-10 h-10 rounded"
                        />
                        <div className="ml-3 flex-1">
                          <p className="font-medium">{track.title}</p>
                          <p className="text-sm text-gray-400">{trackArtist?.name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">{formatTime(track.duration)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFromQueue(track.id)}
                            aria-label={`Remove ${track.title} from queue`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <ListMusic className="w-12 h-12 mb-4" />
                  <p>No tracks in queue</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Audio Visualizer */}
      {isPlaying && visualizerData.length > 0 && (
        <div
          className="fixed bottom-24 left-0 right-0 h-16 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center px-4"
          aria-label="Audio visualizer"
          role="img"
        >
          {visualizationMode === 'bars' && (
            <div className="flex items-end space-x-1 h-full" aria-label="Bar visualization">
              {visualizerData.map((value, index) => (
                <div
                  key={index}
                  className="w-1 bg-gradient-to-t from-magenta-500 to-cyan-400 rounded-t transition-all duration-100"
                  style={{ height: `${value}%` }}
                  aria-hidden="true"
                />
              ))}
            </div>
          )}
          
          {visualizationMode === 'wave' && (
            <div className="w-full h-full flex items-center" aria-label="Wave visualization">
              <svg viewBox="0 0 1000 100" className="w-full h-full" aria-hidden="true">
                <path
                  d={`M0,50 ${visualizerData.map((value, i) => {
                    const x = (i / visualizerData.length) * 1000;
                    const y = 50 - (value / 100) * 40;
                    return `L${x},${y}`;
                  }).join(' ')} L1000,50 L1000,50 L0,50 Z`}
                  fill="url(#waveGradient)"
                  className="transition-all duration-100"
                />
                <defs>
                  <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
          
          {visualizationMode === 'circle' && (
            <div className="relative w-16 h-16" aria-label="Circle visualization">
              <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#374151"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#circleGradient)"
                  strokeWidth="8"
                  strokeDasharray={283}
                  strokeDashoffset={283 - (283 * visualizerData[0]) / 100}
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-300"
                />
                <defs>
                  <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
        </div>
      )}
      
      {/* Audio Effects Panel */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <div className="bg-neutral-900 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 id="settings-title" className="text-xl font-bold">Audio Effects</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Close audio effects"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Bass</span>
                  <span className="text-sm">{audioEffects.bass}%</span>
                </div>
                <Slider
                  value={[audioEffects.bass]}
                  onValueChange={(value) => handleAudioEffectChange('bass', value[0])}
                  max={100}
                  step={1}
                  aria-label="Bass control"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Treble</span>
                  <span className="text-sm">{audioEffects.treble}%</span>
                </div>
                <Slider
                  value={[audioEffects.treble]}
                  onValueChange={(value) => handleAudioEffectChange('treble', value[0])}
                  max={100}
                  step={1}
                  aria-label="Treble control"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Reverb</span>
                  <span className="text-sm">{audioEffects.reverb}%</span>
                </div>
                <Slider
                  value={[audioEffects.reverb]}
                  onValueChange={(value) => handleAudioEffectChange('reverb', value[0])}
                  max={100}
                  step={1}
                  aria-label="Reverb control"
                />
              </div>
              
              <div className="pt-4 border-t border-neutral-800">
                <h3 className="text-sm font-medium mb-3">Visualization Mode</h3>
                <div className="flex space-x-2">
                  {(['bars', 'wave', 'circle'] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={visualizationMode === mode ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleVisualizationModeChange(mode)}
                      className="flex-1"
                      aria-pressed={visualizationMode === mode}
                      aria-label={`Switch to ${mode} visualization`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default MusicPlayer;