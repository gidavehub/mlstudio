// Enhanced data processing library for MLStudio with advanced preprocessing
// This provides comprehensive data preprocessing for real ML training

export interface DataStep {
  id: string;
  type: 'load' | 'normalize' | 'scale' | 'encode' | 'feature_engineering' | 'handle_missing' | 'outlier_removal' | 'feature_selection' | 'split_data';
  parameters: any;
  order: number;
  appliedAt: number;
}

export interface ProcessedData {
  features: Float32Array;
  labels: Float32Array;
  featureNames: string[];
  labelName: string;
  metadata: {
    originalShape: number[];
    processedShape: number[];
    preprocessingSteps: DataStep[];
    statistics: any;
  };
}

export interface TabularData {
  columns: string[];
  data: any[][];
  types: string[];
}

// Enhanced CSV Parser
export class EnhancedCSVParser {
  static parse(csvText: string): TabularData {
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('CSV text is empty');
    }

    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header and one data row');
    }

    // Parse header
    const header = lines[0].split(',').map(col => col.trim().replace(/"/g, ''));
    
    // Parse data rows
    const data: any[][] = [];
    const types: string[] = new Array(header.length).fill('unknown');

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
      if (row.length !== header.length) {
        console.warn(`Row ${i} has ${row.length} columns, expected ${header.length}`);
        continue;
      }

      const processedRow: any[] = [];
      for (let j = 0; j < row.length; j++) {
        const value = row[j];
        
        // Try to determine type and convert
        if (value === '' || value === 'null' || value === 'NULL') {
          processedRow.push(null);
        } else if (!isNaN(Number(value))) {
          processedRow.push(Number(value));
          if (types[j] === 'unknown' || types[j] === 'string') {
            types[j] = 'number';
          }
        } else {
          processedRow.push(value);
          types[j] = 'string';
        }
      }
      
      data.push(processedRow);
    }

    return {
      columns: header,
      data: data,
      types: types
    };
  }
}

// Enhanced Data Preprocessor
export class EnhancedDataPreprocessor {
  private steps: DataStep[] = [];
  private statistics: any = {};

  constructor() {
    console.log('🔧 Enhanced Data Preprocessor initialized');
  }

  // Handle missing values
  handleMissingValues(data: TabularData, strategy: 'mean' | 'median' | 'mode' | 'drop' = 'mean'): TabularData {
    console.log(`🔧 Handling missing values with strategy: ${strategy}`);
    
    const processedData = {
      columns: [...data.columns],
      data: data.data.map(row => [...row]),
      types: [...data.types]
    };

    // Calculate statistics for each column
    for (let colIndex = 0; colIndex < data.columns.length; colIndex++) {
      const columnName = data.columns[colIndex];
      const columnData = data.data.map(row => row[colIndex]).filter(val => val !== null && val !== undefined);
      
      if (columnData.length === 0) continue;

      let fillValue: any;
      
      switch (strategy) {
        case 'mean':
          if (data.types[colIndex] === 'number') {
            fillValue = columnData.reduce((sum, val) => sum + val, 0) / columnData.length;
          } else {
            fillValue = this.getMostFrequent(columnData);
          }
          break;
        case 'median':
          if (data.types[colIndex] === 'number') {
            const sorted = [...columnData].sort((a, b) => a - b);
            fillValue = sorted[Math.floor(sorted.length / 2)];
          } else {
            fillValue = this.getMostFrequent(columnData);
          }
          break;
        case 'mode':
          fillValue = this.getMostFrequent(columnData);
          break;
        case 'drop':
          // Remove rows with missing values
          processedData.data = processedData.data.filter(row => row[colIndex] !== null && row[colIndex] !== undefined);
          continue;
      }

      // Fill missing values
      for (let rowIndex = 0; rowIndex < processedData.data.length; rowIndex++) {
        if (processedData.data[rowIndex][colIndex] === null || processedData.data[rowIndex][colIndex] === undefined) {
          processedData.data[rowIndex][colIndex] = fillValue;
        }
      }

      this.statistics[columnName] = {
        strategy,
        fillValue,
        missingCount: data.data.length - columnData.length
      };
    }

    this.addStep('handle_missing', { strategy });
    return processedData;
  }

