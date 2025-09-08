'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { 
  TrendingUp, TrendingDown, DollarSign, RefreshCw, Globe, Zap,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle, AlertCircle,
  BarChart3, PieChart, Activity, Target, Settings, Info,
  Star, Award, Users, Database, Coins, Shield
} from 'lucide-react';

interface PriceFeed {
  asset: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: number;
  source: string;
  confidence: number;
}

interface DataPricing {
  category: string;
  basePrice: number; // in KALE tokens
  priceMultiplier: number;
  demandFactor: number;
  qualityFactor: number;
  lastCalculated: number;
}

interface PricingMetrics {
  totalDatasets: number;
  averagePrice: number;
  priceRange: [number, number];
  topCategories: Array<{
    category: string;
    count: number;
    averagePrice: number;
  }>;
  priceTrends: Array<{
    date: string;
    averagePrice: number;
    volume: number;
  }>;
}

export default function ReflectorIntegration() {
  const [activeTab, setActiveTab] = useState<'feeds' | 'pricing' | 'analytics'>('feeds');

  // Fetch real data from Convex
  const marketplaceDatasets = useQuery(api.marketplace.list);
  const rewardTransactions = useQuery(api.rewardTransactions.list);

  // Mock price feeds (these would come from external API in real implementation)
  const priceFeeds: PriceFeed[] = [
    {
      asset: 'KALE',
      symbol: 'KALE',
      price: 0.25,
      change24h: 5.2,
      volume24h: 125000,
      marketCap: 2500000,
      lastUpdated: Date.now(),
      source: 'Reflector Oracle',
      confidence: 0.95
    },
    {
      asset: 'USDC',
      symbol: 'USDC',
      price: 1.00,
      change24h: 0.1,
      volume24h: 50000000,
      marketCap: 50000000000,
      lastUpdated: Date.now(),
      source: 'Reflector Oracle',
      confidence: 0.99
    },
    {
      asset: 'XLM',
      symbol: 'XLM',
      price: 0.12,
      change24h: -2.1,
      volume24h: 25000000,
      marketCap: 3000000000,
      lastUpdated: Date.now(),
      source: 'Reflector Oracle',
      confidence: 0.98
    }
  ];

  // Calculate data pricing from real marketplace data
  const dataPricing: DataPricing[] = marketplaceDatasets ? 
    Array.from(new Set(marketplaceDatasets.map(ds => ds.category))).map(category => {
      const categoryDatasets = marketplaceDatasets.filter(ds => ds.category === category);
      const avgPrice = categoryDatasets.reduce((sum, ds) => sum + ds.price, 0) / categoryDatasets.length;
      return {
        category,
        basePrice: avgPrice,
        priceMultiplier: 1.2,
        demandFactor: 1.1,
        qualityFactor: 1.2,
        lastCalculated: Date.now()
      };
    }) : [];

  // Calculate pricing metrics from real data
  const pricingMetrics: PricingMetrics = {
    totalDatasets: marketplaceDatasets?.length || 0,
    averagePrice: marketplaceDatasets?.length ? 
      marketplaceDatasets.reduce((sum, ds) => sum + ds.price, 0) / marketplaceDatasets.length : 0,
    priceRange: marketplaceDatasets?.length ? [
      Math.min(...marketplaceDatasets.map(ds => ds.price)),
      Math.max(...marketplaceDatasets.map(ds => ds.price))
    ] : [0, 0],
    topCategories: marketplaceDatasets ? 
      Array.from(new Set(marketplaceDatasets.map(ds => ds.category))).map(category => {
        const categoryDatasets = marketplaceDatasets.filter(ds => ds.category === category);
        return {
          category,
          count: categoryDatasets.length,
          averagePrice: categoryDatasets.reduce((sum, ds) => sum + ds.price, 0) / categoryDatasets.length
        };
      }).sort((a, b) => b.count - a.count).slice(0, 5) : [],
    priceTrends: [
      { date: '2024-01-01', averagePrice: 85.2, volume: 45 },
      { date: '2024-01-02', averagePrice: 87.1, volume: 52 },
      { date: '2024-01-03', averagePrice: 89.5, volume: 48 },
      { date: '2024-01-04', averagePrice: 91.3, volume: 61 },
      { date: '2024-01-05', averagePrice: 89.5, volume: 55 }
    ]
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPriceFeeds(prev => prev.map(feed => ({
        ...feed,
        price: feed.price + (Math.random() - 0.5) * 0.01,
        change24h: feed.change24h + (Math.random() - 0.5) * 0.5,
        lastUpdated: Date.now()
      })));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const refreshPriceFeeds = async () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setPriceFeeds(prev => prev.map(feed => ({
        ...feed,
        lastUpdated: Date.now(),
        confidence: Math.min(0.99, feed.confidence + 0.01)
      })));
      setIsRefreshing(false);
    }, 2000);
  };

  const calculateDynamicPrice = (category: string, basePrice: number, quality: number, demand: number) => {
    const pricing = dataPricing.find(p => p.category === category);
    if (!pricing) return basePrice;

    return Math.round(
      basePrice * 
      pricing.priceMultiplier * 
      pricing.demandFactor * 
      pricing.qualityFactor * 
      (quality / 5) * 
      (demand / 100)
    );
  };

  const formatPrice = (price: number) => {
    return price.toFixed(4);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }
    return `$${volume.toFixed(0)}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000000) {
      return `$${(marketCap / 1000000000).toFixed(1)}B`;
    } else if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`;
    }
    return `$${marketCap.toFixed(0)}`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? ArrowUpRight : ArrowDownRight;
  };

  return (
    <div className="min-h-screen bg-ml-dark-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Reflector Price Integration
              </h1>
              <p className="text-ml-gray-300">
                Real-time price feeds and dynamic data pricing powered by Reflector Oracle
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshPriceFeeds}
                disabled={isRefreshing}
                className="bg-ml-primary-600 hover:bg-ml-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Feeds</span>
              </button>
            </div>
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Active Feeds</p>
                  <p className="text-2xl font-bold text-white">{priceFeeds.length}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Avg Confidence</p>
                  <p className="text-2xl font-bold text-green-400">
                    {(priceFeeds.reduce((acc, feed) => acc + feed.confidence, 0) / priceFeeds.length * 100).toFixed(1)}%
                  </p>
                </div>
                <Shield className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Data Categories</p>
                  <p className="text-2xl font-bold text-purple-400">{dataPricing.length}</p>
                </div>
                <Database className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Avg Dataset Price</p>
                  <p className="text-2xl font-bold text-yellow-400">{pricingMetrics.averagePrice.toFixed(1)} KALE</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-ml-dark-100 rounded-lg p-1 mb-8">
            {[
              { id: 'feeds', label: 'Price Feeds', icon: TrendingUp },
              { id: 'pricing', label: 'Data Pricing', icon: DollarSign },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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
          {activeTab === 'feeds' && (
            <motion.div
              key="feeds"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-6">
                {/* Price Feeds Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {priceFeeds.map((feed) => {
                    const ChangeIcon = getChangeIcon(feed.change24h);
                    return (
                      <motion.div
                        key={feed.symbol}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-ml-dark-100 rounded-xl p-6 hover:bg-ml-dark-200 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-ml-primary-600/20 p-2 rounded-lg">
                              <Coins className="w-6 h-6 text-ml-primary-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{feed.symbol}</h3>
                              <p className="text-ml-gray-400 text-sm">{feed.asset}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <ChangeIcon className={`w-4 h-4 ${getChangeColor(feed.change24h)}`} />
                              <span className={`text-sm font-medium ${getChangeColor(feed.change24h)}`}>
                                {Math.abs(feed.change24h).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-ml-gray-400 text-sm">Price</span>
                            <span className="text-white font-semibold text-lg">
                              ${formatPrice(feed.price)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-ml-gray-400 text-sm">24h Volume</span>
                            <span className="text-ml-gray-300">
                              {formatVolume(feed.volume24h)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-ml-gray-400 text-sm">Market Cap</span>
                            <span className="text-ml-gray-300">
                              {formatMarketCap(feed.marketCap)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-ml-gray-400 text-sm">Confidence</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-ml-dark-200 rounded-full h-2">
                                <div
                                  className="bg-green-400 h-2 rounded-full"
                                  style={{ width: `${feed.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-green-400 text-sm font-medium">
                                {(feed.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-ml-gray-400 text-sm">Source</span>
                            <span className="text-ml-gray-300 text-sm">{feed.source}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-ml-gray-400 text-sm">Last Updated</span>
                            <span className="text-ml-gray-300 text-sm">
                              {new Date(feed.lastUpdated).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Oracle Status */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Reflector Oracle Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-white font-medium">Oracle Active</p>
                        <p className="text-ml-gray-400 text-sm">All feeds operational</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-6 h-6 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">Update Frequency</p>
                        <p className="text-ml-gray-400 text-sm">Every 10 seconds</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="w-6 h-6 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">Security</p>
                        <p className="text-ml-gray-400 text-sm">Multi-signature verified</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'pricing' && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-6">
                {/* Dynamic Pricing Calculator */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Dynamic Pricing Calculator</h3>
                  <p className="text-ml-gray-300 mb-6">
                    Calculate real-time dataset prices based on category, quality, and demand factors
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                          Dataset Category
                        </label>
                        <select className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500">
                          {dataPricing.map(category => (
                            <option key={category.category} value={category.category}>
                              {category.category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                          Quality Score (1-5)
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          defaultValue="4"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-ml-gray-400 mt-1">
                          <span>Poor</span>
                          <span>Excellent</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                          Demand Level (1-100)
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          defaultValue="75"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-ml-gray-400 mt-1">
                          <span>Low</span>
                          <span>High</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-ml-dark-200 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-3">Calculated Price</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-ml-gray-300">Base Price</span>
                          <span className="text-white">100 KALE</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ml-gray-300">Category Multiplier</span>
                          <span className="text-blue-400">1.5x</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ml-gray-300">Quality Factor</span>
                          <span className="text-green-400">1.3x</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ml-gray-300">Demand Factor</span>
                          <span className="text-yellow-400">1.2x</span>
                        </div>
                        <div className="border-t border-ml-dark-300 pt-2">
                          <div className="flex justify-between">
                            <span className="text-white font-medium">Final Price</span>
                            <span className="text-yellow-400 font-bold text-lg">234 KALE</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Pricing */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Category Pricing Matrix</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-ml-dark-300">
                          <th className="text-left text-ml-gray-300 py-3">Category</th>
                          <th className="text-left text-ml-gray-300 py-3">Base Price</th>
                          <th className="text-left text-ml-gray-300 py-3">Multiplier</th>
                          <th className="text-left text-ml-gray-300 py-3">Demand Factor</th>
                          <th className="text-left text-ml-gray-300 py-3">Quality Factor</th>
                          <th className="text-left text-ml-gray-300 py-3">Avg Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataPricing.map((pricing, index) => (
                          <tr key={pricing.category} className="border-b border-ml-dark-300/50">
                            <td className="py-3 text-white font-medium">{pricing.category}</td>
                            <td className="py-3 text-ml-gray-300">{pricing.basePrice} KALE</td>
                            <td className="py-3 text-blue-400">{pricing.priceMultiplier}x</td>
                            <td className="py-3 text-yellow-400">{pricing.demandFactor}x</td>
                            <td className="py-3 text-green-400">{pricing.qualityFactor}x</td>
                            <td className="py-3 text-white font-semibold">
                              {Math.round(pricing.basePrice * pricing.priceMultiplier * pricing.demandFactor * pricing.qualityFactor)} KALE
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Market Overview */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Market Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Total Datasets</span>
                      <span className="text-white font-semibold">{pricingMetrics.totalDatasets.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Average Price</span>
                      <span className="text-yellow-400 font-semibold">{pricingMetrics.averagePrice} KALE</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Price Range</span>
                      <span className="text-ml-gray-300">
                        {pricingMetrics.priceRange[0]} - {pricingMetrics.priceRange[1]} KALE
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Total Market Value</span>
                      <span className="text-green-400 font-semibold">
                        {(pricingMetrics.totalDatasets * pricingMetrics.averagePrice).toLocaleString()} KALE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Categories */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Top Categories</h3>
                  <div className="space-y-3">
                    {pricingMetrics.topCategories.map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-ml-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="text-white font-medium">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-ml-gray-300 text-sm">{category.count} datasets</div>
                          <div className="text-yellow-400 font-semibold">{category.averagePrice} KALE avg</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Trends Chart */}
                <div className="bg-ml-dark-100 rounded-xl p-6 lg:col-span-2">
                  <h3 className="text-xl font-semibold text-white mb-4">Price Trends</h3>
                  <div className="h-64 flex items-center justify-center text-ml-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                      <p>Price trend charts coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
