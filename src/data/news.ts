import type { Language } from '../locales/types';

export interface NewsItem {
    id: string;
    date: string;
    title: Record<Language, string>;
    content: Record<Language, string>;
    important?: boolean;
}

export const NEWS_ITEMS: NewsItem[] = [
    {
        id: '20260203-03',
        date: '2026-02-03',
        title: {
            ja: '新機能：「一括編集モード」を追加しました！📅',
            en: 'New Feature: Batch Edit Mode! 📅',
            es: '¡Nueva función: Modo de edición por lotes! 📅'
        },
        content: {
            ja: `シフト入力がもっと便利になりました！
カレンダー上の「複数選択」ボタンを押すと、複数の日付を一気に選んで、同じ勤務内容をまとめて入力できます。

**使い方**:
1. カレンダー右上の「複数選択」をタップ
2. 入力したい日付をいくつかタップ（青くなります）
3. 画面下の「○日分を編集」ボタンをタップ
4. いつも通り入力して保存！

月・水・金など、決まったシフトの入力がとても楽になります。ぜひお試しください！✨`,
            en: `Shift entry is now much easier!
Press the "Select Multiple" button on the calendar to select multiple dates at once and enter the same work details together.

**How to use**:
1. Tap "Select Multiple" at the top right of the calendar
2. Tap the dates you want to input (they will turn blue)
3. Tap the "Edit for X days" button at the bottom of the screen
4. Enter your shift details as usual and save!

It makes entering fixed shifts like Mon-Wed-Fri very easy. Please try it out! ✨`,
            es: `¡La entrada de turnos ahora es mucho más fácil!
Presione el botón "Selección múltiple" en el calendario para seleccionar varias fechas a la vez e ingresar los mismos detalles de trabajo juntos.

**Cómo usar**:
1. Toque "Selección múltiple" en la parte superior derecha del calendario
2. Toque las fechas que desea ingresar (se volverán azules)
3. Toque el botón "Editar para varios días" en la parte inferior de la pantalla
4. ¡Ingrese sus detalles de turno como de costumbre y guarde!

Hace que ingresar turnos fijos como Lun-Mié-Vie sea muy fácil. ¡Pruébelo! ✨`
        },
        important: false,
    },
    {
        id: '20260203-02',
        date: '2026-02-03',
        title: {
            ja: 'iPhoneホーム画面用アイコンを追加しました📱',
            en: 'Added iPhone Home Screen Icon 📱',
            es: 'Icono de pantalla de inicio de iPhone agregado 📱'
        },
        content: {
            ja: `iPhoneの「ホーム画面に追加」をした際に、専用のアイコンが表示されるようになりました！
まだの方は、ぜひホーム画面に追加してアプリのように使ってみてください。

**手順**:
Safariの下部メニュー「共有」ボタン → 「ホーム画面に追加」`,
            en: `A dedicated icon is now displayed when you "Add to Home Screen" on iPhone!
If you haven't already, please try adding it to your home screen and using it like an app.

**Steps**:
Safari bottom menu "Share" button -> "Add to Home Screen"`,
            es: `¡Ahora se muestra un icono dedicado cuando "Agregar a la pantalla de inicio" en iPhone!
Si aún no lo ha hecho, intente agregarlo a su pantalla de inicio y usarlo como una aplicación.

**Pasos**:
Botón "Compartir" del menú inferior de Safari -> "Agregar a la pantalla de inicio"`
        },
        important: false,
    },
    {
        id: '20260203-01',
        date: '2026-02-03',
        title: {
            ja: 'アプリをご利用いただきありがとうございます！🎉',
            en: 'Thank you for using the app! 🎉',
            es: '¡Gracias por usar la aplicación! 🎉'
        },
        content: {
            ja: `Juku Salary Appをご利用いただき、本当にありがとうございます！
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
            en: `Thank you so much for using the Juku Salary App!
This app was created to make calculating complex cram school instructor salaries a little easier.

📱 **How to use**
1. Tap a date on the calendar to enter work.
2. Select your teaching blocks, campus, support pay, etc., and save.
3. The card at the top of the screen displays your estimated salary mainly calculated automatically.
(Don't forget to set your hourly wage and transportation expenses from the ⚙️ Settings button on the top right!)

💬 **Feedback Request**
If you have any requests like "I want this feature" or "This is hard to use", please send us your feedback from the speech bubble icon 💬 on the top right of the screen!
We will continue to make it more convenient based on your voice.

Thank you for your continued support of the Juku Salary App!`,
            es: `¡Muchas gracias por usar la Juku Salary App!
Esta aplicación fue creada para facilitar un poco el cálculo de los salarios complejos de los instructores de escuelas intensivas.

📱 **Cómo usar**
1. Toque una fecha en el calendario para ingresar el trabajo.
2. Seleccione sus bloques de enseñanza, campus, pago de apoyo, etc., y guarde.
3. La tarjeta en la parte superior de la pantalla muestra su salario estimado calculado automáticamente.
(¡No olvide configurar su salario por hora y gastos de transporte desde el botón de configuración ⚙️ en la parte superior derecha!)

💬 **Solicitud de comentarios**
Si tiene alguna solicitud como "Quiero esta función" o "Esto es difícil de usar", envíenos sus comentarios desde el icono de burbuja de diálogo 💬 en la parte superior derecha de la pantalla.
Seguiremos haciéndolo más conveniente basándonos en su voz.

¡Gracias por su continuo apoyo a la Juku Salary App!`
        },
        important: true,
    },
];
