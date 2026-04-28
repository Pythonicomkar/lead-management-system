import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Search, UserCheck, Power } from 'lucide-react';

const indicators = [
  { icon: AlertTriangle, label: 'Ethical Violations', count: 12, color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: Shield, label: 'Risk Alerts', count: 45, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Search, label: 'Investigate', count: 8, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: UserCheck, label: 'Account Deep Dive', count: 3, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Power, label: 'Session Control', count: 1, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

export default function IndicatorCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {indicators.map((indicator, index) => (
        <motion.div
          key={indicator.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05, translateY: -2 }}
          className="bg-gradient-to-br from-[#13132a] to-[#1a1a35] border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-cyan-500/30 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-xl ${indicator.bg}`}>
              <indicator.icon className={`w-6 h-6 ${indicator.color}`} />
            </div>
            <span className={`text-2xl font-bold ${indicator.color}`}>
              {indicator.count}
            </span>
          </div>
          <p className="text-sm text-gray-400 font-medium">{indicator.label}</p>
        </motion.div>
      ))}
    </div>
  );
}