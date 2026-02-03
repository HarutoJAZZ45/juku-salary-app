export type Language = 'ja' | 'en' | 'es';

export interface Translation {
    common: {
        save: string;
        cancel: string;
        delete: string;
        close: string;
        loading: string;
        edit: string;
    };
    header: {
        title: string;
    };
    summary: {
        paymentEstimate: string;
        teachingPay: string;
        supportPay: string;
        allowance: string;
        transport: string;
        totalHours: string;
        currentMonth: string;
    };
    calendar: {
        weekDays: string[]; // [Sun, Mon, ...]
        formatMonth: string; // e.g. "yyyy年 M月" or "MMMM yyyy"
    };
    workModal: {
        editTitle: string; // "{date} の編集"
        batchTitle: string; // "{count}日分を一括編集"
        campus: string;
        locationAllowance: string; // "勤務給: +{amount}円"
        koma: string;
        rolePay: string;
        leader: string;
        subLeader: string;
        supportWork: string; // "追加業務・残業 (分)"
        allowanceLabel: string; // "手当給 (円)"
        transportLabel: string;
        deleteConfirm: string;
        batchDeleteConfirm: string;
    };
    settings: {
        title: string;
        homeCampus: string;
        teachingRate: string;
        teachingRateHelper: string;
        hourlyRate: string;
        transportSettings: string;
        closingDay: string;
        saveButton: string;
        language: string;
    };
    app: {
        helpTitle: string;
        helpUsage: string;
        helpSave: string;
        helpBatch: string;
        helpStep1: string;
        helpStep2: string;
        helpStep3: string;
        helpStep4: string;
        helpBatchBody: string;
        helpSaveBody: string;
        batchMode: string;
        selecting: string; // "選択中"
        selectMult: string; // "複数選択"
        selected: string; // "{count}日を選択中"
        editButton: string;
        newsTitle: string;
        newsEmpty: string;
    };
}
