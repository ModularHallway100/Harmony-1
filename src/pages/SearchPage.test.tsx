import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '../../src/contexts/ClerkUserContext';
import { UserProvider } from '../../src/store/user-store';
import { LibraryProvider } from '../../src/store/library-store';
import { PlayerProvider } from '../../src/store/player-store';
import { PromptProvider } from '../../src/store/prompt-store';
import SearchPage from './SearchPage';
import { theme } from '../../src/styles/theme';

// Mock react-query
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: jest.fn(),
  useInfiniteQuery: jest.fn(),
  useDebouncedCallback: jest.fn((callback) => callback)
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ search: '' }),
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
      <p>{content.artist}</p>
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
          <p>{artist.genre?.join(', ')}</p>
        </div>
      ))}
    </div>
  )
);

jest.mock('../../src/components/shared/PromptManager', () => 
  ({ onPromptSelect }) => (
    <div data-testid="prompt-manager">
      {onPromptSelect && (
        <button onClick={() => onPromptSelect('Test Prompt')}>Select Prompt</button>
      )}
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

describe('SearchPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders search page with search input', () => {
    // Mock useQuery and useInfiniteQuery
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation((key) => {
      if (key === ['searchResults', '']) {
        return {
          data: [],
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

    render(<SearchPage />, { wrapper: createWrapper });

    // Check for search input
    expect(screen.getByPlaceholderText('Search music, artists, prompts...')).toBeInTheDocument();

    // Check for tabs
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
    expect(screen.getByText('Artists')).toBeInTheDocument();
    expect(screen.getByText('Prompts')).toBeInTheDocument();
  });

  it('handles search input change', async () => {
    // Mock useQuery and useInfiniteQuery
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation((key) => {
      if (key === ['searchResults', 'test']) {
        return {
          data: [
            { id: '1', title: 'Test Song', type: 'music', artist: 'Test Artist' }
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

    render(<SearchPage />, { wrapper: createWrapper });

    // Find and type in search input
    const searchInput = screen.getByPlaceholderText('Search music, artists, prompts...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for search results to load
    await waitFor(() => {
      expect(screen.getByText('Test Song')).toBeInTheDocument();
    });
  });

  it('handles tab switching', async () => {
    // Mock useQuery and useInfiniteQuery
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation((key) => {
      if (key === ['searchResults', 'test']) {
        return {
          data: [
            { id: '1', title: 'Test Song', type: 'music', artist: 'Test Artist' },
            { id: '2', name: 'Test Artist', type: 'artist', genre: ['Pop'] },
            { id: '3', title: 'Test Prompt', type: 'prompt', description: 'Test description' }
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

    render(<SearchPage />, { wrapper: createWrapper });

    // Type search query
    const searchInput = screen.getByPlaceholderText('Search music, artists, prompts...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for results to load
    await waitFor(() => {
      expect(screen.getByText('Test Song')).toBeInTheDocument();
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
      expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    });

    // Switch to Music tab
    fireEvent.click(screen.getByText('Music'));

    // Check that only music results are shown
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.queryByText('Test Artist')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Prompt')).not.toBeInTheDocument();

    // Switch to Artists tab
    fireEvent.click(screen.getByText('Artists'));

    // Check that only artist results are shown
    expect(screen.queryByText('Test Song')).not.toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.queryByText('Test Prompt')).not.toBeInTheDocument();

    // Switch to Prompts tab
    fireEvent.click(screen.getByText('Prompts'));

    // Check that only prompt results are shown
    expect(screen.queryByText('Test Song')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Artist')).not.toBeInTheDocument();
    expect(screen.getByText('Test Prompt')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    // Mock useQuery and useInfiniteQuery to return loading state
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

    render(<SearchPage />, { wrapper: createWrapper });

    // Check for loading spinner
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    // Mock useQuery and useInfiniteQuery to return error state
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
      isError: true,
      error: new Error('Search failed')
    }));

    useInfiniteQuery.mockImplementation(() => ({
      data: { pages: [] },
      isLoading: false,
      isError: true,
      error: new Error('Search failed'),
      fetchNextPage: jest.fn(),
      hasNextPage: false
    }));

    render(<SearchPage />, { wrapper: createWrapper });

    // Check for error message
    expect(screen.getByText('Search failed')).toBeInTheDocument();
  });

  it('handles play button click', async () => {
    // Mock useQuery and useInfiniteQuery
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation((key) => {
      if (key === ['searchResults', 'test']) {
        return {
          data: [
            { id: '1', title: 'Test Song', type: 'music', artist: 'Test Artist' }
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

    render(<SearchPage />, { wrapper: createWrapper });

    // Type search query
    const searchInput = screen.getByPlaceholderText('Search music, artists, prompts...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for results to load
    await waitFor(() => {
      expect(screen.getByText('Test Song')).toBeInTheDocument();
    });

    // Click play button
    const playButton = screen.getByText('Play');
    fireEvent.click(playButton);

    // Wait for player to update
    await waitFor(() => {
      expect(screen.getByText('Now Playing: Test Song')).toBeInTheDocument();
    });
  });

  it('handles artist click', async () => {
    // Mock useQuery and useInfiniteQuery
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation((key) => {
      if (key === ['searchResults', 'test']) {
        return {
          data: [
            { id: '2', name: 'Test Artist', type: 'artist', genre: ['Pop'] }
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

    // Mock navigation
    const mockNavigate = jest.fn();
    jest.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);

    render(<SearchPage />, { wrapper: createWrapper });

    // Type search query
    const searchInput = screen.getByPlaceholderText('Search music, artists, prompts...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for results to load
    await waitFor(() => {
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
    });

    // Click on artist
    const artistItem = screen.getByTestId('artist-item');
    fireEvent.click(artistItem);

    // Check if navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/artist/2');
  });

  it('handles prompt selection', async () => {
    // Mock useQuery and useInfiniteQuery
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation((key) => {
      if (key === ['searchResults', 'test']) {
        return {
          data: [
            { id: '3', title: 'Test Prompt', type: 'prompt', description: 'Test description' }
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

    render(<SearchPage />, { wrapper: createWrapper });

    // Type search query
    const searchInput = screen.getByPlaceholderText('Search music, artists, prompts...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for results to load
    await waitFor(() => {
      expect(screen.getByText('Test Prompt')).toBeInTheDocument();
    });

    // Click prompt select button
    const promptButton = screen.getByText('Select Prompt');
    fireEvent.click(promptButton);

    // Wait for prompt to be selected
    await waitFor(() => {
      expect(screen.getByText('Selected Prompt: Test Prompt')).toBeInTheDocument();
    });
  });

  it('handles empty search results', async () => {
    // Mock useQuery and useInfiniteQuery
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation((key) => {
      if (key === ['searchResults', 'noresults']) {
        return {
          data: [],
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

    render(<SearchPage />, { wrapper: createWrapper });

    // Type search query with no results
    const searchInput = screen.getByPlaceholderText('Search music, artists, prompts...');
    fireEvent.change(searchInput, { target: { value: 'noresults' } });

    // Wait for results to load
    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('handles pagination', async () => {
    // Mock useQuery and useInfiniteQuery with multiple pages
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation((key) => {
      if (key === ['searchResults', 'test']) {
        return {
          data: [
            { id: '1', title: 'Test Song 1', type: 'music', artist: 'Test Artist' }
          ],
          isLoading: false,
          isError: false
        };
      }
      return { data: [], isLoading: false, isError: false };
    });

    useInfiniteQuery.mockImplementation((key) => {
      if (key === ['searchResults', 'test', 'infinite']) {
        return {
          data: {
            pages: [
              [
                { id: '2', title: 'Test Song 2', type: 'music', artist: 'Test Artist' }
              ],
              [
                { id: '3', title: 'Test Song 3', type: 'music', artist: 'Test Artist' }
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

    render(<SearchPage />, { wrapper: createWrapper });

    // Type search query
    const searchInput = screen.getByPlaceholderText('Search music, artists, prompts...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for initial results to load
    await waitFor(() => {
      expect(screen.getByText('Test Song 1')).toBeInTheDocument();
    });

    // Check for load more button
    const loadMoreButton = screen.getByText('Load More');
    expect(loadMoreButton).toBeInTheDocument();

    // Click load more button
    fireEvent.click(loadMoreButton);

    // Wait for more results to load
    await waitFor(() => {
      expect(screen.getByText('Test Song 2')).toBeInTheDocument();
      expect(screen.getByText('Test Song 3')).toBeInTheDocument();
    });
  });

  it('handles search from URL parameters', () => {
    // Mock useLocation with search parameter
    jest.mocked(require('react-router-dom').useLocation).mockReturnValue({ 
      search: '?query=preset' 
    });

    // Mock useQuery and useInfiniteQuery
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation((key) => {
      if (key === ['searchResults', 'preset']) {
        return {
          data: [
            { id: '1', title: 'Preset Song', type: 'music', artist: 'Test Artist' }
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

    render(<SearchPage />, { wrapper: createWrapper });

    // Check that search input is populated
    const searchInput = screen.getByPlaceholderText('Search music, artists, prompts...');
    expect(searchInput).toHaveValue('preset');

    // Check that results are loaded
    expect(screen.getByText('Preset Song')).toBeInTheDocument();
  });

  it('handles search with filters', async () => {
    // Mock useQuery and useInfiniteQuery
    const { useQuery, useInfiniteQuery } = require('react-query');
    
    useQuery.mockImplementation((key) => {
      if (key === ['searchResults', 'test', { type: 'music', genre: 'Pop' }]) {
        return {
          data: [
            { id: '1', title: 'Pop Test Song', type: 'music', artist: 'Test Artist', genre: ['Pop'] }
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

    render(<SearchPage />, { wrapper: createWrapper });

    // Type search query
    const searchInput = screen.getByPlaceholderText('Search music, artists, prompts...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Wait for results to load
    await waitFor(() => {
      expect(screen.getByText('Pop Test Song')).toBeInTheDocument();
    });

    // Apply genre filter (assuming there's a filter dropdown)
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);

    const genreFilter = screen.getByText('Pop');
    fireEvent.click(genreFilter);

    // Check that filtered results are shown
    expect(screen.getByText('Pop Test Song')).toBeInTheDocument();
  });

  it('handles responsive layout', () => {
    // Mock useQuery and useInfiniteQuery
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
    render(<SearchPage />, { 
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
    expect(screen.getByTestId('search-page')).toHaveClass('mobile-layout');
  });

  it('handles keyboard shortcuts', () => {
    // Mock useQuery and useInfiniteQuery
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

    render(<SearchPage />, { wrapper: createWrapper });

    // Focus on search input
    const searchInput = screen.getByPlaceholderText('Search music, artists, prompts...');
    searchInput.focus();

    // Simulate keyboard shortcut (Ctrl+K)
    fireEvent.keyDown(searchInput, { key: 'k', ctrlKey: true });

    // Check that search input is focused
    expect(searchInput).toHaveFocus();
  });
});