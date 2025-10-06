import { create } from 'zustand';
import { Track } from '@/lib/mock-data';
interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
}
export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  play: (track, queue) => {
    set({
      currentTrack: track,
      isPlaying: true,
      queue: queue || [track],
    });
  },
  pause: () => set({ isPlaying: false }),
  resume: () => {
    if (get().currentTrack) {
      set({ isPlaying: true });
    }
  },
  nextTrack: () => {
    const { currentTrack, queue } = get();
    if (!currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      set({ currentTrack: queue[currentIndex + 1], isPlaying: true });
    } else {
      // Optional: stop playing if at the end of the queue
      set({ isPlaying: false });
    }
  },
  prevTrack: () => {
    const { currentTrack, queue } = get();
    if (!currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      set({ currentTrack: queue[currentIndex - 1], isPlaying: true });
    }
  },
}));