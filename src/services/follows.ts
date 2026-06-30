import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { PublicProfile } from '../types';
import {
  buildFollowActivityUpdate,
  getFollowUidField,
  isFollowRelationshipActive,
  makeFollowId,
  type FollowListKind,
} from '../utils/follows';
import { fetchPublicProfile } from './publicProfiles';

const COLLECTION_NAME = 'follows';
const LIST_LIMIT = 50;
const ACTIVITY_BATCH_SIZE = 8;
const followActivityCache = new Map<string, boolean>();

export interface FollowCounts {
  followers: number;
  following: number;
}

export const fetchFollowCounts = async (uid: string): Promise<FollowCounts> => {
  const follows = collection(db, COLLECTION_NAME);
  const [followers, following] = await Promise.all([
    getCountFromServer(query(
      follows,
      where('targetUid', '==', uid),
      where('followerActive', '==', true),
      where('targetActive', '==', true),
    )),
    getCountFromServer(query(
      follows,
      where('followerUid', '==', uid),
      where('followerActive', '==', true),
      where('targetActive', '==', true),
    )),
  ]);

  return {
    followers: followers.data().count,
    following: following.data().count,
  };
};

export const fetchIsFollowing = async (
  followerUid: string,
  targetUid: string,
): Promise<boolean> => {
  if (!followerUid || !targetUid || followerUid === targetUid) return false;
  const snapshot = await getDocs(query(
    collection(db, COLLECTION_NAME),
    where('followerUid', '==', followerUid),
    where('targetUid', '==', targetUid),
    limit(1),
  ));
  if (snapshot.empty) return false;
  return isFollowRelationshipActive(snapshot.docs[0].data());
};

export const followUser = async (
  followerUid: string,
  targetUid: string,
): Promise<void> => {
  if (!followerUid || !targetUid || followerUid === targetUid) {
    throw new Error('Invalid follow relationship.');
  }

  await setDoc(
    doc(db, COLLECTION_NAME, makeFollowId(followerUid, targetUid)),
    {
      followerUid,
      targetUid,
      followerActive: true,
      targetActive: true,
      createdAt: serverTimestamp(),
    },
  );
};

export const unfollowUser = async (
  followerUid: string,
  targetUid: string,
): Promise<void> => {
  if (!followerUid || !targetUid || followerUid === targetUid) return;
  await deleteDoc(doc(db, COLLECTION_NAME, makeFollowId(followerUid, targetUid)));
};

export const fetchFollowProfiles = async (
  uid: string,
  kind: FollowListKind,
): Promise<PublicProfile[]> => {
  const { filterField, profileField } = getFollowUidField(kind);
  const snapshot = await getDocs(query(
    collection(db, COLLECTION_NAME),
    where(filterField, '==', uid),
    where('followerActive', '==', true),
    where('targetActive', '==', true),
    limit(LIST_LIMIT),
  ));

  const profileUids = snapshot.docs
    .map(item => item.data()[profileField])
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
  const uniqueUids = [...new Set(profileUids)];
  const profiles = await Promise.all(uniqueUids.map(fetchPublicProfile));

  return profiles.filter((profile): profile is PublicProfile => profile !== null);
};

export const syncFollowRelationshipsActive = async (
  uid: string,
  active: boolean,
  force = false,
): Promise<void> => {
  if (!uid) return;
  if (!force && followActivityCache.get(uid) === active) return;

  const follows = collection(db, COLLECTION_NAME);
  const [asFollower, asTarget] = await Promise.all([
    getDocs(query(follows, where('followerUid', '==', uid))),
    getDocs(query(follows, where('targetUid', '==', uid))),
  ]);
  const documents = new Map(
    [...asFollower.docs, ...asTarget.docs].map(item => [item.id, item]),
  );
  const updates = [...documents.values()].flatMap(item => {
    const nextData = buildFollowActivityUpdate(item.data(), uid, active);
    return nextData
      ? [{ reference: item.ref, data: nextData }]
      : [];
  });

  for (let offset = 0; offset < updates.length; offset += ACTIVITY_BATCH_SIZE) {
    const batch = writeBatch(db);
    updates.slice(offset, offset + ACTIVITY_BATCH_SIZE).forEach(update => {
      batch.update(update.reference, update.data);
    });
    await batch.commit();
  }

  followActivityCache.set(uid, active);
};
