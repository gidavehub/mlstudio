'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { customPaymentSystem, CustomContribution } from '@/lib/customPaymentSystem';

export default function CustomContributionCenter() {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'stats'>('upload');
  const [contributions, setContributions] = useState<CustomContribution[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form state for new contribution
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    token: 'MLT'
  });

  // Fetch real data from Convex
  const dataContributions = useQuery(api.dataContributions.list);
  const rewardTransactions = useQuery(api.rewardTransactions.list);

  // Load contributions
  useEffect(() => {
    if (dataContributions) {
      setContributions(customPaymentSystem.getContributions(dataContributions));
    }
  }, [dataContributions]);

  const handleSubmitContribution = async () => {
    if (!formData.name || !formData.description || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await customPaymentSystem.submitContribution({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        status: 'pending',
        reward: 0,
        token: formData.token
      });

      setTimeout(() => {
        setUploadProgress(100);
        setIsUploading(false);
        setShowUploadModal(false);
        setContributions(customPaymentSystem.getContributions());
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: '',
          token: 'MLT'
        });
        alert('Contribution submitted successfully!');
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      alert('Upload failed. Please try again.');
    }
  };

  const categories = [
    'Computer Vision',
    'Natural Language Processing',
    'Time Series',
    'Audio Processing',
    'Financial Data',
    'Healthcare',
    'E-commerce',
    'Other'
  ];

  const tokens = ['MLT', 'DATA', 'REWARD'];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      default: return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Computer Vision': return '👁️';
      case 'Natural Language Processing': return '📝';
      case 'Time Series': return '📊';
      case 'Audio Processing': return '🎵';
      case 'Financial Data': return '💰';
      case 'Healthcare': return '🏥';
      case 'E-commerce': return '🛒';
      default: return '📁';
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
                Custom Contribution Center
              </h1>
              <p className="text-ml-gray-300">
                Share your datasets and earn custom tokens for valuable contributions
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-ml-primary-600 hover:bg-ml-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span className="text-lg">➕</span>
              <span>New Contribution</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Total Contributions</p>
                  <p className="text-2xl font-bold text-white">{contributions.length}</p>
                </div>
                <span className="text-3xl">📁</span>
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-green-400">
                    {contributions.filter(c => c.status === 'approved').length}
                  </p>
                </div>
                <span className="text-3xl">✅</span>
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Total Rewards</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {contributions
                      .filter(c => c.reward > 0)
                      .reduce((sum, c) => sum + c.reward, 0)} Tokens
                  </p>
                </div>
                <span className="text-3xl">🎁</span>
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Rank</p>
                  <p className="text-2xl font-bold text-purple-400">#47</p>
                </div>
                <span className="text-3xl">🏆</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-ml-dark-100 rounded-lg p-1 mb-8">
            {[
              { id: 'upload', label: 'Upload Data', icon: '📤' },
              { id: 'manage', label: 'Manage Contributions', icon: '📋' },
              { id: 'stats', label: 'Statistics', icon: '📊' }
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
          {activeTab === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Upload Guidelines */}
              <div className="bg-ml-dark-100 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Contribution Guidelines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-green-400 mb-2">✅ What We Accept</h4>
                    <ul className="space-y-1 text-ml-gray-300 text-sm">
                      <li>• High-quality, clean datasets</li>
                      <li>• Proper documentation and metadata</li>
                      <li>• Original or properly licensed data</li>
                      <li>• Multiple formats: CSV, JSON, images, audio</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-red-400 mb-2">❌ What We Don't Accept</h4>
                    <ul className="space-y-1 text-ml-gray-300 text-sm">
                      <li>• Copyrighted or proprietary data</li>
                      <li>• Personal or sensitive information</li>
                      <li>• Low-quality or incomplete datasets</li>
                      <li>• Spam or irrelevant content</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Upload */}
              <div className="bg-ml-dark-100 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Quick Upload</h3>
                <div
                  onClick={() => setShowUploadModal(true)}
                  className="border-2 border-dashed border-ml-dark-300 hover:border-ml-primary-500 hover:bg-ml-primary-500/5 rounded-xl p-12 text-center transition-colors cursor-pointer"
                >
                  <span className="text-6xl mb-4 block">📤</span>
                  <p className="text-xl font-medium text-white mb-2">
                    Click to upload your dataset
                  </p>
                  <p className="text-ml-gray-400 mb-4">
                    or use the form below
                  </p>
                  <p className="text-sm text-ml-gray-500">
                    Supports CSV, JSON, images, audio, and text files
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'manage' && (
            <motion.div
              key="manage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-4">
                {contributions.map((contribution) => (
                  <div
                    key={contribution.id}
                    className="bg-ml-dark-100 rounded-xl p-6 hover:bg-ml-dark-200 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{getCategoryIcon(contribution.category)}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-white">
                              {contribution.name}
                            </h3>
                            <p className="text-ml-gray-400">{contribution.category}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contribution.status)}`}>
                            {getStatusIcon(contribution.status)} {contribution.status}
                          </span>
                        </div>
                        <p className="text-ml-gray-300 mb-3">{contribution.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-ml-gray-400">
                          <span>Token: {contribution.token}</span>
                          <span>•</span>
                          <span>{formatDate(contribution.createdAt)}</span>
                          {contribution.reward > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-yellow-400 font-medium">
                                {contribution.reward} {contribution.token} reward
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-ml-gray-400 hover:text-white transition-colors">
                          <span className="text-lg">👁️</span>
                        </button>
                        <button className="p-2 text-ml-gray-400 hover:text-white transition-colors">
                          <span className="text-lg">✏️</span>
                        </button>
                        <button className="p-2 text-ml-gray-400 hover:text-red-400 transition-colors">
                          <span className="text-lg">🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                {/* Performance Chart */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Contribution Performance</h3>
                  <div className="h-64 flex items-center justify-center text-ml-gray-400">
                    <div className="text-center">
                      <span className="text-6xl mb-4 block">📊</span>
                      <p>Performance charts coming soon</p>
                    </div>
                  </div>
                </div>

                {/* Rewards History */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Recent Rewards</h3>
                  <div className="space-y-3">
                    {contributions
                      .filter(c => c.reward > 0)
                      .slice(0, 5)
                      .map((contribution, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-white font-medium">{contribution.name}</p>
                            <p className="text-ml-gray-400 text-sm">{formatDate(contribution.createdAt)}</p>
                          </div>
                          <div className="text-yellow-400 font-semibold">
                            +{contribution.reward} {contribution.token}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowUploadModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-ml-dark-100 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Upload New Dataset</h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-ml-gray-400 hover:text-white transition-colors"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                      Dataset File *
                    </label>
                    <div className="border-2 border-dashed border-ml-dark-300 rounded-lg p-8 text-center">
                      <span className="text-6xl mb-4 block">📁</span>
                      <p className="text-white font-medium mb-2">
                        Choose your dataset file
                      </p>
                      <p className="text-ml-gray-400 text-sm">
                        CSV, JSON, images, audio, text files
                      </p>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                        Dataset Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                        placeholder="Enter dataset name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                      >
                        <option value="">Select category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                      placeholder="Describe your dataset, its purpose, and any relevant details..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                      Reward Token
                    </label>
                    <select
                      value={formData.token}
                      onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                      className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                    >
                      {tokens.map(token => (
                        <option key={token} value={token}>{token} Token</option>
                      ))}
                    </select>
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-ml-gray-300">Uploading...</span>
                        <span className="text-sm text-ml-gray-400">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-ml-dark-200 rounded-full h-2">
                        <div
                          className="bg-ml-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-4 pt-4 border-t border-ml-dark-300">
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="px-6 py-2 text-ml-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitContribution}
                      disabled={isUploading}
                      className="bg-ml-primary-600 hover:bg-ml-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {isUploading ? 'Uploading...' : 'Submit Contribution'}
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
