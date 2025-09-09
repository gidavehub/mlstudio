'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';

export default function AppOverview() {
  // Fetch real data from Convex
  const datasets = useQuery(api.datasets.list);
  const models = useQuery(api.models.list);
  const deployedAPIs = useQuery(api.deployedAPIs.list);
  const trainingJobs = useQuery(api.trainingJobs.list);
  const teams = useQuery(api.teams.list);
  const marketplaceDatasets = useQuery(api.marketplace.list);
  const dataContributions = useQuery(api.dataContributions.list);
  const rewardTransactions = useQuery(api.rewardTransactions.list);

  // Calculate statistics
  const totalDatasets = datasets?.length || 0;
  const totalModels = models?.length || 0;
  const totalAPIs = deployedAPIs?.length || 0;
  const totalTrainingJobs = trainingJobs?.length || 0;
  const totalTeams = teams?.length || 0;
  const totalMarketplaceDatasets = marketplaceDatasets?.length || 0;
  const totalContributions = dataContributions?.length || 0;
  const totalRewards = rewardTransactions?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0;

  // Calculate active training jobs
  const activeTrainingJobs = trainingJobs?.filter(job => 
    job.status === 'running' || job.status === 'pending'
  ).length || 0;

  // Calculate successful models
  const successfulModels = models?.filter(model => 
    model.status === 'completed'
  ).length || 0;

  // Calculate marketplace revenue (simplified)
  const marketplaceRevenue = marketplaceDatasets?.reduce((sum, dataset) => 
    sum + (dataset.price || 0) * (dataset.downloadCount || 0), 0
  ) || 0;

  // Calculate contribution rewards
  const totalContributionRewards = dataContributions?.reduce((sum, contribution) => 
    sum + (contribution.rewardAmount || 0), 0
  ) || 0;

  const stats = [
    {
      title: 'Total Datasets',
      value: totalDatasets,
      icon: '📊',
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20'
    },
    {
      title: 'Trained Models',
      value: successfulModels,
      icon: '🤖',
      color: 'text-green-400',
      bgColor: 'bg-green-400/20'
    },
    {
      title: 'Deployed APIs',
      value: totalAPIs,
      icon: '🚀',
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/20'
    },
    {
      title: 'Active Training',
      value: activeTrainingJobs,
      icon: '⚡',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/20'
    },
    {
      title: 'Teams',
      value: totalTeams,
      icon: '👥',
      color: 'text-pink-400',
      bgColor: 'bg-pink-400/20'
    },
    {
      title: 'Marketplace Items',
      value: totalMarketplaceDatasets,
      icon: '🛒',
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/20'
    },
    {
      title: 'Data Contributions',
      value: totalContributions,
      icon: '📤',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/20'
    },
    {
      title: 'Total Rewards',
      value: `$${totalRewards.toFixed(2)}`,
      icon: '💰',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/20'
    }
  ];

  const recentActivity = [
    ...(datasets?.slice(0, 3).map(dataset => ({
      type: 'dataset',
      title: `New dataset: ${dataset.name}`,
      time: new Date(dataset._creationTime).toLocaleDateString(),
      icon: '📊'
    })) || []),
    ...(models?.slice(0, 2).map(model => ({
      type: 'model',
      title: `Model trained: ${model.name}`,
      time: new Date(model._creationTime).toLocaleDateString(),
      icon: '🤖'
    })) || []),
    ...(deployedAPIs?.slice(0, 2).map(api => ({
      type: 'api',
      title: `API deployed: ${api.name}`,
      time: new Date(api._creationTime).toLocaleDateString(),
      icon: '🚀'
    })) || [])
  ].slice(0, 5);

  return (
    <div className="min-h-screen bg-ml-dark-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            ML Studio Overview
          </h1>
          <p className="text-ml-gray-300">
            Real-time overview of your ML Studio platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-ml-dark-100 rounded-xl p-6 hover:bg-ml-dark-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-ml-dark-100 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 bg-ml-dark-200 rounded-lg"
                  >
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <p className="text-white font-medium">{activity.title}</p>
                      <p className="text-ml-gray-400 text-sm">{activity.time}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">📊</span>
                  <p className="text-ml-gray-400">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Platform Health */}
          <div className="bg-ml-dark-100 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Platform Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-ml-gray-300">Database Status</span>
                <span className="text-green-400 font-semibold">✅ Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ml-gray-300">API Status</span>
                <span className="text-green-400 font-semibold">✅ Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ml-gray-300">Training Queue</span>
                <span className="text-yellow-400 font-semibold">
                  {activeTrainingJobs} jobs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ml-gray-300">Storage Usage</span>
                <span className="text-blue-400 font-semibold">
                  {totalDatasets} datasets
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ml-gray-300">Marketplace Revenue</span>
                <span className="text-emerald-400 font-semibold">
                  ${marketplaceRevenue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-ml-primary-600 hover:bg-ml-primary-700 text-white p-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <span className="text-lg">📊</span>
              <span>Upload Dataset</span>
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <span className="text-lg">🤖</span>
              <span>Train Model</span>
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <span className="text-lg">🚀</span>
              <span>Deploy API</span>
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <span className="text-lg">🛒</span>
              <span>Browse Marketplace</span>
            </button>
          </div>
        </div>

        {/* Data Summary */}
        <div className="mt-8 bg-ml-dark-100 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Data Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{totalDatasets}</div>
              <p className="text-ml-gray-400">Total Datasets</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{successfulModels}</div>
              <p className="text-ml-gray-400">Trained Models</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">{totalAPIs}</div>
              <p className="text-ml-gray-400">Deployed APIs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
