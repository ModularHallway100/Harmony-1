import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArtistById, getTracksByArtistId } from '@/lib/mock-data';
import TrackList from '@/components/shared/TrackList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLibraryStore } from '@/store/library-store';
import { useClerkUser } from '@/contexts/ClerkUserContext';
import { Check, Plus, Edit, Trash2, Image, Wand2, Sparkles, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Enhanced artist interface with AI-specific fields
interface AIArtist {
  id: string;
  name: string;
  bio: string;
  genre: string;
  profileImage: string;
  isAI: boolean;
  personalityTraits: string[];
  visualStyle: string;
  speakingStyle: string;
  backstory: string;
  influences?: string;
  uniqueElements?: string;
  performanceMetrics?: {
    engagement: number;
    popularity: number;
    streams: number;
  };
}

// Form validation schema for editing AI artists
const editArtistSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50, 'Name must be 50 characters or less.'),
  bio: z.string().min(10, 'Bio must be at least 10 characters.').max(500, 'Bio must be 500 characters or less.'),
  genre: z.string().min(2, 'Genre must be at least 2 characters.').max(30, 'Genre must be 30 characters or less.'),
  personalityTraits: z.array(z.string()).min(1, 'Select at least one personality trait.').max(5, 'Maximum 5 traits allowed.'),
  visualStyle: z.string().min(2, 'Visual style must be at least 2 characters.').max(50, 'Visual style must be 50 characters or less.'),
  speakingStyle: z.enum(['formal', 'casual', 'energetic', 'mysterious', 'friendly']),
  backstory: z.string().min(10, 'Backstory must be at least 10 characters.').max(200, 'Backstory must be 200 characters or less.'),
  influences: z.string().max(100, 'Influences must be 100 characters or less.').optional(),
  uniqueElements: z.string().max(100, 'Unique elements must be 100 characters or less.').optional(),
});

type EditArtistFormValues = z.infer<typeof editArtistSchema>;

