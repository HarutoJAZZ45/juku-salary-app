import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAnnouncementId } from '../src/utils/announcementId.ts';

test('日本時間の日付と入力したID名を組み合わせる', () => {
  const lateUtcDate = new Date('2026-06-27T15:30:00.000Z');
  assert.equal(buildAnnouncementId('thank-you', lateUtcDate), '20260628-thank-you');
});

test('ID名の前後空白と大文字を正規化する', () => {
  const date = new Date('2026-06-28T03:00:00.000Z');
  assert.equal(buildAnnouncementId(' Major-Update ', date), '20260628-major-update');
});

test('IDに使用できない文字を拒否する', () => {
  const date = new Date('2026-06-28T03:00:00.000Z');
  assert.throws(() => buildAnnouncementId('お知らせ', date));
  assert.throws(() => buildAnnouncementId('two words', date));
});
