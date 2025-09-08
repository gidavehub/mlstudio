"use client";

import { useState, useEffect } from 'react';
import { ModelVersion } from '@/lib/modelManagement';
import { ModelTester, VisualizationData } from '@/lib/modelTester';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Activity,
  Download,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ModelVisualizationProps {
  model: ModelVersion;
  testData?: {
    features: number[][];
    labels: number[];
    featureNames: string[];
  };
}

interface ChartProps {
  data: any[];
  title: string;
  xLabel: string;
  yLabel: string;
  color?: string;
}

export default function ModelVisualization({ model, testData }: ModelVisualizationProps) {
  const [visualizationData, setVisualizationData] = useState<VisualizationData | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [modelTester] = useState(() => new ModelTester());

  useEffect(() => {
    if (model && model.modelData?.trainingHistory) {
      generateVisualizationData();
    }
  }, [model]);

  const generateVisualizationData = async () => {
    setLoading(true);
    try {
      // Generate visualization data from training history
      const vizData = modelTester.generateVisualizationData(
        model.modelData?.trainingHistory || [],
        {
          predictions: [],
          actualValues: [],
          metrics: model.metrics
        } as any,
        ['Feature_1', 'Feature_2', 'Feature_3'] // Placeholder feature names
      );
      
      setVisualizationData(vizData);

      // If test data is available, run actual testing
      if (testData) {
        // Note: In a real implementation, you would load the actual model here
        console.log('Running model testing with provided test data');
        // const testResult = await modelTester.testModel(model, testData.features, testData.labels, model.modelType);
        // setTestResult(testResult);
      }
    } catch (error) {
      console.error('Error generating visualization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChartExpansion = (chartId: string) => {
    setExpandedChart(expandedChart === chartId ? null : chartId);
  };

  const exportChart = (chartId: string) => {
    // In a real implementation, this would export the chart as an image
    console.log(`Exporting chart: ${chartId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-ml-dark-300">Generating visualizations...</span>
      </div>
    );
  }

  if (!visualizationData) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl text-ml-dark-300 mb-4">📊</div>
        <p className="text-ml-dark-400">No visualization data available</p>
        <button
          onClick={generateVisualizationData}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Generate Visualizations
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Model Performance Visualization</h3>
        <div className="flex gap-2">
          <button
            onClick={generateVisualizationData}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Training Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loss Chart */}
        <ChartContainer
          title="Training Loss"
          chartId="loss"
          isExpanded={expandedChart === 'loss'}
          onToggle={() => toggleChartExpansion('loss')}
          onExport={() => exportChart('loss')}
        >
          <LossChart data={visualizationData.lossHistory} />
        </ChartContainer>

        {/* Accuracy Chart */}
        <ChartContainer
          title="Training Accuracy"
          chartId="accuracy"
          isExpanded={expandedChart === 'accuracy'}
          onToggle={() => toggleChartExpansion('accuracy')}
          onExport={() => exportChart('accuracy')}
        >
          <AccuracyChart data={visualizationData.accuracyHistory} />
        </ChartContainer>
      </div>

      {/* Model Performance Charts */}
      {testResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prediction Scatter Plot */}
          <ChartContainer
            title="Actual vs Predicted"
            chartId="scatter"
            isExpanded={expandedChart === 'scatter'}
            onToggle={() => toggleChartExpansion('scatter')}
            onExport={() => exportChart('scatter')}
          >
            <ScatterChart data={visualizationData.predictionScatter} />
          </ChartContainer>

          {/* Residual Plot */}
          <ChartContainer
            title="Residual Plot"
            chartId="residual"
            isExpanded={expandedChart === 'residual'}
            onToggle={() => toggleChartExpansion('residual')}
            onExport={() => exportChart('residual')}
          >
            <ResidualChart data={visualizationData.residualPlot} />
          </ChartContainer>
        </div>
      )}

      {/* Feature Importance */}
      <ChartContainer
        title="Feature Importance"
        chartId="importance"
        isExpanded={expandedChart === 'importance'}
        onToggle={() => toggleChartExpansion('importance')}
        onExport={() => exportChart('importance')}
      >
        <FeatureImportanceChart data={visualizationData.featureImportance} />
      </ChartContainer>

      {/* Model Metrics Summary */}
      <div className="bg-ml-dark-600 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Performance Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="R² Score"
            value={model.metrics.r2?.toFixed(4) || 'N/A'}
            icon={<Target className="w-5 h-5 text-green-400" />}
            description="Coefficient of determination"
          />
          <MetricCard
            title="RMSE"
            value={model.metrics.rmse?.toFixed(4) || 'N/A'}
            icon={<TrendingUp className="w-5 h-5 text-red-400" />}
            description="Root mean squared error"
          />
          <MetricCard
            title="Accuracy"
            value={model.metrics.accuracy ? `${(model.metrics.accuracy * 100).toFixed(1)}%` : 'N/A'}
            icon={<BarChart3 className="w-5 h-5 text-blue-400" />}
            description="Model accuracy"
          />
          <MetricCard
            title="Training Time"
            value={`${(model.metrics.trainingTime / 1000).toFixed(1)}s`}
            icon={<Activity className="w-5 h-5 text-purple-400" />}
            description="Time to train"
          />
        </div>
      </div>
    </div>
  );
}

function ChartContainer({ 
  title, 
  chartId, 
  isExpanded, 
  onToggle, 
  onExport, 
  children 
}: {
  title: string;
  chartId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onExport: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-ml-dark-600 rounded-lg p-4 ${isExpanded ? 'lg:col-span-2' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-white">{title}</h4>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="p-2 text-ml-dark-400 hover:text-white transition-colors"
            title="Export chart"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className="p-2 text-ml-dark-400 hover:text-white transition-colors"
            title={isExpanded ? "Minimize" : "Maximize"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className={`${isExpanded ? 'h-96' : 'h-64'} overflow-hidden`}>
        {children}
      </div>
    </div>
  );
}

function LossChart({ data }: { data: { epoch: number; loss: number; validationLoss?: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-ml-dark-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>No loss data available</p>
        </div>
      </div>
    );
  }

  const maxLoss = Math.max(...data.map(d => Math.max(d.loss, d.validationLoss || 0)));
  const minLoss = Math.min(...data.map(d => Math.min(d.loss, d.validationLoss || 0)));

  return (
    <div className="h-full relative">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <g key={i}>
            <line
              x1="40"
              y1={40 + ratio * 160}
              x2="380"
              y2={40 + ratio * 160}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.2"
            />
            <text
              x="35"
              y={45 + ratio * 160}
              textAnchor="end"
              className="text-xs fill-current opacity-60"
            >
              {(maxLoss - ratio * (maxLoss - minLoss)).toFixed(3)}
            </text>
          </g>
        ))}

        {/* Training loss line */}
        <polyline
          points={data.map((d, i) => 
            `${40 + (i / (data.length - 1)) * 340},${40 + ((maxLoss - d.loss) / (maxLoss - minLoss)) * 160}`
          ).join(' ')}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />

        {/* Validation loss line */}
        {data.some(d => d.validationLoss) && (
          <polyline
            points={data.map((d, i) => 
              `${40 + (i / (data.length - 1)) * 340},${40 + ((maxLoss - (d.validationLoss || 0)) / (maxLoss - minLoss)) * 160}`
            ).join(' ')}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        {/* Axes */}
        <line x1="40" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1" />
        <line x1="40" y1="40" x2="40" y2="200" stroke="currentColor" strokeWidth="1" />

        {/* Labels */}
        <text x="210" y="220" textAnchor="middle" className="text-sm fill-current opacity-80">
          Epoch
        </text>
        <text x="15" y="120" textAnchor="middle" className="text-sm fill-current opacity-80" transform="rotate(-90, 15, 120)">
          Loss
        </text>
      </svg>

      {/* Legend */}
      <div className="absolute top-2 right-2 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-blue-500"></div>
          <span className="text-ml-dark-300">Training</span>
        </div>
        {data.some(d => d.validationLoss) && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-red-500 border-dashed border-t border-red-500"></div>
            <span className="text-ml-dark-300">Validation</span>
          </div>
        )}
      </div>
    </div>
  );
}

function AccuracyChart({ data }: { data: { epoch: number; accuracy: number; validationAccuracy?: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-ml-dark-400">
        <div className="text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p>No accuracy data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <g key={i}>
            <line
              x1="40"
              y1={40 + ratio * 160}
              x2="380"
              y2={40 + ratio * 160}
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.2"
            />
            <text
              x="35"
              y={45 + ratio * 160}
              textAnchor="end"
              className="text-xs fill-current opacity-60"
            >
              {(ratio * 100).toFixed(0)}%
            </text>
          </g>
        ))}

        {/* Training accuracy line */}
        <polyline
          points={data.map((d, i) => 
            `${40 + (i / (data.length - 1)) * 340},${200 - d.accuracy * 160}`
          ).join(' ')}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
        />

        {/* Validation accuracy line */}
        {data.some(d => d.validationAccuracy) && (
          <polyline
            points={data.map((d, i) => 
              `${40 + (i / (data.length - 1)) * 340},${200 - (d.validationAccuracy || 0) * 160}`
            ).join(' ')}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}

        {/* Axes */}
        <line x1="40" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1" />
        <line x1="40" y1="40" x2="40" y2="200" stroke="currentColor" strokeWidth="1" />

        {/* Labels */}
        <text x="210" y="220" textAnchor="middle" className="text-sm fill-current opacity-80">
          Epoch
        </text>
        <text x="15" y="120" textAnchor="middle" className="text-sm fill-current opacity-80" transform="rotate(-90, 15, 120)">
          Accuracy
        </text>
      </svg>

      {/* Legend */}
      <div className="absolute top-2 right-2 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-green-500"></div>
          <span className="text-ml-dark-300">Training</span>
        </div>
        {data.some(d => d.validationAccuracy) && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-yellow-500 border-dashed border-t border-yellow-500"></div>
            <span className="text-ml-dark-300">Validation</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ScatterChart({ data }: { data: { actual: number; predicted: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-ml-dark-400">
        <div className="text-center">
          <div className="text-4xl mb-2">🔮</div>
          <p>No prediction data available</p>
        </div>
      </div>
    );
  }

  const minVal = Math.min(...data.map(d => Math.min(d.actual, d.predicted)));
  const maxVal = Math.max(...data.map(d => Math.max(d.actual, d.predicted)));

  return (
    <div className="h-full relative">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Perfect prediction line */}
        <line
          x1="40"
          y1="200"
          x2="380"
          y2="40"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.3"
          strokeDasharray="2,2"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = 40 + ((d.actual - minVal) / (maxVal - minVal)) * 340;
          const y = 200 - ((d.predicted - minVal) / (maxVal - minVal)) * 160;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill="#3b82f6"
              opacity="0.7"
            />
          );
        })}

        {/* Axes */}
        <line x1="40" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1" />
        <line x1="40" y1="40" x2="40" y2="200" stroke="currentColor" strokeWidth="1" />

        {/* Labels */}
        <text x="210" y="220" textAnchor="middle" className="text-sm fill-current opacity-80">
          Actual Values
        </text>
        <text x="15" y="120" textAnchor="middle" className="text-sm fill-current opacity-80" transform="rotate(-90, 15, 120)">
          Predicted Values
        </text>
      </svg>

      {/* Perfect prediction label */}
      <div className="absolute top-2 right-2 text-xs text-ml-dark-300">
        Perfect Prediction
      </div>
    </div>
  );
}

function ResidualChart({ data }: { data: { predicted: number; residual: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-ml-dark-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No residual data available</p>
        </div>
      </div>
    );
  }

  const minPred = Math.min(...data.map(d => d.predicted));
  const maxPred = Math.max(...data.map(d => d.predicted));
  const maxResidual = Math.max(...data.map(d => Math.abs(d.residual)));

  return (
    <div className="h-full relative">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Zero line */}
        <line
          x1="40"
          y1="120"
          x2="380"
          y2="120"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Data points */}
        {data.map((d, i) => {
          const x = 40 + ((d.predicted - minPred) / (maxPred - minPred)) * 340;
          const y = 120 - (d.residual / maxResidual) * 80;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill="#ef4444"
              opacity="0.7"
            />
          );
        })}

        {/* Axes */}
        <line x1="40" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1" />
        <line x1="40" y1="40" x2="40" y2="200" stroke="currentColor" strokeWidth="1" />

        {/* Labels */}
        <text x="210" y="220" textAnchor="middle" className="text-sm fill-current opacity-80">
          Predicted Values
        </text>
        <text x="15" y="120" textAnchor="middle" className="text-sm fill-current opacity-80" transform="rotate(-90, 15, 120)">
          Residuals
        </text>
      </svg>
    </div>
  );
}

function FeatureImportanceChart({ data }: { data: { feature: string; importance: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-ml-dark-400">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No feature importance data available</p>
        </div>
      </div>
    );
  }

  const maxImportance = Math.max(...data.map(d => d.importance));
  const topFeatures = data.slice(0, 10);

  return (
    <div className="h-full">
      <div className="space-y-2">
        {topFeatures.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-20 text-sm text-ml-dark-300 truncate">
              {feature.feature}
            </div>
            <div className="flex-1 bg-ml-dark-700 rounded-full h-4 relative">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(feature.importance / maxImportance) * 100}%` }}
              />
            </div>
            <div className="w-16 text-sm text-white text-right">
              {feature.importance.toFixed(3)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  icon, 
  description 
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="bg-ml-dark-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-sm text-ml-dark-300">{title}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-ml-dark-400">{description}</div>
    </div>
  );
}
