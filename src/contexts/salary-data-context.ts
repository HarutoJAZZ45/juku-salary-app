import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { WorkEntry, UserSettings } from '../types';

export interface SalaryDataContextValue {
    entries: Record<string, WorkEntry>;
    settings: UserSettings;
    updateEntry: (date: string, data: Partial<WorkEntry>) => void;
    deleteEntry: (date: string) => Promise<void>;
    getEntry: (date: string) => WorkEntry | undefined;
    setSettings: Dispatch<SetStateAction<UserSettings>>;
    updateSettings: (newSettings: UserSettings) => Promise<void>;
    isLoaded: boolean;
}

export const SalaryDataContext = createContext<SalaryDataContextValue | undefined>(undefined);
