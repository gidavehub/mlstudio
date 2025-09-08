// Unified Model Management System for MLStudio
// Combines local model management with Convex database integration
// Includes comprehensive model viewing, editing, and retraining capabilities

import { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";

export interface ModelVersion {
  id: string;
  name: string;
  version: string;
  modelType: string;
  createdAt: Date;
  updatedAt: Date;
  status: "training" | "completed" | "failed" | "cancelled";
  metrics: {
    accuracy?: number;
    loss: number;
    validationAccuracy?: number;
    validationLoss?: number;
    testAccuracy?: number;
    testLoss?: number;
    trainingTime: number;
    epochs?: number;
  };
  parameters: any;
  trainingConfig: any;
  preprocessingSteps: any[];
  modelData: any; // Serialized model
  datasetId: string;
  pipelineId?: string;
  trainingJobId?: string;
  parentModelId?: string;
  isLatestVersion?: boolean;
  trainingHistory?: Array<{
    epoch: number;
    loss: number;
    accuracy?: number;
    validationLoss?: number;
    validationAccuracy?: number;
    timestamp: number;
  }>;
  errorMessage?: string;
  errorDetails?: any;
  description?: string;
}

export interface ModelComparison {
  models: ModelVersion[];
  comparisonMetrics: {
    bestAccuracy: ModelVersion | null;
    bestLoss: ModelVersion | null;
    fastestTraining: ModelVersion | null;
  };
}

export interface ModelTemplate {
  id: string;
  name: string;
  description: string;
  category: "regression" | "classification" | "clustering" | "time_series" | "deep_learning" | "both";
  icon: React.ReactNode;
  parameters: any;
  useCases: string[];
  complexity: "beginner" | "intermediate" | "advanced";
  fullyImplemented: boolean;
  supported: boolean;
  comingSoon?: boolean;
}

export interface TrainingConfig {
  modelType: string;
  modelParameters: any;
  testSize: number;
  validationSize: number;
  randomState: number;
}

export interface TrainingData {
  features: Float32Array;
  labels: Float32Array;
  featureNames: string[];
  labelName: string;
}

export interface TrainingProgress {
  epoch: number;
  loss: number;
  accuracy?: number;
  validationLoss?: number;
  validationAccuracy?: number;
}

export interface TrainingResults {
  model: any | null;
  metrics: {
    finalLoss: number;
    finalAccuracy?: number;
    validationLoss?: number;
    validationAccuracy?: number;
    trainingTime: number;
  };
  history: TrainingProgress[];
}

export class UnifiedModelManager {
  private models: Map<string, ModelVersion> = new Map();
  private currentVersion: number = 1;
  private convexClient: any = null;

  constructor(convexClient?: any) {
    this.convexClient = convexClient;
    console.log('📦 Unified Model Manager initialized');
  }

  // Set Convex client for database operations
  setConvexClient(convexClient: any) {
    this.convexClient = convexClient;
  }

  // Model Templates - With accurate implementation status
  getModelTemplates(): ModelTemplate[] {
    return [
      // === FULLY IMPLEMENTED MODELS ===
      {
        id: "linear_regression",
        name: "Linear Regression",
        description: "Predict continuous values using linear relationships between features",
        category: "regression",
        icon: "📈",
        parameters: {
          fit_intercept: true,
          normalize: false,
          copy_X: true,
          positive: false
        },
        useCases: ["Housing prices", "Sales forecasting", "Risk analysis", "Economic modeling"],
        complexity: "beginner",
        fullyImplemented: true,
        supported: true
      },
      {
        id: "logistic_regression",
        name: "Logistic Regression",
        description: "Binary and multi-class classification with probabilistic outputs",
        category: "classification",
        icon: "🎯",
        parameters: {
          penalty: 'l2',
          C: 1.0,
          solver: 'lbfgs',
          max_iter: 100,
          random_state: 42
        },
        useCases: ["Email spam detection", "Medical diagnosis", "Customer churn", "Marketing response"],
        complexity: "beginner",
        fullyImplemented: true,
        supported: true
      },
      {
        id: "neural_network",
        name: "Neural Network (Deep Learning)",
        description: "Multi-layer perceptron with customizable architecture and advanced optimization",
        category: "deep_learning",
        icon: "🧠",
        parameters: {
          hidden_layers: [128, 64, 32],
          activation: "relu",
          optimizer: "adam",
          learning_rate: 0.001,
          epochs: 100,
          batch_size: 32,
          dropout_rate: 0.2,
          validation_split: 0.2
        },
        useCases: ["Image recognition", "NLP", "Complex pattern recognition", "Time series forecasting"],
        complexity: "advanced",
        fullyImplemented: true,
        supported: true
      },
      {
        id: "decision_tree",
        name: "Decision Tree",
        description: "Interpretable tree-based model with clear decision paths",
        category: "both",
        icon: "🌳",
        parameters: {
          criterion: "gini",
          max_depth: 10,
          min_samples_split: 2,
          min_samples_leaf: 1,
          random_state: 42
        },
        useCases: ["Medical diagnosis", "Credit approval", "Rule extraction", "Feature selection"],
        complexity: "beginner",
        fullyImplemented: true,
        supported: true
      },
      {
        id: "random_forest",
        name: "Random Forest",
        description: "Ensemble of decision trees with bootstrap aggregating and feature randomness",
        category: "both",
        icon: "🌲",
        parameters: {
          n_estimators: 100,
          max_depth: 10,
          min_samples_split: 2,
          min_samples_leaf: 1,
          max_features: "sqrt",
          bootstrap: true,
          random_state: 42
        },
        useCases: ["Feature importance", "Robust predictions", "Large datasets", "Ensemble learning"],
        complexity: "intermediate",
        fullyImplemented: true,
        supported: true
      },
      
      // === NOT FULLY IMPLEMENTED MODELS ===
      {
        id: "svm",
        name: "Support Vector Machine",
        description: "Powerful algorithm for high-dimensional data and complex boundaries",
        category: "both",
        icon: "⚡",
        parameters: {
          C: 1.0,
          kernel: "rbf",
          gamma: "scale"
        },
        useCases: ["Text classification", "Gene classification", "Image classification"],
        complexity: "intermediate",
        fullyImplemented: false,
        supported: false,
        comingSoon: true
      },
      {
        id: "kmeans",
        name: "K-Means Clustering",
        description: "Unsupervised clustering for customer segmentation and data grouping",
        category: "clustering",
        icon: "🔵",
        parameters: {
          n_clusters: 3,
          init: "k-means++",
          max_iter: 300
        },
        useCases: ["Customer segmentation", "Market research", "Data exploration"],
        complexity: "beginner",
        fullyImplemented: false,
        supported: false,
        comingSoon: true
      },
      {
        id: "xgboost",
        name: "Gradient Boosting (XGBoost)",
        description: "High-performance ensemble method for competitive machine learning",
        category: "both",
        icon: "🚀",
        parameters: {
          n_estimators: 100,
          learning_rate: 0.1,
          max_depth: 3
        },
        useCases: ["Kaggle competitions", "High-accuracy predictions", "Ranking"],
        complexity: "advanced",
        fullyImplemented: false,
        supported: false,
        comingSoon: true
      },
      {
        id: "naive_bayes",
        name: "Naive Bayes",
        description: "Probabilistic classifier based on Bayes theorem",
        category: "classification",
        icon: "📊",
        parameters: {
          alpha: 1.0,
          fit_prior: true
        },
        useCases: ["Text classification", "Spam filtering", "Sentiment analysis"],
        complexity: "beginner",
        fullyImplemented: false,
        supported: false,
        comingSoon: true
      },
      {
        id: "knn",
        name: "K-Nearest Neighbors",
        description: "Instance-based learning for classification and regression",
        category: "both",
        icon: "👥",
        parameters: {
          n_neighbors: 5,
          weights: "uniform",
          algorithm: "auto"
        },
        useCases: ["Recommendation systems", "Pattern recognition", "Anomaly detection"],
        complexity: "beginner",
        fullyImplemented: false,
        supported: false,
        comingSoon: true
      }
    ];
  }

  // Create a new model (both local and database)
  async createModel(
    modelData: any,
    metrics: any,
    parameters: any,
    preprocessingSteps: any[],
    datasetId: string,
    pipelineId?: string,
    trainingJobId?: string
  ): Promise<ModelVersion> {
    console.log('📦 Creating model with data:', modelData);
    console.log('📦 Model data training metadata:', modelData.trainingMetadata);
    
    const modelId = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const version = `v${this.currentVersion++}`;
    
    const modelVersion: ModelVersion = {
      id: modelId,
      name: `${parameters.modelType}_${version}`,
      version: version,
      modelType: parameters.modelType,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "completed",
      metrics: {
        accuracy: metrics.finalAccuracy,
        loss: metrics.finalLoss,
        validationAccuracy: metrics.validationAccuracy,
        validationLoss: metrics.validationLoss,
        trainingTime: metrics.trainingTime,
        epochs: metrics.epochs
      },
      parameters: parameters,
      trainingConfig: {
        testSize: parameters.testSize || 0.2,
        validationSize: parameters.validationSize || 0.2,
        randomState: parameters.randomState || 42
      },
      preprocessingSteps: preprocessingSteps,
      modelData: modelData,
      datasetId: datasetId,
      pipelineId: pipelineId,
      trainingJobId: trainingJobId,
      isLatestVersion: true,
      trainingHistory: metrics.history || []
    };

    // Save locally
    this.models.set(modelId, modelVersion);
    
    // Save to Convex database if client is available
    if (this.convexClient) {
      try {
        // First create the model with training status
        const modelId = await this.convexClient.mutation(api.models.createModel, {
          name: modelVersion.name,
          description: `Trained ${parameters.modelType} model`,
          modelType: parameters.modelType,
          datasetId: datasetId,
          pipelineId: pipelineId && pipelineId !== "" ? pipelineId : undefined,
          trainingJobId: trainingJobId,
          modelParameters: parameters,
          trainingConfig: modelVersion.trainingConfig
        });
        
        // Then update it with completed status and results
        console.log('💾 Updating model in database with modelData:', modelData);
        console.log('💾 Training metadata being saved:', modelData.trainingMetadata);
        
        await this.convexClient.mutation(api.models.updateModel, {
          modelId: modelId,
          status: "completed",
          metrics: modelVersion.metrics,
          trainingHistory: modelVersion.trainingHistory,
          modelData: modelData
        });
        
        console.log("✅ Model saved to Convex database");
      } catch (error) {
        console.error("❌ Failed to save model to Convex:", error);
        throw error; // Re-throw to handle in the calling code
      }
    }
    
    console.log(`💾 Model saved: ${modelVersion.name}`);
    console.log(`📊 Metrics: Loss=${metrics.finalLoss.toFixed(4)}, Accuracy=${metrics.finalAccuracy ? (metrics.finalAccuracy * 100).toFixed(2) + '%' : 'N/A'}`);
    
    return modelVersion;
  }

  // Load a model by ID
  loadModel(modelId: string): ModelVersion | null {
    const model = this.models.get(modelId);
    if (model) {
      console.log(`📂 Model loaded: ${model.name}`);
      return model;
    }
    console.warn(`❌ Model not found: ${modelId}`);
    return null;
  }

  // Get all models
  getAllModels(): ModelVersion[] {
    return Array.from(this.models.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get models by type
  getModelsByType(modelType: string): ModelVersion[] {
    return this.getAllModels().filter(model => model.modelType === modelType);
  }

  // Get models by dataset
  getModelsByDataset(datasetId: string): ModelVersion[] {
    return this.getAllModels().filter(model => model.datasetId === datasetId);
  }

  // Get models by status
  getModelsByStatus(status: "training" | "completed" | "failed" | "cancelled"): ModelVersion[] {
    return this.getAllModels().filter(model => model.status === status);
  }

  // Compare models
  compareModels(modelIds: string[]): ModelComparison {
    const models = modelIds.map(id => this.models.get(id)).filter(Boolean) as ModelVersion[];
    
    if (models.length === 0) {
      return {
        models: [],
        comparisonMetrics: {
          bestAccuracy: null,
          bestLoss: null,
          fastestTraining: null
        }
      };
    }

    const comparisonMetrics = {
      bestAccuracy: models.reduce((best, current) => {
        if (!best || !current.metrics.accuracy) return current;
        return current.metrics.accuracy > best.metrics.accuracy ? current : best;
      }, null as ModelVersion | null),
      
      bestLoss: models.reduce((best, current) => {
        if (!best) return current;
        return current.metrics.loss < best.metrics.loss ? current : best;
      }, null as ModelVersion | null),
      
      fastestTraining: models.reduce((fastest, current) => {
        if (!fastest) return current;
        return current.metrics.trainingTime < fastest.metrics.trainingTime ? current : fastest;
      }, null as ModelVersion | null)
    };

    console.log(`🔍 Model comparison completed for ${models.length} models`);
    
    return {
      models,
      comparisonMetrics
    };
  }

  // Update model parameters
  async updateModelParameters(modelId: string, newParameters: any): Promise<boolean> {
    const model = this.models.get(modelId);
    if (!model) {
      console.warn(`❌ Model not found: ${modelId}`);
      return false;
    }

    model.parameters = { ...model.parameters, ...newParameters };
    model.updatedAt = new Date();

    // Update in Convex database if client is available
    if (this.convexClient) {
      try {
        await this.convexClient.mutation("models:updateModel", {
          modelId: modelId,
          modelParameters: model.parameters
        });
        console.log("✅ Model parameters updated in database");
      } catch (error) {
        console.error("❌ Failed to update model in database:", error);
      }
    }

    console.log(`📝 Model parameters updated: ${model.name}`);
    return true;
  }

  // Update model metadata
  async updateModelMetadata(modelId: string, updates: Partial<ModelVersion>): Promise<boolean> {
    const model = this.models.get(modelId);
    if (!model) {
      console.warn(`❌ Model not found: ${modelId}`);
      return false;
    }

    Object.assign(model, updates);
    model.updatedAt = new Date();

    // Update in Convex database if client is available
    if (this.convexClient) {
      try {
        await this.convexClient.mutation("models:updateModelMetadata", {
          modelId: modelId,
          name: updates.name,
          description: updates.description
        });
        console.log("✅ Model metadata updated in database");
      } catch (error) {
        console.error("❌ Failed to update model metadata in database:", error);
      }
    }

    console.log(`📝 Model metadata updated: ${model.name}`);
    return true;
  }

  // Clone a model for retraining
  async cloneModel(modelId: string, newName: string, newParameters?: any): Promise<ModelVersion | null> {
    const originalModel = this.models.get(modelId);
    if (!originalModel) {
      console.warn(`❌ Model not found: ${modelId}`);
      return null;
    }

    const clonedModelId = `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const version = `v${this.currentVersion++}`;
    
    const clonedModel: ModelVersion = {
      ...originalModel,
      id: clonedModelId,
      name: newName,
      version: version,
      status: "training",
      createdAt: new Date(),
      updatedAt: new Date(),
      parameters: newParameters || originalModel.parameters,
      parentModelId: modelId,
      isLatestVersion: true,
      metrics: {
        accuracy: undefined,
        loss: 0,
        validationAccuracy: undefined,
        validationLoss: 0,
        trainingTime: 0
      },
      trainingHistory: []
    };

    this.models.set(clonedModelId, clonedModel);

    // Save to Convex database if client is available
    if (this.convexClient) {
      try {
        await this.convexClient.mutation("models:cloneModel", {
          modelId: modelId,
          name: newName,
          modelParameters: newParameters || originalModel.parameters,
          trainingConfig: originalModel.trainingConfig
        });
        console.log("✅ Cloned model saved to database");
      } catch (error) {
        console.error("❌ Failed to save cloned model to database:", error);
      }
    }

    console.log(`📋 Model cloned: ${clonedModel.name}`);
    return clonedModel;
  }

  // Delete a model
  async deleteModel(modelId: string): Promise<boolean> {
    // Delete from Convex database if client is available
    if (this.convexClient) {
      try {
        await this.convexClient.mutation(api.models.deleteModel, {
          modelId: modelId
        });
        console.log("✅ Model deleted from database");
        
        // Also remove from local cache if it exists
        this.models.delete(modelId);
        
        return true;
      } catch (error) {
        console.error("❌ Failed to delete model from database:", error);
        return false;
      }
    } else {
      console.warn("❌ Convex client not available for model deletion");
      return false;
    }
  }

  // Export model to JSON
  exportModelToJSON(modelId: string): string {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const exportData = {
      ...model,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Export model to TensorFlow.js format
  async exportModelToTensorFlow(modelId: string): Promise<any> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    console.log(`📤 Exporting model ${model.name} to TensorFlow.js format`);
    
    return {
      modelType: 'tensorflow',
      architecture: model.modelData.architecture,
      weights: model.modelData.weights,
      metadata: {
        name: model.name,
        version: model.version,
        metrics: model.metrics,
        parameters: model.parameters,
        preprocessingSteps: model.preprocessingSteps
      }
    };
  }

  // Get model statistics
  getModelStatistics(): any {
    const allModels = this.getAllModels();
    
    const stats = {
      totalModels: allModels.length,
      modelsByType: {} as any,
      modelsByStatus: {} as any,
      averageMetrics: {
        accuracy: 0,
        loss: 0,
        trainingTime: 0
      },
      bestModel: null as ModelVersion | null
    };

    // Group by model type and status
    allModels.forEach(model => {
      if (!stats.modelsByType[model.modelType]) {
        stats.modelsByType[model.modelType] = 0;
      }
      stats.modelsByType[model.modelType]++;

      if (!stats.modelsByStatus[model.status]) {
        stats.modelsByStatus[model.status] = 0;
      }
      stats.modelsByStatus[model.status]++;
    });

    // Calculate averages
    if (allModels.length > 0) {
      const completedModels = allModels.filter(m => m.status === "completed");
      
      if (completedModels.length > 0) {
        stats.averageMetrics.accuracy = completedModels
          .filter(m => m.metrics.accuracy)
          .reduce((sum, m) => sum + (m.metrics.accuracy || 0), 0) / completedModels.filter(m => m.metrics.accuracy).length;
        
        stats.averageMetrics.loss = completedModels.reduce((sum, m) => sum + m.metrics.loss, 0) / completedModels.length;
        stats.averageMetrics.trainingTime = completedModels.reduce((sum, m) => sum + m.metrics.trainingTime, 0) / completedModels.length;
        
        // Find best model (lowest loss)
        stats.bestModel = completedModels.reduce((best, current) => {
          return current.metrics.loss < best.metrics.loss ? current : best;
        });
      }
    }

    return stats;
  }

  // Get model by name
  getModelByName(name: string): ModelVersion | null {
    return this.getAllModels().find(model => model.name === name) || null;
  }

  // Clear all models
  clearAllModels(): void {
    this.models.clear();
    this.currentVersion = 1;
    console.log('🧹 All models cleared');
  }

  // Sync with Convex database
  async syncWithDatabase(): Promise<void> {
    if (!this.convexClient) {
      console.warn("No Convex client available for sync");
      return;
    }

    try {
      const dbModels = await this.convexClient.query("models:getMyModels", {});
      
      // Clear local models and reload from database
      this.models.clear();
      
      dbModels.forEach((dbModel: any) => {
        const modelVersion: ModelVersion = {
          id: dbModel._id,
          name: dbModel.name,
          version: dbModel.version || "v1",
          modelType: dbModel.modelType,
          createdAt: new Date(dbModel.createdAt),
          updatedAt: new Date(dbModel.updatedAt),
          status: dbModel.status,
          metrics: dbModel.metrics || {
            accuracy: undefined,
            loss: 0,
            validationAccuracy: undefined,
            validationLoss: 0,
            trainingTime: 0
          },
          parameters: dbModel.modelParameters || {},
          trainingConfig: dbModel.trainingConfig || {},
          preprocessingSteps: [],
          modelData: dbModel.modelData,
          datasetId: dbModel.datasetId,
          pipelineId: dbModel.pipelineId,
          trainingJobId: dbModel.trainingJobId,
          parentModelId: dbModel.parentModelId,
          isLatestVersion: dbModel.isLatestVersion,
          trainingHistory: dbModel.trainingHistory || [],
          errorMessage: dbModel.errorMessage,
          errorDetails: dbModel.errorDetails,
          description: dbModel.description
        };

        this.models.set(dbModel._id, modelVersion);
      });

      console.log(`🔄 Synced ${dbModels.length} models from database`);
    } catch (error) {
      console.error("❌ Failed to sync with database:", error);
    }
  }
}

// Export singleton instance
export const modelManager = new UnifiedModelManager();
