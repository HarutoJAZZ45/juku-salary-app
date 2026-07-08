import { createContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { UiState, WorkEntry, UserSettings } from '../types';

export interface SalaryDataContextValue {
    entries: Record<string, WorkEntry>;
    settings: UserSettings;
    uiState: UiState;
    migrationNotice: string | null;
    updateEntry: (date: string, data: Partial<WorkEntry>) => void;
    deleteEntry: (date: string) => Promise<void>;
    getEntry: (date: string) => WorkEntry | undefined;
    setSettings: Dispatch<SetStateAction<UserSettings>>;
    updateSettings: (newSettings: UserSettings) => Promise<void>;
    updateUiState: (updates: Partial<UiState>) => Promise<void>;
    clearMigrationNotice: () => void;
    isLoaded: boolean;
    dataLoadError: string | null;
}

export const SalaryDataContext = createContext<SalaryDataContextValue | undefined>(undefined);
