// Client-side data processing library for MLStudio
// All data processing happens in the browser for instant response

export interface DataStep {
  id: string;
  type: 'load' | 'reshape' | 'normalize' | 'scale' | 'feature_engineering' | 'handle_missing' | 'encode_categorical' | 'split_data' | 'convert_to_tensor';
  parameters: any;
  order: number;
  appliedAt: number;
}

export interface ProcessedData {
  trainingData: Float32Array;
  validationData: Float32Array;
  testingData: Float32Array;
  trainingLabels: Float32Array;
  validationLabels: Float32Array;
  testingLabels: Float32Array;
  metadata: {
    inputShape: number[];
    outputShape: number[];
    featureNames?: string[];
    labelNames?: string[];
    preprocessingSteps: DataStep[];
  };
}

export interface TabularData {
  columns: string[];
  data: any[][];
  types: string[];
}

export interface ImageData {
  width: number;
  height: number;
  channels: number;
  data: Uint8Array;
}

export interface AudioData {
  sampleRate: number;
  duration: number;
  data: Float32Array;
}

// CSV Parser for tabular data
export class CSVParser {
  static parse(csvText: string): TabularData {
    if (!csvText || csvText.trim().length === 0) {
      throw new Error("CSV file is empty");
    }

    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error("CSV file must have at least headers and one data row");
    }

    const headers = lines[0].split(',').map(h => h.trim());
    if (headers.length < 2) {
      throw new Error("CSV must have at least 2 columns (features + target)");
    }

    // Check for empty headers
    if (headers.some(h => h === '')) {
      throw new Error("CSV headers cannot be empty");
    }

    const data = lines.slice(1).map((line, rowIndex) => {
      const cells = line.split(',').map(cell => cell.trim());
      
      // Ensure each row has the same number of columns as headers
      if (cells.length !== headers.length) {
        throw new Error(`Row ${rowIndex + 2} has ${cells.length} columns, expected ${headers.length}`);
      }

      return cells.map((cell) => {
        // Try to infer type
        if (cell === '' || cell === 'null' || cell === 'undefined') {
          return null; // Handle missing values
        }
        if (!isNaN(Number(cell))) {
          return Number(cell);
        }
        return cell;
      });
    });

    // Filter out completely empty rows
    const filteredData = data.filter(row => 
      row.some(cell => cell !== null && cell !== '')
    );

    if (filteredData.length === 0) {
      throw new Error("No valid data rows found in CSV");
    }

    const types = headers.map((_, colIndex) => {
      const columnValues = filteredData.map(row => row[colIndex]).filter(v => v !== null);
      const hasNumbers = columnValues.some(v => typeof v === 'number');
      const hasStrings = columnValues.some(v => typeof v === 'string');

      if (hasNumbers && !hasStrings) return 'numeric';
      if (hasStrings && !hasNumbers) return 'categorical';
      return 'mixed';
    });

    console.log("CSV parsed successfully:", {
      rows: filteredData.length,
      columns: headers.length,
      headers: headers,
      types: types
    });

    return { 
      columns: headers, 
      data: filteredData, 
      types: types 
    };
  }
}

// Data Preprocessing Pipeline
export class DataPreprocessor {
  private steps: DataStep[] = [];
  private originalData: any = null;
  private processedData: any = null;

  constructor() {
    this.steps = [];
  }

  // Add a preprocessing step
  addStep(step: Omit<DataStep, 'appliedAt'>): void {
    const newStep: DataStep = {
      ...step,
      appliedAt: Date.now(),
    };
    this.steps.push(newStep);
    this.steps.sort((a, b) => a.order - b.order);
  }

