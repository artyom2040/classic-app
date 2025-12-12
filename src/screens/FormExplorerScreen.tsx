/**
 * FormExplorerScreen - Artful form exploration with carousel
 * Inspired by stitch artful_form_explorer reference
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, MusicalForm } from '../types';
import { HorizontalCarousel, FormCard } from '../components/stitch';
import { NetworkImage } from '../components/NetworkImage';
import { ERA_IMAGES } from '../utils/images';
import formsData from '../data/forms.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Map form categories to era images
const FORM_IMAGES: Record<string, keyof typeof ERA_IMAGES> = {
    'sonata': 'romantic',
    'rondo': 'classical',
    'fugue': 'baroque',
    'theme-variations': 'baroque',
    'ternary': 'classical',
    'binary': 'baroque',
};

// Curated examples for the list
const CURATED_EXAMPLES = [
    { id: '1', title: 'Symphony No. 5', composer: 'Ludwig van Beethoven', form: 'Sonata Form' },
    { id: '2', title: 'Rondo Alla Turca', composer: 'W.A. Mozart', form: 'Rondo' },
    { id: '3', title: 'Little Fugue in G Minor', composer: 'J.S. Bach', form: 'Fugue' },
    { id: '4', title: 'Enigma Variations', composer: 'Edward Elgar', form: 'Theme & Variations' },
];

export default function FormExplorerScreen() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp>();

    const forms = formsData.forms as MusicalForm[];

    return (
        <View style={[styles.container, { backgroundColor: '#161022' }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Explorer</Text>
                    <TouchableOpacity style={styles.searchButton}>
                        <Ionicons name="search" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroLabel}>Form & Structure</Text>
                    <Text style={styles.heroTitle}>The Architecture{'\n'}of Sound</Text>
                    <Text style={styles.heroDescription}>
                        Musical form is the blueprint of sound. Explore the hidden structures that give classical music its narrative power.
                    </Text>
                </View>

                {/* Carousel Section */}
                <View style={styles.carouselSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Browse Forms</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <HorizontalCarousel cardWidth={288} gap={16}>
                        {forms.slice(0, 5).map((form, index) => (
                            <FormCard
                                key={form.id}
                                id={form.id}
                                name={form.name}
                                description={form.description || ''}
                                badge={index === 0 ? 'Core' : undefined}
                                imageKey={FORM_IMAGES[form.id] || 'baroque'}
                                onPress={() => navigation.navigate('FormDetail', { formId: form.id })}
                            />
                        ))}
                    </HorizontalCarousel>
                </View>

                {/* Curated Examples List */}
                <View style={styles.listSection}>
                    <Text style={styles.sectionTitle}>Curated Examples</Text>

                    <View style={styles.examplesList}>
                        {CURATED_EXAMPLES.map((example, index) => (
                            <TouchableOpacity
                                key={example.id}
                                style={[
                                    styles.exampleItem,
                                    index === 1 && styles.exampleItemActive,
                                ]}
                                activeOpacity={0.7}
                            >
                                {/* Album Art */}
                                <View style={styles.exampleArt}>
                                    <View style={styles.exampleArtInner}>
                                        <Ionicons name="musical-notes" size={20} color="rgba(255,255,255,0.7)" />
                                    </View>
                                    <View style={styles.playOverlay}>
                                        <Ionicons
                                            name={index === 1 ? 'pause' : 'play-circle'}
                                            size={24}
                                            color={index === 1 ? '#5417cf' : '#FFFFFF'}
                                        />
                                    </View>
                                </View>

                                {/* Info */}
                                <View style={styles.exampleInfo}>
                                    <Text style={[styles.exampleTitle, index === 1 && styles.exampleTitleActive]}>
                                        {example.title}
                                    </Text>
                                    <Text style={styles.exampleSubtitle}>
                                        {example.composer} • {example.form}
                                    </Text>
                                </View>

                                {/* Action */}
                                <TouchableOpacity style={styles.exampleAction}>
                                    <Ionicons
                                        name={index === 1 ? 'heart' : 'ellipsis-vertical'}
                                        size={24}
                                        color={index === 1 ? '#5417cf' : 'rgba(255,255,255,0.4)'}
                                    />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    backButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        opacity: 0.9,
    },
    searchButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroSection: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    heroLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#5417cf',
        textTransform: 'uppercase',
        fontStyle: 'italic',
        letterSpacing: 1,
        marginBottom: 8,
    },
    heroTitle: {
        fontSize: 42,
        fontWeight: '500',
        fontStyle: 'italic',
        color: '#FFFFFF',
        lineHeight: 46,
        letterSpacing: -0.5,
    },
    heroDescription: {
        fontSize: 18,
        fontWeight: '400',
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 28,
        marginTop: 16,
    },
    carouselSection: {
        marginTop: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        fontStyle: 'italic',
        color: '#FFFFFF',
    },
    viewAll: {
        fontSize: 14,
        color: '#5417cf',
        fontWeight: '500',
    },
    listSection: {
        paddingHorizontal: 24,
        paddingTop: 32,
    },
    examplesList: {
        marginTop: 16,
        gap: 8,
    },
    exampleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 16,
    },
    exampleItemActive: {
        backgroundColor: 'rgba(35, 27, 51, 0.4)',
        borderWidth: 1,
        borderColor: 'rgba(84, 23, 207, 0.2)',
    },
    exampleArt: {
        width: 56,
        height: 56,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    exampleArtInner: {
        flex: 1,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    exampleInfo: {
        flex: 1,
        minWidth: 0,
    },
    exampleTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    exampleTitleActive: {
        color: '#5417cf',
    },
    exampleSubtitle: {
        fontSize: 14,
        fontStyle: 'italic',
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 2,
    },
    exampleAction: {
        padding: 4,
    },
});