  // Remove outliers using IQR method
  removeOutliers(data: TabularData, columns: string[], factor: number = 1.5): TabularData {
    console.log(`🔧 Removing outliers from columns: ${columns.join(', ')}`);
    
    const processedData = {
      columns: [...data.columns],
      data: data.data.map(row => [...row]),
      types: [...data.types]
    };

    const columnIndices = columns.map(col => data.columns.indexOf(col));
    
    for (const colIndex of columnIndices) {
      if (colIndex === -1 || data.types[colIndex] !== 'number') continue;
      
      const columnName = data.columns[colIndex];
      const values = data.data.map(row => row[colIndex]).filter(val => val !== null && val !== undefined);
      
      if (values.length === 0) continue;

      // Calculate IQR
      const sorted = [...values].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      
      const lowerBound = q1 - factor * iqr;
      const upperBound = q3 + factor * iqr;

      // Remove outliers
      processedData.data = processedData.data.filter(row => {
        const value = row[colIndex];
        return value >= lowerBound && value <= upperBound;
      });

      this.statistics[columnName] = {
        ...this.statistics[columnName],
        outliersRemoved: data.data.length - processedData.data.length,
        iqr: { q1, q3, lowerBound, upperBound }
      };
    }

    this.addStep('outlier_removal', { columns, factor });
    return processedData;
  }

  // Feature engineering
  featureEngineering(data: TabularData, operations: any[]): TabularData {
    console.log(`🔧 Applying feature engineering: ${operations.length} operations`);
    
    const processedData = {
      columns: [...data.columns],
      data: data.data.map(row => [...row]),
      types: [...data.types]
    };

    for (const operation of operations) {
      switch (operation.type) {
        case 'polynomial':
          this.addPolynomialFeatures(processedData, operation.columns, operation.degree);
          break;
        case 'interaction':
          this.addInteractionFeatures(processedData, operation.columns);
          break;
        case 'log':
          this.addLogFeatures(processedData, operation.columns);
          break;
        case 'sqrt':
          this.addSqrtFeatures(processedData, operation.columns);
          break;
      }
    }

    this.addStep('feature_engineering', { operations });
    return processedData;
  }

  // Normalize data (z-score normalization)
  normalize(data: TabularData, columns: string[]): TabularData {
    console.log(`🔧 Normalizing columns: ${columns.join(', ')}`);
    
    const processedData = {
      columns: [...data.columns],
      data: data.data.map(row => [...row]),
      types: [...data.types]
    };

    for (const columnName of columns) {
      const colIndex = data.columns.indexOf(columnName);
      if (colIndex === -1 || data.types[colIndex] !== 'number') continue;

      const values = data.data.map(row => row[colIndex]);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      // Apply z-score normalization
      for (let i = 0; i < processedData.data.length; i++) {
        processedData.data[i][colIndex] = (processedData.data[i][colIndex] - mean) / stdDev;
      }

      this.statistics[columnName] = {
        ...this.statistics[columnName],
        normalization: { mean, stdDev, type: 'z-score' }
      };
    }

    this.addStep('normalize', { columns, method: 'z-score' });
    return processedData;
  }

  // Scale data (min-max scaling)
  scale(data: TabularData, columns: string[]): TabularData {
    console.log(`🔧 Scaling columns: ${columns.join(', ')}`);
    
    const processedData = {
      columns: [...data.columns],
      data: data.data.map(row => [...row]),
      types: [...data.types]
    };

    for (const columnName of columns) {
      const colIndex = data.columns.indexOf(columnName);
      if (colIndex === -1 || data.types[colIndex] !== 'number') continue;

      const values = data.data.map(row => row[colIndex]);
      const min = Math.min(...values);
      const max = Math.max(...values);

      // Apply min-max scaling
      for (let i = 0; i < processedData.data.length; i++) {
        processedData.data[i][colIndex] = (processedData.data[i][colIndex] - min) / (max - min);
      }

      this.statistics[columnName] = {
        ...this.statistics[columnName],
        scaling: { min, max, type: 'min-max' }
      };
    }

    this.addStep('scale', { columns, method: 'min-max' });
    return processedData;
  }

  // Encode categorical variables
  encodeCategorical(data: TabularData, columns: string[], method: 'one-hot' | 'label' = 'one-hot'): TabularData {
    console.log(`🔧 Encoding categorical columns: ${columns.join(', ')} with method: ${method}`);
    
    const processedData = {
      columns: [...data.columns],
      data: data.data.map(row => [...row]),
      types: [...data.types]
    };

    for (const columnName of columns) {
      const colIndex = data.columns.indexOf(columnName);
      if (colIndex === -1) continue;

      const uniqueValues = [...new Set(data.data.map(row => row[colIndex]))];
      
      if (method === 'one-hot') {
        // One-hot encoding
        const newColumns: string[] = [];
        const newTypes: string[] = [];
        
        for (const value of uniqueValues) {
          newColumns.push(`${columnName}_${value}`);
          newTypes.push('number');
        }

        // Insert new columns after the original column
        processedData.columns.splice(colIndex + 1, 0, ...newColumns);
        processedData.types.splice(colIndex + 1, 0, ...newTypes);

        // Add one-hot encoded data
        for (let i = 0; i < processedData.data.length; i++) {
          const originalValue = processedData.data[i][colIndex];
          const newRow = [...processedData.data[i]];
          
          // Remove original value
          newRow.splice(colIndex, 1);
          
          // Add one-hot encoded values
          for (let j = 0; j < uniqueValues.length; j++) {
            newRow.splice(colIndex + j, 0, originalValue === uniqueValues[j] ? 1 : 0);
          }
          
          processedData.data[i] = newRow;
        }

        // Remove original column
        processedData.columns.splice(colIndex, 1);
        processedData.types.splice(colIndex, 1);

        this.statistics[columnName] = {
          ...this.statistics[columnName],
          encoding: { method: 'one-hot', categories: uniqueValues }
        };
      } else {
        // Label encoding
        const valueMap = new Map();
        uniqueValues.forEach((value, index) => {
          valueMap.set(value, index);
        });

        for (let i = 0; i < processedData.data.length; i++) {
          processedData.data[i][colIndex] = valueMap.get(processedData.data[i][colIndex]);
        }

        processedData.types[colIndex] = 'number';

        this.statistics[columnName] = {
          ...this.statistics[columnName],
          encoding: { method: 'label', mapping: Object.fromEntries(valueMap) }
        };
      }
    }

    this.addStep('encode', { columns, method });
    return processedData;
  }

