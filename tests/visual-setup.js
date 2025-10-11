// Visual Regression Test Setup for Harmony Music Platform

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import 'jest-canvas-mock';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserverEntry
global.ResizeObserverEntry = class ResizeObserverEntry {
  constructor(target) {
    this.target = target;
    this.contentRect = target.getBoundingClientRect();
  }
};

// Mock getComputedStyle
global.getComputedStyle = jest.fn().mockImplementation(() => ({
  getPropertyValue: (prop) => {
    return '';
  }
}));

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock performance API
global.performance = {
  ...global.performance,
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(),
  getEntriesByType: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  clearResourceTimings: jest.fn(),
  timing: {
    navigationStart: 0,
    loadEventEnd: 0,
  },
  memory: {
    jsHeapSizeLimit: 1024 * 1024 * 1024,
    totalJSHeapSize: 512 * 1024 * 1024,
    usedJSHeapSize: 256 * 1024 * 1024,
  },
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch API
global.fetch = jest.fn();

// Mock WebSocket
global.WebSocket = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock navigator.mediaDevices
global.navigator.mediaDevices = {
  getUserMedia: jest.fn(),
  enumerateDevices: jest.fn(),
  getSupportedConstraints: jest.fn(),
};

// Mock canvas
HTMLCanvasElement.prototype.getContext = jest.fn();
HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock-data');
HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => callback(new Blob(['mock'], { type: 'image/png' })));

// Mock HTML elements
document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

// Clean up after each test
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

// Extend Jest matchers
import '@testing-library/jest-dom/extend-expect';

// Mock CSS modules
jest.mock('module', () => ({
  __esModule: true,
  default: {
    styles: {},
  },
}));

// Mock CSS imports
jest.mock('*.css', () => ({}));

// Mock image imports
jest.mock('*.jpg', () => 'mock-image.jpg');
jest.mock('*.jpeg', () => 'mock-image.jpeg');
jest.mock('*.png', () => 'mock-image.png');
jest.mock('*.gif', () => 'mock-image.gif');
jest.mock('*.svg', () => 'mock-image.svg');

// Mock audio imports
jest.mock('*.mp3', () => 'mock-audio.mp3');
jest.mock('*.wav', () => 'mock-audio.wav');
jest.mock('*.ogg', () => 'mock-audio.ogg');

// Mock video imports
jest.mock('*.mp4', () => 'mock-video.mp4');
jest.mock('*.webm', () => 'mock-video.webm');

// Mock font imports
jest.mock('*.woff', () => 'mock-font.woff');
jest.mock('*.woff2', () => 'mock-font.woff2');
jest.mock('*.ttf', () => 'mock-font.ttf');
jest.mock('*.eot', () => 'mock-font.eot');

// Mock node modules
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'test',
  }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (str) => str,
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
    },
  }),
  initReactI18next: jest.fn(),
  withTranslation: () => (Component) => Component,
}));

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
  useMutation: jest.fn(() => ({ mutate: jest.fn(), isLoading: false, error: null })),
  useInfiniteQuery: jest.fn(() => ({ data: null, isLoading: false, error: null })),
}));

// Mock zustand
jest.mock('zustand', () => ({
  ...jest.requireActual('zustand'),
  create: (api) => {
    const store = api((set, get) => ({}));
    return store;
  },
}));

// Mock socket.io
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AnimatePresence: jest.fn(({ children }) => <>{children}</>),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  // Mock all icons
  ...jest.requireActual('lucide-react'),
  // Add specific mocks if needed
}));

