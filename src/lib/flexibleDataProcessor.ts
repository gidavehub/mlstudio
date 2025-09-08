// Flexible data processor that auto-detects and handles different data types
// Supports CSV, JSON, images, audio, and more

export interface DataType {
  type: 'tabular' | 'image' | 'audio' | 'text' | 'time_series';
  format: string;
  structure: any;
  metadata: {
    rows?: number;
    columns?: number;
    features?: string[];
    target?: string;
    imageShape?: [number, number, number];
    audioLength?: number;
    textLength?: number;
  };
}

export interface ProcessingPipeline {
  steps: ProcessingStep[];
  dataType: DataType;
  targetTask: 'regression' | 'classification' | 'clustering' | 'time_series';
}

export interface ProcessingStep {
  id: string;
  type: string;
  parameters: any;
  order: number;
  applied: boolean;
}

export class FlexibleDataProcessor {
  private dataType: DataType | null = null;
  private pipeline: ProcessingPipeline | null = null;

  constructor() {
    console.log('🔄 Flexible Data Processor initialized');
  }

  // Auto-detect data type from file
  async detectDataType(file: File): Promise<DataType> {
    const filename = file.name.toLowerCase();
    const fileExtension = filename.split('.').pop() || '';
    
    console.log(`🔍 Detecting data type for: ${file.name}`);
    
    // Check file extension first
    if (['csv', 'tsv'].includes(fileExtension)) {
      return await this.detectTabularData(file);
    } else if (['json', 'jsonl'].includes(fileExtension)) {
      return await this.detectJSONData(file);
    } else if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'].includes(fileExtension)) {
      return await this.detectImageData(file);
    } else if (['wav', 'mp3', 'flac', 'ogg', 'm4a'].includes(fileExtension)) {
      return await this.detectAudioData(file);
    } else if (['txt', 'md', 'doc', 'docx', 'pdf'].includes(fileExtension)) {
      return await this.detectTextData(file);
    } else {
      // Try to detect by content
      return await this.detectByContent(file);
    }
  }

  // Detect tabular data (CSV/TSV)
  private async detectTabularData(file: File): Promise<DataType> {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('Empty file');
    }
    
    const delimiter = text.includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delimiter).map(h => h.trim());
    const sampleRow = lines[1]?.split(delimiter) || [];
    
    // Analyze column types
    const columnTypes = this.analyzeColumnTypes(sampleRow);
    
    // Detect potential target column
    const targetColumn = this.detectTargetColumn(headers, columnTypes);
    
    return {
      type: 'tabular',
      format: file.name.endsWith('.tsv') ? 'tsv' : 'csv',
      structure: {
        delimiter,
        headers,
        columnTypes
      },
      metadata: {
        rows: lines.length - 1,
        columns: headers.length,
        features: headers.filter(h => h !== targetColumn),
        target: targetColumn
      }
    };
  }

  // Detect JSON data
  private async detectJSONData(file: File): Promise<DataType> {
    const text = await file.text();
    let data: any;
    
    try {
      if (file.name.endsWith('.jsonl')) {
        // JSON Lines format
        const lines = text.split('\n').filter(line => line.trim());
        data = lines.map(line => JSON.parse(line));
      } else {
        data = JSON.parse(text);
      }
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
    
    if (Array.isArray(data) && data.length > 0) {
      // Array of objects - treat as tabular
      const firstItem = data[0];
      const headers = Object.keys(firstItem);
      const columnTypes = this.analyzeColumnTypes(Object.values(firstItem));
      const targetColumn = this.detectTargetColumn(headers, columnTypes);
      
      return {
        type: 'tabular',
        format: 'json',
        structure: {
          data,
          headers,
          columnTypes
        },
        metadata: {
          rows: data.length,
          columns: headers.length,
          features: headers.filter(h => h !== targetColumn),
          target: targetColumn
        }
      };
    } else {
      // Single object or complex structure
      return {
        type: 'text',
        format: 'json',
        structure: { data },
        metadata: {
          textLength: text.length
        }
      };
    }
  }

  // Detect image data
  private async detectImageData(file: File): Promise<DataType> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          type: 'image',
          format: file.name.split('.').pop() || 'unknown',
          structure: {
            width: img.width,
            height: img.height,
            channels: 4 // RGBA
          },
          metadata: {
            imageShape: [img.height, img.width, 4]
          }
        });
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = URL.createObjectURL(file);
    });
  }

  // Detect audio data
  private async detectAudioData(file: File): Promise<DataType> {
    // For now, return basic audio structure
    // In a real implementation, you'd analyze the audio file
    return {
      type: 'audio',
      format: file.name.split('.').pop() || 'unknown',
      structure: {
        sampleRate: 44100, // Default
        channels: 2, // Default stereo
        duration: 0 // Would need to be calculated
      },
      metadata: {
        audioLength: 0
      }
    };
  }

  // Detect text data
  private async detectTextData(file: File): Promise<DataType> {
    const text = await file.text();
    
    // Check if it's structured text (like CSV without extension)
    if (this.looksLikeTabular(text)) {
      return await this.detectTabularData(file);
    }
    
    return {
      type: 'text',
      format: file.name.split('.').pop() || 'txt',
      structure: {
        content: text,
        lines: text.split('\n').length,
        words: text.split(/\s+/).length
      },
      metadata: {
        textLength: text.length
      }
    };
  }

  // Detect data type by content analysis
  private async detectByContent(file: File): Promise<DataType> {
    const text = await file.text();
    
    // Try to detect CSV-like structure
    if (this.looksLikeTabular(text)) {
      return await this.detectTabularData(file);
    }
    
    // Try to detect JSON
    try {
      JSON.parse(text);
      return await this.detectJSONData(file);
    } catch {
      // Not JSON
    }
    
    // Default to text
    return await this.detectTextData(file);
  }

  // Check if text looks like tabular data
  private looksLikeTabular(text: string): boolean {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return false;
    
    const firstLine = lines[0];
    const secondLine = lines[1];
    
    // Check if lines have consistent delimiters
    const delimiters = [',', '\t', '|', ';'];
    
    for (const delimiter of delimiters) {
      const firstParts = firstLine.split(delimiter);
      const secondParts = secondLine.split(delimiter);
      
      if (firstParts.length > 1 && firstParts.length === secondParts.length) {
        return true;
      }
    }
    
    return false;
  }

  // Analyze column types in tabular data
  private analyzeColumnTypes(values: any[]): string[] {
    return values.map(value => {
      const str = String(value).trim();
      
      // Check for numbers
      if (!isNaN(Number(str)) && str !== '') {
        return 'numeric';
      }
      
      // Check for dates
      if (this.looksLikeDate(str)) {
        return 'date';
      }
      
      // Check for boolean
      if (['true', 'false', 'yes', 'no', '1', '0'].includes(str.toLowerCase())) {
        return 'boolean';
      }
      
      // Default to categorical
      return 'categorical';
    });
  }

  // Check if string looks like a date
  private looksLikeDate(str: string): boolean {
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      /^\d{4}\/\d{2}\/\d{2}$/ // YYYY/MM/DD
    ];
    
    return datePatterns.some(pattern => pattern.test(str));
  }

  // Detect potential target column
  private detectTargetColumn(headers: string[], columnTypes: string[]): string | undefined {
    // Look for common target column names
    const targetNames = [
      'target', 'label', 'y', 'class', 'category', 'outcome',
      'price', 'value', 'score', 'rating', 'result'
    ];
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase();
      if (targetNames.some(name => header.includes(name))) {
        return headers[i];
      }
    }
    
    // If no obvious target, use the last numeric column
    for (let i = headers.length - 1; i >= 0; i--) {
      if (columnTypes[i] === 'numeric') {
        return headers[i];
      }
    }
    
    return undefined;
  }

  // Generate processing pipeline based on data type and task
  generatePipeline(dataType: DataType, targetTask: string): ProcessingPipeline {
    const steps: ProcessingStep[] = [];
    
    switch (dataType.type) {
      case 'tabular':
        steps.push(...this.generateTabularPipeline(dataType, targetTask));
        break;
      case 'image':
        steps.push(...this.generateImagePipeline(dataType, targetTask));
        break;
      case 'audio':
        steps.push(...this.generateAudioPipeline(dataType, targetTask));
        break;
      case 'text':
        steps.push(...this.generateTextPipeline(dataType, targetTask));
        break;
      case 'time_series':
        steps.push(...this.generateTimeSeriesPipeline(dataType, targetTask));
        break;
    }
    
    return {
      steps,
      dataType,
      targetTask: targetTask as any
    };
  }

  // Generate pipeline for tabular data
  private generateTabularPipeline(dataType: DataType, targetTask: string): ProcessingStep[] {
    const steps: ProcessingStep[] = [
      {
        id: 'load_data',
        type: 'load',
        parameters: { format: dataType.format },
        order: 1,
        applied: false
      },
      {
        id: 'handle_missing',
        type: 'handle_missing',
        parameters: { strategy: 'mean' },
        order: 2,
        applied: false
      }
    ];
    
    // Add encoding for categorical variables
    if (dataType.structure.columnTypes?.some(type => type === 'categorical')) {
      steps.push({
        id: 'encode_categorical',
        type: 'encode_categorical',
        parameters: { method: 'one-hot' },
        order: 3,
        applied: false
      });
    }
    
    // Add normalization
    steps.push({
      id: 'normalize',
      type: 'normalize',
      parameters: { method: 'minmax' },
      order: 4,
      applied: false
    });
    
    // Add data splitting
    steps.push({
      id: 'split_data',
      type: 'split_data',
      parameters: { train: 0.7, validation: 0.2, test: 0.1 },
      order: 5,
      applied: false
    });
    
    return steps;
  }

  // Generate pipeline for image data
  private generateImagePipeline(dataType: DataType, targetTask: string): ProcessingStep[] {
    return [
      {
        id: 'load_images',
        type: 'load_images',
        parameters: { format: dataType.format },
        order: 1,
        applied: false
      },
      {
        id: 'resize_images',
        type: 'resize_images',
        parameters: { size: [224, 224] },
        order: 2,
        applied: false
      },
      {
        id: 'normalize_images',
        type: 'normalize_images',
        parameters: { method: 'pixel_norm' },
        order: 3,
        applied: false
      },
      {
        id: 'augment_images',
        type: 'augment_images',
        parameters: { rotation: 15, flip: true },
        order: 4,
        applied: false
      }
    ];
  }

  // Generate pipeline for audio data
  private generateAudioPipeline(dataType: DataType, targetTask: string): ProcessingStep[] {
    return [
      {
        id: 'load_audio',
        type: 'load_audio',
        parameters: { format: dataType.format },
        order: 1,
        applied: false
      },
      {
        id: 'extract_features',
        type: 'extract_audio_features',
        parameters: { features: ['mfcc', 'spectral'] },
        order: 2,
        applied: false
      },
      {
        id: 'normalize_audio',
        type: 'normalize_audio',
        parameters: { method: 'zscore' },
        order: 3,
        applied: false
      }
    ];
  }

  // Generate pipeline for text data
  private generateTextPipeline(dataType: DataType, targetTask: string): ProcessingStep[] {
    return [
      {
        id: 'load_text',
        type: 'load_text',
        parameters: { format: dataType.format },
        order: 1,
        applied: false
      },
      {
        id: 'tokenize',
        type: 'tokenize',
        parameters: { method: 'word' },
        order: 2,
        applied: false
      },
      {
        id: 'vectorize',
        type: 'vectorize',
        parameters: { method: 'tfidf' },
        order: 3,
        applied: false
      }
    ];
  }

  // Generate pipeline for time series data
  private generateTimeSeriesPipeline(dataType: DataType, targetTask: string): ProcessingStep[] {
    return [
      {
        id: 'load_timeseries',
        type: 'load_timeseries',
        parameters: { format: dataType.format },
        order: 1,
        applied: false
      },
      {
        id: 'create_sequences',
        type: 'create_sequences',
        parameters: { window_size: 10 },
        order: 2,
        applied: false
      },
      {
        id: 'normalize_timeseries',
        type: 'normalize_timeseries',
        parameters: { method: 'minmax' },
        order: 3,
        applied: false
      }
    ];
  }

  // Get recommended model types for data type and task
  getRecommendedModels(dataType: DataType, targetTask: string): string[] {
    const recommendations: { [key: string]: string[] } = {
      'tabular_regression': ['linear_regression', 'neural_network', 'random_forest', 'xgboost'],
      'tabular_classification': ['logistic_regression', 'neural_network', 'random_forest', 'svm'],
      'tabular_clustering': ['kmeans'],
      'image_classification': ['neural_network'], // CNN
      'image_regression': ['neural_network'], // CNN
      'text_classification': ['neural_network'], // RNN/LSTM
      'text_regression': ['neural_network'], // RNN/LSTM
      'time_series_forecasting': ['lstm', 'neural_network'],
      'audio_classification': ['neural_network'] // CNN for spectrograms
    };
    
    const key = `${dataType.type}_${targetTask}`;
    return recommendations[key] || ['neural_network'];
  }

  // Get data type
  getDataType(): DataType | null {
    return this.dataType;
  }

  // Get pipeline
  getPipeline(): ProcessingPipeline | null {
    return this.pipeline;
  }

  // Set data type
  setDataType(dataType: DataType): void {
    this.dataType = dataType;
  }

  // Set pipeline
  setPipeline(pipeline: ProcessingPipeline): void {
    this.pipeline = pipeline;
  }
}
