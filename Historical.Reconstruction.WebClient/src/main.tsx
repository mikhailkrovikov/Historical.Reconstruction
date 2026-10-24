import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import './index.css'
import { queryClient } from './app/queryClient.ts'
import App from './App.tsx'

const Router = import.meta.env.MODE === 'demo' ? HashRouter : BrowserRouter

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        {import.meta.env.MODE === 'demo' && (
          <p role="note" style={{ margin: 0, padding: '12px 20px', textAlign: 'center', background: '#f4e8ce', color: '#382f23' }}>
            Демоверсия: условные данные. Созданные записи и загруженные картинки исчезнут после обновления страницы.
          </p>
        )}
        <App />
      </Router>
    </QueryClientProvider>
  </StrictMode>,
)
