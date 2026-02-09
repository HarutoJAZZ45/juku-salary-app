import React, { useMemo } from 'react';
import type { UserSettings, WorkEntry } from '../types';
import { calculateDailyTotal, formatCurrency, getPeriodRange } from '../utils/calculator';
import { useTranslation } from '../contexts/LanguageContext';
import { getStreakBadges, getEarningsBadge } from '../utils/badges';
import type { Badge } from '../utils/badges';
import { BadgeDisplay } from './BadgeDisplay';

interface SummaryCardProps {
    entries: Record<string, WorkEntry>;
    settings: UserSettings;
    currentDate: Date;
    onBadgeClick?: () => void;
}

// サマリーカードコンポーネント
// 指定された期間の給与予測、勤務統計、獲得バッジを表示する
export const SummaryCard: React.FC<SummaryCardProps> = ({ entries, settings, currentDate, onBadgeClick }) => {
    const { t } = useTranslation();
    const period = useMemo(() => getPeriodRange(currentDate, settings.closingDay), [currentDate, settings.closingDay]);

    // 期間内の統計情報を計算（給与総額、コマ数、事務時間）
    const stats = useMemo(() => {
        let total = 0;
        let komaCount = 0;
        let supportHours = 0;
        const periodEntries: WorkEntry[] = [];

        Object.values(entries).forEach(entry => {
            const entryDate = new Date(entry.date);
            // 期間内のエントリのみ対象
            if (entryDate >= period.start && entryDate <= period.end) {
                total += calculateDailyTotal(entry, settings);
                komaCount += entry.selectedBlocks ? entry.selectedBlocks.length : 0;

                let mins = entry.supportMinutes;
                // コマ内休憩（5分/コマ）も事務時間に含める
                if (entry.selectedBlocks) {
                    mins += entry.selectedBlocks.length * 5;
                }

                supportHours += mins / 60;
                periodEntries.push(entry);
            }
        });

        return { total, komaCount, supportHours, periodEntries };
    }, [entries, period, settings]);

    // バッジ獲得状況の判定
    const badges = useMemo(() => {
        const earnedBadges: Badge[] = [];

        // 連続勤務バッジ (複数獲得可能)
        const streakBadges = getStreakBadges(stats.periodEntries, period.start, period.end);
        earnedBadges.push(...streakBadges);

        // 収入バッジ
        const earnedBadge = getEarningsBadge(stats.total);
        if (earnedBadge) earnedBadges.push(earnedBadge);

        return earnedBadges;
    }, [stats.total, stats.periodEntries, period]);

    return (
        <div className="glass-panel" style={{
            padding: '24px', marginBottom: '24px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
            color: 'white',
            boxShadow: '0 10px 25px -5px rgba(4, 96, 167, 0.4)'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
                        {t.summary.paymentEstimate} <span style={{ fontSize: '10px', opacity: 0.8 }}>({period.start.getMonth() + 1}/{period.start.getDate()} - {period.end.getMonth() + 1}/{period.end.getDate()})</span>
                    </h2>
                    <div style={{ fontSize: '32px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {formatCurrency(stats.total)}
                    </div>
                </div>
                {badges.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px' }}>
                        <BadgeDisplay badges={badges} onClick={onBadgeClick} />
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>{t.summary.teachingPay}</div>
                    <div style={{ fontWeight: 600 }}>{stats.komaCount}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                    <div style={{ fontSize: '11px', opacity: 0.9 }}>{t.summary.supportPay}</div>
                    <div style={{ fontWeight: 600 }}>{stats.supportHours.toFixed(1)}</div>
                </div>
            </div>
        </div>
    );
};
