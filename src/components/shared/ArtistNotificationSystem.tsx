import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, User, MessageCircle, Heart, Users, Gift, Calendar, AlertTriangle, CheckCircle, X, Filter, Search, MoreHorizontal } from 'lucide-react';
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
interface Notification {
  id: string;
  type: 'message' | 'like' | 'comment' | 'follow' | 'mention' | 'gift' | 'event' | 'milestone' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata: {
    userId?: string;
    userName?: string;
    userAvatar?: string;
    trackId?: string;
    trackTitle?: string;
    artistId?: string;
    commentId?: string;
    giftType?: string;
    eventId?: string;
    milestoneType?: string;
  };
  actions?: {
    label: string;
    onClick: () => void;
  }[];
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  messageNotifications: boolean;
  likeNotifications: boolean;
  commentNotifications: boolean;
  followNotifications: boolean;
  mentionNotifications: boolean;
  giftNotifications: boolean;
  eventNotifications: boolean;
  milestoneNotifications: boolean;
  warningNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
}

interface NotificationStats {
  total: number;
  unread: number;
  messages: number;
  likes: number;
  comments: number;
  follows: number;
  mentions: number;
  gifts: number;
  events: number;
  milestones: number;
  warnings: number;
}

interface ArtistNotificationSystemProps {
  artistId?: string;
  userId?: string;
  className?: string;
}

