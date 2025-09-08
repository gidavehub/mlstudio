// CNN Training Pipeline for Image Classification
// Handles CNN model training with image data

export interface CNNTrainingConfig {
  modelType: 'cnn' | 'resnet';
  epochs: number;
  batchSize: number;
  learningRate: number;
  imageSize: [number, number];
  numClasses: number;
  augmentation: boolean;
  validationSplit: number;
  testSplit: number;
  modelParameters?: {
    filters1?: number;
    filters2?: number;
    filters3?: number;
    kernelSize?: number;
    denseUnits?: number;
    dropout?: number;
  };
}

export interface CNNTrainingProgress {
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
  progress: number;
}

export interface CNNTrainingResults {
  model: any;
  history: CNNTrainingProgress[];
  metrics: {
    finalLoss: number;
    finalAccuracy: number;
    finalValLoss: number;
    finalValAccuracy: number;
    trainingTime: number;
  };
  confusionMatrix: number[][];
  classReport: {
    precision: number[];
    recall: number[];
    f1Score: number[];
  };
}

export class CNNTrainer {
  private tf: any = null;
  private model: any = null;
  private isInitialized = false;

  constructor() {
    console.log('🖼️ CNN Trainer initialized');
  }

  // Initialize TensorFlow.js
  private async initializeTensorFlow(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Dynamic import to avoid SSR issues
      const tf = await import('@tensorflow/tfjs');
      this.tf = tf;
      this.isInitialized = true;
      console.log('✅ TensorFlow.js loaded for CNN training');
    } catch (error) {
      console.error('❌ Failed to load TensorFlow.js:', error);
      throw new Error('TensorFlow.js is required for CNN training');
    }
  }

  // Create CNN model architecture
  private createCNNModel(config: CNNTrainingConfig, inputShape: [number, number, number]): any {
    const model = this.tf.sequential();
    const params = config.modelParameters || {};

    // Input layer
    model.add(this.tf.layers.conv2d({
      inputShape: inputShape,
      filters: params.filters1 || 32,
      kernelSize: params.kernelSize || 3,
      activation: 'relu',
      padding: 'same'
    }));

    model.add(this.tf.layers.maxPooling2d({
      poolSize: 2
    }));

    // Second convolutional block
    model.add(this.tf.layers.conv2d({
      filters: params.filters2 || 64,
      kernelSize: params.kernelSize || 3,
      activation: 'relu',
      padding: 'same'
    }));

    model.add(this.tf.layers.maxPooling2d({
      poolSize: 2
    }));

    // Third convolutional block (optional)
    if (params.filters3) {
      model.add(this.tf.layers.conv2d({
        filters: params.filters3,
        kernelSize: params.kernelSize || 3,
        activation: 'relu',
        padding: 'same'
      }));

      model.add(this.tf.layers.maxPooling2d({
        poolSize: 2
      }));
    }

    // Flatten and dense layers
    model.add(this.tf.layers.flatten());

    model.add(this.tf.layers.dense({
      units: params.denseUnits || 128,
      activation: 'relu'
    }));

    if (params.dropout) {
      model.add(this.tf.layers.dropout({ rate: params.dropout }));
    }

    // Output layer
    const outputUnits = config.numClasses;
    const outputActivation = outputUnits === 2 ? 'sigmoid' : 'softmax';
    
    model.add(this.tf.layers.dense({
      units: outputUnits,
      activation: outputActivation
    }));

    return model;
  }

  // Create ResNet-like model
  private createResNetModel(config: CNNTrainingConfig, inputShape: [number, number, number]): any {
    const model = this.tf.sequential();
    const params = config.modelParameters || {};

    // Initial convolution
    model.add(this.tf.layers.conv2d({
      inputShape: inputShape,
      filters: params.filters1 || 64,
      kernelSize: 7,
      strides: 2,
      activation: 'relu',
      padding: 'same'
    }));

    model.add(this.tf.layers.maxPooling2d({
      poolSize: 3,
      strides: 2,
      padding: 'same'
    }));

    // Residual blocks (simplified)
    for (let i = 0; i < 2; i++) {
      model.add(this.tf.layers.conv2d({
        filters: params.filters2 || 128,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same'
      }));

      model.add(this.tf.layers.conv2d({
        filters: params.filters2 || 128,
        kernelSize: 3,
        activation: 'relu',
        padding: 'same'
      }));
    }

    // Global average pooling
    model.add(this.tf.layers.globalAveragePooling2d());

    // Dense layers
    model.add(this.tf.layers.dense({
      units: params.denseUnits || 256,
      activation: 'relu'
    }));

    if (params.dropout) {
      model.add(this.tf.layers.dropout({ rate: params.dropout }));
    }

    // Output layer
    const outputUnits = config.numClasses;
    const outputActivation = outputUnits === 2 ? 'sigmoid' : 'softmax';
    
    model.add(this.tf.layers.dense({
      units: outputUnits,
      activation: outputActivation
    }));

    return model;
  }

  // Prepare image data for training
  private prepareImageData(images: Float32Array[], labels: number[], config: CNNTrainingConfig): {
    trainImages: any;
    trainLabels: any;
    valImages: any;
    valLabels: any;
    testImages: any;
    testLabels: any;
  } {
    const numSamples = images.length;
    const [height, width] = config.imageSize;
    const channels = 1; // Grayscale

    // Reshape images to proper format
    const reshapedImages = images.map(img => {
      // Reshape from flat array to image format
      const imageData = new Float32Array(height * width * channels);
      for (let i = 0; i < Math.min(img.length, imageData.length); i++) {
        imageData[i] = img[i];
      }
      return imageData;
    });

    // Convert to tensors
    const imagesTensor = this.tf.tensor4d(
      reshapedImages,
      [numSamples, height, width, channels]
    );

    const labelsTensor = this.tf.tensor2d(
      labels.map(l => config.numClasses === 2 ? [l] : this.oneHotEncode(l, config.numClasses)),
      [numSamples, config.numClasses === 2 ? 1 : config.numClasses]
    );

    // Split data
    const testSize = Math.floor(numSamples * config.testSplit);
    const valSize = Math.floor(numSamples * config.validationSplit);
    const trainSize = numSamples - testSize - valSize;

    const trainImages = imagesTensor.slice([0, 0, 0, 0], [trainSize, height, width, channels]);
    const trainLabels = labelsTensor.slice([0, 0], [trainSize, config.numClasses === 2 ? 1 : config.numClasses]);

    const valImages = imagesTensor.slice([trainSize, 0, 0, 0], [valSize, height, width, channels]);
    const valLabels = labelsTensor.slice([trainSize, 0], [valSize, config.numClasses === 2 ? 1 : config.numClasses]);

    const testImages = imagesTensor.slice([trainSize + valSize, 0, 0, 0], [testSize, height, width, channels]);
    const testLabels = labelsTensor.slice([trainSize + valSize, 0], [testSize, config.numClasses === 2 ? 1 : config.numClasses]);

    return {
      trainImages,
      trainLabels,
      valImages,
      valLabels,
      testImages,
      testLabels
    };
  }

  // One-hot encode labels
  private oneHotEncode(label: number, numClasses: number): number[] {
    const encoded = new Array(numClasses).fill(0);
    encoded[label] = 1;
    return encoded;
  }

  // Train CNN model
  async train(
    images: Float32Array[],
    labels: number[],
    config: CNNTrainingConfig,
    onProgress?: (progress: CNNTrainingProgress) => void
  ): Promise<CNNTrainingResults> {
    const startTime = Date.now();

    // Initialize TensorFlow.js
    await this.initializeTensorFlow();

    console.log(`🖼️ Starting CNN training with ${images.length} images`);
    console.log(`📊 Model type: ${config.modelType}`);
    console.log(`🎯 Classes: ${config.numClasses}`);
    console.log(`📐 Image size: ${config.imageSize[0]}x${config.imageSize[1]}`);

    // Prepare data
    const { trainImages, trainLabels, valImages, valLabels, testImages, testLabels } = 
      this.prepareImageData(images, labels, config);

    // Create model
    const inputShape: [number, number, number] = [config.imageSize[0], config.imageSize[1], 1];
    
    if (config.modelType === 'cnn') {
      this.model = this.createCNNModel(config, inputShape);
    } else {
      this.model = this.createResNetModel(config, inputShape);
    }

    // Compile model
    const loss = config.numClasses === 2 ? 'binaryCrossentropy' : 'categoricalCrossentropy';
    const metrics = ['accuracy'];

    this.model.compile({
      optimizer: this.tf.train.adam(config.learningRate),
      loss: loss,
      metrics: metrics
    });

    console.log('🏗️ Model architecture:');
    this.model.summary();

    // Training history
    const history: CNNTrainingProgress[] = [];

    // Train model
    const results = await this.model.fit(trainImages, trainLabels, {
      epochs: config.epochs,
      batchSize: config.batchSize,
      validationData: [valImages, valLabels],
      callbacks: {
        onEpochEnd: (epoch: number, logs: any) => {
          const progress: CNNTrainingProgress = {
            epoch: epoch + 1,
            totalEpochs: config.epochs,
            loss: logs.loss,
            accuracy: logs.acc || logs.accuracy,
            valLoss: logs.val_loss,
            valAccuracy: logs.val_acc || logs.val_accuracy,
            progress: ((epoch + 1) / config.epochs) * 100
          };

          history.push(progress);
          
          console.log(`Epoch ${epoch + 1}/${config.epochs} - Loss: ${logs.loss.toFixed(4)}, Accuracy: ${(logs.acc || logs.accuracy).toFixed(4)}`);
          
          if (onProgress) {
            onProgress(progress);
          }
        }
      }
    });

    // Evaluate on test set
    const testResults = this.model.evaluate(testImages, testLabels);
    const testLoss = Array.isArray(testResults) ? testResults[0].dataSync()[0] : testResults.dataSync()[0];
    const testAccuracy = Array.isArray(testResults) ? testResults[1].dataSync()[0] : testResults.dataSync()[1];

    // Generate confusion matrix
    const predictions = this.model.predict(testImages);
    const predictedLabels = predictions.argMax(-1).dataSync();
    const trueLabels = testLabels.argMax(-1).dataSync();
    
    const confusionMatrix = this.generateConfusionMatrix(trueLabels, predictedLabels, config.numClasses);
    const classReport = this.generateClassReport(confusionMatrix);

    const trainingTime = Date.now() - startTime;

    // Clean up tensors
    trainImages.dispose();
    trainLabels.dispose();
    valImages.dispose();
    valLabels.dispose();
    testImages.dispose();
    testLabels.dispose();
    predictions.dispose();

    const finalMetrics = {
      finalLoss: history[history.length - 1]?.loss || 0,
      finalAccuracy: history[history.length - 1]?.accuracy || 0,
      finalValLoss: history[history.length - 1]?.valLoss || 0,
      finalValAccuracy: history[history.length - 1]?.valAccuracy || 0,
      trainingTime
    };

    console.log('✅ CNN training completed');
    console.log(`📊 Final accuracy: ${(finalMetrics.finalAccuracy * 100).toFixed(2)}%`);
    console.log(`⏱️ Training time: ${trainingTime}ms`);

    return {
      model: this.model,
      history,
      metrics: finalMetrics,
      confusionMatrix,
      classReport
    };
  }

  // Generate confusion matrix
  private generateConfusionMatrix(trueLabels: number[], predictedLabels: number[], numClasses: number): number[][] {
    const matrix = Array(numClasses).fill(null).map(() => Array(numClasses).fill(0));
    
    for (let i = 0; i < trueLabels.length; i++) {
      matrix[trueLabels[i]][predictedLabels[i]]++;
    }
    
    return matrix;
  }

  // Generate classification report
  private generateClassReport(confusionMatrix: number[][]): {
    precision: number[];
    recall: number[];
    f1Score: number[];
  } {
    const numClasses = confusionMatrix.length;
    const precision = new Array(numClasses).fill(0);
    const recall = new Array(numClasses).fill(0);
    const f1Score = new Array(numClasses).fill(0);

    for (let i = 0; i < numClasses; i++) {
      const truePositives = confusionMatrix[i][i];
      const falsePositives = confusionMatrix.reduce((sum, row) => sum + row[i], 0) - truePositives;
      const falseNegatives = confusionMatrix[i].reduce((sum, val) => sum + val, 0) - truePositives;

      precision[i] = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 0;
      recall[i] = truePositives + falseNegatives > 0 ? truePositives / (truePositives + falseNegatives) : 0;
      f1Score[i] = precision[i] + recall[i] > 0 ? 2 * (precision[i] * recall[i]) / (precision[i] + recall[i]) : 0;
    }

    return { precision, recall, f1Score };
  }

  // Make predictions
  async predict(images: Float32Array[]): Promise<number[]> {
    if (!this.model) {
      throw new Error('Model not trained yet');
    }

    const [height, width] = [28, 28]; // Default size
    const channels = 1;

    const reshapedImages = images.map(img => {
      const imageData = new Float32Array(height * width * channels);
      for (let i = 0; i < Math.min(img.length, imageData.length); i++) {
        imageData[i] = img[i];
      }
      return imageData;
    });

    const imagesTensor = this.tf.tensor4d(
      reshapedImages,
      [images.length, height, width, channels]
    );

    const predictions = this.model.predict(imagesTensor);
    const predictedLabels = predictions.argMax(-1).dataSync();

    imagesTensor.dispose();
    predictions.dispose();

    return Array.from(predictedLabels);
  }

  // Save model
  async saveModel(): Promise<any> {
    if (!this.model) {
      throw new Error('No model to save');
    }

    return await this.model.save('indexeddb://cnn-model');
  }

  // Load model
  async loadModel(modelPath: string): Promise<void> {
    await this.initializeTensorFlow();
    this.model = await this.tf.loadLayersModel(modelPath);
  }

  // Dispose resources
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}
