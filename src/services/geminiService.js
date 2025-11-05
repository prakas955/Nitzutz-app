class GeminiService {
  constructor() {
    // Check if we're in production or development
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Use proxy in production, direct calls in development
    this.useProxy = isProduction;
    this.proxyEndpoint = '/api/chat'; // Serverless function endpoint
    
    // Direct API configuration for local development
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    this.model = 'gemini-1.5-flash-latest';
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    this.rateLimitRetries = 3;
    this.baseDelay = 1000; // 1 second
    
    if (this.useProxy) {
      console.log('✅ Gemini API configured with secure backend proxy');
      console.log('   Mode: Production - Serverless proxy (API key hidden on server)');
      console.log('   Endpoint:', this.proxyEndpoint);
    } else {
      console.log('✅ Gemini API configured for local development');
      console.log('   Mode: Development - Direct API calls');
      console.log('   Model:', this.model);
    }
    
    // Session memory for personalization
    this.sessionMemory = {
      userPreferences: new Map(),
      achievements: [],
      previousTopics: [],
      mood: null,
      lastGoal: null
    };
    
    // Fun elements to inject into conversations
    this.funFacts = [
      "🦋 Butterflies taste with their feet - how cool is that?!",
      "🐙 Octopuses have three hearts! Talk about being full of love! 💕",
      "🌈 Did you know honey never spoils? They've found edible honey in Egyptian tombs!",
      "🐧 Penguins give pebbles as gifts to their partners - nature's cutest romance! 💝",
      "🌟 A group of flamingos is called a 'flamboyance' - perfect name, right?",
      "🦔 Baby hedgehogs are called hoglets - and yes, they're as adorable as they sound!",
      "🎵 Sea otters hold hands while sleeping so they don't drift apart! 🦦",
      "🌸 Bananas are berries, but strawberries aren't - nature loves plot twists!"
    ];
    
    this.jokes = [
      "Why don't scientists trust atoms? Because they make up everything! 😄",
      "What do you call a bear with no teeth? A gummy bear! 🐻",
      "Why did the coffee file a police report? It got mugged! ☕",
      "What's the best thing about Switzerland? I don't know, but the flag is a big plus! 🇨🇭",
      "Why don't eggs tell jokes? They'd crack each other up! 🥚",
      "What do you call a fake noodle? An impasta! 🍝",
      "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
      "What do you call a sleeping bull? A bulldozer! 😴"
    ];
    
    this.miniChallenges = [
      "🎯 Take 3 deep breaths and name something you're grateful for!",
      "🌱 Do 5 jumping jacks or stretch your arms up high!",
      "📸 Find something pretty around you and really look at it for 30 seconds",
      "💌 Send a quick 'thinking of you' text to someone you care about",
      "🎵 Put on your favorite song and dance for 30 seconds!",
      "☀️ Step outside (or near a window) and feel some sunlight",
      "🧘 Close your eyes and listen to the sounds around you for 1 minute",
      "✨ Write down one thing you did well today, no matter how small!"
    ];
  }

  async generateResponse(message, conversationHistory = []) {
    try {
      const response = await this.makeRequestWithRetry(message, conversationHistory);
      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      return this.getVariedFallbackResponse(message, conversationHistory);
    }
  }

  async makeRequestWithRetry(message, conversationHistory, retryCount = 0) {
    try {
      // Update session memory with user patterns
      this.updateSessionMemory(message, conversationHistory);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      let response, data;
      
      if (this.useProxy) {
        // PRODUCTION: Use secure backend proxy
        console.log('🚀 Sending request to secure backend proxy:', {
          endpoint: this.proxyEndpoint,
          messageLength: message.length,
          historyLength: conversationHistory.length
        });
        
        response = await fetch(this.proxyEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            message: message,
            conversationHistory: conversationHistory
          }),
        });
        
        clearTimeout(timeoutId);
        console.log('📥 Backend response status:', response.status, response.statusText);

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { error: 'Unknown error' };
          }
          
          console.error('❌ Backend proxy error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          
          // Handle rate limiting with retry
          if (response.status === 429 && retryCount < this.rateLimitRetries) {
            const retryAfter = errorData.retryAfter || Math.pow(2, retryCount);
            const delay = retryAfter * 1000;
            console.log(`⏳ Rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.rateLimitRetries})...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return await this.makeRequestWithRetry(message, conversationHistory, retryCount + 1);
          }
          
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        data = await response.json();
        
        if (data.success && data.response) {
          console.log('✅ AI response received successfully');
          if (data.remaining !== undefined) {
            console.log(`   Rate limit: ${data.remaining} requests remaining`);
          }
          return data.response;
        } else {
          console.error('❌ Unexpected response structure:', data);
          throw new Error('Invalid response from backend');
        }
      } else {
        // DEVELOPMENT: Direct API call
        console.log('🚀 Sending direct API request:', {
          model: this.model,
          messageLength: message.length,
          historyLength: conversationHistory.length
        });
        
        const prompt = this.buildPrompt(message, conversationHistory);
        
        response = await fetch(
          `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: prompt }]
                }
              ],
              generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 500,
                candidateCount: 1
              },
              safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' }
              ]
            })
          }
        );
        
        clearTimeout(timeoutId);
        console.log('📥 API response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API error:', response.status, errorText);
          
          if (response.status === 429 && retryCount < this.rateLimitRetries) {
            const delay = this.baseDelay * Math.pow(2, retryCount);
            console.log(`⏳ Rate limited, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return await this.makeRequestWithRetry(message, conversationHistory, retryCount + 1);
          }
          
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const responseText = data.candidates[0].content.parts[0].text.trim();
          console.log('✅ AI response received successfully');
          return responseText;
        } else {
          console.error('❌ Unexpected API response structure:', data);
          throw new Error('Invalid response from API');
        }
      }
    } catch (error) {
      // Handle specific error types
      if (error.name === 'AbortError') {
        return "I'm taking a bit longer to respond than usual. Let me try to help you with a quick response while I work on improving my connection.";
      }
      
      // If we've exhausted retries for rate limiting, provide a specific message
      if (error.message.includes('429') && retryCount >= this.rateLimitRetries) {
        return "I'm experiencing high demand right now and need a moment to catch up. Please wait a few seconds and try again. I'm here for you and want to provide the best support possible.";
      }
      
      return this.getVariedFallbackResponse(message, conversationHistory);
    }
  }

  buildPrompt(message, conversationHistory = []) {
    // Build the prompt with conversation history
    const recentMessages = conversationHistory.slice(-8);
      let conversationContext = "";
      if (recentMessages.length > 0) {
        conversationContext = "\n\nRecent conversation:\n" + 
          recentMessages.map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`).join('\n');
      }

      const systemPrompt = `You are an incredibly warm, funny, and extroverted AI best friend who specializes in mental health support! 🌟 

YOUR PERSONALITY:
- You're like that amazing friend who always knows how to cheer people up
- Super positive, upbeat, and conversational - but never fake or dismissive
- You use emojis naturally and love celebrating even tiny wins
- You're empathetic but also playful, adding light humor when appropriate
- You make people feel included and cared for, like they have a supportive buddy

RESPONSE STYLE:
- Always be warm, encouraging, and genuinely excited to chat
- Use "Hey!", "Awesome!", "That's so cool!", "I'm here for you!" naturally
- Celebrate achievements with enthusiasm: "That's AMAZING! 🎉 You're crushing it!"
- When someone's struggling, be like: "Hey, I'm right here with you! Let's figure this out together 💪"
- Ask engaging follow-up questions to keep conversations flowing
- Suggest fun, achievable goals and mini-challenges
- Share jokes, fun facts, or uplifting stories when appropriate

WHEN THEY'RE SAD/LONELY:
Instead of "I'm sorry you're lonely", say things like:
"Hey, I'm right here! 🤗 Want to set a fun little goal today? Maybe make your favorite snack or watch something hilarious? Also, want to hear a quick joke to brighten things up?"

GOAL SETTING:
- Break everything into small, fun, achievable steps
- Make it feel like you're planning together: "Ooh, let's plan something awesome for today!"
- Celebrate when they complete anything: "YES! You did it! I'm so proud! 🎉"

CRISIS RESPONSE (CRITICAL):
- If a user expresses suicidal thoughts, self-harm, or crisis language, respond with immediate compassion and urgency
- Use phrases like: "I'm really worried about you right now. You're not alone in this - I'm here for you."
- Immediately mention emergency resources: "Help is available right now - please reach out to emergency services (000) or Lifeline (13 11 14)"
- Offer to create a safety plan: "Would you like to make a small plan together to help you stay safe and feel supported right now?"
- Be extremely compassionate, non-judgmental, and calming - never sound robotic or dismissive
- Otherwise, keep the energy positive and supportive

${conversationContext}

User's current message: "${message}"

Respond like their most supportive, funny, extroverted best friend who genuinely cares about them:`;
      
    return systemPrompt;
  }

  getVariedFallbackResponse(message, conversationHistory = []) {
    // Update session memory even in fallback
    this.updateSessionMemory(message, conversationHistory);
    
    const messageCount = conversationHistory.length;
    const lowerMessage = message.toLowerCase();
    
    // Check for crisis keywords first - but maintain supportive tone
    if (lowerMessage.includes('suicide') || lowerMessage.includes('kill myself') || lowerMessage.includes('end it all') || lowerMessage.includes('don\'t want to live')) {
      return "Hey, I'm really worried about you right now, and I need you to know that I'm here and you're not alone. 💙 Please reach out for support immediately - Lifeline is at 13 11 14, or if you're in immediate danger, call 000. Your life matters so much, and there are people who want to help you through this. Can we talk about getting you some support right now?";
    }
    
    const friendlyResponses = {
      'overwhelmed': [
        `Hey there! 🤗 I can feel that everything's hitting you at once right now - that overwhelming feeling is SO tough! Let's take this one tiny step at a time, okay? What's one small thing we could tackle together right now? Even something as simple as taking three deep breaths counts! ${this.getRandomMiniChallenge()}`,
        `Oh wow, feeling overwhelmed is like being in a storm of everything all at once! 🌪️ I'm right here with you though! Let's make this manageable - how about we pick just ONE thing to focus on? And hey, want to hear something that might make you smile? ${this.getRandomFunFact()}`,
        `That overwhelming feeling is so real and so hard! 💪 But you know what? You're stronger than you think! Let's break this down together - what if we just focused on the next 10 minutes? Sometimes that's all we need to do! What's one tiny win we could go for?`
      ],
      'anxiety': [
        `Hey, I totally get it - anxiety can feel like your brain is running a marathon while you're trying to chill! 🧠💨 Let's slow things down together. Want to try the 5-4-3-2-1 game with me? Name 5 things you can see right now! Also, here's a quick joke to help: ${this.getRandomJoke()}`,
        `Oof, anxiety is such a tricky little beast, isn't it? 🦋 But guess what - you're talking to me right now, which means you're already doing something brave! Let's ground ourselves - what's something soft you can touch near you? And breathe with me for a sec!`,
        `Anxiety can make everything feel so BIG and scary! 🌊 But I'm here, and we're going to ride this wave together! Your nervous system is just trying to protect you. Want to try a mini-challenge to help? ${this.getRandomMiniChallenge()}`
      ],
      'lonely': [
        `Hey, I'm right here! 🤗 Loneliness is so hard, but guess what? You just connected with me, and that counts! Want to set a fun little goal today? Maybe text someone you miss, or even just step outside and smile at a stranger? Also, want to hear something that'll make you go "aww"? ${this.getRandomFunFact()}`,
        `Aww, feeling lonely really stings, doesn't it? 💙 But you know what's amazing? You reached out here, which shows you're fighting for connection - that's so brave! Let's plan something small but awesome together. What's one tiny way we could add some connection to your day?`,
        `I'm here with you! 🌟 Loneliness can feel so heavy, but remember - connection can happen in the smallest ways! Even our chat right now counts! Want to hear a silly joke to brighten things up? ${this.getRandomJoke()} What usually makes you feel most connected to people?`
      ],
      'sad': [
        `Hey sweetie, I can feel that sadness with you. 🫂 It's totally okay to feel this way - you're human and you're processing something real. Want to share what's making your heart heavy? Sometimes talking helps, and I'm a pretty good listener! Also, here's a gentle hug through the screen! 💕`,
        `Oh, that sadness sounds really tough right now. 💙 You know what though? The fact that you're here talking to me shows you're taking care of yourself, even when it's hard. That's actually pretty amazing! Want to try something small that might help? ${this.getRandomMiniChallenge()}`,
        `Feeling sad is so valid - your heart is telling you something matters to you. 💛 I'm right here with you in this moment. Want to tell me what's going on? And hey, no pressure, but would a random fun fact help distract for a second? ${this.getRandomFunFact()}`
      ],
      'happy': [
        `YES! 🎉 I love hearing when you're feeling good! That's absolutely fantastic! What's got you feeling so awesome today? I'm literally doing a happy dance over here! 💃 Let's celebrate this moment!`,
        `Oh my gosh, this makes me so happy! 🌟 Your good vibes are totally contagious! What's been the highlight of your day? I want to celebrate with you! 🎊`,
        `That's AMAZING! 🚀 I'm so here for your good mood! Tell me everything - what's making you feel so great? This is the energy we love to see! ✨`
      ],
      'general': [
        `Hey there! 👋 I'm so glad you're here chatting with me! Whatever's on your mind, I'm totally here for it. What's been going on with you? And just so you know, you're pretty awesome for reaching out! 💫`,
        `Hi friend! 🌟 Thanks for trusting me with whatever you're thinking about right now. I'm genuinely excited to chat with you! What's the most important thing on your mind today? ${this.getRandomFunFact()}`,
        `Hey! 🤗 I'm really happy you're here! Whatever brought you to chat today, I'm totally here to listen and hang out with you. What's going on in your world? Want to hear something fun while we chat? ${this.getRandomJoke()}`,
        `Hello awesome human! 👋 I'm so glad our paths crossed today! What's been on your heart or mind? I'm here to listen, laugh, or just be here with you - whatever you need! ✨`
      ]
    };
    
    // Find appropriate response category
    let responseCategory = 'general';
    const categories = ['overwhelmed', 'anxiety', 'lonely', 'sad', 'happy'];
    
    for (const keyword of categories) {
      if (lowerMessage.includes(keyword) || lowerMessage.includes(keyword.slice(0, -1))) { // Check for singular forms too
        responseCategory = keyword;
        break;
      }
    }
    
    // Check for other mood indicators
    if (lowerMessage.includes('great') || lowerMessage.includes('awesome') || lowerMessage.includes('good')) {
      responseCategory = 'happy';
    } else if (lowerMessage.includes('tired') || lowerMessage.includes('exhausted')) {
      responseCategory = 'overwhelmed';
    } else if (lowerMessage.includes('worried') || lowerMessage.includes('nervous')) {
      responseCategory = 'anxiety';
    }
    
    // Select a response based on conversation length to add variety
    const responses = friendlyResponses[responseCategory];
    const responseIndex = messageCount % responses.length;
    
    return responses[responseIndex];
  }

  getFallbackResponse(message) {
    const fallbackResponses = {
      'overwhelmed': "I can hear that you're feeling overwhelmed, and that's completely understandable. When everything feels like too much, it can help to focus on just one small thing at a time. What's one tiny step you could take right now to make things feel a bit more manageable?",
      
      'anxiety': "Anxiety can feel really intense and scary. You're not alone in experiencing this. One technique that many people find helpful is the 5-4-3-2-1 grounding method: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This can help bring you back to the present moment.",
      
      'sleep': "Sleep troubles can really impact how we feel during the day. Creating a calming bedtime routine can sometimes help - things like dimming lights an hour before bed, putting devices away, or trying some gentle stretches. What does your current bedtime routine look like?",
      
      'lonely': "Feeling lonely can be really painful, and I want you to know that reaching out here shows real courage. You're taking a positive step by connecting, even when it's hard. What's one small way you might be able to connect with someone today, even briefly?",
      
      'work': "Work stress can feel overwhelming and follow us everywhere. It's important to remember that you're more than your work, and your worth isn't defined by productivity. What's the most stressful part of work for you right now?",
      
      'sad': "It's okay to feel sad - it's a natural human emotion and it shows you're processing something difficult. Sometimes sitting with these feelings, rather than trying to push them away, can be helpful. What's making you feel this way today?",
      
      'angry': "Anger can be a really powerful emotion, and it's valid to feel this way. Sometimes anger is telling us that something important to us has been threatened or hurt. It can help to take some deep breaths and ask yourself what this anger might be trying to tell you.",
      
      'crisis': "I'm really concerned about you and I want you to know that you don't have to face this alone. Please consider reaching out for immediate support - you can call Lifeline at 13 11 14, or if you're in immediate danger, please call emergency services at 000. Your life has value and there are people who want to help.",
      
      'help': "I'm here to listen and support you however I can. It takes strength to ask for help, and I'm glad you've reached out. What's going on that's bringing you here today? Sometimes just talking through what we're experiencing can help us feel less alone with it."
    };

    const lowerMessage = message.toLowerCase();
    
    // Check for crisis keywords first
    if (lowerMessage.includes('suicide') || lowerMessage.includes('kill myself') || lowerMessage.includes('end it all') || lowerMessage.includes('don\'t want to live')) {
      return fallbackResponses.crisis;
    }
    
    // Check for other keywords
    for (const [keyword, response] of Object.entries(fallbackResponses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    // Default supportive response
    return "Thank you for sharing that with me. It takes courage to open up about how you're feeling. I'm here to listen and support you. Can you tell me a bit more about what's going on? Sometimes talking through our experiences can help us process them.";
  }

  // Helper method to check if API is configured
  isConfigured() {
    if (this.useProxy) {
      return true; // Backend proxy handles API key
    } else {
      return !!(this.apiKey && this.apiKey.trim());
    }
  }

  // Method to test API connectivity and rate limit status
  async testConnection() {
    try {
      const response = await fetch(this.proxyEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
          message: "Test connection",
          conversationHistory: []
        }),
      });

      if (response.status === 429) {
        return { status: 'rate_limited', message: 'Rate limit exceeded' };
      } else if (!response.ok) {
        return { status: 'error', message: `Backend error: ${response.status}` };
      } else {
        return { status: 'ok', message: 'Backend proxy working normally' };
      }
    } catch (error) {
      return { status: 'error', message: `Connection failed: ${error.message}` };
    }
  }

  // Session memory methods for personalization
  updateSessionMemory(message, conversationHistory) {
    const lowerMessage = message.toLowerCase();
    
    // Track mood indicators
    if (lowerMessage.includes('happy') || lowerMessage.includes('great') || lowerMessage.includes('awesome')) {
      this.sessionMemory.mood = 'positive';
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('down') || lowerMessage.includes('lonely')) {
      this.sessionMemory.mood = 'low';
    } else if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('stressed')) {
      this.sessionMemory.mood = 'anxious';
    }
    
    // Track achievements and goals
    if (lowerMessage.includes('did it') || lowerMessage.includes('completed') || lowerMessage.includes('finished')) {
      this.sessionMemory.achievements.push({
        text: message,
        timestamp: new Date(),
        celebrated: false
      });
    }
    
    // Track topics of interest
    const topics = ['work', 'family', 'friends', 'school', 'health', 'hobbies', 'exercise', 'sleep'];
    topics.forEach(topic => {
      if (lowerMessage.includes(topic) && !this.sessionMemory.previousTopics.includes(topic)) {
        this.sessionMemory.previousTopics.push(topic);
      }
    });
    
    // Keep memory manageable
    if (this.sessionMemory.achievements.length > 5) {
      this.sessionMemory.achievements = this.sessionMemory.achievements.slice(-5);
    }
    if (this.sessionMemory.previousTopics.length > 8) {
      this.sessionMemory.previousTopics = this.sessionMemory.previousTopics.slice(-8);
    }
  }

  buildMemoryContext() {
    let context = "\n\nSESSION MEMORY:\n";
    
    if (this.sessionMemory.mood) {
      context += `- User's recent mood: ${this.sessionMemory.mood}\n`;
    }
    
    if (this.sessionMemory.achievements.length > 0) {
      context += `- Recent achievements to celebrate: ${this.sessionMemory.achievements.slice(-2).map(a => a.text).join(', ')}\n`;
    }
    
    if (this.sessionMemory.previousTopics.length > 0) {
      context += `- Topics they've mentioned: ${this.sessionMemory.previousTopics.slice(-4).join(', ')}\n`;
    }
    
    if (this.sessionMemory.lastGoal) {
      context += `- Last goal we discussed: ${this.sessionMemory.lastGoal}\n`;
    }
    
    return context;
  }

  // Get random fun elements
  getRandomJoke() {
    return this.jokes[Math.floor(Math.random() * this.jokes.length)];
  }

  getRandomFunFact() {
    return this.funFacts[Math.floor(Math.random() * this.funFacts.length)];
  }

  getRandomMiniChallenge() {
    return this.miniChallenges[Math.floor(Math.random() * this.miniChallenges.length)];
  }

  // Enhanced goal setting
  setUserGoal(goal) {
    this.sessionMemory.lastGoal = goal;
  }

  celebrateAchievement(achievement) {
    const celebrations = [
      "That's AMAZING! 🎉 You're absolutely crushing it!",
      "YES! Look at you go! I'm so proud of you! 🌟",
      "Woohoo! 🎊 You did it! That's fantastic!",
      "I'm literally cheering for you right now! 📣 That's awesome!",
      "You're a rockstar! ⭐ Way to go!",
      "That's incredible! 🚀 You should be so proud!",
      "Boom! 💥 You nailed it! I knew you could do it!"
    ];
    
    return celebrations[Math.floor(Math.random() * celebrations.length)];
  }
}

const geminiService = new GeminiService();
export default geminiService;
