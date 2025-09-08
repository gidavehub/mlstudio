'use client';
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, File, X, CheckCircle, AlertCircle, Database, Image, FileText, Music } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface FileUploadProps {
  onUploadComplete?: (fileId: string, fileName: string) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  multiple?: boolean;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  acceptedTypes = ['*/*'],
  maxSize = 50 * 1024 * 1024, // 50MB default
  multiple = false,
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    status: 'uploading' | 'success' | 'error';
  }>>([]);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading' as const,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const fileInfo = newFiles[i];

        // Generate upload URL
        const uploadUrl = await generateUploadUrl();

        // Upload file to Convex storage
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        const { storageId } = await result.json();

        // Update file status
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileInfo.id 
              ? { ...f, status: 'success' as const }
              : f
          )
        );

        // Call completion callback
        if (onUploadComplete) {
          onUploadComplete(storageId, file.name);
        }

        setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Update all files to error status
      setUploadedFiles(prev => 
        prev.map(f => ({ ...f, status: 'error' as const }))
      );
    } finally {
      setUploading(false);
    }
  }, [generateUploadUrl, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple,
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (fileType.includes('csv') || fileType.includes('json') || fileType.includes('txt')) {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <motion.div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-ml-blue-50 bg-ml-blue-50/10' 
            : 'border-ml-dark-300 hover:border-ml-blue-50 hover:bg-ml-dark-200/50'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-ml-dark-400" />
          
          {isDragActive ? (
            <p className="text-ml-blue-50 font-medium">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-white font-medium mb-2">
                {multiple ? 'Drop files here or click to browse' : 'Drop a file here or click to browse'}
              </p>
              <p className="text-ml-dark-400 text-sm">
                Max size: {formatFileSize(maxSize)} • 
                Supported: {acceptedTypes.join(', ')}
              </p>
            </div>
          )}
        </motion.div>

        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
          >
            <div className="w-full bg-ml-dark-300 rounded-full h-2">
              <motion.div
                className="bg-ml-blue-50 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-ml-dark-400 text-sm mt-2">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h4 className="text-white font-medium flex items-center gap-2">
            <Database className="w-4 h-4" />
            Uploaded Files
          </h4>
          
          {uploadedFiles.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-ml-dark-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getFileIcon(file.type)}
                <div>
                  <p className="text-white text-sm font-medium">{file.name}</p>
                  <p className="text-ml-dark-400 text-xs">{formatFileSize(file.size)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {file.status === 'uploading' && (
                  <div className="w-4 h-4 border-2 border-ml-blue-50 border-t-transparent rounded-full animate-spin" />
                )}
                {file.status === 'success' && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-ml-dark-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
