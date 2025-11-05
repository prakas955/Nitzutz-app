import React, { useState, useEffect } from 'react';

const AchievementToast = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  const celebrationEmojis = ['🎉', '🌟', '🎊', '✨', '🚀', '💫', '🏆', '👏'];
  const randomEmoji = celebrationEmojis[Math.floor(Math.random() * celebrationEmojis.length)];

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white p-4 rounded-2xl shadow-xl max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="text-2xl animate-bounce">
            {randomEmoji}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-lg">Amazing! 🎉</h4>
            <p className="text-sm opacity-90">{achievement}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
