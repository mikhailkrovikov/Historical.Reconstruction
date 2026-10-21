import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { CreateFindPage } from './pages/CreateFindPage.tsx'
import { FindDetailsPage } from './pages/FindDetailsPage.tsx'
import { FindsPage } from './pages/FindsPage.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<FindsPage />} />
      <Route path="/finds" element={<FindsPage />} />
      <Route path="/finds/new" element={<CreateFindPage />} />
      <Route path="/finds/:id" element={<FindDetailsPage />} />
      <Route path="*" element={<Navigate to="/finds" replace />} />
    </Routes>
  )
}

export default App