  // Load and parse data
  loadData(rawData: string | File, type: 'csv' | 'json' | 'image' | 'audio'): Promise<any> {
    return new Promise((resolve, reject) => {
      if (type === 'csv') {
        if (typeof rawData === 'string') {
          console.log("Loading CSV from string:", rawData.substring(0, 100) + "...");
          this.originalData = { type: 'tabular', ...CSVParser.parse(rawData) };
          console.log("Data loaded from string:", this.originalData);
          resolve(this.originalData);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
            const csvText = e.target?.result as string;
              console.log("CSV parsed successfully:", csvText.substring(0, 100) + "...");
            this.originalData = { type: 'tabular', ...CSVParser.parse(csvText) };
              console.log("Data loaded:", this.originalData);
            resolve(this.originalData);
            } catch (error) {
              console.error("Error parsing CSV:", error);
              reject(error);
            }
          };
          reader.onerror = (e) => {
            console.error("FileReader error:", e);
            reject(new Error("Failed to read file"));
          };
          reader.readAsText(rawData);
        }
      } else if (type === 'json') {
        if (typeof rawData === 'string') {
          try {
            const parsed = JSON.parse(rawData);
            if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
              // Convert array of objects to tabular
              const columns = Object.keys(parsed[0]);
              const data = parsed.map((row: any) => columns.map(c => row[c] ?? null));
              const types = columns.map((c, idx) => {
                const vals = data.map(r => r[idx]).filter((v: any) => v !== null);
                const hasNumbers = vals.some((v: any) => typeof v === 'number');
                const hasStrings = vals.some((v: any) => typeof v === 'string');
                if (hasNumbers && !hasStrings) return 'numeric';
                if (hasStrings && !hasNumbers) return 'categorical';
                return 'mixed';
              });
              this.originalData = { type: 'tabular', columns, data, types };
            } else {
              this.originalData = { type: 'json', raw: parsed };
            }
          } catch (err) {
            reject(err);
            return;
          }
        } else {
          const reader = new FileReader();
          reader.onload = (e) => {
            const jsonText = e.target?.result as string;
            try {
              const parsed = JSON.parse(jsonText);
              if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
                const columns = Object.keys(parsed[0]);
                const data = parsed.map((row: any) => columns.map(c => row[c] ?? null));
                const types = columns.map((c, idx) => {
                  const vals = data.map((r: any) => r[idx]).filter((v: any) => v !== null);
                  const hasNumbers = vals.some((v: any) => typeof v === 'number');
                  const hasStrings = vals.some((v: any) => typeof v === 'string');
                  if (hasNumbers && !hasStrings) return 'numeric';
                  if (hasStrings && !hasNumbers) return 'categorical';
                  return 'mixed';
                });
                this.originalData = { type: 'tabular', columns, data, types };
              } else {
                this.originalData = { type: 'json', raw: parsed };
              }
            } catch (err) {
              reject(err);
              return;
            }
            resolve(this.originalData);
          };
          reader.readAsText(rawData);
        }
      } else if (type === 'image') {
        if (rawData instanceof File) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d')!;
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              
              const imageData = ctx.getImageData(0, 0, img.width, img.height);
              this.originalData = {
                type: 'image',
                width: img.width,
                height: img.height,
                channels: 4, // RGBA
                data: new Uint8Array(imageData.data),
              };
              resolve(this.originalData);
            };
            img.src = e.target?.result as string;
          };
          reader.readAsDataURL(rawData);
        }
      } else if (type === 'audio') {
        if (rawData instanceof File) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContext.decodeAudioData(e.target?.result as ArrayBuffer).then(audioBuffer => {
              const samples = audioBuffer.getChannelData(0);
              this.originalData = {
                type: 'audio',
                sampleRate: audioBuffer.sampleRate,
                duration: audioBuffer.duration,
                data: new Float32Array(samples),
              };
              resolve(this.originalData);
            });
          };
          reader.readAsArrayBuffer(rawData);
        }
      }
    });
  }

  // Enhanced missing value handling
  handleMissingValues(strategy: 'drop_rows' | 'drop_columns' | 'mean' | 'median' | 'mode' | 'forward_fill' | 'backward_fill', targetColumns?: string[]): void {
    if (!this.originalData || !this.originalData.data) return;

    if (this.originalData.type === 'tabular') {
      const { data, types, columns } = this.originalData;
      
      if (strategy === 'drop_rows') {
        // Remove rows with missing values
        this.originalData.data = data.filter(row => 
          row.every(cell => cell !== null && cell !== undefined && cell !== '')
        );
      } else if (strategy === 'drop_columns') {
        // Remove columns with missing values
        const columnsToKeep: number[] = [];
        types.forEach((type, colIndex) => {
          const hasMissing = data.some(row => 
            row[colIndex] === null || row[colIndex] === undefined || row[colIndex] === ''
          );
          if (!hasMissing) {
            columnsToKeep.push(colIndex);
          }
        });
        
        this.originalData.columns = columnsToKeep.map(i => columns[i]);
        this.originalData.types = columnsToKeep.map(i => types[i]);
        this.originalData.data = data.map(row => columnsToKeep.map(i => row[i]));
      } else if (strategy === 'mean' || strategy === 'median' || strategy === 'mode') {
        // Calculate statistics for numeric columns
        types.forEach((type, colIndex) => {
          if (targetColumns && targetColumns.length > 0 && !targetColumns.includes(columns[colIndex])) return;
          
          if (type === 'numeric') {
            const numericValues = data
              .map(row => row[colIndex])
              .filter(v => typeof v === 'number' && !isNaN(v));
            
            let replacementValue = 0;
            if (strategy === 'mean') {
              replacementValue = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
            } else if (strategy === 'median') {
              const sorted = [...numericValues].sort((a, b) => a - b);
              replacementValue = sorted[Math.floor(sorted.length / 2)];
            } else if (strategy === 'mode') {
              const frequency: { [key: number]: number } = {};
              numericValues.forEach(val => {
                frequency[val] = (frequency[val] || 0) + 1;
              });
              replacementValue = Object.keys(frequency).reduce((a, b) => 
                frequency[parseFloat(a)] > frequency[parseFloat(b)] ? a : b
              );
            }
            
            data.forEach(row => {
              if (row[colIndex] === null || row[colIndex] === undefined || row[colIndex] === '') {
                row[colIndex] = replacementValue;
              }
            });
          } else if (type === 'categorical') {
            // For categorical, use mode
            const categoricalValues = data
              .map(row => row[colIndex])
              .filter(v => v !== null && v !== undefined && v !== '');
            
            const frequency: { [key: string]: number } = {};
            categoricalValues.forEach(val => {
              frequency[val] = (frequency[val] || 0) + 1;
            });
            
            const mode = Object.keys(frequency).reduce((a, b) => 
              frequency[a] > frequency[b] ? a : b
            );
            
            data.forEach(row => {
              if (row[colIndex] === null || row[colIndex] === undefined || row[colIndex] === '') {
                row[colIndex] = mode;
              }
            });
          }
        });
      } else if (strategy === 'forward_fill' || strategy === 'backward_fill') {
        // Forward/backward fill for time series data
        types.forEach((type, colIndex) => {
          if (targetColumns && targetColumns.length > 0 && !targetColumns.includes(columns[colIndex])) return;
          
          if (strategy === 'forward_fill') {
            let lastValidValue = null;
            data.forEach(row => {
              if (row[colIndex] !== null && row[colIndex] !== undefined && row[colIndex] !== '') {
                lastValidValue = row[colIndex];
              } else if (lastValidValue !== null) {
                row[colIndex] = lastValidValue;
              }
            });
          } else if (strategy === 'backward_fill') {
            let nextValidValue = null;
            for (let i = data.length - 1; i >= 0; i--) {
              if (data[i][colIndex] !== null && data[i][colIndex] !== undefined && data[i][colIndex] !== '') {
                nextValidValue = data[i][colIndex];
              } else if (nextValidValue !== null) {
                data[i][colIndex] = nextValidValue;
              }
            }
          }
        });
      }
    }

    this.addStep({
      id: `missing_${Date.now()}`,
      type: 'handle_missing',
      parameters: { strategy, targetColumns },
      order: this.steps.length,
    });
  }

  // Enhanced data normalization
  normalizeData(method: 'minmax' | 'zscore' | 'robust', targetColumns?: string[]): void {
    if (!this.originalData || !this.originalData.data) return;

    if (this.originalData.type === 'tabular') {
      const { data, types, columns } = this.originalData;
      
      types.forEach((type, colIndex) => {
        if (targetColumns && targetColumns.length > 0 && !targetColumns.includes(columns[colIndex])) return;
        if (type === 'numeric') {
          const values = data.map(row => row[colIndex]).filter(v => typeof v === 'number' && !isNaN(v));
          
          if (values.length === 0) return;
          
          if (method === 'minmax') {
            const min = Math.min(...values);
            const max = Math.max(...values);
            const range = max - min || 1; // Avoid division by zero
            
            data.forEach(row => {
              if (typeof row[colIndex] === 'number' && !isNaN(row[colIndex])) {
              row[colIndex] = (row[colIndex] - min) / range;
              }
            });
          } else if (method === 'zscore') {
            const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            const std = Math.sqrt(variance) || 1; // Avoid division by zero
            
            data.forEach(row => {
              if (typeof row[colIndex] === 'number' && !isNaN(row[colIndex])) {
              row[colIndex] = (row[colIndex] - mean) / std;
              }
            });
          } else if (method === 'robust') {
            const sorted = [...values].sort((a, b) => a - b);
            const q1 = sorted[Math.floor(0.25 * (sorted.length - 1))];
            const q3 = sorted[Math.floor(0.75 * (sorted.length - 1))];
            const median = sorted[Math.floor(0.5 * (sorted.length - 1))];
            const iqr = q3 - q1 || 1; // Avoid division by zero
            
            data.forEach(row => {
              if (typeof row[colIndex] === 'number' && !isNaN(row[colIndex])) {
                row[colIndex] = (row[colIndex] - median) / iqr;
              }
            });
          }
        }
      });
    }

    this.addStep({
      id: `normalize_${Date.now()}`,
      type: 'normalize',
      parameters: { method, targetColumns },
      order: this.steps.length,
    });
  }

  // Enhanced categorical encoding
  encodeCategorical(method: 'onehot' | 'label' | 'target', targetColumns?: string[], targetColumn?: string): void {
    if (!this.originalData || !this.originalData.data) return;

    if (this.originalData.type === 'tabular') {
      const { data, types, columns } = this.originalData;
      
      const categoricalColumns = types
        .map((type, index) => (type === 'categorical' ? index : -1))
        .filter(index => index !== -1)
        .filter(index => !targetColumns || targetColumns.includes(columns[index]));

      if (method === 'onehot') {
        // Precompute unique values per targeted categorical column
        const uniquesPerCol = new Map<number, any[]>(
          categoricalColumns.map((colIndex) => [colIndex, [...new Set(data.map((r: any[]) => r[colIndex]))]])
        );

        // Build expanded column schema once
        const expandedColumns: string[] = [];
        const expandedTypes: string[] = [] as any;
        types.forEach((type, colIndex) => {
          const colName = columns[colIndex];
          const isTargeted = !targetColumns || targetColumns.includes(colName);
          if (type === 'numeric' || (type === 'categorical' && !isTargeted)) {
            expandedColumns.push(colName);
            expandedTypes.push(type);
          } else if (type === 'categorical' && isTargeted) {
            const uniques = uniquesPerCol.get(colIndex) || [];
            uniques.forEach((value, i) => {
              // stable, unique names for React keys and schema
              expandedColumns.push(`${colName}_${value}`);
              expandedTypes.push('numeric');
            });
          }
        });

        // Transform all rows according to expanded schema
        const newData: any[][] = data.map((row: any[]) => {
          const newRow: any[] = [];
          types.forEach((type, colIndex) => {
            const colName = columns[colIndex];
            const isTargeted = !targetColumns || targetColumns.includes(colName);
            if (type === 'numeric' || (type === 'categorical' && !isTargeted)) {
              newRow.push(row[colIndex]);
            } else if (type === 'categorical' && isTargeted) {
              const uniques = uniquesPerCol.get(colIndex) || [];
              uniques.forEach((value) => newRow.push(row[colIndex] === value ? 1 : 0));
            }
          });
          return newRow;
        });

        this.originalData.columns = expandedColumns;
        this.originalData.data = newData;
        this.originalData.types = expandedTypes as any;
      } else if (method === 'label') {
        // Label encoding per categorical column
        categoricalColumns.forEach(colIndex => {
          const uniqueValues = [...new Set(data.map((r: any[]) => r[colIndex]))];
          const map = new Map(uniqueValues.map((v, i) => [v, i]));
          data.forEach((row: any[]) => {
            const v = row[colIndex];
            row[colIndex] = map.get(v) ?? 0;
          });
          this.originalData.types[colIndex] = 'numeric';
        });
      } else if (method === 'target') {
        // Target encoding: replace categorical with mean of target
        if (!targetColumn) {
          throw new Error('Target column must be specified for target encoding');
        }
        
        const targetIndex = columns.indexOf(targetColumn);
        if (targetIndex === -1) {
          throw new Error(`Target column '${targetColumn}' not found`);
        }
        
        categoricalColumns.forEach(colIndex => {
          const stats = new Map<any, { sum: number; count: number }>();
          data.forEach((row: any[]) => {
            const key = row[colIndex];
            const y = typeof row[targetIndex] === 'number' ? row[targetIndex] : 0;
            const s = stats.get(key) || { sum: 0, count: 0 };
            s.sum += y; s.count += 1; stats.set(key, s);
          });
          
          // Calculate means with smoothing to avoid overfitting
          const globalMean = data.reduce((sum, row) => sum + (typeof row[targetIndex] === 'number' ? row[targetIndex] : 0), 0) / data.length;
          const smoothing = 10; // Smoothing parameter
          
          const means = new Map<any, number>([...stats.entries()].map(([k, v]) => {
            const localMean = v.sum / Math.max(1, v.count);
            const weight = v.count / (v.count + smoothing);
            return [k, weight * localMean + (1 - weight) * globalMean];
          }));
          
          data.forEach((row: any[]) => {
            const key = row[colIndex];
            row[colIndex] = means.get(key) ?? globalMean;
          });
          this.originalData.types[colIndex] = 'numeric';
        });
      }
    }

    this.addStep({
      id: `encode_${Date.now()}`,
      type: 'encode_categorical',
      parameters: { method, targetColumns, targetColumn },
      order: this.steps.length,
    });
  }

  // Enhanced outlier detection and clipping
  clipOutliers(options: { 
    method: 'iqr' | 'zscore' | 'percentile'; 
    threshold?: number;
    lowerPercentile?: number; 
    upperPercentile?: number;
    targetColumns?: string[];
  }): void {
    if (!this.originalData || !this.originalData.data) return;
    if (this.originalData.type !== 'tabular') return;

    const { data, types, columns } = this.originalData;
    const method = options.method;
    const threshold = options.threshold ?? 3; // Default z-score threshold
    const lowerP = options.lowerPercentile ?? 1;
    const upperP = options.upperPercentile ?? 99;

    const percentile = (arr: number[], p: number) => {
      const sorted = [...arr].sort((a, b) => a - b);
      const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * (sorted.length - 1))));
      return sorted[idx];
    };

    types.forEach((type: string, colIndex: number) => {
      if (type !== 'numeric') return;
      if (options.targetColumns && options.targetColumns.length > 0 && !options.targetColumns.includes(columns[colIndex])) return;
      
      const values = data.map((row: any[]) => row[colIndex]).filter((v: any) => typeof v === 'number' && !isNaN(v));
      if (values.length === 0) return;
      
      if (method === 'iqr') {
        const sorted = [...values].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(0.25 * (sorted.length - 1))];
        const q3 = sorted[Math.floor(0.75 * (sorted.length - 1))];
        const iqr = q3 - q1 || 1; // Avoid division by zero
        const minV = q1 - 1.5 * iqr;
        const maxV = q3 + 1.5 * iqr;
        data.forEach((row: any[]) => {
          const v = row[colIndex];
          if (typeof v === 'number' && !isNaN(v)) {
            row[colIndex] = Math.min(Math.max(v, minV), maxV);
          }
        });
      } else if (method === 'zscore') {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const std = Math.sqrt(variance) || 1; // Avoid division by zero
        
        data.forEach((row: any[]) => {
          const v = row[colIndex];
          if (typeof v === 'number' && !isNaN(v)) {
            const zScore = Math.abs((v - mean) / std);
            if (zScore > threshold) {
              // Clip to threshold
              const clippedValue = v > mean ? mean + threshold * std : mean - threshold * std;
              row[colIndex] = clippedValue;
            }
          }
        });
      } else if (method === 'percentile') {
        const lo = percentile(values, lowerP);
        const hi = percentile(values, upperP);
        data.forEach((row: any[]) => {
          const v = row[colIndex];
          if (typeof v === 'number' && !isNaN(v)) {
            row[colIndex] = Math.min(Math.max(v, lo), hi);
          }
        });
      }
    });

    this.addStep({
      id: `outlier_${Date.now()}`,
      type: 'feature_engineering',
      parameters: { 
        action: 'clip_outliers', 
        method, 
        threshold,
        lowerPercentile: lowerP, 
        upperPercentile: upperP,
        targetColumns: options.targetColumns
      },
      order: this.steps.length,
    });
  }

  // Split data into training/validation/testing sets
  splitData(splitRatios: { train: number; validation: number; test: number }): void {
    if (!this.originalData || !this.originalData.data) return;

    const { data } = this.originalData;
    const totalRows = data.length;
    
    const trainSize = Math.floor(totalRows * splitRatios.train);
    const validationSize = Math.floor(totalRows * splitRatios.validation);
    
    // Shuffle data
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    
    const trainingData = shuffled.slice(0, trainSize);
    const validationData = shuffled.slice(trainSize, trainSize + validationSize);
    const testingData = shuffled.slice(trainSize + validationSize);

    this.processedData = {
      training: trainingData,
      validation: validationData,
      testing: testingData,
    };

    this.addStep({
      id: `split_${Date.now()}`,
      type: 'split_data',
      parameters: { splitRatios },
      order: this.steps.length,
    });
  }

  // Convert to tensors
  convertToTensors(): ProcessedData {
    if (!this.processedData) {
      throw new Error('Data must be split before converting to tensors');
    }

    const { training, validation, testing } = this.processedData;
    
    // For tabular data, separate features and labels
    // Assume last column is the target variable
    const featureColumns = this.originalData.columns.slice(0, -1);
    const labelColumn = this.originalData.columns[this.originalData.columns.length - 1];

    const extractFeatures = (data: any[][]) => {
      return data.map(row => 
        row.slice(0, -1).map(val => typeof val === 'number' ? val : 0)
      ).flat();
    };

    const extractLabels = (data: any[][]) => {
      return data.map(row => {
        const label = row[row.length - 1];
        return typeof label === 'number' ? label : 0;
      });
    };

    const trainingFeatures = extractFeatures(training);
    const validationFeatures = extractFeatures(validation);
    const testingFeatures = extractFeatures(testing);

    const trainingLabels = extractLabels(training);
    const validationLabels = extractLabels(validation);
    const testingLabels = extractLabels(testing);

    this.addStep({
      id: `tensor_${Date.now()}`,
      type: 'convert_to_tensor',
      parameters: { featureColumns, labelColumn },
      order: this.steps.length,
    });

    return {
      trainingData: new Float32Array(trainingFeatures),
      validationData: new Float32Array(validationFeatures),
      testingData: new Float32Array(testingFeatures),
      trainingLabels: new Float32Array(trainingLabels),
      validationLabels: new Float32Array(validationLabels),
      testingLabels: new Float32Array(testingLabels),
      metadata: {
        inputShape: [featureColumns.length],
        outputShape: [1],
        featureNames: featureColumns,
        labelNames: [labelColumn],
        preprocessingSteps: this.steps,
      },
    };
  }

  // Get preprocessing steps
  getSteps(): DataStep[] {
    return [...this.steps];
  }

  // Expose current columns (tabular)
  getColumns(): string[] {
    if (!this.originalData || this.originalData.type !== 'tabular') return [];
    return [...this.originalData.columns];
  }

  // Get numeric column values (tabular)
  getNumericColumnValues(columnName: string): number[] {
    if (!this.originalData || this.originalData.type !== 'tabular') return [];
    const idx = this.originalData.columns.indexOf(columnName);
    if (idx === -1) return [];
    return this.originalData.data
      .map((row: any[]) => row[idx])
      .filter((v: any) => typeof v === 'number' && !Number.isNaN(v));
  }

  // Return a lightweight tabular preview of rows
  getTabularPreview(maxRows: number = 50): { columns: string[]; rows: any[][] } {
    if (!this.originalData || this.originalData.type !== 'tabular') return { columns: [], rows: [] };
    const rows = this.originalData.data.slice(0, Math.max(0, maxRows));
    return { columns: [...this.originalData.columns], rows };
  }

  // Get full tabular data
  getTabularData(): { columns: string[]; rows: any[][] } {
    if (!this.originalData || this.originalData.type !== 'tabular') return { columns: [], rows: [] };
    return { columns: [...this.originalData.columns], rows: [...this.originalData.data] };
  }

  // Compute column statistics
  computeColumnStats(): Array<{
    column: string;
    type: string;
    count: number;
    missing: number;
    unique: number;
    min?: number;
    max?: number;
    mean?: number;
    std?: number;
  }> {
    if (!this.originalData || this.originalData.type !== 'tabular') return [];
    const { columns, data, types } = this.originalData;
    const n = data.length;
    return columns.map((col: string, idx: number) => {
      const colVals = data.map((row: any[]) => row[idx]);
      const missing = colVals.filter((v: any) => v === null || v === undefined || v === '').length;
      const present = colVals.filter((v: any) => v !== null && v !== undefined && v !== '').length;
      const unique = new Set(colVals.filter((v: any) => v !== null && v !== undefined)).size;
      if (types[idx] === 'numeric') {
        const nums = colVals.filter((v: any) => typeof v === 'number') as number[];
        const min = nums.length ? Math.min(...nums) : undefined;
        const max = nums.length ? Math.max(...nums) : undefined;
        const mean = nums.length ? nums.reduce((s, v) => s + v, 0) / nums.length : undefined;
        const variance = nums.length ? nums.reduce((s, v) => s + Math.pow(v - (mean as number), 2), 0) / nums.length : undefined;
        const std = variance !== undefined ? Math.sqrt(variance) : undefined;
        return { column: col, type: types[idx], count: present, missing, unique, min, max, mean, std };
      }
      return { column: col, type: types[idx], count: present, missing, unique };
    });
  }

  // Return preview rows of current split sets
  getSplitPreview(maxRows: number = 10): { columns: string[]; training: any[][]; validation: any[][]; testing: any[][] } {
    if (!this.originalData || this.originalData.type !== 'tabular' || !this.processedData) {
      return { columns: this.originalData?.columns ?? [], training: [], validation: [], testing: [] };
    }
    const { training, validation, testing } = this.processedData;
    return {
      columns: [...this.originalData.columns],
      training: training.slice(0, maxRows),
      validation: validation.slice(0, maxRows),
      testing: testing.slice(0, maxRows),
    };
  }

  // Export data to CSV format
  exportToCSV(): string {
    if (!this.originalData || this.originalData.type !== 'tabular') {
      throw new Error('No tabular data to export');
    }
    
    const { columns, data } = this.originalData;
    const csvRows = [columns.join(',')];
    
    data.forEach(row => {
      const csvRow = row.map(cell => {
        if (cell === null || cell === undefined) return '';
        if (typeof cell === 'string' && cell.includes(',')) {
          return `"${cell}"`;
        }
        return cell;
      });
      csvRows.push(csvRow.join(','));
    });
    
    return csvRows.join('\n');
  }

  // Export data to JSON format
  exportToJSON(): string {
    if (!this.originalData || this.originalData.type !== 'tabular') {
      throw new Error('No tabular data to export');
    }
    
    const { columns, data } = this.originalData;
    const jsonData = data.map(row => {
      const obj: { [key: string]: any } = {};
      columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj;
    });
    
    return JSON.stringify(jsonData, null, 2);
  }

  // Get processed data (if available)
  getProcessedData(): any {
    return this.processedData;
  }

  // Reset pipeline
  reset(): void {
    this.steps = [];
    this.processedData = null;
  }
}

