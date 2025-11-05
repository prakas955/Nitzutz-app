// Environment configuration for Nitzutz app
// To use Gemini API, create a .env file in the root directory with:
// REACT_APP_GEMINI_API_KEY=your_api_key_here

export const config = {
  geminiApiKey: process.env.REACT_APP_GEMINI_API_KEY,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  debugMode: process.env.REACT_APP_DEBUG === 'true',
};

export default config;
