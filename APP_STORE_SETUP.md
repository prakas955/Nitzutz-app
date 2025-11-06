# 📱 App Store & Play Store Setup Guide

## Overview

Your Nitzutz app can be published to both **Google Play Store** and **Apple App Store**! Here's how:

---

## 🎯 Two Methods to Choose From

### **Method 1: Progressive Web App (PWA) - Easiest ✅**
- **Google Play:** Can be published as PWA (Trusted Web Activity)
- **Apple App Store:** Requires native wrapper (use Capacitor)
- **Pros:** Quick setup, works great
- **Cons:** Limited native features

### **Method 2: Native App with Capacitor - Best for Full Features 🚀**
- **Both Stores:** Full native app experience
- **Pros:** Access to device features, app store presence
- **Cons:** Requires more setup

---

## 📋 Method 1: PWA (Quick Start)

### For Google Play Store:

**Step 1: Build Your PWA**
```bash
npm run build
```

**Step 2: Deploy to Vercel** (already done!)

**Step 3: Submit to Google Play**
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Choose "PWA" or "Web App" option
4. Provide your Vercel URL
5. Add app screenshots, description, etc.
6. Submit for review

**Note:** Google Play accepts PWAs directly now!

---

## 📋 Method 2: Native App with Capacitor (Recommended)

### Step 1: Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
npx cap init
```

When prompted:
- **App name:** Nitzutz
- **App ID:** com.nitzutz.app (or your domain)
- **Web dir:** build

### Step 2: Build Your App

```bash
npm run build
```

### Step 3: Add Platforms

**For Android:**
```bash
npx cap add android
npx cap sync
```

**For iOS (Mac only):**
```bash
npx cap add ios
npx cap sync
```

### Step 4: Configure App Icons & Splash

Create app icons:
- Android: `android/app/src/main/res/mipmap-*/`
- iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Required sizes:
- Android: 48x48, 72x72, 96x96, 144x144, 192x192, 512x512
- iOS: 20x20, 29x29, 40x40, 60x60, 76x76, 83.5x83.5, 1024x1024

### Step 5: Update Capacitor Config

Edit `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nitzutz.app',
  appName: 'Nitzutz',
  webDir: 'build',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#667eea"
    }
  }
};

export default config;
```

---

## 🍎 Apple App Store Submission

### Prerequisites:
- **Mac computer** (required for iOS builds)
- **Apple Developer Account** ($99/year)
- **Xcode** (free from Mac App Store)

### Step 1: Open in Xcode

```bash
npx cap open ios
```

### Step 2: Configure in Xcode

1. Select your project in Xcode
2. Go to "Signing & Capabilities"
3. Select your Apple Developer Team
4. Set Bundle Identifier (e.g., `com.nitzutz.app`)

### Step 3: Build for App Store

1. In Xcode: Product → Archive
2. Wait for build to complete
3. Click "Distribute App"
4. Choose "App Store Connect"
5. Follow the wizard

### Step 4: Submit to App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app
3. Fill in app information:
   - Name: Nitzutz
   - Category: Health & Fitness
   - Description: Mental health support app
   - Screenshots (required)
   - Privacy policy URL
4. Submit for review

---

## 🤖 Google Play Store Submission

### Prerequisites:
- **Google Play Developer Account** ($25 one-time)
- **Android Studio** (free)

### Step 1: Open in Android Studio

```bash
npx cap open android
```

### Step 2: Build Release APK/AAB

1. In Android Studio: Build → Generate Signed Bundle / APK
2. Choose "Android App Bundle" (recommended)
3. Create keystore (save credentials securely!)
4. Build the bundle

### Step 3: Submit to Play Store

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill in app information:
   - App name: Nitzutz
   - Category: Health & Fitness
   - Description
   - Screenshots (required)
   - Privacy policy URL
4. Upload the AAB file
5. Complete store listing
6. Submit for review

---

## 📸 Required Assets for App Stores

### Screenshots Needed:

**Google Play:**
- Phone: 2-8 screenshots (16:9 or 9:16)
- Tablet (optional): 7-10 screenshots
- Feature graphic: 1024x500px

**Apple App Store:**
- iPhone: 6.5" display (required)
- iPhone: 5.5" display (optional)
- iPad Pro: 12.9" (if supporting iPad)
- App icon: 1024x1024px (required)

### App Description Template:

```
Nitzutz - Your Mental Health Companion