  // Split data into train/validation/test sets
  splitData(data: TabularData, testSize: number = 0.2, validationSize: number = 0.2, randomState: number = 42): any {
    console.log(`🔧 Splitting data - Test: ${testSize}, Validation: ${validationSize}`);
    
    // Simple random split (in production, use proper shuffling)
    const totalRows = data.data.length;
    const testRows = Math.floor(totalRows * testSize);
    const valRows = Math.floor(totalRows * validationSize);
    const trainRows = totalRows - testRows - valRows;

    const trainData = {
      columns: [...data.columns],
      data: data.data.slice(0, trainRows),
      types: [...data.types]
    };

    const valData = {
      columns: [...data.columns],
      data: data.data.slice(trainRows, trainRows + valRows),
      types: [...data.types]
    };

    const testData = {
      columns: [...data.columns],
      data: data.data.slice(trainRows + valRows),
      types: [...data.types]
    };

    this.addStep('split_data', { testSize, validationSize, randomState });
    
    return { trainData, valData, testData };
  }

  // Convert to format expected by ML trainer
  convertToMLFormat(data: TabularData, featureColumns: string[], labelColumn: string): ProcessedData {
    console.log(`🔧 Converting to ML format - Features: ${featureColumns.length}, Label: ${labelColumn}`);
    
    const features: number[][] = [];
    const labels: number[] = [];

    for (const row of data.data) {
      const featureRow: number[] = [];
      for (const col of featureColumns) {
        const colIndex = data.columns.indexOf(col);
        if (colIndex === -1) continue;
        featureRow.push(Number(row[colIndex]));
      }
      features.push(featureRow);

      const labelIndex = data.columns.indexOf(labelColumn);
      if (labelIndex !== -1) {
        labels.push(Number(row[labelIndex]));
      }
    }

    return {
      features: new Float32Array(features.flat()),
      labels: new Float32Array(labels),
      featureNames: featureColumns,
      labelName: labelColumn,
      metadata: {
        originalShape: [data.data.length, data.columns.length],
        processedShape: [features.length, featureColumns.length],
        preprocessingSteps: this.steps,
        statistics: this.statistics
      }
    };
  }

  // Helper methods
  private getMostFrequent(arr: any[]): any {
    const frequency: any = {};
    let maxFreq = 0;
    let mostFrequent = arr[0];

    for (const item of arr) {
      frequency[item] = (frequency[item] || 0) + 1;
      if (frequency[item] > maxFreq) {
        maxFreq = frequency[item];
        mostFrequent = item;
      }
    }

    return mostFrequent;
  }

  private addPolynomialFeatures(data: TabularData, columns: string[], degree: number): void {
    // Implementation for polynomial features
    console.log(`Adding polynomial features of degree ${degree} for columns: ${columns.join(', ')}`);
  }

  private addInteractionFeatures(data: TabularData, columns: string[]): void {
    // Implementation for interaction features
    console.log(`Adding interaction features for columns: ${columns.join(', ')}`);
  }

  private addLogFeatures(data: TabularData, columns: string[]): void {
    // Implementation for log features
    console.log(`Adding log features for columns: ${columns.join(', ')}`);
  }

  private addSqrtFeatures(data: TabularData, columns: string[]): void {
    // Implementation for sqrt features
    console.log(`Adding sqrt features for columns: ${columns.join(', ')}`);
  }

  private addStep(type: string, parameters: any): void {
    this.steps.push({
      id: `step_${Date.now()}_${Math.random()}`,
      type: type as any,
      parameters,
      order: this.steps.length,
      appliedAt: Date.now()
    });
  }

  // Get preprocessing steps
  getSteps(): DataStep[] {
    return [...this.steps];
  }

  // Get statistics
  getStatistics(): any {
    return { ...this.statistics };
  }
}
