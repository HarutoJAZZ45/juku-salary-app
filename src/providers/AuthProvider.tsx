import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { AuthContext } from '../contexts/auth-context';
import type { WorkEntry, UserSettings } from '../types';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => onAuthStateChanged(auth, currentUser => {
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
        signOut: () => firebaseSignOut(auth),
        syncDataToCloud: async (
            entries: Record<string, WorkEntry>,
            config: UserSettings,
            targetUser?: User | null
        ) => {
            const currentUser = targetUser || user;
            if (!currentUser) return;
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, {
                entries,
                config,
                updatedAt: new Date().toISOString(),
            });
        },
        loadDataFromCloud: async (targetUser?: User | null) => {
            const currentUser = targetUser || user;
            if (!currentUser) return null;
            const userRef = doc(db, 'users', currentUser.uid);
            const snapshot = await getDoc(userRef);
            if (!snapshot.exists()) return null;
            return snapshot.data() as {
                entries: Record<string, WorkEntry>;
                config: UserSettings;
            };
        },
        resendVerification: async () => {
            if (user) await sendEmailVerification(user);
        },
    }), [loading, user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
