'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import DataPreprocessor, { DataStep, ProcessedData, DataVisualizer } from "@/lib/dataProcessing";
import { ImageProcessor, ImageData } from "@/lib/imageProcessing";
import { FlexibleDataProcessor, DataType } from "@/lib/flexibleDataProcessor";
import { useConvexAuth } from "@/lib/convex";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import CustomSignIn from "./CustomSignIn";
import CustomSignOut from "./CustomSignOut";
import CustomSignUp from "./CustomSignUp";
import Pipelines from "./Pipelines";
import ModelTraining from "./ModelTraining";
import TrainingDebugger from "./TrainingDebugger";
import APIManagement from "./APIManagement";
import ApiBillingDashboard from "./ApiBillingDashboard";
import DataBrowser from "./DataBrowser";
import DataUploader from "./DataUploader";
import ValidationDashboard from "./ValidationDashboard";
import RewardTracker from "./RewardTracker";
import BlockchainIntegration from "./BlockchainIntegration";
import RealBlockchainIntegration from "./RealBlockchainIntegration";
import DataMarketplace from "./DataMarketplace";
import DataContributionCenter from "./DataContributionCenter";
import KaleIntegration from "./KaleIntegration";
import ReflectorIntegration from "./ReflectorIntegration";
import CustomTokenWallet from "./CustomTokenWallet";
import CustomDataMarketplace from "./CustomDataMarketplace";
import CustomContributionCenter from "./CustomContributionCenter";
import AppOverview from "./AppOverview";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, BarChart3, Settings, Play, Save, Download, 
  Filter, Search, Grid, List, Eye, Edit3, Trash2, Plus, Minus,
  TrendingUp, Network, BrainCircuit, Layers, FileText, Maximize, Minimize,
  CheckCircle, Circle, AlertCircle, Info, Upload, RotateCcw, Zap, X,
  Home, Users, Activity, Zap as ZapIcon, ChevronRight, ChevronDown,
  FolderOpen, FileText as FileIcon, Clock, Star, MoreHorizontal, Key,
  HelpCircle, LogOut, LogIn, DollarSign
} from "lucide-react";
// Temporarily disabled Recharts due to syntax error
// import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, ScatterChart, Scatter, CartesianGrid } from "recharts";
import Image from "next/image";

type ActiveTab = 'overview' | 'datasets' | 'models' | 'pipelines' | 'deployments' | 'analytics' | 'data-marketplace' | 'contribute' | 'validation' | 'rewards' | 'blockchain' | 'api-management' | 'api-billing' | 'kale-integration' | 'reflector-integration';
type ModalType = 'dataset-workbench' | 'model-builder' | 'pipeline-editor' | 'training-debugger' | null;

export default function EnterpriseDashboard() {
  const auth = useConvexAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedDataset, setSelectedDataset] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAPIManagement, setShowAPIManagement] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  const handleSignInClick = () => {
    setShowSignIn(true);
  };

  const handleSwitchToSignUp = () => {
    console.log('🔄 Switching to sign up modal');
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleSwitchToSignIn = () => {
    console.log('🔄 Switching to sign in modal');
    setShowSignUp(false);
    setShowSignIn(true);
  };

  // Create user in Convex if they don't exist
  const upsertUser = useMutation(api.users.upsertUser);
  
  useEffect(() => {
    if (auth?.isSignedIn && user && auth?.userId) {
      // Create or update user in Convex
      upsertUser({
        clerkId: auth.userId,
        email: user.primaryEmailAddress?.emailAddress || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: 'user'
      }).catch(console.error);
    }
  }, [auth?.isSignedIn, user, auth?.userId, upsertUser]);

  // Convex queries with safety checks
  const datasets = useQuery(api.datasets.getMyDatasets, auth?.isSignedIn ? {} : "skip");
  const pipelines = useQuery(api.pipelines.getMyPipelines, auth?.isSignedIn ? {} : "skip");
  const trainingJobs = useQuery(api.training.getMyTrainingJobs, auth?.isSignedIn ? {} : "skip");

  const openDatasetWorkbench = useCallback((dataset: any) => {
    setSelectedDataset(dataset);
    setActiveModal('dataset-workbench');
  }, []);


  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedDataset(null);
  }, []);

  // Listen for custom event to open training debugger
  useEffect(() => {
    const handleOpenTrainingDebugger = () => {
      setActiveModal('training-debugger');
    };

    window.addEventListener('openTrainingDebugger', handleOpenTrainingDebugger);
    
    return () => {
      window.removeEventListener('openTrainingDebugger', handleOpenTrainingDebugger);
    };
  }, []);


  // Safety check for auth
  if (!auth || !auth.isLoaded) {
    return (
      <div className="h-screen bg-ml-dark-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ml-blue-50 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ml-dark-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-ml-dark-50 flex overflow-hidden">
      {/* Sidebar */}
      <motion.div
        className={`bg-ml-dark-100 border-r border-ml-dark-300 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="p-4 border-b border-ml-dark-300">
          <div className="flex items-center gap-3">
            <div className="bg-sky-200 p-2 rounded-lg">
              <Image 
                src="/logo.png" 
                alt="ML Studio Logo" 
                width={128} 
                height={128} 
                style={{ width: 'auto', height: 'auto' }}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          <div className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: Home },
              { id: 'datasets', label: 'Datasets', icon: Database },
              { id: 'models', label: 'Models', icon: BrainCircuit },
              { id: 'pipelines', label: 'Pipelines', icon: Network },
              { id: 'deployments', label: 'Deployments', icon: Activity },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'data-marketplace', label: 'Data Marketplace', icon: Search },
              { id: 'contribute', label: 'Contribute Data', icon: Upload },
              { id: 'validation', label: 'Validation', icon: CheckCircle },
              { id: 'rewards', label: 'Rewards', icon: Star },
              { id: 'blockchain', label: 'Blockchain', icon: Zap },
              { id: 'kale-integration', label: 'KALE Integration', icon: Zap },
              { id: 'reflector-integration', label: 'Reflector Pricing', icon: TrendingUp },
              { id: 'api-billing', label: 'API Billing', icon: DollarSign },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-ml-blue-50 text-white'
                      : 'text-ml-dark-400 hover:text-white hover:bg-ml-dark-200'
                  }`}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon size={20} />
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* Sign Out Section */}
        <div className="p-4 border-t border-ml-dark-300">
            <motion.button
            onClick={() => {
              console.log('🔄 Sidebar: Sign out button clicked!');
              
              // Simple sign out function
              const handleSignOut = async () => {
                try {
                  console.log('🔄 Sidebar: Starting sign out...');
                  
                  // Clear local storage first
                  if (typeof window !== 'undefined') {
                    localStorage.clear();
                    sessionStorage.clear();
                    console.log('✅ Sidebar: Local storage cleared');
                  }
                  
                  // Sign out from Clerk
                  console.log('🔄 Sidebar: Calling Clerk signOut...');
                  await signOut();
                  console.log('✅ Sidebar: Clerk signOut successful');
                  
                  // Redirect to sign-in page
                  console.log('🔄 Sidebar: Redirecting to sign-in...');
                  router.push('/sign-in');
                  
                  // Force page reload to ensure clean state
                  setTimeout(() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/sign-in';
                    }
                  }, 100);
                  
                } catch (error) {
                  console.error('❌ Sidebar: Sign out error:', error);
                  // Still try to redirect even if there's an error
                  router.push('/sign-in');
                }
              };
              
              // Call the async function
              handleSignOut();
            }}
            className="w-full flex items-center gap-3 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 border border-red-500/20 hover:border-red-500/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
            <LogOut size={20} />
            {!sidebarCollapsed && <span className="font-medium">Sign Out</span>}
            </motion.button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          className="bg-ml-dark-100 border-b border-ml-dark-300 px-6 py-4 flex items-center justify-between"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-white capitalize">{activeTab}</h1>
            <p className="text-ml-dark-400 text-sm">
              {activeTab === 'overview' && 'Welcome to your ML workspace'}
              {activeTab === 'datasets' && 'Manage your data assets'}
              {activeTab === 'models' && 'Train and manage machine learning models'}
              {activeTab === 'pipelines' && 'Create data pipelines'}
              {activeTab === 'deployments' && 'Deploy and monitor models'}
              {activeTab === 'analytics' && 'Analyze performance metrics'}
              {activeTab === 'data-marketplace' && 'Browse and discover datasets'}
              {activeTab === 'contribute' && 'Upload and contribute data'}
              {activeTab === 'validation' && 'Review and validate submissions'}
              {activeTab === 'rewards' && 'Track your earnings and rewards'}
              {activeTab === 'blockchain' && 'Connect to Stellar, Reflector & KALE'}
              {activeTab === 'kale-integration' && 'Manage KALE tokens, staking, and rewards'}
              {activeTab === 'reflector-integration' && 'Real-time price feeds and dynamic data pricing'}
              {activeTab === 'api-billing' && 'Monitor API usage and KALE token billing'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {auth.isSignedIn ? (
              <>
                <motion.button
                  className="p-2 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Settings size={20} />
                </motion.button>
                {/* User info in header */}
                <div className="flex items-center gap-3 px-3 py-2 bg-ml-dark-200 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-ml-dark-300 flex items-center justify-center">
                    {user?.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt={user.fullName || "User"} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="text-white font-medium">{user?.fullName || "User"}</p>
                    <p className="text-ml-dark-400 text-xs">{user?.emailAddresses[0]?.emailAddress}</p>
                  </div>
                </div>
              </>
            ) : (
              <motion.button
                onClick={handleSignInClick}
                className="flex items-center gap-2 px-4 py-2 bg-ml-blue-50 text-white rounded-lg hover:bg-ml-blue-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn size={16} />
                Sign In
              </motion.button>
            )}
          </div>
        </motion.header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <AppOverview key="overview" />
            )}
            {activeTab === 'datasets' && (
              <DatasetsTab key="datasets" datasets={datasets} onOpenDataset={openDatasetWorkbench} />
            )}
            {activeTab === 'models' && (
              <div className="h-full overflow-hidden">
                <ModelTraining key="models" />
              </div>
            )}
            {activeTab === 'pipelines' && (
              <Pipelines key="pipelines" />
            )}
            {activeTab === 'deployments' && (
              <DeploymentsTab key="deployments" onOpenAPIManagement={() => setShowAPIManagement(true)} />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsTab key="analytics" />
            )}
            {activeTab === 'data-marketplace' && (
              <CustomDataMarketplace key="data-marketplace" />
            )}
            {activeTab === 'contribute' && (
              <CustomContributionCenter key="contribute" />
            )}
            {activeTab === 'validation' && (
              <ValidationDashboard key="validation" />
            )}
            {activeTab === 'rewards' && (
              <RewardTracker key="rewards" />
            )}
            {activeTab === 'blockchain' && (
              <RealBlockchainIntegration key="blockchain" />
            )}
            {activeTab === 'kale-integration' && (
              <CustomTokenWallet key="kale-integration" />
            )}
            {activeTab === 'reflector-integration' && (
              <ReflectorIntegration key="reflector-integration" />
            )}
            {activeTab === 'api-billing' && (
              <ApiBillingDashboard key="api-billing" />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'dataset-workbench' && selectedDataset && (
          <DatasetWorkbenchModal
            dataset={selectedDataset}
            onClose={closeModal}
          />
        )}
        {activeModal === 'training-debugger' && (
          <TrainingDebuggerModal onClose={closeModal} />
        )}
      </AnimatePresence>

      {/* API Management Modal */}
      {showAPIManagement && (
        <APIManagement
          isOpen={showAPIManagement}
          onClose={() => setShowAPIManagement(false)}
        />
      )}
    </div>
  );
}


