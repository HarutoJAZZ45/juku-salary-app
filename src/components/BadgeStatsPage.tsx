import { useMemo } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    Flame,
    Sparkles,
    Trophy,
} from 'lucide-react';
import type { UserSettings, WorkEntry } from '../types';
import { calculateBadgeStatistics, type BadgeTier } from '../utils/badges';
import './BadgeStatsPage.css';

interface BadgeStatsPageProps {
    entries: Record<string, WorkEntry>;
    settings: UserSettings;
    onClose: () => void;
}

interface BadgeCondition {
    id: BadgeTier | string;
    label: string;
    description: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'special';
    count: number;
}

export function BadgeStatsPage({ entries, settings, onClose }: BadgeStatsPageProps) {
    const statistics = useMemo(
        () => calculateBadgeStatistics(entries, settings),
        [entries, settings],
    );
    const counts = statistics.totals;
    const total = counts.streak + counts.earnings + counts.event;
    const streakConditions: BadgeCondition[] = [
        { id: 'bronze', label: 'ブロンズ', description: '3日間連続で勤務する', tier: 'bronze', count: statistics.streak.bronze },
        { id: 'silver', label: 'シルバー', description: '4日間連続で勤務する', tier: 'silver', count: statistics.streak.silver },
        { id: 'gold', label: 'ゴールド', description: '5日間以上連続で勤務する', tier: 'gold', count: statistics.streak.gold },
    ];
    const earningsConditions: BadgeCondition[] = [
        { id: 'bronze', label: 'ブロンズ', description: '1給与期間の給与見込みが7万円以上', tier: 'bronze', count: statistics.earnings.bronze },
        { id: 'silver', label: 'シルバー', description: '1給与期間の給与見込みが10万円以上', tier: 'silver', count: statistics.earnings.silver },
        { id: 'gold', label: 'ゴールド', description: '1給与期間の給与見込みが13万円以上', tier: 'gold', count: statistics.earnings.gold },
        { id: 'platinum', label: 'プラチナ', description: '1給与期間の給与見込みが16万円以上', tier: 'platinum', count: statistics.earnings.platinum },
    ];
    const eventConditions: BadgeCondition[] = [
        {
            id: 'event-newyear-2026',
            label: '正月特訓 2026',
            description: '対象期間の特別勤務に参加する',
            tier: 'special',
            count: statistics.events['event-newyear-2026'] ?? 0,
        },
    ];
    const categoryStats = [
        {
            id: 'streak',
            label: '連勤',
            description: '連続勤務によるバッジ',
            count: counts.streak,
            icon: Flame,
            conditions: streakConditions,
        },
        {
            id: 'earnings',
            label: '給与',
            description: '給与期間ごとの達成バッジ',
            count: counts.earnings,
            icon: Trophy,
            conditions: earningsConditions,
        },
        {
            id: 'event',
            label: 'イベント',
            description: '期間限定の特別バッジ',
            count: counts.event,
            icon: CalendarDays,
            conditions: eventConditions,
        },
    ] as const;
    const ownedCategoryStats = categoryStats
        .map(category => ({
            ...category,
            conditions: category.conditions.filter(condition => condition.count > 0),
        }))
        .filter(category => category.count > 0 && category.conditions.length > 0);

    return (
        <div className="badge-stats-page">
            <header className="badge-stats-navigation">
                <button type="button" onClick={onClose} aria-label="プロフィールへ戻る">
                    <ArrowLeft size={21} />
                </button>
                <div>
                    <span>BADGE COLLECTION</span>
                    <h1>バッジ統計</h1>
                </div>
            </header>

            <section className="badge-stats-hero">
                <div className="badge-stats-hero__icon">
                    <Sparkles size={27} />
                </div>
                <div>
                    <span>獲得したバッジ</span>
                    <strong>{total.toLocaleString()}</strong>
                    <small>これまでの獲得回数</small>
                </div>
            </section>

            {ownedCategoryStats.length > 0 ? (
                <>
                    <section
                        className="badge-stats-overview"
                        aria-label="種類別獲得数"
                        style={{
                            gridTemplateColumns: `repeat(${ownedCategoryStats.length}, 1fr)`,
                        }}
                    >
                        {ownedCategoryStats.map(category => (
                            <div key={category.id}>
                                <div className={`badge-stats-overview__icon badge-stats-overview__icon--${category.id}`}>
                                    <category.icon size={18} />
                                </div>
                                <strong>{category.count}</strong>
                                <span>{category.label}</span>
                                <small>獲得回数</small>
                            </div>
                        ))}
                    </section>

                    <div className="badge-stats-categories">
                        {ownedCategoryStats.map(category => (
                            <section key={category.id} className={`badge-category-card badge-category-card--${category.id}`}>
                                <div className="badge-category-header">
                                    <div className="badge-category-heading">
                                        <span className="badge-category-icon"><category.icon size={21} /></span>
                                        <div>
                                            <h2>{category.label}バッジ</h2>
                                            <p>{category.description}</p>
                                        </div>
                                    </div>
                                    <div className="badge-category-count">
                                        <strong>{category.count}</strong>
                                        <span>獲得</span>
                                    </div>
                                </div>

                                <div className="badge-condition-list">
                                    {category.conditions.map(condition => (
                                        <div key={condition.id} className="badge-condition-row">
                                            <span className={`badge-tier-mark badge-tier-mark--${condition.tier}`} />
                                            <div className="badge-condition-copy">
                                                <strong>{condition.label}</strong>
                                                <p>{condition.description}</p>
                                            </div>
                                            <div className="badge-condition-count">
                                                <strong>{condition.count}</strong>
                                                <span>個</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </>
            ) : (
                <section className="badge-stats-empty">
                    <Sparkles size={24} />
                    <h2>獲得したバッジはまだありません</h2>
                    <p>勤務記録に応じて、獲得したバッジだけがここに表示されます。</p>
                </section>
            )}

            <div className="badge-stats-note">
                バッジ数は現在の勤務記録と給与設定から自動計算されます。
            </div>
        </div>
    );
}
