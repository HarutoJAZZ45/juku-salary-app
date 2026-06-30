import { useEffect, useMemo, useState, type ComponentType } from 'react';
import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    Camera,
    Check,
    Coffee,
    Dribbble,
    Edit3,
    Flame,
    Music,
    Shirt,
    Smile,
    Sparkles,
    Star,
    Trophy,
    User,
    X,
    Zap,
} from 'lucide-react';
import type { UserProfile, UserSettings, WorkEntry } from '../types';
import { calculateLevelData } from '../utils/levelSystem';
import { calculateTotalBadges } from '../utils/badges';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../hooks/useAuth';
import {
    deleteFollowRelationships,
    fetchFollowCounts,
    type FollowCounts,
} from '../services/follows';
import type { FollowListKind } from '../utils/follows';
import { ProfileHotChart } from './ProfileHotChart';
import './AccountModal.css';

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    entries: Record<string, WorkEntry>;
    settings: UserSettings;
    onUpdateSettings: (settings: UserSettings) => void;
    onOpenBadgeStats?: () => void;
    onOpenConnections?: (kind: FollowListKind) => void;
    displayMode?: 'modal' | 'page';
}

interface ThemePreset {
    id: string;
    name: string;
    from: string;
    to: string;
}

interface AvatarPreset {
    id: string;
    icon: ComponentType<{ size?: number; strokeWidth?: number }>;
    label: string;
}

const THEME_COLORS: ThemePreset[] = [
    { id: 'indigo', name: 'インディゴ', from: '#4f46e5', to: '#7c3aed' },
    { id: 'emerald', name: 'エメラルド', from: '#059669', to: '#0d9488' },
    { id: 'rose', name: 'ローズ', from: '#e11d48', to: '#be185d' },
    { id: 'amber', name: 'アンバー', from: '#d97706', to: '#ea580c' },
    { id: 'blue', name: 'ブルー', from: '#2563eb', to: '#0284c7' },
    { id: 'slate', name: 'スレート', from: '#475569', to: '#1e293b' },
];

const AVATARS: AvatarPreset[] = [
    { id: 'user', icon: User, label: 'スタンダード' },
    { id: 'zap', icon: Zap, label: 'エネルギー' },
    { id: 'coffee', icon: Coffee, label: 'コーヒー' },
    { id: 'camera', icon: Camera, label: 'カメラ' },
    { id: 'book', icon: BookOpen, label: 'ブック' },
    { id: 'music', icon: Music, label: 'ミュージック' },
    { id: 'smile', icon: Smile, label: 'スマイル' },
    { id: 'shirt', icon: Shirt, label: 'シャツ' },
    { id: 'star', icon: Star, label: 'スター' },
    { id: 'basketball', icon: Dribbble, label: 'ボール' },
];

