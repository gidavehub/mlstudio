"use client";

import { useState, useEffect } from 'react';
import { ModelVersion } from '@/lib/modelManagement';
import { ModelTester } from '@/lib/modelTester';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock,
  Brain,
  Zap,
  CheckCircle,
  X,
  Maximize2,
  Download,
  Play,
  Award,
  Trophy
} from 'lucide-react';

interface ModelComparisonProps {
  models: ModelVersion[];
  onClose: () => void;
}

interface ComparisonResult {
  modelId: string;
  modelName: string;
  metrics: {
    accuracy?: number;
    loss: number;
    validationAccuracy?: number;
    validationLoss?: number;
    trainingTime: number;
    r2?: number;
    rmse?: number;
  };
  rank: number;
  score: number;
}

export default function ModelComparison({ models, onClose }: ModelComparisonProps) {
  const [selectedModels, setSelectedModels] = useState<ModelVersion[]>([]);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'charts' | 'details'>('overview');
  const [modelTester] = useState(() => new ModelTester());

  useEffect(() => {
    if (models.length > 0) {
      setSelectedModels(models.slice(0, Math.min(3, models.length)));
    }
  }, [models]);

  const toggleModelSelection = (model: ModelVersion) => {
    setSelectedModels(prev => {
      const isSelected = prev.some(m => m.id === model.id);
      if (isSelected) {
        return prev.filter(m => m.id !== model.id);
      } else if (prev.length < 5) {
        return [...prev, model];
      }
      return prev;
    });
  };

  const runComparison = async () => {
    if (selectedModels.length < 2) return;

    setIsComparing(true);
    try {
      // Simulate comparison process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Calculate comparison results
      const results: ComparisonResult[] = selectedModels.map((model, index) => {
        // Calculate a composite score based on multiple metrics
        const accuracyScore = model.metrics.accuracy ? model.metrics.accuracy * 100 : 0;
        const lossScore = Math.max(0, 100 - model.metrics.loss * 1000); // Convert loss to score
        const timeScore = Math.max(0, 100 - (model.metrics.trainingTime / 1000) * 10); // Time penalty
        const compositeScore = (accuracyScore + lossScore + timeScore) / 3;

        return {
          modelId: model.id,
          modelName: model.name,
          metrics: {
            accuracy: model.metrics.accuracy,
            loss: model.metrics.loss,
            validationAccuracy: model.metrics.validationAccuracy,
            validationLoss: model.metrics.validationLoss,
            trainingTime: model.metrics.trainingTime,
            r2: model.metrics.r2,
            rmse: model.metrics.rmse
          },
          rank: 0, // Will be set after sorting
          score: compositeScore
        };
      });

      // Sort by score and assign ranks
      results.sort((a, b) => b.score - a.score);
      results.forEach((result, index) => {
        result.rank = index + 1;
      });

      setComparisonResults(results);
    } catch (error) {
      console.error('Error during comparison:', error);
    } finally {
      setIsComparing(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2: return <Award className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-ml-dark-300 font-bold">{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'border-yellow-400 bg-yellow-400/10';
      case 2: return 'border-gray-400 bg-gray-400/10';
      case 3: return 'border-amber-600 bg-amber-600/10';
      default: return 'border-ml-dark-500 bg-ml-dark-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-ml-dark-700 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-ml-dark-600">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Model Comparison</h2>
              <p className="text-ml-dark-400">Compare performance across multiple models</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-ml-dark-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Model Selection */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white mb-3">Select Models to Compare</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {models.map((model) => {
                const isSelected = selectedModels.some(m => m.id === model.id);
                return (
                  <div
                    key={model.id}
                    onClick={() => toggleModelSelection(model)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-ml-dark-600 bg-ml-dark-600 hover:bg-ml-dark-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white text-sm">{model.name}</h4>
                      <span className="text-xs text-ml-dark-300 bg-ml-dark-500 px-2 py-1 rounded">
                        {model.modelType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-ml-dark-300">
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {model.metrics.accuracy ? `${(model.metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {model.metrics.loss.toFixed(4)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-ml-dark-400">
                {selectedModels.length} of {models.length} models selected (max 5)
              </p>
              <button
                onClick={runComparison}
                disabled={selectedModels.length < 2 || isComparing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-ml-dark-500 text-white rounded-lg transition-colors"
              >
                {isComparing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Comparing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    Compare Models
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          {comparisonResults.length > 0 && (
            <div className="flex gap-1">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'metrics', label: 'Metrics', icon: Target },
                { id: 'charts', label: 'Charts', icon: TrendingUp },
                { id: 'details', label: 'Details', icon: Brain }
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
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {comparisonResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-ml-dark-300 mb-4">⚖️</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Comparison Results</h3>
              <p className="text-ml-dark-400">
                Select at least 2 models and click "Compare Models" to see results
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <ComparisonOverview results={comparisonResults} getRankIcon={getRankIcon} getRankColor={getRankColor} />}
              {activeTab === 'metrics' && <ComparisonMetrics results={comparisonResults} />}
              {activeTab === 'charts' && <ComparisonCharts results={comparisonResults} />}
              {activeTab === 'details' && <ComparisonDetails results={comparisonResults} models={selectedModels} />}
            </>
          )}
        </div>

        {/* Footer */}
        {comparisonResults.length > 0 && (
          <div className="p-6 border-t border-ml-dark-600">
            <div className="flex items-center justify-between">
              <div className="text-sm text-ml-dark-300">
                Best performing model: <span className="text-white font-medium">{comparisonResults[0]?.modelName}</span>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  <Play className="w-4 h-4" />
                  Deploy Best Model
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ComparisonOverview({ 
  results, 
  getRankIcon, 
  getRankColor 
}: {
  results: ComparisonResult[];
  getRankIcon: (rank: number) => React.ReactNode;
  getRankColor: (rank: number) => string;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Comparison Overview</h3>
      
      {/* Ranking Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result) => (
          <div
            key={result.modelId}
            className={`p-4 rounded-lg border ${getRankColor(result.rank)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getRankIcon(result.rank)}
                <span className="text-white font-medium">#{result.rank}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{result.score.toFixed(1)}</div>
                <div className="text-xs text-ml-dark-300">Score</div>
              </div>
            </div>
            
            <h4 className="text-white font-medium mb-2">{result.modelName}</h4>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-ml-dark-300">Accuracy:</span>
                <span className="text-white">
                  {result.metrics.accuracy ? `${(result.metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ml-dark-300">Loss:</span>
                <span className="text-white">{result.metrics.loss.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ml-dark-300">Training Time:</span>
                <span className="text-white">{(result.metrics.trainingTime / 1000).toFixed(1)}s</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Summary */}
      <div className="bg-ml-dark-600 rounded-lg p-4">
        <h4 className="text-lg font-medium text-white mb-4">Performance Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {results[0]?.metrics.accuracy ? `${(results[0].metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
            </div>
            <div className="text-sm text-ml-dark-300">Best Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {Math.min(...results.map(r => r.metrics.loss)).toFixed(4)}
            </div>
            <div className="text-sm text-ml-dark-300">Lowest Loss</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {(Math.min(...results.map(r => r.metrics.trainingTime)) / 1000).toFixed(1)}s
            </div>
            <div className="text-sm text-ml-dark-300">Fastest Training</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonMetrics({ results }: { results: ComparisonResult[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Detailed Metrics Comparison</h3>
      
      <div className="bg-ml-dark-600 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-ml-dark-700">
            <tr>
              <th className="px-4 py-3 text-left text-white font-medium">Model</th>
              <th className="px-4 py-3 text-center text-white font-medium">Accuracy</th>
              <th className="px-4 py-3 text-center text-white font-medium">Loss</th>
              <th className="px-4 py-3 text-center text-white font-medium">Val. Accuracy</th>
              <th className="px-4 py-3 text-center text-white font-medium">Val. Loss</th>
              <th className="px-4 py-3 text-center text-white font-medium">Training Time</th>
              <th className="px-4 py-3 text-center text-white font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={result.modelId} className={index % 2 === 0 ? 'bg-ml-dark-600' : 'bg-ml-dark-500'}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">#{result.rank}</span>
                    <span className="text-white">{result.modelName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-white">
                  {result.metrics.accuracy ? `${(result.metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
                </td>
                <td className="px-4 py-3 text-center text-white">
                  {result.metrics.loss.toFixed(4)}
                </td>
                <td className="px-4 py-3 text-center text-white">
                  {result.metrics.validationAccuracy ? `${(result.metrics.validationAccuracy * 100).toFixed(1)}%` : 'N/A'}
                </td>
                <td className="px-4 py-3 text-center text-white">
                  {result.metrics.validationLoss ? result.metrics.validationLoss.toFixed(4) : 'N/A'}
                </td>
                <td className="px-4 py-3 text-center text-white">
                  {(result.metrics.trainingTime / 1000).toFixed(1)}s
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-white font-bold">{result.score.toFixed(1)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComparisonCharts({ results }: { results: ComparisonResult[] }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Performance Charts</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accuracy Comparison */}
        <div className="bg-ml-dark-600 rounded-lg p-4">
          <h4 className="text-lg font-medium text-white mb-4">Accuracy Comparison</h4>
          <div className="h-64 flex items-center justify-center text-ml-dark-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>Accuracy comparison chart would go here</p>
            </div>
          </div>
        </div>

        {/* Loss Comparison */}
        <div className="bg-ml-dark-600 rounded-lg p-4">
          <h4 className="text-lg font-medium text-white mb-4">Loss Comparison</h4>
          <div className="h-64 flex items-center justify-center text-ml-dark-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p>Loss comparison chart would go here</p>
            </div>
          </div>
        </div>

        {/* Training Time Comparison */}
        <div className="bg-ml-dark-600 rounded-lg p-4">
          <h4 className="text-lg font-medium text-white mb-4">Training Time Comparison</h4>
          <div className="h-64 flex items-center justify-center text-ml-dark-400">
            <div className="text-center">
              <div className="text-4xl mb-2">⏱️</div>
              <p>Training time comparison chart would go here</p>
            </div>
          </div>
        </div>

        {/* Score Comparison */}
        <div className="bg-ml-dark-600 rounded-lg p-4">
          <h4 className="text-lg font-medium text-white mb-4">Overall Score Comparison</h4>
          <div className="h-64 flex items-center justify-center text-ml-dark-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🏆</div>
              <p>Overall score comparison chart would go here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonDetails({ 
  results, 
  models 
}: {
  results: ComparisonResult[];
  models: ModelVersion[];
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Model Details</h3>
      
      <div className="space-y-4">
        {results.map((result) => {
          const model = models.find(m => m.id === result.modelId);
          if (!model) return null;

          return (
            <div key={result.modelId} className="bg-ml-dark-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-white">#{result.rank} {result.modelName}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ml-dark-300">Score:</span>
                  <span className="text-white font-bold">{result.score.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-md font-medium text-white mb-2">Model Configuration</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ml-dark-300">Type:</span>
                      <span className="text-white">{model.modelType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ml-dark-300">Created:</span>
                      <span className="text-white">{new Date(model.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ml-dark-300">Dataset ID:</span>
                      <span className="text-white font-mono text-xs">{model.datasetId}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-md font-medium text-white mb-2">Key Parameters</h5>
                  <div className="space-y-1 text-sm">
                    {Object.entries(model.parameters).slice(0, 3).map(([key, value]) => (
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
              
              {model.preprocessingSteps && model.preprocessingSteps.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-md font-medium text-white mb-2">Preprocessing Pipeline</h5>
                  <div className="flex flex-wrap gap-2">
                    {model.preprocessingSteps.map((step, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded"
                      >
                        {step.type.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
