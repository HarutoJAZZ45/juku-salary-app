import type { WorkEntry, UserSettings, WorkBlock } from '../types';

const BLOCK_ORDER: WorkBlock[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export const calculateDailyTotal = (entry: WorkEntry, settings: UserSettings): number => {
    let total = 0;
    const blocks = entry.selectedBlocks || [];

    // 1. Koma Base Pay 
    // 1. Koma Base Pay 
    // Wage Adjustment Logic (Standard Rate)
    let standardHourlyRate = settings.teachingHourlyRate;
    const home = settings.defaultCampus || '平岡';
    const work = entry.campus || '平岡';

    if (home === '平岡' && work !== '平岡') {
        standardHourlyRate -= 100;
    } else if (home !== '平岡' && work === '平岡') {
        standardHourlyRate += 100;
    }

    // Determine rate per block
    const leaderBlocks = entry.leaderBlocks || [];
    const subLeaderBlocks = entry.subLeaderBlocks || [];

    for (const block of blocks) {
        let unitPrice = 0;
        if (leaderBlocks.includes(block)) {
            unitPrice = 2000 * 1.5; // Fixed Leader Rate
        } else if (subLeaderBlocks.includes(block)) {
            unitPrice = 1500 * 1.5; // Fixed Sub-Leader Rate
        } else {
            unitPrice = standardHourlyRate * 1.5; // Standard Rate
        }
        total += unitPrice;
    }

    // 2. Support Pay (Hourly Rate)
    let totalSupportMinutes = entry.supportMinutes;

    // 2a. In-Koma Break (5 mins per koma)
    totalSupportMinutes += blocks.length * 5;

    // 2b. Interval Breaks
    const sortedBlocks = [...blocks].sort(
        (a, b) => BLOCK_ORDER.indexOf(a) - BLOCK_ORDER.indexOf(b)
    );

    for (let i = 0; i < sortedBlocks.length - 1; i++) {
        const current = sortedBlocks[i];
        const next = sortedBlocks[i + 1];

        const currentIndex = BLOCK_ORDER.indexOf(current);
        const nextIndex = BLOCK_ORDER.indexOf(next);

        if (nextIndex === currentIndex + 1) {
            if (current === 'B' && next === 'C') {
                totalSupportMinutes += 0;
            } else {
                totalSupportMinutes += 10;
            }
        }
    }

    total += Math.floor((totalSupportMinutes / 60) * settings.hourlyRate);

    // 3. Work Allowance (Kinmu-Kyu)
    // 800 for Hiraoka, 400 for Other.
    // Only if worked? Assumed yes if entry exists in calculation.
    if (blocks.length > 0 || entry.supportMinutes > 0) {
        if (entry.location === 'hiraoka') {
            total += 800;
        } else {
            total += 400; // 'other' or undefined (legacy)
        }
    }

    // 4. Other Allowance (Manual)
    total += entry.allowanceAmount;

    // Transport
    if (entry.hasTransport) {
        // Use entry specific cost if available, otherwise default
        const cost = entry.transportCost !== undefined ? entry.transportCost : settings.transportCost;
        total += cost;
    }

    return Math.floor(total);
};

export const getPeriodRange = (currentDate: Date, closingDay: number = 15) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed
    const day = currentDate.getDate();

    let startMonth, startYear, endMonth, endYear;

    if (day <= closingDay) {
        startMonth = month - 1;
        startYear = year;
        if (startMonth < 0) {
            startMonth = 11;
            startYear = year - 1;
        }

        endMonth = month;
        endYear = year;
    } else {
        startMonth = month;
        startYear = year;

        endMonth = month + 1;
        endYear = year;
        if (endMonth > 11) {
            endMonth = 0;
            endYear = year + 1;
        }
    }

    const startDate = new Date(startYear, startMonth, closingDay + 1);
    const endDate = new Date(endYear, endMonth, closingDay);

    return {
        start: startDate,
        end: endDate,
        label: `${endDate.getMonth() + 1}月分給与`
    };
};

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
};
