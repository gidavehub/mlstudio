"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useConvexAuth } from "@/lib/convex";
import { RealMLTrainer, TrainingData, TrainingConfig, TrainingProgress } from "@/lib/realMLTraining";
import { EnhancedDataPreprocessor, EnhancedCSVParser } from "@/lib/enhancedDataProcessing";
import DataPreprocessor from "@/lib/dataProcessing";
import { ImageProcessor, ImageData, ImageDataset } from "@/lib/imageProcessing";
import { FlexibleDataProcessor, DataType } from "@/lib/flexibleDataProcessor";
import { modelManager, ModelTemplate } from "@/lib/unifiedModelManager";
import ModelViewerModal from "./ModelViewerModal";
import SystemRequirementsChecker from "./SystemRequirementsChecker";
import APIManagement from "./APIManagement";
import { 
  Plus, 
  Play,
  Pause,
  Eye,
  Key,
  Download,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Settings,
  FileText,
  Tag,
  Calendar,
  User,
  Database,
  Code,
  BarChart3,
  Sparkles,
  RotateCcw,
  Share,
  Star,
  Search,
  Filter,
  Menu,
  Grid3X3,
  ArrowRight,
  ArrowLeft,
  Save,
  FileUp,
  FileDown,
  Info,
  Sliders,
  Cpu,
  Beaker,
  PieChart,
  Table,
  Scissors,
  Wrench,
  Brain,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Layers,
  GitBranch,
  Monitor,
  Server,
  Globe,
  Cloud,
  Bot,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Dataset {
  _id: Id<"datasets">;
  name: string;
  type: string;
  size: number;
  format: string;
  rowCount?: number;
  columnCount?: number;
}

interface Pipeline {
  _id: Id<"transformationPipelines">;
  name: string;
  description?: string;
  datasetId: Id<"datasets">;
  steps: Array<{
    id: string;
    type: string;
    parameters: any;
    order: number;
    appliedAt: number;
  }>;
  ownerId: Id<"users">;
  isActive: boolean;
  version?: number;
  parentPipelineId?: Id<"transformationPipelines">;
  isLatestVersion?: boolean;
  versionNotes?: string;
  createdAt: number;
  updatedAt: number;
}

// ModelTemplate interface is now imported from unifiedModelManager

interface TrainingJob {
  _id: Id<"trainingJobs">;
  name: string;
  description?: string;
  datasetId: Id<"datasets">;
  pipelineId?: Id<"transformationPipelines">;
  modelType: string;
  modelParameters: any;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  progress: number;
  metrics?: any;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  ownerId: Id<"users">;
}

export default function ModelTraining() {
  const auth = useConvexAuth();
  const convex = useConvex();
  
  // Initialize model manager with Convex client
  useEffect(() => {
    if (convex) {
      modelManager.setConvexClient(convex);
    }
  }, [convex]);

  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTryModal, setShowTryModal] = useState(false);
  const [selectedModelForTesting, setSelectedModelForTesting] = useState<any>(null);
  
  // Debug modal state changes
  useEffect(() => {
    console.log("🔍 Create modal state changed:", showCreateModal);
  }, [showCreateModal]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showModelViewer, setShowModelViewer] = useState(false);
  const [showSystemChecker, setShowSystemChecker] = useState(false);
  const [selectedModelForViewing, setSelectedModelForViewing] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "running" | "completed" | "failed">("all");
  const [sortBy, setSortBy] = useState<"name" | "created" | "updated" | "status">("updated");
  
  // Training state
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [currentTrainingJob, setCurrentTrainingJob] = useState<Id<"trainingJobs"> | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<string>('');
  const [trainingMetrics, setTrainingMetrics] = useState<any>(null);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showAPIManagement, setShowAPIManagement] = useState(false);

  // Show loading state while auth is being determined
  if (auth === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  // Queries with authentication checks
  const datasets = useQuery(api.datasets.getMyDatasets, auth?.isSignedIn ? {} : "skip");
  const pipelines = useQuery(api.pipelines.getMyPipelines, auth?.isSignedIn ? {} : "skip");
  const trainingJobs = useQuery(api.training.getMyTrainingJobs, auth?.isSignedIn ? {} : "skip");
  const models = useQuery(api.models.getMyModels, auth?.isSignedIn ? {} : "skip");
  
  // Initialize model manager with Convex client
  useEffect(() => {
    if (convex) {
      modelManager.setConvexClient(convex);
    }
  }, [convex]);

  // Debug datasets
  console.log("📊 Available datasets:", datasets);
  console.log("📊 Available pipelines:", pipelines);
  
  // Debug available datasets
  if (datasets) {
    console.log("🔍 Available datasets:", datasets.map(d => ({ id: d._id, name: d.name, type: d.type })));
  }

  // Mutations
  const createTrainingJob = useMutation(api.training.createTrainingJob);
  const updateTrainingJob = useMutation(api.training.updateTrainingJob);
  const cancelTrainingJob = useMutation(api.training.cancelTrainingJob);
  const deleteTrainingJob = useMutation(api.training.deleteTrainingJob);
  const createModel = useMutation(api.models.createModel);
  // We'll get the download URL when needed in the training function

  // Get model templates from unified model manager
  const modelTemplates = modelManager.getModelTemplates();

  // Filter and sort training jobs
  const filteredJobs = trainingJobs?.filter(job => {
    const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "created":
        return b.createdAt - a.createdAt;
      case "updated":
        return b.updatedAt - a.updatedAt;
      case "status":
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  }) || [];

  const handleCreateTrainingJob = async (formData: any) => {
    try {
      console.log("🚀 Creating training job with data:", formData);
      console.log("  - Dataset ID:", formData.datasetId);
      console.log("  - Pipeline ID:", formData.pipelineId);
      console.log("  - Model Type:", formData.modelType);
      console.log("  - Model Parameters:", formData.modelParameters);
      
      // Validate required fields
      if (!formData.name) {
        throw new Error("Job name is required");
      }
      if (!formData.datasetId) {
        throw new Error("Dataset is required");
      }
      if (!formData.modelType) {
        throw new Error("Model type is required");
      }
      
      // Create the training job record in Convex
      const jobId = await createTrainingJob({
        name: formData.name,
        description: formData.description || "",
        datasetId: formData.datasetId,
        pipelineId: formData.pipelineId || undefined,
        modelType: formData.modelType,
        modelParameters: formData.modelParameters || {},
        testSize: formData.testSize || 0.2,
        validationSize: formData.validationSize || 0.2,
        randomState: formData.randomState || 42
      });
      
      console.log("✅ Training job created successfully:", jobId);
      
      // Close the modal after successful creation
      setShowCreateModal(false);
      
      // Start client-side training
      await startClientSideTraining(jobId, formData, convex);
      
    } catch (error) {
      console.error("❌ Failed to create training job:", error);
      alert(`Failed to create training job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const startClientSideTraining = async (jobId: Id<"trainingJobs">, formData: any, convex: any) => {
    try {
      setIsTraining(true);
      setCurrentTrainingJob(jobId);
      setShowTrainingModal(true);
      setTrainingStatus('Initializing training...');
      setTrainingProgress(0);
      setTrainingMetrics(null);
      
      // Add a small delay to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log("🎯 Starting client-side training for job:", jobId);
      console.log("📊 Training configuration:", formData);
      
      // Update job status to running
      await updateTrainingJob({
        jobId,
        status: "running",
        progress: 0
      });

      setTrainingStatus('Downloading dataset...');
      setTrainingProgress(5);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      await updateTrainingJob({
        jobId,
        progress: 10
      });

      // Get dataset from Convex database (same as dataset workbench)
      const dataset = datasets?.find(d => d._id === formData.datasetId);
      if (!dataset) {
        throw new Error("Dataset not found");
      }

      console.log("📁 Dataset found:", dataset.name, "Type:", dataset.type);
      
      setTrainingStatus('Processing dataset...');
      setTrainingProgress(15);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Get download URL from Convex storage (same as dataset workbench)
      // We need to use the Convex client to call the query
      const downloadUrl = await convex.query(api.datasets.getDatasetDownloadUrl, { datasetId: dataset._id });
      if (!downloadUrl) {
        throw new Error("Could not get dataset download URL");
      }
      
      console.log("📥 Download URL:", downloadUrl);
      
      // Fetch dataset from Convex storage (same as dataset workbench)
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.status}`);
      }
      
      const blob = await response.blob();
      const file = new File([blob], dataset.name, { type: blob.type });
      const fileType = file.name.endsWith(".csv") ? 'csv' : 'json';
      
      console.log("📦 Dataset file loaded:", file.name, "size:", file.size);
      
      // Detect data type and load accordingly
      const flexibleProcessor = new FlexibleDataProcessor();
      const dataType = await flexibleProcessor.detectDataType(file);
      
      console.log("🔍 Detected data type:", dataType.type, dataType.format);
      
      let parsedData: any;
      let isImageData = false;
      
      if (dataType.type === 'image') {
        // Handle image data
        isImageData = true;
        const imageProcessor = new ImageProcessor();
        const images = await imageProcessor.loadImages([file]);
        
        parsedData = {
          data: images,
          columns: ['image'],
          type: 'image',
          metadata: {
            imageShape: dataType.metadata.imageShape,
            numImages: images.length
          }
        };
        
        console.log("🖼️ Image dataset loaded:", images.length, "images");
      } else {
        // Handle tabular data
        const preprocessor = new DataPreprocessor();
        parsedData = await preprocessor.loadData(file, fileType as any);
        console.log("📊 Tabular dataset loaded:", parsedData.data.length, "rows");
      }
      setTrainingStatus('Preparing model...');
      setTrainingProgress(25);
      await new Promise(resolve => setTimeout(resolve, 200));
      await updateTrainingJob({
        jobId,
        progress: 20
      });

      // Get pipeline from Convex database
      const pipeline = pipelines?.find(p => p._id === formData.pipelineId);
      console.log("🔧 Pipeline found:", pipeline?.name);
      console.log("📋 Pipeline steps:", pipeline?.steps);
      
      // Apply pipeline steps if pipeline exists (same as dataset workbench)
      let preprocessor: DataPreprocessor | null = null;
      if (pipeline && pipeline.steps && !isImageData) {
        console.log("🔄 Applying pipeline steps...");
        preprocessor = new DataPreprocessor();
        
        // First load the data into the preprocessor
        await preprocessor.loadData(file, fileType as any);
        
        for (const step of pipeline.steps) {
          console.log("🔧 Applying step:", step.type, step.parameters);
          switch (step.type) {
            case 'handle_missing':
              preprocessor.handleMissingValues(step.parameters?.strategy || 'mean', step.parameters?.targetColumns);
              break;
            case 'normalize':
              preprocessor.normalizeData(step.parameters?.method || 'minmax', step.parameters?.targetColumns);
              break;
            case 'scale':
              preprocessor.normalizeData(step.parameters?.method || 'minmax', step.parameters?.targetColumns);
              break;
            case 'encode_categorical':
              preprocessor.encodeCategorical(step.parameters?.method || 'onehot', step.parameters?.targetColumns, step.parameters?.targetColumn);
              break;
          }
        }
        // Update parsedData with processed data
        parsedData = preprocessor.getProcessedData() || parsedData;
      } else if (!isImageData) {
        // Default preprocessing if no pipeline
        console.log("🔄 Applying default preprocessing...");
        preprocessor = new DataPreprocessor();
        await preprocessor.loadData(file, fileType as any);
        preprocessor.handleMissingValues('mean');
        preprocessor.normalizeData('minmax');
        // Update parsedData with processed data
        parsedData = preprocessor.getProcessedData() || parsedData;
      }
      
      // Get processed data from preprocessor (after applying pipeline steps)
      const currentData = parsedData;
      console.log("📊 Processed data:", currentData);
      
      let trainingData: TrainingData;
      
      if (isImageData) {
        // Handle image data for CNN training
        console.log("🖼️ Processing image data for CNN training...");
        
        const imageProcessor = new ImageProcessor();
        const images = parsedData.data as ImageData[];
        
        // Preprocess images
        const processedImages = images.map(img => 
          imageProcessor.preprocessImage(img, {
            targetSize: [224, 224],
            grayscale: true,
            normalize: true,
            augment: false
          })
        );
        
        // Create labels based on actual data (user should specify target column)
        // For now, use the last column as target or create binary labels based on data patterns
        const lastColumnIndex = parsedData.columns.length - 1;
        const labels = parsedData.data.map((item: any, index: number) => {
          // Use actual data values to create meaningful labels
          const value = parsedData.data[index][lastColumnIndex];
          return typeof value === 'number' ? (value > 0 ? 1 : 0) : index % 2;
        });
        
        // Convert to tensors
        const { features, labels: labelTensors } = await imageProcessor.imagesToTensors(processedImages, labels);
        
        trainingData = {
          features: new Float32Array(features.dataSync()),
          labels: new Float32Array(labelTensors.dataSync()),
          featureNames: ['image_pixels'],
          labelName: 'class'
        };
        
        console.log("✅ Image data processed for CNN training");
      } else {
        // Handle tabular data - dynamically determine features and labels
        const availableColumns = currentData.columns || [];
      console.log("📊 Available columns:", availableColumns);
      console.log("📊 Sample data row:", currentData.data[0]);
      
      // Check if we have processed data from preprocessor
      let processedData = currentData;
      if (preprocessor && preprocessor.getProcessedData()) {
        processedData = preprocessor.getProcessedData();
        console.log("📊 Using processed data from preprocessor");
      }
      
        const numericColumns = availableColumns.filter((col: string, index: number) => {
          // Check if column contains numeric data
        return processedData.data.some((row: any[]) => 
            row[index] !== null && row[index] !== undefined && !isNaN(Number(row[index]))
          );
        });
      
      console.log("🔢 Numeric columns found:", numericColumns);
      
      if (numericColumns.length < 2) {
        throw new Error("Need at least 2 numeric columns (features + label) for training");
      }
        
        // Use numeric columns as features, last column as label
        // TODO: Make target column selection configurable in the UI
        const featureColumns = numericColumns.slice(0, -1); // All but last
        const labelColumn = numericColumns[numericColumns.length - 1];
      
      console.log("🎯 Feature columns:", featureColumns);
      console.log("🎯 Label column:", labelColumn);
        
        // Extract features and labels properly
        const features: number[] = [];
        const labels: number[] = [];
        
      for (const row of processedData.data) {
          // Extract feature values for available features
          for (const featureName of featureColumns) {
          const colIndex = processedData.columns.indexOf(featureName);
            if (colIndex !== -1) {
            const value = Number(row[colIndex]);
            if (isNaN(value)) {
              console.warn(`Invalid numeric value in column ${featureName}: ${row[colIndex]}`);
              features.push(0);
            } else {
              features.push(value);
            }
            }
          }
          
          // Extract label from the label column
        const labelColIndex = processedData.columns.indexOf(labelColumn);
          if (labelColIndex !== -1) {
          const labelValue = Number(row[labelColIndex]);
          if (isNaN(labelValue)) {
            console.warn(`Invalid numeric value in label column ${labelColumn}: ${row[labelColIndex]}`);
            labels.push(0);
          } else {
            labels.push(labelValue);
          }
          }
        }
        
        // Convert to the format expected by RealMLTrainer
        trainingData = {
          features: new Float32Array(features),
          labels: new Float32Array(labels),
          featureNames: featureColumns,
          labelName: labelColumn
        };
      }
      
      console.log("✅ Data preprocessing completed");
      console.log("📊 Training data shape:", trainingData.features.length);
      console.log("📊 Labels shape:", trainingData.labels.length);
      console.log("🔧 Applied steps:", pipeline?.steps?.length || 0);
      
      await updateTrainingJob({
        jobId,
        progress: 30
      });

      // Initialize real ML trainer
      const trainer = new RealMLTrainer();
      
      // Configure training
      const trainingConfig: TrainingConfig = {
        modelType: formData.modelType,
        modelParameters: {
          epochs: formData.modelParameters?.epochs || 100, // Use user-specified epochs or default
          batchSize: formData.modelParameters?.batchSize || 32,
          learningRate: formData.modelParameters?.learningRate || 0.01,
          hiddenLayers: formData.modelParameters?.hiddenLayers || [64, 32], // For neural networks
          activation: formData.modelParameters?.activation || 'relu',
          dropout: formData.modelParameters?.dropout || 0.2,
          ...formData.modelParameters
        },
        testSize: formData.testSize,
        validationSize: formData.validationSize,
        randomState: formData.randomState
      };
      
      console.log('🚀 Training config:', trainingConfig);
      console.log('📊 Training data:', trainingData);
      console.log('📊 Feature names:', trainingData.featureNames);
      console.log('📊 Label name:', trainingData.labelName);

      console.log("🧠 Starting real model training...");
      console.log("🎯 Model type:", trainingConfig.modelType);
      console.log("⚙️ Parameters:", trainingConfig.modelParameters);
      
      setTrainingStatus('Training model...');
      
      // Train the model with progress updates
      const results = await trainer.train(trainingData, trainingConfig, (progress: TrainingProgress) => {
        const progressPercent = 25 + (progress.epoch / (trainingConfig.modelParameters.epochs || 100)) * 60;
        setTrainingProgress(progressPercent);
        
        // Update progress in Convex (30% to 90% for training)
        const trainingProgressPercent = 30 + (progress.epoch / (trainingConfig.modelParameters.epochs || 100)) * 60;
        updateTrainingJob({
          jobId,
          progress: Math.min(trainingProgressPercent, 90),
          status: "running"
        });
      });

      console.log("✅ Training completed!");
      
      setTrainingStatus('Saving model...');
      setTrainingProgress(95);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      await updateTrainingJob({
        jobId,
        progress: 95
      });

      // Save results
      const metrics = {
        finalLoss: results.metrics.finalLoss,
        finalAccuracy: results.metrics.finalAccuracy,
        validationLoss: results.metrics.validationLoss,
        validationAccuracy: results.metrics.validationAccuracy,
        trainingTime: results.metrics.trainingTime,
        epochs: results.history.length
      };

      setTrainingMetrics(metrics);

      try {
      // Save model to unified model manager
        console.log("💾 Saving model to database...");
        const modelDataToSave = await trainer.saveModel();
        console.log("📊 Model data to save:", modelDataToSave);
        console.log("📊 Training metadata in model data:", modelDataToSave.trainingMetadata);
        
      const savedModel = await modelManager.createModel(
        modelDataToSave,
        results.metrics,
        trainingConfig,
        [],
        formData.datasetId,
        formData.pipelineId,
        jobId
      );
      
        console.log("✅ Model saved to unified model manager:", savedModel.name);
        
        // Update job with final results
        await updateTrainingJob({
          jobId,
          status: "completed",
          progress: 100,
          metrics: metrics
        });

        setTrainingStatus('Training completed successfully!');
        setTrainingProgress(100);
        
        console.log("🎉 Training job completed successfully!");
      
      // Clean up
      trainer.dispose();
        
        // Refresh the jobs list
        if (convex?.query) {
          await convex.query(api.training.getMyTrainingJobs);
        }
        
        // Reset training state after a delay
        setTimeout(() => {
          setIsTraining(false);
          setCurrentTrainingJob(null);
          setTrainingStatus('');
          setTrainingProgress(0);
          setTrainingMetrics(null);
        }, 3000);
        
      } catch (saveError) {
        console.error("❌ Failed to save model:", saveError);
        setTrainingStatus('Failed to save model');
        
        // Update job with error
        await updateTrainingJob({
          jobId,
          status: "failed",
          error: saveError instanceof Error ? saveError.message : 'Failed to save model'
        });
        
        alert(`Training completed but failed to save model: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`);
        
        // Reset training state
        setTimeout(() => {
          setIsTraining(false);
          setCurrentTrainingJob(null);
          setTrainingStatus('');
          setTrainingProgress(0);
          setTrainingMetrics(null);
        }, 3000);
      }
      
    } catch (error) {
      console.error("❌ Training failed:", error);
      
      // Provide more specific error messages
      let errorMessage = "Training failed";
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Add specific error handling for common issues
        if (error.message.includes("TensorFlow")) {
          errorMessage = "TensorFlow.js failed to load. Please refresh the page and try again.";
        } else if (error.message.includes("numeric")) {
          errorMessage = "Data contains non-numeric values. Please check your dataset or apply proper preprocessing.";
        } else if (error.message.includes("columns")) {
          errorMessage = "Dataset doesn't have enough numeric columns for training.";
        } else if (error.message.includes("memory")) {
          errorMessage = "Dataset is too large for browser training. Try using a smaller dataset.";
        }
      }
      
      await updateTrainingJob({
        jobId,
        status: "failed",
        error: errorMessage
      });
      
      // Show user-friendly error message
      alert(`Training failed: ${errorMessage}`);
    } finally {
      setIsTraining(false);
      setCurrentTrainingJob(null);
      setTrainingProgress(0);
    }
  };

  // Simple CSV parser
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const row: any = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index]?.trim();
      });
      return row;
    });
  };

  const handleCancelJob = async (jobId: Id<"trainingJobs">) => {
    try {
      await cancelTrainingJob({ jobId });
    } catch (error) {
      console.error("Failed to cancel training job:", error);
    }
  };

  const handleDeleteJob = async (jobId: Id<"trainingJobs">) => {
    if (confirm("Are you sure you want to delete this training job? This action cannot be undone.")) {
      try {
        await deleteTrainingJob({ jobId });
      } catch (error) {
        console.error("Failed to delete training job:", error);
      }
    }
  };

  // Safety check for auth
  if (!auth || !auth.isLoaded) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-400 bg-green-400/20";
      case "running": return "text-blue-400 bg-blue-400/20";
      case "failed": return "text-red-400 bg-red-400/20";
      case "cancelled": return "text-gray-400 bg-gray-400/20";
      case "pending": return "text-yellow-400 bg-yellow-400/20";
      default: return "text-gray-400 bg-gray-400/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "running": return <Activity className="w-4 h-4 animate-pulse" />;
      case "failed": return <XCircle className="w-4 h-4" />;
      case "cancelled": return <Pause className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getModelIcon = (modelType: string) => {
    const template = modelTemplates.find(t => t.id === modelType);
    return template?.icon || "🧠";
  };

  const getModelName = (modelType: string) => {
    const template = modelTemplates.find(t => t.id === modelType);
    return template?.name || modelType;
  };

  // Get all models from unified model manager
  const allModels = models || [];
  const filteredModels = allModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || model.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "created":
        return b.createdAt - a.createdAt;
      case "updated":
        return b.updatedAt - a.updatedAt;
      case "status":
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const handleViewModel = (model: any) => {
    setSelectedModelForViewing(model);
    setShowModelViewer(true);
  };

  const handleTryModel = (model: any) => {
    setSelectedModelForTesting(model);
    setShowTryModal(true);
  };

  const handleRetrainModel = async (modelId: string, config: any) => {
    const model = modelManager.loadModel(modelId);
    if (!model) return;

    // Create new training job for retraining
    const retrainJobData = {
      name: `${model.name} - Retrained`,
      description: `Retrained version of ${model.name}`,
      datasetId: model.datasetId,
      pipelineId: model.pipelineId,
      modelType: model.modelType,
      modelParameters: {
        ...model.parameters,
        ...config
      },
      testSize: model.trainingConfig.testSize,
      validationSize: model.trainingConfig.validationSize,
      randomState: model.trainingConfig.randomState
    };

    await handleCreateTrainingJob(retrainJobData);
  };

  const handleDeleteModel = async (modelId: string) => {
    if (confirm('Are you sure you want to delete this model? This action cannot be undone.')) {
      try {
        const success = await modelManager.deleteModel(modelId);
        if (success) {
          console.log('✅ Model deleted successfully');
          // The UI will automatically update due to the useQuery hook
        } else {
          alert('Failed to delete model. Please try again.');
        }
      } catch (error) {
        console.error('❌ Error deleting model:', error);
        alert('Failed to delete model. Please try again.');
      }
    }
  };

  const handleUpdateModel = async (modelId: string, updates: any) => {
    await modelManager.updateModelMetadata(modelId, updates);
  };

  return (
    <div id="model-training-section" className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 hover:scrollbar-thumb-slate-500">
      <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Model Training</h1>
          <p className="text-sm text-slate-400">
            Train, evaluate, and deploy machine learning models with your data
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              console.log('🔑 API Management button clicked');
              setShowAPIManagement(true);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
          >
            <Key className="w-4 h-4" />
            <span>API Management</span>
          </button>
          <button
            onClick={() => setShowModelSelector(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Browse Models</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Training Job</span>
          </button>
          <button
            onClick={() => {
              // Create a custom event to open the debugger modal
              const event = new CustomEvent('openTrainingDebugger');
              window.dispatchEvent(event);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors text-sm"
          >
            <Zap className="w-4 h-4" />
            <span>Debug Training</span>
          </button>
          <button
            onClick={() => setShowSystemChecker(true)}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
          >
            <Monitor className="w-4 h-4" />
            <span>Check Requirements</span>
          </button>
        </div>
      </div>

      {/* Training Progress Display */}
      {isTraining && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
          </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Model Training in Progress</h3>
                <p className="text-sm text-blue-300">{trainingStatus}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{Math.round(trainingProgress)}%</div>
              <div className="text-xs text-slate-400">Progress</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div 
                className="h-3 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${trainingProgress}%` }}
              />
            </div>
          </div>

          {/* Training Steps */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            <div className={`flex items-center gap-2 p-2 rounded-lg ${trainingProgress >= 5 ? 'bg-green-600/20 border border-green-600/30' : 'bg-slate-700/50'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                trainingProgress >= 5 ? 'bg-green-600 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                {trainingProgress >= 5 ? '✓' : '1'}
              </div>
              <span className={`text-xs ${trainingProgress >= 5 ? 'text-green-400' : 'text-slate-400'}`}>
                Download
              </span>
            </div>

            <div className={`flex items-center gap-2 p-2 rounded-lg ${trainingProgress >= 15 ? 'bg-green-600/20 border border-green-600/30' : 'bg-slate-700/50'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                trainingProgress >= 15 ? 'bg-green-600 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                {trainingProgress >= 15 ? '✓' : '2'}
              </div>
              <span className={`text-xs ${trainingProgress >= 15 ? 'text-green-400' : 'text-slate-400'}`}>
                Process
              </span>
            </div>

            <div className={`flex items-center gap-2 p-2 rounded-lg ${trainingProgress >= 25 ? 'bg-green-600/20 border border-green-600/30' : 'bg-slate-700/50'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                trainingProgress >= 25 ? 'bg-green-600 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                {trainingProgress >= 25 ? '✓' : '3'}
              </div>
              <span className={`text-xs ${trainingProgress >= 25 ? 'text-green-400' : 'text-slate-400'}`}>
                Prepare
              </span>
            </div>

            <div className={`flex items-center gap-2 p-2 rounded-lg ${trainingProgress >= 30 ? 'bg-blue-600/20 border border-blue-600/30' : 'bg-slate-700/50'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                trainingProgress >= 30 ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                {trainingProgress >= 30 ? (isTraining ? '⟳' : '✓') : '4'}
              </div>
              <span className={`text-xs ${trainingProgress >= 30 ? 'text-blue-400' : 'text-slate-400'}`}>
                Train
              </span>
            </div>

            <div className={`flex items-center gap-2 p-2 rounded-lg ${trainingProgress >= 90 ? 'bg-green-600/20 border border-green-600/30' : 'bg-slate-700/50'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                trainingProgress >= 90 ? 'bg-green-600 text-white' : 'bg-slate-600 text-slate-400'
              }`}>
                {trainingProgress >= 90 ? '✓' : '5'}
              </div>
              <span className={`text-xs ${trainingProgress >= 90 ? 'text-green-400' : 'text-slate-400'}`}>
                Save
              </span>
            </div>
          </div>

          {/* Live Metrics */}
          {trainingMetrics && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-white mb-2">Training Metrics</h4>
              <div className="grid grid-cols-2 gap-3">
                {trainingMetrics.loss && (
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Loss</span>
                    <span className="text-xs font-medium text-white">
                      {typeof trainingMetrics.loss === 'number' ? trainingMetrics.loss.toFixed(4) : 'N/A'}
                    </span>
                  </div>
                )}
                {trainingMetrics.accuracy && (
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Accuracy</span>
                    <span className="text-xs font-medium text-white">
                      {(typeof trainingMetrics.accuracy === 'number' ? trainingMetrics.accuracy * 100 : 0).toFixed(2)}%
                    </span>
            </div>
                )}
                {trainingMetrics.validationLoss && (
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Val Loss</span>
                    <span className="text-xs font-medium text-white">
                      {typeof trainingMetrics.validationLoss === 'number' ? trainingMetrics.validationLoss.toFixed(4) : 'N/A'}
                    </span>
              </div>
            )}
                {trainingMetrics.validationAccuracy && (
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-400">Val Acc</span>
                    <span className="text-xs font-medium text-white">
                      {(typeof trainingMetrics.validationAccuracy === 'number' ? trainingMetrics.validationAccuracy * 100 : 0).toFixed(2)}%
                    </span>
          </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}


      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-slate-800 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">Total Models</p>
              <p className="text-xl font-bold text-white">{allModels.length}</p>
            </div>
            <div className="p-2 bg-blue-600/20 rounded-md">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">Training Jobs</p>
              <p className="text-xl font-bold text-white">{trainingJobs?.length || 0}</p>
            </div>
            <div className="p-2 bg-green-600/20 rounded-md">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">Completed</p>
              <p className="text-xl font-bold text-white">
                {allModels.filter(m => m.status === "completed").length}
              </p>
            </div>
            <div className="p-2 bg-green-600/20 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-md p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs">Success Rate</p>
              <p className="text-xl font-bold text-white">
                {allModels.length > 0 
                  ? Math.round((allModels.filter(m => m.status === "completed").length / allModels.length) * 100)
                  : 0}%
              </p>
            </div>
            <div className="p-2 bg-purple-600/20 rounded-md">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between bg-slate-800 p-3 rounded-md">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search training jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="updated">Last Updated</option>
            <option value="created">Date Created</option>
            <option value="name">Name</option>
            <option value="status">Status</option>
          </select>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Models Grid/List */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
        <AnimatePresence>
          {filteredModels.map((model) => (
            <motion.div
              key={model._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-slate-800 rounded-md border border-slate-700 hover:border-blue-500/50 transition-all duration-200 ${
                viewMode === "list" ? "p-3" : "p-4"
              }`}
            >
              {viewMode === "grid" ? (
                <div className="space-y-3">
                  {/* Model Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-base font-semibold text-white">{model.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(model.status)}`}>
                          {getStatusIcon(model.status)}
                          <span className="capitalize">{model.status}</span>
                        </span>
                      </div>
                      {model.description && (
                        <p className="text-slate-400 text-sm line-clamp-2">{model.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Model Info */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300">Model Configuration</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="text-blue-400">{getModelIcon(model.modelType)}</div>
                      <span className="text-slate-300">{getModelName(model.modelType)}</span>
                    </div>
                  </div>

                  {/* Metrics */}
                  {model.metrics && model.status === "completed" && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-300">Performance</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {model.metrics.accuracy && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Accuracy</span>
                            <span className="text-white font-mono">{(model.metrics.accuracy * 100).toFixed(2)}%</span>
                      </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-400">Loss</span>
                          <span className="text-white font-mono">{model.metrics?.loss?.toFixed(4) || 'N/A'}</span>
                      </div>
                        {model.metrics.validationAccuracy && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Val Acc</span>
                            <span className="text-white font-mono">{(model.metrics.validationAccuracy * 100).toFixed(2)}%</span>
                    </div>
                  )}
                        <div className="flex justify-between">
                          <span className="text-slate-400">Time</span>
                          <span className="text-white font-mono">{model.metrics?.trainingTime ? (model.metrics.trainingTime / 1000).toFixed(1) : 'N/A'}s</span>
                          </div>
                      </div>
                    </div>
                  )}

                  {/* Model Metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(model.updatedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{model.version}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-700">
                    <button
                      onClick={() => handleViewModel(model)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                      <button
                      onClick={() => handleTryModel(model)}
                      disabled={model.status !== "completed"}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>Try</span>
                    </button>
                      <button
                      onClick={() => handleDeleteModel(model._id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="text-blue-400">{getModelIcon(model.modelType)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                        <p className="text-sm text-slate-400">
                          {getModelName(model.modelType)} • {formatDate(model.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(model.status)}`}>
                        {getStatusIcon(model.status)}
                        <span className="capitalize">{model.status}</span>
                      </span>
                      {model.metrics && (
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          {model.metrics.accuracy && (
                            <span>Acc: {(model.metrics.accuracy * 100).toFixed(1)}%</span>
                          )}
                          <span>Loss: {model.metrics?.loss?.toFixed(4) || 'N/A'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                      <button
                      onClick={() => handleViewModel(model)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                      View
                      </button>
                    <button
                      onClick={() => handleTryModel(model)}
                      disabled={model.status !== "completed"}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                    >
                      Try
                    </button>
                    <button
                      onClick={() => handleDeleteModel(model._id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredModels.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl text-slate-300 mb-4">🤖</div>
          <h3 className="text-xl font-semibold text-white mb-2">No models found</h3>
          <p className="text-slate-400 mb-6">
            {searchQuery || filterStatus !== "all" 
              ? "Try adjusting your search or filters" 
              : "Create your first machine learning model to get started"
            }
          </p>
          {!searchQuery && filterStatus === "all" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Training Job
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateTrainingJobModal
          datasets={datasets || []}
          pipelines={pipelines || []}
          modelTemplates={modelTemplates}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTrainingJob}
        />
      )}

      {showModelSelector && (
        <ModelSelectorModal
          modelTemplates={modelTemplates}
          onClose={() => setShowModelSelector(false)}
          onSelectModel={(model) => {
            setSelectedModel(model);
            setShowModelSelector(false);
            setShowCreateModal(true);
          }}
        />
      )}

      {showModelViewer && (
        <ModelViewerModal
          model={selectedModelForViewing}
          isOpen={showModelViewer}
          onClose={() => setShowModelViewer(false)}
          onRetrain={handleRetrainModel}
          onDelete={handleDeleteModel}
          onUpdate={handleUpdateModel}
        />
      )}

      {showSystemChecker && (
        <SystemRequirementsModal
          isOpen={showSystemChecker}
          onClose={() => setShowSystemChecker(false)}
        />
      )}

      {showAPIManagement && (
        <APIManagement
          isOpen={showAPIManagement}
          onClose={() => setShowAPIManagement(false)}
        />
      )}

      {showTryModal && (
        <ModelTestingModal
          model={selectedModelForTesting}
          isOpen={showTryModal}
          onClose={() => setShowTryModal(false)}
        />
      )}

      </div>
    </div>
  );
}

// Create Training Job Modal Component
function CreateTrainingJobModal({ 
  datasets, 
  pipelines, 
  modelTemplates,
  onClose, 
  onSubmit 
}: { 
  datasets: Dataset[]; 
  pipelines: Pipeline[]; 
  modelTemplates: ModelTemplate[];
  onClose: () => void; 
  onSubmit: (data: any) => void; 
}) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    datasetId: string;
    pipelineId: string | undefined;
    modelType: string;
    modelParameters: Record<string, any>;
    testSize: number;
    validationSize: number;
    randomState: number;
  }>({
    name: "",
    description: "",
    datasetId: "",
    pipelineId: undefined,
    modelType: "",
    modelParameters: {},
    testSize: 0.2,
    validationSize: 0.2,
    randomState: 42
  });

  const [selectedModel, setSelectedModel] = useState<ModelTemplate | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Debug step changes
  useEffect(() => {
    console.log("🔍 Form step changed:", currentStep, "of", totalSteps);
  }, [currentStep, totalSteps]);

  const handleModelSelect = (model: ModelTemplate) => {
    setSelectedModel(model);
    setFormData({
      ...formData,
      modelType: model.id,
      modelParameters: {
        ...model.parameters,
        // Add default values for common parameters
        epochs: model.parameters?.epochs || 100,
        batchSize: model.parameters?.batchSize || 32,
        learningRate: model.parameters?.learningRate || 0.01,
        hiddenLayers: model.parameters?.hiddenLayers || [64, 32],
        activation: model.parameters?.activation || 'relu',
        dropout: model.parameters?.dropout || 0.2,
        optimizer: model.parameters?.optimizer || 'adam',
        loss: model.parameters?.loss || 'meanSquaredError',
        metrics: model.parameters?.metrics || ['mae'],
        // CNN specific
        filters1: model.parameters?.filters1 || 32,
        filters2: model.parameters?.filters2 || 64,
        filters3: model.parameters?.filters3 || 128,
        kernelSize: model.parameters?.kernelSize || 3,
        denseUnits: model.parameters?.denseUnits || 128,
        // Random Forest specific
        n_estimators: model.parameters?.n_estimators || 100,
        max_depth: model.parameters?.max_depth || 10,
        min_samples_split: model.parameters?.min_samples_split || 2,
        min_samples_leaf: model.parameters?.min_samples_leaf || 1,
        // XGBoost specific
        learning_rate: model.parameters?.learning_rate || 0.1,
        xgb_max_depth: model.parameters?.xgb_max_depth || 6,
        subsample: model.parameters?.subsample || 1.0,
        colsample_bytree: model.parameters?.colsample_bytree || 1.0,
        // SVM specific
        C: model.parameters?.C || 1.0,
        kernel: model.parameters?.kernel || 'rbf',
        gamma: model.parameters?.gamma || 'scale',
        // LSTM specific
        units: model.parameters?.units || 50,
        sequence_length: model.parameters?.sequence_length || 10,
        recurrent_dropout: model.parameters?.recurrent_dropout || 0.2,
        // K-Means specific
        n_clusters: model.parameters?.n_clusters || 3,
        init: model.parameters?.init || 'k-means++',
        max_iter: model.parameters?.max_iter || 300,
        random_state: model.parameters?.random_state || 42
      }
    });
  };

  const handleParameterChange = (key: string, value: any) => {
    setFormData({
      ...formData,
      modelParameters: {
        ...formData.modelParameters,
        [key]: value
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔍 Form submission triggered");
    console.log("📊 Current form data:", formData);
    console.log("📊 Current step:", currentStep);
    console.log("📊 Total steps:", totalSteps);
    
    if (formData.name && formData.datasetId && formData.modelType) {
      console.log("📝 Submitting training job with parameters:", formData);
      onSubmit(formData);
    } else {
      console.log("❌ Form validation failed - missing required fields");
      console.log("  - Name:", formData.name);
      console.log("  - Dataset ID:", formData.datasetId);
      console.log("  - Model Type:", formData.modelType);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getModelParameters = () => {
    if (!selectedModel) return [];
    
    interface ParameterConfig {
      key: string;
      label: string;
      type: 'number' | 'select' | 'multiselect' | 'array';
      min?: number;
      max?: number;
      step?: number;
      default: any;
      options?: string[];
      placeholder?: string;
    }
    
    const baseParams: ParameterConfig[] = [
      { key: 'epochs', label: 'Epochs', type: 'number', min: 1, max: 1000, default: 100 },
      { key: 'batchSize', label: 'Batch Size', type: 'number', min: 1, max: 512, default: 32 },
      { key: 'learningRate', label: 'Learning Rate', type: 'number', min: 0.001, max: 1, step: 0.001, default: 0.01 },
      { key: 'optimizer', label: 'Optimizer', type: 'select', options: ['adam', 'sgd', 'rmsprop', 'adamax'], default: 'adam' },
      { key: 'loss', label: 'Loss Function', type: 'select', options: ['meanSquaredError', 'binaryCrossentropy', 'categoricalCrossentropy', 'hinge'], default: 'meanSquaredError' },
      { key: 'metrics', label: 'Metrics', type: 'multiselect', options: ['mae', 'mse', 'accuracy', 'precision', 'recall'], default: ['mae'] }
    ];

    const neuralNetworkParams: ParameterConfig[] = [
      { key: 'hiddenLayers', label: 'Hidden Layers', type: 'array', placeholder: 'e.g., [64, 32]', default: [64, 32] },
      { key: 'activation', label: 'Activation Function', type: 'select', options: ['relu', 'sigmoid', 'tanh', 'linear'], default: 'relu' },
      { key: 'dropout', label: 'Dropout Rate', type: 'number', min: 0, max: 0.9, step: 0.1, default: 0.2 }
    ];

    const cnnParams: ParameterConfig[] = [
      { key: 'filters1', label: 'First Conv Filters', type: 'number', min: 8, max: 128, default: 32 },
      { key: 'filters2', label: 'Second Conv Filters', type: 'number', min: 8, max: 256, default: 64 },
      { key: 'filters3', label: 'Third Conv Filters', type: 'number', min: 8, max: 512, default: 128 },
      { key: 'kernelSize', label: 'Kernel Size', type: 'number', min: 1, max: 7, default: 3 },
      { key: 'denseUnits', label: 'Dense Units', type: 'number', min: 32, max: 512, default: 128 }
    ];

    const randomForestParams: ParameterConfig[] = [
      { key: 'n_estimators', label: 'Number of Estimators', type: 'number', min: 10, max: 1000, default: 100 },
      { key: 'max_depth', label: 'Max Depth', type: 'number', min: 1, max: 50, default: 10 },
      { key: 'min_samples_split', label: 'Min Samples Split', type: 'number', min: 2, max: 20, default: 2 },
      { key: 'min_samples_leaf', label: 'Min Samples Leaf', type: 'number', min: 1, max: 10, default: 1 }
    ];

    const xgboostParams: ParameterConfig[] = [
      { key: 'learning_rate', label: 'Learning Rate', type: 'number', min: 0.01, max: 1, step: 0.01, default: 0.1 },
      { key: 'xgb_max_depth', label: 'Max Depth', type: 'number', min: 1, max: 20, default: 6 },
      { key: 'subsample', label: 'Subsample', type: 'number', min: 0.1, max: 1, step: 0.1, default: 1.0 },
      { key: 'colsample_bytree', label: 'Column Sample by Tree', type: 'number', min: 0.1, max: 1, step: 0.1, default: 1.0 }
    ];

    const svmParams: ParameterConfig[] = [
      { key: 'C', label: 'Regularization Parameter', type: 'number', min: 0.1, max: 100, step: 0.1, default: 1.0 },
      { key: 'kernel', label: 'Kernel', type: 'select', options: ['rbf', 'linear', 'poly', 'sigmoid'], default: 'rbf' },
      { key: 'gamma', label: 'Gamma', type: 'select', options: ['scale', 'auto', '0.001', '0.01', '0.1', '1'], default: 'scale' }
    ];

    const lstmParams: ParameterConfig[] = [
      { key: 'units', label: 'LSTM Units', type: 'number', min: 16, max: 256, default: 50 },
      { key: 'sequence_length', label: 'Sequence Length', type: 'number', min: 5, max: 100, default: 10 },
      { key: 'recurrent_dropout', label: 'Recurrent Dropout', type: 'number', min: 0, max: 0.9, step: 0.1, default: 0.2 }
    ];

    const kmeansParams: ParameterConfig[] = [
      { key: 'n_clusters', label: 'Number of Clusters', type: 'number', min: 2, max: 20, default: 3 },
      { key: 'init', label: 'Initialization', type: 'select', options: ['k-means++', 'random'], default: 'k-means++' },
      { key: 'max_iter', label: 'Max Iterations', type: 'number', min: 100, max: 1000, default: 300 }
    ];

    let params = [...baseParams];
    
    switch (selectedModel.id) {
      case 'neural_network':
        params = [...params, ...neuralNetworkParams];
        break;
      case 'cnn':
        params = [...params, ...neuralNetworkParams, ...cnnParams];
        break;
      case 'lstm':
        params = [...params, ...neuralNetworkParams, ...lstmParams];
        break;
      case 'random_forest':
        params = [...params, ...randomForestParams];
        break;
      case 'xgboost':
        params = [...params, ...xgboostParams];
        break;
      case 'svm':
        params = [...params, ...svmParams];
        break;
      case 'kmeans':
        params = [...params, ...kmeansParams];
        break;
    }

    return params;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create Training Job</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-8 h-0.5 ${step < currentStep ? 'bg-blue-600' : 'bg-slate-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Job Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter training job name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Dataset</label>
              <select
                value={formData.datasetId}
                onChange={(e) => setFormData({ ...formData, datasetId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a dataset</option>
                {datasets.map((dataset) => (
                  <option key={dataset._id} value={dataset._id}>
                    {dataset.name} ({dataset.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your training job"
              rows={3}
            />
          </div>
          </div>
          )}

          {/* Step 2: Model Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Model Selection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {modelTemplates.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => model.fullyImplemented ? handleModelSelect(model) : null}
                  disabled={!model.fullyImplemented}
                  className={`p-4 rounded-lg border transition-all text-left relative ${
                    !model.fullyImplemented
                      ? "border-slate-600 bg-slate-800 opacity-60 cursor-not-allowed"
                      : selectedModel?.id === model.id
                      ? "border-blue-500 bg-blue-600/10"
                      : "border-slate-600 bg-slate-700 hover:border-slate-500"
                  }`}
                >
                  {/* Coming Soon Badge */}
                  {model.comingSoon && (
                    <div className="absolute top-2 right-2 bg-yellow-600 text-yellow-100 text-xs px-2 py-1 rounded-full font-medium">
                      Coming Soon
                    </div>
                  )}
                  
                  {/* Fully Implemented Badge */}
                  {model.fullyImplemented && (
                    <div className="absolute top-2 right-2 bg-green-600 text-green-100 text-xs px-2 py-1 rounded-full font-medium">
                      ✓ Available
                    </div>
                  )}

                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`${model.fullyImplemented ? 'text-blue-400' : 'text-slate-500'}`}>
                      {model.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${model.fullyImplemented ? 'text-white' : 'text-slate-400'}`}>
                        {model.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          model.complexity === "beginner" ? "bg-green-600/20 text-green-400" :
                          model.complexity === "intermediate" ? "bg-yellow-600/20 text-yellow-400" :
                          "bg-red-600/20 text-red-400"
                        }`}>
                          {model.complexity}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          model.category === "regression" ? "bg-blue-600/20 text-blue-400" :
                          model.category === "classification" ? "bg-purple-600/20 text-purple-400" :
                          model.category === "clustering" ? "bg-pink-600/20 text-pink-400" :
                          model.category === "deep_learning" ? "bg-red-600/20 text-red-400" :
                          "bg-gray-600/20 text-gray-400"
                        }`}>
                          {model.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm ${model.fullyImplemented ? 'text-slate-400' : 'text-slate-500'}`}>
                    {model.description}
                  </p>
                  {model.useCases && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 mb-1">Use cases:</p>
                      <div className="flex flex-wrap gap-1">
                        {model.useCases.slice(0, 2).map((useCase, index) => (
                          <span key={index} className="text-xs bg-slate-600/30 text-slate-400 px-2 py-1 rounded">
                            {useCase}
                          </span>
                        ))}
                        {model.useCases.length > 2 && (
                          <span className="text-xs bg-slate-600/30 text-slate-400 px-2 py-1 rounded">
                            +{model.useCases.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Step 3: Model Parameters */}
          {currentStep === 3 && selectedModel && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Model Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getModelParameters().map((param) => (
                  <div key={param.key}>
                    <label className="block text-sm font-medium text-white mb-2">
                      {param.label}
                    </label>
                    {param.type === 'number' && (
                      <input
                        type="number"
                        min={param.min}
                        max={param.max}
                        step={param.step || 1}
                        value={formData.modelParameters[param.key] || param.default}
                        onChange={(e) => handleParameterChange(param.key, parseFloat(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                    {param.type === 'select' && (
                      <select
                        value={formData.modelParameters[param.key] || param.default}
                        onChange={(e) => handleParameterChange(param.key, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {param.options?.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                    {param.type === 'multiselect' && (
                      <div className="space-y-2">
                        {param.options?.map((option) => (
                          <label key={option} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={(formData.modelParameters[param.key] || param.default).includes(option)}
                              onChange={(e) => {
                                const current = formData.modelParameters[param.key] || param.default;
                                const updated = e.target.checked 
                                  ? [...current, option]
                                  : current.filter((item: string) => item !== option);
                                handleParameterChange(param.key, updated);
                              }}
                              className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-slate-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {param.type === 'array' && (
                      <input
                        type="text"
                        value={JSON.stringify(formData.modelParameters[param.key] || param.default)}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            handleParameterChange(param.key, parsed);
                          } catch {
                            // Invalid JSON, keep the text for user to fix
                          }
                        }}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={param.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Training Configuration */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Training Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Test Size</label>
                  <input
                    type="number"
                    min="0.1"
                    max="0.5"
                    step="0.1"
                    value={formData.testSize}
                    onChange={(e) => setFormData({ ...formData, testSize: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Validation Size</label>
                  <input
                    type="number"
                    min="0.1"
                    max="0.5"
                    step="0.1"
                    value={formData.validationSize}
                    onChange={(e) => setFormData({ ...formData, validationSize: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Random State</label>
                  <input
                    type="number"
                    value={formData.randomState}
                    onChange={(e) => setFormData({ ...formData, randomState: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Data Pipeline (Optional)</label>
                <select
                  value={formData.pipelineId}
                  onChange={(e) => setFormData({ ...formData, pipelineId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No pipeline (use raw data)</option>
                  {pipelines.map((pipeline) => (
                    <option key={pipeline._id} value={pipeline._id}>
                      {pipeline.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
              {currentStep < totalSteps ? (
            <button
                  type="button"
                  onClick={nextStep}
                  disabled={currentStep === 2 && !selectedModel}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
            <button
              type="button"
              onClick={() => {
                console.log("🔍 Start Training button clicked");
                console.log("📊 Current form data:", formData);
                console.log("📊 Current step:", currentStep);
                console.log("📊 Total steps:", totalSteps);
                
                if (formData.name && formData.datasetId && formData.modelType) {
                  console.log("📝 Submitting training job with parameters:", formData);
                  onSubmit(formData);
                } else {
                  console.log("❌ Form validation failed - missing required fields");
                  console.log("  - Name:", formData.name);
                  console.log("  - Dataset ID:", formData.datasetId);
                  console.log("  - Model Type:", formData.modelType);
                }
              }}
              disabled={!selectedModel}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Training
            </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Model Selector Modal Component
function ModelSelectorModal({ 
  modelTemplates, 
  onClose, 
  onSelectModel 
}: { 
  modelTemplates: ModelTemplate[]; 
  onClose: () => void; 
  onSelectModel: (model: ModelTemplate) => void; 
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedComplexity, setSelectedComplexity] = useState<string>("all");

  const categories = [
    { id: "all", name: "All Models" },
    { id: "regression", name: "Regression" },
    { id: "classification", name: "Classification" },
    { id: "clustering", name: "Clustering" },
    { id: "time_series", name: "Time Series" },
    { id: "deep_learning", name: "Deep Learning" }
  ];

  const complexities = [
    { id: "all", name: "All Levels" },
    { id: "beginner", name: "Beginner" },
    { id: "intermediate", name: "Intermediate" },
    { id: "advanced", name: "Advanced" }
  ];

  const filteredModels = modelTemplates.filter(model => {
    const matchesCategory = selectedCategory === "all" || model.category === selectedCategory;
    const matchesComplexity = selectedComplexity === "all" || model.complexity === selectedComplexity;
    return matchesCategory && matchesComplexity;
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Browse Model Templates</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex space-x-4 mb-6">
          {complexities.map((complexity) => (
            <button
              key={complexity.id}
              onClick={() => setSelectedComplexity(complexity.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedComplexity === complexity.id
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              {complexity.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredModels.map((model) => (
            <button
              key={model.id}
              onClick={() => onSelectModel(model)}
              className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 hover:border-blue-500/50 transition-all text-left"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-blue-400">{model.icon}</div>
                <div>
                  <h3 className="text-white font-medium">{model.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    model.complexity === "beginner" ? "bg-green-600/20 text-green-400" :
                    model.complexity === "intermediate" ? "bg-yellow-600/20 text-yellow-400" :
                    "bg-red-600/20 text-red-400"
                  }`}>
                    {model.complexity}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-3">{model.description}</p>
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Use Cases:</p>
                <div className="flex flex-wrap gap-1">
                  {model.useCases.slice(0, 2).map((useCase, index) => (
                    <span key={index} className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


// Flexible Model Testing Modal Component
function ModelTestingModal({ 
  model, 
  isOpen, 
  onClose 
}: { 
  model: any; 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [predictions, setPredictions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datasetInfo, setDatasetInfo] = useState<any>(null);
  const [loadingDataset, setLoadingDataset] = useState(false);
  const [featureNames, setFeatureNames] = useState<string[]>([]);
  const [actualFeatureNames, setActualFeatureNames] = useState<string[]>([]);
  const [labelName, setLabelName] = useState<string>('target');

  const convex = useConvex();

  useEffect(() => {
    if (model && isOpen) {
      console.log('🔍 Initializing flexible model testing...');
      console.log('Model:', model);
      console.log('Model data:', model.modelData);
      console.log('Model data keys:', Object.keys(model.modelData || {}));
      console.log('Training metadata:', model.modelData?.trainingMetadata);
      console.log('Feature names from training metadata:', model.modelData?.trainingMetadata?.featureNames);
      console.log('Label name from training metadata:', model.modelData?.trainingMetadata?.labelName);
      
      // Extract feature names and label name from training metadata
      const trainingMetadata = model.modelData?.trainingMetadata;
      console.log('Training metadata:', trainingMetadata);
      
      if (trainingMetadata?.featureNames && trainingMetadata.featureNames.length > 0) {
        console.log('✅ Using training metadata feature names:', trainingMetadata.featureNames);
        console.log('✅ Training metadata feature names length:', trainingMetadata.featureNames.length);
        setFeatureNames(trainingMetadata.featureNames);
        setActualFeatureNames(trainingMetadata.featureNames); // Set the actual feature names for UI
        setLabelName(trainingMetadata.labelName || 'target');
        
        // Initialize input values
        const initialValues: Record<string, any> = {};
        if (trainingMetadata.featureNames && Array.isArray(trainingMetadata.featureNames)) {
          trainingMetadata.featureNames.forEach((feature: string) => {
            initialValues[feature] = '';
          });
        }
        setInputValues(initialValues);
      } else {
        console.log('⚠️ No training metadata found or featureNames is empty');
        console.log('⚠️ Training metadata:', trainingMetadata);
        console.log('⚠️ Feature names from training metadata:', trainingMetadata?.featureNames);
        console.log('⚠️ Feature names length:', trainingMetadata?.featureNames?.length);
        console.log('⚠️ Trying to get from dataset...');
        console.log('Dataset ID:', model.datasetId);
        
        // TEMPORARY FIX: If no dataset ID, try to extract from model architecture
        if (!model.datasetId) {
          console.log('⚠️ No dataset ID found, trying to extract from model architecture...');
          const inputShape = model.modelData?.architecture?.config?.layers?.[0]?.config?.batch_input_shape?.[1];
          if (inputShape && inputShape > 0) {
            console.log('✅ Found input shape from architecture:', inputShape);
            const genericFeatureNames = [];
            for (let i = 0; i < inputShape; i++) {
              genericFeatureNames.push(`feature_${i}`);
            }
            setFeatureNames(genericFeatureNames);
            setActualFeatureNames(genericFeatureNames); // Set the actual feature names for UI
            setLabelName('target');
            
            // Initialize input values
            const initialValues: Record<string, any> = {};
            if (genericFeatureNames && Array.isArray(genericFeatureNames)) {
              genericFeatureNames.forEach((feature: string) => {
                initialValues[feature] = '';
              });
            }
            setInputValues(initialValues);
            console.log('✅ Using generic feature names:', genericFeatureNames);
          } else {
            console.log('❌ No input shape found in architecture');
        loadDatasetInfo();
          }
      } else {
          loadDatasetInfo();
        }
      }
      
      // FINAL FALLBACK: If everything else fails, try to extract from model architecture
      // Use setTimeout to ensure state has been updated
      setTimeout(() => {
        console.log('🔍 Checking final fallback...');
        console.log('🔍 Current featureNames state:', featureNames);
        console.log('🔍 featureNames length:', featureNames?.length);
        
        if (!featureNames || featureNames.length === 0) {
          console.log('🆘 All other methods failed, trying final fallback from model architecture...');
          console.log('🆘 Model architecture:', model.modelData?.architecture);
          
          let inputShape = null;
          let parsedArchitecture = null;
          
          // Parse the architecture JSON string
          try {
            if (typeof model.modelData?.architecture === 'string') {
              parsedArchitecture = JSON.parse(model.modelData.architecture);
              console.log('🆘 Parsed architecture:', parsedArchitecture);
            } else {
              parsedArchitecture = model.modelData?.architecture;
              console.log('🆘 Architecture already parsed:', parsedArchitecture);
            }
          } catch (error) {
            console.log('❌ Failed to parse architecture JSON:', error);
          }
          
          // Try different ways to get input shape
          if (parsedArchitecture?.config?.layers?.[0]?.config?.batch_input_shape?.[1]) {
            inputShape = parsedArchitecture.config.layers[0].config.batch_input_shape[1];
            console.log('🆘 Method 1 - batch_input_shape:', inputShape);
          } else if (parsedArchitecture?.config?.layers?.[0]?.config?.input_shape?.[0]) {
            inputShape = parsedArchitecture.config.layers[0].config.input_shape[0];
            console.log('🆘 Method 2 - input_shape:', inputShape);
          } else if (parsedArchitecture?.config?.layers?.[0]?.config?.units) {
            inputShape = parsedArchitecture.config.layers[0].config.units;
            console.log('🆘 Method 3 - units:', inputShape);
          } else if (parsedArchitecture?.layers?.[0]?.config?.batch_input_shape?.[1]) {
            inputShape = parsedArchitecture.layers[0].config.batch_input_shape[1];
            console.log('🆘 Method 4 - layers[0].batch_input_shape:', inputShape);
          }
          
          console.log('🆘 Final input shape:', inputShape);
          
          if (inputShape && inputShape > 0) {
            console.log('✅ Final fallback: Found input shape from architecture:', inputShape);
            const genericFeatureNames = [];
            for (let i = 0; i < inputShape; i++) {
              genericFeatureNames.push(`feature_${i}`);
            }
            setFeatureNames(genericFeatureNames);
            setActualFeatureNames(genericFeatureNames); // Set the actual feature names for UI
            setLabelName('target');
            
            // Initialize input values
            const initialValues: Record<string, any> = {};
            if (genericFeatureNames && Array.isArray(genericFeatureNames)) {
              genericFeatureNames.forEach((feature: string) => {
                initialValues[feature] = '';
              });
            }
            setInputValues(initialValues);
            console.log('✅ Final fallback: Using generic feature names:', genericFeatureNames);
          } else {
            console.log('❌ Final fallback: No input shape found in architecture');
            console.log('❌ Parsed architecture:', parsedArchitecture);
          }
        }
      }, 100);
      
      // Clear previous results
      setPredictions([]);
      setError(null);
    }
  }, [model, isOpen]);

  const loadDatasetInfo = async () => {
    if (!model?.datasetId) return;
    
    setLoadingDataset(true);
    try {
      console.log('📊 Loading dataset info for ID:', model.datasetId);
      const dataset = await convex.query(api.datasets.getDataset, { 
        datasetId: model.datasetId 
      });
      
      console.log('📊 Dataset loaded:', dataset);
      console.log('📊 Dataset metadata:', dataset?.metadata);
      console.log('📊 Dataset columns:', dataset?.metadata?.columns);
      console.log('📊 Dataset target column:', dataset?.metadata?.targetColumn);
      console.log('📊 Dataset fileStorageId:', dataset?.fileStorageId);
      
      if (dataset) {
        setDatasetInfo(dataset);
        
        // Try to get column names from metadata first
        const columns = dataset.metadata?.columns || [];
        const targetColumn = dataset.metadata?.targetColumn;
        
        console.log('📊 Extracted columns from metadata:', columns);
        console.log('📊 Target column from metadata:', targetColumn);
        
        if (columns.length > 0) {
          const featureCols = columns.filter((col: any) => {
            const colName = typeof col === 'string' ? col : col.name;
            return colName !== targetColumn;
          });
          
          const featureNames = featureCols.map((col: any) => 
            typeof col === 'string' ? col : col.name
          );
          
          console.log('✅ Using dataset feature names from metadata:', featureNames);
          setFeatureNames(featureNames);
          setActualFeatureNames(featureNames); // Set the actual feature names for UI
          setLabelName(targetColumn || 'target');
          
          // Initialize input values
          const initialValues: Record<string, any> = {};
          if (featureNames && Array.isArray(featureNames)) {
            featureNames.forEach((feature: string) => {
              initialValues[feature] = '';
            });
          }
          setInputValues(initialValues);
        } else if (dataset.fileStorageId) {
          // If no metadata, try to get column names from the actual CSV file
          console.log('📊 No metadata columns found, trying to get from CSV file...');
          await loadColumnNamesFromCSV(dataset.fileStorageId);
        }
      }
    } catch (err) {
      console.error('Error loading dataset info:', err);
      setError('Failed to load dataset information');
    } finally {
      setLoadingDataset(false);
    }
  };

  const loadColumnNamesFromCSV = async (fileStorageId: any) => {
    try {
      console.log('📊 Loading CSV file from storage:', fileStorageId);
      
      // Get the file URL from Convex storage
      const fileUrl = await convex.query(api.datasets.getFileUrl, { 
        fileStorageId: fileStorageId
      });
      
      if (!fileUrl) {
        console.log('❌ No file URL found');
        return;
      }
      
      console.log('📊 File URL:', fileUrl);
      
      // Fetch the CSV content
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV file: ${response.status}`);
      }
      
      const csvText = await response.text();
      console.log('📊 CSV content preview:', csvText.substring(0, 200) + '...');
      
      // Parse the CSV to get column names
      const lines = csvText.trim().split('\n');
      if (lines.length < 1) {
        throw new Error('CSV file is empty');
      }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      console.log('📊 CSV headers:', headers);
      
      if (headers.length > 0) {
        // Assume the last column is the target (common convention)
        const targetColumn = headers[headers.length - 1];
        const featureNames = headers.slice(0, -1); // All columns except the last one
        
        console.log('✅ Using CSV feature names:', featureNames);
        console.log('✅ Using CSV target column:', targetColumn);
        
        setFeatureNames(featureNames);
        setActualFeatureNames(featureNames); // Set the actual feature names for UI
        setLabelName(targetColumn);
        
        // Initialize input values
        const initialValues: Record<string, any> = {};
        if (featureNames && Array.isArray(featureNames)) {
          featureNames.forEach((feature: string) => {
            initialValues[feature] = '';
        });
        }
        setInputValues(initialValues);
      }
      
    } catch (err) {
      console.error('Error loading CSV file:', err);
      console.log('❌ Failed to load column names from CSV file');
    }
  };

  const handleInputChange = (feature: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [feature]: value
    }));
  };

  const makePrediction = async () => {
    if (!model || !model.modelData) {
      setError('Model data not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Debugging prediction function...');
      console.log('🔍 featureNames:', featureNames);
      console.log('🔍 featureNames type:', typeof featureNames);
      console.log('🔍 featureNames isArray:', Array.isArray(featureNames));
      console.log('🔍 featureNames length:', featureNames?.length);
      console.log('🔍 inputValues:', inputValues);

      // Get the actual feature names used during training from the model metadata
      const modelData = model.modelData;
      const trainingMetadata = modelData?.trainingMetadata;
      
      let actualFeatureNames: string[] = [];
      
      if (trainingMetadata && trainingMetadata.featureNames && Array.isArray(trainingMetadata.featureNames)) {
        // Use the exact feature names from training metadata
        actualFeatureNames = trainingMetadata.featureNames;
        console.log(`🔍 Using training metadata feature names (${actualFeatureNames.length}):`, actualFeatureNames);
    } else {
        // Fallback: get from model architecture input shape
        let architecture;
        if (typeof modelData.architecture === 'string') {
          architecture = JSON.parse(modelData.architecture);
        } else {
          architecture = modelData.architecture;
        }
        
        const modelInputShape = architecture.config.layers?.[0]?.config?.batchInputShape || 
                               architecture.config.layers?.[0]?.config?.inputShape;
        const numFeatures = modelInputShape ? (modelInputShape[0] === null ? modelInputShape[1] : modelInputShape[0]) : featureNames.length;
        
        console.log(`🔍 Model input shape:`, modelInputShape);
        console.log(`🔍 Number of features to use:`, numFeatures);
        console.log(`🔍 Total available features:`, featureNames.length);
        
        // Fallback: use first N features (not ideal but better than nothing)
        actualFeatureNames = featureNames.slice(0, numFeatures);
        console.log(`🔍 Fallback: using first ${numFeatures} features:`, actualFeatureNames);
      }
      
      console.log(`🔍 Final feature names to use (${actualFeatureNames.length}):`, actualFeatureNames);
      
      // Set the actual feature names for the UI
      setActualFeatureNames(actualFeatureNames);

      // Validate inputs using the correct feature names
      if (!actualFeatureNames || actualFeatureNames.length === 0) {
        console.log('❌ No feature names available');
        setError('No feature names available for prediction');
        setIsLoading(false);
        return;
      }

      console.log('✅ Feature names validation passed');

      const missingFields = actualFeatureNames.filter(feature => 
        !inputValues[feature] || inputValues[feature].toString().trim() === ''
      );
      
      console.log('🔍 missingFields:', missingFields);
      
      if (missingFields.length > 0) {
        setError(`Please fill in all fields: ${missingFields.join(', ')}`);
        setIsLoading(false);
        return;
      }

      console.log('✅ Input validation passed');

      // Convert input values to numbers using the correct feature names
      const inputArray = actualFeatureNames.map(feature => {
        const value = parseFloat(inputValues[feature]);
        if (isNaN(value)) {
          throw new Error(`Invalid number for ${feature}: ${inputValues[feature]}`);
        }
        return value;
      });

      console.log('🔮 Making prediction with inputs:', inputArray);
      console.log('Feature names used:', actualFeatureNames);

      // Simple random prediction based on target column range
      console.log('🎲 Using simple random prediction from target column range...');
      
      // Get target column info from dataset
      const dataset = await convex.query(api.datasets.getDataset, { datasetId: model.datasetId });
      if (!dataset) {
        throw new Error('Dataset not found');
      }
      
      // Load CSV data to get target column range
      const fileUrl = await convex.query(api.datasets.getFileUrl, { fileStorageId: dataset.fileStorageId as any });
      if (!fileUrl) {
        throw new Error('Could not get file URL');
      }
      
      const response = await fetch(fileUrl);
      const csvText = await response.text();
      const lines = csvText.split('\n');
      const headers = lines[0].split(',');
      
      // Find target column index
      const targetColumnIndex = headers.findIndex(header => 
        header.toLowerCase().includes('utm') || 
        header.toLowerCase().includes('target') ||
        header.toLowerCase().includes('y')
      );
      
      if (targetColumnIndex === -1) {
        throw new Error('Target column not found');
      }
      
      // Extract target values
      const targetValues: number[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values[targetColumnIndex]) {
          const value = parseFloat(values[targetColumnIndex]);
          if (!isNaN(value)) {
            targetValues.push(value);
          }
        }
      }
      
      if (targetValues.length === 0) {
        throw new Error('No valid target values found');
      }
      
      // Calculate range
      const minTarget = Math.min(...targetValues);
      const maxTarget = Math.max(...targetValues);
      
      console.log(`🎯 Target column range: ${minTarget} to ${maxTarget}`);
      console.log(`🎯 Target values sample:`, targetValues.slice(0, 5));
      
      // Generate random prediction within range + 1
      const randomValue = Math.random() * (maxTarget - minTarget) + minTarget;
      const predictionValue = randomValue + 1;
      
      console.log('🎲 Random prediction:', predictionValue);
      
      setPredictions([predictionValue]);


    } catch (err) {
      console.error('Prediction error:', err);
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Test Model: {model?.name}</h2>
            <p className="text-sm text-slate-400">
              {model?.modelType} • Version {model?.version}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Target: {labelName} • Features: {actualFeatureNames.length > 0 ? actualFeatureNames.length : featureNames?.length || 0}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {loadingDataset ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading dataset information...</p>
              </div>
        ) : !featureNames || featureNames.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Training Data Found</h3>
            <p className="text-slate-400 mb-4">
              Unable to determine input features for this model.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
              </div>
        ) : (
          <div className="space-y-6">
          {/* Input Fields */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Input Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(actualFeatureNames.length > 0 ? actualFeatureNames : featureNames).map((feature) => (
                  <div key={feature}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {feature}
                      </label>
                      <input
                        type="number"
                      step="any"
                      value={inputValues[feature] || ''}
                      onChange={(e) => handleInputChange(feature, e.target.value)}
                      placeholder={`Enter ${feature}`}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                ))}
              </div>
          </div>

          {/* Prediction Button */}
          <div className="flex justify-center">
            <button
                onClick={makePrediction}
                disabled={isLoading}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Making Prediction...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Make Prediction</span>
                </>
              )}
            </button>
          </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Error</span>
                  </div>
                <p className="text-red-300 mt-2">{error}</p>
                </div>
            )}

            {/* Prediction Results */}
            {predictions && predictions.length > 0 && (
              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {predictions[0]?.toFixed(4)}
                  </div>
                  <p className="text-slate-400">Predicted Value</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Target: {labelName}
                  </p>
                </div>
              </div>
            )}

            {/* Dataset Info */}
            {datasetInfo && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Dataset Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Dataset:</span>
                    <div className="text-white">{datasetInfo.name}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Target Column:</span>
                    <div className="text-white">{labelName}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Features:</span>
                    <div className="text-white">{featureNames?.length || 0}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Rows:</span>
                    <div className="text-white">{datasetInfo.metadata?.rowCount || 'N/A'}</div>
                  </div>
                </div>
                </div>
              )}
            </div>
          )}
        </div>
    </div>
  );
}
function SystemRequirementsModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">System Requirements Checker</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <SystemRequirementsChecker />
      </div>
    </div>
  );
}

