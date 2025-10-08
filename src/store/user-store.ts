import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useClerkUser } from '@/contexts/ClerkUserContext';

interface UserState {
  userId: string | null;
  clerkUserId: string | null;
  username: string | null;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  userType: 'listener' | 'creator' | 'both' | null;
  isLoading: boolean;
  error: string | null;
  
  // Set user data
  setUser: (userData: {
    userId: string;
    clerkUserId: string;
    username: string;
    email: string;
    fullName: string;
    avatarUrl: string;
    bio: string;
    userType: 'listener' | 'creator' | 'both';
  }) => void;
  
  // Clear user data
  clearUser: () => void;
  
  // Set loading state
  setLoading: (loading: boolean) => void;
  
  // Set error
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      clerkUserId: null,
      username: null,
      email: null,
      fullName: null,
      avatarUrl: null,
      bio: null,
      userType: null,
      isLoading: false,
      error: null,
      
      setUser: (userData) => {
        set({
          userId: userData.userId,
          clerkUserId: userData.clerkUserId,
          username: userData.username,
          email: userData.email,
          fullName: userData.fullName,
          avatarUrl: userData.avatarUrl,
          bio: userData.bio,
          userType: userData.userType,
          isLoading: false,
          error: null,
        });
      },
      
      clearUser: () => {
        set({
          userId: null,
          clerkUserId: null,
          username: null,
          email: null,
          fullName: null,
          avatarUrl: null,
          bio: null,
          userType: null,
          isLoading: false,
          error: null,
        });
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'retrowave-user-storage',
      partialize: (state) => ({
        userId: state.userId,
        clerkUserId: state.clerkUserId,
        username: state.username,
        email: state.email,
        fullName: state.fullName,
        avatarUrl: state.avatarUrl,
        bio: state.bio,
        userType: state.userType,
      }),
    }
  )
);

// Hook to sync Clerk user with our store
export const useSyncClerkUser = () => {
  const { user, isSignedIn, isLoaded } = useClerkUser();
  const setUser = useUserStore((state) => state.setUser);
  const setLoading = useUserStore((state) => state.setLoading);
  const setError = useUserStore((state) => state.setError);
  
  React.useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setLoading(true);
      
      // Format user data from Clerk
      const userData = {
        userId: user.id, // This will be replaced with our database user ID
        clerkUserId: user.id,
        username: user.username || user.emailAddresses[0]?.emailAddress?.split('@')[0] || '',
        email: user.emailAddresses[0]?.emailAddress || '',
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || '',
        avatarUrl: user.imageUrl || null,
        bio: '', // Will be fetched from our API
        userType: 'listener' as const, // Default, will be updated from our API
      };
      
      setUser(userData);
      setLoading(false);
    } else if (isLoaded && !isSignedIn) {
      useUserStore.getState().clearUser();
    }
  }, [isSignedIn, isLoaded, user, setUser, setLoading]);
  
  return { isSyncing: !isLoaded };
};