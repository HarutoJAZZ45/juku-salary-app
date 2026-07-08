import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SalaryDataContext } from '../contexts/salary-data-context';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import type { UiState, WorkEntry, UserSettings } from '../types';

const STORAGE_KEY_ENTRIES = 'juku_salary_entries';
const STORAGE_KEY_CONFIG = 'juku_salary_config';

const clearSalaryLocalData = () => {
    localStorage.removeItem(STORAGE_KEY_ENTRIES);
    localStorage.removeItem(STORAGE_KEY_CONFIG);
};

const clearLegacyUiLocalData = () => {
    localStorage.removeItem('lastReadNewsId');
    localStorage.removeItem('hasSeenHelp');
    localStorage.removeItem('lastSeenTitles');
};

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
    commuterPassSuggestionEnabled: false,
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

const DEFAULT_UI_STATE: UiState = {
    hasSeenHelp: false,
    lastSeenTitles: [],
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

const mergeUiState = (stored?: Partial<UiState>): UiState => ({
    ...DEFAULT_UI_STATE,
    ...(stored || {}),
    lastSeenTitles: Array.isArray(stored?.lastSeenTitles) ? stored.lastSeenTitles : [],
});

export const SalaryDataProvider = ({ children }: { children: ReactNode }) => {
    const [entries, setEntries] = useState<Record<string, WorkEntry>>({});
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [uiState, setUiState] = useState<UiState>(DEFAULT_UI_STATE);
    const [isLoaded, setIsLoaded] = useState(false);
    const [dataLoadError, setDataLoadError] = useState<string | null>(null);
    const [migrationNotice, setMigrationNotice] = useState<string | null>(null);
    const isLoadingRef = useRef(true);
    const entriesRef = useRef(entries);
    const settingsRef = useRef(settings);
    const uiStateRef = useRef(uiState);
    const { user, loading: authLoading } = useAuth();

    entriesRef.current = entries;
    settingsRef.current = settings;
    uiStateRef.current = uiState;

    useEffect(() => {
            if (authLoading) {
                isLoadingRef.current = true;
                setIsLoaded(false);
            return;
        }

        isLoadingRef.current = true;

        const loadInitialData = async () => {
            setIsLoaded(false);
            setDataLoadError(null);
            clearLegacyUiLocalData();
            if (user) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const snapshot = await getDoc(userRef);

                    if (snapshot.exists()) {
                        const cloudData = snapshot.data();
                        const cloudEntries = cloudData.entries || {};
                        setEntries(cloudEntries);

                        if (cloudData.config) {
                            const mergedConfig = mergeSettings(cloudData.config);
                            setSettings(mergedConfig);
                        } else {
                            setSettings(DEFAULT_SETTINGS);
                        }
                        setUiState(mergeUiState(cloudData.uiState));
                        clearSalaryLocalData();
                    } else {
                        setEntries({});
                        setSettings(DEFAULT_SETTINGS);
                        setUiState(DEFAULT_UI_STATE);
                        clearSalaryLocalData();

                        await setDoc(userRef, {
                            entries: {},
                            config: DEFAULT_SETTINGS,
                            uiState: DEFAULT_UI_STATE,
                            updatedAt: new Date().toISOString(),
                        }, { merge: true });
                    }
                } catch (error) {
                    console.error('Cloud data load error:', error);
                    clearSalaryLocalData();
                    isLoadingRef.current = true;
                    setIsLoaded(false);
                    setDataLoadError('データを読み込めませんでした。通信状況を確認して、再読み込みしてください。');
                    return;
                }
            } else {
                setEntries({});
                setSettings(DEFAULT_SETTINGS);
                setUiState(DEFAULT_UI_STATE);
                clearSalaryLocalData();
            }

            isLoadingRef.current = false;
            setIsLoaded(true);
        };

        void loadInitialData();
    }, [authLoading, user]);

    useEffect(() => {
        if (isLoadingRef.current || !isLoaded) return;
        clearSalaryLocalData();
        clearLegacyUiLocalData();

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
        clearSalaryLocalData();
        clearLegacyUiLocalData();

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
        clearSalaryLocalData();

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

    const updateUiState = useCallback(async (updates: Partial<UiState>) => {
        const nextUiState = mergeUiState({
            ...uiStateRef.current,
            ...updates,
        });
        if (JSON.stringify(nextUiState) === JSON.stringify(uiStateRef.current)) return;

        uiStateRef.current = nextUiState;
        setUiState(nextUiState);
        clearLegacyUiLocalData();

        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, { uiState: nextUiState }, { mergeFields: ['uiState'] });
            } catch (error) {
                console.error('UI state sync failed:', error);
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
        clearSalaryLocalData();

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
        uiState,
        migrationNotice,
        dataLoadError,
        updateEntry,
        deleteEntry,
        getEntry,
        setSettings,
        updateSettings,
        updateUiState,
        clearMigrationNotice,
        isLoaded,
    }), [clearMigrationNotice, dataLoadError, deleteEntry, entries, getEntry, isLoaded, migrationNotice, settings, uiState, updateEntry, updateSettings, updateUiState]);

    return <SalaryDataContext.Provider value={value}>{children}</SalaryDataContext.Provider>;
};
