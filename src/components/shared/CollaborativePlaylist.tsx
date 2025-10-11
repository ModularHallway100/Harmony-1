import React, { useState } from 'react';
import { useClerkUser } from '@/contexts/ClerkUserContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, UserPlus, Share2, Music } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
}

interface Collaborator {
  id: string;
  username: string;
  avatarUrl: string;
}

interface CollaborativePlaylist {
  id: string;
  name: string;
  description: string;
  owner: Collaborator;
  collaborators: Collaborator[];
  tracks: Track[];
  isPublic: boolean;
}

const CollaborativePlaylistPage: React.FC = () => {
  const { user: currentUser } = useClerkUser();
  const [playlist, setPlaylist] = useState<CollaborativePlaylist>({
    id: 'collab-playlist-1',
    name: 'Synthwave Collab',
    description: 'A collaborative playlist for synthwave lovers.',
    owner: { id: 'user-1', username: 'synthwave_lover', avatarUrl: 'https://i.pravatar.cc/150?u=synthwave_lover' },
    collaborators: [
      { id: 'user-2', username: 'beat_master', avatarUrl: 'https://i.pravatar.cc/150?u=beat_master' },
    ],
    tracks: [
      { id: 'track-1', title: 'Neon Dreams', artist: 'Neon Dreams' },
      { id: 'track-2', title: 'Digital Sunset', artist: 'Glitchard' },
    ],
    isPublic: true,
  });

  const [newTrack, setNewTrack] = useState('');

  const addTrack = () => {
    if (newTrack.trim()) {
      const track: Track = { id: `track-${Date.now()}`, title: newTrack, artist: 'Various Artists' };
      setPlaylist(prev => ({ ...prev, tracks: [...prev.tracks, track] }));
      setNewTrack('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{playlist.name}</CardTitle>
          <p className="text-gray-400">{playlist.description}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5" />
              <h3 className="font-semibold">Collaborators</h3>
            </div>
            <Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-2" /> Share</Button>
          </div>
          <div className="flex space-x-2 mb-6">
            {playlist.collaborators.map(c => (
              <Avatar key={c.id}>
                <AvatarImage src={c.avatarUrl} />
                <AvatarFallback>{c.username.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Music className="h-5 w-5" />
              <h3 className="font-semibold">Tracks</h3>
            </div>
          </div>
          <div className="space-y-2 mb-6">
            {playlist.tracks.map(track => (
              <div key={track.id} className="flex items-center justify-between p-2 rounded-md hover:bg-neutral-800">
                <div>
                  <p className="font-medium">{track.title}</p>
                  <p className="text-sm text-gray-400">{track.artist}</p>
                </div>
                <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <Input 
              value={newTrack}
              onChange={(e) => setNewTrack(e.target.value)}
              placeholder="Add a new track by name or URL"
            />
            <Button onClick={addTrack}><Plus className="h-4 w-4 mr-2" /> Add</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborativePlaylistPage;