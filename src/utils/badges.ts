import { differenceInDays, parseISO } from 'date-fns';
import type { WorkEntry } from '../types';

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// バッジ定義インターフェース
export interface Badge {
    id: string;
    type: 'streak' | 'earnings'; // 連勤または給与
    tier: BadgeTier;
    labelKey: string; // 翻訳キー
    descriptionKey: string; // 説明文の翻訳キー
    icon: string;
}

// 期間内の連勤記録からバッジを判定して返す
export const getStreakBadge = (entries: WorkEntry[], periodStart: Date, periodEnd: Date): Badge | null => {
    // 期間内のエントリを日付順にソート
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
        return { id: 'streak-gold', type: 'streak', tier: 'gold', labelKey: 'badges.streakGold', descriptionKey: 'badges.streakDesc', icon: 'flame' };
    } else if (maxStreak === 4) {
        return { id: 'streak-silver', type: 'streak', tier: 'silver', labelKey: 'badges.streakSilver', descriptionKey: 'badges.streakDesc', icon: 'flame' };
    } else if (maxStreak === 3) {
        return { id: 'streak-bronze', type: 'streak', tier: 'bronze', labelKey: 'badges.streakBronze', descriptionKey: 'badges.streakDesc', icon: 'flame' };
    }

    return null;
};

// 給与総額からバッジを判定して返す
export const getEarningsBadge = (totalEarnings: number): Badge | null => {
    if (totalEarnings >= 160000) {
        return { id: 'earn-platinum', type: 'earnings', tier: 'platinum', labelKey: 'badges.earnPlatinum', descriptionKey: 'badges.earnPlatinumDesc', icon: 'trophy' };
    } else if (totalEarnings >= 130000) {
        return { id: 'earn-gold', type: 'earnings', tier: 'gold', labelKey: 'badges.earnGold', descriptionKey: 'badges.earnGoldDesc', icon: 'trophy' };
    } else if (totalEarnings >= 100000) {
        return { id: 'earn-silver', type: 'earnings', tier: 'silver', labelKey: 'badges.earnSilver', descriptionKey: 'badges.earnSilverDesc', icon: 'trophy' };
    } else if (totalEarnings >= 70000) {
        return { id: 'earn-bronze', type: 'earnings', tier: 'bronze', labelKey: 'badges.earnBronze', descriptionKey: 'badges.earnBronzeDesc', icon: 'trophy' };
    }
    return null;
};
