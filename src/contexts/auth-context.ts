import { createContext } from 'react';
import type { User, UserCredential } from 'firebase/auth';
import type { WorkEntry, UserSettings } from '../types';

export interface AuthContextValue {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<UserCredential>;
    loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
    signUpWithEmail: (email: string, password: string) => Promise<UserCredential>;
    signOut: () => Promise<void>;
    syncDataToCloud: (
        entries: Record<string, WorkEntry>,
        config: UserSettings,
        targetUser?: User | null
    ) => Promise<void>;
    loadDataFromCloud: (targetUser?: User | null) => Promise<{
        entries: Record<string, WorkEntry>;
        config: UserSettings;
    } | null>;
    resendVerification: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
