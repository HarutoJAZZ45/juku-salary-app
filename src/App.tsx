import { lazy, Suspense, useState, useEffect } from 'react';
import { useSalaryData } from './hooks/useSalaryData';
import { Analytics } from "@vercel/analytics/react";
import { CalendarGrid } from './components/CalendarGrid';
import { SummaryCard } from './components/SummaryCard';
import { WorkModal } from './components/WorkModal';
import { FeedbackModal } from './components/FeedbackModal';
import { SettingsModal } from './components/SettingsModal';
import { BadgeHelpModal } from './components/BadgeHelpModal';
import { TaxMonitor } from './components/TaxMonitor';
import { DataManagementModal } from './components/DataManagementModal';
import { AuthModal } from './components/AuthModal';
import { LegalConsentGate } from './components/LegalConsentGate';
import { LegalDocumentModal } from './components/LegalDocumentModal';
import { useAuth } from './hooks/useAuth';
import { Settings, Info, ChevronLeft, ChevronRight, MessageSquare, Bell, TrendingUp, Menu, Database, User, Cloud, Trophy, CalendarDays, ShieldCheck, FileText } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import { LATEST_NEWS_ID } from './data/newsMeta';
import type { WorkEntry } from './types';
import { useTranslation } from './contexts/LanguageContext';
import { getEventBadges } from './utils/badges';
import { calculateLevelData, TITLES } from './utils/levelSystem';
import type { LegalDocumentType } from './legal/policies';
import { Navigate, useLocation, useNavigate } from 'react-router';

const AnalyticsModal = lazy(() =>
  import('./components/AnalyticsModal').then(module => ({ default: module.AnalyticsModal }))
);
const RankingModal = lazy(() =>
  import('./components/RankingModal').then(module => ({ default: module.RankingModal }))
);
const AccountModal = lazy(() =>
  import('./components/AccountModal').then(module => ({ default: module.AccountModal }))
);
const NewsModal = lazy(() =>
  import('./components/NewsModal').then(module => ({ default: module.NewsModal }))
);

function LoginRequiredScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 48%, #ecfeff 100%)',
      color: '#334155',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '420px',
        padding: '28px',
        borderRadius: '28px',
        background: 'rgba(255,255,255,0.72)',
        boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
        border: '1px solid rgba(255,255,255,0.9)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '18px',
          margin: '0 auto 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
          color: 'white'
        }}>
          <ShieldCheck size={30} />
        </div>
        <h1 style={{ fontSize: '22px', marginBottom: '10px' }}>ログインして利用を開始</h1>
        <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#64748b', margin: 0 }}>
          勤務記録と給与設定を安全に保存するため、ログイン後にホームを表示します。
          端末内に既存データがある場合は、ログイン後にアカウントへ移行します。
        </p>
      </div>
      <AuthModal isOpen onClose={() => undefined} />
      <Analytics />
    </div>
  );
}

/**
 * メインアプリケーションコンポーネント (SPAのルートレイアウト)
 * 
 * 役割:
 * 1. カスタムフック (`useSalaryData`, `useAuth`, `useTranslation`) によるグローバル状態の中央管理
 * 2. 画面レイアウト（Header枠、SummaryCardへのPropsバケツリレー、CalendarGrid配置など）のオーケストレーション
 * 3. 多数のフルスクリーン・モーダルUI（設定、バッジ、プロフィール等）の開閉フラグ(state)の中央管理
 * 4. 副作用（`useEffect`）を用いた称号の自動アンロックやニュースの未読チェック
 */
