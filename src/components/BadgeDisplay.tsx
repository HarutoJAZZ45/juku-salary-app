import { useMemo, type CSSProperties } from 'react';
import { CalendarDays, Flame, Sparkles, Sun, Trophy } from 'lucide-react';
import type { Badge } from '../utils/badges';
import { useTranslation } from '../contexts/LanguageContext';
import './BadgeDisplay.css';

interface BadgeDisplayProps {
    badges: Badge[];
    onClick?: () => void;
}

const getBadgeColors = (badge: Badge) => {
    if (badge.type === 'event' && badge.icon !== 'sun') {
        return { color: '#be185d', background: '#fdf2f8', border: '#fbcfe8' };
    }
    switch (badge.tier) {
        case 'bronze': return { color: '#9a3412', background: '#fff7ed', border: '#fed7aa' };
        case 'silver': return { color: '#475569', background: '#f8fafc', border: '#cbd5e1' };
        case 'gold': return { color: '#a16207', background: '#fefce8', border: '#fde68a' };
        case 'platinum': return { color: '#6d28d9', background: '#f5f3ff', border: '#ddd6fe' };
        default: return { color: '#475569', background: '#f8fafc', border: '#e2e8f0' };
    }
};

export const BadgeDisplay = ({ badges, onClick }: BadgeDisplayProps) => {
    const { t } = useTranslation();
    const groupedBadges = useMemo(() => {
        const groups: Record<string, { id: string; badge: Badge; count: number }> = {};
        badges.forEach(badge => {
            const id = badge.id.startsWith('streak')
                ? badge.id.split('-').slice(0, 2).join('-')
                : badge.id;
            if (groups[id]) groups[id].count += 1;
            else groups[id] = { id, badge, count: 1 };
        });
        return Object.values(groups);
    }, [badges]);

    return (
        <button type="button" className="summary-badge-icons" onClick={onClick}>
            {groupedBadges.map(({ id, badge, count }) => {
                const colors = getBadgeColors(badge);
                const labelKey = badge.labelKey.split('.')[1] as keyof typeof t.badges;
                const label = t.badges[labelKey] || badge.labelKey;
                const Icon = badge.type === 'streak'
                    ? Flame
                    : badge.type === 'event'
                        ? badge.icon === 'sun'
                            ? Sun
                            : CalendarDays
                        : badge.icon === 'sparkles'
                            ? Sparkles
                            : Trophy;

                return (
                    <span
                        key={id}
                        className="summary-badge-icon"
                        title={label}
                        style={{
                            '--badge-color': colors.color,
                            '--badge-background': colors.background,
                            '--badge-border': colors.border,
                        } as CSSProperties}
                    >
                        <Icon size={20} strokeWidth={1.9} />
                        {count > 1 && <span className="summary-badge-icon__count">×{count}</span>}
                    </span>
                );
            })}
        </button>
    );
};
