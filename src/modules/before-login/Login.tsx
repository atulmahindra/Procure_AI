import { useState } from 'react'
import type { FormEvent } from 'react'
import { MarketingHeader } from '../shared/MarketingHeader'
import appWindowIcon from '../../assets/app-window.png'
import './Login.scss'

type LoginProps = {
  onLogin: (name: string) => void
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()

  const identifier = email.trim()

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Token ID validation - numbers only
  const tokenRegex = /^\d+$/

  const isEmail = emailRegex.test(identifier)
  const isTokenId = tokenRegex.test(identifier)

  if (!isEmail && !isTokenId) {
    alert('Please enter a valid Email or Token ID')
    return
  }

  let name = 'Ava Roberts'

  if (isEmail) {
    name =
      identifier
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) ||
      'Ava Roberts'
  }

  if (isTokenId) {
    // Token ID can be sent to your API for validation
    console.log('Token ID:', identifier)
  }

  onLogin(name)
}

  return (
    <main className="login-page">
      <MarketingHeader minimal rightLabel="Secure procurement workspace" />

      <div className="login-layout">
        <section className="login-brand-panel">
          <div className="brand-copy">
            <p className="eyebrow">AI-powered procurement</p>
            <h1>Make every<br />supplier decision<br />count.</h1>
            <p>Sign in to compare supplier quotations, surface commercial risks, and move from analysis to confident action.</p>
            <ul className="benefits-list">
              <li>Enterprise-grade access controls</li>
              <li>Transparent, auditable AI recommendations</li>
              <li>Your quotation data stays protected</li>
            </ul>
          </div>
        </section>

        <section className="login-form-panel">
          <div className="login-panel-inner">
            <div className="login-steps" aria-label="Sign in progress">
              <div className="step active"><span>1</span><strong>Sign in</strong></div>
              <i />
              <div className="step"><span>2</span><strong>Upload quotations</strong></div>
              <i />
              <div className="step"><span>3</span><strong>AI recommendation</strong></div>
            </div>

        <div className="login-form-wrap">
          <div className="login-heading"><h2>Welcome back</h2><p>Sign in with your procurement team credentials.</p></div>
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">Email / Token ID  <input
    id="email"
    type="text"
    value={email}
    onChange={(event) => setEmail(event.target.value)}
    placeholder="name@company.com / 32334543"
    required
  /></label>
            <label htmlFor="password">Password<div className="password-field"><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••••" required minLength={4} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10.7 10.7 0 0 1 12 4.8c5.2 0 9 5.2 10 7.2a15.6 15.6 0 0 1-3.1 4.1M6.2 6.2A15.2 15.2 0 0 0 2 12c1 2 4.8 7.2 10 7.2 1.1 0 2.2-.2 3.1-.6" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7.2 10-7.2S22 12 22 12s-3.5 7.2-10 7.2S2 12 2 12Z" /><circle cx="12" cy="12" r="2.8" /></svg>}</button></div></label>
            <div className="login-options"><label className="remember"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Remember me</span></label><a href="#forgot-password">Forgot password?</a></div>
            <button className="login-submit" type="submit">Log in</button>
          </form>
          <div className="login-divider"><span>or</span></div>
          <button className="sso-button" type="button"><img className="app-window-icon" src={appWindowIcon} alt="" />Continue with Microsoft SSO</button>
          <p className="login-signup">Need access? Contact your procurement administrator.</p>
        </div>
          </div>
        </section>
      </div>
    </main>
  )
}
