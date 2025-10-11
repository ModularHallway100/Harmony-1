import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Trophy, Users, Clock } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'remix' | 'production' | 'vocal';
  prize: string;
  endDate: string;
  participants: number;
  isCompleted: boolean;
}

const ChallengesAndContests: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 'challenge-1',
      title: 'Neon Dreams Remix Contest',
      description: 'Remix the latest track from Neon Dreams and win a feature on their next album.',
      type: 'remix',
      prize: 'Feature on Album',
      endDate: '2023-12-31',
      participants: 128,
      isCompleted: false,
    },
    {
      id: 'challenge-2',
      title: 'Synthwave Production Challenge',
      description: 'Create an original synthwave track using our sample pack.',
      type: 'production',
      prize: '$500 Cash Prize',
      endDate: '2023-11-30',
      participants: 256,
      isCompleted: false,
    },
  ]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Challenges & Contests</h1>
        <Button>Create Challenge</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {challenges.map(challenge => (
          <Card key={challenge.id}>
            <CardHeader>
              <CardTitle className="flex justify-between">
                {challenge.title}
                <Trophy className="h-6 w-6 text-yellow-400" />
              </CardTitle>
              <p className="text-sm text-gray-400">{challenge.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm text-gray-400">
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  <span>{challenge.prize}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{challenge.participants} participants</span>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <Clock className="h-4 w-4 mr-2" />
                <span>Ends on {challenge.endDate}</span>
              </div>
              <Button className="w-full mt-4">
                {challenge.isCompleted ? 'View Results' : 'Join Challenge'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChallengesAndContests;