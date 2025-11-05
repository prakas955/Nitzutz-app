# Nitzutz Mental Health App - NSW Edition

A compassionate web-based mobile app providing instant, stigma-free mental health support specifically designed for New South Wales, Australia. Features AI-powered chat, comprehensive NSW mental health resources, and personalized action plans.

## Features

- **🤖 AI Companion**: Contextual AI-powered chat with Gemini API integration and improved conversation handling
- **📱 Anonymous & Secure**: No login required, unique session-based user IDs
- **🆘 NSW Crisis Support**: Immediate access to NSW-specific emergency services and crisis lines
- **📚 NSW Resource Directory**: Comprehensive NSW mental health resources with direct calling and web chat
- **📋 Action Plans**: Personalized "Today's steps" and "This week's steps" with progress tracking
- **🎨 Responsive Design**: Beautiful, mobile-first design optimized for Australian users
- **♿ Accessible**: Designed with accessibility and mental health best practices in mind
- **🇦🇺 NSW-Specific**: All resources, numbers, and services tailored for New South Wales residents

## Tech Stack

- **Frontend**: React 18, Tailwind CSS
- **AI Integration**: Google Gemini API
- **Icons**: Lucide React
- **Styling**: Tailwind CSS with custom mental health color palette
- **State Management**: React Hooks
- **Data Persistence**: Local Storage (anonymous)

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Google Gemini API key (optional but recommended)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd nitzutz-app
   npm install
   ```

2. **Set up Gemini AI (Optional)**:
   
   Create a `.env` file in the project root:
   ```env
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   Get your free API key from: [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** to `http://localhost:3000`

## App Structure

```
src/
├── components/
│   ├── Header.jsx              # Logo and crisis button
│   ├── BottomNavigation.jsx    # Three-tab navigation
│   ├── CrisisModal.jsx         # Emergency support modal
│   ├── ChatTab.jsx             # AI conversation interface
│   ├── ResourcesTab.jsx        # Mental health resources
│   ├── PlanTab.jsx             # Personal action plans
│   └── Logo.jsx                # Nitzutz brand logo
├── services/
│   └── geminiService.js        # AI integration service
├── config/
│   └── environment.js          # Environment configuration
└── App.js                      # Main app component
```

## Key Features Explained

### 🤖 AI Chat Companion

- **Contextual AI**: Improved prompts that respond specifically to user questions
- **Non-Repetitive**: Each response is unique and addresses what the user actually said
- **Quick Start Buttons**: Pre-written conversation starters for common mental health topics
- **Conversation History**: Maintains context throughout the session
- **Rate Limiting**: Smart retry logic with exponential backoff for API reliability
- **Fallback Responses**: Varied, intelligent responses when API is unavailable
- **Crisis Detection**: Recognizes urgent situations and provides immediate NSW resources

### 🆘 NSW Crisis Support

- **Always Accessible**: Persistent red button in header
- **NSW Emergency Services**: Direct access to 000 and NSW-specific crisis lines
- **NSW Mental Health Line**: 1800 011 511 - 24/7 NSW crisis support
- **Comprehensive Resources**: Lifeline, Beyond Blue, Suicide Call Back Service, 13YARN
- **Web Chat Integration**: Direct links to crisis chat services
- **Safety First**: Prioritizes user safety with clear emergency guidance

### 📚 NSW Resource Directory

**Organized by specialized categories:**

**🚨 Crisis & Emergency**
- Lifeline Australia, NSW Mental Health Line, NSW Police Emergency, Suicide Call Back Service

**🧠 Mental Health NSW** 
- Beyond Blue, NSW Health Mental Health, SANE Australia, Headspace NSW

**💙 Specialist Support**
- Kids Helpline, MensLine Australia, QLife LGBTI+, Carers NSW

**🏠 Domestic & Family Violence**
- 1800RESPECT, Domestic Violence Line NSW, NSW Women's Court Advocacy, Men's Referral Service

**⚠️ Addiction & Gambling**
- Gambling Help NSW, Drug & Alcohol NSW, Family Drug Support, Alcoholics Anonymous NSW

**🌿 Aboriginal & Torres Strait Islander**
- 13YARN, NSW Aboriginal Mental Health, Lifeline (Aboriginal counsellors)

**Each resource includes:**
- ✅ **Direct calling functionality** - Opens phone app and dials automatically
- ✅ **Web chat integration** - Opens organization's official chat/support page
- Clear service descriptions and 24/7 availability indicators
- NSW-specific contact information and services

### 📋 Action Plans

**Today's Steps**: Small, manageable daily actions (2-10 minutes each)
- Breathing exercises
- Hydration reminders
- Gratitude practice
- Custom user-added steps

**This Week's Steps**: Medium-term goals and activities
- Social connections
- Physical activities
- Self-care practices
- Skill building

Features:
- Progress tracking with visual indicators
- Completion percentages
- Export functionality (JSON format)
- Motivational messaging

## Recent Updates (Latest Version)

### 🚀 Major Improvements
- **Enhanced AI Chat**: Fixed repetitive responses, now provides contextual, unique answers
- **NSW Resource Integration**: Complete NSW-specific mental health resource database
- **Web Chat Integration**: Direct links to organization chat services and support pages
- **Improved Error Handling**: Better rate limiting, timeout handling, and fallback systems
- **Crisis Support Enhancement**: NSW-specific emergency numbers and crisis lines
- **Input Field Stability**: Fixed UI issues where input disappeared after multiple messages

### 🛠️ Technical Enhancements
- Rate limiting with exponential backoff
- Request timeout handling (15-second limit)
- Improved conversation context management
- Better error logging and debugging
- Enhanced API key management
- Sticky input field with proper layout handling

## Privacy & Security

- **No User Accounts**: Completely anonymous usage
- **Local Storage Only**: Data stays on user's device
- **Session-Based IDs**: Unique anonymous identifiers
- **Privacy-First Design**: No personal information collection
- **Safe AI Interactions**: Content filtering and safety measures
- **NSW Data Compliance**: Follows Australian privacy guidelines

## Customization

### Colors
The app uses a carefully chosen mental health color palette:
- **Yellow Gold** (`#f7be4b`): Hope, warmth, positivity
- **Dark Teal** (`#0f343c`): Calm, trustworthy, stable

### AI Responses
The enhanced Gemini service includes:
- Mental health-specific prompts with NSW context
- Contextual conversation that responds to specific user questions
- Non-repetitive response generation
- Crisis detection with NSW resource integration
- Rate limiting with exponential backoff
- Comprehensive fallback message system
- Safety-first design with timeout handling

## Production Deployment

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting service

3. **Set environment variables** on your hosting platform:
   ```
   REACT_APP_GEMINI_API_KEY=your_production_api_key
   ```

### Recommended Hosting

- **Netlify**: Excellent for React apps with environment variable support
- **Vercel**: Great performance and easy deployment  
- **AWS S3 + CloudFront**: For scalable production deployment

## Troubleshooting

### Chat Issues
- **AI not responding contextually**: Check that Gemini API key is properly set in `.env`
- **Repetitive responses**: Ensure you're using the latest version with improved prompts
- **Input field disappearing**: Fixed in latest version - ensure you have updated components

### API Issues  
- **Rate limiting**: App includes automatic retry with exponential backoff
- **API timeouts**: Requests timeout after 15 seconds and fall back to curated responses
- **No API key**: App works without API key using intelligent fallback responses

### Resource Links
- **Call buttons**: Should automatically open phone app with number dialed
- **Web chat buttons**: Open organization's official support/chat page in new tab
- **Disabled buttons**: Some services may not have web chat - use call option instead

## API Usage & Costs

### Gemini API
- **Free Tier**: 60 requests per minute, 1,500 requests per day
- **Pricing**: Very affordable for mental health organizations
- **Fallback**: App works without API key using curated responses

## Contributing

This is a mental health support tool. When contributing:

1. **Prioritize User Safety**: Mental health considerations first
2. **Follow Accessibility Guidelines**: WCAG 2.1 AA standards
3. **Test Thoroughly**: Especially crisis and emergency features
4. **Maintain Empathy**: All content should be supportive and non-judgmental

## NSW Crisis Resources

**🚨 Emergency Services**
- **NSW Police Emergency**: 000
- **NSW Mental Health Line**: 1800 011 511

**🆘 Crisis Support**
- **Lifeline Australia**: 13 11 14
- **Suicide Call Back Service**: 1300 659 467
- **Beyond Blue**: 1300 22 4636
- **13YARN (Aboriginal & Torres Strait Islander)**: 13 92 76

**💙 Specialist Lines**
- **Kids Helpline**: 1800 55 1800
- **1800RESPECT (Domestic Violence)**: 1800 737 732
- **Domestic Violence Line NSW**: 1800 656 463

All services available 24/7 with both phone and web chat support where available.

## License

MIT License - See LICENSE file for details

## Support

For technical support or questions about the app, please open an issue in the repository.

**Important**: This app is a support tool and not a replacement for professional mental health care. If you're experiencing a mental health crisis, please contact emergency services or a mental health professional immediately.