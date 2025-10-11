import React, { useState, useEffect, useRef } from 'react';
import { useClerkUser } from '@/contexts/ClerkUserContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ScrollArea 
} from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Mic, 
  Heart, 
  Gift, 
  Users, 
  Star, 
  Crown, 
  MoreHorizontal,
  Search,
  Filter,
  UserPlus,
  Bell,
  Volume2,
  Image,
  File,
  Video,
  Music,
  MapPin,
  Calendar,
  Clock,
  Zap,
  CheckCircle,
  Check,
  X,
  Edit3,
  Trash2,
  Block,
  Report,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Smile,
  Paperclip as PaperclipIcon,
  Mic as MicIcon,
  Phone,
  Video as VideoIcon,
  User,
  Bot,
  Sparkles,
  Award,
  TrendingUp,
  Activity,
  BarChart3,
  Settings,
  HelpCircle,
  Info,
  Shield,
  Archive,
  Share2
} from 'lucide-react';

// Message interfaces
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderRole: 'user' | 'artist' | 'moderator' | 'system';
  content: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'voice' | 'image' | 'file' | 'video' | 'music' | 'gift';
  attachment?: {
    name: string;
    size: string;
    type: string;
    url: string;
    thumbnail?: string;
  };
  reactions: Reaction[];
  isEdited?: boolean;
  isDeleted?: boolean;
  replyTo?: string;
  thread?: Message[];
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage: Message;
  unreadCount: number;
  isMuted: boolean;
  isArchived: boolean;
  isPinned: boolean;
  type: 'direct' | 'group' | 'announcement';
  title?: string;
  description?: string;
  avatar?: string;
  createdAt: string;
  lastActivity: string;
}

interface Participant {
  userId: string;
  username: string;
  avatar: string;
  role: 'user' | 'artist' | 'moderator' | 'admin';
  isOnline: boolean;
  lastSeen?: string;
  isAdmin?: boolean;
  isMuted?: boolean;
}

interface TypingIndicator {
  userId: string;
  username: string;
  timestamp: string;
}

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: 'greeting' | 'appreciation' | 'question' | 'feedback' | 'collaboration';
  isPublic: boolean;
  usageCount: number;
}

interface BlockedUser {
  userId: string;
  username: string;
  avatar: string;
  blockedAt: string;
  reason?: string;
}

interface MutedUser {
  userId: string;
  username: string;
  avatar: string;
  mutedAt: string;
  expiresAt?: string;
}

