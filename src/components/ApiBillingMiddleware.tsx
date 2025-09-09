'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Wallet, Zap, CheckCircle, XCircle } from 'lucide-react';

interface ApiBillingContextType {
  userBalance: number;
  subscriptionPlan: string;
  checkApiCall: (endpoint: string, quantity?: number) => Promise<boolean>;
  deductForApiCall: (endpoint: string, quantity?: number, requestData?: any, responseData?: any, statusCode?: number, responseTime?: number) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ApiBillingContext = createContext<ApiBillingContextType | null>(null);

export const useApiBilling = () => {
  const context = useContext(ApiBillingContext);
  if (!context) {
    throw new Error('useApiBilling must be used within ApiBillingProvider');
  }
  return context;
};

interface ApiBillingProviderProps {
  children: React.ReactNode;
}

export const ApiBillingProvider: React.FC<ApiBillingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [pendingApiCall, setPendingApiCall] = useState<{
    endpoint: string;
    quantity?: number;
    requestData?: any;
    responseData?: any;
    statusCode?: number;
    responseTime?: number;
  } | null>(null);

  // Get user balance
  const balanceQuery = useQuery(api.apiBilling.getUserBalance);
  const balanceData = balanceQuery;
  const balanceLoading = balanceQuery === undefined;
  const userBalance = balanceData?.kaleBalance || 0;
  const subscriptionPlan = balanceData?.subscriptionPlan || 'free';

  // Mutations
  const deductTokens = useMutation(api.apiBilling.deductTokens);
  const addTokens = useMutation(api.apiBilling.addTokens);

  const checkApiCall = async (endpoint: string, quantity?: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, we'll do a simple check
      // In a real implementation, you'd call the checkBalance query
      const baseCost = getApiCost(endpoint);
      const totalCost = baseCost * (quantity || 1);
      
      return userBalance >= totalCost;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deductForApiCall = async (
    endpoint: string,
    quantity?: number,
    requestData?: any,
    responseData?: any,
    statusCode: number = 200,
    responseTime: number = 0
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await deductTokens({
        endpoint,
        quantity,
        requestData,
        responseData,
        statusCode,
        responseTime,
      });

      // Show success notification
      setShowInsufficientBalance(false);
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes('Insufficient KALE balance')) {
        setShowInsufficientBalance(true);
        setPendingApiCall({
          endpoint,
          quantity,
          requestData,
          responseData,
          statusCode,
          responseTime,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getApiCost = (endpoint: string): number => {
    const pricing: Record<string, number> = {
      'train_model': 10,
      'predict': 1,
      'batch_predict': 0.5,
      'upload_dataset': 5,
      'process_data': 2,
      'transform_data': 3,
      'deploy_model': 15,
      'update_model': 5,
      'delete_model': 2,
      'get_metrics': 0.5,
      'get_training_history': 1,
      'browse_datasets': 0.1,
      'download_dataset': 2,
      'contribute_data': 3,
      'validate_data': 1,
    };
    return pricing[endpoint] || 1;
  };

  const handleAddTokens = async () => {
    try {
      await addTokens({
        amount: 100, // Add 100 KALE tokens
        description: "Token purchase for API usage",
        transactionType: "subscription_payment",
      });
      setShowInsufficientBalance(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const contextValue: ApiBillingContextType = {
    userBalance,
    subscriptionPlan,
    checkApiCall,
    deductForApiCall,
    isLoading: isLoading || balanceLoading,
    error,
  };

  // Don't render children until Convex is ready
  if (balanceQuery === undefined) {
    return (
      <div className="min-h-screen bg-ml-dark-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ml-blue-50 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ml-dark-400">Loading billing system...</p>
        </div>
      </div>
    );
  }

  return (
    <ApiBillingContext.Provider value={contextValue}>
      {children}
      
      {/* Insufficient Balance Modal */}
      <AnimatePresence>
        {showInsufficientBalance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-ml-dark-50 rounded-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Insufficient KALE Balance</h3>
                  <p className="text-ml-dark-400 text-sm">You don't have enough tokens for this API call</p>
                </div>
              </div>

              <div className="bg-ml-dark-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-ml-dark-400">Current Balance:</span>
                  <span className="text-white font-semibold">{userBalance} KALE</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-ml-dark-400">Required:</span>
                  <span className="text-red-400 font-semibold">
                    {pendingApiCall ? getApiCost(pendingApiCall.endpoint) * (pendingApiCall.quantity || 1) : 0} KALE
                  </span>
                </div>
                <div className="border-t border-ml-dark-300 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold">Shortfall:</span>
                    <span className="text-red-400 font-bold">
                      {pendingApiCall ? Math.max(0, (getApiCost(pendingApiCall.endpoint) * (pendingApiCall.quantity || 1)) - userBalance) : 0} KALE
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <motion.button
                  onClick={handleAddTokens}
                  className="w-full bg-gradient-to-r from-ml-blue-50 to-purple-600 hover:from-ml-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Wallet className="w-4 h-4" />
                  Add 100 KALE Tokens
                </motion.button>
                
                <button
                  onClick={() => setShowInsufficientBalance(false)}
                  className="w-full bg-ml-dark-300 hover:bg-ml-dark-400 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-ml-dark-400 text-xs">
                  Earn KALE tokens by contributing data to our marketplace
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Notification */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 bg-red-600/20 border border-red-500/30 rounded-lg p-4 z-50 max-w-sm"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ApiBillingContext.Provider>
  );
};

// Hook for easy API billing integration
export const useApiCall = () => {
  const { deductForApiCall, checkApiCall, userBalance, isLoading } = useApiBilling();

  const makeApiCall = async (
    endpoint: string,
    apiFunction: () => Promise<any>,
    quantity?: number
  ) => {
    try {
      // Check balance first
      const hasBalance = await checkApiCall(endpoint, quantity);
      if (!hasBalance) {
        throw new Error('Insufficient KALE balance');
      }

      // Make the actual API call
      const startTime = Date.now();
      const result = await apiFunction();
      const responseTime = Date.now() - startTime;

      // Deduct tokens after successful API call
      await deductForApiCall(endpoint, quantity, undefined, result, 200, responseTime);

      return result;
    } catch (error) {
      // Deduct tokens even for failed calls (but at reduced rate)
      await deductForApiCall(endpoint, quantity, undefined, undefined, 500, 0);
      throw error;
    }
  };

  return {
    makeApiCall,
    userBalance,
    isLoading,
  };
};
