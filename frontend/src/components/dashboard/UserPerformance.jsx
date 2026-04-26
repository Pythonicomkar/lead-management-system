import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export default function UserPerformance({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="glass p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
          <Users className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            User Performance
          </h3>
          <p className="text-xs text-gray-500">Team performance metrics</p>
        </div>
      </div>

      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((user, index) => (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.3 + index * 0.1 }}
              className="glass-hover p-4 rounded-xl cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.user_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user.user_name}</p>
                    <p className="text-xs text-gray-500">{user.total_leads} leads</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-400">{user.conversion_rate}%</p>
                  <p className="text-xs text-gray-500">conversion</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${user.conversion_rate}%` }}
                  transition={{ duration: 1.5, delay: 1.5 + index * 0.1, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                />
              </div>

              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{user.converted_leads} converted</span>
                <span>{user.total_leads} total</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[200px] text-gray-500">
          <p>No user data available</p>
        </div>
      )}
    </motion.div>
  );
}