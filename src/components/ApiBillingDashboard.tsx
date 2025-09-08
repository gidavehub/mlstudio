'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  BarChart3,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useApiBilling } from './ApiBillingMiddleware';

const ApiBillingDashboard: React.FC = () => {
  const { userBalance, subscriptionPlan, isLoading } = useApiBilling();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize user balance if needed
  const initializeBalance = useMutation(api.migrations.initializeUserBalance);
  
  // Auto-initialize balance for new users
  React.useEffect(() => {
    if (userBalance === 0 && !isLoading) {
      const initBalance = async () => {
        try {
          setIsInitializing(true);
          await initializeBalance({});
        } catch (error) {
          console.error('Failed to initialize balance:', error);
        } finally {
          setIsInitializing(false);
        }
      };
      initBalance();
    }
  }, [userBalance, isLoading, initializeBalance]);

  // Get usage history
  const usageQuery = useQuery(api.apiBilling.getUsageHistory, {
    limit: 100
  });
  const usageData = usageQuery?.data;
  const usageLoading = usageQuery?.isLoading || false;

  // Get API pricing
  const pricingQuery = useQuery(api.apiBilling.getApiPricing);
  const pricingData = pricingQuery?.data;

  // Get subscription benefits
  const benefitsQuery = useQuery(api.apiBilling.getSubscriptionBenefits);
  const benefitsData = benefitsQuery?.data;

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} KALE`;
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'text-slate-400 bg-slate-400/10';
      case 'pro': return 'text-blue-400 bg-blue-400/10';
      case 'enterprise': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return <Wallet className="w-4 h-4" />;
      case 'pro': return <Zap className="w-4 h-4" />;
      case 'enterprise': return <CheckCircle className="w-4 h-4" />;
      default: return <Wallet className="w-4 h-4" />;
    }
  };

  // Calculate usage stats
  const totalTokensUsed = usageData?.totalTokensUsed || 0;
  const totalApiCalls = usageData?.usageLogs?.length || 0;
  const avgTokensPerCall = totalApiCalls > 0 ? totalTokensUsed / totalApiCalls : 0;

  // Get top endpoints
  const endpointUsage = usageData?.usageLogs?.reduce((acc: Record<string, number>, log: any) => {
    acc[log.endpoint] = (acc[log.endpoint] || 0) + log.tokensUsed;
    return acc;
  }, {}) || {};

  const topEndpoints = Object.entries(endpointUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Don't render until queries are ready
  if (usageQuery === undefined || pricingQuery === undefined || benefitsQuery === undefined) {
    return (
      <div className="min-h-screen bg-ml-dark-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-ml-blue-50 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ml-dark-400">Loading API billing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ml-dark-50 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
      <div className="max-w-6xl mx-auto pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">API Billing Dashboard</h1>
          <p className="text-ml-dark-400">
            Monitor your KALE token usage and manage API billing
          </p>
        </motion.div>

        {/* Balance and Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-ml-dark-200 to-ml-dark-300 rounded-xl p-6 border border-ml-dark-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-yellow-400" />
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(subscriptionPlan)}`}>
                {getPlanIcon(subscriptionPlan)}
                <span className="capitalize">{subscriptionPlan}</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {formatCurrency(userBalance)}
            </h3>
            <p className="text-ml-dark-400 text-sm">Available KALE Tokens</p>
          </motion.div>

          {/* Total Usage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-ml-dark-200 to-ml-dark-300 rounded-xl p-6 border border-ml-dark-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {formatCurrency(totalTokensUsed)}
            </h3>
            <p className="text-ml-dark-400 text-sm">Total Tokens Used</p>
          </motion.div>

          {/* API Calls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-ml-dark-200 to-ml-dark-300 rounded-xl p-6 border border-ml-dark-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">
              {totalApiCalls.toLocaleString()}
            </h3>
            <p className="text-ml-dark-400 text-sm">Total API Calls</p>
          </motion.div>
        </div>

        {/* Usage Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Endpoints */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-ml-dark-200 rounded-xl p-6 border border-ml-dark-300"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Top API Endpoints
            </h3>
            <div className="space-y-3">
              {topEndpoints.map(([endpoint, tokens], index) => (
                <div key={endpoint} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">
                      {index + 1}
                    </div>
                    <span className="text-white font-medium">{endpoint}</span>
                  </div>
                  <span className="text-ml-dark-400 font-semibold">
                    {formatCurrency(tokens)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Usage Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-ml-dark-200 rounded-xl p-6 border border-ml-dark-300"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Usage Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-ml-dark-400">Average per Call</span>
                <span className="text-white font-semibold">
                  {formatCurrency(avgTokensPerCall)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ml-dark-400">Current Plan</span>
                <span className="text-white font-semibold capitalize">
                  {subscriptionPlan}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ml-dark-400">Discount</span>
                <span className="text-green-400 font-semibold">
                  {benefitsData?.benefits?.discountMultiplier ? 
                    `${Math.round((1 - benefitsData.benefits.discountMultiplier) * 100)}%` : 
                    '0%'
                  }
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Usage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-ml-dark-200 rounded-xl p-6 border border-ml-dark-300"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Recent API Usage
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ml-dark-300">
                  <th className="text-left text-ml-dark-400 py-3 px-2">Endpoint</th>
                  <th className="text-left text-ml-dark-400 py-3 px-2">Tokens Used</th>
                  <th className="text-left text-ml-dark-400 py-3 px-2">Status</th>
                  <th className="text-left text-ml-dark-400 py-3 px-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {usageData?.usageLogs?.slice(0, 10).map((log: any, index: number) => (
                  <tr key={index} className="border-b border-ml-dark-300/50">
                    <td className="py-3 px-2 text-white font-medium">{log.endpoint}</td>
                    <td className="py-3 px-2 text-ml-dark-400">{formatCurrency(log.tokensUsed)}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.statusCode === 200 
                          ? 'text-green-400 bg-green-400/10' 
                          : 'text-red-400 bg-red-400/10'
                      }`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-ml-dark-400 text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* API Pricing Reference */}
        {pricingData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 bg-ml-dark-200 rounded-xl p-6 border border-ml-dark-300"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              API Pricing Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(pricingData.pricing).map(([endpoint, price]) => (
                <div key={endpoint} className="bg-ml-dark-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{endpoint}</span>
                    <span className="text-yellow-400 font-bold">{price} KALE</span>
                  </div>
                  <p className="text-ml-dark-400 text-sm">
                    {endpoint.includes('predict') && 'Prediction endpoint'}
                    {endpoint.includes('train') && 'Model training'}
                    {endpoint.includes('upload') && 'Data upload'}
                    {endpoint.includes('process') && 'Data processing'}
                    {endpoint.includes('deploy') && 'Model deployment'}
                    {endpoint.includes('browse') && 'Dataset browsing'}
                    {endpoint.includes('download') && 'Dataset download'}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ApiBillingDashboard;
