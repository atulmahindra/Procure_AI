import './AuthenticatedHeader.scss'
import logo from '../../assets/logo.png'

type AuthenticatedHeaderProps = {
  userName: string
  onLogout: () => void
}

export function AuthenticatedHeader({ userName, onLogout }: AuthenticatedHeaderProps) {
  const initials = userName.split(' ').map((part) => part[0]).join('').slice(0, 2)

  return (
    <header className="authenticated-header">
      <img className="authenticated-logo" src={logo} alt="Procure.AI" />
      <div className="authenticated-header-actions">
        <span className="team-name">Procurement Team</span>
        <button className="help-button" aria-label="Help">?</button>
        <button className="user-avatar" onClick={onLogout} title="Log out">{initials}</button>
      </div>
    </header>
  )
}
