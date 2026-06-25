import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ShieldCheck } from 'lucide-react';
import { db } from '../lib/firebase';
import { PRIVACY_VERSION, TERMS_VERSION } from '../legal/policies';
import type { LegalDocumentType } from '../legal/policies';
import { LegalDocumentModal } from './LegalDocumentModal';
import { useAuth } from '../hooks/useAuth';

interface LegalConsentGateProps {
    user: User;
    children: ReactNode;
}

type ConsentStatus = 'loading' | 'required' | 'accepted' | 'error';

const hasAcceptedCurrentLegal = (data: unknown): boolean => {
    if (!data || typeof data !== 'object') return false;
    const legalConsent = (data as { legalConsent?: unknown }).legalConsent;
    if (!legalConsent || typeof legalConsent !== 'object') return false;

    const consent = legalConsent as {
        termsVersion?: unknown;
        privacyVersion?: unknown;
        acceptedAt?: unknown;
    };

    return (
        consent.termsVersion === TERMS_VERSION &&
        consent.privacyVersion === PRIVACY_VERSION &&
        typeof consent.acceptedAt === 'string'
    );
};

export const LegalConsentGate = ({ user, children }: LegalConsentGateProps) => {
    const { signOut } = useAuth();
    const [status, setStatus] = useState<ConsentStatus>('loading');
    const [isChecked, setIsChecked] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [openDocument, setOpenDocument] = useState<LegalDocumentType | null>(null);

    useEffect(() => {
        let isActive = true;

        const loadConsent = async () => {
            setStatus('loading');

            try {
                const snapshot = await getDoc(doc(db, 'users', user.uid));
                if (!isActive) return;
                setStatus(hasAcceptedCurrentLegal(snapshot.data()) ? 'accepted' : 'required');
            } catch (error) {
                console.error('Failed to load legal consent:', error);
                if (isActive) setStatus('error');
            }
        };

        void loadConsent();

        return () => {
            isActive = false;
        };
    }, [user.uid]);

    const accept = async () => {
        if (!isChecked || isSaving) return;

        setIsSaving(true);
        try {
            const now = new Date().toISOString();
            await setDoc(doc(db, 'users', user.uid), {
                legalConsent: {
                    termsVersion: TERMS_VERSION,
                    privacyVersion: PRIVACY_VERSION,
                    acceptedAt: now,
                    termsAcceptedAt: now,
                    privacyAcceptedAt: now,
                },
                updatedAt: now,
            }, { merge: true });
            setStatus('accepted');
        } catch (error) {
            console.error('Failed to save legal consent:', error);
            setStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    if (status === 'accepted') return <>{children}</>;

    if (status === 'loading') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#64748b' }}>
                同意状況を確認しています...
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 48%, #ecfeff 100%)',
            color: '#334155',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '520px',
                padding: '28px',
                borderRadius: '28px',
                background: 'rgba(255,255,255,0.78)',
                boxShadow: '0 24px 60px rgba(15, 23, 42, 0.14)',
                border: '1px solid rgba(255,255,255,0.9)',
            }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '18px',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
                    color: 'white',
                }}>
                    <ShieldCheck size={30} />
                </div>

                <h1 style={{ fontSize: '22px', margin: '0 0 10px' }}>利用規約への同意が必要です</h1>
                <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#64748b', margin: '0 0 18px' }}>
                    勤務記録や給与設定などの大切なデータを安全に扱うため、利用規約とプライバシーポリシーを確認し、同意してください。
                    すでに登録済みの方にも、今回のバージョンから同意をお願いしています。
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <button
                        type="button"
                        onClick={() => setOpenDocument('terms')}
                        style={{
                            padding: '10px 12px',
                            borderRadius: '12px',
                            border: '1px solid #bfdbfe',
                            background: '#eff6ff',
                            color: '#2563eb',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        利用規約を読む
                    </button>
                    <button
                        type="button"
                        onClick={() => setOpenDocument('privacy')}
                        style={{
                            padding: '10px 12px',
                            borderRadius: '12px',
                            border: '1px solid #bae6fd',
                            background: '#f0f9ff',
                            color: '#0284c7',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        プライバシーポリシーを読む
                    </button>
                </div>

                <label style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    padding: '12px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    fontSize: '13px',
                    lineHeight: 1.6,
                    marginBottom: '16px',
                }}>
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={event => setIsChecked(event.target.checked)}
                        style={{ marginTop: '3px' }}
                    />
                    <span>利用規約とプライバシーポリシーを確認し、内容に同意します。</span>
                </label>

                {status === 'error' && (
                    <div style={{ marginBottom: '14px', padding: '10px 12px', borderRadius: '12px', background: '#fef2f2', color: '#b91c1c', fontSize: '13px' }}>
                        同意状況の確認または保存に失敗しました。通信状況を確認して、もう一度お試しください。
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        type="button"
                        onClick={accept}
                        disabled={!isChecked || isSaving}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '14px',
                            border: 'none',
                            background: isChecked ? 'linear-gradient(135deg, #6366f1, #0ea5e9)' : '#cbd5e1',
                            color: 'white',
                            fontWeight: 800,
                            cursor: isChecked && !isSaving ? 'pointer' : 'not-allowed',
                        }}
                    >
                        {isSaving ? '保存中...' : '同意して利用を開始'}
                    </button>
                    <button
                        type="button"
                        onClick={() => signOut()}
                        style={{
                            padding: '12px',
                            borderRadius: '14px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            color: '#64748b',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        ログアウト
                    </button>
                </div>
            </div>

            <LegalDocumentModal type={openDocument} onClose={() => setOpenDocument(null)} />
        </div>
    );
};
