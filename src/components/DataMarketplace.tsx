'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Star, Download, Eye, Clock, Users, TrendingUp,
  Plus, Upload, CheckCircle, AlertCircle, DollarSign, Zap,
  Grid, List, SortAsc, SortDesc, Tag, Calendar, Award,
  Database, Image, Music, FileText, BarChart3, Globe
} from 'lucide-react';

interface MarketplaceDataset {
  _id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  size: number;
  format: string;
  rowCount?: number;
  columnCount?: number;
  dimensions?: number[];
  duration?: number;
  price: number; // KALE tokens
  rating: number;
  reviewCount: number;
  downloadCount: number;
  isVerified: boolean;
  isActive: boolean;
  ownerId: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  preview?: any;
}

interface FilterState {
  category: string;
  priceRange: [number, number];
  rating: number;
  format: string;
  verified: boolean;
  sortBy: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'rating' | 'downloads';
}

export default function DataMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDataset, setSelectedDataset] = useState<MarketplaceDataset | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: [0, 1000],
    rating: 0,
    format: 'all',
    verified: false,
    sortBy: 'newest'
  });

  // Fetch marketplace datasets
  const datasets = useQuery(api.marketplace.getDatasets);
  const user = useQuery(api.users.getCurrentUser, {});

  // Filter and sort datasets
  const filteredDatasets = useMemo(() => {
    if (!datasets) return [];

    let filtered = datasets.filter(dataset => {
      // Search query
      if (searchQuery && !dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !dataset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }

      // Category filter
      if (filters.category !== 'all' && dataset.category !== filters.category) {
        return false;
      }

      // Price range
      if (dataset.price < filters.priceRange[0] || dataset.price > filters.priceRange[1]) {
        return false;
      }

      // Rating filter
      if (dataset.rating < filters.rating) {
        return false;
      }

      // Format filter
      if (filters.format !== 'all' && dataset.format !== filters.format) {
        return false;
      }

      // Verified filter
      if (filters.verified && !dataset.isVerified) {
        return false;
      }

      return true;
    });

    // Sort datasets
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloadCount - a.downloadCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [datasets, searchQuery, filters]);

  const categories = [
    { id: 'all', name: 'All Categories', icon: Database },
    { id: 'Computer Vision', name: 'Computer Vision', icon: Image },
    { id: 'NLP', name: 'Natural Language Processing', icon: FileText },
    { id: 'Audio', name: 'Audio Processing', icon: Music },
    { id: 'Time Series', name: 'Time Series', icon: BarChart3 },
    { id: 'Finance', name: 'Financial Data', icon: TrendingUp },
    { id: 'Healthcare', name: 'Healthcare', icon: Users },
    { id: 'Other', name: 'Other', icon: Globe }
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : Database;
  };

  return (
    <div className="min-h-screen bg-ml-dark-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Data Marketplace
              </h1>
              <p className="text-ml-gray-300">
                Discover, contribute, and monetize high-quality datasets for ML
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-ml-primary-600 hover:bg-ml-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Contribute Data</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-ml-dark-100 rounded-xl p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ml-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search datasets, categories, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg pl-10 pr-4 py-3 text-white placeholder-ml-gray-400 focus:outline-none focus:ring-2 focus:ring-ml-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-ml-dark-200 hover:bg-ml-dark-300 text-white px-4 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-ml-primary-600 text-white' : 'bg-ml-dark-200 text-ml-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-ml-primary-600 text-white' : 'bg-ml-dark-200 text-ml-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-ml-dark-300 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                      >
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                        Price Range (KALE)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.priceRange[0]}
                          onChange={(e) => setFilters({
                            ...filters,
                            priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]]
                          })}
                          className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                        />
                        <span className="text-ml-gray-400">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.priceRange[1]}
                          onChange={(e) => setFilters({
                            ...filters,
                            priceRange: [filters.priceRange[0], parseInt(e.target.value) || 1000]
                          })}
                          className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                        />
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div>
                      <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                        Minimum Rating
                      </label>
                      <select
                        value={filters.rating}
                        onChange={(e) => setFilters({ ...filters, rating: parseInt(e.target.value) })}
                        className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                      >
                        <option value={0}>Any Rating</option>
                        <option value={1}>1+ Stars</option>
                        <option value={2}>2+ Stars</option>
                        <option value={3}>3+ Stars</option>
                        <option value={4}>4+ Stars</option>
                        <option value={5}>5 Stars</option>
                      </select>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                        Sort By
                      </label>
                      <select
                        value={filters.sortBy}
                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                        className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="downloads">Most Downloaded</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.verified}
                        onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                        className="w-4 h-4 text-ml-primary-600 bg-ml-dark-200 border-ml-dark-300 rounded focus:ring-ml-primary-500"
                      />
                      <span className="text-sm text-ml-gray-300">Verified Only</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-ml-gray-300">
            Showing {filteredDatasets.length} of {datasets?.length || 0} datasets
          </p>
        </div>

        {/* Datasets Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDatasets.map((dataset) => {
              const CategoryIcon = getCategoryIcon(dataset.category);
              return (
                <motion.div
                  key={dataset._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  className="bg-ml-dark-100 rounded-xl p-6 cursor-pointer hover:bg-ml-dark-200 transition-all duration-200"
                  onClick={() => setSelectedDataset(dataset)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-ml-primary-600/20 p-2 rounded-lg">
                        <CategoryIcon className="w-6 h-6 text-ml-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{dataset.name}</h3>
                        <p className="text-ml-gray-400 text-sm">{dataset.category}</p>
                      </div>
                    </div>
                    {dataset.isVerified && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>

                  <p className="text-ml-gray-300 text-sm mb-4 line-clamp-2">
                    {dataset.description}
                  </p>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(dataset.rating)}
                      <span className="text-ml-gray-400 text-sm ml-1">
                        ({dataset.reviewCount})
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-ml-gray-400 text-sm">
                      <Download className="w-4 h-4" />
                      <span>{dataset.downloadCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">
                        {dataset.price} KALE
                      </span>
                    </div>
                    <div className="text-ml-gray-400 text-sm">
                      {formatFileSize(dataset.size)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {dataset.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-ml-dark-200 text-ml-gray-300 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {dataset.tags.length > 3 && (
                      <span className="text-ml-gray-400 text-xs px-2 py-1">
                        +{dataset.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDatasets.map((dataset) => {
              const CategoryIcon = getCategoryIcon(dataset.category);
              return (
                <motion.div
                  key={dataset._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-ml-dark-100 rounded-xl p-6 cursor-pointer hover:bg-ml-dark-200 transition-all duration-200"
                  onClick={() => setSelectedDataset(dataset)}
                >
                  <div className="flex items-center space-x-6">
                    <div className="bg-ml-primary-600/20 p-3 rounded-lg">
                      <CategoryIcon className="w-8 h-8 text-ml-primary-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-white text-xl">{dataset.name}</h3>
                          <p className="text-ml-gray-400">{dataset.category}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            {renderStars(dataset.rating)}
                            <span className="text-ml-gray-400 text-sm ml-1">
                              ({dataset.reviewCount})
                            </span>
                          </div>
                          {dataset.isVerified && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-ml-gray-300 mb-3">{dataset.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-ml-gray-400">
                        <div className="flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>{dataset.downloadCount} downloads</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(dataset.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Database className="w-4 h-4" />
                          <span>{formatFileSize(dataset.size)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-bold text-xl">
                          {dataset.price} KALE
                        </span>
                      </div>
                      <button className="bg-ml-primary-600 hover:bg-ml-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredDatasets.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-ml-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No datasets found</h3>
            <p className="text-ml-gray-400 mb-6">
              Try adjusting your search criteria or browse all categories
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  category: 'all',
                  priceRange: [0, 1000],
                  rating: 0,
                  format: 'all',
                  verified: false,
                  sortBy: 'newest'
                });
              }}
              className="bg-ml-primary-600 hover:bg-ml-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
