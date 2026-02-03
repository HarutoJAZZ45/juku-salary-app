import { useState, useEffect } from 'react';
import { useSalaryData } from './hooks/useSalaryData';
import { CalendarGrid } from './components/CalendarGrid';
import { SummaryCard } from './components/SummaryCard';
import { WorkModal } from './components/WorkModal';
import { FeedbackModal } from './components/FeedbackModal';
import { SettingsModal } from './components/SettingsModal';
import { NewsModal } from './components/NewsModal';
import { Settings, Info, ChevronLeft, ChevronRight, MessageSquare, Bell } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import { NEWS_ITEMS } from './data/news';
import type { WorkEntry } from './types';

function App() {
  const { entries, settings, updateEntry, deleteEntry, setSettings, isLoaded } = useSalaryData();

  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  // Modal States
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);

  // Badge Logic
  const [hasUnreadNews, setHasUnreadNews] = useState(false);

  useEffect(() => {
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

  if (!isLoaded) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'gray' }}>Loading...</div>;

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsWorkModalOpen(true);
  };

  const handleSavework = (dateStr: string, data: Partial<WorkEntry>) => {
    updateEntry(dateStr, data);
  };

  const handleDeleteEntry = (dateStr: string) => {
    deleteEntry(dateStr);
  };

  const handleMonthNav = (dir: 'prev' | 'next') => {
    setCurrentViewDate(d => dir === 'prev' ? subMonths(d, 1) : addMonths(d, 1));
  };

  return (
    <>
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
          <button onClick={handleOpenNews} className="glass-btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.5)', color: 'var(--text-main)', boxShadow: 'none', position: 'relative' }}>
            <Bell size={20} />
            {hasUnreadNews && (
              <span style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '8px', height: '8px', background: '#e11d48',
                borderRadius: '50%', border: '1px solid white'
              }} />
            )}
          </button>
          <button onClick={() => setIsFeedbackOpen(true)} className="glass-btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.5)', color: 'var(--text-main)', boxShadow: 'none' }}>
            <MessageSquare size={20} />
          </button>
          <button onClick={() => setIsHelpOpen(!isHelpOpen)} className="glass-btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.5)', color: 'var(--text-main)', boxShadow: 'none' }}>
            <Info size={20} />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="glass-btn" style={{ padding: '8px', background: 'rgba(255,255,255,0.5)', color: 'var(--text-main)', boxShadow: 'none' }}>
            <Settings size={20} />
          </button>
        </div>
      </header>

      {isHelpOpen && (
        <div className="glass-panel" style={{ padding: '16px', marginBottom: '24px', fontSize: '13px', lineHeight: '1.6', position: 'relative' }}>
          <button onClick={() => setIsHelpOpen(false)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none' }}><Info size={16} color="gray" /></button>
          <strong>使い方:</strong><br />
          1. カレンダーの日付をタップして勤務を入力します。<br />
          2. コマ数、事務時間、手当などを入力して保存。<br />
          3. 上部のカードに今月（15日締め翌月末払い）の給与見込みが表示されます。<br />
          4. 設定ボタン（右上の歯車）から単価を変更できます。<br />
          <br />
          <strong>データの保存について:</strong><br />
          データはお使いの端末（ブラウザ）に自動保存されます。サーバーには送信されないため安心ですが、ブラウザのキャッシュ削除や機種変更では消えてしまうのでご注意ください。
        </div>
      )
      }

      {/* Summary Section */}
      <SummaryCard
        entries={entries}
        settings={settings}
        currentDate={currentViewDate}
      />

      {/* Month Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', padding: '0 8px' }}>
        <button onClick={() => handleMonthNav('prev')} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}>
          <ChevronLeft size={24} color="#64748b" />
        </button>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#334155' }}>
          {format(currentViewDate, 'yyyy年 M月')}
        </span>
        <button onClick={() => handleMonthNav('next')} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}>
          <ChevronRight size={24} color="#64748b" />
        </button>
      </div>

      {/* Calendar */}
      <CalendarGrid
        currentMonth={currentViewDate}
        entries={entries}
        settings={settings}
        onDayClick={handleDayClick}
      />

      {/* Modals */}
      <WorkModal
        isOpen={isWorkModalOpen}
        date={selectedDate}
        entry={selectedDate ? entries[format(selectedDate, 'yyyy-MM-dd')] : undefined}
        onClose={() => setIsWorkModalOpen(false)}
        onSave={handleSavework}
        onDelete={handleDeleteEntry}
        settings={settings}
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
    </>
  );
}

export default App;
