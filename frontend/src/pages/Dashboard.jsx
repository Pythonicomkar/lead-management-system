import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Target, UserPlus, Activity, Sparkles } from 'lucide-react';
import { dashboardAPI } from '../api/dashboard';
import Layout from '../components/layout/Layout';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02, translateY: -5 }}
    className="glass card-hover p-6 cursor-pointer"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <p className="text-gray-400 text-sm font-medium mb-2">{label}</p>
    <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
      {value?.toLocaleString() || 0}
    </span>
  </motion.div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden glass p-8 rounded-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-2">
              <Sparkles className="w-6 h-6 text-primary-400" />
              <h1 className="text-3xl font-bold gradient-text">Dashboard Overview</h1>
            </div>
            <p className="text-gray-400 mt-2">Track your leads and conversions in real-time</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard icon={Users} label="Total Leads" value={stats.total_leads} color="from-blue-500 to-blue-600" delay={0.1} />
          <StatCard icon={UserPlus} label="New Leads" value={stats.new_leads} color="from-emerald-500 to-teal-600" delay={0.2} />
          <StatCard icon={Activity} label="Contacted" value={stats.contacted_leads} color="from-amber-500 to-orange-600" delay={0.3} />
          <StatCard icon={Target} label="Closed" value={stats.closed_leads} color="from-violet-500 to-purple-600" delay={0.4} />
          <StatCard icon={TrendingUp} label="Conversion Rate" value={`${stats.conversion_rate}%`} color="from-rose-500 to-pink-600" delay={0.5} />
          <StatCard icon={DollarSign} label="Total Value" value={`$${stats.total_value?.toLocaleString() || 0}`} color="from-cyan-500 to-blue-600" delay={0.6} />
        </div>
      </div>
    </Layout>
  );
}