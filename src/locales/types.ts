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
        annualLimit: string;
    };
    app: {
        helpTitle: string;
        helpUsage: string;
        helpSave: string;
        helpSaveBody: string;
        helpStep1: string;
        helpStep2: string;
        helpStep3: string;
        helpStep4: string;
        batchMode: string;
        selecting: string;
        selectMult: string;
        selected: string;
        editButton: string;
        newsTitle: string;
        newsEmpty: string;
        newsFilterAll: string;
        newsFilterImportant: string;
        newsFilterUpdate: string;
        paydayTitle: string;
        paydayContent: string;
    };
    tax: {
        title: string;
        annualIncome: string;
        remaining: string;
        safe: string;
        warning: string;
        danger: string;
    };
    analytics: {
        title: string;
        monthlyIncome: string;
        workHours: string;
        classCount: string;
    };
    badges: {
        streakBronze: string;
        streakSilver: string;
        streakGold: string;
        streakDesc: string; // Generic description for streak
        earnBronze: string;
        earnSilver: string;
        earnGold: string;
        earnPlatinum: string;
        earnBronzeDesc: string;
        earnSilverDesc: string;
        earnGoldDesc: string;
        earnPlatinumDesc: string;
        modalTitle: string;
        modalDesc: string;
    };
    dataManagement: {
        title: string;
        export: string;
        import: string;
        importWarning: string;
        success: string;
        error: string;
    };
}
