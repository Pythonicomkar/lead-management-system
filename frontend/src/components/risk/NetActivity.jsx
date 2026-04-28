import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Percent, Activity, BarChart3, Clock } from 'lucide-react';

const metrics = [
  { icon: DollarSign, label: 'Net P&L', value: '+$76,854.10', color: 'text-emerald-400', positive: true },
  { icon: Percent, label: 'Win Rate', value: '56.3%', color: 'text-blue-400', positive: true },
  { icon: TrendingUp, label: 'Profit Factor', value: '1.96', color: 'text-cyan-400', positive: true },
  { icon: BarChart3, label: 'Total Trades', value: '320', color: 'text-purple-400' },
  { icon: Activity, label: 'Volume', value: '24.0m', color: 'text-amber-400' },
  { icon: Clock, label: 'Avg Duration', value: '9.07', color: 'text-pink-400' },
];

export default function NetActivity() {
  return (
    <div className="bg-[#13132a] border border-gray-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center space-x-2">
        <Activity className="text-cyan-400" size={20} />
        <span>Net Activity</span>
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#0a0a1a] border border-gray-800/50 rounded-xl p-4 hover:border-cyan-500/20 transition-all"
          >
            <div className="flex items-center space-x-2 mb-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <span className="text-xs text-gray-500">{metric.label}</span>
            </div>
            <p className={`text-xl font-bold ${metric.color}`}>
              {metric.value}
            </p>
            {metric.positive && (
              <div className="flex items-center mt-1">
                <TrendingUp size={12} className="text-emerald-400" />
                <span className="text-xs text-emerald-400 ml-1">Positive</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}