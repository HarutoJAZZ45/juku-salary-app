import { useEffect, useState, type ComponentType } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Camera,
  ChevronRight,
  Coffee,
  Dribbble,
  Music,
  Shirt,
  Smile,
  Star,
  User,
  Zap,
} from 'lucide-react';
import { fetchFollowCounts, fetchFollowProfiles, type FollowCounts } from '../services/follows';
import { fetchPublicProfile } from '../services/publicProfiles';
import type { PublicProfile } from '../types';
import type { FollowListKind } from '../utils/follows';
import './FollowConnectionsPage.css';

interface FollowConnectionsPageProps {
  uid: string;
  kind: FollowListKind;
  onClose: () => void;
  onChangeKind: (kind: FollowListKind) => void;
  onOpenProfile: (uid: string) => void;
}

const AVATARS: Record<string, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  user: User,
  default: User,
  zap: Zap,
  coffee: Coffee,
  camera: Camera,
  book: BookOpen,
  music: Music,
  smile: Smile,
  shirt: Shirt,
  star: Star,
  basketball: Dribbble,
};

const THEME_COLORS: Record<string, string> = {
  indigo: '#4f46e5',
  emerald: '#059669',
  rose: '#e11d48',
  amber: '#d97706',
  blue: '#2563eb',
  slate: '#475569',
};

export function FollowConnectionsPage({
  uid,
  kind,
  onClose,
  onChangeKind,
  onOpenProfile,
}: FollowConnectionsPageProps) {
  const [owner, setOwner] = useState<PublicProfile | null>(null);
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [counts, setCounts] = useState<FollowCounts>({ followers: 0, following: 0 });
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setStatus('loading');
      try {
        const [profile, items, nextCounts] = await Promise.all([
          fetchPublicProfile(uid),
          fetchFollowProfiles(uid, kind),
          fetchFollowCounts(uid),
        ]);
        if (!isActive) return;
        setOwner(profile);
        setProfiles(items);
        setCounts(nextCounts);
        setStatus('ready');
      } catch (error) {
        console.error('[Follow] List load error:', error);
        if (isActive) setStatus('error');
      }
    };

    void load();
    return () => {
      isActive = false;
    };
  }, [kind, uid]);

  return (
    <div className="follow-connections-page">
      <header className="follow-connections-navigation">
        <button type="button" onClick={onClose} aria-label="公開プロフィールへ戻る">
          <ArrowLeft size={21} />
        </button>
        <div>
          <span>CONNECTIONS</span>
          <h1>{owner?.displayName || 'プロフィール'}</h1>
        </div>
      </header>

      <nav className="follow-connections-tabs" aria-label="フォロー一覧の切り替え">
        <button
          type="button"
          className={kind === 'following' ? 'is-active' : ''}
          onClick={() => onChangeKind('following')}
        >
          フォロー中
          <strong>{counts.following}</strong>
        </button>
        <button
          type="button"
          className={kind === 'followers' ? 'is-active' : ''}
          onClick={() => onChangeKind('followers')}
        >
          フォロワー
          <strong>{counts.followers}</strong>
        </button>
      </nav>

      <section className="follow-connections-list">
        {status === 'loading' && (
          <div className="follow-connections-state">読み込んでいます...</div>
        )}
        {status === 'error' && (
          <div className="follow-connections-state">
            一覧を読み込めませんでした。通信状態を確認してください。
          </div>
        )}
        {status === 'ready' && profiles.length === 0 && (
          <div className="follow-connections-state">
            {kind === 'following'
              ? 'フォローしているユーザーはいません。'
              : 'フォロワーはまだいません。'}
          </div>
        )}
        {status === 'ready' && profiles.map(profile => {
          const Avatar = AVATARS[profile.avatarId] ?? User;
          const themeColor = THEME_COLORS[profile.themeColor || 'indigo'] ?? THEME_COLORS.indigo;
          return (
            <button
              type="button"
              className="follow-connection-row"
              key={profile.uid}
              onClick={() => onOpenProfile(profile.uid)}
            >
              <span
                className="follow-connection-avatar"
                style={{ color: themeColor, borderColor: `${themeColor}33` }}
              >
                <Avatar size={21} strokeWidth={1.8} />
              </span>
              <span className="follow-connection-copy">
                <strong>{profile.displayName}</strong>
                <small>{profile.affiliation}校・レベル {profile.level}</small>
              </span>
              <ChevronRight size={18} />
            </button>
          );
        })}
      </section>

      {status === 'ready' && profiles.length >= 50 && (
        <p className="follow-connections-limit">最大50件を表示しています。</p>
      )}
    </div>
  );
}
