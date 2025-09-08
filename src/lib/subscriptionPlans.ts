export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'KALE' | 'USD';
  interval: 'monthly' | 'yearly';
  features: string[];
  modelTypes: string[];
  computeResources: {
    cpu: boolean;
    gpu: boolean;
    tpu: boolean;
    maxTrainingTime: number; // in hours
    maxModels: number;
  };
  dataLimits: {
    maxDatasetSize: number; // in GB
    maxDatasets: number;
  };
  apiLimits: {
    requestsPerMonth: number;
    concurrentRequests: number;
  };
  support: 'community' | 'email' | 'priority' | 'dedicated';
  color: string;
  popular?: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Tier',
    description: 'Perfect for learning and small projects',
    price: 0,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Basic model training',
      'Community support',
      'Public datasets access',
      'Basic data visualization',
      'Model export (limited)',
    ],
    modelTypes: [
      'Linear Regression',
      'Logistic Regression',
      'Decision Trees',
      'Random Forest (small datasets)',
      'K-Means Clustering',
      'Naive Bayes',
    ],
    computeResources: {
      cpu: true,
      gpu: false,
      tpu: false,
      maxTrainingTime: 2, // 2 hours
      maxModels: 5,
    },
    dataLimits: {
      maxDatasetSize: 1, // 1 GB
      maxDatasets: 3,
    },
    apiLimits: {
      requestsPerMonth: 1000,
      concurrentRequests: 2,
    },
    support: 'community',
    color: 'bg-slate-600',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    description: 'For serious ML practitioners and small teams',
    price: 50,
    currency: 'KALE',
    interval: 'monthly',
    features: [
      'Advanced model training',
      'GPU acceleration',
      'Priority support',
      'Private datasets',
      'Advanced analytics',
      'Model versioning',
      'API access',
      'Custom data pipelines',
    ],
    modelTypes: [
      'All Free Tier models',
      'Neural Networks (up to 3 layers)',
      'Support Vector Machines',
      'Gradient Boosting',
      'XGBoost',
      'LightGBM',
      'Convolutional Neural Networks (small)',
      'Recurrent Neural Networks (LSTM/GRU)',
    ],
    computeResources: {
      cpu: true,
      gpu: true,
      tpu: false,
      maxTrainingTime: 24, // 24 hours
      maxModels: 50,
    },
    dataLimits: {
      maxDatasetSize: 10, // 10 GB
      maxDatasets: 20,
    },
    apiLimits: {
      requestsPerMonth: 10000,
      concurrentRequests: 10,
    },
    support: 'email',
    color: 'bg-blue-600',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    description: 'For large-scale ML operations and research',
    price: 200,
    currency: 'KALE',
    interval: 'monthly',
    features: [
      'Unlimited model training',
      'GPU & TPU acceleration',
      'Dedicated support',
      'Custom model architectures',
      'Advanced MLOps',
      'Team collaboration',
      'White-label options',
      'Custom integrations',
      'SLA guarantees',
      'On-premise deployment',
    ],
    modelTypes: [
      'All Pro Tier models',
      'Deep Neural Networks (unlimited layers)',
      'Transformer models',
      'Large Language Models',
      'Computer Vision models',
      'Reinforcement Learning',
      'Custom architectures',
      'Federated Learning',
      'AutoML',
    ],
    computeResources: {
      cpu: true,
      gpu: true,
      tpu: true,
      maxTrainingTime: -1, // unlimited
      maxModels: -1, // unlimited
    },
    dataLimits: {
      maxDatasetSize: -1, // unlimited
      maxDatasets: -1, // unlimited
    },
    apiLimits: {
      requestsPerMonth: -1, // unlimited
      concurrentRequests: 100,
    },
    support: 'dedicated',
    color: 'bg-gradient-to-r from-purple-600 to-pink-600',
  },
];

export const getPlanById = (id: string): SubscriptionPlan | undefined => {
  return subscriptionPlans.find(plan => plan.id === id);
};

export const formatPrice = (plan: SubscriptionPlan): string => {
  if (plan.price === 0) return 'Free';
  return `${plan.price} ${plan.currency}`;
};

export const getModelTypeIcon = (modelType: string): string => {
  const iconMap: Record<string, string> = {
    'Linear Regression': '📈',
    'Logistic Regression': '📊',
    'Decision Trees': '🌳',
    'Random Forest': '🌲',
    'K-Means Clustering': '🎯',
    'Naive Bayes': '🎲',
    'Neural Networks': '🧠',
    'Support Vector Machines': '⚡',
    'Gradient Boosting': '🚀',
    'XGBoost': '⚡',
    'LightGBM': '💡',
    'Convolutional Neural Networks': '👁️',
    'Recurrent Neural Networks': '🔄',
    'Transformer models': '🔄',
    'Large Language Models': '📝',
    'Computer Vision models': '👁️',
    'Reinforcement Learning': '🎮',
    'Custom architectures': '🔧',
    'Federated Learning': '🌐',
    'AutoML': '🤖',
  };
  return iconMap[modelType] || '🔬';
};
