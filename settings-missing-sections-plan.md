# Missing Settings Sections Enhancement Plan

## Overview
This plan outlines the steps needed to add missing settings sections (Audio, Notifications, Privacy) to the Harmony settings page.

## Current Issues
1. Only 3 settings sections exist: Profile, Appearance, Account
2. Missing Audio settings for quality and device selection
3. No Notification preferences management
4. Privacy settings are completely absent
5. Incomplete user experience for comprehensive settings

## Implementation Plan

### 1. Audio Settings Section

#### File: `Harmony-1/src/pages/SettingsPage.tsx`

**New Audio Settings Component:**
```typescript
const AudioSettings: React.FC = () => {
  const [audioQuality, setAudioQuality] = useState('high');
  const [audioDevice, setAudioDevice] = useState('default');
  const [volume, setVolume] = useState(80);
  const [crossfade, setCrossfade] = useState(5);

  return (
    <Card className="bg-neutral-900/50 border-purple-500/30">
      <CardHeader>
        <CardTitle className="font-mono text-2xl text-glow-purple flex items-center gap-3">
          <Volume2 /> Audio
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Configure audio playback quality and devices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <FormLabel>Audio Quality</FormLabel>
          <Select value={audioQuality} onValueChange={setAudioQuality}>
            <SelectTrigger className="bg-neutral-950 border-neutral-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (96 kbps)</SelectItem>
              <SelectItem value="normal">Normal (160 kbps)</SelectItem>
              <SelectItem value="high">High (320 kbps)</SelectItem>
              <SelectItem value="lossless">Lossless</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <FormLabel>Audio Output Device</FormLabel>
          <Select value={audioDevice} onValueChange={setAudioDevice}>
            <SelectTrigger className="bg-neutral-950 border-neutral-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">System Default</SelectItem>
              <SelectItem value="headphones">Headphones</SelectItem>
              <SelectItem value="speakers">Speakers</SelectItem>
              <SelectItem value="bluetooth">Bluetooth Device</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <FormLabel>Volume: {volume}%</FormLabel>
          <Slider
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
            max={100}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Crossfade Duration: {crossfade}s</FormLabel>
          <Slider
            value={[crossfade]}
            onValueChange={(value) => setCrossfade(value[0])}
            max={10}
            step={1}
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
```

### 2. Notification Settings Section

**New Notification Settings Component:**
```typescript
const NotificationSettings: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [newReleases, setNewReleases] = useState(true);
  const [follows, setFollows] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [frequency, setFrequency] = useState('daily');

  return (
    <Card className="bg-neutral-900/50 border-orange-500/30">
      <CardHeader>
        <CardTitle className="font-mono text-2xl text-glow-orange flex items-center gap-3">
          <Bell /> Notifications
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Manage your notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <FormLabel>Email Notifications</FormLabel>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <FormLabel>Push Notifications</FormLabel>
              <p className="text-sm text-gray-500">Receive browser push notifications</p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-300">Notification Types</h4>
          
          <div className="flex items-center justify-between">
            <div>
              <FormLabel>New Releases</FormLabel>
              <p className="text-sm text-gray-500">Notify about new music releases</p>
            </div>
            <Switch
              checked={newReleases}
              onCheckedChange={setNewReleases}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <FormLabel>New Followers</FormLabel>
              <p className="text-sm text-gray-500">Notify when someone follows you</p>
            </div>
            <Switch
              checked={follows}
              onCheckedChange={setFollows}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <FormLabel>Promotions</FormLabel>
              <p className="text-sm text-gray-500">Receive promotional content</p>
            </div>
            <Switch
              checked={promotions}
              onCheckedChange={setPromotions}
            />
          </div>
        </div>

        <div className="space-y-2">
          <FormLabel>Email Frequency</FormLabel>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger className="bg-neutral-950 border-neutral-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Summary</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
```

### 3. Privacy Settings Section

