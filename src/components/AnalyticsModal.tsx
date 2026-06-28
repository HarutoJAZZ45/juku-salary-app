import React from 'react';
import { ArrowLeft, X, TrendingUp } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useSalaryData } from '../hooks/useSalaryData';
import { calculateDailyTotal, parseLocalDate } from '../utils/calculator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface AnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    displayMode?: 'modal' | 'page';
}

// 分析モーダルコンポーネント
// 月ごとの給与推移や勤務時間をグラフで表示する
export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose, displayMode = 'modal' }) => {
    const { t } = useTranslation();
    const { entries, settings } = useSalaryData();
    const isPage = displayMode === 'page';

    if (!isOpen) return null;

    // ... (rest of the file until the chart) ...

    // Y軸の数値を「万円」または「k」単位でフォーマット
    const formatYAxis = (val: number) => {
        return `${val / 10000}万円`;
    };

    // 月ごとのデータを集計するための初期化
    const monthlyData: Record<string, { month: string; income: number; hours: number; classes: number }> = {};
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const currentYear = new Date().getFullYear();

    // 1月から12月までの枠を作成
    months.forEach((m) => {
        const key = `${currentYear}-${m}`;
        monthlyData[key] = {
            month: `${Number(m)}月`,
            income: 0,
            hours: 0,
            classes: 0
        };
    });

    // 勤務データを走査し、月ごとに集計
    Object.values(entries).forEach(entry => {
        const date = parseLocalDate(entry.date);
        if (date.getFullYear() === currentYear) {
            const key = format(date, 'yyyy-MM');
            if (monthlyData[key]) {
                const income = calculateDailyTotal(entry, settings);
                const classCount = entry.selectedBlocks.length;
                const hours = (entry.supportMinutes / 60) + (classCount * 1.5); // 1コマ90分として概算換算

                monthlyData[key].income += income;
                monthlyData[key].classes += classCount;
                monthlyData[key].hours += hours;
            }
        }
    });

    const data = Object.values(monthlyData).sort((a, b) => parseInt(a.month) - parseInt(b.month));

    return (
        <div style={{
            position: isPage ? 'static' : 'fixed',
            top: isPage ? undefined : 0,
            left: isPage ? undefined : 0,
            right: isPage ? undefined : 0,
            bottom: isPage ? undefined : 0,
            minHeight: isPage ? 'calc(100dvh - 40px)' : undefined,
            background: isPage ? 'transparent' : 'rgba(0,0,0,0.5)',
            backdropFilter: isPage ? undefined : 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: isPage ? undefined : 1100,
            animation: 'fadeIn 0.2s'
        }} onClick={isPage ? undefined : onClose}>
            <div style={{
                background: isPage ? 'rgba(255,255,255,0.88)' : 'white',
                width: '100%',
                maxWidth: '800px',
                maxHeight: isPage ? undefined : '90vh',
                borderRadius: '24px',
                overflow: isPage ? 'visible' : 'hidden',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={20} color="#3b82f6" />
                        {t.analytics?.title || 'Report'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={isPage ? 'ホームへ戻る' : '統計を閉じる'}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex' }}
                    >
                        {isPage
                            ? <ArrowLeft size={24} color="#64748b" />
                            : <X size={24} color="#64748b" />
                        }
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: isPage ? 'visible' : 'auto', padding: 'clamp(14px, 5vw, 24px)' }}>

                    {/* Income Chart */}
                    <div style={{ marginBottom: '32px' }}>
                        <h4 style={{ color: '#64748b', marginBottom: '16px' }}>{t.analytics?.monthlyIncome} (Year {currentYear})</h4>
                        <div style={{ height: '300px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} tickFormatter={formatYAxis} width={60} />
                                    <Tooltip />
                                    <Bar dataKey="income" fill="#3b82f6" name={t.analytics?.monthlyIncome} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Total Income</div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                                ¥{data.reduce((acc, curr) => acc + curr.income, 0).toLocaleString()}
                            </div>
                        </div>
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Total Hours</div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                                {Math.round(data.reduce((acc, curr) => acc + curr.hours, 0))} h
                            </div>
                        </div>
                        <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>Total Classes</div>
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                                {data.reduce((acc, curr) => acc + curr.classes, 0)}
                            </div>
                        </div>
                    </div>

                    {/* Classes & Hours Chart (Composed) */}
                    <div>
                        <h4 style={{ color: '#64748b', marginBottom: '16px' }}>{t.analytics?.classCount}</h4>
                        <div style={{ height: '250px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="classes" fill="#82ca9d" name={t.analytics?.classCount} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
