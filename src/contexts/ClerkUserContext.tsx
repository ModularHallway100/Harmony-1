import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, SignedIn, SignedOut } from '@clerk/clerk-sdk-react';
import { useUser, useAuth } from '@clerk/clerk-sdk-react';
import { useSyncClerkUser } from '@/store/user-store';

interface ClerkUserContextType {
  user: User | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  signOut: () => void;
}

const ClerkUserContext = createContext<ClerkUserContextType | undefined>(undefined);

export const ClerkUserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSignedIn, isLoaded, signOut } = useUser();
  const { getToken } = useAuth();
  const [clerkToken, setClerkToken] = useState<string | null>(null);
  const { isSyncing } = useSyncClerkUser();

  useEffect(() => {
    const fetchToken = async () => {
      if (isSignedIn && isLoaded) {
        try {
          const token = await getToken();
          setClerkToken(token);
        } catch (error) {
          console.error('Error fetching Clerk token:', error);
        }
      }
    };

    fetchToken();
  }, [isSignedIn, isLoaded, getToken]);

  const contextValue: ClerkUserContextType = {
    user: user || null,
    isSignedIn,
    isLoaded: isLoaded && !isSyncing,
    signOut,
  };

  return (
    <ClerkUserContext.Provider value={contextValue}>
      {children}
    </ClerkUserContext.Provider>
  );
};

export const useClerkUser = () => {
  const context = useContext(ClerkUserContext);
  if (context === undefined) {
    throw new Error('useClerkUser must be used within a ClerkUserProvider');
  }
  return context;
};

export const ClerkAuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <SignedIn>
        <ClerkUserProvider>
          {children}
        </ClerkUserProvider>
      </SignedIn>
      <SignedOut>
        <div className="flex items-center justify-center min-h-screen bg-neutral-900">
          <div className="text-center p-8 bg-neutral-800 rounded-lg max-w-md">
            <h1 className="text-2xl font-bold text-white mb-4">Welcome to Harmony</h1>
            <p className="text-gray-300 mb-6">Please sign in to continue</p>
          </div>
        </div>
      </SignedOut>
    </>
  );
};