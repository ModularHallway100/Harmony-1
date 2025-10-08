import React, { useState, useEffect, useMemo } from 'react';
import { useClerkUser } from '@/contexts/ClerkUserContext';
import { useLibraryStore } from '@/store/library-store';
import { useUserStore } from '@/store/user-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Input, 
  Textarea, 
  Label 
} from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  Heart, 
  Share2, 
  Bookmark, 
  Bell, 
  Eye,
  Edit,
  Trash2,
  Flag,
  MoreHorizontal,
  Check,
  Star,
  Award,
  Music,
  Mic,
  Calendar as CalendarIcon,
  Navigation,
  Camera,
  Video,
  MicOff,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  XCircle,
  Gift,
  Crown,
  Zap,
  TrendingUp,
  Globe,
  Phone,
  Mail,
  User,
  Heart as HeartSolid,
  MessageSquare,
  Filter as FilterIcon,
  CalendarDays,
  MapPinned,
  UserPlus,
  Ticket,
  CreditCard,
  QrCode,
  Download
} from 'lucide-react';

// Event interfaces
interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  type: 'concert' | 'festival' | 'club' | 'stream' | 'workshop' | 'meetup';
  status: 'upcoming' | 'live' | 'past' | 'cancelled';
  isVirtual: boolean;
  isFree: boolean;
  isExclusive: boolean;
  featured: boolean;
  tags: string[];
  organizer: EventOrganizer;
  venue: Venue;
  date: string;
  time: string;
  duration?: string;
  timezone: string;
  ticketPrice: number;
  currency: string;
  totalTickets: number;
  availableTickets: number;
  soldOut: boolean;
  waitlistEnabled: boolean;
  waitlistCount: number;
  minimumAge?: number;
  requirements?: string[];
  lineUp: LineUpItem[];
  schedule: ScheduleItem[];
  sponsors: Sponsor[];
  images: string[];
  videos: string[];
  attendees: Attendee[];
  likes: number;
  shares: number;
  views: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isAttending: boolean;
  isOnWaitlist: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EventOrganizer {
  id: string;
  name: string;
  type: 'venue' | 'promoter' | 'artist' | 'community';
  avatar: string;
  verified: boolean;
  stats: {
    eventsOrganized: number;
    totalAttendees: number;
    rating: number;
    reviews: number;
  };
}

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  capacity: number;
  amenities: string[];
  images: string[];
  website?: string;
  phone?: string;
  email?: string;
}

interface LineUpItem {
  id: string;
  name: string;
  type: 'artist' | 'dj' | 'band' | 'speaker';
  avatar: string;
  verified: boolean;
  setTime?: string;
  stage?: string;
  bio?: string;
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    spotify?: string;
  };
}

interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  type: 'performance' | 'break' | 'special' | 'other';
  duration?: string;
  stage?: string;
  artists?: string[];
}

interface Sponsor {
  id: string;
  name: string;
  logo: string;
  type: 'main' | 'gold' | 'silver' | 'bronze';
  website?: string;
}

interface Attendee {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  avatar: string;
  ticketType: string;
  ticketNumber?: string;
  checkedIn: boolean;
  attended: boolean;
  joinedAt: string;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  benefits: string[];
  quantity: number;
  sold: number;
  available: number;
  isEarlyBird: boolean;
  isVIP: boolean;
  minimumAge?: number;
  purchaseLimit: number;
}

interface EventReview {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  avatar: string;
  rating: number;
  comment: string;
  images?: string[];
  likes: number;
  createdAt: string;
}

interface EventFilters {
  query: string;
  type: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  location: string;
  priceRange: 'all' | 'free' | 'paid' | 'premium';
  distance: number;
  tags: string[];
  sortBy: 'date' | 'popularity' | 'price' | 'distance' | 'rating';
  virtual: 'all' | 'virtual' | 'in-person';
}

