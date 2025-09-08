'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw, ExternalLink } from 'lucide-react';

export default function OAuthDebugger() {
  const { signIn, signUp } = useClerk();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const checkOAuthConfiguration = async () => {
    setIsLoading(true);
    setResults([]);

    const checks = [
      {
        name: 'Clerk Instance Check',
        test: async () => {
          if (!signIn || !signUp) {
            throw new Error('Clerk hooks not loaded');
          }
          return 'Clerk instance loaded successfully';
        }
      },
      {
        name: 'Google OAuth Strategy Check',
        test: async () => {
          try {
            // Try to create a sign-in attempt with Google OAuth
            const result = await signIn.create({
              strategy: 'oauth_google',
              redirectUrl: '/dashboard',
            });
            return 'Google OAuth strategy is available';
          } catch (err: any) {
            if (err.errors?.[0]?.code === 'oauth_provider_not_configured') {
              throw new Error('Google OAuth is not configured in Clerk Dashboard');
            } else if (err.errors?.[0]?.code === 'oauth_provider_disabled') {
              throw new Error('Google OAuth is disabled in Clerk Dashboard');
            } else {
              throw new Error(`OAuth error: ${err.errors?.[0]?.message || err.message}`);
            }
          }
        }
      },
      {
        name: 'Environment Variables Check',
        test: async () => {
          const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
          if (!publishableKey) {
            throw new Error('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY not found');
          }
          if (!publishableKey.includes('pk_')) {
            throw new Error('Invalid Clerk publishable key format');
          }
          return `Clerk publishable key found: ${publishableKey.substring(0, 20)}...`;
        }
      }
    ];

    const results = [];
    for (const check of checks) {
      try {
        const result = await check.test();
        results.push({
          name: check.name,
          status: 'success',
          message: result
        });
      } catch (error: any) {
        results.push({
          name: check.name,
          status: 'error',
          message: error.message
        });
      }
    }

    setResults(results);
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'success') {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    } else {
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'success') {
      return 'bg-green-900/20 border-green-500/30';
    } else {
      return 'bg-red-900/20 border-red-500/30';
    }
  };

  return (
    <div className="p-6 bg-ml-dark-100 rounded-xl border border-ml-dark-300 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">OAuth Configuration Debugger</h2>
        <p className="text-ml-dark-400">Check your Google OAuth setup</p>
      </div>

      {/* Current User Info */}
      {user && (
        <div className="bg-ml-dark-200 rounded-lg p-4 mb-6">
          <h3 className="text-white font-medium mb-2">Current User</h3>
          <div className="text-sm text-ml-dark-400">
            <p><strong>Name:</strong> {user.fullName}</p>
            <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
            <p><strong>Sign-in Method:</strong> {user.externalAccounts.length > 0 ? 'OAuth' : 'Email/Password'}</p>
          </div>
        </div>
      )}

      {/* Run Diagnostics Button */}
      <div className="text-center mb-6">
        <button
          onClick={checkOAuthConfiguration}
          disabled={isLoading}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-ml-blue-50 to-ml-blue-100 text-white rounded-xl hover:from-ml-blue-100 hover:to-ml-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg mx-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Run OAuth Diagnostics
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-white font-medium">Diagnostic Results</h3>
          {results.map((result, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-xl border ${getStatusColor(result.status)}`}
            >
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <h4 className="text-white font-medium">{result.name}</h4>
                <p className="text-sm text-ml-dark-400 mt-1">{result.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Links */}
      <div className="mt-8 p-4 bg-ml-dark-200 rounded-lg">
        <h3 className="text-white font-medium mb-3">Need Help?</h3>
        <div className="space-y-2 text-sm">
          <a
            href="https://clerk.com/docs/authentication/social-connections/google"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-ml-blue-50 hover:text-ml-blue-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Clerk Google OAuth Documentation
          </a>
          <a
            href="https://console.cloud.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-ml-blue-50 hover:text-ml-blue-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Google Cloud Console
          </a>
          <a
            href="https://dashboard.clerk.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-ml-blue-50 hover:text-ml-blue-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Clerk Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