// Mock @radix-ui components
jest.mock('@radix-ui/react-dialog', () => ({
  Dialog: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogPortal: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogOverlay: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogHeader: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogFooter: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogTitle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogDescription: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock all other @radix-ui components
const radixComponents = [
  'dropdown-menu', 'toast', 'tooltip', 'select', 'button', 'input', 'label', 'checkbox', 'switch',
  'tabs', 'progress', 'slider', 'popover', 'hover-card', 'avatar', 'badge', 'separator', 'scroll-area',
  'menubar', 'navigation-menu', 'collapsible', 'accordion', 'alert-dialog', 'aspect-ratio', 'context-menu',
  'drawer', 'form', 'input-otp', 'radio-group', 'resizable', 'sheet', 'sidebar', 'skeleton', 'toggle', 'toggle-group'
];

radixComponents.forEach(component => {
  jest.mock(`@radix-ui/react-${component}`, () => {
    const Component = component.replace(/-/g, '');
    return {
      [Component.charAt(0).toUpperCase() + Component.slice(1)]: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
    };
  });
});

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Mock environment variables
process.env.VITE_APP_ENV = 'test';
process.env.VITE_APP_VERSION = '1.0.0-test';
process.env.VITE_APP_TITLE = 'Harmony Music Platform';
process.env.VITE_APP_DESCRIPTION = 'AI-Driven Music Streaming & Prompt Rewriting Platform';
process.env.VITE_APP_URL = 'http://localhost:3000';
process.env.VITE_API_URL = 'http://localhost:3001/api';

// Visual testing utilities
global.visualTestUtils = {
  // Capture screenshot of element
  captureScreenshot: (element, fileName = 'screenshot') => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = element.offsetWidth;
      canvas.height = element.offsetHeight;
      
      // Draw element to canvas
      context.drawWindow(
        element.ownerDocument.defaultView,
        element.getBoundingClientRect().left,
        element.getBoundingClientRect().top,
        element.offsetWidth,
        element.offsetHeight,
        'rgb(255, 255, 255)'
      );
      
      // Convert to data URL
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    });
  },
  
  // Compare two images
  compareImages: (image1, image2, threshold = 0.01) => {
    return new Promise((resolve) => {
      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');
      const ctx1 = canvas1.getContext('2d');
      const ctx2 = canvas2.getContext('2d');
      
      // Load images
      const img1 = new Image();
      const img2 = new Image();
      
      img1.onload = () => {
        img2.onload = () => {
          // Set canvas dimensions
          canvas1.width = img1.width;
          canvas1.height = img1.height;
          canvas2.width = img2.width;
          canvas2.height = img2.height;
          
          // Draw images
          ctx1.drawImage(img1, 0, 0);
          ctx2.drawImage(img2, 0, 0);
          
          // Get image data
          const imageData1 = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
          const imageData2 = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
          
          // Compare pixels
          let diffPixels = 0;
          const totalPixels = imageData1.data.length / 4;
          
          for (let i = 0; i < imageData1.data.length; i += 4) {
            const r1 = imageData1.data[i];
            const g1 = imageData1.data[i + 1];
            const b1 = imageData1.data[i + 2];
            const a1 = imageData1.data[i + 3];
            
            const r2 = imageData2.data[i];
            const g2 = imageData2.data[i + 1];
            const b2 = imageData2.data[i + 2];
            const a2 = imageData2.data[i + 3];
            
            // Check if pixels are different
            if (Math.abs(r1 - r2) > 5 || Math.abs(g1 - g2) > 5 || Math.abs(b1 - b2) > 5 || Math.abs(a1 - a2) > 5) {
              diffPixels++;
            }
          }
          
          // Calculate difference percentage
          const diffPercentage = diffPixels / totalPixels;
          resolve(diffPercentage <= threshold);
        };
        img2.src = image2;
      };
      img1.src = image1;
    });
  },
  
  // Highlight differences between two images
  highlightDifferences: (image1, image2, outputCanvas) => {
    return new Promise((resolve) => {
      const canvas1 = document.createElement('canvas');
      const canvas2 = document.createElement('canvas');
      const ctx1 = canvas1.getContext('2d');
      const ctx2 = canvas2.getContext('2d');
      
      // Load images
      const img1 = new Image();
      const img2 = new Image();
      
      img1.onload = () => {
        img2.onload = () => {
          // Set canvas dimensions
          canvas1.width = img1.width;
          canvas1.height = img1.height;
          canvas2.width = img2.width;
          canvas2.height = img2.height;
          
          // Draw images
          ctx1.drawImage(img1, 0, 0);
          ctx2.drawImage(img2, 0, 0);
          
          // Get image data
          const imageData1 = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
          const imageData2 = ctx2.getImageData(0, 0, canvas2.width, canvas2.height);
          
          // Create output canvas
          const outputCtx = outputCanvas.getContext('2d');
          outputCanvas.width = canvas1.width;
          outputCanvas.height = canvas1.height;
          
          // Draw first image
          outputCtx.putImageData(imageData1, 0, 0);
          
          // Highlight differences
          const diffImageData = outputCtx.createImageData(canvas1.width, canvas1.height);
          
          for (let i = 0; i < imageData1.data.length; i += 4) {
            const r1 = imageData1.data[i];
            const g1 = imageData1.data[i + 1];
            const b1 = imageData1.data[i + 2];
            const a1 = imageData1.data[i + 3];
            
            const r2 = imageData2.data[i];
            const g2 = imageData2.data[i + 1];
            const b2 = imageData2.data[i + 2];
            const a2 = imageData2.data[i + 3];
            
            // Check if pixels are different
            if (Math.abs(r1 - r2) > 5 || Math.abs(g1 - g2) > 5 || Math.abs(b1 - b2) > 5 || Math.abs(a1 - a2) > 5) {
              // Highlight with red
              diffImageData.data[i] = 255;
              diffImageData.data[i + 1] = 0;
              diffImageData.data[i + 2] = 0;
              diffImageData.data[i + 3] = 128;
            } else {
              // Keep original pixel
              diffImageData.data[i] = r1;
              diffImageData.data[i + 1] = g1;
              diffImageData.data[i + 2] = b1;
              diffImageData.data[i + 3] = a1;
            }
          }
          
          // Draw diff image
          outputCtx.putImageData(diffImageData, 0, 0);
          resolve();
        };
        img2.src = image2;
      };
      img1.src = image1;
    });
  }
};

// Add console error mock to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};