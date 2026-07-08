import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
    createUserWithEmailAndPassword,
    deleteUser,
    EmailAuthProvider,
    GoogleAuthProvider,
    onAuthStateChanged,
    reauthenticateWithCredential,
    reauthenticateWithPopup,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    updatePassword,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AuthContext } from '../contexts/auth-context';
import { deleteAccountFirestoreData } from '../services/accountDeletion';

const clearLocalAccountData = () => {
    localStorage.removeItem('juku_salary_entries');
    localStorage.removeItem('juku_salary_config');
    localStorage.removeItem('lastSeenTitles');
};

const reauthenticateForAccountDeletion = async (currentUser: User, password?: string) => {
    const providerIds = currentUser.providerData.map(provider => provider.providerId);

    if (providerIds.includes(GoogleAuthProvider.PROVIDER_ID)) {
        await reauthenticateWithPopup(currentUser, new GoogleAuthProvider());
        return;
    }

    if (providerIds.includes(EmailAuthProvider.PROVIDER_ID)) {
        if (!currentUser.email || !password) {
            const error = new Error('Password is required to delete this account.');
            error.name = 'auth/password-required';
            throw error;
        }
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
        return;
    }

    const error = new Error('Unsupported authentication provider.');
    error.name = 'auth/unsupported-provider';
    throw error;
};

const reauthenticateEmailUser = async (currentUser: User, password: string) => {
    if (!currentUser.email) {
        const error = new Error('Email is required to reauthenticate this account.');
        error.name = 'auth/email-required';
        throw error;
    }

    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => onAuthStateChanged(auth, currentUser => {
        if (!currentUser) clearLocalAccountData();
        setUser(currentUser);
        setLoading(false);
    }), []);

    const value = useMemo(() => ({
        user,
        loading,
        signInWithGoogle: async () => {
            const provider = new GoogleAuthProvider();
            return signInWithPopup(auth, provider);
        },
        loginWithEmail: (email: string, password: string) =>
            signInWithEmailAndPassword(auth, email, password),
        signUpWithEmail: async (email: string, password: string) => {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(credential.user);
            return credential;
        },
        signOut: async () => {
            await firebaseSignOut(auth);
            clearLocalAccountData();
        },
        sendPasswordReset: (email: string) =>
            sendPasswordResetEmail(auth, email),
        changePassword: async (currentPassword: string, newPassword: string) => {
            const currentUser = auth.currentUser || user;
            if (!currentUser) throw new Error('No signed-in user.');

            const providerIds = currentUser.providerData.map(provider => provider.providerId);
            if (!providerIds.includes(EmailAuthProvider.PROVIDER_ID)) {
                const error = new Error('Password change is only available for email/password accounts.');
                error.name = 'auth/unsupported-provider';
                throw error;
            }

            await reauthenticateEmailUser(currentUser, currentPassword);
            await updatePassword(currentUser, newPassword);
        },
        deleteAccount: async (password?: string) => {
            const currentUser = auth.currentUser || user;
            if (!currentUser) throw new Error('No signed-in user.');

            await reauthenticateForAccountDeletion(currentUser, password);
            await deleteAccountFirestoreData(currentUser.uid);
            await deleteUser(currentUser);
            clearLocalAccountData();
        },
        resendVerification: async () => {
            if (user) await sendEmailVerification(user);
        },
    }), [loading, user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
