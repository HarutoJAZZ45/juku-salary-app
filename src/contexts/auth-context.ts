import { createContext } from 'react';
import type { User, UserCredential } from 'firebase/auth';

export interface AuthContextValue {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<UserCredential>;
    loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
    signUpWithEmail: (email: string, password: string) => Promise<UserCredential>;
    signOut: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    deleteAccount: (password?: string) => Promise<void>;
    resendVerification: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
