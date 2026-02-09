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
// レベルごとの必要XP計算 (nレベルに到達するのに必要な累積XP)
// 式: XP = 14 * (Level - 1)^2.2
// Lv70で約150,000 XPになるように調整
const getXpForLevel = (level: number): number => {
    if (level <= 1) return 0;
    return Math.floor(14 * Math.pow(level - 1, 2.2));
};

const getLevelFromXp = (xp: number): number => {
    if (xp < 0) return 1;
    // 近似的に逆算
    return Math.floor(Math.pow(xp / 14, 1 / 2.2)) + 1;
};

// 称号の定義
export const TITLES = [
    { level: 10, id: "rookie", text: "ルーキー" },
    { level: 20, id: "rolePlayer", text: "ロールプレイヤー" },
    { level: 30, id: "starter", text: "スターター" },
    { level: 40, id: "allStar", text: "オールスター" },
    { level: 50, id: "franchisePlayer", text: "フランチャイズプレイヤー" },
    { level: 60, id: "superStar", text: "スーパースター" },
    { level: 70, id: "hallOfFamer", text: "殿堂入り" }
];

export const getTitleForLevel = (level: number): string => {
    // 現在のレベル以下の最大のレベル条件を持つ称号を探す
    const match = [...TITLES].reverse().find(t => level >= t.level);
    // デフォルト称号はなし、または最低レベルのもの
    return match ? match.text : "新人";
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
