'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { customPaymentSystem, CustomDataset } from '@/lib/customPaymentSystem';

export default function CustomDataMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedToken, setSelectedToken] = useState('all');
  const [datasets, setDatasets] = useState<CustomDataset[]>([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<CustomDataset | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  // Fetch real data from Convex
  const marketplaceDatasets = useQuery(api.marketplace.list);
  const convexDatasets = useQuery(api.datasets.list);

  // Load datasets
  useEffect(() => {
    if (marketplaceDatasets) {
      setDatasets(customPaymentSystem.getDatasets(marketplaceDatasets));
    }
  }, [marketplaceDatasets]);

  // Filter datasets
  const filteredDatasets = datasets.filter(dataset => {
    if (searchQuery && !dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !dataset.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && dataset.category !== selectedCategory) {
      return false;
    }
    if (selectedToken !== 'all' && dataset.token !== selectedToken) {
      return false;
    }
    return true;
  });

  const categories = [
    'all',
    'Computer Vision',
    'Natural Language Processing',
    'Time Series',
    'Audio Processing',
    'Financial Data',
    'Healthcare',
    'E-commerce'
  ];

  const tokens = ['all', 'MLT', 'DATA', 'REWARD'];

  const handlePurchase = (dataset: CustomDataset) => {
    setSelectedDataset(dataset);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedDataset) return;

    setPurchasing(true);
    try {
      const result = await customPaymentSystem.purchaseDataset(selectedDataset.id, selectedDataset.token);
      if (result.success) {
        setDatasets(customPaymentSystem.getDatasets());
        setShowPurchaseModal(false);
        setSelectedDataset(null);
        alert(`Successfully purchased ${selectedDataset.name} for ${selectedDataset.price} ${selectedDataset.token} tokens!`);
      } else {
        alert('Purchase failed. Insufficient balance.');
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
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

  const getTokenIcon = (token: string) => {
    switch (token) {
      case 'MLT': return '🪙';
      case 'DATA': return '💾';
      case 'REWARD': return '🎁';
      default: return '🪙';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-lg ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ⭐
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-ml-dark-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Custom Data Marketplace
              </h1>
              <p className="text-ml-gray-300">
                Discover and purchase high-quality datasets with custom tokens
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-ml-primary-600 hover:bg-ml-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <span className="text-lg">📤</span>
                <span>Contribute Data</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-ml-dark-100 rounded-xl p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ml-gray-400 text-lg">🔍</span>
                <input
                  type="text"
                  placeholder="Search datasets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg pl-10 pr-4 py-3 text-white placeholder-ml-gray-400 focus:outline-none focus:ring-2 focus:ring-ml-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                  Payment Token
                </label>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                >
                  {tokens.map(token => (
                    <option key={token} value={token}>
                      {token === 'all' ? 'All Tokens' : `${token} Token`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-ml-gray-300">
            Showing {filteredDatasets.length} of {datasets.length} datasets
          </p>
        </div>

        {/* Datasets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDatasets.map((dataset) => (
            <motion.div
              key={dataset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="bg-ml-dark-100 rounded-xl p-6 hover:bg-ml-dark-200 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getCategoryIcon(dataset.category)}</div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">{dataset.name}</h3>
                    <p className="text-ml-gray-400 text-sm">{dataset.category}</p>
                  </div>
                </div>
                {dataset.verified && (
                  <span className="text-green-400 text-lg">✅</span>
                )}
              </div>

              <p className="text-ml-gray-300 text-sm mb-4 line-clamp-2">
                {dataset.description}
              </p>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(dataset.rating)}
                  <span className="text-ml-gray-400 text-sm ml-1">
                    ({dataset.rating})
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-ml-gray-400 text-sm">
                  <span className="text-lg">📥</span>
                  <span>{dataset.downloads}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getTokenIcon(dataset.token)}</span>
                  <span className="text-ml-primary-400 font-semibold">
                    {dataset.price} {dataset.token}
                  </span>
                </div>
                <div className="text-ml-gray-400 text-sm">
                  {dataset.size}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-ml-gray-400 mb-4">
                <span>by {dataset.owner}</span>
                <span>{formatDate(dataset.createdAt)}</span>
              </div>

              <button
                onClick={() => handlePurchase(dataset)}
                className="w-full bg-ml-primary-600 hover:bg-ml-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span className="text-lg">🛒</span>
                <span>Purchase</span>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDatasets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-white mb-2">No datasets found</h3>
            <p className="text-ml-gray-400 mb-6">
              Try adjusting your search criteria or browse all categories
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedToken('all');
              }}
              className="bg-ml-primary-600 hover:bg-ml-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Purchase Modal */}
        <AnimatePresence>
          {showPurchaseModal && selectedDataset && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowPurchaseModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-ml-dark-100 rounded-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Purchase Dataset</h2>
                  <button
                    onClick={() => setShowPurchaseModal(false)}
                    className="text-ml-gray-400 hover:text-white transition-colors"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-ml-dark-200 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">{selectedDataset.name}</h3>
                    <p className="text-ml-gray-300 text-sm mb-2">{selectedDataset.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-ml-gray-400">
                      <span>{selectedDataset.category}</span>
                      <span>•</span>
                      <span>{selectedDataset.size}</span>
                      <span>•</span>
                      <span>{selectedDataset.rating}⭐</span>
                    </div>
                  </div>

                  <div className="bg-ml-dark-200 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">Purchase Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-ml-gray-300">Dataset Price</span>
                        <span className="text-white">{selectedDataset.price} {selectedDataset.token}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ml-gray-300">Network Fee</span>
                        <span className="text-ml-gray-300">0.1 {selectedDataset.token}</span>
                      </div>
                      <div className="border-t border-ml-dark-300 pt-2">
                        <div className="flex justify-between">
                          <span className="text-white font-medium">Total</span>
                          <span className="text-ml-primary-400 font-bold">
                            {selectedDataset.price + 0.1} {selectedDataset.token}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-4">
                    <button
                      onClick={() => setShowPurchaseModal(false)}
                      className="px-6 py-2 text-ml-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmPurchase}
                      disabled={purchasing}
                      className="bg-ml-primary-600 hover:bg-ml-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {purchasing ? 'Processing...' : 'Confirm Purchase'}
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