Nitzutz is a free, anonymous mental health support app designed specifically for NSW, Australia. Get 24/7 support through AI-powered chat, access crisis resources, track your wellness goals, and build personalized action plans.

FEATURES:
✅ AI Chat Companion - Get instant, empathetic support anytime
✅ Crisis Resources - Direct access to NSW mental health services
✅ Goal Tracking - Set and achieve wellness goals
✅ Action Plans - Break down goals into daily steps
✅ 100% Anonymous - No login, no tracking, complete privacy
✅ Safety Plans - Create your own crisis safety plan

PRIVACY FIRST:
- All data stays on your device
- No accounts or personal information required
- Complete anonymity
- HIPAA-compliant design principles

PERFECT FOR:
- Daily mental wellness check-ins
- Crisis support access
- Goal setting and achievement
- Anxiety and stress management
- Building healthy habits

Download Nitzutz today and take the first step towards better mental wellness. Your privacy is our priority.
```

---

## 🔐 Privacy Policy (Required)

You need a privacy policy URL for both stores. Create one at:

**Options:**
1. **Free:** Use [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
2. **Simple:** Host on your Vercel site
3. **Custom:** Create your own page

**Template Location:** Create `public/privacy-policy.html` or host separately.

---

## 📋 Store Listing Checklist

### Both Stores Need:

- [x] App name and description
- [x] Category selection
- [x] App icon (1024x1024px)
- [x] Screenshots (multiple sizes)
- [x] Privacy policy URL
- [x] Support email/website
- [x] Age rating
- [x] Content rating

### Google Play Additional:

- [ ] Feature graphic (1024x500px)
- [ ] Short description (80 chars)
- [ ] Long description (4000 chars)
- [ ] Promo video (optional)

### Apple App Store Additional:

- [ ] Subtitle (30 chars)
- [ ] Keywords (100 chars)
- [ ] Promotional text (170 chars)
- [ ] App preview video (optional)
- [ ] Support URL
- [ ] Marketing URL (optional)

---

## 💰 Developer Account Costs

| Platform | Cost | Frequency |
|----------|------|-----------|
| **Google Play** | $25 | One-time |
| **Apple App Store** | $99 | Annual |

---

## 🚀 Quick Start Commands

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Initialize
npx cap init

# Build
npm run build

# Add platforms
npx cap add android
npx cap add ios

# Sync
npx cap sync

# Open in IDE
npx cap open android  # Android Studio
npx cap open ios      # Xcode (Mac only)
```

---

## 📱 Alternative: Trusted Web Activity (Android Only)

For Android, you can also use Trusted Web Activity (TWA) to publish your PWA:

1. Use [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) CLI
2. Generates Android app from your PWA
3. Submit to Play Store

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest=https://your-vercel-url.com/manifest.json
bubblewrap build
```

---

## 🎯 Recommended Approach

**For You (Fastest):**

1. **Start with PWA** - Already works on phones via browser
2. **Submit Android via Capacitor** - Easier than iOS
3. **Submit iOS later** - If you have Mac and Apple Developer account

**Timeline:**
- **Android:** 1-2 days setup + 1-7 days review
- **iOS:** 1-2 days setup + 1-7 days review (if you have Mac)

---

## 📞 Need Help?

- **Capacitor Docs:** https://capacitorjs.com/docs
- **Google Play:** https://support.google.com/googleplay/android-developer
- **Apple App Store:** https://developer.apple.com/support/app-store-connect/

---

## ✅ Next Steps

1. **Choose your method** (PWA or Capacitor)
2. **Build your app** (`npm run build`)
3. **Prepare screenshots** (take from your app)
4. **Create privacy policy**
5. **Set up developer accounts**
6. **Submit to stores!**

**Good luck! Your app is ready to go live! 🎉**

