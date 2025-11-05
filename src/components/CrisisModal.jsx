import React from 'react';
import { X, Phone, MessageSquare } from 'lucide-react';

const CrisisModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const emergencyContacts = [
    { name: 'NSW Police Emergency', number: '000', description: 'Life-threatening emergencies in NSW', webChat: null },
    { name: 'Lifeline Australia', number: '13 11 14', description: '24/7 crisis support & suicide prevention', webChat: 'https://www.lifeline.org.au/crisis-chat/' },
    { name: 'NSW Mental Health Line', number: '1800 011 511', description: '24/7 NSW mental health crisis support', webChat: 'https://www.health.nsw.gov.au/mentalhealth/Pages/mental-health-line.aspx' },
    { name: 'Suicide Call Back Service', number: '1300 659 467', description: '24/7 suicide prevention counselling', webChat: 'https://www.suicidecallbackservice.org.au/resource/webchat/' },
    { name: '13YARN', number: '13 92 76', description: 'Aboriginal & Torres Strait Islander crisis support', webChat: 'https://www.13yarn.org.au/contact-us/' },
  ];

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  const handleChat = (webChatUrl, name) => {
    if (webChatUrl) {
      window.open(webChatUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Web chat not available for ${name}. Please call instead.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 fade-in">
      <div className="glass rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-white/30">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-red-500 to-pink-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🚨</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Crisis Support</h2>
                <p className="text-white/80 text-sm font-medium">Immediate help available</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl slide-up">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <p className="text-red-800 font-semibold mb-2">
                  If you're in immediate danger, call emergency services now.
                </p>
                <p className="text-red-700 text-sm">
                  You're not alone. NSW crisis support is available 24/7.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {emergencyContacts.map((contact, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{contact.name}</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{contact.number}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{contact.description}</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleCall(contact.number)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Phone size={18} />
                    <span>Call Now</span>
                  </button>
                  <button 
                    onClick={() => handleChat(contact.webChat, contact.name)}
                    className={`flex-1 px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105 ${
                      contact.webChat 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white hover:shadow-xl' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                    disabled={!contact.webChat}
                  >
                    <MessageSquare size={18} />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl slide-up">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">💙</span>
              </div>
              <h3 className="font-bold text-blue-800 text-lg">Remember:</h3>
            </div>
            <ul className="text-sm text-blue-700 space-y-2 ml-11">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Your feelings are valid</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>This difficult time will pass</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>Seeking help is a sign of strength</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>You deserve support and care</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrisisModal;
