'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface LoadingLogoProps {
  size?: number;
  variant?: 'pulse' | 'wave' | 'glow' | 'rotate' | 'breathe';
}

export default function LoadingLogo({ size = 64, variant = 'pulse' }: LoadingLogoProps) {
  const variants = {
    pulse: {
      animate: {
        scale: [1, 1.1, 1],
        opacity: [0.7, 1, 0.7],
        transition: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    wave: {
      animate: {
        opacity: [0.3, 1, 0.3],
        filter: [
          'brightness(0.5)',
          'brightness(1.5)',
          'brightness(0.5)'
        ],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    glow: {
      animate: {
        filter: [
          'brightness(0.8) drop-shadow(0 0 5px rgba(59, 130, 246, 0.3))',
          'brightness(1.2) drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))',
          'brightness(0.8) drop-shadow(0 0 5px rgba(59, 130, 246, 0.3))'
        ],
        transition: {
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    rotate: {
      animate: {
        rotate: [0, 360],
        scale: [1, 1.05, 1],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    breathe: {
      animate: {
        scale: [1, 1.15, 1],
        opacity: [0.6, 1, 0.6],
        filter: [
          'brightness(0.7)',
          'brightness(1.3)',
          'brightness(0.7)'
        ],
        transition: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    }
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="relative"
        variants={variants[variant]}
        animate="animate"
      >
        <Image 
          src="/logo-simple.png" 
          alt="ML Studio Loading" 
          width={size} 
          height={size} 
          className="rounded-lg"
        />
        
        {/* Optional overlay for extra effects */}
        {variant === 'wave' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-lg"
            animate={{
              x: ['-100%', '100%'],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
