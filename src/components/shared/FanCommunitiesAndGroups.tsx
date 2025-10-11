import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Calendar, 
  MessageCircle, 
  Heart, 
  Music, 
  Settings, 
  Plus, 
  MoreHorizontal,
  Bell,
  Shield,
  Hash,
  Crown,
  Star,
  Gift,
  TrendingUp,
  Globe,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Share2,
  Copy,
  Mail,
  User,
  Users2,
  Group,
  HashIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Types
interface Community {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'restricted';
  category: 'general' | 'music-genre' | 'artist-fans' | 'regional' | 'interest' | 'exclusive';
  memberCount: number;
  isJoined: boolean;
  isOwner: boolean;
  moderators: string[];
  rules: string[];
  tags: string[];
  imageUrl?: string;
  coverImage?: string;
  createdAt: Date;
  lastActivity: Date;
  privacySettings: {
    allowInvites: boolean;
    requireApproval: boolean;
    showMembers: boolean;
    allowPosts: boolean;
    allowComments: boolean;
  };
}

interface Group {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'invite-only';
  memberCount: number;
  maxMembers: number;
  isJoined: boolean;
  isOwner: boolean;
  admins: string[];
  members: string[];
  imageUrl?: string;
  coverImage?: string;
  createdAt: Date;
  lastActivity: Date;
  tags: string[];
  musicPreferences?: string[];
}

interface CommunityPost {
  id: string;
  communityId: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'member' | 'moderator' | 'owner';
  };
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  tags: string[];
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  isPinned: boolean;
  isFeatured: boolean;
}

interface CommunityEvent {
  id: string;
  communityId: string;
  title: string;
  description: string;
  date: Date;
  location?: string;
  isVirtual: boolean;
  maxAttendees?: number;
  attendeeCount: number;
  isAttending: boolean;
  imageUrl?: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
}

interface FanCommunitiesAndGroupsProps {
  userId?: string;
  artistId?: string;
  className?: string;
}

