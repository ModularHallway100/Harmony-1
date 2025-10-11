import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Star, 
  Lock, 
  Unlock, 
  Gift, 
  Music, 
  Video, 
  Image, 
  FileText, 
  Download, 
  Play, 
  Heart, 
  Users, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Settings,
  Eye,
  Share2,
  MessageCircle,
  GiftIcon,
  Zap,
  Shield,
  CreditCard,
  Ticket,
  BadgeCheck,
  TrendingUp,
  Award,
  Bell,
  Mail,
  User,
  CalendarIcon,
  ClockIcon,
  LockIcon,
  UnlockIcon,
  CrownIcon,
  StarIcon,
  GiftIcon as GiftIconSolid,
  DownloadIcon,
  PlayIcon,
  EyeIcon,
  Share2Icon,
  MessageCircleIcon,
  UsersIcon,
  HeartIcon,
  VideoIcon,
  ImageIcon,
  FileTextIcon,
  SettingsIcon,
  BellIcon,
  MailIcon,
  UserIcon,
  CreditCardIcon,
  TicketIcon,
  BadgeCheckIcon,
  TrendingUpIcon,
  AwardIcon,
  ShieldIcon,
  ZapIcon
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
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Types
interface MembershipTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  benefits: string[];
  isPopular?: boolean;
  color: string;
  icon: React.ReactNode;
  limitations?: string[];
}

interface ExclusiveContent {
  id: string;
  title: string;
  description: string;
  type: 'track' | 'album' | 'video' | 'image' | 'document' | 'livestream' | 'merchandise';
  thumbnail?: string;
  duration?: string;
  fileSize?: string;
  quality?: string;
  releaseDate: Date;
  isAvailable: boolean;
  isUnlocked: boolean;
  requiredTier: string;
  tags: string[];
  downloadUrl?: string;
  streamUrl?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  artist?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface FanMembership {
  tierId: string;
  tierName: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  autoRenew: boolean;
  paymentMethod?: string;
}

interface ExclusiveAccessBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  earnedDate: Date;
  isExclusive: boolean;
}

interface MerchandiseItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  isAvailable: boolean;
  isExclusive: boolean;
  requiredTier?: string;
  stock: number;
  rating: number;
  reviewCount: number;
}

interface ExclusiveContentAccessProps {
  userId?: string;
  artistId?: string;
  className?: string;
}

