'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface AdvancedLoadingLogoProps {
  size?: number;
  showText?: boolean;
}

export default function AdvancedLoadingLogo({ size = 80, showText = true }: AdvancedLoadingLogoProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Main Logo with Multiple Effects */}
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Background Glow */}
        <motion.div
          className="absolute inset-0 bg-blue-500/20 rounded-lg blur-lg"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Main Logo */}
        <motion.div
          animate={{
            filter: [
              'brightness(0.8) contrast(1.1)',
              'brightness(1.3) contrast(1.2)',
              'brightness(0.8) contrast(1.1)'
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image 
            src="/logo-simple.png" 
            alt="ML Studio Loading" 
            width={size} 
            height={size} 
            className="rounded-lg relative z-10"
          />
        </motion.div>
        
        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-lg"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Pulse Ring */}
        <motion.div
          className="absolute inset-0 border-2 border-blue-400/50 rounded-lg"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      {/* Loading Text */}
      {showText && (
        <motion.div
          className="text-center"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <h3 className="text-white font-semibold text-lg">MLStudio</h3>
          <motion.div
            className="flex space-x-1 justify-center mt-2"
            animate={{
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
