import React from 'react';
import {
    startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
    format, isSameMonth, isToday, getYear, getMonth
} from 'date-fns';
import type { WorkEntry, UserSettings } from '../types';
import { calculateDailyTotal } from '../utils/calculator';
import { useTranslation } from '../contexts/LanguageContext';
import { isHoliday } from '@holiday-jp/holiday_jp';

interface CalendarGridProps {
    currentMonth: Date;
    entries: Record<string, WorkEntry>;
    settings: UserSettings;
    onDayClick: (date: Date) => void;
    isSelectionMode: boolean;
    selectedDates: Date[];
}

/**
 * 給料日を計算する
 * 月末を起点に、土日・祝日の場合は前営業日に前倒し
 * @param year 西暦年
 * @param month 月（0始まり）
 */
const getPayday = (year: number, month: number): string => {
    let d = new Date(year, month + 1, 0); // その月の最終日
    for (let i = 0; i < 10; i++) {
        const dow = d.getDay(); // 0=日, 6=土
        if (dow !== 0 && dow !== 6 && !isHoliday(d)) return format(d, 'yyyy-MM-dd');
        d = new Date(d.getTime() - 86400000); // 1日前へ
    }
    return format(d, 'yyyy-MM-dd');
};

// カレンダーグリッドコンポーネント
// 月間カレンダーを表示し、各日付の勤務状況や給与を表示する
export const CalendarGrid: React.FC<CalendarGridProps> = ({ currentMonth, entries, settings, onDayClick, isSelectionMode, selectedDates }) => {
    const { t } = useTranslation();
    // 月初・月末・カレンダー表示用の開始日・終了日を計算
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // 日曜始まり
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const dateFormat = "d";

    // 表示期間内の全日付配列を生成
    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = t.calendar.weekDays;

    // 今月の給料日（土日祝前倒し済み）
    const paydayStr = getPayday(getYear(currentMonth), getMonth(currentMonth));

    return (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            {/* 曜日ヘッダー */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
                {weekDays.map((d, i) => (
                    <div key={i} style={{
                        padding: '10px 0',
                        textAlign: 'center',
                        fontWeight: 600,
                        fontSize: '12px',
                        color: i === 0 ? '#ef4444' : i === 6 ? '#3b82f6' : 'var(--text-muted)'
                    }}>
                        {d}
                    </div>
                ))}
            </div>

            {/* 日付グリッド本体 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {days.map((day) => {
                    const formattedDate = format(day, 'yyyy-MM-dd');
                    const entry = entries[formattedDate];
                    // その日の給与合計を計算
                    const dayTotal = entry ? calculateDailyTotal(entry, settings) : 0;

                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isTodayDate = isToday(day);
                    const isPayday = isCurrentMonth && formattedDate === paydayStr;

                    const dow = day.getDay();
                    const isHolidayDay = isHoliday(day);
                    const isRedDay = dow === 0 || isHolidayDay;
                    const isBlueDay = dow === 6 && !isHolidayDay;

                    let numColor = 'inherit';
                    if (isTodayDate) {
                        numColor = 'white';
                    } else if (isRedDay) {
                        numColor = isCurrentMonth ? '#ef4444' : 'rgba(239, 68, 68, 0.4)';
                    } else if (isBlueDay) {
                        numColor = isCurrentMonth ? '#3b82f6' : 'rgba(59, 130, 246, 0.4)';
                    }

                    // 選択モード時に選択されているかチェック
                    const isSelected = selectedDates.some(d => format(d, 'yyyy-MM-dd') === formattedDate);

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDayClick(day)}
                            style={{
                                minHeight: '80px',
                                borderRight: '1px solid rgba(255,255,255,0.2)',
                                borderBottom: '1px solid rgba(255,255,255,0.2)',
                                background: isSelected
                                    ? 'rgba(4, 96, 167, 0.15)'
                                    : isTodayDate
                                        ? 'rgba(99,102,241,0.07)'
                                        : isCurrentMonth
                                            ? 'transparent'
                                            : 'rgba(0,0,0,0.02)',
                                color: isCurrentMonth ? 'inherit' : 'rgba(0,0,0,0.2)',
                                padding: '4px',
                                cursor: isSelectionMode ? 'copy' : 'pointer',
                                position: 'relative',
                                transition: 'background 0.2s',
                                outline: isSelected ? '2px solid var(--primary)' : undefined,
                                zIndex: isSelected ? 1 : 0
                            }}
                            className="calendar-cell"
                        >
                            {/* 日付数字 - 今日は丸バッジで強調 */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2px' }}>
                                <span style={{
                                    width: '24px', height: '24px',
                                    borderRadius: '50%',
                                    background: isTodayDate ? 'var(--primary)' : 'transparent',
                                    color: numColor,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: isTodayDate ? 700 : 400,
                                    boxShadow: isTodayDate ? '0 2px 6px rgba(99,102,241,0.4)' : 'none',
                                    flexShrink: 0,
                                }}>
                                    {format(day, dateFormat)}
                                </span>
                            </div>

                            {/* 給料日ラベル */}
                            {isPayday && (
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '2px',
                                }}>
                                    <span style={{
                                        fontSize: '9px',
                                        fontWeight: 600,
                                        color: '#92400e',
                                        background: '#fef9c3',
                                        border: '1px solid #fde68a',
                                        borderRadius: '4px',
                                        padding: '1px 4px',
                                        letterSpacing: '0.02em',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        給料日
                                    </span>
                                </div>
                            )}

                            {entry && (dayTotal > 0 || (entry.selectedBlocks && entry.selectedBlocks.length > 0)) && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                    {(entry.selectedBlocks && entry.selectedBlocks.length > 0) && (
                                        <div style={{
                                            fontSize: '10px',
                                            background: 'var(--primary-light)',
                                            color: 'white',
                                            padding: '1px 4px',
                                            borderRadius: '4px',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {entry.selectedBlocks.length}コマ
                                        </div>
                                    )}
                                    {dayTotal > 0 && (
                                        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-main)' }}>
                                            ¥{dayTotal.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 選択モード時のチェックマーク */}
                            {isSelected && (
                                <div style={{
                                    position: 'absolute', top: '2px', right: '2px',
                                    width: '16px', height: '16px',
                                    background: 'var(--primary)', borderRadius: '50%',
                                    color: 'white', fontSize: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    ✓
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
