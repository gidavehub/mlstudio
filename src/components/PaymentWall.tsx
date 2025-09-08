    'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, CreditCard, Wallet, CheckCircle, ArrowLeft } from 'lucide-react';
import { SubscriptionPlan } from '@/lib/subscriptionPlans';
import SubscriptionSelector from './SubscriptionSelector';

interface PaymentWallProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (plan: SubscriptionPlan) => void;
  currentPlan?: string;
}

const PaymentWall: React.FC<PaymentWallProps> = ({
  isOpen,
  onClose,
  onComplete,
  currentPlan,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [step, setStep] = useState<'select' | 'payment' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'kale' | 'card'>('kale');

  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    if (plan.price === 0) {
      // Free plan - complete immediately
      onComplete(plan);
      setStep('success');
    } else {
      setStep('payment');
    }
  };

  const handlePayment = () => {
    if (selectedPlan) {
      // Simulate payment processing
      setTimeout(() => {
        onComplete(selectedPlan);
        setStep('success');
      }, 2000);
    }
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('select');
    } else if (step === 'success') {
      onClose();
    }
  };

  const resetWall = () => {
    setSelectedPlan(null);
    setStep('select');
    setPaymentMethod('kale');
  };

  const handleClose = () => {
    resetWall();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-ml-dark-50 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-ml-dark-300">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-ml-blue-50" />
                <h2 className="text-2xl font-bold text-white">
                  {step === 'select' && 'Choose Your Plan'}
                  {step === 'payment' && 'Complete Payment'}
                  {step === 'success' && 'Welcome to ML Studio!'}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="text-ml-dark-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <AnimatePresence mode="wait">
                {step === 'select' && (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <SubscriptionSelector
                      onSelectPlan={handlePlanSelect}
                      selectedPlan={currentPlan}
                    />
                  </motion.div>
                )}

                {step === 'payment' && selectedPlan && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="max-w-2xl mx-auto"
                  >
                    {/* Back Button */}
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-ml-dark-400 hover:text-white transition-colors mb-6"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Plans
                    </button>

                    {/* Selected Plan Summary */}
                    <div className="bg-ml-dark-200 rounded-xl p-6 mb-8">
                      <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-ml-dark-400">Plan</span>
                          <span className="text-white font-semibold">{selectedPlan.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-ml-dark-400">Billing</span>
                          <span className="text-white">Monthly</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-ml-dark-400">Price</span>
                          <span className="text-white font-bold text-lg">
                            {selectedPlan.price} {selectedPlan.currency}
                          </span>
                        </div>
                        <div className="border-t border-ml-dark-300 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-bold">Total</span>
                            <span className="text-white font-bold text-xl">
                              {selectedPlan.price} {selectedPlan.currency}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-white">Payment Method</h3>
                      
                      {/* KALE Payment */}
                      <div
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                          paymentMethod === 'kale'
                            ? 'border-ml-blue-50 bg-ml-blue-50/10'
                            : 'border-ml-dark-300 hover:border-ml-dark-400'
                        }`}
                        onClick={() => setPaymentMethod('kale')}
                      >
                        <div className="flex items-center gap-3">
                          <Wallet className="w-6 h-6 text-yellow-400" />
                          <div>
                            <h4 className="text-white font-semibold">Pay with KALE Tokens</h4>
                            <p className="text-ml-dark-400 text-sm">
                              Use your KALE tokens earned from data contributions. Powered by Stellar blockchain and Reflector oracle.
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">Stellar</span>
                              <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded">Reflector</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Payment */}
                      <div
                        className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                          paymentMethod === 'card'
                            ? 'border-ml-blue-50 bg-ml-blue-50/10'
                            : 'border-ml-dark-300 hover:border-ml-dark-400'
                        }`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-6 h-6 text-blue-400" />
                          <div>
                            <h4 className="text-white font-semibold">Credit/Debit Card</h4>
                            <p className="text-ml-dark-400 text-sm">
                              Pay with Visa, Mastercard, or American Express
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Button */}
                    <motion.button
                      onClick={handlePayment}
                      className="w-full mt-8 bg-gradient-to-r from-ml-blue-50 to-purple-600 hover:from-ml-blue-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {paymentMethod === 'kale' ? 'Pay with KALE' : 'Pay with Card'}
                    </motion.button>

                    {/* Security Note */}
                    <div className="mt-6 text-center text-ml-dark-400 text-sm">
                      <p>🔒 Your payment information is secure and encrypted</p>
                    </div>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center max-w-md mx-auto"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4">
                      Welcome to ML Studio!
                    </h3>
                    
                    <p className="text-ml-dark-400 mb-6">
                      Your subscription is now active. You can start training models and exploring our data marketplace.
                    </p>

                    <motion.button
                      onClick={handleClose}
                      className="bg-gradient-to-r from-ml-blue-50 to-purple-600 hover:from-ml-blue-600 hover:to-purple-700 text-white py-3 px-8 rounded-lg font-semibold transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Start Building AI Models
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentWall;
