import { render, screen, fireEvent, act } from '@testing-library/react';
import { Header } from './Header';
import { useTheme } from '../../hooks/use-theme';
import { useAuth } from '../../contexts/ClerkUserContext';
import { BrowserRouter } from 'react-router-dom';

// Mock the useTheme hook
jest.mock('../../hooks/use-theme', () => ({
  useTheme: jest.fn()
}));

// Mock the useAuth hook
jest.mock('../../contexts/ClerkUserContext', () => ({
  useAuth: jest.fn()
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

describe('Header Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock default theme
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      toggleTheme: jest.fn()
    });
    
    // Mock default auth
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      signUp: jest.fn()
    });
  });

  it('renders correctly with light theme', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check if logo is rendered
    expect(screen.getByAltText('Harmony Logo')).toBeInTheDocument();
    
    // Check if navigation links are rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    
    // Check if theme toggle button is rendered
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('renders correctly with dark theme', () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      toggleTheme: jest.fn()
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check if dark theme class is applied
    expect(screen.getByRole('banner')).toHaveClass('dark');
  });

  it('displays user menu when authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'user123',
        username: 'testuser',
        fullName: 'Test User',
        imageUrl: 'https://example.com/avatar.jpg'
      },
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      signUp: jest.fn()
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check if user avatar is displayed
    expect(screen.getByAltText('User Avatar')).toBeInTheDocument();
    
    // Check if user menu items are rendered after clicking avatar
    fireEvent.click(screen.getByAltText('User Avatar'));
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('displays login button when not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      signUp: jest.fn()
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check if login button is displayed
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('toggles theme when theme toggle button is clicked', () => {
    const toggleTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      toggleTheme
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Click theme toggle button
    fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));
    
    // Check if toggleTheme function was called
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it('handles logout when logout button is clicked', () => {
    const logout = jest.fn();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'user123',
        username: 'testuser',
        fullName: 'Test User',
        imageUrl: 'https://example.com/avatar.jpg'
      },
      isLoading: false,
      login: jest.fn(),
      logout,
      signUp: jest.fn()
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Click user avatar to open menu
    fireEvent.click(screen.getByAltText('User Avatar'));
    
    // Click logout button
    fireEvent.click(screen.getByText('Logout'));
    
    // Check if logout function was called
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('navigates to home when logo is clicked', () => {
    const navigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigate);
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Click logo
    fireEvent.click(screen.getByAltText('Harmony Logo'));
    
    // Check if navigate was called with home path
    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('navigates to search when search button is clicked', () => {
    const navigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigate);
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Click search button
    fireEvent.click(screen.getByText('Search'));
    
    // Check if navigate was called with search path
    expect(navigate).toHaveBeenCalledWith('/search');
  });

  it('navigates to library when library button is clicked', () => {
    const navigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigate);
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Click library button
    fireEvent.click(screen.getByText('Library'));
    
    // Check if navigate was called with library path
    expect(navigate).toHaveBeenCalledWith('/library');
  });

  it('displays loading state when auth is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      login: jest.fn(),
      logout: jest.fn(),
      signUp: jest.fn()
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check if loading spinner is displayed
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles responsive navigation on mobile', () => {
    // Mock window.innerWidth to simulate mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check if mobile menu button is displayed
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
    
    // Click mobile menu button
    fireEvent.click(screen.getByRole('button', { name: /menu/i }));
    
    // Check if navigation links are displayed in mobile menu
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
  });

  it('displays notification badge when there are notifications', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 'user123',
        username: 'testuser',
        fullName: 'Test User',
        imageUrl: 'https://example.com/avatar.jpg'
      },
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      signUp: jest.fn(),
      notifications: [
        { id: '1', type: 'like', read: false },
        { id: '2', type: 'comment', read: false }
      ]
    });
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check if notification badge is displayed with correct count
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('handles search input change', () => {
    const navigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(navigate);
    
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Type in search input
    const searchInput = screen.getByPlaceholderText(/search for artists, tracks, playlists/i);
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    // Check if search input value is updated
    expect(searchInput).toHaveValue('test query');
    
    // Simulate pressing Enter key
    fireEvent.keyDown(searchInput, { key: 'Enter' });
    
    // Check if navigate was called with search path and query
    expect(navigate).toHaveBeenCalledWith('/search?q=test+query');
  });

  it('displays accessibility attributes correctly', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
    
    // Check if header has correct role
    expect(screen.getByRole('banner')).toBeInTheDocument();
    
    // Check if logo has correct alt text
    expect(screen.getByAltText('Harmony Logo')).toBeInTheDocument();
    
    // Check if navigation links have correct roles
    expect(screen.getByText('Home')).toHaveAttribute('role', 'link');
    expect(screen.getByText('Search')).toHaveAttribute('role', 'link');
    expect(screen.getByText('Library')).toHaveAttribute('role', 'link');
  });
});