import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Key } from 'lucide-react';
import Layout from '../components/layout/Layout';

const tabs = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold gradient-text">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account preferences</p>
        </motion.div>

        <div className="flex space-x-6">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass p-4 w-64 space-y-2"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-gray-400 hover:text-white hover:bg-primary-500/10'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 glass p-8"
          >
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Profile Settings</h3>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{user?.full_name || 'User'}</p>
                    <p className="text-gray-400">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={user?.full_name || ''}
                      className="w-full bg-slate-800/50 border border-primary-500/20 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary-500/50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full bg-slate-800/50 border border-primary-500/20 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary-500/50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                    <input
                      type="text"
                      value={user?.role || 'Agent'}
                      className="w-full bg-slate-800/50 border border-primary-500/20 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-primary-500/50"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Notification Preferences</h3>
                <p className="text-gray-400">Configure how you want to be notified.</p>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Security Settings</h3>
                <p className="text-gray-400">Manage your password and security preferences.</p>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold">Appearance</h3>
                <p className="text-gray-400">Customize the look and feel of your dashboard.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}