import React from 'react';
import { useParams } from 'react-router-dom';
import { useLibraryStore } from '@/store/library-store';
import { getTracksByArtistId } from '@/lib/mock-data';
import TrackList from '@/components/shared/TrackList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, Plus, Edit, Heart, Music, TrendingUp, Palette, Mic } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Extended artist interface for AI artists
interface AIArtist {
  id: string;
  name: string;
  bio: string;
  profileImage: string;
  genre: string;
  isAI: boolean;
  personalityTraits: string[];
  visualStyle: string;
  speakingStyle: 'formal' | 'casual' | 'energetic' | 'mysterious' | 'friendly';
  backstory: string;
  influences?: string;
  uniqueElements?: string;
  generationParameters?: {
    model: string;
    prompt: string;
    createdAt: Date;
  };
  performanceMetrics?: {
    engagement: number;
    popularity: number;
    streams: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const UserArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userCreatedArtists, followedArtistIds, toggleFollowArtist, updateUserArtist } = useLibraryStore();
  const [artist, setArtist] = React.useState<AIArtist | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // For demo purposes, we'll show some mock tracks. In a real app, this would be different.
  const tracks = id ? getTracksByArtistId('artist-1').slice(0, 3) : [];
  const isFollowing = artist ? followedArtistIds.has(artist.id) : false;

  React.useEffect(() => {
    const fetchArtist = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from the API
        const foundArtist = userCreatedArtists.find(a => a.id === id);
        if (foundArtist) {
          setArtist(foundArtist as AIArtist);
        }
      } catch (error) {
        console.error('Error fetching artist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchArtist();
    }
  }, [id, userCreatedArtists]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-8">
          <Skeleton className="w-48 h-48 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-16 w-96" />
            <Skeleton className="h-12 w-full max-w-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Artist not found</h1>
        <p className="text-gray-400">The AI artist you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const handleFollowClick = () => {
    toggleFollowArtist(artist.id);
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleUpdateArtist = (updatedData: Partial<AIArtist>) => {
    updateUserArtist(artist.id, updatedData);
    setIsEditing(false);
  };

  const getSpeakingStyleIcon = (style: string) => {
    switch (style) {
      case 'formal': return <Mic className="h-4 w-4" />;
      case 'casual': return <Music className="h-4 w-4" />;
      case 'energetic': return <TrendingUp className="h-4 w-4" />;
      case 'mysterious': return <Heart className="h-4 w-4" />;
      case 'friendly': return <Palette className="h-4 w-4" />;
      default: return <Mic className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-8">
        <Avatar className="w-48 h-48 rounded-full object-cover shadow-lg shadow-cyan/20">
          <AvatarImage src={artist.profileImage} alt={artist.name} />
          <AvatarFallback className="text-4xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            {artist.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <Badge variant="secondary" className="bg-cyan-900/30 text-cyan-300 border-cyan-700/50">
              AI ARTIST
            </Badge>
            {artist.performanceMetrics && (
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                {artist.performanceMetrics.popularity}% Popularity
              </Badge>
            )}
          </div>
          <h1 className="text-5xl md:text-7xl font-mono font-bold text-glow-cyan break-words">
            {artist.name}
          </h1>
          <div className="flex items-center space-x-2 text-cyan-400">
            <span>{artist.genre}</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              {getSpeakingStyleIcon(artist.speakingStyle)}
              <span className="capitalize">{artist.speakingStyle} style</span>
            </span>
          </div>
          <p className="text-gray-400 max-w-2xl">{artist.bio}</p>
        </div>
      </header>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleFollowClick}
            className={`font-bold transition-all duration-200 ${isFollowing ? 'bg-lime-600 hover:bg-lime-700' : 'bg-magenta-600 hover:bg-magenta-700'}`}
          >
            {isFollowing ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
          <Button
            onClick={handleEditClick}
            variant="outline"
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <Edit className="mr-2 h-4 w-4" />
            {isEditing ? 'Cancel' : 'Edit Artist'}
          </Button>
        </div>
        
        {artist.performanceMetrics && (
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-cyan-400">
              <Heart className="h-4 w-4" />
              <span>{artist.performanceMetrics.engagement}% Engagement</span>
            </div>
            <div className="flex items-center space-x-1 text-green-400">
              <TrendingUp className="h-4 w-4" />
              <span>{artist.performanceMetrics.streams} Streams</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Artist Overview</CardTitle>
              <CardDescription>Detailed information about this AI artist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Backstory</h4>
                <p className="text-gray-300">{artist.backstory}</p>
              </div>
              
              {artist.influences && (
                <div>
                  <h4 className="font-semibold mb-2">Influences</h4>
                  <p className="text-gray-300">{artist.influences}</p>
                </div>
              )}
              
              {artist.uniqueElements && (
                <div>
                  <h4 className="font-semibold mb-2">Unique Elements</h4>
                  <p className="text-gray-300">{artist.uniqueElements}</p>
                </div>
              )}
              
              {artist.generationParameters && (
                <div>
                  <h4 className="font-semibold mb-2">Generation Details</h4>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>Model: {artist.generationParameters.model}</p>
                    <p>Created: {new Date(artist.generationParameters.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Tracks Section */}
          <div>
            <h2 className="text-2xl font-mono font-bold mb-4">Tracks</h2>
            <p className="text-neutral-400 mb-4 text-sm">(Showing placeholder tracks. Track assignment for user artists is a future feature.)</p>
            {tracks.length > 0 ? (
              <TrackList tracks={tracks} showArtist={false} />
            ) : (
              <div className="text-center text-neutral-500 border-2 border-dashed border-neutral-700 rounded-lg p-12">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>This artist has no tracks yet.</p>
                <p className="text-sm mt-2">Tracks will be generated based on the artist's personality and style.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="personality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personality & Style</CardTitle>
              <CardDescription>Character traits and artistic style of this AI artist</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Personality Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {artist.personalityTraits.map((trait, index) => (
                    <Badge key={index} variant="secondary" className="bg-cyan-900/30 text-cyan-300 border-cyan-700/50">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Visual Style</h4>
                <p className="text-gray-300">{artist.visualStyle}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Speaking Style</h4>
                <div className="flex items-center space-x-2">
                  {getSpeakingStyleIcon(artist.speakingStyle)}
                  <Badge variant="outline" className="capitalize">
                    {artist.speakingStyle}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          {artist.performanceMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{artist.performanceMetrics.engagement}%</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Popularity</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{artist.performanceMetrics.popularity}%</div>
                  <p className="text-xs text-muted-foreground">
                    +180.1% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
                  <Music className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{artist.performanceMetrics.streams.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +19% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <TrendingUp className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
                <p className="text-gray-400 text-center">
                  Performance metrics will be available once the artist gains traction and generates content.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};