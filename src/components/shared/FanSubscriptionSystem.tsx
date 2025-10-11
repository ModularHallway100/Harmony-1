import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Heart, 
  Star, 
  Crown, 
  Gift, 
  Music, 
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  MessageCircle,
  Bell,
  TrendingUp
} from 'lucide-react';
import { useClerkUser } from '@/contexts/ClerkUserContext';

interface Artist {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  isSubscribed: boolean;
  subscriptionTier: 'basic' | 'premium' | 'vip';
}

interface ExclusiveContent {
  id: string;
  title: string;
  type: 'track' | 'prompt' | 'tutorial' | 'behind-the-scenes';
  description: string;
  duration?: string;
  releaseDate: Date;
  downloadCount: number;
  likeCount: number;
  isUnlocked: boolean;
}

interface SubscriptionBenefit {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  tier: 'basic' | 'premium' | 'vip';
}

interface FanSubscription {
  artistId: string;
  tier: 'basic' | 'premium' | 'vip';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: Date;
  benefits: string[];
  contentAccess: {
    tracks: number;
    prompts: number;
    tutorials: number;
  };
}

const FanSubscriptionSystem: React.FC<{ artistId: string }> = ({ artistId }) => {
  const { user } = useClerkUser();
  const [loading, setLoading] = useState(true);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [subscription, setSubscription] = useState<FanSubscription | null>(null);
  const [exclusiveContent, setExclusiveContent] = useState<ExclusiveContent[]>([]);
  const [selectedTier, setSelectedTier] = useState<'basic' | 'premium' | 'vip' | null>(null);

  const subscriptionTiers = [
    {
      id: 'basic',
      name: 'Basic Support',
      price: 4.99,
      billingCycle: 'month',
      description: 'Show your support and get exclusive content',
      benefits: [
        'Access to exclusive tracks',
        'Monthly prompt packs',
        'Artist updates',
        'Community access'
      ],
      popular: false,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'premium',
      name: 'Premium Support',
      price: 9.99,
      billingCycle: 'month',
      description: 'Enhanced access with more exclusive content',
      benefits: [
        'All Basic benefits',
        'Early access to new tracks',
        'Exclusive tutorials',
        'Behind-the-scenes content',
        'Direct messaging',
        'Higher quality downloads'
      ],
      popular: true,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'vip',
      name: 'VIP Support',
      price: 19.99,
      billingCycle: 'month',
      description: 'Ultimate fan experience with maximum benefits',
      benefits: [
        'All Premium benefits',
        'Unlimited access to all content',
        'Custom track requests',
        'Personalized responses',
        'VIP community access',
        'Merchandise discounts',
        'Priority support'
      ],
      popular: false,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    }
  ];

  const subscriptionBenefits: SubscriptionBenefit[] = [
    {
      id: 'exclusive-tracks',
      name: 'Exclusive Tracks',
      description: 'Get access to tracks not available to the public',
      icon: <Music className="h-5 w-5" />,
      tier: 'basic'
    },
    {
      id: 'early-access',
      name: 'Early Access',
      description: 'Be the first to hear new releases',
      icon: <Clock className="h-5 w-5" />,
      tier: 'premium'
    },
    {
      id: 'tutorials',
      name: 'Exclusive Tutorials',
      description: 'Learn the artist\'s techniques and secrets',
      icon: <Gift className="h-5 w-5" />,
      tier: 'premium'
    },
    {
      id: 'behind-scenes',
      name: 'Behind the Scenes',
      description: 'Get a glimpse into the creative process',
      icon: <Users className="h-5 w-5" />,
      tier: 'premium'
    },
    {
      id: 'messaging',
      name: 'Direct Messaging',
      description: 'Connect directly with the artist',
      icon: <MessageCircle className="h-5 w-5" />,
      tier: 'vip'
    },
    {
      id: 'custom-requests',
      name: 'Custom Requests',
      description: 'Request personalized content',
      icon: <Star className="h-5 w-5" />,
      tier: 'vip'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch artist data
        const artistRes = await fetch(`/api/artists/${artistId}`);
        if (artistRes.ok) {
          const artistData = await artistRes.json();
          setArtist(artistData);
        }

        // Fetch fan subscription data
        const subscriptionRes = await fetch(`/api/fan-subscriptions/${artistId}`);
        if (subscriptionRes.ok) {
          const subscriptionData = await subscriptionRes.json();
          setSubscription(subscriptionData);
        }

        // Fetch exclusive content
        const contentRes = await fetch(`/api/artists/${artistId}/exclusive-content`);
        if (contentRes.ok) {
          const contentData = await contentRes.json();
          setExclusiveContent(contentData);
        }
      } catch (error) {
        console.error('Error fetching fan subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [artistId]);

  const handleSubscribe = async (tier: 'basic' | 'premium' | 'vip') => {
    setSelectedTier(tier);
    try {
      const response = await fetch('/api/fan-subscriptions/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistId,
          tier,
        }),
      });

      if (response.ok) {
        // Refresh subscription data
        const subscriptionRes = await fetch(`/api/fan-subscriptions/${artistId}`);
        if (subscriptionRes.ok) {
          const subscriptionData = await subscriptionRes.json();
          setSubscription(subscriptionData);
        }
      } else {
        // Handle error
        console.error('Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setSelectedTier(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/fan-subscriptions/cancel', {
        method: 'POST',
        body: JSON.stringify({ artistId }),
      });

      if (response.ok) {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  const handleDownloadContent = async (contentId: string) => {
    try {
      const response = await fetch(`/api/artists/${artistId}/exclusive-content/${contentId}/download`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update download count
        setExclusiveContent(prev => 
          prev.map(content => 
            content.id === contentId 
              ? { ...content, downloadCount: content.downloadCount + 1 }
              : content
          )
        );
      }
    } catch (error) {
      console.error('Error downloading content:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <Card className="bg-neutral-900/50 border-neutral-700">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Artist Not Found</h3>
          <p className="text-neutral-400">The requested artist could not be found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-neutral-900/50 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="font-mono text-2xl text-glow-cyan flex items-center gap-3">
            <Heart className="h-6 w-6" /> Support {artist.name}
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Get exclusive content and support your favorite AI artist.
          </CardDescription>
        </CardHeader>
      </Card>

      {subscription && (
        <Card className={`${subscription.tier === 'basic' ? 'border-blue-500/30' : subscription.tier === 'premium' ? 'border-purple-500/30' : 'border-yellow-500/30'} bg-neutral-900/50`}>
          <CardHeader>
            <CardTitle className="font-mono text-xl flex items-center gap-3">
              <Crown className="h-5 w-5" />
              Current Subscription: {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Support
            </CardTitle>
            <CardDescription>
              You're supporting {artist.name} with {subscription.tier} tier benefits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <Badge className="bg-green-500/20 text-green-400">Active</Badge>
              <div className="text-sm text-neutral-400 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </div>
              <Button 
                variant="outline" 
                className="border-neutral-600 hover:bg-neutral-800"
                onClick={handleCancelSubscription}
              >
                Cancel Subscription
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{subscription.contentAccess.tracks}</p>
                <p className="text-sm text-neutral-400">Tracks</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{subscription.contentAccess.prompts}</p>
                <p className="text-sm text-neutral-400">Prompts</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{subscription.contentAccess.tutorials}</p>
                <p className="text-sm text-neutral-400">Tutorials</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-neutral-900/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="font-mono text-xl text-glow-purple">Choose Your Support Tier</CardTitle>
          <CardDescription className="text-neutral-400">
            Select a tier that fits your budget and get amazing benefits in return.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tiers" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tiers">Tiers</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="content">Exclusive Content</TabsTrigger>
            </TabsList>

            <TabsContent value="tiers" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionTiers.map((tier) => (
                  <Card 
                    key={tier.id} 
                    className={`relative transition-all duration-200 ${
                      tier.popular 
                        ? 'ring-2 ring-purple-500/50 border-purple-500/50' 
                        : `border-${tier.borderColor.split('-')[1]}-500/30`
                    } ${
                      subscription?.tier === tier.id 
                        ? `ring-2 ring-cyan-500/50 border-cyan-500/50` 
                        : ''
                    } ${tier.bgColor} bg-neutral-900/50`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-purple-500/20 text-purple-400 px-3 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className={`font-bold ${tier.color}`}>
                            {tier.name}
                          </CardTitle>
                          <CardDescription className="text-neutral-400 mt-1">
                            {tier.description}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${tier.price}</p>
                          <p className="text-sm text-neutral-400">/{tier.billingCycle}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2 mb-6">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`w-full ${
                          subscription?.tier === tier.id 
                            ? 'bg-cyan-600 hover:bg-cyan-700' 
                            : tier.popular 
                              ? 'bg-purple-600 hover:bg-purple-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        onClick={() => handleSubscribe(tier.id as 'basic' | 'premium' | 'vip')}
                        disabled={selectedTier !== null}
                      >
                        {subscription?.tier === tier.id ? 'Current Tier' : 'Subscribe'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="benefits" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscriptionBenefits.map((benefit) => (
                  <Card 
                    key={benefit.id} 
                    className={`bg-neutral-900/50 ${
                      benefit.tier === 'basic' 
                        ? 'border-blue-500/30' 
                        : benefit.tier === 'premium' 
                          ? 'border-purple-500/30' 
                          : 'border-yellow-500/30'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`${benefit.tier === 'basic' ? 'text-blue-400' : benefit.tier === 'premium' ? 'text-purple-400' : 'text-yellow-400'}`}>
                          {benefit.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">{benefit.name}</h4>
                          <p className="text-sm text-neutral-400">{benefit.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              {exclusiveContent.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exclusiveContent.map((content) => (
                    <Card 
                      key={content.id} 
                      className={`bg-neutral-900/50 ${
                        content.isUnlocked 
                          ? 'border-cyan-500/30' 
                          : 'border-neutral-700 opacity-50'
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="font-mono text-lg">
                              {content.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="capitalize">
                                {content.type}
                              </Badge>
                              {content.duration && (
                                <Badge variant="outline" className="text-xs">
                                  {content.duration}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {content.isUnlocked ? (
                            <CheckCircle className="h-5 w-5 text-cyan-400" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-neutral-500" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-3">
                          {content.description}
                        </CardDescription>
                        
                        <div className="flex items-center justify-between text-sm text-neutral-400 mb-3">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Download className="h-4 w-4" />
                              {content.downloadCount}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {content.likeCount}
                            </div>
                          </div>
                          <div className="text-xs">
                            Released {new Date(content.releaseDate).toLocaleDateString()}
                          </div>
                        </div>
                        
                        {content.isUnlocked && (
                          <Button 
                            className="w-full bg-cyan-600 hover:bg-cyan-700"
                            onClick={() => handleDownloadContent(content.id)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-neutral-900/50 border-neutral-700">
                  <CardContent className="p-8 text-center">
                    <Music className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Exclusive Content</h3>
                    <p className="text-neutral-400">This artist hasn't released any exclusive content yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-neutral-900/50 border-lime-500/30">
        <CardHeader>
          <CardTitle className="font-mono text-xl text-glow-lime flex items-center gap-3">
            <TrendingUp className="h-5 w-5" /> About Fan Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              Your subscription directly supports {artist.name} and helps them create more amazing content. 
              As a thank you, you'll get exclusive access to tracks, prompts, and behind-the-scenes content 
              that isn't available to the general public.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 space-y-2 text-sm text-neutral-400">
            <p>• All subscriptions are monthly and can be canceled at any time</p>
            <p>• You'll continue to have access to content until the end of your billing period</p>
            <p>• Artists receive 85% of all subscription revenue</p>
            <p>• Your support helps artists continue creating and improving their work</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FanSubscriptionSystem;