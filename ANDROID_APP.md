# CoinKrazy Android App 📱

This guide explains how to build and deploy the CoinKrazy Android app using Capacitor.

## 🏗️ Architecture

The CoinKrazy Android app is built using **Capacitor**, which wraps your existing React web app into a native Android container. This means:

- Same codebase for web and mobile
- Native Android performance and features
- Access to device APIs (camera, notifications, etc.)
- Can be published to Google Play Store

## 📋 Prerequisites

Before building the Android app, ensure you have:

1. **Node.js** (already installed)
2. **Android Studio** with Android SDK
3. **Java Development Kit (JDK) 11 or higher**

### Setting up Android Development Environment

1. Download and install [Android Studio](https://developer.android.com/studio)
2. Install Android SDK (API level 30 or higher)
3. Set up environment variables:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## 🚀 Building the Android App

### Quick Build
```bash
npm run android:build
```

### Step by Step

1. **Build the web app:**
   ```bash
   npm run build:client
   ```

2. **Sync with Android:**
   ```bash
   npm run android:sync
   ```

3. **Open in Android Studio:**
   ```bash
   npm run android:open
   ```

4. **Run on device/emulator:**
   ```bash
   npm run android:run
   ```

## 📱 App Configuration

### App Details
- **App Name:** CoinKrazy Casino
- **Package ID:** com.coinkrazy.casino
- **Version:** 1.0.0

### Features Included
- ✅ Splash Screen with CoinKrazy branding
- ✅ Status Bar customization (dark theme)
- ✅ Keyboard handling
- ✅ Local & Push Notifications
- ✅ Haptic feedback
- ✅ Camera access (for profile photos)
- ✅ Geolocation (for compliance)
- ✅ Network status detection
- ✅ Device info access
- ✅ Local storage
- ✅ Clipboard access
- ✅ Social sharing
- ✅ Native dialogs and toasts

## 🎨 Customization

### App Icon
Replace the default icons in `android/app/src/main/res/mipmap-*` folders with your CoinKrazy branded icons.

### Splash Screen
Update splash screen images in `android/app/src/main/res/drawable-*` folders.

### Colors & Theme
Edit `android/app/src/main/res/values/styles.xml` to match CoinKrazy branding.

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run android:sync` | Sync web build with Android |
| `npm run android:build` | Full build (web + Android) |
| `npm run android:run` | Run on connected device |
| `npm run android:open` | Open in Android Studio |

## 📦 Building for Production

### Debug APK
```bash
npm run android:build
```
APK location: `android/app/build/outputs/apk/debug/`

### Release APK (for Google Play)
1. Open Android Studio: `npm run android:open`
2. Build > Generate Signed Bundle/APK
3. Create/use signing key
4. Build release AAB file

### Google Play Store Upload
1. Create Google Play Console account
2. Upload the signed AAB file
3. Complete store listing with:
   - App description
   - Screenshots
   - Privacy policy
   - Content rating

## 🔐 Security & Compliance

### Age Verification
The app includes age verification checks as required for casino/gaming apps.

### Privacy
- Only collects necessary data
- Includes privacy policy link
- Complies with COPPA (13+) and other regulations

### Google Play Policies
- Marked as "Social Casino" category
- Includes responsible gaming messaging
- No real money gambling (sweepstakes model)

## 🐛 Troubleshooting

### Common Issues

**Build fails:**
- Ensure Android SDK is properly installed
- Check Java version compatibility
- Clear build cache: `cd android && ./gradlew clean`

**App crashes on startup:**
- Check browser console for errors
- Verify all web assets are included
- Test web version first

**Device permissions:**
- Update AndroidManifest.xml if needed
- Request permissions in app flow

## 📈 Analytics & Monitoring

The Android app includes:
- Crash reporting
- Performance monitoring
- User analytics (privacy-compliant)
- Error tracking

## 🚀 Deployment Checklist

- [ ] Test on multiple Android devices
- [ ] Verify all casino games work properly
- [ ] Test payment flows (if applicable)
- [ ] Check compliance features
- [ ] Generate signed release build
- [ ] Upload to Google Play Console
- [ ] Complete store listing
- [ ] Submit for review

---

**Need help?** Check the [Capacitor documentation](https://capacitorjs.com/docs) or contact the development team.
