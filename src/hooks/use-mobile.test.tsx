import { renderHook, act } from '@testing-library/react';
import { useMobile } from './use-mobile';

// Mock window.matchMedia
const matchMediaMock = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(), // Deprecated
  removeListener: jest.fn(), // Deprecated
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

describe('useMobile Hook', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup window.matchMedia mock
    (global as any).matchMedia = matchMediaMock;
    
    // Default viewport width (desktop)
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  afterEach(() => {
    // Clean up
    matchMediaMock.mockClear();
  });

  it('should initialize with isMobile false for desktop viewport', () => {
    const { result } = renderHook(() => useMobile());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('should initialize with isMobile true for mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768
    });

    const { result } = renderHook(() => useMobile());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should initialize with isTablet true for tablet viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });

    matchMediaMock.mockImplementation(query => ({
      matches: query === '(max-width: 1024px)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { result } = renderHook(() => useMobile());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should update isMobile when window is resized', () => {
    const { result } = renderHook(() => useMobile());

    // Initial state is desktop
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);

    // Simulate window resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);

    // Simulate window resize to tablet
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);

    // Simulate window resize to desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1440
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('should add and remove event listeners', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useMobile());

    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));
  });

  it('should handle orientation changes', () => {
    const { result } = renderHook(() => useMobile());

    // Initial state is desktop in landscape
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);

    // Simulate orientation change to portrait (assuming mobile device)
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      window.dispatchEvent(new Event('orientationchange'));
    });

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should debounce resize events', () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useMobile());

    // Initial state is desktop
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);

    // Simulate multiple rapid resize events
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      window.dispatchEvent(new Event('resize'));
      
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480
      });
      window.dispatchEvent(new Event('resize'));
      
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320
      });
      window.dispatchEvent(new Event('resize'));
    });

    // State should not have changed yet (debounced)
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);

    // Fast-forward time to trigger debounced update
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // State should now reflect the final resize
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);

    jest.useRealTimers();
  });

  it('should provide breakpoints', () => {
    const { result } = renderHook(() => useMobile());

    expect(result.current.breakpoints).toEqual({
      mobile: 768,
      tablet: 1024,
      desktop: 1025
    });
  });

  it('should provide device type', () => {
    const { result } = renderHook(() => useMobile());

    // Test mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.deviceType).toBe('mobile');

    // Test tablet
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.deviceType).toBe('tablet');

    // Test desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1440
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.deviceType).toBe('desktop');
  });

  it('should provide screen orientation', () => {
    const { result } = renderHook(() => useMobile());

    // Test landscape
    Object.defineProperty(window, 'screen', {
      writable: true,
      configurable: true,
      value: { orientation: { type: 'landscape-primary' } }
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.screenOrientation).toBe('landscape');

    // Test portrait
    Object.defineProperty(window, 'screen', {
      writable: true,
      configurable: true,
      value: { orientation: { type: 'portrait-primary' } }
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.screenOrientation).toBe('portrait');
  });

  it('should handle missing screen.orientation', () => {
    const { result } = renderHook(() => useMobile());

    // Test without screen.orientation
    Object.defineProperty(window, 'screen', {
      writable: true,
      configurable: true,
      value: {}
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current.screenOrientation).toBe('landscape'); // Default
  });

  it('should handle window.matchMedia not supported', () => {
    const originalMatchMedia = (global as any).matchMedia;
    delete (global as any).matchMedia;

    const { result } = renderHook(() => useMobile());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);

    // Restore matchMedia
    (global as any).matchMedia = originalMatchMedia;
  });

  it('should handle window.innerWidth not supported', () => {
    const originalInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth');
    Object.defineProperty(window, 'innerWidth', {
      get: () => {
        throw new Error('Not supported');
      },
      set: () => {},
      configurable: true
    });

    const { result } = renderHook(() => useMobile());

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);

    // Restore innerWidth
    Object.defineProperty(window, 'innerWidth', originalInnerWidth!);
  });

  it('should provide viewport dimensions', () => {
    const { result } = renderHook(() => useMobile());

    expect(result.current.viewportWidth).toBe(1024);
    expect(result.current.viewportHeight).toBe(window.innerHeight);

    // Simulate resize
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.viewportWidth).toBe(768);
    expect(result.current.viewportHeight).toBe(1024);
  });

  it('should provide device pixel ratio', () => {
    const { result } = renderHook(() => useMobile());

    expect(result.current.devicePixelRatio).toBe(window.devicePixelRatio);

    // Simulate devicePixelRatio change
    act(() => {
      Object.defineProperty(window, 'devicePixelRatio', {
        writable: true,
        configurable: true,
        value: 2
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.devicePixelRatio).toBe(2);
  });

  it('should handle device pixel ratio not supported', () => {
    const originalDevicePixelRatio = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio');
    Object.defineProperty(window, 'devicePixelRatio', {
      get: () => {
        throw new Error('Not supported');
      },
      set: () => {},
      configurable: true
    });

    const { result } = renderHook(() => useMobile());

    expect(result.current.devicePixelRatio).toBe(1); // Default

    // Restore devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', originalDevicePixelRatio!);
  });

  it('should update when breakpoints change', () => {
    const { result } = renderHook(() => useMobile());

    // Initial state is desktop
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);

    // Simulate window resize to just below desktop breakpoint
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);

    // Simulate window resize to just below tablet breakpoint
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767
      });
      window.dispatchEvent(new Event('resize'));
    });

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should cleanup event listeners on unmount', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useMobile());

    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
  });
});