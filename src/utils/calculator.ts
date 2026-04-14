import type { WorkEntry, UserSettings, WorkBlock } from '../types';

const BLOCK_ORDER: WorkBlock[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

/**
 * 渡された日付文字列(YYYY-MM-DD)から年度（Fiscal Year）を判定する
 * 1月〜3月は前年、4月〜12月は当年とする
 */
export const getFiscalYear = (dateStr: string): number => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12
    return month < 4 ? year - 1 : year; // 1月〜3月なら前年度
};

/**
 * 給与計算のコアロジック (単一の勤務日の給与を計算)
 * 
 * 制約事項:
 * - この関数は純粋関数（Pure Function）として実装されており、外部の状態を変更しません。
 * - ローカルストレージやFirebase等の副作用から完全に切り離してテスト可能に設計されています。
 * 
 * @param {WorkEntry} entry - その日の勤務データ (コマ、手当、交通費の有無など)
 * @param {UserSettings} settings - ユーザー設定 (時給、交通費デフォルト値、役職設定など)
 * @returns {number} 計算されたその日の給与総額（小数点以下切り捨て）
 */
export const calculateDailyTotal = (entry: WorkEntry, settings: UserSettings): number => {
    let total = 0;
    const blocks = entry.selectedBlocks || [];

    // 年度別の時給を判定
    let standardHourlyRate = settings.teachingHourlyRate;
    let standardSupportRate = settings.hourlyRate;

    if (settings.yearSpecificRates) {
        const fy = getFiscalYear(entry.date);
        if (settings.yearSpecificRates[fy]) {
            standardHourlyRate = settings.yearSpecificRates[fy].teachingHourlyRate;
            standardSupportRate = settings.yearSpecificRates[fy].hourlyRate;
        }
    }

    const home = settings.defaultCampus || '平岡';
    const work = entry.campus || '平岡';

    // ヘルプ勤務（自校舎以外での勤務）の場合の時給調整
    // 平岡所属が他校舎へ行く場合は-100円、他校舎所属が平岡へ来る場合は+100円
    if (home === '平岡' && work !== '平岡') {
        standardHourlyRate -= 100;
    } else if (home !== '平岡' && work === '平岡') {
        standardHourlyRate += 100;
    }

    // 各コマごとの単価決定と加算
    const leaderBlocks = entry.leaderBlocks || [];
    const subLeaderBlocks = entry.subLeaderBlocks || [];

    for (const block of blocks) {
        let unitPrice = 0;
        
        // --- 特殊役職の時給計算 ---
        // 役職（リーダー等）は個別設定されたコマに対してのみ適用され、通常時給を上書きします
        // （優先度: Leader > SubLeader > Normal）
        // 役職に応じた単価設定（リーダー > サブリーダー > 通常）
        if (leaderBlocks.includes(block)) {
            unitPrice = 2000 * 1.5; // リーダー給（固定）
        } else if (subLeaderBlocks.includes(block)) {
            unitPrice = 1500 * 1.5; // サブリーダー給（固定）
        } else {
            unitPrice = standardHourlyRate * 1.5; // 通常授業給（90分換算）
        }
        total += unitPrice;
    }

    // 2. 生徒対応給（事務給）の計算
    // 分単位で計算し、時給換算して加算する
    let totalSupportMinutes = entry.supportMinutes;

    // 2a. コマ内休憩（各コマ5分）の加算
    totalSupportMinutes += blocks.length * 5;

    // 2b. コマ間休憩（10分）の加算
    // 連続するコマの間にのみ発生する
    const sortedBlocks = [...blocks].sort(
        (a, b) => BLOCK_ORDER.indexOf(a) - BLOCK_ORDER.indexOf(b)
    );

    for (let i = 0; i < sortedBlocks.length - 1; i++) {
        const current = sortedBlocks[i];
        const next = sortedBlocks[i + 1];

        const currentIndex = BLOCK_ORDER.indexOf(current);
        const nextIndex = BLOCK_ORDER.indexOf(next);

        // --- コマ間（授業間）休憩時間の判定 ---
        // ブロック順序が連続（例: A -> B）している場合のみ、コマ間の休憩時間が発生したとみなす
        if (nextIndex === currentIndex + 1) {
            // BコマとCコマの間は昼休憩のため給与対象外
            if (current === 'B' && next === 'C') {
                totalSupportMinutes += 0;
            } else {
                totalSupportMinutes += 10;
            }
        }
    }

    // 事務給の総額計算（分を時間に換算し、事務時給を掛ける）
    total += Math.floor((totalSupportMinutes / 60) * standardSupportRate);

    // 3. 勤務手当（勤務給）の加算
    // 勤務実績がある場合のみ発生
    if (blocks.length > 0 || entry.supportMinutes > 0) {
        if (entry.location === 'hiraoka') {
            total += 800; // 平岡地区
        } else {
            total += 400; // その他地区
        }
    }

    // 4. その他手当（手入力）の加算
    total += entry.allowanceAmount;

    // 5. 交通費の加算
    if (entry.hasTransport) {
        // エントリー個別の設定があれば優先し、なければ設定のデフォルト値を使用
        const cost = entry.transportCost !== undefined ? entry.transportCost : settings.transportCost;
        total += cost;
    }

    // 小数点以下切り捨てで返す
    return Math.floor(total);
};

/**
 * 給与期間の取得
 * 月末に振り込まれる給与に対応する期間（開始日・終了日）を計算する
 * （例：4月なら、当月の給与として3/16〜4/15を表示する）
 */
export const getPeriodRange = (currentDate: Date, closingDay: number = 15) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    let startMonth = month - 1;
    let startYear = year;
    if (startMonth < 0) {
        startMonth = 11;
        startYear = year - 1;
    }

    const endMonth = month;
    const endYear = year;

    const startDate = new Date(startYear, startMonth, closingDay + 1);
    const endDate = new Date(endYear, endMonth, closingDay);

    return {
        start: startDate,
        end: endDate,
        label: `${endDate.getMonth() + 1}月分給与`
    };
};

/**
 * 通貨フォーマット
 * 日本円形式で数値を文字列に変換する
 */
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
};

/**
 * 支給日の計算
 * 勤務日と締め日設定から、実際の給与振込日を算出する
 */
export const getPaymentDate = (workDate: Date, closingDay: number = 15, lagMonths: number = 1): Date => {
    const year = workDate.getFullYear();
    const month = workDate.getMonth();
    const day = workDate.getDate();

    let workMonth = month;
    let workYear = year;

    // 締め日を過ぎている場合は翌月扱い
    if (day > closingDay) {
        workMonth++;
        if (workMonth > 11) {
            workMonth = 0;
            workYear++;
        }
    }

    // 支払月（ラグ）を加算して支給日を決定
    let payMonth = workMonth + lagMonths;
    let payYear = workYear;

    while (payMonth > 11) {
        payMonth -= 12;
        payYear++;
    }

    // 25日固定（概算）
    return new Date(payYear, payMonth, 25);
};