const FanMessagingSystem: React.FC = () => {
  const { user: currentUser } = useClerkUser();
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [newConversationDescription, setNewConversationDescription] = useState('');
  const [newConversationParticipants, setNewConversationParticipants] = useState<string[]>([]);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [showMutedUsers, setShowMutedUsers] = useState(false);
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [showVoiceMessageDialog, setShowVoiceMessageDialog] = useState(false);
  const [voiceMessageUrl, setVoiceMessageUrl] = useState<string | null>(null);
  const [showReactionDialog, setShowReactionDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [availableReactions, setAvailableReactions] = useState<string[]>(['❤️', '👍', '😂', '😮', '😢', '😡', '🔥', '💯']);
  const [showEditMessageDialog, setShowEditMessageDialog] = useState(false);
  const [editedMessageContent, setEditedMessageContent] = useState('');
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showForwardMessageDialog, setShowForwardMessageDialog] = useState(false);
  const [messageToForward, setMessageToForward] = useState<Message | null>(null);
  const [showPinMessageDialog, setShowPinMessageDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [messageSettings, setMessageSettings] = useState({
    readReceipts: true,
    typingIndicators: true,
    messagePreviews: true,
    soundEffects: true,
    notificationSound: true,
    saveToHistory: true,
    allowReactions: true,
    allowForwarding: true,
    allowScreenshots: true,
    autoDownload: false
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Mock data for demonstration
  const mockConversations: Conversation[] = [
    {
      id: 'conv-1',
      participants: [
        { userId: 'user-1', username: 'Neon Dreams', avatar: 'https://i.pravatar.cc/150?u=neon', role: 'artist', isOnline: true, isAdmin: true },
        { userId: currentUser?.id || 'user-current', username: currentUser?.fullName || 'You', avatar: currentUser?.imageUrl || '', role: 'user', isOnline: true }
      ],
      lastMessage: {
        id: 'msg-1',
        senderId: 'user-1',
        senderName: 'Neon Dreams',
        senderAvatar: 'https://i.pravatar.cc/150?u=neon',
        senderRole: 'artist',
        content: 'Thanks for your support! Here\'s a special track just for fans.',
        timestamp: new Date().toISOString(),
        isRead: true,
        type: 'text',
        reactions: [{ emoji: '❤️', count: 5, users: ['user-current', 'user-2', 'user-3'] }]
      },
      unreadCount: 0,
      isMuted: false,
      isArchived: false,
      isPinned: true,
      type: 'direct',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      lastActivity: new Date().toISOString()
    },
    {
      id: 'conv-2',
      participants: [
        { userId: 'user-2', username: 'Synthwave Community', avatar: 'https://i.pravatar.cc/150?u=community', role: 'moderator', isOnline: true, isAdmin: true },
        { userId: currentUser?.id || 'user-current', username: currentUser?.fullName || 'You', avatar: currentUser?.imageUrl || '', role: 'user', isOnline: true }
      ],
      lastMessage: {
        id: 'msg-2',
        senderId: 'user-2',
        senderName: 'Synthwave Community',
        senderAvatar: 'https://i.pravatar.cc/150?u=community',
        senderRole: 'moderator',
        content: 'Welcome to the community! Check out our latest discussion.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isRead: false,
        type: 'text',
        reactions: []
      },
      unreadCount: 3,
      isMuted: false,
      isArchived: false,
      isPinned: false,
      type: 'group',
      title: 'Synthwave Fans',
      description: 'A community for synthwave enthusiasts',
      avatar: 'https://i.pravatar.cc/150?u=community',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
      lastActivity: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: 'conv-3',
      participants: [
        { userId: 'user-3', username: 'Glitchard', avatar: 'https://i.pravatar.cc/150?u=glitchard', role: 'artist', isOnline: false, lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
        { userId: currentUser?.id || 'user-current', username: currentUser?.fullName || 'You', avatar: currentUser?.imageUrl || '', role: 'user', isOnline: true }
      ],
      lastMessage: {
        id: 'msg-3',
        senderId: 'user-current',
        senderName: currentUser?.fullName || 'You',
        senderAvatar: currentUser?.imageUrl || '',
        senderRole: 'user',
        content: 'Looking forward to our collaboration!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        isRead: true,
        type: 'text',
        reactions: [{ emoji: '🔥', count: 2, users: ['user-3', 'user-4'] }]
      },
      unreadCount: 0,
      isMuted: true,
      isArchived: false,
      isPinned: false,
      type: 'direct',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    }
  ];

  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      senderId: 'user-1',
      senderName: 'Neon Dreams',
      senderAvatar: 'https://i.pravatar.cc/150?u=neon',
      senderRole: 'artist',
      content: 'Hey there! Thanks for becoming a fan. I\'m excited to share exclusive content with you.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: true,
      type: 'text',
      reactions: [{ emoji: '❤️', count: 5, users: ['user-current', 'user-2', 'user-3'] }]
    },
    {
      id: 'msg-2',
      senderId: 'user-current',
      senderName: currentUser?.fullName || 'You',
      senderAvatar: currentUser?.imageUrl || '',
      senderRole: 'user',
      content: 'Thank you! I love your music. When can we expect new tracks?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
      isRead: true,
      type: 'text',
      reactions: [{ emoji: '👍', count: 1, users: ['user-1'] }]
    },
    {
      id: 'msg-3',
      senderId: 'user-1',
      senderName: 'Neon Dreams',
      senderAvatar: 'https://i.pravatar.cc/150?u=neon',
      senderRole: 'artist',
      content: 'I\'m working on something special right now! Expect a new track next week. Here\'s a sneak preview:',
      timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      isRead: true,
      type: 'text',
      attachment: {
        name: 'Neon Dreams - Electric Dreams Preview.mp3',
        size: '3.2 MB',
        type: 'music',
        url: '#',
        thumbnail: 'https://picsum.photos/seed/music1/300/300'
      },
      reactions: [{ emoji: '😮', count: 3, users: ['user-current', 'user-2', 'user-4'] }]
    },
    {
      id: 'msg-4',
      senderId: 'user-1',
      senderName: 'Neon Dreams',
      senderAvatar: 'https://i.pravatar.cc/150?u=neon',
      senderRole: 'artist',
      content: '🎵🎵🎵',
      timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      isRead: true,
      type: 'music',
      attachment: {
        name: 'Neon Dreams - Electric Dreams.mp3',
        size: '8.5 MB',
        type: 'music',
        url: '#',
        thumbnail: 'https://picsum.photos/seed/music2/300/300'
      },
      reactions: [{ emoji: '🔥', count: 8, users: ['user-current', 'user-2', 'user-3', 'user-4', 'user-5'] }]
    }
  ];

  const mockMessageTemplates: MessageTemplate[] = [
    {
      id: 'template-1',
      title: 'Fan Introduction',
      content: 'Hi! I\'m a big fan of your music and would love to connect.',
      category: 'greeting',
      isPublic: true,
      usageCount: 45
    },
    {
      id: 'template-2',
      title: 'Collaboration Request',
      content: 'I love your style and would be interested in collaborating on a track.',
      category: 'collaboration',
      isPublic: true,
      usageCount: 23
    },
    {
      id: 'template-3',
      title: 'Feedback',
      content: 'Just wanted to say that your latest track is amazing! The production quality is incredible.',
      category: 'appreciation',
      isPublic: true,
      usageCount: 67
    },
    {
      id: 'template-4',
      title: 'Question',
      content: 'I have a question about your creative process. Do you mind sharing some insights?',
      category: 'question',
      isPublic: true,
      usageCount: 34
    }
  ];

  const mockGifts = [
    { id: 'gift-1', name: 'Digital Sticker', price: 100, currency: 'points', icon: '🎨', description: 'Exclusive digital artwork' },
    { id: 'gift-2', name: 'Shoutout', price: 500, currency: 'points', icon: '📣', description: 'Personal mention in stream' },
    { id: 'gift-3', name: 'Custom Beat', price: 1000, currency: 'points', icon: '🎵', description: 'Exclusive custom beat' },
    { id: 'gift-4', name: 'Virtual Meet', price: 2000, currency: 'points', icon: '👋', description: '15-minute video call' },
    { id: 'gift-5', name: 'Exclusive Track', price: 5000, currency: 'points', icon: '💿', description: 'Unreleased track' }
  ];

  // Initialize data
  useEffect(() => {
    setConversations(mockConversations);
    setMessages(mockMessages);
    setMessageTemplates(mockMessageTemplates);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Simulate new message
      if (Math.random() > 0.7) {
        const newMessage: Message = {
          id: `msg-${Date.now()}`,
          senderId: 'user-1',
          senderName: 'Neon Dreams',
          senderAvatar: 'https://i.pravatar.cc/150?u=neon',
          senderRole: 'artist',
          content: 'Just dropped a new track! Check it out when you get a chance.',
          timestamp: new Date().toISOString(),
          isRead: false,
          type: 'text',
          reactions: []
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Update conversation last message
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation?.id 
            ? { ...conv, lastMessage: newMessage, unreadCount: conv.unreadCount + 1 }
            : conv
        ));
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [selectedConversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || isSending) return;
    
    setIsSending(true);
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || 'user-current',
      senderName: currentUser?.fullName || 'You',
      senderAvatar: currentUser?.imageUrl || '',
      senderRole: 'user',
      content: messageInput,
      timestamp: new Date().toISOString(),
      isRead: true,
      type: 'text',
      reactions: []
    };
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      
      // Update conversation last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: newMessage, lastActivity: newMessage.timestamp }
          : conv
      ));
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle selecting a conversation
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages(mockMessages);
    
    // Mark messages as read
    setConversations(prev => prev.map(conv => 
      conv.id === conversation.id 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
  };

  // Handle creating a new conversation
  const handleCreateConversation = () => {
    if (!newConversationTitle.trim()) return;
    
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants: newConversationParticipants.map(userId => ({
        userId,
        username: `User ${userId}`,
        avatar: `https://i.pravatar.cc/150?u=${userId}`,
        role: 'user',
        isOnline: true
      })),
      lastMessage: {
        id: `msg-${Date.now()}`,
        senderId: currentUser?.id || 'user-current',
        senderName: currentUser?.fullName || 'You',
        senderAvatar: currentUser?.imageUrl || '',
        senderRole: 'user',
        content: newConversationTitle,
        timestamp: new Date().toISOString(),
        isRead: true,
        type: 'text',
        reactions: []
      },
      unreadCount: 0,
      isMuted: false,
      isArchived: false,
      isPinned: false,
      type: 'group',
      title: newConversationTitle,
      description: newConversationDescription,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setNewConversationTitle('');
    setNewConversationDescription('');
    setNewConversationParticipants([]);
    setShowCreateDialog(false);
    handleSelectConversation(newConversation);
  };

  // Handle using a message template
  const handleUseTemplate = (template: MessageTemplate) => {
    setMessageInput(template.content);
    setSelectedTemplate(template);
    setShowTemplatesDialog(false);
  };

  // Handle sending a gift
  const handleSendGift = () => {
    if (!selectedGift || !selectedConversation) return;
    
    const giftMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || 'user-current',
      senderName: currentUser?.fullName || 'You',
      senderAvatar: currentUser?.imageUrl || '',
      senderRole: 'user',
      content: `Sent you a gift: ${selectedGift.name}!`,
      timestamp: new Date().toISOString(),
      isRead: true,
      type: 'gift',
      attachment: {
        name: selectedGift.name,
        size: 'Gift',
        type: 'gift',
        url: '#',
        thumbnail: `https://picsum.photos/seed/gift${selectedGift.id}/300/300`
      },
      reactions: []
    };
    
    setMessages(prev => [...prev, giftMessage]);
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, lastMessage: giftMessage, lastActivity: giftMessage.timestamp }
        : conv
    ));
    
    setShowGiftDialog(false);
    setSelectedGift(null);
  };

  // Handle recording a voice message
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      voiceRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      voiceRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setVoiceMessageUrl(audioUrl);
        setShowVoiceMessageDialog(true);
      };
      
      voiceRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  // Handle stopping recording
  const handleStopRecording = () => {
    if (voiceRecorderRef.current && isRecording) {
      voiceRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Handle sending a voice message
  const handleSendVoiceMessage = () => {
    if (!voiceMessageUrl) return;
    
    const voiceMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || 'user-current',
      senderName: currentUser?.fullName || 'You',
      senderAvatar: currentUser?.imageUrl || '',
      senderRole: 'user',
      content: 'Voice message',
      timestamp: new Date().toISOString(),
      isRead: true,
      type: 'voice',
      attachment: {
        name: 'Voice Message.wav',
        size: '2.3 MB',
        type: 'voice',
        url: voiceMessageUrl
      },
      reactions: []
    };
    
    setMessages(prev => [...prev, voiceMessage]);
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { ...conv, lastMessage: voiceMessage, lastActivity: voiceMessage.timestamp }
        : conv
    ));
    
    setVoiceMessageUrl(null);
    setShowVoiceMessageDialog(false);
  };

  // Handle adding a reaction
  const handleAddReaction = (emoji: string) => {
    if (!selectedMessage) return;
    
    setMessages(prev => prev.map(msg => {
      if (msg.id === selectedMessage.id) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          if (existingReaction.users.includes(currentUser?.id || 'user-current')) {
            // Remove reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== currentUser?.id) }
                  : r
              ).filter(r => r.count > 0)
            };
          } else {
            // Add reaction
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, count: r.count + 1, users: [...r.users, currentUser?.id || 'user-current'] }
                  : r
              )
            };
          }
        } else {
          // Add new reaction
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1, users: [currentUser?.id || 'user-current'] }]
          };
        }
      }
      return msg;
    }));
    
    setShowReactionDialog(false);
    setSelectedMessage(null);
  };

  // Handle editing a message
  const handleEditMessage = () => {
    if (!selectedMessage || !editedMessageContent.trim()) return;
    
    setMessages(prev => prev.map(msg => 
      msg.id === selectedMessage.id 
        ? { ...msg, content: editedMessageContent, isEdited: true }
        : msg
    ));
    
    setShowEditMessageDialog(false);
    setSelectedMessage(null);
    setEditedMessageContent('');
  };

  // Handle deleting a message
  const handleDeleteMessage = () => {
    if (!messageToDelete) return;
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageToDelete.id 
        ? { ...msg, isDeleted: true, content: 'This message was deleted.' }
        : msg
    ));
    
    setShowDeleteConfirmDialog(false);
    setMessageToDelete(null);
  };

  // Handle forwarding a message
  const handleForwardMessage = () => {
    if (!messageToForward) return;
    
    // In a real app, this would open a conversation selector
    const forwardedMessage: Message = {
      ...messageToForward,
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || 'user-current',
      senderName: currentUser?.fullName || 'You',
      senderAvatar: currentUser?.imageUrl || '',
      senderRole: 'user',
      timestamp: new Date().toISOString(),
      isRead: true,
      replyTo: undefined
    };
    
    setMessages(prev => [...prev, forwardedMessage]);
    
    if (selectedConversation) {
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: forwardedMessage, lastActivity: forwardedMessage.timestamp }
          : conv
      ));
    }
    
    setShowForwardMessageDialog(false);
    setMessageToForward(null);
  };

  // Handle pinning a message
  const handlePinMessage = () => {
    if (!selectedMessage) return;
    
    // In a real app, this would update the conversation settings
    console.log('Pinning message:', selectedMessage.id);
    
    setShowPinMessageDialog(false);
    setSelectedMessage(null);
  };

  // Handle reporting a message
  const handleReportMessage = () => {
    if (!selectedMessage || !reportReason.trim()) return;
    
    // In a real app, this would send to moderation team
    console.log('Reporting message:', selectedMessage.id, 'Reason:', reportReason);
    
    setShowReportDialog(false);
    setSelectedMessage(null);
    setReportReason('');
  };

  // Handle blocking a user
  const handleBlockUser = (userId: string) => {
    const userToBlock = conversations
      .flatMap(conv => conv.participants)
      .find(p => p.userId === userId);
    
    if (userToBlock) {
      const newBlockedUser: BlockedUser = {
        userId: userToBlock.userId,
        username: userToBlock.username,
        avatar: userToBlock.avatar,
        blockedAt: new Date().toISOString(),
        reason: 'User requested'
      };
      
      setBlockedUsers(prev => [...prev, newBlockedUser]);
      
      // Remove from conversations
      setConversations(prev => prev.filter(conv => 
        !conv.participants.some(p => p.userId === userId)
      ));
    }
  };

  // Handle muting a user
  const handleMuteUser = (userId: string) => {
    const userToMute = conversations
      .flatMap(conv => conv.participants)
      .find(p => p.userId === userId);
    
    if (userToMute) {
      const newMutedUser: MutedUser = {
        userId: userToMute.userId,
        username: userToMute.username,
        avatar: userToMute.avatar,
        mutedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString() // 7 days
      };
      
      setMutedUsers(prev => [...prev, newMutedUser]);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Get participant name
  const getParticipantName = (participants: Participant[]) => {
    if (participants.length === 1) return participants[0].username;
    if (participants.length === 2) {
      const other = participants.find(p => p.userId !== currentUser?.id);
      return other?.username || 'Unknown';
    }
    return participants[0].username;
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'artist': return 'text-purple-400';
      case 'moderator': return 'text-blue-400';
      case 'admin': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'artist': return <Sparkles className="h-3 w-3" />;
      case 'moderator': return <Shield className="h-3 w-3" />;
      case 'admin': return <Crown className="h-3 w-3" />;
      default: return null;
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.title?.toLowerCase().includes(searchLower) ||
      conv.description?.toLowerCase().includes(searchLower) ||
      conv.participants.some(p => 
        p.username.toLowerCase().includes(searchLower) ||
        p.userId.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div className="flex h-full bg-black">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-cyan-400">Fan Messages</h1>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowSettingsDialog(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    New Conversation
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowTemplatesDialog(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Templates
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowBlockedUsers(true)}>
                    <Block className="h-4 w-4 mr-2" />
                    Blocked Users
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowMutedUsers(true)}>
                    <Bell className="h-4 w-4 mr-2" />
                    Muted Users
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700"
            />
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map(conversation => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-800 cursor-pointer transition-colors ${
                selectedConversation?.id === conversation.id 
                  ? 'bg-gray-900' 
                  : 'hover:bg-gray-900/50'
              }`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.avatar || conversation.participants[0]?.avatar} />
                    <AvatarFallback>
                      {getParticipantName(conversation.participants).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.participants.some(p => p.isOnline) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white truncate">
                      {conversation.title || getParticipantName(conversation.participants)}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.lastActivity)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 truncate mb-1">
                    {conversation.lastMessage.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {conversation.type === 'group' && (
                        <Users className="h-3 w-3 text-gray-500" />
                      )}
                      {conversation.isPinned && (
                        <Zap className="h-3 w-3 text-yellow-400" />
                      )}
                      {conversation.isMuted && (
                        <Bell className="h-3 w-3 text-gray-500" />
                      )}
                    </div>
                    
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-cyan-600 text-white text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.avatar || selectedConversation.participants[0]?.avatar} />
                  <AvatarFallback>
                    {getParticipantName(selectedConversation.participants).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="font-bold text-white">
                    {selectedConversation.title || getParticipantName(selectedConversation.participants)}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {selectedConversation.type === 'direct' 
                      ? selectedConversation.participants[0]?.isOnline ? 'Online' : 'Offline'
                      : `${selectedConversation.participants.length} participants`
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <VideoIcon className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleMuteUser(selectedConversation.participants[0]?.userId || '')}>
                      <Bell className="h-4 w-4 mr-2" />
                      Mute Notifications
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBlockUser(selectedConversation.participants[0]?.userId || '')}>
                      <Block className="h-4 w-4 mr-2" />
                      Block User
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Report className="h-4 w-4 mr-2" />
                      Report Conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === (currentUser?.id || 'user-current') ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                      message.senderId === (currentUser?.id || 'user-current')
                        ? 'bg-cyan-600/20 border border-cyan-600/50'
                        : 'bg-gray-800/50 border border-gray-700/50'
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {message.senderId !== (currentUser?.id || 'user-current') && (
                          <>
                            <span className="font-medium text-sm">{message.senderName}</span>
                            <span className={`text-xs ${getRoleColor(message.senderRole)}`}>
                              {getRoleIcon(message.senderRole)}
                            </span>
                          </>
                        )}
                        {message.isEdited && (
                          <span className="text-xs text-gray-500">(edited)</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    
                    {/* Message Content */}
                    {message.type === 'text' && (
                      <p className="text-sm">{message.content}</p>
                    )}
                    
                    {message.type === 'voice' && (
                      <div className="flex items-center space-x-2">
                        <Volume2 className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm">Voice message</span>
                        <span className="text-xs text-gray-500">{message.attachment?.size}</span>
                      </div>
                    )}
                    
                    {message.type === 'music' && message.attachment && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Music className="h-4 w-4 text-purple-400" />
                          <span className="text-sm">{message.attachment.name}</span>
                        </div>
                        <div className="h-20 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded flex items-center justify-center">
                          <Play className="h-8 w-8 text-purple-400" />
                        </div>
                      </div>
                    )}
                    
                    {message.type === 'gift' && message.attachment && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Gift className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm">{message.attachment.name}</span>
                        </div>
                        <div className="h-20 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded flex items-center justify-center">
                          <Gift className="h-8 w-8 text-yellow-400" />
                        </div>
                      </div>
                    )}
                    
                    {/* Message Actions */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowReactionDialog(true);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Heart className="h-3 w-3" />
                        </Button>
                        
                        {message.content && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setMessageToForward(message);
                                setShowForwardMessageDialog(true);
                              }}>
                                <Share2 className="h-3 w-3 mr-2" />
                                Forward
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedMessage(message);
                                setEditedMessageContent(message.content);
                                setShowEditMessageDialog(true);
                              }}>
                                <Edit3 className="h-3 w-3 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setMessageToDelete(message);
                                setShowDeleteConfirmDialog(true);
                              }}>
                                <Trash2 className="h-3 w-3 mr-2" />
                                Delete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedMessage(message);
                                setShowPinMessageDialog(true);
                              }}>
                                <Zap className="h-3 w-3 mr-2" />
                                Pin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedMessage(message);
                                setShowReportDialog(true);
                              }}>
                                <Report className="h-3 w-3 mr-2" />
                                Report
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      {/* Reactions */}
                      <div className="flex items-center space-x-1">
                        {message.reactions.map((reaction, index) => (
                          <button
                            key={index}
                            className="text-xs hover:scale-110 transition-transform"
                            onClick={() => handleAddReaction(reaction.emoji)}
                          >
                            {reaction.emoji} {reaction.count > 1 ? reaction.count : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {typingIndicators.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>
                    {typingIndicators.map(t => t.username).join(', ')} typing...
                  </span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-end space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGiftDialog(true)}
                  className="h-10 w-10 p-0"
                >
                  <Gift className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 w-10 p-0"
                >
                  <PaperclipIcon className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                  className={`h-10 w-10 p-0 ${isRecording ? 'text-red-400' : ''}`}
                >
                  <MicIcon className="h-5 w-5" />
                </Button>
                
                <div className="flex-1">
                  <Textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="resize-none bg-gray-900 border-gray-700"
                    rows={1}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                </div>
                
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
              
              {/* Input Options */}
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <span>{messageInput.length}/1000</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplatesDialog(true)}
                  className="text-gray-500 hover:text-cyan-400"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Templates
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-400 mb-2">No Conversation Selected</h2>
              <p className="text-gray-500 mb-4">Select a conversation from the list or start a new one</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                New Conversation
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Create Conversation Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="conv-title">Title</Label>
              <Input
                id="conv-title"
                value={newConversationTitle}
                onChange={(e) => setNewConversationTitle(e.target.value)}
                placeholder="Enter conversation title"
              />
            </div>
            
            <div>
              <Label htmlFor="conv-description">Description (Optional)</Label>
              <Textarea
                id="conv-description"
                value={newConversationDescription}
                onChange={(e) => setNewConversationDescription(e.target.value)}
                placeholder="Enter conversation description"
                rows={3}
              />
            </div>
            
            <div>
              <Label>Add Participants</Label>
              <Select onValueChange={(value) => setNewConversationParticipants(prev => [...prev, value])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select participants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user-1">Neon Dreams</SelectItem>
                  <SelectItem value="user-2">Synthwave Community</SelectItem>
                  <SelectItem value="user-3">Glitchard</SelectItem>
                  <SelectItem value="user-4">Cyber Punk</SelectItem>
                </SelectContent>
              </Select>
              
              {newConversationParticipants.length > 0 && (
                <div className="mt-2 space-y-1">
                  {newConversationParticipants.map((userId, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                      <span>User {userId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setNewConversationParticipants(prev => prev.filter((_, i) => i !== index))}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateConversation}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Message Templates Dialog */}
      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Message Templates</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {messageTemplates.map(template => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:bg-gray-800/50"
                onClick={() => handleUseTemplate(template)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-medium">{template.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{template.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Used {template.usageCount} times</span>
                    {template.isPublic && (
                      <Badge variant="secondary" className="text-xs">
                        Public
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Gift Dialog */}
      <Dialog open={showGiftDialog} onOpenChange={setShowGiftDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send a Gift</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Send a special gift to show your appreciation!
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {mockGifts.map(gift => (
                <Card 
                  key={gift.id}
                  className={`cursor-pointer transition-all ${
                    selectedGift?.id === gift.id ? 'ring-2 ring-cyan-500' : 'hover:bg-gray-800/50'
                  }`}
                  onClick={() => setSelectedGift(gift)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{gift.icon}</div>
                    <h4 className="font-medium mb-1">{gift.name}</h4>
                    <p className="text-sm text-cyan-400 mb-1">
                      {gift.price} {gift.currency}
                    </p>
                    <p className="text-xs text-gray-500">{gift.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowGiftDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendGift}
                disabled={!selectedGift}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Send Gift
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Voice Message Dialog */}
      <Dialog open={showVoiceMessageDialog} onOpenChange={setShowVoiceMessageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Voice Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-cyan-600/20 to-purple-600/20 rounded-full flex items-center justify-center">
                <Volume2 className="h-16 w-16 text-cyan-400" />
              </div>
              <p className="text-gray-300">Voice Message Recorded</p>
              <p className="text-sm text-gray-500">Duration: 0:30</p>
            </div>
            
            <div className="flex justify-center space-x-2">
              <Button variant="outline" onClick={() => setVoiceMessageUrl(null)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Discard
              </Button>
              <Button onClick={handleSendVoiceMessage} className="bg-cyan-600 hover:bg-cyan-700">
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Reaction Dialog */}
      <Dialog open={showReactionDialog} onOpenChange={setShowReactionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Reaction</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-300">Choose a reaction:</p>
            
            <div className="grid grid-cols-4 gap-3">
              {availableReactions.map((reaction, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleAddReaction(reaction)}
                  className="text-2xl h-12"
                >
                  {reaction}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Message Dialog */}
      <Dialog open={showEditMessageDialog} onOpenChange={setShowEditMessageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-message">Message</Label>
              <Textarea
                id="edit-message"
                value={editedMessageContent}
                onChange={(e) => setEditedMessageContent(e.target.value)}
                placeholder="Edit your message"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditMessageDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditMessage}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirm Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirmDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteMessage}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Forward Message Dialog */}
      <Dialog open={showForwardMessageDialog} onOpenChange={setShowForwardMessageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Forward Message</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Select a conversation to forward this message to:
            </p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {conversations.filter(conv => conv.id !== selectedConversation?.id).map(conv => (
                <Card
                  key={conv.id}
                  className="cursor-pointer hover:bg-gray-800/50"
                  onClick={handleForwardMessage}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={conv.avatar || conv.participants[0]?.avatar} />
                        <AvatarFallback>
                          {getParticipantName(conv.participants).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{conv.title || getParticipantName(conv.participants)}</p>
                        <p className="text-xs text-gray-500">
                          {conv.participants.length} participants
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Message Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              {Object.entries(messageSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={`setting-${key}`} className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Switch
                    id={`setting-${key}`}
                    checked={value}
                    onCheckedChange={(checked) => setMessageSettings(prev => ({ ...prev, [key]: checked }))}
                  />
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-gray-700">
              <h4 className="font-medium mb-3">Notification Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Message Notifications</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Sound Effects</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Vibration</Label>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            // Handle file upload
            console.log('File selected:', file.name);
          }
        }}
      />
    </div>
  );
};

export default FanMessagingSystem;