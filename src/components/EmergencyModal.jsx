import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, X, AlertTriangle, Heart, Shield } from 'lucide-react';
import emergencyLogger from '../services/emergencyLogger';
import SafetyPlanBuilder from './SafetyPlanBuilder';

const EmergencyModal = ({ isOpen, onClose, detectionResult, userId }) => {
  const [countdown, setCountdown] = useState(10);
  const [hasAttemptedCall, setHasAttemptedCall] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showSafetyPlan, setShowSafetyPlan] = useState(false);
  const [currentView, setCurrentView] = useState('emergency'); // 'emergency', 'support', 'plan'

  // Emergency contacts with regional support
  const emergencyContacts = [
    { 
      name: 'Emergency Services (Australia)', 
      number: '000', 
      description: 'Police, Fire, Ambulance - Immediate emergency response',
      region: 'AU',
      priority: 1
    },
    { 
      name: 'Emergency Services (US)', 
      number: '911', 
      description: 'Police, Fire, Ambulance - Immediate emergency response',
      region: 'US',
      priority: 1
    },
    { 
      name: 'Lifeline Australia', 
      number: '13 11 14', 
      description: '24/7 crisis support & suicide prevention',
      region: 'AU',
      priority: 2,
      webChat: 'https://www.lifeline.org.au/crisis-chat/'
    },
    { 
      name: 'National Suicide Prevention Lifeline (US)', 
      number: '988', 
      description: '24/7 crisis support & suicide prevention',
      region: 'US',
      priority: 2,
      webChat: 'https://suicidepreventionlifeline.org/chat/'
    },
    { 
      name: 'NSW Mental Health Line', 
      number: '1800 011 511', 
      description: '24/7 NSW mental health crisis support',
      region: 'AU',
      priority: 3
    },
    { 
      name: 'Crisis Text Line (US)', 
      number: '741741', 
      description: 'Text HOME to 741741 for crisis support',
      region: 'US',
      priority: 3,
      isTextLine: true
    }
  ];

  // Detect user's likely region (basic detection)
  const getUserRegion = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Australia') || timezone.includes('Sydney') || timezone.includes('Melbourne')) {
      return 'AU';
    }
    return 'US'; // Default to US
  };

  const userRegion = getUserRegion();
  const relevantContacts = emergencyContacts
    .filter(contact => contact.region === userRegion)
    .sort((a, b) => a.priority - b.priority);

  const primaryEmergencyNumber = relevantContacts.find(c => c.priority === 1)?.number || '911';

  useEffect(() => {
    if (!isOpen) return;

    // Log modal opening
    emergencyLogger.logEmergencyInteraction('modal_opened', {
      detectionResult,
      autoDialEnabled: true,
      countdownDuration: countdown
    }, userId);

    // Auto-dial countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleEmergencyCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, [isOpen]);

  const handleEmergencyCall = async () => {
    if (hasAttemptedCall) return;
    
    setHasAttemptedCall(true);
    
    try {
      // Log the emergency action
      await emergencyLogger.logEmergencyAction('auto_call_initiated', {
        number: primaryEmergencyNumber,
        method: 'auto_dial',
        countdownCompleted: countdown <= 0,
        userRegion,
        detectionResult
      }, userId);
      
      // Attempt to initiate call
      window.location.href = `tel:${primaryEmergencyNumber}`;
      
    } catch (error) {
      console.error('Failed to initiate emergency call:', error);
      
      // Log the failure
      await emergencyLogger.logEmergencyAction('auto_call_failed', {
        number: primaryEmergencyNumber,
        error: error.message,
        detectionResult
      }, userId);
    }
  };

  const handleManualCall = async (number) => {
    try {
      // Log manual call
      await emergencyLogger.logEmergencyAction('manual_call_initiated', {
        number,
        method: 'manual_click',
        detectionResult
      }, userId);
      
      window.location.href = `tel:${number}`;
    } catch (error) {
      console.error('Failed to initiate call:', error);
      
      // Log failure and provide fallback
      await emergencyLogger.logEmergencyAction('manual_call_failed', {
        number,
        error: error.message,
        fallbackUsed: true
      }, userId);
      
      // Fallback: copy number to clipboard
      navigator.clipboard?.writeText(number);
      alert(`Call ${number} immediately. Number copied to clipboard.`);
    }
  };

  const handleWebChat = async (url) => {
    if (url) {
      await emergencyLogger.logEmergencyAction('web_chat_initiated', {
        url,
        detectionResult
      }, userId);
      
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleStopCountdown = async () => {
    await emergencyLogger.logEmergencyInteraction('countdown_stopped', {
      remainingTime: countdown,
      detectionResult
    }, userId);
    
    setCountdown(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-red-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[100] fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden border-4 border-red-500">
        
        {/* Compassionate Header */}
        <div className="relative p-6 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                <Heart size={32} className="text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">I'm Really Worried About You</h2>
                <p className="text-white/90 text-base font-medium">
                  You're not alone in this. Let's get you help right now. 💙
                </p>
              </div>
            </div>
            
            {!hasAttemptedCall && countdown > 0 && currentView === 'emergency' && (
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{countdown}</div>
                <p className="text-white/80 text-sm font-medium">Connecting to help</p>
              </div>
            )}
          </div>
          
          {/* Navigation Tabs */}
          <div className="mt-6 flex space-x-2">
            <button
              onClick={() => setCurrentView('emergency')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                currentView === 'emergency' 
                  ? 'bg-white text-blue-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Immediate Help
            </button>
            <button
              onClick={() => setCurrentView('support')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                currentView === 'support' 
                  ? 'bg-white text-blue-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Support Resources
            </button>
            <button
              onClick={() => setCurrentView('plan')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                currentView === 'plan' 
                  ? 'bg-white text-blue-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Safety Plan
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(95vh-200px)] overflow-y-auto">
          
          {/* Emergency View */}
          {currentView === 'emergency' && (
            <>
              {/* Compassionate Message */}
              <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl slide-up">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Heart size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-800 mb-3">
                    You're Not Alone - Help is Available Right Now
                  </h3>
                  <p className="text-blue-700 mb-4 leading-relaxed">
                    I can see you're going through an incredibly difficult time. Your life has value, and there are people who want to help you through this. Let's get you connected with support immediately.
                  </p>
                </div>
              </div>

              {/* Auto-dial Section */}
              {!hasAttemptedCall && countdown > 0 && (
                <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl slide-up">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <Phone size={36} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">
                      Connecting you to help in {countdown} seconds
                    </h3>
                    <p className="text-green-700 mb-4">
                      We'll call {primaryEmergencyNumber} to get you immediate support. You deserve help and care.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={handleEmergencyCall}
                        className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-2xl font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                      >
                        Connect Now
                      </button>
                      <button
                        onClick={handleStopCountdown}
                        className="px-6 py-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-2xl font-semibold transition-all duration-200"
                      >
                        Wait, let me choose
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Support Resources View */}
          {currentView === 'support' && (
            <>
              {/* Manual Emergency Contacts */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Phone className="text-blue-500" size={24} />
                  <span>Professional Support Available 24/7</span>
                </h3>
            
            <div className="space-y-4">
              {relevantContacts.map((contact, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg">{contact.name}</h4>
                      <p className="text-3xl font-bold text-red-600 mt-1">
                        {contact.isTextLine ? `Text HOME to ${contact.number}` : contact.number}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{contact.description}</p>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleManualCall(contact.number)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Phone size={18} />
                      <span>{contact.isTextLine ? 'Text Now' : 'Call Now'}</span>
                    </button>
                    
                    {contact.webChat && (
                      <button 
                        onClick={() => handleWebChat(contact.webChat)}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <MessageSquare size={18} />
                        <span>Web Chat</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Immediate Safety Reminders */}
          <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl slide-up">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center">
                <span className="text-white text-xl">💙</span>
              </div>
              <h3 className="font-bold text-blue-800 text-lg">You Are Not Alone</h3>
            </div>
            <ul className="text-sm text-blue-700 space-y-2 ml-13">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="font-medium">This crisis will pass - you can get through this</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="font-medium">Professional help is available 24/7</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="font-medium">Your life has value and meaning</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="font-medium">Seeking help is a sign of strength</span>
              </li>
            </ul>
          </div>
            </>
          )}

          {/* Safety Plan View */}
          {currentView === 'plan' && (
            <>
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Shield size={36} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  Let's Create a Safety Plan Together
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  A safety plan is a personalized tool that can help you stay safe and cope during difficult moments. Would you like to create one together right now? It only takes a few minutes and could make a real difference.
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setShowSafetyPlan(true)}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Yes, Let's Create a Plan 🛡️
                  </button>
                </div>
                
                <p className="text-sm text-gray-500 mt-4">
                  Your safety plan will be saved privately and you can access it anytime
                </p>
              </div>
              
              {/* Existing Safety Plan Check */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <p className="text-blue-800 text-sm">
                  💡 <strong>Already have a safety plan?</strong> You can say "show my safety plan" in our chat anytime to review it.
                </p>
              </div>
            </>
          )}

          {/* Detection Details (for transparency) */}
          {currentView === 'support' && (
            <div className="border-t pt-4 mt-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                {showDetails ? 'Hide' : 'Show'} Detection Details
              </button>
              
              {showDetails && detectionResult && (
                <div className="mt-3 p-4 bg-gray-50 rounded-xl text-xs text-gray-600">
                  <p><strong>Risk Level:</strong> {detectionResult.riskLevel}</p>
                  <p><strong>Detected At:</strong> {new Date(detectionResult.timestamp).toLocaleString()}</p>
                  {detectionResult.matchedPhrases.length > 0 && (
                    <p><strong>Triggered by:</strong> {detectionResult.matchedPhrases.join(', ')}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with close option */}
        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
          <p className="text-sm text-gray-600">
            This alert was triggered by our safety system to ensure your wellbeing.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Safety Plan Builder Modal */}
      <SafetyPlanBuilder
        isOpen={showSafetyPlan}
        onClose={() => setShowSafetyPlan(false)}
        userId={userId}
        detectionResult={detectionResult}
      />
    </div>
  );
};

export default EmergencyModal;
