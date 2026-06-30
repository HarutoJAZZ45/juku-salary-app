import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPublicProfile } from '../src/utils/publicProfile.ts';

const settings = {
  teachingHourlyRate: 1380,
  hourlyRate: 1075,
  transportCost: 500,
  campusTransportRates: {
    '平岡': 1620,
    '新札幌': 1140,
    '月寒': 500,
    '円山': 500,
    '北大前': 500,
  },
  defaultCampus: '新札幌',
  closingDay: 15,
  paymentMonthLag: 0,
  annualLimit: 1030000,
  profile: {
    name: 'テスト講師',
    avatarId: 'book',
    themeColor: 'blue',
    activeTitle: 'rookie',
    isPublicRankingEnabled: true,
  },
};

const entries = {
  '2026-06-01': {
    id: 'entry-1',
    date: '2026-06-01',
    selectedBlocks: ['A', 'B'],
    supportMinutes: 0,
    allowanceAmount: 0,
    hasTransport: false,
  },
};

test('公開プロフィールには許可した項目だけを含める', () => {
  const profile = buildPublicProfile('user-1', entries, settings);

  assert.deepEqual(Object.keys(profile).sort(), [
    'activeTitle',
    'affiliation',
    'avatarId',
    'badgeSummary',
    'displayName',
    'level',
    'themeColor',
    'totalClasses',
    'uid',
  ]);
  assert.equal(profile.displayName, 'テスト講師');
  assert.equal(profile.affiliation, '新札幌');
  assert.equal(profile.totalClasses, 2);
  assert.equal('entries' in profile, false);
  assert.equal('totalEarnings' in profile, false);
  assert.equal('email' in profile, false);
});

test('給与バッジは金額や内訳ではなく合計個数だけを公開する', () => {
  const highPaySettings = {
    ...settings,
    teachingHourlyRate: 200000,
  };
  const profile = buildPublicProfile('user-1', entries, highPaySettings);

  assert.deepEqual(Object.keys(profile.badgeSummary).sort(), ['earnings', 'event', 'streak']);
  assert.equal(profile.badgeSummary.earnings, 1);
  assert.equal('totalEarnings' in profile, false);
});

test('旧データの想定外プロフィール値を公開前に正規化する', () => {
  const profile = buildPublicProfile('user-1', entries, {
    ...settings,
    profile: {
      ...settings.profile,
      name: '長'.repeat(40),
      avatarId: 'unknown-avatar',
      themeColor: 'unknown-theme',
    },
  });

  assert.equal(profile.displayName.length, 30);
  assert.equal(profile.avatarId, 'user');
  assert.equal('themeColor' in profile, false);
});
