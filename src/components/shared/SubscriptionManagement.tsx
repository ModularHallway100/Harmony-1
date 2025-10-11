import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Crown, 
  Star, 
  Zap, 
  Users, 
  Music, 
  CreditCard, 
  History,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useClerkUser } from '@/contexts/ClerkUserContext';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
}

interface UserSubscription {
  tier: 'free' | 'premium' | 'creator';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: Date | null;
  usage: {
    tracksUploaded: number;
    promptsGenerated: number;
    aiGenerations: number;
  };
  limits: {
    maxTracks: number;
    maxPrompts: number;
    maxAIGenerations: number;
  };
}

const SubscriptionManagement: React.FC = () => {
  const { user } = useClerkUser();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const subscriptionTiers: SubscriptionTier[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      billingCycle: 'forever',
      features: [
        'Basic AI music generation',
        '5 track uploads per month',
        '10 prompt rewrites per month',
        'Standard generation quality',
        'Community access'
      ],
      icon: <Star className="h-6 w-6" />,
      color: 'text-gray-400'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      billingCycle: 'month',
      features: [
        'Advanced AI music generation',
        '50 track uploads per month',
        '100 prompt rewrites per month',
        'High-quality generation',
        'Priority processing',
        'Early access to new features',
        'Premium analytics dashboard',
        'Ad-free experience'
      ],
      popular: true,
      icon: <Crown className="h-6 w-6" />,
      color: 'text-yellow-400'
    },
    {
      id: 'creator',
      name: 'Creator',
      price: 29.99,
      billingCycle: 'month',
      features: [
        'All Premium features',
        'Unlimited track uploads',
        'Unlimited prompt rewrites',
        'Commercial usage rights',
        'Custom track requests',
        'Fan subscription tools',
        'Revenue sharing (85% to you)',
        'Advanced analytics',
        'API access',
        'Priority support'
      ],
      icon: <Zap className="h-6 w-6" />,
      color: 'text-purple-400'
    }
  ];

  useEffect(() => {
    // Fetch user subscription data
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscriptions/current');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handlePlanChange = async (planId: string) => {
    setSelectedPlan(planId);
    try {
      const response = await fetch('/api/subscriptions/change-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        // Refresh subscription data
        const fetchSubscription = async () => {
          const res = await fetch('/api/subscriptions/current');
          if (res.ok) {
            const data = await res.json();
            setSubscription(data);
          }
        };
        fetchSubscription();
      } else {
        // Handle error
        console.error('Failed to change plan');
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      setSelectedPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh subscription data
        const fetchSubscription = async () => {
          const res = await fetch('/api/subscriptions/current');
          if (res.ok) {
            const data = await res.json();
            setSubscription(data);
          }
        };
        fetchSubscription();
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400">Active</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-500/20 text-gray-400">Canceled</Badge>;
      case 'past_due':
        return <Badge className="bg-red-500/20 text-red-400">Past Due</Badge>;
      case 'incomplete':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Incomplete</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-neutral-900/50 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="font-mono text-2xl text-glow-cyan flex items-center gap-3">
            <CreditCard className="h-6 w-6" /> Subscription Management
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Manage your subscription plan and billing information.
          </CardDescription>
        </CardHeader>
      </Card>

      {subscription && (
        <Card className="bg-neutral-900/50 border-lime-500/30">
          <CardHeader>
            <CardTitle className="font-mono text-xl text-glow-lime">Current Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold capitalize">
                  {subscription.tier} Tier
                </h3>
                {getStatusBadge(subscription.status)}
              </div>
              {subscription.currentPeriodEnd && (
                <div className="text-sm text-neutral-400 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Track Uploads</span>
                  <span>
                    {subscription.usage.tracksUploaded} / {subscription.limits.maxTracks}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscription.usage.tracksUploaded, subscription.limits.maxTracks)} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Prompt Rewrites</span>
                  <span>
                    {subscription.usage.promptsGenerated} / {subscription.limits.maxPrompts}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscription.usage.promptsGenerated, subscription.limits.maxPrompts)} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>AI Generations</span>
                  <span>
                    {subscription.usage.aiGenerations} / {subscription.limits.maxAIGenerations}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(subscription.usage.aiGenerations, subscription.limits.maxAIGenerations)} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-neutral-900/50 border-purple-500/30">
        <CardHeader>
          <CardTitle className="font-mono text-2xl text-glow-purple">Choose Your Plan</CardTitle>
          <CardDescription className="text-neutral-400">
            Select the plan that best fits your needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="plans" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="billing">Billing History</TabsTrigger>
              <TabsTrigger value="usage">Usage Details</TabsTrigger>
            </TabsList>

            <TabsContent value="plans" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionTiers.map((tier) => (
                  <Card 
                    key={tier.id} 
                    className={`relative transition-all duration-200 ${
                      tier.popular 
                        ? 'ring-2 ring-yellow-500/50 border-yellow-500/50' 
                        : 'border-neutral-700'
                    } ${
                      subscription?.tier === tier.id 
                        ? 'border-cyan-500/50 bg-cyan-500/10' 
                        : 'bg-neutral-900/50'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-yellow-500/20 text-yellow-400 px-3 py-1">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {tier.icon}
                          <CardTitle className={`font-bold ${tier.color}`}>
                            {tier.name}
                          </CardTitle>
                        </div>
                        {subscription?.tier === tier.id && (
                          <CheckCircle className="h-5 w-5 text-cyan-400" />
                        )}
                      </div>
                      <CardDescription className="text-neutral-400">
                        {tier.price === 0 ? 'Free forever' : `$${tier.price}/${tier.billingCycle}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2 mb-6">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`w-full ${
                          subscription?.tier === tier.id 
                            ? 'bg-cyan-600 hover:bg-cyan-700' 
                            : tier.popular 
                              ? 'bg-yellow-600 hover:bg-yellow-700' 
                              : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                        onClick={() => handlePlanChange(tier.id)}
                        disabled={selectedPlan !== null}
                      >
                        {subscription?.tier === tier.id ? 'Current Plan' : 'Select Plan'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {subscription?.tier !== 'free' && (
                <div className="flex justify-center mt-6">
                  <Button 
                    variant="outline" 
                    className="border-neutral-600 hover:bg-neutral-800"
                    onClick={handleCancelSubscription}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <div className="text-center py-8">
                <History className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Billing History</h3>
                <p className="text-neutral-400">Your payment history will appear here.</p>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-4">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Usage Details</h3>
                <p className="text-neutral-400">Detailed usage statistics and analytics will be available here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionManagement;