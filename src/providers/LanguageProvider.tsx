import { useState } from 'react';
import type { ReactNode } from 'react';
import { LanguageContext } from '../contexts/language-context';
import type { Language, Translation } from '../locales/types';
import { en } from '../locales/en';
import { es } from '../locales/es';
import { ja } from '../locales/ja';

const STORAGE_KEY = 'juku_app_language';
const dictionaries: Record<Language, Translation> = { ja, en, es };

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'ja' || stored === 'en' || stored === 'es' ? stored : 'ja';
    });

    const setLanguage = (newLanguage: Language) => {
        setLanguageState(newLanguage);
        localStorage.setItem(STORAGE_KEY, newLanguage);
    };

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t: dictionaries[language],
        }}>
            {children}
        </LanguageContext.Provider>
    );
};
