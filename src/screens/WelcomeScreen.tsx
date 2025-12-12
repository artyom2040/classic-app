import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import { ERA_IMAGES } from '../utils/images';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WelcomeScreen() {
    const { theme: t } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();

    const handleStart = () => {
        // Navigate to main app or kickstart
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: '#161022' }]}>
            {/* Background Image Layer */}
            <ImageBackground
                source={ERA_IMAGES.romantic} // Using romantic era image as fluid abstract art
                style={styles.backgroundImage}
                imageStyle={{ opacity: 0.9 }}
                resizeMode="cover"
            >
                {/* Deep violet gradient overlay */}
                <LinearGradient
                    colors={['rgba(84, 23, 207, 0.2)', 'rgba(22, 16, 34, 0.8)', '#161022']}
                    locations={[0, 0.5, 1]}
                    style={styles.gradient}
                />
            </ImageBackground>

            {/* Bottom gradient for text legibility */}
            <LinearGradient
                colors={['transparent', 'rgba(22, 16, 34, 0.9)', '#161022']}
                locations={[0, 0.3, 1]}
                style={styles.bottomGradient}
            />

            {/* Header / Logo Area */}
            <View style={[styles.logoContainer, { paddingTop: insets.top + 56 }]}>
                <View style={styles.logoCircle}>
                    <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.9)" />
                </View>
            </View>

            {/* Main Content Area */}
            <View style={[styles.contentContainer, { paddingBottom: insets.bottom + 32 }]}>
                {/* Headline Text */}
                <View style={styles.headlineContainer}>
                    <Text style={styles.headlineItalic}>The Why</Text>
                    <Text style={styles.headlineBold}>Behind the Sound</Text>
                </View>

                {/* Body Text */}
                <Text style={styles.bodyText}>
                    Move beyond the melody. Discover the hidden architecture of the world's greatest masterpieces.
                </Text>

                {/* Primary CTA Button */}
                <View style={styles.ctaContainer}>
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={handleStart}
                        activeOpacity={0.9}
                    >
                        <View style={styles.ctaButtonInner}>
                            <Text style={styles.ctaText}>Start Listening</Text>
                            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Pagination/Progress Indicators */}
                <View style={styles.pagination}>
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT * 0.85,
    },
    gradient: {
        flex: 1,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT * 0.66,
    },
    logoContainer: {
        flex: 1,
        alignItems: 'center',
    },
    logoCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        // Backdrop blur effect (works on web, limited on native)
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
    },
    contentContainer: {
        paddingHorizontal: 24,
    },
    headlineContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    headlineItalic: {
        fontFamily: 'System',
        fontSize: 48,
        fontWeight: '300',
        fontStyle: 'italic',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    headlineBold: {
        fontFamily: 'System',
        fontSize: 48,
        fontWeight: '500',
        color: '#FFFFFF',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    bodyText: {
        fontSize: 18,
        fontWeight: '400',
        lineHeight: 28,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        maxWidth: 320,
        alignSelf: 'center',
        marginBottom: 48,
        letterSpacing: 0.3,
    },
    ctaContainer: {
        width: '100%',
        maxWidth: 360,
        alignSelf: 'center',
        paddingHorizontal: 8,
        marginBottom: 32,
    },
    ctaButton: {
        backgroundColor: '#5417cf',
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#5417cf',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 32,
        elevation: 12,
    },
    ctaButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ctaText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    dotActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
    },
});
