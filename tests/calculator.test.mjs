import test from 'node:test';
import assert from 'node:assert/strict';
import {
    calculateDailyTotal,
    getFiscalYear,
    getPaymentDate,
    getPeriodRange,
    parseLocalDate,
} from '../src/utils/calculator.ts';

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
    defaultCampus: '平岡',
    closingDay: 15,
    paymentMonthLag: 0,
    annualLimit: 1030000,
};

const entry = overrides => ({
    id: 'test-entry',
    date: '2026-06-10',
    selectedBlocks: [],
    supportMinutes: 0,
    allowanceAmount: 0,
    location: 'hiraoka',
    campus: '平岡',
    hasTransport: false,
    ...overrides,
});

test('通常コマ、休憩、勤務手当、追加手当、交通費を現行仕様どおり合算する', () => {
    const total = calculateDailyTotal(entry({
        selectedBlocks: ['A', 'B'],
        supportMinutes: 30,
        allowanceAmount: 100,
        hasTransport: true,
        transportCost: 600,
    }), settings);

    assert.equal(total, 6535);
});

test('リーダーとサブリーダーの固定単価を優先する', () => {
    const total = calculateDailyTotal(entry({
        selectedBlocks: ['A', 'B'],
        leaderBlocks: ['A'],
        subLeaderBlocks: ['B'],
        location: 'other',
        campus: '新札幌',
    }), settings);

    assert.equal(total, 6008);
});

test('所属校舎と勤務校舎の組み合わせによる授業時給調整を維持する', () => {
    const total = calculateDailyTotal(entry({
        selectedBlocks: ['C'],
        location: 'other',
        campus: '新札幌',
    }), settings);

    assert.equal(total, 2409);
});

test('年度は4月始まりで判定する', () => {
    assert.equal(getFiscalYear('2026-03-31'), 2025);
    assert.equal(getFiscalYear('2026-04-01'), 2026);
});

test('15日締めの給与期間を前月16日から当月15日として返す', () => {
    const period = getPeriodRange(new Date(2026, 3, 1), 15);

    assert.deepEqual(
        [period.start.getFullYear(), period.start.getMonth(), period.start.getDate()],
        [2026, 2, 16]
    );
    assert.deepEqual(
        [period.end.getFullYear(), period.end.getMonth(), period.end.getDate()],
        [2026, 3, 15]
    );
});

test('日付文字列をローカル日付の0時として解釈し、締め日当日を期間に含める', () => {
    const period = getPeriodRange(new Date(2026, 5, 1), 15);
    const closingDate = parseLocalDate('2026-06-15');

    assert.deepEqual(
        [
            closingDate.getFullYear(),
            closingDate.getMonth(),
            closingDate.getDate(),
            closingDate.getHours(),
        ],
        [2026, 5, 15, 0]
    );
    assert.equal(closingDate >= period.start && closingDate <= period.end, true);
});

test('締め日と支払月ラグから25日の支給日を返す', () => {
    const beforeClosing = getPaymentDate(new Date(2026, 3, 15), 15, 0);
    const afterClosing = getPaymentDate(new Date(2026, 3, 16), 15, 0);

    assert.deepEqual(
        [beforeClosing.getFullYear(), beforeClosing.getMonth(), beforeClosing.getDate()],
        [2026, 3, 25]
    );
    assert.deepEqual(
        [afterClosing.getFullYear(), afterClosing.getMonth(), afterClosing.getDate()],
        [2026, 4, 25]
    );
});
