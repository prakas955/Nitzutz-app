# 🔧 Gemini API Setup Guide (Updated October 2025)

## Quick Start

Your Nitzutz app needs a Gemini API key to power the AI chat feature. Here's how to set it up:

### Step 1: Get Your FREE API Key

1. **Visit Google AI Studio**: Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. **Sign in** with your Google account
3. **Create an API key**:
   - Click "Get API Key" or "Create API Key in new project"
   - Choose "Create API key in new project" for first-time users
4. **Copy the key** - it will start with `AIza...`

### Step 2: Create Your .env File

1. **Create a new file** in your project root called `.env` (no file extension)
2. **Add this line** to the file:
   ```
   REACT_APP_GEMINI_API_KEY=YOUR_API_KEY_HERE
   ```
3. **Replace** `YOUR_API_KEY_HERE` with your actual API key
4. **Save** the file

**Example .env file:**
```
REACT_APP_GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_DEBUG=true
```

### Step 3: Restart Your App

1. **Stop** your development server (press `Ctrl+C` in the terminal)
2. **Start** it again: `npm start`
3. **Check** the browser console (F12) - you should see: 
   ```
   ✅ Gemini API configured successfully!
      Model: gemini-2.5-flash
      Endpoint: https://generativelanguage.googleapis.com/v1
   ```

---

## 🔍 Troubleshooting

### Issue: "API key not found" error

**Solution:**
- Make sure your `.env` file is in the **root directory** (same level as `package.json`)
- The variable name must be **exactly**: `REACT_APP_GEMINI_API_KEY`
- No spaces around the `=` sign
- Restart your dev server after creating the file

### Issue: "403 Forbidden" or "API key error"

**Solution:**
- Your API key may be incorrect - double-check you copied it correctly
- Go back to [AI Studio](https://aistudio.google.com/app/apikey) and verify your key
- Try creating a new API key if the issue persists
- Make sure there are no extra spaces or quotes around the key

### Issue: "429 Rate limit exceeded"

**Solution:**
- The free tier allows 60 requests/minute, 1500 requests/day
- Wait a few seconds and try again
- The app has automatic retry logic for rate limits
- Consider upgrading to a paid tier if you need more requests

### Issue: "Model not found" or "404 error"

**Solution:**
- The code has been updated to use `gemini-1.5-flash-latest`
- Make sure you pulled the latest changes
- Check the console for the exact error message
- The model name may have changed - check [Gemini API Changelog](https://ai.google.dev/gemini-api/docs/changelog)

### Issue: Chat works but gives generic responses

**Solution:**
- This means the app is using **fallback responses** (no API connection)
- Check if your API key is set correctly in `.env`
- Open browser console (F12) and look for error messages
- Verify you restarted the server after adding the API key

---

## 🎯 Checking If It's Working

### In the Browser Console (F12):

**✅ Good signs:**
```
✅ Gemini API configured successfully!
   Model: gemini-2.5-flash
   Endpoint: https://generativelanguage.googleapis.com/v1
🚀 Making Gemini API request: { model: "gemini-2.5-flash", ... }
✅ Gemini API response received successfully
```

**❌ Bad signs:**
```
⚠️ Gemini API key not found. Please set REACT_APP_GEMINI_API_KEY in your .env file.
❌ Gemini API error: { status: 403, ... }
```

### In the Chat:

**With API:** Responses will be varied, natural, and personalized to your conversation  
**Without API:** Responses will be repetitive and follow templates

---

## 📊 What Changed (October 2025 Updates)

### Changes I Made to Your Code:

1. ✅ **Updated API endpoint** from `v1beta` to `v1` (stable)
2. ✅ **Updated model** from `gemini-1.5-flash` to `gemini-2.5-flash` (CRITICAL FIX!)
3. ✅ **Removed hardcoded API key** for security
4. ✅ **Added detailed logging** to help debug issues
5. ✅ **Improved error messages** with specific troubleshooting hints
6. ✅ **Relaxed safety settings** from `BLOCK_MEDIUM_AND_ABOVE` to `BLOCK_ONLY_HIGH`
7. ✅ **Increased token limit** from 200 to 500 for longer responses
8. ✅ **Added role field** to API requests for better compatibility

**IMPORTANT:** The old `gemini-1.5-flash` model no longer exists! This was causing 404 errors.

### What's Deprecated (Don't Use):

- ❌ `gemini-2.5-flash-preview-native-audio-dialog`
- ❌ `gemini-2.5-flash-exp-native-audio-thinking-dialog`
- ❌ Gemini Code Assist tools (replaced by agent mode)

### What's Current (October 2025):

- ✅ `gemini-2.5-flash` (recommended for chat - fastest & best)
- ✅ `gemini-2.5-pro` (more capable, slower, better reasoning)
- ✅ `gemini-2.0-flash` (alternative fast option)
- ✅ `gemini-2.5-flash-lite` (lightweight for simple tasks)
- ✅ API endpoint: `https://generativelanguage.googleapis.com/v1`

**Note:** Gemini 1.5 models are DEPRECATED and will return 404 errors!

---

## 💰 API Limits & Pricing

### Free Tier (Google AI Studio):
- **60 requests per minute**
- **1,500 requests per day**
- **32,000 tokens per request**
- Perfect for development and testing!

### If You Need More:
- Switch to Google Cloud with billing enabled
- Pricing: ~$0.35 per 1M characters (very cheap!)
- No daily limits with paid tier

---

## 🔐 Security Best Practices

1. **Never commit `.env` to Git** - it's already in `.gitignore`
2. **Don't share your API key** publicly
3. **Rotate your key** if you accidentally expose it
4. **Use environment variables** in production (Vercel, Netlify, etc.)
5. **Restrict your key** in Google AI Studio if deploying publicly

---

## 📚 Additional Resources

- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Troubleshooting Guide](https://ai.google.dev/gemini-api/docs/troubleshooting)
- [Changelog & Updates](https://ai.google.dev/gemini-api/docs/changelog)
- [Google AI Developer Forum](https://discuss.ai.google.dev/)

---

## 🆘 Still Having Issues?

1. **Check the browser console** (F12) for detailed error messages
2. **Look for the emoji indicators**:
   - 🚀 = API request sent
   - ✅ = Success
   - ❌ = Error
   - ⚠️ = Warning
3. **Share the console output** when asking for help
4. **Verify your setup**:
   ```bash
   # Check if .env exists
   ls -la | grep .env
   
   # Check if variable is loaded (should see your key)
   echo $REACT_APP_GEMINI_API_KEY
   ```

---

**Need more help?** Open an issue on GitHub or check the console logs for specific error codes!

