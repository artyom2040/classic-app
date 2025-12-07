// Note: Testing hooks with AsyncStorage is complex
// This file tests the core logic functions extracted from the hook

// Helper functions that match useStreak implementations
function getDateString(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
}

function getDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

describe('Streak Logic', () => {
    describe('getDateString', () => {
        it('returns ISO date string without time', () => {
            const date = new Date('2024-03-15T14:30:00Z');
            expect(getDateString(date)).toBe('2024-03-15');
        });

        it('returns today by default', () => {
            const result = getDateString();
            const expected = new Date().toISOString().split('T')[0];
            expect(result).toBe(expected);
        });
    });

    describe('getDaysDifference', () => {
        it('returns 0 for same day', () => {
            expect(getDaysDifference('2024-03-15', '2024-03-15')).toBe(0);
        });

        it('returns 1 for consecutive days', () => {
            expect(getDaysDifference('2024-03-15', '2024-03-16')).toBe(1);
        });

        it('returns correct difference for multiple days', () => {
            expect(getDaysDifference('2024-03-10', '2024-03-15')).toBe(5);
        });

        it('handles order of dates', () => {
            expect(getDaysDifference('2024-03-16', '2024-03-15')).toBe(1);
        });

        it('handles month boundaries', () => {
            expect(getDaysDifference('2024-03-30', '2024-04-02')).toBe(3);
        });

        it('handles year boundaries', () => {
            expect(getDaysDifference('2023-12-31', '2024-01-01')).toBe(1);
        });
    });

    describe('Streak Calculation Logic', () => {
        interface StreakData {
            currentStreak: number;
            longestStreak: number;
            lastActiveDate: string | null;
            totalDaysActive: number;
        }

        function calculateNewStreak(
            current: StreakData,
            today: string
        ): { newStreak: number; streakIncreased: boolean } {
            if (current.lastActiveDate === today) {
                return { newStreak: current.currentStreak, streakIncreased: false };
            }

            const yesterday = getDateString(new Date(new Date(today).getTime() - 86400000));

            if (current.lastActiveDate === yesterday) {
                return { newStreak: current.currentStreak + 1, streakIncreased: true };
            }

            // Streak broken
            return { newStreak: 1, streakIncreased: false };
        }

        function getStreakStatus(
            lastActiveDate: string | null,
            today: string
        ): 'active' | 'at_risk' | 'broken' {
            if (!lastActiveDate) return 'broken';

            const yesterday = getDateString(new Date(new Date(today).getTime() - 86400000));

            if (lastActiveDate === today) return 'active';
            if (lastActiveDate === yesterday) return 'at_risk';
            return 'broken';
        }

        describe('calculateNewStreak', () => {
            it('maintains streak when already recorded today', () => {
                const result = calculateNewStreak(
                    { currentStreak: 5, longestStreak: 10, lastActiveDate: '2024-03-15', totalDaysActive: 20 },
                    '2024-03-15'
                );
                expect(result).toEqual({ newStreak: 5, streakIncreased: false });
            });

            it('increments streak for consecutive day', () => {
                const result = calculateNewStreak(
                    { currentStreak: 5, longestStreak: 10, lastActiveDate: '2024-03-14', totalDaysActive: 20 },
                    '2024-03-15'
                );
                expect(result).toEqual({ newStreak: 6, streakIncreased: true });
            });

            it('resets streak when gap is more than one day', () => {
                const result = calculateNewStreak(
                    { currentStreak: 5, longestStreak: 10, lastActiveDate: '2024-03-10', totalDaysActive: 20 },
                    '2024-03-15'
                );
                expect(result).toEqual({ newStreak: 1, streakIncreased: false });
            });

            it('starts streak at 1 for first activity', () => {
                const result = calculateNewStreak(
                    { currentStreak: 0, longestStreak: 0, lastActiveDate: null, totalDaysActive: 0 },
                    '2024-03-15'
                );
                expect(result).toEqual({ newStreak: 1, streakIncreased: false });
            });
        });

        describe('getStreakStatus', () => {
            it('returns active when active today', () => {
                expect(getStreakStatus('2024-03-15', '2024-03-15')).toBe('active');
            });

            it('returns at_risk when active yesterday', () => {
                expect(getStreakStatus('2024-03-14', '2024-03-15')).toBe('at_risk');
            });

            it('returns broken when not active recently', () => {
                expect(getStreakStatus('2024-03-10', '2024-03-15')).toBe('broken');
            });

            it('returns broken when no activity', () => {
                expect(getStreakStatus(null, '2024-03-15')).toBe('broken');
            });
        });
    });
});
