import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { WorkEntry, UserSettings, RankingData } from '../types';
import { getFiscalYear, getPeriodRange } from './calculator';

export const updateRankingStats = async (uid: string | undefined, entries: Record<string, WorkEntry>, settings: UserSettings) => {
    if (!uid) return;

    if (!settings.profile?.isPublicRankingEnabled) {
        // ランキング不参加の場合は、ランキングコレクションからデータを削除
        const rankRef = doc(db, 'rankings', uid);
        await deleteDoc(rankRef).catch(() => { });
        return;
    }

    const profile = settings.profile;

    const rankingData: RankingData = {
        uid,
        name: profile.name || 'ゲスト講師',
        avatarId: profile.avatarId || 'user',
        themeColor: profile.themeColor,
        activeTitle: profile.activeTitle,
        monthly: {},
        yearly: {},
        updatedAt: Date.now()
    };

    // Calculate aggregations
    Object.values(entries).forEach(entry => {
        // 対象月を決定
        const entryDate = new Date(entry.date);
        const { end } = getPeriodRange(entryDate, settings.closingDay);
        // Ex: "2024-04"
        const monthKey = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`;

        // 対象年度を決定
        const yearKey = getFiscalYear(entry.date).toString();

        const classesCount = (entry.selectedBlocks || []).length;
        const workDaysCount = (classesCount > 0 || entry.supportMinutes > 0) ? 1 : 0;

        if (classesCount === 0 && workDaysCount === 0) return;

        if (!rankingData.monthly[monthKey]) rankingData.monthly[monthKey] = { classes: 0, days: 0 };
        if (!rankingData.yearly[yearKey]) rankingData.yearly[yearKey] = { classes: 0, days: 0 };

        rankingData.monthly[monthKey].classes += classesCount;
        rankingData.monthly[monthKey].days += workDaysCount;

        rankingData.yearly[yearKey].classes += classesCount;
        rankingData.yearly[yearKey].days += workDaysCount;
    });

    const rankRef = doc(db, 'rankings', uid);
    await setDoc(rankRef, rankingData).catch(e => console.error("Ranking sync error: ", e));
};
