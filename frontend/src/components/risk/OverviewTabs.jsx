import { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function OverviewTabs({ tabs, activeTab, setActiveTab }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#13132a] border border-gray-800 rounded-xl p-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => scroll('left')}
          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft size={18} className="text-gray-400" />
        </button>
        
        <div
          ref={scrollRef}
          className="flex space-x-2 overflow-x-auto scrollbar-hide flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => scroll('right')}
          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight size={18} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
}