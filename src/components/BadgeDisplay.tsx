import React, { useMemo } from 'react';
import { Trophy, Flame, Wallet } from 'lucide-react';
import type { Badge } from '../utils/badges';
import { useTranslation } from '../contexts/LanguageContext';

interface BadgeDisplayProps {
    badges: Badge[];
    onClick?: () => void;
}

// バッジ表示コンポーネント
// 獲得したバッジのリストを表示する
export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges, onClick }) => {
    const { t } = useTranslation();

    // ティアごとのスタイル定義（色、グラデーション、枠線）
    const getBadgeStyle = (tier: string) => {
        switch (tier) {
            case 'bronze': return { color: '#CD7F32', bg: 'linear-gradient(135deg, #FFF0E0 0%, #FFE0C0 100%)', border: '#ffcca0' };
            case 'silver': return { color: '#64748b', bg: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)', border: '#cbd5e1' };
            case 'gold': return { color: '#d97706', bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', border: '#fcd34d' };
            case 'platinum': return { color: '#4f46e5', bg: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', border: '#c7d2fe' };
            default: return { color: '#cbd5e1', bg: 'rgba(255,255,255,0.2)', border: 'transparent' };
        }
    };

    const groupedBadges = useMemo(() => {
        const groups: Record<string, { badge: Badge, count: number }> = {};
        badges.forEach(badge => {
            // IDからランダムな接尾辞を除去してグループ化（streak-gold-0.123 -> streak-gold）
            const groupId = badge.id.startsWith('streak') ? badge.id.split('-').slice(0, 2).join('-') : badge.id;
            if (groups[groupId]) {
                groups[groupId].count++;
            } else {
                groups[groupId] = { badge, count: 1 };
            }
        });
        return Object.values(groups);
    }, [badges]);

    if (badges.length === 0) {
        return (
            <div onClick={onClick} style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%', backdropFilter: 'blur(4px)' }}>
                <Wallet color="white" size={32} />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-start' }} onClick={onClick}>
            {groupedBadges.map(({ badge, count }: { badge: Badge, count: number }) => {
                const style = getBadgeStyle(badge.tier);
                const label = t.badges[badge.labelKey.split('.')[1] as keyof typeof t.badges];

                return (
                    <div key={badge.id} style={{
                        position: 'relative',
                        background: style.bg,
                        padding: '10px',
                        borderRadius: '50%',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: `2px solid ${style.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                        zIndex: 1
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        title={`${label}${count > 1 ? ` x${count}` : ''}`}>
                        {badge.type === 'streak' ? (
                            <Flame color={style.color} size={20} fill={style.color} fillOpacity={0.2} />
                        ) : (
                            <Trophy color={style.color} size={20} fill={style.color} fillOpacity={0.2} />
                        )}

                        {count > 1 && (
                            <div style={{
                                position: 'absolute',
                                bottom: '-4px',
                                right: '-8px',
                                background: 'var(--primary-dark, #064e3b)',
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                border: '2px solid white',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                pointerEvents: 'none'
                            }}>
                                x{count}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