const ExclusiveContentAccess: React.FC<ExclusiveContentAccessProps> = ({
  userId,
  artistId,
  className
}) => {
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const [exclusiveContent, setExclusiveContent] = useState<ExclusiveContent[]>([]);
  const [fanMembership, setFanMembership] = useState<FanMembership | null>(null);
  const [accessBadges, setAccessBadges] = useState<ExclusiveAccessBadge[]>([]);
  const [merchandise, setMerchandise] = useState<MerchandiseItem[]>([]);
  const [activeTab, setActiveTab] = useState('content');
  const [selectedContent, setSelectedContent] = useState<ExclusiveContent | null>(null);
  const [isMembershipDialogOpen, setIsMembershipDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const mockMembershipTiers: MembershipTier[] = [
      {
        id: '1',
        name: 'Fan',
        description: 'Join the community and get basic exclusive content',
        price: 4.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          'Access to exclusive tracks',
          'Early access to new releases',
          'Join fan community',
          'Artist newsletter'
        ],
        benefits: [
          'Support your favorite artist',
          'Connect with other fans',
          'Get behind-the-scenes content'
        ],
        color: 'bg-blue-500',
        icon: <Users className="h-5 w-5" />
      },
      {
        id: '2',
        name: 'Super Fan',
        description: 'Enhanced experience with more exclusive content',
        price: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          'All Fan tier benefits',
          'Exclusive livestream access',
          'High-quality audio downloads',
          'Merchandise discounts',
          'Artist Q&A sessions'
        ],
        benefits: [
          'Higher quality audio',
          'More frequent content',
          'Direct artist interaction',
          'Special merchandise pricing'
        ],
        color: 'bg-purple-500',
        icon: <Star className="h-5 w-5" />,
        isPopular: true
      },
      {
        id: '3',
        name: 'VIP',
        description: 'Ultimate fan experience with everything exclusive',
        price: 19.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: [
          'All Super Fan tier benefits',
          'Exclusive unreleased tracks',
          'Personalized video messages',
          'Meet & greet opportunities',
          'Custom merchandise',
          'Priority support'
        ],
        benefits: [
          'Most exclusive content',
          'Personalized experiences',
          'Physical meetups',
          'Dedicated support'
        ],
        color: 'bg-yellow-500',
        icon: <Crown className="h-5 w-5" />
      }
    ];

    const mockExclusiveContent: ExclusiveContent[] = [
      {
        id: '1',
        title: 'Acoustic Version of Midnight Dreams',
        description: 'An intimate acoustic version of the popular track, recorded exclusively for fans',
        type: 'track',
        duration: '3:45',
        quality: 'High Quality (320kbps)',
        releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
        isAvailable: true,
        isUnlocked: true,
        requiredTier: '1',
        tags: ['Acoustic', 'Exclusive', 'Behind the Scenes'],
        viewCount: 1245,
        likeCount: 89,
        commentCount: 12,
        artist: {
          id: 'artist123',
          name: 'Midnight Dreams'
        }
      },
      {
        id: '2',
        title: 'Studio Session: Creating Electric Vibes',
        description: 'Watch the AI artist create the hit track Electric Vibes in real-time',
        type: 'video',
        duration: '15:30',
        releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 48),
        isAvailable: true,
        isUnlocked: true,
        requiredTier: '1',
        tags: ['Studio Session', 'Behind the Scenes', 'Creation Process'],
        viewCount: 2341,
        likeCount: 156,
        commentCount: 23,
        artist: {
          id: 'artist123',
          name: 'Midnight Dreams'
        }
      },
      {
        id: '3',
        title: 'Exclusive Livestream: Q&A Session',
        description: 'Join the artist for an exclusive Q&A session where they answer fan questions',
        type: 'livestream',
        duration: '60:00',
        releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        isAvailable: true,
        isUnlocked: false,
        requiredTier: '2',
        tags: ['Livestream', 'Q&A', 'Fan Interaction'],
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        artist: {
          id: 'artist123',
          name: 'Midnight Dreams'
        }
      },
      {
        id: '4',
        title: 'Unreleased Track: Digital Dreams',
        description: 'An unreleased track that will be available to VIP members only',
        type: 'track',
        duration: '4:20',
        quality: 'Studio Quality (Lossless)',
        releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        isAvailable: true,
        isUnlocked: false,
        requiredTier: '3',
        tags: ['Unreleased', 'VIP Only', 'Exclusive'],
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        artist: {
          id: 'artist123',
          name: 'Midnight Dreams'
        }
      },
      {
        id: '5',
        title: 'Artist Personal Video Message',
        description: 'Get a personalized video message from the AI artist for special occasions',
        type: 'video',
        duration: '30-60 seconds',
        releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        isAvailable: true,
        isUnlocked: false,
        requiredTier: '3',
        tags: ['Personalized', 'Video Message', 'Special Occasions'],
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        artist: {
          id: 'artist123',
          name: 'Midnight Dreams'
        }
      }
    ];

    const mockFanMembership: FanMembership = {
      tierId: '1',
      tierName: 'Fan',
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      status: 'active',
      autoRenew: true,
      paymentMethod: 'Credit Card'
    };

    const mockAccessBadges: ExclusiveAccessBadge[] = [
      {
        id: '1',
        name: 'Early Supporter',
        description: 'Joined within the first month of the artist\'s launch',
        icon: <Zap className="h-4 w-4" />,
        color: 'bg-yellow-500',
        earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        isExclusive: true
      },
      {
        id: '2',
        name: 'Super Fan',
        description: 'Consistently engaged with exclusive content',
        icon: <Star className="h-4 w-4" />,
        color: 'bg-purple-500',
        earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
        isExclusive: false
      },
      {
        id: '3',
        name: 'Community Leader',
        description: 'Helped grow the fan community',
        icon: <Users className="h-4 w-4" />,
        color: 'bg-blue-500',
        earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
        isExclusive: false
      }
    ];

    const mockMerchandise: MerchandiseItem[] = [
      {
        id: '1',
        name: 'Midnight Dreams T-Shirt',
        description: 'Exclusive artist t-shirt with holographic design',
        price: 24.99,
        currency: 'USD',
        imageUrl: '',
        isAvailable: true,
        isExclusive: true,
        requiredTier: '1',
        stock: 100,
        rating: 4.5,
        reviewCount: 23
      },
      {
        signed: true,
        id: '2',
        name: 'Signed Midnight Dreams Poster',
        description: 'Limited edition poster signed by the AI artist',
        price: 49.99,
        currency: 'USD',
        imageUrl: '',
        isAvailable: true,
        isExclusive: true,
        requiredTier: '2',
        stock: 50,
        rating: 5.0,
        reviewCount: 12
      },
      {
        id: '3',
        name: 'VIP Meet & Greet Package',
        description: 'Exclusive opportunity to meet the artist virtually',
        price: 99.99,
        currency: 'USD',
        imageUrl: '',
        isAvailable: true,
        isExclusive: true,
        requiredTier: '3',
        stock: 10,
        rating: 5.0,
        reviewCount: 5
      },
      {
        id: '4',
        name: 'Artist Custom Hoodie',
        description: 'Custom-designed hoodie with your name on it',
        price: 79.99,
        currency: 'USD',
        imageUrl: '',
        isAvailable: true,
        isExclusive: true,
        requiredTier: '3',
        stock: 25,
        rating: 4.8,
        reviewCount: 8
      }
    ];

    setMembershipTiers(mockMembershipTiers);
    setExclusiveContent(mockExclusiveContent);
    setFanMembership(mockFanMembership);
    setAccessBadges(mockAccessBadges);
    setMerchandise(mockMerchandise);
    setIsLoading(false);
  }, []);

  // Get content icon based on type
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'track':
        return <Music className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'livestream':
        return <Play className="h-5 w-5" />;
      case 'merchandise':
        return <Gift className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Get tier by ID
  const getTierById = (tierId: string) => {
    return membershipTiers.find(tier => tier.id === tierId);
  };

  // Check if content is unlocked
  const isContentUnlocked = (content: ExclusiveContent) => {
    if (!fanMembership) return false;
    
    const currentTier = getTierById(fanMembership.tierId);
    const requiredTier = getTierById(content.requiredTier);
    
    if (!currentTier || !requiredTier) return false;
    
    // Compare tier levels based on their order in the array
    const currentTierIndex = membershipTiers.findIndex(t => t.id === currentTier.tierId);
    const requiredTierIndex = membershipTiers.findIndex(t => t.id === requiredTier.id);
    
    return currentTierIndex >= requiredTierIndex;
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Calculate days until membership expires
  const getDaysUntilExpiration = () => {
    if (!fanMembership) return 0;
    
    const now = new Date();
    const diff = fanMembership.endDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Get membership status color
  const getMembershipStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'expired':
        return 'text-red-600';
      case 'cancelled':
        return 'text-yellow-600';
      case 'pending':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  // Get membership status icon
  const getMembershipStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
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
        <h1 className="text-3xl font-bold mb-2">Exclusive Content Access</h1>
        <p className="text-muted-foreground">
          Access exclusive content, merchandise, and experiences as a valued fan
        </p>
      </div>

      {/* Membership Status */}
      {fanMembership && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                {getMembershipStatusIcon(fanMembership.status)}
                <span>Your Membership</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUpgradeDialogOpen(true)}
              >
                Upgrade Membership
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">{fanMembership.tierName} Tier</h3>
                <p className={cn("text-sm", getMembershipStatusColor(fanMembership.status))}>
                  Status: {fanMembership.status.charAt(0).toUpperCase() + fanMembership.status.slice(1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires: {formatDate(fanMembership.endDate)}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Auto-Renewal</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={fanMembership.autoRenew}
                    onCheckedChange={(checked) => console.log('Update auto-renewal:', checked)}
                  />
                  <span className="text-sm">
                    {fanMembership.autoRenew ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Payment: {fanMembership.paymentMethod}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Days Remaining</h3>
                <p className="text-2xl font-bold text-primary">
                  {getDaysUntilExpiration()}
                </p>
                <Progress 
                  value={(getDaysUntilExpiration() / 365) * 100} 
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Membership Tiers */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Membership Tiers</CardTitle>
          <CardDescription>
            Choose the tier that best fits your fandom level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {membershipTiers.map(tier => (
              <Card 
                key={tier.id} 
                className={cn(
                  "relative overflow-hidden",
                  tier.isPopular && "border-2 border-primary shadow-lg"
                )}
              >
                {tier.isPopular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", tier.color)}>
                    {tier.icon}
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      {formatCurrency(tier.price, tier.currency)}
                    </span>
                    <span className="text-muted-foreground">/{tier.billingCycle}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Features</h4>
                      <ul className="space-y-1">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Benefits</h4>
                      <ul className="space-y-1">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm">
                            <Gift className="h-3 w-3 text-purple-500" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      className="w-full"
                      variant={fanMembership?.tierId === tier.id ? "secondary" : "default"}
                      onClick={() => {
                        if (fanMembership?.tierId !== tier.id) {
                          setIsMembershipDialogOpen(true);
                        }
                      }}
                    >
                      {fanMembership?.tierId === tier.id ? 'Current Tier' : 'Select Tier'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Exclusive Content</TabsTrigger>
          <TabsTrigger value="merchandise">Merchandise</TabsTrigger>
          <TabsTrigger value="badges">My Badges</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        {/* Exclusive Content Tab */}
        <TabsContent value="content" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Content List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Exclusive Content</CardTitle>
                  <CardDescription>
                    Access special content available only to members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {exclusiveContent.map(content => {
                        const isUnlocked = isContentUnlocked(content);
                        const requiredTier = getTierById(content.requiredTier);
                        
                        return (
                          <Card key={content.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                  <div className={cn(
                                    "rounded-lg p-3",
                                    isUnlocked ? "bg-primary/10" : "bg-muted"
                                  )}>
                                    {getContentIcon(content.type)}
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className={cn(
                                      "font-semibold",
                                      !isUnlocked && "text-muted-foreground"
                                    )}>
                                      {content.title}
                                      {!isUnlocked && (
                                        <Lock className="h-4 w-4 ml-2 inline" />
                                      )}
                                    </h3>
                                    
                                    {requiredTier && (
                                      <Badge variant="outline" className="flex items-center space-x-1">
                                        {requiredTier.icon}
                                        <span>{requiredTier.name} Tier</span>
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <p className={cn(
                                    "text-sm mb-3",
                                    !isUnlocked && "text-muted-foreground"
                                  )}>
                                    {content.description}
                                  </p>
                                  
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                      {content.duration && (
                                        <div className="flex items-center space-x-1">
                                          <Clock className="h-3 w-3" />
                                          <span>{content.duration}</span>
                                        </div>
                                      )}
                                      {content.quality && (
                                        <div className="flex items-center space-x-1">
                                          <Eye className="h-3 w-3" />
                                          <span>{content.quality}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center space-x-1">
                                        <Eye className="h-3 w-3" />
                                        <span>{content.viewCount} views</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Heart className="h-3 w-3" />
                                        <span>{content.likeCount} likes</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                      {content.tags.slice(0, 2).map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                      {content.tags.length > 2 && (
                                        <Badge variant="outline" className="text-xs">
                                          +{content.tags.length - 2}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {isUnlocked && (
                                    <div className="flex items-center justify-between mt-4">
                                      <div className="flex items-center space-x-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={content.artist?.avatar} />
                                          <AvatarFallback>
                                            {content.artist?.name.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm text-muted-foreground">
                                          {content.artist?.name}
                                        </span>
                                      </div>
                                      
                                      <div className="flex space-x-2">
                                        {content.type === 'track' && (
                                          <Button size="sm" variant="outline">
                                            <Play className="h-4 w-4 mr-1" />
                                            Play
                                          </Button>
                                        )}
                                        {content.downloadUrl && (
                                          <Button size="sm" variant="outline">
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                          </Button>
                                        )}
                                        <Button size="sm" variant="outline">
                                          <Share2 className="h-4 w-4 mr-1" />
                                          Share
                                        </Button>
                                      </div>
                                    </div>
                                  )}
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

            {/* Access Requirements */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Access Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {membershipTiers.map(tier => (
                      <div key={tier.id} className="border rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", tier.color)}>
                            {tier.icon}
                          </div>
                          <h4 className="font-medium">{tier.name} Tier</h4>
                        </div>
                        
                        <ul className="space-y-1 text-sm">
                          {tier.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                          {tier.features.length > 3 && (
                            <li className="text-muted-foreground">
                              +{tier.features.length - 3} more features
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View FAQ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Merchandise Tab */}
        <TabsContent value="merchandise" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Merchandise Grid */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Exclusive Merchandise</CardTitle>
                  <CardDescription>
                    Special items available only to members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {merchandise.map(item => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                <Gift className="h-8 w-8" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold">{item.name}</h3>
                                {item.isExclusive && (
                                  <Badge variant="default">Exclusive</Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {item.description}
                              </p>
                              
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-lg font-bold">
                                  {formatCurrency(item.price, item.currency)}
                                </span>
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span>{item.rating}</span>
                                  <span>({item.reviewCount})</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <span>Stock: {item.stock}</span>
                                  {item.requiredTier && (
                                    <Badge variant="outline" className="flex items-center space-x-1">
                                      {getTierById(item.requiredTier)?.icon}
                                      <span>{getTierById(item.requiredTier)?.name} Tier</span>
                                    </Badge>
                                  )}
                                </div>
                                
                                <Button 
                                  size="sm" 
                                  disabled={!item.isAvailable}
                                >
                                  {item.isAvailable ? 'Add to Cart' : 'Out of Stock'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shopping Cart */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Cart</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <Gift className="h-12 w-12 mx-auto mb-2" />
                      <p>Your cart is empty</p>
                      <p className="text-sm">Add exclusive merchandise to get started</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Member Discounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Fan Tier</span>
                      <Badge variant="outline">5% off</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Super Fan Tier</span>
                      <Badge variant="outline">10% off</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">VIP Tier</span>
                      <Badge variant="outline">15% off</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Badges Grid */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Achievement Badges</CardTitle>
                  <CardDescription>
                    Collect badges for your exclusive fan activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {accessBadges.map(badge => (
                      <Card key={badge.id} className="text-center hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3",
                            badge.color
                          )}>
                            {badge.icon}
                          </div>
                          
                          <h4 className="font-medium mb-1">{badge.name}</h4>
                          <p className="text-xs text-muted-foreground mb-2">
                            {badge.description}
                          </p>
                          
                          <div className="text-xs text-muted-foreground">
                            Earned: {formatDate(badge.earnedDate)}
                          </div>
                          
                          {badge.isExclusive && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              Exclusive
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Badge Progress */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Badge Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Next Badge</span>
                        <span className="text-sm text-muted-foreground">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Complete 5 more exclusive content views
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Total Badges</span>
                        <span className="text-sm font-bold">{accessBadges.length}/10</span>
                      </div>
                      <Progress value={(accessBadges.length / 10) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Available Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: 'Content Explorer', progress: 75, total: 10 },
                      { name: 'Super Listener', progress: 50, total: 20 },
                      { name: 'Community Helper', progress: 25, total: 10 }
                    ].map((badge, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">{badge.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {badge.progress}/{badge.total}
                          </span>
                        </div>
                        <Progress value={(badge.progress / badge.total) * 100} className="h-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Upcoming Tab */}
        <TabsContent value="upcoming" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Exclusive Content</CardTitle>
                  <CardDescription>
                    Stay tuned for exciting new releases and experiences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {exclusiveContent
                        .filter(content => content.releaseDate > new Date())
                        .sort((a, b) => a.releaseDate.getTime() - b.releaseDate.getTime())
                        .map(content => {
                          const isUnlocked = isContentUnlocked(content);
                          const requiredTier = getTierById(content.requiredTier);
                          const daysUntilRelease = Math.ceil(
                            (content.releaseDate.getTime() - new Date().getTime()) / 
                            (1000 * 60 * 60 * 24)
                          );
                          
                          return (
                            <Card key={content.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0">
                                    <div className={cn(
                                      "rounded-lg p-3",
                                      isUnlocked ? "bg-primary/10" : "bg-muted"
                                    )}>
                                      {getContentIcon(content.type)}
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <h3 className={cn(
                                        "font-semibold",
                                        !isUnlocked && "text-muted-foreground"
                                      )}>
                                        {content.title}
                                        {!isUnlocked && (
                                          <Lock className="h-4 w-4 ml-2 inline" />
                                        )}
                                      </h3>
                                      
                                      <div className="flex items-center space-x-2">
                                        {requiredTier && (
                                          <Badge variant="outline" className="flex items-center space-x-1">
                                            {requiredTier.icon}
                                            <span>{requiredTier.name} Tier</span>
                                          </Badge>
                                        )}
                                        <Badge variant="secondary">
                                          {daysUntilRelease} day{daysUntilRelease > 1 ? 's' : ''} to go
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <p className={cn(
                                      "text-sm mb-3",
                                      !isUnlocked && "text-muted-foreground"
                                    )}>
                                      {content.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                        <div className="flex items-center space-x-1">
                                          <Calendar className="h-3 w-3" />
                                          <span>{formatDate(content.releaseDate)}</span>
                                        </div>
                                        {content.duration && (
                                          <div className="flex items-center space-x-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{content.duration}</span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center space-x-2">
                                        {content.tags.slice(0, 2).map(tag => (
                                          <Badge key={tag} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                        {content.tags.length > 2 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{content.tags.length - 2}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {isUnlocked && (
                                      <div className="mt-4">
                                        <Button size="sm">
                                          Set Reminder
                                        </Button>
                                      </div>
                                    )}
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

            {/* Release Calendar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Release Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: 'Dec 15', title: 'New Track: Digital Dreams', type: 'track', tier: 'VIP' },
                      { date: 'Dec 20', title: 'Live Q&A Session', type: 'livestream', tier: 'Super Fan' },
                      { date: 'Dec 25', title: 'Holiday Special Video', type: 'video', tier: 'Fan' },
                      { date: 'Jan 1', title: 'New Year Countdown Stream', type: 'livestream', tier: 'All' },
                    ].map((item, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">{item.date}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{item.title}</p>
                        {item.tier !== 'All' && (
                          <Badge variant="secondary" className="text-xs">
                            {item.tier} Tier
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="new-content" className="text-sm">New Content</Label>
                      <Switch id="new-content" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="upcoming-releases" className="text-sm">Upcoming Releases</Label>
                      <Switch id="upcoming-releases" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="membership" className="text-sm">Membership Updates</Label>
                      <Switch id="membership" defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Membership Dialog */}
      <Dialog open={isMembershipDialogOpen} onOpenChange={setIsMembershipDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose Your Membership Tier</DialogTitle>
            <DialogDescription>
              Select the tier that best fits your fandom level and unlock exclusive content
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {membershipTiers.map(tier => (
              <Card key={tier.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", tier.color)}>
                        {tier.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{tier.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(tier.price, tier.currency)}/{tier.billingCycle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">
                        {tier.features.length} features
                      </p>
                      <Button size="sm">Select</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upgrade Your Membership</DialogTitle>
            <DialogDescription>
              Unlock more exclusive content by upgrading your membership tier
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {membershipTiers
              .filter(tier => tier.id !== fanMembership?.tierId)
              .map(tier => (
                <Card key={tier.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", tier.color)}>
                          {tier.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold">{tier.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(tier.price, tier.currency)}/{tier.billingCycle}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">
                          {tier.features.length} features
                        </p>
                        <Button size="sm">Upgrade</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExclusiveContentAccess;