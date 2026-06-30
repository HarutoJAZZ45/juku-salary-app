import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBadgeStatistics,
  calculateTotalBadges,
  getBadgesForPeriod,
} from '../src/utils/badges.ts';

const settings = {
  teachingHourlyRate: 0,
  hourlyRate: 0,
  transportCost: 0,
  campusTransportRates: {
    '平岡': 0,
    '新札幌': 0,
    '月寒': 0,
    '円山': 0,
    '北大前': 0,
  },
  defaultCampus: '平岡',
  closingDay: 15,
  paymentMonthLag: 0,
  annualLimit: 1030000,
};

const entry = date => ({
  id: date,
  date,
  selectedBlocks: [],
  supportMinutes: 0,
  allowanceAmount: 0,
  hasTransport: false,
});

test('連勤バッジをティア別に集計する', () => {
  const entries = {
    '2026-06-01': entry('2026-06-01'),
    '2026-06-02': entry('2026-06-02'),
    '2026-06-03': entry('2026-06-03'),
  };

  const result = calculateBadgeStatistics(entries, settings);
  assert.equal(result.streak.bronze, 1);
  assert.equal(result.streak.silver, 0);
  assert.equal(result.streak.gold, 0);
  assert.equal(result.totals.streak, 1);
});

test('イベントバッジをID別に集計し、従来の総数と一致する', () => {
  const entries = {
    '2026-01-02': entry('2026-01-02'),
  };

  const statistics = calculateBadgeStatistics(entries, settings);
  const totals = calculateTotalBadges(entries, settings);

  assert.equal(statistics.events['event-newyear-2026'], 1);
  assert.deepEqual(totals, statistics.totals);
});

test('月別表示では同じティアの連勤バッジを複数返す', () => {
  const entries = Object.fromEntries([
    '2026-06-01',
    '2026-06-02',
    '2026-06-03',
    '2026-06-07',
    '2026-06-08',
    '2026-06-09',
  ].map(date => [date, entry(date)]));

  const badges = getBadgesForPeriod(entries, settings, new Date(2026, 5, 1));
  const bronzeStreaks = badges.filter(
    badge => badge.type === 'streak' && badge.tier === 'bronze',
  );
  assert.equal(bronzeStreaks.length, 2);
});
