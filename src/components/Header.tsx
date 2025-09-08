"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Bell, Settings, LogOut, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      console.log('🔄 Header: Starting sign out...');
      
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Header: Local storage cleared');
      }
      
      // Sign out from Clerk
      console.log('🔄 Header: Calling Clerk signOut...');
      await signOut();
      console.log('✅ Header: Clerk signOut successful');
      
      // Redirect to sign-in page
      console.log('🔄 Header: Redirecting to sign-in...');
      router.push('/sign-in');
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Header: Sign out error:', error);
      // Still try to redirect even if there's an error
      router.push('/sign-in');
    }
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-ml-dark-100/80 backdrop-blur-sm border-b border-ml-dark-300">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div>
          <h2 className="text-xl font-semibold text-white">MLStudio</h2>
          <p className="text-sm text-ml-dark-400">Professional ML Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded-md transition-colors">
          <Bell size={20} />
        </button>
        
        <button className="p-2 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded-md transition-colors">
          <Settings size={20} />
        </button>
        
        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded-md transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-ml-dark-300 flex items-center justify-center">
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user.fullName || "User"} 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              )}
            </div>
            <ChevronDown size={16} className={`transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showUserMenu && (
              <motion.div
                className="absolute right-0 top-full mt-2 w-64 bg-ml-dark-100 border border-ml-dark-300 rounded-lg shadow-lg z-50"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {/* User Info */}
                <div className="p-4 border-b border-ml-dark-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-ml-dark-300 flex items-center justify-center">
                      {user?.imageUrl ? (
                        <img 
                          src={user.imageUrl} 
                          alt={user.fullName || "User"} 
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <span className="text-white font-semibold text-lg">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user?.fullName || "User"}</p>
                      <p className="text-ml-dark-400 text-sm">{user?.emailAddresses?.[0]?.emailAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded-lg transition-colors">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile</span>
                  </button>
                  
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  
                  <div className="border-t border-ml-dark-300 my-2"></div>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
