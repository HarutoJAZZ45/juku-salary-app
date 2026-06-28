import {
  collection,
  deleteField,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Announcement, AnnouncementCategory } from '../types/announcement';
import { buildAnnouncementId } from '../utils/announcementId';

const ANNOUNCEMENTS_COLLECTION = 'announcements';
const ADMINS_COLLECTION = 'admins';
const MAX_ANNOUNCEMENTS = 100;

export interface AnnouncementInput {
  title: string;
  body: string;
  category: AnnouncementCategory;
  important: boolean;
  imageUrl?: string;
}

export const isSafeAnnouncementImageUrl = (value: string): boolean => (
  value.startsWith('/') || value.startsWith('https://')
);

const formatDate = (date: Date): string => (
  date.toLocaleDateString('ja-JP').replace(/\//g, '-')
);

const normalizeCategory = (value: unknown): AnnouncementCategory => (
  value === 'update' ? 'update' : 'notice'
);

const normalizeAnnouncement = (
  id: string,
  data: Record<string, unknown>,
): Announcement | null => {
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const body = typeof data.body === 'string' ? data.body.trim() : '';
  const publishedAt = data.publishedAt;

  if (
    !title ||
    !body ||
    title.length > 200 ||
    body.length > 20000 ||
    !(publishedAt instanceof Timestamp)
  ) {
    return null;
  }

  const publishedDate = publishedAt.toDate();
  const imageUrl = typeof data.imageUrl === 'string' && isSafeAnnouncementImageUrl(data.imageUrl)
    ? data.imageUrl
    : undefined;

  return {
    id,
    title,
    body,
    category: normalizeCategory(data.category),
    important: data.important === true,
    publishedAtMs: publishedDate.getTime(),
    dateLabel: formatDate(publishedDate),
    imageUrl,
    source: 'firestore',
  };
};

export const fetchAnnouncements = async (
  maximum: number = MAX_ANNOUNCEMENTS,
): Promise<Announcement[]> => {
  const snapshot = await getDocs(query(
    collection(db, ANNOUNCEMENTS_COLLECTION),
    orderBy('publishedAt', 'desc'),
    limit(maximum),
  ));

  return snapshot.docs
    .map(document => normalizeAnnouncement(document.id, document.data()))
    .filter((item): item is Announcement => item !== null);
};

export const fetchLatestAnnouncement = async (): Promise<Announcement | null> => {
  const items = await fetchAnnouncements(10);
  return items[0] ?? null;
};

const normalizeInput = (input: AnnouncementInput): AnnouncementInput => {
  const title = input.title.trim();
  const body = input.body.trim();
  const imageUrl = input.imageUrl?.trim() || undefined;

  if (!title || title.length > 200) {
    throw new Error('タイトルは1〜200文字で入力してください。');
  }
  if (!body || body.length > 20000) {
    throw new Error('本文は1〜20,000文字で入力してください。');
  }
  if (imageUrl && !isSafeAnnouncementImageUrl(imageUrl)) {
    throw new Error('画像は / で始まるアプリ内パス、または https:// のURLを指定してください。');
  }

  return {
    title,
    body,
    category: input.category === 'update' ? 'update' : 'notice',
    important: input.important === true,
    imageUrl,
  };
};

export const isAnnouncementAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  const snapshot = await getDoc(doc(db, ADMINS_COLLECTION, userId));
  return snapshot.exists() && snapshot.data().enabled === true;
};

export const createAnnouncement = async (
  input: AnnouncementInput,
  idSuffix: string,
): Promise<string> => {
  const normalized = normalizeInput(input);
  const { imageUrl, ...requiredFields } = normalized;
  const announcementId = buildAnnouncementId(idSuffix);
  const reference = doc(db, ANNOUNCEMENTS_COLLECTION, announcementId);

  await runTransaction(db, async transaction => {
    const existing = await transaction.get(reference);
    if (existing.exists()) {
      throw new Error(`ID「${announcementId}」はすでに使われています。別のID名を入力してください。`);
    }

    transaction.set(reference, {
      ...requiredFields,
      ...(imageUrl ? { imageUrl } : {}),
      publishedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  return announcementId;
};

export const updateAnnouncement = async (
  announcementId: string,
  input: AnnouncementInput,
): Promise<void> => {
  if (!announcementId) throw new Error('編集対象のお知らせが見つかりません。');
  const normalized = normalizeInput(input);
  await updateDoc(doc(db, ANNOUNCEMENTS_COLLECTION, announcementId), {
    ...normalized,
    imageUrl: normalized.imageUrl ?? deleteField(),
    updatedAt: serverTimestamp(),
  });
};

export const removeAnnouncement = async (announcementId: string): Promise<void> => {
  if (!announcementId) throw new Error('削除対象のお知らせが見つかりません。');
  await deleteDoc(doc(db, ANNOUNCEMENTS_COLLECTION, announcementId));
};
