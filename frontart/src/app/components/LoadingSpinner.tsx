import { motion } from 'motion/react';
import { Palette } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="text-center">
        <motion.div
          className="inline-block"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <Palette className="w-16 h-16 text-[#a73f2b]" />
        </motion.div>
        
        <motion.p
          className="mt-4 text-gray-600"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading artworks...
        </motion.p>
      </div>
    </div>
  );
}
