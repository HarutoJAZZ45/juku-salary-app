import test from 'node:test';
import assert from 'node:assert/strict';
import { getProfileTheme, PROFILE_THEMES } from '../src/utils/profileTheme.ts';

test('すべてのプロフィールテーマIDをCSSカラーへ変換する', () => {
  for (const themeId of ['indigo', 'emerald', 'rose', 'amber', 'blue', 'slate']) {
    const theme = getProfileTheme(themeId);
    assert.match(theme.from, /^#[0-9a-f]{6}$/i);
    assert.match(theme.to, /^#[0-9a-f]{6}$/i);
  }
});

test('不明なテーマはインディゴへ安全に戻す', () => {
  assert.deepEqual(getProfileTheme('unknown'), PROFILE_THEMES.indigo);
  assert.deepEqual(getProfileTheme(), PROFILE_THEMES.indigo);
});
