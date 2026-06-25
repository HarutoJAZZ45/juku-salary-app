import type { ReactNode } from 'react';
import { LanguageContext } from '../contexts/language-context';
import { ja } from '../locales/ja';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    return (
        <LanguageContext.Provider value={{
            language: 'ja',
            setLanguage: () => undefined,
            t: ja,
        }}>
            {children}
        </LanguageContext.Provider>
    );
};
