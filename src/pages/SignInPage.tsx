import React from 'react';
import { SignIn } from '@clerk/clerk-sdk-react';
import { useNavigate } from 'react-router-dom';

const SignInPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAfterSignIn = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Harmony</h1>
          <p className="text-gray-400">Sign in to your account to continue</p>
        </div>
        <div className="bg-neutral-800 p-8 rounded-lg shadow-xl">
          <SignIn 
            afterSignInUrl="/"
            appearance={{
              baseTheme: {
                variables: {
                  colorPrimary: '#06b6d4',
                  colorBackground: '#1e293b',
                  colorText: '#e2e8f0',
                  colorInputBackground: '#334155',
                  colorInputText: '#e2e8f0',
                  colorInputBorder: '#475569',
                  colorInputBorderHover: '#06b6d4',
                }
              }
            }}
            routing="hash"
            redirectUrl="/"
            forceRedirectUrl="/"
          />
        </div>
        <div className="mt-6 text-center text-gray-400">
          <p>Don't have an account? {' '}
            <button 
              onClick={() => navigate('/sign-up')}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;