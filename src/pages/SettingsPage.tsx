import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import SubscriptionManagement from '@/components/shared/SubscriptionManagement';
import PremiumFeaturesDashboard from '@/components/shared/PremiumFeaturesDashboard';
import { User, Palette, Shield, Trash2, CreditCard, Crown } from 'lucide-react';
const profileFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.').max(20),
  email: z.string().email('Please enter a valid email.'),
  bio: z.string().max(160, 'Bio must be 160 characters or less.').optional(),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;
export const SettingsPage: React.FC = () => {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: 'SynthRider',
      email: 'synth.rider@retrowave.ai',
      bio: 'Just a user navigating the digital soundscape.',
    },
  });
  function onSubmit(data: ProfileFormValues) {
    console.log('Profile updated:', data);
    // In a real app, you'd call an API here.
  }
  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-5xl font-mono font-bold text-glow-magenta">Settings</h1>
        <p className="mt-2 text-lg text-gray-400">Manage your account and preferences.</p>
      </header>
      <div className="space-y-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="premium">Premium Features</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-8">
            <Card className="bg-neutral-900/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="font-mono text-2xl text-glow-cyan flex items-center gap-3"><User /> Profile</CardTitle>
            <CardDescription className="text-neutral-400">This is how others will see you on the site.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="username" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl><Input {...field} className="bg-neutral-950 border-neutral-700" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} className="bg-neutral-950 border-neutral-700" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl><Textarea {...field} className="bg-neutral-950 border-neutral-700" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold">Save Changes</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900/50 border-lime-500/30">
          <CardHeader>
            <CardTitle className="font-mono text-2xl text-glow-lime flex items-center gap-3"><Palette /> Appearance</CardTitle>
            <CardDescription className="text-neutral-400">Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <FormLabel>Theme</FormLabel>
              <ThemeSwitcher />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900/50 border-magenta-500/30">
          <CardHeader>
            <CardTitle className="font-mono text-2xl text-glow-magenta flex items-center gap-3"><Shield /> Account</CardTitle>
            <CardDescription className="text-neutral-400">Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="border-neutral-600 hover:bg-neutral-800">Change Password</Button>
            <Separator className="bg-neutral-700" />
            <div className="space-y-2">
              <h3 className="font-semibold text-red-400">Danger Zone</h3>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="bg-red-800/50 text-red-300 border border-red-500/50 hover:bg-red-800/80 hover:text-red-200">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-neutral-900 border-red-500/50 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-neutral-400">
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
          </TabsContent>
          
          <TabsContent value="subscription" className="space-y-8">
            <SubscriptionManagement />
          </TabsContent>
          
          <TabsContent value="premium" className="space-y-8">
            <PremiumFeaturesDashboard />
          </TabsContent>
          
          <TabsContent value="account" className="space-y-8">
            <Card className="bg-neutral-900/50 border-magenta-500/30">
              <CardHeader>
                <CardTitle className="font-mono text-2xl text-glow-magenta flex items-center gap-3"><Shield /> Account</CardTitle>
                <CardDescription className="text-neutral-400">Manage your account settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="border-neutral-600 hover:bg-neutral-800">Change Password</Button>
                <Separator className="bg-neutral-700" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-red-400">Danger Zone</h3>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="bg-red-800/50 text-red-300 border border-red-500/50 hover:bg-red-800/80 hover:text-red-200">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-neutral-900 border-red-500/50 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                          This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default SettingsPage;