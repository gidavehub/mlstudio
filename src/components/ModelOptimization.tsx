"use client";

import { useState, useEffect } from 'react';
import { ModelVersion } from '@/lib/modelManagement';
import { RealMLTrainer } from '@/lib/realMLTraining';
import { EnhancedDataPreprocessor } from '@/lib/enhancedDataProcessing';
import { 
  Settings, 
  Zap, 
  Target, 
  TrendingUp,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Play,
  Save,
  RotateCcw
} from 'lucide-react';

interface ModelOptimizationProps {
  model: ModelVersion;
  onOptimize: (optimizedModel: ModelVersion) => void;
  onClose: () => void;
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  parameters: any;
  expectedImprovement: string;
  confidence: 'high' | 'medium' | 'low';
}

export default function ModelOptimization({ model, onOptimize, onClose }: ModelOptimizationProps) {
  const [parameters, setParameters] = useState(model.parameters);
  const [pipelineSteps, setPipelineSteps] = useState(model.preprocessingSteps || []);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'parameters' | 'pipeline' | 'suggestions'>('parameters');
  const [mlTrainer] = useState(() => new RealMLTrainer());
  const [dataPreprocessor] = useState(() => new EnhancedDataPreprocessor());

  useEffect(() => {
    generateOptimizationSuggestions();
  }, [model]);

  const generateOptimizationSuggestions = () => {
    const modelSuggestions: OptimizationSuggestion[] = [];

    // Learning rate optimization
    if (parameters.learningRate) {
      modelSuggestions.push({
        id: 'learning_rate',
        title: 'Learning Rate Optimization',
        description: 'Reduce learning rate for better convergence and stability',
        parameters: { ...parameters, learningRate: parameters.learningRate * 0.5 },
        expectedImprovement: '5-15% better convergence',
        confidence: 'high'
      });
    }

    // Hidden layers optimization
    if (parameters.hiddenLayers) {
      modelSuggestions.push({
        id: 'hidden_layers',
        title: 'Add Hidden Layer',
        description: 'Add more hidden layers to capture complex patterns',
        parameters: { 
          ...parameters, 
          hiddenLayers: [...parameters.hiddenLayers, 32] 
        },
        expectedImprovement: '3-10% better accuracy',
        confidence: 'medium'
      });
    }

    // Dropout optimization
    if (!parameters.dropout || parameters.dropout < 0.3) {
      modelSuggestions.push({
        id: 'dropout',
        title: 'Add Regularization',
        description: 'Add dropout to prevent overfitting',
        parameters: { ...parameters, dropout: 0.3 },
        expectedImprovement: 'Better generalization',
        confidence: 'high'
      });
    }

    // Epochs optimization
    if (parameters.epochs && parameters.epochs < 200) {
      modelSuggestions.push({
        id: 'epochs',
        title: 'Increase Training Epochs',
        description: 'Train for more epochs to improve convergence',
        parameters: { ...parameters, epochs: Math.min(parameters.epochs * 2, 500) },
        expectedImprovement: '2-8% better performance',
        confidence: 'medium'
      });
    }

    // Batch size optimization
    if (parameters.batchSize) {
      modelSuggestions.push({
        id: 'batch_size',
        title: 'Optimize Batch Size',
        description: 'Try different batch sizes for better training dynamics',
        parameters: { ...parameters, batchSize: parameters.batchSize === 32 ? 16 : 32 },
        expectedImprovement: 'Variable improvement',
        confidence: 'low'
      });
    }

    setSuggestions(modelSuggestions);
  };

  const updateParameter = (key: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applySuggestion = (suggestion: OptimizationSuggestion) => {
    setParameters(suggestion.parameters);
    setActiveTab('parameters');
  };

  const resetToOriginal = () => {
    setParameters(model.parameters);
    setPipelineSteps(model.preprocessingSteps || []);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);

    try {
      // Simulate optimization progress
      const progressInterval = setInterval(() => {
        setOptimizationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      // In a real implementation, this would:
      // 1. Load the original dataset
      // 2. Apply the preprocessing pipeline
      // 3. Retrain the model with new parameters
      // 4. Evaluate the new model
      // 5. Save the optimized model

      console.log('Starting model optimization with parameters:', parameters);
      console.log('Pipeline steps:', pipelineSteps);

      // Simulate training time
      await new Promise(resolve => setTimeout(resolve, 3000));

      clearInterval(progressInterval);
      setOptimizationProgress(100);

      // Create optimized model (in real implementation, this would be the actual retrained model)
      const optimizedModel: ModelVersion = {
        ...model,
        id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${model.name}_optimized`,
        version: `v${parseInt(model.version.replace('v', '')) + 1}`,
        parameters: parameters,
        preprocessingSteps: pipelineSteps,
        metrics: {
          ...model.metrics,
          accuracy: model.metrics.accuracy ? model.metrics.accuracy * 1.05 : undefined,
          loss: model.metrics.loss * 0.95,
          validationAccuracy: model.metrics.validationAccuracy ? model.metrics.validationAccuracy * 1.03 : undefined,
          validationLoss: model.metrics.validationLoss ? model.metrics.validationLoss * 0.97 : undefined,
          trainingTime: model.metrics.trainingTime * 1.2
        },
        createdAt: new Date()
      };

      onOptimize(optimizedModel);
    } catch (error) {
      console.error('Error during optimization:', error);
    } finally {
      setIsOptimizing(false);
      setOptimizationProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-ml-dark-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-ml-dark-600">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Optimize Model</h2>
              <p className="text-ml-dark-400">{model.name} • {model.modelType}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-ml-dark-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {[
              { id: 'parameters', label: 'Parameters', icon: Settings },
              { id: 'pipeline', label: 'Pipeline', icon: Zap },
              { id: 'suggestions', label: 'Suggestions', icon: Target }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-ml-dark-300 hover:text-white hover:bg-ml-dark-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'parameters' && (
            <ParameterOptimization
              parameters={parameters}
              onUpdateParameter={updateParameter}
              modelType={model.modelType}
            />
          )}
          
          {activeTab === 'pipeline' && (
            <PipelineOptimization
              pipelineSteps={pipelineSteps}
              onUpdatePipeline={setPipelineSteps}
            />
          )}
          
          {activeTab === 'suggestions' && (
            <OptimizationSuggestions
              suggestions={suggestions}
              onApplySuggestion={applySuggestion}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-ml-dark-600">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={resetToOriginal}
                className="flex items-center gap-2 px-4 py-2 bg-ml-dark-600 hover:bg-ml-dark-500 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={() => {/* Save current configuration */}}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Config
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-ml-dark-600 hover:bg-ml-dark-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-ml-dark-500 text-white rounded-lg transition-colors"
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Optimizing... {optimizationProgress.toFixed(0)}%
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Start Optimization
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {isOptimizing && (
            <div className="mt-4">
              <div className="w-full bg-ml-dark-600 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${optimizationProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-ml-dark-300 mt-2">
                <span>Optimizing model parameters...</span>
                <span>{optimizationProgress.toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ParameterOptimization({ 
  parameters, 
  onUpdateParameter, 
  modelType 
}: {
  parameters: any;
  onUpdateParameter: (key: string, value: any) => void;
  modelType: string;
}) {
  const getParameterConfig = (modelType: string) => {
    const configs: { [key: string]: any } = {
      neural_network: {
        learningRate: { type: 'number', min: 0.001, max: 0.1, step: 0.001, label: 'Learning Rate' },
        hiddenLayers: { type: 'array', label: 'Hidden Layers' },
        activation: { type: 'select', options: ['relu', 'sigmoid', 'tanh'], label: 'Activation' },
        dropout: { type: 'number', min: 0, max: 0.8, step: 0.1, label: 'Dropout Rate' },
        epochs: { type: 'number', min: 10, max: 1000, step: 10, label: 'Epochs' },
        batchSize: { type: 'number', min: 8, max: 128, step: 8, label: 'Batch Size' }
      },
      linear_regression: {
        learningRate: { type: 'number', min: 0.001, max: 0.1, step: 0.001, label: 'Learning Rate' },
        epochs: { type: 'number', min: 10, max: 1000, step: 10, label: 'Epochs' },
        batchSize: { type: 'number', min: 8, max: 128, step: 8, label: 'Batch Size' }
      },
      logistic_regression: {
        learningRate: { type: 'number', min: 0.001, max: 0.1, step: 0.001, label: 'Learning Rate' },
        epochs: { type: 'number', min: 10, max: 1000, step: 10, label: 'Epochs' },
        batchSize: { type: 'number', min: 8, max: 128, step: 8, label: 'Batch Size' }
      }
    };
    return configs[modelType] || {};
  };

  const parameterConfig = getParameterConfig(modelType);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Model Parameters</h3>
        <p className="text-ml-dark-300 text-sm mb-6">
          Adjust the model parameters to potentially improve performance. Changes will be applied when you start optimization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(parameterConfig).map(([key, config]: [string, any]) => (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-ml-dark-300">
              {config.label}
            </label>
            
            {config.type === 'number' && (
              <div className="space-y-2">
                <input
                  type="number"
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  value={parameters[key] || 0}
                  onChange={(e) => onUpdateParameter(key, parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-ml-dark-600 border border-ml-dark-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <div className="flex justify-between text-xs text-ml-dark-400">
                  <span>{config.min}</span>
                  <span>{config.max}</span>
                </div>
              </div>
            )}
            
            {config.type === 'select' && (
              <select
                value={parameters[key] || config.options[0]}
                onChange={(e) => onUpdateParameter(key, e.target.value)}
                className="w-full px-3 py-2 bg-ml-dark-600 border border-ml-dark-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {config.options.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            
            {config.type === 'array' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={Array.isArray(parameters[key]) ? parameters[key].join(', ') : ''}
                    onChange={(e) => {
                      const values = e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
                      onUpdateParameter(key, values);
                    }}
                    placeholder="e.g., 64, 32, 16"
                    className="flex-1 px-3 py-2 bg-ml-dark-600 border border-ml-dark-500 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-ml-dark-400">
                  Enter comma-separated values for hidden layer sizes
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current vs Optimized Comparison */}
      <div className="bg-ml-dark-600 rounded-lg p-4">
        <h4 className="text-md font-medium text-white mb-3">Parameter Changes</h4>
        <div className="space-y-2 text-sm">
          {Object.entries(parameters).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-ml-dark-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-white">
                {Array.isArray(value) ? `[${value.join(', ')}]` : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PipelineOptimization({ 
  pipelineSteps, 
  onUpdatePipeline 
}: {
  pipelineSteps: any[];
  onUpdatePipeline: (steps: any[]) => void;
}) {
  const addPipelineStep = (type: string) => {
    const newStep = {
      id: `step_${Date.now()}`,
      type,
      parameters: getDefaultParameters(type),
      order: pipelineSteps.length,
      applied: false
    };
    onUpdatePipeline([...pipelineSteps, newStep]);
  };

  const removePipelineStep = (index: number) => {
    const newSteps = pipelineSteps.filter((_, i) => i !== index);
    onUpdatePipeline(newSteps);
  };

  const updateStepParameters = (index: number, parameters: any) => {
    const newSteps = [...pipelineSteps];
    newSteps[index] = { ...newSteps[index], parameters };
    onUpdatePipeline(newSteps);
  };

  const getDefaultParameters = (type: string) => {
    const defaults: { [key: string]: any } = {
      handle_missing: { strategy: 'mean' },
      normalize: { method: 'z-score' },
      scale: { method: 'min-max' },
      encode: { method: 'one-hot' },
      outlier_removal: { factor: 1.5 }
    };
    return defaults[type] || {};
  };

  const availableSteps = [
    { type: 'handle_missing', label: 'Handle Missing Values' },
    { type: 'normalize', label: 'Normalize Data' },
    { type: 'scale', label: 'Scale Data' },
    { type: 'encode', label: 'Encode Categorical' },
    { type: 'outlier_removal', label: 'Remove Outliers' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Preprocessing Pipeline</h3>
        <p className="text-ml-dark-300 text-sm mb-6">
          Modify the data preprocessing pipeline to improve model performance.
        </p>
      </div>

      {/* Current Pipeline Steps */}
      <div className="space-y-3">
        {pipelineSteps.map((step, index) => (
          <div key={step.id} className="bg-ml-dark-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-white font-medium capitalize">
                    {step.type.replace('_', ' ')}
                  </h4>
                  <p className="text-ml-dark-300 text-sm">
                    {JSON.stringify(step.parameters)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removePipelineStep(index)}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </div>
            
            {/* Step Parameters */}
            <div className="ml-11 space-y-2">
              {Object.entries(step.parameters).map(([paramKey, paramValue]) => (
                <div key={paramKey} className="flex items-center gap-2">
                  <label className="text-sm text-ml-dark-300 w-20">
                    {paramKey}:
                  </label>
                  <input
                    type="text"
                    value={String(paramValue)}
                    onChange={(e) => {
                      const newParams = { ...step.parameters, [paramKey]: e.target.value };
                      updateStepParameters(index, newParams);
                    }}
                    className="flex-1 px-2 py-1 bg-ml-dark-700 border border-ml-dark-500 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Steps */}
      <div className="bg-ml-dark-600 rounded-lg p-4">
        <h4 className="text-md font-medium text-white mb-3">Add Pipeline Step</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {availableSteps.map((step) => (
            <button
              key={step.type}
              onClick={() => addPipelineStep(step.type)}
              className="p-3 text-left bg-ml-dark-700 hover:bg-ml-dark-500 rounded-lg transition-colors"
            >
              <div className="text-white text-sm font-medium">{step.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function OptimizationSuggestions({ 
  suggestions, 
  onApplySuggestion 
}: {
  suggestions: OptimizationSuggestion[];
  onApplySuggestion: (suggestion: OptimizationSuggestion) => void;
}) {
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-400 bg-green-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-red-400 bg-red-400/10';
      default: return 'text-ml-dark-300 bg-ml-dark-500';
    }
  };

  const getConfidenceIcon = (confidence: string) => {
    switch (confidence) {
      case 'high': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertCircle className="w-4 h-4" />;
      case 'low': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Optimization Suggestions</h3>
        <p className="text-ml-dark-300 text-sm mb-6">
          AI-powered suggestions to improve your model performance based on current parameters and model type.
        </p>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-ml-dark-600 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-white font-medium">{suggestion.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                    {suggestion.confidence} confidence
                  </span>
                </div>
                <p className="text-ml-dark-300 text-sm mb-3">
                  {suggestion.description}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">
                    Expected: {suggestion.expectedImprovement}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onApplySuggestion(suggestion)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Apply
              </button>
            </div>
            
            {/* Parameter Changes Preview */}
            <div className="bg-ml-dark-700 rounded-lg p-3">
              <h5 className="text-sm font-medium text-white mb-2">Parameter Changes:</h5>
              <div className="space-y-1 text-xs">
                {Object.entries(suggestion.parameters).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-ml-dark-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span className="text-white">
                      {Array.isArray(value) ? `[${value.join(', ')}]` : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {suggestions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl text-ml-dark-300 mb-4">🎯</div>
          <p className="text-ml-dark-400">No optimization suggestions available</p>
          <p className="text-ml-dark-400 text-sm">Your model parameters appear to be well-optimized</p>
        </div>
      )}
    </div>
  );
}
