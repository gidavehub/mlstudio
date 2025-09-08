'use client';

import React, { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  AlertCircle,
  CheckCircle,
  Loader2,
  User
} from 'lucide-react';

interface CustomSignUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function CustomSignUp({ isOpen, onClose, onSwitchToSignIn }: CustomSignUpProps) {
  const { signUp, setActive, isLoaded } = useSignUp();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  const handleGoogleSignUp = async () => {
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Try Clerk's OAuth for Google
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/dashboard',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err: any) {
      console.error('Google sign up error:', err);
      
      // Check if it's a configuration error
      if (err.errors?.[0]?.code === 'oauth_provider_not_configured') {
        setError('Google OAuth is not configured. Please contact support or use email/password sign-up.');
      } else if (err.errors?.[0]?.code === 'oauth_provider_disabled') {
        setError('Google OAuth is currently disabled. Please use email/password sign-up.');
      } else {
        setError('Google sign up failed. Please try again or use email/password sign-up.');
      }
      
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password: password,
      });

      if (result.status === 'missing_requirements') {
        setPendingVerification(true);
        setSuccess('Please check your email for verification code');
      } else if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setSuccess('Account created successfully!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.errors?.[0]?.message || 'An error occurred during sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    setError('');

    try {
      // Use Clerk's API directly for verification
      const result = await signUp.attemptEmailAddressVerification({
        code: code,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setSuccess('Email verified successfully!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.errors?.[0]?.message || 'An error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    setError('');

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setSuccess('Verification code sent! Please check your email.');
    } catch (err: any) {
      console.error('Resend error:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPendingVerification(false);
    setCode('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-ml-dark-100 border border-ml-dark-300 rounded-lg w-full max-w-md p-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ml-blue-50 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {pendingVerification ? 'Verify Email' : 'Create Account'}
                </h2>
                <p className="text-ml-dark-400 text-sm">
                  {pendingVerification ? 'Enter the verification code sent to your email' : 'Join MLStudio today'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Verification Form */}
          {pendingVerification ? (
            <form onSubmit={handleVerification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 bg-ml-dark-200 border border-ml-dark-300 rounded-lg text-white placeholder-ml-dark-400 focus:outline-none focus:ring-2 focus:ring-ml-blue-50 focus:border-transparent text-center text-lg tracking-widest"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <motion.div
                  className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {success && (
                <motion.div
                  className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-green-400 text-sm">{success}</p>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isLoading || !code}
                className="w-full flex items-center justify-center gap-2 py-3 bg-ml-blue-50 text-white rounded-lg hover:bg-ml-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Verify Email
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            <>
              {/* Google Sign Up Button */}
              <motion.button
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg mb-6"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing up with Google...
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

              {/* Sign Up Form */}
              <form onSubmit={handleSignUp} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ml-dark-400" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-ml-dark-200 border border-ml-dark-300 rounded-lg text-white placeholder-ml-dark-400 focus:outline-none focus:ring-2 focus:ring-ml-blue-50 focus:border-transparent"
                      placeholder="First name"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ml-dark-400" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-ml-dark-200 border border-ml-dark-300 rounded-lg text-white placeholder-ml-dark-400 focus:outline-none focus:ring-2 focus:ring-ml-blue-50 focus:border-transparent"
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ml-dark-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-ml-dark-200 border border-ml-dark-300 rounded-lg text-white placeholder-ml-dark-400 focus:outline-none focus:ring-2 focus:ring-ml-blue-50 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ml-dark-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-ml-dark-200 border border-ml-dark-300 rounded-lg text-white placeholder-ml-dark-400 focus:outline-none focus:ring-2 focus:ring-ml-blue-50 focus:border-transparent"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ml-dark-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ml-dark-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-ml-dark-200 border border-ml-dark-300 rounded-lg text-white placeholder-ml-dark-400 focus:outline-none focus:ring-2 focus:ring-ml-blue-50 focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ml-dark-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Success Message */}
              {success && (
                <motion.div
                  className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/30 rounded-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-green-400 text-sm">{success}</p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading || !firstName || !lastName || !email || !password || !confirmPassword}
                className="w-full flex items-center justify-center gap-2 py-3 bg-ml-blue-50 text-white rounded-lg hover:bg-ml-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </motion.button>
            </form>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-ml-dark-400 text-sm">
              {pendingVerification ? (
                <>
                  Didn't receive the code?{' '}
                  <button 
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="text-ml-blue-50 hover:text-ml-blue-100 font-medium disabled:opacity-50"
                  >
                    Resend
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button 
                    onClick={onSwitchToSignIn}
                    className="text-ml-blue-50 hover:text-ml-blue-100 font-medium"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
