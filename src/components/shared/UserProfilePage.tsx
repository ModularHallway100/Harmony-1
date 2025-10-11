import React, { useState, useMemo, useEffect } from 'react';
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
  Edit,
  Share2,
  Settings,
  LogOut,
  UserPlus,
  Heart,
  Play,
  MessageSquare,
  Award,
  TrendingUp,
  Calendar,
  Users,
  Music,
  Image,
  Shield,
  Bell,
  Moon,
  Globe,
  Lock,
  Bookmark,
  History,
  BarChart3,
  Palette,
  Crown,
  Sparkles,
  MoreHorizontal,
  Check,
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

// Extended user interface with social features
interface UserProfile {
  id: string;
  clerkUserId: string;
  username: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  userType: 'listener' | 'creator' | 'both';
  isVerified: boolean;
  isPrivate: boolean;
  location?: string;
  website?: string;
  joinedAt: string;
  lastActiveAt: string;
  followersCount: number;
  followingCount: number;
  likesReceived: number;
  commentsCount: number;
  tracksCreated: number;
  playlistsCreated: number;
  achievements: Achievement[];
  recentActivity: Activity[];
  userStats: UserStats;
  preferences: UserPreferences;
  socialConnections: SocialConnection[];
  contentHighlights: ContentHighlight[];
  badges: Badge[];
  collaborations: Collaboration[];
  fanClub?: FanClub;
  referralCode: string;
  referredUsers: number;
  contentCategories: string[];
  listeningStreak: number;
  longestStreak: number;
  communityMemberships: CommunityMembership[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  progress?: number;
  maxProgress?: number;
}

interface Activity {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'create' | 'share' | 'playlist';
  targetId: string;
  targetType: 'track' | 'artist' | 'playlist' | 'user';
  title: string;
  description: string;
  timestamp: string;
  isPublic: boolean;
}

interface UserStats {
  totalPlayTime: number; // in minutes
  favoriteGenres: { genre: string; count: number }[];
  listeningTrends: { date: string; plays: number }[];
  mostPlayedTracks: { trackId: string; playCount: number }[];
  mostActiveHours: { hour: number; activity: number }[];
  socialEngagement: {
    likesGiven: number;
    commentsPosted: number;
    sharesMade: number;
    followersGained: number;
  };
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  explicitContent: boolean;
  activityVisibility: 'public' | 'friends' | 'private';
  messagePrivacy: 'everyone' | 'followers' | 'no-one';
  dataCollection: boolean;
  emailNotifications: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    newFeatures: boolean;
    promotional: boolean;
  };
  pushNotifications: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
    newFeatures: boolean;
    promotional: boolean;
  };
}

interface SocialConnection {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  connectionType: 'mutual' | 'following' | 'follower';
  connectedAt: string;
  mutualArtists: string[];
  mutualPlaylists: string[];
}

