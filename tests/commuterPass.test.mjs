import test from 'node:test';
import assert from 'node:assert/strict';
import {
    COMMUTER_PASS_PRICE,
    getBestCommuterPassSuggestion,
    getCommuterPassEndDate,
    getCommuterPassSuggestions,
    getRoundTripFare,
} from '../src/utils/commuterPass.ts';

const entry = (date, overrides = {}) => ({
    id: date,
    date,
    selectedBlocks: ['A'],
    supportMinutes: 0,
    allowanceAmount: 0,
    campus: '平岡',
    hasTransport: true,
    ...overrides,
});

const toRecord = entries => Object.fromEntries(
    entries.map(item => [item.date, item]),
);

test('平日は660円、土日祝は520円として計算する', () => {
    assert.equal(getRoundTripFare(new Date(2026, 6, 6)), 660);
    assert.equal(getRoundTripFare(new Date(2026, 6, 11)), 520);
    assert.equal(getRoundTripFare(new Date(2026, 6, 20)), 520);
});

test('1か月定期の終了日を翌月の開始日前日として返す', () => {
    const normal = getCommuterPassEndDate(new Date(2026, 6, 6));
    const monthEnd = getCommuterPassEndDate(new Date(2026, 0, 31));

    assert.deepEqual(
        [normal.getFullYear(), normal.getMonth(), normal.getDate()],
        [2026, 7, 5],
    );
    assert.deepEqual(
        [monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate()],
        [2026, 1, 28],
    );
});

test('今日以降の平岡・新札幌への実出勤だけを対象にする', () => {
    const dates = [
        '2026-07-06',
        '2026-07-07',
        '2026-07-08',
        '2026-07-09',
        '2026-07-10',
        '2026-07-11',
        '2026-07-12',
        '2026-07-13',
        '2026-07-14',
        '2026-07-15',
        '2026-07-16',
        '2026-07-17',
        '2026-07-18',
        '2026-07-19',
        '2026-07-20',
        '2026-07-21',
    ];
    const eligible = dates.map(date => entry(date));
    const entries = toRecord([
        entry('2026-07-05'),
        ...eligible,
        entry('2026-07-22', { campus: '月寒' }),
        entry('2026-07-23', {
            selectedBlocks: [],
            supportMinutes: 0,
            allowanceAmount: 1000,
        }),
    ]);

    const suggestions = getCommuterPassSuggestions(
        entries,
        new Date(2026, 6, 6),
    );
    const best = getBestCommuterPassSuggestion(suggestions);

    assert.ok(best);
    assert.equal(best.startDate.getDate(), 6);
    assert.equal(best.commuteDays, eligible.length);
    assert.equal(best.regularFare, 9860);
    assert.equal(best.savings, best.regularFare - COMMUTER_PASS_PRICE);
});

test('定期より安くなる開始期間をすべて返し、同額は提案しない', () => {
    const dates = [
        '2026-09-01',
        '2026-09-02',
        '2026-09-03',
        '2026-09-04',
        '2026-09-05',
        '2026-09-06',
        '2026-09-07',
        '2026-09-08',
        '2026-09-09',
        '2026-09-10',
        '2026-09-11',
        '2026-09-12',
        '2026-09-13',
        '2026-09-14',
        '2026-09-15',
        '2026-09-16',
    ];
    const suggestions = getCommuterPassSuggestions(
        toRecord(dates.map(date => entry(date, { campus: '新札幌' }))),
        new Date(2026, 8, 1),
    );

    assert.ok(suggestions.length > 1);
    assert.ok(suggestions.every(item => item.regularFare > COMMUTER_PASS_PRICE));
    assert.deepEqual(
        suggestions.map(item => item.startDate.getTime()),
        [...suggestions]
            .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
            .map(item => item.startDate.getTime()),
    );
});
