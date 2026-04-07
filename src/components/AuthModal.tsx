import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../contexts/LanguageContext';
import { X, LogOut, User, Cloud, Mail } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { user, signInWithGoogle, loginAnonymously, signUpWithEmail, loginWithEmail, signOut, syncDataToCloud } = useAuth();
    const [isSyncing, setIsSyncing] = useState(false);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);

    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed.");
        }
    };

    const handleAnonymousLogin = async () => {
        try {
            await loginAnonymously();
        } catch (error) {
            console.error("Anonymous login failed:", error);
            alert("Login failed.");
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthLoading(true);
        try {
            if (isSignUp) {
                await signUpWithEmail(email, password);
            } else {
                await loginWithEmail(email, password);
            }
        } catch (error) {
            console.error("Email auth failed:", error);
            alert("Authentication failed. Please check your email and password.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
    };

    const handleSync = async () => {
        if (!user) return;
        setIsSyncing(true);
        try {
            const entriesStr = localStorage.getItem('juku_salary_entries');
            const configStr = localStorage.getItem('juku_salary_config');
            const entries = entriesStr ? JSON.parse(entriesStr) : {};
            const config = configStr ? JSON.parse(configStr) : {};

            await syncDataToCloud(entries, config);
            alert(t.auth.syncSuccess);
        } catch (error) {
            console.error(error);
            alert("Sync failed.");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 3000,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s'
        }} onClick={onClose}>
            <div style={{
                background: 'white', width: '90%', maxWidth: '360px', borderRadius: '24px', padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '20px',
                maxHeight: '90vh', overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Cloud size={20} /> {t.auth.login}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                {user ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%',
                            background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                            ) : (
                                <User size={32} color="#64748b" />
                            )}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 600 }}>{user.displayName || "Guest"}</div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email || "Anonymous Account"}</div>
                        </div>

                        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                            {t.auth.loginToSync}
                        </p>

                        <button onClick={handleSync} disabled={isSyncing} className="primary-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <Cloud size={18} /> {isSyncing ? t.auth.syncingData : t.auth.syncData}
                        </button>

                        <button onClick={handleLogout} style={{
                            width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px',
                            background: 'white', color: '#e11d48', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: '8px'
                        }}>
                            <LogOut size={18} /> {t.auth.logout}
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input
                                type="email"
                                placeholder={t.auth.email}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                            />
                            <input
                                type="password"
                                placeholder={t.auth.password}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                            />
                            <button type="submit" disabled={authLoading} style={{
                                padding: '12px', borderRadius: '12px', background: '#334155', color: 'white',
                                fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none'
                            }}>
                                <Mail size={18} /> {isSignUp ? t.auth.register : t.auth.login}
                            </button>
                            <button type="button" onClick={() => setIsSignUp(!isSignUp)} style={{
                                background: 'none', border: 'none', color: '#0ea5e9', fontSize: '13px', cursor: 'pointer', marginTop: '-4px'
                            }}>
                                {isSignUp ? t.auth.switchToLogin : t.auth.switchToRegister}
                            </button>
                        </form>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
                        </div>

                        <button onClick={handleGoogleLogin} style={{
                            padding: '12px', borderRadius: '12px', background: '#4285F4', color: 'white',
                            fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', border: 'none'
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            {t.auth.googleLogin}
                        </button>

                        <button onClick={handleAnonymousLogin} style={{
                            padding: '12px', borderRadius: '12px', background: '#f1f5f9', color: '#334155',
                            fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', border: '1px solid #cbd5e1'
                        }}>
                            <User size={18} /> {t.auth.anonymousLogin}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
