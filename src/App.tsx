import { useState } from 'react'

import { Login } from './modules/before-login/Login'
import { Upload } from './modules/after-login/Upload'
import './styles/common.css'

function App() {
  const [userName, setUserName] = useState<string | null>(null)

  if (!userName) {
    return <Login onLogin={setUserName} />
  }

  return <Upload userName={userName} onLogout={() => setUserName(null)} />
}

export default App
