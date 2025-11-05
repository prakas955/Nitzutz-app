import React from 'react';
import { BarChart3 } from 'lucide-react';
import Logo from './Logo';

const Header = ({ onCrisisClick, onStatsClick }) => {
  return (
    <header className="px-4 py-4 flex items-center justify-between lg:px-6 lg:py-6 lg:relative lg:z-10 safe-area-top glass-dark backdrop-blur-md">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Logo className="h-12 w-12 lg:h-14 lg:w-14" />
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 blur"></div>
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Nitzutz
          </h1>
          <p className="text-sm lg:text-base -mt-1 text-white/80 font-medium">
            Mental Health Support
          </p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        {/* Stats Button */}
        <button
          onClick={onStatsClick}
          className="relative px-4 py-3 rounded-xl text-sm font-semibold transform transition-all duration-300 active:scale-95 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/20"
          title="View your progress and analytics"
          aria-label="View Progress Statistics"
        >
          <BarChart3 size={20} className="text-white" />
        </button>
        
        {/* Crisis Button - Enhanced with glow effect and emergency trigger */}
        <button
          onClick={onCrisisClick}
          className="relative px-6 py-3 lg:px-8 lg:py-4 rounded-2xl text-sm lg:text-base font-bold transform transition-all duration-300 active:scale-95 min-w-[120px] pulse-glow overflow-hidden group"
          style={{ 
            background: 'linear-gradient(135deg, #ff4757 0%, #ff3838 100%)',
            color: '#ffffff',
            boxShadow: '0 8px 32px rgba(255, 71, 87, 0.4)'
          }}
          title="Click for immediate crisis support and emergency contacts"
          aria-label="Emergency Crisis Support Button"
        >
          {/* Ripple effect overlay */}
          <div className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity duration-200 rounded-2xl"></div>
          
          <span className="relative flex items-center space-x-2">
            <span className="text-lg animate-bounce">🚨</span>
            <span className="hidden sm:inline font-extrabold">Crisis Support</span>
            <span className="sm:hidden font-extrabold">SOS</span>
          </span>
          
          {/* Gradient border */}
          <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-white/30 to-white/10">
            <div className="w-full h-full rounded-2xl bg-transparent"></div>
          </div>
          
          {/* Always visible emergency indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
        </button>
      </div>
    </header>
  );
};

export default Header;
