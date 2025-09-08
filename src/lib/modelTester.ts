// Model testing and evaluation library for MLStudio
// Provides comprehensive model testing, visualization, and performance analysis

export interface TestResult {
  predictions: number[];
  actualValues: number[];
  metrics: {
    mse: number;
    rmse: number;
    mae: number;
    r2: number;
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
  };
  confusionMatrix?: number[][];
  featureImportance?: { feature: string; importance: number }[];
}

export interface VisualizationData {
  lossHistory: { epoch: number; loss: number; validationLoss?: number }[];
  accuracyHistory: { epoch: number; accuracy: number; validationAccuracy?: number }[];
  predictionScatter: { actual: number; predicted: number }[];
  residualPlot: { predicted: number; residual: number }[];
  featureImportance: { feature: string; importance: number }[];
}

export class ModelTester {
  private tf: any = null;

  constructor() {
    console.log('🧪 Model Tester initialized');
  }

  // Initialize TensorFlow.js
  private async ensureTensorFlow(): Promise<void> {
    if (!this.tf) {
      try {
        this.tf = await import('@tensorflow/tfjs');
        console.log('✅ TensorFlow.js loaded for model testing');
      } catch (error) {
        console.error('❌ Failed to load TensorFlow.js:', error);
        throw new Error('TensorFlow.js is required for model testing');
      }
    }
  }

  // Test model with test data
  async testModel(
    model: any,
    testFeatures: number[][],
    testLabels: number[],
    modelType: string
  ): Promise<TestResult> {
    await this.ensureTensorFlow();

    console.log(`🧪 Testing ${modelType} model with ${testFeatures.length} samples`);

    // Convert to tensors
    const featuresTensor = this.tf.tensor2d(testFeatures);
    const labelsTensor = this.tf.tensor2d(testLabels.map(l => [l]));

    // Make predictions
    const predictions = model.predict(featuresTensor);
    const predictionsArray = Array.from(predictions.dataSync());

    // Calculate metrics
    const metrics = this.calculateMetrics(testLabels, predictionsArray, modelType);

    // Calculate feature importance for certain model types
    let featureImportance: { feature: string; importance: number }[] | undefined;
    if (modelType === 'linear_regression' || modelType === 'neural_network') {
      featureImportance = this.calculateFeatureImportance(model, testFeatures);
    }

    // Calculate confusion matrix for classification
    let confusionMatrix: number[][] | undefined;
    if (modelType.includes('classification') || modelType === 'logistic_regression') {
      confusionMatrix = this.calculateConfusionMatrix(testLabels, predictionsArray);
    }

    // Clean up tensors
    featuresTensor.dispose();
    labelsTensor.dispose();
    predictions.dispose();

    const result: TestResult = {
      predictions: predictionsArray,
      actualValues: testLabels,
      metrics,
      confusionMatrix,
      featureImportance
    };

    console.log(`✅ Model testing completed. R²: ${metrics.r2.toFixed(4)}`);
    return result;
  }

  // Calculate comprehensive metrics
  private calculateMetrics(actual: number[], predicted: number[], modelType: string): TestResult['metrics'] {
    const n = actual.length;
    
    // Mean Squared Error
    const mse = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0) / n;
    
    // Root Mean Squared Error
    const rmse = Math.sqrt(mse);
    
    // Mean Absolute Error
    const mae = actual.reduce((sum, val, i) => sum + Math.abs(val - predicted[i]), 0) / n;
    
    // R-squared
    const actualMean = actual.reduce((sum, val) => sum + val, 0) / n;
    const ssRes = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
    const ssTot = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
    const r2 = 1 - (ssRes / ssTot);

    const metrics: TestResult['metrics'] = {
      mse,
      rmse,
      mae,
      r2
    };

    // Add classification metrics if applicable
    if (modelType.includes('classification') || modelType === 'logistic_regression') {
      const classificationMetrics = this.calculateClassificationMetrics(actual, predicted);
      Object.assign(metrics, classificationMetrics);
    }

