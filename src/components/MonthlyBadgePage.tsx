import { useMemo } from 'react';
import { ArrowLeft, CalendarDays, Flame, Sparkles, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import type { UserSettings, WorkEntry } from '../types';
import { getBadgesForPeriod, type Badge } from '../utils/badges';
import { getPeriodRange } from '../utils/calculator';
import { useTranslation } from '../contexts/LanguageContext';
import './MonthlyBadgePage.css';

interface MonthlyBadgePageProps {
    entries: Record<string, WorkEntry>;
    settings: UserSettings;
    monthKey: string;
    onClose: () => void;
}

export function MonthlyBadgePage({ entries, settings, monthKey, onClose }: MonthlyBadgePageProps) {
    const { t } = useTranslation();
    const [year, month] = monthKey.split('-').map(Number);
    const currentDate = useMemo(() => new Date(year, month - 1, 1), [year, month]);
    const period = useMemo(
        () => getPeriodRange(currentDate, settings.closingDay),
        [currentDate, settings.closingDay],
    );
    const badges = useMemo(
        () => getBadgesForPeriod(entries, settings, currentDate),
        [entries, settings, currentDate],
    );
    const grouped = useMemo(() => {
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
        <div className="monthly-badges-page">
            <header className="monthly-badges-navigation">
                <button type="button" onClick={onClose} aria-label="ホームへ戻る">
                    <ArrowLeft size={21} />
                </button>
                <div>
                    <span>MONTHLY BADGES</span>
                    <h1>{year}年{month}月のバッジ</h1>
                </div>
            </header>

            <section className="monthly-badges-hero">
                <CalendarDays size={25} />
                <div>
                    <span>対象給与期間</span>
                    <strong>{format(period.start, 'M月d日')} − {format(period.end, 'M月d日')}</strong>
                </div>
                <div className="monthly-badges-total">{badges.length}件</div>
            </section>

            {grouped.length === 0 ? (
                <div className="monthly-badges-empty">
                    この期間に獲得したバッジはありません。
                </div>
            ) : (
                <div className="monthly-badges-list">
                    {grouped.map(({ id, badge, count }) => {
                        const labelKey = badge.labelKey.split('.')[1] as keyof typeof t.badges;
                        const descriptionKey = badge.descriptionKey.split('.')[1] as keyof typeof t.badges;
                        const baseLabel = t.badges[labelKey] || badge.labelKey;
                        const label = badge.type === 'earnings' ? `給与 ${baseLabel}` : baseLabel;
                        const description = t.badges[descriptionKey] || badge.descriptionKey;
                        const Icon = badge.type === 'streak'
                            ? Flame
                            : badge.type === 'event'
                                ? CalendarDays
                                : badge.icon === 'sparkles'
                                    ? Sparkles
                                    : Trophy;

                        return (
                            <article key={id} className={`monthly-badge-card monthly-badge-card--${badge.type} monthly-badge-card--${badge.tier}`}>
                                <span className="monthly-badge-card__icon"><Icon size={23} /></span>
                                <div>
                                    <span>{badge.type === 'event' ? 'イベント限定' : badge.type === 'streak' ? '連勤' : '給与達成'}</span>
                                    <h2>{label}</h2>
                                    <p>{description}</p>
                                </div>
                                <strong>{count}個</strong>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
