import './MarketingHeader.scss'
import logo from '../../assets/logo.png'

type MarketingHeaderProps = {
  onGetStarted?: () => void
  minimal?: boolean
  rightLabel?: string
}

const navigation = ['Platform', 'Solutions', 'How it Works', 'AI Decision Engine']

export function MarketingHeader({ onGetStarted, minimal = false, rightLabel }: MarketingHeaderProps) {
  return (
    <header className={`marketing-header${minimal ? ' minimal' : ''}`}>
      <a className="marketing-logo" href="#top" aria-label="Procure.AI home"><img src={logo} alt="Procure.AI" /></a>
      {!minimal && <nav className="marketing-nav" aria-label="Main navigation">{navigation.map((item) => <a href={`#${item.toLowerCase().replaceAll(' ', '-')}`} key={item}>{item}</a>)}</nav>}
      {!minimal && onGetStarted && <div className="marketing-actions"><button className="marketing-start" onClick={onGetStarted}>Get Started</button><a className="support-button" href="#support" aria-label="Support">◔</a></div>}
      {rightLabel && <span className="marketing-right-label">{rightLabel}</span>}
    </header>
  )
}
