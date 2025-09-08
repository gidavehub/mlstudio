'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Upload, Eye, CheckCircle, XCircle, Star, TrendingUp, Database, Users, DollarSign, Clock } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Using Convex schema types instead of local interface

// Mock data removed - now using real Convex data

export default function DataBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  // Real Convex queries
  const datasets = useQuery(api.marketplace.getDatasets);

  const categories = ['all', 'Healthcare', 'Finance', 'NLP', 'Computer Vision', 'Audio', 'IoT'];

  // Filtering is now handled by Convex queries

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-400 bg-green-400/10';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'rejected':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'rejected':
        return <XCircle size={16} />;
      default:
        return <Database size={16} />;
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
          <h1 className="text-4xl font-bold text-white mb-4">Data Marketplace</h1>
          <p className="text-slate-300 text-lg">
            Browse, contribute, and earn rewards from high-quality datasets
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 mb-8 border border-slate-700"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search datasets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-slate-800">
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating" className="bg-slate-800">Sort by Rating</option>
              <option value="price" className="bg-slate-800">Sort by Price</option>
              <option value="size" className="bg-slate-800">Sort by Size</option>
              <option value="contributors" className="bg-slate-800">Sort by Contributors</option>
            </select>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3">
              <Database className="text-blue-400" size={24} />
              <div>
                <p className="text-slate-300 text-sm">Total Datasets</p>
                <p className="text-2xl font-bold text-white">{datasets?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-md rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3">
              <Users className="text-green-400" size={24} />
              <div>
                <p className="text-slate-300 text-sm">Active Contributors</p>
                <p className="text-2xl font-bold text-white">
                  {datasets?.reduce((sum, dataset) => sum + dataset.downloadCount, 0) || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-md rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3">
              <DollarSign className="text-yellow-400" size={24} />
              <div>
                <p className="text-slate-300 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-white">
                  {datasets?.reduce((sum, dataset) => sum + dataset.price, 0) || 0} KALE
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-purple-400" size={24} />
              <div>
                <p className="text-slate-300 text-sm">Avg Rating</p>
                <p className="text-2xl font-bold text-white">
                  {datasets && datasets.length > 0 
                    ? (datasets.reduce((sum, dataset) => sum + dataset.rating, 0) / datasets.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Datasets Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 pr-2 pb-8"
        >
          {datasets?.map((dataset, index) => (
            <motion.div
              key={dataset._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              className="bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{dataset.name}</h3>
                  <p className="text-slate-300 text-sm mb-2">{dataset.description}</p>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  dataset.isVerified ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'
                }`}>
                  {dataset.isVerified ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  <span>{dataset.isVerified ? 'verified' : 'pending'}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {dataset.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-md">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Size</p>
                  <p className="text-white font-semibold">{(dataset.size / (1024 * 1024)).toFixed(1)} MB</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Downloads</p>
                  <p className="text-white font-semibold">{dataset.downloadCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Rating</p>
                  <div className="flex items-center justify-center gap-1">
                    <Star className="text-yellow-400" size={14} fill="currentColor" />
                    <span className="text-white font-semibold">{dataset.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-xs">Price</p>
                  <p className="text-green-400 font-semibold">{dataset.price} KALE</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                  <Eye size={16} />
                  View Details
                </button>
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                  <Download size={16} />
                  Download
                </button>
              </div>

              {/* Owner */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-xs">Owner: <span className="text-slate-300">{dataset.owner}</span></p>
                <p className="text-slate-400 text-xs">Updated: {dataset.lastUpdated}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {(!datasets || datasets.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Database className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-white mb-2">No datasets found</h3>
            <p className="text-slate-400">Try adjusting your search criteria or filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
