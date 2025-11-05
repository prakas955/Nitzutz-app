// Serverless function for proxying Gemini API requests
// This keeps your API key secure on the server side

// Simple in-memory rate limiting (resets on function restart)
const rateLimitStore = new Map();

// Rate limit configuration
const RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 20, // 20 requests per minute per IP
};

// Clean up old entries periodically
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > RATE_LIMIT.windowMs) {
      rateLimitStore.delete(key);
    }
  }
}

// Rate limiting check
function checkRateLimit(identifier) {
  cleanupRateLimitStore();
  
  const now = Date.now();
  const userLimit = rateLimitStore.get(identifier);
  
  if (!userLimit) {
    // First request from this identifier
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs
    });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
  }
  
  if (now > userLimit.resetTime) {
    // Reset window has passed
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs
    });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
  }
  
  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    // Rate limit exceeded
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: userLimit.resetTime
    };
  }
  
  // Increment count
  userLimit.count++;
  return { 
    allowed: true, 
    remaining: RATE_LIMIT.maxRequests - userLimit.count 
  };
}

// Main handler function
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted'
    });
  }
  
  try {
    // Get user identifier for rate limiting (IP address)
    const userIP = req.headers['x-forwarded-for'] || 
                   req.headers['x-real-ip'] || 
                   req.socket.remoteAddress || 
                   'unknown';
    
    // Check rate limit
    const rateCheck = checkRateLimit(userIP);
    
    if (!rateCheck.allowed) {
      const resetIn = Math.ceil((rateCheck.resetTime - Date.now()) / 1000);
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${resetIn} seconds.`,
        retryAfter: resetIn
      });
    }
    
    // Get API key from environment variable (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ 
        error: 'Server configuration error',
        message: 'API key not configured on server'
      });
    }
    
    // Get request body
    const { message, conversationHistory = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'Bad request',
        message: 'Message is required'
      });
    }
    
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
    
    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt }]
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
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_ONLY_HIGH'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_ONLY_HIGH'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_ONLY_HIGH'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_ONLY_HIGH'
            }
          ]
        })
      }
    );
    
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      
      return res.status(geminiResponse.status).json({
        error: 'AI service error',
        message: 'Unable to get response from AI service',
        details: geminiResponse.status === 429 ? 'Rate limit exceeded' : 'Service unavailable'
      });
    }
    
    const data = await geminiResponse.json();
    
    // Extract response text
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const responseText = data.candidates[0].content.parts[0].text.trim();
      
      return res.status(200).json({
        success: true,
        response: responseText,
        remaining: rateCheck.remaining
      });
    } else if (data.candidates && data.candidates[0] && data.candidates[0].finishReason === 'SAFETY') {
      return res.status(200).json({
        success: true,
        response: "I understand you're reaching out for support, and I appreciate you sharing with me. While I want to be helpful, I also want to make sure our conversation stays in a safe space. Would you like to try rephrasing that, or perhaps we could talk about some coping strategies that might help you right now?",
        remaining: rateCheck.remaining
      });
    } else {
      console.error('Unexpected Gemini response structure:', data);
      return res.status(500).json({
        error: 'Invalid response',
        message: 'Received invalid response from AI service'
      });
    }
    
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Server error',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

