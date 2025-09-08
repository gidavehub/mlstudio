// Mock Payment System - Simulates KALE tokens, Reflector pricing, and marketplace functionality
// This creates realistic demo data without real blockchain integration

export interface MockKaleBalance {
  total: number;
  staked: number;
  available: number;
  pending: number;
  usdValue: number;
}

export interface MockPriceFeed {
  asset: string;
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: number;
  source: string;
  confidence: number;
}

export interface MockTransaction {
  id: string;
  type: 'reward' | 'stake' | 'unstake' | 'transfer' | 'contribution' | 'purchase' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  description: string;
  hash?: string;
  fromAddress?: string;
  toAddress?: string;
}

export interface MockDataset {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  size: number;
  format: string;
  price: number; // in KALE tokens
  rating: number;
  reviewCount: number;
  downloadCount: number;
  isVerified: boolean;
  isActive: boolean;
  ownerId: string;
  ownerName: string;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  preview?: any;
}

export interface MockContribution {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  status: 'draft' | 'pending' | 'under_review' | 'approved' | 'rejected';
  rewardAmount?: number;
  reviewNotes?: string;
  createdAt: number;
  updatedAt: number;
  fileSize: number;
  format: string;
}

export interface MockValidationRequest {
  id: string;
  contributorId: string;
  contributorName: string;
  datasetName: string;
  description: string;
  category: string;
  tags: string[];
  contributionType: 'new_dataset' | 'data_addition' | 'correction';
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewNotes?: string;
  rewardAmount?: number;
  createdAt: number;
  updatedAt: number;
  fileSize: number;
  format: string;
}

// Mock Data Generator
export class MockPaymentSystem {
  private static instance: MockPaymentSystem;
  private priceFeeds: MockPriceFeed[] = [];
  private transactions: MockTransaction[] = [];
  private datasets: MockDataset[] = [];
  private contributions: MockContribution[] = [];
  private validationRequests: MockValidationRequest[] = [];

  private constructor() {
    this.initializeMockData();
    this.startPriceUpdates();
  }

  public static getInstance(): MockPaymentSystem {
    if (!MockPaymentSystem.instance) {
      MockPaymentSystem.instance = new MockPaymentSystem();
    }
    return MockPaymentSystem.instance;
  }

