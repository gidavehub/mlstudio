'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { DollarSign, TrendingUp, Download, Clock, CheckCircle, Star, Gift, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Reward {
  id: string;
  datasetName: string;
  amount: number;
  currency: 'KALE' | 'USD';
  type: 'contribution' | 'validation' | 'bonus';
  status: 'pending' | 'completed' | 'failed';
  date: string;
  description: string;
}

interface RewardStats {
  totalEarned: number;
  pendingRewards: number;
  completedRewards: number;
  totalDatasets: number;
  averageReward: number;
}

export default function RewardTracker() {
  // Fetch real data from Convex
  const rewardTransactions = useQuery(api.rewardTransactions.list);
  const dataContributions = useQuery(api.dataContributions.list);

  // Transform Convex data to Reward format
  const rewards: Reward[] = rewardTransactions?.map(tx => ({
    id: tx._id,
    datasetName: tx.relatedId ? `Dataset ${tx.relatedId.slice(-4)}` : 'Unknown Dataset',
    amount: tx.amount,
    currency: 'KALE' as const,
    type: tx.transactionType === 'contribution_reward' ? 'contribution' as const : 
          tx.transactionType === 'api_usage' ? 'validation' as const : 'bonus' as const,
    status: tx.status === 'completed' ? 'completed' as const : 
            tx.status === 'pending' ? 'pending' as const : 'failed' as const,
    date: new Date(tx.createdAt).toISOString().split('T')[0],
    description: tx.description
  })) || [];

  // Calculate stats from real data
  const stats: RewardStats = {
    totalEarned: rewards.reduce((sum, reward) => 
      reward.status === 'completed' ? sum + reward.amount : sum, 0
    ),
    pendingRewards: rewards.reduce((sum, reward) => 
      reward.status === 'pending' ? sum + reward.amount : sum, 0
    ),
    completedRewards: rewards.reduce((sum, reward) => 
      reward.status === 'completed' ? sum + reward.amount : sum, 0
    ),
    totalDatasets: dataContributions?.length || 0,
    averageReward: rewards.length > 0 ? 
      rewards.reduce((sum, reward) => sum + reward.amount, 0) / rewards.length : 0
  };
  const [filterType, setFilterType] = useState<'all' | 'contribution' | 'validation' | 'bonus'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');

  const filteredRewards = rewards.filter(reward => {
    const typeMatch = filterType === 'all' || reward.type === filterType;
    const statusMatch = filterStatus === 'all' || reward.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contribution':
        return 'text-blue-400 bg-blue-400/10';
      case 'validation':
        return 'text-green-400 bg-green-400/10';
      case 'bonus':
        return 'text-purple-400 bg-purple-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return <Download size={16} />;
      case 'validation':
        return <CheckCircle size={16} />;
      case 'bonus':
        return <Gift size={16} />;
      default:
        return <Star size={16} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'failed':
        return <ArrowDownRight size={16} />;
      default:
        return <Star size={16} />;
    }
  };

  return (
    <div className="bg-ml-dark-50 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
      <div className="max-w-5xl mx-auto pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Reward Tracker</h1>
          <p className="text-slate-300 text-lg">
            Track your earnings and rewards from data contributions
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-md rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3">
              <DollarSign className="text-green-400" size={24} />
              <div>
                <p className="text-slate-300 text-sm">Total Earned</p>
                <p className="text-2xl font-bold text-white">{stats.totalEarned} KALE</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-md rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-400" size={24} />
              <div>
                <p className="text-slate-300 text-sm">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pendingRewards} KALE</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-blue-400" size={24} />
              <div>
                <p className="text-slate-300 text-sm">Avg Reward</p>
                <p className="text-2xl font-bold text-white">{stats.averageReward} KALE</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3">
              <Star className="text-purple-400" size={24} />
              <div>
                <p className="text-slate-300 text-sm">Datasets</p>
                <p className="text-2xl font-bold text-white">{stats.totalDatasets}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 mb-8 border border-slate-700"
        >
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all" className="bg-slate-800">All Types</option>
                <option value="contribution" className="bg-slate-800">Contributions</option>
                <option value="validation" className="bg-slate-800">Validations</option>
                <option value="bonus" className="bg-slate-800">Bonuses</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all" className="bg-slate-800">All Status</option>
                <option value="pending" className="bg-slate-800">Pending</option>
                <option value="completed" className="bg-slate-800">Completed</option>
                <option value="failed" className="bg-slate-800">Failed</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Rewards List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          {filteredRewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(reward.type)}`}>
                      {getTypeIcon(reward.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{reward.datasetName}</h3>
                      <p className="text-slate-400 text-sm">{reward.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">{reward.amount} {reward.currency}</p>
                    <p className="text-slate-400 text-sm">{reward.date}</p>
                  </div>
                  
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reward.status)}`}>
                    {getStatusIcon(reward.status)}
                    <span className="capitalize">{reward.status}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredRewards.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Gift className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">No rewards found</h3>
            <p className="text-slate-400">Try adjusting your filters or start contributing data</p>
          </motion.div>
        )}

        {/* Withdrawal Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Withdraw Rewards</h3>
              <p className="text-slate-300 text-sm">Transfer your KALE tokens to your wallet</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-slate-300 text-sm">Available Balance</p>
                <p className="text-2xl font-bold text-white">{stats.completedRewards} KALE</p>
              </div>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2">
                <Wallet size={20} />
                Withdraw
              </button>
            </div>
          </div>
        </motion.div>

        {/* Integration Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">KALE Integration</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-400" size={16} />
                <span>Proof-of-work farming rewards</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-400" size={16} />
                <span>Community governance participation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-400" size={16} />
                <span>Staking and harvesting</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Reflector Integration</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-400" size={16} />
                <span>Real-time price feeds</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-400" size={16} />
                <span>Cross-asset pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-400" size={16} />
                <span>DAO governance</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
