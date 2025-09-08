"use client";

import { useState, useEffect } from "react";
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
  Grid3X3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PipelineEditor from "./PipelineEditor";

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

export default function Pipelines() {
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPipelineEditor, setShowPipelineEditor] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"name" | "created" | "updated">("updated");

  // Queries
  const pipelines = useQuery(api.pipelines.getMyPipelines, {});
  const datasets = useQuery(api.datasets.getMyDatasets, {});
  const pipelineTemplates = useQuery(api.pipelines.getPipelineTemplates, {});

  // Mutations
  const createPipeline = useMutation(api.pipelines.createPipeline);
  const updatePipeline = useMutation(api.pipelines.updatePipeline);
  const deletePipeline = useMutation(api.pipelines.deletePipeline);
  const duplicatePipeline = useMutation(api.pipelines.duplicatePipeline);
  const createPipelineVersion = useMutation(api.pipelines.createPipelineVersion);
  const exportPipeline = useMutation(api.pipelines.exportPipeline);
  const importPipeline = useMutation(api.pipelines.importPipeline);

  // Filter and sort pipelines
  const filteredPipelines = pipelines?.filter(pipeline => {
    const matchesSearch = pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pipeline.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "active" && pipeline.isActive) ||
                         (filterStatus === "inactive" && !pipeline.isActive);
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "created":
        return b.createdAt - a.createdAt;
      case "updated":
        return b.updatedAt - a.updatedAt;
      default:
        return 0;
    }
  }) || [];

  const handleCreatePipeline = async (formData: any) => {
    try {
      await createPipeline(formData);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Failed to create pipeline:", error);
    }
  };

  const handleEditPipeline = async (pipelineId: Id<"transformationPipelines">, formData: any) => {
    try {
      await updatePipeline({ pipelineId, ...formData });
      setShowEditModal(false);
      setSelectedPipeline(null);
    } catch (error) {
      console.error("Failed to update pipeline:", error);
    }
  };

  const handleDeletePipeline = async (pipelineId: Id<"transformationPipelines">) => {
    if (confirm("Are you sure you want to delete this pipeline? This action cannot be undone.")) {
      try {
        await deletePipeline({ pipelineId });
      } catch (error) {
        console.error("Failed to delete pipeline:", error);
      }
    }
  };

  const handleDuplicatePipeline = async (pipeline: Pipeline) => {
    try {
      await duplicatePipeline({ 
        pipelineId: pipeline._id, 
        newName: `${pipeline.name} (Copy)` 
      });
    } catch (error) {
      console.error("Failed to duplicate pipeline:", error);
    }
  };

  const handleExportPipeline = async (pipeline: Pipeline) => {
    try {
      const exportData = await exportPipeline({ pipelineId: pipeline._id });
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pipeline.name.replace(/\s+/g, "_")}_pipeline.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export pipeline:", error);
    }
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case "load": return <Database className="w-4 h-4" />;
      case "normalize": return <BarChart3 className="w-4 h-4" />;
      case "scale": return <RotateCcw className="w-4 h-4" />;
      case "handle_missing": return <AlertTriangle className="w-4 h-4" />;
      case "encode_categorical": return <Tag className="w-4 h-4" />;
      case "split_data": return <Menu className="w-4 h-4" />;
      case "feature_engineering": return <Sparkles className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getStepName = (stepType: string) => {
    switch (stepType) {
      case "load": return "Load Data";
      case "normalize": return "Normalize";
      case "scale": return "Scale";
      case "handle_missing": return "Handle Missing";
      case "encode_categorical": return "Encode Categorical";
      case "split_data": return "Split Data";
      case "feature_engineering": return "Feature Engineering";
      case "reshape": return "Reshape";
      case "convert_to_tensor": return "Convert to Tensor";
      default: return stepType;
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pipeline Management</h1>
          <p className="text-slate-400">
            Build, manage, and version your ML transformation pipelines
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Import</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-600/90 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Pipeline</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search pipelines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-ml-dark-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="updated">Last Updated</option>
            <option value="created">Date Created</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pipeline Grid/List */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
        <AnimatePresence>
          {filteredPipelines.map((pipeline) => (
            <motion.div
              key={pipeline._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-all duration-200 ${
                viewMode === "list" ? "p-4" : "p-6"
              }`}
            >
              {viewMode === "grid" ? (
                <div className="space-y-4">
                  {/* Pipeline Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{pipeline.name}</h3>
                        {pipeline.isLatestVersion && (
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                            v{pipeline.version}
                          </span>
                        )}
                      </div>
                      {pipeline.description && (
                        <p className="text-slate-400 text-sm line-clamp-2">{pipeline.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setSelectedPipeline(pipeline);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePipeline(pipeline._id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Pipeline Steps */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300">Pipeline Steps</h4>
                    <div className="space-y-1">
                      {pipeline.steps.slice(0, 3).map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-2 text-sm">
                          <span className="text-slate-500">{index + 1}.</span>
                          <div className="text-slate-400">{getStepIcon(step.type)}</div>
                          <span className="text-slate-300">{getStepName(step.type)}</span>
                        </div>
                      ))}
                      {pipeline.steps.length > 3 && (
                        <div className="text-xs text-slate-500">
                          +{pipeline.steps.length - 3} more steps
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pipeline Metadata */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(pipeline.updatedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {pipeline.isActive ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-400" />
                      )}
                      <span>{pipeline.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-700">
                    <button
                      onClick={() => {
                        setSelectedPipeline(pipeline);
                        setShowPipelineEditor(true);
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-600/90 text-white text-sm rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>Open</span>
                    </button>
                    <button
                      onClick={() => handleDuplicatePipeline(pipeline)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExportPipeline(pipeline)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      <Code className="w-5 h-5 text-blue-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">{pipeline.name}</h3>
                        <p className="text-sm text-slate-400">
                          {pipeline.steps.length} steps • {formatDate(pipeline.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {pipeline.steps.slice(0, 3).map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-1 text-xs text-slate-400">
                          {getStepIcon(step.type)}
                          <span>{getStepName(step.type)}</span>
                        </div>
                      ))}
                      {pipeline.steps.length > 3 && (
                        <span className="text-xs text-slate-500">+{pipeline.steps.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPipeline(pipeline);
                        setShowPipelineEditor(true);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-600/90 text-white text-sm rounded-lg transition-colors"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPipeline(pipeline);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicatePipeline(pipeline)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePipeline(pipeline._id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredPipelines.length === 0 && (
      <div className="text-center py-20">
          <div className="text-6xl text-slate-300 mb-4">🚀</div>
          <h3 className="text-xl font-semibold text-white mb-2">No pipelines found</h3>
          <p className="text-slate-400 mb-6">
            {searchQuery || filterStatus !== "all" 
              ? "Try adjusting your search or filters" 
              : "Create your first ML transformation pipeline to get started"
            }
          </p>
          {!searchQuery && filterStatus === "all" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-600/90 text-white rounded-lg transition-colors"
            >
              Create Pipeline
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreatePipelineModal
          datasets={datasets || []}
          templates={pipelineTemplates || []}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePipeline}
        />
      )}

      {showEditModal && selectedPipeline && (
        <EditPipelineModal
          pipeline={selectedPipeline}
          datasets={datasets || []}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPipeline(null);
          }}
          onSubmit={handleEditPipeline}
        />
      )}

      {showImportModal && (
        <ImportPipelineModal
          datasets={datasets || []}
          onClose={() => setShowImportModal(false)}
          onSubmit={importPipeline}
        />
      )}

      {showPipelineEditor && selectedPipeline && (
        <PipelineEditor
          pipeline={selectedPipeline}
          onClose={() => {
            setShowPipelineEditor(false);
            setSelectedPipeline(null);
          }}
          onSave={handleEditPipeline}
        />
      )}
    </div>
  );
}

// Create Pipeline Modal Component
function CreatePipelineModal({ 
  datasets, 
  templates, 
  onClose, 
  onSubmit 
}: { 
  datasets: Dataset[]; 
  templates: any[]; 
  onClose: () => void; 
  onSubmit: (data: any) => void; 
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    datasetId: "",
    steps: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.datasetId) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create New Pipeline</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Pipeline Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter pipeline name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your pipeline"
              rows={3}
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
              Create Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Pipeline Modal Component
function EditPipelineModal({ 
  pipeline, 
  datasets, 
  onClose, 
  onSubmit 
}: { 
  pipeline: Pipeline; 
  datasets: Dataset[]; 
  onClose: () => void; 
  onSubmit: (pipelineId: Id<"transformationPipelines">, data: any) => void; 
}) {
  const [formData, setFormData] = useState({
    name: pipeline.name,
    description: pipeline.description || "",
    isActive: pipeline.isActive
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(pipeline._id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Edit Pipeline</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Pipeline Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-400 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm text-white">
              Active Pipeline
            </label>
          </div>

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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Import Pipeline Modal Component
function ImportPipelineModal({ 
  datasets, 
  onClose, 
  onSubmit 
}: { 
  datasets: Dataset[]; 
  onClose: () => void; 
  onSubmit: (data: any) => void; 
}) {
  const [formData, setFormData] = useState({
    datasetId: "",
    importFile: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, importFile: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.importFile && formData.datasetId) {
      try {
        const text = await formData.importFile.text();
        const pipelineData = JSON.parse(text);
        onSubmit({
          name: pipelineData.name,
          description: pipelineData.description,
          datasetId: formData.datasetId,
          steps: pipelineData.steps,
          importedFrom: formData.importFile.name
        });
        onClose();
      } catch (error) {
        console.error("Failed to import pipeline:", error);
        alert("Failed to import pipeline. Please check the file format.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Import Pipeline</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-white mb-2">Pipeline File</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              Select a JSON file exported from ML Studio
            </p>
          </div>

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
              Import Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
