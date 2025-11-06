import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import BottomNavigation from './components/BottomNavigation';
import CrisisModal from './components/CrisisModal';
import ChatTab from './components/ChatTab';
import ResourcesTab from './components/ResourcesTab';
import PlanTab from './components/PlanTab';
import GoalsTab from './components/GoalsTab';
import OnboardingFlow from './components/OnboardingFlow';
import StatsModal from './components/StatsModal';
import { trackSession } from './utils/analytics';
import firebaseAuthService from './services/firebaseAuth';
import firestoreService from './services/firestoreService';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  const [userId] = useState(() => {
    // Generate or retrieve anonymous user ID
    let id = localStorage.getItem('nitzutz-user-id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('nitzutz-user-id', id);
    }
    return id;
  });

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingComplete = localStorage.getItem('nitzutz-onboarding-complete');
    if (!onboardingComplete) {
      setShowOnboarding(true);
    }
    
    // Initialize Firebase authentication
    const initFirebase = async () => {
      try {
        const user = await firebaseAuthService.initializeAuth();
        if (user) {
          firestoreService.setUserId(user.uid);
          console.log('✅ Firebase authenticated with anonymous user:', user.uid);
        }
      } catch (error) {
        console.error('❌ Firebase auth failed:', error);
        console.warn('⚠️ App will work without Firebase (using localStorage)');
      }
    };
    
    initFirebase();
    
    // Track session start
    trackSession();
    
    // Set up any global app state or analytics here
    console.log('Nitzutz session started for user:', userId);
  }, [userId]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    console.log('✅ Onboarding completed');
  };

  const handleCrisisClick = () => {
    setIsCrisisModalOpen(true);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatTab userId={userId} />;
      case 'resources':
        return <ResourcesTab />;
      case 'goals':
        return <GoalsTab userId={userId} />;
      case 'plan':
        return <PlanTab userId={userId} />;
      default:
        return <ChatTab userId={userId} />;
    }
  };

  // Show onboarding if not completed
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <Header onCrisisClick={handleCrisisClick} onStatsClick={() => setShowStatsModal(true)} />
      
      {/* Desktop Sidebar Navigation - Hidden on Mobile */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 lg:min-h-screen">
        <div className="p-6 glass rounded-r-3xl m-2 mr-0">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Navigation</h2>
          <nav className="space-y-3">
            {[
              { id: 'chat', label: 'AI Chat Companion', icon: '💬', gradient: 'from-blue-400 to-blue-600' },
              { id: 'resources', label: 'NSW Resources', icon: '📚', gradient: 'from-green-400 to-green-600' },
              { id: 'goals', label: 'My Goals', icon: '🎯', gradient: 'from-purple-400 to-purple-600' },
              { id: 'plan', label: 'My Action Plan', icon: '📋', gradient: 'from-orange-400 to-orange-600' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center space-x-4 transform hover:scale-105 hover:shadow-lg group ${
                  activeTab === tab.id 
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-xl scale-105` 
                    : 'bg-white/70 text-gray-700 hover:bg-white/90 shadow-md'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  <span className="text-lg">{tab.icon}</span>
                </div>
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 lg:max-w-4xl lg:mx-auto w-full">
          <div className="fade-in">
            {renderActiveTab()}
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation - Mobile Only */}
      <div className="lg:hidden">
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      {/* Crisis Modal */}
      <CrisisModal 
        isOpen={isCrisisModalOpen} 
        onClose={() => setIsCrisisModalOpen(false)} 
      />
      
      {/* Stats Modal */}
      <StatsModal 
        isOpen={showStatsModal} 
        onClose={() => setShowStatsModal(false)} 
      />
    </div>
  );
}

export default App;
