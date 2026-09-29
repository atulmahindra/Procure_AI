import './MarketingHeader.scss'
import logo from '../../assets/logo.png'
import { useEffect, useState } from 'react'

type MarketingHeaderProps = {
  onGetStarted?: () => void
  minimal?: boolean
  rightLabel?: string
}

const navigation = ['Platform', 'Solutions', 'How it Works', 'AI Decision Engine']

export function MarketingHeader({ onGetStarted, minimal = false, rightLabel }: MarketingHeaderProps) {
  const isProcureAiRoute = window.location.pathname === '/procure-ai'
  const [isDarkMode, setIsDarkMode] = useState(() => isProcureAiRoute && localStorage.getItem('procure-ai-theme') === 'dark')

  useEffect(() => {
    if (!isProcureAiRoute) {
      document.documentElement.removeAttribute('data-theme')
      return
    }

    const theme = isDarkMode ? 'dark' : 'light'
    document.documentElement.dataset.theme = theme
    localStorage.setItem('procure-ai-theme', theme)

    return () => {
      if (window.location.pathname !== '/procure-ai') {
        document.documentElement.removeAttribute('data-theme')
      }
    }
  }, [isDarkMode, isProcureAiRoute])

  return (
    <header className={`marketing-header${minimal ? ' minimal' : ''}`}>
      <a className="marketing-logo" href="#top" aria-label="Procure.AI home"><img src={logo} alt="Procure.AI" /></a>
      {!minimal && <nav className="marketing-nav" aria-label="Main navigation">{navigation.map((item) => <a href={`#${item.toLowerCase().replaceAll(' ', '-')}`} key={item}>{item}</a>)}</nav>}
      {!minimal && onGetStarted && <div className="marketing-actions"><button className="marketing-start" onClick={onGetStarted}>Get Started</button>{isProcureAiRoute ? <button className="support-button" onClick={() => setIsDarkMode((current) => !current)} aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`} title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>◔</button> : <a className="support-button" href="#support" aria-label="Support">◔</a>}</div>}
      {rightLabel && <span className="marketing-right-label">{rightLabel}</span>}
    </header>
  )
}
