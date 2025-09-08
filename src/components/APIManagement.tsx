'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Key, DollarSign, Activity, Shield, Zap, 
  Plus, Edit3, Trash2, Eye, Copy, RefreshCw, TrendingUp,
  Users, Database, Globe, Lock, CheckCircle, AlertCircle
} from 'lucide-react';

const APIManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKeys, setApiKeys] = useState([
    {
      id: '1',
      name: 'Production API Key',
      key: 'mls_live_sk_1234567890abcdef',
      permissions: ['read', 'write', 'admin'],
      usage: { requests: 15420, limit: 100000 },
      status: 'active',
      createdAt: '2024-01-15',
      lastUsed: '2024-01-20'
    },
    {
      id: '2', 
      name: 'Development Key',
      key: 'mls_dev_sk_abcdef1234567890',
      permissions: ['read'],
      usage: { requests: 2340, limit: 10000 },
      status: 'active',
      createdAt: '2024-01-10',
      lastUsed: '2024-01-19'
    }
  ]);

  const [subscriptions] = useState([
    {
      id: '1',
      name: 'Professional Plan',
      price: 99,
      features: ['100K API calls', 'Priority support', 'Advanced analytics'],
      status: 'active',
      nextBilling: '2024-02-15'
    },
    {
      id: '2',
      name: 'Enterprise Plan', 
      price: 299,
      features: ['Unlimited API calls', 'Dedicated support', 'Custom integrations'],
      status: 'active',
      nextBilling: '2024-02-15'
    }
  ]);

  const [billingHistory] = useState([
    { date: '2024-01-15', amount: 99, plan: 'Professional', status: 'paid' },
    { date: '2023-12-15', amount: 99, plan: 'Professional', status: 'paid' },
    { date: '2023-11-15', amount: 99, plan: 'Professional', status: 'paid' }
  ]);

  const handleCreateKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: `mls_live_sk_${Math.random().toString(36).substring(2, 18)}`,
      permissions: ['read'],
      usage: { requests: 0, limit: 10000 },
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastUsed: 'Never'
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <motion.div 
      className="p-6 bg-ml-dark-50 min-h-full rounded-lg shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Settings className="text-ml-blue-50" size={28} /> 
        API Management
      </h2>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-ml-dark-200 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'keys', label: 'API Keys', icon: Key },
            { id: 'billing', label: 'Billing', icon: DollarSign },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-ml-blue-50 text-white'
                  : 'text-ml-dark-400 hover:text-white hover:bg-ml-dark-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-ml-dark-200 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-dark-400 text-sm">Total API Calls</p>
                  <p className="text-white text-2xl font-bold">17,760</p>
                </div>
                <Activity className="text-ml-blue-50" size={24} />
              </div>
              <p className="text-green-400 text-xs mt-1">+12% from last month</p>
            </div>

            <div className="bg-ml-dark-200 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-dark-400 text-sm">Active Keys</p>
                  <p className="text-white text-2xl font-bold">{apiKeys.length}</p>
                </div>
                <Key className="text-green-400" size={24} />
              </div>
              <p className="text-green-400 text-xs mt-1">All keys active</p>
            </div>

            <div className="bg-ml-dark-200 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-dark-400 text-sm">Monthly Revenue</p>
                  <p className="text-white text-2xl font-bold">$398</p>
                </div>
                <DollarSign className="text-yellow-400" size={24} />
              </div>
              <p className="text-green-400 text-xs mt-1">+8% from last month</p>
            </div>

            <div className="bg-ml-dark-200 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-dark-400 text-sm">Success Rate</p>
                  <p className="text-white text-2xl font-bold">99.8%</p>
                </div>
                <Shield className="text-green-400" size={24} />
              </div>
              <p className="text-green-400 text-xs mt-1">Excellent uptime</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-ml-dark-200 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="text-blue-400" size={20} /> Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { action: 'API Key Created', key: 'mls_live_sk_1234...', time: '2 hours ago', type: 'success' },
                { action: 'High Usage Alert', key: 'mls_dev_sk_abcd...', time: '4 hours ago', type: 'warning' },
                { action: 'Payment Processed', key: '$99.00', time: '1 day ago', type: 'success' },
                { action: 'API Key Rotated', key: 'mls_live_sk_5678...', time: '3 days ago', type: 'info' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-ml-dark-300 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-400' :
                      activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}></div>
                    <span className="text-white text-sm">{activity.action}</span>
                    <span className="text-ml-dark-400 text-xs font-mono">{activity.key}</span>
                  </div>
                  <span className="text-ml-dark-400 text-xs">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'keys' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">API Keys</h3>
            <motion.button
              onClick={handleCreateKey}
              className="px-4 py-2 bg-ml-blue-50 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={16} />
              Create New Key
            </motion.button>
          </div>

          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="bg-ml-dark-200 p-6 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-white font-medium">{key.name}</h4>
                    <p className="text-ml-dark-400 text-sm font-mono">{key.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => copyToClipboard(key.key)}
                      className="p-2 text-ml-dark-400 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Copy size={16} />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteKey(key.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-ml-dark-400 text-xs">Permissions</p>
                    <div className="flex gap-1 mt-1">
                      {key.permissions.map((perm) => (
                        <span key={perm} className="px-2 py-1 bg-ml-dark-300 text-white text-xs rounded">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-ml-dark-400 text-xs">Usage</p>
                    <p className="text-white text-sm">
                      {key.usage.requests.toLocaleString()} / {key.usage.limit.toLocaleString()}
                    </p>
                    <div className="w-full bg-ml-dark-300 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          getUsagePercentage(key.usage.requests, key.usage.limit) >= 90 ? 'bg-red-400' :
                          getUsagePercentage(key.usage.requests, key.usage.limit) >= 70 ? 'bg-yellow-400' : 'bg-green-400'
                        }`}
                        style={{ width: `${getUsagePercentage(key.usage.requests, key.usage.limit)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-ml-dark-400 text-xs">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${key.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span className="text-white text-sm capitalize">{key.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-xs text-ml-dark-400">
                  <span>Created: {key.createdAt}</span>
                  <span>Last used: {key.lastUsed}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Current Subscriptions */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Current Subscriptions</h3>
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="bg-ml-dark-200 p-6 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-white font-medium text-lg">{sub.name}</h4>
                      <p className="text-ml-dark-400">${sub.price}/month</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-green-400 text-sm">Active</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-ml-dark-400 text-sm mb-2">Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {sub.features.map((feature, index) => (
                        <span key={index} className="px-3 py-1 bg-ml-dark-300 text-white text-sm rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-ml-dark-400 text-sm">Next billing: {sub.nextBilling}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Billing History */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Billing History</h3>
            <div className="bg-ml-dark-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ml-dark-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-ml-dark-400 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-ml-dark-400 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-ml-dark-400 uppercase">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-ml-dark-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ml-dark-300">
                    {billingHistory.map((bill, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm text-white">{bill.date}</td>
                        <td className="px-6 py-4 text-sm text-white">${bill.amount}</td>
                        <td className="px-6 py-4 text-sm text-ml-dark-400">{bill.plan}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="text-green-400" size={16} />
                            <span className="text-green-400 capitalize">{bill.status}</span>
                          </div>
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

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-white">API Analytics</h3>
          
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-ml-dark-200 p-6 rounded-lg">
              <h4 className="text-white font-medium mb-4">API Usage Trends</h4>
              <div className="space-y-3">
                {[
                  { label: 'Today', value: 1250, color: 'bg-blue-400' },
                  { label: 'This Week', value: 8750, color: 'bg-green-400' },
                  { label: 'This Month', value: 17760, color: 'bg-purple-400' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-ml-dark-400 text-sm">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-white font-medium">{item.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-ml-dark-200 p-6 rounded-lg">
              <h4 className="text-white font-medium mb-4">Revenue Analytics</h4>
              <div className="space-y-3">
                {[
                  { label: 'Monthly Recurring', value: '$398', color: 'bg-green-400' },
                  { label: 'Total Revenue', value: '$2,385', color: 'bg-blue-400' },
                  { label: 'Growth Rate', value: '+12%', color: 'bg-purple-400' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-ml-dark-400 text-sm">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-white font-medium">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-ml-dark-200 p-6 rounded-lg">
            <h4 className="text-white font-medium mb-4">Performance Metrics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">99.8%</p>
                <p className="text-ml-dark-400 text-sm">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">45ms</p>
                <p className="text-ml-dark-400 text-sm">Avg Response</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">1.2K</p>
                <p className="text-ml-dark-400 text-sm">Requests/min</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default APIManagement;