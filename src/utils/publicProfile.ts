import type { PublicProfile, UserSettings, WorkEntry } from '../types';
import { calculateBadgeStatistics } from './badges.ts';
import { calculateLevelData } from './levelSystem.ts';

export type PublicProfilePayload = Omit<PublicProfile, 'updatedAtMs'>;

const ALLOWED_AVATARS = [
  'user',
  'default',
  'zap',
  'coffee',
  'camera',
  'book',
  'music',
  'smile',
  'shirt',
  'star',
  'basketball',
];
const ALLOWED_THEMES = ['indigo', 'emerald', 'rose', 'amber', 'blue', 'slate'];

export const buildPublicProfile = (
  uid: string,
  entries: Record<string, WorkEntry>,
  settings: UserSettings,
): PublicProfilePayload => {
  const levelData = calculateLevelData(entries, settings);
  const badgeStatistics = calculateBadgeStatistics(entries, settings);
  const profile = settings.profile;
  const displayName = profile?.name?.trim().slice(0, 30) || 'ゲスト講師';
  const avatarId = profile?.avatarId && ALLOWED_AVATARS.includes(profile.avatarId)
    ? profile.avatarId
    : 'user';
  const themeColor = profile?.themeColor && ALLOWED_THEMES.includes(profile.themeColor)
    ? profile.themeColor
    : undefined;
  const activeTitle = profile?.activeTitle?.trim().slice(0, 50) || undefined;

  return {
    uid,
    displayName,
    avatarId,
    ...(themeColor ? { themeColor } : {}),
    ...(activeTitle ? { activeTitle } : {}),
    affiliation: settings.defaultCampus,
    level: levelData.level,
    totalClasses: levelData.totalClasses,
    badgeSummary: {
      streak: badgeStatistics.totals.streak,
      earnings: badgeStatistics.totals.earnings,
      event: badgeStatistics.totals.event,
    },
  };
};
