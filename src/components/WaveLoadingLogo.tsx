'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface WaveLoadingLogoProps {
  size?: number;
}

export default function WaveLoadingLogo({ size = 64 }: WaveLoadingLogoProps) {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="relative overflow-hidden rounded-lg"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Main Logo */}
        <Image 
          src="/logo-simple.png" 
          alt="ML Studio Loading" 
          width={size} 
          height={size} 
          className="rounded-lg"
        />
        
        {/* Wave Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Brightness Wave */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-lg"
          animate={{
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  );
}
