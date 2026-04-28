import { motion } from 'framer-motion';
import { BarChart3, Clock, Activity } from 'lucide-react';

export default function TradeCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Max Trades/Second */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#13132a] border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-400">Max Trades/Second</h3>
          <BarChart3 size={18} className="text-blue-400" />
        </div>
        <div className="flex items-end space-x-3 h-32">
          {[0.5, 1.2, 0.8, 2.0, 1.5, 0.3, 0.7, 1.8, 0.6, 1.0].map((val, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${val * 40}px` }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-md"
            />
          ))}
        </div>
        <p className="text-3xl font-bold text-blue-400 mt-4">2</p>
      </motion.div>

      {/* Timing Regularity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#13132a] border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-400">Timing Regularity</h3>
          <Clock size={18} className="text-purple-400" />
        </div>
        <div className="flex items-center justify-center h-32">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#1a1a3e" strokeWidth="15" />
            <motion.circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="#a855f7"
              strokeWidth="15"
              strokeLinecap="round"
              strokeDasharray={`${4.1 * 3.14} ${100 * 3.14}`}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: -90, opacity: 1 }}
              transition={{ duration: 1 }}
              transform="rotate(-90 60 60)"
            />
            <text x="60" y="55" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">4.1%</text>
            <text x="60" y="72" textAnchor="middle" fill="#9ca3af" fontSize="10">Regular</text>
          </svg>
        </div>
      </motion.div>

      {/* Lot Size Variance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#13132a] border border-gray-800 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-400">Lot Size Variance (CV)</h3>
          <Activity size={18} className="text-emerald-400" />
        </div>
        <div className="flex items-center justify-center h-32">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#1a1a3e" strokeWidth="15" />
            <motion.circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="#10b981"
              strokeWidth="15"
              strokeLinecap="round"
              strokeDasharray={`${45.7 * 3.14} ${100 * 3.14}`}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: -90, opacity: 1 }}
              transition={{ duration: 1 }}
            />
            <text x="60" y="55" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">0.457</text>
            <text x="60" y="72" textAnchor="middle" fill="#9ca3af" fontSize="10">CV Value</text>
          </svg>
        </div>
      </motion.div>
    </div>
  );
}