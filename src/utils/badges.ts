import { differenceInDays, parseISO } from 'date-fns';
import type { WorkEntry } from '../types';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Badge {
    id: string;
    type: 'streak' | 'earnings';
    tier: BadgeTier;
    labelKey: string; // Translation key
    icon: string;
}

export const getStreakBadge = (entries: WorkEntry[], periodStart: Date, periodEnd: Date): Badge | null => {
    // Filter entries within period and sort by date
    const sortedDates = entries
        .map(e => parseISO(e.date))
        .filter(d => d >= periodStart && d <= periodEnd)
        .sort((a, b) => a.getTime() - b.getTime());

    if (sortedDates.length === 0) return null;

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 0; i < sortedDates.length - 1; i++) {
        const diff = differenceInDays(sortedDates[i + 1], sortedDates[i]);
        if (diff === 1) {
            currentStreak++;
        } else if (diff > 1) {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 1;
        }
    }
    maxStreak = Math.max(maxStreak, currentStreak);

    if (maxStreak >= 5) {
        return { id: 'streak-gold', type: 'streak', tier: 'gold', labelKey: 'badges.streakGold', icon: 'flame' };
    } else if (maxStreak === 4) {
        return { id: 'streak-silver', type: 'streak', tier: 'silver', labelKey: 'badges.streakSilver', icon: 'flame' };
    } else if (maxStreak === 3) {
        return { id: 'streak-bronze', type: 'streak', tier: 'bronze', labelKey: 'badges.streakBronze', icon: 'flame' };
    }

    return null;
};

export const getEarningsBadge = (totalEarnings: number): Badge | null => {
    if (totalEarnings >= 160000) {
        return { id: 'earn-platinum', type: 'earnings', tier: 'platinum', labelKey: 'badges.earnPlatinum', icon: 'trophy' };
    } else if (totalEarnings >= 130000) {
        return { id: 'earn-gold', type: 'earnings', tier: 'gold', labelKey: 'badges.earnGold', icon: 'trophy' };
    } else if (totalEarnings >= 100000) {
        return { id: 'earn-silver', type: 'earnings', tier: 'silver', labelKey: 'badges.earnSilver', icon: 'trophy' };
    } else if (totalEarnings >= 70000) {
        return { id: 'earn-bronze', type: 'earnings', tier: 'bronze', labelKey: 'badges.earnBronze', icon: 'trophy' };
    }
    return null;
};
