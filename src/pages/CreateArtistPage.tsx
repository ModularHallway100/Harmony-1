import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useLibraryStore } from '@/store/library-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot } from 'lucide-react';
const artistFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50, 'Name must be 50 characters or less.'),
  bio: z.string().min(10, 'Bio must be at least 10 characters.').max(300, 'Bio must be 300 characters or less.'),
  genre: z.string().min(2, 'Genre must be at least 2 characters.').max(30, 'Genre must be 30 characters or less.'),
});
type ArtistFormValues = z.infer<typeof artistFormSchema>;
export const CreateArtistPage: React.FC = () => {
  const navigate = useNavigate();
  const addArtist = useLibraryStore((state) => state.addArtist);
  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistFormSchema),
    defaultValues: {
      name: '',
      bio: '',
      genre: '',
    },
  });
  function onSubmit(data: ArtistFormValues) {
    addArtist(data);
    // Ideally, show a success toast here
    navigate('/library');
  }
  return (
    <div className="max-w-2xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-mono font-bold text-glow-cyan">Create AI Artist</h1>
        <p className="mt-4 text-lg text-gray-400">
          Generate your own unique AI artist persona to associate with your tracks.
        </p>
      </header>
      <Card className="bg-neutral-900/50 border-cyan-500/30">
        <CardHeader>
          <CardTitle className="font-mono text-2xl text-glow-cyan flex items-center gap-2">
            <Bot /> New Persona Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg py-6">
                Create Artist
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};