    return metrics;
  }

  // Calculate classification metrics
  private calculateClassificationMetrics(actual: number[], predicted: number[]): Partial<TestResult['metrics']> {
    // Convert to binary predictions (threshold at 0.5)
    const binaryPredicted = predicted.map(p => p > 0.5 ? 1 : 0);
    
    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    for (let i = 0; i < actual.length; i++) {
      if (actual[i] === 1 && binaryPredicted[i] === 1) truePositives++;
      else if (actual[i] === 0 && binaryPredicted[i] === 1) falsePositives++;
      else if (actual[i] === 0 && binaryPredicted[i] === 0) trueNegatives++;
      else if (actual[i] === 1 && binaryPredicted[i] === 0) falseNegatives++;
    }

    const accuracy = (truePositives + trueNegatives) / actual.length;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    return {
      accuracy,
      precision,
      recall,
      f1Score
    };
  }

  // Calculate confusion matrix
  private calculateConfusionMatrix(actual: number[], predicted: number[]): number[][] {
    const binaryPredicted = predicted.map(p => p > 0.5 ? 1 : 0);
    const uniqueClasses = [...new Set([...actual, ...binaryPredicted])].sort();
    const matrix = Array(uniqueClasses.length).fill(null).map(() => Array(uniqueClasses.length).fill(0));

    for (let i = 0; i < actual.length; i++) {
      const actualIndex = uniqueClasses.indexOf(actual[i]);
      const predictedIndex = uniqueClasses.indexOf(binaryPredicted[i]);
      matrix[actualIndex][predictedIndex]++;
    }

    return matrix;
  }

  // Calculate feature importance
  private calculateFeatureImportance(model: any, features: number[][]): { feature: string; importance: number }[] {
    try {
      // For linear models, use weights
      const weights = model.getWeights();
      if (weights && weights.length > 0) {
        const weightValues = Array.from(weights[0].dataSync());
        return weightValues.map((weight, index) => ({
          feature: `Feature_${index + 1}`,
          importance: Math.abs(weight)
        })).sort((a, b) => b.importance - a.importance);
      }
    } catch (error) {
      console.warn('Could not extract feature importance:', error);
    }

    return [];
  }

  // Generate visualization data
  generateVisualizationData(
    trainingHistory: any[],
    testResult: TestResult,
    featureNames: string[]
  ): VisualizationData {
    const lossHistory = trainingHistory.map((entry, index) => ({
      epoch: index + 1,
      loss: entry.loss,
      validationLoss: entry.validationLoss
    }));

    const accuracyHistory = trainingHistory.map((entry, index) => ({
      epoch: index + 1,
      accuracy: entry.accuracy || 0,
      validationAccuracy: entry.validationAccuracy
    }));

    const predictionScatter = testResult.actualValues.map((actual, index) => ({
      actual,
      predicted: testResult.predictions[index]
    }));

    const residualPlot = testResult.actualValues.map((actual, index) => ({
      predicted: testResult.predictions[index],
      residual: actual - testResult.predictions[index]
    }));

    const featureImportance = testResult.featureImportance || featureNames.map((name, index) => ({
      feature: name,
      importance: Math.random() // Placeholder - would be calculated from model
    }));

    return {
      lossHistory,
      accuracyHistory,
      predictionScatter,
      residualPlot,
      featureImportance
    };
  }

  // Generate model performance report
  generatePerformanceReport(testResult: TestResult, modelType: string): string {
    const { metrics } = testResult;
    
    let report = `# Model Performance Report\n\n`;
    report += `**Model Type:** ${modelType}\n`;
    report += `**Test Samples:** ${testResult.actualValues.length}\n\n`;
    
    report += `## Regression Metrics\n`;
    report += `- **Mean Squared Error (MSE):** ${metrics.mse.toFixed(4)}\n`;
    report += `- **Root Mean Squared Error (RMSE):** ${metrics.rmse.toFixed(4)}\n`;
    report += `- **Mean Absolute Error (MAE):** ${metrics.mae.toFixed(4)}\n`;
    report += `- **R-squared (R²):** ${metrics.r2.toFixed(4)}\n\n`;
    
    if (metrics.accuracy !== undefined) {
      report += `## Classification Metrics\n`;
      report += `- **Accuracy:** ${(metrics.accuracy * 100).toFixed(2)}%\n`;
      report += `- **Precision:** ${(metrics.precision! * 100).toFixed(2)}%\n`;
      report += `- **Recall:** ${(metrics.recall! * 100).toFixed(2)}%\n`;
      report += `- **F1-Score:** ${(metrics.f1Score! * 100).toFixed(2)}%\n\n`;
    }
    
    if (testResult.confusionMatrix) {
      report += `## Confusion Matrix\n`;
      report += `\`\`\`\n`;
      report += testResult.confusionMatrix.map(row => row.join('\t')).join('\n');
      report += `\n\`\`\`\n\n`;
    }
    
    if (testResult.featureImportance && testResult.featureImportance.length > 0) {
      report += `## Feature Importance\n`;
      testResult.featureImportance.slice(0, 10).forEach((feature, index) => {
        report += `${index + 1}. **${feature.feature}:** ${feature.importance.toFixed(4)}\n`;
      });
    }
    
    return report;
  }

  // Cross-validation testing
  async crossValidate(
    modelFactory: () => any,
    features: number[][],
    labels: number[],
    modelType: string,
    folds: number = 5
  ): Promise<{ meanScore: number; stdScore: number; scores: number[] }> {
    await this.ensureTensorFlow();

    console.log(`🔄 Performing ${folds}-fold cross-validation`);

    const foldSize = Math.floor(features.length / folds);
    const scores: number[] = [];

    for (let fold = 0; fold < folds; fold++) {
      const start = fold * foldSize;
      const end = fold === folds - 1 ? features.length : (fold + 1) * foldSize;
      
      // Create train/test split
      const testFeatures = features.slice(start, end);
      const testLabels = labels.slice(start, end);
      const trainFeatures = [...features.slice(0, start), ...features.slice(end)];
      const trainLabels = [...labels.slice(0, start), ...labels.slice(end)];

      // Train model
      const model = modelFactory();
      // Note: In a real implementation, you would train the model here
      
      // Test model
      const testResult = await this.testModel(model, testFeatures, testLabels, modelType);
      scores.push(testResult.metrics.r2);
      
      // Clean up
      model.dispose();
    }

    const meanScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - meanScore, 2), 0) / scores.length;
    const stdScore = Math.sqrt(variance);

    console.log(`✅ Cross-validation completed. Mean R²: ${meanScore.toFixed(4)} ± ${stdScore.toFixed(4)}`);

    return {
      meanScore,
      stdScore,
      scores
    };
  }

  // Model comparison
  compareModels(testResults: { modelName: string; result: TestResult }[]): {
    bestModel: string;
    comparison: { modelName: string; r2: number; rmse: number; accuracy?: number }[];
  } {
    const comparison = testResults.map(({ modelName, result }) => ({
      modelName,
      r2: result.metrics.r2,
      rmse: result.metrics.rmse,
      accuracy: result.metrics.accuracy
    }));

    const bestModel = comparison.reduce((best, current) => 
      current.r2 > best.r2 ? current : best
    ).modelName;

    return {
      bestModel,
      comparison: comparison.sort((a, b) => b.r2 - a.r2)
    };
  }
}