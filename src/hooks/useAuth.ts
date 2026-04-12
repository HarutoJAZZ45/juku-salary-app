import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
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
            return await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
            throw error;
        }
    };

    const loginWithEmail = async (email: string, password: string) => {
        try {
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Error logging in with email", error);
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, password: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                await sendEmailVerification(userCredential.user);
            }
            return userCredential;
        } catch (error) {
            console.error("Error signing up with email", error);
            throw error;
        }
    };

    const resendVerification = async () => {
        if (user) {
            try {
                await sendEmailVerification(user);
                console.log("Verification email sent.");
            } catch (error) {
                console.error("Error resending verification email", error);
                throw error;
            }
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
    const syncDataToCloud = async (entries: Record<string, WorkEntry>, config: UserSettings, targetUser?: User | null) => {
        const currentUser = targetUser || user;
        if (!currentUser) return;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
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
    const loadDataFromCloud = async (targetUser?: User | null) => {
        const currentUser = targetUser || user;
        if (!currentUser) return null;
        try {
            const userRef = doc(db, 'users', currentUser.uid);
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
        signOut,
        syncDataToCloud,
        loadDataFromCloud,
        resendVerification
    };
};
