import { create } from 'zustand';
import { Track } from '@/lib/mock-data';
import { getTrackById } from '@/lib/mock-data';

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  repeatMode: RepeatMode;
  shuffleMode: boolean;
  recentlyPlayed: Track[];
  playHistory: Track[];
  
  // Player controls
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  
  // Queue management
  setQueue: (tracks: Track[]) => void;
  addToQueue: (trackId: string) => void;
  removeFromQueue: (trackId: string) => void;
  playNext: (trackId: string) => void;
  clearQueue: () => void;
  
  // Playback modes
  setRepeatMode: (mode: RepeatMode) => void;
  setShuffleMode: (enabled: boolean) => void;
  
  // History tracking
  addToHistory: (track: Track) => void;
  getRecentlyPlayed: () => Track[];
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  repeatMode: 'off',
  shuffleMode: false,
  recentlyPlayed: [],
  playHistory: [],
  
  play: (track, queue) => {
    set({
      currentTrack: track,
      isPlaying: true,
      queue: queue || [track],
      playHistory: [track, ...get().playHistory.slice(0, 49)], // Keep last 50 tracks
    });
  },
  
  pause: () => set({ isPlaying: false }),
  
  resume: () => {
    if (get().currentTrack) {
      set({ isPlaying: true });
    }
  },
  
  nextTrack: () => {
    const { currentTrack, queue, repeatMode } = get();
    if (!currentTrack) return;
    
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    let nextTrack: Track | null = null;
    
    if (repeatMode === 'one') {
      // Repeat current track
      nextTrack = currentTrack;
    } else if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      // Play next track in queue
      nextTrack = queue[currentIndex + 1];
    } else if (repeatMode === 'all') {
      // Loop from beginning
      nextTrack = queue[0];
    }
    
    if (nextTrack) {
      set({
        currentTrack: nextTrack,
        isPlaying: true,
        playHistory: [nextTrack, ...get().playHistory.slice(0, 49)]
      });
    } else {
      // Stop playing if at the end of the queue and not repeating
      set({ isPlaying: false });
    }
  },
  
  prevTrack: () => {
    const { currentTrack, queue } = get();
    if (!currentTrack) return;
    
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      set({
        currentTrack: queue[currentIndex - 1],
        isPlaying: true
      });
    } else {
      // Go to the last track if at the beginning
      set({
        currentTrack: queue[queue.length - 1],
        isPlaying: true
      });
    }
  },
  
  seek: (time: number) => {
    // In a real implementation, this would seek the actual audio element
    set({ currentTrack: { ...get().currentTrack!, duration: time } });
  },
  
  setVolume: (volume: number) => {
    // In a real implementation, this would set the audio volume
    set({ volume });
  },
  
  setQueue: (tracks: Track[]) => {
    set({ queue: tracks });
  },
  
  addToQueue: (trackId: string) => {
    const track = getTrackById(trackId);
    if (track) {
      set(state => ({
        queue: [...state.queue, track]
      }));
    }
  },
  
  removeFromQueue: (trackId: string) => {
    set(state => ({
      queue: state.queue.filter(t => t.id !== trackId)
    }));
  },
  
  playNext: (trackId: string) => {
    const track = getTrackById(trackId);
    if (track) {
      const { queue, currentTrack } = get();
      const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
      
      if (currentIndex !== -1 && currentIndex < queue.length - 1) {
        // Insert after current track
        const newQueue = [
          ...queue.slice(0, currentIndex + 1),
          track,
          ...queue.slice(currentIndex + 1)
        ];
        set({ queue: newQueue });
      } else {
        // Add to end of queue
        set(state => ({
          queue: [...state.queue, track]
        }));
      }
    }
  },
  
  clearQueue: () => {
    set({ queue: [] });
  },
  
  setRepeatMode: (mode: RepeatMode) => {
    set({ repeatMode: mode });
  },
  
  setShuffleMode: (enabled: boolean) => {
    set({ shuffleMode: enabled });
  },
  
  addToHistory: (track: Track) => {
    set(state => ({
      playHistory: [track, ...state.playHistory.slice(0, 49)]
    }));
  },
  
  getRecentlyPlayed: () => {
    const { playHistory } = get();
    // Return unique tracks, most recent first
    const uniqueTracks = Array.from(
      new Map(playHistory.map(track => [track.id, track])).values()
    );
    return uniqueTracks.slice(0, 10);
  },
}));