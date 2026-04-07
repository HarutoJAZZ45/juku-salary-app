import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInAnonymously, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { WorkEntry, UserSettings } from '../types';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 認証状態の監視
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const loginWithEmail = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error logging in with email", error);
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error signing up with email", error);
            throw error;
        }
    };

    const loginAnonymously = async () => {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("Error signing in anonymously", error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
            throw error;
        }
    };

    // ユーザーデータのFirestoreへの同期（手動または初回ログイン時など）
    const syncDataToCloud = async (entries: Record<string, WorkEntry>, config: UserSettings) => {
        if (!user) return;
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                entries,
                config,
                updatedAt: new Date().toISOString()
            });
            console.log('Data synced to cloud successfully.');
        } catch (error) {
            console.error('Error syncing data to cloud', error);
            throw error;
        }
    };

    // ユーザーデータのFirestoreからの取得
    const loadDataFromCloud = async () => {
        if (!user) return null;
        try {
            const userRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                return docSnap.data() as { entries: Record<string, WorkEntry>, config: UserSettings };
            }
            return null;
        } catch (error) {
            console.error('Error loading data from cloud', error);
            throw error;
        }
    };

    return {
        user,
        loading,
        signInWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        loginAnonymously,
        signOut,
        syncDataToCloud,
        loadDataFromCloud
    };
};
