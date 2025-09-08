import Image from 'next/image';
import Link from 'next/link';
import Hero from '@/components/Hero';

export default function LandingPage() {
  return (
    <main className="relative h-screen overflow-hidden">
      {/* Darker Red-to-Blue Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-800 via-purple-900 to-blue-800"></div>
      
      {/* Smoky/Cloudy Pattern Elements */}
      <div className="absolute inset-0">
        {/* Large smoky clouds */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-red-600/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Medium smoky orbs */}
        <div className="absolute top-32 left-1/3 w-48 h-48 bg-red-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-48 right-1/3 w-56 h-56 bg-purple-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-32 right-1/4 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Smaller floating elements */}
        <div className="absolute top-60 left-20 w-32 h-32 bg-pink-500/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-80 right-40 w-24 h-24 bg-indigo-500/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2.5s' }}></div>
        <div className="absolute bottom-60 left-40 w-28 h-28 bg-rose-500/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '3.5s' }}></div>
        <div className="absolute bottom-80 right-20 w-36 h-36 bg-violet-500/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.8s' }}></div>
        
        {/* Random scattered small clouds */}
        <div className="absolute top-1/4 left-1/5 w-20 h-20 bg-red-400/30 rounded-full blur-lg animate-pulse" style={{ animationDelay: '4.5s' }}></div>
        <div className="absolute top-1/3 right-1/5 w-16 h-16 bg-purple-400/30 rounded-full blur-lg animate-pulse" style={{ animationDelay: '1.2s' }}></div>
        <div className="absolute bottom-1/4 left-1/6 w-18 h-18 bg-blue-400/30 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2.8s' }}></div>
        <div className="absolute bottom-1/3 right-1/6 w-22 h-22 bg-pink-400/30 rounded-full blur-lg animate-pulse" style={{ animationDelay: '3.8s' }}></div>
        
        {/* Additional atmospheric elements */}
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-red-600/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.8s' }}></div>
        <div className="absolute top-1/2 right-1/2 w-48 h-48 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3.2s' }}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:px-3 focus:py-2 focus:bg-white/90 focus:text-slate-900 rounded">Skip to content</a>
        
        {/* Floating Logo */}
      <div className="fixed top-0 right-[8px] z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
        <Image src="/logo.png" alt="ML Studio Logo" width={240} height={240} style={{ width: 'auto', height: 'auto' }} />
          </div>
      </div>
      
      <div id="main-content">
        <Hero />
      </div>
      </div>
    </main>
  );
}


