import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Target, Phone, UserPlus, Activity, Zap } from 'lucide-react';
import CountUp from 'react-countup';

const StatCard = ({ icon: Icon, label, value, prefix, suffix, trend, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02, translateY: -5 }}
    className="glass card-hover p-6 cursor-pointer group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.3 }}
          className={`px-2 py-1 rounded-lg text-xs font-semibold ${
            trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {trend > 0 ? '+' : ''}{trend}%
        </motion.span>
      )}
    </div>
    <p className="text-gray-400 text-sm font-medium mb-2">{label}</p>
    <div className="flex items-baseline space-x-2">
      {prefix && <span className="text-2xl text-gray-500">{prefix}</span>}
      <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        <CountUp end={value} duration={2.5} separator="," />
      </span>
      {suffix && <span className="text-lg text-gray-500">{suffix}</span>}
    </div>
  </motion.div>
);

export default function StatsCards({ stats }) {
  const cards = [
    {
      icon: Users,
      label: 'Total Leads',
      value: stats?.total_leads || 0,
      trend: 12,
      color: 'from-blue-500 to-blue-600',
      delay: 0.1,
    },
    {
      icon: UserPlus,
      label: 'New Leads',
      value: stats?.new_leads || 0,
      trend: 8,
      color: 'from-emerald-500 to-teal-600',
      delay: 0.2,
    },
    {
      icon: Phone,
      label: 'Contacted',
      value: stats?.contacted_leads || 0,
      trend: -3,
      color: 'from-amber-500 to-orange-600',
      delay: 0.3,
    },
    {
      icon: Target,
      label: 'Closed',
      value: stats?.closed_leads || 0,
      color: 'from-violet-500 to-purple-600',
      delay: 0.4,
    },
    {
      icon: TrendingUp,
      label: 'Conversion Rate',
      value: stats?.conversion_rate || 0,
      suffix: '%',
      color: 'from-rose-500 to-pink-600',
      delay: 0.5,
    },
    {
      icon: DollarSign,
      label: 'Total Value',
      value: stats?.total_value || 0,
      prefix: '$',
      color: 'from-cyan-500 to-blue-600',
      delay: 0.6,
    },
    {
      icon: Activity,
      label: 'This Week',
      value: stats?.leads_this_week || 0,
      trend: 15,
      color: 'from-indigo-500 to-blue-600',
      delay: 0.7,
    },
    {
      icon: Zap,
      label: 'Avg Value',
      value: stats?.average_value || 0,
      prefix: '$',
      color: 'from-fuchsia-500 to-pink-600',
      delay: 0.8,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
}