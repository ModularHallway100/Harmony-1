import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Heart, 
  Play, 
  MessageSquare, 
  Share2, 
  Bell, 
  Crown, 
  Gift, 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  Award,
  Mic,
  Music,
  Palette,
  Sparkles,
  Plus,
  Settings,
  MoreHorizontal,
  Check,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Send,
  Gift as GiftIcon,
  Zap,
  TrendingUp,
  Globe,
  MapPin,
  DollarSign,
  Download,
  Volume2,
  Heart as HeartSolid,
  Bookmark,
  UserPlus,
  CheckCircle
} from 'lucide-react';

// Extended artist interface with social features
interface EnhancedArtist {
  id: string;
  name: string;
  genre: string;
  description: string;
  profileImage: string;
  bannerImage: string;
  isVerified: boolean;
  isAI: boolean;
  creatorId: string;
  creatorName: string;
  stats: ArtistStats;
  socialLinks: SocialLinks;
  pricing: ArtistPricing;
  availability: ArtistAvailability;
  features: ArtistFeatures;
  fanCommunity: FanCommunity;
  upcomingEvents: Event[];
  exclusiveContent: ExclusiveContent[];
  recentActivity: Activity[];
}

interface ArtistStats {
  followers: number;
  monthlyListeners: number;
  totalPlays: number;
  topTracks: Track[];
  achievements: Achievement[];
}

interface SocialLinks {
  website?: string;
  twitter?: string;
  instagram?: string;
  discord?: string;
  youtube?: string;
  spotify?: string;
}

interface ArtistPricing {
  commissionRate: number;
  subscriptionPrice: number;
  oneTimePrice?: number;
  trialPeriod?: number;
  currency: string;
}

interface ArtistAvailability {
  available: boolean;
  responseTime: string;
  bookingEnabled: boolean;
  collaborationEnabled: boolean;
}

interface ArtistFeatures {
  messaging: boolean;
  voiceMessages: boolean;
  exclusiveContent: boolean;
  liveStreams: boolean;
  collaborations: boolean;
  commissions: boolean;
}

interface FanCommunity {
  level: number;
  points: number;
  nextLevelPoints: number;
  perks: string[];
  topFans: Fan[];
  communityStats: {
    totalMembers: number;
    activeMembers: number;
    messagesToday: number;
    eventsHosted: number;
  };
}

interface Fan {
  id: string;
  username: string;
  avatar: string;
  points: number;
  joinedAt: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  isVirtual: boolean;
  price: number;
  maxAttendees: number;
  attendees: number;
  isExclusive: boolean;
  requirements?: string[];
}

interface ExclusiveContent {
  id: string;
  title: string;
  type: 'track' | 'video' | 'photo' | 'document' | 'stream';
  description: string;
  thumbnail: string;
  duration?: string;
  fileSize?: string;
  accessLevel: 'fan' | 'supporter' | 'patron';
  releaseDate: string;
  likes: number;
  downloads: number;
  isAvailable: boolean;
}

interface Activity {
  id: string;
  type: 'release' | 'event' | 'message' | 'stream' | 'collaboration';
  title: string;
  description: string;
  timestamp: string;
  isPublic: boolean;
}

interface Track {
  id: string;
  title: string;
  duration: string;
  plays: number;
  likes: number;
  isExclusive: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'voice' | 'image' | 'file';
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
}

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  benefits: string[];
  color: string;
  isPopular?: boolean;
}

const EnhancedArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useClerkUser();
  const { setUser } = useUserStore();
  const { 
    aiArtists, 
    toggleFollowArtist, 
    followedArtistIds,
    getAllAIArtists 
  } = useLibraryStore();
  
  // State management
  const [artist, setArtist] = useState<EnhancedArtist | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [fanLevel, setFanLevel] = useState(0);
  const [points, setPoints] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // Messaging states
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  // Fan interaction states
  const [isFanProfileOpen, setIsFanProfileOpen] = useState(false);
  const [fanTier, setFanTier] = useState<'bronze' | 'silver' | 'gold' | 'platinum'>('bronze');
  const [contributionPoints, setContributionPoints] = useState(0);
  
  // Notification states
  const [notificationSettings, setNotificationSettings] = useState({
    newReleases: true,
    liveStreams: true,
    communityMessages: true,
    exclusiveContent: true,
    events: true
  });
  
  // Exclusive content states
  const [selectedExclusiveContent, setSelectedExclusiveContent] = useState<ExclusiveContent | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Subscription states
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  
  // Mock data for demonstration
  const mockArtist: EnhancedArtist = {
    id: id || 'artist-1',
    name: 'Neon Dreams',
    genre: 'Synthwave',
    description: 'AI-powered synthwave artist creating nostalgic futuristic soundscapes. Blending analog warmth with digital innovation to transport you to neon-lit cityscapes.',
    profileImage: 'https://i.pravatar.cc/150?u=neon-dreams',
    bannerImage: 'https://picsum.photos/seed/neon-banner/1200/400',
    isVerified: true,
    isAI: true,
    creatorId: 'creator-1',
    creatorName: 'Alex Rivera',
    stats: {
      followers: 5423,
      monthlyListeners: 125680,
      totalPlays: 2345678,
      topTracks: [
        { id: 'track-1', title: 'Neon Nights', duration: '3:45', plays: 456789, likes: 12345, isExclusive: false },
        { id: 'track-2', title: 'Digital Sunset', duration: '4:12', plays: 389012, likes: 9876, isExclusive: true },
        { id: 'track-3', title: 'Cyber Love', duration: '3:28', plays: 287654, likes: 7654, isExclusive: false }
      ],
      achievements: [
        { id: 'ach-1', title: 'Rising Star', description: 'First 1000 followers', icon: '⭐', rarity: 'common', unlockedAt: '2023-06-20' },
        { id: 'ach-2', title: 'Chart Topper', description: 'Track in top 10', icon: '🏆', rarity: 'rare', unlockedAt: '2023-07-15' },
        { id: 'ach-3', title: 'Pioneer', description: 'First AI artist collaboration', icon: '🚀', rarity: 'epic', unlockedAt: '2023-08-30' }
      ]
    },
    socialLinks: {
      website: 'https://neondreams.ai',
      twitter: 'https://twitter.com/neondreams_ai',
      instagram: 'https://instagram.com/neondreams_ai',
      discord: 'https://discord.gg/neondreams',
      youtube: 'https://youtube.com/neondreams',
      spotify: 'https://open.spotify.com/artist/neondreams'
    },
    pricing: {
      commissionRate: 15,
      subscriptionPrice: 4.99,
      oneTimePrice: 9.99,
      trialPeriod: 7,
      currency: 'USD'
    },
    availability: {
      available: true,
      responseTime: '24 hours',
      bookingEnabled: true,
      collaborationEnabled: true
    },
    features: {
      messaging: true,
      voiceMessages: true,
      exclusiveContent: true,
      liveStreams: true,
      collaborations: true,
      commissions: true
    },
    fanCommunity: {
      level: 3,
      points: 1250,
      nextLevelPoints: 2000,
      perks: [
        'Early access to new releases',
        'Exclusive behind-the-scenes content',
        'Priority in live streams',
        'Special Discord role',
        'Monthly Q&A sessions'
      ],
      topFans: [
        { id: 'fan-1', username: 'synthwave_lover', avatar: 'https://i.pravatar.cc/50?u=fan1', points: 2450, joinedAt: '2023-05-15', tier: 'platinum' },
        { id: 'fan-2', username: 'neon_nights', avatar: 'https://i.pravatar.cc/50?u=fan2', points: 1890, joinedAt: '2023-06-20', tier: 'gold' },
        { id: 'fan-3', username: 'cyber_punk', avatar: 'https://i.pravatar.cc/50?u=fan3', points: 1245, joinedAt: '2023-07-10', tier: 'silver' }
      ],
      communityStats: {
        totalMembers: 1247,
        activeMembers: 342,
        messagesToday: 89,
        eventsHosted: 15
      }
    },
    upcomingEvents: [
      {
        id: 'event-1',
        title: 'Neon Dreams Live Stream',
        description: 'Exclusive live performance and Q&A session',
        date: '2023-10-15',
        time: '20:00',
        location: 'Twitch',
        isVirtual: true,
        price: 0,
        maxAttendees: 1000,
        attendees: 856,
        isExclusive: true,
        requirements: ['Fan level 2+']
      },
      {
        id: 'event-2',
        title: 'Synthwave Festival',
        description: 'Live performance at annual synthwave festival',
        date: '2023-11-05',
        time: '22:00',
        location: 'Berlin, Germany',
        isVirtual: false,
        price: 45,
        maxAttendees: 5000,
        attendees: 3421,
        isExclusive: false
      }
    ],
    exclusiveContent: [
      {
        id: 'content-1',
        title: 'Digital Sunset (Exclusive Mix)',
        type: 'track',
        description: 'Extended version with additional layers and unreleased elements',
        thumbnail: 'https://picsum.photos/seed/content1/300/300',
        duration: '5:42',
        accessLevel: 'fan',
        releaseDate: '2023-09-20',
        likes: 342,
        downloads: 189,
        isAvailable: true
      },
      {
        id: 'content-2',
        title: 'Behind the Scenes: Creating Neon Dreams',
        type: 'video',
        description: 'Exclusive look into the creative process',
        thumbnail: 'https://picsum.photos/seed/content2/300/300',
        duration: '12:34',
        accessLevel: 'supporter',
        releaseDate: '2023-09-25',
        likes: 567,
        downloads: 234,
        isAvailable: true
      },
      {
        id: 'content-3',
        title: 'Neon Dreams Studio Pack',
        type: 'document',
        description: 'Free sample pack with sounds used in productions',
        thumbnail: 'https://picsum.photos/seed/content3/300/300',
        fileSize: '156 MB',
        accessLevel: 'fan',
        releaseDate: '2023-10-01',
        likes: 892,
        downloads: 456,
        isAvailable: true
      }
    ],
    recentActivity: [
      {
        id: 'act-1',
        type: 'release',
        title: 'New Track: Electric Dreams',
        description: 'Latest synthwave release now available',
        timestamp: '2023-10-05T14:30:00Z',
        isPublic: true
      },
      {
        id: 'act-2',
        type: 'event',
        title: 'Upcoming Live Stream',
        description: 'Join me this Friday for an exclusive performance',
        timestamp: '2023-10-04T10:15:00Z',
        isPublic: true
      },
      {
        id: 'act-3',
        type: 'collaboration',
        title: 'New Collaboration: Future Bass',
        description: 'Working with Glitchard on a new track',
        timestamp: '2023-10-03T16:45:00Z',
        isPublic: true
      }
    ]
  };
  
  // Subscription tiers
  const subscriptionTiers: SubscriptionTier[] = [
    {
      id: 'fan',
      name: 'Fan',
      price: 0,
      currency: 'USD',
      features: ['Access to community', 'Basic content', 'Monthly newsletter'],
      benefits: ['Join the community', 'Stay updated', 'Connect with other fans'],
      color: 'bg-gray-600'
    },
    {
      id: 'supporter',
      name: 'Supporter',
      price: 4.99,
      currency: 'USD',
      features: ['All Fan features', 'Exclusive content', 'Early access', 'Ad-free experience'],
      benefits: ['Support the artist', 'Get exclusive content', 'Early releases', 'No ads'],
      color: 'bg-purple-600'
    },
    {
      id: 'patron',
      name: 'Patron',
      price: 9.99,
      currency: 'USD',
      features: ['All Supporter features', 'Voice messages', 'Personalized content', 'Behind-the-scenes'],
      benefits: ['Direct artist interaction', 'Personalized experiences', 'Behind-the-scenes access', 'VIP support'],
      color: 'bg-cyan-600',
      isPopular: true
    }
  ];
  
  // Load artist data
  useEffect(() => {
    const loadArtist = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would fetch from an API
        const artistData = mockArtist;
        
        setArtist(artistData);
        
        // Check if current user is following this artist
        if (currentUser && followedArtistIds.has(artistData.id)) {
          setIsFollowing(true);
        }
        
        // Check subscription status
        if (currentUser) {
          // In a real app, check subscription status
          setIsSubscribed(false);
          setFanLevel(artistData.fanCommunity.level);
          setPoints(artistData.fanCommunity.points);
        }
      } catch (error) {
        console.error('Error loading artist:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadArtist();
  }, [id, currentUser, followedArtistIds]);
  
  // Handle follow/unfollow
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    toggleFollowArtist(artist?.id || '');
    // In a real app, this would call an API
  };
  
  // Handle subscription
  const handleSubscribe = async (tierId: string) => {
    if (!artist) return;
    
    setIsSubscribing(true);
    setSelectedTier(tierId);
    
    try {
      // In a real app, this would call a payment API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubscribed(true);
      setShowSubscriptionDialog(false);
      
      // Update fan level based on tier
      const tier = subscriptionTiers.find(t => t.id === tierId);
      if (tier) {
        if (tier.id === 'supporter') {
          setFanLevel(2);
        } else if (tier.id === 'patron') {
          setFanLevel(3);
        }
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    } finally {
      setIsSubscribing(false);
    }
  };
  
  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !artist || !currentUser) return;
    
    setIsSending(true);
    
    try {
      // In a real app, this would call a messaging API
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.fullName || currentUser.username,
        senderAvatar: currentUser.imageUrl || '',
        content: messageInput,
        timestamp: new Date().toISOString(),
        isRead: true,
        type: 'text'
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  // Handle downloading exclusive content
  const handleDownloadContent = async (content: ExclusiveContent) => {
    if (!content.isAvailable) return;
    
    setIsDownloading(true);
    
    try {
      // In a real app, this would call a download API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate download
      const link = document.createElement('a');
      link.href = content.thumbnail; // In real app, this would be the actual file URL
      link.download = content.title;
      link.click();
    } catch (error) {
      console.error('Error downloading content:', error);
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Handle notification preference change
  const handleNotificationChange = (key: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
  
  // Get fan tier color
  const getFanTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'bg-amber-600';
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-500';
      case 'platinum': return 'bg-purple-400';
      default: return 'bg-gray-600';
    }
  };
  
  // Calculate fan progress percentage
  const fanProgress = useMemo(() => {
    if (!artist) return 0;
    return (artist.fanCommunity.points / artist.fanCommunity.nextLevelPoints) * 100;
  }, [artist]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }
  
  if (!artist) {
    return <div className="text-center text-2xl font-bold">Artist not found.</div>;
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Artist Header */}
      <div className="relative rounded-xl overflow-hidden">
        <div 
          className="h-64 bg-cover bg-center"
          style={{ backgroundImage: `url(${artist.bannerImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-black">
                <AvatarImage src={artist.profileImage} />
                <AvatarFallback className="text-2xl">
                  {artist.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {artist.isVerified && (
                <Badge className="absolute bottom-2 right-2 bg-cyan-600 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
              {artist.isAI && (
                <Badge className="absolute top-2 right-2 bg-purple-600 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Artist
                </Badge>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-mono font-bold text-glow-cyan">
                  {artist.name}
                </h1>
                <Badge variant="outline" className="border-purple-500 text-purple-400">
                  {artist.genre}
                </Badge>
              </div>
              
              <p className="text-gray-300 mb-4 max-w-2xl">{artist.description}</p>
              
              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{artist.stats.followers.toLocaleString()} followers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Music className="h-4 w-4" />
                  <span>{artist.stats.monthlyListeners.toLocaleString()} monthly listeners</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Play className="h-4 w-4" />
                  <span>{artist.stats.totalPlays.toLocaleString()} plays</span>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex flex-wrap gap-2 mt-4">
                {artist.socialLinks.website && (
                  <a 
                    href={artist.socialLinks.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 bg-black/30 px-3 py-1 rounded-full"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Website</span>
                  </a>
                )}
                {artist.socialLinks.twitter && (
                  <a 
                    href={artist.socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 bg-black/30 px-3 py-1 rounded-full"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Twitter</span>
                  </a>
                )}
                {artist.socialLinks.discord && (
                  <a 
                    href={artist.socialLinks.discord} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 bg-black/30 px-3 py-1 rounded-full"
                  >
                    <Users className="h-4 w-4" />
                    <span>Discord</span>
                  </a>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleFollowToggle}
                className={`flex items-center space-x-2 transition-all ${
                  isFollowing 
                    ? 'bg-lime-600 hover:bg-lime-700' 
                    : 'bg-magenta-600 hover:bg-magenta-700'
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Follow</span>
                  </>
                )}
              </Button>
              
              {!isSubscribed && (
                <Button 
                  onClick={() => setShowSubscriptionDialog(true)}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
                >
                  <Crown className="h-4 w-4" />
                  <span>Subscribe</span>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => setIsMessagingOpen(true)}
                className="flex items-center space-x-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Message</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Artist
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save Artist
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" />
                    Notify Me
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
      
      {/* Fan Community Progress */}
      {currentUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              Your Fan Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getFanTierColor(fanTier)}`}>
                  <span className="text-white font-bold text-xl">
                    {fanLevel}
                  </span>
                </div>
                <div>
                  <p className="font-bold">Fan Level {fanLevel}</p>
                  <p className="text-sm text-gray-400">{points.toLocaleString()} points</p>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress to Level {fanLevel + 1}</span>
                  <span>{Math.round(fanProgress)}%</span>
                </div>
                <div className="w-full h-3 bg-neutral-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                    style={{ width: `${fanProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {artist.fanCommunity.nextLevelPoints - points.toLocaleString()} points to next level
                </p>
              </div>
              
              <Button 
                variant="outline"
                onClick={() => setIsFanProfileOpen(true)}
                className="flex items-center space-x-2"
              >
                <GiftIcon className="h-4 w-4" />
                <span>Earn Points</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Artist Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="exclusive">Exclusive</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Artist Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                  Artist Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Followers</span>
                  <span className="font-bold">{artist.stats.followers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Listeners</span>
                  <span className="font-bold">{artist.stats.monthlyListeners.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Plays</span>
                  <span className="font-bold">{artist.stats.totalPlays.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Response Time</span>
                  <span className="font-bold">{artist.availability.responseTime}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Fan Community */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  Fan Community
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Members</span>
                  <span className="font-bold">{artist.fanCommunity.communityStats.totalMembers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Members</span>
                  <span className="font-bold">{artist.fanCommunity.communityStats.activeMembers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Messages Today</span>
                  <span className="font-bold">{artist.fanCommunity.communityStats.messagesToday}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Events Hosted</span>
                  <span className="font-bold">{artist.fanCommunity.communityStats.eventsHosted}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Top Fans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-400" />
                  Top Fans
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {artist.fanCommunity.topFans.slice(0, 3).map((fan, index) => (
                    <div key={fan.id} className="flex items-center space-x-3">
                      <div className="text-cyan-400 font-bold w-4">{index + 1}</div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={fan.avatar} />
                        <AvatarFallback>{fan.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{fan.username}</p>
                        <p className="text-xs text-gray-400">{fan.points.toLocaleString()} pts</p>
                      </div>
                      <Badge className={`text-xs ${getFanTierColor(fan.tier)}`}>
                        {fan.tier}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-lime-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {artist.recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {activity.type === 'release' && <Music className="h-5 w-5 text-cyan-400" />}
                      {activity.type === 'event' && <Calendar className="h-5 w-5 text-purple-400" />}
                      {activity.type === 'message' && <MessageSquare className="h-5 w-5 text-lime-400" />}
                      {activity.type === 'stream' && <Play className="h-5 w-5 text-pink-400" />}
                      {activity.type === 'collaboration' && <Users className="h-5 w-5 text-blue-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-gray-400">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                    <Badge variant={activity.isPublic ? "default" : "secondary"} className="text-xs">
                      {activity.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Music Tab */}
        <TabsContent value="music" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Tracks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-purple-400" />
                  Top Tracks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {artist.stats.topTracks.map((track, index) => (
                    <div key={track.id} className="flex items-center space-x-3">
                      <div className="text-cyan-400 font-bold w-4">{index + 1}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{track.title}</p>
                        <p className="text-xs text-gray-400">{track.duration} • {track.plays.toLocaleString()} plays</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {track.isExclusive && (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Exclusive
                          </Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {artist.stats.achievements.map(achievement => (
                    <div key={achievement.id} className="flex items-center space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-gray-400">{achievement.description}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          achievement.rarity === 'common' ? 'border-gray-500' :
                          achievement.rarity === 'rare' ? 'border-blue-500' :
                          achievement.rarity === 'epic' ? 'border-purple-500' :
                          'border-yellow-500'
                        }`}
                      >
                        {achievement.rarity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Community Tab */}
        <TabsContent value="community" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Community Perks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GiftIcon className="h-5 w-5 text-cyan-400" />
                  Fan Perks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {artist.fanCommunity.perks.map((perk, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-400" />
                      <span className="text-sm">{perk}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-purple-400" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={`notify-${key}`} className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Switch
                        id={`notify-${key}`}
                        checked={value}
                        onCheckedChange={(checked) => handleNotificationChange(key as keyof typeof notificationSettings, checked)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Community Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                Community Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm prose-invert max-w-none">
                <p>Welcome to the {artist.name} community! Here are some guidelines to keep our community positive and inclusive:</p>
                <ul>
                  <li>Be respectful and kind to all community members</li>
                  <li>Share your love for music and creativity</li>
                  <li>No spam or self-promotion without permission</li>
                  <li>Follow Discord community rules</li>
                  <li>Report any inappropriate behavior to moderators</li>
                </ul>
                <p>Let's create an amazing space together! 🎵</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="space-y-4">
            {artist.upcomingEvents.map(event => (
              <Card key={event.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-lg flex flex-col items-center justify-center text-white">
                        <Calendar className="h-6 w-6 mb-1" />
                        <span className="text-xs font-bold">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold">{event.title}</h3>
                        {event.isExclusive && (
                          <Badge variant="secondary" className="bg-purple-600/20 text-purple-400">
                            <Lock className="h-3 w-3 mr-1" />
                            Exclusive
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-300 mb-3">{event.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{formatTime(event.time)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {event.isVirtual ? (
                            <Globe className="h-4 w-4 text-gray-400" />
                          ) : (
                            <MapPin className="h-4 w-4 text-gray-400" />
                          )}
                          <span>{event.location}</span>
                        </div>
                        {event.price > 0 && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>${event.price}</span>
                          </div>
                        )}
                      </div>
                      
                      {event.requirements && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-400 mb-1">Requirements:</p>
                          <div className="flex flex-wrap gap-2">
                            {event.requirements.map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-400">
                          {event.attendees} / {event.maxAttendees} attendees
                        </div>
                        <div className="flex gap-2">
                          {event.price > 0 ? (
                            <Button className="bg-purple-600 hover:bg-purple-700">
                              Get Tickets
                            </Button>
                          ) : (
                            <Button className="bg-cyan-600 hover:bg-cyan-700">
                              RSVP
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Exclusive Tab */}
        <TabsContent value="exclusive" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artist.exclusiveContent.map(content => (
              <Card key={content.id} className="overflow-hidden">
                <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url(${content.thumbnail})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-purple-600/20 text-purple-400">
                      {content.type === 'track' ? 'Music' :
                       content.type === 'video' ? 'Video' :
                       content.type === 'photo' ? 'Photo' :
                       content.type === 'document' ? 'Document' : 'Stream'}
                    </Badge>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="outline" className="text-xs">
                      {content.accessLevel === 'fan' ? 'Fan' : 
                       content.accessLevel === 'supporter' ? 'Supporter' : 'Patron'}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2">{content.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">{content.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{content.duration || content.fileSize}</span>
                    <span>{formatDate(content.releaseDate)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="flex items-center space-x-1">
                        <HeartSolid className="h-4 w-4 text-red-400" />
                        <span>{content.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4 text-cyan-400" />
                        <span>{content.downloads}</span>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm"
                      onClick={() => handleDownloadContent(content)}
                      disabled={!content.isAvailable || isDownloading}
                      className="flex items-center space-x-1"
                    >
                      {isDownloading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                          <span>Downloading</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Messaging Dialog */}
      <Dialog open={isMessagingOpen} onOpenChange={setIsMessagingOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message {artist.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20 rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                        message.senderId === currentUser?.id 
                          ? 'bg-cyan-600/20 border border-cyan-600/50' 
                          : 'bg-gray-800/50 border border-gray-700/50'
                      }`}
                    >
                      {message.type === 'text' && (
                        <p className="text-sm">{message.content}</p>
                      )}
                      {message.type === 'voice' && (
                        <div className="flex items-center space-x-2">
                          <Volume2 className="h-4 w-4 text-cyan-400" />
                          <span className="text-sm">Voice message</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Message Input */}
            <div className="flex space-x-2 p-4">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-black/30 border-gray-700"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || isSending}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Subscription Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              Subscribe to {artist.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Support {artist.name} and unlock exclusive content, early releases, and more!
            </p>
            
            <div className="space-y-3">
              {subscriptionTiers.map(tier => (
                <Card 
                  key={tier.id} 
                  className={`cursor-pointer transition-all ${
                    selectedTier === tier.id ? 'ring-2 ring-cyan-500' : 'hover:bg-gray-800/50'
                  } ${tier.isPopular ? 'border-cyan-500/30' : ''}`}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{tier.name}</h3>
                          {tier.isPopular && (
                            <Badge className="bg-cyan-600/20 text-cyan-400 text-xs">
                              Most Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-cyan-400">
                          {tier.price === 0 ? 'Free' : `$${tier.price}/${tier.currency}`}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedTier === tier.id ? 'bg-cyan-500 border-cyan-500' : 'border-gray-500'
                      }`} />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Features:</p>
                      <ul className="text-sm space-y-1">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleSubscribe(selectedTier)}
                disabled={!selectedTier || isSubscribing}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSubscribing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="h-4 w-4 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Fan Profile Dialog */}
      <Dialog open={isFanProfileOpen} onOpenChange={setIsFanProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GiftIcon className="h-5 w-5 text-yellow-400" />
              Fan Profile & Points
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${getFanTierColor(fanTier)}`}>
                <span className="text-white font-bold text-2xl">
                  {fanLevel}
                </span>
              </div>
              <h3 className="text-lg font-bold">Fan Level {fanLevel}</h3>
              <p className="text-gray-400">{points.toLocaleString()} points</p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-bold">Ways to Earn Points:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span>Listen to tracks</span>
                  <span className="text-cyan-400">+5 pts</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Like content</span>
                  <span className="text-cyan-400">+2 pts</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Share tracks</span>
                  <span className="text-cyan-400">+3 pts</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Comment</span>
                  <span className="text-cyan-400">+4 pts</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Attend events</span>
                  <span className="text-cyan-400">+10 pts</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Subscribe</span>
                  <span className="text-cyan-400">+50 pts</span>
                </li>
              </ul>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <div>
                <p className="text-sm text-gray-400">Next level bonus</p>
                <p className="font-bold text-cyan-400">
                  {artist.fanCommunity.nextLevelPoints - points.toLocaleString()} points
                </p>
              </div>
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                View Leaderboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedArtistPage;