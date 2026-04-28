import { motion } from 'framer-motion';
import { Shield, AlertTriangle } from 'lucide-react';

export default function RiskScoreGauge() {
  const score = 44;
  const classification = 'NORMAL';
  
  // Calculate the arc
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = (score) => {
    if (score <= 33) return '#10b981'; // Green
    if (score <= 66) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getClassificationColor = (classification) => {
    switch(classification) {
      case 'LOW': return 'text-emerald-400';
      case 'NORMAL': return 'text-amber-400';
      case 'HIGH': return 'text-red-400';
      default: return 'text-amber-400';
    }
  };

  return (
    <div className="bg-[#13132a] border border-gray-800 rounded-xl p-6 text-center">
      <h2 className="text-lg font-semibold text-gray-200 mb-6 flex items-center justify-center space-x-2">
        <Shield className="text-cyan-400" size={20} />
        <span>Risk Score</span>
      </h2>
      
      {/* Circular Gauge */}
      <div className="relative flex items-center justify-center mb-6">
        <svg width="200" height="200" className="-rotate-90">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#1a1a3e"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={getColor(score)}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="drop-shadow-lg"
            style={{ filter: `drop-shadow(0 0 8px ${getColor(score)})` }}
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-5xl font-bold"
            style={{ color: getColor(score) }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-gray-500">/100</span>
        </div>
      </div>
      
      {/* Classification */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-opacity-10 ${
          classification === 'NORMAL' ? 'bg-amber-500/10' : 
          classification === 'LOW' ? 'bg-emerald-500/10' : 'bg-red-500/10'
        }`}
      >
        <AlertTriangle size={16} className={getClassificationColor(classification)} />
        <span className={`font-semibold ${getClassificationColor(classification)}`}>
          {classification}
        </span>
      </motion.div>
    </div>
  );
}