import { useContext } from 'react';
import { AuthContext } from '../contexts/auth-context';

/**
 * Firebase Authenticationを用いたユーザー認証・状態管理を行うカスタムフック。
 * ログイン/サインアップ処理に加え、認証状態の監視、初期のクラウドデータ同期機能を提供します。
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
