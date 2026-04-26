import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <motion.div
        className="relative w-20 h-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-pulse-glow" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-accent-500 animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
      </motion.div>
      <motion.p
        className="mt-4 text-gray-400 font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Loading...
      </motion.p>
    </div>
  );
}