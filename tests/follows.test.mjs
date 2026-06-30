import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFollowActivityUpdate,
  getFollowUidField,
  isFollowRelationshipActive,
  makeFollowId,
} from '../src/utils/follows.ts';

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

test('旧形式のフォロー関係を本人側の状態を反映して移行する', () => {
  const legacy = { followerUid: 'user-a', targetUid: 'user-b' };

  assert.deepEqual(buildFollowActivityUpdate(legacy, 'user-a', false), {
    followerActive: false,
    targetActive: true,
  });
  assert.deepEqual(buildFollowActivityUpdate(legacy, 'user-b', true), {
    followerActive: true,
    targetActive: true,
  });
});

test('新形式では本人側の休止フラグだけを変更する', () => {
  const relationship = {
    followerUid: 'user-a',
    targetUid: 'user-b',
    followerActive: true,
    targetActive: true,
  };

  assert.deepEqual(buildFollowActivityUpdate(relationship, 'user-b', false), {
    targetActive: false,
  });
  assert.equal(buildFollowActivityUpdate(relationship, 'user-c', false), null);
});

test('フォロー文書が有効な場合だけフォロー中として扱う', () => {
  assert.equal(isFollowRelationshipActive({}), true);
  assert.equal(isFollowRelationshipActive({
    followerActive: true,
    targetActive: true,
  }), true);
  assert.equal(isFollowRelationshipActive({
    followerActive: true,
    targetActive: false,
  }), false);
});
