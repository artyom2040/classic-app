import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    useWindowDimensions,
    FlatList,
    ViewToken,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import { ERA_IMAGES } from '../utils/images';
import { Display1, Quote, BodyLarge, EnhancedButton } from '../design-system';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Slide {
    id: string;
    titleLine1: string;
    titleLine2: string;
    body: string;
    image: any;
}

const slides: Slide[] = [
    {
        id: '1',
        titleLine1: 'The Why',
        titleLine2: 'Behind the Sound',
        body: 'Move beyond the melody. Discover the hidden architecture of the world\'s greatest masterpieces.',
        image: ERA_IMAGES.romantic,
    },
    {
        id: '2',
        titleLine1: 'Discover',
        titleLine2: 'Great Composers',
        body: 'From Bach to Shostakovich, explore the lives and works of history\'s greatest musical minds.',
        image: ERA_IMAGES.baroque,
    },
    {
        id: '3',
        titleLine1: 'Learn',
        titleLine2: 'Something New Daily',
        body: '5-minute lessons that fit your schedule. Build your musical knowledge one day at a time.',
        image: ERA_IMAGES.modern,
    },
];

export default function WelcomeScreen() {
    const { theme: t } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const autoplayRef = useRef<NodeJS.Timeout | null>(null);
    const isUserInteracting = useRef(false);

    // Autoplay carousel every 5 seconds
    useEffect(() => {
        const startAutoplay = () => {
            autoplayRef.current = setInterval(() => {
                if (!isUserInteracting.current) {
                    setActiveIndex((prev) => {
                        const nextIndex = (prev + 1) % slides.length;
                        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                        return nextIndex;
                    });
                }
            }, 5000);
        };

        startAutoplay();

        return () => {
            if (autoplayRef.current) {
                clearInterval(autoplayRef.current);
            }
        };
    }, []);

    // Pause autoplay when user interacts
    const handleScrollBeginDrag = () => {
        isUserInteracting.current = true;
    };

    const handleScrollEndDrag = () => {
        setTimeout(() => {
            isUserInteracting.current = false;
        }, 3000);
    };

    const handleStart = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
        });
    };

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setActiveIndex(viewableItems[0].index);
            }
        },
        []
    );

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    const scrollToIndex = (index: number) => {
        flatListRef.current?.scrollToIndex({ index, animated: true });
    };

    // Only render the scrollable content (image, title, subtitle)
    const renderSlide = ({ item }: { item: Slide }) => (
        <View style={[styles.slideContainer, { width: screenWidth }]}>
            {/* Background Image Layer - centered */}
            <ImageBackground
                source={item.image}
                style={styles.backgroundImage}
                imageStyle={styles.backgroundImageStyle}
                resizeMode="cover"
            >
                {/* Lighter gradient overlay */}
                <LinearGradient
                    colors={['rgba(84, 23, 207, 0.1)', 'rgba(22, 16, 34, 0.5)', '#161022']}
                    locations={[0, 0.6, 1]}
                    style={styles.gradient}
                />
            </ImageBackground>

            {/* Bottom gradient for text legibility - lighter */}
            <LinearGradient
                colors={['transparent', 'rgba(22, 16, 34, 0.7)', '#161022']}
                locations={[0, 0.4, 1]}
                style={[styles.bottomGradient, { height: screenHeight * 0.5 }]}
            />

            {/* Header / Logo Area */}
            <View style={[styles.logoContainer, { paddingTop: insets.top + 40 }]}>
                <View style={styles.logoCircle}>
                    <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.9)" />
                </View>
            </View>

            {/* Scrolling Content Area - only title and body */}
            <View style={styles.scrollContent}>
                {/* Headline Text - using design system typography */}
                <View style={styles.headlineContainer}>
                    <Quote color="#FFFFFF" style={styles.headlineItalic}>
                        {item.titleLine1}
                    </Quote>
                    <Display1 color="#FFFFFF" style={styles.headlineBold}>
                        {item.titleLine2}
                    </Display1>
                </View>

                {/* Body Text */}
                <BodyLarge color="rgba(255, 255, 255, 0.7)" style={styles.bodyText}>
                    {item.body}
                </BodyLarge>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: '#161022' }]}>
            {/* Scrollable Carousel - only content scrolls */}
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                bounces={false}
                onScrollBeginDrag={handleScrollBeginDrag}
                onScrollEndDrag={handleScrollEndDrag}
                getItemLayout={(_, index) => ({
                    length: screenWidth,
                    offset: screenWidth * index,
                    index,
                })}
            />

            {/* Stationary Bottom Section - CTA Button and Pagination */}
            <View style={[styles.stationaryBottom, { paddingBottom: insets.bottom + 32 }]}>
                {/* Primary CTA Button - using design system */}
                <View style={styles.ctaContainer}>
                    <EnhancedButton
                        title="Start Listening"
                        variant="gradient"
                        size="large"
                        icon="arrow-forward"
                        iconPosition="right"
                        fullWidth
                        onPress={handleStart}
                        style={styles.ctaButton}
                    />
                </View>

                {/* Pagination/Progress Indicators */}
                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => scrollToIndex(index)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <View
                                style={[
                                    styles.dot,
                                    activeIndex === index && styles.dotActive,
                                ]}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slideContainer: {
        flex: 1,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backgroundImageStyle: {
        // Center the image
        opacity: 0.95,
    },
    gradient: {
        flex: 1,
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
    },
    scrollContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 180, // Space for stationary button
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
        letterSpacing: 0.3,
    },
    // Stationary bottom section
    stationaryBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingTop: 16,
        // Subtle gradient background for legibility
        backgroundColor: 'transparent',
    },
    ctaContainer: {
        width: '100%',
        maxWidth: 360,
        paddingHorizontal: 24,
        marginBottom: 24,
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
        width: 8,
        height: 8,
        borderRadius: 4,
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
