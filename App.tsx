import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme, Theme as NavTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { FontProvider } from './src/context/FontContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { AudioProvider } from './src/context/AudioContext';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider, ErrorBoundary, ThemedErrorFallback, OfflineIndicator, HamburgerMenu } from './src/components';
import MiniPlayer from './src/components/MiniPlayer';
import { RootStackParamList, TabParamList } from './src/types';
import { getProgress } from './src/utils/storage';
import { queryClient } from './src/services/queryClient';

// Screens
import HomeScreen from './src/screens/HomeScreenV2';
import TimelineScreen from './src/screens/TimelineScreen';
import GlossaryScreen from './src/screens/GlossaryScreen';
import FormsScreen from './src/screens/FormsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ComposersScreen from './src/screens/ComposersScreen';
import ComposerDetailScreen from './src/screens/ComposerDetailScreen';
import PeriodDetailScreen from './src/screens/PeriodDetailScreen';
import FormDetailScreen from './src/screens/FormDetailScreen';
import TermDetailScreen from './src/screens/TermDetailScreen';
import KickstartScreen from './src/screens/KickstartScreen';
import KickstartDayScreen from './src/screens/KickstartDayScreen';
import WeeklyAlbumScreen from './src/screens/WeeklyAlbumScreen';
import MonthlySpotlightScreen from './src/screens/MonthlySpotlightScreen';
import NewReleasesScreen from './src/screens/NewReleasesScreen';
import ReleaseDetailScreen from './src/screens/ReleaseDetailScreen';
import ConcertHallsScreen from './src/screens/ConcertHallsScreen';
import ConcertHallDetailScreen from './src/screens/ConcertHallDetailScreen';
import BadgesScreen from './src/screens/BadgesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SearchScreen from './src/screens/SearchScreen';
import QuizScreen from './src/screens/QuizScreen';
import DiscoverScreen from './src/screens/DiscoverScreen';
import MusicBrainzSearchScreen from './src/screens/MusicBrainzSearchScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import FormExplorerScreen from './src/screens/FormExplorerScreen';

// Experimental / Labs screens
import MoodPlaylistsScreen from './src/experimental/moodPlaylists/MoodPlaylistsScreen';
import ListeningGuidesScreen from './src/experimental/listeningGuides/ListeningGuidesScreen';
import ListeningGuidePlayerScreen from './src/experimental/listeningGuides/ListeningGuidePlayerScreen';
import RecommendationsScreen from './src/experimental/recommendations/RecommendationsScreen';
import LabsScreen from './src/experimental/LabsScreen';

// Auth screens
import { LoginScreen, RegisterScreen, ForgotPasswordScreen, EditProfileScreen } from './src/screens/Auth';
import UserDashboardScreen from './src/screens/UserDashboardScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import { ContentListScreen, ContentEditScreen, AuditLogScreen } from './src/screens/Admin';
import { useAuthDeepLink } from './src/hooks/useAuthDeepLink';
import { useNavigationPersistence } from './src/hooks/useNavigationPersistence';
import { injectWebCSS } from './src/utils/webCSS';

