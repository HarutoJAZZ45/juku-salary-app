import React from 'react';
import { X, Trophy, Flame } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface BadgeHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// バッジヘルプモーダル
// バッジの獲得条件や種類の一覧を表示する
export const BadgeHelpModal: React.FC<BadgeHelpModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const streakBadges = [
        { tier: 'gold', label: t.badges.streakGold, color: '#fbbf24' },
        { tier: 'silver', label: t.badges.streakSilver, color: '#94a3b8' }, // Slate-400
        { tier: 'bronze', label: t.badges.streakBronze, color: '#CD7F32' },
    ];

    const earnBadges = [
        { tier: 'platinum', label: t.badges.earnPlatinum, desc: t.badges.earnPlatinumDesc, color: '#818cf8' },
        { tier: 'gold', label: t.badges.earnGold, desc: t.badges.earnGoldDesc, color: '#fbbf24' },
        { tier: 'silver', label: t.badges.earnSilver, desc: t.badges.earnSilverDesc, color: '#94a3b8' },
        { tier: 'bronze', label: t.badges.earnBronze, desc: t.badges.earnBronzeDesc, color: '#CD7F32' },
    ];

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1200, animation: 'fadeIn 0.2s'
        }} onClick={onClose}>
            <div style={{
                background: 'white',
                width: '90%', maxWidth: '400px', maxHeight: '80vh',
                borderRadius: '24px',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#f8fafc'
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#334155' }}>{t.badges.modalTitle} 🏆</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px', overflowY: 'auto' }}>
                    <p style={{ marginTop: 0, marginBottom: '24px', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                        {t.badges.modalDesc}
                    </p>

                    {/* Streak Section */}
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Flame size={16} /> Streak Badges
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                        {streakBadges.map((b, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div style={{ background: 'rgba(255,255,255,0.5)', padding: '8px', borderRadius: '50%', flexShrink: 0 }}>
                                    <Flame color={b.color} size={24} fill={b.color} fillOpacity={0.6} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{b.label}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{t.badges.streakDesc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Earnings Section */}
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#475569', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Trophy size={16} /> Earnings Badges
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {earnBadges.map((b, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div style={{ background: 'rgba(255,255,255,0.5)', padding: '8px', borderRadius: '50%', flexShrink: 0 }}>
                                    <Trophy color={b.color} size={24} fill={b.color} fillOpacity={0.6} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{b.label}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{b.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Event Badge Message */}
                    <div style={{
                        marginTop: '32px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                        borderRadius: '16px',
                        border: '1px solid #bae6fd',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{ fontSize: '24px' }}>🎁</div>
                        <div style={{ fontSize: '13px', color: '#0369a1', lineHeight: '1.5', fontWeight: 500 }}>
                            その他にイベントに応じてさまざまなバッジを獲得できます。季節限定のバッジをお楽しみに！
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
