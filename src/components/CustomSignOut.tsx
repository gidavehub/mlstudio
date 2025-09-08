'use client';

import React, { useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, 
  User, 
  Settings, 
  HelpCircle, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react';

interface CustomSignOutProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function CustomSignOut({ isOpen, onClose, user }: CustomSignOutProps) {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('🔄 Starting sign out process...');
      
      // Clear local storage first
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Local storage cleared');
      }
      
      // Use Clerk's API directly
      console.log('🔄 Calling Clerk signOut...');
      await signOut();
      console.log('✅ Clerk signOut successful');
      
      // Close modal first
      onClose();
      
      // Force redirect to sign-in page
      console.log('🔄 Redirecting to sign-in...');
      router.push('/sign-in');
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
      }, 100);
      
    } catch (err: any) {
      console.error('❌ Sign out error:', err);
      setError(err.message || 'Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-gradient-to-br from-ml-dark-100 to-ml-dark-200 border border-ml-dark-300 rounded-2xl w-full max-w-md p-8 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <LogOut className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Sign Out</h2>
                <p className="text-ml-dark-400 text-sm">Are you sure you want to sign out?</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-ml-dark-400 hover:text-white hover:bg-ml-dark-300 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="bg-ml-dark-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-ml-blue-50 to-ml-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-ml-dark-400 text-sm">{user?.emailAddresses?.[0]?.emailAddress}</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-ml-dark-300 text-white rounded-xl hover:bg-ml-dark-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              Cancel
            </motion.button>
            
            <motion.button
              onClick={handleSignOut}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </>
              )}
            </motion.button>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
