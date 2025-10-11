import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Gift, Copy, Share2 } from 'lucide-react';

interface Referral {
  code: string;
  referrals: number;
  rewards: string[];
}

const ReferralSystem: React.FC = () => {
  const [referral, setReferral] = useState<Referral>({
    code: 'HARMONY2023',
    referrals: 12,
    rewards: ['1 month free premium', 'Exclusive track access'],
  });

  const copyCode = () => {
    navigator.clipboard.writeText(referral.code);
    // Add a toast notification here
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-6 w-6 mr-2" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Share your referral code with friends and earn rewards!
          </p>
          <div className="flex space-x-2 mb-4">
            <Input value={referral.code} readOnly />
            <Button onClick={copyCode} variant="outline"><Copy className="h-4 w-4 mr-2" /> Copy</Button>
            <Button><Share2 className="h-4 w-4 mr-2" /> Share</Button>
          </div>
          <div className="text-sm text-gray-400">
            <p><span className="font-bold">{referral.referrals}</span> successful referrals</p>
            <p>Your rewards: {referral.rewards.join(', ')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralSystem;