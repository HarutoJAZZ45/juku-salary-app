import React, { useState, useEffect, useMemo } from 'react';
import { X, Trophy, Star, User, Edit2, Save, Palette, Shirt, Zap, Coffee, Camera, Book, Music, Smile, Dribbble, Flame, Calendar } from 'lucide-react';
import type { UserSettings, WorkEntry } from '../types';
import { calculateLevelData } from '../utils/levelSystem';
import { calculateTotalBadges } from '../utils/badges';
import { useTranslation } from '../contexts/LanguageContext';

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    entries: Record<string, WorkEntry>;
    settings: UserSettings;
    onUpdateSettings: (settings: UserSettings) => void;
}

// プリセットテーマカラー
const THEME_COLORS = [
    { id: 'indigo', name: 'Indigo', from: '#4f46e5', to: '#7e22ce' },
    { id: 'emerald', name: 'Emerald', from: '#10b981', to: '#059669' },
    { id: 'rose', name: 'Rose', from: '#f43f5e', to: '#be123c' },
    { id: 'amber', name: 'Amber', from: '#f59e0b', to: '#d97706' },
    { id: 'blue', name: 'Blue', from: '#3b82f6', to: '#2563eb' },
    { id: 'slate', name: 'Slate', from: '#475569', to: '#1e293b' },
];

// プリセットアバターアイコン
const AVATARS = [
    { id: 'user', icon: User, label: 'Default' },
    { id: 'zap', icon: Zap, label: 'Energy' },
    { id: 'coffee', icon: Coffee, label: 'Coffee' },
    { id: 'camera', icon: Camera, label: 'Photo' },
    { id: 'book', icon: Book, label: 'Study' },
    { id: 'music', icon: Music, label: 'Music' },
    { id: 'smile', icon: Smile, label: 'Smile' },
    { id: 'shirt', icon: Shirt, label: 'Jersey' },
    { id: 'star', icon: Star, label: 'Star' },
    { id: 'basketball', icon: Dribbble, label: 'Basketball' },
];

export const AccountModal: React.FC<AccountModalProps> = ({
    isOpen,
    onClose,
    entries,
    settings,
    onUpdateSettings
}) => {
    // レベルデータの計算（メモ化）
    const levelData = useMemo(() => {
        if (!isOpen) return null;
        return calculateLevelData(entries, settings);
    }, [isOpen, entries, settings]);

    // 獲得バッジ総数
    const totalBadges = useMemo(() => {
        if (!isOpen) return { streak: 0, earnings: 0, event: 0 };
        return calculateTotalBadges(entries, settings);
    }, [isOpen, entries, settings]);

    const { t } = useTranslation();

    const [isEditingName, setIsEditingName] = useState(false);
    const [editName, setEditName] = useState('');
    const [showCustomize, setShowCustomize] = useState(false);
    const [isEditingTheme, setIsEditingTheme] = useState(false);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    // 編集中の値のバッファ
    const [tempTheme, setTempTheme] = useState(settings.profile?.themeColor || 'indigo');
    const [tempAvatar, setTempAvatar] = useState(settings.profile?.avatarId || 'user');
    const [tempTitle, setTempTitle] = useState(settings.profile?.activeTitle);

    const [lastSeenTitlesState, setLastSeenTitlesState] = useState<string[]>(() =>
        JSON.parse(localStorage.getItem('lastSeenTitles') || '[]')
    );

    const hasNewTitles = useMemo(() => {
        const current = settings.profile?.unlockedTitles || [];
        return current.some(t => !lastSeenTitlesState.includes(t));
    }, [settings.profile?.unlockedTitles, lastSeenTitlesState]);

    useEffect(() => {
        if (isOpen) {
            setEditName(settings.profile?.name || 'ゲスト講師');
        }
    }, [isOpen, settings.profile?.name]);

    const handleUpdateProfile = (updates: Partial<typeof settings.profile>) => {
        onUpdateSettings({
            ...settings,
            profile: {
                ...settings.profile!,
                ...updates
            }
        });
    };

    const handleSaveName = () => {
        handleUpdateProfile({ name: editName });
        setIsEditingName(false);
    };

    if (!isOpen || !levelData) return null;

    const currentTheme = THEME_COLORS.find(c => c.id === settings.profile?.themeColor) || THEME_COLORS[0];
    const CurrentAvatarIcon = AVATARS.find(a => a.id === settings.profile?.avatarId)?.icon || User;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
            animation: 'fadeIn 0.2s'
        }}>
            <div style={{
                background: 'white', borderRadius: '16px',
                width: '100%', maxWidth: '400px',
                overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                transform: 'scale(1)', transition: 'all 0.2s',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                {/* Header with gradient background */}
                <div style={{
                    position: 'relative',
                    background: `linear-gradient(135deg, ${currentTheme.from} 0%, ${currentTheme.to} 100%)`,
                    padding: '24px', color: 'white', textAlign: 'center',
                    transition: 'background 0.3s ease'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '16px', right: '16px',
                            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                            padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    <button
                        onClick={() => {
                            const newShow = !showCustomize;
                            setShowCustomize(newShow);
                        }}
                        style={{
                            position: 'absolute', top: '16px', left: '16px',
                            background: showCustomize ? 'white' : 'rgba(255,255,255,0.2)',
                            border: 'none', borderRadius: '50%',
                            padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        title="Customize"
                    >
                        <Palette className={`w-5 h-5 ${showCustomize ? '' : 'text-white'}`} style={{ color: showCustomize ? currentTheme.from : 'white' }} />
                        {hasNewTitles && (
                            <span style={{
                                position: 'absolute', top: -2, right: -2,
                                width: '10px', height: '10px', background: '#e11d48',
                                borderRadius: '50%', border: '2px solid white',
                                boxShadow: '0 0 0 2px rgba(225, 29, 72, 0.2)',
                                zIndex: 10
                            }} />
                        )}
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '8px' }}>
                        <div style={{
                            width: '80px', height: '80px', background: 'white', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            border: '4px solid rgba(255,255,255,0.5)', marginBottom: '12px',
                            position: 'relative'
                        }}>
                            <CurrentAvatarIcon className={`w-10 h-10`} style={{ color: currentTheme.from }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            {isEditingName ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '4px', borderRadius: '4px' }}>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '18px', fontWeight: 'bold', width: '160px', textAlign: 'center' }}
                                        autoFocus
                                    />
                                    <button onClick={handleSaveName} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
                                        <Save className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                    {settings.profile?.name || 'Unknown'}
                                    <button onClick={() => setIsEditingName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', opacity: 0.8 }}>
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </h2>
                            )}
                        </div>

                        {/* Current Title Display - Enhanced visibility */}
                        <div style={{
                            fontSize: '13px',
                            background: settings.profile?.activeTitle ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.2)',
                            color: settings.profile?.activeTitle ? '#fff' : 'rgba(255,255,255,0.9)',
                            padding: '4px 14px',
                            borderRadius: '999px',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            border: settings.profile?.activeTitle ? '1.5px solid rgba(255,255,255,0.6)' : '1px solid transparent',
                            boxShadow: settings.profile?.activeTitle ? '0 2px 10px rgba(0,0,0,0.1)' : 'none',
                            marginTop: '4px'
                        }}>
                            {settings.profile?.activeTitle ? (t.titles[settings.profile.activeTitle as keyof typeof t.titles] || settings.profile.activeTitle) : t.titles.none}
                        </div>
                    </div>
                </div>

                {/* Customization Panel */}
                {showCustomize && (
                    <div style={{ background: '#f8fafc', padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Theme Section */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Palette className="w-3 h-3" /> Theme Color
                                </div>
                                {isEditingTheme ? (
                                    <button onClick={() => { handleUpdateProfile({ themeColor: tempTheme }); setIsEditingTheme(false); }} style={{ background: currentTheme.from, color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Save className="w-3 h-3" /> Save
                                    </button>
                                ) : (
                                    <button onClick={() => { setTempTheme(settings.profile?.themeColor || 'indigo'); setIsEditingTheme(true); }} style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Edit2 className="w-3 h-3" /> Edit
                                    </button>
                                )}
                            </div>
                            {isEditingTheme ? (
                                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                                    {THEME_COLORS.map(color => (
                                        <button
                                            key={color.id}
                                            onClick={() => setTempTheme(color.id)}
                                            style={{
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                background: `linear-gradient(135deg, ${color.from}, ${color.to})`,
                                                border: tempTheme === color.id ? '2px solid #1e293b' : '2px solid white',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexShrink: 0, cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `linear-gradient(135deg, ${currentTheme.from}, ${currentTheme.to})`, border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                            )}
                        </div>

                        {/* Avatar Section */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Shirt className="w-3 h-3" /> Avatar Icon
                                </div>
                                {isEditingAvatar ? (
                                    <button onClick={() => { handleUpdateProfile({ avatarId: tempAvatar }); setIsEditingAvatar(false); }} style={{ background: currentTheme.from, color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Save className="w-3 h-3" /> Save
                                    </button>
                                ) : (
                                    <button onClick={() => { setTempAvatar(settings.profile?.avatarId || 'user'); setIsEditingAvatar(true); }} style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Edit2 className="w-3 h-3" /> Edit
                                    </button>
                                )}
                            </div>
                            {isEditingAvatar ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                                    {AVATARS.map(avatar => (
                                        <button
                                            key={avatar.id}
                                            onClick={() => setTempAvatar(avatar.id)}
                                            style={{
                                                aspectRatio: '1', borderRadius: '8px',
                                                background: tempAvatar === avatar.id ? '#e2e8f0' : 'white',
                                                border: tempAvatar === avatar.id ? `2px solid ${currentTheme.from}` : '1px solid #e2e8f0',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', color: '#475569'
                                            }}
                                        >
                                            <avatar.icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ width: '36px', height: '36px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: currentTheme.from }}>
                                    <CurrentAvatarIcon className="w-5 h-5" />
                                </div>
                            )}
                        </div>

                        {/* Title Section */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Star className="w-3 h-3" /> Select Title
                                </div>
                                {isEditingTitle ? (
                                    <button
                                        onClick={() => {
                                            handleUpdateProfile({ activeTitle: tempTitle });
                                            setIsEditingTitle(false);
                                        }}
                                        style={{ background: currentTheme.from, color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <Save className="w-3 h-3" /> Save
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setTempTitle(settings.profile?.activeTitle);
                                            setIsEditingTitle(true);
                                            // 称号編集ボタンを押したときにすべての既読を処理
                                            const current = settings.profile?.unlockedTitles || [];
                                            localStorage.setItem('lastSeenTitles', JSON.stringify(current));
                                            setLastSeenTitlesState(current);
                                        }}
                                        style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}
                                    >
                                        <Edit2 className="w-3 h-3" /> Edit
                                        {hasNewTitles && (
                                            <span style={{
                                                position: 'absolute', top: -4, right: -4,
                                                width: '10px', height: '10px', background: '#e11d48',
                                                borderRadius: '50%', border: '2px solid white'
                                            }} />
                                        )}
                                    </button>
                                )}
                            </div>
                            {isEditingTitle ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    <button
                                        onClick={() => setTempTitle(undefined)}
                                        style={{
                                            padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                                            background: tempTitle === undefined ? currentTheme.from : 'white',
                                            color: tempTitle === undefined ? 'white' : '#64748b',
                                            border: `1px solid ${tempTitle === undefined ? currentTheme.from : '#e2e8f0'}`,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {t.titles.none}
                                    </button>
                                    {(settings.profile?.unlockedTitles || []).map(titleId => (
                                        <button
                                            key={titleId}
                                            onClick={() => setTempTitle(titleId)}
                                            style={{
                                                padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                                                background: tempTitle === titleId ? currentTheme.from : 'white',
                                                color: tempTitle === titleId ? 'white' : '#64748b',
                                                border: `1px solid ${tempTitle === titleId ? currentTheme.from : '#e2e8f0'}`,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {t.titles[titleId as keyof typeof t.titles] || titleId}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ fontSize: '13px', fontWeight: 700, color: currentTheme.from }}>
                                    {settings.profile?.activeTitle ? (t.titles[settings.profile.activeTitle as keyof typeof t.titles] || settings.profile.activeTitle) : t.titles.none}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Level Progress and stats section */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px', padding: '0 8px' }}>
                            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Lv.{levelData.level}</div>
                            <div style={{ color: currentTheme.from, fontWeight: 800, fontSize: '30px', lineHeight: 1 }}>{levelData.level}</div>
                            <div style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Lv.{levelData.level + 1}</div>
                        </div>
                        <div style={{
                            height: '16px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden',
                            border: '1px solid #e2e8f0', position: 'relative'
                        }}>
                            <div
                                style={{
                                    height: '100%', width: `${levelData.progress}%`,
                                    background: `linear-gradient(to right, ${currentTheme.from}, ${currentTheme.to})`,
                                    transition: 'width 1s ease-out'
                                }}
                            />
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b', fontWeight: 500, textAlign: 'right' }}>
                            Next: {(levelData.nextLevelXp - levelData.xp).toLocaleString()} XP
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{
                            background: '#fff7ed', padding: '16px', borderRadius: '12px',
                            border: '1px solid #ffedd5', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                            <div style={{ padding: '8px', background: '#ffedd5', borderRadius: '50%', marginBottom: '8px' }}>
                                <Trophy className="w-5 h-5 text-orange-600" />
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                                {Math.floor(levelData.totalEarnings / 10000).toLocaleString()}
                                <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#64748b', marginLeft: '4px' }}>万</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>生涯給与 (推計)</div>
                        </div>

                        <div style={{
                            background: '#eff6ff', padding: '16px', borderRadius: '12px',
                            border: '1px solid #dbeafe', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                            <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '50%', marginBottom: '8px' }}>
                                <Star className="w-5 h-5 text-blue-600" />
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                                {levelData.totalClasses.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>担当コマ数</div>
                        </div>

                        <div style={{
                            background: '#ecfdf5', padding: '16px', borderRadius: '12px',
                            border: '1px solid #d1fae5', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>{levelData.totalWorkDays}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>出勤日数</div>
                                </div>
                                <div style={{ height: '32px', width: '1px', background: '#a7f3d0' }}></div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>{levelData.xp.toLocaleString()}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Total XP</div>
                                </div>
                            </div>
                        </div>

                        {/* 獲得バッジ */}
                        <div style={{
                            background: '#fdf4ff', padding: '16px', borderRadius: '12px',
                            border: '1px solid #fae8ff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                            gridColumn: 'span 2', display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                            <div style={{ fontSize: '12px', color: '#a21caf', fontWeight: 600, textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>獲得バッジ</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                                        <Flame className="w-5 h-5 text-rose-500" />
                                        {totalBadges.streak}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>連勤</div>
                                </div>
                                <div style={{ width: '1px', background: '#fae8ff' }}></div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                        {totalBadges.earnings}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>給与</div>
                                </div>
                                <div style={{ width: '1px', background: '#fae8ff' }}></div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
                                        <Calendar className="w-5 h-5 text-blue-500" />
                                        {totalBadges.event}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>イベント</div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div style={{ fontSize: '12px', textAlign: 'center', color: '#9ca3af' }}>
                        ※データは端末(ブラウザ)ごと、またはバックアップデータに基づきます
                    </div>
                </div>
            </div>
        </div>
    );
};
