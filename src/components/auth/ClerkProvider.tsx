import React from 'react';
import { ClerkProvider } from '@clerk/clerk-sdk-react';
import { dark } from '@clerk/themes';

interface ClerkProviderProps {
  children: React.ReactNode;
}

const ClerkProviderComponent: React.FC<ClerkProviderProps> = ({ children }) => {
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!clerkPubKey) {
    throw new Error('Clerk publishable key is not defined in environment variables');
  }

  return (
    <ClerkProvider 
      publishableKey={clerkPubKey}
      afterSignOutUrl="/"
      afterSignInUrl="/"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#06b6d4',
          colorBackground: '#0f172a',
          colorText: '#e2e8f0',
          colorInputBackground: '#1e293b',
          colorInputText: '#e2e8f0',
          colorInputBorder: '#334155',
          colorInputBorderHover: '#06b6d4',
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
};

export default ClerkProviderComponent;