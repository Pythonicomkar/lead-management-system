import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, Target, Clock } from 'lucide-react';
import Layout from '../components/layout/Layout';

const reports = [
  {
    icon: TrendingUp,
    title: 'Lead Conversion Report',
    description: 'Detailed conversion metrics and trends',
    color: 'from-blue-500 to-blue-600',
    endpoint: '/api/dashboard/stats',
  },
  {
    icon: Target,
    title: 'Source Performance Report',
    description: 'Lead sources breakdown and analysis',
    color: 'from-emerald-500 to-teal-600',
    endpoint: '/api/dashboard/source-performance',
  },
  {
    icon: Clock,
    title: 'Lead Aging Report',
    description: 'Average time leads spend in each status',
    color: 'from-amber-500 to-orange-600',
    endpoint: '/api/dashboard/lead-aging',
  },
  {
    icon: FileText,
    title: 'Activity Log',
    description: 'Complete history of all lead activities',
    color: 'from-violet-500 to-purple-600',
    endpoint: '/api/leads/activities/recent',
  },
];

export default function Reports() {
  return (
    <Layout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold gradient-text">Reports</h1>
          <p className="text-gray-400 mt-1">Generate and export reports</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, translateY: -5 }}
              className="glass card-hover p-6 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${report.color}`}>
                  <report.icon className="w-6 h-6 text-white" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-primary-500/20 rounded-lg transition-colors"
                >
                  <Download size={18} className="text-primary-400" />
                </motion.button>
              </div>
              <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
              <p className="text-sm text-gray-400">{report.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-8 rounded-2xl text-center"
        >
          <FileText className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Export All Data</h3>
          <p className="text-gray-400 mb-6">Download complete lead data as CSV</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl"
          >
            Export CSV
          </motion.button>
        </motion.div>
      </div>
    </Layout>
  );
}