// Inject web CSS for hover effects (runs once on web only)
injectWebCSS();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const { theme, isDark, isGlass, themeName } = useTheme();
  const t = theme;
  const isStitch = isDark;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Timeline':
              iconName = focused ? 'time' : 'time-outline';
              break;
            case 'Glossary':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Forms':
              iconName = focused ? 'musical-notes' : 'musical-notes-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: t.colors.primary,
        tabBarInactiveTintColor: isGlass ? '#3C3C43' : isStitch ? t.colors.textMuted : t.colors.textMuted,
        tabBarStyle: {
          backgroundColor: isGlass ? 'transparent' : isStitch ? t.colors.surface + 'CC' : t.colors.surface,
          borderTopColor: isGlass ? 'rgba(60, 60, 67, 0.12)' : isStitch ? 'transparent' : t.colors.border,
          borderTopWidth: isStitch ? 0 : 1,
          paddingTop: 8,
          height: 88,
          position: (isGlass || isStitch) ? 'absolute' : 'relative',
          // Stitch: floating rounded tab bar
          ...(isStitch && {
            bottom: 20,
            left: 16,
            right: 16,
            borderRadius: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }),
        },
        tabBarBackground: (isGlass || isStitch) ? () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={isStitch ? 80 : 100}
              tint={isStitch ? 'dark' : 'light'}
              style={[
                StyleSheet.absoluteFill,
                isStitch && { borderRadius: 24, overflow: 'hidden' }
              ]}
            />
          ) : (
            <View style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isStitch
                  ? 'rgba(34, 26, 50, 0.85)'
                  : 'rgba(255, 255, 255, 0.9)',
                borderRadius: isStitch ? 24 : 0,
                borderWidth: isStitch ? 1 : 0,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }
            ]} />
          )
        ) : undefined,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: isGlass ? 'transparent' : t.colors.background,
        },
        headerTransparent: isGlass,
        headerBlurEffect: isGlass ? 'light' : undefined,
        headerTintColor: t.colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerLeft: () => <HamburgerMenu />,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Timeline"
        component={TimelineScreen}
        options={{ title: 'Timeline' }}
      />
      <Tab.Screen
        name="Glossary"
        component={GlossaryScreen}
        options={{ title: 'Glossary' }}
      />
      <Tab.Screen
        name="Forms"
        component={FormsScreen}
        options={{ title: 'Forms' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { theme, isDark, isGlass } = useTheme();
  const t = theme;
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Handle auth deep links (password reset, email verification, etc.)
  useAuthDeepLink();

  // Navigation state persistence for crash recovery
  const { isReady: navReady, initialState, onStateChange } = useNavigationPersistence();

  useEffect(() => {
    async function checkFirstLaunch() {
      const progress = await getProgress();
      setShowOnboarding(progress.firstLaunch && !progress.kickstartCompleted);
      setIsLoading(false);
    }
    checkFirstLaunch();
  }, []);

  // Custom navigation theme
  const navTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      primary: t.colors.primary,
      background: isGlass ? 'transparent' : t.colors.background,
      card: isGlass ? 'rgba(255, 255, 255, 0.8)' : t.colors.surface,
      text: t.colors.text,
      border: t.colors.border,
      notification: t.colors.primary,
    },
  };

  if (isLoading || !navReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: t.colors.background }}>
        <ActivityIndicator size="large" color={t.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={navTheme}
      initialState={initialState}
      onStateChange={onStateChange}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        initialRouteName={showOnboarding ? 'Welcome' : 'MainTabs'}
        screenOptions={{
          headerStyle: {
            backgroundColor: t.colors.background,
          },
          headerTintColor: t.colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerBackTitleVisible: false,
          contentStyle: {
            backgroundColor: t.colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ComposerDetail"
          component={ComposerDetailScreen}
          options={{ title: 'Composer' }}
        />
        <Stack.Screen
          name="Composers"
          component={ComposersScreen}
          options={{ title: 'Composers' }}
        />
        <Stack.Screen
          name="PeriodDetail"
          component={PeriodDetailScreen}
          options={{ title: 'Period' }}
        />
        <Stack.Screen
          name="FormDetail"
          component={FormDetailScreen}
          options={{ title: 'Form' }}
        />
        <Stack.Screen
          name="FormExplorer"
          component={FormExplorerScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TermDetail"
          component={TermDetailScreen}
          options={{ title: 'Term' }}
        />
        <Stack.Screen
          name="Kickstart"
          component={KickstartScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="KickstartDay"
          component={KickstartDayScreen}
          options={{ title: '5-Day Kickstart' }}
        />
        <Stack.Screen
          name="WeeklyAlbum"
          component={WeeklyAlbumScreen}
          options={{ title: 'Weekly Album' }}
        />
        <Stack.Screen
          name="MonthlySpotlight"
          component={MonthlySpotlightScreen}
          options={{ title: 'Monthly Spotlight' }}
        />
        <Stack.Screen
          name="NewReleases"
          component={NewReleasesScreen}
          options={{ title: 'New Releases' }}
        />
        <Stack.Screen
          name="ReleaseDetail"
          component={ReleaseDetailScreen}
          options={{ title: 'Album' }}
        />
        <Stack.Screen
          name="ConcertHalls"
          component={ConcertHallsScreen}
          options={{ title: 'Concert Halls' }}
        />
        <Stack.Screen
          name="ConcertHallDetail"
          component={ConcertHallDetailScreen}
          options={{ title: 'Concert Hall' }}
        />
        <Stack.Screen
          name="Badges"
          component={BadgesScreen}
          options={{ title: 'Badges' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ title: 'Search', headerShown: false }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ title: 'Daily Quiz', headerShown: false }}
        />
        <Stack.Screen
          name="Discover"
          component={DiscoverScreen}
          options={{ title: 'Discover', headerShown: false }}
        />
        <Stack.Screen
          name="MusicBrainzSearch"
          component={MusicBrainzSearchScreen}
          options={{ title: 'MusicBrainz Search', headerShown: false }}
        />

        {/* Labs / Experimental Screens */}
        <Stack.Screen
          name="MoodPlaylists"
          component={MoodPlaylistsScreen}
          options={{ title: 'Mood Playlists', headerShown: false }}
        />
        <Stack.Screen
          name="ListeningGuides"
          component={ListeningGuidesScreen}
          options={{ title: 'Listening Guides', headerShown: false }}
        />
        <Stack.Screen
          name="ListeningGuidePlayer"
          component={ListeningGuidePlayerScreen}
          options={{ title: 'Guide Player', headerShown: false }}
        />
        <Stack.Screen
          name="Recommendations"
          component={RecommendationsScreen}
          options={{ title: 'Recommendations', headerShown: false }}
        />
        <Stack.Screen
          name="Labs"
          component={LabsScreen}
          options={{ title: 'Labs', headerShown: false }}
        />

        {/* Auth Screens */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />

        {/* Dashboard Screens */}
        <Stack.Screen
          name="UserDashboard"
          component={UserDashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContentList"
          component={ContentListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContentEdit"
          component={ContentEditScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AuditLog"
          component={AuditLogScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer >
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider>
          <FontProvider>
            <ToastProvider>
              <ErrorBoundary renderFallback={(error, reset) => (
                <ThemedErrorFallback error={error} onReset={reset} />
              )}>
                <SettingsProvider>
                  <FavoritesProvider>
                    <AuthProvider>
                      <AudioProvider>
                        <AppNavigator />
                        <MiniPlayer />
                        <OfflineIndicator />
                      </AudioProvider>
                    </AuthProvider>
                  </FavoritesProvider>
                </SettingsProvider>
              </ErrorBoundary>
            </ToastProvider>
          </FontProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
