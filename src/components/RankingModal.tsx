import React, { useState, useEffect } from 'react';
import { X, Trophy, Shield, User, Zap, Coffee, Camera, Book, Music, Smile, Shirt, Star, Dribbble } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { RankingData, UserSettings } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import type { LucideIcon } from 'lucide-react';

// アバターアイコンのマッピング
const AVATAR_MAP: Record<string, LucideIcon> = {
    'user': User,
    'zap': Zap,
    'coffee': Coffee,
    'camera': Camera,
    'book': Book,
    'music': Music,
    'smile': Smile,
    'shirt': Shirt,
    'star': Star,
    'basketball': Dribbble,
};

interface RankingModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: UserSettings;
}

export const RankingModal: React.FC<RankingModalProps> = ({ isOpen, onClose, settings }) => {
    const { t } = useTranslation();
    const [periodType, setPeriodType] = useState<'monthly' | 'yearly'>('monthly');
    const [targetKey, setTargetKey] = useState<string>('');
    const [category, setCategory] = useState<'classes' | 'days'>('classes');

    const [rankings, setRankings] = useState<RankingData[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const recentMonths = React.useMemo(() => {
        const keys = [];
        const now = new Date();
        let targetMonth = now.getMonth() + 1;
        let targetYear = now.getFullYear();
        if (now.getDate() > settings.closingDay) {
            targetMonth++;
            if (targetMonth > 12) { targetMonth = 1; targetYear++; }
        }
        for (let i = 0; i < 3; i++) {
            let m = targetMonth - i;
            let y = targetYear;
            if (m <= 0) { m += 12; y--; }
            keys.push(`${y}-${String(m).padStart(2, '0')}`);
        }
        return keys;
    }, [settings.closingDay]);

    const recentYears = React.useMemo(() => {
        const now = new Date();
        let currentFy = now.getFullYear();
        if (now.getMonth() + 1 < 4) currentFy--;
        return [currentFy.toString(), (currentFy - 1).toString()];
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        // 開いたときや切り替えたときにデフォルトを設定
        setTargetKey(periodType === 'monthly' ? recentMonths[0] : recentYears[0]);
    }, [isOpen, settings.closingDay, periodType, recentMonths, recentYears]);

    useEffect(() => {
        if (!isOpen || !targetKey) return;

        const loadRankings = async () => {
            setIsLoading(true);
            try {
                // rankingsコレクションを全取得し、クライアントでソート・選別する
                // 現状複雑な複合インデックス作成を回避するためクライアントでフィルタ
                const snapshot = await getDocs(collection(db, 'rankings'));
                const data: RankingData[] = [];

                snapshot.forEach(docSnap => {
                    const d = docSnap.data() as RankingData;
                    if (periodType === 'monthly' && d.monthly && d.monthly[targetKey]) {
                        data.push(d);
                    } else if (periodType === 'yearly' && d.yearly && d.yearly[targetKey]) {
                        data.push(d);
                    }
                });

                // 並び替え
                data.sort((a, b) => {
                    const statsA = periodType === 'monthly' ? a.monthly[targetKey] : a.yearly[targetKey];
                    const statsB = periodType === 'monthly' ? b.monthly[targetKey] : b.yearly[targetKey];
                    return (statsB?.[category] || 0) - (statsA?.[category] || 0);
                });

                // Top 50 に制限
                setRankings(data.slice(0, 50));
            } catch (err) {
                console.error("Failed to load rankings:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadRankings();
    }, [isOpen, periodType, targetKey, category]);

    if (!isOpen) return null;

    const isOptedIn = settings.profile?.isPublicRankingEnabled;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
            animation: 'fadeIn 0.2s'
        }}>
            <div style={{
                background: 'white', borderRadius: '24px',
                width: '100%', maxWidth: '420px',
                overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex', flexDirection: 'column', maxHeight: '90vh'
            }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', padding: '20px', color: 'white', position: 'relative' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex' }}>
                        <X size={18} className="text-white" />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: 'bold' }}>
                        <Trophy size={24} /> {t.ranking.title}
                    </div>
                </div>

                {!isOptedIn && (
                    <div style={{ background: '#fffbeb', padding: '12px 16px', borderBottom: '1px solid #fef3c7', fontSize: '13px', color: '#b45309', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <Shield size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{t.ranking.unranked}</span>
                    </div>
                )}

                {/* Controls */}
                <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <button
                            onClick={() => setPeriodType('monthly')}
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: periodType === 'monthly' ? '#fff' : 'transparent', color: periodType === 'monthly' ? '#f59e0b' : '#64748b', border: 'none', boxShadow: periodType === 'monthly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                        >
                            {t.ranking.monthly}
                        </button>
                        <button
                            onClick={() => {
                                setPeriodType('yearly');
                            }}
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, background: periodType === 'yearly' ? '#fff' : 'transparent', color: periodType === 'yearly' ? '#f59e0b' : '#64748b', border: 'none', boxShadow: periodType === 'yearly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer' }}
                        >
                            {t.ranking.yearly}
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <select
                            value={targetKey}
                            onChange={(e) => setTargetKey(e.target.value)}
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: 'white' }}
                        >
                            {periodType === 'monthly' ? (
                                recentMonths.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))
                            ) : (
                                recentYears.map(y => (
                                    <option key={y} value={y}>{y}年度</option>
                                ))
                            )}
                        </select>

                        <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '8px', padding: '4px' }}>
                            <button
                                onClick={() => setCategory('classes')}
                                style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', background: category === 'classes' ? '#fff' : 'transparent', color: category === 'classes' ? '#1e293b' : '#64748b' }}
                            >
                                {t.ranking.classes}
                            </button>
                            <button
                                onClick={() => setCategory('days')}
                                style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', background: category === 'days' ? '#fff' : 'transparent', color: category === 'days' ? '#1e293b' : '#64748b' }}
                            >
                                {t.ranking.days}
                            </button>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f1f5f9' }}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading...</div>
                    ) : rankings.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t.ranking.noData}</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {rankings.map((user, index) => {
                                const stats = periodType === 'monthly' ? user.monthly[targetKey] : user.yearly[targetKey];
                                const score = stats ? stats[category] : 0;

                                return (
                                    <div key={user.uid} style={{ background: 'white', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                                        {index < 3 && (
                                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#b45309' }} />
                                        )}

                                        <div style={{ width: '28px', textAlign: 'center', fontSize: index < 3 ? '18px' : '15px', fontWeight: 'bold', color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#64748b' }}>
                                            {index + 1}
                                        </div>

                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: user.themeColor
                                                ? `linear-gradient(135deg, ${user.themeColor}, #1e293b)`
                                                : 'linear-gradient(135deg, #334155, #0f172a)',
                                            flexShrink: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                        }}>
                                            {(() => {
                                                const IconComp = AVATAR_MAP[user.avatarId || 'user'] || User;
                                                return <IconComp size={24} stroke="#fbbf24" strokeWidth={2.5} />;
                                            })()}
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {user.name}
                                            </div>
                                            {user.activeTitle && (
                                                <div style={{ fontSize: '11px', color: user.themeColor || '#64748b', fontWeight: 600 }}>
                                                    {t.titles[user.activeTitle as keyof typeof t.titles] || user.activeTitle}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontSize: '20px', fontWeight: '900', color: '#f59e0b', lineHeight: 1 }}>
                                                {score}
                                                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal', marginLeft: '2px' }}>
                                                    {category === 'classes' ? t.ranking.classesUnit : t.ranking.daysUnit}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
