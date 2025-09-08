'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, AlertCircle, Clock, Eye, Download, Star, Users,
  TrendingUp, Award, Shield, FileText, Image, Music, Database,
  Filter, Search, SortAsc, SortDesc, Calendar, Tag, DollarSign,
  ThumbsUp, ThumbsDown, MessageSquare, Flag, Zap, Target, X, BarChart3,
  Plus, Edit3
} from 'lucide-react';

interface ValidationRequest {
  id: string;
  contributorId: string;
  contributorName: string;
  datasetName: string;
  description: string;
  category: string;
  tags: string[];
  contributionType: 'new_dataset' | 'data_addition' | 'correction';
  fileStorageId: string;
  size: number;
  format: string;
  metadata: any;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewNotes?: string;
  rewardAmount?: number;
  createdAt: number;
  updatedAt: number;
  reviewedAt?: number;
  reviewerId?: string;
  qualityScore?: number;
  originalityScore?: number;
  usefulnessScore?: number;
}

interface ValidationStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  averageReviewTime: number;
  totalRewardsDistributed: number;
}

export default function ValidationDashboard() {
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed' | 'stats'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<ValidationRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: 'approved' as 'approved' | 'rejected',
    qualityScore: 5,
    originalityScore: 5,
    usefulnessScore: 5,
    rewardAmount: 0,
    reviewNotes: ''
  });
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    contributionType: 'all',
    dateRange: 'all'
  });

  // Fetch real data from Convex
  const dataContributions = useQuery(api.dataContributions.list);
  const rewardTransactions = useQuery(api.rewardTransactions.list);

  // Calculate validation requests from data contributions
  const validationRequests = dataContributions?.map((contribution: any) => ({
    id: contribution._id,
    contributorId: contribution.contributorId,
    contributorName: `User ${contribution.contributorId.slice(-4)}`, // Simplified name
    datasetName: `Contribution ${contribution._id.slice(-4)}`,
    description: contribution.description,
    category: 'Data Contribution',
    tags: [contribution.contributionType],
    contributionType: contribution.contributionType,
    status: contribution.status,
    createdAt: contribution.createdAt,
    updatedAt: contribution.updatedAt,
    fileSize: contribution.size,
    format: contribution.format
  })) || [];

  // Calculate validation stats
  const validationStats = {
    totalRequests: validationRequests.length,
    pendingRequests: validationRequests.filter((r: any) => r.status === 'pending').length,
    approvedRequests: validationRequests.filter((r: any) => r.status === 'approved').length,
    rejectedRequests: validationRequests.filter((r: any) => r.status === 'rejected').length,
    averageReviewTime: 2.5, // Keep this as a placeholder for now
    totalRewardsDistributed: rewardTransactions?.reduce((sum: any, tx: any) => 
      tx.transactionType === 'contribution_reward' ? sum + tx.amount : sum, 0
    ) || 0
  };

  const filteredRequests = validationRequests?.filter((request: any) => {
    if (filters.status !== 'all' && request.status !== filters.status) return false;
    if (filters.category !== 'all' && request.category !== filters.category) return false;
    if (filters.contributionType !== 'all' && request.contributionType !== filters.contributionType) return false;
    return true;
  }) || [];

  const handleReview = (request: ValidationRequest) => {
    setSelectedRequest(request);
    setReviewForm({
      status: 'approved',
      qualityScore: 5,
      originalityScore: 5,
      usefulnessScore: 5,
      rewardAmount: calculateSuggestedReward(request),
      reviewNotes: ''
    });
    setShowReviewModal(true);
  };

  const calculateSuggestedReward = (request: ValidationRequest): number => {
    // Calculate reward based on dataset size, quality, and type
    let baseReward = 50; // Base reward
    
    // Size factor
    const sizeMB = request.size / (1024 * 1024);
    if (sizeMB > 100) baseReward += 100;
    else if (sizeMB > 50) baseReward += 50;
    else if (sizeMB > 10) baseReward += 25;
    
    // Type factor
    switch (request.contributionType) {
      case 'new_dataset': baseReward *= 1.5; break;
      case 'data_addition': baseReward *= 1.2; break;
      case 'correction': baseReward *= 0.8; break;
    }
    
    // Category factor
    const premiumCategories = ['Healthcare', 'Financial Data', 'Computer Vision'];
    if (premiumCategories.includes(request.category)) {
      baseReward *= 1.3;
    }
    
    return Math.round(baseReward);
  };

  const submitReview = async () => {
    if (!selectedRequest) return;
    
    try {
      // Submit review to Convex
      // await submitValidationReview({
      //   requestId: selectedRequest.id,
      //   ...reviewForm
      // });
      
      setShowReviewModal(false);
      setSelectedRequest(null);
      // Refresh data
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/20';
      case 'under_review': return 'text-blue-400 bg-blue-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'rejected': return AlertCircle;
      case 'under_review': return Eye;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const getContributionTypeIcon = (type: string) => {
    switch (type) {
      case 'new_dataset': return Database;
      case 'data_addition': return Plus;
      case 'correction': return Edit3;
      default: return FileText;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  return (
    <div className="min-h-screen bg-ml-dark-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Validation Dashboard
              </h1>
              <p className="text-ml-gray-300">
                Review and validate data contributions from the community
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-ml-dark-100 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-ml-primary-400" />
                  <span className="text-white font-medium">Validator</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Pending Reviews</p>
                  <p className="text-2xl font-bold text-yellow-400">12</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Approved Today</p>
                  <p className="text-2xl font-bold text-green-400">8</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Avg Review Time</p>
                  <p className="text-2xl font-bold text-blue-400">2.3h</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Rewards Distributed</p>
                  <p className="text-2xl font-bold text-purple-400">1,250 KALE</p>
                </div>
                <Award className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-ml-dark-100 rounded-lg p-1 mb-8">
            {[
              { id: 'pending', label: 'Pending Review', icon: Clock, count: 12 },
              { id: 'reviewed', label: 'Reviewed', icon: CheckCircle, count: 45 },
              { id: 'stats', label: 'Statistics', icon: BarChart3, count: null }
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
                  {tab.count !== null && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-ml-dark-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Filters */}
              <div className="bg-ml-dark-100 rounded-xl p-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ml-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search contributions..."
                      className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg pl-10 pr-4 py-2 text-white placeholder-ml-gray-400 focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                    />
                  </div>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="NLP">Natural Language Processing</option>
                    <option value="Audio">Audio Processing</option>
                    <option value="Time Series">Time Series</option>
                    <option value="Finance">Financial Data</option>
                  </select>
                  <select
                    value={filters.contributionType}
                    onChange={(e) => setFilters({ ...filters, contributionType: e.target.value })}
                    className="bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                  >
                    <option value="all">All Types</option>
                    <option value="new_dataset">New Dataset</option>
                    <option value="data_addition">Data Addition</option>
                    <option value="correction">Correction</option>
                  </select>
                </div>
              </div>

              {/* Pending Requests */}
              <div className="space-y-4">
                {filteredRequests.map((request: any) => {
                  const StatusIcon = getStatusIcon(request.status);
                  const TypeIcon = getContributionTypeIcon(request.contributionType);
                  
                  return (
                    <div
                      key={request.id}
                      className="bg-ml-dark-100 rounded-xl p-6 hover:bg-ml-dark-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <TypeIcon className="w-5 h-5 text-ml-primary-400" />
                            <h3 className="text-lg font-semibold text-white">
                              {request.datasetName}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              <StatusIcon className="w-3 h-3 inline mr-1" />
                              {request.status.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <p className="text-ml-gray-300 mb-3">{request.description}</p>
                          
                          <div className="flex items-center space-x-6 text-sm text-ml-gray-400 mb-3">
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{request.contributorName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(request.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Database className="w-4 h-4" />
                              <span>{formatFileSize(request.size)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Tag className="w-4 h-4" />
                              <span>{request.category}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-4">
                            {request.tags.map((tag: any) => (
                              <span
                                key={tag}
                                className="bg-ml-dark-200 text-ml-gray-300 text-xs px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          {/* Suggested Reward */}
                          <div className="bg-ml-dark-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-ml-gray-300 text-sm">Suggested Reward</span>
                              <span className="text-yellow-400 font-semibold">
                                {calculateSuggestedReward(request)} KALE
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-6">
                          <button className="p-2 text-ml-gray-400 hover:text-white transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-ml-gray-400 hover:text-white transition-colors">
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleReview(request)}
                            className="bg-ml-primary-600 hover:bg-ml-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'reviewed' && (
            <motion.div
              key="reviewed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="space-y-4">
                {/* Reviewed requests would go here */}
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-ml-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Reviewed Contributions</h3>
                  <p className="text-ml-gray-400">
                    Previously reviewed contributions will appear here
                  </p>
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
                {/* Review Performance Chart */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Review Performance</h3>
                  <div className="h-64 flex items-center justify-center text-ml-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                      <p>Performance charts coming soon</p>
                    </div>
                  </div>
                </div>

                {/* Quality Metrics */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Quality Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Average Quality Score</span>
                      <span className="text-green-400 font-semibold">4.2/5</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Approval Rate</span>
                      <span className="text-blue-400 font-semibold">78%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Average Review Time</span>
                      <span className="text-purple-400 font-semibold">2.3 hours</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ml-gray-300">Total Reviews</span>
                      <span className="text-yellow-400 font-semibold">156</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review Modal */}
        <AnimatePresence>
          {showReviewModal && selectedRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowReviewModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-ml-dark-100 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Review Contribution</h2>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="text-ml-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Dataset Info */}
                  <div className="bg-ml-dark-200 rounded-lg p-4">
                    <h3 className="font-semibold text-white mb-2">{selectedRequest.datasetName}</h3>
                    <p className="text-ml-gray-300 text-sm mb-2">{selectedRequest.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-ml-gray-400">
                      <span>Contributor: {selectedRequest.contributorName}</span>
                      <span>•</span>
                      <span>{selectedRequest.category}</span>
                      <span>•</span>
                      <span>{formatFileSize(selectedRequest.size)}</span>
                    </div>
                  </div>

                  {/* Quality Scores */}
                  <div>
                    <h4 className="font-medium text-white mb-3">Quality Assessment</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-ml-gray-300 mb-2">
                          Data Quality (1-5)
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={reviewForm.qualityScore}
                          onChange={(e) => setReviewForm({ ...reviewForm, qualityScore: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-ml-gray-400 mt-1">
                          <span>Poor</span>
                          <span>Excellent</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-ml-gray-300 mb-2">
                          Originality (1-5)
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={reviewForm.originalityScore}
                          onChange={(e) => setReviewForm({ ...reviewForm, originalityScore: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-ml-gray-400 mt-1">
                          <span>Common</span>
                          <span>Unique</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-ml-gray-300 mb-2">
                          Usefulness (1-5)
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={reviewForm.usefulnessScore}
                          onChange={(e) => setReviewForm({ ...reviewForm, usefulnessScore: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-ml-gray-400 mt-1">
                          <span>Limited</span>
                          <span>Very Useful</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reward Amount */}
                  <div>
                    <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                      Reward Amount (KALE tokens)
                    </label>
                    <input
                      type="number"
                      value={reviewForm.rewardAmount}
                      onChange={(e) => setReviewForm({ ...reviewForm, rewardAmount: parseInt(e.target.value) || 0 })}
                      className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                      min="0"
                    />
                  </div>

                  {/* Review Notes */}
                  <div>
                    <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                      Review Notes
                    </label>
                    <textarea
                      value={reviewForm.reviewNotes}
                      onChange={(e) => setReviewForm({ ...reviewForm, reviewNotes: e.target.value })}
                      rows={4}
                      className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                      placeholder="Add your review notes and feedback..."
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-4 pt-4 border-t border-ml-dark-300">
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="px-6 py-2 text-ml-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setReviewForm({ ...reviewForm, status: 'rejected' })}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={submitReview}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Approve
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