const FanCommunitiesAndGroups: React.FC<FanCommunitiesAndGroupsProps> = ({
  userId,
  artistId,
  className
}) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const mockCommunities: Community[] = [
      {
        id: '1',
        name: 'Electronic Music Lovers',
        description: 'A community for fans of electronic music, EDM, and related genres. Share your favorite tracks and discover new artists!',
        type: 'public',
        category: 'music-genre',
        memberCount: 15420,
        isJoined: true,
        isOwner: false,
        moderators: ['user123', 'user456'],
        rules: [
          'Be respectful to all members',
          'No spam or self-promotion',
          'Keep discussions related to electronic music'
        ],
        tags: ['EDM', 'Electronic', 'House', 'Techno', 'Dubstep'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365),
        lastActivity: new Date(Date.now() - 1000 * 60 * 30),
        privacySettings: {
          allowInvites: true,
          requireApproval: false,
          showMembers: true,
          allowPosts: true,
          allowComments: true
        }
      },
      {
        id: '2',
        name: 'AI Artist Fans',
        description: 'Connect with fans of AI-generated music and artists. Share your thoughts on the future of music!',
        type: 'public',
        category: 'artist-fans',
        memberCount: 8765,
        isJoined: false,
        isOwner: false,
        moderators: ['user789', 'user101'],
        rules: [
          'Keep discussions positive and constructive',
          'Share AI music discoveries',
          'Respect different opinions'
        ],
        tags: ['AI Music', 'Artificial Intelligence', 'Future Music', 'Harmony AI'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180),
        lastActivity: new Date(Date.now() - 1000 * 60 * 15),
        privacySettings: {
          allowInvites: true,
          requireApproval: false,
          showMembers: true,
          allowPosts: true,
          allowComments: true
        }
      },
      {
        id: '3',
        name: 'Midnight Dreams Fan Club',
        description: 'Exclusive fan club for the AI artist Midnight Dreams. Get early access to new tracks and exclusive content!',
        type: 'exclusive',
        category: 'artist-fans',
        memberCount: 3210,
        isJoined: true,
        isOwner: false,
        moderators: ['artist123'],
        rules: [
          'Support the artist and fellow fans',
          'No sharing of exclusive content outside the club',
          'Engage in positive discussions'
        ],
        tags: ['Midnight Dreams', 'Exclusive', 'Fan Club', 'VIP'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
        lastActivity: new Date(Date.now() - 1000 * 60 * 45),
        privacySettings: {
          allowInvites: false,
          requireApproval: true,
          showMembers: true,
          allowPosts: true,
          allowComments: true
        }
      },
      {
        id: '4',
        name: 'Music Producers Hub',
        description: 'A private community for music producers to share techniques, get feedback, and collaborate on projects.',
        type: 'private',
        category: 'interest',
        memberCount: 2345,
        isJoined: false,
        isOwner: false,
        moderators: ['user202', 'user303'],
        rules: [
          'Share constructive feedback',
          'Respect intellectual property',
          'Keep discussions professional'
        ],
        tags: ['Music Production', 'Producer', 'Mixing', 'Mastering', 'Collaboration'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
        lastActivity: new Date(Date.now() - 1000 * 60 * 60),
        privacySettings: {
          allowInvites: true,
          requireApproval: true,
          showMembers: false,
          allowPosts: true,
          allowComments: true
        }
      }
    ];

    const mockGroups: Group[] = [
      {
        id: '1',
        name: 'Summer Festival Crew',
        description: 'Group for planning and attending summer music festivals together',
        type: 'public',
        memberCount: 156,
        maxMembers: 200,
        isJoined: true,
        isOwner: false,
        admins: ['user123', 'user456'],
        members: ['user123', 'user456', 'user789', 'user101'],
        tags: ['Festival', 'Summer', 'Group Travel', 'Music Events'],
        musicPreferences: ['EDM', 'Pop', 'Hip Hop'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        lastActivity: new Date(Date.now() - 1000 * 60 * 120)
      },
      {
        id: '2',
        name: 'Collaborative Creators',
        description: 'A group for musicians and artists looking to collaborate on new projects',
        type: 'invite-only',
        memberCount: 45,
        maxMembers: 50,
        isJoined: false,
        isOwner: false,
        admins: ['user202'],
        members: ['user202', 'user303', 'user404'],
        tags: ['Collaboration', 'Music Creation', 'Artists', 'Projects'],
        musicPreferences: ['Electronic', 'Ambient', 'Experimental'],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 6)
      }
    ];

    const mockPosts: CommunityPost[] = [
      {
        id: '1',
        communityId: '1',
        title: 'New Track Discovery: Aurora Borealis',
        content: 'Just discovered this amazing progressive house track that reminds me of the Northern Lights. The production quality is incredible!',
        author: {
          id: 'user123',
          name: 'Alex Johnson',
          role: 'member'
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        likes: 24,
        comments: 8,
        isLiked: false,
        tags: ['Progressive House', 'Discovery', 'New Music'],
        imageUrl: '',
        isPinned: false,
        isFeatured: false
      },
      {
        id: '2',
        communityId: '2',
        title: 'What do you think about AI-generated lyrics?',
        content: 'As AI becomes more advanced in music creation, I\'m curious about everyone\'s thoughts on AI-generated lyrics. Do you think they lack the human touch, or are they becoming indistinguishable?',
        author: {
          id: 'user456',
          name: 'Sarah Chen',
          role: 'moderator'
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        likes: 42,
        comments: 15,
        isLiked: true,
        tags: ['AI Lyrics', 'Discussion', 'Future of Music'],
        isPinned: true,
        isFeatured: false
      }
    ];

    const mockEvents: CommunityEvent[] = [
      {
        id: '1',
        communityId: '1',
        title: 'Virtual Listening Party: Best of 2023',
        description: 'Join us for a virtual listening party where we\'ll share and discuss the best electronic tracks of 2023!',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        isVirtual: true,
        maxAttendees: 100,
        attendeeCount: 67,
        isAttending: true,
        organizer: {
          id: 'user123',
          name: 'Alex Johnson'
        },
        tags: ['Virtual Event', 'Listening Party', '2023 Best']
      },
      {
        id: '2',
        communityId: '3',
        title: 'Exclusive Q&A with Midnight Dreams',
        description: 'Get a chance to ask Midnight Dreams questions about their creative process and upcoming releases!',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        isVirtual: true,
        maxAttendees: 50,
        attendeeCount: 32,
        isAttending: false,
        organizer: {
          id: 'artist123',
          name: 'Midnight Dreams'
        },
        tags: ['Exclusive', 'Q&A', 'Artist Interaction']
      }
    ];

    setCommunities(mockCommunities);
    setGroups(mockGroups);
    setPosts(mockPosts);
    setEvents(mockEvents);
    setIsLoading(false);
  }, []);

  // Filter communities based on search and filters
  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || community.category === filterCategory;
    const matchesType = filterType === 'all' || community.type === filterType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Filter groups based on search
  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Join/Leave community
  const toggleCommunityMembership = (communityId: string) => {
    setCommunities(prev => 
      prev.map(community => 
        community.id === communityId 
          ? { ...community, isJoined: !community.isJoined }
          : community
      )
    );
  };

  // Join/Leave group
  const toggleGroupMembership = (groupId: string) => {
    setGroups(prev => 
      prev.map(group => 
        group.id === groupId 
          ? { ...group, isJoined: !group.isJoined }
          : group
      )
    );
  };

  // Like/Unlike post
  const togglePostLike = (postId: string) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  // Toggle event attendance
  const toggleEventAttendance = (eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, isAttending: !event.isAttending, attendeeCount: event.isAttending ? event.attendeeCount - 1 : event.attendeeCount + 1 }
          : event
      )
    );
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `In ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'Now';
  };

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'general':
        return 'General';
      case 'music-genre':
        return 'Music Genre';
      case 'artist-fans':
        return 'Artist Fans';
      case 'regional':
        return 'Regional';
      case 'interest':
        return 'Interest';
      case 'exclusive':
        return 'Exclusive';
      default:
        return category;
    }
  };

  // Get type display name and icon
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'public':
        return { name: 'Public', icon: <Unlock className="h-4 w-4" />, color: 'bg-green-500' };
      case 'private':
        return { name: 'Private', icon: <Lock className="h-4 w-4" />, color: 'bg-yellow-500' };
      case 'restricted':
        return { name: 'Restricted', icon: <Shield className="h-4 w-4" />, color: 'bg-red-500' };
      case 'invite-only':
        return { name: 'Invite Only', icon: <UserPlus className="h-4 w-4" />, color: 'bg-purple-500' };
      default:
        return { name: type, icon: <Users className="h-4 w-4" />, color: 'bg-gray-500' };
    }
  };

  if (isLoading) {
    return (
      <div className={cn("w-full max-w-6xl mx-auto", className)}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Fan Communities & Groups</h1>
        <p className="text-muted-foreground">
          Connect with fellow music lovers, join fan communities, and create groups around your favorite artists and genres
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-communities">My Communities</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Filters */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search" className="text-sm font-medium">Search</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="search"
                      placeholder="Search communities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger id="category" className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="music-genre">Music Genre</SelectItem>
                      <SelectItem value="artist-fans">Artist Fans</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                      <SelectItem value="interest">Interest</SelectItem>
                      <SelectItem value="exclusive">Exclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="type" className="text-sm font-medium">Type</Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger id="type" className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={() => setIsCreateCommunityOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Community
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsCreateGroupOpen(true)}
                  >
                    <Users2 className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Communities List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Discover Communities</CardTitle>
                <CardDescription>
                  {filteredCommunities.length} communities found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredCommunities.map(community => {
                      const typeInfo = getTypeInfo(community.type);
                      return (
                        <Card key={community.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={community.imageUrl} />
                                  <AvatarFallback>
                                    <HashIcon className="h-6 w-6" />
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <h3 className="font-semibold text-lg">{community.name}</h3>
                                    <Badge variant="secondary" className="flex items-center space-x-1">
                                      {typeInfo.icon}
                                      <span>{typeInfo.name}</span>
                                    </Badge>
                                    <Badge variant="outline">{getCategoryDisplayName(community.category)}</Badge>
                                  </div>
                                  <Button
                                    variant={community.isJoined ? "secondary" : "default"}
                                    size="sm"
                                    onClick={() => toggleCommunityMembership(community.id)}
                                  >
                                    {community.isJoined ? 'Joined' : 'Join'}
                                  </Button>
                                </div>
                                
                                <p className="text-muted-foreground mb-3 line-clamp-2">
                                  {community.description}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Users className="h-4 w-4" />
                                      <span>{community.memberCount.toLocaleString()} members</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <MessageCircle className="h-4 w-4" />
                                      <span>Active recently</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    {community.tags.slice(0, 3).map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {community.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{community.tags.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Communities Tab */}
        <TabsContent value="my-communities" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Communities List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Communities</CardTitle>
                  <CardDescription>
                    {communities.filter(c => c.isJoined).length} communities joined
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {communities.filter(c => c.isJoined).map(community => {
                        const typeInfo = getTypeInfo(community.type);
                        return (
                          <Card key={community.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                  <Avatar className="h-12 w-12">
                                    <AvatarImage src={community.imageUrl} />
                                    <AvatarFallback>
                                      <HashIcon className="h-6 w-6" />
                                    </AvatarFallback>
                                  </Avatar>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <h3 className="font-semibold text-lg">{community.name}</h3>
                                      {community.isOwner && (
                                        <Badge variant="default" className="flex items-center space-x-1">
                                          <Crown className="h-3 w-3" />
                                          <span>Owner</span>
                                        </Badge>
                                      )}
                                      {community.moderators.includes(userId || '') && (
                                        <Badge variant="secondary" className="flex items-center space-x-1">
                                          <Star className="h-3 w-3" />
                                          <span>Moderator</span>
                                        </Badge>
                                      )}
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setSelectedCommunity(community)}>
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>Settings</DropdownMenuItem>
                                        <DropdownMenuItem>Invite Members</DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => toggleCommunityMembership(community.id)}
                                        >
                                          Leave Community
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  
                                  <p className="text-muted-foreground mb-3 line-clamp-2">
                                    {community.description}
                                  </p>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Users className="h-4 w-4" />
                                      <span>{community.memberCount.toLocaleString()} members</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <MessageCircle className="h-4 w-4" />
                                      <span>Active recently</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Community Activity */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {posts.map(post => (
                        <Card key={post.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>
                                  {post.author.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-sm truncate">
                                    {post.title}
                                  </h4>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(post.timestamp)}
                                  </span>
                                </div>
                                
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {post.content}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Heart className="h-3 w-3" />
                                      <span>{post.likes}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <MessageCircle className="h-3 w-3" />
                                      <span>{post.comments}</span>
                                    </div>
                                  </div>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => togglePostLike(post.id)}
                                    className={cn(
                                      "h-6 w-6 p-0",
                                      post.isLiked && "text-red-500"
                                    )}
                                  >
                                    <Heart className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* My Groups Tab */}
        <TabsContent value="my-groups" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Groups List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>My Groups</CardTitle>
                  <CardDescription>
                    {groups.filter(g => g.isJoined).length} groups joined
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {groups.filter(g => g.isJoined).map(group => (
                        <Card key={group.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={group.imageUrl} />
                                  <AvatarFallback>
                                    <Group className="h-6 w-6" />
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <h3 className="font-semibold text-lg">{group.name}</h3>
                                    {group.isOwner && (
                                      <Badge variant="default" className="flex items-center space-x-1">
                                        <Crown className="h-3 w-3" />
                                        <span>Owner</span>
                                      </Badge>
                                    )}
                                    {group.admins.includes(userId || '') && (
                                      <Badge variant="secondary" className="flex items-center space-x-1">
                                        <Settings className="h-3 w-3" />
                                        <span>Admin</span>
                                      </Badge>
                                    )}
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>View Details</DropdownMenuItem>
                                      <DropdownMenuItem>Settings</DropdownMenuItem>
                                      <DropdownMenuItem>Invite Members</DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => toggleGroupMembership(group.id)}
                                      >
                                        Leave Group
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                
                                <p className="text-muted-foreground mb-3 line-clamp-2">
                                  {group.description}
                                </p>
                                
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Users className="h-4 w-4" />
                                      <span>{group.memberCount}/{group.maxMembers} members</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <TrendingUp className="h-4 w-4" />
                                      <span>Active recently</span>
                                    </div>
                                  </div>
                                  
                                  <Badge variant={group.type === 'public' ? 'default' : 'secondary'}>
                                    {getTypeInfo(group.type).name}
                                  </Badge>
                                </div>
                                
                                {group.musicPreferences && group.musicPreferences.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {group.musicPreferences.map(pref => (
                                      <Badge key={pref} variant="outline" className="text-xs">
                                        {pref}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Suggested Groups */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Groups</CardTitle>
                  <CardDescription>Groups you might like to join</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {groups.filter(g => !g.isJoined).map(group => (
                        <Card key={group.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={group.imageUrl} />
                                <AvatarFallback>
                                  <Group className="h-5 w-5" />
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-sm truncate">
                                    {group.name}
                                  </h4>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleGroupMembership(group.id)}
                                  >
                                    Join
                                  </Button>
                                </div>
                                
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {group.description}
                                </p>
                                
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <Users className="h-3 w-3" />
                                    <span>{group.memberCount}/{group.maxMembers}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {getTypeInfo(group.type).name}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Events */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>
                    {events.filter(e => e.date > new Date()).length} upcoming events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {events.filter(e => e.date > new Date()).map(event => (
                        <Card key={event.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={event.imageUrl} />
                                  <AvatarFallback>
                                    <Calendar className="h-6 w-6" />
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold text-lg">{event.title}</h3>
                                  <Button
                                    variant={event.isAttending ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleEventAttendance(event.id)}
                                  >
                                    {event.isAttending ? 'Attending' : 'Attend'}
                                  </Button>
                                </div>
                                
                                <p className="text-muted-foreground mb-3 line-clamp-2">
                                  {event.description}
                                </p>
                                
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="h-4 w-4" />
                                      <span>{formatDate(event.date)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      {event.isVirtual ? (
                                        <Globe className="h-4 w-4" />
                                      ) : (
                                        <Users className="h-4 w-4" />
                                      )}
                                      <span>{event.isVirtual ? 'Virtual' : event.location || 'Location TBD'}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Users className="h-4 w-4" />
                                      <span>{event.attendeeCount}{event.maxAttendees ? `/${event.maxAttendees}` : ''} attending</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={event.organizer.avatar} />
                                      <AvatarFallback>
                                        {event.organizer.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground">
                                      Organized by {event.organizer.name}
                                    </span>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {event.tags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Event Categories */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Event Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'All Events', count: events.length, icon: <Calendar className="h-4 w-4" /> },
                      { name: 'Virtual Events', count: events.filter(e => e.isVirtual).length, icon: <Globe className="h-4 w-4" /> },
                      { name: 'In-Person Events', count: events.filter(e => !e.isVirtual).length, icon: <Users className="h-4 w-4" /> },
                      { name: 'Free Events', count: events.filter(e => !e.maxAttendees).length, icon: <Gift className="h-4 w-4" /> },
                      { name: 'Exclusive Events', count: events.filter(e => e.tags.includes('Exclusive')).length, icon: <Crown className="h-4 w-4" /> },
                    ].map(category => (
                      <div key={category.name} className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer">
                        <div className="flex items-center space-x-2">
                          {category.icon}
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {category.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Create Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => console.log('Create event')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Event
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Community Dialog */}
      <Dialog open={isCreateCommunityOpen} onOpenChange={setIsCreateCommunityOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Community</DialogTitle>
            <DialogDescription>
              Create a community for fans to connect and share their passion for music
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="community-name">Community Name</Label>
              <Input id="community-name" placeholder="Enter community name" />
            </div>
            
            <div>
              <Label htmlFor="community-description">Description</Label>
              <Textarea id="community-description" placeholder="Describe your community" />
            </div>
            
            <div>
              <Label htmlFor="community-category">Category</Label>
              <Select>
                <SelectTrigger id="community-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="music-genre">Music Genre</SelectItem>
                  <SelectItem value="artist-fans">Artist Fans</SelectItem>
                  <SelectItem value="regional">Regional</SelectItem>
                  <SelectItem value="interest">Interest</SelectItem>
                  <SelectItem value="exclusive">Exclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="community-type">Privacy Type</Label>
              <Select>
                <SelectTrigger id="community-type">
                  <SelectValue placeholder="Select privacy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone can join</SelectItem>
                  <SelectItem value="private">Private - Approval required</SelectItem>
                  <SelectItem value="restricted">Restricted - Invitation only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateCommunityOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateCommunityOpen(false)}>
                Create Community
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a group for specific activities, collaborations, or interests
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input id="group-name" placeholder="Enter group name" />
            </div>
            
            <div>
              <Label htmlFor="group-description">Description</Label>
              <Textarea id="group-description" placeholder="Describe your group" />
            </div>
            
            <div>
              <Label htmlFor="group-max-members">Maximum Members</Label>
              <Input id="group-max-members" type="number" placeholder="Enter max members (optional)" />
            </div>
            
            <div>
              <Label htmlFor="group-type">Privacy Type</Label>
              <Select>
                <SelectTrigger id="group-type">
                  <SelectValue placeholder="Select privacy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone can join</SelectItem>
                  <SelectItem value="private">Private - Approval required</SelectItem>
                  <SelectItem value="invite-only">Invite Only - Members can invite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateGroupOpen(false)}>
                Create Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Community Details Dialog */}
      <Dialog open={!!selectedCommunity} onOpenChange={() => setSelectedCommunity(null)}>
        <DialogContent className="max-w-2xl">
          {selectedCommunity && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCommunity.name}</DialogTitle>
                <DialogDescription>
                  {getCategoryDisplayName(selectedCommunity.category)} • {getTypeInfo(selectedCommunity.type).name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedCommunity.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Community Rules</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {selectedCommunity.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCommunity.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{selectedCommunity.memberCount.toLocaleString()} members</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>Active recently</span>
                    </div>
                  </div>
                  
                  <Button
                    variant={selectedCommunity.isJoined ? "secondary" : "default"}
                    onClick={() => toggleCommunityMembership(selectedCommunity.id)}
                  >
                    {selectedCommunity.isJoined ? 'Leave Community' : 'Join Community'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FanCommunitiesAndGroups;