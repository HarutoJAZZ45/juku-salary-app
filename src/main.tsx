import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { AppRouter } from './router/AppRouter'
import { LanguageProvider } from './providers/LanguageProvider'
import { AuthProvider } from './providers/AuthProvider'
import { SalaryDataProvider } from './providers/SalaryDataProvider'

// アプリケーション全体で認証・給与データを共有し、URLごとに画面を切り替える。
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <SalaryDataProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </SalaryDataProvider>
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)
