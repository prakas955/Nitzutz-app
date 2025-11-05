import React from 'react';
import { Phone, MessageSquare, Heart, Brain, Users, Home } from 'lucide-react';
import { trackResourceCall } from '../utils/analytics';

const ResourcesTab = () => {
  const resourceCategories = [
    {
      id: 'crisis-emergency',
      title: 'Crisis & Emergency',
      icon: Phone,
      color: 'bg-red-100 text-red-600',
      resources: [
        { name: 'Lifeline Australia', phone: '13 11 14', description: '24/7 crisis support & suicide prevention', webChat: 'https://www.lifeline.org.au/crisis-chat/' },
        { name: 'Mental Health Line NSW', phone: '1800 011 511', description: '24/7 NSW mental health crisis line', webChat: 'https://www.health.nsw.gov.au/mentalhealth/Pages/mental-health-line.aspx' },
        { name: 'NSW Police Emergency', phone: '000', description: 'Life-threatening emergencies', webChat: null },
        { name: 'Suicide Call Back Service', phone: '1300 659 467', description: '24/7 suicide prevention counselling', webChat: 'https://www.suicidecallbackservice.org.au/resource/webchat/' },
      ],
    },
    {
      id: 'mental-health',
      title: 'Mental Health NSW',
      icon: Brain,
      color: 'bg-purple-100 text-purple-600',
      resources: [
        { name: 'Beyond Blue', phone: '1300 22 4636', description: 'Depression, anxiety & suicide prevention', webChat: 'https://www.beyondblue.org.au/get-support/chat-to-a-counsellor' },
        { name: 'NSW Health Mental Health', phone: '1800 011 511', description: 'NSW government mental health services', webChat: 'https://www.health.nsw.gov.au/mentalhealth/Pages/default.aspx' },
        { name: 'SANE Australia', phone: '1800 18 7263', description: 'Mental illness support & information', webChat: 'https://www.sane.org/support/find-help' },
        { name: 'Headspace NSW', phone: '1800 650 890', description: 'Youth mental health (12-25 years)', webChat: 'https://headspace.org.au/eheadspace/' },
      ],
    },
    {
      id: 'specific-support',
      title: 'Specialist Support',
      icon: Heart,
      color: 'bg-blue-100 text-blue-600',
      resources: [
        { name: 'Kids Helpline', phone: '1800 55 1800', description: 'Children & young people (5-25 years)', webChat: 'https://kidshelpline.com.au/get-help/webchat-counselling' },
        { name: 'MensLine Australia', phone: '1300 78 99 78', description: 'Men\'s telephone & online support', webChat: 'https://mensline.org.au/mens-online-counselling/' },
        { name: 'QLife LGBTI+', phone: '1800 184 527', description: 'LGBTI+ peer support & information', webChat: 'https://qlife.org.au/contact' },
        { name: 'Carers NSW', phone: '1800 242 636', description: 'Support for carers in NSW', webChat: 'https://www.carersnsw.org.au/get-support' },
      ],
    },
    {
      id: 'domestic-violence',
      title: 'Domestic & Family Violence',
      icon: Home,
      color: 'bg-pink-100 text-pink-600',
      resources: [
        { name: '1800RESPECT', phone: '1800 737 732', description: 'National domestic violence helpline', webChat: 'https://www.1800respect.org.au/chat' },
        { name: 'Domestic Violence Line NSW', phone: '1800 656 463', description: 'NSW domestic violence support', webChat: 'https://www.dvnsw.org.au/about-us/domestic-violence-nsw' },
        { name: 'NSW Women\'s Domestic Violence Court Advocacy Service', phone: '1800 810 784', description: 'Legal support for women', webChat: 'https://www.wdvcas.org.au/contact-us/' },
        { name: 'Men\'s Referral Service', phone: '1300 766 491', description: 'Help for men using violence', webChat: 'https://mensreferralservice.org.au/contact/' },
      ],
    },
    {
      id: 'gambling',
      title: 'Gambling Support',
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      resources: [
        { name: 'Gambling Help NSW', phone: '1800 858 858', description: 'NSW gambling counselling services', webChat: 'https://www.gamblinghelponline.org.au/connect-with-someone' },
        { name: 'Gambler\'s Help', phone: '1800 156 789', description: 'Free gambling counselling & support', webChat: 'https://www.gamblinghelponline.org.au/' },
        { name: 'Gamblers Anonymous NSW', phone: '1300 792 922', description: 'GA meetings and peer support', webChat: 'https://www.gamblersanonymous.org.au/' },
      ],
    },
    {
      id: 'smoking-quit',
      title: 'Smoking & Quit Support',
      icon: Heart,
      color: 'bg-teal-100 text-teal-600',
      resources: [
        { name: 'Quitline NSW', phone: '13 78 48', description: '13 QUIT - Free NSW smoking cessation support', webChat: 'https://www.icanquit.com.au/' },
        { name: 'NSW Health Quit Support', phone: '1800 11 QUIT', description: 'Quit smoking resources & counselling', webChat: 'https://www.health.nsw.gov.au/tobacco/Pages/default.aspx' },
        { name: 'My QuitBuddy App', phone: null, description: 'Free Australian Government quit smoking app', webChat: 'https://www.quitnow.gov.au/tools-and-tips/apps/my-quitbuddy' },
        { name: 'Quit For You - Quit For Two', phone: '13 78 48', description: 'Support for pregnant women & families', webChat: 'https://www.quit.org.au/' },
      ],
    },
    {
      id: 'substance-use',
      title: 'Drug & Alcohol Support',
      icon: Users,
      color: 'bg-indigo-100 text-indigo-600',
      resources: [
        { name: 'Drug & Alcohol NSW', phone: '1800 023 687', description: 'NSW drug & alcohol support', webChat: 'https://yourroom.health.nsw.gov.au/' },
        { name: 'Family Drug Support', phone: '1300 368 186', description: 'Support for families affected by drugs', webChat: 'https://www.fds.org.au/get-help/chat' },
        { name: 'Alcoholics Anonymous NSW', phone: '1300 222 222', description: 'AA meetings and support in NSW', webChat: 'https://www.aa.org.au/' },
        { name: 'Narcotics Anonymous NSW', phone: '1300 652 820', description: 'NA meetings and peer support', webChat: 'https://www.na.org.au/' },
      ],
    },
    {
      id: 'aboriginal-torres-strait',
      title: 'Aboriginal & Torres Strait Islander',
      icon: Heart,
      color: 'bg-green-100 text-green-600',
      resources: [
        { name: '13YARN', phone: '13 92 76', description: 'Aboriginal & Torres Strait Islander crisis support', webChat: 'https://www.13yarn.org.au/contact-us/' },
        { name: 'NSW Aboriginal Mental Health', phone: '1800 023 687', description: 'Culturally appropriate mental health support', webChat: 'https://www.health.nsw.gov.au/mentalhealth/aboriginal/Pages/default.aspx' },
        { name: 'Lifeline 13 11 14', phone: '13 11 14', description: 'Crisis support (Aboriginal counsellors available)', webChat: 'https://www.lifeline.org.au/crisis-chat/' },
      ],
    },
  ];

  const handleCall = (phone) => {
    trackResourceCall();
    window.location.href = `tel:${phone}`;
  };

  const handleChat = (webChatUrl, name) => {
    if (webChatUrl) {
      // Open the organization's web chat/support page in a new tab
      window.open(webChatUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(`Web chat not available for ${name}. Please call instead.`);
    }
  };

  return (
    <div className="pb-24 lg:pb-6" style={{ backgroundColor: '#f7be4b', minHeight: '100vh' }}>
      <div className="p-6 lg:mb-8 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0f343c' }}>
            <span className="text-2xl">📚</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: '#0f343c' }}>NSW Support Resources</h2>
          <p className="text-sm lg:text-base" style={{ color: '#0f343c', opacity: 0.8 }}>
            Professional mental health services across NSW. All free & confidential.
          </p>
        </div>
      </div>

      <div className="px-4 space-y-4 lg:space-y-6 max-w-4xl mx-auto">
        {resourceCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.id} className="rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
              {/* Category Header */}
              <div className="p-5 bg-gradient-to-r" style={{ background: 'linear-gradient(135deg, #0f343c 0%, #1a4851 100%)' }}>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f7be4b' }}>
                    <Icon size={24} style={{ color: '#0f343c' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#f7be4b' }}>{category.title}</h3>
                    <p className="text-xs opacity-80" style={{ color: '#f7be4b' }}>
                      {category.resources.length} services available
                    </p>
                  </div>
                </div>
              </div>

              {/* Resources List */}
              <div className="p-2 space-y-3">
                {category.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="rounded-xl p-4 mx-2 shadow-lg"
                    style={{ backgroundColor: '#f7be4b' }}
                  >
                    <div className="mb-4">
                      <h4 className="font-bold text-base mb-2" style={{ color: '#0f343c' }}>{resource.name}</h4>
                      <p className="text-sm mb-3 leading-relaxed" style={{ color: '#0f343c', opacity: 0.8 }}>{resource.description}</p>
                      <div className="flex items-center space-x-2 text-lg font-bold mb-4" style={{ color: '#0f343c' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0f343c' }}>
                          <Phone size={16} style={{ color: '#f7be4b' }} />
                        </div>
                        <span className="text-base">{resource.phone}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => handleCall(resource.phone)}
                        className="w-full py-4 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 active:scale-95 shadow-lg"
                        style={{ backgroundColor: '#0f343c', color: '#f7be4b' }}
                      >
                        <Phone size={20} />
                        <span className="font-bold text-base">Call Now</span>
                      </button>
                      {resource.webChat && (
                        <button
                          onClick={() => handleChat(resource.webChat, resource.name)}
                          className="w-full py-4 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 active:scale-95 shadow-lg"
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#0f343c',
                            border: '2px solid #0f343c'
                          }}
                        >
                          <MessageSquare size={20} />
                          <span className="font-bold text-base">Web Chat</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Notice */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-red-800">Emergency</h3>
        </div>
        <p className="text-red-700 text-sm mb-3">
          If you or someone else is in immediate danger, call emergency services immediately.
        </p>
        <button
          onClick={() => handleCall('000')}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors font-semibold"
        >
          <Phone size={20} />
          <span>Call 000 - Emergency</span>
        </button>
      </div>

      {/* Additional NSW Resources */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">NSW Online Resources</h3>
        <div className="space-y-2 text-sm">
          <a href="https://www.health.nsw.gov.au/mentalhealth" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 transition-colors">
            • NSW Health Mental Health - Government services & info
          </a>
          <a href="https://www.beyondblue.org.au" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 transition-colors">
            • Beyond Blue - Mental health support & info
          </a>
          <a href="https://headspace.org.au/headspace-centres/nsw/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 transition-colors">
            • Headspace NSW - Youth mental health centres
          </a>
          <a href="https://www.blackdoginstitute.org.au" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 transition-colors">
            • Black Dog Institute - Research & resources
          </a>
          <a href="https://www.lifeline.org.au" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 transition-colors">
            • Lifeline Australia - Crisis support
          </a>
          <a href="https://www.carersnsw.org.au" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-800 transition-colors">
            • Carers NSW - Support for carers
          </a>
        </div>
      </div>

      {/* Regional NSW Services */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">Find Local NSW Services</h3>
        <div className="space-y-2 text-sm">
          <a href="https://www.health.nsw.gov.au/pages/service-finder.aspx" target="_blank" rel="noopener noreferrer" className="block text-green-600 hover:text-green-800 transition-colors">
            • NSW Health Service Finder - Find services near you
          </a>
          <a href="https://www.healthdirect.gov.au/australian-health-services" target="_blank" rel="noopener noreferrer" className="block text-green-600 hover:text-green-800 transition-colors">
            • Health Direct - Local health services
          </a>
          <p className="text-green-700 mt-2">
            💡 Use your postcode to find mental health services in your local area across NSW
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResourcesTab;