**New Privacy Settings Component:**
```typescript
const PrivacySettings: React.FC = () => {
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [activityStatus, setActivityStatus] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);
  const [showListeningActivity, setShowListeningActivity] = useState(true);
  const [allowDownloads, setAllowDownloads] = useState(false);

  return (
    <Card className="bg-neutral-900/50 border-green-500/30">
      <CardHeader>
        <CardTitle className="font-mono text-2xl text-glow-green flex items-center gap-3">
          <Shield /> Privacy
        </CardTitle>
        <CardDescription className="text-neutral-400">
          Control your privacy and data sharing preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <FormLabel>Profile Visibility</FormLabel>
          <Select value={profileVisibility} onValueChange={setProfileVisibility}>
            <SelectTrigger className="bg-neutral-950 border-neutral-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
              <SelectItem value="friends">Friends Only - Only connections can see</SelectItem>
              <SelectItem value="private">Private - Only you can see</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-300">Activity Settings</h4>
          
          <div className="flex items-center justify-between">
            <div>
              <FormLabel>Show Activity Status</FormLabel>
              <p className="text-sm text-gray-500">Let others see when you're online</p>
            </div>
            <Switch
              checked={activityStatus}
              onCheckedChange={setActivityStatus}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <FormLabel>Show Listening Activity</FormLabel>
              <p className="text-sm text-gray-500">Display what you're listening to</p>
            </div>
            <Switch
              checked={showListeningActivity}
              onCheckedChange={setShowListeningActivity}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-300">Data & Analytics</h4>
          
          <div className="flex items-center justify-between">
            <div>
              <FormLabel>Allow Data Collection</FormLabel>
              <p className="text-sm text-gray-500">Help improve our service with anonymous usage data</p>
            </div>
            <Switch
              checked={dataCollection}
              onCheckedChange={setDataCollection}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <FormLabel>Allow Track Downloads</FormItem>
              <p className="text-sm text-gray-500">Allow others to download your uploaded tracks</p>
            </div>
            <Switch
              checked={allowDownloads}
              onCheckedChange={setAllowDownloads}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-700">
          <Button variant="outline" className="text-orange-400 border-orange-500/50 hover:bg-orange-500/10">
            Download My Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

### 4. Update Main Settings Page Layout

**Enhanced Settings Page Structure:**
```typescript
export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-5xl font-mono font-bold text-glow-magenta">Settings</h1>
        <p className="mt-2 text-lg text-gray-400">Manage your account and preferences.</p>
      </header>

      <div className="space-y-8">
        {/* Existing sections */}
        <ProfileSection />
        <AppearanceSection />
        
        {/* New sections */}
        <AudioSettings />
        <NotificationSettings />
        <PrivacySettings />
        
        {/* Account section */}
        <AccountSection />
      </div>
    </div>
  );
};
```

### 5. Add Required Icons

**Import Updates:**
```typescript
// Add to existing imports
import { 
  Volume2, 
  Bell, 
  Shield, 
  Download,
  Headphones,
  Speaker,
  Smartphone
} from 'lucide-react';
```

## Implementation Steps

### Phase 1: Audio Settings
1. Create AudioSettings component
2. Add form controls for quality, device, volume
3. Implement crossfade settings
4. Add proper validation and persistence

### Phase 2: Notification Settings
1. Create NotificationSettings component
2. Add notification type toggles
3. Implement frequency settings
4. Add notification preferences API

### Phase 3: Privacy Settings
1. Create PrivacySettings component
2. Add profile visibility options
3. Implement activity controls
4. Add data management features

### Phase 4: Integration & Testing
1. Integrate all new sections
2. Update main settings layout
3. Test all functionality
4. Add responsive design

## Expected Outcome
- Comprehensive settings page with 6 main sections
- Audio quality and device management
- Complete notification preferences system
- Full privacy controls and data management
- Consistent UI/UX with existing sections
- Proper form validation and persistence

## Dependencies
- Existing Radix UI components (Select, Switch, Slider)
- Lucide React icons
- Zustand for state management
- Hono API for backend endpoints

## Timeline
- Phase 1: 25-35 minutes
- Phase 2: 20-30 minutes
- Phase 3: 25-35 minutes
- Phase 4: 20-30 minutes
- Total: 90-130 minutes