export const AccountModal = ({
    isOpen,
    onClose,
    entries,
    settings,
    onUpdateSettings,
    onOpenBadgeStats,
    onOpenConnections,
    displayMode = 'modal',
}: AccountModalProps) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const isPage = displayMode === 'page';
    const profile = settings.profile;

    const levelData = useMemo(
        () => calculateLevelData(entries, settings),
        [entries, settings],
    );
    const badgeCounts = useMemo(
        () => calculateTotalBadges(entries, settings),
        [entries, settings],
    );

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(profile?.name || 'ゲスト講師');
    const [editTheme, setEditTheme] = useState(profile?.themeColor || 'indigo');
    const [editAvatar, setEditAvatar] = useState(profile?.avatarId || 'user');
    const [editTitle, setEditTitle] = useState(profile?.activeTitle);
    const [lastSeenTitles, setLastSeenTitles] = useState<string[]>(() => (
        JSON.parse(localStorage.getItem('lastSeenTitles') || '[]')
    ));
    const [isUpdatingParticipation, setIsUpdatingParticipation] = useState(false);
    const [followCounts, setFollowCounts] = useState<FollowCounts | null>(null);

    useEffect(() => {
        if (!user || !profile?.isPublicRankingEnabled) {
            setFollowCounts(null);
            return;
        }

        let isActive = true;
        const loadFollowCounts = async () => {
            try {
                const counts = await fetchFollowCounts(user.uid);
                if (isActive) setFollowCounts(counts);
            } catch (error) {
                console.error('[Follow] MyProfile count load error:', error);
                if (isActive) setFollowCounts(null);
            }
        };

        void loadFollowCounts();
        return () => {
            isActive = false;
        };
    }, [profile?.isPublicRankingEnabled, user]);

    if (!isOpen) return null;

    const currentTheme = THEME_COLORS.find(item => item.id === profile?.themeColor) ?? THEME_COLORS[0];
    const CurrentAvatar = AVATARS.find(item => item.id === profile?.avatarId)?.icon ?? User;
    const unlockedTitles = profile?.unlockedTitles ?? [];
    const hasNewTitles = unlockedTitles.some(title => !lastSeenTitles.includes(title));
    const totalBadgeCount = badgeCounts.streak + badgeCounts.earnings + badgeCounts.event;
    const titleLabel = profile?.activeTitle
        ? t.titles[profile.activeTitle as keyof typeof t.titles] || profile.activeTitle
        : '称号未設定';

    const updateProfile = (updates: Partial<UserProfile>) => {
        onUpdateSettings({
            ...settings,
            profile: {
                name: profile?.name || 'ゲスト講師',
                avatarId: profile?.avatarId || 'user',
                ...profile,
                ...updates,
            },
        });
    };

    const openEditor = () => {
        setEditName(profile?.name || 'ゲスト講師');
        setEditTheme(profile?.themeColor || 'indigo');
        setEditAvatar(profile?.avatarId || 'user');
        setEditTitle(profile?.activeTitle);
        setIsEditing(true);
        localStorage.setItem('lastSeenTitles', JSON.stringify(unlockedTitles));
        setLastSeenTitles(unlockedTitles);
    };

    const saveProfile = () => {
        updateProfile({
            name: editName.trim() || 'ゲスト講師',
            themeColor: editTheme,
            avatarId: editAvatar,
            activeTitle: editTitle,
        });
        setIsEditing(false);
    };

    const updateRankingParticipation = async (enabled: boolean) => {
        if (isUpdatingParticipation) return;
        setIsUpdatingParticipation(true);
        try {
            if (!enabled && user) {
                await deleteFollowRelationships(user.uid);
            }
            updateProfile({ isPublicRankingEnabled: enabled });
        } catch (error) {
            console.error('[Follow] Relationship cleanup error:', error);
            window.alert('ランキング参加の変更に失敗しました。通信状態を確認して、もう一度お試しください。');
        } finally {
            setIsUpdatingParticipation(false);
        }
    };

    return (
        <div className={`profile-shell ${isPage ? 'profile-shell--page' : 'profile-shell--modal'}`}>
            <div className="profile-page">
                <header className="profile-navigation">
                    <button type="button" className="profile-icon-button" onClick={onClose} aria-label="ホームへ戻る">
                        {isPage ? <ArrowLeft size={21} /> : <X size={21} />}
                    </button>
                    <div>
                        <div className="profile-navigation__eyebrow">MY PROFILE</div>
                        <h1>プロフィール</h1>
                    </div>
                    <button type="button" className="profile-edit-button" onClick={openEditor}>
                        <Edit3 size={15} />
                        編集
                        {hasNewTitles && <span className="profile-notification-dot" />}
                    </button>
                </header>

                <section
                    className="profile-hero"
                    style={{
                        '--profile-from': currentTheme.from,
                        '--profile-to': currentTheme.to,
                    } as React.CSSProperties}
                >
                    <div className="profile-avatar">
                        <CurrentAvatar size={43} strokeWidth={1.8} />
                    </div>
                    <div className="profile-identity">
                        <h2>{profile?.name || 'ゲスト講師'}</h2>
                        <div className="profile-affiliation">{settings.defaultCampus}校</div>
                        <div className="profile-title-chip">{titleLabel}</div>
                    </div>
                </section>

                {isEditing && (
                    <section className="profile-editor" aria-label="プロフィール編集">
                        <div className="profile-section-heading">
                            <div>
                                <span>EDIT PROFILE</span>
                                <h2>プロフィール編集</h2>
                            </div>
                            <button type="button" className="profile-icon-button" onClick={() => setIsEditing(false)} aria-label="編集を閉じる">
                                <X size={19} />
                            </button>
                        </div>

                        <label className="profile-field">
                            <span>表示名</span>
                            <input
                                value={editName}
                                maxLength={30}
                                onChange={event => setEditName(event.target.value)}
                            />
                        </label>

                        <div className="profile-field">
                            <span>アイコン</span>
                            <div className="profile-avatar-grid">
                                {AVATARS.map(avatar => {
                                    const AvatarIcon = avatar.icon;
                                    return (
                                        <button
                                            key={avatar.id}
                                            type="button"
                                            className={editAvatar === avatar.id ? 'is-selected' : ''}
                                            onClick={() => setEditAvatar(avatar.id)}
                                            aria-label={avatar.label}
                                        >
                                            <AvatarIcon size={23} strokeWidth={1.9} />
                                            {editAvatar === avatar.id && <Check size={12} className="profile-selected-check" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="profile-field">
                            <span>テーマカラー</span>
                            <div className="profile-theme-grid">
                                {THEME_COLORS.map(theme => (
                                    <button
                                        key={theme.id}
                                        type="button"
                                        className={editTheme === theme.id ? 'is-selected' : ''}
                                        onClick={() => setEditTheme(theme.id)}
                                        aria-label={theme.name}
                                        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                                    >
                                        {editTheme === theme.id && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="profile-field">
                            <span>称号</span>
                            <div className="profile-title-options">
                                <button
                                    type="button"
                                    className={editTitle === undefined ? 'is-selected' : ''}
                                    onClick={() => setEditTitle(undefined)}
                                >
                                    設定しない
                                </button>
                                {unlockedTitles.map(titleId => (
                                    <button
                                        key={titleId}
                                        type="button"
                                        className={editTitle === titleId ? 'is-selected' : ''}
                                        onClick={() => setEditTitle(titleId)}
                                    >
                                        {t.titles[titleId as keyof typeof t.titles] || titleId}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="button" className="profile-save-button" onClick={saveProfile}>
                            <Check size={17} />
                            変更を保存
                        </button>
                    </section>
                )}

                <section className="profile-stats" aria-label="活動実績">
                    <div>
                        <strong>{levelData.level}</strong>
                        <span>レベル</span>
                    </div>
                    <div>
                        <strong>{levelData.totalClasses.toLocaleString()}</strong>
                        <span>担当コマ</span>
                    </div>
                    <div>
                        <strong>{levelData.totalWorkDays.toLocaleString()}</strong>
                        <span>勤務日</span>
                    </div>
                </section>

                {profile?.isPublicRankingEnabled && onOpenConnections && (
                    <section className="profile-social-stats" aria-label="フォロー情報">
                        <button type="button" onClick={() => onOpenConnections('following')}>
                            <strong>{followCounts?.following ?? '—'}</strong>
                            <span>フォロー中</span>
                        </button>
                        <button type="button" onClick={() => onOpenConnections('followers')}>
                            <strong>{followCounts?.followers ?? '—'}</strong>
                            <span>フォロワー</span>
                        </button>
                    </section>
                )}

                <section className="profile-card profile-level-card">
                    <div className="profile-card-heading">
                        <div>
                            <span>LEVEL PROGRESS</span>
                            <h2>レベル {levelData.level}</h2>
                        </div>
                        <div className="profile-level-percentage">{levelData.progress}%</div>
                    </div>
                    <div className="profile-progress-track">
                        <div
                            className="profile-progress-value"
                            style={{
                                width: `${levelData.progress}%`,
                                background: `linear-gradient(90deg, ${currentTheme.from}, ${currentTheme.to})`,
                            }}
                        />
                    </div>
                    <div className="profile-progress-caption">
                        <span>{levelData.xp.toLocaleString()} XP</span>
                        <span>次まで {(levelData.nextLevelXp - levelData.xp).toLocaleString()} XP</span>
                    </div>
                </section>

                <section className="profile-card">
                    <div className="profile-card-heading">
                        <div>
                            <span>BADGES</span>
                            <h2>獲得バッジ</h2>
                        </div>
                        <div className="profile-badge-heading-actions">
                            {onOpenBadgeStats && (
                                <button type="button" onClick={onOpenBadgeStats}>統計を見る</button>
                            )}
                            <div className="profile-badge-total">{totalBadgeCount}</div>
                        </div>
                    </div>
                    <div className="profile-badge-summary">
                        <div>
                            <span className="profile-badge-icon profile-badge-icon--streak"><Flame size={19} /></span>
                            <strong>{badgeCounts.streak}</strong>
                            <small>連勤</small>
                        </div>
                        <div>
                            <span className="profile-badge-icon profile-badge-icon--earnings"><Trophy size={19} /></span>
                            <strong>{badgeCounts.earnings}</strong>
                            <small>給与</small>
                        </div>
                        <div>
                            <span className="profile-badge-icon profile-badge-icon--event"><CalendarDays size={19} /></span>
                            <strong>{badgeCounts.event}</strong>
                            <small>イベント</small>
                        </div>
                    </div>
                </section>

                {user && (
                    <ProfileHotChart
                        uid={user.uid}
                        enabled={profile?.isPublicRankingEnabled === true}
                    />
                )}

                <section className="profile-card profile-ranking-card">
                    <div className="profile-ranking-copy">
                        <span className="profile-ranking-icon"><Trophy size={19} /></span>
                        <div>
                            <h2>ランキング参加</h2>
                            <p>参加者だけがランキングを閲覧できます。</p>
                        </div>
                    </div>
                    <label className="profile-switch">
                        <input
                            type="checkbox"
                            checked={profile?.isPublicRankingEnabled || false}
                            disabled={isUpdatingParticipation}
                            onChange={event => void updateRankingParticipation(event.target.checked)}
                        />
                        <span />
                    </label>
                </section>

                <div className="profile-privacy-note">
                    <Sparkles size={16} />
                    給与額や勤務日の詳細はプロフィールに公開されません。
                </div>
            </div>
        </div>
    );
};
