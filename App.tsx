import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme, Theme as NavTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { AudioProvider } from './src/context/AudioContext';
import MiniPlayer from './src/components/MiniPlayer';
import { RootStackParamList, TabParamList } from './src/types';
import { getProgress } from './src/utils/storage';

// Screens
import HomeScreen from './src/screens/HomeScreenV2';
import TimelineScreen from './src/screens/TimelineScreen';
import GlossaryScreen from './src/screens/GlossaryScreen';
import FormsScreen from './src/screens/FormsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ComposerDetailScreen from './src/screens/ComposerDetailScreen';
import PeriodDetailScreen from './src/screens/PeriodDetailScreen';
import FormDetailScreen from './src/screens/FormDetailScreen';
import TermDetailScreen from './src/screens/TermDetailScreen';
import KickstartScreen from './src/screens/KickstartScreen';
import KickstartDayScreen from './src/screens/KickstartDayScreen';
import WeeklyAlbumScreen from './src/screens/WeeklyAlbumScreen';
import MonthlySpotlightScreen from './src/screens/MonthlySpotlightScreen';
import BadgesScreen from './src/screens/BadgesScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SearchScreen from './src/screens/SearchScreen';
import QuizScreen from './src/screens/QuizScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const { theme, isDark, isGlass } = useTheme();
  const t = theme;

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
        tabBarInactiveTintColor: isGlass ? '#3C3C43' : t.colors.textMuted,
        tabBarStyle: {
          backgroundColor: isGlass ? 'transparent' : t.colors.surface,
          borderTopColor: isGlass ? 'rgba(60, 60, 67, 0.12)' : t.colors.border,
          paddingTop: 8,
          height: 88,
          position: isGlass ? 'absolute' : 'relative',
        },
        tabBarBackground: isGlass ? () => (
          Platform.OS === 'ios' ? (
            <BlurView 
              intensity={100} 
              tint="light" 
              style={StyleSheet.absoluteFill} 
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]} />
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
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ headerShown: false }}
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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: t.colors.background }}>
        <ActivityIndicator size="large" color={t.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        initialRouteName={showOnboarding ? 'Kickstart' : 'MainTabs'}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <FavoritesProvider>
          <AudioProvider>
            <AppNavigator />
            <MiniPlayer />
          </AudioProvider>
        </FavoritesProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
