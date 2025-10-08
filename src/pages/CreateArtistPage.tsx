import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore } from '@/store/library-store';
import { generateAIBio, generateAIImage, trackAIServiceUsage } from '@/lib/ai-services';
import ImageUpload from '@/components/shared/ImageUpload';
import ArtistGallery from '@/components/shared/ArtistGallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, Wand2, Image, Sparkles, Loader2, Upload, Trash2 } from 'lucide-react';

// Enhanced artist form schema with personality traits and visual style
const artistFormSchema = z.object({
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

type ArtistFormValues = z.infer<typeof artistFormSchema>;

// Personality traits options
const personalityTraits = [
  'Mysterious', 'Energetic', 'Calm', 'Playful', 'Serious',
  'Whimsical', 'Dark', 'Colorful', 'Minimalist', 'Complex',
  'Simple', 'Experimental', 'Traditional', 'Futuristic', 'Nostalgic'
];

// Visual style options
const visualStyles = [
  'Futuristic', 'Retro', 'Minimalist', 'Vibrant', 'Dark',
  'Neon', 'Cyberpunk', 'Synthwave', 'Gothic', 'Pop Art',
  'Abstract', 'Geometric', 'Organic', 'Digital', 'Analog'
];

export const CreateArtistPage: React.FC = () => {
  const navigate = useNavigate();
  const addAIArtist = useLibraryStore((state) => state.addAIArtist);
  const addArtistImage = useLibraryStore((state) => state.addArtistImage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('basic');
  
  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistFormSchema),
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

  // Handle personality trait selection
  const handleTraitToggle = (trait: string) => {
    const currentTraits = form.getValues('personalityTraits');
    const newTraits = currentTraits.includes(trait)
      ? currentTraits.filter(t => t !== trait)
      : [...currentTraits, trait];
    
    form.setValue('personalityTraits', newTraits);
    setSelectedTraits(newTraits);
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    // In a real app, this would upload to a cloud service
    // For demo purposes, we'll create a local URL
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        resolve(imageUrl);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUploaded = async (file: File) => {
    try {
      const imageUrl = await handleImageUpload(file);
      const newImage = {
        id: `img-${Date.now()}`,
        url: imageUrl,
        prompt: 'User uploaded image',
        model: 'upload',
        generatedAt: new Date(),
        isPrimary: !generatedImage && uploadedImages.length === 0
      };
      
      setUploadedImages(prev => [...prev, newImage]);
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }
  };

  const handleRemoveImage = () => {
    setGeneratedImage(null);
    setUploadedImages([]);
  };

  // Generate AI bio
  const generateAIBio = async () => {
    setIsGenerating(true);
    try {
      const { name, genre, personalityTraits, visualStyle, speakingStyle, backstory, influences, uniqueElements } = form.getValues();
      
      const generatedBio = await generateAIBio({
        name,
        genre,
        personalityTraits,
        visualStyle,
        speakingStyle,
        backstory,
        influences,
        uniqueElements,
      });
      
      form.setValue('bio', generatedBio);
      
      // Track successful API usage
      trackAIServiceUsage('gemini', 'bio_generation', true, {
        name,
        genre,
        visualStyle,
      });
    } catch (error) {
      console.error('Failed to generate bio:', error);
      
      // Track failed API usage
      trackAIServiceUsage('gemini', 'bio_generation', false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate AI image
  const generateAIImage = async () => {
    setIsGenerating(true);
    try {
      const { name, genre, personalityTraits, visualStyle } = form.getValues();
      
      const imageUrl = await generateAIImage({
        name,
        genre,
        personalityTraits,
        visualStyle,
      }, 'nanobanana');
      
      const newImage = {
        id: `img-${Date.now()}`,
        url: imageUrl,
        prompt: `AI generated image for ${name}`,
        model: 'nanobanana',
        generatedAt: new Date(),
        isPrimary: !generatedImage && uploadedImages.length === 0
      };
      
      setUploadedImages(prev => [...prev, newImage]);
      setGeneratedImage(imageUrl);
      
      // Track successful API usage
      trackAIServiceUsage('nanobanana', 'image_generation', true, {
        name,
        genre,
        visualStyle,
      });
    } catch (error) {
      console.error('Failed to generate image:', error);
      
      // Track failed API usage
      trackAIServiceUsage('nanobanana', 'image_generation', false);
    } finally {
      setIsGenerating(false);
    }
  };

  function onSubmit(data: ArtistFormValues) {
    const artistData = {
      ...data,
      profileImage: generatedImage || `https://picsum.photos/seed/${data.name}/400/400`,
      isAI: true,
    };
    
    // Create the artist first
    addAIArtist(artistData);
    
    // Add uploaded images to the gallery
    if (uploadedImages.length > 0) {
      // In a real app, we'd need the artist ID from the backend
      // For demo purposes, we'll use a placeholder
      const artistId = `ai-artist-${Date.now()}`;
      uploadedImages.forEach(image => {
        addArtistImage(artistId, image);
      });
    }
    
    // Ideally, show a success toast here
    navigate('/library');
  }
  return (
    <div className="max-w-6xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-mono font-bold text-glow-cyan">Create AI Artist</h1>
        <p className="mt-4 text-lg text-gray-400">
          Generate your own unique AI artist persona to associate with your tracks.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <Card className="bg-neutral-900/50 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="font-mono text-2xl text-glow-cyan flex items-center gap-2">
                <Bot /> New Persona Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="personality">Personality</TabsTrigger>
                      <TabsTrigger value="style">Style</TabsTrigger>
                      <TabsTrigger value="images">Images</TabsTrigger>
                      <TabsTrigger value="ai">Generate</TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-gray-300">Artist Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Glitchard, Data Diva" {...field} className="bg-neutral-950 border-neutral-700 focus:ring-cyan-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="genre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-gray-300">Primary Genre</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Synthwave, Cyberpunk Pop" {...field} className="bg-neutral-950 border-neutral-700 focus:ring-cyan-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="backstory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-gray-300">Backstory</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Where did this AI artist come from? What's their origin story?"
                                className="min-h-[80px] bg-neutral-950 border-neutral-700 focus:ring-cyan-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="influences"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold text-gray-300">Influences</FormLabel>
                              <FormControl>
                                <Input placeholder="Musical influences" {...field} className="bg-neutral-950 border-neutral-700 focus:ring-cyan-500" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="uniqueElements"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold text-gray-300">Unique Elements</FormLabel>
                              <FormControl>
                                <Input placeholder="What makes them unique?" {...field} className="bg-neutral-950 border-neutral-700 focus:ring-cyan-500" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="personality" className="space-y-6">
                      <div>
                        <FormLabel className="font-semibold text-gray-300 mb-3 block">Personality Traits</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {personalityTraits.map((trait) => (
                            <Badge
                              key={trait}
                              variant={selectedTraits.includes(trait) ? "default" : "outline"}
                              className="cursor-pointer transition-all hover:scale-105"
                              onClick={() => handleTraitToggle(trait)}
                            >
                              {trait}
                            </Badge>
                          ))}
                        </div>
                        <FormMessage className="mt-2" />
                      </div>

                      <FormField
                        control={form.control}
                        name="speakingStyle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-gray-300">Speaking Style</FormLabel>
                            <FormControl>
                              <select {...field} className="w-full p-2 bg-neutral-950 border-neutral-700 focus:ring-cyan-500 rounded">
                                <option value="formal">Formal</option>
                                <option value="casual">Casual</option>
                                <option value="energetic">Energetic</option>
                                <option value="mysterious">Mysterious</option>
                                <option value="friendly">Friendly</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="style" className="space-y-6">
                      <FormField
                        control={form.control}
                        name="visualStyle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-gray-300">Visual Style</FormLabel>
                            <FormControl>
                              <select {...field} className="w-full p-2 bg-neutral-950 border-neutral-700 focus:ring-cyan-500 rounded">
                                <option value="">Select a visual style</option>
                                {visualStyles.map((style) => (
                                  <option key={style} value={style}>{style}</option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold text-gray-300">Bio</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="A short, creative bio for your AI artist..."
                                className="min-h-[100px] bg-neutral-950 border-neutral-700 focus:ring-cyan-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    <TabsContent value="images" className="space-y-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Profile Image</h3>
                          <ImageUpload
                            onImageUpload={handleImageUploaded}
                            currentImage={generatedImage}
                            onRemoveImage={handleRemoveImage}
                            maxSize={5}
                          />
                        </div>

                        {uploadedImages.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Image Gallery</h3>
                            <ArtistGallery
                              images={uploadedImages}
                              canEdit={true}
                              onImageSelect={(image) => {
                                // Set as primary image
                                setGeneratedImage(image.url);
                                setUploadedImages(prev =>
                                  prev.map(img => ({
                                    ...img,
                                    isPrimary: img.id === image.id
                                  }))
                                );
                              }}
                              onSetPrimary={(imageId) => {
                                setGeneratedImage(uploadedImages.find(img => img.id === imageId)?.url || null);
                                setUploadedImages(prev =>
                                  prev.map(img => ({
                                    ...img,
                                    isPrimary: img.id === imageId
                                  }))
                                );
                              }}
                              onDeleteImage={(imageId) => {
                                setUploadedImages(prev => prev.filter(img => img.id !== imageId));
                                if (generatedImage === uploadedImages.find(img => img.id === imageId)?.url) {
                                  setGeneratedImage(null);
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="ai" className="space-y-6">
                      <div className="space-y-4">
                        <Button
                          type="button"
                          onClick={generateAIBio}
                          disabled={isGenerating}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating Bio...
                            </>
                          ) : (
                            <>
                              <Wand2 className="mr-2 h-4 w-4" />
                              Generate AI Bio
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          onClick={generateAIImage}
                          disabled={isGenerating}
                          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating Image...
                            </>
                          ) : (
                            <>
                              <Image className="mr-2 h-4 w-4" />
                              Generate AI Image
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg py-6">
                    Create Artist
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <Card className="bg-neutral-900/50 border-cyan-500/30 sticky top-8">
            <CardHeader>
              <CardTitle className="font-mono text-xl text-glow-cyan flex items-center gap-2">
                <Sparkles /> Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                {generatedImage ? (
                  <div className="relative">
                    <img
                      src={generatedImage}
                      alt="Artist preview"
                      className="w-48 h-48 rounded-full object-cover mx-auto shadow-lg shadow-cyan/20"
                    />
                    {uploadedImages.length > 0 && (
                      <div className="absolute -bottom-2 -right-2 bg-cyan-600 text-white text-xs px-2 py-1 rounded-full">
                        {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-full mx-auto bg-neutral-800 flex items-center justify-center">
                    <Skeleton className="w-full h-full rounded-full" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-cyan-400">
                    {form.watch('name') || 'Artist Name'}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {form.watch('genre') || 'Genre'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Personality Traits</h4>
                  <div className="flex flex-wrap gap-1">
                    {form.watch('personalityTraits')?.map((trait) => (
                      <Badge key={trait} variant="secondary" className="text-xs bg-cyan-900/30 text-cyan-300 border-cyan-700/50">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Visual Style</h4>
                  <p className="text-sm text-gray-300">
                    {form.watch('visualStyle') || 'Not specified'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Bio</h4>
                  <p className="text-sm text-gray-300 line-clamp-4">
                    {form.watch('bio') || 'No bio generated yet...'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Speaking Style</h4>
                  <Badge variant="outline" className="text-xs">
                    {form.watch('speakingStyle') || 'casual'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};