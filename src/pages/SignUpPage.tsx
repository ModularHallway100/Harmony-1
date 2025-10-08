import React from 'react';
import { SignUp } from '@clerk/clerk-sdk-react';
import { useNavigate } from 'react-router-dom';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const handleAfterSignUp = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Join Harmony</h1>
          <p className="text-gray-400">Create an account to start exploring music</p>
        </div>
        <div className="bg-neutral-800 p-8 rounded-lg shadow-xl">
          <SignUp 
            afterSignUpUrl="/"
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
          <p>Already have an account? {' '}
            <button 
              onClick={() => navigate('/sign-in')}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;