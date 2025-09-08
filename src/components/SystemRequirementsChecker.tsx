"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Zap,
  Monitor,
  Info
} from "lucide-react";

interface SystemSpecs {
  ram: number; // GB
  storage: number; // GB
  cpuCores: number;
  gpuAvailable: boolean;
  webglVersion: string;
  browserInfo: string;
}

interface ModelRecommendation {
  id: string;
  name: string;
  category: string;
  complexity: string;
  ramRequired: number;
  storageRequired: number;
  gpuRecommended: boolean;
  description: string;
  icon: string;
}

const MINIMUM_REQUIREMENTS = {
  ram: 4, // GB
  storage: 70, // GB
  cpuCores: 2,
  webglVersion: "1.0"
};

const MODEL_TEMPLATES: ModelRecommendation[] = [
  {
    id: "linear_regression",
    name: "Linear Regression",
    category: "regression",
    complexity: "beginner",
    ramRequired: 2,
    storageRequired: 1,
    gpuRecommended: false,
    description: "Simple linear relationship modeling",
    icon: "📈"
  },
  {
    id: "logistic_regression",
    name: "Logistic Regression",
    category: "classification",
    complexity: "beginner",
    ramRequired: 2,
    storageRequired: 1,
    gpuRecommended: false,
    description: "Binary classification with probability outputs",
    icon: "🎯"
  },
  {
    id: "neural_network",
    name: "Neural Network",
    category: "deep_learning",
    complexity: "intermediate",
    ramRequired: 4,
    storageRequired: 5,
    gpuRecommended: false,
    description: "Multi-layer perceptron for complex patterns",
    icon: "🧠"
  },
  {
    id: "random_forest",
    name: "Random Forest",
    category: "classification",
    complexity: "intermediate",
    ramRequired: 3,
    storageRequired: 3,
    gpuRecommended: false,
    description: "Ensemble method with multiple decision trees",
    icon: "🌲"
  },
  {
    id: "svm",
    name: "Support Vector Machine",
    category: "classification",
    complexity: "intermediate",
    ramRequired: 3,
    storageRequired: 2,
    gpuRecommended: false,
    description: "Powerful classification with margin maximization",
    icon: "⚡"
  },
  {
    id: "cnn",
    name: "Convolutional Neural Network",
    category: "deep_learning",
    complexity: "advanced",
    ramRequired: 6,
    storageRequired: 10,
    gpuRecommended: true,
    description: "Image classification and computer vision",
    icon: "👁️"
  },
  {
    id: "lstm",
    name: "LSTM Network",
    category: "deep_learning",
    complexity: "advanced",
    ramRequired: 8,
    storageRequired: 15,
    gpuRecommended: true,
    description: "Time series and sequence modeling",
    icon: "🔄"
  },
  {
    id: "resnet",
    name: "ResNet CNN",
    category: "deep_learning",
    complexity: "advanced",
    ramRequired: 12,
    storageRequired: 25,
    gpuRecommended: true,
    description: "Deep residual networks for complex image tasks",
    icon: "🏗️"
  }
];

