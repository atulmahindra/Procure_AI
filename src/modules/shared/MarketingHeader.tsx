import './MarketingHeader.scss'

type MarketingHeaderProps = {
  onGetStarted: () => void
}

const navigation = ['Platform', 'Solutions', 'How it Works', 'AI Decision Engine']

export function MarketingHeader({ onGetStarted }: MarketingHeaderProps) {
  return (
    <header className="marketing-header">
      <a className="marketing-logo" href="#top" aria-label="Procure.AI home"><span>◧</span> Procure<span className="logo-accent">.AI</span></a>
      <nav className="marketing-nav" aria-label="Main navigation">{navigation.map((item) => <a href={`#${item.toLowerCase().replaceAll(' ', '-')}`} key={item}>{item}</a>)}</nav>
      <div className="marketing-actions"><button className="marketing-start" onClick={onGetStarted}>Get Started</button><a className="support-button" href="#support" aria-label="Support">◔</a></div>
    </header>
  )
}
