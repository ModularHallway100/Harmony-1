// Frontend Jest Setup for Harmony Music Platform
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

// Mock URL.revokeObjectURL
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

// Mock @radix-ui/react-dialog
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

// Mock @radix-ui/react-dropdown-menu
jest.mock('@radix-ui/react-dropdown-menu', () => ({
  DropdownMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DropdownMenuTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DropdownMenuContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DropdownMenuItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DropdownMenuSeparator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-toast
jest.mock('@radix-ui/react-toast', () => ({
  ToastProvider: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastViewport: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  Toast: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastTitle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastDescription: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastAction: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastClose: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-tooltip
jest.mock('@radix-ui/react-tooltip', () => ({
  TooltipProvider: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  Tooltip: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TooltipTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TooltipContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-select
jest.mock('@radix-ui/react-select', () => ({
  Select: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectValue: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectSeparator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-button
jest.mock('@radix-ui/react-button', () => ({
  Button: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

// Mock @radix-ui/react-input
jest.mock('@radix-ui/react-input', () => ({
  Input: jest.fn(({ children, ...props }) => <input {...props}>{children}</input>),
}));

// Mock @radix-ui/react-label
jest.mock('@radix-ui/react-label', () => ({
  Label: jest.fn(({ children, ...props }) => <label {...props}>{children}</label>),
}));

// Mock @radix-ui/react-checkbox
jest.mock('@radix-ui/react-checkbox', () => ({
  Checkbox: jest.fn(({ children, ...props }) => <input type="checkbox" {...props}>{children}</input>),
}));

// Mock @radix-ui/react-switch
jest.mock('@radix-ui/react-switch', () => ({
  Switch: jest.fn(({ children, ...props }) => <label {...props}>{children}</label>),
}));

// Mock @radix-ui/react-tabs
jest.mock('@radix-ui/react-tabs', () => ({
  Tabs: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TabsList: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TabsTrigger: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  TabsContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-progress
jest.mock('@radix-ui/react-progress', () => ({
  Progress: jest.fn(({ value, ...props }) => (
    <div {...props}>
      <div style={{ width: `${value}%` }} />
    </div>
  )),
}));

// Mock @radix-ui/react-slider
jest.mock('@radix-ui/react-slider', () => ({
  Slider: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SliderTrack: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SliderRange: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SliderThumb: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-dialog
jest.mock('@radix-ui/react-dialog', () => ({
  Dialog: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogHeader: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogTitle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogDescription: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogFooter: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DialogClose: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

// Mock @radix-ui/react-popover
jest.mock('@radix-ui/react-popover', () => ({
  Popover: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  PopoverTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  PopoverContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-hover-card
jest.mock('@radix-ui/react-hover-card', () => ({
  HoverCard: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  HoverCardTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  HoverCardContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-avatar
jest.mock('@radix-ui/react-avatar', () => ({
  Avatar: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AvatarImage: jest.fn(({ children, ...props }) => <img {...props}>{children}</img>),
  AvatarFallback: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-badge
jest.mock('@radix-ui/react-badge', () => ({
  Badge: jest.fn(({ children, ...props }) => <span {...props}>{children}</span>),
}));

// Mock @radix-ui/react-separator
jest.mock('@radix-ui/react-separator', () => ({
  Separator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-scroll-area
jest.mock('@radix-ui/react-scroll-area', () => ({
  ScrollArea: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-menubar
jest.mock('@radix-ui/react-menubar', () => ({
  Menubar: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarSeparator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-navigation-menu
jest.mock('@radix-ui/react-navigation-menu', () => ({
  NavigationMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuList: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuLink: jest.fn(({ children, ...props }) => <a {...props}>{children}</a>),
  NavigationMenuIndicator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-collapsible
jest.mock('@radix-ui/react-collapsible', () => ({
  Collapsible: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CollapsibleTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CollapsibleContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-accordion
jest.mock('@radix-ui/react-accordion', () => ({
  Accordion: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AccordionItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AccordionTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AccordionContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-alert-dialog
jest.mock('@radix-ui/react-alert-dialog', () => ({
  AlertDialog: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogHeader: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogTitle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogDescription: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogFooter: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogAction: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  AlertDialogCancel: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

// Mock @radix-ui/react-aspect-ratio
jest.mock('@radix-ui/react-aspect-ratio', () => ({
  AspectRatio: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-checkbox
jest.mock('@radix-ui/react-checkbox', () => ({
  Checkbox: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-context-menu
jest.mock('@radix-ui/react-context-menu', () => ({
  ContextMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ContextMenuTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ContextMenuContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ContextMenuItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ContextMenuSeparator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-drawer
jest.mock('@radix-ui/react-drawer', () => ({
  Drawer: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DrawerTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DrawerContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DrawerHeader: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DrawerTitle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DrawerDescription: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DrawerFooter: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DrawerClose: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

// Mock @radix-ui/react-dropdown-menu
jest.mock('@radix-ui/react-dropdown-menu', () => ({
  DropdownMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DropdownMenuTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DropdownMenuContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DropdownMenuItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DropdownMenuSeparator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-form
jest.mock('@radix-ui/react-form', () => ({
  Form: jest.fn(({ children, ...props }) => <form {...props}>{children}</form>),
  FormControl: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  FormField: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  FormItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  FormLabel: jest.fn(({ children, ...props }) => <label {...props}>{children}</label>),
  FormMessage: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-hover-card
jest.mock('@radix-ui/react-hover-card', () => ({
  HoverCard: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  HoverCardTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  HoverCardContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-input-otp
jest.mock('@radix-ui/react-input-otp', () => ({
  InputOTP: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  InputOTPGroup: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  OTPSlot: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  OTPSeparator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-label
jest.mock('@radix-ui/react-label', () => ({
  Label: jest.fn(({ children, ...props }) => <label {...props}>{children}</label>),
}));

// Mock @radix-ui/react-menubar
jest.mock('@radix-ui/react-menubar', () => ({
  Menubar: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarSeparator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-navigation-menu
jest.mock('@radix-ui/react-navigation-menu', () => ({
  NavigationMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuList: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuLink: jest.fn(({ children, ...props }) => <a {...props}>{children}</a>),
  NavigationMenuIndicator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-popover
jest.mock('@radix-ui/react-popover', () => ({
  Popover: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  PopoverTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  PopoverContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-progress
jest.mock('@radix-ui/react-progress', () => ({
  Progress: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-radio-group
jest.mock('@radix-ui/react-radio-group', () => ({
  RadioGroup: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  RadioGroupItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-resizable
jest.mock('@radix-ui/react-resizable', () => ({
  Resizable: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ResizableHandle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-scroll-area
jest.mock('@radix-ui/react-scroll-area', () => ({
  ScrollArea: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-select
jest.mock('@radix-ui/react-select', () => ({
  Select: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectValue: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectSeparator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-separator
jest.mock('@radix-ui/react-separator', () => ({
  Separator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-sheet
jest.mock('@radix-ui/react-sheet', () => ({
  Sheet: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SheetTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SheetContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SheetHeader: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SheetTitle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SheetDescription: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SheetFooter: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SheetClose: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

// Mock @radix-ui/react-sidebar
jest.mock('@radix-ui/react-sidebar', () => ({
  Sidebar: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarProvider: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarInset: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarTrigger: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  SidebarGroup: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarGroupLabel: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarGroupAction: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarGroupContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarMenuItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarMenuButton: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarMenuAction: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarMenuSkeleton: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarHeader: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarFooter: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarRail: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-skeleton
jest.mock('@radix-ui/react-skeleton', () => ({
  Skeleton: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-slider
jest.mock('@radix-ui/react-slider', () => ({
  Slider: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SliderTrack: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SliderRange: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SliderThumb: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-switch
jest.mock('@radix-ui/react-switch', () => ({
  Switch: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-tabs
jest.mock('@radix-ui/react-tabs', () => ({
  Tabs: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TabsList: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TabsTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TabsContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-toast
jest.mock('@radix-ui/react-toast', () => ({
  ToastProvider: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastViewport: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  Toast: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastTitle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastDescription: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastAction: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastClose: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-toggle
jest.mock('@radix-ui/react-toggle', () => ({
  Toggle: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  ToggleGroup: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToggleGroupItem: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

// Mock @radix-ui/react-tooltip
jest.mock('@radix-ui/react-tooltip', () => ({
  TooltipProvider: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  Tooltip: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TooltipTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TooltipContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-accordion
jest.mock('@radix-ui/react-accordion', () => ({
  Accordion: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AccordionItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AccordionTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AccordionContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-alert-dialog
jest.mock('@radix-ui/react-alert-dialog', () => ({
  AlertDialog: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogHeader: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogTitle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogDescription: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogFooter: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogAction: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  AlertDialogCancel: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

// Mock @radix-ui/react-aspect-ratio
jest.mock('@radix-ui/react-aspect-ratio', () => ({
  AspectRatio: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-avatar
jest.mock('@radix-ui/react-avatar', () => ({
  Avatar: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AvatarImage: jest.fn(({ children, ...props }) => <img {...props}>{children}</img>),
  AvatarFallback: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-badge
jest.mock('@radix-ui/react-badge', () => ({
  Badge: jest.fn(({ children, ...props }) => <span {...props}>{children}</span>),
}));

// Mock @radix-ui/react-breadcrumb
jest.mock('@radix-ui/react-breadcrumb', () => ({
  Breadcrumb: jest.fn(({ children, ...props }) => <nav {...props}>{children}</nav>),
  BreadcrumbList: jest.fn(({ children, ...props }) => <ol {...props}>{children}</ol>),
  BreadcrumbItem: jest.fn(({ children, ...props }) => <li {...props}>{children}</li>),
  BreadcrumbLink: jest.fn(({ children, ...props }) => <a {...props}>{children}</a>),
  BreadcrumbSeparator: jest.fn(({ children, ...props }) => <span {...props}>{children}</span>),
  BreadcrumbPage: jest.fn(({ children, ...props }) => <span {...props}>{children}</span>),
}));

// Mock @radix-ui/react-calendar
jest.mock('@radix-ui/react-calendar', () => ({
  Calendar: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-card
jest.mock('@radix-ui/react-card', () => ({
  Card: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CardHeader: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CardTitle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CardDescription: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CardContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CardFooter: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-carousel
jest.mock('@radix-ui/react-carousel', () => ({
  Carousel: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CarouselContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CarouselItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CarouselNext: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  CarouselPrevious: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

// Mock @radix-ui/react-chart
jest.mock('@radix-ui/react-chart', () => ({
  Chart: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-checkbox
jest.mock('@radix-ui/react-checkbox', () => ({
  Checkbox: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-collapsible
jest.mock('@radix-ui/react-collapsible', () => ({
  Collapsible: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CollapsibleTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CollapsibleContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-command
jest.mock('@radix-ui/react-command', () => ({
  Command: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CommandInput: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CommandList: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CommandEmpty: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CommandGroup: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CommandItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CommandShortcut: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-context-menu
jest.mock('@radix-ui/react-context-menu', () => ({
  ContextMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ContextMenuTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ContextMenuContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ContextMenuItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ContextMenuSeparator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-dialog
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

// Mock @radix-ui/react-drawer
jest.mock('@radix-ui/react-drawer', () => ({
  Drawer: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DrawerTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DrawerContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DrawerHeader: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DrawerTitle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DrawerDescription: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DrawerFooter: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DrawerClose: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

// Mock @radix-ui/react-dropdown-menu
jest.mock('@radix-ui/react-dropdown-menu', () => ({
  DropdownMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DropdownMenuTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DropdownMenuContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DropdownMenuItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  DropdownMenuSeparator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-form
jest.mock('@radix-ui/react-form', () => ({
  Form: jest.fn(({ children, ...props }) => <form {...props}>{children}</form>),
  FormControl: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  FormField: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  FormItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  FormLabel: jest.fn(({ children, ...props }) => <label {...props}>{children}</label>),
  FormMessage: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-hover-card
jest.mock('@radix-ui/react-hover-card', () => ({
  HoverCard: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  HoverCardTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  HoverCardContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-input-otp
jest.mock('@radix-ui/react-input-otp', () => ({
  InputOTP: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  InputOTPGroup: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  OTPSlot: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  OTPSeparator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-input
jest.mock('@radix-ui/react-input', () => ({
  Input: jest.fn(({ children, ...props }) => <input {...props}>{children}</input>),
}));

// Mock @radix-ui/react-label
jest.mock('@radix-ui/react-label', () => ({
  Label: jest.fn(({ children, ...props }) => <label {...props}>{children}</label>),
}));

// Mock @radix-ui/react-menubar
jest.mock('@radix-ui/react-menubar', () => ({
  Menubar: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  MenubarSeparator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-navigation-menu
jest.mock('@radix-ui/react-navigation-menu', () => ({
  NavigationMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuList: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  NavigationMenuLink: jest.fn(({ children, ...props }) => <a {...props}>{children}</a>),
  NavigationMenuIndicator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-popover
jest.mock('@radix-ui/react-popover', () => ({
  Popover: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  PopoverTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  PopoverContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-progress
jest.mock('@radix-ui/react-progress', () => ({
  Progress: jest.fn(({ value, ...props }) => (
    <div {...props}>
      <div style={{ width: `${value}%` }} />
    </div>
  )),
}));

// Mock @radix-ui/react-radio-group
jest.mock('@radix-ui/react-radio-group', () => ({
  RadioGroup: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  RadioGroupItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-resizable
jest.mock('@radix-ui/react-resizable', () => ({
  Resizable: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ResizableHandle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-scroll-area
jest.mock('@radix-ui/react-scroll-area', () => ({
  ScrollArea: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-select
jest.mock('@radix-ui/react-select', () => ({
  Select: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectValue: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SelectSeparator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-separator
jest.mock('@radix-ui/react-separator', () => ({
  Separator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-sheet
jest.mock('@radix-ui/react-sheet', () => ({
  Sheet: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SheetTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SheetContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SheetHeader: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SheetTitle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SheetDescription: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SheetFooter: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SheetClose: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

// Mock @radix-ui/react-sidebar
jest.mock('@radix-ui/react-sidebar', () => ({
  Sidebar: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarProvider: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarInset: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarTrigger: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  SidebarGroup: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarGroupLabel: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarGroupAction: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarGroupContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarMenuItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarMenuButton: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarMenuAction: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarMenuSkeleton: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarHeader: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarFooter: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SidebarRail: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-skeleton
jest.mock('@radix-ui/react-skeleton', () => ({
  Skeleton: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-slider
jest.mock('@radix-ui/react-slider', () => ({
  Slider: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SliderTrack: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SliderRange: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  SliderThumb: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-switch
jest.mock('@radix-ui/react-switch', () => ({
  Switch: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-tabs
jest.mock('@radix-ui/react-tabs', () => ({
  Tabs: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TabsList: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TabsTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TabsContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-toast
jest.mock('@radix-ui/react-toast', () => ({
  ToastProvider: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastViewport: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  Toast: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastTitle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastDescription: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastAction: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToastClose: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-toggle
jest.mock('@radix-ui/react-toggle', () => ({
  Toggle: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  ToggleGroup: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ToggleGroupItem: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

// Mock @radix-ui/react-tooltip
jest.mock('@radix-ui/react-tooltip', () => ({
  TooltipProvider: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  Tooltip: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TooltipTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  TooltipContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-accordion
jest.mock('@radix-ui/react-accordion', () => ({
  Accordion: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AccordionItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AccordionTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AccordionContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-alert-dialog
jest.mock('@radix-ui/react-alert-dialog', () => ({
  AlertDialog: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogHeader: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogTitle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogDescription: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogFooter: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AlertDialogAction: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  AlertDialogCancel: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

// Mock @radix-ui/react-aspect-ratio
jest.mock('@radix-ui/react-aspect-ratio', () => ({
  AspectRatio: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-avatar
jest.mock('@radix-ui/react-avatar', () => ({
  Avatar: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  AvatarImage: jest.fn(({ children, ...props }) => <img {...props}>{children}</img>),
  AvatarFallback: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-badge
jest.mock('@radix-ui/react-badge', () => ({
  Badge: jest.fn(({ children, ...props }) => <span {...props}>{children}</span>),
}));

// Mock @radix-ui/react-breadcrumb
jest.mock('@radix-ui/react-breadcrumb', () => ({
  Breadcrumb: jest.fn(({ children, ...props }) => <nav {...props}>{children}</nav>),
  BreadcrumbList: jest.fn(({ children, ...props }) => <ol {...props}>{children}</ol>),
  BreadcrumbItem: jest.fn(({ children, ...props }) => <li {...props}>{children}</li>),
  BreadcrumbLink: jest.fn(({ children, ...props }) => <a {...props}>{children}</a>),
  BreadcrumbSeparator: jest.fn(({ children, ...props }) => <span {...props}>{children}</span>),
  BreadcrumbPage: jest.fn(({ children, ...props }) => <span {...props}>{children}</span>),
}));

// Mock @radix-ui/react-calendar
jest.mock('@radix-ui/react-calendar', () => ({
  Calendar: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-card
jest.mock('@radix-ui/react-card', () => ({
  Card: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CardHeader: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CardTitle: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CardDescription: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CardContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CardFooter: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-carousel
jest.mock('@radix-ui/react-carousel', () => ({
  Carousel: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CarouselContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CarouselItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CarouselNext: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
  CarouselPrevious: jest.fn(({ children, ...props }) => <button {...props}>{children}</button>),
}));

// Mock @radix-ui/react-chart
jest.mock('@radix-ui/react-chart', () => ({
  Chart: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-checkbox
jest.mock('@radix-ui/react-checkbox', () => ({
  Checkbox: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-collapsible
jest.mock('@radix-ui/react-collapsible', () => ({
  Collapsible: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CollapsibleTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CollapsibleContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-command
jest.mock('@radix-ui/react-command', () => ({
  Command: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CommandInput: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CommandList: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CommandEmpty: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CommandGroup: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CommandItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  CommandShortcut: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
}));

// Mock @radix-ui/react-context-menu
jest.mock('@radix-ui/react-context-menu', () => ({
  ContextMenu: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ContextMenuTrigger: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ContextMenuContent: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ContextMenuItem: jest.fn(({ children, ...props }) => <div {...props}>{children}</div>),
  ContextMenuSeparator: jest.fn(({ children, ...props }) => <div {...props}>{children}</div

Now let's create the test setup files for different testing types. First, let's create the frontend test setup file.

<write_to_file>
<path>Harmony-1/tests/frontend-setup.js</path>
<content>
// Frontend Test Setup for Harmony Music Platform

// Import React Testing Library utilities
import '@testing-library/jest-dom';

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

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock CSS import
jest.mock('css-modules-loader-core', () => ({
  default: jest.fn().mockImplementation(() => ({
    fetch: jest.fn(),
    source: jest.fn(),
    stringifyCalls: [],
    stringify: () => '',
    use: [],
    imports: [],
    importItems: [],
    settings: {},
  })),
}));

// Mock CSS modules
jest.mock('react-css-modules', () => (Component) => {
  return function CSSModulesWrapper(props) {
    return <Component {...props} />;
  };
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock window.alert
global.alert = jest.fn();

// Mock window.confirm
global.confirm = jest.fn(() => true);

// Mock window.prompt
global.prompt = jest.fn(() => '');

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

// Mock navigator
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
    readText: jest.fn(),
  },
  writable: true,
});

// Mock canvas
HTMLCanvasElement.prototype.getContext = jest.fn();
HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');

// Mock Audio
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn(),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();

// Mock WebSocket
global.WebSocket = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock getComputedStyle
window.getComputedStyle = jest.fn().mockReturnValue({
  getPropertyValue: (prop) => {
    return '';
  },
});

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

// Add console error mock to reduce noise during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Mock environment variables
process.env.VITE_APP_ENV = 'test';
process.env.VITE_APP_VERSION = '1.0.0-test';
process.env.VITE_APP_TITLE = 'Harmony Music Platform';
process.env.VITE_APP_DESCRIPTION = 'AI-Driven Music Streaming & Prompt Rewriting Platform';
process.env.VITE_APP_URL = 'http://localhost:3000';
process.env.VITE_API_URL = 'http://localhost:3001/api';