"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface TrainingHistoryEntry {
  epoch: number;
  loss: number;
  accuracy?: number;
  validationLoss?: number;
  validationAccuracy?: number;
  timestamp: number;
}

interface TrainingChartProps {
  trainingHistory: TrainingHistoryEntry[];
  metric: 'loss' | 'accuracy';
  height?: number;
  showValidation?: boolean;
}

export default function TrainingChart({ 
  trainingHistory, 
  metric, 
  height = 200, 
  showValidation = true 
}: TrainingChartProps) {
  const chartData = useMemo(() => {
    if (!trainingHistory || trainingHistory.length === 0) return null;

    const data = trainingHistory.map(entry => ({
      epoch: entry.epoch,
      value: metric === 'loss' ? entry.loss : entry.accuracy,
      validationValue: metric === 'loss' ? entry.validationLoss : entry.validationAccuracy
    }));

    // Find min/max values for scaling
    const values = data.map(d => d.value).filter(v => v !== undefined) as number[];
    const validationValues = data.map(d => d.validationValue).filter(v => v !== undefined) as number[];
    const allValues = [...values, ...validationValues];

    if (allValues.length === 0) return null;

    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const range = maxValue - minValue || 1;

    return {
      data,
      minValue,
      maxValue,
      range
    };
  }, [trainingHistory, metric]);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-48 bg-ml-dark-300 rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-ml-dark-400">No training data available</p>
        </div>
      </div>
    );
  }

  const { data, minValue, maxValue, range } = chartData;
  const chartWidth = 400;
  const chartHeight = height - 60; // Account for padding and labels
  const padding = 40;

  // Calculate SVG paths
  const getYPosition = (value: number) => {
    return chartHeight - ((value - minValue) / range) * chartHeight;
  };

  const getXPosition = (epoch: number, maxEpoch: number) => {
    return (epoch / maxEpoch) * chartWidth;
  };

  const maxEpoch = Math.max(...data.map(d => d.epoch));

  const mainPath = data
    .filter(d => d.value !== undefined)
    .map((d, i) => {
      const x = getXPosition(d.epoch, maxEpoch);
      const y = getYPosition(d.value as number);
      return `${i === 0 ? 'M' : 'L'} ${x + padding} ${y + padding}`;
    })
    .join(' ');

  const validationPath = showValidation
    ? data
        .filter(d => d.validationValue !== undefined)
        .map((d, i) => {
          const x = getXPosition(d.epoch, maxEpoch);
          const y = getYPosition(d.validationValue as number);
          return `${i === 0 ? 'M' : 'L'} ${x + padding} ${y + padding}`;
        })
        .join(' ')
    : '';

  const formatValue = (value: number) => {
    if (metric === 'accuracy') {
      return `${(value * 100).toFixed(1)}%`;
    } else {
      return value.toFixed(4);
    }
  };

  return (
    <div className="bg-ml-dark-300 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-white capitalize">
          {metric === 'loss' ? 'Training Loss' : 'Training Accuracy'}
        </h4>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
            <span className="text-ml-dark-400">Training</span>
          </div>
          {showValidation && validationPath && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
              <span className="text-ml-dark-400">Validation</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <svg 
          width={chartWidth + padding * 2} 
          height={chartHeight + padding * 2}
          className="overflow-visible"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const value = minValue + (maxValue - minValue) * ratio;
            const y = chartHeight - ratio * chartHeight + padding;
            return (
              <g key={ratio}>
                <line
                  x1={padding - 5}
                  y1={y}
                  x2={padding}
                  y2={y}
                  stroke="#9CA3AF"
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-ml-dark-400 text-xs"
                >
                  {formatValue(value)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const epoch = Math.round(maxEpoch * ratio);
            const x = ratio * chartWidth + padding;
            return (
              <g key={ratio}>
                <line
                  x1={x}
                  y1={chartHeight + padding}
                  x2={x}
                  y2={chartHeight + padding + 5}
                  stroke="#9CA3AF"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={chartHeight + padding + 20}
                  textAnchor="middle"
                  className="fill-ml-dark-400 text-xs"
                >
                  {epoch}
                </text>
              </g>
            );
          })}

          {/* Training line */}
          <motion.path
            d={mainPath}
            fill="none"
            stroke="#60A5FA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Validation line */}
          {showValidation && validationPath && (
            <motion.path
              d={validationPath}
              fill="none"
              stroke="#FB923C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
            />
          )}

          {/* Data points */}
          {data.filter(d => d.value !== undefined).map((d, i) => (
            <motion.circle
              key={`main-${d.epoch}`}
              cx={getXPosition(d.epoch, maxEpoch) + padding}
              cy={getYPosition(d.value as number) + padding}
              r="3"
              fill="#60A5FA"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            />
          ))}

          {showValidation && data.filter(d => d.validationValue !== undefined).map((d, i) => (
            <motion.circle
              key={`val-${d.epoch}`}
              cx={getXPosition(d.epoch, maxEpoch) + padding}
              cy={getYPosition(d.validationValue as number) + padding}
              r="3"
              fill="#FB923C"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.1 + 0.3 }}
            />
          ))}
        </svg>

        {/* Axis labels */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8">
          <span className="text-ml-dark-400 text-sm">Epoch</span>
        </div>
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-8 -rotate-90">
          <span className="text-ml-dark-400 text-sm capitalize">
            {metric === 'loss' ? 'Loss' : 'Accuracy'}
          </span>
        </div>
      </div>

      {/* Latest values */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div>
          <span className="text-ml-dark-400">Latest {metric}: </span>
          <span className="text-white font-medium">
            {data[data.length - 1]?.value ? formatValue(data[data.length - 1].value as number) : 'N/A'}
          </span>
        </div>
        {showValidation && (
          <div>
            <span className="text-ml-dark-400">Validation {metric}: </span>
            <span className="text-white font-medium">
              {data[data.length - 1]?.validationValue ? formatValue(data[data.length - 1].validationValue as number) : 'N/A'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
