import { useEffect, useState } from 'react'

import { Login } from './modules/before-login/Login'
import { CompareQuotations } from './modules/after-login/CompareQuotations.tsx'
import { Analytics } from './modules/after-login/Procure-AI/Analytics'
import { Upload } from './modules/after-login/Upload.tsx'
import './styles/common.css'

function App() {
  const [path, setPath] = useState(() => window.location.pathname)
  const [userName, setUserName] = useState<string | null>(() => sessionStorage.getItem('procureflow-user'))

  useEffect(() => {
    function handlePopState() {
      setPath(window.location.pathname)
      setUserName(sessionStorage.getItem('procureflow-user'))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(nextPath: string) {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  function handleLogin(name: string) {
    sessionStorage.setItem('procureflow-user', name)
    setUserName(name)
    navigate('/upload')
  }

  function handleLogout() {
    sessionStorage.removeItem('procureflow-user')
    setUserName(null)
    navigate('/login')
  }

  if (path === '/upload') {
    return <Upload userName={userName ?? 'Procurement User'} onLogout={handleLogout} onCompare={() => navigate('/compare-quotations')} />
  }

  if (path === '/compare-quotations') {
    return <CompareQuotations userName={userName ?? 'Procurement User'} onLogout={handleLogout} onBack={() => navigate('/upload')} onProceed={() => navigate('/procure-ai')} />
  }

  if (path === '/procure-ai') {
    return <Analytics onBack={() => navigate('/upload')} />
  }

  if (path !== '/login') {
    window.history.replaceState({}, '', '/login')
  }

  return <Login onLogin={handleLogin} />
}

export default App
