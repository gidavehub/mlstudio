'use client';

import LoadingLogo from './LoadingLogo';
import AdvancedLoadingLogo from './AdvancedLoadingLogo';
import WaveLoadingLogo from './WaveLoadingLogo';

export default function LoadingLogoDemo() {
  return (
    <div className="p-8 bg-ml-dark-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Loading Logo Animations</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Basic LoadingLogo Variants */}
          <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-xl p-6 text-center">
            <h3 className="text-white font-semibold mb-4">Pulse Effect</h3>
            <LoadingLogo variant="pulse" size={80} />
          </div>
          
          <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-xl p-6 text-center">
            <h3 className="text-white font-semibold mb-4">Wave Effect</h3>
            <LoadingLogo variant="wave" size={80} />
          </div>
          
          <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-xl p-6 text-center">
            <h3 className="text-white font-semibold mb-4">Glow Effect</h3>
            <LoadingLogo variant="glow" size={80} />
          </div>
          
          <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-xl p-6 text-center">
            <h3 className="text-white font-semibold mb-4">Rotate Effect</h3>
            <LoadingLogo variant="rotate" size={80} />
          </div>
          
          <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-xl p-6 text-center">
            <h3 className="text-white font-semibold mb-4">Breathe Effect</h3>
            <LoadingLogo variant="breathe" size={80} />
          </div>
          
          {/* Advanced Loading Logo */}
          <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-xl p-6 text-center">
            <h3 className="text-white font-semibold mb-4">Advanced Multi-Effect</h3>
            <AdvancedLoadingLogo size={80} showText={true} />
          </div>
          
          {/* Wave Loading Logo */}
          <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-xl p-6 text-center">
            <h3 className="text-white font-semibold mb-4">Simple Wave</h3>
            <WaveLoadingLogo size={80} />
          </div>
          
          {/* Usage Examples */}
          <div className="bg-ml-dark-100 border border-ml-dark-300 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Usage Examples</h3>
            <div className="space-y-4 text-sm text-ml-dark-400">
              <div>
                <code className="text-blue-400">{"<LoadingLogo variant='pulse' />"}</code>
                <p className="mt-1">Simple pulse animation</p>
              </div>
              <div>
                <code className="text-blue-400">{"<AdvancedLoadingLogo showText={true} />"}</code>
                <p className="mt-1">Full-featured with text</p>
              </div>
              <div>
                <code className="text-blue-400">{"<WaveLoadingLogo size={64} />"}</code>
                <p className="mt-1">Clean wave effect</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-ml-dark-400">
            All animations use your <code className="text-blue-400">/logo-simple.png</code> file
          </p>
        </div>
      </div>
    </div>
  );
}
