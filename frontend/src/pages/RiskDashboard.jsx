import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Upload, FileText, Settings, Bell, Search, ChevronDown } from 'lucide-react';
import StatsCards from '../components/risk/StatsCards';
import NetActivity from '../components/risk/NetActivity';
import RiskScoreGauge from '../components/risk/RiskScoreGauge';
import IndicatorCards from '../components/risk/IndicatorCards';
import OverviewTabs from '../components/risk/OverviewTabs';
import TradeCharts from '../components/risk/TradeCharts';

export default function RiskDashboard() {
  const [activeTab, setActiveTab] = useState('Risk Alerts');

  const overviewTabs = [
    'Risk Alerts', 'Behavior', 'Talking', 'Daily P&L', 'Decay', 
    'Martingale', 'Spike/Level', 'Copy Detect', 'News', 
    'Sizing', 'Broker PhL', 'Spread Sin', 'Recovery', 'Fingerprints'
  ];

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-gray-800 bg-[#0d0d1a]">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-lg font-bold text-cyan-400 tracking-wide">Winpro</h1>
                <p className="text-xs text-gray-400 -mt-1">Risk Engine</p>
              </div>
            </div>
            
            {/* Navigation Links */}
            <nav className="flex items-center space-x-6 ml-10">
              <button className="text-cyan-400 text-sm font-medium border-b-2 border-cyan-400 pb-2">Dashboard</button>
              <button className="text-gray-400 hover:text-gray-300 text-sm font-medium flex items-center space-x-1">
                <Upload size={14} />
                <span>MTS Upload & Analysis</span>
              </button>
              <button className="text-gray-400 hover:text-gray-300 text-sm font-medium">Deals</button>
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="bg-[#1a1a2e] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 w-64"
              />
            </div>
            
            <button className="text-gray-400 hover:text-gray-300">
              <Bell size={20} />
            </button>
            
            <div className="flex items-center space-x-3 border-l border-gray-700 pl-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <span className="text-xs font-bold">UG</span>
              </div>
              <div>
                <p className="text-sm font-medium">Umesh Vishwanath Gore</p>
                <p className="text-xs text-gray-400">Account Manager</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Stats Cards */}
        <StatsCards />

        {/* Net Activity & Risk Score Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <NetActivity />
          </div>
          <div>
            <RiskScoreGauge />
          </div>
        </div>

        {/* Indicator Cards */}
        <IndicatorCards />

        {/* Overview Tabs */}
        <OverviewTabs 
          tabs={overviewTabs} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* Charts Row */}
        <TradeCharts />

        {/* Save & Test Button */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            Save & Test
          </motion.button>
        </div>
      </main>
    </div>
  );
}