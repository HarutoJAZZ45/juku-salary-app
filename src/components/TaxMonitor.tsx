import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import type { WorkEntry, UserSettings } from '../types';
import { calculateDailyTotal, getPaymentDate } from '../utils/calculator';
import { AlertCircle } from 'lucide-react';

interface TaxMonitorProps {
    entries: Record<string, WorkEntry>;
    settings: UserSettings;
}

// 扶養控除モニター
// 年収（1月～12月の支給ベース）を計算し、103万円の壁に対する進捗を表示する
export const TaxMonitor: React.FC<TaxMonitorProps> = ({ entries, settings }) => {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = React.useState(currentYear);

    // データから存在する給料年のリストを作成
    const availableYears = React.useMemo(() => {
        const years = new Set<number>();
        years.add(currentYear); // 現在の年は必ず含める

        Object.values(entries).forEach(entry => {
            const workDate = new Date(entry.date);
            // ユーザー設定のラグを使用 (デフォルト1)
            const payDate = getPaymentDate(workDate, settings.closingDay, settings.paymentMonthLag ?? 1);
            years.add(payDate.getFullYear());
        });

        return Array.from(years).sort((a, b) => b - a); // 降順
    }, [entries, settings.closingDay, settings.paymentMonthLag, currentYear]);

    // Calculate annual income based on PAYMENT DATE (Jan 1 - Dec 31)
    let totalIncome = 0;
    Object.values(entries).forEach(entry => {
        const workDate = new Date(entry.date);
        const payDate = getPaymentDate(workDate, settings.closingDay, settings.paymentMonthLag ?? 1);

        if (payDate.getFullYear() === selectedYear) {
            totalIncome += calculateDailyTotal(entry, settings);
        }
    });

    const limit = settings.annualLimit || 1030000;
    const remaining = Math.max(0, limit - totalIncome);
    const progress = Math.min(100, (totalIncome / limit) * 100);

    let statusColor = '#22c55e'; // Green
    if (progress > 80) statusColor = '#f59e0b'; // Yellow
    if (progress > 95) statusColor = '#ef4444'; // Red

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            marginBottom: '24px',
            border: '1px solid #e2e8f0'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {t.tax?.title || 'Tax Monitor'}
                        {progress > 90 && <AlertCircle size={16} color="#ef4444" />}
                    </h3>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        style={{
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '12px',
                            color: '#475569',
                            outline: 'none',
                            background: '#f8fafc',
                            cursor: 'pointer'
                        }}
                    >
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}年</option>
                        ))}
                    </select>
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {t.tax?.remaining || 'Remaining'}: ¥{remaining.toLocaleString()}
                </span>
            </div>

            {/* Progress Bar */}
            <div style={{ height: '8px', width: '100%', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: statusColor,
                    transition: 'width 0.5s ease-out',
                    borderRadius: '4px'
                }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: '#94a3b8' }}>
                <span>¥{totalIncome.toLocaleString()}</span>
                <span>/ ¥{limit.toLocaleString()}</span>
            </div>
        </div>
    );
};
