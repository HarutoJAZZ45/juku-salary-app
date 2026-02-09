import React, { useState } from 'react';
import type { UserSettings, Campus } from '../types';
import { X, Save, Settings, Info, Globe } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import type { Language } from '../locales/types';

interface SettingsModalProps {
    isOpen: boolean;
    settings: UserSettings;
    onClose: () => void;
    onSave: (newSettings: UserSettings) => void;
}

const CAMPUSES: Campus[] = ['平岡', '新札幌', '月寒', '円山', '北大前'];

// 設定モーダル
// 時給、交通費、校舎などの基本設定を変更する
export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, settings, onClose, onSave }) => {
    const { t, language, setLanguage } = useTranslation();

    if (!isOpen) return null;

    const [formData, setFormData] = useState<UserSettings>(settings);

    const handleChange = (key: keyof UserSettings, val: number) => {
        setFormData(prev => ({ ...prev, [key]: val }));
    };

    const handleTransportChange = (campus: Campus, val: number) => {
        setFormData(prev => ({
            ...prev,
            campusTransportRates: {
                ...prev.campusTransportRates,
                [campus]: val
            }
        }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, animation: 'fadeIn 0.2s'
        }} onClick={onClose}>
            <div style={{
                background: 'white',
                width: '90%', maxWidth: '360px',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                display: 'flex', flexDirection: 'column', gap: '20px',
                maxHeight: '85vh', overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings size={20} /> {t.settings.title}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                {/* 1. Home Campus */}
                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#475569' }}>{t.settings.homeCampus}</label>
                    <select
                        value={formData.defaultCampus || '平岡'}
                        onChange={e => setFormData(prev => ({ ...prev, defaultCampus: e.target.value as Campus }))}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                    >
                        {CAMPUSES.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                {/* 2. Rates */}
                <div className="input-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px', color: '#475569' }}>
                        {t.settings.teachingRate}
                    </label>
                    <input type="number" value={formData.teachingHourlyRate} onChange={e => handleChange('teachingHourlyRate', Number(e.target.value))} />

                    {/* Helper text simplified */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', padding: '10px', background: '#f0f9ff', borderRadius: '8px', alignItems: 'center' }}>
                        <Info size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                        <div style={{ fontSize: '11px', color: '#334155', lineHeight: '1.5' }}>
                            {t.settings.teachingRateHelper}
                        </div>
                    </div>
                </div>

                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#475569' }}>{t.settings.hourlyRate}</label>
                    <input type="number" value={formData.hourlyRate} onChange={e => handleChange('hourlyRate', Number(e.target.value))} />
                </div>

                {/* 3. Transport Settings (No longer hidden) */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {t.settings.transportSettings}
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {CAMPUSES.map(campus => (
                            <div key={campus} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <label style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>{campus}</label>
                                <input
                                    type="number"
                                    value={formData.campusTransportRates?.[campus] ?? 0}
                                    onChange={e => handleTransportChange(campus, Number(e.target.value))}
                                    style={{ width: '80px', textAlign: 'right' }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#475569' }}>{t.settings.closingDay}</label>
                    <input type="number" value={formData.closingDay} onChange={e => handleChange('closingDay', Number(e.target.value))} />
                </div>

                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#475569' }}>{t.settings.annualLimit}</label>
                    <input type="number" value={formData.annualLimit} onChange={e => handleChange('annualLimit', Number(e.target.value))} />
                </div>

                <hr style={{ border: 'none', height: '1px', background: '#e2e8f0', margin: '16px 0' }} />

                {/* Language Selector - Moved to Bottom */}
                <div className="input-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '14px', color: '#475569' }}>
                        <Globe size={16} /> {t.settings.language}
                    </label>
                    <div style={{ display: 'flex', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        {(['ja', 'en', 'es'] as Language[]).map(lang => (
                            <button
                                key={lang}
                                onClick={() => setLanguage(lang)}
                                style={{
                                    flex: 1, padding: '8px', borderRadius: '6px', border: 'none',
                                    background: language === lang ? 'white' : 'transparent',
                                    color: language === lang ? 'var(--primary)' : '#64748b',
                                    fontWeight: language === lang ? 600 : 400,
                                    boxShadow: language === lang ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                {lang === 'ja' ? '日本語' : lang === 'en' ? 'English' : 'Español'}
                            </button>
                        ))}
                    </div>
                </div>

                <button className="glass-btn" onClick={handleSave} style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Save size={18} /> {t.settings.saveButton}
                </button>
            </div>
        </div>
    );

};
