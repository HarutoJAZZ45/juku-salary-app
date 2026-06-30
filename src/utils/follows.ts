export type FollowListKind = 'followers' | 'following';

export const makeFollowId = (followerUid: string, targetUid: string): string =>
  `${followerUid}_${targetUid}`;

export const getFollowUidField = (kind: FollowListKind) =>
  kind === 'followers'
    ? { filterField: 'targetUid', profileField: 'followerUid' } as const
    : { filterField: 'followerUid', profileField: 'targetUid' } as const;
