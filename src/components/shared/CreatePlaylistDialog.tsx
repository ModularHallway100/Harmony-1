import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLibraryStore } from '@/store/library-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ListMusic } from 'lucide-react';
const playlistFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.').max(50, 'Title must be 50 characters or less.'),
  description: z.string().max(150, 'Description must be 150 characters or less.').optional(),
});
type PlaylistFormValues = z.infer<typeof playlistFormSchema>;
interface CreatePlaylistDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}
const CreatePlaylistDialog: React.FC<CreatePlaylistDialogProps> = ({ isOpen, onOpenChange }) => {
  const createPlaylist = useLibraryStore((state) => state.createPlaylist);
  const form = useForm<PlaylistFormValues>({
    resolver: zodResolver(playlistFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });
  function onSubmit(data: PlaylistFormValues) {
    createPlaylist(data.title, data.description || '');
    form.reset();
    onOpenChange(false);
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-neutral-900 border-magenta-500/50 text-white">
        <DialogHeader>
          <DialogTitle className="font-mono text-2xl text-glow-magenta flex items-center gap-2">
            <ListMusic /> Create New Playlist
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            Give your new playlist a name and an optional description.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-gray-300">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Mix" {...field} className="bg-neutral-950 border-neutral-700 focus:ring-magenta-500" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-gray-300">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short description for your playlist..."
                      className="min-h-[80px] bg-neutral-950 border-neutral-700 focus:ring-magenta-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-magenta-600 hover:bg-magenta-700 text-white font-bold text-lg py-5">
              Create Playlist
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
export default CreatePlaylistDialog;