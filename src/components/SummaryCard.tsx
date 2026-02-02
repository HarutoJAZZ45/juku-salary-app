import React, { useMemo } from 'react';
import type { UserSettings, WorkEntry } from '../types';
import { calculateDailyTotal, formatCurrency, getPeriodRange } from '../utils/calculator';
import { Wallet } from 'lucide-react';

interface SummaryCardProps {
    entries: Record<string, WorkEntry>;
    settings: UserSettings;
    currentDate: Date;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ entries, settings, currentDate }) => {
    const period = useMemo(() => getPeriodRange(currentDate, settings.closingDay), [currentDate, settings.closingDay]);

    const stats = useMemo(() => {
        let total = 0;
        let komaCount = 0;
        let supportHours = 0;

        Object.values(entries).forEach(entry => {
            const entryDate = new Date(entry.date);
            // Check if entry is in period
            if (entryDate >= period.start && entryDate <= period.end) {
                total += calculateDailyTotal(entry, settings);
                komaCount += entry.selectedBlocks ? entry.selectedBlocks.length : 0;

                // Estimate support hours for display
                // Base manual
                let mins = entry.supportMinutes;
                // Add estimated auto-calc support (5 min per koma + 10 min intervals)
                // We re-use logic or just trust manual?
                // For "Display", let's just show manual + 5min/koma to give a sense, or 
                // better to exact match the pay?
                // For simplicity in UI, let's just show the Pay Amount which is accurate. 
                // If we want to show hours, we should replicate the logic or return it from calculator.
                // Replicating simple parts:
                if (entry.selectedBlocks) {
                    mins += entry.selectedBlocks.length * 5;
                    // Intervals is hard to calc here without duplicating logic.
                    // Let's just show the 'Manual + KomaBreak' time for now as "Support Time"
                }

                supportHours += mins / 60;
            }
        });

        return { total, komaCount, supportHours };
    }, [entries, period, settings]);

    return (
        <div className="glass-panel" style={{
            padding: '24px', marginBottom: '24px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
            color: 'white',
            boxShadow: '0 10px 25px -5px rgba(4, 96, 167, 0.4)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
                        {period.label} <span style={{ fontSize: '10px', opacity: 0.8 }}>({period.start.getMonth() + 1}/{period.start.getDate()} - {period.end.getMonth() + 1}/{period.end.getDate()})</span>
                    </h2>
                    <div style={{ fontSize: '32px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {formatCurrency(stats.total)}
                    </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%', backdropFilter: 'blur(4px)' }}>
                    <Wallet color="white" size={32} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>授業コマ (通常給)</div>
                    <div style={{ fontWeight: 600 }}>{stats.komaCount} コマ</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>生徒対応給 (時間)</div>
                    <div style={{ fontWeight: 600 }}>{stats.supportHours.toFixed(1)} 時間</div>
                </div>
            </div>
        </div>
    );
};