export const ArtistPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useClerkUser();
  const { followedArtistIds, toggleFollowArtist, getAIArtistById, updateAIArtist, removeAIArtist } = useLibraryStore();
  
  const [artist, setArtist] = useState<any>(null);
  const [aiArtist, setAIArtist] = useState<AIArtist | null>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const editForm = useForm<EditArtistFormValues>({
    resolver: zodResolver(editArtistSchema),
    defaultValues: {
      name: '',
      bio: '',
      genre: '',
      personalityTraits: [],
      visualStyle: '',
      speakingStyle: 'casual',
      backstory: '',
      influences: '',
      uniqueElements: '',
    },
  });

  // Load artist data
  useEffect(() => {
    const loadArtistData = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Try to get AI artist first
        const aiArtistData = getAIArtistById(id);
        if (aiArtistData) {
          setAIArtist(aiArtistData);
          setArtist(aiArtistData);
        } else {
          // Fall back to regular artist
          const artistData = getArtistById(id);
          setArtist(artistData);
        }
        
        // Load tracks
        const tracksData = getTracksByArtistId(id);
        setTracks(tracksData);
        
        // Check if user is the owner (for AI artists)
        if (aiArtistData && user?.id === aiArtistData.userId) {
          setIsOwner(true);
        }
      } catch (error) {
        console.error('Error loading artist data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadArtistData();
  }, [id, getAIArtistById, user]);

  const isFollowing = artist ? followedArtistIds.has(artist.id) : false;
  
  const handleFollowClick = () => {
    if (artist) {
      toggleFollowArtist(artist.id);
    }
  };
  
  const handleEditClick = () => {
    if (aiArtist) {
      editForm.reset({
        name: aiArtist.name,
        bio: aiArtist.bio,
        genre: aiArtist.genre,
        personalityTraits: aiArtist.personalityTraits,
        visualStyle: aiArtist.visualStyle,
        speakingStyle: aiArtist.speakingStyle,
        backstory: aiArtist.backstory,
        influences: aiArtist.influences || '',
        uniqueElements: aiArtist.uniqueElements || '',
      });
      setIsEditing(true);
    }
  };
  
  const handleDeleteClick = () => {
    setIsDeleting(true);
  };
  
  const handleDeleteConfirm = () => {
    if (aiArtist) {
      removeAIArtist(aiArtist.id);
      navigate('/library');
    }
    setIsDeleting(false);
  };
  
  const handleEditSubmit = (data: EditArtistFormValues) => {
    if (aiArtist) {
      updateAIArtist(aiArtist.id, data);
      setAIArtist({ ...aiArtist, ...data });
      setArtist({ ...aiArtist, ...data });
      setIsEditing(false);
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
    return <div className="text-center text-2xl font-bold">Artist not found.</div>;
  }
  
  return (
    <div className="space-y-8">
      {/* Artist Header */}
      <header className="flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-8">
        <img
          src={artist.profileImage}
          alt={artist.name}
          className="w-48 h-48 rounded-full object-cover shadow-lg shadow-cyan/20"
        />
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
            <Badge variant="secondary" className="bg-cyan-600/20 text-cyan-400">
              {artist.isAI ? 'AI ARTIST' : 'ARTIST'}
            </Badge>
            {isOwner && (
              <Badge variant="outline" className="border-purple-500 text-purple-400">
                OWNER
              </Badge>
            )}
          </div>
          <h1 className="text-5xl md:text-7xl font-mono font-bold text-glow-cyan break-words">
            {artist.name}
          </h1>
          <p className="mt-4 text-gray-400 max-w-2xl">{artist.bio}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {!isOwner && (
            <Button
              onClick={handleFollowClick}
              className={`font-bold transition-all duration-200 ${isFollowing ? 'bg-lime-600 hover:bg-lime-700' : 'bg-magenta-600 hover:bg-magenta-700'}`}
            >
              {isFollowing ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
          
          {isOwner && (
            <div className="flex space-x-2">
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit AI Artist</DialogTitle>
                  </DialogHeader>
                  <Form {...editForm}>
                    <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={editForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Artist name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={editForm.control}
                          name="genre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Genre</FormLabel>
                              <FormControl>
                                <Input placeholder="Music genre" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={editForm.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Artist bio" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={editForm.control}
                        name="backstory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Backstory</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Artist backstory" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={editForm.control}
                          name="influences"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Influences</FormLabel>
                              <FormControl>
                                <Input placeholder="Musical influences" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={editForm.control}
                          name="uniqueElements"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unique Elements</FormLabel>
                              <FormControl>
                                <Input placeholder="What makes them unique" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Artist</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p>Are you sure you want to delete this AI artist? This action cannot be undone.</p>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsDeleting(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteConfirm}
                      >
                        Delete Artist
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </header>
      
      {/* Artist Details Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles /> Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Primary Genre</h3>
                  <p className="text-lg">{artist.genre}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Visual Style</h3>
                  <p className="text-lg">{artist.visualStyle}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Speaking Style</h3>
                  <p className="text-lg capitalize">{artist.speakingStyle}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image /> Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">AI Model</h3>
                  <p className="text-lg">Gemini Pro</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Created</h3>
                  <p className="text-lg">New AI Artist</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Status</h3>
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="personality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 /> Personality Traits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {artist.personalityTraits?.map((trait: string) => (
                  <Badge key={trait} variant="secondary">
                    {trait}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Backstory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">{artist.backstory}</p>
            </CardContent>
          </Card>
          
          {artist.influences && (
            <Card>
              <CardHeader>
                <CardTitle>Influences</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{artist.influences}</p>
              </CardContent>
            </Card>
          )}
          
          {artist.uniqueElements && (
            <Card>
              <CardHeader>
                <CardTitle>Unique Elements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{artist.uniqueElements}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          {artist.performanceMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-400">
                    {artist.performanceMetrics.engagement}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">User interactions</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Popularity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-400">
                    {artist.performanceMetrics.popularity}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Score rating</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Streams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400">
                    {artist.performanceMetrics.streams}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total plays</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Tracks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-mono font-bold">Tracks</h2>
          {tracks.length > 0 && (
            <Button variant="outline" size="sm">
              <Play className="mr-2 h-4 w-4" />
              Play All
            </Button>
          )}
        </div>
        <TrackList tracks={tracks} showArtist={false} />
      </div>
    </div>
  );
};