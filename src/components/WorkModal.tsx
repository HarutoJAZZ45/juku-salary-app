import React, { useState } from 'react';
import type { WorkEntry, WorkBlock, Location, UserSettings, Campus } from '../types';
import { X, Clock, Train, Trash2, MapPin } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { format } from 'date-fns';

interface WorkModalProps {
    isOpen: boolean;
    date: Date | Date[] | null;
    entry: WorkEntry | undefined;
    onClose: () => void;
    onSave: (date: string, data: Partial<WorkEntry>) => void;
    onDelete: (date: string) => Promise<void>;
    settings: UserSettings;
    onSaveComplete?: () => void;
}

const BLOCKS: WorkBlock[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const CAMPUSES: Campus[] = ['平岡', '新札幌', '月寒', '円山', '北大前'];


// 勤務入力・編集モーダル
// コマ、業務、手当などの詳細な勤務内容を入力する
export const WorkModal: React.FC<WorkModalProps> = ({ isOpen, date, entry, onClose, onSave, onDelete, settings, onSaveComplete }) => {
    const { t } = useTranslation();
    const [isDeleting, setIsDeleting] = React.useState(false);

    // 一括編集モード（複数日が選択されている場合）の判定
    const isBatchMode = Array.isArray(date);
    const dateList = isBatchMode ? date : date ? [date] : [];
    const displayDate = isBatchMode
        ? `${dateList.length}${t.workModal.batchTitle}`
        : date ? `${date.toLocaleDateString()} ${t.workModal.editTitle}` : '';
    const singleDate = !isBatchMode && date ? date : null;
    const defaultCampus = settings.defaultCampus || '平岡';

    // 状態管理（フォーム入力値）
    const [dateStr] = useState(() => singleDate ? format(singleDate, 'yyyy-MM-dd') : '');
    const [selectedBlocks, setSelectedBlocks] = useState<WorkBlock[]>(entry?.selectedBlocks || []);

    const [supportMinutes, setSupportMinutes] = useState(entry ? entry.supportMinutes : 0);
    const [allowance, setAllowance] = useState(entry ? entry.allowanceAmount : 0);
    const [hasTransport, setHasTransport] = useState(entry ? entry.hasTransport : true);

    // 勤務地・校舎・交通費（デフォルト設定から自動入力もされる）
    const [campus, setCampus] = useState<Campus>(entry?.campus || defaultCampus);
    const [location, setLocation] = useState<Location>(
        entry ? (entry.location || 'hiraoka') : defaultCampus === '平岡' ? 'hiraoka' : 'other'
    );
    const [transportCost, setTransportCost] = useState(
        entry
            ? (entry.transportCost !== undefined ? entry.transportCost : settings.transportCost)
            : (settings.campusTransportRates?.[defaultCampus] ?? settings.transportCost)
    );

    // 役職手当（リーダー・サブリーダー）の状態
    const [leaderBlocks, setLeaderBlocks] = useState<WorkBlock[]>(entry?.leaderBlocks || []);
    const [subLeaderBlocks, setSubLeaderBlocks] = useState<WorkBlock[]>(entry?.subLeaderBlocks || []);
    const [isRoleExpanded, setIsRoleExpanded] = useState(false);

    if (!isOpen || !date) return null;

    // 校舎変更時の処理（勤務地タイプと交通費を自動更新）
    const handleCampusChange = (newCampus: Campus) => {
        setCampus(newCampus);

        // 平岡かそれ以外かで勤務地手当（800円/400円）が切り替わる
        const newLocation: Location = newCampus === '平岡' ? 'hiraoka' : 'other';
        setLocation(newLocation);

        // 設定値から交通費を取得
        const cost = settings.campusTransportRates?.[newCampus] ?? settings.transportCost;
        setTransportCost(cost);
    };

    const handleSave = () => {
        const dataToSave = {
            selectedBlocks,
            leaderBlocks,
            subLeaderBlocks,
            supportMinutes,
            allowanceAmount: allowance,
            hasTransport,
            transportCost: hasTransport ? transportCost : undefined,
            location,
            campus
        };

        // 保存処理（一括または単一）
        dateList.forEach(d => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const da = String(d.getDate()).padStart(2, '0');
            const dStr = `${y}-${m}-${da}`;
            onSave(dStr, dataToSave);
        });

        onClose();
        if (onSaveComplete) onSaveComplete();
    };

    // ... (keeps toggles same)

    const toggleBlock = (block: WorkBlock) => {
        if (selectedBlocks.includes(block)) {
            setLeaderBlocks(prev => prev.filter(b => b !== block));
            setSubLeaderBlocks(prev => prev.filter(b => b !== block));
        }
        setSelectedBlocks(prev => {
            if (prev.includes(block)) {
                return prev.filter(b => b !== block);
            } else {
                return [...prev, block].sort();
            }
        });
    };

    const toggleLeader = (block: WorkBlock) => {
        setLeaderBlocks(prev => {
            if (prev.includes(block)) return prev.filter(b => b !== block);
            return [...prev, block];
        });
        // Remove from SubLeader if present
        setSubLeaderBlocks(prev => prev.filter(b => b !== block));
        // Auto-select in main blocks
        if (!selectedBlocks.includes(block)) {
            toggleBlock(block);
        }
    };

    // サブリーダーの切り替えロジック
    const toggleSubLeader = (block: WorkBlock) => {
        setSubLeaderBlocks(prev => {
            if (prev.includes(block)) return prev.filter(b => b !== block);
            return [...prev, block];
        });
        // リーダーからは除外（重複不可）
        setLeaderBlocks(prev => prev.filter(b => b !== block));
        // メインのコマも自動選択
        if (!selectedBlocks.includes(block)) {
            toggleBlock(block);
        }
    };

    const handleDelete = async () => {
        const confirmed = isBatchMode
            ? window.confirm(`${dateList.length}${t.workModal.batchDeleteConfirm}`)
            : window.confirm(t.workModal.deleteConfirm);

        if (!confirmed || isDeleting) return;

        setIsDeleting(true);
        try {
            if (isBatchMode) {
                for (const targetDate of dateList) {
                    await onDelete(format(targetDate, 'yyyy-MM-dd'));
                }
            } else {
                await onDelete(dateStr);
            }

            onClose();
            if (onSaveComplete) onSaveComplete();
        } catch (error) {
            console.error('Failed to delete work entries:', error);
            window.alert('削除内容をクラウドへ保存できませんでした。通信状態を確認して、もう一度お試しください。');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, animation: 'fadeIn 0.2s'
        }} onClick={onClose}>
            <div style={{
                background: 'white',
                width: '90%', maxWidth: '360px',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                display: 'flex', flexDirection: 'column', gap: '20px',
                maxHeight: '90vh', overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px' }}>{displayDate}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                {/* 校舎選択 (v2.5で追加) */}
                <div className="input-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                        <MapPin size={16} /> {t.workModal.campus}
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {CAMPUSES.map(c => (
                            <button
                                key={c}
                                onClick={() => handleCampusChange(c)}
                                style={{
                                    padding: '8px 4px', fontSize: '12px', borderRadius: '8px',
                                    border: '1px solid',
                                    borderColor: campus === c ? 'var(--primary)' : '#e2e8f0',
                                    background: campus === c ? 'var(--primary-light)' : '#f8fafc',
                                    color: campus === c ? 'white' : '#64748b',
                                    fontWeight: campus === c ? 700 : 500,
                                    cursor: 'pointer'
                                }}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                    {/* Display Location Allowance Info */}
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', textAlign: 'right' }}>
                        {t.workModal.locationAllowance.replace('{amount}', location === 'hiraoka' ? '800' : '400')}
                    </div>
                </div>

                {/* コマ選択 */}
                <div className="input-group">
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{t.workModal.koma}</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {BLOCKS.map(block => {
                            const isSelected = selectedBlocks.includes(block);
                            let bg = isSelected ? 'var(--primary)' : '#f1f5f9';
                            if (leaderBlocks.includes(block)) bg = '#7c3aed'; // Purple for Leader
                            if (subLeaderBlocks.includes(block)) bg = '#059669'; // Green for SubLeader

                            return (
                                <button
                                    key={block}
                                    onClick={() => toggleBlock(block)}
                                    style={{
                                        width: '40px', height: '40px',
                                        borderRadius: '50%',
                                        border: 'none',
                                        background: bg,
                                        color: isSelected ? 'white' : '#64748b',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s',
                                        boxShadow: (leaderBlocks.includes(block) || subLeaderBlocks.includes(block)) ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                                    }}
                                >
                                    {block}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Role Pay Collapsible */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                    <button
                        type="button"
                        onClick={() => setIsRoleExpanded(!isRoleExpanded)}
                        style={{
                            width: '100%', padding: '12px 16px', background: '#f8fafc', border: 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer',
                            minHeight: '48px'
                        }}
                    >
                        <span>{t.workModal.rolePay}</span>
                        <span style={{ transform: isRoleExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                    </button>

                    {isRoleExpanded && (
                        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: 'white' }}>
                            {/* Leader Row */}
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: '#7c3aed', fontWeight: 700, marginBottom: '6px' }}>
                                    {t.workModal.leader} (2000円)
                                </label>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {BLOCKS.map(block => (
                                        <button
                                            key={block}
                                            onClick={() => toggleLeader(block)}
                                            style={{
                                                width: '32px', height: '32px', borderRadius: '6px',
                                                border: '1px solid',
                                                borderColor: leaderBlocks.includes(block) ? '#7c3aed' : '#e2e8f0',
                                                background: leaderBlocks.includes(block) ? '#7c3aed' : 'white',
                                                color: leaderBlocks.includes(block) ? 'white' : '#64748b',
                                                fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                                            }}
                                        >
                                            {block}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* SubLeader Row */}
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: '#059669', fontWeight: 700, marginBottom: '6px' }}>
                                    {t.workModal.subLeader} (1500円)
                                </label>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {BLOCKS.map(block => (
                                        <button
                                            key={block}
                                            onClick={() => toggleSubLeader(block)}
                                            style={{
                                                width: '32px', height: '32px', borderRadius: '6px',
                                                border: '1px solid',
                                                borderColor: subLeaderBlocks.includes(block) ? '#059669' : '#e2e8f0',
                                                background: subLeaderBlocks.includes(block) ? '#059669' : 'white',
                                                color: subLeaderBlocks.includes(block) ? 'white' : '#64748b',
                                                fontSize: '12px', fontWeight: 600, cursor: 'pointer'
                                            }}
                                        >
                                            {block}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Support Section */}
                <div className="input-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                        <Clock size={16} /> {t.workModal.supportWork}
                    </label>
                    <input
                        type="number"
                        value={supportMinutes}
                        onChange={e => setSupportMinutes(Number(e.target.value))}
                        step={15}
                        style={{ width: '100%' }}
                        placeholder="0"
                    />
                </div>

                {/* Allowance */}
                <div className="input-group">
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{t.workModal.allowanceLabel}</label>
                    <input
                        type="number"
                        value={allowance}
                        onChange={e => setAllowance(Number(e.target.value))}
                        placeholder="0"
                    />
                </div>

                {/* Transport */}
                <div className="input-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer' }}>
                            <Train size={18} /> {t.workModal.transportLabel}
                            <input
                                type="checkbox"
                                checked={hasTransport}
                                onChange={e => setHasTransport(e.target.checked)}
                                style={{ width: '20px', height: '20px', margin: 0 }}
                            />
                        </label>
                    </div>
                    {hasTransport && (
                        <div style={{ width: '100px' }}>
                            <input
                                type="number"
                                value={transportCost}
                                onChange={e => setTransportCost(Number(e.target.value))}
                                style={{ textAlign: 'right' }}
                            />
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                    <button onClick={handleDelete} disabled={isDeleting} style={{
                        padding: '12px', borderRadius: '12px', border: 'none',
                        background: '#fee2e2', color: '#ef4444',
                        fontWeight: 700, cursor: isDeleting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        opacity: isDeleting ? 0.65 : 1,
                    }}>
                        <Trash2 size={18} /> {isDeleting ? '削除中...' : t.common.delete}
                    </button>
                    <button className="glass-btn" onClick={handleSave} disabled={isDeleting} style={{ width: '100%', margin: 0, background: 'var(--primary)', color: 'white' }}>
                        {t.common.save}
                    </button>
                </div>

            </div>
        </div>
    );
};
