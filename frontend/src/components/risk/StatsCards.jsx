import { motion } from 'framer-motion';
import { 
  FileText, User, Briefcase, Shield, 
  Fingerprint, Scale, Brain, TrendingUp 
} from 'lucide-react';

const stats = [
  { icon: FileText, label: 'Parsed', value: '164,558', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { icon: User, label: 'Account', value: 'Umesh Gore', color: 'text-emerald-400', bg: 'bg-emerald-500/10', isText: true },
  { icon: Briefcase, label: 'Deals', value: '481', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { icon: Shield, label: 'Forensic Analysis', value: '328', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { icon: Fingerprint, label: 'Strategy Fingerprint', value: '320', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { icon: Scale, label: 'Prosecution Board', value: '320', color: 'text-red-400', bg: 'bg-red-500/10' },
  { icon: Brain, label: 'AI Deep Analysis', value: '320', color: 'text-pink-400', bg: 'bg-pink-500/10' },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-[#13132a] border border-gray-800 rounded-xl p-4 hover:border-cyan-500/30 transition-all cursor-pointer"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
          <p className={`text-lg font-bold ${stat.isText ? 'text-sm' : ''} ${stat.color}`}>
            {stat.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
}