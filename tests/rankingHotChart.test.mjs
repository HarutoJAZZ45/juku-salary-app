import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAnnualHotChart,
  getCurrentFiscalYear,
} from '../src/utils/rankingHotChart.ts';

const ranking = (uid, classes, days, level = 1) => ({
  uid,
  name: uid,
  avatarId: 'user',
  level,
  monthly: {},
  yearly: {
    2026: { classes, days },
  },
});

test('現在日付を4月始まりの年度へ変換する', () => {
  assert.equal(getCurrentFiscalYear(new Date(2026, 2, 31)), 2025);
  assert.equal(getCurrentFiscalYear(new Date(2026, 3, 1)), 2026);
});

test('年間コマ数と出勤日数の上位3位だけを返す', () => {
  const rankings = [
    ranking('user-a', 100, 10),
    ranking('user-b', 90, 30),
    ranking('user-c', 80, 20),
    ranking('user-d', 70, 40),
  ];

  assert.deepEqual(calculateAnnualHotChart(rankings, 'user-a', 2026), [{
    category: 'classes',
    rank: 1,
    score: 100,
    fiscalYear: 2026,
  }]);
  assert.deepEqual(calculateAnnualHotChart(rankings, 'user-d', 2026), [{
    category: 'days',
    rank: 1,
    score: 40,
    fiscalYear: 2026,
  }]);
});

test('同点はレベル順、それも同じならUID順で順位を固定する', () => {
  const rankings = [
    ranking('user-c', 100, 0, 10),
    ranking('user-a', 100, 0, 20),
    ranking('user-b', 100, 0, 20),
    ranking('user-d', 100, 0, 5),
  ];

  assert.equal(calculateAnnualHotChart(rankings, 'user-a', 2026)[0].rank, 1);
  assert.equal(calculateAnnualHotChart(rankings, 'user-c', 2026)[0].rank, 3);
  assert.deepEqual(calculateAnnualHotChart(rankings, 'user-d', 2026), []);
});