  private initializeMockData() {
    // Initialize price feeds
    this.priceFeeds = [
      {
        asset: 'KALE',
        symbol: 'KALE',
        price: 0.25,
        change24h: 5.2,
        volume24h: 125000,
        marketCap: 2500000,
        lastUpdated: Date.now(),
        source: 'Reflector Oracle',
        confidence: 0.95
      },
      {
        asset: 'USDC',
        symbol: 'USDC',
        price: 1.00,
        change24h: 0.1,
        volume24h: 50000000,
        marketCap: 50000000000,
        lastUpdated: Date.now(),
        source: 'Reflector Oracle',
        confidence: 0.99
      },
      {
        asset: 'XLM',
        symbol: 'XLM',
        price: 0.12,
        change24h: -2.1,
        volume24h: 25000000,
        marketCap: 3000000000,
        lastUpdated: Date.now(),
        source: 'Reflector Oracle',
        confidence: 0.98
      }
    ];

    // Initialize sample transactions
    this.transactions = [
      {
        id: '1',
        type: 'reward',
        amount: 150,
        status: 'completed',
        timestamp: Date.now() - 86400000 * 2,
        description: 'Data contribution reward - E-commerce Product Images',
        hash: '0x1234...5678'
      },
      {
        id: '2',
        type: 'stake',
        amount: 500,
        status: 'completed',
        timestamp: Date.now() - 86400000 * 5,
        description: 'Staked KALE tokens for validation rewards',
        hash: '0x2345...6789'
      },
      {
        id: '3',
        type: 'reward',
        amount: 75,
        status: 'completed',
        timestamp: Date.now() - 86400000 * 7,
        description: 'Data contribution reward - Customer Reviews Dataset',
        hash: '0x3456...7890'
      },
      {
        id: '4',
        type: 'reward',
        amount: 200,
        status: 'pending',
        timestamp: Date.now() - 3600000 * 2,
        description: 'Data contribution reward - Stock Price Time Series',
      }
    ];

    // Initialize sample datasets
    this.datasets = [
      {
        id: '1',
        name: 'E-commerce Product Images',
        description: 'High-quality product images from various categories with proper labeling and metadata',
        category: 'Computer Vision',
        tags: ['ecommerce', 'products', 'images', 'classification'],
        size: 1024 * 1024 * 50, // 50MB
        format: 'zip',
        price: 150,
        rating: 4.8,
        reviewCount: 23,
        downloadCount: 156,
        isVerified: true,
        isActive: true,
        ownerId: 'user1',
        ownerName: 'Alice Johnson',
        createdAt: Date.now() - 86400000 * 7,
        updatedAt: Date.now() - 86400000 * 1
      },
      {
        id: '2',
        name: 'Customer Reviews Dataset',
        description: 'Sentiment analysis dataset with customer reviews and ratings from multiple platforms',
        category: 'Natural Language Processing',
        tags: ['reviews', 'sentiment', 'nlp', 'text-analysis'],
        size: 1024 * 1024 * 25, // 25MB
        format: 'csv',
        price: 80,
        rating: 4.5,
        reviewCount: 18,
        downloadCount: 89,
        isVerified: true,
        isActive: true,
        ownerId: 'user2',
        ownerName: 'Bob Smith',
        createdAt: Date.now() - 86400000 * 5,
        updatedAt: Date.now() - 86400000 * 2
      },
      {
        id: '3',
        name: 'Stock Price Time Series',
        description: 'Historical stock prices for ML time series analysis and prediction models',
        category: 'Time Series',
        tags: ['stocks', 'finance', 'timeseries', 'prediction'],
        size: 1024 * 1024 * 10, // 10MB
        format: 'csv',
        price: 120,
        rating: 4.7,
        reviewCount: 31,
        downloadCount: 203,
        isVerified: true,
        isActive: true,
        ownerId: 'user3',
        ownerName: 'Carol Davis',
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 86400000 * 1
      }
    ];

    // Initialize sample contributions
    this.contributions = [
      {
        id: '1',
        name: 'E-commerce Product Images',
        description: 'High-quality product images from various categories',
        category: 'Computer Vision',
        tags: ['ecommerce', 'products', 'images'],
        status: 'approved',
        rewardAmount: 150,
        createdAt: Date.now() - 86400000 * 7,
        updatedAt: Date.now() - 86400000 * 2,
        fileSize: 1024 * 1024 * 50,
        format: 'zip'
      },
      {
        id: '2',
        name: 'Customer Reviews Dataset',
        description: 'Sentiment analysis dataset with customer reviews',
        category: 'Natural Language Processing',
        tags: ['reviews', 'sentiment', 'nlp'],
        status: 'under_review',
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 86400000 * 1,
        fileSize: 1024 * 1024 * 25,
        format: 'csv'
      },
      {
        id: '3',
        name: 'Stock Price Time Series',
        description: 'Historical stock prices for ML time series analysis',
        category: 'Time Series',
        tags: ['stocks', 'finance', 'timeseries'],
        status: 'pending',
        createdAt: Date.now() - 86400000 * 1,
        updatedAt: Date.now() - 86400000 * 1,
        fileSize: 1024 * 1024 * 10,
        format: 'csv'
      }
    ];

    // Initialize validation requests
    this.validationRequests = [
      {
        id: '1',
        contributorId: 'user1',
        contributorName: 'Alice Johnson',
        datasetName: 'E-commerce Product Images',
        description: 'High-quality product images from various categories with proper labeling',
        category: 'Computer Vision',
        tags: ['ecommerce', 'products', 'images'],
        contributionType: 'new_dataset',
        status: 'pending',
        createdAt: Date.now() - 86400000 * 2,
        updatedAt: Date.now() - 86400000 * 2,
        fileSize: 1024 * 1024 * 50,
        format: 'zip'
      },
      {
        id: '2',
        contributorId: 'user2',
        contributorName: 'Bob Smith',
        datasetName: 'Customer Reviews Dataset',
        description: 'Sentiment analysis dataset with customer reviews and ratings',
        category: 'Natural Language Processing',
        tags: ['reviews', 'sentiment', 'nlp'],
        contributionType: 'data_addition',
        status: 'pending',
        createdAt: Date.now() - 86400000 * 1,
        updatedAt: Date.now() - 86400000 * 1,
        fileSize: 1024 * 1024 * 25,
        format: 'csv'
      }
    ];
  }

  private startPriceUpdates() {
    // Simulate real-time price updates every 10 seconds
    setInterval(() => {
      this.priceFeeds = this.priceFeeds.map(feed => ({
        ...feed,
        price: feed.price + (Math.random() - 0.5) * 0.01,
        change24h: feed.change24h + (Math.random() - 0.5) * 0.5,
        lastUpdated: Date.now()
      }));
    }, 10000);
  }

  // Public API Methods
  public getKaleBalance(): MockKaleBalance {
    const kalePrice = this.priceFeeds.find(f => f.symbol === 'KALE')?.price || 0.25;
    const totalKale = 2450.75;
    
    return {
      total: totalKale,
      staked: 1000.00,
      available: 1400.75,
      pending: 50.00,
      usdValue: totalKale * kalePrice
    };
  }

