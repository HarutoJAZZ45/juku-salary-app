import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
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
  getFollowUidField,
  makeFollowId,
  type FollowListKind,
} from '../utils/follows';
import { fetchPublicProfile } from './publicProfiles';

const COLLECTION_NAME = 'follows';
const LIST_LIMIT = 50;

export interface FollowCounts {
  followers: number;
  following: number;
}

export const fetchFollowCounts = async (uid: string): Promise<FollowCounts> => {
  const follows = collection(db, COLLECTION_NAME);
  const [followers, following] = await Promise.all([
    getCountFromServer(query(follows, where('targetUid', '==', uid))),
    getCountFromServer(query(follows, where('followerUid', '==', uid))),
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
  const snapshot = await getDoc(
    doc(db, COLLECTION_NAME, makeFollowId(followerUid, targetUid)),
  );
  return snapshot.exists();
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
    limit(LIST_LIMIT),
  ));

  const profileUids = snapshot.docs
    .map(item => item.data()[profileField])
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
  const uniqueUids = [...new Set(profileUids)];
  const profiles = await Promise.all(uniqueUids.map(fetchPublicProfile));

  return profiles.filter((profile): profile is PublicProfile => profile !== null);
};

export const deleteFollowRelationships = async (uid: string): Promise<void> => {
  if (!uid) return;
  const follows = collection(db, COLLECTION_NAME);
  const [asFollower, asTarget] = await Promise.all([
    getDocs(query(follows, where('followerUid', '==', uid))),
    getDocs(query(follows, where('targetUid', '==', uid))),
  ]);
  const references = new Map(
    [...asFollower.docs, ...asTarget.docs].map(item => [item.id, item.ref]),
  );
  const allReferences = [...references.values()];

  for (let offset = 0; offset < allReferences.length; offset += 450) {
    const batch = writeBatch(db);
    allReferences.slice(offset, offset + 450).forEach(reference => batch.delete(reference));
    await batch.commit();
  }
};
