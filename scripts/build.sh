#!/bin/bash

# Build script for Context Composer
# Usage: ./scripts/build.sh

set -e

echo "🎼 Context Composer Build Script"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if eas-cli is installed
check_eas() {
    if ! command -v eas &> /dev/null; then
        echo -e "${YELLOW}EAS CLI not found. Installing...${NC}"
        npm install -g eas-cli
    fi
}

# Check if logged in to EAS
check_eas_login() {
    if ! eas whoami &> /dev/null; then
        echo -e "${YELLOW}Not logged in to EAS. Please login:${NC}"
        eas login
    fi
}

# Select build type
echo "Select build method:"
echo "  1) Cloud Build (EAS - recommended)"
echo "  2) Local Build (requires Android Studio / Xcode)"
echo ""
read -p "Enter choice [1-2]: " BUILD_METHOD

# Select platform
echo ""
echo "Select platform:"
echo "  1) Android"
echo "  2) iOS"
echo "  3) Both"
echo ""
read -p "Enter choice [1-3]: " PLATFORM_CHOICE

# Select profile
echo ""
echo "Select build profile:"
echo "  1) Preview (APK for testing)"
echo "  2) Production (Store-ready)"
echo "  3) Development (Dev client)"
echo ""
read -p "Enter choice [1-3]: " PROFILE_CHOICE

# Map choices
case $PLATFORM_CHOICE in
    1) PLATFORM="android" ;;
    2) PLATFORM="ios" ;;
    3) PLATFORM="all" ;;
    *) echo -e "${RED}Invalid choice${NC}"; exit 1 ;;
esac

case $PROFILE_CHOICE in
    1) PROFILE="preview" ;;
    2) PROFILE="production" ;;
    3) PROFILE="development" ;;
    *) echo -e "${RED}Invalid choice${NC}"; exit 1 ;;
esac

echo ""
echo -e "${BLUE}Building: ${PLATFORM} / ${PROFILE}${NC}"
echo ""

if [ "$BUILD_METHOD" == "1" ]; then
    # Cloud Build
    echo -e "${GREEN}Starting EAS Cloud Build...${NC}"
    check_eas
    check_eas_login
    
    if [ "$PLATFORM" == "all" ]; then
        eas build --platform all --profile $PROFILE
    else
        eas build --platform $PLATFORM --profile $PROFILE
    fi
    
elif [ "$BUILD_METHOD" == "2" ]; then
    # Local Build
    echo -e "${GREEN}Starting Local Build...${NC}"
    
    # Generate native projects
    echo "Generating native projects..."
    npx expo prebuild --clean
    
    if [ "$PLATFORM" == "android" ] || [ "$PLATFORM" == "all" ]; then
        echo -e "${BLUE}Building Android...${NC}"
        cd android
        
        if [ "$PROFILE" == "production" ]; then
            ./gradlew bundleRelease
            echo -e "${GREEN}✓ Android App Bundle created at:${NC}"
            echo "  android/app/build/outputs/bundle/release/app-release.aab"
        else
            ./gradlew assembleRelease
            echo -e "${GREEN}✓ Android APK created at:${NC}"
            echo "  android/app/build/outputs/apk/release/app-release.apk"
        fi
        cd ..
    fi
    
    if [ "$PLATFORM" == "ios" ] || [ "$PLATFORM" == "all" ]; then
        echo -e "${BLUE}Building iOS...${NC}"
        echo -e "${YELLOW}Note: iOS builds require Xcode on macOS${NC}"
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            cd ios
            xcodebuild -workspace *.xcworkspace -scheme "ContextComposer" -configuration Release -archivePath build/ContextComposer.xcarchive archive
            echo -e "${GREEN}✓ iOS Archive created at:${NC}"
            echo "  ios/build/ContextComposer.xcarchive"
            cd ..
        else
            echo -e "${RED}iOS builds require macOS with Xcode${NC}"
        fi
    fi
else
    echo -e "${RED}Invalid build method${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Build complete!${NC}"