const ArtistNotificationSystem: React.FC<ArtistNotificationSystemProps> = ({
  artistId,
  userId,
  className
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    messageNotifications: true,
    likeNotifications: true,
    commentNotifications: true,
    followNotifications: true,
    mentionNotifications: true,
    giftNotifications: true,
    eventNotifications: true,
    milestoneNotifications: true,
    warningNotifications: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    frequency: 'immediate'
  });
  
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    messages: 0,
    likes: 0,
    comments: 0,
    follows: 0,
    mentions: 0,
    gifts: 0,
    events: 0,
    milestones: 0,
    warnings: 0
  });
  
  const [activeTab, setActiveTab] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data initialization
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'message',
        title: 'New Fan Message',
        message: 'Alex Johnson sent you a message: "I absolutely love your latest track! When can we expect more music?"',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isRead: false,
        priority: 'medium',
        metadata: {
          userId: 'user123',
          userName: 'Alex Johnson',
          userAvatar: '',
          trackId: 'track456'
        },
        actions: [
          { label: 'Reply', onClick: () => console.log('Reply to message') },
          { label: 'View Profile', onClick: () => console.log('View user profile') }
        ]
      },
      {
        id: '2',
        type: 'like',
        title: 'Track Liked',
        message: 'Sarah Chen liked your track "Midnight Dreams"',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isRead: false,
        priority: 'low',
        metadata: {
          userId: 'user789',
          userName: 'Sarah Chen',
          userAvatar: '',
          trackId: 'track456',
          trackTitle: 'Midnight Dreams'
        },
        actions: [
          { label: 'View Track', onClick: () => console.log('View track') },
          { label: 'Follow Back', onClick: () => console.log('Follow user') }
        ]
      },
      {
        id: '3',
        type: 'comment',
        title: 'New Comment',
        message: 'Mike Rodriguez commented on your track "Electric Vibes": "This beat is fire! 🔥"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isRead: true,
        priority: 'medium',
        metadata: {
          userId: 'user101',
          userName: 'Mike Rodriguez',
          userAvatar: '',
          trackId: 'track456',
          trackTitle: 'Electric Vibes',
          commentId: 'comment789'
        },
        actions: [
          { label: 'Reply', onClick: () => console.log('Reply to comment') },
          { label: 'View Comment', onClick: () => console.log('View comment') }
        ]
      },
      {
        id: '4',
        type: 'follow',
        title: 'New Follower',
        message: 'Emma Wilson started following you',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isRead: false,
        priority: 'low',
        metadata: {
          userId: 'user202',
          userName: 'Emma Wilson',
          userAvatar: ''
        },
        actions: [
          { label: 'Follow Back', onClick: () => console.log('Follow user') },
          { label: 'View Profile', onClick: () => console.log('View user profile') }
        ]
      },
      {
        id: '5',
        type: 'mention',
        title: 'You Were Mentioned',
        message: 'Lisa Park mentioned you in a comment: "@artistname Your production style is amazing!"',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        isRead: false,
        priority: 'medium',
        metadata: {
          userId: 'user303',
          userName: 'Lisa Park',
          userAvatar: '',
          commentId: 'comment456'
        },
        actions: [
          { label: 'View Comment', onClick: () => console.log('View comment') },
          { label: 'Reply', onClick: () => console.log('Reply to mention') }
        ]
      },
      {
        id: '6',
        type: 'gift',
        title: 'Fan Gift Received',
        message: 'David Kim sent you a Super Fan gift worth $10!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        isRead: false,
        priority: 'high',
        metadata: {
          userId: 'user404',
          userName: 'David Kim',
          userAvatar: '',
          giftType: 'super_fan'
        },
        actions: [
          { label: 'Thank Fan', onClick: () => console.log('Send thank you message') },
          { label: 'View Gift', onClick: () => console.log('View gift details') }
        ]
      },
      {
        id: '7',
        type: 'event',
        title: 'Upcoming Event',
        message: 'Your concert at "Summer Music Festival" is in 3 days',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        isRead: true,
        priority: 'high',
        metadata: {
          eventId: 'event123',
          trackTitle: 'Summer Music Festival'
        },
        actions: [
          { label: 'View Event', onClick: () => console.log('View event details') },
          { label: 'Share Event', onClick: () => console.log('Share event') }
        ]
      },
      {
        id: '8',
        type: 'milestone',
        title: 'Milestone Reached',
        message: 'Congratulations! You\'ve reached 100,000 total likes on your tracks',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
        isRead: true,
        priority: 'medium',
        metadata: {
          milestoneType: 'likes'
        },
        actions: [
          { label: 'Share Achievement', onClick: () => console.log('Share milestone') },
          { label: 'View Stats', onClick: () => console.log('View statistics') }
        ]
      },
      {
        id: '9',
        type: 'warning',
        title: 'Content Moderation Alert',
        message: 'Your track "Controversial Content" has been flagged for review',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7),
        isRead: false,
        priority: 'urgent',
        metadata: {
          trackId: 'track999',
          trackTitle: 'Controversial Content'
        },
        actions: [
          { label: 'View Details', onClick: () => console.log('View moderation details') },
          { label: 'Appeal', onClick: () => console.log('Submit appeal') }
        ]
      }
    ];

    const mockStats: NotificationStats = {
      total: mockNotifications.length,
      unread: mockNotifications.filter(n => !n.isRead).length,
      messages: mockNotifications.filter(n => n.type === 'message').length,
      likes: mockNotifications.filter(n => n.type === 'like').length,
      comments: mockNotifications.filter(n => n.type === 'comment').length,
      follows: mockNotifications.filter(n => n.type === 'follow').length,
      mentions: mockNotifications.filter(n => n.type === 'mention').length,
      gifts: mockNotifications.filter(n => n.type === 'gift').length,
      events: mockNotifications.filter(n => n.type === 'event').length,
      milestones: mockNotifications.filter(n => n.type === 'milestone').length,
      warnings: mockNotifications.filter(n => n.type === 'warning').length
    };

    setNotifications(mockNotifications);
    setFilteredNotifications(mockNotifications);
    setStats(mockStats);
    setIsLoading(false);
  }, []);

  // Filter notifications based on active tab, search, and filters
  useEffect(() => {
    let result = [...notifications];

    // Apply tab filter
    if (activeTab !== 'all') {
      result = result.filter(n => n.type === activeTab);
    }

    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(n => n.type === filterType);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      result = result.filter(n => n.priority === filterPriority);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.message.toLowerCase().includes(query)
      );
    }

    setFilteredNotifications(result);
  }, [notifications, activeTab, filterType, filterPriority, searchQuery]);

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      )
    );
    
    // Update stats
    setStats(prev => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1)
    }));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
    
    setStats(prev => ({
      ...prev,
      unread: 0
    }));
  };

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setFilteredNotifications(prev => prev.filter(n => n.id !== id));
    
    // Update stats
    const deletedNotification = notifications.find(n => n.id === id);
    if (deletedNotification && !deletedNotification.isRead) {
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        total: Math.max(0, prev.total - 1)
      }));
    } else {
      setStats(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
    }
  };

  // Update notification settings
  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    // In a real app, this would save to backend
    console.log('Notification settings updated:', newSettings);
  };

  // Get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'like':
        return <Heart className="h-4 w-4" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4" />;
      case 'follow':
        return <Users className="h-4 w-4" />;
      case 'mention':
        return <Bell className="h-4 w-4" />;
      case 'gift':
        return <Gift className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'milestone':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  // Get color for priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  // Get notification type display name
  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case 'message':
        return 'Messages';
      case 'like':
        return 'Likes';
      case 'comment':
        return 'Comments';
      case 'follow':
        return 'Follows';
      case 'mention':
        return 'Mentions';
      case 'gift':
        return 'Gifts';
      case 'event':
        return 'Events';
      case 'milestone':
        return 'Milestones';
      case 'warning':
        return 'Warnings';
      default:
        return 'All';
    }
  };

  // Get priority display name
  const getPriorityDisplayName = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgent';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'All';
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full max-w-2xl", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full max-w-2xl", className)}>
      {/* Header */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl">Notifications</CardTitle>
            <CardDescription>Stay updated with your fans and community</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={stats.unread === 0}
            >
              Mark all as read
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold">{stats.unread}</p>
              </div>
              <BellOff className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages</p>
                <p className="text-2xl font-bold">{stats.messages}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="message">Messages</SelectItem>
                <SelectItem value="like">Likes</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
                <SelectItem value="follow">Follows</SelectItem>
                <SelectItem value="mention">Mentions</SelectItem>
                <SelectItem value="gift">Gifts</SelectItem>
                <SelectItem value="event">Events</SelectItem>
                <SelectItem value="milestone">Milestones</SelectItem>
                <SelectItem value="warning">Warnings</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
              <TabsTrigger value="all" className="relative">
                All {stats.unread > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {stats.unread}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="message">
                Messages {stats.messages > 0 && (
                  <Badge variant="secondary" className="ml-2 h-4 w-4 rounded-full p-0 text-xs">
                    {stats.messages}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="like">
                Likes {stats.likes > 0 && (
                  <Badge variant="secondary" className="ml-2 h-4 w-4 rounded-full p-0 text-xs">
                    {stats.likes}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="follow">
                Follows {stats.follows > 0 && (
                  <Badge variant="secondary" className="ml-2 h-4 w-4 rounded-full p-0 text-xs">
                    {stats.follows}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="gift">
                Gifts {stats.gifts > 0 && (
                  <Badge variant="secondary" className="ml-2 h-4 w-4 rounded-full p-0 text-xs">
                    {stats.gifts}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <ScrollArea className="h-[600px]">
              <div className="p-4 space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <BellOff className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Try adjusting your search terms' : 'You\'re all caught up!'}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md",
                        !notification.isRead && "border-l-4 border-l-primary"
                      )}
                      onClick={() => {
                        markAsRead(notification.id);
                        setSelectedNotification(notification);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className={cn(
                              "rounded-full p-2",
                              !notification.isRead ? "bg-primary/10" : "bg-muted"
                            )}>
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={cn(
                                "font-medium truncate",
                                !notification.isRead && "font-semibold"
                              )}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <div className={cn(
                                  "w-2 h-2 rounded-full",
                                  getPriorityColor(notification.priority)
                                )} />
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(notification.timestamp)}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                      Mark as read
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => deleteNotification(notification.id)}>
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            
                            <p className={cn(
                              "text-sm text-muted-foreground mb-2",
                              !notification.isRead && "text-foreground"
                            )}>
                              {notification.message}
                            </p>
                            
                            {notification.metadata.userName && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={notification.metadata.userAvatar} />
                                  <AvatarFallback>
                                    {notification.metadata.userName.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  From {notification.metadata.userName}
                                </span>
                              </div>
                            )}
                            
                            {notification.actions && (
                              <div className="flex flex-wrap gap-2">
                                {notification.actions.map((action, index) => (
                                  <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick();
                                    }}
                                  >
                                    {action.label}
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>

      {/* Notification Details Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-lg">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-2">
                  {getNotificationIcon(selectedNotification.type)}
                  <DialogTitle>{selectedNotification.title}</DialogTitle>
                </div>
                <DialogDescription>
                  {formatDate(selectedNotification.timestamp)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Message</h4>
                  <p className="text-muted-foreground">{selectedNotification.message}</p>
                </div>
                
                {selectedNotification.metadata.userName && (
                  <div>
                    <h4 className="font-medium mb-2">From</h4>
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={selectedNotification.metadata.userAvatar} />
                        <AvatarFallback>
                          {selectedNotification.metadata.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedNotification.metadata.userName}</span>
                    </div>
                  </div>
                )}
                
                {selectedNotification.actions && (
                  <div>
                    <h4 className="font-medium mb-2">Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNotification.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={action.onClick}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Notification Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
            <DialogDescription>
              Configure how you receive notifications from fans and the platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Notification Types */}
            <div>
              <h4 className="font-medium mb-4">Notification Types</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="messages" className="text-sm">Messages</Label>
                  <Switch
                    id="messages"
                    checked={settings.messageNotifications}
                    onCheckedChange={(checked) => updateSettings({ messageNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="likes" className="text-sm">Likes</Label>
                  <Switch
                    id="likes"
                    checked={settings.likeNotifications}
                    onCheckedChange={(checked) => updateSettings({ likeNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="comments" className="text-sm">Comments</Label>
                  <Switch
                    id="comments"
                    checked={settings.commentNotifications}
                    onCheckedChange={(checked) => updateSettings({ commentNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="follows" className="text-sm">New Followers</Label>
                  <Switch
                    id="follows"
                    checked={settings.followNotifications}
                    onCheckedChange={(checked) => updateSettings({ followNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mentions" className="text-sm">Mentions</Label>
                  <Switch
                    id="mentions"
                    checked={settings.mentionNotifications}
                    onCheckedChange={(checked) => updateSettings({ mentionNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="gifts" className="text-sm">Gifts</Label>
                  <Switch
                    id="gifts"
                    checked={settings.giftNotifications}
                    onCheckedChange={(checked) => updateSettings({ giftNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="events" className="text-sm">Events</Label>
                  <Switch
                    id="events"
                    checked={settings.eventNotifications}
                    onCheckedChange={(checked) => updateSettings({ eventNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="milestones" className="text-sm">Milestones</Label>
                  <Switch
                    id="milestones"
                    checked={settings.milestoneNotifications}
                    onCheckedChange={(checked) => updateSettings({ milestoneNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="warnings" className="text-sm">Warnings</Label>
                  <Switch
                    id="warnings"
                    checked={settings.warningNotifications}
                    onCheckedChange={(checked) => updateSettings({ warningNotifications: checked })}
                  />
                </div>
              </div>
            </div>
            
            {/* Delivery Methods */}
            <div>
              <h4 className="font-medium mb-4">Delivery Methods</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-sm">Email Notifications</Label>
                  <Switch
                    id="email"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push" className="text-sm">Push Notifications</Label>
                  <Switch
                    id="push"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSettings({ pushNotifications: checked })}
                  />
                </div>
              </div>
            </div>
            
            {/* Quiet Hours */}
            <div>
              <h4 className="font-medium mb-4">Quiet Hours</h4>
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="quiet-hours" className="text-sm">Enable Quiet Hours</Label>
                <Switch
                  id="quiet-hours"
                  checked={settings.quietHours.enabled}
                  onCheckedChange={(checked) => updateSettings({ 
                    quietHours: { ...settings.quietHours, enabled: checked }
                  })}
                />
              </div>
              
              {settings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quiet-start" className="text-sm">Start Time</Label>
                    <Input
                      id="quiet-start"
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) => updateSettings({
                        quietHours: { ...settings.quietHours, start: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quiet-end" className="text-sm">End Time</Label>
                    <Input
                      id="quiet-end"
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) => updateSettings({
                        quietHours: { ...settings.quietHours, end: e.target.value }
                      })}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Notification Frequency */}
            <div>
              <h4 className="font-medium mb-4">Notification Frequency</h4>
              <Select value={settings.frequency} onValueChange={(value: any) => updateSettings({ frequency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsSettingsOpen(false)}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArtistNotificationSystem;