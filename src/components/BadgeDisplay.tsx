import React from 'react';
import { Trophy, Flame, Wallet } from 'lucide-react';
import type { Badge } from '../utils/badges';
import { useTranslation } from '../contexts/LanguageContext';

interface BadgeDisplayProps {
    badges: Badge[];
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges }) => {
    const { t } = useTranslation();

    const getBadgeColor = (tier: string) => {
        switch (tier) {
            case 'bronze': return '#CD7F32';
            case 'silver': return '#94a3b8'; // Slate-400 for better visibility than pure silver
            case 'gold': return '#fbbf24'; // Amber-400
            case 'platinum': return '#818cf8'; // Indigo-400
            default: return 'white';
        }
    };

    if (badges.length === 0) {
        return <Wallet color="white" size={32} />;
    }

    return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {badges.map(badge => {
                const color = getBadgeColor(badge.tier);
                // Type safety for translation key
                const label = t.badges[badge.labelKey.split('.')[1] as keyof typeof t.badges];

                return (
                    <div key={badge.id} style={{
                        background: 'rgba(255,255,255,0.2)',
                        padding: '8px',
                        borderRadius: '50%',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative',
                        cursor: 'pointer'
                    }} title={label}>
                        {badge.type === 'streak' ? (
                            <Flame color={color} size={24} fill={color} fillOpacity={0.6} />
                        ) : (
                            <Trophy color={color} size={24} fill={color} fillOpacity={0.6} />
                        )}

                        {/* Tooltip-ish label on hover could be handled by 'title' attribute for simplicity, 
                            or we could add a fancy tooltip later. for now 'title' is enough. */}
                    </div>
                );
            })}
        </div>
    );
};