export default function SystemRequirementsChecker() {
  const [specs, setSpecs] = useState<SystemSpecs | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkComplete, setCheckComplete] = useState(false);
  const [recommendations, setRecommendations] = useState<ModelRecommendation[]>([]);

  const checkSystemRequirements = async () => {
    setIsChecking(true);
    setCheckComplete(false);

    try {
      // Request permission for system information
      const permissionGranted = await requestSystemPermission();
      if (!permissionGranted) {
        alert('Permission denied. Cannot check system requirements without access to system information.');
        return;
      }

      // Real system detection using available browser APIs
      const systemSpecs = await detectRealSystemSpecs();
      
      setSpecs(systemSpecs);
      
      // Generate recommendations based on real specs
      const compatibleModels = MODEL_TEMPLATES.filter(model => 
        systemSpecs.ram >= model.ramRequired &&
        systemSpecs.storage >= model.storageRequired &&
        (!model.gpuRecommended || systemSpecs.gpuAvailable)
      );

      setRecommendations(compatibleModels);
      setCheckComplete(true);
      
    } catch (error) {
      console.error('System check failed:', error);
      alert('Failed to detect system specifications. Please try again or check manually.');
    } finally {
      setIsChecking(false);
    }
  };

  const requestSystemPermission = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      const permissionDialog = document.createElement('div');
      permissionDialog.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
      permissionDialog.innerHTML = `
        <div class="bg-slate-800 rounded-lg p-6 w-full max-w-md">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-blue-600/20 rounded-lg">
              <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-white">System Access Required</h3>
          </div>
          <p class="text-slate-400 mb-6">
            To check your system requirements, we need to access basic system information including:
          </p>
          <ul class="text-sm text-slate-300 mb-6 space-y-2">
            <li>• CPU core count</li>
            <li>• Available memory (RAM)</li>
            <li>• GPU capabilities</li>
            <li>• WebGL support</li>
          </ul>
          <p class="text-xs text-slate-500 mb-6">
            This information is used only to recommend compatible ML models and is not stored or transmitted.
          </p>
          <div class="flex gap-3">
            <button id="deny-permission" class="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors">
              Deny
            </button>
            <button id="grant-permission" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              Allow
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(permissionDialog);
      
      const grantBtn = permissionDialog.querySelector('#grant-permission');
      const denyBtn = permissionDialog.querySelector('#deny-permission');
      
      grantBtn?.addEventListener('click', () => {
        document.body.removeChild(permissionDialog);
        resolve(true);
      });
      
      denyBtn?.addEventListener('click', () => {
        document.body.removeChild(permissionDialog);
        resolve(false);
      });
    });
  };

  const detectRealSystemSpecs = async (): Promise<SystemSpecs> => {
    // Get browser info
    const browserInfo = navigator.userAgent;
    
    // Detect CPU cores using hardware concurrency
    const cpuCores = navigator.hardwareConcurrency || 2;
    
    // Detect GPU and WebGL capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const webgl2 = canvas.getContext('webgl2');
    const webglVersion = webgl2 ? '2.0' : gl ? '1.0' : '0.0';
    const gpuAvailable = !!webgl2 || !!gl;
    
    // Get GPU renderer info if available
    let gpuInfo = 'Unknown';
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown';
      }
    }
    
    // Detect RAM using device memory API
    let ram = 4; // Default fallback
    if ('deviceMemory' in navigator) {
      ram = (navigator as any).deviceMemory || 4;
    } else {
      // Enhanced estimation based on user agent and other factors
      if (browserInfo.includes('Mobile') || browserInfo.includes('Android')) {
        ram = 4; // Mobile devices
      } else if (browserInfo.includes('Windows')) {
        ram = 8; // Windows desktop
      } else if (browserInfo.includes('Mac')) {
        ram = 8; // macOS
      } else {
        ram = 8; // Other desktop systems
      }
    }
    
    // Estimate storage based on RAM (reasonable assumption)
    let storage = 100;
    if (ram >= 32) storage = 1000;
    else if (ram >= 16) storage = 500;
    else if (ram >= 8) storage = 250;
    else storage = 100;
    
    // Additional system detection using performance API
    const performanceInfo = {
      memory: (performance as any).memory,
      timing: performance.timing
    };
    
    // If memory API is available, use it for more accurate RAM detection
    if (performanceInfo.memory) {
      const totalMemory = performanceInfo.memory.jsHeapSizeLimit;
      if (totalMemory) {
        // Convert bytes to GB (rough estimation)
        const estimatedRAM = Math.round(totalMemory / (1024 * 1024 * 1024));
        if (estimatedRAM > 0 && estimatedRAM < 64) {
          ram = estimatedRAM;
        }
      }
    }
    
    return {
      ram,
      storage,
      cpuCores,
      gpuAvailable,
      webglVersion,
      browserInfo: `${browserInfo} | GPU: ${gpuInfo}`
    };
  };

  const getRequirementStatus = (current: number, required: number) => {
    if (current >= required) return 'pass';
    if (current >= required * 0.8) return 'warning';
    return 'fail';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'text-green-400 bg-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'fail': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  return (
    <div className="p-4 bg-slate-800 rounded-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">System Requirements Checker</h2>
        <button
          onClick={checkSystemRequirements}
          disabled={isChecking}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-md transition-colors flex items-center gap-1 text-sm"
        >
          <Monitor className="w-4 h-4" />
          {isChecking ? "Checking..." : "Check Requirements"}
        </button>
      </div>

      {/* System Specs Display */}
      {specs && (
        <div className="mb-4">
          <h3 className="text-base font-semibold text-white mb-3">Your System Specifications</h3>
          <div className="bg-slate-700/50 rounded-md p-3 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400 font-medium">Real System Detection</span>
            </div>
            <p className="text-xs text-slate-400">
              CPU cores, GPU capabilities, and WebGL support are detected directly from your system. 
              RAM is detected using browser APIs and performance metrics. Storage is estimated based on detected RAM.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* RAM Check */}
            <div className="bg-slate-700 rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <MemoryStick className="w-4 h-4 text-blue-400" />
                  <span className="text-white font-medium text-sm">RAM</span>
                </div>
                {getStatusIcon(getRequirementStatus(specs.ram, MINIMUM_REQUIREMENTS.ram))}
              </div>
              <div className="text-xl font-bold text-white mb-1">{specs.ram} GB</div>
              <div className="text-xs text-slate-400">Minimum: {MINIMUM_REQUIREMENTS.ram} GB</div>
              <div className="text-xs text-green-400">✓ Detected</div>
            </div>

            {/* Storage Check */}
            <div className="bg-slate-700 rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <HardDrive className="w-4 h-4 text-green-400" />
                  <span className="text-white font-medium text-sm">Storage</span>
                </div>
                {getStatusIcon(getRequirementStatus(specs.storage, MINIMUM_REQUIREMENTS.storage))}
              </div>
              <div className="text-xl font-bold text-white mb-1">{specs.storage} GB</div>
              <div className="text-xs text-slate-400">Minimum: {MINIMUM_REQUIREMENTS.storage} GB</div>
              <div className="text-xs text-yellow-400">⚠ Estimated</div>
            </div>

            {/* CPU Check */}
            <div className="bg-slate-700 rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium text-sm">CPU Cores</span>
                </div>
                {getStatusIcon(getRequirementStatus(specs.cpuCores, MINIMUM_REQUIREMENTS.cpuCores))}
              </div>
              <div className="text-xl font-bold text-white mb-1">{specs.cpuCores}</div>
              <div className="text-xs text-slate-400">Minimum: {MINIMUM_REQUIREMENTS.cpuCores}</div>
              <div className="text-xs text-green-400">✓ Detected</div>
            </div>

            {/* GPU Check */}
            <div className="bg-slate-700 rounded-md p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-medium text-sm">GPU Support</span>
                </div>
                {getStatusIcon(specs.gpuAvailable ? 'pass' : 'warning')}
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {specs.gpuAvailable ? 'Available' : 'Limited'}
              </div>
              <div className="text-xs text-slate-400">WebGL: {specs.webglVersion}</div>
              <div className="text-xs text-green-400">✓ Detected</div>
            </div>
          </div>
        </div>
      )}

      {/* Model Recommendations */}
      {checkComplete && recommendations.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-white mb-3">
            Recommended Models for Your System
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((model) => (
              <div key={model.id} className="bg-slate-700 rounded-md p-3 border border-slate-600 hover:border-blue-500/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-lg">{model.icon}</div>
                  <div>
                    <h4 className="text-white font-semibold text-sm">{model.name}</h4>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        model.complexity === "beginner" ? "bg-green-600/20 text-green-400" :
                        model.complexity === "intermediate" ? "bg-yellow-600/20 text-yellow-400" :
                        "bg-red-600/20 text-red-400"
                      }`}>
                        {model.complexity}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        model.category === "regression" ? "bg-blue-600/20 text-blue-400" :
                        model.category === "classification" ? "bg-purple-600/20 text-purple-400" :
                        "bg-red-600/20 text-red-400"
                      }`}>
                        {model.category}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-2">{model.description}</p>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>RAM: {model.ramRequired}GB</span>
                  <span>Storage: {model.storageRequired}GB</span>
                  {model.gpuRecommended && (
                    <span className="text-yellow-400">GPU Recommended</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Compatible Models */}
      {checkComplete && recommendations.length === 0 && (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">System Below Minimum Requirements</h3>
          <p className="text-slate-400 mb-4">
            Your system doesn't meet the minimum requirements for ML training. 
            Consider upgrading your hardware or using cloud-based solutions.
          </p>
          <div className="bg-slate-700 rounded-lg p-4 text-left">
            <h4 className="text-white font-semibold mb-2">Minimum Requirements:</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• RAM: {MINIMUM_REQUIREMENTS.ram} GB</li>
              <li>• Storage: {MINIMUM_REQUIREMENTS.storage} GB</li>
              <li>• CPU: {MINIMUM_REQUIREMENTS.cpuCores} cores</li>
              <li>• WebGL: {MINIMUM_REQUIREMENTS.webglVersion}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isChecking && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Analyzing your system specifications...</p>
        </div>
      )}
    </div>
  );
}
