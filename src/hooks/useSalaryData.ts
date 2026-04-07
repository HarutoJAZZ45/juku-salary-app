import { useState, useEffect } from 'react';
import type { WorkEntry, UserSettings } from '../types';
import { useAuth } from './useAuth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const STORAGE_KEY_ENTRIES = 'juku_salary_entries';
const STORAGE_KEY_CONFIG = 'juku_salary_config';

// デフォルト設定
const DEFAULT_SETTINGS: UserSettings = {
    teachingHourlyRate: 1380, // 授業時給
    hourlyRate: 1075,         // 事務時給（最低賃金など）
    transportCost: 500,       // 基本交通費
    campusTransportRates: {   // 校舎ごとの交通費
        '平岡': 1620,
        '新札幌': 1140,
        '月寒': 500,
        '円山': 500,
        '北大前': 500
    },
    defaultCampus: '平岡',   // 所属校舎
    closingDay: 15,          // 締め日
    paymentMonthLag: 0,      // 支払月ラグ（0=当月、1=翌月）
    annualLimit: 1030000,    // 扶養控除の壁（年収）
    profile: {
        name: 'ゲスト講師',
        activeTitle: 'rookie',
        unlockedTitles: ['rookie'],
        avatarId: 'default'
    }
};

/**
 * 給与データ管理用のカスタムフック
 * LocalStorageへの保存と読み込み、データの更新・削除機能を提供する
 */
export const useSalaryData = () => {
    const [entries, setEntries] = useState<Record<string, WorkEntry>>({});
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Authフックでユーザー状態を取得
    const { user } = useAuth();

    // ストレージおよびFirestoreからの初回読み込み
    useEffect(() => {
        const loadInitialData = async () => {
            let loadedEntries = {};
            let loadedConfig = null;

            // 1. まずローカルストレージから即座に読み込む
            try {
                const storedEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
                const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);

                if (storedEntries) {
                    loadedEntries = JSON.parse(storedEntries);
                    setEntries(loadedEntries);
                }
                if (storedConfig) {
                    loadedConfig = JSON.parse(storedConfig);
                    setSettings({
                        ...DEFAULT_SETTINGS,
                        ...loadedConfig,
                        campusTransportRates: {
                            ...DEFAULT_SETTINGS.campusTransportRates,
                            ...(loadedConfig.campusTransportRates || {})
                        },
                        profile: {
                            ...DEFAULT_SETTINGS.profile!,
                            ...(loadedConfig.profile || {})
                        }
                    });
                }
            } catch (e) {
                console.error("Failed to load local data", e);
            }

            // 2. ユーザーがログインしている場合はFirestoreからデータを取得
            if (user) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(userRef);

                    if (docSnap.exists()) {
                        const cloudData = docSnap.data();
                        const finalEntries = cloudData.entries || {};
                        setEntries(finalEntries);

                        if (cloudData.config) {
                            setSettings({
                                ...DEFAULT_SETTINGS,
                                ...cloudData.config,
                                campusTransportRates: {
                                    ...DEFAULT_SETTINGS.campusTransportRates,
                                    ...(cloudData.config.campusTransportRates || {})
                                },
                                profile: {
                                    ...DEFAULT_SETTINGS.profile!,
                                    ...(cloudData.config.profile || {})
                                }
                            });
                        }
                    }
                } catch (error) {
                    console.error("Initial sync error:", error);
                }
            }

            // 全ての読み込みが完了してからフラグを立てる
            setIsLoaded(true);
        };

        loadInitialData();
    }, [user]);

    // 勤務データの保存（entries変更時に実行）
    useEffect(() => {
        // ロード完了前、またはデータが空の状態での上書き保存を防ぐ
        if (!isLoaded) return;

        localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));

        if (user) {
            const saveToFirestore = async () => {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, { entries }, { merge: true }).catch(e => console.error(e));
                // ランキングデータの自動同期
                import('../utils/ranking').then(({ updateRankingStats }) => {
                    updateRankingStats(user.uid, entries, settings);
                });
            };
            saveToFirestore();
        }
    }, [entries, isLoaded, user]);

    // 設定データの保存（settings変更時に実行）
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(settings));
            if (user) {
                const saveToFirestore = async () => {
                    const userRef = doc(db, 'users', user.uid);
                    await setDoc(userRef, { config: settings }, { merge: true }).catch(e => console.error(e));
                    // 設定変更時（プロフ変更やランキングON/OFF切り替え）にも同期
                    import('../utils/ranking').then(({ updateRankingStats }) => {
                        updateRankingStats(user.uid, entries, settings);
                    });
                };
                saveToFirestore();
            }
        }
    }, [settings, isLoaded, user]);

    // リストの更新または新規追加
    const updateEntry = (date: string, data: Partial<WorkEntry>) => {
        setEntries(prev => {
            const existing = prev[date] || {
                id: crypto.randomUUID(),
                date,
                selectedBlocks: [],
                supportMinutes: 0,
                allowanceAmount: 0,
                hasTransport: true
            };

            const newEntry = { ...existing, ...data };

            // 全ての値がゼロまたは空の場合は、エントリ自体を削除してデータをクリーンに保つ
            if ((!newEntry.selectedBlocks || newEntry.selectedBlocks.length === 0) && newEntry.supportMinutes === 0 && newEntry.allowanceAmount === 0 && !newEntry.hasTransport) {
                const { [date]: _, ...rest } = prev;
                return rest;
            }

            return { ...prev, [date]: newEntry };
        });
    };

    const getEntry = (date: string) => entries[date];

    // エントリの削除
    const deleteEntry = (date: string) => {
        setEntries(prev => {
            const { [date]: _, ...rest } = prev;
            return rest;
        });
    };

    return {
        entries,
        settings,
        updateEntry,
        deleteEntry,
        getEntry,
        setSettings,
        isLoaded
    };
};
