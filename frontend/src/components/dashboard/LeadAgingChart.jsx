import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock } from 'lucide-react';

const COLORS = {
  new: '#3b82f6',
  contacted: '#f59e0b',
  closed: '#10b981',
};

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-4 rounded-xl shadow-2xl border border-primary-500/30">
        <p className="text-sm text-gray-400 capitalize">{payload[0].payload.status}</p>
        <p className="text-lg font-bold">{payload[0].value} leads</p>
        <p className="text-sm text-gray-400">Avg age: {payload[0].payload.average_days} days</p>
      </div>
    );
  }
  return null;
};

export default function LeadAgingChart({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.1 }}
      className="glass p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
          <Clock className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Lead Aging Report
          </h3>
          <p className="text-xs text-gray-500">Average days by status</p>
        </div>
      </div>

      {data && data.length > 0 ? (
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} />
              <XAxis
                dataKey="status"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 12 }}
                tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar
                dataKey="count"
                radius={[8, 8, 0, 0]}
                animationDuration={2000}
              >
                {data?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.status] || '#6b7280'}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[350px] text-gray-500">
          <p>No aging data available</p>
        </div>
      )}
    </motion.div>
  );
}