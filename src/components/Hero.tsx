'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion, useSpring } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { DatabaseZap, TrendingUp, Network, Settings2, BrainCircuit, BarChart3, Layers, FileText, ArrowRight } from 'lucide-react';

function useScrollTransforms(scrollYProgress: any) {
  const laptopScale = useTransform(scrollYProgress, [0, 0.3, 0.7], [1, 0.98, 0.95]);
  const laptopRotateY = useTransform(scrollYProgress, [0, 0.3, 0.7], [0, -2, -5]);
  const screenGlow = useTransform(scrollYProgress, [0, 0.2, 0.4], [0, 0.5, 1]);

  const projectionIntensity = useTransform(scrollYProgress, [0, 0.3, 0.7], [1, 1.2, 1.5]);
  const projectionDepth = useTransform(scrollYProgress, [0, 0.5, 1], [0, 100, 200]);

  const card1TranslateZ = useTransform(projectionDepth, [0, 200], [120, 320]);
  const card2TranslateZ = useTransform(projectionDepth, [0, 200], [150, 350]);
  const card3TranslateZ = useTransform(projectionDepth, [0, 200], [100, 300]);
  const card4TranslateZ = useTransform(projectionDepth, [0, 200], [130, 330]);
  const card5TranslateZ = useTransform(projectionDepth, [0, 200], [80, 280]);
  const card6TranslateZ = useTransform(projectionDepth, [0, 200], [90, 290]);
  const card7TranslateZ = useTransform(projectionDepth, [0, 200], [110, 310]);

  const card1Y = useTransform(scrollYProgress, [0, 0.2, 0.6, 1], ['0%', '-20%', '-50%', '-200%']);
  const card1X = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], ['0%', '8%', '15%', '30%']);
  const card1RotateX = useTransform(scrollYProgress, [0, 0.5, 1], [-15, -30, -45]);
  const card1RotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-25, -42, -60]);

  const card2Y = useTransform(scrollYProgress, [0, 0.2, 0.6, 1], ['0%', '-15%', '-40%', '-180%']);
  const card2X = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], ['0%', '-8%', '-15%', '-35%']);
  const card2RotateX = useTransform(scrollYProgress, [0, 0.5, 1], [-10, -25, -40]);
  const card2RotateY = useTransform(scrollYProgress, [0, 0.5, 1], [25, 42, 60]);

  const card3Y = useTransform(scrollYProgress, [0, 0.2, 0.6, 1], ['0%', '-25%', '-60%', '-220%']);
  const card3X = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], ['0%', '5%', '10%', '25%']);
  const card3RotateX = useTransform(scrollYProgress, [0, 0.5, 1], [10, 27, 45]);
  const card3RotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-20, -35, -50]);

  const card4Y = useTransform(scrollYProgress, [0, 0.2, 0.6, 1], ['0%', '-18%', '-45%', '-190%']);
  const card4X = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], ['0%', '-5%', '-10%', '-25%']);
  const card4RotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 32, 50]);
  const card4RotateY = useTransform(scrollYProgress, [0, 0.5, 1], [20, 37, 55]);

  const card5Y = useTransform(scrollYProgress, [0, 0.2, 0.6, 1], ['0%', '-30%', '-70%', '-240%']);
  const card5RotateX = useTransform(scrollYProgress, [0, 0.5, 1], [20, 40, 60]);

  const card6Y = useTransform(scrollYProgress, [0, 0.2, 0.6, 1], ['0%', '-35%', '-80%', '-260%']);
  const card6X = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], ['0%', '6%', '12%', '28%']);
  const card6RotateX = useTransform(scrollYProgress, [0, 0.5, 1], [25, 45, 65]);
  const card6RotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-15, -30, -45]);

  const card7Y = useTransform(scrollYProgress, [0, 0.2, 0.6, 1], ['0%', '-32%', '-75%', '-250%']);
  const card7X = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], ['0%', '-6%', '-12%', '-28%']);
  const card7RotateX = useTransform(scrollYProgress, [0, 0.5, 1], [-25, -45, -65]);
  const card7RotateY = useTransform(scrollYProgress, [0, 0.5, 1], [15, 30, 45]);

  // Extra right-side cards
  const card8TranslateZ = useTransform(projectionDepth, [0, 200], [95, 295]);
  const card8Y = useTransform(scrollYProgress, [0, 0.2, 0.6, 1], ['0%', '-22%', '-55%', '-210%']);
  const card8X = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], ['0%', '-10%', '-18%', '-30%']);
  const card8RotateX = useTransform(scrollYProgress, [0, 0.5, 1], [-12, -28, -42]);
  const card8RotateY = useTransform(scrollYProgress, [0, 0.5, 1], [18, 34, 50]);

  const card9TranslateZ = useTransform(projectionDepth, [0, 200], [105, 305]);
  const card9Y = useTransform(scrollYProgress, [0, 0.2, 0.6, 1], ['0%', '-28%', '-65%', '-230%']);
  const card9X = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], ['0%', '-12%', '-20%', '-32%']);
  const card9RotateX = useTransform(scrollYProgress, [0, 0.5, 1], [-18, -36, -52]);
  const card9RotateY = useTransform(scrollYProgress, [0, 0.5, 1], [12, 28, 44]);

  return {
    laptopScale,
    laptopRotateY,
    screenGlow,
    projectionIntensity,
    projectionDepth,
    card1TranslateZ,
    card2TranslateZ,
    card3TranslateZ,
    card4TranslateZ,
    card5TranslateZ,
    card6TranslateZ,
    card7TranslateZ,
    card1Y,
    card1X,
    card1RotateX,
    card1RotateY,
    card2Y,
    card2X,
    card2RotateX,
    card2RotateY,
    card3Y,
    card3X,
    card3RotateX,
    card3RotateY,
    card4Y,
    card4X,
    card4RotateX,
    card4RotateY,
    card5Y,
    card5RotateX,
    card6Y,
    card6X,
    card6RotateX,
    card6RotateY,
    card7Y,
    card7X,
    card7RotateX,
    card7RotateY,
    card8TranslateZ,
    card8Y,
    card8X,
    card8RotateX,
    card8RotateY,
    card9TranslateZ,
    card9Y,
    card9X,
    card9RotateX,
    card9RotateY,
  };
}

