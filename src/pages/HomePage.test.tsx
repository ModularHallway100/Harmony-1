import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '../../src/contexts/ClerkUserContext';
import { UserProvider } from '../../src/store/user-store';
import { LibraryProvider } from '../../src/store/library-store';
import { PlayerProvider } from '../../src/store/player-store';
import { PromptProvider } from '../../src/store/prompt-store';
import HomePage from './HomePage';
import { theme } from '../../src/styles/theme';

// Mock react-query
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useInfiniteQuery: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock Clerk
jest.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: {
      id: 'user123',
      email: 'test@example.com',
      username: 'testuser',
      fullName: 'Test User',
      imageUrl: 'https://example.com/avatar.jpg'
    },
    isSignedIn: true
  })
}));

// Mock components
jest.mock('../../src/components/shared/ContentCard', () => 
  ({ content, onPlay }) => (
    <div data-testid="content-card">
      <h3>{content.title}</h3>
      <button onClick={() => onPlay && onPlay(content)}>Play</button>
    </div>
  )
);

jest.mock('../../src/components/shared/ArtistGallery', () => 
  ({ artists }) => (
    <div data-testid="artist-gallery">
      {artists.map(artist => (
        <div key={artist.id} data-testid="artist-item">
          <h3>{artist.name}</h3>
        </div>
      ))}
    </div>
  )
);

jest.mock('../../src/components/shared/PromptManager', () => 
  ({ onPromptSelect }) => (
    <div data-testid="prompt-manager">
      <button onClick={() => onPromptSelect('Test Prompt')}>Select Prompt</button>
    </div>
  )
);

jest.mock('../../src/components/shared/ChallengesAndContests', () => 
  () => (
    <div data-testid="challenges-contests">
      <h3>Challenges & Contests</h3>
    </div>
  )
);

jest.mock('../../src/components/shared/CommunityForums', () => 
  () => (
    <div data-testid="community-forums">
      <h3>Community Forums</h3>
    </div>
  )
);

const createWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <UserProvider>
              <LibraryProvider>
                <PlayerProvider>
                  <PromptProvider>
                    {children}
                  </PromptProvider>
                </PlayerProvider>
              </LibraryProvider>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders homepage with all sections', () => {
    // Mock useQuery hooks
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation((key, queryFn) => {
      if (key === ['recommendedMusic']) {
        return {
          data: [
            { id: '1', title: 'Recommended Song 1', artist: 'Artist 1', duration: 180 },
            { id: '2', title: 'Recommended Song 2', artist: 'Artist 2', duration: 200 }
          ],
          isLoading: false,
          isError: false
        };
      }
      
      if (key === ['trendingMusic']) {
        return {
          data: [
            { id: '3', title: 'Trending Song 1', artist: 'Artist 3', duration: 190 },
            { id: '4', title: 'Trending Song 2', artist: 'Artist 4', duration: 210 }
          ],
          isLoading: false,
          isError: false
        };
      }
      
      if (key === ['newReleases']) {
        return {
          data: [
            { id: '5', title: 'New Release 1', artist: 'Artist 5', duration: 185 },
            { id: '6', title: 'New Release 2', artist: 'Artist 6', duration: 195 }
          ],
          isLoading: false,
          isError: false
        };
      }
      
      if (key === ['topArtists']) {
        return {
          data: [
            { id: '7', name: 'Top Artist 1', genre: ['Pop'] },
            { id: '8', name: 'Top Artist 2', genre: ['Rock'] }
          ],
          isLoading: false,
          isError: false
        };
      }
      
      if (key === ['challenges']) {
        return {
          data: [
            { id: '9', title: 'Challenge 1', description: 'Description 1' },
            { id: '10', title: 'Challenge 2', description: 'Description 2' }
          ],
          isLoading: false,
          isError: false
        };
      }
      
      return { data: [], isLoading: false, isError: false };
    });

    useInfiniteQuery.mockImplementation((key, queryFn) => {
      if (key === ['communityPosts']) {
        return {
          data: {
            pages: [
              [
                { id: '11', title: 'Community Post 1', content: 'Content 1' },
                { id: '12', title: 'Community Post 2', content: 'Content 2' }
              ]
            ]
          },
          isLoading: false,
          isError: false,
          fetchNextPage: jest.fn(),
          hasNextPage: false
        };
      }
      
      return { data: { pages: [] }, isLoading: false, isError: false, fetchNextPage: jest.fn(), hasNextPage: false };
    });

    render(<HomePage />, { wrapper: createWrapper });

    // Check for main sections
    expect(screen.getByText('Recommended for You')).toBeInTheDocument();
    expect(screen.getByText('Trending Now')).toBeInTheDocument();
    expect(screen.getByText('New Releases')).toBeInTheDocument();
    expect(screen.getByText('Top Artists')).toBeInTheDocument();
    expect(screen.getByText('Challenges & Contests')).toBeInTheDocument();
    expect(screen.getByText('Community Forums')).toBeInTheDocument();

    // Check for content cards
    expect(screen.getAllByTestId('content-card')).toHaveLength(6); // 2 for each music section

    // Check for artists
    expect(screen.getAllByTestId('artist-item')).toHaveLength(2);

    // Check for prompts
    expect(screen.getByTestId('prompt-manager')).toBeInTheDocument();
  });

  it('shows loading states', () => {
    // Mock useQuery hooks to return loading states
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation(() => ({
      data: [],
      isLoading: true,
      isError: false
    }));

    useInfiniteQuery.mockImplementation(() => ({
      data: { pages: [] },
      isLoading: true,
      isError: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false
    }));

    render(<HomePage />, { wrapper: createWrapper });

    // Check for loading spinners
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error states', () => {
    // Mock useQuery hooks to return error states
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
      isError: true,
      error: new Error('Failed to load data')
    }));

    useInfiniteQuery.mockImplementation(() => ({
      data: { pages: [] },
      isLoading: false,
      isError: true,
      error: new Error('Failed to load posts'),
      fetchNextPage: jest.fn(),
      hasNextPage: false
    }));

    render(<HomePage />, { wrapper: createWrapper });

    // Check for error messages
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('handles play button clicks', async () => {
    // Mock useQuery hooks
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation((key) => {
      if (key === ['recommendedMusic']) {
        return {
          data: [
            { id: '1', title: 'Song 1', artist: 'Artist 1', duration: 180 }
          ],
          isLoading: false,
          isError: false
        };
      }
      return { data: [], isLoading: false, isError: false };
    });

    useInfiniteQuery.mockImplementation(() => ({
      data: { pages: [] },
      isLoading: false,
      isError: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false
    }));

    render(<HomePage />, { wrapper: createWrapper });

    // Find and click the play button
    const playButton = screen.getByText('Play');
    fireEvent.click(playButton);

    // Wait for the player to update
    await waitFor(() => {
      expect(screen.getByText('Now Playing: Song 1')).toBeInTheDocument();
    });
  });

  it('handles prompt selection', async () => {
    // Mock useQuery hooks
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
      isError: false
    }));

    useInfiniteQuery.mockImplementation(() => ({
      data: { pages: [] },
      isLoading: false,
      isError: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false
    }));

    render(<HomePage />, { wrapper: createWrapper });

    // Find and click the prompt select button
    const promptButton = screen.getByText('Select Prompt');
    fireEvent.click(promptButton);

    // Wait for the prompt to be selected
    await waitFor(() => {
      expect(screen.getByText('Selected Prompt: Test Prompt')).toBeInTheDocument();
    });
  });

  it('handles load more for community posts', async () => {
    // Mock useInfiniteQuery with multiple pages
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
      isError: false
    }));

    useInfiniteQuery.mockImplementation((key) => {
      if (key === ['communityPosts']) {
        return {
          data: {
            pages: [
              [
                { id: '1', title: 'Post 1', content: 'Content 1' }
              ],
              [
                { id: '2', title: 'Post 2', content: 'Content 2' }
              ]
            ]
          },
          isLoading: false,
          isError: false,
          fetchNextPage: jest.fn(),
          hasNextPage: true
        };
      }
      return { data: { pages: [] }, isLoading: false, isError: false, fetchNextPage: jest.fn(), hasNextPage: false };
    });

    render(<HomePage />, { wrapper: createWrapper });

    // Check for initial posts
    expect(screen.getByText('Post 1')).toBeInTheDocument();

    // Find and click the load more button
    const loadMoreButton = screen.getByText('Load More');
    fireEvent.click(loadMoreButton);

    // Wait for more posts to load
    await waitFor(() => {
      expect(screen.getByText('Post 2')).toBeInTheDocument();
    });
  });

  it('handles user authentication state', () => {
    // Mock Clerk to return signed out state
    jest.mocked(require('@clerk/clerk-react').useUser).mockReturnValue({
      user: null,
      isSignedIn: false
    });

    // Mock useQuery hooks
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
      isError: false
    }));

    useInfiniteQuery.mockImplementation(() => ({
      data: { pages: [] },
      isLoading: false,
      isError: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false
    }));

    render(<HomePage />, { wrapper: createWrapper });

    // Check for sign in prompt
    expect(screen.getByText('Please sign in to view personalized content')).toBeInTheDocument();
  });

  it('handles subscription status', () => {
    // Mock user with basic subscription
    jest.mocked(require('@clerk/clerk-react').useUser).mockReturnValue({
      user: {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
        imageUrl: 'https://example.com/avatar.jpg',
        publicMetadata: { subscription: 'basic' }
      },
      isSignedIn: true
    });

    // Mock useQuery hooks
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation((key) => {
      if (key === ['recommendedMusic']) {
        return {
          data: [
            { id: '1', title: 'Premium Song', artist: 'Artist 1', duration: 180, isPremium: true }
          ],
          isLoading: false,
          isError: false
        };
      }
      return { data: [], isLoading: false, isError: false };
    });

    useInfiniteQuery.mockImplementation(() => ({
      data: { pages: [] },
      isLoading: false,
      isError: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false
    }));

    render(<HomePage />, { wrapper: createWrapper });

    // Check for premium content lock
    expect(screen.getByText('Premium Content')).toBeInTheDocument();
  });

  it('handles responsive layout', () => {
    // Mock useQuery hooks
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
      isError: false
    }));

    useInfiniteQuery.mockImplementation(() => ({
      data: { pages: [] },
      isLoading: false,
      isError: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false
    }));

    // Render with small screen
    render(<HomePage />, { 
      wrapper: createWrapper,
      container: document.createElement('div')
    });

    // Set small screen width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));

    // Check for responsive layout changes
    expect(screen.getByTestId('home-page')).toHaveClass('mobile-layout');
  });

  it('handles theme changes', () => {
    // Mock useQuery hooks
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
      isError: false
    }));

    useInfiniteQuery.mockImplementation(() => ({
      data: { pages: [] },
      isLoading: false,
      isError: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false
    }));

    render(<HomePage />, { wrapper: createWrapper });

    // Check for dark mode styles
    expect(screen.getByTestId('home-page')).toHaveClass('light-theme');

    // Simulate theme change
    fireEvent.click(screen.getByText('Toggle Theme'));

    // Check for theme change
    expect(screen.getByTestId('home-page')).toHaveClass('dark-theme');
  });

  it('handles navigation to different pages', () => {
    // Mock useQuery hooks
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
      isError: false
    }));

    useInfiniteQuery.mockImplementation(() => ({
      data: { pages: [] },
      isLoading: false,
      isError: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false
    }));

    // Mock navigation
    const mockNavigate = jest.fn();
    jest.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);

    render(<HomePage />, { wrapper: createWrapper });

    // Find and click a navigation link
    const libraryLink = screen.getByText('Library');
    fireEvent.click(libraryLink);

    // Check if navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/library');
  });

  it('handles search functionality', () => {
    // Mock useQuery hooks
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
      isError: false
    }));

    useInfiniteQuery.mockImplementation(() => ({
      data: { pages: [] },
      isLoading: false,
      isError: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false
    }));

    render(<HomePage />, { wrapper: createWrapper });

    // Find and type in search input
    const searchInput = screen.getByPlaceholderText('Search music, artists, prompts...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Check if search state was updated
    expect(searchInput).toHaveValue('test');
  });
});