const EventsAndConcerts: React.FC = () => {
  const { user: currentUser } = useClerkUser();
  const { setUser } = useUserStore();
  const { 
    aiArtists 
  } = useLibraryStore();
  
  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState('discover');
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters state
  const [filters, setFilters] = useState<EventFilters>({
    query: '',
    type: 'all',
    dateRange: 'all',
    location: '',
    priceRange: 'all',
    distance: 50,
    tags: [],
    sortBy: 'date',
    virtual: 'all'
  });
  
  // Event detail state
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [showTicketPurchase, setShowTicketPurchase] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Create event state
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    type: 'concert',
    isVirtual: false,
    isFree: false,
    venue: '',
    date: '',
    time: '',
    ticketPrice: 0,
    currency: 'USD',
    totalTickets: 100,
    tags: '',
    requirements: ''
  });
  
  // Reviews state
  const [reviews, setReviews] = useState<EventReview[]>([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  
  // Mock data for demonstration
  const mockEvents: Event[] = [
    {
      id: 'event-1',
      title: 'Neon Dreams Live: Synthwave Festival',
      description: 'Join us for an unforgettable night of synthwave music featuring the AI artist Neon Dreams and special guests. Experience the future of electronic music with immersive visuals and state-of-the-art sound systems.',
      shortDescription: 'AI-powered synthwave festival featuring Neon Dreams',
      type: 'festival',
      status: 'upcoming',
      isVirtual: false,
      isFree: false,
      isExclusive: true,
      featured: true,
      tags: ['synthwave', 'ai', 'electronic', 'festival', 'live'],
      organizer: {
        id: 'org-1',
        name: 'Neon Events',
        type: 'promoter',
        avatar: 'https://i.pravatar.cc/100?u=neon-events',
        verified: true,
        stats: {
          eventsOrganized: 45,
          totalAttendees: 12456,
          rating: 4.7,
          reviews: 234
        }
      },
      venue: {
        id: 'venue-1',
        name: 'The Neon Dome',
        address: '123 Synth Street',
        city: 'Cyber City',
        country: 'Digital Realm',
        coordinates: { lat: 40.7128, lng: -74.0060 },
        capacity: 5000,
        amenities: ['Stage', 'Bar', 'Merchandise', 'Parking', 'VIP Area'],
        images: ['https://picsum.photos/seed/venue1/600/400'],
        website: 'https://neondome.com',
        phone: '+1 (555) 123-4567'
      },
      date: '2023-11-15',
      time: '20:00',
      duration: '6 hours',
      timezone: 'EST',
      ticketPrice: 89.99,
      currency: 'USD',
      totalTickets: 5000,
      availableTickets: 1245,
      soldOut: false,
      waitlistEnabled: true,
      waitlistCount: 234,
      minimumAge: 18,
      requirements: ['Valid ID required', 'No professional cameras'],
      lineUp: [
        {
          id: 'artist-1',
          name: 'Neon Dreams',
          type: 'artist',
          avatar: 'https://i.pravatar.cc/150?u=neon-dreams',
          verified: true,
          setTime: '21:00',
          stage: 'Main Stage',
          bio: 'AI-powered synthwave artist creating nostalgic futuristic soundscapes',
          socialLinks: {
            website: 'https://neondreams.ai',
            spotify: 'https://open.spotify.com/artist/neondreams'
          }
        },
        {
          id: 'artist-2',
          name: 'Glitchard',
          type: 'dj',
          avatar: 'https://i.pravatar.cc/150?u=glitchard',
          verified: true,
          setTime: '22:30',
          stage: 'Main Stage',
          bio: 'Electronic music producer specializing in cyberpunk-inspired beats'
        },
        {
          id: 'artist-3',
          name: 'Circuit Breaker',
          type: 'band',
          avatar: 'https://i.pravatar.cc/150?u=circuit-breaker',
          verified: true,
          setTime: '00:00',
          stage: 'Main Stage',
          bio: 'Rock band with electronic elements'
        }
      ],
      schedule: [
        {
          time: '20:00',
          title: 'Doors Open',
          description: 'Venue opens for attendees',
          type: 'other',
          duration: '30 min'
        },
        {
          time: '20:30',
          title: 'Opening Act',
          description: 'Local synthwave DJ sets',
          type: 'performance',
          duration: '1 hour',
          stage: 'Main Stage'
        },
        {
          time: '21:00',
          title: 'Neon Dreams Live',
          description: 'Headlining performance by Neon Dreams',
          type: 'performance',
          duration: '2 hours',
          stage: 'Main Stage',
          artists: ['Neon Dreams']
        },
        {
          time: '23:00',
          title: 'Intermission',
          description: 'Break between performances',
          type: 'break',
          duration: '30 min'
        },
        {
          time: '23:30',
          title: 'Glitchard Set',
          description: 'Electronic music DJ set',
          type: 'performance',
          duration: '1.5 hours',
          stage: 'Main Stage',
          artists: ['Glitchard']
        }
      ],
      sponsors: [
        {
          id: 'sponsor-1',
          name: 'Neon Tech',
          logo: 'https://i.pravatar.cc/100?u=neon-tech',
          type: 'main',
          website: 'https://neontech.com'
        },
        {
          id: 'sponsor-2',
          name: 'SoundWave',
          logo: 'https://i.pravatar.cc/100?u=soundwave',
          type: 'gold',
          website: 'https://soundwave.audio'
        }
      ],
      images: [
        'https://picsum.photos/seed/event1-1/800/600',
        'https://picsum.photos/seed/event1-2/800/600',
        'https://picsum.photos/seed/event1-3/800/600'
      ],
      videos: ['https://youtube.com/watch?v=example1'],
      attendees: [],
      likes: 2345,
      shares: 567,
      views: 12345,
      isLiked: false,
      isBookmarked: false,
      isAttending: false,
      isOnWaitlist: false,
      createdAt: '2023-09-01T10:00:00Z',
      updatedAt: '2023-09-01T10:00:00Z'
    },
    {
      id: 'event-2',
      title: 'AI Music Workshop: Creating with Neural Networks',
      description: 'Learn the fundamentals of AI music generation in this hands-on workshop. Perfect for producers, musicians, and anyone interested in the future of music creation.',
      shortDescription: 'Workshop on AI music generation techniques',
      type: 'workshop',
      status: 'upcoming',
      isVirtual: true,
      isFree: false,
      isExclusive: false,
      featured: false,
      tags: ['ai', 'music', 'workshop', 'education', 'online'],
      organizer: {
        id: 'org-2',
        name: 'Music AI Lab',
        type: 'community',
        avatar: 'https://i.pravatar.cc/100?u=music-ai-lab',
        verified: true,
        stats: {
          eventsOrganized: 23,
          totalAttendees: 5678,
          rating: 4.9,
          reviews: 156
        }
      },
      venue: {
        id: 'venue-2',
        name: 'Online Workshop',
        address: 'Virtual Space',
        city: 'Internet',
        country: 'Worldwide',
        coordinates: { lat: 0, lng: 0 },
        capacity: 100,
        amenities: ['Live Stream', 'Q&A Session', 'Recording'],
        images: ['https://picsum.photos/seed/venue2/600/400']
      },
      date: '2023-10-20',
      time: '14:00',
      duration: '3 hours',
      timezone: 'EST',
      ticketPrice: 49.99,
      currency: 'USD',
      totalTickets: 100,
      availableTickets: 23,
      soldOut: false,
      waitlistEnabled: false,
      waitlistCount: 0,
      minimumAge: 16,
      requirements: ['Computer with internet', 'Basic music production knowledge helpful'],
      lineUp: [
        {
          id: 'instructor-1',
          name: 'Dr. Sarah Chen',
          type: 'speaker',
          avatar: 'https://i.pravatar.cc/150?u=sarah-chen',
          verified: true,
          bio: 'AI researcher and music technologist'
        }
      ],
      schedule: [
        {
          time: '14:00',
          title: 'Introduction to AI Music',
          description: 'Overview of AI in music creation',
          type: 'performance',
          duration: '45 min'
        },
        {
          time: '14:45',
          title: 'Hands-on Session',
          description: 'Practical AI music generation',
          type: 'performance',
          duration: '90 min'
        },
        {
          time: '16:15',
          title: 'Q&A and Discussion',
          description: 'Open forum and networking',
          type: 'other',
          duration: '45 min'
        }
      ],
      sponsors: [],
      images: ['https://picsum.photos/seed/event2-1/800/600'],
      videos: [],
      attendees: [],
      likes: 456,
      shares: 123,
      views: 5678,
      isLiked: false,
      isBookmarked: false,
      isAttending: false,
      isOnWaitlist: false,
      createdAt: '2023-09-15T10:00:00Z',
      updatedAt: '2023-09-15T10:00:00Z'
    },
    {
      id: 'event-3',
      title: 'Live Stream: Cyberpunk Night with Data Diva',
      description: 'Join Data Diva for an exclusive live stream performance from her virtual studio. Experience cutting-edge AI visuals and original cyberpunk music.',
      shortDescription: 'Exclusive live stream performance by Data Diva',
      type: 'stream',
      status: 'upcoming',
      isVirtual: true,
      isFree: true,
      isExclusive: true,
      featured: true,
      tags: ['ai', 'cyberpunk', 'livestream', 'free', 'exclusive'],
      organizer: {
        id: 'org-3',
        name: 'Data Diva',
        type: 'artist',
        avatar: 'https://i.pravatar.cc/100?u=data-diva',
        verified: true,
        stats: {
          eventsOrganized: 12,
          totalAttendees: 3456,
          rating: 4.8,
          reviews: 89
        }
      },
      venue: {
        id: 'venue-3',
        name: 'Data Diva Studio',
        address: 'Virtual Space',
        city: 'Internet',
        country: 'Worldwide',
        coordinates: { lat: 0, lng: 0 },
        capacity: 1000,
        amenities: ['Live Stream', 'Chat Interaction', 'Visual Effects'],
        images: ['https://picsum.photos/seed/venue3/600/400']
      },
      date: '2023-10-10',
      time: '20:00',
      duration: '2 hours',
      timezone: 'EST',
      ticketPrice: 0,
      currency: 'USD',
      totalTickets: 1000,
      availableTickets: 1000,
      soldOut: false,
      waitlistEnabled: false,
      waitlistCount: 0,
      minimumAge: 13,
      requirements: ['Internet connection', 'Streaming platform access'],
      lineUp: [
        {
          id: 'artist-4',
          name: 'Data Diva',
          type: 'artist',
          avatar: 'https://i.pravatar.cc/150?u=data-diva',
          verified: true,
          setTime: '20:00',
          bio: 'AI-powered cyberpunk music artist'
        }
      ],
      schedule: [
        {
          time: '20:00',
          title: 'Opening Performance',
          description: 'Welcome set by Data Diva',
          type: 'performance',
          duration: '30 min'
        },
        {
          time: '20:30',
          title: 'Main Set',
          description: 'Full cyberpunk performance',
          type: 'performance',
          duration: '90 min'
        },
        {
          time: '22:00',
          title: 'Q&A Session',
          description: 'Interactive chat with Data Diva',
          type: 'other',
          duration: '30 min'
        }
      ],
      sponsors: [],
      images: ['https://picsum.photos/seed/event3-1/800/600'],
      videos: [],
      attendees: [],
      likes: 1234,
      shares: 456,
      views: 7890,
      isLiked: false,
      isBookmarked: false,
      isAttending: false,
      isOnWaitlist: false,
      createdAt: '2023-09-20T10:00:00Z',
      updatedAt: '2023-09-20T10:00:00Z'
    }
  ];
  
  const mockTicketTypes: TicketType[] = [
    {
      id: 'ticket-1',
      name: 'General Admission',
      price: 89.99,
      currency: 'USD',
      description: 'Standard entry to the festival',
      benefits: ['Entry to all areas', 'Access to main stage', 'Free water'],
      quantity: 5000,
      sold: 3755,
      available: 1245,
      isEarlyBird: false,
      isVIP: false,
      minimumAge: 18,
      purchaseLimit: 4
    },
    {
      id: 'ticket-2',
      name: 'VIP Pass',
      price: 199.99,
      currency: 'USD',
      description: 'Premium experience with exclusive benefits',
      benefits: ['VIP entry', 'Exclusive viewing area', 'Free drinks', 'Meet & greet', 'Merchandise discount'],
      quantity: 500,
      sold: 234,
      available: 266,
      isEarlyBird: false,
      isVIP: true,
      minimumAge: 18,
      purchaseLimit: 2
    },
    {
      id: 'ticket-3',
      name: 'Early Bird',
      price: 69.99,
      currency: 'USD',
      description: 'Limited time offer',
      benefits: ['Same as General Admission', 'Discounted price'],
      quantity: 1000,
      sold: 1000,
      available: 0,
      isEarlyBird: true,
      isVIP: false,
      minimumAge: 18,
      purchaseLimit: 4
    }
  ];
  
  const mockReviews: EventReview[] = [
    {
      id: 'review-1',
      userId: 'user-1',
      username: 'music_lover',
      fullName: 'Alex Johnson',
      avatar: 'https://i.pravatar.cc/50?u=user1',
      rating: 5,
      comment: 'Amazing event! The AI music was incredible and the venue was perfect. Can\'t wait for the next one!',
      likes: 23,
      createdAt: '2023-08-15T10:00:00Z'
    },
    {
      id: 'review-2',
      userId: 'user-2',
      username: 'synthwave_fan',
      fullName: 'Maria Garcia',
      avatar: 'https://i.pravatar.cc/50?u=user2',
      rating: 4,
      comment: 'Great atmosphere and good music. The only downside was the long lines for drinks.',
      likes: 15,
      createdAt: '2023-08-20T14:30:00Z'
    }
  ];
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would fetch from an API
        setEvents(mockEvents);
        setFilteredEvents(mockEvents);
        
        // Set ticket types for selected event
        if (selectedEvent) {
          setTicketTypes(mockTicketTypes);
        }
      } catch (error) {
        console.error('Error loading events data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [selectedEvent]);
  
  // Apply filters
  useEffect(() => {
    let filtered = [...events];
    
    // Search query
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Event type
    if (filters.type !== 'all') {
      filtered = filtered.filter(event => event.type === filters.type);
    }
    
    // Virtual/In-person
    if (filters.virtual !== 'all') {
      filtered = filtered.filter(event => 
        filters.virtual === 'virtual' ? event.isVirtual : !event.isVirtual
      );
    }
    
    // Price range
    if (filters.priceRange !== 'all') {
      if (filters.priceRange === 'free') {
        filtered = filtered.filter(event => event.isFree);
      } else if (filters.priceRange === 'paid') {
        filtered = filtered.filter(event => !event.isFree && event.ticketPrice <= 50);
      } else if (filters.priceRange === 'premium') {
        filtered = filtered.filter(event => !event.isFree && event.ticketPrice > 50);
      }
    }
    
    // Date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (filters.dateRange === 'today') {
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.toDateString() === today.toDateString();
        });
      } else if (filters.dateRange === 'week') {
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate <= weekFromNow;
        });
      } else if (filters.dateRange === 'month') {
        const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today && eventDate <= monthFromNow;
        });
      }
    }
    
    // Sort
    switch (filters.sortBy) {
      case 'popularity':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'price':
        filtered.sort((a, b) => a.ticketPrice - b.ticketPrice);
        break;
      case 'rating':
        filtered.sort((a, b) => b.organizer.stats.rating - a.organizer.stats.rating);
        break;
      case 'date':
      default:
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
    }
    
    setFilteredEvents(filtered);
  }, [events, filters]);
  
  // Handle filter change
  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle event like
  const handleLikeEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          isLiked: !event.isLiked,
          likes: event.isLiked ? event.likes - 1 : event.likes + 1
        };
      }
      return event;
    }));
  };
  
  // Handle event bookmark
  const handleBookmarkEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          isBookmarked: !event.isBookmarked
        };
      }
      return event;
    }));
  };
  
  // Handle attending event
  const handleAttendEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          isAttending: !event.isAttending,
          availableTickets: event.isAttending ? event.availableTickets + 1 : event.availableTickets - 1
        };
      }
      return event;
    }));
  };
  
  // Handle joining waitlist
  const handleJoinWaitlist = (eventId: string) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          isOnWaitlist: true,
          waitlistCount: event.waitlistCount + 1
        };
      }
      return event;
    }));
  };
  
  // Handle opening event detail
  const handleOpenEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDetailOpen(true);
  };
  
  // Handle ticket purchase
  const handlePurchaseTickets = async () => {
    if (!selectedEvent || !selectedTicketType || ticketQuantity <= 0) return;
    
    setIsPurchasing(true);
    
    try {
      // In a real app, this would call a payment API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update ticket availability
      setEvents(prev => prev.map(event => {
        if (event.id === selectedEvent.id) {
          const ticketType = ticketTypes.find(t => t.id === selectedTicketType);
          if (ticketType) {
            return {
              ...event,
              availableTickets: event.availableTickets - ticketQuantity,
              attendees: [
                ...event.attendees,
                ...Array.from({ length: ticketQuantity }, (_, i) => ({
                  id: `attendee-${Date.now()}-${i}`,
                  userId: currentUser?.id || '',
                  username: currentUser?.username || '',
                  fullName: currentUser?.fullName || currentUser?.username || '',
                  avatar: currentUser?.imageUrl || '',
                  ticketType: selectedTicketType,
                  ticketNumber: `TKT-${Date.now()}-${i}`,
                  checkedIn: false,
                  attended: false,
                  joinedAt: new Date().toISOString()
                }))
              ]
            };
          }
        }
        return event;
      }));
      
      // Mark as attending
      handleAttendEvent(selectedEvent.id);
      
      // Show success
      setShowQRCode(true);
      
      // Reset form
      setSelectedTicketType('');
      setTicketQuantity(1);
      setShowTicketPurchase(false);
    } catch (error) {
      console.error('Error purchasing tickets:', error);
    } finally {
      setIsPurchasing(false);
    }
  };
  
  // Handle submitting review
  const handleSubmitReview = async () => {
    if (!selectedEvent || !newReview.comment.trim()) return;
    
    try {
      // In a real app, this would call an API
      const review: EventReview = {
        id: `review-${Date.now()}`,
        userId: currentUser?.id || '',
        username: currentUser?.username || '',
        fullName: currentUser?.fullName || currentUser?.username || '',
        avatar: currentUser?.imageUrl || '',
        rating: newReview.rating,
        comment: newReview.comment,
        likes: 0,
        createdAt: new Date().toISOString()
      };
      
      setReviews(prev => [review, ...prev]);
      setNewReview({ rating: 5, comment: '' });
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };
  
  // Handle creating event
  const handleCreateEvent = async () => {
    if (!eventForm.title.trim() || !eventForm.description.trim() || !eventForm.date) return;
    
    try {
      // In a real app, this would call an API
      const newEvent: Event = {
        id: `event-${Date.now()}`,
        title: eventForm.title,
        description: eventForm.description,
        shortDescription: eventForm.description.substring(0, 100) + '...',
        type: eventForm.type as any,
        status: 'upcoming',
        isVirtual: eventForm.isVirtual,
        isFree: eventForm.isFree,
        isExclusive: false,
        featured: false,
        tags: eventForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        organizer: {
          id: 'org-current',
          name: currentUser?.fullName || 'You',
          type: 'artist',
          avatar: currentUser?.imageUrl || '',
          verified: false,
          stats: {
            eventsOrganized: 1,
            totalAttendees: 0,
            rating: 5,
            reviews: 0
          }
        },
        venue: {
          id: 'venue-temp',
          name: eventForm.isVirtual ? 'Virtual Event' : eventForm.venue,
          address: eventForm.isVirtual ? 'Online' : '',
          city: '',
          country: '',
          coordinates: { lat: 0, lng: 0 },
          capacity: eventForm.totalTickets,
          amenities: eventForm.isVirtual ? ['Live Stream', 'Chat'] : ['Stage', 'Sound']
        },
        date: eventForm.date,
        time: eventForm.time,
        timezone: 'EST',
        ticketPrice: eventForm.ticketPrice,
        currency: eventForm.currency,
        totalTickets: eventForm.totalTickets,
        availableTickets: eventForm.totalTickets,
        soldOut: false,
        waitlistEnabled: false,
        waitlistCount: 0,
        requirements: eventForm.requirements.split(',').map(req => req.trim()).filter(req => req),
        lineUp: [],
        schedule: [],
        sponsors: [],
        images: [],
        videos: [],
        attendees: [],
        likes: 0,
        shares: 0,
        views: 0,
        isLiked: false,
        isBookmarked: false,
        isAttending: false,
        isOnWaitlist: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setEvents(prev => [newEvent, ...prev]);
      setIsCreateEventOpen(false);
      setEventForm({
        title: '',
        description: '',
        type: 'concert',
        isVirtual: false,
        isFree: false,
        venue: '',
        date: '',
        time: '',
        ticketPrice: 0,
        currency: 'USD',
        totalTickets: 100,
        tags: '',
        requirements: ''
      });
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'concert': return 'bg-purple-600';
      case 'festival': return 'bg-cyan-600';
      case 'club': return 'bg-pink-600';
      case 'stream': return 'bg-green-600';
      case 'workshop': return 'bg-yellow-600';
      case 'meetup': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-green-400';
      case 'live': return 'text-red-400';
      case 'past': return 'text-gray-400';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-mono font-bold text-glow-cyan mb-2">
            Events & Concerts
          </h1>
          <p className="text-gray-400">
            Discover and attend amazing music events and concerts
          </p>
        </div>
        
        <Button 
          onClick={() => setIsCreateEventOpen(true)}
          className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700"
        >
          <Plus className="h-4 w-4" />
          <span>Create Event</span>
        </Button>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="pl-10 bg-black/30 border-gray-700"
                />
              </div>
            </div>
            
            <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
              <SelectTrigger className="bg-black/30 border-gray-700">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="concert">Concert</SelectItem>
                <SelectItem value="festival">Festival</SelectItem>
                <SelectItem value="club">Club</SelectItem>
                <SelectItem value="stream">Stream</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="meetup">Meetup</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
              <SelectTrigger className="bg-black/30 border-gray-700">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange('priceRange', value)}>
              <SelectTrigger className="bg-black/30 border-gray-700">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Under $50</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={filters.virtual === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('virtual', filters.virtual === 'all' ? 'all' : 'all')}
            >
              <Globe className="h-4 w-4 mr-1" />
              All Events
            </Button>
            <Button
              variant={filters.virtual === 'virtual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('virtual', 'virtual')}
            >
              <Wifi className="h-4 w-4 mr-1" />
              Virtual
            </Button>
            <Button
              variant={filters.virtual === 'in-person' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange('virtual', 'in-person')}
            >
              <MapPin className="h-4 w-4 mr-1" />
              In-Person
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Events List */}
      <div className="space-y-6">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-bold mb-2">No events found</h3>
              <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
              <Button onClick={() => setIsCreateEventOpen(true)}>
                Create an event
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map(event => (
            <Card 
              key={event.id} 
              className="overflow-hidden hover:border-cyan-500/30 transition-all cursor-pointer"
              onClick={() => handleOpenEvent(event)}
            >
              {/* Event Image */}
              <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url(${event.images[0] || 'https://picsum.photos/seed/default/800/400'})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                {/* Event Type Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className={`${getEventTypeColor(event.type)} text-white`}>
                    {event.type}
                  </Badge>
                </div>
                
                {/* Event Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>
                
                {/* Featured Badge */}
                {event.featured && (
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-yellow-600/20 text-yellow-400">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
                
                {/* Virtual/In-person Badge */}
                <div className="absolute bottom-3 right-3">
                  <Badge variant="outline" className={event.isVirtual ? 'bg-green-600/20 text-green-400' : 'bg-purple-600/20 text-purple-400'}>
                    {event.isVirtual ? (
                      <>
                        <Wifi className="h-3 w-3 mr-1" />
                        Virtual
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3 w-3 mr-1" />
                        In-Person
                      </>
                    )}
                  </Badge>
                </div>
                
                {/* Price Badge */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                  <Badge className={`${event.isFree ? 'bg-green-600' : 'bg-cyan-600'} text-white`}>
                    {event.isFree ? 'FREE' : `$${event.ticketPrice}`}
                  </Badge>
                </div>
              </div>
              
              {/* Event Content */}
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg truncate">{event.title}</h3>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Bookmark className="h-4 w-4 mr-2" />
                            {event.isBookmarked ? 'Unbookmark' : 'Bookmark'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          {currentUser?.id === event.organizer.id && (
                            <>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem>
                            <Flag className="h-4 w-4 mr-2" />
                            Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className="text-gray-300 mb-3 line-clamp-2">{event.shortDescription}</p>
                    
                    {/* Event Details */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(event.time)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{event.venue.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees.length} attending</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {event.tags.slice(0, 3).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs"
                          >
                            #{tag}
                          </Badge>
                        ))}
                        {event.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{event.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Organizer */}
                    <div className="flex items-center space-x-2 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={event.organizer.avatar} />
                        <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-gray-400">
                        by {event.organizer.name}
                      </span>
                      {event.organizer.verified && (
                        <Badge variant="secondary" className="text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Event Actions */}
                  <div className="flex flex-col items-end space-y-2">
                    {/* Ticket Info */}
                    {!event.isFree && (
                      <div className="text-right">
                        <div className="text-lg font-bold text-cyan-400">
                          ${event.ticketPrice}
                        </div>
                        <div className="text-xs text-gray-400">
                          {event.availableTickets} left
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2">
                      {event.soldOut ? (
                        <Button disabled className="w-full">
                          <XCircle className="h-4 w-4 mr-1" />
                          Sold Out
                        </Button>
                      ) : event.isAttending ? (
                        <Button variant="outline" className="w-full">
                          <Check className="h-4 w-4 mr-1" />
                          Attending
                        </Button>
                      ) : (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAttendEvent(event.id);
                          }}
                          className="w-full bg-cyan-600 hover:bg-cyan-700"
                        >
                          {event.isFree ? 'Attend' : 'Get Tickets'}
                        </Button>
                      )}
                      
                      {event.waitlistEnabled && !event.soldOut && !event.isAttending && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinWaitlist(event.id);
                          }}
                        >
                          Join Waitlist
                        </Button>
                      )}
                      
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeEvent(event.id);
                          }}
                        >
                          <Heart className={`h-4 w-4 ${event.isLiked ? 'text-red-400 fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookmarkEvent(event.id);
                          }}
                        >
                          <Bookmark className={`h-4 w-4 ${event.isBookmarked ? 'text-cyan-400 fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Event Detail Dialog */}
      <Dialog open={isEventDetailOpen} onOpenChange={setIsEventDetailOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Header */}
              <div className="relative h-64 bg-cover bg-center rounded-lg overflow-hidden" style={{ backgroundImage: `url(${selectedEvent.images[0] || 'https://picsum.photos/seed/default/800/400'})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={`${getEventTypeColor(selectedEvent.type)} text-white`}>
                          {selectedEvent.type}
                        </Badge>
                        <Badge variant="secondary" className={getStatusColor(selectedEvent.status)}>
                          {selectedEvent.status}
                        </Badge>
                        {selectedEvent.featured && (
                          <Badge className="bg-yellow-600/20 text-yellow-400">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {selectedEvent.title}
                      </h2>
                      <p className="text-gray-200 max-w-2xl">
                        {selectedEvent.description}
                      </p>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant={selectedEvent.isLiked ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLikeEvent(selectedEvent.id)}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${selectedEvent.isLiked ? 'text-white' : ''}`} />
                        {selectedEvent.likes}
                      </Button>
                      <Button
                        variant={selectedEvent.isBookmarked ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleBookmarkEvent(selectedEvent.id)}
                      >
                        <Bookmark className={`h-4 w-4 mr-1 ${selectedEvent.isBookmarked ? 'text-white' : ''}`} />
                        {selectedEvent.isBookmarked ? 'Saved' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Event Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date & Time */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Calendar className="h-6 w-6 text-cyan-400" />
                      <h3 className="font-bold">Date & Time</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CalendarDays className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(selectedEvent.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatTime(selectedEvent.time)} {selectedEvent.timezone}</span>
                      </div>
                      {selectedEvent.duration && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>Duration: {selectedEvent.duration}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Venue */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <MapPin className="h-6 w-6 text-purple-400" />
                      <h3 className="font-bold">Venue</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium">{selectedEvent.venue.name}</div>
                      {!selectedEvent.isVirtual && (
                        <div className="text-sm text-gray-400">
                          {selectedEvent.venue.address}, {selectedEvent.venue.city}, {selectedEvent.venue.country}
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>Capacity: {selectedEvent.venue.capacity.toLocaleString()}</span>
                      </div>
                      {selectedEvent.venue.website && (
                        <a 
                          href={selectedEvent.venue.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 text-sm"
                        >
                          Visit Website →
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Tickets */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Ticket className="h-6 w-6 text-green-400" />
                      <h3 className="font-bold">Tickets</h3>
                    </div>
                    <div className="space-y-2">
                      {selectedEvent.isFree ? (
                        <div className="text-green-400 font-medium">FREE Event</div>
                      ) : (
                        <div className="text-cyan-400 font-medium">
                          ${selectedEvent.ticketPrice} {selectedEvent.currency}
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{selectedEvent.availableTickets} tickets left</span>
                      </div>
                      {selectedEvent.soldOut && (
                        <div className="text-red-400 text-sm">Sold Out</div>
                      )}
                      {selectedEvent.waitlistEnabled && selectedEvent.waitlistCount > 0 && (
                        <div className="text-yellow-400 text-sm">
                          {selectedEvent.waitlistCount} on waitlist
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Lineup */}
              {selectedEvent.lineUp.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Music className="h-5 w-5 text-purple-400" />
                      Lineup
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedEvent.lineUp.map((artist, index) => (
                        <div key={artist.id} className="flex items-center space-x-3 p-3 bg-black/20 rounded-lg">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={artist.avatar} />
                            <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold">{artist.name}</h4>
                              {artist.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  <Check className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 capitalize">{artist.type}</p>
                            {artist.setTime && (
                              <p className="text-xs text-cyan-400">
                                {formatTime(artist.setTime)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Schedule */}
              {selectedEvent.schedule.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-cyan-400" />
                      Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedEvent.schedule.map((item, index) => (
                        <div key={index} className="flex items-start space-x-4 p-3 bg-black/20 rounded-lg">
                          <div className="flex-shrink-0 w-20 text-cyan-400 font-mono text-sm">
                            {item.time}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold">{item.title}</h4>
                            <p className="text-sm text-gray-400">{item.description}</p>
                            {item.duration && (
                              <p className="text-xs text-gray-500 mt-1">
                                Duration: {item.duration}
                              </p>
                            )}
                            {item.stage && (
                              <p className="text-xs text-purple-400 mt-1">
                                Stage: {item.stage}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Requirements */}
              {selectedEvent.requirements && selectedEvent.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                      Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedEvent.requirements.map((req, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-green-400" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              
              {/* Organizer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-400" />
                    Organizer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedEvent.organizer.avatar} />
                      <AvatarFallback>{selectedEvent.organizer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold">{selectedEvent.organizer.name}</h3>
                        {selectedEvent.organizer.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <Check className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs capitalize">
                          {selectedEvent.organizer.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                        <span>{selectedEvent.organizer.stats.eventsOrganized} events</span>
                        <span>{selectedEvent.organizer.stats.totalAttendees.toLocaleString()} attendees</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>{selectedEvent.organizer.stats.rating}</span>
                          <span>({selectedEvent.organizer.stats.reviews})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-gray-700">
                {selectedEvent.soldOut ? (
                  <Button disabled className="w-full md:w-auto">
                    <XCircle className="h-4 w-4 mr-2" />
                    Sold Out
                  </Button>
                ) : selectedEvent.isAttending ? (
                  <Button variant="outline" className="w-full md:w-auto">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Attending
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setShowTicketPurchase(true)}
                    className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-700"
                  >
                    {selectedEvent.isFree ? 'Attend Event' : 'Get Tickets'}
                  </Button>
                )}
                
                {selectedEvent.waitlistEnabled && !selectedEvent.soldOut && !selectedEvent.isAttending && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleJoinWaitlist(selectedEvent.id)}
                    className="w-full md:w-auto"
                  >
                    Join Waitlist
                  </Button>
                )}
                
                <Button variant="outline" className="w-full md:w-auto">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              
              {/* Reviews Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Reviews ({reviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Write Review */}
                  {currentUser && (
                    <div className="mb-6 p-4 bg-black/20 rounded-lg">
                      <h4 className="font-bold mb-3">Write a Review</h4>
                      <div className="flex items-center space-x-2 mb-3">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Button
                            key={star}
                            variant="ghost"
                            size="sm"
                            onClick={() => setNewReview({...newReview, rating: star})}
                          >
                            <Star className={`h-5 w-5 ${star <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                          </Button>
                        ))}
                        <span className="ml-2 text-sm text-gray-400">
                          {newReview.rating} out of 5
                        </span>
                      </div>
                      <Textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                        placeholder="Share your experience..."
                        rows={3}
                      />
                      <div className="flex justify-end mt-3">
                        <Button 
                          onClick={handleSubmitReview}
                          disabled={!newReview.comment.trim()}
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >
                          Submit Review
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Reviews List */}
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No reviews yet. Be the first to review!</p>
                    ) : (
                      reviews.map(review => (
                        <div key={review.id} className="flex gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={review.avatar} />
                            <AvatarFallback>{review.fullName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 bg-black/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-bold">{review.fullName}</h4>
                                <div className="flex items-center space-x-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    {formatDate(review.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-gray-300 mb-3">{review.comment}</p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-cyan-400"
                                >
                                  <ThumbsUp className="h-4 w-4 mr-1" />
                                  {review.likes}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Ticket Purchase Dialog */}
      <Dialog open={showTicketPurchase} onOpenChange={setShowTicketPurchase}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Tickets</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">{selectedEvent.title}</h3>
                <p className="text-gray-400">
                  {formatDate(selectedEvent.date)} at {formatTime(selectedEvent.time)}
                </p>
              </div>
              
              <div>
                <Label htmlFor="ticketType">Ticket Type</Label>
                <Select value={selectedTicketType} onValueChange={setSelectedTicketType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ticket type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketTypes.map(ticket => (
                      <SelectItem key={ticket.id} value={ticket.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{ticket.name}</span>
                          <span className="ml-2 font-bold">${ticket.price}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {ticket.available} available
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedTicketType ? ticketTypes.find(t => t.id === selectedTicketType)?.purchaseLimit || 4 : 4}
                  value={ticketQuantity}
                  onChange={(e) => setTicketQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
              
              <div className="bg-black/20 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span>Subtotal</span>
                  <span className="font-bold">
                    ${selectedTicketType && ticketQuantity 
                      ? (ticketTypes.find(t => t.id === selectedTicketType)?.price || 0) * ticketQuantity 
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Fees</span>
                  <span className="font-bold">$5.00</span>
                </div>
                <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-xl text-cyan-400">
                    ${selectedTicketType && ticketQuantity 
                      ? (ticketTypes.find(t => t.id === selectedTicketType)?.price || 0) * ticketQuantity + 5
                      : 5}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowTicketPurchase(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePurchaseTickets}
                  disabled={!selectedTicketType || ticketQuantity <= 0 || isPurchasing}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  {isPurchasing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Purchase
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tickets Purchased!</DialogTitle>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
            <h3 className="text-xl font-bold">Your tickets have been purchased!</h3>
            <p className="text-gray-400">
              Check your email for confirmation details and QR codes
            </p>
            
            <div className="bg-black/20 p-6 rounded-lg">
              <div className="w-48 h-48 bg-white mx-auto mb-4 flex items-center justify-center">
                <QrCode className="h-32 w-32 text-gray-800" />
              </div>
              <p className="text-sm text-gray-400">
                Show this QR code at the entrance
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowQRCode(false)}>
                Close
              </Button>
              <Button onClick={() => setShowQRCode(false)}>
                <Download className="h-4 w-4 mr-2" />
                Download Tickets
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Create Event Dialog */}
      <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={eventForm.title}
                onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                placeholder="Enter event title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                placeholder="Describe your event"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Event Type</Label>
                <Select value={eventForm.type} onValueChange={(value) => setEventForm({...eventForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concert">Concert</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="club">Club</SelectItem>
                    <SelectItem value="stream">Stream</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="venue">Venue Name</Label>
                <Input
                  id="venue"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({...eventForm, venue: e.target.value})}
                  placeholder={eventForm.isVirtual ? 'Virtual Event' : 'Venue name'}
                  disabled={eventForm.isVirtual}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value="EST" onValueChange={(value) => setEventForm({...eventForm, timezone: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EST">EST</SelectItem>
                    <SelectItem value="PST">PST</SelectItem>
                    <SelectItem value="CST">CST</SelectItem>
                    <SelectItem value="GMT">GMT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ticketPrice">Ticket Price ($)</Label>
                <Input
                  id="ticketPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={eventForm.ticketPrice}
                  onChange={(e) => setEventForm({...eventForm, ticketPrice: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <Label htmlFor="totalTickets">Total Tickets</Label>
                <Input
                  id="totalTickets"
                  type="number"
                  min="1"
                  value={eventForm.totalTickets}
                  onChange={(e) => setEventForm({...eventForm, totalTickets: parseInt(e.target.value) || 100})}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isVirtual"
                  checked={eventForm.isVirtual}
                  onCheckedChange={(checked) => setEventForm({...eventForm, isVirtual: checked})}
                />
                <Label htmlFor="isVirtual">Virtual Event</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFree"
                  checked={eventForm.isFree}
                  onCheckedChange={(checked) => setEventForm({...eventForm, isFree: checked, ticketPrice: checked ? 0 : eventForm.ticketPrice})}
                />
                <Label htmlFor="isFree">Free Event</Label>
              </div>
            </div>
            
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={eventForm.tags}
                onChange={(e) => setEventForm({...eventForm, tags: e.target.value})}
                placeholder="music, electronic, ai"
              />
            </div>
            
            <div>
              <Label htmlFor="requirements">Requirements (comma separated)</Label>
              <Input
                id="requirements"
                value={eventForm.requirements}
                onChange={(e) => setEventForm({...eventForm, requirements: e.target.value})}
                placeholder="ID required, 18+"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateEventOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateEvent}>
                Create Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsAndConcerts;