import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { RootStackParamList } from '../../types';
import { getGuideById, GuideAnnotation } from './data';

// Conditionally import YouTube player for native only
let YoutubePlayer: any = null;
if (Platform.OS !== 'web') {
    YoutubePlayer = require('react-native-youtube-iframe').default;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'ListeningGuidePlayer'>;

const annotationIcons: Record<GuideAnnotation['type'], keyof typeof Ionicons.glyphMap> = {
    theme: 'musical-notes',
    instrument: 'radio',
    dynamics: 'pulse',
    structure: 'layers',
    history: 'time',
};

const annotationColors: Record<GuideAnnotation['type'], string> = {
    theme: '#8B5CF6',
    instrument: '#3B82F6',
    dynamics: '#EF4444',
    structure: '#22C55E',
    history: '#F59E0B',
};

// Web-specific YouTube embed component
function WebYouTubePlayer({
    videoId,
    onTimeUpdate,
    onPlay,
    onPause,
}: {
    videoId: string;
    onTimeUpdate?: (time: number) => void;
    onPlay?: () => void;
    onPause?: () => void;
}) {
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const { width } = useWindowDimensions();
    const playerWidth = Math.min(width - 32, 800);
    const playerHeight = Math.round(playerWidth * 9 / 16);

    // We can't easily get time from YouTube iframe API without complex postMessage setup
    // So for web, we'll use a simpler approach with manual time tracking

    return (
        <View style={[webStyles.playerWrapper, { width: playerWidth, height: playerHeight }]}>
            <iframe
                ref={iframeRef as any}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: 12 }}
            />
        </View>
    );
}

