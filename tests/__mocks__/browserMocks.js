// Browser API mocks for Jest tests
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

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

// Mock getComputedStyle
window.getComputedStyle = jest.fn().mockReturnValue({
  getPropertyValue: (prop) => {
    return '';
  },
});

// Mock scrollTo
window.scrollTo = jest.fn();

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

// Mock fetch
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

// Mock clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
    readText: jest.fn(),
  },
  writable: true,
});

// Mock alert, confirm, prompt
global.alert = jest.fn();
global.confirm = jest.fn(() => true);
global.prompt = jest.fn(() => '');

// Mock getBoundingClientRect
Element.prototype.getBoundingClientRect = jest.fn(() => ({
  width: 120,
  height: 120,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
}));

// Mock offsetParent
Object.defineProperty(window.HTMLElement.prototype, 'offsetParent', {
  get: function() {
    return this.parentNode;
  },
});

// Mock scrollWidth and scrollHeight
Object.defineProperties(window.HTMLElement.prototype, {
  'scrollWidth': {
    get: function() {
      return this.clientWidth;
    },
  },
  'scrollHeight': {
    get: function() {
      return this.clientHeight;
    },
  },
});

// Mock clientWidth and clientHeight
Object.defineProperties(window.HTMLElement.prototype, {
  'clientWidth': {
    get: function() {
      return 120;
    },
  },
  'clientHeight': {
    get: function() {
      return 120;
    },
  },
});

// Mock offsetWidth and offsetHeight
Object.defineProperties(window.HTMLElement.prototype, {
  'offsetWidth': {
    get: function() {
      return 120;
    },
  },
  'offsetHeight': {
    get: function() {
      return 120;
    },
  },
});