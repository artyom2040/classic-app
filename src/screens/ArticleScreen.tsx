import React, { useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { spacing, fontSize, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { RootStackParamList } from '../types';
import { ScreenContainer, ScreenHeader } from '../components/ui';

import articlesData from '../data/articles.json';

type ArticleRouteProp = RouteProp<RootStackParamList, 'Article'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ContentBlock {
    type: 'paragraph' | 'heading' | 'quote';
    text: string;
    attribution?: string;
}

interface Article {
    id: string;
    title: string;
    category: string;
    author: string;
    publishDate: string;
    readTime: string;
    excerpt: string;
    content: ContentBlock[];
    relatedComposerId?: string;
}

export default function ArticleScreen() {
    const route = useRoute<ArticleRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const { theme: t, isDark } = useTheme();
    const { isDesktop, maxContentWidth } = useResponsive();
    const { articleId } = route.params;

    const articles = articlesData.articles as Article[];

    // Find current article and its index
    const { article, currentIndex, previousArticle, nextArticle } = useMemo(() => {
        const idx = articles.findIndex(a => a.id === articleId);
        return {
            article: articles[idx],
            currentIndex: idx,
            previousArticle: idx > 0 ? articles[idx - 1] : null,
            nextArticle: idx < articles.length - 1 ? articles[idx + 1] : null,
        };
    }, [articleId, articles]);

    if (!article) {
        return (
            <ScreenContainer>
                <ScreenHeader title="Article" />
                <Text style={[styles.errorText, { color: t.colors.error }]}>Article not found</Text>
            </ScreenContainer>
        );
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderContentBlock = (block: ContentBlock, index: number) => {
        switch (block.type) {
            case 'heading':
                return (
                    <Text
                        key={index}
                        style={[styles.contentHeading, { color: t.colors.text }]}
                    >
                        {block.text}
                    </Text>
                );
            case 'quote':
                return (
                    <View
                        key={index}
                        style={[styles.quoteBlock, { borderLeftColor: t.colors.primary, backgroundColor: t.colors.primary + '10' }]}
                    >
                        <Ionicons name="chatbubble-outline" size={20} color={t.colors.primary} style={styles.quoteIcon} />
                        <Text style={[styles.quoteText, { color: t.colors.text }]}>"{block.text}"</Text>
                        {block.attribution && (
                            <Text style={[styles.quoteAttribution, { color: t.colors.textSecondary }]}>
                                — {block.attribution}
                            </Text>
                        )}
                    </View>
                );
            case 'paragraph':
            default:
                return (
                    <Text
                        key={index}
                        style={[styles.paragraph, { color: t.colors.textSecondary }]}
                    >
                        {block.text}
                    </Text>
                );
        }
    };

    return (
        <ScreenContainer padded={false}>
            <ScreenHeader title="" transparent />
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    isDesktop && { maxWidth: maxContentWidth, alignSelf: 'center', width: '100%' }
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Article Header */}
                <View style={styles.header}>
                    {/* Category & Read Time */}
                    <View style={styles.meta}>
                        <View style={[styles.categoryBadge, { backgroundColor: t.colors.primary + '20' }]}>
                            <Text style={[styles.categoryText, { color: t.colors.primary }]}>
                                {article.category}
                            </Text>
                        </View>
                        <View style={styles.readTimeContainer}>
                            <Ionicons name="time-outline" size={14} color={t.colors.textMuted} />
                            <Text style={[styles.readTimeText, { color: t.colors.textMuted }]}>
                                {article.readTime}
                            </Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: t.colors.text }]}>
                        {article.title}
                    </Text>

                    {/* Author & Date */}
                    <View style={styles.authorRow}>
                        <View style={[styles.authorAvatar, { backgroundColor: t.colors.primary + '30' }]}>
                            <Ionicons name="person" size={16} color={t.colors.primary} />
                        </View>
                        <View>
                            <Text style={[styles.authorName, { color: t.colors.text }]}>{article.author}</Text>
                            <Text style={[styles.publishDate, { color: t.colors.textMuted }]}>
                                {formatDate(article.publishDate)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: t.colors.border }]} />

                {/* Article Content */}
                <View style={styles.articleBody}>
                    {article.content.map((block, index) => renderContentBlock(block, index))}
                </View>

                {/* Related Composer Link */}
                {article.relatedComposerId && (
                    <TouchableOpacity
                        style={[styles.relatedCard, { backgroundColor: t.colors.surface }]}
                        onPress={() => navigation.navigate('ComposerDetail', { composerId: article.relatedComposerId! })}
                    >
                        <View style={[styles.relatedIcon, { backgroundColor: t.colors.primary + '20' }]}>
                            <Ionicons name="person" size={20} color={t.colors.primary} />
                        </View>
                        <View style={styles.relatedContent}>
                            <Text style={[styles.relatedLabel, { color: t.colors.textMuted }]}>Learn more about</Text>
                            <Text style={[styles.relatedName, { color: t.colors.text }]}>
                                {article.relatedComposerId.charAt(0).toUpperCase() + article.relatedComposerId.slice(1)}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={t.colors.textMuted} />
                    </TouchableOpacity>
                )}

                {/* Navigation to Previous/Next Articles */}
                <View style={styles.articleNavigation}>
                    {previousArticle ? (
                        <TouchableOpacity
                            style={[styles.navButton, styles.prevButton, { backgroundColor: t.colors.surface }]}
                            onPress={() => navigation.replace('Article', { articleId: previousArticle.id })}
                        >
                            <Ionicons name="arrow-back" size={18} color={t.colors.primary} />
                            <View style={styles.navContent}>
                                <Text style={[styles.navLabel, { color: t.colors.textMuted }]}>Previous Article</Text>
                                <Text style={[styles.navTitle, { color: t.colors.text }]} numberOfLines={2}>
                                    {previousArticle.title}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.navPlaceholder} />
                    )}

                    {nextArticle && (
                        <TouchableOpacity
                            style={[styles.navButton, styles.nextButton, { backgroundColor: t.colors.surface }]}
                            onPress={() => navigation.replace('Article', { articleId: nextArticle.id })}
                        >
                            <View style={[styles.navContent, { alignItems: 'flex-end' }]}>
                                <Text style={[styles.navLabel, { color: t.colors.textMuted }]}>Next Article</Text>
                                <Text style={[styles.navTitle, { color: t.colors.text, textAlign: 'right' }]} numberOfLines={2}>
                                    {nextArticle.title}
                                </Text>
                            </View>
                            <Ionicons name="arrow-forward" size={18} color={t.colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ height: spacing.xxl * 2 }} />
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    content: { padding: spacing.md },
    errorText: { fontSize: fontSize.lg, textAlign: 'center', marginTop: spacing.xxl },

    // Header
    header: {
        marginBottom: spacing.lg,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    categoryBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
    },
    readTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readTimeText: {
        fontSize: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 36,
        marginBottom: spacing.md,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    authorAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    authorName: {
        fontSize: fontSize.md,
        fontWeight: '600',
    },
    publishDate: {
        fontSize: fontSize.sm,
        marginTop: 2,
    },

    // Divider
    divider: {
        height: 1,
        marginBottom: spacing.lg,
    },

    // Article Body
    articleBody: {
        marginBottom: spacing.xl,
    },
    paragraph: {
        fontSize: 17,
        lineHeight: 28,
        marginBottom: spacing.lg,
    },
    contentHeading: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    quoteBlock: {
        borderLeftWidth: 4,
        paddingLeft: spacing.md,
        paddingVertical: spacing.md,
        paddingRight: spacing.md,
        marginVertical: spacing.lg,
        borderRadius: borderRadius.md,
    },
    quoteIcon: {
        marginBottom: spacing.xs,
    },
    quoteText: {
        fontSize: 18,
        fontStyle: 'italic',
        lineHeight: 28,
    },
    quoteAttribution: {
        fontSize: fontSize.md,
        marginTop: spacing.sm,
        fontWeight: '500',
    },

    // Related Card
    relatedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xl,
        gap: spacing.md,
    },
    relatedIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    relatedContent: {
        flex: 1,
    },
    relatedLabel: {
        fontSize: fontSize.sm,
    },
    relatedName: {
        fontSize: fontSize.lg,
        fontWeight: '600',
    },

    // Article Navigation
    articleNavigation: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    navButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
    },
    prevButton: {},
    nextButton: {
        justifyContent: 'flex-end',
    },
    navPlaceholder: {
        flex: 1,
    },
    navContent: {
        flex: 1,
    },
    navLabel: {
        fontSize: fontSize.xs,
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    navTitle: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        lineHeight: 18,
    },
});
