import { useState, useEffect, useRef } from 'react';
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

    // 同期的なロードガード（useRefはレンダーを待たずに即座に反映される）
    const isLoadingRef = useRef(true);

    // Authフックでユーザー状態を取得
    const { user } = useAuth();

    // ストレージおよびFirestoreからの初回読み込み
    useEffect(() => {
        // ★ 即座にガードをON（保存エフェクトが古いデータを書き込むのを防ぐ）
        isLoadingRef.current = true;
        setIsLoaded(false);

        const loadInitialData = async () => {
            if (user) {
                // ===== ログインしている場合: クラウドのデータのみを信頼する =====
                try {
                    const userRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(userRef);

                    if (docSnap.exists()) {
                        const cloudData = docSnap.data();
                        // クラウドのデータで完全に上書き（ローカルは無視）
                        const cloudEntries = cloudData.entries || {};
                        setEntries(cloudEntries);
                        localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(cloudEntries));

                        if (cloudData.config) {
                            const mergedConfig = {
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
                            };
                            setSettings(mergedConfig);
                            localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(mergedConfig));
                        }
                    } else {
                        // クラウドにデータがない場合（新規登録直後）: ローカルから読む
                        const storedEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
                        const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
                        if (storedEntries) setEntries(JSON.parse(storedEntries));
                        if (storedConfig) {
                            const loadedConfig = JSON.parse(storedConfig);
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
                    }
                } catch (error) {
                    console.error("Cloud data load error:", error);
                    // フォールバック: クラウド読み込みに失敗した場合はローカルから読む
                    const storedEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
                    if (storedEntries) setEntries(JSON.parse(storedEntries));
                }
            } else {
                // ===== ログインしていない場合: ローカルストレージから読む =====
                try {
                    const storedEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
                    const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);

                    if (storedEntries) setEntries(JSON.parse(storedEntries));
                    if (storedConfig) {
                        const loadedConfig = JSON.parse(storedConfig);
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
            }

            // ★ 読み込み完了後にガードを解除
            isLoadingRef.current = false;
            setIsLoaded(true);
        };

        loadInitialData();
    }, [user]);

    // 勤務データの保存（entries変更時に実行）
    useEffect(() => {
        // ★ useRefで同期的にチェック（Reactの非同期state更新を待たない）
        if (isLoadingRef.current || !isLoaded) return;

        localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));

        if (user) {
            const saveToFirestore = async () => {
                const userRef = doc(db, 'users', user.uid);
                const cleanEntries = JSON.parse(JSON.stringify({ entries }));
                await setDoc(userRef, cleanEntries, { merge: true }).catch(e => console.error(e));
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
        // ★ useRefで同期的にチェック
        if (isLoadingRef.current || !isLoaded) return;

        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(settings));
        if (user) {
            const saveToFirestore = async () => {
                const userRef = doc(db, 'users', user.uid);
                const cleanConfig = JSON.parse(JSON.stringify({ config: settings }));
                await setDoc(userRef, cleanConfig, { merge: true }).catch(e => console.error(e));
                // 設定変更時（プロフ変更やランキングON/OFF切り替え）にも同期
                import('../utils/ranking').then(({ updateRankingStats }) => {
                    updateRankingStats(user.uid, entries, settings);
                });
            };
            saveToFirestore();
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

    // 設定の即時保存をサポートする更新関数
    const updateSettings = async (newSettings: UserSettings) => {
        setSettings(newSettings);
        
        // 1. LocalStorageに即座に反映（オフライン・クラッシュ対策）
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newSettings));

        // 2. ログイン中ならFirestoreへ即座に送信
        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, { config: newSettings }, { merge: true });
                
                // ランキングデータも即座に更新
                const { updateRankingStats } = await import('../utils/ranking');
                await updateRankingStats(user.uid, entries, newSettings);
                
                console.log("Settings synced to cloud immediately.");
            } catch (error) {
                console.error("Immediate cloud sync failed:", error);
                // 失敗してもLocalStorageには保存されているので次回以降に同期される
            }
        }
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
        updateSettings,
        isLoaded
    };
};