const webStyles = StyleSheet.create({
    playerWrapper: {
        alignSelf: 'center',
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
});

export default function ListeningGuidePlayerScreen() {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();
    const { theme, themeName, isDark } = useTheme();
    const { isDesktop, maxContentWidth } = useResponsive();
    const { width } = useWindowDimensions();
    const t = theme;
    const isBrutal = false;
    const isWeb = Platform.OS === 'web';

    const playerRef = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [activeAnnotationIndex, setActiveAnnotationIndex] = useState(0);
    const [manualTimeOffset, setManualTimeOffset] = useState(0);

    // Refs to track state inside interval callbacks without causing recreation
    const isPlayingRef = useRef(isPlaying);
    isPlayingRef.current = isPlaying;

    const guide = getGuideById(route.params?.guideId ?? '');

    // Calculate player dimensions
    const contentWidth = Math.min(width - 32, maxContentWidth);
    const playerHeight = isWeb ? Math.round(contentWidth * 9 / 16) : 220;

    // For native: Update current time periodically (stable interval)
    useEffect(() => {
        if (isWeb) return; // Skip for web

        const interval = setInterval(async () => {
            if (playerRef.current && isPlayingRef.current) {
                try {
                    const time = await playerRef.current.getCurrentTime();
                    setCurrentTime(time);
                } catch {
                    // Player might not be ready
                }
            }
        }, 500);

        return () => clearInterval(interval);
    }, [isWeb]); // Only depends on isWeb, not isPlaying

    // For web: Manual time tracking when "playing"
    useEffect(() => {
        if (!isWeb) return;

        const interval = setInterval(() => {
            if (isPlayingRef.current) {
                setCurrentTime(prev => prev + 1);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isWeb]); // Only depends on isWeb, not isPlaying

    // Update active annotation based on current time
    useEffect(() => {
        if (!guide) return;

        const annotations = guide.annotations;
        let newIndex = 0;

        for (let i = annotations.length - 1; i >= 0; i--) {
            if (currentTime >= annotations[i].timestamp) {
                newIndex = i;
                break;
            }
        }

        setActiveAnnotationIndex(newIndex);
    }, [currentTime, guide]);

    const onStateChange = useCallback((state: string) => {
        if (state === 'playing') {
            setIsPlaying(true);
        } else if (state === 'paused' || state === 'ended') {
            setIsPlaying(false);
        }
    }, []);

    const seekToAnnotation = useCallback((timestamp: number) => {
        if (isWeb) {
            // For web, just update the time display
            setCurrentTime(timestamp);
        } else {
            playerRef.current?.seekTo(timestamp, true);
        }
    }, [isWeb]);

    const togglePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!guide) {
        return (
            <View style={[styles.container, { backgroundColor: t.colors.background }]}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={48} color={t.colors.error} />
                    <Text style={[styles.errorText, { color: t.colors.text }]}>Guide not found</Text>
                    <TouchableOpacity
                        style={[styles.backButtonLarge, { backgroundColor: t.colors.primary }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: t.colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: t.colors.surfaceLight }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={20} color={t.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: t.colors.text }]} numberOfLines={1}>
                        {guide.workTitle}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: t.colors.textSecondary }]}>
                        {guide.composerName}
                    </Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    isDesktop && { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* YouTube Player */}
                <View style={[
                    styles.playerContainer,
                    { backgroundColor: '#000' },
                    isBrutal && { borderWidth: 2, borderColor: t.colors.text }
                ]}>
                    {isWeb ? (
                        <WebYouTubePlayer
                            videoId={guide.youtubeVideoId}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />
                    ) : YoutubePlayer ? (
                        <YoutubePlayer
                            ref={playerRef}
                            height={playerHeight}
                            width={contentWidth}
                            videoId={guide.youtubeVideoId}
                            play={isPlaying}
                            onChangeState={onStateChange}
                            initialPlayerParams={{
                                start: guide.youtubeStartTime || 0,
                                controls: true,
                                modestbranding: true,
                            }}
                        />
                    ) : null}
                </View>

                {/* Web: Manual Play/Pause + Time Sync Controls */}
                {isWeb && (
                    <View style={[styles.webControls, { backgroundColor: t.colors.surface }]}>
                        <TouchableOpacity
                            style={[styles.playButton, { backgroundColor: t.colors.primary }]}
                            onPress={togglePlayPause}
                        >
                            <Ionicons
                                name={isPlaying ? 'pause' : 'play'}
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                        <View style={styles.webControlsInfo}>
                            <Text style={[styles.webControlsLabel, { color: t.colors.text }]}>
                                Annotation Timer
                            </Text>
                            <Text style={[styles.webControlsHint, { color: t.colors.textMuted }]}>
                                Start timer when you press play on YouTube above
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.resetButton, { borderColor: t.colors.border }]}
                            onPress={() => setCurrentTime(0)}
                        >
                            <Ionicons name="refresh" size={18} color={t.colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Now Playing / Progress */}
                <View style={[styles.progressSection, { backgroundColor: t.colors.surface }]}>
                    <View style={styles.progressHeader}>
                        <Text style={[styles.nowPlayingLabel, { color: t.colors.textMuted }]}>
                            {isPlaying ? '▶ Playing' : '⏸ Paused'}
                        </Text>
                        <Text style={[styles.timeDisplay, { color: t.colors.text }]}>
                            {formatTime(currentTime)} / {formatTime(guide.duration)}
                        </Text>
                    </View>

                    {/* Progress bar */}
                    <View style={[styles.progressBar, { backgroundColor: t.colors.border }]}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    backgroundColor: t.colors.primary,
                                    width: `${Math.min((currentTime / guide.duration) * 100, 100)}%`
                                }
                            ]}
                        />
                        {/* Annotation markers */}
                        {guide.annotations.map((annotation, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.annotationMarker,
                                    {
                                        left: `${(annotation.timestamp / guide.duration) * 100}%`,
                                        backgroundColor: annotationColors[annotation.type],
                                    }
                                ]}
                                onPress={() => seekToAnnotation(annotation.timestamp)}
                            />
                        ))}
                    </View>
                </View>

                {/* Annotations Timeline */}
                <Text style={[styles.sectionTitle, { color: t.colors.text }]}>
                    🎧 Listening Points
                </Text>

                {guide.annotations.map((annotation, index) => {
                    const isActive = index === activeAnnotationIndex;
                    const isPast = currentTime >= annotation.timestamp;
                    const color = annotationColors[annotation.type];

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.annotationCard,
                                { backgroundColor: t.colors.surface },
                                isActive && { borderLeftWidth: 4, borderLeftColor: color },
                                isBrutal && { borderWidth: 2, borderColor: t.colors.text },
                            ]}
                            onPress={() => seekToAnnotation(annotation.timestamp)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.annotationHeader}>
                                <View style={[styles.annotationIcon, { backgroundColor: color + '20' }]}>
                                    <Ionicons
                                        name={annotationIcons[annotation.type]}
                                        size={16}
                                        color={color}
                                    />
                                </View>
                                <TouchableOpacity
                                    style={[styles.timestampButton, { backgroundColor: t.colors.background }]}
                                    onPress={() => seekToAnnotation(annotation.timestamp)}
                                >
                                    <Ionicons name="play" size={10} color={t.colors.primary} />
                                    <Text style={[styles.timestamp, { color: t.colors.primary }]}>
                                        {formatTime(annotation.timestamp)}
                                    </Text>
                                </TouchableOpacity>
                                {isPast && (
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={16}
                                        color={t.colors.success || '#22C55E'}
                                        style={styles.checkmark}
                                    />
                                )}
                            </View>
                            <Text style={[
                                styles.annotationTitle,
                                { color: t.colors.text },
                                isActive && { fontWeight: '700' }
                            ]}>
                                {annotation.title}
                            </Text>
                            <Text style={[styles.annotationDescription, { color: t.colors.textSecondary }]}>
                                {annotation.description}
                            </Text>
                        </TouchableOpacity>
                    );
                })}

                <View style={{ height: 48 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        gap: spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContent: { flex: 1 },
    headerTitle: { fontSize: fontSize.lg, fontWeight: '700' },
    headerSubtitle: { fontSize: fontSize.sm, marginTop: 2 },
    scrollView: { flex: 1 },
    scrollContent: { padding: spacing.md, paddingTop: 0 },
    playerContainer: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    webControls: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    webControlsInfo: { flex: 1 },
    webControlsLabel: { fontSize: fontSize.md, fontWeight: '600' },
    webControlsHint: { fontSize: fontSize.xs, marginTop: 2 },
    resetButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressSection: {
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    nowPlayingLabel: { fontSize: fontSize.sm },
    timeDisplay: { fontSize: fontSize.sm, fontWeight: '600' },
    progressBar: {
        height: 8,
        borderRadius: 4,
        position: 'relative',
        overflow: 'visible',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    annotationMarker: {
        position: 'absolute',
        top: -2,
        width: 6,
        height: 12,
        borderRadius: 3,
        marginLeft: -3,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: '700',
        marginBottom: spacing.md,
    },
    annotationCard: {
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    annotationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    annotationIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timestampButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        gap: 4,
    },
    timestamp: { fontSize: fontSize.xs, fontWeight: '600' },
    checkmark: { marginLeft: 'auto' },
    annotationTitle: { fontSize: fontSize.md, fontWeight: '600', marginBottom: 4 },
    annotationDescription: { fontSize: fontSize.sm, lineHeight: 20 },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    errorText: { fontSize: fontSize.lg, fontWeight: '600', marginTop: spacing.md },
    backButtonLarge: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
    },
    backButtonText: { color: '#fff', fontSize: fontSize.md, fontWeight: '600' },
});
