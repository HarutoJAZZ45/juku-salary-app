export interface NewsItem {
    id: string;
    date: string;
    title: string;
    content: string; // Can contain HTML-like strings or just text. For simplicity, we'll use text with newlines.
    important?: boolean;
}

export const NEWS_ITEMS: NewsItem[] = [
    {
        id: '20260203-01',
        date: '2026-02-03',
        title: 'アプリをご利用いただきありがとうございます！🎉',
        content: `Juku Salary Appをご利用いただき、本当にありがとうございます！
このアプリは、複雑な塾講師の給与計算を少しでも楽にするために作られました。

📱 **使い方について**
1. カレンダーの日付をタップして、勤務を入力します。
2. 担当コマや校舎、事務給などを選択して保存します。
3. 画面上のカードに、自動計算された給与見込みが表示されます。
（右上の⚙️設定ボタンから、時給や交通費の設定をお忘れなく！）

💬 **フィードバックのお願い**
「もっとこうして欲しい」「ここが使いにくい」などがあれば、画面右上の吹き出しアイコン💬から、ぜひご意見をお寄せください！
皆様の声をもとに、どんどん便利にしていきます。

これからもJuku Salary Appをよろしくお願いいたします！`,
        important: true,
    },
];
