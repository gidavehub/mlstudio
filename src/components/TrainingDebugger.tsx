"use client";

import { useState } from "react";
import { RealMLTrainer } from "@/lib/realMLTraining";
import { DataPreprocessor } from "@/lib/dataProcessing";

export default function TrainingDebugger() {
  const [status, setStatus] = useState<string>("Ready");
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testTensorFlow = async () => {
    setStatus("Testing TensorFlow.js...");
    addLog("Starting TensorFlow.js test...");
    
    try {
      const trainer = new RealMLTrainer();
      addLog("✅ RealMLTrainer created successfully");
      
      // Test TensorFlow loading
      await (trainer as any).ensureTensorFlow();
      addLog("✅ TensorFlow.js loaded successfully");
      
      trainer.dispose();
      addLog("✅ Test completed successfully");
      setStatus("✅ TensorFlow.js working!");
      
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatus("❌ TensorFlow.js failed");
    }
  };

  const testDataProcessing = async () => {
    setStatus("Testing data processing...");
    addLog("Starting data processing test...");
    
    try {
      const preprocessor = new DataPreprocessor();
      addLog("✅ DataPreprocessor created successfully");
      
      // Test with sample data
      const sampleCSV = `feature1,feature2,label
1,2,3
4,5,6
7,8,9`;
      
      await preprocessor.loadData(sampleCSV, 'csv');
      addLog("✅ Sample data loaded successfully");
      
      const columns = preprocessor.getColumns();
      addLog(`✅ Columns detected: ${columns.join(', ')}`);
      
      const preview = preprocessor.getTabularPreview(3);
      addLog(`✅ Preview data: ${preview.rows.length} rows`);
      
      setStatus("✅ Data processing working!");
      
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatus("❌ Data processing failed");
    }
  };

  const testFullTraining = async () => {
    setStatus("Testing full training pipeline...");
    addLog("Starting full training test...");
    
    try {
      const trainer = new RealMLTrainer();
      const preprocessor = new DataPreprocessor();
      
      // Load sample data
      const sampleCSV = `feature1,feature2,label
1,2,3
4,5,6
7,8,9
10,11,12
13,14,15`;
      
      await preprocessor.loadData(sampleCSV, 'csv');
      addLog("✅ Sample data loaded");
      
      // Prepare training data
      const trainingData = trainer.prepareData(
        preprocessor.getTabularData().rows.map(row => ({
          feature1: row[0],
          feature2: row[1],
          label: row[2]
        })),
        ['feature1', 'feature2'],
        'label'
      );
      addLog("✅ Training data prepared");
      
      // Train model
      const config = {
        modelType: 'linear_regression',
        modelParameters: { epochs: 5, batchSize: 2 },
        testSize: 0.2,
        validationSize: 0.2,
        randomState: 42
      };
      
      const results = await trainer.train(trainingData, config, (progress) => {
        addLog(`Epoch ${progress.epoch}: Loss = ${progress.loss.toFixed(4)}`);
      });
      
      addLog(`✅ Training completed! Final loss: ${results.metrics.finalLoss.toFixed(4)}`);
      addLog(`✅ Training time: ${results.metrics.trainingTime}ms`);
      
      trainer.dispose();
      setStatus("✅ Full training pipeline working!");
      
    } catch (error) {
      addLog(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatus("❌ Full training pipeline failed");
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setStatus("Ready");
  };

  return (
    <div className="p-6 bg-slate-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Training Debugger</h2>
      
      <div className="mb-4">
        <p className="text-slate-300 mb-2">Status: <span className="font-mono">{status}</span></p>
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={testTensorFlow}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Test TensorFlow.js
        </button>
        <button
          onClick={testDataProcessing}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Test Data Processing
        </button>
        <button
          onClick={testFullTraining}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Test Full Training
        </button>
        <button
          onClick={clearLogs}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Clear Logs
        </button>
      </div>
      
      <div className="bg-slate-900 rounded-lg p-4 max-h-96 overflow-y-auto">
        <h3 className="text-white font-semibold mb-2">Debug Logs:</h3>
        {logs.length === 0 ? (
          <p className="text-slate-400">No logs yet. Run a test to see debug information.</p>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono text-slate-300">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
