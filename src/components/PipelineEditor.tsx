"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Copy,
  Play,
  Pause,
  Eye,
  Download,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
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
  Wrench
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

interface Dataset {
  _id: Id<"datasets">;
  name: string;
  type: string;
  size: number;
  format: string;
  rowCount?: number;
  columnCount?: number;
}

interface PipelineEditorProps {
  pipeline: Pipeline;
  onClose: () => void;
  onSave: (pipelineId: Id<"transformationPipelines">, data: any) => void;
}

export default function PipelineEditor({ pipeline, onClose, onSave }: PipelineEditorProps) {
  const [steps, setSteps] = useState(pipeline.steps);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Queries
  const dataset = useQuery(api.datasets.getDataset, { datasetId: pipeline.datasetId });
  const pipelineVersions = useQuery(api.pipelines.getPipelineVersions, { pipelineId: pipeline._id });

  // Mutations
  const updatePipeline = useMutation(api.pipelines.updatePipeline);
  const createPipelineVersion = useMutation(api.pipelines.createPipelineVersion);
  const runPipeline = useMutation(api.pipelines.runPipeline);

  const stepTypes = [
    {
      id: "load",
      name: "Load Data",
      description: "Load data from the dataset",
      icon: <Database className="w-5 h-5" />,
      category: "data"
    },
    {
      id: "handle_missing",
      name: "Handle Missing Values",
      description: "Handle missing or null values in the data",
      icon: <AlertTriangle className="w-5 h-5" />,
      category: "cleaning"
    },
    {
      id: "normalize",
      name: "Normalize Data",
      description: "Normalize numerical data using various methods",
      icon: <BarChart3 className="w-5 h-5" />,
      category: "preprocessing"
    },
    {
      id: "scale",
      name: "Scale Data",
      description: "Scale numerical data to a specific range",
      icon: <RotateCcw className="w-5 h-5" />,
      category: "preprocessing"
    },
    {
      id: "encode_categorical",
      name: "Encode Categorical",
      description: "Encode categorical variables",
      icon: <Tag className="w-5 h-5" />,
      category: "preprocessing"
    },
    {
      id: "feature_engineering",
      name: "Feature Engineering",
      description: "Create new features from existing data",
      icon: <Sparkles className="w-5 h-5" />,
      category: "engineering"
    },
    {
      id: "split_data",
      name: "Split Data",
      description: "Split data into train, validation, and test sets",
      icon: <Scissors className="w-5 h-5" />,
      category: "preprocessing"
    },
    {
      id: "reshape",
      name: "Reshape Data",
      description: "Reshape data structure",
      icon: <Table className="w-5 h-5" />,
      category: "transformation"
    },
    {
      id: "convert_to_tensor",
      name: "Convert to Tensor",
      description: "Convert data to tensor format for ML models",
      icon: <Cpu className="w-5 h-5" />,
      category: "ml_preparation"
    }
  ];

  const getStepIcon = (stepType: string) => {
    const step = stepTypes.find(s => s.id === stepType);
    return step?.icon || <Settings className="w-4 h-4" />;
  };

  const getStepName = (stepType: string) => {
    const step = stepTypes.find(s => s.id === stepType);
    return step?.name || stepType;
  };

  const getStepDescription = (stepType: string) => {
    const step = stepTypes.find(s => s.id === stepType);
    return step?.description || "";
  };

  const addStep = (stepType: string) => {
    const newStep = {
      id: `step_${Date.now()}`,
      type: stepType,
      parameters: getDefaultParameters(stepType),
      order: steps.length + 1,
      appliedAt: Date.now()
    };
    setSteps([...steps, newStep]);
    setIsDirty(true);
    setShowAddStepModal(false);
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
    setIsDirty(true);
    if (selectedStep === stepId) {
      setSelectedStep(null);
    }
  };

  const updateStep = (stepId: string, updates: any) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
    setIsDirty(true);
  };

  const moveStep = (stepId: string, direction: "up" | "down") => {
    const index = steps.findIndex(step => step.id === stepId);
    if (index === -1) return;

    const newSteps = [...steps];
    if (direction === "up" && index > 0) {
      [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
    } else if (direction === "down" && index < steps.length - 1) {
      [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    }

    // Update order numbers
    newSteps.forEach((step, i) => {
      step.order = i + 1;
    });

    setSteps(newSteps);
    setIsDirty(true);
  };

  const getDefaultParameters = (stepType: string) => {
    switch (stepType) {
      case "handle_missing":
        return { strategy: "mean", fillValue: null };
      case "normalize":
        return { method: "zscore", mean: 0, std: 1 };
      case "scale":
        return { method: "minmax", min: 0, max: 1 };
      case "encode_categorical":
        return { method: "label", unknownValue: -1 };
      case "split_data":
        return { train: 0.7, validation: 0.15, test: 0.15, randomState: 42 };
      case "feature_engineering":
        return { operations: [] };
      case "reshape":
        return { shape: [] };
      case "convert_to_tensor":
        return { dtype: "float32" };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    try {
      await updatePipeline({
        pipelineId: pipeline._id,
        steps: steps
      });
      setIsDirty(false);
    } catch (error) {
      console.error("Failed to save pipeline:", error);
    }
  };

  const handleRunPipeline = async () => {
    setIsRunning(true);
    try {
      const result = await runPipeline({
        pipelineId: pipeline._id,
        steps: steps
      });
      setPreviewData(result);
    } catch (error) {
      console.error("Failed to run pipeline:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCreateVersion = async (versionNotes: string) => {
    try {
      await createPipelineVersion({
        pipelineId: pipeline._id,
        steps: steps,
        versionNotes: versionNotes
      });
      setShowVersionModal(false);
    } catch (error) {
      console.error("Failed to create version:", error);
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">{pipeline.name}</h2>
            <p className="text-slate-400">
              {dataset?.name} • {steps.length} steps • {formatDate(pipeline.updatedAt)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {isDirty && (
              <span className="text-yellow-400 text-sm">Unsaved changes</span>
            )}
            <button
              onClick={() => setShowVersionModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <FileUp className="w-4 h-4" />
              <span>Version</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-600/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Pipeline Steps Panel */}
          <div className="w-1/3 border-r border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Pipeline Steps</h3>
                <button
                  onClick={() => setShowAddStepModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-600/90 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Step</span>
                </button>
              </div>
              <button
                onClick={handleRunPipeline}
                disabled={isRunning || steps.length === 0}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Pipeline</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {steps.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl text-slate-300 mb-2">🔧</div>
                  <p className="text-slate-400">No steps added yet</p>
                  <p className="text-sm text-slate-500">Click "Add Step" to get started</p>
                </div>
              ) : (
                steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedStep === step.id
                        ? "border-ml-primary bg-blue-600/10"
                        : "border-slate-700 bg-slate-700 hover:border-slate-600"
                    }`}
                    onClick={() => setSelectedStep(step.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-500 bg-slate-500 px-2 py-1 rounded">
                          {index + 1}
                        </span>
                        <div className="text-blue-400">{getStepIcon(step.type)}</div>
                        <span className="text-white font-medium">{getStepName(step.type)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStep(step.id, "up");
                          }}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowLeft className="w-3 h-3 rotate-90" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveStep(step.id, "down");
                          }}
                          disabled={index === steps.length - 1}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowRight className="w-3 h-3 rotate-90" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeStep(step.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{getStepDescription(step.type)}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {selectedStep ? (
              <StepConfiguration
                step={steps.find(s => s.id === selectedStep)!}
                onUpdate={(updates) => updateStep(selectedStep, updates)}
                dataset={dataset}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl text-slate-300 mb-4">⚙️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Select a Step</h3>
                  <p className="text-slate-400">
                    Choose a step from the left panel to configure its parameters
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {previewData && (
            <div className="w-1/3 border-l border-slate-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Preview Results</h3>
              <div className="bg-slate-700 rounded-lg p-4">
                <pre className="text-xs text-slate-300 overflow-auto max-h-96">
                  {JSON.stringify(previewData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Step Modal */}
      {showAddStepModal && (
        <AddStepModal
          stepTypes={stepTypes}
          onClose={() => setShowAddStepModal(false)}
          onAddStep={addStep}
        />
      )}

      {/* Version Modal */}
      {showVersionModal && (
        <VersionModal
          pipeline={pipeline}
          versions={pipelineVersions || []}
          onClose={() => setShowVersionModal(false)}
          onCreateVersion={handleCreateVersion}
        />
      )}
    </div>
  );
}

// Step Configuration Component
function StepConfiguration({ 
  step, 
  onUpdate, 
  dataset 
}: { 
  step: any; 
  onUpdate: (updates: any) => void; 
  dataset: Dataset | null | undefined; 
}) {
  const [parameters, setParameters] = useState(step.parameters);

  // Define step types locally to avoid scope issues
  const stepTypes = [
    {
      id: "load",
      name: "Load Data",
      description: "Load data from the dataset",
      icon: <Database className="w-5 h-5" />,
      category: "data"
    },
    {
      id: "handle_missing",
      name: "Handle Missing Values",
      description: "Handle missing or null values in the data",
      icon: <AlertTriangle className="w-5 h-5" />,
      category: "cleaning"
    },
    {
      id: "normalize",
      name: "Normalize Data",
      description: "Normalize numerical data using various methods",
      icon: <BarChart3 className="w-5 h-5" />,
      category: "preprocessing"
    },
    {
      id: "scale",
      name: "Scale Data",
      description: "Scale numerical data to a specific range",
      icon: <RotateCcw className="w-5 h-5" />,
      category: "preprocessing"
    },
    {
      id: "encode_categorical",
      name: "Encode Categorical",
      description: "Encode categorical variables",
      icon: <Tag className="w-5 h-5" />,
      category: "preprocessing"
    },
    {
      id: "feature_engineering",
      name: "Feature Engineering",
      description: "Create new features from existing data",
      icon: <Sparkles className="w-5 h-5" />,
      category: "engineering"
    },
    {
      id: "split_data",
      name: "Split Data",
      description: "Split data into train, validation, and test sets",
      icon: <Scissors className="w-5 h-5" />,
      category: "preprocessing"
    },
    {
      id: "reshape",
      name: "Reshape Data",
      description: "Reshape data structure",
      icon: <Table className="w-5 h-5" />,
      category: "transformation"
    },
    {
      id: "convert_to_tensor",
      name: "Convert to Tensor",
      description: "Convert data to tensor format for ML models",
      icon: <Cpu className="w-5 h-5" />,
      category: "ml_preparation"
    }
  ];

  const getStepName = (stepType: string) => {
    const step = stepTypes.find(s => s.id === stepType);
    return step?.name || stepType;
  };

  const getStepDescription = (stepType: string) => {
    const step = stepTypes.find(s => s.id === stepType);
    return step?.description || "";
  };

  // Use useCallback to prevent infinite re-renders
  const handleParameterChange = useCallback((newParameters: any) => {
    setParameters(newParameters);
    onUpdate({ parameters: newParameters });
  }, [onUpdate]);

  useEffect(() => {
    handleParameterChange(parameters);
  }, [parameters, handleParameterChange]);

  const renderParameterInput = (key: string, value: any, type: string) => {
    switch (type) {
      case "select":
        return (
          <select
            value={value}
            onChange={(e) => handleParameterChange({ ...parameters, [key]: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getSelectOptions(key).map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleParameterChange({ ...parameters, [key]: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      case "boolean":
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleParameterChange({ ...parameters, [key]: e.target.checked })}
            className="w-4 h-4 text-blue-400 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleParameterChange({ ...parameters, [key]: e.target.value })}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  const getSelectOptions = (key: string) => {
    switch (key) {
      case "strategy":
        return [
          { value: "mean", label: "Mean" },
          { value: "median", label: "Median" },
          { value: "mode", label: "Mode" },
          { value: "drop", label: "Drop" },
          { value: "fill", label: "Fill Value" }
        ];
      case "method":
        if (step.type === "normalize") {
          return [
            { value: "zscore", label: "Z-Score" },
            { value: "minmax", label: "Min-Max" },
            { value: "robust", label: "Robust" }
          ];
        } else if (step.type === "scale") {
          return [
            { value: "minmax", label: "Min-Max" },
            { value: "standard", label: "Standard" },
            { value: "maxabs", label: "Max Absolute" }
          ];
        } else if (step.type === "encode_categorical") {
          return [
            { value: "label", label: "Label Encoding" },
            { value: "onehot", label: "One-Hot Encoding" },
            { value: "target", label: "Target Encoding" }
          ];
        }
        return [];
      default:
        return [];
    }
  };

  const getParameterConfig = () => {
    switch (step.type) {
      case "handle_missing":
        return [
          { key: "strategy", label: "Strategy", type: "select" },
          { key: "fillValue", label: "Fill Value", type: "text" }
        ];
      case "normalize":
        return [
          { key: "method", label: "Method", type: "select" },
          { key: "mean", label: "Mean", type: "number" },
          { key: "std", label: "Standard Deviation", type: "number" }
        ];
      case "scale":
        return [
          { key: "method", label: "Method", type: "select" },
          { key: "min", label: "Minimum", type: "number" },
          { key: "max", label: "Maximum", type: "number" }
        ];
      case "encode_categorical":
        return [
          { key: "method", label: "Method", type: "select" },
          { key: "unknownValue", label: "Unknown Value", type: "number" }
        ];
      case "split_data":
        return [
          { key: "train", label: "Train Ratio", type: "number" },
          { key: "validation", label: "Validation Ratio", type: "number" },
          { key: "test", label: "Test Ratio", type: "number" },
          { key: "randomState", label: "Random State", type: "number" }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="max-w-2xl">
        <h3 className="text-xl font-semibold text-white mb-4">
          Configure {getStepName(step.type)}
        </h3>
        <p className="text-slate-400 mb-6">
          {getStepDescription(step.type)}
        </p>

        <div className="space-y-4">
          {getParameterConfig().map((param) => (
            <div key={param.key}>
              <label className="block text-sm font-medium text-white mb-2">
                {param.label}
              </label>
              {renderParameterInput(param.key, parameters[param.key], param.type)}
            </div>
          ))}
        </div>

        {dataset && (
          <div className="mt-8 p-4 bg-slate-700 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Dataset Info</h4>
            <div className="text-xs text-slate-300 space-y-1">
              <p>Name: {dataset.name}</p>
              <p>Type: {dataset.type}</p>
              <p>Format: {dataset.format}</p>
              {dataset.rowCount && <p>Rows: {dataset.rowCount.toLocaleString()}</p>}
              {dataset.columnCount && <p>Columns: {dataset.columnCount}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add Step Modal Component
function AddStepModal({ 
  stepTypes, 
  onClose, 
  onAddStep 
}: { 
  stepTypes: any[]; 
  onClose: () => void; 
  onAddStep: (stepType: string) => void; 
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", name: "All Steps" },
    { id: "data", name: "Data Loading" },
    { id: "cleaning", name: "Data Cleaning" },
    { id: "preprocessing", name: "Preprocessing" },
    { id: "engineering", name: "Feature Engineering" },
    { id: "transformation", name: "Transformation" },
    { id: "ml_preparation", name: "ML Preparation" }
  ];

  const filteredSteps = selectedCategory === "all" 
    ? stepTypes 
    : stepTypes.filter(step => step.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Add Pipeline Step</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {filteredSteps.map((stepType) => (
            <button
              key={stepType.id}
              onClick={() => onAddStep(stepType.id)}
              className="p-4 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 hover:border-blue-500/50 transition-all text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="text-blue-400">{stepType.icon}</div>
                <h3 className="text-white font-medium">{stepType.name}</h3>
              </div>
              <p className="text-sm text-slate-400">{stepType.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Version Modal Component
function VersionModal({ 
  pipeline, 
  versions, 
  onClose, 
  onCreateVersion 
}: { 
  pipeline: Pipeline; 
  versions: Pipeline[]; 
  onClose: () => void; 
  onCreateVersion: (notes: string) => void; 
}) {
  const [versionNotes, setVersionNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (versionNotes.trim()) {
      onCreateVersion(versionNotes);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create New Version</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Version Notes
            </label>
            <textarea
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the changes in this version..."
              rows={4}
              required
            />
          </div>

          {versions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Previous Versions</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {versions.slice(0, 5).map((version) => (
                  <div key={version._id} className="p-2 bg-slate-700 rounded text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white">v{version.version}</span>
                      <span className="text-slate-400">
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {version.versionNotes && (
                      <p className="text-slate-400 mt-1">{version.versionNotes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-600/90 text-white rounded-lg transition-colors"
            >
              Create Version
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
