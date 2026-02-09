import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// ユーザーが自分のフォームを作成して、ここのURLを置き換える
// 例: "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true"
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc6jhYJI8qr-zAa4pSursUM1nvsjTYtmnj3ghAarDV0hOeKxg/viewform?embedded=true";

// フィードバックモーダル
// Googleフォームを埋め込んでユーザーからの意見を受け付ける
export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
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
                width: '90%', maxWidth: '600px', height: '80vh',
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
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#334155' }}>ご意見・ご要望</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, position: 'relative', background: 'white' }}>
                    {GOOGLE_FORM_URL ? (
                        <iframe
                            src={GOOGLE_FORM_URL}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            marginHeight={0}
                            marginWidth={0}
                            title="Feedback Form"
                            style={{ display: 'block' }}
                        >
                            読み込んでいます…
                        </iframe>
                    ) : (
                        <div style={{
                            height: '100%', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            padding: '32px', textAlign: 'center', color: '#64748b'
                        }}>
                            <div style={{ marginBottom: '16px', padding: '16px', background: '#eff6ff', borderRadius: '50%' }}>
                                <ExternalLink size={48} color="#3b82f6" />
                            </div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e293b' }}>フォームが設定されていません</h4>
                            <p style={{ maxWidth: '400px', lineHeight: '1.6', fontSize: '14px' }}>
                                この機能を使うには、Googleフォームを作成してURLを設定する必要があります。<br />
                                <br />
                                1. <a href="https://forms.google.com" target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>Googleフォーム</a>でフォームを作成<br />
                                2. 「送信」→「埋め込みHTML」からリンクを取得<br />
                                3. コード内の <code>GOOGLE_FORM_URL</code> に貼り付け
                            </p>
                            <button
                                onClick={onClose}
                                style={{
                                    marginTop: '24px', padding: '10px 24px',
                                    background: '#f1f5f9', border: 'none', borderRadius: '8px',
                                    color: '#475569', fontWeight: 600, cursor: 'pointer'
                                }}
                            >
                                閉じる
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
