import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Users, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Layout from '../components/layout/Layout';
import { dashboardAPI } from '../api/dashboard';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [trends, setTrends] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [userPerf, setUserPerf] = useState([]);
  const [aging, setAging] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trendsRes, sourceRes, userRes, agingRes] = await Promise.all([
        dashboardAPI.getTrends(30),
        dashboardAPI.getSourcePerformance(),
        dashboardAPI.getUserPerformance(),
        dashboardAPI.getLeadAging(),
      ]);
      setTrends(trendsRes || []);
      setSourceData(sourceRes || []);
      setUserPerf(userRes || []);
      setAging(agingRes || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold gradient-text">Analytics</h1>
          <p className="text-gray-400 mt-1">Deep insights into your lead performance</p>
        </motion.div>

        {/* Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6"
        >
          <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
            <TrendingUp className="text-blue-400" size={20} />
            <span>Lead Trends (30 Days)</span>
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border: '1px solid rgba(59,130,246,0.3)',
                    borderRadius: '12px',
                  }}
                />
                <Area type="monotone" dataKey="new_leads" stroke="#3b82f6" fill="url(#colorNew)" name="New Leads" />
                <Area type="monotone" dataKey="closed_leads" stroke="#10b981" fill="url(#colorClosed)" name="Closed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Source Performance & Lead Aging */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6"
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
              <Target className="text-emerald-400" size={20} />
              <span>Source Performance</span>
            </h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="total_leads"
                    nameKey="source"
                    label={({ source, total_leads }) => `${source} (${total_leads})`}
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid rgba(59,130,246,0.3)',
                      borderRadius: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6"
          >
            <h3 className="text-lg font-semibold mb-6 flex items-center space-x-2">
              <Users className="text-violet-400" size={20} />
              <span>User Performance</span>
            </h3>
            <div className="space-y-4">
              {userPerf.map((user, index) => (
                <div key={user.user_id} className="glass-hover p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user.user_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{user.user_name}</p>
                        <p className="text-xs text-gray-400">{user.total_leads} leads</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-emerald-400">{user.conversion_rate}%</p>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${user.conversion_rate}%` }}
                      className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </div>
              ))}
              {userPerf.length === 0 && (
                <p className="text-center text-gray-400 py-8">No user data available</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}