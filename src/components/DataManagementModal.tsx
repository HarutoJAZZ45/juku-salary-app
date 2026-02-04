import React, { useRef } from 'react';
import { X, Download, Upload, Database } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

interface DataManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleExport = () => {
        const entries = localStorage.getItem('juku_salary_entries');
        const config = localStorage.getItem('juku_salary_config');
        const data = {
            entries: entries ? JSON.parse(entries) : {},
            config: config ? JSON.parse(config) : {}
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salary-data-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!window.confirm(t.dataManagement.importWarning)) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);

                if (json.config) {
                    localStorage.setItem('juku_salary_config', JSON.stringify(json.config));
                }

                if (json.entries) {
                    const currentEntriesStr = localStorage.getItem('juku_salary_entries');
                    const currentEntries = currentEntriesStr ? JSON.parse(currentEntriesStr) : {};
                    const mergedEntries = { ...currentEntries, ...json.entries };
                    localStorage.setItem('juku_salary_entries', JSON.stringify(mergedEntries));
                }

                alert(t.dataManagement.success);
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert(t.dataManagement.error);
            }
        };
        reader.readAsText(file);
    };

    const triggerImport = () => {
        fileInputRef.current?.click();
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
                        <Database size={20} /> {t.dataManagement.title}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                    {t.app.helpSaveBody}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button onClick={handleExport} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white',
                        cursor: 'pointer', fontSize: '14px', color: '#334155', fontWeight: 600,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}>
                        <Download size={18} /> {t.dataManagement.export}
                    </button>

                    <button onClick={triggerImport} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white',
                        cursor: 'pointer', fontSize: '14px', color: '#334155', fontWeight: 600,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}>
                        <Upload size={18} /> {t.dataManagement.import}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".json"
                        style={{ display: 'none' }}
                    />
                </div>

                <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
                    {t.dataManagement.importWarning}
                </div>
            </div>
        </div>
    );
};
