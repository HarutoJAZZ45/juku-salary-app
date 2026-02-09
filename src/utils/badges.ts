import { differenceInDays, parseISO, startOfMonth, addMonths } from 'date-fns';
import type { WorkEntry, UserSettings } from '../types';
import { getPeriodRange, calculateDailyTotal } from './calculator';

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

// 期間内の連勤記録からバッジを判定して全て返す
export const getStreakBadges = (entries: WorkEntry[], periodStart: Date, periodEnd: Date): Badge[] => {
    // 期間内のエントリを日付順にソート
    const sortedDates = entries
        .map(e => parseISO(e.date))
        .filter(d => d >= periodStart && d <= periodEnd)
        .sort((a, b) => a.getTime() - b.getTime());

    if (sortedDates.length === 0) return [];

    const foundBadges: Badge[] = [];
    let currentStreakCount = 1;

    const addBadgeIfEligible = (streak: number) => {
        if (streak >= 5) {
            foundBadges.push({ id: `streak-gold-${Math.random()}`, type: 'streak', tier: 'gold', labelKey: 'badges.streakGold', descriptionKey: 'badges.streakDesc', icon: 'flame' });
        } else if (streak === 4) {
            foundBadges.push({ id: `streak-silver-${Math.random()}`, type: 'streak', tier: 'silver', labelKey: 'badges.streakSilver', descriptionKey: 'badges.streakDesc', icon: 'flame' });
        } else if (streak === 3) {
            foundBadges.push({ id: `streak-bronze-${Math.random()}`, type: 'streak', tier: 'bronze', labelKey: 'badges.streakBronze', descriptionKey: 'badges.streakDesc', icon: 'flame' });
        }
    };

    for (let i = 0; i < sortedDates.length - 1; i++) {
        const diff = differenceInDays(sortedDates[i + 1], sortedDates[i]);
        if (diff === 1) {
            currentStreakCount++;
        } else if (diff > 1) {
            addBadgeIfEligible(currentStreakCount);
            currentStreakCount = 1;
        }
    }
    // ループ終了後の最後の連勤分
    addBadgeIfEligible(currentStreakCount);

    return foundBadges;
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

// 全期間の獲得バッジ総数を計算する
export const calculateTotalBadges = (entries: Record<string, WorkEntry>, settings: UserSettings): { streak: number, earnings: number } => {
    let streakCount = 0;
    let earningsCount = 0;
    const entryDates = Object.keys(entries).sort();

    if (entryDates.length === 0) return { streak: 0, earnings: 0 };

    // 最初のエントリの日付から現在の翌月までを範囲とする（漏れがないように）
    const startDate = parseISO(entryDates[0]);
    const endDate = addMonths(new Date(), 1);

    let current = startOfMonth(startDate);

    while (current <= endDate) {
        // 締め日に基づく期間を取得
        const { start, end } = getPeriodRange(current, settings.closingDay);

        // この期間に含まれるエントリを抽出
        const periodEntries = Object.values(entries).filter(e => {
            const d = parseISO(e.date);
            return d >= start && d <= end;
        });

        // この期間の給与総額
        let periodTotalPay = 0;
        periodEntries.forEach(e => {
            periodTotalPay += calculateDailyTotal(e, settings);
        });

        // 獲得バッジ判定
        streakCount += getStreakBadges(periodEntries, start, end).length;

        if (getEarningsBadge(periodTotalPay)) {
            earningsCount++;
        }

        // 次の月へ
        current = addMonths(current, 1);
    }

    return { streak: streakCount, earnings: earningsCount };
};
