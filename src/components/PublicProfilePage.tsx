import { useEffect, useState, type ComponentType, type CSSProperties } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Camera,
  Coffee,
  Dribbble,
  Flame,
  Music,
  Shirt,
  Smile,
  Star,
  Trophy,
  User,
  Zap,
} from 'lucide-react';
import { fetchPublicProfile } from '../services/publicProfiles';
import {
  fetchFollowCounts,
  fetchIsFollowing,
  followUser,
  unfollowUser,
  type FollowCounts,
} from '../services/follows';
import type { PublicProfile } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import type { FollowListKind } from '../utils/follows';
import './PublicProfilePage.css';

interface PublicProfilePageProps {
  uid: string;
  onClose: () => void;
  onOpenConnections: (kind: FollowListKind) => void;
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

const THEMES: Record<string, { from: string; to: string }> = {
  indigo: { from: '#4f46e5', to: '#7c3aed' },
  emerald: { from: '#059669', to: '#0d9488' },
  rose: { from: '#e11d48', to: '#be185d' },
  amber: { from: '#d97706', to: '#ea580c' },
  blue: { from: '#2563eb', to: '#0284c7' },
  slate: { from: '#475569', to: '#1e293b' },
};

export function PublicProfilePage({
  uid,
  onClose,
  onOpenConnections,
}: PublicProfilePageProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [followCounts, setFollowCounts] = useState<FollowCounts | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [socialStatus, setSocialStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [isFollowSaving, setIsFollowSaving] = useState(false);

  useEffect(() => {
    let isActive = true;
    const loadProfile = async () => {
      setStatus('loading');
      try {
        const result = await fetchPublicProfile(uid);
        if (!isActive) return;
        setProfile(result);
        setStatus(result ? 'ready' : 'missing');
      } catch (error) {
        console.error('[PublicProfile] Load error:', error);
        if (isActive) setStatus('error');
      }
    };

    void loadProfile();
    return () => {
      isActive = false;
    };
  }, [uid]);

  useEffect(() => {
    if (!user) return;
    let isActive = true;

    const loadSocialData = async () => {
      setSocialStatus('loading');
      try {
        const [counts, following] = await Promise.all([
          fetchFollowCounts(uid),
          user.uid === uid
            ? Promise.resolve(false)
            : fetchIsFollowing(user.uid, uid),
        ]);
        if (!isActive) return;
        setFollowCounts(counts);
        setIsFollowing(following);
        setSocialStatus('ready');
      } catch (error) {
        console.error('[Follow] Load error:', error);
        if (isActive) setSocialStatus('error');
      }
    };

    void loadSocialData();
    return () => {
      isActive = false;
    };
  }, [uid, user]);

  const toggleFollow = async () => {
    if (!user || user.uid === uid || isFollowSaving) return;
    setIsFollowSaving(true);
    try {
      if (isFollowing) {
        await unfollowUser(user.uid, uid);
      } else {
        await followUser(user.uid, uid);
      }
      setIsFollowing(previous => !previous);
      setFollowCounts(previous => previous
        ? {
            ...previous,
            followers: Math.max(0, previous.followers + (isFollowing ? -1 : 1)),
          }
        : previous);
      setSocialStatus('ready');
    } catch (error) {
      console.error('[Follow] Update error:', error);
      setSocialStatus('error');
    } finally {
      setIsFollowSaving(false);
    }
  };

  if (status !== 'ready' || !profile) {
    return (
      <div className="public-profile-page">
        <header className="public-profile-navigation">
          <button type="button" onClick={onClose} aria-label="ランキングへ戻る">
            <ArrowLeft size={21} />
          </button>
          <div>
            <span>PUBLIC PROFILE</span>
            <h1>公開プロフィール</h1>
          </div>
        </header>
        <div className="public-profile-state">
          {status === 'loading' && 'プロフィールを読み込んでいます。'}
          {status === 'missing' && 'このユーザーの公開プロフィールは準備中です。'}
          {status === 'error' && 'プロフィールを読み込めませんでした。通信状態またはFirestoreルールを確認してください。'}
        </div>
      </div>
    );
  }

  const theme = THEMES[profile.themeColor || 'indigo'] ?? THEMES.indigo;
  const Avatar = AVATARS[profile.avatarId] ?? User;
  const titleLabel = profile.activeTitle
    ? t.titles[profile.activeTitle as keyof typeof t.titles] || profile.activeTitle
    : '称号未設定';
  const publicBadgeTotal =
    profile.badgeSummary.streak
    + profile.badgeSummary.earnings
    + profile.badgeSummary.event;

  return (
    <div className="public-profile-page">
      <header className="public-profile-navigation">
        <button type="button" onClick={onClose} aria-label="ランキングへ戻る">
          <ArrowLeft size={21} />
        </button>
        <div>
          <span>PUBLIC PROFILE</span>
          <h1>公開プロフィール</h1>
        </div>
      </header>

      <section
        className="public-profile-hero"
        style={{
          '--public-profile-from': theme.from,
          '--public-profile-to': theme.to,
        } as CSSProperties}
      >
        <div className="public-profile-avatar">
          <Avatar size={43} strokeWidth={1.8} />
        </div>
        <div className="public-profile-identity">
          <h2>{profile.displayName}</h2>
          <div className="public-profile-affiliation">{profile.affiliation}校</div>
          <div className="public-profile-title">{titleLabel}</div>
        </div>
      </section>

      <section className="public-profile-social" aria-label="フォロー情報">
        <button type="button" onClick={() => onOpenConnections('following')}>
          <strong>{followCounts?.following ?? '—'}</strong>
          <span>フォロー中</span>
        </button>
        <button type="button" onClick={() => onOpenConnections('followers')}>
          <strong>{followCounts?.followers ?? '—'}</strong>
          <span>フォロワー</span>
        </button>
        {user?.uid !== uid && (
          <button
            type="button"
            className={`public-profile-follow-button${isFollowing ? ' is-following' : ''}`}
            disabled={isFollowSaving || socialStatus === 'loading'}
            onClick={() => void toggleFollow()}
          >
            {isFollowSaving ? '更新中...' : isFollowing ? 'フォロー中' : 'フォローする'}
          </button>
        )}
      </section>
      {socialStatus === 'error' && (
        <p className="public-profile-social-error">
          フォロー情報を更新できませんでした。通信状態を確認してください。
        </p>
      )}

      <section className="public-profile-stats">
        <div>
          <strong>{profile.level}</strong>
          <span>レベル</span>
        </div>
        <div>
          <strong>{profile.totalClasses.toLocaleString()}</strong>
          <span>担当コマ</span>
        </div>
        <div>
          <strong>{publicBadgeTotal}</strong>
          <span>公開バッジ</span>
        </div>
      </section>

      <section className="public-profile-card">
        <div className="public-profile-card-heading">
          <div>
            <span>BADGES</span>
            <h2>獲得バッジ</h2>
          </div>
          <strong>{publicBadgeTotal}</strong>
        </div>
        <div className="public-profile-badges">
          <div>
            <span className="public-profile-badge-icon public-profile-badge-icon--streak">
              <Flame size={20} />
            </span>
            <strong>{profile.badgeSummary.streak}</strong>
            <small>連勤</small>
          </div>
          <div>
            <span className="public-profile-badge-icon public-profile-badge-icon--earnings">
              <Trophy size={20} />
            </span>
            <strong>{profile.badgeSummary.earnings}</strong>
            <small>給与達成</small>
          </div>
          <div>
            <span className="public-profile-badge-icon public-profile-badge-icon--event">
              <CalendarDays size={20} />
            </span>
            <strong>{profile.badgeSummary.event}</strong>
            <small>イベント</small>
          </div>
        </div>
      </section>

      <div className="public-profile-note">
        <Trophy size={15} />
        ランキング参加者向けに公開されている情報です。
      </div>
    </div>
  );
}
