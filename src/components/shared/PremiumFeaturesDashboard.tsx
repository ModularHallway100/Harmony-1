import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Zap, 
  Rocket, 
  Clock, 
  Star, 
  Crown,
  Users,
  Music,
  TrendingUp,
  Download,
  Settings,
  Gift,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useClerkUser } from '@/contexts/ClerkUserContext';

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  usage?: {
    current: number;
    limit: number;
    period: string;
  };
  beta?: boolean;
}

interface AnalyticsData {
  totalGenerations: number;
  successfulGenerations: number;
  averageGenerationTime: number;
  popularModels: Array<{
    name: string;
    usage: number;
  }>;
  usageByDay: Array<{
    date: string;
    count: number;
  }>;
}

const PremiumFeaturesDashboard: React.FC = () => {
  const { user } = useClerkUser();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [earlyAccessFeatures, setEarlyAccessFeatures] = useState<PremiumFeature[]>([]);
  const [customTracks, setCustomTracks] = useState<PremiumFeature[]>([]);
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; key: string; lastUsed: Date }>>([]);

  const premiumFeatures: PremiumFeature[] = [
    {
      id: 'priority-generation',
      name: 'Priority Generation',
      description: 'Skip the queue and get your music generated faster',
      icon: <Zap className="h-6 w-6" />,
      available: true,
      usage: {
        current: 15,
        limit: 100,
        period: 'this month'
      }
    },
    {
      id: 'enhanced-prompts',
      name: 'Enhanced Prompt Rewriting',
      description: 'AI-powered prompt optimization for better results',
      icon: <Rocket className="h-6 w-6" />,
      available: true
    },
    {
      id: 'early-access',
      name: 'Early Access Features',
      description: 'Try new features before they\'re released to everyone',
      icon: <Clock className="h-6 w-6" />,
      available: true,
      beta: true
    },
    {
      id: 'custom-tracks',
      name: 'Custom Track Requests',
      description: 'Request personalized music tracks tailored to your needs',
      icon: <Music className="h-6 w-6" />,
      available: true,
      usage: {
        current: 3,
        limit: 10,
        period: 'this month'
      }
    },
    {
      id: 'analytics',
      name: 'Advanced Analytics',
      description: 'Detailed insights into your music generation patterns',
      icon: <BarChart3 className="h-6 w-6" />,
      available: true
    },
    {
      id: 'api-access',
      name: 'API Access',
      description: 'Integrate Harmony\'s AI capabilities into your own applications',
      icon: <Settings className="h-6 w-6" />,
      available: true
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch analytics data
        const analyticsRes = await fetch('/api/premium-features/analytics');
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData);
        }

        // Fetch early access features
        const earlyAccessRes = await fetch('/api/premium-features/early-access');
        if (earlyAccessRes.ok) {
          const earlyAccessData = await earlyAccessRes.json();
          setEarlyAccessFeatures(earlyAccessData.features);
        }

        // Fetch custom tracks
        const customTracksRes = await fetch('/api/premium-features/custom-tracks');
        if (customTracksRes.ok) {
          const customTracksData = await customTracksRes.json();
          setCustomTracks(customTracksData.tracks);
        }

        // Fetch API keys
        const apiKeysRes = await fetch('/api/premium-features/api-keys');
        if (apiKeysRes.ok) {
          const apiKeysData = await apiKeysRes.json();
          setApiKeys(apiKeysData.keys);
        }
      } catch (error) {
        console.error('Error fetching premium features data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenerateApiKey = async () => {
    try {
      const response = await fetch('/api/premium-features/api-keys', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(prev => [...prev, data.key]);
      }
    } catch (error) {
      console.error('Error generating API key:', error);
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/premium-features/api-keys/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setApiKeys(prev => prev.filter(key => key.id !== id));
      }
    } catch (error) {
      console.error('Error revoking API key:', error);
    }
  };

  const handleRequestCustomTrack = async () => {
    // Implementation for requesting custom track
    console.log('Requesting custom track...');
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
            <Crown className="h-6 w-6" /> Premium Features Dashboard
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Access exclusive features and tools available to Premium users.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-neutral-900/50 border-lime-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400">Total Generations</p>
                    <p className="text-2xl font-bold">
                      {analytics?.totalGenerations || 0}
                    </p>
                  </div>
                  <Music className="h-8 w-8 text-lime-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/50 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400">Success Rate</p>
                    <p className="text-2xl font-bold">
                      {analytics && analytics.totalGenerations > 0 
                        ? Math.round((analytics.successfulGenerations / analytics.totalGenerations) * 100)
                        : 0}%
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/50 border-cyan-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400">Avg. Generation Time</p>
                    <p className="text-2xl font-bold">
                      {analytics?.averageGenerationTime 
                        ? `${Math.round(analytics.averageGenerationTime)}s`
                        : 'N/A'}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-cyan-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/50 border-yellow-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-400">Early Access</p>
                    <p className="text-2xl font-bold">
                      {earlyAccessFeatures.length}
                    </p>
                  </div>
                  <Rocket className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-neutral-900/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="font-mono text-xl text-glow-purple">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleRequestCustomTrack}
                >
                  <Gift className="mr-2 h-4 w-4" />
                  Request Custom Track
                </Button>
                <Button 
                  variant="outline" 
                  className="border-neutral-600 hover:bg-neutral-800"
                  onClick={handleGenerateApiKey}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Generate API Key
                </Button>
                <Button 
                  variant="outline" 
                  className="border-neutral-600 hover:bg-neutral-800"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumFeatures.map((feature) => (
              <Card 
                key={feature.id} 
                className={`bg-neutral-900/50 ${
                  feature.available 
                    ? 'border-cyan-500/30' 
                    : 'border-neutral-700 opacity-50'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {feature.icon}
                      <div>
                        <CardTitle className="font-mono text-lg">
                          {feature.name}
                        </CardTitle>
                        {feature.beta && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                            Beta
                          </Badge>
                        )}
                      </div>
                    </div>
                    {feature.available ? (
                      <CheckCircle className="h-5 w-5 text-cyan-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-neutral-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">
                    {feature.description}
                  </CardDescription>
                  
                  {feature.usage && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Usage</span>
                        <span>
                          {feature.usage.current} / {feature.usage.limit} ({feature.usage.period})
                        </span>
                      </div>
                      <Progress 
                        value={(feature.usage.current / feature.usage.limit) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics ? (
            <>
              <Card className="bg-neutral-900/50 border-lime-500/30">
                <CardHeader>
                  <CardTitle className="font-mono text-xl text-glow-lime">Generation Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Popular Models</h4>
                      <div className="space-y-2">
                        {analytics.popularModels.map((model, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{model.name}</span>
                            <Badge variant="outline">{model.usage} uses</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Usage by Day</h4>
                      <div className="space-y-2">
                        {analytics.usageByDay.slice(-7).map((day, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{new Date(day.date).toLocaleDateString()}</span>
                            <Badge variant="outline">{day.count} generations</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-neutral-900/50 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="font-mono text-xl text-glow-purple">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Generations</span>
                        <span className="font-semibold">{analytics.totalGenerations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Successful Generations</span>
                        <span className="font-semibold">{analytics.successfulGenerations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate</span>
                        <span className="font-semibold">
                          {Math.round((analytics.successfulGenerations / analytics.totalGenerations) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Average Generation Time</span>
                        <span className="font-semibold">
                          {Math.round(analytics.averageGenerationTime)}s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Peak Usage</span>
                        <span className="font-semibold">
                          {Math.max(...analytics.usageByDay.map(d => d.count))} generations/day
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Model Diversity</span>
                        <span className="font-semibold">
                          {analytics.popularModels.length} models used
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-neutral-900/50 border-neutral-700">
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Not Available</h3>
                <p className="text-neutral-400">No analytics data found yet. Start using Premium features to see your statistics.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Card className="bg-neutral-900/50 border-purple-500/30">
            <CardHeader>
              <CardTitle className="font-mono text-xl text-glow-purple">API Keys</CardTitle>
              <CardDescription className="text-neutral-400">
                Manage your API keys for integrating Harmony with external applications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Your API Keys</h4>
                  <Button onClick={handleGenerateApiKey}>
                    Generate New Key
                  </Button>
                </div>
                
                {apiKeys.length > 0 ? (
                  <div className="space-y-3">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-3 bg-neutral-900/30 rounded-lg">
                        <div>
                          <p className="font-mono text-sm">{key.name}</p>
                          <p className="font-mono text-xs text-neutral-400 break-all">
                            {key.key}
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            Last used: {new Date(key.lastUsed).toLocaleDateString()}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleRevokeApiKey(key.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-neutral-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No API Keys</h3>
                    <p className="text-neutral-400 mb-4">Generate your first API key to start integrating Harmony.</p>
                    <Button onClick={handleGenerateApiKey}>
                      Generate API Key
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900/50 border-lime-500/30">
            <CardHeader>
              <CardTitle className="font-mono text-xl text-glow-lime">Custom Track Requests</CardTitle>
              <CardDescription className="text-neutral-400">
                Request personalized music tracks tailored to your specific needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertDescription>
                    Custom track requests allow you to get music tailored to your specific needs. 
                    Each request is handcrafted by our AI system based on your detailed requirements.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Your Requests</h4>
                    {customTracks.length > 0 ? (
                      <div className="space-y-2">
                        {customTracks.map((track, index) => (
                          <div key={index} className="p-3 bg-neutral-900/30 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{track.name}</p>
                                <p className="text-sm text-neutral-400">{track.description}</p>
                              </div>
                              <Badge className="bg-green-500/20 text-green-400">
                                Completed
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-neutral-400">No custom track requests yet.</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Request New Track</h4>
                    <Button 
                      className="w-full bg-lime-600 hover:bg-lime-700"
                      onClick={handleRequestCustomTrack}
                    >
                      <Gift className="mr-2 h-4 w-4" />
                      Request Custom Track
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiumFeaturesDashboard;