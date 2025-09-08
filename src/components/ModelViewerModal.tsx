"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Eye, 
  Edit3, 
  Save, 
  RotateCcw, 
  Download, 
  Copy, 
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Database,
  GitBranch,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  Brain,
  Layers,
  Cpu,
  Monitor,
  FileText,
  Code,
  Wrench,
  Sliders,
  Info,
  ChevronRight,
  ChevronDown,
  Copy as CopyIcon,
  Check
} from "lucide-react";
import { ModelVersion, modelManager } from "@/lib/unifiedModelManager";

interface ModelViewerModalProps {
  model: ModelVersion | null;
  isOpen: boolean;
  onClose: () => void;
  onRetrain?: (modelId: string, config: any) => void;
  onDelete?: (modelId: string) => void;
  onUpdate?: (modelId: string, updates: any) => void;
}

export default function ModelViewerModal({ 
  model, 
  isOpen, 
  onClose, 
  onRetrain, 
  onDelete, 
  onUpdate 
}: ModelViewerModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "parameters" | "pipeline" | "training" | "retrain">("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editedParameters, setEditedParameters] = useState<any>({});
  const [retrainConfig, setRetrainConfig] = useState<any>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (model) {
      setEditedParameters(model.parameters || {});
      setRetrainConfig({
        epochs: model.parameters?.epochs || 100,
        batchSize: model.parameters?.batch_size || 32,
        learningRate: model.parameters?.learning_rate || 0.001,
        optimizer: model.parameters?.optimizer || "adam",
        hiddenLayers: model.parameters?.hidden_layers || [128, 64, 32],
        activation: model.parameters?.activation || "relu",
        dropout: model.parameters?.dropout_rate || 0.2,
        validationSplit: model.trainingConfig?.validationSize || 0.2,
        earlyStopping: true,
        patience: 10
      });
    }
  }, [model]);

  if (!isOpen || !model) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-400 bg-green-400/20";
      case "training": return "text-blue-400 bg-blue-400/20";
      case "failed": return "text-red-400 bg-red-400/20";
      case "cancelled": return "text-gray-400 bg-gray-400/20";
      default: return "text-gray-400 bg-gray-400/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "training": return <Activity className="w-4 h-4 animate-pulse" />;
      case "failed": return <XCircle className="w-4 h-4" />;
      case "cancelled": return <Pause className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date | number) => {
    const dateObj = typeof date === 'number' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleSaveParameters = async () => {
    if (onUpdate) {
      await onUpdate(model.id, { parameters: editedParameters });
    }
    setIsEditing(false);
  };

  const handleRetrain = () => {
    if (onRetrain) {
      onRetrain(model.id, retrainConfig);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this model? This action cannot be undone.")) {
      if (onDelete) {
        onDelete(model.id);
      }
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <Eye className="w-4 h-4" /> },
    { id: "parameters", label: "Parameters", icon: <Settings className="w-4 h-4" /> },
    { id: "pipeline", label: "Pipeline", icon: <GitBranch className="w-4 h-4" /> },
    { id: "training", label: "Training", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "retrain", label: "Retrain", icon: <RotateCcw className="w-4 h-4" /> }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600/20 rounded-lg">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{model.name}</h2>
                <p className="text-sm text-slate-400">{model.modelType} • {model.version}</p>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full flex items-center space-x-1 ${getStatusColor(model.status)}`}>
                {getStatusIcon(model.status)}
                <span className="capitalize">{model.status}</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(JSON.stringify(model, null, 2), "model")}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                title="Copy model data"
              >
                {copied === "model" ? <Check className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                title="Delete model"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-400 border-b-2 border-blue-400 bg-blue-400/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Accuracy</span>
                        <Target className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {model.metrics?.accuracy ? `${(model.metrics.accuracy * 100).toFixed(2)}%` : "N/A"}
                      </div>
                      {model.metrics?.accuracy && (
                        <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${model.metrics.accuracy * 100}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Loss</span>
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {model.metrics?.loss?.toFixed(4) || "N/A"}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {model.metrics?.validationLoss ? `Val: ${model.metrics.validationLoss.toFixed(4)}` : ""}
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Training Time</span>
                        <Clock className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {model.metrics?.trainingTime ? (model.metrics.trainingTime / 1000).toFixed(1) : "N/A"}s
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {model.metrics?.epochs ? `${model.metrics.epochs} epochs` : ""}
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Model Type</span>
                        <Cpu className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-lg font-semibold text-white capitalize">
                        {model.modelType.replace(/_/g, " ")}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Version {model.version}
                      </div>
                    </div>
                  </div>

                  {/* Model Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Model Information</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Created:</span>
                          <span className="text-white">{formatDate(model.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Updated:</span>
                          <span className="text-white">{formatDate(model.updatedAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Status:</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(model.status)}`}>
                            {model.status}
                          </span>
                        </div>
                        {model.description && (
                          <div className="pt-3 border-t border-slate-600">
                            <span className="text-slate-400">Description:</span>
                            <p className="text-white mt-1">{model.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-4">Data Sources</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Dataset:</span>
                          <div className="flex items-center space-x-2">
                            <Database className="w-4 h-4 text-blue-400" />
                            <span className="text-white">{model.datasetId}</span>
                          </div>
                        </div>
                        {model.pipelineId && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Pipeline:</span>
                            <div className="flex items-center space-x-2">
                              <GitBranch className="w-4 h-4 text-green-400" />
                              <span className="text-white">{model.pipelineId}</span>
                            </div>
                          </div>
                        )}
                        {model.trainingJobId && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Training Job:</span>
                            <div className="flex items-center space-x-2">
                              <Activity className="w-4 h-4 text-purple-400" />
                              <span className="text-white">{model.trainingJobId}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "parameters" && (
                <motion.div
                  key="parameters"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Model Parameters</h3>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-3 py-1 text-slate-400 hover:text-white transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveParameters}
                            className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center space-x-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Training Parameters */}
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-white mb-4">Training Parameters</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">Epochs</label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedParameters.epochs || 100}
                              onChange={(e) => setEditedParameters({...editedParameters, epochs: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="text-white">{editedParameters.epochs || 100}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">Batch Size</label>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editedParameters.batch_size || 32}
                              onChange={(e) => setEditedParameters({...editedParameters, batch_size: parseInt(e.target.value)})}
                              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="text-white">{editedParameters.batch_size || 32}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">Learning Rate</label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.001"
                              value={editedParameters.learning_rate || 0.001}
                              onChange={(e) => setEditedParameters({...editedParameters, learning_rate: parseFloat(e.target.value)})}
                              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="text-white">{editedParameters.learning_rate || 0.001}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Architecture Parameters */}
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-white mb-4">Architecture Parameters</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">Hidden Layers</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedParameters.hidden_layers?.join(", ") || "128, 64, 32"}
                              onChange={(e) => setEditedParameters({...editedParameters, hidden_layers: e.target.value.split(",").map(x => parseInt(x.trim()))})}
                              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="128, 64, 32"
                            />
                          ) : (
                            <div className="text-white">{editedParameters.hidden_layers?.join(", ") || "128, 64, 32"}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">Activation</label>
                          {isEditing ? (
                            <select
                              value={editedParameters.activation || "relu"}
                              onChange={(e) => setEditedParameters({...editedParameters, activation: e.target.value})}
                              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="relu">ReLU</option>
                              <option value="sigmoid">Sigmoid</option>
                              <option value="tanh">Tanh</option>
                              <option value="linear">Linear</option>
                            </select>
                          ) : (
                            <div className="text-white">{editedParameters.activation || "relu"}</div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-1">Dropout Rate</label>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="1"
                              value={editedParameters.dropout_rate || 0.2}
                              onChange={(e) => setEditedParameters({...editedParameters, dropout_rate: parseFloat(e.target.value)})}
                              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <div className="text-white">{editedParameters.dropout_rate || 0.2}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* All Parameters JSON View */}
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-semibold text-white">All Parameters</h4>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(editedParameters, null, 2), "parameters")}
                        className="flex items-center space-x-2 px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                      >
                        {copied === "parameters" ? <Check className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                        <span>Copy JSON</span>
                      </button>
                    </div>
                    <pre className="bg-slate-800 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto">
                      {JSON.stringify(editedParameters, null, 2)}
                    </pre>
                  </div>
                </motion.div>
              )}

              {activeTab === "pipeline" && (
                <motion.div
                  key="pipeline"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-white">Data Pipeline</h3>
                  
                  {model.preprocessingSteps && model.preprocessingSteps.length > 0 ? (
                    <div className="space-y-4">
                      {model.preprocessingSteps.map((step, index) => (
                        <div key={index} className="bg-slate-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="text-md font-semibold text-white capitalize">
                                  {step.type?.replace(/_/g, " ") || "Unknown Step"}
                                </h4>
                                <p className="text-sm text-slate-400">Step {index + 1}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded-full">
                                Applied
                              </span>
                              {index < model.preprocessingSteps.length - 1 && (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                          </div>
                          {step.parameters && Object.keys(step.parameters).length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-600">
                              <h5 className="text-sm font-medium text-slate-300 mb-2">Parameters:</h5>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {Object.entries(step.parameters).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="text-slate-400">{key}:</span>
                                    <span className="text-white">{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <GitBranch className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-white mb-2">No Pipeline Used</h4>
                      <p className="text-slate-400">
                        This model was trained on raw data without preprocessing steps.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "training" && (
                <motion.div
                  key="training"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-semibold text-white">Training History</h3>
                  
                  {model.trainingHistory && model.trainingHistory.length > 0 ? (
                    <div className="space-y-6">
                      {/* Training Charts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-700/50 rounded-lg p-4">
                          <h4 className="text-md font-semibold text-white mb-4">Loss Progression</h4>
                          <div className="h-48 flex items-center justify-center">
                            <div className="text-center">
                              <TrendingDown className="w-12 h-12 text-red-400 mx-auto mb-2" />
                              <p className="text-slate-400">Loss visualization would go here</p>
                              <p className="text-xs text-slate-500 mt-1">
                                Final: {model.metrics?.loss?.toFixed(4) || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-700/50 rounded-lg p-4">
                          <h4 className="text-md font-semibold text-white mb-4">Accuracy Progression</h4>
                          <div className="h-48 flex items-center justify-center">
                            <div className="text-center">
                              <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-2" />
                              <p className="text-slate-400">Accuracy visualization would go here</p>
                              <p className="text-xs text-slate-500 mt-1">
                                Final: {model.metrics?.accuracy ? `${(model.metrics.accuracy * 100).toFixed(2)}%` : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Training Log */}
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <h4 className="text-md font-semibold text-white mb-4">Training Log</h4>
                        <div className="bg-slate-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                          <div className="space-y-2 text-sm font-mono">
                            {model.trainingHistory.map((entry, index) => (
                              <div key={index} className="flex items-center space-x-4 text-slate-300">
                                <span className="text-slate-500 w-16">Epoch {entry.epoch}</span>
                                <span className="text-red-400 w-20">Loss: {entry.loss.toFixed(4)}</span>
                                {entry.accuracy && (
                                  <span className="text-green-400 w-24">Acc: {(entry.accuracy * 100).toFixed(2)}%</span>
                                )}
                                {entry.validationLoss && (
                                  <span className="text-yellow-400 w-24">Val: {entry.validationLoss.toFixed(4)}</span>
                                )}
                                <span className="text-slate-500 text-xs">
                                  {new Date(entry.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-white mb-2">No Training History</h4>
                      <p className="text-slate-400">
                        Training history is not available for this model.
                      </p>
                    </div>
                  )}

                  {/* Error Information */}
                  {model.status === "failed" && model.errorMessage && (
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <h4 className="text-md font-semibold text-red-400">Training Failed</h4>
                      </div>
                      <p className="text-red-300 mb-2">{model.errorMessage}</p>
                      {model.errorDetails && (
                        <details className="text-sm">
                          <summary className="text-red-400 cursor-pointer">Error Details</summary>
                          <pre className="mt-2 text-red-300 bg-red-900/20 rounded p-2 overflow-x-auto">
                            {JSON.stringify(model.errorDetails, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "retrain" && (
                <motion.div
                  key="retrain"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Retrain Model</h3>
                    <button
                      onClick={handleRetrain}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Retraining</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Training Configuration */}
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-white mb-4">Training Configuration</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Epochs</label>
                          <input
                            type="number"
                            value={retrainConfig.epochs}
                            onChange={(e) => setRetrainConfig({...retrainConfig, epochs: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Batch Size</label>
                          <select
                            value={retrainConfig.batchSize}
                            onChange={(e) => setRetrainConfig({...retrainConfig, batchSize: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={16}>16</option>
                            <option value={32}>32</option>
                            <option value={64}>64</option>
                            <option value={128}>128</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Learning Rate</label>
                          <input
                            type="number"
                            step="0.001"
                            value={retrainConfig.learningRate}
                            onChange={(e) => setRetrainConfig({...retrainConfig, learningRate: parseFloat(e.target.value)})}
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Optimizer</label>
                          <select
                            value={retrainConfig.optimizer}
                            onChange={(e) => setRetrainConfig({...retrainConfig, optimizer: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="adam">Adam</option>
                            <option value="sgd">SGD</option>
                            <option value="rmsprop">RMSprop</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Architecture Configuration */}
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-white mb-4">Architecture Configuration</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Hidden Layers</label>
                          <input
                            type="text"
                            value={retrainConfig.hiddenLayers.join(", ")}
                            onChange={(e) => setRetrainConfig({...retrainConfig, hiddenLayers: e.target.value.split(",").map(x => parseInt(x.trim()))})}
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="128, 64, 32"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Activation Function</label>
                          <select
                            value={retrainConfig.activation}
                            onChange={(e) => setRetrainConfig({...retrainConfig, activation: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="relu">ReLU</option>
                            <option value="sigmoid">Sigmoid</option>
                            <option value="tanh">Tanh</option>
                            <option value="linear">Linear</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Dropout Rate</label>
                          <input
                            type="range"
                            min="0"
                            max="0.5"
                            step="0.1"
                            value={retrainConfig.dropout}
                            onChange={(e) => setRetrainConfig({...retrainConfig, dropout: parseFloat(e.target.value)})}
                            className="w-full"
                          />
                          <div className="text-sm text-slate-400 mt-1">{retrainConfig.dropout}</div>
                        </div>
                        <div>
                          <label className="block text-sm text-slate-400 mb-2">Validation Split</label>
                          <input
                            type="range"
                            min="0.1"
                            max="0.4"
                            step="0.1"
                            value={retrainConfig.validationSplit}
                            onChange={(e) => setRetrainConfig({...retrainConfig, validationSplit: parseFloat(e.target.value)})}
                            className="w-full"
                          />
                          <div className="text-sm text-slate-400 mt-1">{retrainConfig.validationSplit}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-white mb-4">Advanced Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="earlyStopping"
                          checked={retrainConfig.earlyStopping}
                          onChange={(e) => setRetrainConfig({...retrainConfig, earlyStopping: e.target.checked})}
                          className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="earlyStopping" className="text-white">Early Stopping</label>
                      </div>
                      <div>
                        <label className="block text-sm text-slate-400 mb-2">Patience</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={retrainConfig.patience}
                          onChange={(e) => setRetrainConfig({...retrainConfig, patience: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Configuration Summary */}
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <h4 className="text-md font-semibold text-white mb-4">Configuration Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Epochs:</span>
                        <div className="text-white font-semibold">{retrainConfig.epochs}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Batch Size:</span>
                        <div className="text-white font-semibold">{retrainConfig.batchSize}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Learning Rate:</span>
                        <div className="text-white font-semibold">{retrainConfig.learningRate}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Optimizer:</span>
                        <div className="text-white font-semibold capitalize">{retrainConfig.optimizer}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
