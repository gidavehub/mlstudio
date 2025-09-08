'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Star, ArrowRight, Lock, Cpu, Gpu, Database, Users } from 'lucide-react';
import { subscriptionPlans, SubscriptionPlan, formatPrice, getModelTypeIcon } from '@/lib/subscriptionPlans';

interface SubscriptionSelectorProps {
  onSelectPlan: (plan: SubscriptionPlan) => void;
  selectedPlan?: string;
  className?: string;
}

const SubscriptionSelector: React.FC<SubscriptionSelectorProps> = ({
  onSelectPlan,
  selectedPlan,
  className = '',
}) => {
  const [isYearly, setIsYearly] = useState(false);

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'cpu': return <Cpu className="w-4 h-4" />;
      case 'gpu': return <Gpu className="w-4 h-4" />;
      case 'tpu': return <Zap className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getSupportIcon = (support: string) => {
    switch (support) {
      case 'community': return <Users className="w-4 h-4" />;
      case 'email': return <Check className="w-4 h-4" />;
      case 'priority': return <Star className="w-4 h-4" />;
      case 'dedicated': return <Crown className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Choose Your ML Studio Plan
        </h2>
        <p className="text-ml-dark-400 text-lg mb-6">
          Select the plan that matches your machine learning needs
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm ${!isYearly ? 'text-white' : 'text-ml-dark-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              isYearly ? 'bg-ml-blue-50' : 'bg-ml-dark-300'
            }`}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 bg-white rounded-full"
              animate={{ x: isYearly ? 28 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm ${isYearly ? 'text-white' : 'text-ml-dark-400'}`}>
            Yearly
            <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded-full">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {subscriptionPlans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`relative rounded-2xl p-8 border-2 transition-all duration-300 ${
              plan.popular
                ? 'border-ml-blue-50 bg-gradient-to-b from-ml-blue-50/10 to-transparent'
                : 'border-ml-dark-300 bg-ml-dark-200/50'
            } ${
              selectedPlan === plan.id
                ? 'ring-2 ring-ml-blue-50 ring-opacity-50'
                : 'hover:border-ml-blue-50/50'
            }`}
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-ml-blue-50 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${plan.color} flex items-center justify-center`}>
                {plan.id === 'free' && <Database className="w-8 h-8 text-white" />}
                {plan.id === 'pro' && <Zap className="w-8 h-8 text-white" />}
                {plan.id === 'enterprise' && <Crown className="w-8 h-8 text-white" />}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-ml-dark-400 text-sm mb-4">{plan.description}</p>
              <div className="text-4xl font-bold text-white mb-2">
                {formatPrice(plan)}
                {plan.price > 0 && (
                  <span className="text-lg text-ml-dark-400 font-normal">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                )}
              </div>
              {isYearly && plan.price > 0 && (
                <p className="text-green-400 text-sm">
                  Save {Math.round(plan.price * 0.2)} {plan.currency}/month
                </p>
              )}
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <h4 className="text-white font-semibold mb-3">Key Features</h4>
              {plan.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="text-ml-dark-400 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* Model Types */}
            <div className="space-y-4 mb-8">
              <h4 className="text-white font-semibold mb-3">Supported Models</h4>
              <div className="grid grid-cols-1 gap-2">
                {plan.modelTypes.slice(0, 6).map((modelType, modelIndex) => (
                  <div key={modelIndex} className="flex items-center gap-2">
                    <span className="text-lg">{getModelTypeIcon(modelType)}</span>
                    <span className="text-ml-dark-400 text-xs">{modelType}</span>
                  </div>
                ))}
                {plan.modelTypes.length > 6 && (
                  <div className="text-ml-dark-400 text-xs">
                    +{plan.modelTypes.length - 6} more models
                  </div>
                )}
              </div>
            </div>

            {/* Compute Resources */}
            <div className="space-y-3 mb-8">
              <h4 className="text-white font-semibold mb-3">Compute Resources</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <span className="text-ml-dark-400 text-sm">CPU</span>
                  </div>
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gpu className="w-4 h-4 text-purple-400" />
                    <span className="text-ml-dark-400 text-sm">GPU</span>
                  </div>
                  {plan.computeResources.gpu ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-ml-dark-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-ml-dark-400 text-sm">TPU</span>
                  </div>
                  {plan.computeResources.tpu ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-ml-dark-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Limits */}
            <div className="space-y-3 mb-8">
              <h4 className="text-white font-semibold mb-3">Limits</h4>
              <div className="space-y-2 text-sm text-ml-dark-400">
                <div>Max Training Time: {plan.computeResources.maxTrainingTime === -1 ? 'Unlimited' : `${plan.computeResources.maxTrainingTime}h`}</div>
                <div>Max Models: {plan.computeResources.maxModels === -1 ? 'Unlimited' : plan.computeResources.maxModels}</div>
                <div>Max Dataset Size: {plan.dataLimits.maxDatasetSize === -1 ? 'Unlimited' : `${plan.dataLimits.maxDatasetSize}GB`}</div>
                <div>API Requests: {plan.apiLimits.requestsPerMonth === -1 ? 'Unlimited' : `${plan.apiLimits.requestsPerMonth}/month`}</div>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-3 mb-8">
              <h4 className="text-white font-semibold mb-3">Support</h4>
              <div className="flex items-center gap-2">
                {getSupportIcon(plan.support)}
                <span className="text-ml-dark-400 text-sm capitalize">{plan.support} Support</span>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              onClick={() => onSelectPlan(plan)}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                plan.popular
                  ? 'bg-gradient-to-r from-ml-blue-50 to-purple-600 hover:from-ml-blue-600 hover:to-purple-700 text-white'
                  : 'bg-ml-dark-300 hover:bg-ml-dark-400 text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {plan.price === 0 ? 'Get Started Free' : 'Choose Plan'}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center text-ml-dark-400 text-sm">
        <p>
          All plans include access to our data marketplace and KALE token rewards.
          <br />
          Upgrade or downgrade at any time. No long-term contracts.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSelector;
