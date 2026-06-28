import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import { ArrowLeft, Edit3, Image, Loader2, Megaphone, Plus, Save, ShieldCheck, Trash2, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  createAnnouncement,
  fetchAnnouncements,
  isAnnouncementAdmin,
  removeAnnouncement,
  updateAnnouncement,
  type AnnouncementInput,
} from '../services/announcements';
import type { Announcement } from '../types/announcement';
import { buildAnnouncementId } from '../utils/announcementId';
import './AdminAnnouncementsPage.css';

interface AdminAnnouncementsPageProps {
  onClose: () => void;
}

const EMPTY_FORM: AnnouncementInput = {
  title: '',
  body: '',
  category: 'notice',
  important: false,
  imageUrl: '',
};

const fieldStyle: CSSProperties = {
  width: '100%',
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  padding: '10px 12px',
  fontSize: '14px',
  color: '#0f172a',
  background: '#fff',
  boxSizing: 'border-box',
};

const primaryButtonStyle: CSSProperties = {
  border: 0,
  borderRadius: '10px',
  padding: '10px 16px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return '処理中にエラーが発生しました。';
};

export function AdminAnnouncementsPage({ onClose }: AdminAnnouncementsPageProps) {
  const { user } = useAuth();
  const [permissionState, setPermissionState] = useState<'checking' | 'allowed' | 'denied'>('checking');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [form, setForm] = useState<AnnouncementInput>(EMPTY_FORM);
  const [idSuffix, setIdSuffix] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    document.body.classList.add('announcement-admin-active');
    return () => {
      document.body.classList.remove('announcement-admin-active');
    };
  }, []);

  const loadAnnouncements = useCallback(async () => {
    setIsLoadingList(true);
    try {
      setAnnouncements(await fetchAnnouncements());
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const checkPermission = async () => {
      if (!user) {
        if (isActive) setPermissionState('denied');
        return;
      }

      try {
        const allowed = await isAnnouncementAdmin(user.uid);
        if (!isActive) return;
        setPermissionState(allowed ? 'allowed' : 'denied');
        if (allowed) await loadAnnouncements();
      } catch {
        if (isActive) setPermissionState('denied');
      }
    };

    void checkPermission();
    return () => {
      isActive = false;
    };
  }, [loadAnnouncements, user]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setIdSuffix('');
    setEditingId(null);
    setErrorMessage('');
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setForm({
      title: announcement.title,
      body: announcement.body,
      category: announcement.category,
      important: announcement.important,
      imageUrl: announcement.imageUrl ?? '',
    });
    setStatusMessage('');
    setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      if (editingId) {
        await updateAnnouncement(editingId, form);
        setStatusMessage('お知らせを更新しました。');
      } else {
        await createAnnouncement(form, idSuffix);
        setStatusMessage('お知らせを公開しました。');
      }
      resetForm();
      await loadAnnouncements();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (announcement: Announcement) => {
    const confirmed = window.confirm(
      `「${announcement.title}」を削除しますか？\n削除すると利用者のお知らせ一覧からも消えます。`,
    );
    if (!confirmed) return;

    setStatusMessage('');
    setErrorMessage('');
    try {
      await removeAnnouncement(announcement.id);
      if (editingId === announcement.id) resetForm();
      setStatusMessage('お知らせを削除しました。');
      await loadAnnouncements();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  if (permissionState === 'checking') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#475569' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Loader2 size={20} className="spin" />
          管理者権限を確認しています...
        </div>
      </div>
    );
  }

  if (permissionState === 'denied') {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '32px', background: '#f8fafc' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center', background: '#fff', padding: '40px', borderRadius: '18px', boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)' }}>
          <ShieldCheck size={44} color="#64748b" />
          <h1 style={{ fontSize: '22px', margin: '18px 0 8px' }}>管理者専用ページです</h1>
          <p style={{ color: '#64748b', lineHeight: 1.7 }}>
            このアカウントには管理者権限がありません。Firebase Consoleで管理者登録を確認してください。
          </p>
          <button type="button" onClick={onClose} style={primaryButtonStyle}>
            <ArrowLeft size={17} />
            ホームへ戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', color: '#0f172a' }}>
      <header style={{ background: '#0f172a', color: '#fff', padding: '18px 28px' }}>
        <div style={{ maxWidth: '1540px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Megaphone size={25} />
            <div>
              <div style={{ fontSize: '19px', fontWeight: 800 }}>お知らせ管理</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>管理者専用・PC向け</div>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ ...primaryButtonStyle, background: '#334155' }}>
            <ArrowLeft size={17} />
            ホームへ戻る
          </button>
        </div>
      </header>

      <main className="admin-announcements-layout">
        <section className="admin-announcements-editor" style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '18px', margin: 0 }}>
              {editingId ? 'お知らせを編集' : '新しいお知らせ'}
            </h1>
            {editingId && (
              <button type="button" onClick={resetForm} style={{ border: 0, background: '#f1f5f9', borderRadius: '8px', padding: '7px', cursor: 'pointer', display: 'flex' }} aria-label="編集をキャンセル">
                <X size={18} />
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="admin-announcements-form"
          >
            <label className="admin-field-id" style={{ display: 'grid', gap: '7px', fontSize: '13px', fontWeight: 700 }}>
              お知らせID
              {editingId ? (
                <input value={editingId} disabled style={{ ...fieldStyle, background: '#f1f5f9', color: '#64748b' }} />
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: '8px' }}>
                    <span style={{ padding: '10px 0', color: '#475569', fontFamily: 'monospace', fontSize: '13px' }}>
                      {buildAnnouncementId('preview').replace(/preview$/, '')}
                    </span>
                    <input
                      required
                      maxLength={60}
                      pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                      value={idSuffix}
                      onChange={event => setIdSuffix(event.target.value.toLowerCase())}
                      style={fieldStyle}
                      placeholder="thank-you"
                    />
                  </div>
                  <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 400 }}>
                    日付は自動です。後半だけ半角英小文字・数字・ハイフンで入力します。
                    {idSuffix && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(idSuffix) && (
                      <> 完成形: <code>{buildAnnouncementId(idSuffix)}</code></>
                    )}
                  </span>
                </>
              )}
            </label>

            <label className="admin-field-title" style={{ display: 'grid', gap: '7px', fontSize: '13px', fontWeight: 700 }}>
              タイトル
              <input
                required
                maxLength={200}
                value={form.title}
                onChange={event => setForm(current => ({ ...current, title: event.target.value }))}
                style={fieldStyle}
                placeholder="例：新機能を追加しました"
              />
            </label>

            <label className="admin-field-body" style={{ display: 'grid', gap: '7px', fontSize: '13px', fontWeight: 700 }}>
              本文
              <textarea
                required
                maxLength={20000}
                rows={10}
                value={form.body}
                onChange={event => setForm(current => ({ ...current, body: event.target.value }))}
                style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.7 }}
                placeholder="お知らせの詳しい内容を入力してください。"
              />
            </label>

            <div className="admin-field-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <label style={{ display: 'grid', gap: '7px', fontSize: '13px', fontWeight: 700 }}>
                種類
                <select
                  value={form.category}
                  onChange={event => setForm(current => ({ ...current, category: event.target.value === 'update' ? 'update' : 'notice' }))}
                  style={fieldStyle}
                >
                  <option value="notice">お知らせ</option>
                  <option value="update">アップデート</option>
                </select>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '9px', alignSelf: 'end', minHeight: '42px', fontSize: '13px', fontWeight: 700 }}>
                <input
                  type="checkbox"
                  checked={form.important}
                  onChange={event => setForm(current => ({ ...current, important: event.target.checked }))}
                />
                重要なお知らせ
              </label>
            </div>

            <label className="admin-field-image" style={{ display: 'grid', gap: '7px', fontSize: '13px', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Image size={15} />
                画像パス（任意）
              </span>
              <input
                value={form.imageUrl}
                onChange={event => setForm(current => ({ ...current, imageUrl: event.target.value }))}
                style={fieldStyle}
                placeholder="/QR.jpg"
              />
              <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 400, lineHeight: 1.5 }}>
                画像は先に public フォルダへ追加してデプロイし、/QR.jpg のように指定します。
              </span>
            </label>

            {(errorMessage || statusMessage) && (
              <div className="admin-field-message">
                {errorMessage && <div role="alert" style={{ padding: '11px 13px', borderRadius: '9px', background: '#fef2f2', color: '#b91c1c', fontSize: '13px' }}>{errorMessage}</div>}
                {statusMessage && <div role="status" style={{ padding: '11px 13px', borderRadius: '9px', background: '#f0fdf4', color: '#166534', fontSize: '13px' }}>{statusMessage}</div>}
              </div>
            )}

            <button className="admin-field-actions" type="submit" disabled={isSaving} style={{ ...primaryButtonStyle, opacity: isSaving ? 0.65 : 1 }}>
              {isSaving ? <Loader2 size={17} className="spin" /> : editingId ? <Save size={17} /> : <Plus size={17} />}
              {isSaving ? '保存中...' : editingId ? '変更を保存' : '公開する'}
            </button>
          </form>
        </section>

        <section className="admin-announcements-list" style={{ background: '#fff', padding: '18px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0 }}>公開中のお知らせ</h2>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '5px 0 0' }}>新しい順・最大100件</p>
            </div>
            <button type="button" onClick={() => void loadAnnouncements()} disabled={isLoadingList} style={{ ...primaryButtonStyle, background: '#e2e8f0', color: '#334155', padding: '8px 12px' }}>
              {isLoadingList && <Loader2 size={15} className="spin" />}
              再読み込み
            </button>
          </div>

          {isLoadingList && announcements.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>読み込み中...</div>
          ) : announcements.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px' }}>お知らせはまだありません。</div>
          ) : (
            <div style={{ display: 'grid', gap: '8px' }}>
              {announcements.map(announcement => (
                <article key={announcement.id} style={{ border: editingId === announcement.id ? '2px solid #3b82f6' : '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', background: editingId === announcement.id ? '#eff6ff' : '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '7px' }}>
                        <span style={{ fontSize: '11px', padding: '3px 7px', borderRadius: '999px', background: announcement.category === 'update' ? '#ede9fe' : '#e0f2fe', color: announcement.category === 'update' ? '#6d28d9' : '#0369a1' }}>
                          {announcement.category === 'update' ? 'アップデート' : 'お知らせ'}
                        </span>
                        {announcement.important && <span style={{ fontSize: '11px', padding: '3px 7px', borderRadius: '999px', background: '#fee2e2', color: '#b91c1c' }}>重要</span>}
                        {announcement.imageUrl && <span style={{ fontSize: '11px', padding: '3px 7px', borderRadius: '999px', background: '#f1f5f9', color: '#475569' }}>画像あり</span>}
                      </div>
                      <h3 style={{ fontSize: '15px', margin: '0 0 5px', overflowWrap: 'anywhere' }}>{announcement.title}</h3>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{announcement.dateLabel} ・ ID: {announcement.id}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '7px', flexShrink: 0 }}>
                      <button type="button" onClick={() => handleEdit(announcement)} style={{ border: 0, borderRadius: '8px', padding: '8px', background: '#e0f2fe', color: '#0369a1', cursor: 'pointer', display: 'flex' }} aria-label={`${announcement.title}を編集`}>
                        <Edit3 size={16} />
                      </button>
                      <button type="button" onClick={() => void handleDelete(announcement)} style={{ border: 0, borderRadius: '8px', padding: '8px', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', display: 'flex' }} aria-label={`${announcement.title}を削除`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
