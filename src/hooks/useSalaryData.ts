import { useState, useEffect } from 'react';
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
        '北大前': 500
    },
    defaultCampus: '平岡',
    closingDay: 15,
    paymentMonthLag: 0,
    annualLimit: 1030000
};

export const useSalaryData = () => {
    const [entries, setEntries] = useState<Record<string, WorkEntry>>({});
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from storage
    useEffect(() => {
        try {
            const storedEntries = localStorage.getItem(STORAGE_KEY_ENTRIES);
            const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);

            if (storedEntries) {
                setEntries(JSON.parse(storedEntries));
            }
            if (storedConfig) {
                const loaded = JSON.parse(storedConfig);
                // Migration: Ensure deep merge for campusTransportRates
                setSettings({
                    ...DEFAULT_SETTINGS,
                    ...loaded,
                    campusTransportRates: {
                        ...DEFAULT_SETTINGS.campusTransportRates,
                        ...(loaded.campusTransportRates || {})
                    }
                });
            }
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to storage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
        }
    }, [entries, isLoaded]);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(settings));
        }
    }, [settings, isLoaded]);

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

            // If everything is zero, remove it to keep clean
            if ((!newEntry.selectedBlocks || newEntry.selectedBlocks.length === 0) && newEntry.supportMinutes === 0 && newEntry.allowanceAmount === 0 && !newEntry.hasTransport) {
                const { [date]: _, ...rest } = prev;
                return rest;
            }

            return { ...prev, [date]: newEntry };
        });
    };

    const getEntry = (date: string) => entries[date];

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
