import React, { useState, useEffect } from 'react';

const dailyMotivations = [
    {
      emoji: "🌟",
      title: "You're a Star!",
      message: "Today is your day to shine! Every small step you take is moving you forward. You've got this! ✨"
    },
    {
      emoji: "🚀",
      title: "Ready for Takeoff!",
      message: "Your potential is limitless! Today's challenges are just launching pads for your amazing growth! 🌙"
    },
    {
      emoji: "🌈",
      title: "After Every Storm...",
      message: "Comes a beautiful rainbow! You're stronger than you know, and brighter days are ahead! 🦋"
    },
    {
      emoji: "💪",
      title: "You're Stronger Than You Think!",
      message: "Look how far you've come! Every challenge you've faced has made you more resilient. Keep going! 🏔️"
    },
    {
      emoji: "🎯",
      title: "Aim High!",
      message: "Your dreams are valid and achievable! Take one small step today toward what makes your heart happy! 💖"
    },
    {
      emoji: "🌱",
      title: "Growing Every Day!",
      message: "Like a plant reaching for sunlight, you're constantly growing and becoming the best version of yourself! 🌻"
    },
    {
      emoji: "🎨",
      title: "You're a Masterpiece!",
      message: "Your unique story, experiences, and perspective make you absolutely incredible! Own your awesomeness! 👑"
    }
  ];

const DailyMotivation = ({ onClose }) => {
  const [currentMotivation, setCurrentMotivation] = useState(null);

  useEffect(() => {
    // Get a different motivation based on the day
    const today = new Date().getDate();
    const motivationIndex = today % dailyMotivations.length;
    setCurrentMotivation(dailyMotivations[motivationIndex]);
  }, []);

  if (!currentMotivation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
      <div className="bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 p-1 rounded-3xl shadow-2xl max-w-md w-full">
        <div className="bg-white rounded-3xl p-6 text-center">
          <div className="text-6xl mb-4 animate-bounce">
            {currentMotivation.emoji}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            {currentMotivation.title}
          </h2>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            {currentMotivation.message}
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
            >
              Thanks! Let's Chat! 💬
            </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-4">
            ✨ Your daily dose of positivity ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default DailyMotivation;
