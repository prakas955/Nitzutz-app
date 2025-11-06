import React, { useState } from 'react';
import { MessageSquare, Shield, Phone, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

const OnboardingFlow = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'welcome',
      icon: Sparkles,
      gradient: 'from-blue-500 to-purple-600',
      title: "Welcome to Nitzutz",
      subtitle: "Your safe space for mental health support",
      description: "We're here to support you through anything. Think of us as your pocket companion for mental wellness.",
      emoji: "🌟",
      action: "Get Started"
    },
    {
      id: 'privacy',
      icon: Shield,
      gradient: 'from-green-500 to-emerald-600',
      title: "100% Anonymous & Private",
      subtitle: "No login, no personal info, ever",
      description: "Everything stays on your device. No accounts, no tracking, no data collection. Your privacy is our priority.",
      emoji: "🔒",
      bullets: [
        "No login required",
        "Data stays on your device",
        "Completely anonymous",
        "Delete anytime"
      ],
      action: "Sounds Good"
    },
    {
      id: 'features',
      icon: MessageSquare,
      gradient: 'from-purple-500 to-pink-600',
      title: "Here's What We Offer",
      subtitle: "Four simple tools to support you",
      features: [
        { icon: "💬", title: "AI Companion", desc: "Chat anytime for support" },
        { icon: "📚", title: "NSW Resources", desc: "Crisis lines & support" },
        { icon: "🎯", title: "Goal Tracker", desc: "Build healthy habits" },
        { icon: "📋", title: "Action Plans", desc: "Daily steps for wellness" }
      ],
      action: "Got It"
    },
    {
      id: 'crisis',
      icon: Phone,
      gradient: 'from-red-500 to-rose-600',
      title: "In a Crisis?",
      subtitle: "We've got your back 24/7",
      description: "Tap the red SOS button anytime for immediate access to crisis support lines and emergency contacts.",
      emoji: "🚨",
      highlight: {
        title: "Emergency Button",
        desc: "Always visible at the top of every screen",
        action: "I understand"
      },
      action: "I Understand"
    },
    {
      id: 'ready',
      icon: CheckCircle,
      gradient: 'from-indigo-500 to-blue-600',
      title: "You're All Set!",
      subtitle: "Let's start your wellness journey",
      description: "Remember: Small steps lead to big changes. We're here whenever you need us.",
      emoji: "✨",
      finalMessage: "Take it one day at a time. You've got this! 💪",
      action: "Start Using Nitzutz"
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      // Mark onboarding as complete
      localStorage.setItem('nitzutz-onboarding-complete', 'true');
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('nitzutz-onboarding-complete', 'true');
    onComplete();
  };

  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 z-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <div className="relative h-full flex flex-col">
        {/* Progress bar */}
        <div className="w-full bg-white/50 backdrop-blur-sm px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip
              </button>
            )}
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${currentStepData.gradient} transition-all duration-500 ease-out`}
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-lg mx-auto">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-r ${currentStepData.gradient} flex items-center justify-center shadow-2xl animate-float`}>
                <span className="text-5xl">{currentStepData.emoji}</span>
                <div className="absolute inset-0 rounded-3xl bg-white opacity-20 animate-pulse"></div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 slide-up">
                {currentStepData.title}
              </h2>
              <p className="text-lg text-gray-600 font-medium slide-up" style={{ animationDelay: '0.1s' }}>
                {currentStepData.subtitle}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-6 slide-up" style={{ animationDelay: '0.2s' }}>
              {currentStepData.description && (
                <p className="text-center text-gray-700 text-lg leading-relaxed">
                  {currentStepData.description}
                </p>
              )}

              {/* Bullets */}
              {currentStepData.bullets && (
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <ul className="space-y-3">
                    {currentStepData.bullets.map((bullet, index) => (
                      <li
                        key={index}
                        className="flex items-center space-x-3 text-gray-700 slide-up"
                        style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                      >
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${currentStepData.gradient} flex items-center justify-center flex-shrink-0`}>
                          <CheckCircle size={18} className="text-white" />
                        </div>
                        <span className="font-medium">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Features grid */}
              {currentStepData.features && (
                <div className="grid grid-cols-2 gap-4">
                  {currentStepData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center slide-up hover:scale-105 transition-transform duration-300"
                      style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    >
                      <div className="text-4xl mb-2">{feature.icon}</div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-gray-600">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Highlight box (for crisis step) */}
              {currentStepData.highlight && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <Phone size={20} className="text-white" />
                    </div>
                    <h3 className="font-bold text-red-900 text-lg">{currentStepData.highlight.title}</h3>
                  </div>
                  <p className="text-red-800 font-medium">{currentStepData.highlight.desc}</p>
                </div>
              )}

              {/* Final message */}
              {currentStepData.finalMessage && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg text-center">
                  <p className="text-lg font-semibold text-gray-900">{currentStepData.finalMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="px-6 py-6 bg-white/50 backdrop-blur-sm">
          <button
            onClick={handleNext}
            className={`w-full py-5 rounded-2xl font-bold text-lg text-white shadow-2xl transform transition-all duration-300 active:scale-95 hover:shadow-3xl flex items-center justify-center space-x-3 bg-gradient-to-r ${currentStepData.gradient}`}
          >
            <span>{currentStepData.action}</span>
            {!isLastStep ? (
              <ArrowRight size={24} className="animate-bounce-horizontal" />
            ) : (
              <CheckCircle size={24} />
            )}
          </button>
          
          {/* Bottom dots indicator */}
          <div className="flex justify-center space-x-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? `w-8 bg-gradient-to-r ${currentStepData.gradient}`
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes bounce-horizontal {
          0%, 100% {
            transform: translateX(0px);
          }
          50% {
            transform: translateX(5px);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-bounce-horizontal {
          animation: bounce-horizontal 1s ease-in-out infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .slide-up {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default OnboardingFlow;

