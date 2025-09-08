// Image processing library for MLStudio
// Handles image loading, preprocessing, and CNN model training

export interface ImageData {
  pixels: Float32Array;
  width: number;
  height: number;
  channels: number;
  label?: number;
  filename?: string;
}

export interface ImageDataset {
  images: ImageData[];
  labels: string[];
  numClasses: number;
  imageShape: [number, number, number]; // [height, width, channels]
}

export interface ImagePreprocessingConfig {
  targetSize: [number, number]; // [width, height]
  grayscale: boolean;
  normalize: boolean;
  augment: boolean;
  augmentationParams?: {
    rotation?: number;
    flip?: boolean;
    brightness?: number;
    contrast?: number;
  };
}

export class ImageProcessor {
  private tf: any = null;

  constructor() {
    console.log('🖼️ Image Processor initialized');
  }

  // Initialize TensorFlow.js
  private async ensureTensorFlow(): Promise<void> {
    if (!this.tf) {
      try {
        this.tf = await import('@tensorflow/tfjs');
        console.log('✅ TensorFlow.js loaded for image processing');
      } catch (error) {
        console.error('❌ Failed to load TensorFlow.js:', error);
        throw new Error('TensorFlow.js is required for image processing');
      }
    }
  }

  // Load image from file
  async loadImage(file: File): Promise<ImageData> {
    await this.ensureTensorFlow();
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Create canvas to extract pixel data
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          
          ctx?.drawImage(img, 0, 0);
          const imageData = ctx?.getImageData(0, 0, img.width, img.height);
          
          if (imageData) {
            const pixels = new Float32Array(imageData.data);
            resolve({
              pixels,
              width: img.width,
              height: img.height,
              channels: 4, // RGBA
              filename: file.name
            });
          } else {
            reject(new Error('Failed to extract image data'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Load multiple images from files
  async loadImages(files: File[]): Promise<ImageData[]> {
    console.log(`📁 Loading ${files.length} images...`);
    
    const images: ImageData[] = [];
    for (const file of files) {
      try {
        const imageData = await this.loadImage(file);
        images.push(imageData);
      } catch (error) {
        console.warn(`⚠️ Failed to load ${file.name}:`, error);
      }
    }
    
    console.log(`✅ Loaded ${images.length} images successfully`);
    return images;
  }

  // Preprocess image data
  preprocessImage(
    imageData: ImageData, 
    config: ImagePreprocessingConfig
  ): ImageData {
    const { targetSize, grayscale, normalize } = config;
    const [targetWidth, targetHeight] = targetSize;
    
    // Convert to grayscale if requested
    let processedPixels = imageData.pixels;
    if (grayscale && imageData.channels === 4) {
      processedPixels = this.convertToGrayscale(processedPixels);
    }
    
    // Resize image (simplified - in real implementation, use proper resizing)
    const resizedPixels = this.resizeImage(
      processedPixels, 
      imageData.width, 
      imageData.height, 
      targetWidth, 
      targetHeight,
      grayscale ? 1 : imageData.channels
    );
    
    // Normalize if requested
    if (normalize) {
      this.normalizePixels(resizedPixels);
    }
    
    return {
      pixels: resizedPixels,
      width: targetWidth,
      height: targetHeight,
      channels: grayscale ? 1 : imageData.channels,
      label: imageData.label,
      filename: imageData.filename
    };
  }

  // Convert RGBA to grayscale
  private convertToGrayscale(pixels: Float32Array): Float32Array {
    const grayscalePixels = new Float32Array(pixels.length / 4);
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      // Convert to grayscale using luminance formula
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      grayscalePixels[i / 4] = gray;
    }
    
    return grayscalePixels;
  }

  // Simple image resizing (nearest neighbor)
  private resizeImage(
    pixels: Float32Array,
    srcWidth: number,
    srcHeight: number,
    dstWidth: number,
    dstHeight: number,
    channels: number
  ): Float32Array {
    const resizedPixels = new Float32Array(dstWidth * dstHeight * channels);
    
    const xRatio = srcWidth / dstWidth;
    const yRatio = srcHeight / dstHeight;
    
    for (let y = 0; y < dstHeight; y++) {
      for (let x = 0; x < dstWidth; x++) {
        const srcX = Math.floor(x * xRatio);
        const srcY = Math.floor(y * yRatio);
        
        for (let c = 0; c < channels; c++) {
          const srcIndex = (srcY * srcWidth + srcX) * channels + c;
          const dstIndex = (y * dstWidth + x) * channels + c;
          
          if (srcIndex < pixels.length) {
            resizedPixels[dstIndex] = pixels[srcIndex];
          }
        }
      }
    }
    
    return resizedPixels;
  }

  // Normalize pixel values to [0, 1]
  private normalizePixels(pixels: Float32Array): void {
    for (let i = 0; i < pixels.length; i++) {
      pixels[i] = pixels[i] / 255.0;
    }
  }

  // Create CNN model for image classification
  async createCNNModel(
    inputShape: [number, number, number],
    numClasses: number,
    modelParams: any = {}
  ): Promise<any> {
    await this.ensureTensorFlow();
    
    const model = this.tf.sequential();
    
    // Convolutional layers
    model.add(this.tf.layers.conv2d({
      inputShape: inputShape,
      filters: modelParams.filters1 || 32,
      kernelSize: modelParams.kernelSize || 3,
      activation: 'relu',
      padding: 'same'
    }));
    
    model.add(this.tf.layers.maxPooling2d({
      poolSize: 2
    }));
    
    model.add(this.tf.layers.conv2d({
      filters: modelParams.filters2 || 64,
      kernelSize: modelParams.kernelSize || 3,
      activation: 'relu',
      padding: 'same'
    }));
    
    model.add(this.tf.layers.maxPooling2d({
      poolSize: 2
    }));
    
    if (modelParams.filters3) {
      model.add(this.tf.layers.conv2d({
        filters: modelParams.filters3,
        kernelSize: modelParams.kernelSize || 3,
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
      units: modelParams.denseUnits || 128,
      activation: 'relu'
    }));
    
    if (modelParams.dropout) {
      model.add(this.tf.layers.dropout({ rate: modelParams.dropout }));
    }
    
    // Output layer
    model.add(this.tf.layers.dense({
      units: numClasses,
      activation: numClasses === 2 ? 'sigmoid' : 'softmax'
    }));
    
    return model;
  }

  // Convert image dataset to tensors
  async imagesToTensors(
    images: ImageData[],
    labels: number[]
  ): Promise<{ features: any; labels: any }> {
    await this.ensureTensorFlow();
    
    if (images.length === 0) {
      throw new Error('No images provided');
    }
    
    const firstImage = images[0];
    const imageShape = [firstImage.height, firstImage.width, firstImage.channels];
    
    // Create feature tensor
    const featureArray = new Float32Array(images.length * firstImage.height * firstImage.width * firstImage.channels);
    let index = 0;
    
    for (const image of images) {
      for (let i = 0; i < image.pixels.length; i++) {
        featureArray[index++] = image.pixels[i];
      }
    }
    
    const features = this.tf.tensor4d(
      featureArray,
      [images.length, ...imageShape]
    );
    
    // Create labels tensor
    const labelsTensor = this.tf.tensor2d(labels, [labels.length, 1]);
    
    return { features, labels: labelsTensor };
  }

  // Augment image data
  augmentImage(imageData: ImageData, params: any): ImageData[] {
    const augmented: ImageData[] = [imageData];
    
    // Rotation
    if (params.rotation) {
      // Simplified rotation - in real implementation, use proper rotation
      const rotated = this.rotateImage(imageData, params.rotation);
      augmented.push(rotated);
    }
    
    // Horizontal flip
    if (params.flip) {
      const flipped = this.flipImage(imageData);
      augmented.push(flipped);
    }
    
    return augmented;
  }

  // Simple image rotation (90 degrees)
  private rotateImage(imageData: ImageData, angle: number): ImageData {
    // Simplified implementation - rotate by 90 degrees
    const { pixels, width, height, channels } = imageData;
    const rotatedPixels = new Float32Array(pixels.length);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIndex = (y * width + x) * channels;
        const dstIndex = (x * height + (height - 1 - y)) * channels;
        
        for (let c = 0; c < channels; c++) {
          rotatedPixels[dstIndex + c] = pixels[srcIndex + c];
        }
      }
    }
    
    return {
      pixels: rotatedPixels,
      width: height,
      height: width,
      channels,
      label: imageData.label,
      filename: imageData.filename
    };
  }

  // Horizontal flip
  private flipImage(imageData: ImageData): ImageData {
    const { pixels, width, height, channels } = imageData;
    const flippedPixels = new Float32Array(pixels.length);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIndex = (y * width + x) * channels;
        const dstIndex = (y * width + (width - 1 - x)) * channels;
        
        for (let c = 0; c < channels; c++) {
          flippedPixels[dstIndex + c] = pixels[srcIndex + c];
        }
      }
    }
    
    return {
      pixels: flippedPixels,
      width,
      height,
      channels,
      label: imageData.label,
      filename: imageData.filename
    };
  }
}

// Export utility functions
export const ImageUtils = {
  // Get image file type
  getImageType: (filename: string): string => {
    const ext = filename.toLowerCase().split('.').pop();
    return ext || 'unknown';
  },

  // Check if file is an image
  isImageFile: (filename: string): boolean => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'];
    const ext = filename.toLowerCase().split('.').pop();
    return imageTypes.includes(ext || '');
  },

  // Get image dimensions from file
  getImageDimensions: (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
};
