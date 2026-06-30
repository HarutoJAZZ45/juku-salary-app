export type FollowListKind = 'followers' | 'following';

export const makeFollowId = (followerUid: string, targetUid: string): string =>
  `${followerUid}_${targetUid}`;

export const getFollowUidField = (kind: FollowListKind) =>
  kind === 'followers'
    ? { filterField: 'targetUid', profileField: 'followerUid' } as const
    : { filterField: 'followerUid', profileField: 'targetUid' } as const;

interface FollowActivityData {
  followerUid?: unknown;
  targetUid?: unknown;
  followerActive?: unknown;
  targetActive?: unknown;
}

export const isFollowRelationshipActive = (data: FollowActivityData): boolean =>
  data.followerActive !== false && data.targetActive !== false;

export const buildFollowActivityUpdate = (
  data: FollowActivityData,
  uid: string,
  active: boolean,
): Record<string, boolean> | null => {
  const isFollower = data.followerUid === uid;
  const isTarget = data.targetUid === uid;
  if (!isFollower && !isTarget) return null;

  const hasFollowerState = typeof data.followerActive === 'boolean';
  const hasTargetState = typeof data.targetActive === 'boolean';
  if (!hasFollowerState && !hasTargetState) {
    return {
      followerActive: isFollower ? active : true,
      targetActive: isTarget ? active : true,
    };
  }

  const update: Record<string, boolean> = {};
  if (isFollower && data.followerActive !== active) {
    update.followerActive = active;
  }
  if (isTarget && data.targetActive !== active) {
    update.targetActive = active;
  }
  return Object.keys(update).length > 0 ? update : null;
};
