import type { LegalDocumentType, LegalSection } from '../legal/policies';
import { PRIVACY_SECTIONS, PRIVACY_VERSION, TERMS_SECTIONS, TERMS_VERSION } from '../legal/policies';
import { X } from 'lucide-react';

interface LegalDocumentModalProps {
    type: LegalDocumentType | null;
    onClose: () => void;
}

const getDocument = (type: LegalDocumentType): {
    title: string;
    version: string;
    sections: LegalSection[];
} => {
    if (type === 'terms') {
        return {
            title: '利用規約',
            version: TERMS_VERSION,
            sections: TERMS_SECTIONS,
        };
    }

    return {
        title: 'プライバシーポリシー',
        version: PRIVACY_VERSION,
        sections: PRIVACY_SECTIONS,
    };
};

export const LegalDocumentModal = ({ type, onClose }: LegalDocumentModalProps) => {
    if (!type) return null;

    const document = getDocument(type);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 4200,
                background: 'rgba(15, 23, 42, 0.35)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '18px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '720px',
                    maxHeight: '88vh',
                    overflowY: 'auto',
                    background: 'white',
                    borderRadius: '24px',
                    padding: '22px',
                    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.22)',
                    color: '#334155',
                }}
                onClick={event => event.stopPropagation()}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
                    <div>
                        <h2 style={{ fontSize: '20px', margin: '0 0 4px' }}>{document.title}</h2>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>バージョン: {document.version}</div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label={`${document.title}を閉じる`}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
                    >
                        <X size={24} color="#64748b" />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {document.sections.map(section => (
                        <section key={section.title}>
                            <h3 style={{ fontSize: '15px', margin: '0 0 8px', color: '#0f172a' }}>{section.title}</h3>
                            {section.body.map(paragraph => (
                                <p key={paragraph} style={{ margin: '0 0 8px', fontSize: '13px', lineHeight: 1.8 }}>
                                    {paragraph}
                                </p>
                            ))}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
};
