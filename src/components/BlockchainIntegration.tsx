'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Zap, Database, CheckCircle } from 'lucide-react';

interface PriceFeed {
  asset: string;
  price: number;
  change24h: number;
  lastUpdated: string;
}

interface KALEReward {
  datasetId: string;
  datasetName: string;
  reward: number;
  status: 'pending' | 'completed';
  timestamp: string;
}

export default function BlockchainIntegration() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Fetch real data from Convex
  const rewardTransactions = useQuery(api.rewardTransactions.list);
  const dataContributions = useQuery(api.dataContributions.list);

  // Mock price feeds (these would come from external API in real implementation)
  const [priceFeeds, setPriceFeeds] = useState<PriceFeed[]>([
    {
      asset: 'XLM/USD',
      price: 0.125,
      change24h: 2.5,
      lastUpdated: new Date().toISOString()
    },
    {
      asset: 'KALE/USD',
      price: 0.045,
      change24h: -1.2,
      lastUpdated: new Date().toISOString()
    },
    {
      asset: 'BTC/USD',
      price: 43250.00,
      change24h: 1.8,
      lastUpdated: new Date().toISOString()
    },
    {
      asset: 'ETH/USD',
      price: 2650.00,
      change24h: 3.2,
      lastUpdated: new Date().toISOString()
    }
  ]);

  // Transform Convex data to KALE rewards format
  const kaleRewards: KALEReward[] = rewardTransactions?.map(tx => ({
    datasetId: tx.relatedId || tx._id,
    datasetName: tx.relatedId ? `Dataset ${tx.relatedId.slice(-4)}` : 'Unknown Dataset',
    reward: tx.amount,
    status: tx.status === 'completed' ? 'completed' as const : 'pending' as const,
    timestamp: new Date(tx.createdAt).toISOString()
  })) || [];

  const connectToBlockchain = async () => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Connection successful - data is already loaded from Convex
    setConnectionStatus('connected');
    setIsLoading(false);
  };

  const refreshData = async () => {
    setIsLoading(true);
    
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update prices with small random changes
    setPriceFeeds(prev => prev.map(feed => ({
      ...feed,
      price: feed.price * (1 + (Math.random() - 0.5) * 0.02),
      change24h: feed.change24h + (Math.random() - 0.5) * 2,
      lastUpdated: new Date().toISOString()
    })));
    
    setIsLoading(false);
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  return (
    <div className="min-h-screen bg-ml-dark-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Blockchain Integration</h1>
          <p className="text-slate-300 text-lg">
            Connect to Stellar, Reflector Oracle, and KALE Protocol
          </p>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 mb-8 border border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400' : 
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 
                'bg-red-400'
              }`} />
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {connectionStatus === 'connected' ? 'Connected to Stellar Network' :
                   connectionStatus === 'connecting' ? 'Connecting...' :
                   'Disconnected'}
                </h3>
                <p className="text-slate-400 text-sm">
                  {connectionStatus === 'connected' ? 'Reflector Oracle & KALE Protocol Active' :
                   connectionStatus === 'connecting' ? 'Establishing connection...' :
                   'Click connect to start'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={refreshData}
                disabled={connectionStatus !== 'connected' || isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
              
              <button
                onClick={connectToBlockchain}
                disabled={connectionStatus === 'connected' || isLoading}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <Zap size={16} />
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </motion.div>

        {connectionStatus === 'connected' && (
          <>
            {/* Reflector Price Feeds */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Database className="text-blue-400" size={24} />
                <h2 className="text-2xl font-bold text-white">Reflector Price Feeds</h2>
                <span className="px-2 py-1 bg-blue-400/10 text-blue-400 text-xs rounded-full">
                  Live Oracle Data
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {priceFeeds.map((feed, index) => (
                  <motion.div
                    key={feed.asset}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{feed.asset}</h3>
                      <div className={`flex items-center gap-1 ${getChangeColor(feed.change24h)}`}>
                        {getChangeIcon(feed.change24h)}
                        <span className="text-sm font-medium">{Math.abs(feed.change24h).toFixed(2)}%</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-3xl font-bold text-white">
                        ${feed.price.toLocaleString(undefined, { 
                          minimumFractionDigits: feed.price < 1 ? 4 : 2,
                          maximumFractionDigits: feed.price < 1 ? 4 : 2
                        })}
                      </p>
                    </div>
                    
                    <div className="text-slate-400 text-xs">
                      Updated: {new Date(feed.lastUpdated).toLocaleTimeString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* KALE Rewards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Zap className="text-yellow-400" size={24} />
                <h2 className="text-2xl font-bold text-white">KALE Protocol Rewards</h2>
                <span className="px-2 py-1 bg-yellow-400/10 text-yellow-400 text-xs rounded-full">
                  Proof-of-Work Farming
                </span>
              </div>
              
              <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700">
                <div className="space-y-4">
                  {kaleRewards.map((reward, index) => (
                    <motion.div
                      key={reward.datasetId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          reward.status === 'completed' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'
                        }`}>
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{reward.datasetName}</h3>
                          <p className="text-slate-400 text-sm">
                            Dataset ID: {reward.datasetId}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-yellow-400">{reward.reward} KALE</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reward.status === 'completed' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'
                          }`}>
                            {reward.status}
                          </span>
                          <span className="text-slate-400 text-xs">
                            {new Date(reward.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-300 text-sm">Total Earned</p>
                      <p className="text-3xl font-bold text-yellow-400">
                        {kaleRewards.reduce((sum, reward) => sum + reward.reward, 0)} KALE
                      </p>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2">
                      <DollarSign size={20} />
                      Harvest Rewards
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Integration Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Reflector Oracle</h3>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={16} />
                    <span>No account required - Direct smart contract access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={16} />
                    <span>Real-time price feeds for multiple assets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={16} />
                    <span>Decentralized oracle network</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={16} />
                    <span>DAO governance for price validation</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">KALE Protocol</h3>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={16} />
                    <span>Proof-of-work farming rewards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={16} />
                    <span>Community-driven validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={16} />
                    <span>Staking and harvesting system</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-400" size={16} />
                    <span>Fair reward distribution</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
