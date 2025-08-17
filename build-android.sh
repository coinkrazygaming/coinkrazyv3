#!/bin/bash

# CoinKrazy Android App Build Script
echo "🚀 Building CoinKrazy Android App..."

# Step 1: Build the web app
echo "📦 Building web application..."
npm run build:client
if [ $? -ne 0 ]; then
    echo "❌ Web build failed!"
    exit 1
fi

# Step 2: Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync android
if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed!"
    exit 1
fi

# Step 3: Build Android APK/AAB
echo "🤖 Building Android app..."
npx cap build android --prod
if [ $? -ne 0 ]; then
    echo "❌ Android build failed!"
    exit 1
fi

echo "✅ CoinKrazy Android app built successfully!"
echo "📱 APK/AAB files are located in android/app/build/outputs/"
echo ""
echo "Next steps:"
echo "1. Test the app: npx cap run android"
echo "2. Open in Android Studio: npx cap open android"
echo "3. Upload to Google Play Store"
