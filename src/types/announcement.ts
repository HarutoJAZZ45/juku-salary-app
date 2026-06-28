export type AnnouncementCategory = 'notice' | 'update';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  important: boolean;
  publishedAtMs: number;
  dateLabel: string;
  imageUrl?: string;
  source: 'firestore' | 'system';
}
