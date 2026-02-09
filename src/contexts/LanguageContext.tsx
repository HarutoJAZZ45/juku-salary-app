import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Language, Translation } from '../locales/types';
import { ja } from '../locales/ja';
import { en } from '../locales/en';
import { es } from '../locales/es';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translation;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries: Record<Language, Translation> = {
    ja,
    en,
    es,
};

const STORAGE_KEY = 'juku_app_language';

/**
 * 言語コンテキストプロバイダー
 * アプリケーション全体に多言語対応機能を提供する
 */
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('ja');

    // 初期化時、保存された言語設定があれば読み込む
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && (stored === 'ja' || stored === 'en' || stored === 'es')) {
            setLanguageState(stored as Language);
        }
    }, []);

    // 言語設定の更新と永続化
    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
    };

    // 現在の言語に対応する辞書データ
    const t = dictionaries[language];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

/**
 * 翻訳フック
 * コンポーネント内で翻訳データにアクセスするために使用する
 */
export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
