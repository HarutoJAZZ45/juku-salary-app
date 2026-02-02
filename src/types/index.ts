export type WorkType = 'koma' | 'support' | 'allowance';
export type WorkBlock = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export type Location = 'hiraoka' | 'other';
export type Campus = '平岡' | '新札幌' | '月寒' | '円山' | '北大前';

export interface WorkEntry {
  id: string;
  date: string; // YYYY-MM-DD

  // Specific inputs
  selectedBlocks: WorkBlock[];
  supportMinutes: number; // Manual extra minutes
  allowanceAmount: number; // Manual extra pay

  location?: Location;      // Legacy/Derived for logic
  campus?: Campus;          // Specific campus
  hasTransport: boolean;   // Whether transport is paid this day
  transportCost?: number; // Override default if set

  // Special Roles
  leaderBlocks?: WorkBlock[];     // 2000 JPY
  subLeaderBlocks?: WorkBlock[];  // 1500 JPY
}

export interface UserSettings {
  teachingHourlyRate: number; // New: Hourly rate for class (1.5x for 90min)
  hourlyRate: number;     // JPY per hour (Support)
  transportCost: number;  // Default Fallback
  campusTransportRates: Record<Campus, number>; // Per-campus default
  defaultCampus: Campus; // New: Home campus


  // Cutoff configuration
  closingDay: number;     // Default 15
  paymentMonthLag: number; // Default 1 (Next month payment)
}

export interface DailySummary {
  date: string;
  totalPay: number;
  entries: WorkEntry[];
}
