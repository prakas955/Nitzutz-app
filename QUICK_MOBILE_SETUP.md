# 📱 Quick Mobile App Setup

## 🎯 Fastest Way to Get Your App on Stores

### **Option 1: Android (Easiest - No Mac Needed)** ✅

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize
npx cap init

# When prompted:
# - App name: Nitzutz
# - App ID: com.nitzutz.app
# - Web dir: build

# Build your app
npm run build

# Add Android platform
npx cap add android

# Sync
npx cap sync

# Open in Android Studio
npx cap open android
```

**Then in Android Studio:**
1. Build → Generate Signed Bundle / APK
2. Upload to Google Play Console

---

### **Option 2: iOS (Requires Mac)** 🍎

```bash
# Install Capacitor iOS
npm install @capacitor/ios

# Add iOS platform
npx cap add ios

# Sync
npx cap sync

# Open in Xcode (Mac only)
npx cap open ios
```

**Then in Xcode:**
1. Product → Archive
2. Distribute to App Store Connect

---

## 📋 Prerequisites Checklist

### **For Android:**
- [ ] Android Studio installed
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Java JDK installed

### **For iOS:**
- [ ] Mac computer (required)
- [ ] Xcode installed
- [ ] Apple Developer Account ($99/year)

---

## 🚀 Quick Start (5 Minutes)

**1. Install Capacitor:**
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
```

**2. Initialize:**
```bash
npx cap init
```
- Press Enter for defaults (or customize)

**3. Build:**
```bash
npm run build
```

**4. Add Platforms:**
```bash
npx cap add android
npx cap add ios
npx cap sync
```

**5. Open in IDE:**
```bash
npx cap open android  # For Android
npx cap open ios      # For iOS (Mac only)
```

---

## 📸 What You Need for Store Submission

1. **App Screenshots** - Take screenshots of your app
2. **App Icon** - 1024x1024px (you have logo192.png)
3. **Privacy Policy** - Host on your Vercel site
4. **App Description** - See APP_STORE_SETUP.md

---

## 💰 Costs

- **Google Play:** $25 one-time
- **Apple App Store:** $99/year

---

## 📚 Full Guide

See `APP_STORE_SETUP.md` for complete step-by-step instructions!

---

**Ready to start?** Run the commands above! 🚀