  public getPriceFeeds(): MockPriceFeed[] {
    return this.priceFeeds;
  }

  public getTransactions(): MockTransaction[] {
    return this.transactions;
  }

  public getDatasets(): MockDataset[] {
    return this.datasets;
  }

  public getContributions(): MockContribution[] {
    return this.contributions;
  }

  public getValidationRequests(): MockValidationRequest[] {
    return this.validationRequests;
  }

  public async stakeKale(amount: number): Promise<{ success: boolean; hash?: string }> {
    // Simulate staking transaction
    const hash = `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`;
    
    const transaction: MockTransaction = {
      id: Date.now().toString(),
      type: 'stake',
      amount,
      status: 'completed',
      timestamp: Date.now(),
      description: 'Staked KALE tokens for validation rewards',
      hash
    };

    this.transactions.unshift(transaction);
    
    return { success: true, hash };
  }

  public async unstakeKale(amount: number): Promise<{ success: boolean; hash?: string }> {
    // Simulate unstaking transaction
    const hash = `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`;
    
    const transaction: MockTransaction = {
      id: Date.now().toString(),
      type: 'unstake',
      amount,
      status: 'pending',
      timestamp: Date.now(),
      description: 'Unstaked KALE tokens (7-day cooldown)',
      hash
    };

    this.transactions.unshift(transaction);
    
    return { success: true, hash };
  }

  public async purchaseDataset(datasetId: string, price: number): Promise<{ success: boolean; hash?: string }> {
    // Simulate dataset purchase
    const hash = `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`;
    
    const transaction: MockTransaction = {
      id: Date.now().toString(),
      type: 'purchase',
      amount: -price, // Negative because user is paying
      status: 'completed',
      timestamp: Date.now(),
      description: `Purchased dataset: ${this.datasets.find(d => d.id === datasetId)?.name || 'Unknown'}`,
      hash
    };

    this.transactions.unshift(transaction);
    
    // Update dataset download count
    const dataset = this.datasets.find(d => d.id === datasetId);
    if (dataset) {
      dataset.downloadCount += 1;
    }
    
    return { success: true, hash };
  }

  public async submitContribution(contribution: Omit<MockContribution, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id: string }> {
    const newContribution: MockContribution = {
      ...contribution,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.contributions.unshift(newContribution);
    
    return { success: true, id: newContribution.id };
  }

  public async reviewContribution(contributionId: string, status: 'approved' | 'rejected', rewardAmount?: number, reviewNotes?: string): Promise<{ success: boolean }> {
    const contribution = this.contributions.find(c => c.id === contributionId);
    if (contribution) {
      contribution.status = status;
      contribution.rewardAmount = rewardAmount;
      contribution.reviewNotes = reviewNotes;
      contribution.updatedAt = Date.now();

      // If approved, create reward transaction
      if (status === 'approved' && rewardAmount) {
        const transaction: MockTransaction = {
          id: Date.now().toString(),
          type: 'reward',
          amount: rewardAmount,
          status: 'completed',
          timestamp: Date.now(),
          description: `Data contribution reward - ${contribution.name}`,
          hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`
        };

        this.transactions.unshift(transaction);
      }
    }
    
    return { success: true };
  }

  public calculateDynamicPrice(category: string, basePrice: number, quality: number, demand: number): number {
    // Simulate dynamic pricing based on category, quality, and demand
    const categoryMultipliers: { [key: string]: number } = {
      'Computer Vision': 1.5,
      'Natural Language Processing': 1.3,
      'Audio Processing': 1.1,
      'Time Series': 1.2,
      'Financial Data': 2.0,
      'Healthcare': 1.8,
      'Other': 1.0
    };

    const multiplier = categoryMultipliers[category] || 1.0;
    const qualityFactor = quality / 5; // Normalize quality score
    const demandFactor = demand / 100; // Normalize demand percentage

    return Math.round(basePrice * multiplier * qualityFactor * demandFactor);
  }

  public getMarketStats() {
    return {
      totalDatasets: this.datasets.length,
      totalContributions: this.contributions.length,
      totalTransactions: this.transactions.length,
      totalVolume: this.transactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      averagePrice: this.datasets.reduce((sum, d) => sum + d.price, 0) / this.datasets.length,
      topCategories: this.getTopCategories()
    };
  }

  private getTopCategories() {
    const categoryCounts: { [key: string]: number } = {};
    this.datasets.forEach(dataset => {
      categoryCounts[dataset.category] = (categoryCounts[dataset.category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}

// Export singleton instance
export const mockPaymentSystem = MockPaymentSystem.getInstance();
