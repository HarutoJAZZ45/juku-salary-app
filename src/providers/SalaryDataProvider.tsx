import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SalaryDataContext } from '../contexts/salary-data-context';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import type { WorkEntry, UserSettings } from '../types';

const STORAGE_KEY_ENTRIES = 'juku_salary_entries';
const STORAGE_KEY_CONFIG = 'juku_salary_config';

const DEFAULT_SETTINGS: UserSettings = {
    teachingHourlyRate: 1380,
    hourlyRate: 1075,
    transportCost: 500,
    campusTransportRates: {
        '平岡': 1620,
        '新札幌': 1140,
        '月寒': 500,
        '円山': 500,
        '北大前': 500,
    },
    defaultCampus: '平岡',
    closingDay: 15,
    paymentMonthLag: 0,
    annualLimit: 1030000,
    profile: {
        name: 'ゲスト講師',
        activeTitle: 'rookie',
        unlockedTitles: ['rookie'],
        avatarId: 'default',
    },
};

const mergeSettings = (stored: Partial<UserSettings>): UserSettings => ({
    ...DEFAULT_SETTINGS,
    ...stored,
    campusTransportRates: {
        ...DEFAULT_SETTINGS.campusTransportRates,
        ...(stored.campusTransportRates || {}),
    },
    profile: {
        ...DEFAULT_SETTINGS.profile!,
        ...(stored.profile || {}),
    },
});

export const SalaryDataProvider = ({ children }: { children: ReactNode }) => {
    const [entries, setEntries] = useState<Record<string, WorkEntry>>({});
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);
    const [migrationNotice, setMigrationNotice] = useState<string | null>(null);
    const isLoadingRef = useRef(true);
    const entriesRef = useRef(entries);
    const settingsRef = useRef(settings);
    const { user, loading: authLoading } = useAuth();

    entriesRef.current = entries;
    settingsRef.current = settings;

    useEffect(() => {
        if (authLoading) {
            isLoadingRef.current = true;
            setIsLoaded(false);
            return;
        }

        isLoadingRef.current = true;

        const loadInitialData = async () => {
            setIsLoaded(false);
            if (user) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const snapshot = await getDoc(userRef);

                    if (snapshot.exists()) {
                        const cloudData = snapshot.data();
                        const cloudEntries = cloudData.entries || {};
                        setEntries(cloudEntries);
                        localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(cloudEntries));

                        if (cloudData.config) {
                            const mergedConfig = mergeSettings(cloudData.config);
                            setSettings(mergedConfig);
                            localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(mergedConfig));
                        }
                    } else {
                        const storedEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
                        const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
                        const localEntries = storedEntries ? JSON.parse(storedEntries) : {};
                        const localConfig = storedConfig ? mergeSettings(JSON.parse(storedConfig)) : DEFAULT_SETTINGS;
                        setEntries(localEntries);
                        setSettings(localConfig);

                        await setDoc(userRef, {
                            entries: localEntries,
                            config: localConfig,
                            migration: {
                                localStorageImportedAt: new Date().toISOString(),
                            },
                            updatedAt: new Date().toISOString(),
                        }, { merge: true });

                        if (storedEntries || storedConfig) {
                            setMigrationNotice('端末内に保存されていたデータをアカウントに移行しました。念のため、この端末内のデータはまだ残しています。');
                        }
                    }
                } catch (error) {
                    console.error('Cloud data load error:', error);
                    const storedEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
                    if (storedEntries) setEntries(JSON.parse(storedEntries));
                }
            } else {
                try {
                    const storedEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
                    const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
                    if (storedEntries) setEntries(JSON.parse(storedEntries));
                    if (storedConfig) setSettings(mergeSettings(JSON.parse(storedConfig)));
                } catch (error) {
                    console.error('Failed to load local data', error);
                }
            }

            isLoadingRef.current = false;
            setIsLoaded(true);
        };

        void loadInitialData();
    }, [authLoading, user]);

    useEffect(() => {
        if (isLoadingRef.current || !isLoaded) return;
        localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));

        if (user) {
            const saveToFirestore = async () => {
                const userRef = doc(db, 'users', user.uid);
                const cleanEntries = JSON.parse(JSON.stringify({ entries }));
                await setDoc(userRef, cleanEntries, { mergeFields: ['entries'] }).catch(console.error);
                const { updateRankingStats } = await import('../utils/ranking');
                await updateRankingStats(user.uid, entries, settingsRef.current);
            };
            void saveToFirestore();
        }
    }, [entries, isLoaded, user]);

    useEffect(() => {
        if (isLoadingRef.current || !isLoaded) return;
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(settings));

        if (user) {
            const saveToFirestore = async () => {
                const userRef = doc(db, 'users', user.uid);
                const cleanConfig = JSON.parse(JSON.stringify({ config: settings }));
                await setDoc(userRef, cleanConfig, { mergeFields: ['config'] }).catch(console.error);
                const { updateRankingStats } = await import('../utils/ranking');
                await updateRankingStats(user.uid, entriesRef.current, settings);
            };
            void saveToFirestore();
        }
    }, [settings, isLoaded, user]);

    const updateEntry = useCallback((date: string, data: Partial<WorkEntry>) => {
        setEntries(previous => {
            const existing = previous[date] || {
                id: crypto.randomUUID(),
                date,
                selectedBlocks: [],
                supportMinutes: 0,
                allowanceAmount: 0,
                hasTransport: true,
            };
            const newEntry = { ...existing, ...data };

            if (
                (!newEntry.selectedBlocks || newEntry.selectedBlocks.length === 0) &&
                newEntry.supportMinutes === 0 &&
                newEntry.allowanceAmount === 0 &&
                !newEntry.hasTransport
            ) {
                const rest = { ...previous };
                delete rest[date];
                return rest;
            }

            return { ...previous, [date]: newEntry };
        });
    }, []);

    const updateSettings = useCallback(async (newSettings: UserSettings) => {
        setSettings(newSettings);
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newSettings));

        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, { config: newSettings }, { mergeFields: ['config'] });
                const { updateRankingStats } = await import('../utils/ranking');
                await updateRankingStats(user.uid, entriesRef.current, newSettings);
            } catch (error) {
                console.error('Immediate cloud sync failed:', error);
            }
        }
    }, [user]);

    const getEntry = useCallback((date: string) => entries[date], [entries]);

    const deleteEntry = useCallback(async (date: string) => {
        const rest = { ...entriesRef.current };
        delete rest[date];

        if (user) {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                entries: rest,
                config: settingsRef.current,
                updatedAt: new Date().toISOString(),
            }, { mergeFields: ['entries', 'config', 'updatedAt'] });
        }

        entriesRef.current = rest;
        setEntries(rest);
        localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(rest));

        if (user) {
            try {
                const { updateRankingStats } = await import('../utils/ranking');
                await updateRankingStats(user.uid, rest, settingsRef.current);
            } catch (error) {
                console.error('[deleteEntry] Ranking sync error:', error);
            }
        }
    }, [user]);

    const clearMigrationNotice = useCallback(() => setMigrationNotice(null), []);

    const value = useMemo(() => ({
        entries,
        settings,
        migrationNotice,
        updateEntry,
        deleteEntry,
        getEntry,
        setSettings,
        updateSettings,
        clearMigrationNotice,
        isLoaded,
    }), [clearMigrationNotice, deleteEntry, entries, getEntry, isLoaded, migrationNotice, settings, updateEntry, updateSettings]);

    return <SalaryDataContext.Provider value={value}>{children}</SalaryDataContext.Provider>;
};
