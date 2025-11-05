import React, { useState, useEffect } from 'react';
import { Heart, Phone, Users, Calendar, CheckCircle, Plus, X } from 'lucide-react';

const SafetyPlanBuilder = ({ isOpen, onClose, userId, detectionResult }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [safetyPlan, setSafetyPlan] = useState({
    warningSignsPersonal: [],
    copingStrategies: [],
    supportContacts: [],
    professionalContacts: [],
    safeEnvironment: [],
    reasonsToLive: [],
    emergencyContacts: [
      { name: 'Emergency Services', number: '000', type: 'emergency' },
      { name: 'Lifeline Australia', number: '13 11 14', type: 'crisis' },
      { name: 'NSW Mental Health Line', number: '1800 011 511', type: 'crisis' }
    ]
  });
  const [currentInput, setCurrentInput] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const planSteps = [
    {
      id: 'reasons',
      title: 'Reasons to Stay Strong',
      icon: Heart,
      description: 'What are some reasons that make life worth living for you?',
      placeholder: 'My family, my pet, future goals, helping others...',
      field: 'reasonsToLive',
      suggestions: [
        'My family needs me',
        'My pets depend on me',
        'I want to see what the future holds',
        'I can help others who are struggling',
        'There are places I want to visit',
        'I have goals I want to achieve',
        'Someone cares about me',
        'I want to experience more good moments'
      ]
    },
    {
      id: 'coping',
      title: 'Coping Strategies',
      icon: CheckCircle,
      description: 'What helps you feel better when you\'re struggling?',
      placeholder: 'Deep breathing, music, calling a friend...',
      field: 'copingStrategies',
      suggestions: [
        'Take 10 deep breaths',
        'Listen to calming music',
        'Go for a walk outside',
        'Take a warm shower or bath',
        'Write in a journal',
        'Watch a funny video',
        'Pet or cuddle an animal',
        'Do some gentle stretching'
      ]
    },
    {
      id: 'support',
      title: 'Support Network',
      icon: Users,
      description: 'Who can you reach out to when you need support?',
      placeholder: 'Friend, family member, counselor...',
      field: 'supportContacts',
      suggestions: [
        'Best friend',
        'Family member',
        'Trusted colleague',
        'Neighbor',
        'Support group member',
        'Online community friend',
        'Mentor or teacher',
        'Religious/spiritual leader'
      ]
    },
    {
      id: 'environment',
      title: 'Safe Environment',
      icon: Calendar,
      description: 'What can you do to make your space safer right now?',
      placeholder: 'Remove harmful items, stay with someone...',
      field: 'safeEnvironment',
      suggestions: [
        'Stay with a friend or family member',
        'Remove harmful objects from reach',
        'Go to a public place',
        'Ask someone to check on me regularly',
        'Keep emergency numbers visible',
        'Have a trusted person hold medications',
        'Create a calm, comfortable space',
        'Keep positive reminders nearby'
      ]
    }
  ];

  const currentStepData = planSteps[currentStep];

  useEffect(() => {
    if (isOpen) {
      // Load existing safety plan if available
      const existingPlan = localStorage.getItem(`safety-plan-${userId}`);
      if (existingPlan) {
        try {
          setSafetyPlan(JSON.parse(existingPlan));
        } catch (error) {
          console.error('Failed to load existing safety plan:', error);
        }
      }
    }
  }, [isOpen, userId]);

  const addItem = (field, item) => {
    if (!item.trim()) return;
    
    setSafetyPlan(prev => ({
      ...prev,
      [field]: [...prev[field], { id: Date.now(), text: item.trim(), dateAdded: new Date() }]
    }));
    setCurrentInput('');
  };

  const removeItem = (field, itemId) => {
    setSafetyPlan(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item.id !== itemId)
    }));
  };

  const addSuggestion = (field, suggestion) => {
    setSafetyPlan(prev => ({
      ...prev,
      [field]: [...prev[field], { id: Date.now(), text: suggestion, dateAdded: new Date() }]
    }));
  };

  const savePlan = () => {
    try {
      const planToSave = {
        ...safetyPlan,
        lastUpdated: new Date(),
        userId,
        detectionContext: detectionResult
      };
      
      localStorage.setItem(`safety-plan-${userId}`, JSON.stringify(planToSave));
      
      // Log the safety plan creation
      const logEntry = {
        action: 'safety_plan_created',
        timestamp: new Date().toISOString(),
        userId,
        planSteps: Object.keys(safetyPlan).map(key => ({
          step: key,
          itemCount: safetyPlan[key].length
        })),
        totalItems: Object.values(safetyPlan).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
      };
      
      console.log('Safety plan created:', logEntry);
      localStorage.setItem('safety-plan-log', JSON.stringify([
        ...(JSON.parse(localStorage.getItem('safety-plan-log') || '[]')),
        logEntry
      ]));
      
      setIsComplete(true);
      
    } catch (error) {
      console.error('Failed to save safety plan:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < planSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      savePlan();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle size={40} className="text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Your Safety Plan is Ready! 💚
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            You've created a personalized plan to help you through difficult moments. You can access this anytime in your chat by saying "show my safety plan".
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
            >
              Continue Chatting
            </button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Remember: You're not alone, and help is always available 💙
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Heart className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Safety Plan Builder</h2>
                <p className="text-white/90">Let's create a plan to keep you safe</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Step {currentStep + 1} of {planSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / planSteps.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${((currentStep + 1) / planSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          
          {/* Current Step */}
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                <currentStepData.icon className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{currentStepData.title}</h3>
                <p className="text-gray-600">{currentStepData.description}</p>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="mb-6">
            <div className="flex space-x-3 mb-4">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addItem(currentStepData.field, currentInput);
                  }
                }}
                placeholder={currentStepData.placeholder}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
              <button
                onClick={() => addItem(currentStepData.field, currentInput)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Suggestions */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">💡 Quick suggestions (tap to add):</p>
              <div className="flex flex-wrap gap-2">
                {currentStepData.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => addSuggestion(currentStepData.field, suggestion)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-xl transition-all duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Added Items */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Your {currentStepData.title}:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {safetyPlan[currentStepData.field].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl"
                >
                  <span className="text-gray-800 flex-1">{item.text}</span>
                  <button
                    onClick={() => removeItem(currentStepData.field, item.id)}
                    className="text-red-400 hover:text-red-600 ml-2"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              {safetyPlan[currentStepData.field].length === 0 && (
                <p className="text-gray-400 italic text-center py-8">
                  Add some items above to build your safety plan
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
            >
              Save & Exit
            </button>
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
            >
              {currentStep === planSteps.length - 1 ? 'Complete Plan' : 'Next Step'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyPlanBuilder;
