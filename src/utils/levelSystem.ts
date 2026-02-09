import type { WorkEntry, LevelData, UserSettings } from '../types';
import { calculateDailyTotal } from './calculator';

// レベルごとの必要XP計算 (nレベルに到達するのに必要な累積XP)
// 式: Level = 1 + sqrt(XP / 100) -> XP = 100 * (Level - 1)^2
// 例:
// Lv1: 0
// Lv2: 100
// Lv3: 400
// Lv4: 900
// Lv5: 1600
// Lv10: 8100
// Lv20: 36100
// Lv50: 240100
const getXpForLevel = (level: number): number => {
    if (level <= 1) return 0;
    return 100 * Math.pow(level - 1, 2);
};

const getLevelFromXp = (xp: number): number => {
    if (xp < 0) return 1;
    return Math.floor(Math.sqrt(xp / 100)) + 1;
};

// 称号の定義
export const TITLES = [
    { level: 1, text: "新人講師" },
    { level: 3, text: "駆け出し講師" },
    { level: 5, text: "一人前講師" },
    { level: 10, text: "ベテラン講師" },
    { level: 20, text: "カリスマ講師" },
    { level: 30, text: "教室長クラス" },
    { level: 50, text: "伝説の講師" },
    { level: 100, text: "塾の神様" }
];

export const getTitleForLevel = (level: number): string => {
    // 現在のレベル以下の最大のレベル条件を持つ称号を探す
    const match = [...TITLES].reverse().find(t => level >= t.level);
    return match ? match.text : TITLES[0].text;
};

export const calculateLevelData = (entries: Record<string, WorkEntry>, settings: UserSettings): LevelData => {
    let totalEarnings = 0;
    let totalClasses = 0;
    let totalWorkDays = 0; // 勤務日数

    Object.values(entries).forEach(entry => {
        // 給与計算
        const dailyPay = calculateDailyTotal(entry, settings);
        totalEarnings += dailyPay;

        // コマ数
        if (entry.selectedBlocks) {
            totalClasses += entry.selectedBlocks.length;
        }

        // 勤務日数カウント (給与が発生している、またはコマがある場合)
        if (dailyPay > 0 || (entry.selectedBlocks && entry.selectedBlocks.length > 0)) {
            totalWorkDays += 1;
        }
    });

    // XP計算ロジック
    // 1. 給与: 100円につき 1 XP
    // 2. コマ数: 1コマにつき 50 XP
    // 3. 勤務日数: 1日につき 50 XP
    const earningXp = Math.floor(totalEarnings / 100);
    const classXp = totalClasses * 50;
    const workDayXp = totalWorkDays * 50;

    const totalXp = earningXp + classXp + workDayXp;

    const currentLevel = getLevelFromXp(totalXp);
    const currentLevelBaseXp = getXpForLevel(currentLevel);
    const nextLevelBaseXp = getXpForLevel(currentLevel + 1);

    const xpInCurrentLevel = totalXp - currentLevelBaseXp;
    const xpNeededForNextLevel = nextLevelBaseXp - currentLevelBaseXp;

    // 進捗率 (0-100)
    let progress = 0;
    if (xpNeededForNextLevel > 0) {
        progress = Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100));
    }

    return {
        level: currentLevel,
        xp: totalXp,
        nextLevelXp: nextLevelBaseXp,
        progress: progress,
        totalEarnings,
        totalClasses,
        totalWorkDays
    };
};