interface ContentHighlight {
  id: string;
  type: 'track' | 'playlist' | 'artist' | 'comment';
  title: string;
  description: string;
  thumbnailUrl: string;
  likes: number;
  shares: number;
  createdAt: string;
  isPinned: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
  level?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Collaboration {
  id: string;
  title: string;
  type: 'track' | 'playlist' | 'album';
  status: 'active' | 'completed' | 'cancelled';
  participants: {
    userId: string;
    username: string;
    role: 'producer' | 'vocalist' | 'lyricist' | 'composer';
  }[];
  createdAt: string;
  completedAt?: string;
}

interface FanClub {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  benefits: string[];
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  joinedAt: string;
}

interface CommunityMembership {
  id: string;
  communityId: string;
  communityName: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: string;
  activityScore: number;
}

const UserProfilePage: React.FC = () => {
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [editForm, setEditForm] = useState({
    fullName: '',
    bio: '',
    location: '',
    website: ''
  });
  
  const [settingsForm, setSettingsForm] = useState<UserPreferences>({
    theme: 'dark',
    language: 'en',
    explicitContent: false,
    activityVisibility: 'public',
    messagePrivacy: 'followers',
    dataCollection: true,
    emailNotifications: {
      likes: true,
      comments: true,
      follows: true,
      newFeatures: true,
      promotional: false
    },
    pushNotifications: {
      likes: true,
      comments: true,
      follows: true,
      newFeatures: true,
      promotional: false
    }
  });
  
  // Mock data for demonstration
  const mockUserProfile: UserProfile = {
    id: id || 'user-1',
    clerkUserId: 'clerk-user-123',
    username: 'synthwave_lover',
    email: 'user@example.com',
    fullName: 'Alex Rivera',
    avatarUrl: 'https://i.pravatar.cc/150?u=synthwave_lover',
    bio: 'Music producer and AI artist enthusiast. Creating the future of sound one algorithm at a time. 🎵🤖',
    userType: 'both',
    isVerified: true,
    isPrivate: false,
    location: 'San Francisco, CA',
    website: 'https://alexrivera.music',
    joinedAt: '2023-06-15T10:30:00Z',
    lastActiveAt: new Date().toISOString(),
    followersCount: 1247,
    followingCount: 523,
    likesReceived: 8456,
    commentsCount: 342,
    tracksCreated: 28,
    playlistsCreated: 15,
    achievements: [
      {
        id: 'ach-1',
        title: 'Rising Star',
        description: 'Your first 100 followers',
        icon: '⭐',
        rarity: 'common',
        unlockedAt: '2023-07-20T15:22:00Z'
      },
      {
        id: 'ach-2',
        title: 'Social Butterfly',
        description: 'Engage with 100 other users',
        icon: '🦋',
        rarity: 'rare',
        unlockedAt: '2023-08-05T09:15:00Z'
      },
      {
        id: 'ach-3',
        title: 'Trendsetter',
        description: 'Create a track that reaches 1000 plays',
        icon: '🚀',
        rarity: 'epic',
        unlockedAt: '2023-09-12T18:45:00Z'
      }
    ],
    recentActivity: [
      {
        id: 'act-1',
        type: 'create',
        targetId: 'track-45',
        targetType: 'track',
        title: 'Created new track "Neon Dreams"',
        description: 'Released a new synthwave track',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isPublic: true
      },
      {
        id: 'act-2',
        type: 'like',
        targetId: 'track-12',
        targetType: 'track',
        title: 'Liked "Digital Sunset"',
        description: 'By Glitchard',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isPublic: true
      },
      {
        id: 'act-3',
        type: 'follow',
        targetId: 'artist-5',
        targetType: 'artist',
        title: 'Started following Data Diva',
        description: 'New AI artist to follow',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        isPublic: true
      }
    ],
    userStats: {
      totalPlayTime: 15420,
      favoriteGenres: [
        { genre: 'Synthwave', count: 245 },
        { genre: 'Chillwave', count: 189 },
        { genre: 'Cyberpunk', count: 156 },
        { genre: 'Ambient', count: 134 }
      ],
      listeningTrends: [
        { date: '2023-10-01', plays: 45 },
        { date: '2023-10-02', plays: 67 },
        { date: '2023-10-03', plays: 89 },
        { date: '2023-10-04', plays: 72 },
        { date: '2023-10-05', plays: 94 },
        { date: '2023-10-06', plays: 56 },
        { date: '2023-10-07', plays: 78 }
      ],
      mostPlayedTracks: [
        { trackId: 'track-1', playCount: 245 },
        { trackId: 'track-4', playCount: 189 },
        { trackId: 'track-7', playCount: 156 }
      ],
      mostActiveHours: [
        { hour: 20, activity: 85 },
        { hour: 21, activity: 92 },
        { hour: 22, activity: 78 },
        { hour: 23, activity: 65 },
        { hour: 0, activity: 45 },
        { hour: 1, activity: 32 }
      ],
      socialEngagement: {
        likesGiven: 523,
        commentsPosted: 189,
        sharesMade: 67,
        followersGained: 1247
      }
    },
    preferences: {
      theme: 'dark',
      language: 'en',
      explicitContent: false,
      activityVisibility: 'public',
      messagePrivacy: 'followers',
      dataCollection: true,
      emailNotifications: {
        likes: true,
        comments: true,
        follows: true,
        newFeatures: true,
        promotional: false
      },
      pushNotifications: {
        likes: true,
        comments: true,
        follows: true,
        newFeatures: true,
        promotional: false
      }
    },
    socialConnections: [
      {
        id: 'conn-1',
        userId: 'user-2',
        username: 'beat_master',
        fullName: 'Sarah Chen',
        avatarUrl: 'https://i.pravatar.cc/150?u=beat_master',
        connectionType: 'mutual',
        connectedAt: '2023-07-15T10:30:00Z',
        mutualArtists: ['artist-1', 'artist-3'],
        mutualPlaylists: ['playlist-1', 'playlist-5']
      },
      {
        id: 'conn-2',
        userId: 'user-3',
        username: 'melody_maker',
        fullName: 'James Wilson',
        avatarUrl: 'https://i.pravatar.cc/150?u=melody_maker',
        connectionType: 'following',
        connectedAt: '2023-08-20T14:45:00Z',
        mutualArtists: ['artist-2'],
        mutualPlaylists: ['playlist-3']
      }
    ],
    contentHighlights: [
      {
        id: 'highlight-1',
        type: 'track',
        title: 'Neon Dreams',
        description: 'My most popular synthwave track',
        thumbnailUrl: 'https://via.placeholder.com/150',
        likes: 1245,
        shares: 89,
        createdAt: '2023-09-15T18:30:00Z',
        isPinned: true
      },
      {
        id: 'highlight-2',
        type: 'playlist',
        title: 'Chill Vibes Mix',
        description: 'Perfect for relaxing evenings',
        thumbnailUrl: 'https://via.placeholder.com/150',
        likes: 856,
        shares: 45,
        createdAt: '2023-10-05T20:15:00Z',
        isPinned: false
      }
    ],
    badges: [
      {
        id: 'badge-1',
        name: 'Early Adopter',
        description: 'Joined in the first month',
        icon: '🚀',
        color: 'bg-purple-600',
        earnedAt: '2023-06-15T10:30:00Z',
        rarity: 'rare'
      },
      {
        id: 'badge-2',
        name: 'Social Butterfly',
        description: 'Connected with 100+ users',
        icon: '🦋',
        color: 'bg-blue-600',
        earnedAt: '2023-08-10T16:20:00Z',
        rarity: 'epic'
      }
    ],
    collaborations: [
      {
        id: 'collab-1',
        title: 'Summer Vibes EP',
        type: 'album',
        status: 'active',
        participants: [
          {
            userId: 'user-4',
            username: 'sunset_dj',
            role: 'producer'
          },
          {
            userId: 'user-5',
            username: 'vocal_star',
            role: 'vocalist'
          }
        ],
        createdAt: '2023-09-01T12:00:00Z'
      }
    ],
    fanClub: {
      id: 'fanclub-1',
      name: 'Synthwave Enthusiasts',
      description: 'Exclusive community for synthwave lovers',
      memberCount: 1247,
      benefits: ['Exclusive tracks', 'Behind-the-scenes content', 'Meet & greets'],
      level: 'gold',
      joinedAt: '2023-07-20T15:30:00Z'
    },
    referralCode: 'ALEX2023',
    referredUsers: 23,
    contentCategories: ['Synthwave', 'Chillwave', 'Ambient', 'Electronic'],
    listeningStreak: 15,
    longestStreak: 42,
    communityMemberships: [
      {
        id: 'membership-1',
        communityId: 'community-1',
        communityName: 'AI Music Creators',
        role: 'moderator',
        joinedAt: '2023-08-15T10:00:00Z',
        activityScore: 845
      },
      {
        id: 'membership-2',
        communityId: 'community-2',
        communityName: 'Electronic Music Producers',
        role: 'member',
        joinedAt: '2023-07-10T14:30:00Z',
        activityScore: 623
      }
    ]
  };
  
  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would fetch from an API
        const profileData = mockUserProfile;
        
        setProfile(profileData);
        
        // Check if current user is viewing their own profile
        if (currentUser && currentUser.id === profileData.clerkUserId) {
          setIsOwner(true);
          // Load user preferences
          setSettingsForm(profileData.preferences);
        }
        
        // Check if current user is following this profile
        if (currentUser && currentUser.id !== profileData.clerkUserId) {
          // In a real app, check if following
          setIsFollowing(false);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [id, currentUser]);
  
  // Handle edit profile
  const handleEditProfile = () => {
    if (profile) {
      setEditForm({
        fullName: profile.fullName,
        bio: profile.bio,
        location: profile.location || '',
        website: profile.website || ''
      });
      setIsEditing(true);
    }
  };
  
  // Handle save profile
  const handleSaveProfile = () => {
    if (profile) {
      // In a real app, this would update the API
      const updatedProfile = {
        ...profile,
        fullName: editForm.fullName,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website,
        lastActiveAt: new Date().toISOString()
      };
      
      setProfile(updatedProfile);
      setIsEditing(false);
      
      // Update user store if it's the current user
      if (currentUser && currentUser.id === profile.clerkUserId) {
        setUser({
          userId: profile.id,
          clerkUserId: profile.clerkUserId,
          username: profile.username,
          email: profile.email,
          fullName: editForm.fullName,
          avatarUrl: profile.avatarUrl,
          bio: editForm.bio,
          userType: profile.userType
        });
      }
    }
  };
  
  // Handle settings change
  const handleSettingsChange = (field: keyof UserPreferences, value: any) => {
    setSettingsForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle notification preference change
  const handleNotificationPreferenceChange = (
    type: 'email' | 'push',
    category: keyof UserPreferences['emailNotifications'],
    value: boolean
  ) => {
    setSettingsForm(prev => ({
      ...prev,
      [`${type}Notifications`]: {
        ...prev[`${type}Notifications`],
        [category]: value
      }
    }));
  };
  
  // Handle save settings
  const handleSaveSettings = () => {
    if (profile) {
      // In a real app, this would update the API
      const updatedProfile = {
        ...profile,
        preferences: settingsForm,
        lastActiveAt: new Date().toISOString()
      };
      
      setProfile(updatedProfile);
      setIsEditingSettings(false);
    }
  };
  
  // Handle follow/unfollow
  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    // In a real app, this would call an API
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format play time
  const formatPlayTime = (minutes: number) => {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    
    if (days > 0) {
      return `${days}d ${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h ${mins}m`;
    } else {
      return `${mins}m`;
    }
  };
  
  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-600 text-gray-300';
      case 'rare': return 'bg-blue-600 text-blue-300';
      case 'epic': return 'bg-purple-600 text-purple-300';
      case 'legendary': return 'bg-yellow-600 text-yellow-300';
      default: return 'bg-gray-600 text-gray-300';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }
  
  if (!profile) {
    return <div className="text-center text-2xl font-bold">User not found.</div>;
  }
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="flex items-start space-x-6">
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage src={profile.avatarUrl} />
              <AvatarFallback className="text-2xl">
                {profile.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {profile.isVerified && (
              <Badge className="absolute bottom-2 right-2 bg-cyan-600 text-white">
                <Award className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
            {profile.isPrivate && (
              <Badge className="absolute top-2 right-2 bg-purple-600 text-white">
                <Lock className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-mono font-bold text-glow-cyan">
                {profile.fullName}
              </h1>
              <Badge variant="secondary" className="bg-cyan-600/20 text-cyan-400">
                @{profile.username}
              </Badge>
              <Badge variant="outline" className="border-lime-500 text-lime-400">
                {profile.userType}
              </Badge>
            </div>
            
            <p className="text-gray-300 mb-4 max-w-2xl">{profile.bio}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(profile.joinedAt)}</span>
              </div>
              {profile.location && (
                <div className="flex items-center space-x-1">
                  <Globe className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Website</span>
                </a>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-400">{profile.followersCount}</p>
                <p className="text-sm text-gray-400">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{profile.followingCount}</p>
                <p className="text-sm text-gray-400">Following</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-lime-400">{profile.tracksCreated}</p>
                <p className="text-sm text-gray-400">Tracks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-400">{profile.playlistsCreated}</p>
                <p className="text-sm text-gray-400">Playlists</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {isOwner ? (
            <>
              <Button onClick={handleEditProfile} className="flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditingSettings(true)}
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </>
          ) : (
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
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share Profile
              </DropdownMenuItem>
              {!isOwner && (
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Bookmark className="h-4 w-4 mr-2" />
                Save Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Profile Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="showcase">Showcase</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI Artists */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  AI Artists
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiArtists.slice(0, 3).map(artist => (
                    <div key={artist.id} className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={artist.profileImage} />
                        <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{artist.name}</p>
                        <p className="text-xs text-gray-400">{artist.genre}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFollowArtist(artist.id)}
                        className={followedArtistIds.has(artist.id) 
                          ? 'text-lime-400 hover:text-lime-300' 
                          : 'text-gray-400 hover:text-lime-400'
                        }
                      >
                        {followedArtistIds.has(artist.id) ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  ))}
                  {aiArtists.length > 3 && (
                    <Button variant="ghost" className="w-full text-xs">
                      View all {aiArtists.length} artists
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Tracks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-purple-400" />
                  Recent Tracks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.userStats.mostPlayedTracks.slice(0, 3).map((track, index) => (
                    <div key={track.trackId} className="flex items-center space-x-3">
                      <div className="text-cyan-400 font-bold w-4">{index + 1}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">Track {track.trackId}</p>
                        <p className="text-xs text-gray-400">{track.playCount} plays</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="ghost" className="w-full text-xs">
                    View all tracks
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Favorite Genres */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-pink-400" />
                  Favorite Genres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.userStats.favoriteGenres.map((genre, index) => (
                    <div key={genre.genre} className="flex items-center justify-between">
                      <span className="text-sm">{genre.genre}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-neutral-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                            style={{ width: `${(genre.count / 245) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{genre.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="space-y-4">
            {profile.recentActivity.map(activity => (
              <Card key={activity.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {activity.type === 'create' && <Music className="h-5 w-5 text-cyan-400" />}
                      {activity.type === 'like' && <Heart className="h-5 w-5 text-red-400" />}
                      {activity.type === 'comment' && <MessageSquare className="h-5 w-5 text-lime-400" />}
                      {activity.type === 'follow' && <UserPlus className="h-5 w-5 text-purple-400" />}
                      {activity.type === 'share' && <Share2 className="h-5 w-5 text-blue-400" />}
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
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Listening Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                  Listening Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Play Time</span>
                  <span className="font-bold">{formatPlayTime(profile.userStats.totalPlayTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tracks Created</span>
                  <span className="font-bold">{profile.tracksCreated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Playlists Created</span>
                  <span className="font-bold">{profile.playlistsCreated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Engagement Score</span>
                  <span className="font-bold text-lime-400">
                    {Math.round(
                      (profile.userStats.socialEngagement.likesGiven + 
                       profile.userStats.socialEngagement.commentsPosted +
                       profile.userStats.socialEngagement.followersGained) / 10
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Social Engagement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  Social Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Likes Given</span>
                  <span className="font-bold">{profile.userStats.socialEngagement.likesGiven}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Comments Posted</span>
                  <span className="font-bold">{profile.userStats.socialEngagement.commentsPosted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Shares Made</span>
                  <span className="font-bold">{profile.userStats.socialEngagement.sharesMade}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Followers Gained</span>
                  <span className="font-bold text-lime-400">{profile.userStats.socialEngagement.followersGained}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.achievements.map(achievement => (
              <Card key={achievement.id} className="text-center">
                <CardContent className="pt-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${getRarityColor(achievement.rarity)}`}>
                    <span className="text-2xl">{achievement.icon}</span>
                  </div>
                  <h3 className="font-bold mb-1">{achievement.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                  <p className="text-xs text-gray-500">Unlocked {formatDate(achievement.unlockedAt)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.socialConnections.map(connection => (
              <Card key={connection.id}>
                <CardContent className="pt-6 flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={connection.avatarUrl} />
                    <AvatarFallback>{connection.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{connection.fullName}</p>
                    <p className="text-sm text-gray-400">@{connection.username}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {connection.connectionType}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Showcase Tab */}
        <TabsContent value="showcase" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile.contentHighlights.map(highlight => (
              <Card key={highlight.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{highlight.title}</span>
                    {highlight.isPinned && <Bookmark className="h-4 w-4 text-cyan-400" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img src={highlight.thumbnailUrl} alt={highlight.title} className="rounded-md mb-4" />
                  <p className="text-sm text-gray-400 mb-2">{highlight.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{highlight.likes} Likes</span>
                    <span>{highlight.shares} Shares</span>
                    <span>{formatDate(highlight.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={editForm.fullName}
                onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                placeholder="Enter your location"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={editForm.website}
                onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog open={isEditingSettings} onOpenChange={setIsEditingSettings}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Appearance */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Appearance
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Theme</Label>
                  <Select value={settingsForm.theme} onValueChange={(value: any) => handleSettingsChange('theme', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Language</Label>
                  <Select value={settingsForm.language} onValueChange={(value) => handleSettingsChange('language', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Privacy */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-gray-400">Who can see your activity</p>
                  </div>
                  <Select value={settingsForm.activityVisibility} onValueChange={(value: any) => handleSettingsChange('activityVisibility', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Message Privacy</Label>
                    <p className="text-sm text-gray-400">Who can send you messages</p>
                  </div>
                  <Select value={settingsForm.messagePrivacy} onValueChange={(value: any) => handleSettingsChange('messagePrivacy', value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="followers">Followers Only</SelectItem>
                      <SelectItem value="no-one">No One</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Explicit Content</Label>
                    <p className="text-sm text-gray-400">Show explicit content</p>
                  </div>
                  <Switch
                    checked={settingsForm.explicitContent}
                    onCheckedChange={(checked) => handleSettingsChange('explicitContent', checked)}
                  />
                </div>
              </div>
            </div>
            
            {/* Notifications */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Email Notifications</h4>
                  <div className="space-y-2">
                    {Object.entries(settingsForm.emailNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={`email-${key}`} className="capitalize">
                          {key}
                        </Label>
                        <Switch
                          id={`email-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => handleNotificationPreferenceChange('email', key as any, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Push Notifications</h4>
                  <div className="space-y-2">
                    {Object.entries(settingsForm.pushNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={`push-${key}`} className="capitalize">
                          {key}
                        </Label>
                        <Switch
                          id={`push-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => handleNotificationPreferenceChange('push', key as any, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Data */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Data & Analytics
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Share anonymous data</Label>
                  <p className="text-sm text-gray-400">Help improve the platform</p>
                </div>
                <Switch
                  checked={settingsForm.dataCollection}
                  onCheckedChange={(checked) => handleSettingsChange('dataCollection', checked)}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditingSettings(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfilePage;