'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { customPaymentSystem, CustomToken, CustomTransaction } from '@/lib/customPaymentSystem';

export default function CustomTokenWallet() {
  const [activeTab, setActiveTab] = useState<'wallet' | 'transactions' | 'staking'>('wallet');
  const [tokens, setTokens] = useState<CustomToken[]>([]);
  const [transactions, setTransactions] = useState<CustomTransaction[]>([]);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('MLT');

  // Fetch real data from Convex
  const convexRewardTransactions = useQuery(api.rewardTransactions.list);
  const marketplaceDatasets = useQuery(api.marketplace.list);
  const dataContributions = useQuery(api.dataContributions.list);

  // Load data
  useEffect(() => {
    setTokens(customPaymentSystem.getTokens());
    if (convexRewardTransactions) {
      setTransactions(customPaymentSystem.getTransactions(convexRewardTransactions));
    }
  }, [convexRewardTransactions]);

  const handleStake = async () => {
    const amount = parseFloat(stakeAmount);
    if (amount <= 0) {
      alert('Invalid stake amount');
      return;
    }

    try {
      const result = await customPaymentSystem.stakeTokens(amount, selectedToken);
      if (result.success) {
        setTokens(customPaymentSystem.getTokens());
        setTransactions(customPaymentSystem.getTransactions());
        setShowStakeModal(false);
        setStakeAmount('');
        alert(`Successfully staked ${amount} ${selectedToken} tokens!`);
      } else {
        alert('Staking failed. Insufficient balance.');
      }
    } catch (error) {
      console.error('Staking failed:', error);
      alert('Staking failed. Please try again.');
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
      case 'reward': return '🎁';
      case 'purchase': return '🛒';
      case 'stake': return '🔒';
      case 'unstake': return '🔓';
      case 'transfer': return '💸';
      default: return '📊';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'reward': return 'text-green-400';
      case 'purchase': return 'text-blue-400';
      case 'stake': return 'text-purple-400';
      case 'unstake': return 'text-yellow-400';
      case 'transfer': return 'text-pink-400';
      default: return 'text-gray-400';
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
                Custom Token Wallet
              </h1>
              <p className="text-ml-gray-300">
                Manage your custom tokens and track transactions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-ml-dark-100 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🪙</span>
                  <span className="text-white font-medium">Custom Tokens</span>
                </div>
              </div>
            </div>
          </div>

          {/* Token Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tokens.map((token) => (
              <div key={token.symbol} className="bg-ml-dark-100 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{token.symbol}</h3>
                    <p className="text-ml-gray-400 text-sm">{token.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-ml-primary-400">
                      {token.balance.toFixed(2)}
                    </p>
                    <p className="text-ml-gray-400 text-sm">
                      ${token.price.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ml-gray-400 text-sm">24h Change</span>
                  <span className={`text-sm font-medium ${
                    token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-ml-dark-100 rounded-lg p-1 mb-8">
            {[
              { id: 'wallet', label: 'Wallet', icon: '💼' },
              { id: 'transactions', label: 'Transactions', icon: '📊' },
              { id: 'staking', label: 'Staking', icon: '🔒' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-ml-primary-600 text-white'
                    : 'text-ml-gray-400 hover:text-white hover:bg-ml-dark-200'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
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
                {/* Token Overview */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Token Overview</h3>
                  <div className="space-y-4">
                    {tokens.map((token) => (
                      <div key={token.symbol} className="flex items-center justify-between p-4 bg-ml-dark-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-ml-primary-600/20 rounded-lg flex items-center justify-center">
                            <span className="text-ml-primary-400 font-bold">{token.symbol}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{token.name}</p>
                            <p className="text-ml-gray-400 text-sm">{token.symbol}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">{token.balance.toFixed(2)}</p>
                          <p className="text-ml-gray-400 text-sm">${(token.balance * token.price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowStakeModal(true)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <span className="text-lg">🔒</span>
                      <span>Stake Tokens</span>
                    </button>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                      <span className="text-lg">💸</span>
                      <span>Send Tokens</span>
                    </button>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                      <span className="text-lg">📥</span>
                      <span>Receive Tokens</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-ml-dark-100 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Transaction History</h3>
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center space-x-4 p-4 bg-ml-dark-200 rounded-lg">
                      <div className="text-2xl">{getTransactionIcon(tx.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium">{tx.description}</p>
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${
                              tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.token}
                            </span>
                            <span className={`text-sm ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-ml-gray-400">
                          <span>{formatDate(tx.timestamp)}</span>
                          <span className="font-mono">{tx.hash}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                      <span className="text-white font-semibold">1,500.00 MLT</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Staking Rewards</span>
                      <span className="text-green-400 font-semibold">+125.50 MLT</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">APY</span>
                      <span className="text-blue-400 font-semibold">15.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Unstaking Period</span>
                      <span className="text-yellow-400 font-semibold">7 days</span>
                    </div>
                  </div>
                </div>

                {/* Staking Actions */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Staking Actions</h3>
                  <div className="space-y-4">
                    <div className="bg-ml-dark-200 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">Stake Tokens</h4>
                      <p className="text-ml-gray-300 text-sm mb-4">
                        Stake your tokens to earn rewards and support the network
                      </p>
                      <button
                        onClick={() => setShowStakeModal(true)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                      >
                        Stake Now
                      </button>
                    </div>
                    <div className="bg-ml-dark-200 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-2">Unstake Tokens</h4>
                      <p className="text-ml-gray-300 text-sm mb-4">
                        Unstake your tokens (7-day cooldown period applies)
                      </p>
                      <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                        Unstake Now
                      </button>
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
                  <h2 className="text-xl font-bold text-white">Stake Tokens</h2>
                  <button
                    onClick={() => setShowStakeModal(false)}
                    className="text-ml-gray-400 hover:text-white transition-colors"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                      Select Token
                    </label>
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                    >
                      {tokens.map(token => (
                        <option key={token.symbol} value={token.symbol}>
                          {token.symbol} - {token.name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      max={tokens.find(t => t.symbol === selectedToken)?.balance || 0}
                    />
                    <p className="text-ml-gray-400 text-sm mt-1">
                      Available: {tokens.find(t => t.symbol === selectedToken)?.balance.toFixed(2) || 0} {selectedToken}
                    </p>
                  </div>

                  <div className="bg-ml-dark-200 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Staking Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-ml-gray-300">APY</span>
                        <span className="text-blue-400">15.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ml-gray-300">Unstaking Period</span>
                        <span className="text-yellow-400">7 days</span>
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
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Stake
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
