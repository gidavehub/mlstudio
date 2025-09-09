'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Image, Database, CheckCircle, AlertCircle, X, Plus, Tag, DollarSign, Calendar } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import FileUpload from './FileUpload';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

export default function DataUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [datasetName, setDatasetName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [price, setPrice] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convex mutations
  const createDataset = useMutation(api.datasets.createDataset);
  const submitContribution = useMutation(api.marketplace.submitContribution);

  const categories = ['Healthcare', 'Finance', 'NLP', 'Computer Vision', 'Audio', 'IoT', 'Other'];

  const handleFileUploadComplete = (fileId: string, fileName: string) => {
    setUploadedFileIds(prev => [...prev, fileId]);
    
    // Add to uploaded files list for display
    const newFile: UploadedFile = {
      id: fileId,
      name: fileName,
      size: 0, // Size will be updated when we get file info
      type: 'application/octet-stream',
      status: 'completed',
      progress: 100
    };
    
    setUploadedFiles(prev => [...prev, newFile]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0
      };

      setUploadedFiles(prev => [...prev, newFile]);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === newFile.id 
              ? { ...f, progress: Math.min(f.progress + 10, 100) }
              : f
          )
        );

        if (newFile.progress >= 100) {
          clearInterval(interval);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === newFile.id 
                ? { ...f, status: 'completed' }
                : f
            )
          );
        }
      }, 200);
    });
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!datasetName || !description || uploadedFiles.length === 0) {
      alert('Please fill in all required fields and upload at least one file');
      return;
    }

    setIsUploading(true);
    
    try {
      // Calculate total file size
      const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
      
      // Determine file format from first file
      const format = uploadedFiles[0]?.name.split('.').pop() || 'unknown';
      
      // Submit as new dataset contribution
      const contributionId = await submitContribution({
        name: datasetName,
        description,
        category,
        tags,
        fileStorageId: uploadedFileIds[0] as any, // Use first file as primary
        size: totalSize,
        format,
        contributionType: 'new_dataset',
        metadata: {
          fileCount: uploadedFiles.length,
          fileIds: uploadedFileIds,
          uploadedAt: Date.now(),
          price: parseFloat(price) || 0,
        },
      });

      // Submit additional files as data additions if there are multiple files
      if (uploadedFileIds.length > 1) {
        // Note: This would require the marketplaceDatasetId from the first contribution
        // For now, we'll just log that additional files were uploaded
        console.log('Additional files uploaded:', uploadedFileIds.slice(1));
      }

      // Reset form
      setDatasetName('');
      setDescription('');
      setCategory('');
      setTags([]);
      setPrice('');
      setUploadedFiles([]);
      setUploadedFileIds([]);
      
      alert('Dataset submitted successfully! It will be reviewed by data owners.');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit dataset. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image size={20} />;
    if (type.includes('csv') || type.includes('json')) return <Database size={20} />;
    return <File size={20} />;
  };

  return (
    <div className="bg-ml-dark-50 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
      <div className="max-w-3xl mx-auto pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Contribute Data</h1>
          <p className="text-slate-300 text-lg">
            Upload your datasets and earn rewards when they're validated by data owners
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700">
              {/* Dataset Information */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Dataset Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Dataset Name *
                    </label>
                    <input
                      type="text"
                      value={datasetName}
                      onChange={(e) => setDatasetName(e.target.value)}
                      placeholder="Enter dataset name..."
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your dataset, its purpose, and any relevant details..."
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="" className="bg-slate-800">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">
                        Suggested Price (USD)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="number"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="0"
                          className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        placeholder="Add a tag..."
                        className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={addTag}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm"
                        >
                          <Tag size={12} />
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="hover:text-blue-100"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Upload Files</h3>
                
                <FileUpload
                  onUploadComplete={handleFileUploadComplete}
                  acceptedTypes={['.csv', '.json', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.zip']}
                  maxSize={100 * 1024 * 1024} // 100MB
                  multiple={true}
                />
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Uploaded Files</h3>
                  <div className="space-y-3">
                    {uploadedFiles.map(file => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type)}
                          <div>
                            <p className="text-white font-medium">{file.name}</p>
                            <p className="text-slate-400 text-sm">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {file.status === 'uploading' && (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 transition-all duration-300"
                                  style={{ width: `${file.progress}%` }}
                                />
                              </div>
                              <span className="text-slate-400 text-sm">{file.progress}%</span>
                            </div>
                          )}
                          
                          {file.status === 'completed' && (
                            <CheckCircle className="text-green-400" size={20} />
                          )}
                          
                          {file.status === 'error' && (
                            <AlertCircle className="text-red-400" size={20} />
                          )}
                          
                          <button
                            onClick={() => removeFile(file.id)}
                            className="text-slate-400 hover:text-red-400 transition-colors duration-200"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isUploading || !datasetName || !description || uploadedFiles.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Submitting...' : 'Submit Dataset'}
              </button>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Rewards Info */}
            <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-md rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Reward System</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-400" size={20} />
                  <span className="text-slate-300 text-sm">Data validation by owners</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-400" size={20} />
                  <span className="text-slate-300 text-sm">Rewards based on data size</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-400" size={20} />
                  <span className="text-slate-300 text-sm">KALE token distribution</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-400" size={20} />
                  <span className="text-slate-300 text-sm">Reflector price feeds</span>
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Guidelines</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <p>• Ensure data quality and accuracy</p>
                <p>• Provide clear descriptions</p>
                <p>• Use appropriate tags</p>
                <p>• Follow data privacy laws</p>
                <p>• Include data source information</p>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Your Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Datasets Submitted</span>
                  <span className="text-white font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Total Rewards</span>
                  <span className="text-green-400 font-semibold">0 KALE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300 text-sm">Pending Reviews</span>
                  <span className="text-yellow-400 font-semibold">0</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
