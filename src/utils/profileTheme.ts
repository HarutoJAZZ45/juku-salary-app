export interface ProfileTheme {
  from: string;
  to: string;
}

export const PROFILE_THEMES: Record<string, ProfileTheme> = {
  indigo: { from: '#4f46e5', to: '#7c3aed' },
  emerald: { from: '#059669', to: '#0d9488' },
  rose: { from: '#e11d48', to: '#be185d' },
  amber: { from: '#d97706', to: '#ea580c' },
  blue: { from: '#2563eb', to: '#0284c7' },
  slate: { from: '#475569', to: '#1e293b' },
};

export const getProfileTheme = (themeId?: string): ProfileTheme =>
  PROFILE_THEMES[themeId || 'indigo'] ?? PROFILE_THEMES.indigo;
