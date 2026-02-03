import React from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { useSalaryData } from '../hooks/useSalaryData';
import { calculateDailyTotal, getPaymentDate } from '../utils/calculator';
import { AlertCircle } from 'lucide-react';

export const TaxMonitor: React.FC = () => {
    const { t } = useTranslation();
    const { entries, settings } = useSalaryData();

    const today = new Date();
    const currentYear = today.getFullYear();

    // Calculate annual income based on PAYMENT DATE (Jan 1 - Dec 31)
    let totalIncome = 0;
    Object.values(entries).forEach(entry => {
        const workDate = new Date(entry.date);
        const payDate = getPaymentDate(workDate, settings.closingDay, 1); // Fixed 1 month lag

        if (payDate.getFullYear() === currentYear) {
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
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {t.tax?.title || 'Tax Monitor'}
                    {progress > 90 && <AlertCircle size={16} color="#ef4444" />}
                </h3>
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
