import React from 'react';
import { X, Calendar } from 'lucide-react';
import { NEWS_ITEMS } from '../data/news';
import { useTranslation } from '../contexts/LanguageContext';

interface NewsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose }) => {
    const { t, language } = useTranslation();
    const [filter, setFilter] = React.useState<'all' | 'important' | 'update'>('all');

    if (!isOpen) return null;

    // Check if today is the last day of the month
    const today = new Date();
    const isPayday = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() === today.getDate();

    const allItems = [...NEWS_ITEMS];

    // Prepend Payday notification if applicable
    if (isPayday) {
        allItems.unshift({
            id: `payday-${today.toISOString().split('T')[0]}`,
            date: today.toLocaleDateString('ja-JP').replace(/\//g, '-'),
            title: { ja: t.app.paydayTitle, en: t.app.paydayTitle, es: t.app.paydayTitle },
            content: { ja: t.app.paydayContent, en: t.app.paydayContent, es: t.app.paydayContent },
            category: 'notice',
            important: false,
        });
    }

    const filteredItems = allItems.filter(item => {
        if (filter === 'important') return item.important;
        if (filter === 'update') return item.category === 'update';
        return true;
    });

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100, animation: 'fadeIn 0.2s'
        }} onClick={onClose}>
            <div style={{
                background: 'white',
                width: '90%', maxWidth: '500px', maxHeight: '80vh',
                borderRadius: '24px',
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                    background: '#f8fafc'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#334155' }}>{t.app.newsTitle} 🔔</h3>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                            <X size={24} color="#64748b" />
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{ display: 'flex', gap: '8px', padding: '4px', background: '#e2e8f0', borderRadius: '12px', width: 'fit-content' }}>
                        <button
                            onClick={() => setFilter('all')}
                            style={{
                                border: 'none',
                                background: filter === 'all' ? 'white' : 'transparent',
                                color: filter === 'all' ? '#0f172a' : '#64748b',
                                padding: '6px 16px', borderRadius: '8px',
                                fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: filter === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {t.app.newsFilterAll}
                        </button>
                        <button
                            onClick={() => setFilter('update')}
                            style={{
                                border: 'none',
                                background: filter === 'update' ? 'white' : 'transparent',
                                color: filter === 'update' ? '#0f172a' : '#64748b',
                                padding: '6px 16px', borderRadius: '8px',
                                fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: filter === 'update' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {t.app.newsFilterUpdate}
                        </button>
                        <button
                            onClick={() => setFilter('important')}
                            style={{
                                border: 'none',
                                background: filter === 'important' ? 'white' : 'transparent',
                                color: filter === 'important' ? '#e11d48' : '#64748b',
                                padding: '6px 16px', borderRadius: '8px',
                                fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer', transition: 'all 0.2s',
                                boxShadow: filter === 'important' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {t.app.newsFilterImportant}
                        </button>
                    </div>
                </div>

                {/* Content List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    {filteredItems.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748b', marginTop: '32px' }}>{t.app.newsEmpty}</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {filteredItems.map((item) => (
                                <div key={item.id} style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    background: item.important ? '#fff1f2' : 'white',
                                    borderColor: item.important ? '#fecdd3' : '#e2e8f0'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        {item.important && (
                                            <span style={{
                                                background: '#e11d48', color: 'white', fontSize: '10px', fontWeight: 700,
                                                padding: '2px 8px', borderRadius: '999px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {t.app.newsFilterImportant}
                                            </span>
                                        )}
                                        {item.category === 'update' && (
                                            <span style={{
                                                background: '#3b82f6', color: 'white', fontSize: '10px', fontWeight: 700,
                                                padding: '2px 8px', borderRadius: '999px',
                                                textTransform: 'uppercase'
                                            }}>
                                                {t.app.newsFilterUpdate}
                                            </span>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                                            <Calendar size={12} />
                                            {item.date}
                                        </div>
                                    </div>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b' }}>{item.title[language]}</h4>
                                    <div style={{
                                        margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#475569',
                                        whiteSpace: 'pre-wrap' // Preserve newlines
                                    }}>
                                        {item.content[language].split(/(\*\*.*?\*\*)/).map((part, i) => {
                                            if (part.startsWith('**') && part.endsWith('**')) {
                                                return <strong key={i} style={{ color: '#1e293b' }}>{part.slice(2, -2)}</strong>;
                                            }
                                            return part;
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
