import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getStorageItem, setStorageItem } from '../utils/storageUtils';

import { useTheme } from '../context/ThemeContext';
import { RootStackParamList } from '../types';
import { spacing, fontSize, borderRadius } from '../theme';
import { haptic } from '../utils/haptics';
import { getDayOfYear } from '../utils/storage';
import { getLongDefinition } from '../utils/terms';

// Import data
import composersData from '../data/composers.json';
import glossaryData from '../data/glossary.json';
import periodsData from '../data/periods.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const QUIZ_PROGRESS_KEY = 'daily_quiz_progress';

interface Question {
  id: string;
  type: 'composer' | 'term' | 'period';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface QuizProgress {
  lastPlayedDay: number;
  totalCorrect: number;
  totalPlayed: number;
  streak: number;
  bestStreak: number;
}

// Generate daily questions based on day of year
function generateQuestions(dayOfYear: number): Question[] {
  const questions: Question[] = [];
  const seed = dayOfYear;

  // Seeded random for consistent daily questions
  const seededRandom = (max: number, offset: number = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return Math.floor((x - Math.floor(x)) * max);
  };

  // Question 1: Composer identification
  const composerIdx = seededRandom(composersData.composers.length);
  const composer = composersData.composers[composerIdx];
  const wrongComposers = composersData.composers
    .filter((_, i) => i !== composerIdx)
    .slice(0, 3)
    .map(c => c.name);

  const composerOptions = [...wrongComposers, composer.name].sort(() => seededRandom(2, 1) - 0.5);
  questions.push({
    id: 'q1',
    type: 'composer',
    question: `Which composer is known for: "${composer.funFact}"?`,
    options: composerOptions,
    correctIndex: composerOptions.indexOf(composer.name),
    explanation: `${composer.name} (${composer.years}) was a ${composer.period} composer from ${composer.nationality}.`,
  });

  // Question 2: Term definition
  const termIdx = seededRandom(glossaryData.terms.length, 2);
  const term = glossaryData.terms[termIdx];
  const wrongTerms = glossaryData.terms
    .filter((_, i) => i !== termIdx)
    .slice(0, 3)
    .map(t => t.term);
  const termDefinition = getLongDefinition(term as any);

  const termOptions = [...wrongTerms, term.term].sort(() => seededRandom(2, 3) - 0.5);
  questions.push({
    id: 'q2',
    type: 'term',
    question: `What musical term means: "${termDefinition.substring(0, 100)}..."?`,
    options: termOptions,
    correctIndex: termOptions.indexOf(term.term),
    explanation: `"${term.term}" - ${termDefinition}`,
  });

  // Question 3: Period identification
  const periodIdx = seededRandom(periodsData.periods.length, 4);
  const period = periodsData.periods[periodIdx];
  const wrongPeriods = periodsData.periods
    .filter((_, i) => i !== periodIdx)
    .slice(0, 3)
    .map(p => p.name);

  const periodOptions = [...wrongPeriods, period.name].sort(() => seededRandom(2, 5) - 0.5);
  questions.push({
    id: 'q3',
    type: 'period',
    question: `Which musical era spans ${period.years}?`,
    options: periodOptions,
    correctIndex: periodOptions.indexOf(period.name),
    explanation: `The ${period.name} period (${period.years}): ${period.description.substring(0, 100)}...`,
  });

  // Question 4: Composer era
  const composer2Idx = seededRandom(composersData.composers.length, 6);
  const composer2 = composersData.composers[composer2Idx];
  const allPeriods = [...new Set(composersData.composers.map(c => c.period))];
  const wrongPeriods2 = allPeriods.filter(p => p !== composer2.period).slice(0, 3);

  const periodOptions2 = [...wrongPeriods2, composer2.period].sort(() => seededRandom(2, 7) - 0.5);
  questions.push({
    id: 'q4',
    type: 'composer',
    question: `In which era did ${composer2.name} compose?`,
    options: periodOptions2,
    correctIndex: periodOptions2.indexOf(composer2.period),
    explanation: `${composer2.name} was a ${composer2.period} composer (${composer2.years}).`,
  });

  // Question 5: Term category
  const term2Idx = seededRandom(glossaryData.terms.length, 8);
  const term2 = glossaryData.terms[term2Idx];
  const allCategories = [...new Set(glossaryData.terms.map(t => t.category))];
  const wrongCategories = allCategories.filter(c => c !== term2.category).slice(0, 3);

  const categoryOptions = [...wrongCategories, term2.category].sort(() => seededRandom(2, 9) - 0.5);
  questions.push({
    id: 'q5',
    type: 'term',
    question: `"${term2.term}" belongs to which category?`,
    options: categoryOptions,
    correctIndex: categoryOptions.indexOf(term2.category),
    explanation: `"${term2.term}" is a ${term2.category} term.`,
  });

  return questions;
}

export default function QuizScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme, themeName } = useTheme();
  const t = theme;
  const isBrutal = themeName === 'neobrutalist';

  const dayOfYear = getDayOfYear();
  const questions = useMemo(() => generateQuestions(dayOfYear), [dayOfYear]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [progress, setProgress] = useState<QuizProgress | null>(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  // Load progress
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const prog = await getStorageItem<QuizProgress | null>(QUIZ_PROGRESS_KEY, null);
    if (prog) {
      setProgress(prog);
      if (prog.lastPlayedDay === dayOfYear) {
        setAlreadyPlayed(true);
      }
    }
  };

  const saveProgress = async (correct: number) => {
    const isConsecutive = progress ? progress.lastPlayedDay === dayOfYear - 1 : false;
    const newStreak = isConsecutive ? (progress?.streak || 0) + 1 : 1;

    const newProgress: QuizProgress = {
      lastPlayedDay: dayOfYear,
      totalCorrect: (progress?.totalCorrect || 0) + correct,
      totalPlayed: (progress?.totalPlayed || 0) + questions.length,
      streak: newStreak,
      bestStreak: Math.max(newStreak, progress?.bestStreak || 0),
    };

    setProgress(newProgress);
    await setStorageItem(QUIZ_PROGRESS_KEY, newProgress);
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;

    setSelectedAnswer(index);
    setIsAnswered(true);

    const isCorrect = index === questions[currentQuestion].correctIndex;
    if (isCorrect) {
      setScore(s => s + 1);
      haptic('success');
    } else {
      haptic('error');
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();

      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizComplete(true);
      saveProgress(score + (selectedAnswer === questions[currentQuestion].correctIndex ? 1 : 0));
    }
  };

  const question = questions[currentQuestion];

  const cardStyle = {
    backgroundColor: t.colors.surface,
    borderRadius: borderRadius.lg,
    ...(isBrutal ? { borderWidth: 2, borderColor: t.colors.border } : t.shadows.md),
  };

  // Already played today
  if (alreadyPlayed && !quizComplete) {
    return (
      <View style={[styles.container, { backgroundColor: t.colors.background, paddingTop: insets.top }]}>
        <View style={styles.alreadyPlayed}>
          <Ionicons name="checkmark-circle" size={64} color={t.colors.success} />
          <Text style={[styles.alreadyPlayedTitle, { color: t.colors.text }]}>Quiz Completed!</Text>
          <Text style={[styles.alreadyPlayedText, { color: t.colors.textSecondary }]}>
            You've already completed today's quiz. Come back tomorrow for new questions!
          </Text>

          {progress && (
            <View style={[styles.statsCard, cardStyle, { marginTop: spacing.lg }]}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: t.colors.primary }]}>{progress.streak}</Text>
                  <Text style={[styles.statLabel, { color: t.colors.textMuted }]}>Day Streak</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: t.colors.secondary }]}>{progress.bestStreak}</Text>
                  <Text style={[styles.statLabel, { color: t.colors.textMuted }]}>Best Streak</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: t.colors.success }]}>
                    {Math.round((progress.totalCorrect / progress.totalPlayed) * 100)}%
                  </Text>
                  <Text style={[styles.statLabel, { color: t.colors.textMuted }]}>Accuracy</Text>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: t.colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Quiz complete
  if (quizComplete) {
    const finalScore = score + (selectedAnswer === questions[questions.length - 1].correctIndex ? 1 : 0);
    const percentage = Math.round((finalScore / questions.length) * 100);

    return (
      <View style={[styles.container, { backgroundColor: t.colors.background, paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.completeContent}>
          <View style={styles.completeHeader}>
            <Ionicons
              name={percentage >= 80 ? 'trophy' : percentage >= 50 ? 'thumbs-up' : 'refresh'}
              size={64}
              color={percentage >= 80 ? t.colors.warning : percentage >= 50 ? t.colors.success : t.colors.primary}
            />
            <Text style={[styles.completeTitle, { color: t.colors.text }]}>
              {percentage >= 80 ? 'Excellent!' : percentage >= 50 ? 'Good Job!' : 'Keep Learning!'}
            </Text>
            <Text style={[styles.completeScore, { color: t.colors.primary }]}>
              {finalScore} / {questions.length}
            </Text>
            <Text style={[styles.completePercent, { color: t.colors.textSecondary }]}>
              {percentage}% correct
            </Text>
          </View>

          {progress && (
            <View style={[styles.statsCard, cardStyle]}>
              <Text style={[styles.statsTitle, { color: t.colors.text }]}>Your Stats</Text>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: t.colors.primary }]}>{progress.streak}</Text>
                  <Text style={[styles.statLabel, { color: t.colors.textMuted }]}>Day Streak 🔥</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: t.colors.success }]}>
                    {Math.round((progress.totalCorrect / progress.totalPlayed) * 100)}%
                  </Text>
                  <Text style={[styles.statLabel, { color: t.colors.textMuted }]}>All-Time</Text>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: t.colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: t.colors.background, paddingTop: insets.top }]}>
      {/* Header with close button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: t.colors.surfaceLight }]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Close quiz"
        >
          <Ionicons name="close" size={24} color={t.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: t.colors.text }]}>Daily Quiz</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: t.colors.surfaceLight }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: t.colors.primary,
                width: `${((currentQuestion + 1) / questions.length) * 100}%`
              }
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: t.colors.textMuted }]}>
          {currentQuestion + 1} / {questions.length}
        </Text>
      </View>

      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        {/* Question */}
        <View style={[styles.questionCard, cardStyle]}>
          <View style={[styles.questionType, { backgroundColor: t.colors.primary + '20' }]}>
            <Ionicons
              name={question.type === 'composer' ? 'person' : question.type === 'term' ? 'book' : 'time'}
              size={16}
              color={t.colors.primary}
            />
            <Text style={[styles.questionTypeText, { color: t.colors.primary }]}>
              {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
            </Text>
          </View>
          <Text style={[styles.questionText, { color: t.colors.text }]}>{question.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correctIndex;
            const showResult = isAnswered;

            let optionStyle = { backgroundColor: t.colors.surface };
            let textColor = t.colors.text;

            if (showResult) {
              if (isCorrect) {
                optionStyle = { backgroundColor: t.colors.success + '20' };
                textColor = t.colors.success;
              } else if (isSelected && !isCorrect) {
                optionStyle = { backgroundColor: t.colors.error + '20' };
                textColor = t.colors.error;
              }
            } else if (isSelected) {
              optionStyle = { backgroundColor: t.colors.primary + '20' };
              textColor = t.colors.primary;
            }

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.option,
                  cardStyle,
                  optionStyle,
                  showResult && isCorrect && { borderColor: t.colors.success, borderWidth: 2 },
                  showResult && isSelected && !isCorrect && { borderColor: t.colors.error, borderWidth: 2 },
                ]}
                onPress={() => handleAnswer(index)}
                disabled={isAnswered}
              >
                <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                {showResult && isCorrect && (
                  <Ionicons name="checkmark-circle" size={24} color={t.colors.success} />
                )}
                {showResult && isSelected && !isCorrect && (
                  <Ionicons name="close-circle" size={24} color={t.colors.error} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation */}
        {isAnswered && (
          <View style={[styles.explanationCard, { backgroundColor: t.colors.surfaceLight }]}>
            <Ionicons name="bulb" size={20} color={t.colors.secondary} />
            <Text style={[styles.explanationText, { color: t.colors.textSecondary }]}>
              {question.explanation}
            </Text>
          </View>
        )}

        {/* Next button */}
        {isAnswered && (
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: t.colors.primary }]}
            onPress={nextQuestion}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '600' },
  progressContainer: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  progressBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: fontSize.sm, fontWeight: '600' },

  questionContainer: { flex: 1, padding: spacing.md },
  questionCard: { padding: spacing.lg, marginBottom: spacing.lg },
  questionType: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm, marginBottom: spacing.md },
  questionTypeText: { fontSize: fontSize.sm, fontWeight: '600' },
  questionText: { fontSize: fontSize.lg, fontWeight: '600', lineHeight: 26 },

  optionsContainer: { gap: spacing.sm },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  optionText: { fontSize: fontSize.md, flex: 1 },

  explanationCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.md },
  explanationText: { flex: 1, fontSize: fontSize.sm, lineHeight: 20 },

  nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.md, borderRadius: borderRadius.lg, marginTop: spacing.lg, gap: spacing.sm },
  nextButtonText: { color: '#fff', fontSize: fontSize.md, fontWeight: '600' },

  alreadyPlayed: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  alreadyPlayedTitle: { fontSize: fontSize.xxl, fontWeight: 'bold', marginTop: spacing.md },
  alreadyPlayedText: { fontSize: fontSize.md, textAlign: 'center', marginTop: spacing.sm },

  completeContent: { flexGrow: 1, padding: spacing.lg },
  completeHeader: { alignItems: 'center', marginBottom: spacing.xl },
  completeTitle: { fontSize: fontSize.xxl, fontWeight: 'bold', marginTop: spacing.md },
  completeScore: { fontSize: 48, fontWeight: 'bold', marginTop: spacing.sm },
  completePercent: { fontSize: fontSize.lg, marginTop: spacing.xs },

  statsCard: { padding: spacing.lg, marginBottom: spacing.lg },
  statsTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md, textAlign: 'center' },
  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: fontSize.xxl, fontWeight: 'bold' },
  statLabel: { fontSize: fontSize.sm, marginTop: 4 },

  backButton: { padding: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', marginTop: spacing.md },
  backButtonText: { color: '#fff', fontSize: fontSize.md, fontWeight: '600' },
});
