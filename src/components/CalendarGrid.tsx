import React from 'react';
import {
    startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
    format, isSameMonth, isToday
} from 'date-fns';
import type { WorkEntry, UserSettings } from '../types';
import { calculateDailyTotal } from '../utils/calculator';
import { useTranslation } from '../contexts/LanguageContext';

interface CalendarGridProps {
    currentMonth: Date;
    entries: Record<string, WorkEntry>;
    settings: UserSettings;
    onDayClick: (date: Date) => void;
    isSelectionMode: boolean;
    selectedDates: Date[];
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ currentMonth, entries, settings, onDayClick, isSelectionMode, selectedDates }) => {
    const { t } = useTranslation();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const dateFormat = "d";

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = t.calendar.weekDays;

    return (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Header Days */}
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

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {days.map((day) => {
                    const formattedDate = format(day, 'yyyy-MM-dd');
                    const entry = entries[formattedDate];
                    const dayTotal = entry ? calculateDailyTotal(entry, settings) : 0;

                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isTodayDate = isToday(day);

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
                                        ? 'rgba(255,255,255,0.6)'
                                        : isCurrentMonth
                                            ? 'transparent'
                                            : 'rgba(0,0,0,0.02)',
                                color: isCurrentMonth ? 'inherit' : 'rgba(0,0,0,0.2)',
                                padding: '4px',
                                cursor: isSelectionMode ? 'copy' : 'pointer',
                                position: 'relative',
                                transition: 'background 0.2s',
                                border: isSelected ? '2px solid var(--primary)' : undefined,
                                zIndex: isSelected ? 1 : 0
                            }}
                            className="calendar-cell"
                        >
                            <div style={{
                                fontSize: '12px',
                                fontWeight: isTodayDate ? 700 : 400,
                                textAlign: 'center',
                                marginBottom: '4px',
                                color: isTodayDate ? 'var(--primary)' : 'inherit'
                            }}>
                                {format(day, dateFormat)}
                            </div>

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

                            {/* Selection Checkmark */}
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
