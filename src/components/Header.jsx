import React, { useState, useEffect } from 'react';
import { BarChart3, Wifi, WifiOff } from 'lucide-react';
import Logo from './Logo';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Header = ({ onCrisisClick, onStatsClick }) => {
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  useEffect(() => {
    // Check Firebase connection status using auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseConnected(true);
        console.log('🔍 Firebase Status Check: ✅ Connected (User:', user.uid.substring(0, 8) + '...)');
      } else {
        setFirebaseConnected(false);
        console.log('🔍 Firebase Status Check: ❌ Not Connected');
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);
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
        {/* Firebase Connection Status Indicator */}
        <div 
          className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
          style={{
            backgroundColor: firebaseConnected ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            border: `1px solid ${firebaseConnected ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`
          }}
          title={firebaseConnected ? 'Firebase connected - Data is being saved' : 'Firebase not connected - Using local storage only'}
        >
          {firebaseConnected ? (
            <>
              <Wifi size={14} className="text-green-400" />
              <span className="text-green-300">Sync</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-red-400" />
              <span className="text-red-300">Offline</span>
            </>
          )}
        </div>

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
