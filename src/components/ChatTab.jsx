import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import geminiService from '../services/geminiService';
import { detectEmergency, logEmergencyDetection } from '../utils/emergencyDetection';
import EmergencyModal from './EmergencyModal';
import AchievementToast from './AchievementToast';
import DailyMotivation from './DailyMotivation';
import { trackChatMessage } from '../utils/analytics';
import firestoreService from '../services/firestoreService';

// Development mode testing (remove in production)
const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment && typeof window !== 'undefined') {
  // Add emergency testing to window for console access
  import('../utils/emergencyTester').then(({ default: emergencyTester }) => {
    window.testEmergencySystem = () => emergencyTester.runFullTest();
    window.testDetection = () => emergencyTester.testDetection();
    console.log('🧪 Emergency testing available: window.testEmergencySystem() or window.testDetection()');
  });
}

const ChatTab = ({ userId }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there! 👋 I'm so excited to meet you! I'm your AI buddy who's here to chat, laugh, and support you through anything! Think of me as that friend who's always got your back and loves celebrating your wins - big or small! 🎉 How are you feeling today? What's going on in your world? ✨",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [emergencyDetected, setEmergencyDetected] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [achievement, setAchievement] = useState(null);
  const [showDailyMotivation, setShowDailyMotivation] = useState(false);
  const messagesEndRef = useRef(null);

  const quickStartButtons = [
    "I'm feeling overwhelmed 😰",
    "I need help with anxiety 😟", 
    "I'm having trouble sleeping 😴",
    "I need someone to talk to 💭",
    "I'm stressed about work 😓",
    "I'm feeling lonely 😔",
    "Tell me a joke! 😄",
    "Give me a fun challenge 🎯",
    "Share a fun fact 🌟",
    "Let's set a goal together! 🚀"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Show daily motivation on first visit
  useEffect(() => {
    const today = new Date().toDateString();
    const lastMotivationDate = localStorage.getItem('last-motivation-date');
    
    if (lastMotivationDate !== today) {
      // Show motivation after a short delay
      const timer = setTimeout(() => {
        setShowDailyMotivation(true);
        localStorage.setItem('last-motivation-date', today);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Load chat history from Firebase on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const savedMessages = await firestoreService.loadChatMessages();
        if (savedMessages && savedMessages.length > 0) {
          // Convert saved messages to component format
          const formattedMessages = savedMessages.map(msg => ({
            id: msg.id,
            text: msg.text,
            sender: msg.sender,
            timestamp: msg.createdAt ? new Date(msg.createdAt) : new Date()
          }));
          setMessages(formattedMessages);
          console.log(`✅ Loaded ${savedMessages.length} messages from Firebase`);
        }
      } catch (error) {
        console.error('❌ Error loading chat history:', error);
        console.log('ℹ️ Starting with welcome message');
      }
    };

    // Wait a moment for Firebase auth to initialize
    const timer = setTimeout(() => {
      loadChatHistory();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Save new messages to Firebase
  const saveMessageToFirebase = async (message, sender) => {
    try {
      await firestoreService.saveChatMessage(message, sender);
    } catch (error) {
      console.error('❌ Error saving message to Firebase:', error);
      // Don't block the UI if Firebase fails
    }
  };

  // Achievement detection
  const detectAchievement = (message) => {
    const lowerMessage = message.toLowerCase();
    const achievementKeywords = [
      'did it', 'completed', 'finished', 'accomplished', 'succeeded', 
      'made it', 'got it done', 'achieved', 'reached my goal', 'won',
      'passed', 'graduated', 'got the job', 'feeling better', 'improved'
    ];
    
    const foundKeyword = achievementKeywords.find(keyword => lowerMessage.includes(keyword));
    if (foundKeyword) {
      const celebrations = [
        "You absolutely crushed it! 🎉",
        "That's incredible progress! 🌟", 
        "You should be so proud! 🚀",
        "Amazing work! You're unstoppable! ⭐",
        "Look at you achieving greatness! 🏆"
      ];
      
      const randomCelebration = celebrations[Math.floor(Math.random() * celebrations.length)];
      setAchievement(randomCelebration);
    }
  };

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim() || isTyping) return;

    const messageText = text.trim();
    
    // 🎉 ACHIEVEMENT DETECTION - Check for celebrations
    detectAchievement(messageText);
    
    // 🛡️ SAFETY PLAN REFERENCE - Check if user wants to see their plan
    if (messageText.toLowerCase().includes('safety plan') || 
        messageText.toLowerCase().includes('show my plan') ||
        messageText.toLowerCase().includes('my plan')) {
      const existingPlan = localStorage.getItem(`safety-plan-${userId}`);
      if (existingPlan) {
        try {
          const plan = JSON.parse(existingPlan);
          const planSummary = `Here's your safety plan! 🛡️💙\n\n` +
            `📝 Reasons to stay strong: ${plan.reasonsToLive?.length || 0} items\n` +
            `💪 Coping strategies: ${plan.copingStrategies?.length || 0} items\n` +
            `👥 Support contacts: ${plan.supportContacts?.length || 0} items\n` +
            `🏠 Safe environment steps: ${plan.safeEnvironment?.length || 0} items\n\n` +
            `Remember: You created this plan to help yourself through difficult moments. You're stronger than you know! ✨`;
          
          const planMessageId = `plan-${Date.now()}`;
          const planMessage = {
            id: planMessageId,
            text: planSummary,
            sender: 'ai',
            timestamp: new Date(),
            isPlan: true
          };
          
          setMessages(prev => [...prev, {
            id: `user-${Date.now()}`,
            text: messageText,
            sender: 'user',
            timestamp: new Date(),
          }, planMessage]);
          
          setInputText('');
          return;
        } catch (error) {
          console.error('Failed to load safety plan:', error);
        }
      } else {
        const noPlanMessage = {
          id: `no-plan-${Date.now()}`,
          text: "I don't see a safety plan for you yet, but we can create one together anytime! 🛡️ A safety plan can be really helpful during difficult moments. Would you like to create one now? Just let me know and I'll guide you through it! 💙",
          sender: 'ai',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, {
          id: `user-${Date.now()}`,
          text: messageText,
          sender: 'user',
          timestamp: new Date(),
        }, noPlanMessage]);
        
        setInputText('');
        
        // Track chat message for analytics
        trackChatMessage();
        return;
      }
    }
    
    // 🚨 EMERGENCY DETECTION - Check before processing message
    const emergencyResult = detectEmergency(messageText);
    
    if (emergencyResult.isEmergency) {
      // Log emergency detection immediately
      logEmergencyDetection(emergencyResult, userId);
      
      // Set emergency state and show modal
      setEmergencyDetected(emergencyResult);
      setShowEmergencyModal(true);
      
      // Clear input
      setInputText('');
      
      // Add user message but don't process AI response
      const userMessageId = `user-${Date.now()}`;
      const userMessage = {
        id: userMessageId,
        text: messageText,
        sender: 'user',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Track chat message for analytics
      trackChatMessage();
      
      // Add emergency system message
      const emergencyMessageId = `emergency-${Date.now()}`;
      const emergencyMessage = {
        id: emergencyMessageId,
        text: "🚨 CRISIS DETECTED: I've detected that you may be in crisis. Emergency support is being activated. Please reach out to emergency services immediately if you're in immediate danger.",
        sender: 'ai',
        timestamp: new Date(),
        isEmergency: true
      };
      setMessages(prev => [...prev, emergencyMessage]);
      
      // Stop here - don't continue with normal chat flow
      return;
    }

    const userMessageId = `user-${Date.now()}`;
    const userMessage = {
      id: userMessageId,
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message and clear input immediately
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Save user message to Firebase
    saveMessageToFirebase(messageText, 'user');

    try {
      // Build conversation history from current messages + new user message
      const fullMessages = [...messages, userMessage];
      const conversationHistory = fullMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      const aiResponseText = await geminiService.generateResponse(messageText, conversationHistory);
      
      // Check if the response indicates rate limiting
      if (aiResponseText && aiResponseText.includes("experiencing high demand")) {
        setIsRateLimited(true);
        // Clear rate limit status after 30 seconds
        setTimeout(() => setIsRateLimited(false), 30000);
      } else {
        setIsRateLimited(false);
      }
      
      const aiMessageId = `ai-${Date.now()}`;
      const aiResponseTextFinal = aiResponseText || "I apologize, but I didn't receive a proper response. Please try again.";
      const aiResponse = {
        id: aiMessageId,
        text: aiResponseTextFinal,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Save AI response to Firebase
      saveMessageToFirebase(aiResponseTextFinal, 'ai');
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      
      // Fallback response on error
      const aiMessageId = `ai-error-${Date.now()}`;
      const fallbackText = "I'm having trouble connecting right now, but I want you to know that I'm here for you. Sometimes technical issues happen, but your feelings and experiences are always valid. Is there anything specific you'd like to talk about?";
      const aiResponse = {
        id: aiMessageId,
        text: fallbackText,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
      // Save fallback response to Firebase
      saveMessageToFirebase(fallbackText, 'ai');
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickStart = (text) => {
    handleSendMessage(text);
  };

  return (
    <div className="flex flex-col h-full min-h-0 relative overflow-hidden bg-gradient-to-b from-white/80 to-indigo-50/80 backdrop-blur-sm">
      {/* Rate Limit Warning */}
      {isRateLimited && (
        <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 rounded-2xl flex-shrink-0 shadow-lg slide-up">
          <p className="text-sm text-orange-800 font-semibold flex items-center space-x-2">
            <span className="text-lg">⚠️</span>
            <span>High demand - Please wait a moment for better responses</span>
          </p>
        </div>
      )}

      {/* Welcome Message - Only show if no messages */}
      {messages.length === 0 && (
        <div className="p-6 flex-shrink-0">
          <div className="text-center mb-6 slide-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-xl animate-bounce">
              <span className="text-3xl">🤗</span>
            </div>
            <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Hey! I'm your AI best friend! ✨
            </h2>
            <p className="text-base text-gray-600 font-medium">
              I'm here to chat, laugh, support you, and celebrate all your wins! Ready to have an awesome conversation? 🎉
            </p>
          </div>
        </div>
      )}

      {/* Quick Start Buttons */}
      <div className="px-4 lg:p-6 pb-4 flex-shrink-0">
        <h3 className="text-lg font-bold mb-6 text-gray-800 flex items-center space-x-2">
          <span className="text-xl">🚀</span>
          <span>Let's Get Started!</span>
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {quickStartButtons.map((button, index) => {
            const icons = ['😰', '😟', '😴', '💭', '😓', '😔', '😄', '🎯', '🌟', '🚀'];
            const gradients = [
              'from-red-400 to-pink-500',
              'from-blue-400 to-indigo-500', 
              'from-purple-400 to-violet-500',
              'from-green-400 to-emerald-500',
              'from-orange-400 to-red-500',
              'from-indigo-400 to-purple-500',
              'from-yellow-400 to-orange-500',
              'from-pink-400 to-rose-500',
              'from-cyan-400 to-blue-500',
              'from-emerald-400 to-teal-500'
            ];
            
            return (
              <button
                key={index}
                onClick={() => handleQuickStart(button)}
                className="group text-left p-5 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 bg-white/90 backdrop-blur-sm border border-white/50 hover:border-white/80 slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${gradients[index]} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <span className="text-xl">{icons[index]}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-800 font-semibold text-base group-hover:text-gray-900 transition-colors">
                      {button}
                    </span>
                    <div className="w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 mt-1"></div>
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 lg:p-6 space-y-4 min-h-0 pb-56">
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex items-end space-x-3 slide-up ${
              message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border-2 border-white/50">
              {message.sender === 'ai' ? (
                <div className="w-full h-full rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
              )}
            </div>
            
            {/* Message Bubble */}
            <div className="max-w-[80%] sm:max-w-[75%] lg:max-w-[60%]">
              <div className={`p-4 rounded-3xl shadow-xl backdrop-blur-sm border transition-all duration-300 hover:shadow-2xl ${
                message.isEmergency
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-300/50 rounded-bl-lg animate-pulse'
                  : message.isPlan
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-300/50 rounded-bl-lg'
                    : message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-300/50 rounded-br-lg' 
                      : 'bg-white/90 text-gray-800 border-white/50 rounded-bl-lg'
              }`}>
                <p className="text-sm leading-relaxed font-medium whitespace-pre-line">{message.text}</p>
                {message.isEmergency && (
                  <button
                    onClick={() => setShowEmergencyModal(true)}
                    className="mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all duration-200 text-xs"
                  >
                    Get Help Now
                  </button>
                )}
                {message.isPlan && (
                  <div className="mt-3 text-xs text-white/80">
                    🛡️ Your personalized safety plan
                  </div>
                )}
              </div>
              
              {/* Timestamp */}
              <p className={`text-xs text-gray-500 mt-2 px-3 font-medium ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-end space-x-3 slide-up">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Bot size={20} className="text-white" />
            </div>
            <div className="max-w-[80%]">
              <div className="p-4 rounded-3xl rounded-bl-lg bg-white/90 backdrop-blur-sm border border-white/50 shadow-xl">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-bounce"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 px-3 font-medium">
                AI is typing...
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom with proper spacing */}
      <div className="fixed bottom-28 left-0 right-0 px-4 py-4 lg:sticky lg:bottom-0 lg:p-6 z-40">
        <div className="max-w-4xl mx-auto">
          {/* Glass morphism container */}
          <div className="glass rounded-3xl p-4 shadow-2xl">
            <div className="flex items-end space-x-4">
              {/* Input Container */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText || ''}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={isTyping ? "AI is thinking..." : "Type your message here..."}
                  className="w-full px-6 py-4 rounded-2xl focus:outline-none disabled:opacity-50 text-base transition-all duration-300 bg-white/90 backdrop-blur-sm border border-white/50 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 shadow-lg"
                  disabled={isTyping}
                />
                
                {/* Floating label effect */}
                {inputText && (
                  <div className="absolute -top-2 left-4 px-2 bg-white/90 rounded-full text-xs text-gray-600 font-medium">
                    Message
                  </div>
                )}
              </div>
              
              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText?.trim() || isTyping}
                className="w-14 h-14 rounded-2xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-xl active:scale-95 transform hover:scale-105 group"
                style={{
                  background: inputText?.trim() && !isTyping 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)',
                  color: inputText?.trim() && !isTyping ? '#ffffff' : '#64748b'
                }}
                title={isTyping ? "AI is responding..." : "Send message"}
              >
                <Send size={20} className="group-hover:rotate-12 transition-transform duration-200" />
                
                {/* Ripple effect */}
                {inputText?.trim() && !isTyping && (
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-active:opacity-100 transition-opacity duration-200"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        detectionResult={emergencyDetected}
        userId={userId}
      />

      {/* Achievement Toast */}
      <AchievementToast
        achievement={achievement}
        onClose={() => setAchievement(null)}
      />

      {/* Daily Motivation Modal */}
      {showDailyMotivation && (
        <DailyMotivation
          onClose={() => setShowDailyMotivation(false)}
        />
      )}
    </div>
  );
};

export default ChatTab;