function App() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  // 給与データのカスタムフック（読み込み、更新、削除、設定）
  const { entries, settings, migrationNotice, updateEntry, deleteEntry, updateSettings, clearMigrationNotice, isLoaded } = useSalaryData();

  // 認証のカスタムフック
  const { user, loading: authLoading } = useAuth();

  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  // モーダル（ポップアップ）の表示状態管理
  const [selectedDate, setSelectedDate] = useState<Date | Date[] | null>(null);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const [isBadgeHelpOpen, setIsBadgeHelpOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openLegalDocument, setOpenLegalDocument] = useState<LegalDocumentType | null>(null);

  // 一括編集モードの状態管理
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // バッジと通知のロジック
  const hasUnreadNews = (
    location.pathname !== '/news' &&
    localStorage.getItem('lastReadNewsId') !== LATEST_NEWS_ID
  );
  const [showHelpHint, setShowHelpHint] = useState(() => !localStorage.getItem('hasSeenHelp'));

  // 称号・バッジの獲得状況監視
  useEffect(() => {
    if (!isLoaded || !settings.profile) return;

    // 1. イベント称号の判定
    const earnedEventBadges = getEventBadges(entries);
    const currentUnlocked = settings.profile.unlockedTitles || [];
    let newUnlockedTitles = [...currentUnlocked];
    let changed = false;

    // 正月特訓 2026
    const hasNewYear = earnedEventBadges.some(b => b.id === 'event-newyear-2026');
    if (hasNewYear && !newUnlockedTitles.includes('gasho2026')) {
      newUnlockedTitles.push('gasho2026');
      changed = true;
    } else if (!hasNewYear && newUnlockedTitles.includes('gasho2026')) {
      newUnlockedTitles = newUnlockedTitles.filter(t => t !== 'gasho2026');
      changed = true;
    }

    // 2. レベル称号の判定
    const levelData = calculateLevelData(entries, settings);
    const currentLevel = levelData.level;

    TITLES.forEach(title => {
      // レベル条件を満たしていて、かつまだ持っていない場合
      if (currentLevel >= title.level && !newUnlockedTitles.includes(title.id)) {
        newUnlockedTitles.push(title.id);
        changed = true;
      }
    });

    if (changed) {
      // プロフィールの状態を更新
      // （※バッジシステムやレベルは表示のみの導出データではなく、アバターや称号の設定値としてLocalStorage/Firestoreに永続化される）
      const activeTitle = settings.profile.activeTitle;
      const updates: Partial<typeof settings.profile> = { unlockedTitles: newUnlockedTitles };
      if (activeTitle && !newUnlockedTitles.includes(activeTitle)) {
        updates.activeTitle = undefined; // 所持していない称号がセットされていたらリセット
      }

      updateSettings({
        ...settings,
        profile: {
          ...settings.profile,
          ...updates
        }
      });
    }
  }, [entries, settings, isLoaded, updateSettings]);

  const handleOpenNews = () => {
    navigate('/news');
  };

  useEffect(() => {
    if (location.pathname !== '/news') return;
    localStorage.setItem('lastReadNewsId', LATEST_NEWS_ID);
  }, [location.pathname]);

  // 認証状態の確認完了までローディング表示
  if (authLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'gray' }}>Loading...</div>;

  // 未ログイン時はホーム画面を表示しない
  if (!user) return <LoginRequiredScreen />;

  // データの読み込み完了までローディング表示
  if (!isLoaded) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'gray' }}>Loading...</div>;

  // カレンダーの日付クリック時の処理
  const handleDayClick = (day: Date) => {
    if (isSelectionMode) {
      // 選択モード時: 日付の選択・解除を切り替える
      const exists = selectedDates.some(d => format(d, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
      if (exists) {
        setSelectedDates(prev => prev.filter(d => format(d, 'yyyy-MM-dd') !== format(day, 'yyyy-MM-dd')));
      } else {
        setSelectedDates(prev => [...prev, day]);
      }
    } else {
      // 通常時: 編集モーダルを開く
      setSelectedDate(day);
      setIsWorkModalOpen(true);
    }
  };

  // 選択された日付を一括編集する
  const handleBatchEdit = () => {
    if (selectedDates.length === 0) return;
    setSelectedDate(selectedDates); // Pass array
    setIsWorkModalOpen(true);
  };

  // 選択モードの切り替え
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedDates([]); // 切り替え時に選択をリセット
  };

  // 勤務データの保存処理
  const handleSavework = (dateStr: string, data: Partial<WorkEntry>) => {
    updateEntry(dateStr, data);
  };

  // 勤務データの削除処理
  const handleDeleteEntry = async (dateStr: string) => {
    await deleteEntry(dateStr);
  };

  // 月の移動処理
  const handleMonthNav = (dir: 'prev' | 'next') => {
    setCurrentViewDate(d => dir === 'prev' ? subMonths(d, 1) : addMonths(d, 1));
  };

  // 今月かどうかを判定（「今日に戻る」ボタンの表示制御）
  const isCurrentMonth = format(currentViewDate, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  // 今日に戻る処理
  const handleGoToToday = () => {
    setCurrentViewDate(new Date());
  };

  if (!['/home', '/settings', '/analytics', '/ranking', '/profile', '/news'].includes(location.pathname)) {
    return <Navigate to="/home" replace />;
  }

  if (location.pathname === '/settings') {
    return (
      <LegalConsentGate user={user}>
        <SettingsModal
          isOpen
          displayMode="page"
          settings={settings}
          onClose={() => navigate('/home')}
          onSave={updateSettings}
        />
        <Analytics />
      </LegalConsentGate>
    );
  }

  if (location.pathname === '/analytics') {
    return (
      <LegalConsentGate user={user}>
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>読み込み中...</div>}>
          <AnalyticsModal
            isOpen
            displayMode="page"
            onClose={() => navigate('/home')}
          />
        </Suspense>
        <Analytics />
      </LegalConsentGate>
    );
  }

  if (location.pathname === '/ranking') {
    return (
      <LegalConsentGate user={user}>
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>読み込み中...</div>}>
          <RankingModal
            isOpen
            displayMode="page"
            onClose={() => navigate('/home')}
            onOpenProfile={() => navigate('/profile')}
            settings={settings}
          />
        </Suspense>
        <Analytics />
      </LegalConsentGate>
    );
  }

  if (location.pathname === '/profile') {
    return (
      <LegalConsentGate user={user}>
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>読み込み中...</div>}>
          <AccountModal
            isOpen
            displayMode="page"
            onClose={() => navigate('/home')}
            entries={entries}
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        </Suspense>
        <Analytics />
      </LegalConsentGate>
    );
  }

  if (location.pathname === '/news') {
    return (
      <LegalConsentGate user={user}>
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>読み込み中...</div>}>
          <NewsModal
            isOpen
            displayMode="page"
            onClose={() => navigate('/home')}
          />
        </Suspense>
        <Analytics />
      </LegalConsentGate>
    );
  }

  return (
    <LegalConsentGate user={user}>
    <>
      {/* メニューオーバーレイ（右上のハンバーガーメニュー） */}
      {isMenuOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start'
          }}
          onClick={() => setIsMenuOpen(false)}
        >
          {/* Backdrop */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)' }} />

          {/* Menu Content */}
          <div
            style={{
              position: 'relative',
              width: '200px',
              background: 'white',
              borderRadius: '16px',
              margin: '60px 16px 0 0',
              padding: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              display: 'flex', flexDirection: 'column', gap: '4px',
              animation: 'fadeIn 0.2s'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => { handleOpenNews(); setIsMenuOpen(false); }}
              className="menu-item"
              style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', width: '100%', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}
            >
              <div style={{ position: 'relative' }}>
                <Bell size={18} />
                {hasUnreadNews && (
                  <span style={{
                    position: 'absolute', top: -2, right: -2,
                    width: '8px', height: '8px', background: '#e11d48',
                    borderRadius: '50%', border: '1px solid white'
                  }} />
                )}
              </div>
              {t.app.newsTitle}
            </button>

            <button
              onClick={() => { navigate('/settings'); setIsMenuOpen(false); }}
              className="menu-item"
              style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', width: '100%', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}
            >
              <Settings size={18} />
              {t.settings.title}
            </button>

            {/* 統計グラフ - ハンバーガーメニュー内 */}
            <button
              onClick={() => { navigate('/analytics'); setIsMenuOpen(false); }}
              className="menu-item"
              style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', width: '100%', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}
            >
              <TrendingUp size={18} />
              統計・グラフ
            </button>

            <button
              onClick={() => { setIsDataManagementOpen(true); setIsMenuOpen(false); }}
              className="menu-item"
              style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', width: '100%', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}
            >
              <Database size={18} />
              {t.dataManagement.title}
            </button>

            <button
              onClick={() => { setOpenLegalDocument('terms'); setIsMenuOpen(false); }}
              className="menu-item"
              style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', width: '100%', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}
            >
              <FileText size={18} />
              利用規約
            </button>

            <button
              onClick={() => { setOpenLegalDocument('privacy'); setIsMenuOpen(false); }}
              className="menu-item"
              style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', width: '100%', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}
            >
              <ShieldCheck size={18} />
              プライバシーポリシー
            </button>

            <button
              onClick={() => { setIsFeedbackOpen(true); setIsMenuOpen(false); }}
              className="menu-item"
              style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', width: '100%', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}
            >
              <MessageSquare size={18} />
              Feedback
            </button>
          </div>
        </div>
      )}
      <header style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        marginBottom: '12px', padding: '0 8px', height: 'auto', minHeight: '44px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              setIsHelpOpen(!isHelpOpen);
              setShowHelpHint(false);
              localStorage.setItem('hasSeenHelp', 'true');
            }}
            className={`glass-btn ${showHelpHint ? 'pulse-hint' : ''}`}
            style={{ padding: '8px', background: 'rgba(255,255,255,0.5)', color: 'var(--text-main)', boxShadow: 'none' }}
          >
            <Info size={20} />
          </button>
          <button onClick={() => navigate('/ranking')} className="glass-btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.5)', color: 'var(--text-main)', boxShadow: 'none' }}>
            <Trophy size={20} fill="#fbbf24" stroke="#d97706" />
          </button>
          {/* ログインボタン: 未ログイン→紫「Login」/ メールログイン→イニシャル緑 / Googleログイン→アバター+緑ドット */}
          <button
            onClick={() => setIsAuthOpen(true)}
            className="glass-btn"
            style={{
              padding: user ? '6px 8px' : '6px 12px',
              background: user ? 'rgba(255,255,255,0.5)' : 'var(--primary)',
              color: user ? 'var(--text-main)' : 'white',
              boxShadow: user ? 'none' : '0 2px 8px rgba(99,102,241,0.35)',
              position: 'relative',
              display: 'flex', alignItems: 'center', gap: '6px',
              borderRadius: '10px', fontWeight: 600, fontSize: '13px',
              transition: 'all 0.2s'
            }}
          >
            {user && user.photoURL ? (
              // Googleログイン: アバター画像 + 緑ドット
              <>
                <img src={user.photoURL} alt="User" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                <span style={{
                  position: 'absolute', bottom: '5px', right: '5px',
                  width: '7px', height: '7px', background: '#22c55e',
                  borderRadius: '50%', border: '1.5px solid white'
                }} />
              </>
            ) : user ? (
              // メールログイン: イニシャルアバター（緑）+ 緑ドット
              <>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                  color: 'white', fontSize: '11px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, textTransform: 'uppercase'
                }}>
                  {(user.displayName?.[0] ?? user.email?.[0] ?? '?')}
                </span>
                <span style={{
                  position: 'absolute', bottom: '5px', right: '5px',
                  width: '7px', height: '7px', background: '#22c55e',
                  borderRadius: '50%', border: '1.5px solid white'
                }} />
              </>
            ) : (
              // 未ログイン: Cloud + "Login"
              <>
                <Cloud size={16} />
                <span>Login</span>
              </>
            )}
          </button>
          <button onClick={() => navigate('/profile')} className="glass-btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.5)', color: 'var(--text-main)', boxShadow: 'none', position: 'relative' }}>
            <User size={20} />
            {(() => {
              const lastSeen = JSON.parse(localStorage.getItem('lastSeenTitles') || '[]');
              const current = settings.profile?.unlockedTitles || [];
              const hasNew = current.some((t: string) => !lastSeen.includes(t));
              return hasNew && (
                <span style={{
                  position: 'absolute', top: '6px', right: '6px',
                  width: '8px', height: '8px', background: '#e11d48',
                  borderRadius: '50%', border: '1px solid white'
                }} />
              );
            })()}
          </button>

          {/* Hamburger Menu Trigger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="glass-btn"
            style={{
              padding: '8px',
              background: 'rgba(255,255,255,0.5)',
              color: 'var(--text-main)',
              boxShadow: 'none',
              position: 'relative'
            }}
          >
            <Menu size={20} />
            {hasUnreadNews && (
              <span style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '8px', height: '8px', background: '#e11d48',
                borderRadius: '50%', border: '1px solid white'
              }} />
            )}
          </button>
        </div>
      </header>

      {migrationNotice && (
        <div style={{
          margin: '0 8px 16px',
          padding: '12px 14px',
          borderRadius: '14px',
          background: '#ecfdf5',
          border: '1px solid #bbf7d0',
          color: '#166534',
          fontSize: '13px',
          lineHeight: 1.6,
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ flex: 1 }}>{migrationNotice}</div>
          <button
            onClick={clearMigrationNotice}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#166534',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            OK
          </button>
        </div>
      )}

      {isHelpOpen && (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', fontSize: '13px', lineHeight: '1.6', position: 'relative' }}>
          <button onClick={() => setIsHelpOpen(false)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none' }}><Info size={16} color="gray" /></button>

          <strong>{t.app.helpUsage}</strong><br />
          1. {t.app.helpStep1}<br />
          2. {t.app.helpStep2}<br />
          3. {t.app.helpStep3}<br />
          4. {t.app.helpStep4}<br />
          <div style={{ marginTop: '12px', padding: '12px', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #bae6fd', borderRadius: '12px', color: '#0369a1', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '20px' }}>📱</div>
            <div>{t.app.helpStep5}</div>
          </div>
          <br />
          <strong>{t.app.helpSave}</strong><br />
          {t.app.helpSaveBody}
          <div style={{ marginTop: '16px', padding: '8px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', color: '#be123c', fontWeight: 'bold' }}>
            ※確実にデータを同期させたい場合は、ログインメニューから「クラウドへ保存」「クラウドから復元」を用いて手動で同期してください。
          </div>
        </div>
      )}

      {/* サマリーカード（給与見込み等の表示） */}
      <SummaryCard
        entries={entries}
        settings={settings}
        currentDate={currentViewDate}
        onBadgeClick={() => setIsBadgeHelpOpen(true)}
      />


      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 8px' }}>
        <button onClick={() => handleMonthNav('prev')} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}>
          <ChevronLeft size={24} color="#64748b" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#334155' }}>
            {format(currentViewDate, t.calendar.formatMonth)}
          </span>
          {/* 今日に戻るボタン（今月以外を表示中のみ表示） */}
          {!isCurrentMonth && (
            <button
              onClick={handleGoToToday}
              title="今日に戻る"
              style={{
                padding: '4px 10px', fontSize: '12px', borderRadius: '12px',
                border: '1px solid #bfdbfe',
                background: '#eff6ff',
                color: '#3b82f6',
                fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px',
                transition: 'all 0.15s'
              }}
            >
              <CalendarDays size={13} />
              今日
            </button>
          )}
          <button
            onClick={toggleSelectionMode}
            style={{
              padding: '4px 10px', fontSize: '12px', borderRadius: '12px',
              border: isSelectionMode ? '1px solid var(--primary)' : '1px solid #e2e8f0',
              background: isSelectionMode ? 'var(--primary-light)' : 'white',
              color: isSelectionMode ? 'white' : '#64748b',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {isSelectionMode ? t.app.selecting : t.app.selectMult}
          </button>
        </div>
        <button onClick={() => handleMonthNav('next')} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}>
          <ChevronRight size={24} color="#64748b" />
        </button>
      </div>

      {/* カレンダーグリッド表示 */}
      <div style={{ paddingBottom: isSelectionMode ? '80px' : '0' }}>
        <CalendarGrid
          currentMonth={currentViewDate}
          entries={entries}
          settings={settings}
          onDayClick={handleDayClick}
          isSelectionMode={isSelectionMode}
          selectedDates={selectedDates}
        />
      </div>

      {/* 扶養管理ゲージ（カレンダーの下） */}
      <div style={{ padding: '16px 8px 0' }}>
        <TaxMonitor entries={entries} settings={settings} />
      </div>
      {/* 一括編集時の下部フローティングアクションバー */}
      {isSelectionMode && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          width: '90%', maxWidth: '360px',
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
          borderRadius: '16px', padding: '12px 20px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 100
        }}>
          <span style={{ fontWeight: 600, color: '#334155' }}>{selectedDates.length}{t.app.selected}</span>
          <button
            onClick={handleBatchEdit}
            disabled={selectedDates.length === 0}
            style={{
              background: 'var(--primary)', color: 'white', border: 'none',
              padding: '8px 16px', borderRadius: '8px', fontWeight: 600,
              cursor: selectedDates.length === 0 ? 'not-allowed' : 'pointer',
              opacity: selectedDates.length === 0 ? 0.5 : 1
            }}
          >
            {t.app.editButton}
          </button>
        </div>
      )}

      {/* 各種モーダルコンポーネント */}
      {isWorkModalOpen && selectedDate && (
        <WorkModal
          isOpen
          date={selectedDate}
          entry={!Array.isArray(selectedDate) ? entries[format(selectedDate, 'yyyy-MM-dd')] : undefined}
          onClose={() => setIsWorkModalOpen(false)}
          onSave={handleSavework}
          onDelete={handleDeleteEntry}
          settings={settings}
          onSaveComplete={() => {
            if (isSelectionMode) {
              setIsSelectionMode(false);
              setSelectedDates([]);
            }
          }}
        />
      )}

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <BadgeHelpModal
        isOpen={isBadgeHelpOpen}
        onClose={() => setIsBadgeHelpOpen(false)}
      />

      <DataManagementModal
        isOpen={isDataManagementOpen}
        onClose={() => setIsDataManagementOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
      <LegalDocumentModal
        type={openLegalDocument}
        onClose={() => setOpenLegalDocument(null)}
      />
      <Analytics />
    </>
    </LegalConsentGate>
  );
}

export default App;
