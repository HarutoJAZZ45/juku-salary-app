import type { PublicProfile, UserSettings, WorkEntry } from '../types';
import { calculateBadgeStatistics } from './badges.ts';
import { calculateLevelData } from './levelSystem.ts';

export type PublicProfilePayload = Omit<PublicProfile, 'updatedAtMs'>;

export const buildPublicProfile = (
  uid: string,
  entries: Record<string, WorkEntry>,
  settings: UserSettings,
): PublicProfilePayload => {
  const levelData = calculateLevelData(entries, settings);
  const badgeStatistics = calculateBadgeStatistics(entries, settings);
  const profile = settings.profile;

  return {
    uid,
    displayName: profile?.name?.trim() || 'ゲスト講師',
    avatarId: profile?.avatarId || 'user',
    ...(profile?.themeColor ? { themeColor: profile.themeColor } : {}),
    ...(profile?.activeTitle ? { activeTitle: profile.activeTitle } : {}),
    affiliation: settings.defaultCampus,
    level: levelData.level,
    totalClasses: levelData.totalClasses,
    badgeSummary: {
      streak: badgeStatistics.totals.streak,
      event: badgeStatistics.totals.event,
    },
  };
};
