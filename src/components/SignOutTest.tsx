'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function SignOutTest() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignOut = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔄 Test: Starting sign out...');
      
      // Clear local storage first
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Test: Local storage cleared');
      }
      
      // Use Clerk's API directly
      console.log('🔄 Test: Calling Clerk signOut...');
      await signOut();
      console.log('✅ Test: Clerk signOut successful');
      
      setSuccess('Successfully signed out!');
      
      // Force redirect to sign-in page
      console.log('🔄 Test: Redirecting to sign-in...');
      setTimeout(() => {
        router.push('/sign-in');
        // Force page reload to ensure clean state
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
      }, 1000);
      
    } catch (err: any) {
      console.error('❌ Test: Sign out error:', err);
      setError(err.message || 'Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 bg-ml-dark-100 rounded-xl border border-ml-dark-300">
        <div className="flex items-center gap-3 text-ml-dark-400">
          <AlertCircle className="w-5 h-5" />
          <p>No user logged in. Please sign in first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-ml-dark-100 rounded-xl border border-ml-dark-300 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Sign Out Test</h2>
        <p className="text-ml-dark-400">Test the sign-out functionality</p>
      </div>

      {/* User Info */}
      <div className="bg-ml-dark-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-ml-blue-50 to-ml-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-medium">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-ml-dark-400 text-sm">{user.emailAddresses[0]?.emailAddress}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl mb-6">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-500/30 rounded-xl mb-6">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Signing Out...
          </>
        ) : (
          <>
            <LogOut className="w-5 h-5" />
            Test Sign Out
          </>
        )}
      </button>

      <div className="mt-4 text-center">
        <p className="text-ml-dark-400 text-sm">
          This will sign you out and redirect to the sign-in page
        </p>
      </div>
    </div>
  );
}
