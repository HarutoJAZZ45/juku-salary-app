import type { Language } from '../locales/types';

export interface NewsItem {
    id: string;
    date: string;
    title: Record<Language, string>; // 言語ごとのタイトル
    content: Record<Language, string>; // 言語ごとの本文
    category: 'notice' | 'update'; // お知らせ または アップデート
    important?: boolean; // 重要フラグ
}

export const NEWS_ITEMS: NewsItem[] = [
    {
        id: '20260209-01',
        date: '2026-02-09',
        title: {
            ja: 'ユーザープロフィールとカスタマイズ機能を追加しました！👤🎨',
            en: 'User Profile & Customization Added! 👤🎨',
            es: '¡Perfil de usuario y personalización añadidas! 👤🎨'
        },
        content: {
            ja: `待望の「ユーザー機能」が大幅にパワーアップしました！
アプリ画面上のレベル表示やユーザーアイコンをタップすると、新しいプロフィール画面が開きます。

**新しくなったポイント**:
* 🎨 **テーマカスタマイズ**: お好みのグラデーションカラーを選んで、プロフィールを彩ることができます。
* 👤 **アバター選択**: 豊富なアイコン（バスケットボール🏀など）から自分にぴったりのアバターを設定可能！
* 📈 **レベルシステム**: 日々の勤務や給与に応じてXPが貯まり、レベルが上がっていくようになりました。
* 🏅 **生涯バッジ記録**: 獲得したバッジが「連勤🔥」と「給与🏆」のカテゴリ別に集計され、これまでの頑張りがひと目でわかります。

ぜひ自分好みにカスタマイズして、レベルアップを目指しましょう！`,
            en: `The "User Features" have received a major update!
Tap your level or user icon on the screen to open the new profile modal.

**What's New**:
* 🎨 **Theme Customization**: Choose your favorite gradient color to personalize your profile.
* 👤 **Avatar Selection**: Pick from a wide variety of icons (including Basketball 🏀) to represent yourself!
* 📈 **Level System**: Earn XP based on your work history and see your level grow.
* 🏅 **Lifetime Badge Stats**: Your earned badges are now categorized into "Streaks 🔥" and "Earnings 🏆", showing your progress at a glance.

Customize your profile and aim for the next level!`,
            es: `¡Las "Funciones de Usuario" han recibido una actualización importante!
Toque su nivel o el icono de usuario en la pantalla para abrir el nuevo modal de perfil.

**Novedades**:
* 🎨 **Personalización de Temas**: Elija su color de degradado favorito para personalizar su perfil.
* 👤 **Selección de Avatar**: ¡Elija entre una gran variedad de iconos (incluyendo Baloncesto 🏀) para representarse a sí mismo!
* 📈 **Sistema de Niveles**: Gane XP según su historial de trabajo y vea crecer su nivel.
* 🏅 **Estadísticas de Insignias**: Sus insignias ganadas ahora se clasifican en "Rachas 🔥" e "Ingresos 🏆", mostrando su progreso de un vistazo.

¡Personaliza tu perfil y apunta al siguiente nivel!`
        },
        category: 'update',
        important: false,
    },
    {
        id: '20260204-07',
        date: '2026-02-04',
        title: {
            ja: 'データのバックアップ機能を追加しました！💾',
            en: 'Data Backup (Export/Import) Added! 💾',
            es: '¡Copia de seguridad de datos añadida! 💾'
        },
        content: {
            ja: `待望の「データ管理機能」を追加しました！
機種変更や万が一のデータ消失に備えて、給与データを保存（エクスポート）し、復元（インポート）できるようになりました。

**使い方**:
1. 右上のメニュー（☰）を開く
2. 「データ管理 (バックアップ)」を選択
3. **エクスポート**: ボタンを押すと、データがファイルとしてダウンロードされます。
4. **インポート**: 保存したファイルを読み込むと、データが復元されます。

※インポート時は、同じ日付のデータは上書きされ、それ以外の日付のデータはそのまま残ります（マージ）。
こまめなバックアップをおすすめします！`,
            en: `We've added a highly requested "Data Management" feature!
You can now export (save) and import (restore) your salary data to prepare for device changes or accidental data loss.

**How to use**:
1. Open the top right menu (☰)
2. Select "Data Management"
3. **Export**: Tap the button to download your data as a file.
4. **Import**: Load the saved file to restore your data.

*Note: When importing, data for the same dates will be overwritten, while data for other dates will remain (merged).
We recommend backing up regularly!`,
            es: `¡Hemos añadido una función de "Gestión de Datos" muy solicitada!
Ahora puede exportar (guardar) e importar (restaurar) sus datos salariales para prepararse para cambios de dispositivo o pérdida accidental de datos.

**Cómo usar**:
1. Abra el menú superior derecho (☰)
2. Seleccione "Gestión de Datos"
3. **Exportar**: Toque el botón para descargar sus datos como un archivo.
4. **Importar**: Cargue el archivo guardado para restaurar sus datos.

*Nota: Al importar, los datos de las mismas fechas se sobrescribirán, mientras que los datos de otras fechas permanecerán (fusionados).
¡Recomendamos hacer copias de seguridad regularmente!`
        },
        category: 'update',
        important: true,
    },
    {
        id: '20260203-06',
        date: '2026-02-03',
        title: {
            ja: '扶養管理機能と分析グラフを追加しました！📊',
            en: 'Tax Monitor & Analytics Graph Added! 📊',
            es: '¡Monitor de Impuestos y Gráfico de Análisis Añade! 📊'
        },
        content: {
            ja: `便利な2つの新機能を追加しました！
            
**1. 扶養控除管理 (Tax Monitor)**
設定した年収の壁（デフォルト103万円）までの残額をホーム画面でひと目で確認できるようになりました。
上限額は、右上のメニュー（☰）→「設定」から自由に変更可能です。

**2. 給与分析グラフ**
画面右上のトレンドアイコン（📈）をタップすると、月ごとの「給与額」「コマ数」の推移をグラフで見ることができます。

働き方の調整や振り返りにぜひご活用ください！`,
            en: `Two new useful features have been added!

**1. Tax Monitor**
You can now check your remaining balance up to your annual income limit (default 1.03 million JPY) at a glance on the home screen.
You can change the limit from the top right menu (☰) -> "Settings".

**2. Analytics Graph**
Tap the trend icon (📈) on the top right to view charts of your monthly income and class counts.

Please use it to adjust your work style and look back on your progress!`,
            es: `¡Se han añadido dos nuevas funciones útiles!

**1. Monitor de Impuestos**
Ahora puede verificar su saldo restante hasta su límite de ingresos anuales (predeterminado 1.03 millones JPY) de un vistazo en la pantalla de inicio.
Puede cambiar el límite desde el menú superior derecho (☰) -> "Configuración".

**2. Gráfico de Análisis**
Toque el icono de tendencia (📈) en la parte superior derecha para ver gráficos de sus ingresos mensuales y conteo de clases.

¡Úselo para ajustar su estilo de trabajo y recordar su progreso!`
        },
        category: 'update',
        important: false,
    },
    {
        id: '20260203-05',
        date: '2026-02-03',
        title: {
            ja: 'バッジ機能を追加しました！🏆',
            en: 'Achievements (Badges) Added! 🏆',
            es: '¡Logros (Insignias) Añadidos! 🏆'
        },
        content: {
            ja: `頑張りが形になる「バッジ機能」を追加しました！
連勤日数や月間給与額に応じて、素敵な条件付きバッジを獲得できます。

**獲得できるバッジ**:
* 🔥 **連勤バッジ**: 3連勤、4連勤、5連勤
* 🏆 **給与バッジ**: 月収7万〜16万の各ランク（ブロンズ〜プラチナ）

獲得したバッジは給与カードに表示されます。
バッジをクリック・タップすると、すべてのバッジ一覧と獲得条件を確認できます。
今月のレジェンドを目指して頑張りましょう！`,
            en: `We've added an "Achievements" feature to visualize your hard work!
You can earn badges based on your consecutive working days and monthly earnings.

**Available Badges**:
* 🔥 **Streak Badges**: 3, 4, and 5 consecutive days
* 🏆 **Earnings Badges**: Bronze to Platinum ranks based on monthly income

Earned badges will appear on your Salary Summary card.
Click/Tap a badge to see the full list and requirements.
Aim for Platinum!`,
            es: `¡Hemos añadido una función de "Logros" para visualizar tu esfuerzo!
Puedes ganar insignias basadas en tus días de trabajo consecutivos y tus ingresos mensuales.

**Insignias Disponibles**:
* 🔥 **Insignias de Racha**: 3, 4 y 5 días consecutivos
* 🏆 **Insignias de Ingresos**: Rangos de Bronce a Platino basados en ingresos mensuales

Las insignias ganadas aparecerán en tu tarjeta de Resumen de Salario.
Haz clic/toca una insignia para ver la lista completa y los requisitos.
¡Apunta al Platino!`
        },
        category: 'update',
        important: false,
    },
    {
        id: '20260203-04',
        date: '2026-02-03',
        title: {
            ja: '日英西の3言語に対応しました！🌍',
            en: 'Multi-language Support Added (JP/EN/ES)! 🌍',
            es: '¡Soporte multilingüe añadido (JP/EN/ES)! 🌍'
        },
        content: {
            ja: `アプリが日本語・英語・スペイン語の3言語に対応しました！
設定ボタン（⚙️）の一番下にある言語切り替えボタンから、お好きな言語を選択できます。

**変更手順**:
1. 右上の設定ボタン（⚙️）をタップ
2. メニューの一番下までスクロール
3. 「日本語 / English / Español」から選択して保存

ぜひ使いやすい言語でご利用ください！`,
            en: `The app now supports 3 languages: Japanese, English, and Spanish!
You can select your preferred language from the language toggle button at the bottom of the Settings (⚙️) menu.

**How to change**:
1. Tap the Settings button (⚙️) at the top right
2. Scroll to the bottom of the menu
3. Select from "日本語 / English / Español" and Save

Please use the app in your preferred language!`,
            es: `¡La aplicación ahora soporta 3 idiomas: japonés, inglés y español!
Puede seleccionar su idioma preferido desde el botón de cambio de idioma en la parte inferior del menú de Configuración (⚙️).

**Cómo cambiar**:
1. Toque el botón de Configuración (⚙️) en la parte superior derecha
2. Desplácese hasta la parte inferior del menú
3. Seleccione entre "日本語 / English / Español" y Guardar

¡Utilice la aplicación en su idioma preferido!`
        },
        category: 'update',
        important: false,
    },
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
        category: 'update',
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
        category: 'update',
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
        category: 'notice',
        important: true,
    },
];
