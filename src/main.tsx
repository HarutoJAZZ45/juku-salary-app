import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './providers/LanguageProvider'
import { AuthProvider } from './providers/AuthProvider'
import { SalaryDataProvider } from './providers/SalaryDataProvider'

// アプリケーションのエントリーポイント
// LanguageProviderで全体をラップし、多言語対応を有効化
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <SalaryDataProvider>
          <App />
        </SalaryDataProvider>
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)
