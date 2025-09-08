'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Coins, TrendingUp, Users, Award, Zap, Shield, Star,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertCircle,
  Wallet, Send, Receive, History, Settings, RefreshCw,
  DollarSign, Target, Activity, BarChart3, PieChart, X
} from 'lucide-react';

interface KaleBalance {
  total: number;
  staked: number;
  available: number;
  pending: number;
}

interface StakingInfo {
  totalStaked: number;
  stakingRewards: number;
  stakingAPY: number;
  unstakingPeriod: number;
  validatorCount: number;
}

interface Transaction {
  id: string;
  type: 'reward' | 'stake' | 'unstake' | 'transfer' | 'contribution';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  description: string;
  hash?: string;
}

interface KaleStats {
  price: number;
  marketCap: number;
  totalSupply: number;
  circulatingSupply: number;
  stakingRatio: number;
  dailyVolume: number;
  priceChange24h: number;
}

export default function KaleIntegration() {
  const [activeTab, setActiveTab] = useState<'wallet' | 'staking' | 'rewards' | 'stats'>('wallet');
  const [balance, setBalance] = useState<KaleBalance>({
    total: 2450.75,
    staked: 1000.00,
    available: 1400.75,
    pending: 50.00
  });
  const [stakingInfo, setStakingInfo] = useState<StakingInfo>({
    totalStaked: 1000.00,
    stakingRewards: 25.50,
    stakingAPY: 12.5,
    unstakingPeriod: 7,
    validatorCount: 15
  });
  const [kaleStats, setKaleStats] = useState<KaleStats>({
    price: 0.25,
    marketCap: 2500000,
    totalSupply: 10000000,
    circulatingSupply: 8000000,
    stakingRatio: 0.35,
    dailyVolume: 125000,
    priceChange24h: 5.2
  });
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'reward',
      amount: 150,
      status: 'completed',
      timestamp: Date.now() - 86400000 * 2,
      description: 'Data contribution reward - E-commerce Product Images',
      hash: '0x1234...5678'
    },
    {
      id: '2',
      type: 'stake',
      amount: 500,
      status: 'completed',
      timestamp: Date.now() - 86400000 * 5,
      description: 'Staked KALE tokens for validation rewards',
      hash: '0x2345...6789'
    },
    {
      id: '3',
      type: 'reward',
      amount: 75,
      status: 'completed',
      timestamp: Date.now() - 86400000 * 7,
      description: 'Data contribution reward - Customer Reviews Dataset',
      hash: '0x3456...7890'
    },
    {
      id: '4',
      type: 'reward',
      amount: 200,
      status: 'pending',
      timestamp: Date.now() - 3600000 * 2,
      description: 'Data contribution reward - Stock Price Time Series',
    }
  ]);

  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showUnstakeModal, setShowUnstakeModal] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setKaleStats(prev => ({
        ...prev,
        price: prev.price + (Math.random() - 0.5) * 0.01,
        priceChange24h: prev.priceChange24h + (Math.random() - 0.5) * 0.5
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleStake = async () => {
    const amount = parseFloat(stakeAmount);
    if (amount <= 0 || amount > balance.available) {
      alert('Invalid stake amount');
      return;
    }

    try {
      // Simulate staking transaction
      setBalance(prev => ({
        ...prev,
        available: prev.available - amount,
        staked: prev.staked + amount
      }));

      setStakingInfo(prev => ({
        ...prev,
        totalStaked: prev.totalStaked + amount
      }));

      setTransactions(prev => [{
        id: Date.now().toString(),
        type: 'stake',
        amount,
        status: 'completed',
        timestamp: Date.now(),
        description: 'Staked KALE tokens for validation rewards',
        hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`
      }, ...prev]);

      setShowStakeModal(false);
      setStakeAmount('');
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  const handleUnstake = async () => {
    const amount = parseFloat(unstakeAmount);
    if (amount <= 0 || amount > stakingInfo.totalStaked) {
      alert('Invalid unstake amount');
      return;
    }

    try {
      // Simulate unstaking transaction
      setBalance(prev => ({
        ...prev,
        staked: prev.staked - amount,
        pending: prev.pending + amount
      }));

      setStakingInfo(prev => ({
        ...prev,
        totalStaked: prev.totalStaked - amount
      }));

      setTransactions(prev => [{
        id: Date.now().toString(),
        type: 'unstake',
        amount,
        status: 'pending',
        timestamp: Date.now(),
        description: 'Unstaked KALE tokens (7-day cooldown)',
      }, ...prev]);

      setShowUnstakeModal(false);
      setUnstakeAmount('');
    } catch (error) {
      console.error('Unstaking failed:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'reward': return Award;
      case 'stake': return Shield;
      case 'unstake': return ArrowUpRight;
      case 'transfer': return Send;
      case 'contribution': return Users;
      default: return Activity;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'reward': return 'text-green-400';
      case 'stake': return 'text-blue-400';
      case 'unstake': return 'text-yellow-400';
      case 'transfer': return 'text-purple-400';
      case 'contribution': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'pending': return Clock;
      case 'failed': return AlertCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-ml-dark-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                KALE Token Integration
              </h1>
              <p className="text-ml-gray-300">
                Manage your KALE tokens, stake for rewards, and track your earnings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-ml-dark-100 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-medium">KALE</span>
                </div>
              </div>
            </div>
          </div>

          {/* KALE Price Card */}
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl p-6 mb-8 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">KALE Token</h2>
                <p className="text-ml-gray-300">Current Price</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-400 mb-1">
                  ${kaleStats.price.toFixed(4)}
                </div>
                <div className={`flex items-center space-x-1 ${
                  kaleStats.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {kaleStats.priceChange24h >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span>{Math.abs(kaleStats.priceChange24h).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Total Balance</p>
                  <p className="text-2xl font-bold text-white">{balance.total.toFixed(2)}</p>
                </div>
                <Coins className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Available</p>
                  <p className="text-2xl font-bold text-green-400">{balance.available.toFixed(2)}</p>
                </div>
                <Wallet className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Staked</p>
                  <p className="text-2xl font-bold text-blue-400">{balance.staked.toFixed(2)}</p>
                </div>
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">{balance.pending.toFixed(2)}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-ml-dark-100 rounded-lg p-1 mb-8">
            {[
              { id: 'wallet', label: 'Wallet', icon: Wallet },
              { id: 'staking', label: 'Staking', icon: Shield },
              { id: 'rewards', label: 'Rewards', icon: Award },
              { id: 'stats', label: 'Statistics', icon: BarChart3 }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-ml-primary-600 text-white'
                      : 'text-ml-gray-400 hover:text-white hover:bg-ml-dark-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'wallet' && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Transaction History */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
                    <button className="text-ml-primary-400 hover:text-ml-primary-300 transition-colors">
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {transactions.map((tx) => {
                      const Icon = getTransactionIcon(tx.type);
                      const StatusIcon = getStatusIcon(tx.status);
                      return (
                        <div key={tx.id} className="flex items-center space-x-4 p-3 bg-ml-dark-200 rounded-lg">
                          <div className={`p-2 rounded-lg ${getTransactionColor(tx.type)}/20`}>
                            <Icon className={`w-5 h-5 ${getTransactionColor(tx.type)}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-white font-medium">{tx.description}</p>
                              <div className="flex items-center space-x-2">
                                <span className={`font-semibold ${
                                  tx.type === 'reward' ? 'text-green-400' : 'text-white'
                                }`}>
                                  {tx.type === 'reward' ? '+' : ''}{tx.amount} KALE
                                </span>
                                <StatusIcon className={`w-4 h-4 ${getStatusColor(tx.status)}`} />
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-ml-gray-400">
                              <span>{formatDate(tx.timestamp)}</span>
                              {tx.hash && (
                                <span className="font-mono">{tx.hash}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowStakeModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Shield className="w-5 h-5" />
                      <span>Stake KALE</span>
                    </button>
                    <button
                      onClick={() => setShowUnstakeModal(true)}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                      <span>Unstake KALE</span>
                    </button>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                      <Send className="w-5 h-5" />
                      <span>Send KALE</span>
                    </button>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                      <Receive className="w-5 h-5" />
                      <span>Receive KALE</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'staking' && (
            <motion.div
              key="staking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Staking Overview */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Staking Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Total Staked</span>
                      <span className="text-white font-semibold">{stakingInfo.totalStaked.toFixed(2)} KALE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Staking Rewards</span>
                      <span className="text-green-400 font-semibold">+{stakingInfo.stakingRewards.toFixed(2)} KALE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">APY</span>
                      <span className="text-blue-400 font-semibold">{stakingInfo.stakingAPY}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Unstaking Period</span>
                      <span className="text-yellow-400 font-semibold">{stakingInfo.unstakingPeriod} days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Active Validators</span>
                      <span className="text-purple-400 font-semibold">{stakingInfo.validatorCount}</span>
                    </div>
                  </div>
                </div>

                {/* Staking Actions */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Staking Actions</h3>
                  <div className="space-y-4">
                    <div className="bg-ml-dark-200 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">Stake KALE</h4>
                      <p className="text-ml-gray-300 text-sm mb-4">
                        Stake your KALE tokens to earn validation rewards and support the network
                      </p>
                      <button
                        onClick={() => setShowStakeModal(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        Stake Now
                      </button>
                    </div>
                    <div className="bg-ml-dark-200 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">Unstake KALE</h4>
                      <p className="text-ml-gray-300 text-sm mb-4">
                        Unstake your tokens (7-day cooldown period applies)
                      </p>
                      <button
                        onClick={() => setShowUnstakeModal(true)}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        Unstake Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Rewards Summary */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Rewards Summary</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Total Earned</span>
                      <span className="text-green-400 font-semibold text-xl">2,450.75 KALE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">This Month</span>
                      <span className="text-blue-400 font-semibold">425.50 KALE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Data Contributions</span>
                      <span className="text-purple-400 font-semibold">1,850.25 KALE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Staking Rewards</span>
                      <span className="text-yellow-400 font-semibold">600.50 KALE</span>
                    </div>
                  </div>
                </div>

                {/* Reward Sources */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Reward Sources</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-600/20 p-2 rounded-lg">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Data Contributions</p>
                        <p className="text-ml-gray-400 text-sm">Earn rewards for sharing quality datasets</p>
                      </div>
                      <span className="text-purple-400 font-semibold">75%</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-600/20 p-2 rounded-lg">
                        <Shield className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">Staking Rewards</p>
                        <p className="text-ml-gray-400 text-sm">Earn APY by staking your KALE tokens</p>
                      </div>
                      <span className="text-blue-400 font-semibold">25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* KALE Statistics */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">KALE Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Market Cap</span>
                      <span className="text-white font-semibold">${kaleStats.marketCap.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Total Supply</span>
                      <span className="text-white font-semibold">{kaleStats.totalSupply.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Circulating Supply</span>
                      <span className="text-white font-semibold">{kaleStats.circulatingSupply.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Staking Ratio</span>
                      <span className="text-blue-400 font-semibold">{(kaleStats.stakingRatio * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Daily Volume</span>
                      <span className="text-green-400 font-semibold">${kaleStats.dailyVolume.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Performance</h3>
                  <div className="h-64 flex items-center justify-center text-ml-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                      <p>Performance charts coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stake Modal */}
        <AnimatePresence>
          {showStakeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowStakeModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-ml-dark-100 rounded-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Stake KALE</h2>
                  <button
                    onClick={() => setShowStakeModal(false)}
                    className="text-ml-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                      Amount to Stake
                    </label>
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                      placeholder="0.00"
                      min="0"
                      max={balance.available}
                    />
                    <p className="text-ml-gray-400 text-sm mt-1">
                      Available: {balance.available.toFixed(2)} KALE
                    </p>
                  </div>

                  <div className="bg-ml-dark-200 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Staking Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-ml-gray-300">APY</span>
                        <span className="text-blue-400">{stakingInfo.stakingAPY}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ml-gray-300">Unstaking Period</span>
                        <span className="text-yellow-400">{stakingInfo.unstakingPeriod} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-4">
                    <button
                      onClick={() => setShowStakeModal(false)}
                      className="px-6 py-2 text-ml-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStake}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Stake
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unstake Modal */}
        <AnimatePresence>
          {showUnstakeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowUnstakeModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-ml-dark-100 rounded-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Unstake KALE</h2>
                  <button
                    onClick={() => setShowUnstakeModal(false)}
                    className="text-ml-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                      Amount to Unstake
                    </label>
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                      placeholder="0.00"
                      min="0"
                      max={stakingInfo.totalStaked}
                    />
                    <p className="text-ml-gray-400 text-sm mt-1">
                      Staked: {stakingInfo.totalStaked.toFixed(2)} KALE
                    </p>
                  </div>

                  <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <h4 className="font-medium text-yellow-400">Cooldown Period</h4>
                    </div>
                    <p className="text-ml-gray-300 text-sm">
                      Your tokens will be locked for {stakingInfo.unstakingPeriod} days after unstaking before they become available.
                    </p>
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-4">
                    <button
                      onClick={() => setShowUnstakeModal(false)}
                      className="px-6 py-2 text-ml-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUnstake}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Unstake
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
