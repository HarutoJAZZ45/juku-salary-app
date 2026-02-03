import React from 'react';
import { X, Calendar } from 'lucide-react';
import { NEWS_ITEMS } from '../data/news';

interface NewsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

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
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#f8fafc'
                }}>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#334155' }}>お知らせ 🔔</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                {/* Content List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    {NEWS_ITEMS.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748b', marginTop: '32px' }}>お知らせはありません</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {NEWS_ITEMS.map((item) => (
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
                                                background: '#e11d48', color: 'white', fontSize: '11px', fontWeight: 700,
                                                padding: '2px 8px', borderRadius: '999px'
                                            }}>
                                                重要
                                            </span>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}>
                                            <Calendar size={12} />
                                            {item.date}
                                        </div>
                                    </div>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b' }}>{item.title}</h4>
                                    <div style={{
                                        margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#475569',
                                        whiteSpace: 'pre-wrap' // Preserve newlines
                                    }}>
                                        {item.content.split(/(\*\*.*?\*\*)/).map((part, i) => {
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
