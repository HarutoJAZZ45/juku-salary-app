import React, { useState } from 'react';
import { X, LogOut, User, Cloud, Mail, ArrowLeft, UserPlus, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../contexts/LanguageContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'reset';

const inputStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
};

const primaryButtonStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '12px',
    background: '#334155',
    color: 'white',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
    cursor: 'pointer',
};

const secondaryTextButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#0ea5e9',
    fontSize: '13px',
    cursor: 'pointer',
};

const noteStyle: React.CSSProperties = {
    margin: 0,
    padding: '10px 12px',
    borderRadius: '12px',
    background: '#f8fafc',
    color: '#64748b',
    fontSize: '12px',
    lineHeight: 1.6,
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const {
        user,
        signInWithGoogle,
        signUpWithEmail,
        loginWithEmail,
        signOut,
        resendVerification,
        sendPasswordReset,
    } = useAuth();
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    if (!isOpen) return null;

    const switchMode = (nextMode: AuthMode) => {
        setMode(nextMode);
        setPassword('');
        setPasswordConfirmation('');
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Login failed:', error);
            alert('ログインできませんでした。時間をおいてもう一度お試しください。');
        }
    };

    const handleEmailAuth = async (event: React.FormEvent) => {
        event.preventDefault();

        if (mode === 'register' && password !== passwordConfirmation) {
            alert('確認用パスワードが一致しません。');
            return;
        }

        setAuthLoading(true);
        try {
            if (mode === 'register') {
                await signUpWithEmail(email, password);
                alert('確認メールを送信しました。迷惑メールフォルダに入る場合があります。メール内の案内を確認してください。');
                return;
            }

            await loginWithEmail(email, password);
        } catch (error) {
            console.error('Email auth failed:', error);
            alert(mode === 'register'
                ? '新規登録できませんでした。メールアドレスとパスワードを確認してください。'
                : 'ログインできませんでした。メールアドレスとパスワードを確認してください。');
        } finally {
            setAuthLoading(false);
        }
    };

    const handlePasswordReset = async (event: React.FormEvent) => {
        event.preventDefault();
        const targetEmail = email.trim();
        if (!targetEmail) return;

        setAuthLoading(true);
        try {
            await sendPasswordReset(targetEmail);
            alert('パスワード再設定メールを送信しました。迷惑メールフォルダに入る場合があります。メール内の案内に従って変更してください。');
            switchMode('login');
        } catch (error) {
            console.error('Password reset failed:', error);
            alert('パスワード再設定メールを送信できませんでした。メールアドレスを確認してください。');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
    };

    const heading = mode === 'register'
        ? '新規登録'
        : mode === 'reset'
            ? 'パスワード再設定'
            : t.auth.login;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 3000,
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'fadeIn 0.2s',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    width: '90%',
                    maxWidth: '360px',
                    borderRadius: '24px',
                    padding: '24px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
                onClick={event => event.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        {mode === 'login' ? <Cloud size={20} /> : mode === 'register' ? <UserPlus size={20} /> : <KeyRound size={20} />}
                        {heading}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                {user ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                        <div
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                            ) : (
                                <User size={32} color="#64748b" />
                            )}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 600 }}>{user.displayName || 'User'}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
                        </div>

                        {!user.emailVerified && user.providerData.some(provider => provider.providerId === 'password') && (
                            <div
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#fff7ed',
                                    border: '1px solid #ffedd5',
                                    borderRadius: '12px',
                                    color: '#9a3412',
                                    fontSize: '13px',
                                    textAlign: 'center',
                                }}
                            >
                                <div>{t.auth.notVerified}</div>
                                <div style={{ marginTop: '4px', fontSize: '12px', lineHeight: 1.5 }}>
                                    確認メールは迷惑メールフォルダに入る場合があります。
                                </div>
                                <button
                                    onClick={async () => {
                                        try {
                                            await resendVerification();
                                            alert('確認メールを再送信しました。迷惑メールフォルダに入る場合があります。');
                                        } catch {
                                            alert('再送信できませんでした。時間をおいてもう一度お試しください。');
                                        }
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ea580c',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        textDecoration: 'underline',
                                        marginTop: '4px',
                                    }}
                                >
                                    {t.auth.resendVerification}
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                background: 'white',
                                color: '#e11d48',
                                fontWeight: 600,
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                        >
                            <LogOut size={18} /> {t.auth.logout}
                        </button>
                    </div>
                ) : mode === 'reset' ? (
                    <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: 1.7 }}>
                            登録済みのメールアドレスを入力してください。パスワード再設定用のメールを送信します。
                        </p>
                        <input
                            type="email"
                            placeholder={t.auth.email}
                            value={email}
                            onChange={event => setEmail(event.target.value)}
                            required
                            style={inputStyle}
                        />
                        <p style={{ ...noteStyle, background: '#fff7ed', color: '#9a3412' }}>
                            再設定メールは迷惑メールフォルダに入る場合があります。届かない場合は迷惑メールも確認してください。
                        </p>
                        <button type="submit" disabled={authLoading} style={primaryButtonStyle}>
                            <Mail size={18} /> 再設定メールを送信
                        </button>
                        <button type="button" onClick={() => switchMode('login')} style={secondaryTextButtonStyle}>
                            <ArrowLeft size={14} style={{ verticalAlign: '-2px', marginRight: '4px' }} />
                            ログインに戻る
                        </button>
                    </form>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {mode === 'register' && (
                                <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: 1.7 }}>
                                    メールアドレスとパスワードで新しく登録します。登録後、確認メールを送信します。
                                </p>
                            )}
                            <input
                                type="email"
                                placeholder={t.auth.email}
                                value={email}
                                onChange={event => setEmail(event.target.value)}
                                required
                                style={inputStyle}
                            />
                            <input
                                type="password"
                                placeholder={t.auth.password}
                                value={password}
                                onChange={event => setPassword(event.target.value)}
                                required
                                minLength={6}
                                style={inputStyle}
                            />
                            {mode === 'register' && (
                                <>
                                    <input
                                        type="password"
                                        placeholder="パスワード確認"
                                        value={passwordConfirmation}
                                        onChange={event => setPasswordConfirmation(event.target.value)}
                                        required
                                        minLength={6}
                                        style={inputStyle}
                                    />
                                    <p style={{ ...noteStyle, background: '#fff7ed', color: '#9a3412' }}>
                                        確認メールは迷惑メールフォルダに入る場合があります。登録後、届かない場合は迷惑メールも確認してください。
                                    </p>
                                </>
                            )}
                            <button type="submit" disabled={authLoading} style={primaryButtonStyle}>
                                <Mail size={18} /> {mode === 'register' ? t.auth.register : t.auth.login}
                            </button>
                        </form>

                        {mode === 'login' ? (
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <button type="button" onClick={() => switchMode('register')} style={secondaryTextButtonStyle}>
                                    新規登録はこちら
                                </button>
                                <button type="button" onClick={() => switchMode('reset')} style={{ ...secondaryTextButtonStyle, color: '#64748b', textDecoration: 'underline' }}>
                                    パスワードを忘れた場合
                                </button>
                            </div>
                        ) : (
                            <button type="button" onClick={() => switchMode('login')} style={secondaryTextButtonStyle}>
                                <ArrowLeft size={14} style={{ verticalAlign: '-2px', marginRight: '4px' }} />
                                ログインに戻る
                            </button>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            style={{
                                padding: '12px',
                                borderRadius: '12px',
                                background: '#4285F4',
                                color: 'white',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            {t.auth.googleLogin}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
