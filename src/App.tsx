import { useState, useEffect } from 'react';
import { useSalaryData } from './hooks/useSalaryData';
import { CalendarGrid } from './components/CalendarGrid';
import { SummaryCard } from './components/SummaryCard';
import { WorkModal } from './components/WorkModal';
import { FeedbackModal } from './components/FeedbackModal';
import { SettingsModal } from './components/SettingsModal';
import { NewsModal } from './components/NewsModal';
import { BadgeHelpModal } from './components/BadgeHelpModal';
import { Settings, Info, ChevronLeft, ChevronRight, MessageSquare, Bell } from 'lucide-react';
import { addMonths, subMonths, format } from 'date-fns';
import { NEWS_ITEMS } from './data/news';
import type { WorkEntry } from './types';
import { useTranslation } from './contexts/LanguageContext';

function App() {
  const { t } = useTranslation();
  const { entries, settings, updateEntry, deleteEntry, setSettings, isLoaded } = useSalaryData();

  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  // Modal States
  const [selectedDate, setSelectedDate] = useState<Date | Date[] | null>(null);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isBadgeHelpOpen, setIsBadgeHelpOpen] = useState(false);

  // Batch Edit State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

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
    if (isSelectionMode) {
      // Toggle selection
      const exists = selectedDates.some(d => format(d, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
      if (exists) {
        setSelectedDates(prev => prev.filter(d => format(d, 'yyyy-MM-dd') !== format(day, 'yyyy-MM-dd')));
      } else {
        setSelectedDates(prev => [...prev, day]);
      }
    } else {
      // Normal open
      setSelectedDate(day);
      setIsWorkModalOpen(true);
    }
  };

  const handleBatchEdit = () => {
    if (selectedDates.length === 0) return;
    setSelectedDate(selectedDates); // Pass array
    setIsWorkModalOpen(true);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedDates([]); // Reset selection when toggling
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
          <strong>{t.app.helpUsage}</strong><br />
          1. {t.app.helpStep1}<br />
          2. {t.app.helpStep2}<br />
          3. {t.app.helpStep3}<br />
          4. {t.app.helpStep4}<br />
          <br />
          <strong>{t.app.helpBatch}</strong><br />
          {t.app.helpBatchBody}<br />
          <br />
          <strong>{t.app.helpSave}</strong><br />
          {t.app.helpSaveBody}
        </div>
      )}

      {/* Summary Section */}
      <SummaryCard
        entries={entries}
        settings={settings}
        currentDate={currentViewDate}
        onBadgeClick={() => setIsBadgeHelpOpen(true)}
      />

      {/* Month Navigation & Batch Toggle */}
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

      {/* Calendar */}
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

      {/* Batch Edit Footer */}
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

      {/* Modals */}
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
    </>
  );
}

export default App;
