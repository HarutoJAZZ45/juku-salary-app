import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    ArrowLeft,
    Bell,
    Calendar,
    ChevronRight,
    Inbox,
    X,
} from 'lucide-react';
import { fetchAnnouncements } from '../services/announcements';
import type { Announcement } from '../types/announcement';
import { useTranslation } from '../contexts/LanguageContext';

interface NewsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (id: string) => void;
    selectedId: string | null;
    displayMode?: 'modal' | 'page';
}

const renderBody = (body: string) => (
    body.split(/(\*\*.*?\*\*)/).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={`${index}-${part}`} style={{ color: '#1e293b' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
    })
);

// お知らせ一覧・詳細画面
// Firestoreを唯一のお知らせデータ源とし、月末通知だけを端末内で生成する。
export const NewsModal: React.FC<NewsModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    selectedId,
    displayMode = 'modal',
}) => {
    const { t } = useTranslation();
    const [filter, setFilter] = useState<'all' | 'important' | 'update'>('all');
    const [firestoreItems, setFirestoreItems] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadFailed, setLoadFailed] = useState(false);
    const isPage = displayMode === 'page';

    useEffect(() => {
        if (!isOpen) return;

        let isActive = true;
        const load = async () => {
            setIsLoading(true);
            setLoadFailed(false);
            try {
                const items = await fetchAnnouncements();
                if (isActive) setFirestoreItems(items);
            } catch (error) {
                console.info('Failed to load Firestore announcements.', error);
                if (isActive) setLoadFailed(true);
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        void load();
        return () => {
            isActive = false;
        };
    }, [isOpen]);

    const allItems = useMemo(() => {
        const merged = new Map<string, Announcement>();

        firestoreItems.forEach(item => merged.set(item.id, item));

        const today = new Date();
        const isPayday = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0,
        ).getDate() === today.getDate();

        if (isPayday) {
            const id = `payday-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            merged.set(id, {
                id,
                title: t.app.paydayTitle,
                body: t.app.paydayContent,
                category: 'notice',
                important: false,
                publishedAtMs: today.getTime(),
                dateLabel: today.toLocaleDateString('ja-JP').replace(/\//g, '-'),
                source: 'system',
            });
        }

        return Array.from(merged.values()).sort(
            (a, b) => b.publishedAtMs - a.publishedAtMs,
        );
    }, [firestoreItems, t.app.paydayContent, t.app.paydayTitle]);

    const selectedItem = selectedId
        ? allItems.find(item => item.id === selectedId)
        : null;

    const filteredItems = allItems.filter(item => {
        if (filter === 'important') return item.important;
        if (filter === 'update') return item.category === 'update';
        return true;
    });

    if (!isOpen) return null;

    const headerTitle = selectedId ? 'お知らせ詳細' : t.app.newsTitle;

    return (
        <div
            style={{
                position: isPage ? 'static' : 'fixed',
                top: isPage ? undefined : 0,
                left: isPage ? undefined : 0,
                right: isPage ? undefined : 0,
                bottom: isPage ? undefined : 0,
                minHeight: isPage ? 'calc(100dvh - 40px)' : undefined,
                background: isPage ? 'transparent' : 'rgba(0,0,0,0.5)',
                backdropFilter: isPage ? undefined : 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: isPage ? undefined : 1100,
                animation: 'fadeIn 0.2s',
            }}
        >
            <div
                style={{
                    background: isPage ? 'rgba(255,255,255,0.9)' : 'white',
                    width: '100%',
                    maxWidth: '520px',
                    minHeight: isPage ? 'calc(100dvh - 40px)' : undefined,
                    maxHeight: isPage ? undefined : '80vh',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
                }}
            >
                <div
                    style={{
                        padding: '16px clamp(14px, 5vw, 24px)',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        background: '#f8fafc',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Inbox size={20} color="#3b82f6" />
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#334155' }}>{headerTitle}</h3>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label={selectedId ? 'お知らせ一覧へ戻る' : 'ホームへ戻る'}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex' }}
                        >
                            {isPage || selectedId
                                ? <ArrowLeft size={24} color="#64748b" />
                                : <X size={24} color="#64748b" />
                            }
                        </button>
                    </div>

                    {!selectedId && (
                        <div style={{ display: 'flex', gap: '6px', padding: '4px', background: '#e2e8f0', borderRadius: '12px', width: '100%' }}>
                            {([
                                ['all', t.app.newsFilterAll],
                                ['update', t.app.newsFilterUpdate],
                                ['important', t.app.newsFilterImportant],
                            ] as const).map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setFilter(value)}
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        background: filter === value ? 'white' : 'transparent',
                                        color: value === 'important' && filter === value ? '#e11d48' : filter === value ? '#0f172a' : '#64748b',
                                        padding: '7px 6px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        boxShadow: filter === value ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ flex: 1, overflowY: isPage ? 'visible' : 'auto' }}>
                    {selectedId ? (
                        selectedItem ? (
                            <article style={{ padding: 'clamp(18px, 5vw, 28px)' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                    {selectedItem.important && (
                                        <span style={{ background: '#e11d48', color: 'white', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px' }}>
                                            {t.app.newsFilterImportant}
                                        </span>
                                    )}
                                    {selectedItem.category === 'update' && (
                                        <span style={{ background: '#3b82f6', color: 'white', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px' }}>
                                            {t.app.newsFilterUpdate}
                                        </span>
                                    )}
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                                        <Calendar size={12} />
                                        {selectedItem.dateLabel}
                                    </span>
                                </div>
                                <h1 style={{ margin: '0 0 18px', fontSize: '22px', lineHeight: 1.45, color: '#1e293b' }}>
                                    {selectedItem.title}
                                </h1>
                                <div style={{ fontSize: '14px', lineHeight: 1.9, color: '#475569', whiteSpace: 'pre-wrap' }}>
                                    {renderBody(selectedItem.body)}
                                </div>
                                {selectedItem.imageUrl && (
                                    <div style={{ marginTop: '22px', textAlign: 'center' }}>
                                        <img
                                            src={selectedItem.imageUrl}
                                            alt={`${selectedItem.title}の添付画像`}
                                            loading="lazy"
                                            style={{ maxWidth: '100%', borderRadius: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                    </div>
                                )}
                            </article>
                        ) : (
                            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
                                <AlertCircle size={28} style={{ marginBottom: '10px' }} />
                                <p>{isLoading ? 'お知らせを読み込んでいます...' : '指定されたお知らせは見つかりませんでした。'}</p>
                            </div>
                        )
                    ) : (
                        <div>
                            {loadFailed && (
                                <div style={{ margin: '14px', padding: '10px 12px', borderRadius: '10px', background: '#fffbeb', color: '#92400e', fontSize: '12px', lineHeight: 1.6 }}>
                                    お知らせを取得できませんでした。通信状態またはFirestoreの設定を確認してください。
                                </div>
                            )}
                            {isLoading && (
                                <div style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px', borderBottom: '1px solid #e2e8f0' }}>
                                    最新のお知らせを確認中...
                                </div>
                            )}
                            {filteredItems.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#64748b', padding: '48px 24px' }}>{t.app.newsEmpty}</p>
                            ) : (
                                filteredItems.map(item => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => onSelect(item.id)}
                                        style={{
                                            width: '100%',
                                            padding: '15px clamp(14px, 5vw, 20px)',
                                            border: 'none',
                                            borderBottom: '1px solid #e2e8f0',
                                            background: item.important ? '#fff7f8' : 'transparent',
                                            display: 'grid',
                                            gridTemplateColumns: '32px minmax(0, 1fr) 20px',
                                            gap: '12px',
                                            alignItems: 'center',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <span style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '10px',
                                            background: item.important ? '#ffe4e6' : item.category === 'update' ? '#dbeafe' : '#f1f5f9',
                                            color: item.important ? '#e11d48' : item.category === 'update' ? '#2563eb' : '#64748b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Bell size={16} />
                                        </span>
                                        <span style={{ minWidth: 0 }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '11px', color: '#64748b' }}>{item.dateLabel}</span>
                                                {item.category === 'update' && (
                                                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#2563eb' }}>アップデート</span>
                                                )}
                                                {item.important && (
                                                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#e11d48' }}>重要</span>
                                                )}
                                            </span>
                                            <span style={{ display: 'block', fontSize: '14px', fontWeight: item.important ? 800 : 650, color: '#1e293b', lineHeight: 1.45 }}>
                                                {item.title}
                                            </span>
                                        </span>
                                        <ChevronRight size={18} color="#94a3b8" />
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