// API Details Modal Component
function APIDetailsModal({ api, onClose }: { api: any; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">API Details</h2>
            <button
              onClick={onClose}
              className="text-ml-dark-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* API Info */}
            <div className="bg-ml-dark-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">API Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-ml-dark-400">Name</p>
                  <p className="text-white font-medium">{api.name}</p>
                </div>
                <div>
                  <p className="text-sm text-ml-dark-400">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${api.isActive ? 'bg-green-400' : 'bg-ml-dark-400'}`}></div>
                    <span className="text-white">{api.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-ml-dark-400">Description</p>
                  <p className="text-white">{api.description || 'No description'}</p>
                </div>
                <div>
                  <p className="text-sm text-ml-dark-400">Created</p>
                  <p className="text-white">{new Date(api.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* API Key */}
            <div className="bg-ml-dark-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">API Key</h3>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-ml-dark-300 text-ml-dark-100 p-2 rounded text-sm font-mono">
                  {api.apiKey}
                </code>
                <motion.button
                  onClick={() => copyToClipboard(api.apiKey)}
                  className="px-3 py-2 bg-ml-blue-50 text-white rounded hover:bg-ml-blue-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-ml-dark-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Usage Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-ml-dark-400">Total Requests</p>
                  <p className="text-2xl font-bold text-white">{api.requestCount || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-ml-dark-400">Last Used</p>
                  <p className="text-white">
                    {api.lastUsedAt ? new Date(api.lastUsedAt).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            {/* API Endpoint */}
            <div className="bg-ml-dark-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">API Endpoint</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-ml-dark-400 mb-1">URL</p>
                  <code className="bg-ml-dark-300 text-ml-dark-100 p-2 rounded text-sm font-mono block">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/predict/${api.apiKey}` : 'Loading...'}
                  </code>
                </div>
                <div>
                  <p className="text-sm text-ml-dark-400 mb-1">Method</p>
                  <code className="bg-ml-dark-300 text-ml-dark-100 p-2 rounded text-sm font-mono">POST</code>
                </div>
                <div className="pt-2">
                  <motion.button
                    onClick={() => window.open('/api-docs', '_blank')}
                    className="flex items-center gap-2 px-3 py-2 bg-ml-blue-50 text-white rounded hover:bg-ml-blue-100 transition-colors text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FileText className="w-4 h-4" />
                    View API Documentation
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <motion.button
              onClick={onClose}
              className="px-4 py-2 bg-ml-dark-200 text-white rounded-lg hover:bg-ml-dark-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Tab Components
function OverviewTab({ datasets, trainingJobs, pipelines, onOpenDataset }: { 
  datasets: any[] | undefined; 
  trainingJobs: any[] | undefined;
  pipelines: any[] | undefined;
  onOpenDataset: (dataset: any) => void 
}) {
  return (
    <motion.div
      className="p-6 h-full overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Datasets" value={datasets?.length || 0} icon={Database} />
            <StatCard title="Models" value={trainingJobs?.filter(j => j.status === "completed").length || 0} icon={BrainCircuit} />
            <StatCard title="Pipelines" value={pipelines?.length || 0} icon={Network} />
            <StatCard title="Deployments" value="0" icon={Activity} />
          </div>
          
          <div className="bg-ml-dark-100 rounded-lg p-6 border border-ml-dark-300">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {datasets?.slice(0, 3).map((dataset, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-ml-dark-200 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-2 h-2 bg-ml-blue-50 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Created dataset</p>
                    <p className="text-ml-dark-400 text-xs">{dataset.name}</p>
                  </div>
                  <span className="text-ml-dark-500 text-xs">
                    {new Date(dataset._creationTime).toLocaleDateString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Datasets */}
        <div className="bg-ml-dark-100 rounded-lg p-6 border border-ml-dark-300">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Datasets</h3>
          <div className="space-y-3">
            {datasets?.slice(0, 5).map((dataset, i) => (
              <motion.div
                key={dataset._id}
                className="flex items-center gap-3 p-3 bg-ml-dark-200 rounded-lg cursor-pointer hover:bg-ml-dark-300 transition-colors"
                onClick={() => onOpenDataset(dataset)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 2 }}
              >
                <FileIcon size={16} className="text-ml-blue-50" />
                <div className="flex-1">
                  <p className="text-white text-sm">{dataset.name}</p>
                  <p className="text-ml-dark-400 text-xs">
                    {new Date(dataset._creationTime).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight size={16} className="text-ml-dark-400" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DatasetsTab({ datasets, onOpenDataset }: { datasets: any[] | undefined; onOpenDataset: (dataset: any) => void }) {
  return (
    <motion.div
      className="p-6 h-full overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Datasets</h2>
          <p className="text-ml-dark-400">Manage your data assets</p>
        </div>
        <motion.button
          className="flex items-center gap-2 px-4 py-2 bg-ml-blue-50 text-white rounded-lg hover:bg-ml-blue-100 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Upload size={16} />
          Upload Dataset
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets?.map((dataset, i) => (
          <motion.div
            key={dataset._id}
            className="bg-ml-dark-100 rounded-lg p-6 border border-ml-dark-300 hover:border-ml-blue-50/50 transition-colors cursor-pointer"
            onClick={() => onOpenDataset(dataset)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-ml-blue-50/20 rounded-lg flex items-center justify-center">
                <Database size={20} className="text-ml-blue-50" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{dataset.name}</h3>
                <p className="text-ml-dark-400 text-sm">{dataset.type}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-ml-dark-400">
              <span>{new Date(dataset._creationTime).toLocaleDateString()}</span>
              <span>{dataset.size ? `${(dataset.size / 1024).toFixed(1)} KB` : 'Unknown size'}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function DeploymentsTab({ onOpenAPIManagement }: { onOpenAPIManagement: () => void }) {
  const auth = useConvexAuth();
  const deployedAPIs = useQuery(api.predictions.getUserDeployedAPIs, auth?.isSignedIn ? {} : "skip");
  const models = useQuery(api.models.getMyModels, auth?.isSignedIn ? {} : "skip");
  const [selectedAPI, setSelectedAPI] = useState<any>(null);
  const [showAPIDetails, setShowAPIDetails] = useState(false);

  const activeAPIs = deployedAPIs?.filter(api => api.isActive) || [];
  const inactiveAPIs = deployedAPIs?.filter(api => !api.isActive) || [];

  return (
    <motion.div
      className="p-6 h-full overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Deployments</h1>
          <p className="text-sm text-ml-dark-400">
            Deploy and monitor your models with APIs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => window.open('/api-docs', '_blank')}
            className="flex items-center space-x-1 px-4 py-2 bg-ml-dark-200 hover:bg-ml-dark-300 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FileText className="w-4 h-4" />
            <span>API Docs</span>
          </motion.button>
          <motion.button
            onClick={onOpenAPIManagement}
            className="flex items-center space-x-1 px-4 py-2 bg-ml-blue-50 hover:bg-ml-blue-100 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Key className="w-4 h-4" />
            <span>Deploy New API</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total APIs" 
          value={deployedAPIs?.length || 0} 
          icon={Activity}
          color="blue"
        />
        <StatCard 
          title="Active APIs" 
          value={activeAPIs.length} 
          icon={CheckCircle}
          color="green"
        />
        <StatCard 
          title="Total Requests" 
          value={deployedAPIs?.reduce((sum, api) => sum + (api.requestCount || 0), 0) || 0} 
          icon={TrendingUp}
          color="purple"
        />
        <StatCard 
          title="Available Models" 
          value={models?.length || 0} 
          icon={BrainCircuit}
          color="orange"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active APIs */}
        <div className="lg:col-span-2">
          <div className="bg-ml-dark-100 rounded-lg border border-ml-dark-300">
            <div className="p-4 border-b border-ml-dark-300">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Active APIs
                </h3>
                <span className="text-sm text-ml-dark-400">{activeAPIs.length} APIs</span>
              </div>
            </div>
            <div className="p-4">
              {activeAPIs.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-ml-dark-400 mx-auto mb-3" />
                  <p className="text-ml-dark-400 mb-4">No active APIs yet</p>
                  <motion.button
                    onClick={onOpenAPIManagement}
                    className="px-4 py-2 bg-ml-blue-50 text-white rounded-lg hover:bg-ml-blue-100 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Deploy Your First API
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAPIs.map((api) => (
                    <motion.div
                      key={api._id}
                      className="bg-ml-dark-200 rounded-lg p-4 border border-ml-dark-300 hover:border-ml-blue-50 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSelectedAPI(api);
                        setShowAPIDetails(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <div>
                            <h4 className="font-semibold text-white">{api.name}</h4>
                            <p className="text-sm text-ml-dark-400">{api.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-ml-dark-400">{api.requestCount || 0} requests</p>
                          <p className="text-xs text-ml-dark-500">
                            {api.lastUsedAt ? new Date(api.lastUsedAt).toLocaleDateString() : 'Never used'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Inactive APIs */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <motion.button
                onClick={onOpenAPIManagement}
                className="w-full flex items-center gap-2 px-3 py-2 bg-ml-blue-50 hover:bg-ml-blue-100 text-white rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                Deploy New API
              </motion.button>
              <motion.button
                className="w-full flex items-center gap-2 px-3 py-2 bg-ml-dark-200 hover:bg-ml-dark-300 text-white rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Eye className="w-4 h-4" />
                View Analytics
              </motion.button>
              <motion.button
                className="w-full flex items-center gap-2 px-3 py-2 bg-ml-dark-200 hover:bg-ml-dark-300 text-white rounded-lg transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.open('/api-docs', '_blank')}
              >
                <FileText className="w-4 h-4" />
                API Documentation
              </motion.button>
            </div>
          </div>

          {/* Inactive APIs */}
          {inactiveAPIs.length > 0 && (
            <div className="bg-ml-dark-100 rounded-lg border border-ml-dark-300">
              <div className="p-4 border-b border-ml-dark-300">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Circle className="w-5 h-5 text-ml-dark-400" />
                  Inactive APIs
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {inactiveAPIs.map((api) => (
                    <div key={api._id} className="flex items-center justify-between p-2 bg-ml-dark-200 rounded">
                      <div>
                        <p className="text-sm font-medium text-white">{api.name}</p>
                        <p className="text-xs text-ml-dark-400">{api.requestCount || 0} requests</p>
                      </div>
                      <div className="w-2 h-2 bg-ml-dark-400 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {deployedAPIs?.slice(0, 3).map((api) => (
                <div key={api._id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${api.isActive ? 'bg-green-400' : 'bg-ml-dark-400'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{api.name}</p>
                    <p className="text-xs text-ml-dark-400">
                      {api.lastUsedAt ? new Date(api.lastUsedAt).toLocaleString() : 'Never used'}
                    </p>
                  </div>
                </div>
              ))}
              {(!deployedAPIs || deployedAPIs.length === 0) && (
                <p className="text-sm text-ml-dark-400 text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* API Details Modal */}
      {showAPIDetails && selectedAPI && (
        <APIDetailsModal
          api={selectedAPI}
          onClose={() => {
            setShowAPIDetails(false);
            setSelectedAPI(null);
          }}
        />
      )}
    </motion.div>
  );
}

function AnalyticsTab() {
  const auth = useConvexAuth();
  const datasets = useQuery(api.datasets.getMyDatasets, auth?.isSignedIn ? {} : "skip");
  const models = useQuery(api.models.getMyModels, auth?.isSignedIn ? {} : "skip");
  const deployedAPIs = useQuery(api.predictions.getUserDeployedAPIs, auth?.isSignedIn ? {} : "skip");
  const trainingJobs = useQuery(api.training.getMyTrainingJobs, auth?.isSignedIn ? {} : "skip");
  const pipelines = useQuery(api.pipelines.getMyPipelines, auth?.isSignedIn ? {} : "skip");

  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'models' | 'apis' | 'datasets'>('overview');

  // Calculate analytics data
  const totalRequests = deployedAPIs?.reduce((sum, api) => sum + (api.requestCount || 0), 0) || 0;
  const activeAPIs = deployedAPIs?.filter(api => api.isActive).length || 0;
  const completedModels = models?.filter(model => model.status === 'completed').length || 0;
  const totalDatasets = datasets?.length || 0;
  const totalPipelines = pipelines?.length || 0;

  // Recent activity data
  const recentModels = models?.slice(0, 5) || [];
  const recentAPIs = deployedAPIs?.slice(0, 5) || [];
  const recentDatasets = datasets?.slice(0, 5) || [];

  // Performance metrics
  const avgModelAccuracy = models?.filter(m => m.metrics?.accuracy)
    .reduce((sum, m) => sum + (m.metrics?.accuracy || 0), 0) / 
    (models?.filter(m => m.metrics?.accuracy).length || 1);

  const topPerformingAPI = deployedAPIs?.reduce((top, api) => 
    (api.requestCount || 0) > (top.requestCount || 0) ? api : top, 
    deployedAPIs[0] || { requestCount: 0 });

  return (
    <motion.div
      className="p-6 h-full overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
          <p className="text-sm text-ml-dark-400">
            Monitor performance and insights across your ML platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-ml-dark-200 text-white rounded-lg border border-ml-dark-300 focus:border-ml-blue-50 focus:outline-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="flex space-x-1 mb-6 bg-ml-dark-200 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'models', label: 'Models', icon: BrainCircuit },
          { id: 'apis', label: 'APIs', icon: Activity },
          { id: 'datasets', label: 'Datasets', icon: Database }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedMetric(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              selectedMetric === id
                ? 'bg-ml-blue-50 text-white'
                : 'text-ml-dark-400 hover:text-white hover:bg-ml-dark-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Analytics */}
      {selectedMetric === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Requests" 
              value={totalRequests.toLocaleString()} 
              icon={TrendingUp}
              color="purple"
            />
            <StatCard 
              title="Active APIs" 
              value={activeAPIs} 
              icon={CheckCircle}
              color="green"
            />
            <StatCard 
              title="Completed Models" 
              value={completedModels} 
              icon={BrainCircuit}
              color="blue"
            />
            <StatCard 
              title="Avg Accuracy" 
              value={`${(avgModelAccuracy * 100).toFixed(1)}%`} 
              icon={Star}
              color="orange"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Request Trends */}
            <div className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">API Request Trends</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-ml-dark-400 mx-auto mb-2" />
                  <p className="text-ml-dark-400">Request trends chart</p>
                  <p className="text-sm text-ml-dark-500">Coming soon</p>
                </div>
              </div>
            </div>

            {/* Model Performance */}
            <div className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Model Performance</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-ml-dark-400 mx-auto mb-2" />
                  <p className="text-ml-dark-400">Performance metrics</p>
                  <p className="text-sm text-ml-dark-500">Coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Models</h3>
              <div className="space-y-3">
                {recentModels.map((model, i) => (
                  <div key={model._id} className="flex items-center gap-3 p-3 bg-ml-dark-200 rounded">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{model.name}</p>
                      <p className="text-xs text-ml-dark-400">
                        {model.metrics?.accuracy ? `${(model.metrics.accuracy * 100).toFixed(1)}% accuracy` : 'Training...'}
                      </p>
                    </div>
                    <span className="text-xs text-ml-dark-500">
                      {new Date(model.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {recentModels.length === 0 && (
                  <p className="text-sm text-ml-dark-400 text-center py-4">No models yet</p>
                )}
              </div>
            </div>

            <div className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">API Usage</h3>
              <div className="space-y-3">
                {recentAPIs.map((api, i) => (
                  <div key={api._id} className="flex items-center gap-3 p-3 bg-ml-dark-200 rounded">
                    <div className={`w-2 h-2 rounded-full ${api.isActive ? 'bg-green-400' : 'bg-ml-dark-400'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{api.name}</p>
                      <p className="text-xs text-ml-dark-400">{api.requestCount || 0} requests</p>
                    </div>
                    <span className="text-xs text-ml-dark-500">
                      {api.lastUsedAt ? new Date(api.lastUsedAt).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                ))}
                {recentAPIs.length === 0 && (
                  <p className="text-sm text-ml-dark-400 text-center py-4">No APIs yet</p>
                )}
              </div>
            </div>

            <div className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Data Assets</h3>
              <div className="space-y-3">
                {recentDatasets.map((dataset, i) => (
                  <div key={dataset._id} className="flex items-center gap-3 p-3 bg-ml-dark-200 rounded">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-white">{dataset.name}</p>
                      <p className="text-xs text-ml-dark-400">{dataset.type} • {dataset.rowCount || 0} rows</p>
                    </div>
                    <span className="text-xs text-ml-dark-500">
                      {new Date(dataset.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {recentDatasets.length === 0 && (
                  <p className="text-sm text-ml-dark-400 text-center py-4">No datasets yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Analytics */}
      {selectedMetric === 'models' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Total Models" 
              value={models?.length || 0} 
              icon={BrainCircuit}
              color="blue"
            />
            <StatCard 
              title="Completed" 
              value={completedModels} 
              icon={CheckCircle}
              color="green"
            />
            <StatCard 
              title="Training" 
              value={models?.filter(m => m.status === 'training').length || 0} 
              icon={Clock}
              color="orange"
            />
          </div>

          <div className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Model Performance Comparison</h3>
            <div className="space-y-4">
              {models?.filter(m => m.metrics?.accuracy).map((model) => (
                <div key={model._id} className="flex items-center gap-4 p-4 bg-ml-dark-200 rounded">
                  <div className="flex-1">
                    <p className="text-white font-medium">{model.name}</p>
                    <p className="text-sm text-ml-dark-400">{model.modelType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      {((model.metrics?.accuracy || 0) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-ml-dark-400">Accuracy</p>
                  </div>
                  <div className="w-24 bg-ml-dark-300 rounded-full h-2">
                    <div 
                      className="bg-blue-400 h-2 rounded-full" 
                      style={{ width: `${(model.metrics?.accuracy || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {(!models || models.filter(m => m.metrics?.accuracy).length === 0) && (
                <p className="text-sm text-ml-dark-400 text-center py-8">No completed models with metrics yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* API Analytics */}
      {selectedMetric === 'apis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Total APIs" 
              value={deployedAPIs?.length || 0} 
              icon={Activity}
              color="blue"
            />
            <StatCard 
              title="Active APIs" 
              value={activeAPIs} 
              icon={CheckCircle}
              color="green"
            />
            <StatCard 
              title="Total Requests" 
              value={totalRequests.toLocaleString()} 
              icon={TrendingUp}
              color="purple"
            />
          </div>

          <div className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">API Usage Statistics</h3>
            <div className="space-y-4">
              {deployedAPIs?.map((api) => (
                <div key={api._id} className="flex items-center gap-4 p-4 bg-ml-dark-200 rounded">
                  <div className="flex-1">
                    <p className="text-white font-medium">{api.name}</p>
                    <p className="text-sm text-ml-dark-400">{api.description || 'No description'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">{api.requestCount || 0}</p>
                    <p className="text-xs text-ml-dark-400">Requests</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${api.isActive ? 'bg-green-400' : 'bg-ml-dark-400'}`}></div>
                    <span className="text-sm text-ml-dark-400">{api.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              ))}
              {(!deployedAPIs || deployedAPIs.length === 0) && (
                <p className="text-sm text-ml-dark-400 text-center py-8">No APIs deployed yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dataset Analytics */}
      {selectedMetric === 'datasets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
              title="Total Datasets" 
              value={totalDatasets} 
              icon={Database}
              color="blue"
            />
            <StatCard 
              title="Total Pipelines" 
              value={totalPipelines} 
              icon={Network}
              color="purple"
            />
            <StatCard 
              title="Total Size" 
              value={`${((datasets?.reduce((sum, d) => sum + (d.size || 0), 0) || 0) / 1024 / 1024).toFixed(1)} MB`} 
              icon={FileText}
              color="orange"
            />
          </div>

          <div className="bg-ml-dark-100 rounded-lg border border-ml-dark-300 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Dataset Overview</h3>
            <div className="space-y-4">
              {datasets?.map((dataset) => (
                <div key={dataset._id} className="flex items-center gap-4 p-4 bg-ml-dark-200 rounded">
                  <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{dataset.name}</p>
                    <p className="text-sm text-ml-dark-400">
                      {dataset.type} • {dataset.rowCount || 0} rows • {dataset.columnCount || 0} columns
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-ml-dark-400">
                      {dataset.size ? `${(dataset.size / 1024).toFixed(1)} KB` : 'Unknown size'}
                    </p>
                    <p className="text-xs text-ml-dark-500">
                      {new Date(dataset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {(!datasets || datasets.length === 0) && (
                <p className="text-sm text-ml-dark-400 text-center py-8">No datasets uploaded yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Utility Components
function StatCard({ title, value, icon: Icon, color = "blue" }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color?: "blue" | "green" | "purple" | "orange" 
}) {
  const colorClasses = {
    blue: "text-ml-blue-50 bg-ml-blue-50/20",
    green: "text-green-400 bg-green-400/20", 
    purple: "text-purple-400 bg-purple-400/20",
    orange: "text-orange-400 bg-orange-400/20"
  };

  return (
    <motion.div
      className="bg-ml-dark-100 rounded-lg p-4 border border-ml-dark-300"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-ml-dark-400 text-sm">{title}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Dataset Workbench Modal
function DatasetWorkbenchModal({ dataset, onClose }: { dataset: any; onClose: () => void }) {
  const [preprocessor] = useState(() => new DataPreprocessor());
  const [currentPipeline, setCurrentPipeline] = useState<DataStep[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<'histogram' | 'scatter' | 'correlation'>('histogram');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedXCol, setSelectedXCol] = useState<string | null>(null);
  const [selectedYCol, setSelectedYCol] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showActionsPanel, setShowActionsPanel] = useState(true);
  const [activeView, setActiveView] = useState<'split' | 'grid' | 'charts'>('split');
  const [dataVersion, setDataVersion] = useState(0);
  const [showPipelineManager, setShowPipelineManager] = useState(false);
  const [pipelineName, setPipelineName] = useState('');
  const [pipelineDescription, setPipelineDescription] = useState('');
  const [showVersionManager, setShowVersionManager] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [selectedPipelineForVersion, setSelectedPipelineForVersion] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const downloadUrl = useQuery(api.datasets.getDatasetDownloadUrl, { datasetId: dataset._id });
  
  // Pipeline management queries and mutations
  const pipelines = useQuery(api.pipelines.getPipelinesForDataset, { datasetId: dataset._id });
  const templates = useQuery(api.pipelines.getPipelineTemplates, {});
  const createPipeline = useMutation(api.pipelines.createPipeline);
  const createPipelineVersion = useMutation(api.pipelines.createPipelineVersion);
  const getPipelineVersions = useQuery(api.pipelines.getPipelineVersions, 
    selectedPipelineForVersion ? { pipelineId: selectedPipelineForVersion as any } : "skip");
  const exportPipelineMutation = useMutation(api.pipelines.exportPipeline);
  const importPipeline = useMutation(api.pipelines.importPipeline);

  useEffect(() => {
    const loadDataset = async () => {
      console.log("🚀 ===== DATASET LOADING START =====");
      console.log("🔍 dataset object:", dataset);
      console.log("🔍 preprocessor object:", preprocessor);
      console.log("🔍 downloadUrl:", downloadUrl);
      console.log("🔍 downloadUrl type:", typeof downloadUrl);
      
      if (!dataset) {
        console.log("❌ No dataset object, skipping load");
        return;
      }
      
      setIsProcessing(true);
      console.log("🔄 Set isProcessing to true");
      
      try {
        console.log("🔄 Loading dataset:", dataset.name);
        console.log("📥 Download URL:", downloadUrl);
        console.log("📥 Download URL type:", typeof downloadUrl);
        console.log("📥 Download URL truthy:", !!downloadUrl);
        
        let dataLoaded = false;
        
        if (downloadUrl) {
          console.log("🌐 Attempting to fetch from downloadUrl");
          try {
            console.log("📡 Making fetch request to:", downloadUrl);
            const resp = await fetch(downloadUrl);
            console.log("📡 Fetch response status:", resp.status);
            console.log("📡 Fetch response ok:", resp.ok);
            
            if (resp.ok) {
              console.log("📦 Fetch successful, getting blob");
              const blob = await resp.blob();
              console.log("📦 Blob size:", blob.size);
              console.log("📦 Blob type:", blob.type);
              
              const file = new File([blob], dataset.name, { type: blob.type });
              console.log("📁 Created file:", file.name, "size:", file.size);
              
              const fileType = file.name.endsWith(".csv") ? 'csv' : 'json';
              console.log("📁 File type:", fileType);
              
              console.log("🔄 Calling preprocessor.loadData with file");
              await preprocessor.loadData(file, fileType as any);
              console.log("✅ preprocessor.loadData completed successfully");
              
              dataLoaded = true;
              console.log("✅ Real data loaded successfully");
            } else {
              console.warn("⚠️ Failed to fetch dataset, status:", resp.status);
            }
          } catch (fetchError) {
            console.warn("⚠️ Error fetching dataset:", fetchError);
            console.warn("⚠️ Fetch error details:", {
              name: (fetchError as Error).name,
              message: (fetchError as Error).message,
              stack: (fetchError as Error).stack
            });
          }
        } else {
          console.log("❌ No downloadUrl available");
        }
        
        // Always use fallback data if real data failed to load
        if (!dataLoaded) {
          console.log("🔄 Using fallback sample data");
          const sampleCSV = `name,age,salary,department
John,25,50000,Engineering
Jane,30,60000,Marketing
Bob,35,70000,Engineering
Alice,28,55000,Design
Charlie,32,65000,Marketing
Diana,27,52000,Engineering
Eve,29,58000,Design
Frank,31,62000,Marketing`;
          
          console.log("🔄 Calling preprocessor.loadData with sample CSV");
          await preprocessor.loadData(sampleCSV, 'csv');
          console.log("✅ Sample data loaded successfully");
        }
        
        console.log("🔍 Checking preprocessor state after load:");
        console.log("📊 preprocessor.getColumns():", preprocessor.getColumns());
        console.log("📊 preprocessor.getColumns() length:", preprocessor.getColumns()?.length);
        console.log("📈 preprocessor.getTabularPreview(5):", preprocessor.getTabularPreview(5));
        console.log("📈 preview rows length:", preprocessor.getTabularPreview(5)?.rows?.length);
        console.log("🔍 preprocessor.getTabularData():", preprocessor.getTabularData());
        console.log("🔍 full data rows length:", preprocessor.getTabularData()?.rows?.length);
        
        console.log("🔄 Setting pipeline steps");
        const steps = preprocessor.getSteps();
        console.log("📋 Pipeline steps:", steps);
        setCurrentPipeline(steps);
        
        console.log("🔄 Setting processed data to null");
        setProcessedData(null);
        
        console.log("✅ Data loading process completed successfully");
        
        // Increment dataVersion to trigger useMemo re-computation
        setDataVersion(prev => prev + 1);
        console.log("🔄 Incremented dataVersion to trigger UI update");
      } catch (error) {
        console.error("❌ Error loading dataset:", error);
        console.error("❌ Error details:", {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack
        });
        
        // Even if there's an error, try to load fallback data
        try {
          console.log("🔄 Attempting fallback data load after error");
          const sampleCSV = `name,age,salary,department
John,25,50000,Engineering
Jane,30,60000,Marketing
Bob,35,70000,Engineering
Alice,28,55000,Design
Charlie,32,65000,Marketing
Diana,27,52000,Engineering
Eve,29,58000,Design
Frank,31,62000,Marketing`;
          await preprocessor.loadData(sampleCSV, 'csv');
          console.log("✅ Fallback data loaded after error");
        } catch (fallbackError) {
          console.error("❌ Even fallback data failed:", fallbackError);
          console.error("❌ Fallback error details:", {
            name: (fallbackError as Error).name,
            message: (fallbackError as Error).message,
            stack: (fallbackError as Error).stack
          });
        }
      } finally {
        console.log("🔄 Setting isProcessing to false");
        setIsProcessing(false);
        console.log("🏁 ===== DATASET LOADING END =====");
      }
    };
    
    console.log("🚀 Starting loadDataset function");
    loadDataset();
  }, [downloadUrl, dataset]);

  const columns = useMemo(() => {
    console.log("🔄 useMemo columns - preprocessor:", preprocessor, "dataVersion:", dataVersion);
    const cols = preprocessor?.getColumns() || [];
    console.log("📊 useMemo columns result:", cols);
    console.log("📊 useMemo columns length:", cols.length);
    return cols;
  }, [preprocessor, dataVersion]);
  
  const stats = useMemo(() => {
    console.log("🔄 useMemo stats - preprocessor:", preprocessor, "dataVersion:", dataVersion);
    const statsResult = preprocessor?.computeColumnStats() || [];
    console.log("📈 useMemo stats result:", statsResult);
    console.log("📈 useMemo stats length:", statsResult.length);
    return statsResult;
  }, [preprocessor, dataVersion]);
  
  const previewData = useMemo(() => {
    console.log("🔄 useMemo previewData - preprocessor:", preprocessor, "dataVersion:", dataVersion);
    const preview = preprocessor?.getTabularPreview(50) || { columns: [], rows: [] };
    console.log("👁️ useMemo previewData result:", preview);
    console.log("👁️ useMemo previewData columns:", preview.columns);
    console.log("👁️ useMemo previewData rows length:", preview.rows?.length);
    return preview;
  }, [preprocessor, dataVersion]);
  
  const numericCols = useMemo(() => {
    console.log("🔄 useMemo numericCols - stats:", stats, "dataVersion:", dataVersion);
    const numeric = stats.filter(s => s.type === 'numeric').map(s => s.column);
    console.log("🔢 useMemo numericCols result:", numeric);
    return numeric;
  }, [stats, dataVersion]);

  // Data visualization data
  const histogramData = useMemo(() => {
    if (!selectedXCol || !numericCols.includes(selectedXCol)) return [];
    const visualizer = new DataVisualizer();
    return visualizer.generateHistogramData(preprocessor.getTabularData(), selectedXCol);
  }, [selectedXCol, numericCols, preprocessor]);

  const scatterData = useMemo(() => {
    if (!selectedXCol || !selectedYCol || !numericCols.includes(selectedXCol) || !numericCols.includes(selectedYCol)) return [];
    const visualizer = new DataVisualizer();
    return visualizer.generateScatterData(preprocessor.getTabularData(), selectedXCol, selectedYCol);
  }, [selectedXCol, selectedYCol, numericCols, preprocessor]);

  const correlationData = useMemo(() => {
    if (numericCols.length < 2) return [];
    const visualizer = new DataVisualizer();
    return visualizer.generateCorrelationMatrix(preprocessor.getTabularData(), numericCols);
  }, [numericCols, preprocessor]);

  const applyTransformation = useCallback(async (action: string, params: any = {}) => {
    if (!preprocessor) return;
    setIsProcessing(true);
    
    try {
      switch (action) {
        case 'handleMissingValues':
          preprocessor.handleMissingValues(params.strategy || 'mean', params.targetColumns);
          break;
        case 'normalize':
          preprocessor.normalizeData(params.method || 'minmax', params.targetColumns);
          break;
        case 'encodeCategorical':
          preprocessor.encodeCategorical(params.method || 'onehot', params.targetColumns, params.targetColumn);
          break;
        case 'clipOutliers':
          preprocessor.clipOutliers({
            method: params.method || 'iqr',
            threshold: params.threshold || 3,
            lowerPercentile: params.lowerPercentile || 1,
            upperPercentile: params.upperPercentile || 99,
            targetColumns: params.targetColumns
          });
          break;
        case 'splitData':
          preprocessor.splitData({
            train: params.train || 0.7,
            validation: params.validation || 0.15,
            test: params.test || 0.15
          });
          break;
        case 'reset':
          preprocessor.reset();
          break;
      }
      
      setCurrentPipeline(preprocessor.getSteps());
      setProcessedData(preprocessor.getProcessedData());
      
      // Increment dataVersion to trigger UI updates
      setDataVersion(prev => prev + 1);
    } catch (error) {
      console.error("Error applying transformation:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [preprocessor]);

  const exportData = useCallback(async (format: 'csv' | 'json') => {
    if (!preprocessor) return;
    
    try {
      let blob: Blob;
      let filename: string;
      
      if (format === 'csv') {
        const csv = preprocessor.exportToCSV();
        blob = new Blob([csv], { type: 'text/csv' });
        filename = `${dataset.name}_processed.csv`;
      } else {
        const json = preprocessor.exportToJSON();
        blob = new Blob([json], { type: 'application/json' });
        filename = `${dataset.name}_processed.json`;
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  }, [preprocessor, dataset.name]);

  // Pipeline management functions
  const savePipeline = useCallback(async () => {
    if (!preprocessor || !pipelineName.trim()) return;
    
    try {
      const steps = preprocessor.getSteps();
      await createPipeline({
        name: pipelineName,
        description: pipelineDescription,
        datasetId: dataset._id,
        steps: steps,
      });
      
      setPipelineName('');
      setPipelineDescription('');
      setShowPipelineManager(false);
      alert('Pipeline saved successfully!');
    } catch (error) {
      console.error("Error saving pipeline:", error);
      alert('Failed to save pipeline');
    }
  }, [preprocessor, pipelineName, pipelineDescription, dataset._id]);

  const loadPipeline = useCallback(async (pipelineId: string) => {
    if (!preprocessor) return;
    
    try {
      // Find the pipeline in the existing pipelines list
      const pipeline = pipelines?.find(p => p._id === pipelineId);
      if (!pipeline) {
        alert('Pipeline not found');
        return;
      }
      
      // Reset current pipeline
      preprocessor.reset();
      
      // Apply each step from the saved pipeline
      for (const step of pipeline.steps) {
        switch (step.type) {
          case 'handle_missing':
            preprocessor.handleMissingValues(step.parameters.strategy, step.parameters.targetColumns);
            break;
          case 'normalize':
            preprocessor.normalizeData(step.parameters.method, step.parameters.targetColumns);
            break;
          case 'encode_categorical':
            preprocessor.encodeCategorical(step.parameters.method, step.parameters.targetColumns, step.parameters.targetColumn);
            break;
          case 'feature_engineering':
            if (step.parameters.action === 'clip_outliers') {
              preprocessor.clipOutliers(step.parameters);
            }
            break;
          case 'split_data':
            preprocessor.splitData(step.parameters.splitRatios);
            break;
        }
      }
      
      setCurrentPipeline(preprocessor.getSteps());
      setProcessedData(preprocessor.getProcessedData());
      setDataVersion(prev => prev + 1);
      
      alert('Pipeline loaded successfully!');
    } catch (error) {
      console.error("Error loading pipeline:", error);
      alert('Failed to load pipeline');
    }
  }, [preprocessor, pipelines]);

  const applyTemplate = useCallback(async (template: any) => {
    if (!preprocessor) return;
    
    try {
      // Reset current pipeline
      preprocessor.reset();
      
      // Apply each step from the template
      for (const step of template.steps) {
        switch (step.type) {
          case 'handle_missing':
            preprocessor.handleMissingValues(step.parameters.strategy, step.parameters.targetColumns);
            break;
          case 'normalize':
            preprocessor.normalizeData(step.parameters.method, step.parameters.targetColumns);
            break;
          case 'encode_categorical':
            preprocessor.encodeCategorical(step.parameters.method, step.parameters.targetColumns, step.parameters.targetColumn);
            break;
          case 'feature_engineering':
            if (step.parameters.action === 'clip_outliers') {
              preprocessor.clipOutliers(step.parameters);
            }
            break;
          case 'split_data':
            preprocessor.splitData(step.parameters.splitRatios);
            break;
        }
      }
      
      setCurrentPipeline(preprocessor.getSteps());
      setProcessedData(preprocessor.getProcessedData());
      setDataVersion(prev => prev + 1);
      
      alert(`Template "${template.name}" applied successfully!`);
    } catch (error) {
      console.error("Error applying template:", error);
      alert('Failed to apply template');
    }
  }, [preprocessor]);

  // Versioning functions
  const createNewVersion = useCallback(async (pipelineId: string, versionNotes?: string) => {
    if (!preprocessor) return;
    
    try {
      const steps = preprocessor.getSteps();
      await createPipelineVersion({
        pipelineId: pipelineId as any,
        steps,
        versionNotes,
      });
      
      alert('New version created successfully!');
      setShowVersionManager(false);
    } catch (error) {
      console.error("Error creating version:", error);
      alert('Failed to create new version');
    }
  }, [preprocessor, createPipelineVersion]);

  // Export/Import functions
  const exportPipelineToFile = useCallback(async (pipelineId: string) => {
    try {
      const exportData = await exportPipelineMutation({ pipelineId: pipelineId as any });
      
      if (exportData) {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportData.name}_pipeline.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Pipeline exported successfully!');
      }
    } catch (error) {
      console.error("Error exporting pipeline:", error);
      alert('Failed to export pipeline');
    }
  }, [exportPipelineMutation]);

  const importPipelineFromFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      await importPipeline({
        name: importData.name,
        description: importData.description,
        datasetId: dataset._id,
        steps: importData.steps,
        importedFrom: file.name,
      });
      
      alert('Pipeline imported successfully!');
      setShowExportImport(false);
    } catch (error) {
      console.error("Error importing pipeline:", error);
      alert('Failed to import pipeline. Please check the file format.');
    }
  }, [importPipeline, dataset._id]);

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-ml-dark-100 rounded-lg w-full max-w-[95vw] h-[95vh] flex flex-col border border-ml-dark-300"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-ml-dark-300">
          <div className="flex items-center gap-3">
            <Database size={24} className="text-ml-blue-50" />
            <div>
              <h2 className="text-xl font-semibold text-white">{dataset.name}</h2>
              <p className="text-ml-dark-400 text-sm">Data Workbench • {previewData.rows.length} rows • {columns.length} columns</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-ml-dark-200 rounded-md p-1">
              {[
                { id: 'split', icon: Grid, label: 'Split' },
                { id: 'grid', icon: List, label: 'Grid' },
                { id: 'charts', icon: BarChart3, label: 'Charts' }
              ].map((view) => {
                const Icon = view.icon;
                return (
                  <motion.button
                    key={view.id}
                    onClick={() => setActiveView(view.id as any)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-sm text-sm transition-colors ${
                      activeView === view.id ? 'bg-ml-dark-100 text-white' : 'text-ml-dark-400 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon size={14} />
                    {view.label}
                  </motion.button>
                );
              })}
            </div>
            
            {/* Export Buttons */}
            <motion.button
              onClick={() => exportData('csv')}
              className="flex items-center gap-2 px-3 py-1.5 bg-ml-dark-200 text-white rounded-md hover:bg-ml-dark-300 transition-colors text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={16} /> Export CSV
            </motion.button>
            
            <motion.button
              onClick={() => exportData('json')}
              className="flex items-center gap-2 px-3 py-1.5 bg-ml-dark-200 text-white rounded-md hover:bg-ml-dark-300 transition-colors text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={16} /> Export JSON
            </motion.button>
            
            <motion.button
              onClick={onClose}
              className="p-2 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded-md transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={20} />
            </motion.button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Actions & Pipeline */}
          {showActionsPanel && (
            <motion.div
              className="w-80 bg-ml-dark-100 border-r border-ml-dark-300 flex flex-col overflow-hidden"
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              exit={{ x: -100 }}
            >
              {/* Actions Panel Header */}
              <div className="p-4 border-b border-ml-dark-300 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold text-white">Data Actions</h3>
                  <motion.button
                    onClick={() => setShowActionsPanel(false)}
                    className="p-1 text-ml-dark-400 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Minimize size={16} />
                  </motion.button>
                </div>
              </div>
              
              {/* Actions Panel Content */}
              <div className="flex-1 flex flex-col overflow-hidden p-4">
            
            {/* File Upload and Manual Data Load */}
            {columns.length === 0 && (
              <div className="space-y-2 mb-3">
                {/* File Upload */}
                <motion.label
                  className="w-full flex items-center gap-2 px-3 py-2 bg-ml-blue-50/20 text-ml-blue-50 rounded-md hover:bg-ml-blue-50/30 transition-colors text-sm cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Upload size={16} />
                  Upload Your Data File
                  <input
                    type="file"
                    accept=".csv,.json,.png,.jpg,.jpeg,.bmp,.tiff,.zip"
                    className="hidden"
                    onChange={async (e) => {
                      console.log("🚀 ===== FILE UPLOAD START =====");
                      const file = e.target.files?.[0];
                      console.log("📁 Selected file:", file);
                      if (!file) {
                        console.log("❌ No file selected");
                        return;
                      }
                      
                      setIsProcessing(true);
                      console.log("🔄 Set isProcessing to true");
                      try {
                        console.log("🔄 Uploading file:", file.name, "Size:", file.size);
                        
                        // Detect file type
                        const isImage = /\.(png|jpg|jpeg|bmp|tiff)$/i.test(file.name);
                        const isArchive = file.name.endsWith('.zip');
                        
                        if (isImage || isArchive) {
                          console.log("🖼️ Detected image/archive file, using image processor");
                          const imageProcessor = new ImageProcessor();
                          const images = await imageProcessor.loadImages([file]);
                          
                          // Create image metadata for processing
                          const imageMetadata = {
                            data: images.map((img, index) => [
                              `image_${index}`,
                              img.width,
                              img.height,
                              img.channels,
                              'image'
                            ]),
                            columns: ['filename', 'width', 'height', 'channels', 'type'],
                            type: 'image',
                            metadata: {
                              imageShape: [images[0]?.width || 0, images[0]?.height || 0, images[0]?.channels || 0],
                              numImages: images.length
                            }
                          };
                          
                          // Load image metadata into preprocessor
                          await preprocessor.loadData(JSON.stringify(imageMetadata), 'json');
                          console.log("✅ Image data loaded successfully");
                        } else {
                          const fileType = file.name.endsWith('.csv') ? 'csv' : 'json';
                          console.log("📁 File type:", fileType);
                          
                          console.log("🔄 Calling preprocessor.loadData with uploaded file");
                          await preprocessor.loadData(file, fileType as any);
                          console.log("✅ preprocessor.loadData completed");
                        }
                        
                        console.log("✅ File upload successful:", file.name);
                        console.log("📊 Columns after upload:", preprocessor.getColumns());
                        console.log("📊 Columns length:", preprocessor.getColumns()?.length);
                        console.log("📈 Preview after upload:", preprocessor.getTabularPreview(5));
                        console.log("📈 Preview rows length:", preprocessor.getTabularPreview(5)?.rows?.length);
                        
                        console.log("🔄 Setting pipeline steps");
                        setCurrentPipeline(preprocessor.getSteps());
                        console.log("🔄 Setting processed data to null");
                        setProcessedData(null);
                        
                        // Force re-render by updating state
                        console.log("🔄 Resetting selection state");
                        setSelectedColumns([]);
                        setSelectedXCol(null);
                        setSelectedYCol(null);
                        
                        console.log("✅ File upload process completed");
                      } catch (error) {
                        console.error("❌ File upload failed:", error);
                        console.error("❌ Upload error details:", {
                          name: (error as Error).name,
                          message: (error as Error).message,
                          stack: (error as Error).stack
                        });
                        alert("Failed to load file. Please check the console for details.");
                      } finally {
                        console.log("🔄 Setting isProcessing to false");
                        setIsProcessing(false);
                        console.log("🏁 ===== FILE UPLOAD END =====");
                      }
                    }}
                  />
                </motion.label>
                
                {/* Load Rainfall Data */}
                <motion.button
                  onClick={async () => {
                    console.log("🚀 ===== RAINFALL DATA LOAD START =====");
                    setIsProcessing(true);
                    console.log("🔄 Set isProcessing to true");
                    try {
                      console.log("🔄 Loading rainfall CSV data");
                      const rainfallCSV = `num,altitude,sep,oct,nov,dec,jan,feb,mar,apr,may,name,x_utm,y_utm
110050,30,1.2,33,90,117,135,102,61,20,6.7,Kfar Rosh Hanikra,696533.0929,3660837.106
110351,35,2.3,34,86,121,144,106,62,23,4.5,Saar,697119.0761,3656748.194
110502,20,2.7,29,89,131,158,109,62,24,3.8,Evron,696509.339,3652434.139
111001,10,2.9,32,91,137,152,113,61,21,4.8,Kfar Masrik,696541.676,3641331.565
111650,25,1,27,78,128,136,108,59,21,4.7,Kfar Hamakabi,697875.2885,3630156.099
120202,5,1.5,27,80,127,136,95,49,19,2.7,Haifa Port,687006.1707,3633330.347
120630,450,1.9,36,93,161,166,128,71,21,4.9,Haifa University,689553.6962,3626281.682
120750,30,1.6,31,91,163,170,146,76,22,4.9,Yagur,694694.4895,3624388.187
120870,210,1.1,32,93,147,147,109,61,16,4.3,Nir Etzyon,686489.5324,3619716.312
121051,20,1.8,32,85,147,142,102,56,13,4.5,En Carmel,683148.4085,3616846.219`;
                      
                      console.log("🔄 Calling preprocessor.loadData with rainfall CSV");
                      await preprocessor.loadData(rainfallCSV, 'csv');
                      console.log("✅ preprocessor.loadData completed");
                      
                      console.log("📊 Columns after rainfall load:", preprocessor.getColumns());
                      console.log("📊 Columns length:", preprocessor.getColumns()?.length);
                      console.log("📈 Preview after rainfall load:", preprocessor.getTabularPreview(5));
                      console.log("📈 Preview rows length:", preprocessor.getTabularPreview(5)?.rows?.length);
                      
                      console.log("🔄 Setting pipeline steps");
                      setCurrentPipeline(preprocessor.getSteps());
                      console.log("🔄 Setting processed data to null");
                      setProcessedData(null);
                      console.log("🔄 Resetting selection state");
                      setSelectedColumns([]);
                      setSelectedXCol(null);
                      setSelectedYCol(null);
                      
                      console.log("✅ Rainfall data load successful");
                    } catch (error) {
                      console.error("❌ Rainfall data load failed:", error);
                      console.error("❌ Rainfall error details:", {
                        name: (error as Error).name,
                        message: (error as Error).message,
                        stack: (error as Error).stack
                      });
                    } finally {
                      console.log("🔄 Setting isProcessing to false");
                      setIsProcessing(false);
                      console.log("🏁 ===== RAINFALL DATA LOAD END =====");
                    }
                  }}
                  disabled={isProcessing}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-md hover:bg-blue-500/30 transition-colors text-sm disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FileText size={16} />
                  Load Rainfall Data
                </motion.button>
                
                {/* Sample Data */}
                <motion.button
                  onClick={async () => {
                    setIsProcessing(true);
                    try {
                      const sampleCSV = `name,age,salary,department
John,25,50000,Engineering
Jane,30,60000,Marketing
Bob,35,70000,Engineering
Alice,28,55000,Design
Charlie,32,65000,Marketing
Diana,27,52000,Engineering
Eve,29,58000,Design
Frank,31,62000,Marketing`;
                      await preprocessor.loadData(sampleCSV, 'csv');
                      setCurrentPipeline(preprocessor.getSteps());
                      setProcessedData(null);
                      setSelectedColumns([]);
                      setSelectedXCol(null);
                      setSelectedYCol(null);
                      console.log("✅ Sample data load successful");
                    } catch (error) {
                      console.error("❌ Sample data load failed:", error);
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  disabled={isProcessing}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-md hover:bg-green-500/30 transition-colors text-sm disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FileText size={16} />
                  Load Sample Data
                </motion.button>
              </div>
            )}
                
                <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-ml-dark-300 scrollbar-track-ml-dark-100 hover:scrollbar-thumb-ml-dark-200 relative">
                  {/* Scroll fade indicator */}
                  <div className="absolute bottom-0 left-0 right-2 h-4 bg-gradient-to-t from-ml-dark-100 to-transparent pointer-events-none z-10"></div>
                  {/* Missing Values */}
                  <div className="bg-ml-dark-100/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter size={16} className="text-ml-blue-50" />
                      <h4 className="text-sm font-medium text-white">Handle Missing Values</h4>
                    </div>
                    <div className="space-y-2">
                      <select 
                        className="w-full px-2 py-1 bg-ml-dark-200 text-white text-xs rounded border border-ml-dark-300"
                        onChange={(e) => {
                          const strategy = e.target.value;
                          if (strategy) {
                            applyTransformation('handleMissingValues', { strategy });
                          }
                        }}
                        disabled={isProcessing}
                      >
                        <option value="">Select Strategy</option>
                        <option value="drop_rows">Drop Rows</option>
                        <option value="drop_columns">Drop Columns</option>
                        <option value="mean">Mean Imputation</option>
                        <option value="median">Median Imputation</option>
                        <option value="mode">Mode Imputation</option>
                        <option value="forward_fill">Forward Fill</option>
                        <option value="backward_fill">Backward Fill</option>
                      </select>
                    </div>
                  </div>

                  {/* Normalize Data */}
                  <div className="bg-ml-dark-100/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={16} className="text-ml-blue-50" />
                      <h4 className="text-sm font-medium text-white">Normalize Data</h4>
                    </div>
                    <div className="space-y-2">
                      <select 
                        className="w-full px-2 py-1 bg-ml-dark-200 text-white text-xs rounded border border-ml-dark-300"
                        onChange={(e) => {
                          const method = e.target.value;
                          if (method) {
                            applyTransformation('normalize', { method });
                          }
                        }}
                        disabled={isProcessing || numericCols.length === 0}
                      >
                        <option value="">Select Method</option>
                        <option value="minmax">Min-Max Scaling</option>
                        <option value="zscore">Z-Score Standardization</option>
                        <option value="robust">Robust Scaling</option>
                      </select>
                    </div>
                  </div>

                  {/* Encode Categorical */}
                  <div className="bg-ml-dark-100/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers size={16} className="text-ml-blue-50" />
                      <h4 className="text-sm font-medium text-white">Encode Categorical</h4>
                    </div>
                    <div className="space-y-2">
                      <select 
                        className="w-full px-2 py-1 bg-ml-dark-200 text-white text-xs rounded border border-ml-dark-300"
                        onChange={(e) => {
                          const method = e.target.value;
                          if (method) {
                            applyTransformation('encodeCategorical', { method });
                          }
                        }}
                        disabled={isProcessing}
                      >
                        <option value="">Select Method</option>
                        <option value="onehot">One-Hot Encoding</option>
                        <option value="label">Label Encoding</option>
                        <option value="target">Target Encoding</option>
                      </select>
                    </div>
                  </div>

                  {/* Clip Outliers */}
                  <div className="bg-ml-dark-100/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={16} className="text-ml-blue-50" />
                      <h4 className="text-sm font-medium text-white">Clip Outliers</h4>
                    </div>
                    <div className="space-y-2">
                      <select 
                        className="w-full px-2 py-1 bg-ml-dark-200 text-white text-xs rounded border border-ml-dark-300"
                        onChange={(e) => {
                          const method = e.target.value;
                          if (method) {
                            applyTransformation('clipOutliers', { method });
                          }
                        }}
                        disabled={isProcessing || numericCols.length === 0}
                      >
                        <option value="">Select Method</option>
                        <option value="iqr">IQR Method</option>
                        <option value="zscore">Z-Score Method</option>
                        <option value="percentile">Percentile Method</option>
                      </select>
                    </div>
                  </div>

                  {/* Split Data */}
                  <div className="bg-ml-dark-100/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Network size={16} className="text-ml-blue-50" />
                      <h4 className="text-sm font-medium text-white">Split Data</h4>
                    </div>
                    <motion.button
                      onClick={() => applyTransformation('splitData')}
                      disabled={isProcessing}
                      className="w-full px-3 py-2 bg-ml-blue-50/20 text-white rounded-md hover:bg-ml-blue-50/30 transition-colors text-xs disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Split (70/15/15)
                    </motion.button>
                  </div>

                  {/* Reset */}
                  <motion.button
                    onClick={() => applyTransformation('reset')}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/30 transition-colors text-sm disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <RotateCcw size={16} />
                    Reset Pipeline
                  </motion.button>

                  {/* Pipeline Management */}
                  <div className="bg-ml-dark-100/50 rounded-lg p-3 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings size={16} className="text-ml-blue-50" />
                      <h4 className="text-sm font-medium text-white">Pipeline Management</h4>
                    </div>
                    <div className="space-y-2">
                      <motion.button
                        onClick={() => setShowPipelineManager(true)}
                        disabled={isProcessing || currentPipeline.length === 0}
                        className="w-full px-3 py-2 bg-ml-blue-50/20 text-white rounded-md hover:bg-ml-blue-50/30 transition-colors text-xs disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Save size={14} className="inline mr-2" />
                        Save Pipeline
                      </motion.button>
                      
                      <div className="grid grid-cols-2 gap-1">
                        <motion.button
                          onClick={() => setShowVersionManager(true)}
                          disabled={isProcessing || currentPipeline.length === 0}
                          className="px-2 py-1 bg-ml-dark-200 text-white rounded text-xs hover:bg-ml-dark-300 transition-colors disabled:opacity-50"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Network size={12} className="inline mr-1" />
                          Version
                        </motion.button>
                        <motion.button
                          onClick={() => setShowExportImport(true)}
                          className="px-2 py-1 bg-ml-dark-200 text-white rounded text-xs hover:bg-ml-dark-300 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Download size={12} className="inline mr-1" />
                          Export/Import
                        </motion.button>
                      </div>
                      
                      {templates && templates.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-ml-dark-400">Templates:</p>
                          {templates.slice(0, 2).map((template) => (
                            <motion.button
                              key={template.id}
                              onClick={() => applyTemplate(template)}
                              disabled={isProcessing}
                              className="w-full px-2 py-1 bg-ml-dark-200 text-white rounded text-xs hover:bg-ml-dark-300 transition-colors disabled:opacity-50"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {template.name}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Pipeline Steps */}
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold text-white">Pipeline Steps</h3>
                  {pipelines && pipelines.length > 0 && (
                    <div className="text-xs text-ml-dark-400">
                      {pipelines.length} saved pipeline{pipelines.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {currentPipeline.map((step, index) => (
                    <motion.div
                      key={step.id}
                      className="flex items-center gap-2 p-2 bg-ml-dark-200 rounded-md"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-6 h-6 bg-ml-blue-50 rounded-full flex items-center justify-center text-xs text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">
                          {step.type === 'handle_missing' && 'Handle Missing Values'}
                          {step.type === 'normalize' && 'Normalize Data'}
                          {step.type === 'encode_categorical' && 'Encode Categorical'}
                          {step.type === 'feature_engineering' && 'Feature Engineering'}
                          {step.type === 'split_data' && 'Split Data'}
                          {step.type === 'convert_to_tensor' && 'Convert to Tensor'}
                          {step.type === 'load' && 'Load Data'}
                          {step.type === 'reshape' && 'Reshape Data'}
                          {step.type === 'scale' && 'Scale Data'}
                        </p>
                        <p className="text-xs text-ml-dark-400">
                          {step.type === 'handle_missing' && `Strategy: ${step.parameters?.strategy || 'mean'}`}
                          {step.type === 'normalize' && `Method: ${step.parameters?.method || 'minmax'}`}
                          {step.type === 'encode_categorical' && `Method: ${step.parameters?.method || 'onehot'}`}
                          {step.type === 'feature_engineering' && `Action: ${step.parameters?.action || 'transform'}`}
                          {step.type === 'split_data' && `Train: ${Math.round((step.parameters?.splitRatios?.train || 0.7) * 100)}%`}
                          {step.type === 'load' && 'Data loaded successfully'}
                          {step.type === 'reshape' && 'Data reshaped'}
                          {step.type === 'scale' && 'Data scaled'}
                        </p>
                      </div>
                      <CheckCircle size={16} className="text-green-400" />
                    </motion.div>
                  ))}
                  {currentPipeline.length === 0 && (
                    <div className="text-center py-8">
                      <Circle size={32} className="mx-auto text-ml-dark-400 mb-2" />
                      <p className="text-ml-dark-400 text-sm">No transformations applied yet</p>
                    </div>
                  )}
                </div>

                {/* Saved Pipelines */}
                {pipelines && pipelines.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-white mb-3">Saved Pipelines</h4>
                    <div className="space-y-2">
                      {pipelines.slice(0, 3).map((pipeline) => (
                        <motion.div
                          key={pipeline._id}
                          className="flex items-center gap-2 p-2 bg-ml-dark-200/50 rounded-md hover:bg-ml-dark-200 transition-colors cursor-pointer"
                          onClick={() => loadPipeline(pipeline._id)}
                          whileHover={{ x: 2 }}
                        >
                          <div className="w-6 h-6 bg-ml-blue-50/20 rounded-full flex items-center justify-center">
                            <Play size={12} className="text-ml-blue-50" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-white font-medium">{pipeline.name}</p>
                            <p className="text-xs text-ml-dark-400">
                              {pipeline.steps.length} steps • {new Date(pipeline.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Show Actions Button */}
          {!showActionsPanel && (
            <motion.button
              onClick={() => setShowActionsPanel(true)}
              className="absolute left-4 top-20 z-10 p-2 bg-ml-dark-200 text-white rounded-md hover:bg-ml-dark-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Maximize size={16} />
            </motion.button>
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Data Explorer */}
            <div className="w-72 bg-ml-dark-100 border-r border-ml-dark-300 p-4 flex flex-col overflow-y-auto">
              <h3 className="text-md font-semibold mb-3 text-white">Data Explorer</h3>
              <div className="space-y-1 mb-4">
                {columns.map((col) => {
                  const colStat = stats.find(s => s.column === col);
                  const isNumeric = colStat?.type === 'numeric';
                  const isSelected = selectedColumns.includes(col);
                  return (
                    <motion.div
                      key={col}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-ml-blue-50/20' : 'hover:bg-ml-dark-200'}`}
                      onClick={() => {
                        setSelectedColumns(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]);
                        if (isNumeric) {
                          if (!selectedXCol) setSelectedXCol(col);
                          else if (!selectedYCol && col !== selectedXCol) setSelectedYCol(col);
                        }
                      }}
                      whileHover={{ x: 2 }}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isNumeric ? 'bg-green-400' : 'bg-orange-400'}`}></span>
                        <span className={`text-sm ${isSelected ? 'text-white' : 'text-ml-dark-400'}`}>{col}</span>
                      </div>
                      {colStat && (
                        <span className="text-xs text-ml-dark-500">{isNumeric ? `Mean: ${colStat.mean?.toFixed(2)}` : `Unique: ${colStat.unique}`}</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Data Grid */}
            {activeView !== 'charts' && (
              <div className="flex-1 bg-ml-dark-100 border-r border-ml-dark-300 p-4 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold text-white">Data Grid ({previewData.rows.length} rows)</h3>
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-ml-blue-50">
                      <div className="w-4 h-4 border-2 border-ml-blue-50 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Processing...</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-auto border border-ml-dark-300 rounded-lg">
                  <table className="text-sm min-w-full whitespace-nowrap">
                    <thead className="bg-ml-dark-200 sticky top-0 z-10">
                      <tr>
                        {previewData.columns.map((col) => (
                          <th
                            key={`th_${col}`}
                            className={`text-left px-3 py-2 text-ml-dark-400 whitespace-nowrap ${selectedColumns.includes(col) ? 'bg-ml-blue-50/20 text-white' : ''}`}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.map((row, rowIndex) => (
                        <motion.tr
                          key={`r_${rowIndex}`}
                          className="border-t border-ml-dark-300"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15, delay: rowIndex * 0.01 }}
                        >
                          {row.map((value: any, colIndex: number) => {
                            const colName = previewData.columns[colIndex];
                            const isSelected = selectedColumns.includes(colName);
                            return (
                              <motion.td
                                key={`c_${rowIndex}_${colIndex}`}
                                className={`px-3 py-2 whitespace-nowrap ${isSelected ? 'bg-ml-blue-50/10 text-white' : 'text-ml-dark-400'}`}
                              >
                                {String(value)}
                              </motion.td>
                            );
                          })}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Visualizations */}
            <div className="w-96 bg-ml-dark-100 p-4 flex flex-col overflow-y-auto">
              <h3 className="text-md font-semibold mb-3 text-white">Visualizations</h3>
              <div className="flex space-x-1 bg-ml-dark-200 p-1 rounded-md mb-4">
                {['histogram', 'scatter', 'correlation'].map(tab => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveChartTab(tab as any)}
                    className={`flex-1 px-3 py-1 rounded-sm text-sm font-medium transition-colors capitalize ${activeChartTab === tab ? 'bg-ml-dark-100 text-white' : 'text-ml-dark-400 hover:text-white'}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tab}
                  </motion.button>
                ))}
              </div>
              <div className="flex-1">
                {activeChartTab === 'histogram' && (
                  <div className="h-64">
                    {histogramData.length > 0 ? (
                      <div className="h-full flex items-center justify-center bg-ml-dark-200 rounded-lg">
                        <div className="text-center">
                          <BarChart3 size={48} className="mx-auto text-ml-blue-50 mb-2" />
                          <p className="text-white text-sm">Histogram Chart</p>
                          <p className="text-ml-dark-400 text-xs">{histogramData.length} data points</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <BarChart3 size={48} className="mx-auto text-ml-dark-400 mb-2" />
                        <p className="text-ml-dark-400 text-sm">Select a numeric column to view histogram</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeChartTab === 'scatter' && (
                  <div className="h-64">
                    {scatterData.length > 0 ? (
                      <div className="h-full flex items-center justify-center bg-ml-dark-200 rounded-lg">
                        <div className="text-center">
                          <BarChart3 size={48} className="mx-auto text-ml-blue-50 mb-2" />
                          <p className="text-white text-sm">Scatter Plot</p>
                          <p className="text-ml-dark-400 text-xs">{scatterData.length} data points</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <BarChart3 size={48} className="mx-auto text-ml-dark-400 mb-2" />
                        <p className="text-ml-dark-400 text-sm">Select two numeric columns for scatter plot</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeChartTab === 'correlation' && (
                  <div className="h-64">
                    {correlationData.length > 0 ? (
                      <div className="h-full flex items-center justify-center bg-ml-dark-200 rounded-lg">
                        <div className="text-center">
                          <BarChart3 size={48} className="mx-auto text-ml-blue-50 mb-2" />
                          <p className="text-white text-sm">Correlation Matrix</p>
                          <p className="text-ml-dark-400 text-xs">{correlationData.length} correlations</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <BarChart3 size={48} className="mx-auto text-ml-dark-400 mb-2" />
                        <p className="text-ml-dark-400 text-sm">Need at least 2 numeric columns for correlation</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pipeline Manager Modal */}
      <AnimatePresence>
        {showPipelineManager && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-ml-dark-100 rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Save Pipeline</h3>
                <button
                  onClick={() => setShowPipelineManager(false)}
                  className="text-ml-dark-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Pipeline Name
                  </label>
                  <input
                    type="text"
                    value={pipelineName}
                    onChange={(e) => setPipelineName(e.target.value)}
                    placeholder="e.g., Rainfall Data Cleaning"
                    className="w-full px-3 py-2 bg-ml-dark-200 text-white rounded-md border border-ml-dark-300 focus:border-ml-blue-50 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={pipelineDescription}
                    onChange={(e) => setPipelineDescription(e.target.value)}
                    placeholder="Describe what this pipeline does..."
                    rows={3}
                    className="w-full px-3 py-2 bg-ml-dark-200 text-white rounded-md border border-ml-dark-300 focus:border-ml-blue-50 focus:outline-none resize-none"
                  />
                </div>

                <div className="bg-ml-dark-200 rounded-md p-3">
                  <h4 className="text-sm font-medium text-white mb-2">Pipeline Steps ({currentPipeline.length})</h4>
                  <div className="space-y-1">
                    {currentPipeline.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-2 text-xs text-ml-dark-400">
                        <span className="w-4 h-4 bg-ml-blue-50 rounded-full flex items-center justify-center text-white text-xs">
                          {index + 1}
                        </span>
                        <span>
                          {step.type === 'handle_missing' && 'Handle Missing Values'}
                          {step.type === 'normalize' && 'Normalize Data'}
                          {step.type === 'encode_categorical' && 'Encode Categorical'}
                          {step.type === 'feature_engineering' && 'Feature Engineering'}
                          {step.type === 'split_data' && 'Split Data'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={savePipeline}
                    disabled={!pipelineName.trim() || isProcessing}
                    className="flex-1 px-4 py-2 bg-ml-blue-50 text-white rounded-md hover:bg-ml-blue-50/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save size={16} className="inline mr-2" />
                    Save Pipeline
                  </motion.button>
                  <motion.button
                    onClick={() => setShowPipelineManager(false)}
                    className="px-4 py-2 bg-ml-dark-300 text-white rounded-md hover:bg-ml-dark-400 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version Manager Modal */}
      <AnimatePresence>
        {showVersionManager && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-ml-dark-100 rounded-lg p-6 w-full max-w-lg"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Pipeline Versioning</h3>
                <button
                  onClick={() => setShowVersionManager(false)}
                  className="text-ml-dark-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Select Pipeline to Version
                  </label>
                  <select
                    value={selectedPipelineForVersion || ''}
                    onChange={(e) => setSelectedPipelineForVersion(e.target.value || null)}
                    className="w-full px-3 py-2 bg-ml-dark-200 text-white rounded-md border border-ml-dark-300 focus:border-ml-blue-50 focus:outline-none"
                  >
                    <option value="">Select a pipeline...</option>
                    {pipelines?.map((pipeline) => (
                      <option key={pipeline._id} value={pipeline._id}>
                        {pipeline.name} (v{pipeline.version || 1})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPipelineForVersion && getPipelineVersions && (
                  <div className="bg-ml-dark-200 rounded-md p-3">
                    <h4 className="text-sm font-medium text-white mb-2">Existing Versions</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {getPipelineVersions.map((version) => (
                        <div key={version._id} className="flex items-center justify-between text-xs">
                          <span className="text-ml-dark-400">
                            v{version.version || 1} - {new Date(version.createdAt).toLocaleDateString()}
                          </span>
                          {version.isLatestVersion && (
                            <span className="text-green-400">Latest</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => selectedPipelineForVersion && createNewVersion(selectedPipelineForVersion)}
                    disabled={!selectedPipelineForVersion || isProcessing}
                    className="flex-1 px-4 py-2 bg-ml-blue-50 text-white rounded-md hover:bg-ml-blue-50/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Network size={16} className="inline mr-2" />
                    Create New Version
                  </motion.button>
                  <motion.button
                    onClick={() => setShowVersionManager(false)}
                    className="px-4 py-2 bg-ml-dark-300 text-white rounded-md hover:bg-ml-dark-400 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export/Import Modal */}
      <AnimatePresence>
        {showExportImport && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-ml-dark-100 rounded-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Export/Import Pipelines</h3>
                <button
                  onClick={() => setShowExportImport(false)}
                  className="text-ml-dark-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Export Section */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Export Pipeline</h4>
                  <select
                    onChange={(e) => e.target.value && exportPipelineToFile(e.target.value)}
                    className="w-full px-3 py-2 bg-ml-dark-200 text-white rounded-md border border-ml-dark-300 focus:border-ml-blue-50 focus:outline-none"
                  >
                    <option value="">Select pipeline to export...</option>
                    {pipelines?.map((pipeline) => (
                      <option key={pipeline._id} value={pipeline._id}>
                        {pipeline.name} (v{pipeline.version || 1})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Import Section */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Import Pipeline</h4>
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) importPipelineFromFile(file);
                    }}
                    className="w-full px-3 py-2 bg-ml-dark-200 text-white rounded-md border border-ml-dark-300 focus:border-ml-blue-50 focus:outline-none file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-ml-blue-50 file:text-white hover:file:bg-ml-blue-50/80"
                  />
                </div>

                <motion.button
                  onClick={() => setShowExportImport(false)}
                  className="w-full px-4 py-2 bg-ml-dark-300 text-white rounded-md hover:bg-ml-dark-400 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Authentication Modals */}
      <CustomSignIn 
        isOpen={showSignIn} 
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={handleSwitchToSignUp}
      />
      
      <CustomSignUp 
        isOpen={showSignUp} 
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
      
      <CustomSignOut 
        isOpen={showSignOut} 
        onClose={() => setShowSignOut(false)}
        user={user}
      />
    </motion.div>
  );
}

// Training Debugger Modal
function TrainingDebuggerModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-ml-dark-100 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Training Debugger</h2>
          <button
            onClick={onClose}
            className="text-ml-dark-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <TrainingDebugger />
      </motion.div>
    </motion.div>
  );
}

