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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <Header onCrisisClick={handleCrisisClick} onStatsClick={() => setShowStatsModal(true)} />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 w-full max-w-4xl mx-auto">
          <div className="fade-in">
            {renderActiveTab()}
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation - Shown on Both Mobile and Desktop */}
      <div>
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
