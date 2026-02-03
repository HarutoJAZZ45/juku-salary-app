import React from 'react';
import { Trophy, Flame, Wallet } from 'lucide-react';
import type { Badge } from '../utils/badges';
import { useTranslation } from '../contexts/LanguageContext';

interface BadgeDisplayProps {
    badges: Badge[];
    onClick?: () => void;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges, onClick }) => {
    const { t } = useTranslation();

    const getBadgeStyle = (tier: string) => {
        switch (tier) {
            case 'bronze': return { color: '#CD7F32', bg: 'linear-gradient(135deg, #FFF0E0 0%, #FFE0C0 100%)', border: '#ffcca0' };
            case 'silver': return { color: '#64748b', bg: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)', border: '#cbd5e1' };
            case 'gold': return { color: '#d97706', bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', border: '#fcd34d' };
            case 'platinum': return { color: '#4f46e5', bg: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', border: '#c7d2fe' };
            default: return { color: '#cbd5e1', bg: 'rgba(255,255,255,0.2)', border: 'transparent' };
        }
    };

    if (badges.length === 0) {
        return (
            <div onClick={onClick} style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%', backdropFilter: 'blur(4px)' }}>
                <Wallet color="white" size={32} />
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={onClick}>
            {badges.map(badge => {
                const style = getBadgeStyle(badge.tier);
                // Type safety for translation key
                const label = t.badges[badge.labelKey.split('.')[1] as keyof typeof t.badges];

                return (
                    <div key={badge.id} style={{
                        background: style.bg,
                        padding: '10px',
                        borderRadius: '50%', // Circle
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: `2px solid ${style.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.1s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        title={label}>
                        {badge.type === 'streak' ? (
                            <Flame color={style.color} size={20} fill={style.color} fillOpacity={0.2} />
                        ) : (
                            <Trophy color={style.color} size={20} fill={style.color} fillOpacity={0.2} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};
