// 基本的な型定義

// 勤務タイプ、勤務時間帯、場所、校舎の型定義
export type WorkType = 'koma' | 'support' | 'allowance';
export type WorkBlock = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export type Location = 'hiraoka' | 'other';
export type Campus = '平岡' | '新札幌' | '月寒' | '円山' | '北大前';

/**
 * 1日分の勤務データ
 */
export interface WorkEntry {
  id: string;               // 一意のID
  date: string; // YYYY-MM-DD

  // 具体的な入力データ
  selectedBlocks: WorkBlock[]; // 担当コマ (A-G)
  supportMinutes: number;      // 手入力の追加業務時間（分）
  allowanceAmount: number;     // その他手当金額（円）

  location?: Location;      // 勤務地種別（hiraoka=800円支給対象、other=400円）
  campus?: Campus;          // 実際に勤務した校舎
  hasTransport: boolean;    // 交通費支給の有無
  transportCost?: number;   // 交通費の上書き設定（設定値以外を使う場合）

  // 特別役職フラグ
  leaderBlocks?: WorkBlock[];     // リーダー業務を行ったコマ (時給単価アップ)
  subLeaderBlocks?: WorkBlock[];  // サブリーダー業務を行ったコマ
}

/**
 * ユーザー設定
 */
export interface UserSettings {
  teachingHourlyRate: number; // 授業時給（基本単価）※90分換算で1.5倍される
  hourlyRate: number;         // 事務時給
  transportCost: number;      // デフォルト交通費
  campusTransportRates: Record<Campus, number>; // 校舎ごとのデフォルト交通費
  defaultCampus: Campus;      // 所属校舎（ホームスクール）

  // プロフィール設定 (v3.0)
  profile?: UserProfile;

  // 締め日設定
  closingDay: number;      // 締め日（デフォルト: 15日）
  paymentMonthLag: number; // 支払月ラグ（0=当月払い、1=翌月払い）

  // 税金・扶養管理
  annualLimit: number; // 年収の壁（デフォルト: 103万）
}

/**
 * 日次サマリー（計算用）
 */
export interface DailySummary {
  date: string;
  totalPay: number;
  entries: WorkEntry[];
}

/**
 * ユーザープロフィール
 */
export interface UserProfile {
  name: string;
  avatarId: string; // 将来的な拡張用
  themeColor?: string; // 背景テーマカラー
  activeTitle?: string; // 現在選択中の称号
  unlockedTitles?: string[]; // 獲得した称号のリスト
}

/**
 * レベル・経験値データ
 */
export interface LevelData {
  level: number;
  xp: number;
  nextLevelXp: number;
  progress: number; // 0-100%
  totalEarnings: number;
  totalClasses: number;
  totalWorkDays: number;
}
