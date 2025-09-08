"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import TrainingChart from "./TrainingChart";
import {
  X,
  Play,
  Edit3,
  Copy,
  Download,
  BarChart3,
  Settings,
  Database,
  Network,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  Save,
  Eye,
  Code,
  Activity,
  Layers,
  Target,
  Zap,
  Info,
  History,
  ArrowRight,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface ModelViewerProps {
  modelId: Id<"models">;
  onClose: () => void;
  onRetrain?: (modelId: Id<"models">, config: any) => void;
  onClone?: (modelId: Id<"models">, config: any) => void;
}

type ActiveTab = 'overview' | 'parameters' | 'pipeline' | 'training' | 'retrain';

export default function ModelViewer({ modelId, onClose, onRetrain, onClone }: ModelViewerProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [showRetrainConfig, setShowRetrainConfig] = useState(false);
  const [retrainConfig, setRetrainConfig] = useState<any>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  // Queries
  const model = useQuery(api.models.getModel, { modelId });
  const dataset = useQuery(api.datasets.getDataset, 
    model ? { datasetId: model.datasetId } : "skip"
  );
  const pipeline = useQuery(api.transformationPipelines.getPipeline,
    model?.pipelineId ? { pipelineId: model.pipelineId } : "skip"
  );

  // Additional queries
  const modelVersions = useQuery(api.models.getModelVersions, { parentModelId: modelId });

  // Mutations
  const updateModel = useMutation(api.models.updateModel);
  const deleteModel = useMutation(api.models.deleteModel);
  const createTrainingJob = useMutation(api.training.createTrainingJob);
  const updateModelMetadata = useMutation(api.models.updateModelMetadata);
  const cloneModel = useMutation(api.models.cloneModel);

  // Retrain handler
  const handleRetrain = useCallback(async () => {
    if (!model) return;
    
    try {
      console.log('🚀 Starting model retraining with config:', retrainConfig);
      
      // Create a new training job for retraining
      const retrainingJob = await createTrainingJob({
        name: `Retrain ${model.name}`,
        description: `Retraining of ${model.name} with updated parameters`,
        datasetId: model.datasetId,
        pipelineId: model.pipelineId,
        modelType: model.modelType,
        modelParameters: {
          ...model.modelParameters,
          epochs: retrainConfig.epochs || 100,
          batchSize: retrainConfig.batchSize || 32,
          learningRate: retrainConfig.learningRate || 0.001,
          optimizer: retrainConfig.optimizer || 'adam',
          hiddenLayers: retrainConfig.hiddenLayers || [128, 64, 32],
          activation: retrainConfig.activation || 'relu',
          dropout: retrainConfig.dropout || 0.2
        },
        trainingConfig: {
          ...model.trainingConfig,
          parentModelId: model._id // Link to the original model
        }
      });
      
      // Update original model status to indicate retraining is in progress
      await updateModel({
        modelId: model._id,
        status: 'training'
      });
      
      console.log('✅ Retraining job created:', retrainingJob);
      alert(`Retraining started! Job ID: ${retrainingJob}`);
      
      // Call the onRetrain callback if provided
      onRetrain?.(model._id, retrainConfig);
      
      // Close the modal
      onClose();
      
    } catch (error) {
      console.error('❌ Failed to start retraining:', error);
      alert('Failed to start retraining. Please try again.');
    }
  }, [model, retrainConfig, createTrainingJob, updateModel, onRetrain, onClose]);

  // Initialize edit form
  useEffect(() => {
    if (model && !isEditing) {
      setEditedName(model.name);
      setEditedDescription(model.description || '');
    }
  }, [model, isEditing]);

  // Initialize retrain config with current model parameters
  useEffect(() => {
    if (model && !showRetrainConfig) {
      setRetrainConfig({
        ...model.modelParameters,
        ...model.trainingConfig,
        epochs: model.trainingConfig?.epochs || 100,
        batchSize: model.trainingConfig?.batchSize || 32,
        learningRate: model.modelParameters?.learningRate || 0.001,
      });
    }
  }, [model, showRetrainConfig]);

  const handleSaveMetadata = useCallback(async () => {
    if (!model) return;
    
    try {
      await updateModelMetadata({
        modelId,
        name: editedName,
        description: editedDescription,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update model metadata:', error);
      alert('Failed to update model metadata');
    }
  }, [modelId, editedName, editedDescription, updateModelMetadata]);

  const handleCloneModel = useCallback(async () => {
    if (!model) return;
    
    try {
      const clonedModelId = await cloneModel({
        modelId,
        name: `${model.name} (Copy)`,
        description: `Clone of ${model.name}`,
        modelParameters: retrainConfig,
        trainingConfig: retrainConfig,
      });
      
      if (onClone) {
        onClone(clonedModelId, retrainConfig);
      }
      
      alert('Model cloned successfully!');
    } catch (error) {
      console.error('Failed to clone model:', error);
      alert('Failed to clone model');
    }
  }, [model, modelId, retrainConfig, cloneModel, onClone]);


  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'training':
        return <Activity size={20} className="text-blue-400 animate-pulse" />;
      case 'failed':
        return <XCircle size={20} className="text-red-400" />;
      case 'cancelled':
        return <AlertCircle size={20} className="text-yellow-400" />;
      default:
        return <Clock size={20} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'training':
        return 'text-blue-400 bg-blue-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      case 'cancelled':
        return 'text-yellow-400 bg-yellow-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatMetric = (value: number | undefined, suffix = '') => {
    if (value === undefined) return 'N/A';
    return `${(value * 100).toFixed(2)}%${suffix}`;
  };

  if (!model) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="bg-ml-dark-100 rounded-lg p-6">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-ml-blue-50 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading model...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-ml-dark-100 rounded-lg w-full max-w-[95vw] h-[95vh] flex flex-col border border-ml-dark-300"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ml-dark-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(model.status)}
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-xl font-semibold text-white bg-ml-dark-200 border border-ml-dark-300 rounded px-2 py-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveMetadata()}
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-white">{model.name}</h2>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-md text-xs font-medium capitalize ${getStatusColor(model.status)}`}>
                    {model.status}
                  </span>
                  <span className="text-ml-dark-400 text-sm">{model.modelType}</span>
                  {model.version && (
                    <span className="text-ml-dark-400 text-sm">v{model.version}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <motion.button
                  onClick={handleSaveMetadata}
                  className="flex items-center gap-2 px-3 py-2 bg-ml-blue-50 text-white rounded-md hover:bg-ml-blue-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save size={16} />
                  Save
                </motion.button>
                <motion.button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-3 py-2 bg-ml-dark-200 text-white rounded-md hover:bg-ml-dark-300 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-ml-dark-200 text-white rounded-md hover:bg-ml-dark-300 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Edit3 size={16} />
                  Edit
                </motion.button>
                
                <motion.button
                  onClick={handleCloneModel}
                  className="flex items-center gap-2 px-3 py-2 bg-ml-dark-200 text-white rounded-md hover:bg-ml-dark-300 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Copy size={16} />
                  Clone
                </motion.button>

                {model.status === 'completed' && (
                  <motion.button
                    onClick={() => setShowRetrainConfig(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-ml-blue-50 text-white rounded-md hover:bg-ml-blue-100 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw size={16} />
                    Retrain
                  </motion.button>
                )}
              </>
            )}

            <motion.button
              onClick={onClose}
              className="p-2 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded-md transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={20} />
            </motion.button>
          </div>
        </div>

        {/* Description */}
        {(model.description || isEditing) && (
          <div className="px-6 py-3 border-b border-ml-dark-300">
            {isEditing ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Add a description..."
                className="w-full bg-ml-dark-200 border border-ml-dark-300 rounded px-3 py-2 text-white placeholder-ml-dark-400 resize-none"
                rows={2}
              />
            ) : (
              <p className="text-ml-dark-400 text-sm">{model.description}</p>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-ml-dark-300">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'parameters', label: 'Parameters', icon: Settings },
            { id: 'pipeline', label: 'Pipeline', icon: Network },
            { id: 'training', label: 'Training', icon: TrendingUp },
            { id: 'retrain', label: 'Retrain', icon: RotateCcw },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-ml-blue-50'
                    : 'text-ml-dark-400 hover:text-white'
                }`}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon size={16} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <OverviewTab 
                key="overview" 
                model={model} 
                dataset={dataset} 
                pipeline={pipeline}
                versions={modelVersions}
              />
            )}
            {activeTab === 'parameters' && (
              <ParametersTab 
                key="parameters" 
                model={model}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
              />
            )}
            {activeTab === 'pipeline' && (
              <PipelineTab 
                key="pipeline" 
                model={model} 
                pipeline={pipeline}
              />
            )}
            {activeTab === 'training' && (
              <TrainingTab 
                key="training" 
                model={model}
              />
            )}
            {activeTab === 'retrain' && (
              <RetrainTab 
                key="retrain" 
                model={model}
                retrainConfig={retrainConfig}
                setRetrainConfig={setRetrainConfig}
                onRetrain={handleRetrain}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Retrain Config Modal */}
        <AnimatePresence>
          {showRetrainConfig && (
            <motion.div
              className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-ml-dark-100 rounded-lg p-6 w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Retrain Model</h3>
                  <button
                    onClick={() => setShowRetrainConfig(false)}
                    className="text-ml-dark-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="text-ml-dark-400 text-sm mb-4">
                  This will create a new version of your model with updated parameters.
                </p>

                <div className="flex gap-3">
                  <motion.button
                    onClick={handleRetrain}
                    className="flex-1 px-4 py-2 bg-ml-blue-50 text-white rounded-md hover:bg-ml-blue-100 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Retraining
                  </motion.button>
                  <motion.button
                    onClick={() => setShowRetrainConfig(false)}
                    className="px-4 py-2 bg-ml-dark-300 text-white rounded-md hover:bg-ml-dark-400 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// Overview Tab Component
function OverviewTab({ model, dataset, pipeline, versions }: {
  model: any;
  dataset: any;
  pipeline: any;
  versions: any[] | undefined;
}) {
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <motion.div
      className="p-6 h-full overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Metrics */}
          {model.metrics && (
            <div className="bg-ml-dark-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-ml-blue-50" />
                Performance Metrics
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {model.metrics.accuracy !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {(model.metrics.accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-ml-dark-400">Accuracy</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {model.metrics.loss?.toFixed(4) || 'N/A'}
                  </div>
                  <div className="text-sm text-ml-dark-400">Loss</div>
                </div>
                {model.metrics.validationAccuracy !== undefined && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {(model.metrics.validationAccuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-ml-dark-400">Val Accuracy</div>
                  </div>
                )}
                {model.metrics.trainingTime && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {formatDuration(model.metrics.trainingTime)}
                    </div>
                    <div className="text-sm text-ml-dark-400">Training Time</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Training Progress */}
          {model.trainingHistory && model.trainingHistory.length > 0 && (
            <div className="bg-ml-dark-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-ml-blue-50" />
                Training Progress
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TrainingChart 
                  trainingHistory={model.trainingHistory}
                  metric="loss"
                  height={250}
                />
                {model.trainingHistory.some(h => h.accuracy !== undefined) && (
                  <TrainingChart 
                    trainingHistory={model.trainingHistory}
                    metric="accuracy"
                    height={250}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Model Info */}
          <div className="bg-ml-dark-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Info size={20} className="text-ml-blue-50" />
              Model Info
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-ml-dark-400">Type</p>
                <p className="text-white font-medium">{model.modelType}</p>
              </div>
              <div>
                <p className="text-sm text-ml-dark-400">Created</p>
                <p className="text-white font-medium">
                  {new Date(model.createdAt).toLocaleDateString()}
                </p>
              </div>
              {model.completedAt && (
                <div>
                  <p className="text-sm text-ml-dark-400">Completed</p>
                  <p className="text-white font-medium">
                    {new Date(model.completedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {model.version && (
                <div>
                  <p className="text-sm text-ml-dark-400">Version</p>
                  <p className="text-white font-medium">v{model.version}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dataset Info */}
          {dataset && (
            <div className="bg-ml-dark-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Database size={20} className="text-ml-blue-50" />
                Dataset
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-ml-dark-400">Name</p>
                  <p className="text-white font-medium">{dataset.name}</p>
                </div>
                <div>
                  <p className="text-sm text-ml-dark-400">Type</p>
                  <p className="text-white font-medium capitalize">{dataset.type}</p>
                </div>
                {dataset.rowCount && (
                  <div>
                    <p className="text-sm text-ml-dark-400">Rows</p>
                    <p className="text-white font-medium">{dataset.rowCount.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pipeline Info */}
          {pipeline && (
            <div className="bg-ml-dark-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Network size={20} className="text-ml-blue-50" />
                Pipeline
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-ml-dark-400">Name</p>
                  <p className="text-white font-medium">{pipeline.name}</p>
                </div>
                <div>
                  <p className="text-sm text-ml-dark-400">Steps</p>
                  <p className="text-white font-medium">{pipeline.steps?.length || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Model Versions */}
          {versions && versions.length > 0 && (
            <div className="bg-ml-dark-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <History size={20} className="text-ml-blue-50" />
                Versions ({versions.length})
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {versions.map((version, index) => (
                  <div key={version._id} className="flex items-center justify-between p-2 bg-ml-dark-300 rounded">
                    <span className="text-white text-sm">v{version.version || index + 1}</span>
                    <span className="text-ml-dark-400 text-xs">
                      {new Date(version.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Parameters Tab Component
function ParametersTab({ model, expandedSections, toggleSection }: {
  model: any;
  expandedSections: Set<string>;
  toggleSection: (section: string) => void;
}) {
  const renderParameterSection = (title: string, icon: any, params: any, sectionKey: string) => {
    const Icon = icon;
    const isExpanded = expandedSections.has(sectionKey);
    
    return (
      <div className="bg-ml-dark-200 rounded-lg p-6 mb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Icon size={20} className="text-ml-blue-50" />
            {title}
          </h3>
          {isExpanded ? (
            <ChevronDown size={20} className="text-ml-dark-400" />
          ) : (
            <ChevronRight size={20} className="text-ml-dark-400" />
          )}
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(params).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-ml-dark-300 rounded">
                    <span className="text-ml-dark-400 text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-white font-medium">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      className="p-6 h-full overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {model.modelParameters && renderParameterSection(
        'Model Architecture',
        Layers,
        model.modelParameters,
        'architecture'
      )}
      
      {model.trainingConfig && renderParameterSection(
        'Training Configuration',
        Settings,
        model.trainingConfig,
        'training'
      )}
      
      {model.metrics && renderParameterSection(
        'Performance Metrics',
        Target,
        model.metrics,
        'metrics'
      )}
    </motion.div>
  );
}

// Pipeline Tab Component  
function PipelineTab({ model, pipeline }: { model: any; pipeline: any }) {
  return (
    <motion.div
      className="p-6 h-full overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {pipeline ? (
        <div className="space-y-6">
          <div className="bg-ml-dark-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Network size={20} className="text-ml-blue-50" />
              Pipeline: {pipeline.name}
            </h3>
            
            {pipeline.description && (
              <p className="text-ml-dark-400 mb-4">{pipeline.description}</p>
            )}
            
            <div className="space-y-3">
              {pipeline.steps?.map((step: any, index: number) => (
                <motion.div
                  key={step.id}
                  className="flex items-center gap-3 p-3 bg-ml-dark-300 rounded-md"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-8 h-8 bg-ml-blue-50 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium capitalize">
                      {step.type?.replace('_', ' ')}
                    </p>
                    {step.parameters && (
                      <p className="text-sm text-ml-dark-400">
                        {Object.entries(step.parameters).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </p>
                    )}
                  </div>
                  <CheckCircle size={16} className="text-green-400" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <Network size={64} className="mx-auto text-ml-dark-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Pipeline</h3>
          <p className="text-ml-dark-400">This model was trained without a preprocessing pipeline</p>
        </div>
      )}
    </motion.div>
  );
}

// Training Tab Component
function TrainingTab({ model }: { model: any }) {
  return (
    <motion.div
      className="p-6 h-full overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        {/* Training History Chart */}
        {model.trainingHistory && model.trainingHistory.length > 0 && (
          <div className="bg-ml-dark-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-ml-blue-50" />
              Training History
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrainingChart 
                trainingHistory={model.trainingHistory}
                metric="loss"
                height={300}
              />
              {model.trainingHistory.some(h => h.accuracy !== undefined) && (
                <TrainingChart 
                  trainingHistory={model.trainingHistory}
                  metric="accuracy"
                  height={300}
                />
              )}
            </div>
          </div>
        )}

        {/* Training Log */}
        <div className="bg-ml-dark-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Code size={20} className="text-ml-blue-50" />
            Training Log
          </h3>
          <div className="bg-black rounded-lg p-4 font-mono text-sm max-h-64 overflow-y-auto">
            {model.trainingHistory?.slice(-10).map((entry: any, index: number) => (
              <div key={index} className="text-green-400 mb-1">
                Epoch {entry.epoch}: loss={entry.loss?.toFixed(4)} 
                {entry.accuracy && ` acc=${(entry.accuracy * 100).toFixed(2)}%`}
                {entry.validationLoss && ` val_loss=${entry.validationLoss?.toFixed(4)}`}
                {entry.validationAccuracy && ` val_acc=${(entry.validationAccuracy * 100).toFixed(2)}%`}
              </div>
            )) || (
              <div className="text-ml-dark-400">No training log available</div>
            )}
          </div>
        </div>

        {/* Error Information */}
        {model.status === 'failed' && model.errorMessage && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
              <AlertCircle size={20} />
              Error Information
            </h3>
            <p className="text-red-300 mb-2">{model.errorMessage}</p>
            {model.errorDetails && (
              <pre className="text-sm text-red-200 bg-red-900/20 p-3 rounded overflow-x-auto">
                {JSON.stringify(model.errorDetails, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Retrain Tab Component
function RetrainTab({ model, retrainConfig, setRetrainConfig, onRetrain }: {
  model: any;
  retrainConfig: any;
  setRetrainConfig: (config: any) => void;
  onRetrain: () => void;
}) {
  const updateConfig = (key: string, value: any) => {
    setRetrainConfig({ ...retrainConfig, [key]: value });
  };

  return (
    <motion.div
      className="p-6 h-full overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-6">
        <div className="bg-ml-dark-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings size={20} className="text-ml-blue-50" />
            Training Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Epochs
              </label>
              <input
                type="number"
                value={retrainConfig.epochs || 100}
                onChange={(e) => updateConfig('epochs', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-ml-dark-300 text-white rounded-md border border-ml-dark-400 focus:border-ml-blue-50 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Batch Size
              </label>
              <input
                type="number"
                value={retrainConfig.batchSize || 32}
                onChange={(e) => updateConfig('batchSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-ml-dark-300 text-white rounded-md border border-ml-dark-400 focus:border-ml-blue-50 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Learning Rate
              </label>
              <input
                type="number"
                step="0.0001"
                value={retrainConfig.learningRate || 0.001}
                onChange={(e) => updateConfig('learningRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-ml-dark-300 text-white rounded-md border border-ml-dark-400 focus:border-ml-blue-50 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Optimizer
              </label>
              <select
                value={retrainConfig.optimizer || 'adam'}
                onChange={(e) => updateConfig('optimizer', e.target.value)}
                className="w-full px-3 py-2 bg-ml-dark-300 text-white rounded-md border border-ml-dark-400 focus:border-ml-blue-50 focus:outline-none"
              >
                <option value="adam">Adam</option>
                <option value="sgd">SGD</option>
                <option value="rmsprop">RMSprop</option>
              </select>
            </div>
          </div>
        </div>

        {model.modelType === 'neural_network' && (
          <div className="bg-ml-dark-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Layers size={20} className="text-ml-blue-50" />
              Architecture
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Hidden Layers (comma-separated)
                </label>
                <input
                  type="text"
                  value={retrainConfig.hiddenLayers?.join(', ') || '128, 64, 32'}
                  onChange={(e) => updateConfig('hiddenLayers', e.target.value.split(',').map(x => parseInt(x.trim())))}
                  className="w-full px-3 py-2 bg-ml-dark-300 text-white rounded-md border border-ml-dark-400 focus:border-ml-blue-50 focus:outline-none"
                  placeholder="128, 64, 32"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Activation Function
                </label>
                <select
                  value={retrainConfig.activation || 'relu'}
                  onChange={(e) => updateConfig('activation', e.target.value)}
                  className="w-full px-3 py-2 bg-ml-dark-300 text-white rounded-md border border-ml-dark-400 focus:border-ml-blue-50 focus:outline-none"
                >
                  <option value="relu">ReLU</option>
                  <option value="tanh">Tanh</option>
                  <option value="sigmoid">Sigmoid</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Dropout Rate
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={retrainConfig.dropout || 0.2}
                  onChange={(e) => updateConfig('dropout', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-ml-dark-300 text-white rounded-md border border-ml-dark-400 focus:border-ml-blue-50 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <motion.button
            onClick={onRetrain}
            className="flex items-center gap-2 px-6 py-3 bg-ml-blue-50 text-white rounded-md hover:bg-ml-blue-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play size={16} />
            Start Retraining
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
