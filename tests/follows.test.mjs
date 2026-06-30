import test from 'node:test';
import assert from 'node:assert/strict';
import { getFollowUidField, makeFollowId } from '../src/utils/follows.ts';

test('フォロー関係のIDをフォロー元とフォロー先から一意に作る', () => {
  assert.equal(makeFollowId('user-a', 'user-b'), 'user-a_user-b');
  assert.notEqual(
    makeFollowId('user-a', 'user-b'),
    makeFollowId('user-b', 'user-a'),
  );
});

test('公開一覧の種類に応じて検索対象と表示対象を切り替える', () => {
  assert.deepEqual(getFollowUidField('followers'), {
    filterField: 'targetUid',
    profileField: 'followerUid',
  });
  assert.deepEqual(getFollowUidField('following'), {
    filterField: 'followerUid',
    profileField: 'targetUid',
  });
});