// Utility functions for data visualization
export class DataVisualizer {
  static createHistogram(data: number[], bins: number = 20): { bins: number[]; counts: number[] } {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binSize = (max - min) / bins;
    
    const histogram = new Array(bins).fill(0);
    
    data.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
      histogram[binIndex]++;
    });
    
    const binCenters = Array.from({ length: bins }, (_, i) => min + (i + 0.5) * binSize);
    
    return { bins: binCenters, counts: histogram };
  }

  static createScatterPlot(xData: number[], yData: number[]): { x: number[]; y: number[] } {
    return { x: xData, y: yData };
  }

  static createCorrelationMatrix(data: number[][]): number[][] {
    const n = data[0].length;
    const correlationMatrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          correlationMatrix[i][j] = 1;
        } else {
          correlationMatrix[i][j] = this.calculateCorrelation(
            data.map(row => row[i]),
            data.map(row => row[j])
          );
        }
      }
    }
    
    return correlationMatrix;
  }

  static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;
    
    const numerator = x.reduce((sum, val, i) => sum + (val - xMean) * (y[i] - yMean), 0);
    const xVariance = x.reduce((sum, val) => sum + Math.pow(val - xMean, 2), 0);
    const yVariance = y.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    
    const denominator = Math.sqrt(xVariance * yVariance);
    
    return denominator === 0 ? 0 : numerator / denominator;
  }

  // Methods for the workbench
  generateHistogramData(tabularData: { columns: string[]; rows: any[][] }, columnName: string): any[] {
    const columnIndex = tabularData.columns.indexOf(columnName);
    if (columnIndex === -1) return [];
    
    const values = tabularData.rows
      .map(row => row[columnIndex])
      .filter(val => typeof val === 'number' && !isNaN(val));
    
    if (values.length === 0) return [];
    
    const histogram = DataVisualizer.createHistogram(values, 10);
    return histogram.bins.map((bin, i) => ({
      bin: bin.toFixed(1),
      count: histogram.counts[i]
    }));
  }

  generateScatterData(tabularData: { columns: string[]; rows: any[][] }, xColumn: string, yColumn: string): any[] {
    const xIndex = tabularData.columns.indexOf(xColumn);
    const yIndex = tabularData.columns.indexOf(yColumn);
    
    if (xIndex === -1 || yIndex === -1) return [];
    
    return tabularData.rows
      .filter(row => typeof row[xIndex] === 'number' && typeof row[yIndex] === 'number')
      .map(row => ({
        x: row[xIndex],
        y: row[yIndex]
      }));
  }

  generateCorrelationMatrix(tabularData: { columns: string[]; rows: any[][] }, numericColumns: string[]): any[] {
    if (numericColumns.length < 2) return [];
    
    const columnIndices = numericColumns.map(col => tabularData.columns.indexOf(col));
    const numericData = tabularData.rows
      .map(row => columnIndices.map(idx => row[idx]))
      .filter(row => row.every(val => typeof val === 'number' && !isNaN(val)));
    
    if (numericData.length === 0) return [];
    
    const correlations: any[] = [];
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const x = numericData.map(row => row[i]);
        const y = numericData.map(row => row[j]);
        const correlation = DataVisualizer.calculateCorrelation(x, y);
        correlations.push({
          pair: `${numericColumns[i]} vs ${numericColumns[j]}`,
          correlation: correlation
        });
      }
    }
    
    return correlations;
  }
}

// Export the main class
export default DataPreprocessor;
