'use client';

import React, { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';

interface CustomSignInProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp?: () => void;
}

export default function CustomSignIn({ isOpen, onClose, onSwitchToSignUp }: CustomSignInProps) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Use Clerk's API directly
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setSuccess('Successfully signed in!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      } else {
        setError('Sign in failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.errors?.[0]?.message || 'An error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Try Clerk's OAuth for Google
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/dashboard',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err: any) {
      console.error('Google sign in error:', err);
      
      // Check if it's a configuration error
      if (err.errors?.[0]?.code === 'oauth_provider_not_configured') {
        setError('Google OAuth is not configured. Please contact support or use email/password sign-in.');
      } else if (err.errors?.[0]?.code === 'oauth_provider_disabled') {
        setError('Google OAuth is currently disabled. Please use email/password sign-in.');
      } else {
        setError('Google sign in failed. Please try again or use email/password sign-in.');
      }
      
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
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
              <div className="w-12 h-12 bg-gradient-to-br from-ml-blue-50 to-ml-blue-100 rounded-xl flex items-center justify-center shadow-lg">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                <p className="text-ml-dark-400 text-sm">Sign in to your MLStudio account</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-ml-dark-400 hover:text-white hover:bg-ml-dark-300 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Google Sign In Button */}
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg mb-6"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in with Google...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-ml-dark-300"></div>
            <span className="px-4 text-ml-dark-400 text-sm">or</span>
            <div className="flex-1 border-t border-ml-dark-300"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ml-dark-400 group-focus-within:text-ml-blue-50 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-ml-dark-200 border border-ml-dark-300 rounded-xl text-white placeholder-ml-dark-400 focus:outline-none focus:ring-2 focus:ring-ml-blue-50 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ml-dark-400 group-focus-within:text-ml-blue-50 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-4 bg-ml-dark-200 border border-ml-dark-300 rounded-xl text-white placeholder-ml-dark-400 focus:outline-none focus:ring-2 focus:ring-ml-blue-50 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-ml-dark-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-500/30 rounded-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-400 text-sm">{success}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-ml-blue-50 to-ml-blue-100 text-white rounded-xl hover:from-ml-blue-100 hover:to-ml-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-ml-dark-400 text-sm">
              Don't have an account?{' '}
              <button 
                onClick={() => {
                  onSwitchToSignUp?.();
                }}
                className="text-ml-blue-50 hover:text-ml-blue-100 font-medium transition-colors"
              >
                Create one here
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
