import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBadgeStatistics,
  calculateTotalBadges,
  getBadgesForPeriod,
  getEventBadges,
  getSummerCourse2026AttendanceDays,
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

const workEntry = date => ({
  ...entry(date),
  selectedBlocks: ['A'],
});

const allowanceOnlyEntry = date => ({
  ...entry(date),
  allowanceAmount: 1000,
});

const summerDates = [
  '2026-07-19',
  '2026-07-25',
  '2026-07-26',
  '2026-07-27',
  '2026-07-28',
  '2026-07-29',
  '2026-07-30',
  '2026-08-01',
  '2026-08-02',
  '2026-08-03',
  '2026-08-04',
  '2026-08-05',
  '2026-08-06',
  '2026-08-08',
  '2026-08-09',
  '2026-08-10',
  '2026-08-11',
];

const summerEntries = count => Object.fromEntries(
  summerDates.slice(0, count).map(date => [date, workEntry(date)]),
);

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

test('summer course 2026 badge returns only the current highest tier', () => {
  assert.equal(getEventBadges(summerEntries(1)).find(badge => badge.id === 'event-summer-course-2026')?.tier, 'bronze');
  assert.equal(getEventBadges(summerEntries(7)).find(badge => badge.id === 'event-summer-course-2026')?.tier, 'silver');
  assert.equal(getEventBadges(summerEntries(10)).find(badge => badge.id === 'event-summer-course-2026')?.tier, 'gold');
  assert.equal(getEventBadges(summerEntries(12)).find(badge => badge.id === 'event-summer-course-2026')?.tier, 'platinum');
  assert.equal(getEventBadges(summerEntries(12)).filter(badge => badge.id === 'event-summer-course-2026').length, 1);
});

test('summer course 2026 badge counts only actual work entries', () => {
  const entries = {
    '2026-07-19': allowanceOnlyEntry('2026-07-19'),
    '2026-07-25': workEntry('2026-07-25'),
    '2026-07-26': {
      ...entry('2026-07-26'),
      supportMinutes: 30,
    },
  };

  assert.equal(getSummerCourse2026AttendanceDays(entries), 2);
  assert.equal(getEventBadges(entries).find(badge => badge.id === 'event-summer-course-2026')?.tier, 'bronze');
});

test('summer course 2026 badge appears in the August pay period', () => {
  const badges = getBadgesForPeriod(summerEntries(12), settings, new Date(2026, 7, 1));
  const summerBadge = badges.find(badge => badge.id === 'event-summer-course-2026');

  assert.equal(summerBadge?.tier, 'platinum');
});
