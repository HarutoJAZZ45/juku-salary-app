import holidayJp from '@holiday-jp/holiday_jp';
import type { WorkEntry } from '../types';
import { parseLocalDate } from './calculator.ts';

export const COMMUTER_PASS_PRICE = 7920;
export const WEEKDAY_ROUND_TRIP_FARE = 660;
export const HOLIDAY_ROUND_TRIP_FARE = 520;

const ELIGIBLE_CAMPUSES = new Set(['平岡', '新札幌']);
const { isHoliday } = holidayJp;

export interface CommuterPassSuggestion {
    startDate: Date;
    endDate: Date;
    regularFare: number;
    passPrice: number;
    savings: number;
    commuteDays: number;
    weekdayCount: number;
    holidayCount: number;
}

const toStartOfDay = (date: Date): Date => (
    new Date(date.getFullYear(), date.getMonth(), date.getDate())
);

const isActualWorkDay = (entry: WorkEntry): boolean => (
    (entry.selectedBlocks?.length ?? 0) > 0
    || entry.supportMinutes > 0
);

const isEligibleEntry = (
    entry: WorkEntry,
    defaultCampus: string,
): boolean => (
    isActualWorkDay(entry)
    && ELIGIBLE_CAMPUSES.has(entry.campus ?? defaultCampus)
);

export const isWeekendOrHoliday = (date: Date): boolean => (
    date.getDay() === 0
    || date.getDay() === 6
    || isHoliday(date)
);

export const getRoundTripFare = (date: Date): number => (
    isWeekendOrHoliday(date)
        ? HOLIDAY_ROUND_TRIP_FARE
        : WEEKDAY_ROUND_TRIP_FARE
);

/**
 * 1か月定期の終了日を求める。
 * 通常は翌月の開始日前日。翌月に同じ日がない場合は翌月末日とする。
 */
export const getCommuterPassEndDate = (startDate: Date): Date => {
    const start = toStartOfDay(startDate);
    const year = start.getFullYear();
    const month = start.getMonth();
    const day = start.getDate();
    const lastDayOfNextMonth = new Date(year, month + 2, 0).getDate();

    if (day > lastDayOfNextMonth) {
        return new Date(year, month + 2, 0);
    }

    return new Date(year, month + 1, day - 1);
};

export const getCommuterPassSuggestions = (
    entries: Record<string, WorkEntry>,
    today: Date = new Date(),
    defaultCampus: string = '平岡',
): CommuterPassSuggestion[] => {
    const comparisonDate = toStartOfDay(today);
    const eligibleEntries = Object.values(entries)
        .filter(entry => isEligibleEntry(entry, defaultCampus))
        .map(entry => ({
            entry,
            date: parseLocalDate(entry.date),
        }))
        .filter(item => item.date >= comparisonDate)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

    return eligibleEntries.flatMap(({ date: startDate }) => {
        const endDate = getCommuterPassEndDate(startDate);
        const entriesInPeriod = eligibleEntries.filter(
            item => item.date >= startDate && item.date <= endDate,
        );
        const weekdayCount = entriesInPeriod.filter(
            item => !isWeekendOrHoliday(item.date),
        ).length;
        const holidayCount = entriesInPeriod.length - weekdayCount;
        const regularFare = (
            weekdayCount * WEEKDAY_ROUND_TRIP_FARE
            + holidayCount * HOLIDAY_ROUND_TRIP_FARE
        );

        if (regularFare <= COMMUTER_PASS_PRICE) return [];

        return [{
            startDate,
            endDate,
            regularFare,
            passPrice: COMMUTER_PASS_PRICE,
            savings: regularFare - COMMUTER_PASS_PRICE,
            commuteDays: entriesInPeriod.length,
            weekdayCount,
            holidayCount,
        }];
    });
};

export const getBestCommuterPassSuggestion = (
    suggestions: CommuterPassSuggestion[],
): CommuterPassSuggestion | null => (
    suggestions.reduce<CommuterPassSuggestion | null>((best, current) => {
        if (!best || current.savings > best.savings) return current;
        return best;
    }, null)
);
