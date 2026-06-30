import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Campus, PublicProfile, UserSettings, WorkEntry } from '../types';
import { buildPublicProfile } from '../utils/publicProfile';

const COLLECTION_NAME = 'publicProfiles';
const CAMPUSES: Campus[] = ['平岡', '新札幌', '月寒', '円山', '北大前'];

export const syncPublicProfile = async (
  uid: string,
  entries: Record<string, WorkEntry>,
  settings: UserSettings,
): Promise<void> => {
  const reference = doc(db, COLLECTION_NAME, uid);

  if (!settings.profile?.isPublicRankingEnabled) {
    await deleteDoc(reference).catch(() => undefined);
    return;
  }

  const payload = buildPublicProfile(uid, entries, settings);
  await setDoc(reference, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
};

export const fetchPublicProfile = async (uid: string): Promise<PublicProfile | null> => {
  if (!uid) return null;
  const snapshot = await getDoc(doc(db, COLLECTION_NAME, uid));
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  const displayName = typeof data.displayName === 'string' ? data.displayName.trim() : '';
  const avatarId = typeof data.avatarId === 'string' ? data.avatarId : '';
  const affiliation = CAMPUSES.includes(data.affiliation as Campus)
    ? data.affiliation as Campus
    : null;

  if (
    data.uid !== uid ||
    !displayName ||
    !avatarId ||
    !affiliation ||
    typeof data.level !== 'number' ||
    typeof data.totalClasses !== 'number'
  ) {
    return null;
  }

  const updatedAt = data.updatedAt;
  return {
    uid,
    displayName,
    avatarId,
    ...(typeof data.themeColor === 'string' ? { themeColor: data.themeColor } : {}),
    ...(typeof data.activeTitle === 'string' ? { activeTitle: data.activeTitle } : {}),
    affiliation,
    level: Math.max(1, Math.floor(data.level)),
    totalClasses: Math.max(0, Math.floor(data.totalClasses)),
    badgeSummary: {
      streak: Math.max(0, Math.floor(Number(data.badgeSummary?.streak) || 0)),
      event: Math.max(0, Math.floor(Number(data.badgeSummary?.event) || 0)),
    },
    ...(updatedAt instanceof Timestamp ? { updatedAtMs: updatedAt.toMillis() } : {}),
  };
};
