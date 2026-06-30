import { useEffect, useState } from 'react';
import { BookOpen, CalendarDays } from 'lucide-react';
import { fetchAnnualHotChart } from '../services/rankingHotChart';
import type { AnnualHotChartEntry } from '../utils/rankingHotChart';
import './ProfileHotChart.css';

interface ProfileHotChartProps {
  uid: string;
  enabled?: boolean;
}

const CATEGORY_LABELS = {
  classes: {
    label: '担当コマ数',
    unit: 'コマ',
    icon: BookOpen,
  },
  days: {
    label: '出勤日数',
    unit: '日',
    icon: CalendarDays,
  },
} as const;

export function ProfileHotChart({ uid, enabled = true }: ProfileHotChartProps) {
  const [entries, setEntries] = useState<AnnualHotChartEntry[]>([]);

  useEffect(() => {
    if (!enabled || !uid) return;

    let isActive = true;
    const load = async () => {
      try {
        const result = await fetchAnnualHotChart(uid);
        if (isActive) setEntries(result);
      } catch (error) {
        console.error('[HotChart] Load error:', error);
        if (isActive) setEntries([]);
      }
    };

    void load();
    return () => {
      isActive = false;
    };
  }, [enabled, uid]);

  if (!enabled || entries.length === 0) return null;

  return (
    <section className="profile-hot-chart" aria-label="現在の年間ランキング実績">
      <header className="profile-hot-chart__heading">
        <div>
          <span>HOT CHART</span>
          <h2>年間ランキング</h2>
        </div>
        <small>{entries[0].fiscalYear}年度・現在</small>
      </header>
      <div className="profile-hot-chart__entries">
        {entries.map(entry => {
          const category = CATEGORY_LABELS[entry.category];
          const Icon = category.icon;
          return (
            <div className="profile-hot-chart__entry" key={entry.category}>
              <span className="profile-hot-chart__icon">
                <Icon size={18} />
              </span>
              <span className="profile-hot-chart__copy">
                <strong>{category.label}</strong>
                <small>{entry.score.toLocaleString()}{category.unit}</small>
              </span>
              <strong className={`profile-hot-chart__rank rank-${entry.rank}`}>
                {entry.rank}位
              </strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
