'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, FileText, Image, Music, Database, CheckCircle, AlertCircle,
  Clock, Star, DollarSign, TrendingUp, Users, Award, Zap,
  Plus, Edit3, Trash2, Eye, Download, Share2, Tag, Calendar,
  BarChart3, PieChart, Activity, Target, Globe, Shield, X
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface Contribution {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  file: File;
  size: number;
  format: string;
  status: 'draft' | 'pending' | 'under_review' | 'approved' | 'rejected';
  rewardAmount?: number;
  reviewNotes?: string;
  createdAt: number;
  updatedAt: number;
  preview?: any;
  metadata?: any;
}

interface ContributionStats {
  totalContributions: number;
  approvedContributions: number;
  pendingContributions: number;
  totalRewards: number;
  averageRating: number;
  rank: number;
}

export default function DataContributionCenter() {
  const [activeTab, setActiveTab] = useState<'upload' | 'manage' | 'stats'>('upload');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Form state for new contribution
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: [] as string[],
    price: 0,
    isPublic: true
  });

  const [newTag, setNewTag] = useState('');

  // Fetch user contributions and stats
  const userContributions = useQuery(api.marketplace.getUserContributions, {});
  const userStats = useQuery(api.marketplace.getUserStats, {});

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFormData(prev => ({ ...prev, name: file.name.split('.')[0] }));
      // Process file and create preview
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'],
      'audio/*': ['.wav', '.mp3', '.flac', '.ogg', '.m4a'],
      'text/plain': ['.txt', '.md']
    },
    multiple: false
  });

  const processFile = async (file: File) => {
    // Create file preview and extract metadata
    const preview = await createFilePreview(file);
    const metadata = await extractFileMetadata(file);
    
    setFormData(prev => ({
      ...prev,
      metadata: { ...metadata, preview }
    }));
  };

  const createFilePreview = async (file: File): Promise<any> => {
    const fileType = file.type;
    
    if (fileType.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            type: 'image',
            url: e.target?.result,
            width: 0, // Will be set when image loads
            height: 0
          });
        };
        reader.readAsDataURL(file);
      });
    } else if (fileType.startsWith('audio/')) {
      return {
        type: 'audio',
        duration: 0, // Will be extracted from audio file
        waveform: [] // Will be generated
      };
    } else if (fileType === 'text/csv' || fileType === 'application/json') {
      const text = await file.text();
      const preview = text.slice(0, 1000); // First 1000 characters
      return {
        type: 'tabular',
        preview,
        lines: text.split('\n').length
      };
    }
    
    return { type: 'unknown' };
  };

  const extractFileMetadata = async (file: File) => {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      format: file.name.split('.').pop()?.toLowerCase()
    };
  };

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

      // Here you would upload to Convex storage and create the contribution record
      // const storageId = await uploadFile(formData.file);
      // await createContribution({ ...formData, fileStorageId: storageId });

      setTimeout(() => {
        setUploadProgress(100);
        setIsUploading(false);
        setShowUploadModal(false);
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: '',
          tags: [],
          price: 0,
          isPublic: true
        });
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      setIsUploading(false);
      alert('Upload failed. Please try again.');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const categories = [
    'Computer Vision',
    'Natural Language Processing',
    'Audio Processing',
    'Time Series',
    'Financial Data',
    'Healthcare',
    'E-commerce',
    'Social Media',
    'IoT',
    'Other'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/20';
      case 'under_review': return 'text-blue-400 bg-blue-400/20';
      case 'rejected': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'under_review': return Eye;
      case 'rejected': return AlertCircle;
      default: return Clock;
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
                Data Contribution Center
              </h1>
              <p className="text-ml-gray-300">
                Share your datasets and earn KALE tokens for valuable contributions
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-ml-primary-600 hover:bg-ml-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Contribution</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Total Contributions</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
                <Database className="w-8 h-8 text-ml-primary-400" />
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-green-400">8</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Total Rewards</p>
                  <p className="text-2xl font-bold text-yellow-400">2,450 KALE</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-ml-dark-100 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-ml-gray-400 text-sm">Rank</p>
                  <p className="text-2xl font-bold text-purple-400">#47</p>
                </div>
                <Award className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-ml-dark-100 rounded-lg p-1 mb-8">
            {[
              { id: 'upload', label: 'Upload Data', icon: Upload },
              { id: 'manage', label: 'Manage Contributions', icon: Edit3 },
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
                    <h4 className="font-medium text-ml-primary-400 mb-2">✅ What We Accept</h4>
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
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
                    isDragActive
                      ? 'border-ml-primary-500 bg-ml-primary-500/10'
                      : 'border-ml-dark-300 hover:border-ml-primary-500 hover:bg-ml-primary-500/5'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-16 h-16 text-ml-gray-400 mx-auto mb-4" />
                  <p className="text-xl font-medium text-white mb-2">
                    {isDragActive ? 'Drop your file here' : 'Drag & drop your dataset'}
                  </p>
                  <p className="text-ml-gray-400 mb-4">
                    or click to browse files
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
                {/* Sample contributions - replace with real data */}
                {[
                  {
                    id: '1',
                    name: 'E-commerce Product Images',
                    description: 'High-quality product images from various categories',
                    category: 'Computer Vision',
                    tags: ['ecommerce', 'products', 'images'],
                    status: 'approved',
                    rewardAmount: 150,
                    createdAt: Date.now() - 86400000 * 7,
                    size: 1024 * 1024 * 50, // 50MB
                    format: 'zip'
                  },
                  {
                    id: '2',
                    name: 'Customer Reviews Dataset',
                    description: 'Sentiment analysis dataset with customer reviews',
                    category: 'Natural Language Processing',
                    tags: ['reviews', 'sentiment', 'nlp'],
                    status: 'under_review',
                    createdAt: Date.now() - 86400000 * 3,
                    size: 1024 * 1024 * 25, // 25MB
                    format: 'csv'
                  },
                  {
                    id: '3',
                    name: 'Stock Price Time Series',
                    description: 'Historical stock prices for ML time series analysis',
                    category: 'Financial Data',
                    tags: ['stocks', 'finance', 'timeseries'],
                    status: 'pending',
                    createdAt: Date.now() - 86400000 * 1,
                    size: 1024 * 1024 * 10, // 10MB
                    format: 'csv'
                  }
                ].map((contribution) => {
                  const StatusIcon = getStatusIcon(contribution.status);
                  return (
                    <div
                      key={contribution.id}
                      className="bg-ml-dark-100 rounded-xl p-6 hover:bg-ml-dark-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {contribution.name}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contribution.status)}`}>
                              <StatusIcon className="w-3 h-3 inline mr-1" />
                              {contribution.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-ml-gray-300 mb-3">{contribution.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-ml-gray-400">
                            <span>{contribution.category}</span>
                            <span>•</span>
                            <span>{(contribution.size / (1024 * 1024)).toFixed(1)} MB</span>
                            <span>•</span>
                            <span>{new Date(contribution.createdAt).toLocaleDateString()}</span>
                            {contribution.rewardAmount && (
                              <>
                                <span>•</span>
                                <span className="text-yellow-400 font-medium">
                                  {contribution.rewardAmount} KALE
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {contribution.tags.map((tag) => (
                              <span
                                key={tag}
                                className="bg-ml-dark-200 text-ml-gray-300 text-xs px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-ml-gray-400 hover:text-white transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-ml-gray-400 hover:text-white transition-colors">
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-ml-gray-400 hover:text-red-400 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                      <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                      <p>Performance charts coming soon</p>
                    </div>
                  </div>
                </div>

                {/* Rewards History */}
                <div className="bg-ml-dark-100 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Recent Rewards</h3>
                  <div className="space-y-3">
                    {[
                      { amount: 150, reason: 'E-commerce Product Images', date: '2 days ago' },
                      { amount: 75, reason: 'Customer Reviews Dataset', date: '1 week ago' },
                      { amount: 200, reason: 'Stock Price Time Series', date: '2 weeks ago' }
                    ].map((reward, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-white font-medium">{reward.reason}</p>
                          <p className="text-ml-gray-400 text-sm">{reward.date}</p>
                        </div>
                        <div className="text-yellow-400 font-semibold">
                          +{reward.amount} KALE
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
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                      Dataset File *
                    </label>
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                        isDragActive
                          ? 'border-ml-primary-500 bg-ml-primary-500/10'
                          : 'border-ml-dark-300 hover:border-ml-primary-500'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-12 h-12 text-ml-gray-400 mx-auto mb-4" />
                      <p className="text-white font-medium mb-2">
                        {isDragActive ? 'Drop your file here' : 'Choose or drag & drop your dataset'}
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

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="flex-1 bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                        placeholder="Add a tag and press Enter"
                      />
                      <button
                        onClick={addTag}
                        className="bg-ml-primary-600 hover:bg-ml-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-ml-primary-600/20 text-ml-primary-400 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                        >
                          <span>{tag}</span>
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-ml-primary-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <label className="block text-sm font-medium text-ml-gray-300 mb-2">
                      Suggested Price (KALE tokens)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-ml-primary-500"
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-ml-gray-400 text-sm mt-1">
                      Leave 0 for free datasets or suggest a price for premium data
                    </p>
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
