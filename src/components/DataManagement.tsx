"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  Database, 
  FileText, 
  Image, 
  Music, 
  Trash2, 
  Edit3, 
  Eye,
  Download,
  Plus,
  Search,
  Filter,
  Play,
  Save,
  BarChart3,
  Settings,
  X,
  CheckCircle,
  AlertCircle,
  Circle
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import DataPreprocessor, { ProcessedData, DataStep, DataVisualizer } from "@/lib/dataProcessing";
// Temporarily disabled Recharts due to syntax error
// import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import DataWorkbench from "@/components/DataWorkbench";

export default function DataManagement() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<"datasets" | "preprocessing" | "pipelines">("datasets");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreprocessingModal, setShowPreprocessingModal] = useState(false);
  
  // Data processing state
  const [preprocessor] = useState(() => new DataPreprocessor());
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [currentPipeline, setCurrentPipeline] = useState<DataStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedStatColumn, setSelectedStatColumn] = useState<string | null>(null);
  const [useValidationSplit, setUseValidationSplit] = useState(true);
  const [trainSplit, setTrainSplit] = useState(0.7);
  const [validationSplit, setValidationSplit] = useState(0.15);
  const [testSplit, setTestSplit] = useState(0.15);
  const stepKeys = [
    { key: "load", label: "Load data" },
    { key: "missing", label: "Drop missing values" },
    { key: "normalize", label: "Normalize (min–max)" },
    { key: "encode", label: "One‑hot encode categoricals" },
    { key: "split", label: "Split: train/val/test" },
    { key: "tensors", label: "Convert to tensors" },
    { key: "reqUploadUrl", label: "Request upload URL" },
    { key: "uploadFile", label: "Upload file to storage" },
    { key: "createDataset", label: "Create dataset record" },
  ] as const;
  type StepKey = typeof stepKeys[number]["key"];
  const [stepStatus, setStepStatus] = useState<Record<StepKey, "pending" | "in_progress" | "completed">>(
    () => stepKeys.reduce((acc, s) => ({ ...acc, [s.key]: "pending" }), {} as any)
  );
  const completedCount = Object.values(stepStatus).filter((s) => s === "completed").length;
  const progressPct = Math.round((completedCount / stepKeys.length) * 100);
  const markStep = (key: StepKey, status: "pending" | "in_progress" | "completed") =>
    setStepStatus((prev) => ({ ...prev, [key]: status }));

  // Convex queries and mutations
  const datasets = useQuery(api.datasets.getMyDatasets);
  // Temporarily commented out while Convex is deploying
  const pipelines = useQuery(api.transformationPipelines.getMyPipelines);
  const downloadUrl = useQuery(api.datasets.getDatasetDownloadUrl, selectedDataset ? ({ datasetId: selectedDataset } as any) : ("skip" as any));
  const createDataset = useMutation(api.datasets.createDataset);
  const deleteDataset = useMutation(api.datasets.deleteDataset);
  const createPipeline = useMutation(api.transformationPipelines.createPipeline);
  const updatePipeline = useMutation(api.transformationPipelines.updatePipeline);
  const generateUploadUrl = useMutation(api.datasets.generateUploadUrl);
  const createVersion = useMutation(api.datasetVersions.createVersion);
  const convexCurrentUser = useQuery(api.users.getCurrentUser);
  const upsertUser = useMutation(api.users.upsertUser);
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const fileType = getFileType(file);
    
    console.log("Processing file:", file.name, "Type:", fileType, "Size:", file.size);
    
    try {
      setIsProcessing(true);
      // reset progress
      setStepStatus(stepKeys.reduce((acc, s) => ({ ...acc, [s.key]: "pending" }), {} as any));

      // Ensure Convex user exists before dataset ops
      if (isClerkLoaded && clerkUser && !convexCurrentUser) {
        await upsertUser({
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          firstName: clerkUser.firstName || undefined,
          lastName: clerkUser.lastName || undefined,
        });
      }
      
      // Load and process the file
      console.log("Loading data...");
      markStep("load", "in_progress");
      await preprocessor.loadData(file, fileType);
      markStep("load", "completed");
      console.log("Data loaded successfully");
      
      // Auto-detect and apply basic preprocessing
      if (fileType === 'csv') {
        console.log("Applying CSV preprocessing...");
        markStep("missing", "in_progress");
        preprocessor.handleMissingValues('drop_rows');
        markStep("missing", "completed");
        markStep("normalize", "in_progress");
        preprocessor.normalizeData('minmax');
        markStep("normalize", "completed");
        markStep("encode", "in_progress");
        preprocessor.encodeCategorical('onehot');
        markStep("encode", "completed");
        markStep("split", "in_progress");
        preprocessor.splitData({ train: 0.7, validation: 0.15, test: 0.15 });
        markStep("split", "completed");
        
        console.log("Converting to tensors...");
        markStep("tensors", "in_progress");
        const processed = preprocessor.convertToTensors();
        setProcessedData(processed);
        setCurrentPipeline(preprocessor.getSteps());
        markStep("tensors", "completed");
        console.log("Preprocessing completed successfully");
      }
      
      // Upload file to Convex storage
      console.log("Requesting upload URL...");
      markStep("reqUploadUrl", "in_progress");
      const uploadUrl = await generateUploadUrl();
      markStep("reqUploadUrl", "completed");
      markStep("uploadFile", "in_progress");
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      const { storageId } = await res.json();
      markStep("uploadFile", "completed");

      // Save dataset metadata referencing storage
      console.log("Saving dataset metadata...");
      markStep("createDataset", "in_progress");
      const datasetId = await createDataset({
        name: file.name,
        description: `Uploaded ${fileType} file`,
        type: getDatasetType(fileType),
        size: file.size,
        format: fileType,
        fileStorageId: storageId,
        rowCount: fileType === 'csv' ? 1000 : undefined,
        columnCount: fileType === 'csv' ? 10 : undefined,
        isPublic: false,
      });
      markStep("createDataset", "completed");

      console.log("Dataset saved with ID:", datasetId);
      setShowUploadModal(false);
      setSelectedDataset(datasetId);
      setActiveView("preprocessing");
      
    } catch (error) {
      console.error("Detailed error processing file:", error);
      // If dataset creation failed, reset that step so UI doesn't hang
      markStep("createDataset", "pending");
      
      // Provide more specific error messages
      let errorMessage = "Error processing file. ";
      
      if (error instanceof Error) {
        if (error.message.includes('Data must be split')) {
          errorMessage += "Please ensure your CSV has at least 2 columns (features + target).";
        } else if (error.message.includes('parse')) {
          errorMessage += "Please check your CSV format - ensure it has headers and consistent commas.";
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += "Unknown error occurred. Check console for details.";
      }
      
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [createDataset, preprocessor]);

  // Auto-load dataset from storage when selected
  const handleLoadSelectedDataset = useCallback(async () => {
    if (!selectedDataset || !downloadUrl) return;
    const ds = datasets?.find(d => d._id === selectedDataset);
    if (!ds) return;
    try {
      setIsProcessing(true);
      const resp = await fetch(downloadUrl);
      const blob = await resp.blob();
      const file = new File([blob], ds.name, { type: blob.type });
      const fileType = getFileType(file);
      await preprocessor.loadData(file, fileType);
      setCurrentPipeline(preprocessor.getSteps());
      setProcessedData(null);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedDataset, downloadUrl, datasets, preprocessor]);

  // Load when switching to preprocessing or when url ready
  useEffect(() => {
    if (activeView === "preprocessing") {
      handleLoadSelectedDataset();
    }
  }, [activeView, handleLoadSelectedDataset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'audio/*': ['.wav', '.mp3', '.flac'],
    },
    multiple: false
  });

  const getFileType = (file: File): 'csv' | 'json' | 'image' | 'audio' => {
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) return 'csv';
    if (file.type === 'application/json' || file.name.endsWith('.json')) return 'json';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'csv';
  };

  const getDatasetType = (fileType: string): 'tabular' | 'image' | 'audio' | 'text' => {
    if (fileType === 'csv' || fileType === 'json') return 'tabular';
    if (fileType === 'image') return 'image';
    if (fileType === 'audio') return 'audio';
    return 'text';
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "tabular":
        return <FileText size={20} className="text-blue-400" />;
      case "image":
        return <Image size={20} className="text-green-400" />;
      case "audio":
        return <Music size={20} className="text-purple-400" />;
      case "text":
        return <FileText size={20} className="text-orange-400" />;
      default:
        return <Database size={20} className="text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredDatasets = datasets?.filter(dataset =>
    dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dataset.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSavePipeline = async () => {
    if (!selectedDataset || !currentPipeline.length) return;

    try {
      const name = `Pipeline ${new Date().toLocaleString()}`;
      await createPipeline({
        name,
        description: "Saved from preprocessing modal",
        datasetId: selectedDataset as any,
        steps: currentPipeline as any,
      });
      alert("Pipeline saved.");
    } catch (error) {
      console.error("Error saving pipeline:", error);
      alert("Error saving pipeline. Please try again.");
    }
  };

  const handleStartTraining = () => {
    if (!processedData) {
      alert("Please process data first");
      return;
    }
    
    // Here you would send the processed data to Google Colab
    // For now, just show a success message
    alert("Data ready for training! Redirecting to model builder...");
  };

  const columns = preprocessor.getColumns();
  const stats = columns.length ? preprocessor.computeColumnStats() : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Management</h1>
          <p className="text-ml-dark-400">Upload, preprocess, and prepare your datasets for training</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreprocessingModal(true)}
            disabled={!selectedDataset}
            className="flex items-center gap-2 px-4 py-2 bg-ml-dark-200 text-ml-dark-400 rounded-md hover:bg-ml-dark-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Settings size={20} />
            Preprocessing
          </button>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-ml-blue-50 text-white rounded-md hover:bg-ml-blue-100 transition-colors"
          >
            <Plus size={20} />
            Upload Dataset
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-ml-dark-200 p-1 rounded-lg">
        <button
          onClick={() => setActiveView("datasets")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === "datasets"
              ? "bg-ml-dark-100 text-white"
              : "text-ml-dark-400 hover:text-white"
          }`}
        >
          Datasets
        </button>
        <button
          onClick={() => setActiveView("preprocessing")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === "preprocessing"
              ? "bg-ml-dark-100 text-white"
              : "text-ml-dark-400 hover:text-white"
          }`}
        >
          Preprocessing
        </button>
        <button
          onClick={() => setActiveView("pipelines")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === "pipelines"
              ? "bg-ml-dark-100 text-white"
              : "text-ml-dark-400 hover:text-white"
          }`}
        >
          Pipelines
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ml-dark-400" />
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-ml-dark-100 border border-ml-dark-300 rounded-md text-white placeholder-ml-dark-400 focus:outline-none focus:ring-2 focus:ring-ml-blue-50"
          />
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-ml-dark-200 text-ml-dark-400 rounded-md hover:bg-ml-dark-300 hover:text-white transition-colors">
          <Filter size={20} />
          Filter
        </button>
      </div>

      {/* Content */}
      {activeView === "datasets" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDatasets.map((dataset) => (
            <div
              key={dataset._id}
              className={`bg-ml-dark-100 border rounded-lg p-4 transition-colors cursor-pointer ${
                selectedDataset === dataset._id 
                  ? "border-ml-blue-50 bg-ml-blue-50/10" 
                  : "border-ml-dark-300 hover:border-ml-dark-400"
              }`}
              onClick={() => router.push(`/datasets/${dataset._id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                {getFileIcon(dataset.type)}
                <div className="flex items-center gap-2">
                  <button className="p-1 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded">
                    <Eye size={16} />
                  </button>
                  <button className="p-1 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded">
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-ml-dark-200 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDataset({ datasetId: dataset._id });
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="font-semibold text-white mb-2">{dataset.name}</h3>
              {dataset.description && (
                <p className="text-sm text-ml-dark-400 mb-3 line-clamp-2">
                  {dataset.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-ml-dark-400">
                <span>{formatFileSize(dataset.size)}</span>
                <span>{dataset.type}</span>
              </div>
              
              {dataset.rowCount && dataset.columnCount && (
                <div className="mt-2 text-xs text-ml-dark-400">
                  {dataset.rowCount.toLocaleString()} rows × {dataset.columnCount} columns
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeView === "preprocessing" && (
        <div className="space-y-6">
          {selectedDataset ? (
            <>
              {/* Dataset Info */}
              <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Selected Dataset</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-ml-dark-400">Name</p>
                    <p className="text-white font-medium">
                      {datasets?.find(d => d._id === selectedDataset)?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-ml-dark-400">Type</p>
                    <p className="text-white font-medium">
                      {datasets?.find(d => d._id === selectedDataset)?.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-ml-dark-400">Size</p>
                    <p className="text-white font-medium">
                      {formatFileSize(datasets?.find(d => d._id === selectedDataset)?.size || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preprocessing Pipeline */}
              <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Preprocessing Pipeline</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSavePipeline}
                      className="flex items-center gap-2 px-3 py-2 bg-ml-dark-200 text-white rounded-md hover:bg-ml-dark-300 transition-colors"
                    >
                      <Save size={16} />
                      Save Pipeline
                    </button>
                    <button
                      onClick={async () => {
                        if (!selectedDataset) return;
                        const name = `Version ${new Date().toLocaleString()}`;
                        const statsPayload = stats;
                        await createVersion({
                          datasetId: selectedDataset as any,
                          name,
                          description: "Snapshot of preprocessing steps and stats",
                          steps: currentPipeline as any,
                          stats: statsPayload as any,
                        });
                        alert("Version saved.");
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-ml-dark-200 text-white rounded-md hover:bg-ml-dark-300 transition-colors"
                    >
                      <Save size={16} />
                      Save Version
                    </button>
                    <button
                      onClick={handleStartTraining}
                      disabled={!processedData}
                      className="flex items-center gap-2 px-3 py-2 bg-ml-blue-50 text-white rounded-md hover:bg-ml-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play size={16} />
                      Start Training
                    </button>
                  </div>
                </div>

                {/* Column selector */}
                {columns.length > 0 && (
                  <div className="bg-ml-dark-200 border border-ml-dark-300 rounded-md p-4 mb-4">
                    <h4 className="text-white font-medium mb-2">Select Columns</h4>
                    <div className="flex flex-wrap gap-2">
                      {columns.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setSelectedColumns((prev) => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
                          }}
                          className={`px-2 py-1 rounded text-xs ${selectedColumns.includes(c) ? 'bg-ml-blue-50 text-white' : 'bg-ml-dark-300 text-ml-dark-400 hover:text-white'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => { preprocessor.normalizeData('minmax', selectedColumns); setCurrentPipeline(preprocessor.getSteps()); }} className="px-3 py-1 bg-ml-dark-300 text-white rounded hover:bg-ml-dark-400">Normalize (MinMax)</button>
                      <button onClick={() => { preprocessor.normalizeData('zscore', selectedColumns); setCurrentPipeline(preprocessor.getSteps()); }} className="px-3 py-1 bg-ml-dark-300 text-white rounded hover:bg-ml-dark-400">Normalize (Z-Score)</button>
                      <button onClick={() => { preprocessor.encodeCategorical('onehot', selectedColumns); setCurrentPipeline(preprocessor.getSteps()); }} className="px-3 py-1 bg-ml-dark-300 text-white rounded hover:bg-ml-dark-400">One-Hot Encode</button>
                      <button onClick={() => { preprocessor.encodeCategorical('label', selectedColumns); setCurrentPipeline(preprocessor.getSteps()); }} className="px-3 py-1 bg-ml-dark-300 text-white rounded hover:bg-ml-dark-400">Label Encode</button>
                    </div>
                  </div>
                )}

                {/* Split Controls */}
                <div className="bg-ml-dark-200 border border-ml-dark-300 rounded-md p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Train/Validation/Test Split</h4>
                    <label className="flex items-center gap-2 text-sm text-ml-dark-400">
                      <input type="checkbox" checked={useValidationSplit} onChange={(e) => setUseValidationSplit(e.target.checked)} />
                      Use validation set
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-ml-dark-400 mb-1">Train %</label>
                      <input type="number" min={0} max={100} value={Math.round(trainSplit*100)} onChange={(e) => setTrainSplit(Math.max(0, Math.min(1, Number(e.target.value)/100)))} className="w-full px-2 py-1 bg-ml-dark-300 text-white rounded" />
                    </div>
                    {useValidationSplit && (
                      <div>
                        <label className="block text-xs text-ml-dark-400 mb-1">Validation %</label>
                        <input type="number" min={0} max={100} value={Math.round(validationSplit*100)} onChange={(e) => setValidationSplit(Math.max(0, Math.min(1, Number(e.target.value)/100)))} className="w-full px-2 py-1 bg-ml-dark-300 text-white rounded" />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-ml-dark-400 mb-1">Test %</label>
                      <input type="number" min={0} max={100} value={Math.round(testSplit*100)} onChange={(e) => setTestSplit(Math.max(0, Math.min(1, Number(e.target.value)/100)))} className="w-full px-2 py-1 bg-ml-dark-300 text-white rounded" />
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => {
                        const total = trainSplit + (useValidationSplit ? validationSplit : 0) + testSplit;
                        if (Math.abs(total - 1) > 0.001) {
                          alert("Splits must sum to 100%.");
                          return;
                        }
                        preprocessor.splitData({ train: trainSplit, validation: useValidationSplit ? validationSplit : 0, test: testSplit });
                        setCurrentPipeline(preprocessor.getSteps());
                      }}
                      className="px-3 py-1 bg-ml-dark-300 text-white rounded hover:bg-ml-dark-400"
                    >
                      Apply Split
                    </button>
                  </div>
                </div>

                {/* Clip Outliers */}
                <div className="bg-ml-dark-200 border border-ml-dark-300 rounded-md p-4 mb-4">
                  <h4 className="text-white font-medium mb-2">Clip Outliers</h4>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { preprocessor.clipOutliers({ method: 'iqr' }); setCurrentPipeline(preprocessor.getSteps()); }} className="px-3 py-1 bg-ml-dark-300 text-white rounded hover:bg-ml-dark-400">IQR</button>
                    <button onClick={() => { preprocessor.clipOutliers({ method: 'percentile', lowerPercentile: 1, upperPercentile: 99 }); setCurrentPipeline(preprocessor.getSteps()); }} className="px-3 py-1 bg-ml-dark-300 text-white rounded hover:bg-ml-dark-400">Percentile 1–99</button>
                  </div>
                </div>

                {currentPipeline.length > 0 ? (
                  <div className="space-y-3">
                    {currentPipeline.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3 p-3 bg-ml-dark-200 rounded-md">
                        <div className="w-8 h-8 bg-ml-blue-50 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium capitalize">
                            {step.type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-ml-dark-400">
                            {JSON.stringify(step.parameters)}
                          </p>
                        </div>
                        <CheckCircle size={20} className="text-green-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-ml-dark-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings size={24} className="text-ml-dark-400" />
                    </div>
                    <p className="text-ml-dark-400">No preprocessing steps applied</p>
                    <p className="text-sm text-ml-dark-400 mt-2">
                      Upload a dataset to begin preprocessing
                    </p>
                  </div>
                )}
              </div>

              {/* New Data Workbench */}
              {columns.length > 0 && (
                <DataWorkbench columns={columns} getPreview={(n?: number) => preprocessor.getTabularPreview(n)} stats={stats} />
              )}

              {/* Histogram */}
              {columns.length > 0 && (
                <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">Histogram</h3>
                    <select
                      value={selectedStatColumn || ""}
                      onChange={(e) => setSelectedStatColumn(e.target.value || null)}
                      className="bg-ml-dark-200 border border-ml-dark-300 text-white text-sm rounded px-2 py-1"
                    >
                      <option value="">Select numeric column</option>
                      {stats.filter(s => s.type === 'numeric').map(s => (
                        <option key={s.column} value={s.column}>{s.column}</option>
                      ))}
                    </select>
                  </div>
                  {selectedStatColumn ? (
                    (() => {
                      const values = preprocessor.getNumericColumnValues(selectedStatColumn!);
                      const { bins, counts } = DataVisualizer.createHistogram(values, 20);
                      const data = bins.map((b, i) => ({ bin: Number((b as number).toFixed(2)), count: counts[i] }));
                      return (
                        <div style={{ width: '100%', height: 240 }} className="flex items-center justify-center bg-ml-dark-200 rounded-lg">
                          <div className="text-center">
                            <div className="text-white text-sm">Histogram Chart</div>
                            <div className="text-ml-dark-400 text-xs">{data.length} data points</div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-ml-dark-400 text-sm">Select a numeric column to view its distribution.</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-ml-dark-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database size={24} className="text-ml-dark-400" />
              </div>
              <p className="text-ml-dark-400">No dataset selected</p>
              <p className="text-sm text-ml-dark-400 mt-2">
                Select a dataset from the Datasets tab to begin preprocessing
              </p>
            </div>
          )}
        </div>
      )}

      {activeView === "pipelines" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Saved Pipelines</h3>
            <button
              onClick={() => setShowPreprocessingModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-ml-blue-50 text-white rounded-md hover:bg-ml-blue-100 transition-colors"
            >
              <Plus size={20} />
              Create Pipeline
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(pipelines || []).map((p: any) => (
              <div key={p._id} className="bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold">{p.name}</h4>
                  <span className="text-xs text-ml-dark-400">{new Date(p.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm text-ml-dark-400 mb-3">{p.description || ""}</p>
                <div className="text-xs text-ml-dark-400">Steps: {p.steps?.length || 0}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Upload Dataset</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-ml-blue-50 bg-ml-blue-50/10"
                  : "border-ml-dark-300 hover:border-ml-dark-400"
              }`}
            >
              <input {...getInputProps()} />
              {isProcessing ? (
                <div className="space-y-5 text-left">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">Processing dataset...</p>
                      <p className="text-ml-dark-400 text-sm">{progressPct}%</p>
                    </div>
                    <div className="w-full h-2 bg-ml-dark-300 rounded">
                      <div className="h-2 bg-ml-blue-50 rounded" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {stepKeys.map(({ key, label }) => {
                      const status = stepStatus[key];
                      const isDone = status === "completed";
                      const isActive = status === "in_progress";
                      return (
                        <div key={key} className={`flex items-center gap-2 ${isDone ? 'text-green-400' : isActive ? 'text-white' : 'text-ml-dark-400'}`}>
                          {isDone ? <CheckCircle size={16} /> : <Circle size={16} />}
                          <span className={`${isDone ? 'font-medium' : ''}`}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={48} className="mx-auto text-ml-dark-400 mb-4" />
                  {isDragActive ? (
                    <p className="text-white">Drop the files here...</p>
                  ) : (
                    <div>
                      <p className="text-white mb-2">Drag & drop files here, or click to select</p>
                      <p className="text-sm text-ml-dark-400">
                        Supports CSV, JSON, images, and audio files
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-ml-dark-400 hover:text-white transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preprocessing Modal */}
      {showPreprocessingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Data Preprocessing</h3>
              <button
                onClick={() => setShowPreprocessingModal(false)}
                className="p-1 text-ml-dark-400 hover:text-white hover:bg-ml-dark-200 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="bg-ml-dark-200 p-4 rounded-md">
                <h4 className="font-medium text-white mb-3">Missing Values</h4>
                <div className="flex gap-2">
                  {['drop', 'mean', 'median', 'mode'].map((strategy) => (
                    <button
                      key={strategy}
                      onClick={() => {
                        preprocessor.handleMissingValues(strategy as any);
                        setCurrentPipeline(preprocessor.getSteps());
                      }}
                      className="px-3 py-1 bg-ml-dark-300 text-white rounded hover:bg-ml-dark-400 transition-colors"
                    >
                      {strategy}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-ml-dark-200 p-4 rounded-md">
                <h4 className="font-medium text-white mb-3">Normalization</h4>
                <div className="flex gap-2">
                  {['minmax', 'zscore', 'robust'].map((method) => (
                    <button
                      key={method}
                      onClick={() => {
                        preprocessor.normalizeData(method as any);
                        setCurrentPipeline(preprocessor.getSteps());
                      }}
                      className="px-3 py-1 bg-ml-dark-300 text-white rounded hover:bg-ml-dark-400 transition-colors"
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-ml-dark-200 p-4 rounded-md">
                <h4 className="font-medium text-white mb-3">Categorical Encoding</h4>
                <div className="flex gap-2">
                  {['onehot', 'label', 'target'].map((method) => (
                    <button
                      key={method}
                      onClick={() => {
                        preprocessor.encodeCategorical(method as any);
                        setCurrentPipeline(preprocessor.getSteps());
                      }}
                      className="px-3 py-1 bg-ml-dark-300 text-white rounded hover:bg-ml-dark-400 transition-colors"
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-ml-dark-200 p-4 rounded-md">
                <h4 className="font-medium text-white mb-3">Data Split</h4>
                <div className="flex gap-2">
                  {[
                    { train: 0.7, validation: 0.15, test: 0.15 },
                    { train: 0.8, validation: 0.1, test: 0.1 },
                    { train: 0.6, validation: 0.2, test: 0.2 }
                  ].map((split, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        preprocessor.splitData(split);
                        setCurrentPipeline(preprocessor.getSteps());
                      }}
                      className="px-3 py-1 bg-ml-dark-300 text-white rounded hover:bg-ml-dark-400 transition-colors"
                    >
                      {split.train * 100}% / {split.validation * 100}% / {split.test * 100}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-ml-dark-200 p-4 rounded-md">
                <h4 className="font-medium text-white mb-3">Convert to Tensors</h4>
                <button
                  onClick={() => {
                    try {
                      const processed = preprocessor.convertToTensors();
                      setProcessedData(processed);
                      setCurrentPipeline(preprocessor.getSteps());
                      setShowPreprocessingModal(false);
                    } catch (error) {
                      alert("Please complete data splitting first");
                    }
                  }}
                  className="px-4 py-2 bg-ml-blue-50 text-white rounded hover:bg-ml-blue-100 transition-colors"
                >
                  Convert to Training Format
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
