import { render, screen, fireEvent, act } from '@testing-library/react';
import { MusicPlayer } from './MusicPlayer';
import { usePlayerStore } from '../../store/player-store';
import { BrowserRouter } from 'react-router-dom';

// Mock the usePlayerStore hook
jest.mock('../../store/player-store', () => ({
  usePlayerStore: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'test'
  }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()]
}));

// Mock audio element
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn(),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 180,
  volume: 1,
  paused: true
}));

describe('MusicPlayer Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock default player state
    (usePlayerStore as jest.Mock).mockReturnValue({
      currentTrack: null,
      isPlaying: false,
      volume: 1,
      progress: 0,
      duration: 0,
      queue: [],
      currentIndex: -1,
      play: jest.fn(),
      pause: jest.fn(),
      togglePlayPause: jest.fn(),
      next: jest.fn(),
      previous: jest.fn(),
      setVolume: jest.fn(),
      setProgress: jest.fn(),
      clearQueue: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
      playTrack: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      shuffle: jest.fn(),
      repeat: jest.fn(),
      isShuffled: false,
      repeatMode: 'off'
    });
  });

  it('renders correctly when no track is playing', () => {
    render(
      <BrowserRouter>
        <MusicPlayer />
      </BrowserRouter>
    );
    
    // Check if player container is rendered
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    
    // Check if placeholder is displayed
    expect(screen.getByText('No track playing')).toBeInTheDocument();
  });

  it('renders correctly when a track is playing', () => {
    const mockTrack = {
      id: 'track123',
      title: 'Test Track',
      artist: 'Test Artist',
      album: 'Test Album',
      duration: 180,
      url: 'https://example.com/track.mp3',
      coverUrl: 'https://example.com/cover.jpg',
      genre: 'Pop'
    };
    
    (usePlayerStore as jest.Mock).mockReturnValue({
      currentTrack: mockTrack,
      isPlaying: true,
      volume: 1,
      progress: 30,
      duration: 180,
      queue: [],
      currentIndex: 0,
      play: jest.fn(),
      pause: jest.fn(),
      togglePlayPause: jest.fn(),
      next: jest.fn(),
      previous: jest.fn(),
      setVolume: jest.fn(),
      setProgress: jest.fn(),
      clearQueue: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
      playTrack: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      shuffle: jest.fn(),
      repeat: jest.fn(),
      isShuffled: false,
      repeatMode: 'off'
    });
    
    render(
      <BrowserRouter>
        <MusicPlayer />
      </BrowserRouter>
    );
    
    // Check if track info is displayed
    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Test Album')).toBeInTheDocument();
    
    // Check if play/pause button is displayed
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
    
    // Check if progress bar is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    
    // Check if time displays are shown
    expect(screen.getByText('0:30')).toBeInTheDocument(); // Current time
    expect(screen.getByText('3:00')).toBeInTheDocument(); // Total time
    
    // Check if volume control is displayed
    expect(screen.getByRole('slider', { name: /volume/i })).toBeInTheDocument();
    
    // Check if track cover is displayed
    expect(screen.getByAltText('Test Track')).toBeInTheDocument();
  });

  it('handles play/pause toggle', () => {
    const togglePlayPause = jest.fn();
    (usePlayerStore as jest.Mock).mockReturnValue({
      currentTrack: {
        id: 'track123',
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        url: 'https://example.com/track.mp3',
        coverUrl: 'https://example.com/cover.jpg',
        genre: 'Pop'
      },
      isPlaying: false,
      volume: 1,
      progress: 30,
      duration: 180,
      queue: [],
      currentIndex: 0,
      play: jest.fn(),
      pause: jest.fn(),
      togglePlayPause,
      next: jest.fn(),
      previous: jest.fn(),
      setVolume: jest.fn(),
      setProgress: jest.fn(),
      clearQueue: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
      playTrack: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      shuffle: jest.fn(),
      repeat: jest.fn(),
      isShuffled: false,
      repeatMode: 'off'
    });
    
    render(
      <BrowserRouter>
        <MusicPlayer />
      </BrowserRouter>
    );
    
    // Click play/pause button
    fireEvent.click(screen.getByRole('button', { name: /play/i }));
    
    // Check if togglePlayPause function was called
    expect(togglePlayPause).toHaveBeenCalledTimes(1);
  });

  it('handles next track', () => {
    const next = jest.fn();
    (usePlayerStore as jest.Mock).mockReturnValue({
      currentTrack: {
        id: 'track123',
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        url: 'https://example.com/track.mp3',
        coverUrl: 'https://example.com/cover.jpg',
        genre: 'Pop'
      },
      isPlaying: true,
      volume: 1,
      progress: 30,
      duration: 180,
      queue: [],
      currentIndex: 0,
      play: jest.fn(),
      pause: jest.fn(),
      togglePlayPause: jest.fn(),
      next,
      previous: jest.fn(),
      setVolume: jest.fn(),
      setProgress: jest.fn(),
      clearQueue: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
      playTrack: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      shuffle: jest.fn(),
      repeat: jest.fn(),
      isShuffled: false,
      repeatMode: 'off'
    });
    
    render(
      <BrowserRouter>
        <MusicPlayer />
      </BrowserRouter>
    );
    
    // Click next button
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    
    // Check if next function was called
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('handles previous track', () => {
    const previous = jest.fn();
    (usePlayerStore as jest.Mock).mockReturnValue({
      currentTrack: {
        id: 'track123',
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        url: 'https://example.com/track.mp3',
        coverUrl: 'https://example.com/cover.jpg',
        genre: 'Pop'
      },
      isPlaying: true,
      volume: 1,
      progress: 30,
      duration: 180,
      queue: [],
      currentIndex: 0,
      play: jest.fn(),
      pause: jest.fn(),
      togglePlayPause: jest.fn(),
      next: jest.fn(),
      previous,
      setVolume: jest.fn(),
      setProgress: jest.fn(),
      clearQueue: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
      playTrack: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      shuffle: jest.fn(),
      repeat: jest.fn(),
      isShuffled: false,
      repeatMode: 'off'
    });
    
    render(
      <BrowserRouter>
        <MusicPlayer />
      </BrowserRouter>
    );
    
    // Click previous button
    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    
    // Check if previous function was called
    expect(previous).toHaveBeenCalledTimes(1);
  });

  it('handles volume change', () => {
    const setVolume = jest.fn();
    (usePlayerStore as jest.Mock).mockReturnValue({
      currentTrack: {
        id: 'track123',
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        url: 'https://example.com/track.mp3',
        coverUrl: 'https://example.com/cover.jpg',
        genre: 'Pop'
      },
      isPlaying: true,
      volume: 1,
      progress: 30,
      duration: 180,
      queue: [],
      currentIndex: 0,
      play: jest.fn(),
      pause: jest.fn(),
      togglePlayPause: jest.fn(),
      next: jest.fn(),
      previous: jest.fn(),
      setVolume,
      setProgress: jest.fn(),
      clearQueue: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
      playTrack: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      shuffle: jest.fn(),
      repeat: jest.fn(),
      isShuffled: false,
      repeatMode: 'off'
    });
    
    render(
      <BrowserRouter>
        <MusicPlayer />
      </BrowserRouter>
    );
    
    // Change volume
    const volumeSlider = screen.getByRole('slider', { name: /volume/i });
    fireEvent.change(volumeSlider, { target: { value: 0.5 } });
    
    // Check if setVolume function was called with correct value
    expect(setVolume).toHaveBeenCalledWith(0.5);
  });

  it('handles progress change', () => {
    const setProgress = jest.fn();
    (usePlayerStore as jest.Mock).mockReturnValue({
      currentTrack: {
        id: 'track123',
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        url: 'https://example.com/track.mp3',
        coverUrl: 'https://example.com/cover.jpg',
        genre: 'Pop'
      },
      isPlaying: true,
      volume: 1,
      progress: 30,
      duration: 180,
      queue: [],
      currentIndex: 0,
      play: jest.fn(),
      pause: jest.fn(),
      togglePlayPause: jest.fn(),
      next: jest.fn(),
      previous: jest.fn(),
      setVolume: jest.fn(),
      setProgress,
      clearQueue: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
      playTrack: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      shuffle: jest.fn(),
      repeat: jest.fn(),
      isShuffled: false,
      repeatMode: 'off'
    });
    
    render(
      <BrowserRouter>
        <MusicPlayer />
      </BrowserRouter>
    );
    
    // Change progress
    const progressBar = screen.getByRole('progressbar');
    fireEvent.change(progressBar, { target: { value: 60 } });
    
    // Check if setProgress function was called with correct value
    expect(setProgress).toHaveBeenCalledWith(60);
  });

  it('displays repeat modes', () => {
    const repeat = jest.fn();
    (usePlayerStore as jest.Mock).mockReturnValue({
      currentTrack: {
        id: 'track123',
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        url: 'https://example.com/track.mp3',
        coverUrl: 'https://example.com/cover.jpg',
        genre: 'Pop'
      },
      isPlaying: true,
      volume: 1,
      progress: 30,
      duration: 180,
      queue: [],
      currentIndex: 0,
      play: jest.fn(),
      pause: jest.fn(),
      togglePlayPause: jest.fn(),
      next: jest.fn(),
      previous: jest.fn(),
      setVolume: jest.fn(),
      setProgress: jest.fn(),
      clearQueue: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
      playTrack: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      shuffle: jest.fn(),
      repeat,
      isShuffled: false,
      repeatMode: 'one'
    });
    
    render(
      <BrowserRouter>
        <MusicPlayer />
      </BrowserRouter>
    );
    
    // Check if repeat button is displayed with correct icon
    expect(screen.getByRole('button', { name: /repeat one/i })).toBeInTheDocument();
    
    // Click repeat button
    fireEvent.click(screen.getByRole('button', { name: /repeat one/i }));
    
    // Check if repeat function was called
    expect(repeat).toHaveBeenCalledTimes(1);
  });

  it('displays shuffle mode', () => {
    const shuffle = jest.fn();
    (usePlayerStore as jest.Mock).mockReturnValue({
      currentTrack: {
        id: 'track123',
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        url: 'https://example.com/track.mp3',
        coverUrl: 'https://example.com/cover.jpg',
        genre: 'Pop'
      },
      isPlaying: true,
      volume: 1,
      progress: 30,
      duration: 180,
      queue: [],
      currentIndex: 0,
      play: jest.fn(),
      pause: jest.fn(),
      togglePlayPause: jest.fn(),
      next: jest.fn(),
      previous: jest.fn(),
      setVolume: jest.fn(),
      setProgress: jest.fn(),
      clearQueue: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
      playTrack: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      shuffle,
      repeat: jest.fn(),
      isShuffled: true,
      repeatMode: 'off'
    });
    
    render(
      <BrowserRouter>
        <MusicPlayer />
      </BrowserRouter>
    );
    
    // Check if shuffle button is displayed with correct icon
    expect(screen.getByRole('button', { name: /shuffle on/i })).toBeInTheDocument();
    
    // Click shuffle button
    fireEvent.click(screen.getByRole('button', { name: /shuffle on/i }));
    
    // Check if shuffle function was called
    expect(shuffle).toHaveBeenCalledTimes(1);
  });

  it('handles queue display', () => {
    (usePlayerStore as jest.Mock).mockReturnValue({
      currentTrack: {
        id: 'track123',
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        url: 'https://example.com/track.mp3',
        coverUrl: 'https://example.com/cover.jpg',
        genre: 'Pop'
      },
      isPlaying: true,
      volume: 1,
      progress: 30,
      duration: 180,
      queue: [
        { id: 'track1', title: 'Track 1', artist: 'Artist 1' },
        { id: 'track2', title: 'Track 2', artist: 'Artist 2' },
        { id: 'track3', title: 'Track 3', artist: 'Artist 3' }
      ],
      currentIndex: 0,
      play: jest.fn(),
      pause: jest.fn(),
      togglePlayPause: jest.fn(),
      next: jest.fn(),
      previous: jest.fn(),
      setVolume: jest.fn(),
      setProgress: jest.fn(),
      clearQueue: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
      playTrack: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      shuffle: jest.fn(),
      repeat: jest.fn(),
      isShuffled: false,
      repeatMode: 'off'
    });
    
    render(
      <BrowserRouter>
        <MusicPlayer />
      </BrowserRouter>
    );
    
    // Check if queue button is displayed
    expect(screen.getByRole('button', { name: /queue/i })).toBeInTheDocument();
    
    // Click queue button
    fireEvent.click(screen.getByRole('button', { name: /queue/i }));
    
    // Check if queue items are displayed
    expect(screen.getByText('Track 1')).toBeInTheDocument();
    expect(screen.getByText('Track 2')).toBeInTheDocument();
    expect(screen.getByText('Track 3')).toBeInTheDocument();
  });

  it('handles keyboard shortcuts', () => {
    const togglePlayPause = jest.fn();
    const next = jest.fn();
    const previous = jest.fn();
    
    (usePlayerStore as jest.Mock).mockReturnValue({
      currentTrack: {
        id: 'track123',
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        url: 'https://example.com/track.mp3',
        coverUrl: 'https://example.com/cover.jpg',
        genre: 'Pop'
      },
      isPlaying: true,
      volume: 1,
      progress: 30,
      duration: 180,
      queue: [],
      currentIndex: 0,
      play: jest.fn(),
      pause: jest.fn(),
      togglePlayPause,
      next,
      previous,
      setVolume: jest.fn(),
      setProgress: jest.fn(),
      clearQueue: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
      playTrack: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      shuffle: jest.fn(),
      repeat: jest.fn(),
      isShuffled: false,
      repeatMode: 'off'
    });
    
    render(
      <BrowserRouter>
        <MusicPlayer />
      </BrowserRouter>
    );
    
    // Simulate space key press (play/pause)
    fireEvent.keyDown(document, { key: ' ', code: 'Space' });
    expect(togglePlayPause).toHaveBeenCalledTimes(1);
    
    // Simulate right arrow key press (next)
    fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(next).toHaveBeenCalledTimes(1);
    
    // Simulate left arrow key press (previous)
    fireEvent.keyDown(document, { key: 'ArrowLeft', code: 'ArrowLeft' });
    expect(previous).toHaveBeenCalledTimes(1);
    
    // Simulate up arrow key press (volume up)
    fireEvent.keyDown(document, { key: 'ArrowUp', code: 'ArrowUp' });
    expect(setVolume).toHaveBeenCalledWith(Math.min(1, 1 + 0.1)); // Assuming volume increment is 0.1
    
    // Simulate down arrow key press (volume down)
    fireEvent.keyDown(document, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(setVolume).toHaveBeenCalledWith(Math.max(0, 1 - 0.1)); // Assuming volume decrement is 0.1
  });

  it('displays loading state when loading track', () => {
    (usePlayerStore as jest.Mock).mockReturnValue({
      currentTrack: {
        id: 'track123',
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        url: 'https://example.com/track.mp3',
        coverUrl: 'https://example.com/cover.jpg',
        genre: 'Pop'
      },
      isPlaying: false,
      isLoading: true,
      volume: 1,
      progress: 0,
      duration: 0,
      queue: [],
      currentIndex: 0,
      play: jest.fn(),
      pause: jest.fn(),
      togglePlayPause: jest.fn(),
      next: jest.fn(),
      previous: jest.fn(),
      setVolume: jest.fn(),
      setProgress: jest.fn(),
      clearQueue: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
      playTrack: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      shuffle: jest.fn(),
      repeat: jest.fn(),
      isShuffled: false,
      repeatMode: 'off'
    });
    
    render(
      <BrowserRouter>
        <MusicPlayer />
      </BrowserRouter>
    );
    
    // Check if loading spinner is displayed
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays accessibility attributes correctly', () => {
    (usePlayerStore as jest.Mock).mockReturnValue({
      currentTrack: {
        id: 'track123',
        title: 'Test Track',
        artist: 'Test Artist',
        album: 'Test Album',
        duration: 180,
        url: 'https://example.com/track.mp3',
        coverUrl: 'https://example.com/cover.jpg',
        genre: 'Pop'
      },
      isPlaying: true,
      volume: 1,
      progress: 30,
      duration: 180,
      queue: [],
      currentIndex: 0,
      play: jest.fn(),
      pause: jest.fn(),
      togglePlayPause: jest.fn(),
      next: jest.fn(),
      previous: jest.fn(),
      setVolume: jest.fn(),
      setProgress: jest.fn(),
      clearQueue: jest.fn(),
      addToQueue: jest.fn(),
      removeFromQueue: jest.fn(),
      playTrack: jest.fn(),
      playNext: jest.fn(),
      playPrevious: jest.fn(),
      shuffle: jest.fn(),
      repeat: jest.fn(),
      isShuffled: false,
      repeatMode: 'off'
    });
    
    render(
      <BrowserRouter>
        <MusicPlayer />
      </BrowserRouter>
    );
    
    // Check if player has correct role
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    
    // Check if buttons have correct aria-labels
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /volume/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /queue/i })).toBeInTheDocument();
  });
});