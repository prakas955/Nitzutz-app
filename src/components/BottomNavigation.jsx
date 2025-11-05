import React from 'react';
import { MessageCircle, BookOpen, Calendar, Target } from 'lucide-react';

const BottomNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageCircle, gradient: 'from-blue-500 to-purple-600' },
    { id: 'resources', label: 'Resources', icon: BookOpen, gradient: 'from-green-500 to-emerald-600' },
    { id: 'goals', label: 'Goals', icon: Target, gradient: 'from-purple-500 to-pink-600' },
    { id: 'plan', label: 'Plan', icon: Calendar, gradient: 'from-orange-500 to-red-600' },
  ];

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 safe-area-bottom">
      {/* Floating navigation container */}
      <div className="glass rounded-3xl shadow-2xl backdrop-blur-xl border border-white/30">
        <div className="flex justify-around items-center py-3 px-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center py-2 transition-all duration-300 transform active:scale-95 relative group ${
                  isActive ? 'scale-110' : 'hover:scale-105'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Active indicator background */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-white/20 scale-110"></div>
                )}
                
                {/* Icon container */}
                <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center mb-1 transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-r ${tab.gradient} shadow-lg` 
                    : 'bg-white/30 group-hover:bg-white/50 shadow-md'
                }`}>
                  <Icon 
                    size={22} 
                    className={`transition-all duration-300 ${
                      isActive ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'
                    }`}
                  />
                  
                  {/* Glow effect for active tab */}
                  {isActive && (
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${tab.gradient} opacity-30 blur-lg scale-150`}></div>
                  )}
                </div>
                
                {/* Label */}
                <span className={`text-xs font-semibold transition-all duration-300 relative ${
                  isActive ? 'text-white opacity-100 scale-105' : 'text-gray-700 opacity-80'
                }`}>
                  {tab.label}
                </span>
                
                {/* Active dot indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full shadow-lg"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;
