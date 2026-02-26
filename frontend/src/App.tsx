import { Navigate, Route, Routes } from 'react-router-dom'

import { AuthPage } from './pages/AuthPage'
import { WorkspacePage } from './pages/WorkspacePage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/workspace" element={<WorkspacePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