function MLStudioWindow({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  const [currentActivity, setCurrentActivity] = useState(0);
  
  const activities = [
    {
      title: "Creating Dataset",
      icon: DatabaseZap,
      color: "blue",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300">Uploading iris.csv</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-slate-300">Processing 150 rows</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-slate-300">Auto-detecting features</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
            <motion.div
              className="bg-blue-400 h-1 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '85%' }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
          </div>
          <div className="text-xs text-slate-400">4 features detected • Ready for preprocessing</div>
        </div>
      )
    },
    {
      title: "Building Pipeline",
      icon: Network,
      color: "purple",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-slate-300">Data Loading ✓</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300">Preprocessing...</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
            <span className="text-slate-300">Feature Engineering</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs mt-2">
            <div className="bg-slate-700/50 rounded px-2 py-1 text-slate-300">Normalize</div>
            <div className="bg-slate-700/50 rounded px-2 py-1 text-slate-300">Encode</div>
          </div>
          <div className="text-xs text-slate-400">Pipeline steps: 3/5 completed</div>
        </div>
      )
    },
    {
      title: "Training Model",
      icon: BrainCircuit,
      color: "green",
      content: (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Epoch 15/20</span>
            <span className="text-green-400">94.2%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1">
            <motion.div
              className="bg-green-400 h-1 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '75%' }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Loss</span>
            <span className="text-red-400">0.023</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Learning Rate</span>
            <span className="text-blue-400">0.001</span>
          </div>
          <div className="text-xs text-slate-400">Training on Google Colab • GPU: T4</div>
        </div>
      )
    },
    {
      title: "Deploying Model",
      icon: Settings2,
      color: "orange",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-slate-300">Model Export ✓</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300">API Generation...</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
            <span className="text-slate-300">Auto-scaling</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Endpoint</span>
            <span className="text-green-400">api.mlstudio.dev</span>
          </div>
          <div className="text-xs text-slate-400">Deployment progress: 60%</div>
        </div>
      )
    },
    {
      title: "Data Visualization",
      icon: BarChart3,
      color: "indigo",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300">Generating charts...</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="bg-slate-700/50 rounded px-2 py-1 text-slate-300">Histogram</div>
            <div className="bg-slate-700/50 rounded px-2 py-1 text-slate-300">Scatter</div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Correlation</span>
            <span className="text-blue-400">0.87</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Outliers</span>
            <span className="text-yellow-400">3 found</span>
          </div>
          <div className="text-xs text-slate-400">Visualization complete • 4 charts generated</div>
        </div>
      )
    },
    {
      title: "Model Analysis",
      icon: Layers,
      color: "cyan",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-slate-300">Performance Analysis</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Precision</span>
            <span className="text-green-400">0.94</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Recall</span>
            <span className="text-blue-400">0.92</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">F1-Score</span>
            <span className="text-purple-400">0.93</span>
          </div>
          <div className="text-xs text-slate-400">Confusion matrix generated</div>
        </div>
      )
    },
    {
      title: "Feature Engineering",
      icon: FileText,
      color: "emerald",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300">Creating features...</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">Polynomial features</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-slate-300">Interaction terms</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">New features</span>
            <span className="text-purple-400">+8</span>
          </div>
          <div className="text-xs text-slate-400">Feature importance calculated</div>
        </div>
      )
    },
    {
      title: "Hyperparameter Tuning",
      icon: TrendingUp,
      color: "rose",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-slate-300">Grid search running...</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Learning Rate</span>
            <span className="text-green-400">0.001</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Batch Size</span>
            <span className="text-blue-400">64</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">Epochs</span>
            <span className="text-purple-400">20</span>
          </div>
          <div className="text-xs text-slate-400">Best score: 0.942 • 12/20 trials</div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activities.length);
    }, 4000); // Increased to 4 seconds for more content
    return () => clearInterval(interval);
  }, []);

  const current = activities[currentActivity];
  const Icon = current.icon;

  return (
    <div className={`w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-sm overflow-hidden`} style={{ backgroundColor: '#0f172a' }}>
      <div className="h-6 bg-slate-800 border-b border-slate-700 flex items-center px-2 gap-2">
        <div className="flex gap-1" aria-hidden="true">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-slate-300 font-medium">ML Studio</span>
        </div>
        <div className="text-xs text-slate-400">Live</div>
      </div>
      <div className="flex h-[calc(100%-1.5rem)]">
        <div className="w-12 bg-slate-800 border-r border-slate-700 flex flex-col items-center py-2 gap-2" aria-hidden="true">
          <div className={`w-8 h-8 ${current.color === 'blue' ? 'bg-blue-500/20' : 'bg-slate-700'} rounded-lg flex items-center justify-center`}>
            <DatabaseZap size={14} className={current.color === 'blue' ? 'text-blue-400' : 'text-slate-400'} />
          </div>
          <div className={`w-8 h-8 ${current.color === 'purple' ? 'bg-purple-500/20' : 'bg-slate-700'} rounded-lg flex items-center justify-center`}>
            <Network size={14} className={current.color === 'purple' ? 'text-purple-400' : 'text-slate-400'} />
          </div>
          <div className={`w-8 h-8 ${current.color === 'green' ? 'bg-green-500/20' : 'bg-slate-700'} rounded-lg flex items-center justify-center`}>
            <BrainCircuit size={14} className={current.color === 'green' ? 'text-green-400' : 'text-slate-400'} />
          </div>
          <div className={`w-8 h-8 ${current.color === 'orange' ? 'bg-orange-500/20' : 'bg-slate-700'} rounded-lg flex items-center justify-center`}>
            <Settings2 size={14} className={current.color === 'orange' ? 'text-orange-400' : 'text-slate-400'} />
          </div>
          <div className={`w-8 h-8 ${current.color === 'indigo' ? 'bg-indigo-500/20' : 'bg-slate-700'} rounded-lg flex items-center justify-center`}>
            <BarChart3 size={14} className={current.color === 'indigo' ? 'text-indigo-400' : 'text-slate-400'} />
        </div>
          <div className={`w-8 h-8 ${current.color === 'cyan' ? 'bg-cyan-500/20' : 'bg-slate-700'} rounded-lg flex items-center justify-center`}>
            <Layers size={14} className={current.color === 'cyan' ? 'text-cyan-400' : 'text-slate-400'} />
            </div>
          <div className={`w-8 h-8 ${current.color === 'emerald' ? 'bg-emerald-500/20' : 'bg-slate-700'} rounded-lg flex items-center justify-center`}>
            <FileText size={14} className={current.color === 'emerald' ? 'text-emerald-400' : 'text-slate-400'} />
            </div>
          <div className={`w-8 h-8 ${current.color === 'rose' ? 'bg-rose-500/20' : 'bg-slate-700'} rounded-lg flex items-center justify-center`}>
            <TrendingUp size={14} className={current.color === 'rose' ? 'text-rose-400' : 'text-slate-400'} />
          </div>
            </div>
        <div className="flex-1 p-3">
                <motion.div
            key={currentActivity}
            className="bg-slate-800/50 rounded-lg p-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={`text-${current.color}-400`} aria-hidden="true" />
              <span className="text-xs text-slate-200 font-medium">{current.title}</span>
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" aria-hidden="true"></div>
          </div>
            {current.content}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function LaptopDisplay({ screenGlow, shouldReduceMotion }: { screenGlow: any; shouldReduceMotion: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-[60vw] max-w-[1000px] h-[37.5vw] max-h-[625px] flex items-center justify-center">
        <Image src="/laptop.png" alt="Laptop displaying ML Studio" fill className="object-contain" priority sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px" />
        <motion.div
          className="absolute top-[8%] left-[12%] w-[76%] h-[70%] rounded-sm overflow-hidden"
          style={{
            boxShadow: useTransform(screenGlow, [0, 1], [
              '0 0 0px rgba(59, 130, 246, 0)',
              '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)'
            ])
          }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-full origin-center scale-[0.756]">
              <MLStudioWindow shouldReduceMotion={shouldReduceMotion} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const DataManagementPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-64 sm:w-80 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateY: 5, rotateX: -5, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <DatabaseZap size={16} className="text-blue-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">Data Management</h3>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Multi-format Support</span>
        <span className="text-green-400">✓</span>
        </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Client-side Processing</span>
        <span className="text-blue-400">Instant</span>
    </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Smart Preprocessing</span>
        <span className="text-purple-400">Auto</span>
        </div>
    </div>
    <div className="mt-3 pt-2 border-t border-slate-700">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" aria-hidden="true"></div>
        <span>CSV • Images • Audio • Text</span>
      </div>
    </div>
  </motion.div>
);

const ModelTrainingPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-56 sm:w-72 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(168, 85, 247, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateY: -5, rotateX: 5, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <BrainCircuit size={16} className="text-purple-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">Visual Model Builder</h3>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Drag & Drop</span>
        <span className="text-green-400">✓</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Code Generation</span>
        <span className="text-blue-400">PyTorch/JAX</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Real-time Training</span>
        <span className="text-purple-400">Google Colab</span>
      </div>
    </div>
  </motion.div>
);

const PipelineManagementPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-56 sm:w-64 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateX: 5, rotateY: -5, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <Network size={16} className="text-blue-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">Pipeline Editor</h3>
    </div>
    <div className="space-y-1">
      {['Data Loading', 'Preprocessing', 'Feature Engineering', 'Model Training', 'Deployment'].map((step, i) => (
        <div key={step} className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${i < 3 ? 'bg-green-400' : i === 3 ? 'bg-yellow-400' : 'bg-slate-500'}`}></div>
          <span className="text-slate-300">{step}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

const DeploymentPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-64 sm:w-80 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(251, 146, 60, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateX: -5, rotateY: 5, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <Settings2 size={16} className="text-orange-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">One-Click Deployment</h3>
    </div>
    <div className="space-y-1">
      {[
        { step: 'Model Export', status: 'completed' },
        { step: 'API Generation', status: 'completed' },
        { step: 'Auto-scaling', status: 'completed' },
        { step: 'A/B Testing', status: 'in_progress' },
        { step: 'Monitoring', status: 'pending' }
      ].map((item) => (
        <div key={item.step} className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${item.status === 'completed' ? 'bg-green-400' : item.status === 'in_progress' ? 'bg-yellow-400' : 'bg-slate-500'}`}></div>
          <span className="text-slate-300">{item.step}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

const AnalyticsPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-72 sm:w-80 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(168, 85, 247, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateY: -5, rotateX: 5, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <Layers size={16} className="text-purple-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">Real-time Analytics</h3>
    </div>
    <div className="space-y-2">
      {[
        { metric: 'Model Performance', value: '94.2%', color: 'bg-green-400' },
        { metric: 'Training Speed', value: '2.3x', color: 'bg-blue-400' },
        { metric: 'Resource Usage', value: 'Low', color: 'bg-purple-400' },
        { metric: 'Deployment Status', value: 'Active', color: 'bg-green-400' }
      ].map((item) => (
        <div key={item.metric} className="flex items-center justify-between text-xs">
          <span className="text-slate-300">{item.metric}</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
            <span className="text-slate-400">{item.value}</span>
          </div>
        </div>
      ))}
    </div>
    <div className="mt-3 pt-2 border-t border-slate-700">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" aria-hidden="true"></div>
        <span>Live monitoring dashboard</span>
      </div>
    </div>
  </motion.div>
);

const MobileDesktopPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-64 sm:w-72 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(34, 197, 94, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateY: 5, rotateX: -5, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <BarChart3 size={16} className="text-green-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">Coming Soon</h3>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">ML Studio Mobile</span>
        <span className="text-blue-400">Q2 2024</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Desktop App</span>
        <span className="text-purple-400">Q3 2024</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">On-Device Training</span>
        <span className="text-green-400">Latest Chips</span>
      </div>
    </div>
  </motion.div>
);

const CollaborationPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-64 sm:w-72 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(34, 197, 94, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateY: 4, rotateX: -4, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <DatabaseZap size={16} className="text-green-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">Team Collaboration</h3>
    </div>
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-slate-300">Shared Datasets</span>
        <span className="text-green-400">✓</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-300">Pipeline Sharing</span>
        <span className="text-green-400">✓</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-300">Role-based Access</span>
        <span className="text-blue-400">Admin/Member</span>
      </div>
    </div>
  </motion.div>
);

const TechStackPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-56 sm:w-64 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateX: 4, rotateY: -4, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <Settings2 size={16} className="text-blue-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">Tech Stack</h3>
    </div>
    <div className="space-y-1 text-xs">
      <div className="flex items-center justify-between"><span className="text-slate-300">Frontend</span><span className="text-slate-400">Next.js 14</span></div>
      <div className="flex items-center justify-between"><span className="text-slate-300">Backend</span><span className="text-slate-400">Convex</span></div>
      <div className="flex items-center justify-between"><span className="text-slate-300">Auth</span><span className="text-slate-400">Clerk</span></div>
      <div className="flex items-center justify-between"><span className="text-slate-300">Training</span><span className="text-slate-400">Google Colab</span></div>
    </div>
  </motion.div>
);

const DataVisualizationPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-64 sm:w-80 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(168, 85, 247, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateY: 5, rotateX: -5, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <BarChart3 size={16} className="text-purple-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">Data Visualization</h3>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Charts Generated</span>
        <span className="text-green-400">4</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Correlation</span>
        <span className="text-blue-400">0.87</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Outliers</span>
        <span className="text-yellow-400">3 found</span>
      </div>
    </div>
    <div className="mt-3 pt-2 border-t border-slate-700">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" aria-hidden="true"></div>
        <span>Histogram • Scatter • Heatmap</span>
      </div>
    </div>
  </motion.div>
);

const ModelAnalysisPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-64 sm:w-72 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(34, 197, 94, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateY: 4, rotateX: -4, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <Layers size={16} className="text-green-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">Model Analysis</h3>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Precision</span>
        <span className="text-green-400">0.94</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Recall</span>
        <span className="text-blue-400">0.92</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">F1-Score</span>
        <span className="text-purple-400">0.93</span>
      </div>
    </div>
  </motion.div>
);

const FeatureEngineeringPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-64 sm:w-72 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(34, 197, 94, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateY: 4, rotateX: -4, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <FileText size={16} className="text-green-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">Feature Engineering</h3>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">New Features</span>
        <span className="text-purple-400">+8</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Polynomial</span>
        <span className="text-green-400">✓</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Interactions</span>
        <span className="text-blue-400">✓</span>
      </div>
    </div>
  </motion.div>
);

const HyperparameterTuningPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-64 sm:w-72 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(34, 197, 94, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateY: 4, rotateX: -4, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <TrendingUp size={16} className="text-green-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">Hyperparameter Tuning</h3>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Trials</span>
        <span className="text-blue-400">12/20</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Best Score</span>
        <span className="text-green-400">0.942</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Learning Rate</span>
        <span className="text-purple-400">0.001</span>
      </div>
    </div>
  </motion.div>
);

const APIManagementPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-64 sm:w-72 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(34, 197, 94, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateY: 4, rotateX: -4, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <Settings2 size={16} className="text-green-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">API Management</h3>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Endpoints</span>
        <span className="text-blue-400">3 Active</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Requests</span>
        <span className="text-green-400">1.2K</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Latency</span>
        <span className="text-purple-400">45ms</span>
      </div>
    </div>
  </motion.div>
);

const SystemRequirementsPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-64 sm:w-72 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(34, 197, 94, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateY: 4, rotateX: -4, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <DatabaseZap size={16} className="text-green-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">System Requirements</h3>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">RAM</span>
        <span className="text-green-400">8GB ✓</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">GPU</span>
        <span className="text-blue-400">RTX 4090</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Storage</span>
        <span className="text-purple-400">500GB</span>
      </div>
    </div>
  </motion.div>
);

const TrainingDebuggerPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-64 sm:w-72 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(34, 197, 94, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateY: 4, rotateX: -4, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <BrainCircuit size={16} className="text-green-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">Training Debugger</h3>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Debug Points</span>
        <span className="text-blue-400">5 Set</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Memory Usage</span>
        <span className="text-green-400">2.1GB</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">GPU Temp</span>
        <span className="text-purple-400">72°C</span>
      </div>
    </div>
  </motion.div>
);

const ModelComparisonPreview = ({ className, style, reduced }: { className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-64 sm:w-72 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(34, 197, 94, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateY: 4, rotateX: -4, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-2 mb-3">
      <BarChart3 size={16} className="text-green-400" aria-hidden="true" />
      <h3 className="font-semibold text-slate-100 text-sm">Model Comparison</h3>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Models</span>
        <span className="text-blue-400">3 Compared</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Best Model</span>
        <span className="text-green-400">Random Forest</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-300">Accuracy</span>
        <span className="text-purple-400">96.8%</span>
      </div>
    </div>
  </motion.div>
);

const FeatureCard = ({ icon, title, description, className, style, reduced }: { icon: ReactNode; title: string; description: string; className?: string; style?: CSSProperties; reduced: boolean }) => (
  <motion.div
    className={`absolute w-56 sm:w-64 p-4 bg-slate-800/90 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl ${className}`}
    style={{ ...style, transformStyle: 'preserve-3d', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.1)' }}
    initial={false}
    animate={false}
    whileHover={reduced ? undefined : { scale: 1.05, rotateY: 5, rotateX: -5, z: 20 }}
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <div className="flex items-center gap-3 mb-2">
      <div className="text-blue-400" aria-hidden="true">{icon}</div>
      <h3 className="font-semibold text-slate-100">{title}</h3>
    </div>
    <p className="text-sm text-slate-400">{description}</p>
  </motion.div>
);

function ProjectingCards({ scrollTransforms, reduced }: { scrollTransforms: any; reduced: boolean }) {
  const renderCard = (card: any, reduced: boolean) => {
    switch (card.type) {
      case 'DataManagementPreview':
        return <DataManagementPreview reduced={reduced} />;
      case 'ModelTrainingPreview':
        return <ModelTrainingPreview reduced={reduced} />;
      case 'PipelineManagementPreview':
        return <PipelineManagementPreview reduced={reduced} />;
      case 'DeploymentPreview':
        return <DeploymentPreview reduced={reduced} />;
      case 'AnalyticsPreview':
        return <AnalyticsPreview reduced={reduced} />;
      case 'MobileDesktopPreview':
        return <MobileDesktopPreview reduced={reduced} />;
      case 'CollaborationPreview':
        return <CollaborationPreview reduced={reduced} />;
      case 'TechStackPreview':
        return <TechStackPreview reduced={reduced} />;
      default:
        return <DataManagementPreview reduced={reduced} />;
    }
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
      {/* Cards positioned at extreme edges of screen (shifted 6% left) */}
      {/* Left edge of screen */}
      <motion.div
        className="absolute hidden sm:block"
        style={{
          left: '2%',
          top: '15%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
        animate={{ opacity: 1, scale: 1, rotateY: -20 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        {renderCard({ type: 'DataManagementPreview' }, reduced)}
      </motion.div>

      <motion.div
        className="absolute hidden sm:block"
        style={{
          left: '6%',
          top: '35%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ opacity: 0, scale: 0.8, rotateY: -18 }}
        animate={{ opacity: 1, scale: 1, rotateY: -18 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {renderCard({ type: 'PipelineManagementPreview' }, reduced)}
      </motion.div>

      <motion.div
        className="absolute hidden sm:block"
        style={{
          left: '0%',
          top: '55%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ opacity: 0, scale: 0.8, rotateY: -22 }}
        animate={{ opacity: 1, scale: 1, rotateY: -22 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {renderCard({ type: 'CollaborationPreview' }, reduced)}
      </motion.div>

      <motion.div
        className="absolute hidden sm:block"
        style={{
          left: '9%',
          top: '75%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ opacity: 0, scale: 0.8, rotateY: -16 }}
        animate={{ opacity: 1, scale: 1, rotateY: -16 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        {renderCard({ type: 'TechStackPreview' }, reduced)}
      </motion.div>

      {/* Right edge of screen */}
      <motion.div
        className="absolute hidden sm:block"
        style={{
          left: '86%',
          top: '20%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
        animate={{ opacity: 1, scale: 1, rotateY: 20 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {renderCard({ type: 'ModelTrainingPreview' }, reduced)}
      </motion.div>

      <motion.div
        className="absolute hidden sm:block"
        style={{
          left: '82%',
          top: '40%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ opacity: 0, scale: 0.8, rotateY: 18 }}
        animate={{ opacity: 1, scale: 1, rotateY: 18 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {renderCard({ type: 'DeploymentPreview' }, reduced)}
      </motion.div>

      <motion.div
        className="absolute hidden sm:block"
        style={{
          left: '88%',
          top: '60%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ opacity: 0, scale: 0.8, rotateY: 22 }}
        animate={{ opacity: 1, scale: 1, rotateY: 22 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {renderCard({ type: 'MobileDesktopPreview' }, reduced)}
      </motion.div>

      <motion.div
        className="absolute hidden sm:block"
        style={{
          left: '79%',
          top: '80%',
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ opacity: 0, scale: 0.8, rotateY: 16 }}
        animate={{ opacity: 1, scale: 1, rotateY: 16 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        {renderCard({ type: 'AnalyticsPreview' }, reduced)}
      </motion.div>

      {/* Additional Floating Elements */}
      <motion.div
        className="absolute top-[10%] left-[15%] hidden xl:block"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
      </motion.div>

      <motion.div
        className="absolute top-[25%] right-[20%] hidden xl:block"
        animate={{
          y: [0, 15, 0],
          rotate: [0, -3, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <div className="w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
      </motion.div>

      <motion.div
        className="absolute bottom-[20%] left-[25%] hidden xl:block"
        animate={{
          y: [0, -25, 0],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        <div className="w-28 h-28 bg-green-500/10 rounded-full blur-xl"></div>
      </motion.div>

      <motion.div
        className="absolute bottom-[35%] right-[25%] hidden xl:block"
        animate={{
          y: [0, 18, 0],
          rotate: [0, -6, 0],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      >
        <div className="w-20 h-20 bg-pink-500/10 rounded-full blur-xl"></div>
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ['start start', 'end start'] });
  const scrollTransforms = useScrollTransforms(scrollYProgress);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.6], [1, 0.8, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7], [1, 0.95, 0.8]);
  const shouldReduceMotion = useReducedMotion();
  const topHeadingOpacity = useTransform(scrollYProgress, [0, 0.15, 0.35], [0, 1, 1]);
  const heroHeadingOpacity = useTransform(scrollYProgress, [0, 0.15, 0.35], [0, 0.6, 1]);
  const topHeadingOpacitySpring = useSpring(topHeadingOpacity, { stiffness: 60, damping: 20 });

  return (
    <section aria-labelledby="hero-heading">
      <div ref={targetRef} className="relative h-screen overflow-hidden" style={{ position: 'relative' }}>
        <motion.div className="h-screen w-full flex flex-col items-center justify-center" style={{ opacity, scale }}>
          <div className="text-center z-10 relative mb-8 px-4">
            
            <p className="text-white/90 max-w-3xl mx-auto mt-6 text-lg font-medium leading-relaxed">
              Build, train, and deploy AI models with our revolutionary visual interface. 
              Drag-and-drop neural networks, instant preprocessing, and one-click deployment.
            </p>
            
            {/* Call to Action */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="relative inline-flex items-center gap-3 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shadow-2xl rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-blue-500/25"
              >
                <span className="relative z-10">Start Building AI Models</span>
                <span className="absolute inset-0 rounded-lg blur-lg bg-blue-500/70 animate-pulse" aria-hidden="true"></span>
              </Link>
              
              <Link
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 text-white/90 hover:text-white border border-white/30 hover:border-white/50 rounded-lg transition-all duration-300 hover:bg-white/10"
              >
                <span>Explore Features</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="relative w-full max-w-none aspect-[16/9] -mt-32 sm:-mt-36 lg:-mt-40 px-4 sm:px-6 lg:px-8" style={{ perspective: '2000px' }}>
            <motion.div
              style={{
                scale: scrollTransforms.laptopScale,
                rotateY: scrollTransforms.laptopRotateY,
                boxShadow: useTransform(scrollTransforms.screenGlow, [0, 1], [
                  '0 0 0px rgba(59, 130, 246, 0)',
                  '0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)'
                ])
              }}
              className="w-full h-full"
            >
              <LaptopDisplay screenGlow={scrollTransforms.screenGlow} shouldReduceMotion={!!shouldReduceMotion} />
            </motion.div>
            <ProjectingCards scrollTransforms={scrollTransforms} reduced={!!shouldReduceMotion} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}


