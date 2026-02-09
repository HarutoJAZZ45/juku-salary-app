import { useState, useEffect } from 'react';
import { useSalaryData } from './hooks/useSalaryData';
import { Analytics } from "@vercel/analytics/react";
import { CalendarGrid } from './components/CalendarGrid';
import { SummaryCard } from './components/SummaryCard';
import { WorkModal } from './components/WorkModal';
import { FeedbackModal } from './components/FeedbackModal';
import { SettingsModal } from './components/SettingsModal';
import { NewsModal } from './components/NewsModal';
import { BadgeHelpModal } from './components/BadgeHelpModal';
import { TaxMonitor } from './components/TaxMonitor';
import { AnalyticsModal } from './components/AnalyticsModal';
import { DataManagementModal } from './components/DataManagementModal';
import { AccountModal } from './components/AccountModal';
import { Settings, Info, ChevronLeft, ChevronRight, MessageSquare, Bell, TrendingUp, Menu, Database, Smartphone, User } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import { NEWS_ITEMS } from './data/news';
import type { WorkEntry } from './types';
import { useTranslation } from './contexts/LanguageContext';
import { getEventBadges } from './utils/badges';
import { calculateLevelData, TITLES } from './utils/levelSystem';

// メインアプリケーションコンポーネント
// 全体のレイアウトと状態管理を行う
function App() {
  const { t } = useTranslation();
  // 給与データのカスタムフック（読み込み、更新、削除、設定）
  const { entries, settings, updateEntry, deleteEntry, setSettings, isLoaded } = useSalaryData();

  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  // モーダル（ポップアップ）の表示状態管理
  const [selectedDate, setSelectedDate] = useState<Date | Date[] | null>(null);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);

  const [isBadgeHelpOpen, setIsBadgeHelpOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 一括編集モードの状態管理
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // バッジと通知のロジック
  const [hasUnreadNews, setHasUnreadNews] = useState(false);
  const [showHelpHint, setShowHelpHint] = useState(false);

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
      // もし現在セットしている称号が剥奪された場合（レベル称号は剥奪されないが汎用的に）
      const activeTitle = settings.profile.activeTitle;
      const updates: Partial<typeof settings.profile> = { unlockedTitles: newUnlockedTitles };
      if (activeTitle && !newUnlockedTitles.includes(activeTitle)) {
        updates.activeTitle = undefined;
      }

      setSettings({
        ...settings,
        profile: {
          ...settings.profile,
          ...updates
        }
      });
    }
  }, [entries, settings, isLoaded, setSettings]);

  useEffect(() => {
    // ヘルプの初回表示チェック
    // 初めてアプリアクセスしたユーザーにはヒントを表示する
    const hasSeenHelp = localStorage.getItem('hasSeenHelp');
    if (!hasSeenHelp) {
      setShowHelpHint(true);
    }

    // 未読ニュースの確認
    if (NEWS_ITEMS.length > 0) {
      const lastReadId = localStorage.getItem('lastReadNewsId');
      if (lastReadId !== NEWS_ITEMS[0].id) {
        setHasUnreadNews(true);
      }
    }
  }, []);

  const handleOpenNews = () => {
    setIsNewsOpen(true);
    setHasUnreadNews(false);
    if (NEWS_ITEMS.length > 0) {
      localStorage.setItem('lastReadNewsId', NEWS_ITEMS[0].id);
    }
  };

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
  const handleDeleteEntry = (dateStr: string) => {
    deleteEntry(dateStr);
  };

  // 月の移動処理
  const handleMonthNav = (dir: 'prev' | 'next') => {
    setCurrentViewDate(d => dir === 'prev' ? subMonths(d, 1) : addMonths(d, 1));
  };

  return (
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
              onClick={() => { setIsSettingsOpen(true); setIsMenuOpen(false); }}
              className="menu-item"
              style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', width: '100%', textAlign: 'left', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155' }}
            >
              <Settings size={18} />
              {t.settings.title}
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
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '24px', padding: '0 8px', height: 'var(--header-height)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="./logo.svg" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(4, 96, 167, 0.2)' }} />
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
            Juku Salary
          </h1>
        </div>
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
          <button onClick={() => setIsAnalyticsOpen(true)} className="glass-btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.5)', color: 'var(--text-main)', boxShadow: 'none' }}>
            <TrendingUp size={20} />
          </button>
          <button onClick={() => setIsAccountOpen(true)} className="glass-btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.5)', color: 'var(--text-main)', boxShadow: 'none', position: 'relative' }}>
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

      {isHelpOpen && (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', fontSize: '13px', lineHeight: '1.6', position: 'relative' }}>
          <button onClick={() => setIsHelpOpen(false)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none' }}><Info size={16} color="gray" /></button>

          <strong>{t.app.helpUsage}</strong><br />
          1. {t.app.helpStep1}<br />
          2. {t.app.helpStep2}<br />
          3. {t.app.helpStep3}<br />
          4. {t.app.helpStep4}<br />
          <br />
          <strong>{t.app.helpSave}</strong><br />
          {t.app.helpSaveBody}
          <div style={{
            color: 'var(--primary)',
            marginTop: '8px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 500
          }}>
            <Smartphone size={14} />
            <span>{t.app.helpPWA}</span>
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

      <div style={{ padding: '0 8px' }}>
        <TaxMonitor entries={entries} settings={settings} />
      </div>

      {/* 月移動ナビゲーションと一括選択切り替えボタン */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 8px' }}>
        <button onClick={() => handleMonthNav('prev')} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}>
          <ChevronLeft size={24} color="#64748b" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#334155' }}>
            {format(currentViewDate, t.calendar.formatMonth)}
          </span>
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
      <WorkModal
        isOpen={isWorkModalOpen}
        date={selectedDate}
        entry={!Array.isArray(selectedDate) && selectedDate ? entries[format(selectedDate, 'yyyy-MM-dd')] : undefined}
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

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={setSettings}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <NewsModal
        isOpen={isNewsOpen}
        onClose={() => setIsNewsOpen(false)}
      />

      <BadgeHelpModal
        isOpen={isBadgeHelpOpen}
        onClose={() => setIsBadgeHelpOpen(false)}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <DataManagementModal
        isOpen={isDataManagementOpen}
        onClose={() => setIsDataManagementOpen(false)}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        entries={entries}
        settings={settings}
        onUpdateSettings={setSettings}
      />
      <Analytics />
    </>
  );
}

export default App;
